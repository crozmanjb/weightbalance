<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
$identifier = strtolower($_GET['q']);
$randomizer = rand(0, 90);
$metarRaw = simplexml_load_file('https://aviationweather.gov/api/data/metar?ids='.$identifier.'&format=xml&taf=false') or die("Error: Cannot get METAR");


//$xml = simplexml_load_file('https://www.aviationweather.gov/adds/dataserver_current/httpparam?datasource=metars&requesttype=retrieve&format=xml&stationstring='.$identifier.'&hoursBeforeNow=1&mostRecentForEachStation=true&mindegreedistance='.$randomizer) or die("Error: Cannot create object");
////echo('https://www.aviationweather.gov/adds/dataserver_current/httpparam?datasource=metars&requesttype=retrieve&format=xml&stationstring='.$identifier.'&hoursBeforeNow=1&mostRecentForEachStation=true&mindegreedistance='.$randomizer);
//if (json_encode($xml->data->METAR) == "{}") {
//	$xml = simplexml_load_file('https://www.aviationweather.gov/adds/dataserver_current/httpparam?datasource=metars&requesttype=retrieve&format=xml&stationstring='.$identifier.'&hoursBeforeNow=1&mostRecentForEachStation=constraint&mindegreedistance='.$randomizer) or die("Error: Cannot create object");
//	//echo('https://www.aviationweather.gov/adds/dataserver_current/httpparam?datasource=metars&requesttype=retrieve&format=xml&stationstring='.$identifier.'&hoursBeforeNow=1&mostRecentForEachStation=constraint&mindegreedistance='.$randomizer);
//} 
//if (json_encode($xml->data->METAR) == "{}") {
//	$xml = simplexml_load_file('https://www.aviationweather.gov/adds/dataserver_current/httpparam?datasource=metars&requesttype=retrieve&format=xml&stationstring='.$identifier.'&hoursBeforeNow=1.25&mostRecentForEachStation=true&mindegreedistance='.$randomizer) or die("Error: Cannot create object");
//	//echo('https://www.aviationweather.gov/adds/dataserver_current/httpparam?datasource=metars&requesttype=retrieve&format=xml&stationstring='.$identifier.'&hoursBeforeNow=1.25&mostRecentForEachStation=true&mindegreedistance='.$randomizer);
//} 
//if (json_encode($xml->data->METAR) == "{}") {
//	$xml = simplexml_load_file('https://www.aviationweather.gov/adds/dataserver_current/httpparam?datasource=metars&requesttype=retrieve&format=xml&stationstring='.$identifier.'&hoursBeforeNow=1.25&mostRecentForEachStation=constraint&mindegreeidstance='.$randomizer) or die("Error: Cannot create object");
//	//echo('https://www.aviationweather.gov/adds/dataserver_current/httpparam?datasource=metars&requesttype=retrieve&format=xml&stationstring='.$identifier.'&hoursBeforeNow=1.25&mostRecentForEachStation=constraint&mindegreeidstance='.$randomizer);
//}
//var_dump($xml);
$metar = '{"metar":' . json_encode($metarRaw->data->METAR);

$tafRaw = simplexml_load_file('https://aviationweather.gov/api/data/taf?ids='.$identifier.'&format=xml&metar=false') or die("Error: Cannot get TAF");


//$xml2 = simplexml_load_file('https://aviationweather.gov/adds/dataserver_current/httpparam?datasource=tafs&requesttype=retrieve&format=xml&stationstring='.$identifier.'&hoursBeforeNow=6&mostRecent=true&timetype=issue') or die("Error: Cannot create object");
//if (json_encode($xml2->data->TAF) == "{}") {
//	$xml2 = simplexml_load_file('https://aviationweather.gov/adds/dataserver_current/httpparam?datasource=tafs&requesttype=retrieve&format=xml&stationstring='.$identifier.'&hoursBeforeNow=6&mostRecent=true&timetype=valid') or die("Error: Cannot create object");
//}
$taf;
if((string) $tafRaw->data->attributes()->num_results == "0") {
	$taf = ',"taf":null}';
} else {
	$taf = ',"taf":' . json_encode($tafRaw->data->TAF) . '}';
}
echo($metar.$taf);
?>