var scrollController = (function() {
    
    var myCanvas;
    var myContext;
    var maxPixelsPos;
    
    var init = function (canvas, context) {
        myCanvas = canvas;
        myContext = context;
        addHandlers();
        maxPixelsPos = 5000;
    };
    
    var addHandlers = function () {
        $("#main").bind('mousewheel', function(e){ scrollHandler(e); });
    }
    
    var removeHandlers = function () {
        $("#main").unbind('mousewheel');
    };
    
    var scrollHandler = function (e) {

        // cross-browser wheel delta
        var e = window.event || e; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        
        //get the mouses location when scrolling
        var rect = myCanvas.getBoundingClientRect();
        var x = Math.floor((e.pageX - rect.left) / can.getPixSize());
        var y = Math.floor((e.pageY - rect.top) / can.getPixSize());

        var pointerPixelX = x + can.getPosX();
        var pointerPixelY =  can.getPosY() - y;

        if(delta > 0) {
            
            if(can.getPixSize() < 32) {		//the max that you can zoom in on
            
                setScrollPoint(pointerPixelX, pointerPixelY, can.getPixSize(), can.getPixSize() + 2);
                can.setPixSize(can.getPixSize() + 2);
                redraw.draw();
            }
        } else if(delta < 0) {
            
            if(can.getPixSize() > 4) {		//the least that you can zoom out on
                setScrollPoint(pointerPixelX, pointerPixelY, can.getPixSize(), can.getPixSize() - 2);
                can.setPixSize(can.getPixSize() - 2);
                redraw.draw();
            }

        }
    };

    var setScrollPoint = function (pointerPixelX, pointerPixelY, oldPixelSize, newPixelSize) {
        
        //The following two lines set the location where the canvas will begin redrawing (the top left corner)
        //To find the correct point
        // X =(pointerPixelX-canvasPosX)*pixSize
        // We want to keep X (or Y) constant after zooming to keep the cursor on the same thing, so I set this equation equal to itself
        // and solve for newCanvasPosX
        // The same process can be done for Y
        can.setPosX(Math.round(pointerPixelX - (((pointerPixelX - can.getPosX()) * oldPixelSize) / newPixelSize)));
        can.setPosY(Math.round(pointerPixelY - (((pointerPixelY - can.getPosY()) * oldPixelSize) / newPixelSize)));
        if(can.getPosX() < -maxPixelsPos) {
            can.setPosX(-maxPixelsPos);
        }
        if(can.getPosY() < -maxPixelsPos) {
            can.setPosY(-maxPixelsPos);
        }
        if(can.getPosX() > maxPixelsPos) {
           can.setPosX(maxPixelsPos);
        }
        if(can.getPosY() > maxPixelsPos) {
            can.setPosY(maxPixelsPos);
        }
    };
    
    return {
        init: init,
        addHandlers: addHandlers,
        removeHandlers: removeHandlers
    };
    
})();