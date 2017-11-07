//ajax calls
var ajax = (function() {
    
    //functin that does an ajax call and returns a promise
    var doAjax = function (url, params) {
        console.log(url);
        console.log('ajax request');
        var promise = $.ajax({  
            url: url,
            data: params,
            type: 'POST'
        })
        return promise;
    }

    //the public API
    return {
        doAjax: doAjax
    };
})();