// ==UserScript==
// @name        Leap Motion Reddit Browsing
// @namespace   leapgamer
// @description Lets you surf reddit with the Leap Motion Device.
// @include     http://*
// @version     1
// @require     http://code.jquery.com/jquery-latest.min.js
// @require     http://leapgamer.com/inc/leap.jquery.js 
// @grant       GM_addStyle
// ==/UserScript==
console.log("Loaded Leap Motion Reddit Browsing User Script");
window.activeEntry = 1;

var onFrame = function() {
    var gestureSpeed = 400; 
    var bottom = 130;
    var top = 190;
    var scrollSpeed = 0.1;
    var height = $(window).height();
    var range = top-bottom;
    var scrollHeight = $(document).scrollTop();
    var lockVelocity = 20;   
    
    function scrollPage() {
        //scroll the page up and down  
        if(fingerY < bottom) {
           var speed = Math.round(scrollSpeed*(bottom-fingerY)*(bottom-fingerY));
           window.scrollBy(0,speed);
           //$("#console").append("<br />Scroll Speed: "+speed);  
        }
        if(fingerY > top) {
           var speed = Math.round(scrollSpeed*(fingerY-top)*(fingerY-top));   
           window.scrollBy(0,-1*scrollSpeed*(fingerY-top));
        }
    }
           
    //on reddit control
    if(document.URL.indexOf("reddit.com") !== -1 && document.URL.indexOf("/comments/") == -1) { 
        if($("#leapcontrol").attr("checked") == "checked") {    
            if(window.mode == 1) {
                //slow down the selection when the second finger comes out
                if(window.leapData.numPointables == 2) {   
                    bottom = bottom/2;
                    top = top * 1.5;         
                }
               if(window.leapData.numPointables > 0) {      
                    var fingerY = window.leapData.pointables[0].tipPosition[1];
                    var fingerX = window.leapData.pointables[0].tipVelocity[0]; 
                    if(scrollHeight > 64) {
                         var visibleEntries = Math.round((height-64)/60)-0; 
                    } else {
                         var visibleEntries = Math.round(height/60)-0;   
                    }
                    var topEntry = Math.round((scrollHeight-64)/60);    
                    if(topEntry < 1) topEntry = 1;
                    var activeEntry = window.activeEntry;
                    
                    if(window.leapData.numPointables == 1) activeEntry = visibleEntries-(Math.round((fingerY-bottom)*visibleEntries/range))+topEntry; 
                    if(activeEntry < 1) activeEntry = 0;
                    if(activeEntry > window.entryNum) activeEntry = window.entryNum;  
                    var selectionHeight = 64 + (60*activeEntry);   
               }    
                

               //detect gestures with 2 fingers
               if(window.leapData.numPointables == 2) {   
                    var fingerY = window.leapData.pointables[0].tipVelocity[1];   
                    //open comments      
                    if(fingerX > 1.5*gestureSpeed && window.leapData.pointables[0].tipPosition[0] > 0) { 
                        window.mode = 2; 
                        window.open(window.entries[activeEntry].find("a.comments").attr("href"), '_blank');
                        window.focus();
                    }    
                    //hide story
                    if(fingerX < -2*gestureSpeed && window.leapData.pointables[0].tipPosition[0] < 0) { 
                        window.entries[activeEntry].find("form.state-button.hide-button span a").click();   
                    }   
                    //upvote
                    if(fingerY > 2*gestureSpeed && window.leapData.pointables[0].tipPosition[1] > (top-(range/2))) { 
                        window.entries[activeEntry].find("div.arrow.up.login-required").click();  
                    } 
                    //downvote  
                    if(fingerY < 2*gestureSpeed && window.leapData.pointables[0].tipPosition[1] < bottom+(range/2)) { 
                        window.entries[activeEntry].find("div.arrow.down.login-required").click();  
                    }   
               }
               
               //detect gestures with 3 fingers
               if(window.leapData.numPointables == 3) {   
                    var fingerY = window.leapData.pointables[0].tipVelocity[1];   
                    //next      
                    if(fingerX > 2*gestureSpeed && window.leapData.pointables[0].tipPosition[0] > 0) { 
                        if($("a[rel='nofollow next']").attr('href')) window.location = $("a[rel='nofollow next']").attr('href'); 
                    }    
                    //previous
                    if(fingerX < -2*gestureSpeed && window.leapData.pointables[0].tipPosition[0] < 0) { 
                        if($("a[rel='nofollow prev']").attr('href')) window.location = $("a[rel='nofollow prev']").attr('href');     
                    }   
                    //save
                    if(fingerY > 3*gestureSpeed && window.leapData.pointables[0].tipPosition[1] > top) { 
                        window.entries[activeEntry].find("form.state-button.save-button span a").click();   
                    }   
                    //share?
                    if(fingerY < 2*gestureSpeed && window.leapData.pointables[0].tipPosition[1] < bottom) { 

                    }   
               }
               
               //detect scrolling hand movements with 1 finger                                   
               if(window.leapData.numPointables == 1) {
                   
                   if(fingerX < lockVelocity) { 
                       $.each(window.entries, function(key, ent) {
                           ent.css("border","none"); 
                       }); 
                       window.entries[activeEntry].css("border","2px solid black"); 
               
                       $("#console").text("Active Entry: " + activeEntry);
                       $("#console").append("<br />Selection Height: "+selectionHeight + " | Window Height: "+height+"<br />Fingy Y: "+fingerY+"<br/>Visible Entries: "+visibleEntries+"<br/>Top Entry: "+topEntry);
                       
                       scrollPage();
                   }
                   
                   //open window
                   if(fingerX > gestureSpeed && window.leapData.pointables[0].tipPosition[0] > 0) {
                       window.mode = 2; 
                       window.open(window.entries[activeEntry].find("a.title").attr("href"), '_blank');
                       window.focus();
                   }
               } 
               
               if(window.leapData.numPointables == 2) {         
                    if(fingerX > gestureSpeed*2 && window.leapData.pointables[0].tipPosition[0] > 0) { 
                       window.location($("a[rel='next']").attr('href')); 
                    }     
               }
               
               window.activeEntry = activeEntry; 
            } else {
                //close window
                if(window.leapData.numPointables>0) {    
                    var fingerX = window.leapData.pointables[0].tipVelocity[0];
                    if(fingerX < (-1*gestureSpeed) && window.leapData.pointables[0].tipPosition[0] < 0) {
                        window.mode = 1;
                    }   
                }
            }
        }
    } else { 
        //off reddit control
        if(window.leapData.numPointables>0) {
            var fingerY = window.leapData.pointables[0].tipPosition[1];  
            var fingerX = window.leapData.pointables[0].tipVelocity[0];
            //close window
            if(fingerX < (-1*gestureSpeed) && window.leapData.pointables[0].tipPosition[0] < 0) {  
                window.close();
            }  
            scrollPage();   
        } 
    }
    
};

var onConnect = function () {
    window.entries = [];
    window.docHeight = $(document).height();
    var i = 0;
    $(".thing.link").each(function(key, entry) {
        if($(this).css("display") != "none") {
            window.entries[i] = $(this);   
            i++;
        } 
    });
    window.entryNum = window.entries.length-1;
    window.mode = 1;
    console.log(window.entryNum);
    
    $("div.side").append("<div><span style='font-size:20px;'>Leap Motion Control</span><br /><span style='color:green; font-weight:bold;'>Device Connected!</span> <br /><span style='font-size:16px;'><input type='checkbox' id='leapcontrol' checked='checked'> Enable Leap Control</span> <div id='console'></div></div>");
};

var events = {
    "onFrame" : onFrame,
    "onConnect" : onConnect
}

$().leap("setEvents", events);

