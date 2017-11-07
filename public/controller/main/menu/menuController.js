//login controller
var menuController = (function() {

    var init = function () {
        setUpModal();
        showModal();
        setActionButtons();
        userTiles.init();
        $('#welcomeButt').click(function(event){clickedTab(event, 'welcome');});
        $('#propertyButt').click(function(event){clickedTab(event, 'property');});
        $("#menuButton").click(function (event) {
			showModal();
		});
        $('#login-to-play').click(loginController.showModal);
        $('#play-as-guest').click(hideModal);
        $('#buy-property').click(function(){selectPropertyController.init(); hideModal()});
    };

    var showModal = function() {
        var modal = $('#menuModal').get(0);
        modal.style.display = "block";
        handlers.removeHandlers();                         //remove the other handlers so they aren't in the way
        handlers.removePanningHandlers();
    };

    var hideModal = function() {
        var modal = $('#menuModal').get(0);
        modal.style.display = "none";
        handlers.addHandlers();
        handlers.addPanningHandlers();
    };
    
    var setUpModal = function () {
        var modal = $('#menuModal').get(0);

        // Get the <span> element that closes the modal
        var span = $('#menuModal .close-button').get(0);

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            hideModal();
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                hideModal();
            }
        }
        //set the first tab to be welcome
        document.getElementById('welcome').style.display = "block";
    };

    var setActionButtons = function () {
        var auth = firebaseApp.getAuth();
        var user = auth.onAuthStateChanged(function(user) {
            if(user) {
                $('#menu-action-buttons').empty();
                $('#menu-action-buttons').append("<h2 class='center'>Hello " + user.displayName + "!</h2>" +
                                                "<button onclick='menuController.hideModal()' class='topButton'>Play!</button>");
            }
        });
    };

    var clickedTab = function (evt, tab) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tab).style.display = "block";
        evt.currentTarget.className += " active";
    };

    var showFriends = function (x, y) {
        document.getElementById("dropdown" + x + "" + y).classList.toggle("show");
    };

    var setupFriendModal = function () {
        window.onclick = function(event) {
            console.log('went in');
            var friendPopUp = $('#myDropdown').get(0);
            friendPopUp.style.display = "none";
            count++;
        }
    };

    var addFriend = function (e, event, x, y, isNewFriend) {
        if (event) event.preventDefault();
        var email = (e)? e : $('#friend-email' + x + '' + y).val();
        if(validateEmail(email)) {
            var shortEmail = email.substr(0, email.indexOf('@'));
            shortEmail = shortEmail.replace(/[!#$%&'*+-/=?^_`{|}~.]/g,'');         //remove characters that could break the database
            var friend = "friend" + x + "" + y + "" + shortEmail;
            var remove = "remove-friend" + x + "" + y + "" + shortEmail;
            $('#friends' + x + "" + y).append("<div class='" + friend + "'><span class='email-text'>" + email + "</span> <span class='remove-friendX " + remove + "'>×</span></div>");
            $('#friend-email' + x + '' + y).val('');        //remove input value
            var span = $("." + remove).get(0);
            span.onclick = function() {
                removeFriend(email, x, y);
            }
            userTiles.addFriendToTile(shortEmail, email, x, y);         //make the change to the database
        }
        //send an email to the friend
        if(isNewFriend) {
            sendEmailToFriend(email, x, y);
        }
        return false;       //so the form doesn't try to submit
    };

    var removeFriend = function (email, x, y) {
        var shortEmail = email.substr(0, email.indexOf('@'));
        shortEmail = shortEmail.replace(/[!#$%&'*+-/=?^_`{|}~.]/g,'');         //remove characters that could break the database
        var remove = "remove-friend" + x + "" + y + "" + shortEmail;
        var friend = "friend" + x + "" + y + "" + shortEmail;
        $('.' + remove).remove();
        $('.' + friend).remove();
        userTiles.removeFriendFromTile(shortEmail, x, y);         //make the change to the database
    };

    //jquery that adds html for the friends tiles and drop downs
    var createTileList = function (tiles) {
        console.log(tiles);
        $('.scroll-box').empty();
        for(var k = 0; k < tiles.length; k++) {
            var coords = tiles[k].replace('tile', '');
            var coords = coords.split(':');
            var x = coords[0];
            var y = coords[1];
            //add the html for this tile
            $('.scroll-box').append("<h3 class='inline property-tile-margins tile-margin-left'>Tile X:" + x + " Y:" + y + "</h3>" +
                                    "<button onclick='menuController.jumpToTile(" + x + ", " + y + ")' class='topButton float-right property-tile-margins tile-margin-right'>Jump to Tile</button>" +
                                    "<div class='float-right property-tile-margins'>" +
                                        "<button id='friends-button' onclick='menuController.showFriends(" + x + "," + y + ")' class='topButton'>Friends</button>" +
                                        "<div id='dropdown" + x + "" + y + "' class='dropdown-content'>" +
                                            "<p>Add friend's email to Tile</p>" +
                                            "<div id='friends" + x + "" + y + "' class='drop-scroll'></div>" +
                                            "<form>" +
                                                "<input id='friend-email" + x + "" + y + "' class='custom-input' type='text' placeholder='Enter friend\'s email'></input>" +
                                                "<button onclick='menuController.addFriend(null, event," + x + "," + y + ", true)' type='submit' class='smallButton float-right'>Add Friend</button>" +
                                            "</form>" +
                                        "</div>" +
                                    "</div><hr>");
            getFriendsForTile(x, y);    //call seperate function so x and y stay the same                   

        }
        if(tiles.length == 0) {
            $('.scroll-box').append("<h3 class='center'>You have no tiles :(</h3>");
        }
    };

    //gets the friends for that specific tile
    var getFriendsForTile = function (x, y) {
        userTiles.getFriendsForTile(x, y).then(function(snapshot) {        //return the  ownerData
            var friends = snapshot.val();
            if(friends) {
                for(var k in friends) {
                    var email = friends[k];
                    addFriend(email, null, x, y, false);
                }
            }
        });
    };

    //jumps to Tile
    var jumpToTile = function (tileX, tileY) {
        var x = tileX * 100 - 100;
        var y = tileY * 100 + 110;
        can.setPixSize(4);
        canvasController.jumpTo(x, y);
        hideModal();
    };

    //validates if an email is correct
    var validateEmail = function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    var sendEmailToFriend = function (email, x, y) {
        //send email to the friend
        var user = firebaseApp.getUser();
        user = (user)? user.displayName : '';
        var xCoord = x * 100 - 100;
        var yCoord = y * 100 + 110;
        var url = './php/emailFriend.php';
        var params = {email: email, user: user, x: xCoord, y: yCoord};
        ajax.doAjax(url, params).then(function(data) {
            console.log('got the data ' + data);
        });
    };

    //the public API
    return {
        init: init,
        showModal: showModal,
        hideModal: hideModal,
        setActionButtons: setActionButtons,
        jumpToTile: jumpToTile,
        showFriends: showFriends,
        addFriend: addFriend,
        removeFriend: removeFriend,
        createTileList: createTileList
    };
})();