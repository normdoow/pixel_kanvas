//class to hold a tile
var Tile = (function () {
	var posX;
	var posY;

	//initializers
	var init = function () {
		posX = 0;
		posY = -1;
	};
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
	init.prototype = {
		getPosX: getPosX,
		setPosX: setPosX,
		getPosY: getPosY,
		setPosY: setPosY
	};
	return init;
})();