//module used to get references to the firebase database
var userTiles = (function() {
	
    var userDataRef;
    var pixelDataRef;

	var init = function () {
        userDataRef = firebaseApp.getUserDataRef();
        pixelDataRef = firebaseApp.getPixelDataRef();
        var playerName = 'guest';
        var uid = 'guest';
        var user = firebaseApp.getUser();
        //get the user's data for tiles
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                playerName = user.displayName;
                uid = user.uid;
                console.log('playerName: ' + playerName);
                console.log('uid: ' + uid);
                console.log('email: ' + user.email);
                setUserTiles(uid);
            } else {
                // No user is signed in.
                menuController.createTileList([]);
            }
        });
	};

    //sets the tiles that the user owns and calls the controller to add them to the view
    var setUserTiles = function (uid) {
        userDataRef.child(uid)
                    .child('tiles')
                    .once('value', function(snapshot) {
                        var tileArray = []
                        for(var k in snapshot.val()) {
                            tileArray.push(k);
                        }
                        menuController.createTileList(tileArray);
                    });
    };

    //gets the friends that are aloud to edit a tile
    var getFriendsForTile = function (x, y) {
        var tiles = pixelDataRef.child("tile" + x + ":" + y)
                                .child('friends');
        return tiles.once('value');
    };

    //adds a friend to a tile in the database
    var addFriendToTile = function(shortEmail, email, x, y) {
        pixelDataRef.child("tile" + x + ":" + y)
                    .child('friends')
                    .child(shortEmail)     //not the best, saves everything before the @
                    .set(email);
    };

    //removes a friend from a tile in the database
    var removeFriendFromTile = function(shortEmail, x, y) {
        pixelDataRef.child("tile" + x + ":" + y)
                    .child('friends')
                    .child(shortEmail)     //not the best, saves everything before the @
                    .set(null);
    };
    
	//the public API
	return {
		init: init,
        setUserTiles: setUserTiles,
        getFriendsForTile: getFriendsForTile,
        addFriendToTile: addFriendToTile,
        removeFriendFromTile: removeFriendFromTile
	};
})();