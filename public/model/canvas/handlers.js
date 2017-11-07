//a global module that handles the jquery handlers
var handlers = (function() {
    
    var init = function () {
          
    };
    
    var addHandlers = function () {
        scrollController.addHandlers();
        canvasController.addHandlers();
    };
    
    var removeHandlers = function () {
        scrollController.removeHandlers();
        canvasController.removeHandlers();
    };

    var addPanningHandlers = function () {
        panController.addHandlers();
    };

    var removePanningHandlers = function () {
        panController.removeHandlers();
    };
    
    return {
        addHandlers: addHandlers,
        removeHandlers: removeHandlers,
        addPanningHandlers: addPanningHandlers,
        removePanningHandlers: removePanningHandlers
    };
})();