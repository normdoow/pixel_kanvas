<?php
    //send the data in email
    $to = "noahbragg@cedarville.edu"; // this is your Email address
    $toDrew = "andrewjbidlen@cedarville.edu";   //Drew's email
    $toWes = "wesleykelly@cedarville.edu";   //Wes's email
    $first_name = $_POST['name'];
    $subject = "Feedback for Pixel Kanvas: " . $_POST['subject'];
    $email = $_POST['email'];
    $feedback = $_POST['feedback'];
    $message =  $first_name . " sent feedback!\r\n" .
                "Email: " . $email . "\r\n\r\n" .
                $feedback;

    $headers = "From: " . $first_name;
    mail($to, $subject, $message, $headers);    //send to Noah
    // mail($toDrew, $subject, $message, $headers);    //send to Drew
    // mail($toWes, $subject, $message, $headers);    //send to Drew
    echo $message;
?>