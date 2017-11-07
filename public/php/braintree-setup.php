<?php
    require_once ('braintree-php/lib/Braintree.php');
    Braintree_Configuration::environment('production');     //sandbox
    Braintree_Configuration::merchantId('h9t8bdkgwn2kb8gg'); //6vmx6mkv3jv9gjyh
    Braintree_Configuration::publicKey('tnj8dc8mxnws5qp2'); //rr87g4hyfxdfddf8
    Braintree_Configuration::privateKey('13d10f0c1c688f35115a6df375179aa8');    //f7edb68914535eefb25b4c4d1bc549dd
    
    echo(Braintree_ClientToken::generate());
?>