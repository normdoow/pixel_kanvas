//payments controller
var paymentsController = (function() {
    
    var amount; //the amount of money that they are paying
    
    var init = function () {
        //setupAmazonPayments();
    };
    
    var pay = function (nonce) {
        var url = "./php/braintree-checkout.php";
        nonce["amount"] = amount;  //add the payment amount to the nounce
        //make an ajax call
        ajax.doAjax(url, nonce).done(function(data) {
            console.log('got the data ' + data);
           
            var success = (data.indexOf("Success") >= 0);
            if(success) {
                console.log('successful payment');
                removePaymentsModal();
                selectProperty.giveProperty();
                selectPropertyController.cancelClicked();       //isn't really cancel but resets everything
                //TODO give success and send user to their new tile
            } else {
                console.log('unsuccessful payment');
            }
        }).fail(function(error) {
            console.log('failed with ' + error);
        });  
    };
    
    var setupAmazonPayments = function () {
        var authRequest;
        OffAmazonPayments.Button("AmazonPayButton", "A24PUEFEBHWQQS", {
            type: "PwA",
            authorization: function () {
                loginOptions = { scope: "profile postal_code payments:widget payments:shipping_address", popup: true };
                authRequest = amazon.Login.authorize(loginOptions, "https://localhost/pixel-kanvas/Firebase%20drawing%20tutorial/public/index.html");
            },
            onError: function (error) {
                // something bad happened
            }
        });
    };
    
    var showModal = function () {
        //get the amount of money they are paying
        amount = selectProperty.getSelectedTiles().length;
        $('#pay-button').text('Pay $' + amount);    //set the pay button
        
        // Get the modal
        var modal = $('#paymentsModal').get(0);
        //display the modal
        modal.style.display = "block";
        
        // Get the <span> element that closes the modal
        var span = $('#paymentsModal .close-button').get(0);
        
        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
            selectPropertyController.showModal();       //show the buying modal again
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
                selectPropertyController.showModal();
            }
        }
    };
    
    var removePaymentsModal = function () {
        var modal = $('#paymentsModal').get(0);
        modal.style.display = "none";
    };

    //the public API
    return {
        init: init,
        pay: pay,
        showModal: showModal
    };
})();