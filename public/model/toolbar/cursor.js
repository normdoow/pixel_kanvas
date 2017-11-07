//a global module that handles the jquery handlers
var cursor = (function() {
    
    var currentCursor;

    var init = function () {
        currentCursor = "url(./images/brush2.png),url(./images/brush2.png),auto";
    };

    var getCurrentCursor = function () {
        return currentCursor;
    };

    var setCurrentCursor = function (str) {
        currentCursor = str;
    };
    
    return {
        init: init,
        getCurrentCursor: getCurrentCursor,
        setCurrentCursor: setCurrentCursor
    };
})();