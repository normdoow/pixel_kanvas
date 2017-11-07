
//the canvas class
var can = (function () {
	var posX;
	var posY;
	var width;
	var height;
	var pixSize;

	//initializers
	var init = function () {
		posX = -20;
		posY = 110;
		width = 0;
		height = 0;
		pixSize = 5;
	}
	
	//getters and setters
	var getPosX = function () {
		return posX;
	};
	var setPosX = function (x) {
		posX = x;
	};
	var getPosY = function () {
		return posY;
	};
	var setPosY = function (y) {
		posY = y;
	};
	var getWidth = function () {
		return width;
	};
	var setWidth = function (w) {
		width = w;
	};
	var getHeight = function () {
		return height;
	};
	var setHeight = function (h) {
		height = h;
	};
	var getPixSize = function () {
		return pixSize;
	}
	var setPixSize = function (ps) {
		pixSize = ps;
	}
	//return this instance
	return {
		init: init,
		getPosX: getPosX,
		setPosX: setPosX,
		getPosY: getPosY,
		setPosY: setPosY,
		getWidth: getWidth,
		setWidth: setWidth,
		getHeight: getHeight,
		setHeight: setHeight,
		getPixSize: getPixSize,
		setPixSize: setPixSize
	};
})();