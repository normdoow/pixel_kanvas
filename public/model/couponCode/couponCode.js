
//the canvas class
var couponCode = (function () {
	var posX;
	var posY;
	var width;
	var height;
	var pixSize;

	//initializers
	var init = function () {
		
	};
	
	var isCodeValid = function (code) {
        if(code.length != 6) return false;
        var values = {A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8, I:9, J:10, K:11, L:12, M:13, N:14,O: 15, P:16, Q:17, R:18, S:19, T:20, U:21, V:22, W:23, X:24, Y:25, Z:26};
        var sum = 0;
        for(var k = 0; k < code.length; k++) {
            if(values[code[k]]) {
                sum += values[code[k]];
            } else {
                return false;
            }
        }
        return sum == 78;
    };

	//return this instance
	return {
		init: init
	};
})();