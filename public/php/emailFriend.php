<?php
    //send the data in email
    $email = $_POST['email'];
    $user = $_POST['user'];
    $x = $_POST['x'];
    $y = $_POST['y'];
    $headers = "From: " . $user . "\r\n";
    // To send HTML mail, the Content-type header must be set
    $headers .= 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
    $subject = "Your Friend added You to his Pixel Kanvas Tile!";
    // $message = "Hello from Pixel Kanvas!\r\n\r\n" .
    //             "Your friend " . $user . " has added you to their tile!\r\n" .
    //             "You can visit the tile at...\r\n" .
    //             "http://www.pixelkanvas.com?x=" . $x . "y=" . $y . "\r\n";
    $message = '<html><body>';
    $message .= '<h3>Hello from Pixel Kanvas!</h3>';
    $message .= "<p>Your friend " . $user . " has added you to his/her tile!</p>";
    $message .= "<p>Go to tile x:" . $x . " y:" . $y . " on Pixel Kanvas to help make some great art!</p>";
    $message .= "<p>Have Fun!</p>";
    $message .= "<p>The Pixel Kanvas team.</p>";
    // $message .= "<a href='http://www.pixelkanvas.com'>Link</a>";
    $message .= '</body></html>';
    
    mail($email, $subject, $message, $headers);    //send to Friend of the tile owner
    echo $message
?>