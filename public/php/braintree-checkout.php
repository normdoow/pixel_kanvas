<?php
    require_once ('braintree-php/lib/Braintree.php');
    Braintree_Configuration::environment('sandbox');
    Braintree_Configuration::merchantId('6vmx6mkv3jv9gjyh');
    Braintree_Configuration::publicKey('rr87g4hyfxdfddf8');
    Braintree_Configuration::privateKey('f7edb68914535eefb25b4c4d1bc549dd');
    $nonceFromTheClient = $_POST["nonce"];
    $amount = $_POST["amount"];     //get the amount
    //echo $nonceFromTheClient;
    $result = Braintree_Transaction::sale([
        'amount' => $amount,
        'paymentMethodNonce' => $nonceFromTheClient,
        'options' => [
            'submitForSettlement' => True
        ]
    ]);
    echo $result;
?>