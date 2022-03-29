<?php
$identifier = strtoupper($_GET['q']);
$token = "7d96e1f78cf2ee91d9547f8e2edddec5d3ce21bd91f201c8ef511d5ca022822bebf6a5e9f87c1bcd11dd288aa0b6c234";
$xml = file_get_contents('https://airportdb.io/api/v1/airport/'.$identifier.'?apiToken='.$token) or die("Error: Cannot create object");
echo($xml);
?>