
var panController = (function() {
    
    var timer1;          //used to recall the same pan function
    var timer2;
    var myCallback;     //used to update canvas
    var myCanvas;
    var myContext;
    var maxPixelsPos;
    var panTime;
    
    var init = function (/*callback,*/ canvas, context) {
        addHandlers();
        initArrowEvents();
        // myCallback = callback;
        myCanvas = canvas;
        myContext = context;
        maxPixelsPos = 5000;
        panTime = 3;
    };
    
    var addHandlers = function () {
        $(window).keydown(function(e) { keyEvent(e); });
        $(window).keyup(function(e) {
            clearTimeout(timer2);
            if(selectProperty.getInSelectProperty()) {
                selectProperty.drawWithNewMouseCoords(true);        //flag to tell that its from panning
            }
        });
    };

    var removeHandlers = function () {
        $(window).unbind('keydown');
        $(window).unbind('keyup');
    }
    
    //inits all the arrays on screen's events for panning
    var initArrowEvents = function () {
        var arrows = [".arrow-up", ".arrow-down", ".arrow-left", ".arrow-right"];
        arrows.forEach(function(arrow) {
            $(arrow).mouseenter(function() { arrowEnter(arrow); });
            $(arrow).mouseleave(function() { arrowLeave(arrow); });
        });
    };
    
    //calls the pan functions for the correct arrow
    var arrowEnter = function (arrow) {
        if(firebaseApp.getUser()) {
            console.log('user id ' + firebaseApp.getUser().uid);
            console.log('Name is ' + firebaseApp.getUser().displayName);
        }
        $(arrow).fadeTo( 0.3, 1, function(){/* completion */});
        var panAmount = Math.round(40/can.getPixSize());
        switch(arrow) {
            case ".arrow-up":
                timer1 = setInterval(function() {
                    panUp(panAmount);
                }, panTime);
                break;
            case ".arrow-down":
                timer1 = setInterval(function() {
                    panDown(panAmount);
                }, panTime);
                break;
            case ".arrow-left":
                timer1 = setInterval(function() {
                    panLeft(panAmount);
                }, panTime);
                break;
            case ".arrow-right":
                timer1 = setInterval(function() {
                    panRight(panAmount);
                }, panTime);
                break;
        }
    };
    
    var arrowLeave = function (arrow) {
        $(arrow).fadeTo( 0.3, 0.3, function(){/* completion */});
		clearTimeout(timer1);
        if(selectProperty.getInSelectProperty()) {
            selectProperty.drawWithNewMouseCoords(true);
        }
    };
    
    //key for checking the key
	var keyEvent = function (e) {
		var panAmount = Math.round(40/can.getPixSize());

	    e = e || window.event;
		clearTimeout(timer2);
	    if (e.keyCode == '38' || e.keyCode == '87') {
	        // up arrow
	        timer2 = setInterval(function() { 
                panUp(Math.round(panAmount));
            }, panTime);
	        
	    } else if (e.keyCode == '40' || e.keyCode == '83') {
	        // down arrow
	        timer2 = setInterval(function() { 
                panDown(Math.round(panAmount));
            }, panTime);
	        
	    } else if (e.keyCode == '37' || e.keyCode == '65') {
	       // left arrow
	       timer2 = setInterval(function() { 
                panLeft(Math.round(panAmount));
            }, panTime);
	    } else if (e.keyCode == '39' || e.keyCode == '68') {
	       // right arrow
	       timer2 = setInterval(function() { 
                panRight(Math.round(panAmount));
           }, panTime);
	    }
	};
    
    var panUp = function (panAmount) {
        if(can.getPosY() < maxPixelsPos) {
            can.setPosY(can.getPosY() + panAmount);
        } else {
            can.setPosY(maxPixelsPos);
        }
        redraw.draw();
    };

    var panDown = function (panAmount) {
        if(can.getPosY() > -maxPixelsPos) {
           can.setPosY(can.getPosY() - panAmount);
        } else {
            can.setPosY(-maxPixelsPos);
        }
        redraw.draw();
    };
    
    var panLeft = function (panAmount) {
        if(can.getPosX() > -maxPixelsPos) {
            can.setPosX(can.getPosX() - panAmount);
        } else {
            can.setPosX(-maxPixelsPos);
        }
        redraw.draw();
    };
    
    var panRight = function (panAmount) {
        if(can.getPosX() < maxPixelsPos) {
            can.setPosX(can.getPosX() + panAmount);
        } else {
            can.setPosX(maxPixelsPos);
        }
        redraw.draw();
    };
    
    return {
        init: init,
        addHandlers: addHandlers,
        removeHandlers: removeHandlers
    };
    
})();