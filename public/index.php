



<!-- new branch codeRefactor -->
<html>
  <head>
    <!-- Some SEO stuff -->
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" /><!-- Meta, title, CSS, favicons, etc. -->
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <meta name="description" content="Welcome to Pixel Kanvas. The place to collaborate and make real time pixel art with your friends!">
    <meta name="keywords" content="pixel, art, canvas, kanvas, pixelcanvas, pixelkanvas, draw, drawing, friends, collab, collaborate, pixel art, pixel canvas, pixel kanvs">
    <meta property="og:title" content="Pixel Kanvas"/>
    <meta property="og:image" content="images/favicon.png"/>
    <meta property="og:site_name" content="Pixel Kanvas"/>
    <meta property="og:description" content="Welcome to Pixel Kanvas. The place to collaborate and make real time pixel art with your friends!"/>
    <title>Pixel Kanvas</title>

    <!-- firebase and jquery scripts -->
    <script src="https://www.gstatic.com/firebasejs/live/3.0/firebase.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>
    
    <!-- css -->
    <!--<link rel="stylesheet" type="text/css" href="css/styles.css">-->
    <link rel="stylesheet" type="text/css" href="css/modal.css">
    <link rel="stylesheet" type="text/css" href="css/buy-modal.css">
    <link rel="stylesheet" type="text/css" href="css/style.css">
    <link rel="stylesheet" type="text/css" href="css/side-tools.css">
    <link rel="stylesheet" type="text/css" href="css/menu.css">
    <link rel="icon" href="images/favicon.png">

    <!-- all javascript to include. The order of how these are created is important-->
    <!-- models -->
    <script src="model/canvas/tile.js"></script> <!-- Many files based on these -->
    <script src="model/canvas/canvas.js"></script>
    <script src="model/canvas/handlers.js"></script>
    <script src="model/toolbar/cursor.js"></script>
    <script src="model/networkStuff/firebaseApp.js"></script>
    <script src="model/networkStuff/playerDots.js"></script>
    <script src="model/networkStuff/canvasFirebase.js"></script>
    <script src="model/networkStuff/cheating.js"></script>
    <script src="model/networkStuff/tileOwner.js"></script>
    <script src="model/networkStuff/selectProperty.js"></script>
    <script src="model/networkStuff/usersOnline.js"></script>
    <script src="model/menu/userTiles.js"></script>
    <script src="model/canvas/redraw.js"></script>
    <script src="model/ajax.js"></script>
    
    <!-- controllers -->
    <script src="controller/main/menu/menuController.js"></script>
    <script src="controller/main/networkStuff/canvasController.js"></script>
    <script src="controller/main/toolbar/toolbarController.js"></script>
    <script src="controller/main/toolbar/feedbackController.js"></script>
    <script src="controller/mainController.js"></script>
    <script src="controller/main/menu/loginController.js"></script>
    <script src="controller/main/menu/paymentsController.js"></script>
    <script src="controller/main/menu/selectPropertyController.js"></script>
    <script src="controller/main/scrollAndPan/panController.js"></script>
    <script src="controller/main/scrollAndPan/scrollController.js"></script>
    
    
    <!-- amazon payments stuff -->
    <script type='text/javascript'>
      window.onAmazonLoginReady = function () {
          amazon.Login.setClientId('amzn1.application-oa2-client.09d12d2b0be24b66bf4a4b256f8e1537');
      };
    </script>
    <script async type='text/javascript' src="https://static-na.payments-amazon.com/OffAmazonPayments/us/sandbox/js/Widgets.js"></script>
    
    
    <!-- color picker -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.js"></script>
    <link rel="stylesheet" type="text/css" href="css/spectrum.css">

    <!-- bootstrap stuff to link -->
    <!--<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">-->
  </head>
      
    <body>
      <div id="header-bar">
        <h1>Pixel Kanvas</h1>
          <div id="coord-box" class="float-right">
            <form autocomplete="off" id="XandY" action="javascript:void(0);" name="XandY" onsubmit="toolbarController.jumpTo()">
              <div>
                <p style="text-align:center">Jump to...</p>
                (<input id="xBox" type="text" name="xBox" value="0" size=5 class="coord-input pk-well">,
                  <input id="yBox" type="text" name="yBox" value="0" size=5 class="coord-input pk-well">)
                  <input class="topButton" type="submit" value="Go">
                  <div id="MyEdit" class="topButton">
                    Users Online: 
                  </div>
                  <button id="shareButton" class="topButton">Share</button>
                  <button id="menuButton" class="topButton">Menu</button>
                  <button id="loginButton" class="topButton">Login</button>
              </div>
            </form>
          </div>
      </div>
      
      <div id="side-tools" class="">
          <input type='text' id="full" />
          <div class="color-button button-left"></div>
          <div class="color-button button-right"></div>
          <div class="color-button button-left"></div>
          <div class="color-button button-right"></div>
          <div class="color-button button-left"></div>
          <div class="color-button button-right"></div>
          <div class="color-button button-left"></div>
          <div class="color-button button-right"></div>
          <div id="eraser-button" class="erase-button"></div>
          <p class="bar-text">Tools</br>coming</br>soon</p>
      </div>
      
      <div id="sharePopDown" class="pk-well drop-down">
        <p>Link to this Location!</p>
        <input type="text" id="urlOutput" name="country" value="http://www.pixelkanvas.com" readonly class="pk-well border" style="width:100%">
      </div>

      <!-- Modal for menu -->
      <div id="menuModal" class="modal">
        <!-- Modal content -->
        <div class="menu-content pk-well">
          <ul class="tab">
            <li><a href="#" id="welcomeButt" class="tablinks active">Welcome</a></li>
            <li><a href="#" id="propertyButt" class="tablinks">Property</a></li>
            <span class="close-button">×</span>
          </ul>

          <div id="welcome" class="tabcontent">
            <div class="left-column">
              <h1>Welcome to</h1>
              <img src="images/corner-logo-only.png" alt="corner" id="logo" />
              <h1 class="padding-left">Alpha</h1>
            </div>
            <div class="right-column">
              </br>
              </br>
                <h4>The place to collaborate and make real time pixel art with your friends!
                    There is a ton of fun to be had! And we are planning for many more features
                    to be added! Pan around the ginormous kanvas and make some great pixel art!</h4>
                <div id="menu-action-buttons" class='center'>
                  <button id='login-to-play' class="topButton">Login</button>
                  <button id='play-as-guest' class="topButton">Play as Guest</button>
                </div>
            </div>
          </div>

          <div id="property" class="tabcontent">
            <h3>Your Tiles</h3>
            <div class="scroll-box">
            </div>
            <p>You can buy your own 100 by 100 pixel tile! You get to choose where it is
            and choose which of your friends can edit it. Otherwise only you can edit it! 
            No people getting in your way! Let everyone see your Pixel art skills!
            One tile is just $1.</p>
            <button id='buy-property' class="topButton margin-right">Select Property to Buy</button>
          </div>
        </div>
      </div>

      <div class="corner pk-well rotate">
        <button id="feedback-button" class="topButton">Feedback</button>
      </div>

      <!-- feedback modal -->
      <div id="feedbackModal" class="modal">
        <!-- Modal content -->
        <div class="menu-content pk-well feedback-padding">
          <span class="close-button">×</span>
          <h3>Feedback</h3>
          <h4>We need all the feedback that we can get! Let us know what you like/dislike about Pixel Kanvas! 
          If you have any recommendations, we would enjoy those as well. We really appreciate it!</h4>
          <form>
            <input id="feedback-name" class="top-bottom-margin" placeholder="Name"></br>
            <input id="feedback-email" class="top-bottom-margin" placeholder="Email"></br>
            <input id="feedback-subject" class="top-bottom-marign" placeholder="Subject"></br>
            <textarea id="feedback-message" rows="8" cols="60" name="feedback" class="top-bottom-margin">Message</textarea></br>
            <button id='feedback-send' type="submit" class="topButton top-bottom-margin">Send Feedback</button>
          </form>
        </div>
      </div>
      
      <!-- Modal for covering screen on mobile -->
      <div id="mobileModal" class="big-modal">
        <!-- Modal content -->
        <div class="big-modal-content">
          <h1>Please Visit Pixel Kanvas on a desktop browser to experience the Awesomeness!</h1>
        </div>
      </div>
      
      <!-- Modal for log in -->
      <div id="loginModal" class="modal">
        <!-- Modal content -->
        <div class="modal-content">
          <span class="close-button">×</span>
          <h3 id="log-in-title">Login</h3>
          <div id="login-error"><p class="center"></p></div>
          <form id="sign-in-form">
            <table>
              <tr><td>Username:</td><td><input id='username' type="text" name="username"></td></tr>
              <tr><td>Email:</td><td><input id='email-sign' type="text" name="email"></td></tr>
              <tr><td>Password:</td><td><input id='password-sign' type="password" name="password"></td></tr>
              <tr><td></td><td><p class="align-left">Already have an Account? <u class="underline-butt">Login</u></p></td>
            </table>
            <br>
            <button id='sign-up' type="submit" class="topButton pin-to-right">Sign Up</button>
            <br>
          </form>
          <form id="log-in-form">
            <table>
              <tr><td>Email:</td><td><input id='email-log' type="text" name="email"></td></tr>
              <tr><td>Password:</td><td><input id='password-log' type="password" name="password"></td></tr>
              <tr><td></td><td ><p class="align-left">Don't have an Account? <u class="underline-butt">Sign Up</u></p></td>
            </table>
            <br>
            <button id='login' type="submit" class="topButton pin-to-right">Login</button>
            <br>
          </form>
        </div>
      </div>
      
      <!-- Modal for payments -->
      <div id="paymentsModal" class="modal">
        <!-- Modal content -->
        <div class="modal-content pay-modal-size">
          <span class="close-button">×</span>
          <h3> Pay with PayPal or Credit Card</h3>
          
          <!-- Pay Pal button -->
          <!--<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
            <input type="hidden" name="cmd" value="_s-xclick">
            <input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----
            ">
            <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_buynowCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
            <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
          </form>-->

          <!-- the amazon payments button -->
          <div id="AmazonPayButton"></div>
          
          <form id="checkout">
            <div id="payment-form"></div>
            </br>
            <button id="pay-button" class="topButton" type="submit">Pay</button>
          </form>
          <script src="https://js.braintreegateway.com/js/braintree-2.24.1.min.js"></script>
          <script>
          // We generated a client token for you so you can test out this code
          // immediately. In a production-ready integration, you will need to
          // generate a client token on your server (see section below).
          braintree.setup("<?php include('php/braintree-setup.php') ?>", "dropin", {
            container: "payment-form",
            onPaymentMethodReceived: function(nonce){
                        console.log(nonce);
                        paymentsController.pay(nonce);
                        return false;
                      }
          });
          </script>
          <p>Refund Policy: We do not provide refunds</p>
          <p>Privacy Policy: Customer information is collected for the purpose of processing your order. This information is kept confidential and is not shared.</p>
        </div>
      </div>  <!-- end of payments modal -->
      
      <!-- Modal for buying property -->
      <div id="buyModal" class="buy-modal">
        <!-- Modal content -->
        <div class="buy-modal-content">
          <h3> Buy Property </h3>
          <p>Click the tile(s) you would like to buy. It must be in positive coordinates.</p>
          <div id="selected-tiles"></div>
          <button id='cancel-button' class="topButton">Cancel</button>
          <button id='buy-button' class="topButton" disabled="true">Buy</button>
        </div>
      </div>
      
      <!-- 3 canvases to hold the different layers of the drawings-->
      <div id="main" role="main">
        <canvas id="respondCanvas" width="400" height="400" style="position: absolute; z-index: 0">
            <!-- Provide fallback -->
        </canvas>
        <canvas id="dotCanvas" width="400" height="400" style="position: absolute; z-index: 1">
          <!-- nothing in here -->
        </canvas>
        <canvas id="propertyCanvas" width="400" height="400" style="position: absolute; z-index: 1">
          <!-- nothing in here -->
        </canvas>
      </div>
      <!-- four arrows for panning -->
      <div class="arrow-up"></div>
      <div class="arrow-left"></div>
      <div class="arrow-right"></div>
      <div class="arrow-down"></div>
    
    </body>

  <footer>
    <!-- call the server script in footer so it runs after everything is set -->
    <!-- Google Analytics -->
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-80328595-1', 'auto');
      ga('send', 'pageview');
    </script>
  </footer>
</html>