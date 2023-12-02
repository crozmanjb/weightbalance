//var publicWeatherData;
//var publicAlt;

function iOS() {
	console.info("Device type: ", navigator.platform);
	  return [
		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod'
	  ].includes(navigator.platform)
	  // iPad on iOS 13 detection
	  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

function getWeather(){
    /**Called when submit button is clicked
     * tries to retieve AWS METAR for the provided Station ID
     * Uses PHP backend to get the XML weather and return it as JSON format**/
	document.getElementById("runwayHdg").value = "";
	if (document.getElementById("runwaySelect"))
		document.getElementById("runwaySelect").style.display = "none";
	document.getElementById("weatherData").style.display = "none";
	document.getElementById("perfTable").style.display = "none";
    var stationID = document.getElementById("weatherID").value.toUpperCase();
	if (!ALLOWED_AIRPORTS.includes(stationID)) {
		displayError("Unapproved airport");
		return;
	}
	var weatherData = JSON.parse(sessionStorage.getItem("weather"));
	if (!weatherData) weatherData = {};
    if (stationID===""){
        return;
    }
	
	if (iOS()) {
//		document.getElementById("foreflightRedirect").innerHTML = "<a href='foreflightmobile://maps/search?q=" + stationID.toUpperCase() + "'>Open in Foreflight</a>";
	} else {
//		document.getElementById("foreflightRedirect").innerHTML = "";
	}
    document.getElementById("weatherInput").style.display = "none";
    /*Section retrieves weather from aviationweather.gov using simple PHP backend.
    * Won't work if no PHP server setup*/
    if (window.XMLHttpRequest){
        var request = new XMLHttpRequest();
    }
    else{
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    request.onreadystatechange=function(){
		if (this.readyState===4 && this.status===200){

            if(this.responseText){
                try {
                    var weatherResults = JSON.parse(this.responseText);
                    if (weatherResults["metar"] !== null){
						weatherData[stationID] = {};
                        weatherData[stationID].metar = weatherResults["metar"];
						getFldAlt(weatherData[stationID].metar);
						//publicWeatherData = weatherData;
                        var requiredFields = ["temp_c", "altim_in_hg", "wind_dir_degrees", "wind_speed_kt"];
                        for (i = 0; i < requiredFields.length; i++){
                            if (!(requiredFields[i] in weatherData[stationID].metar)){
                                /*We are missed one of the required fields for perf calculations*/
                                inputWeather(weatherData[stationID].metar);
                                document.getElementById("weatherAltTitle").innerHTML =
                                    "The requested METAR is missing a required field. Please use manual entry."
                            }
                        }
                        sessionStorage.setItem("weather", JSON.stringify(weatherData));
						updateDataTimestamp();
                        setWeather(weatherData[stationID].metar);
                        runwayChange(document.getElementById("runwayHdg").value, stationID);
                    }
                    else {
						document.getElementById("runwaySelectDiv").innerHTML = "";
						document.getElementById("runwayHdg").value = "";
						runwayChange("", stationID);
                        inputWeather();
                    }
                    if (weatherResults["taf"] !== null){
                        var weatherTAF = weatherResults["taf"];
						weatherData[stationID]["taf"] = weatherTAF;
						sessionStorage.setItem("weather", JSON.stringify(weatherData));
						updateDataTimestamp();
                        setTAF(weatherTAF);
                    }
                    else{
                        document.getElementById("TAF").innerHTML = "No TAF Available";
                    }
                } catch(e){
                    /*Most likely due to the PHP server not being setup/running*/
					console.log(e);
					document.getElementById("runwaySelectDiv").innerHTML = "";
					document.getElementById("runwayHdg").value = "";
					runwayChange("", stationID);
                    inputWeather();
                }
            }
        }
    }
    request.open("GET", "server.php?q="+stationID,true);
    request.send();
}

function inputWeather(weatherData = null){
    /**We call this when fetching weather data fails so user can manually input**/
    document.getElementById("weatherAltTitle").innerHTML = "Weather retrieval failed. " +
        "Check Station ID, if correct, server not working. Try again or manually input required data below.";
    document.getElementById("weatherInput").style.display = "block";
    document.getElementById("weatherData").style.display = "none";
	if (!weatherData) return;
	if (weatherData.wind_dir_degrees) {
		document.getElementById("windHeading").value = weatherData.wind_dir_degrees;
	}
	if (weatherData.wind_speed_kt) {
		document.getElementById("windSpeed").value = weatherData.wind_speed_kt;
	}
	if (weatherData.visibility) {
		document.getElementById("visibility").value = weatherData.visibility;
	}
	if (weatherData.temp_c) {
		document.getElementById("temperature").value = weatherData.temp_c;
	}
	if (weatherData.dewpoint_c) {
		document.getElementById("dewpoint").value = weatherData.dewpoint_c;
	}
	if (weatherData.altim_in_hg) {
		document.getElementById("altimeter").value = weatherData.altim_in_hg;
	}
	if (weatherData.elevation_m) {
		document.getElementById("fieldAlt").value = Math.round(parseFloat(weatherData.elevation_m) * 3.28084);
	}
}

function weatherInputClick(){
    /**When the manual weather input submit button is clicked
     * We fetch all the user input and put into weatherData**/
    var weatherData = JSON.parse(sessionStorage.getItem("weather"));
	var station_id = document.getElementById("weatherID").value.toUpperCase();
	weatherData[station_id] = {};
	weatherData[station_id]["metar"] = {};
	weatherData[station_id]["metar"]["station_id"] = station_id;
    weatherData[station_id]["metar"]["temp_c"] = parseFloat(document.getElementById("temperature").value);
	weatherData[station_id]["metar"]["dewpoint_c"] = parseFloat(document.getElementById("dewpoint").value);
	weatherData[station_id]["metar"]["visibility_statute_mi"] = parseFloat(document.getElementById("visibility").value);
    weatherData[station_id]["metar"]["elevation_m"] = parseFloat(document.getElementById("fieldAlt").value)/3.28084;
    weatherData[station_id]["metar"]["altim_in_hg"] = parseFloat(document.getElementById("altimeter").value);
    weatherData[station_id]["metar"]["wind_dir_degrees"] = parseFloat(document.getElementById("windHeading").value);
    weatherData[station_id]["metar"]["wind_speed_kt"] = parseFloat(document.getElementById("windSpeed").value);
    sessionStorage.setItem("weather", JSON.stringify(weatherData));
	updateDataTimestamp();
	var pressureAlt = weatherData[station_id]["metar"]["elevation_m"]*3.28084 + ((29.92 - parseFloat(weatherData[station_id]["metar"].altim_in_hg))*1000);
	var stationPressure = Math.pow((Math.pow(weatherData[station_id]["metar"]["altim_in_hg"],0.1903)-(.00001313*weatherData[station_id]["metar"]["elevation_m"]*3.28084)),5.255);
    var tempRankine = ((9/5)*(weatherData[station_id]["metar"]["temp_c"]+273.15));
    var densityAlt = (145442.16*(1-((17.326*stationPressure)/(tempRankine))**0.235));
    document.getElementById("alt-wPressureAlt").innerHTML = pressureAlt.toFixed(0) + " ft";
    document.getElementById("alt-wDensityAlt").innerHTML = densityAlt.toFixed(0) + " ft";
    if (document.getElementById("runwayHdg").value === ""){
        document.getElementById("weatherInfo").innerHTML = "Input runway heading next";
    }
    else{
        document.getElementById("weatherInfo").innerHTML = "";
        runwayChange(document.getElementById("runwayHdg").value, station_id);
    }
}

function setWeather(weatherData) {
    /**Fills the weather table with retrieved weather data**/
	const zeroPad = (num, places) => String(num).padStart(places, '0')
    document.getElementById("weatherData").style.display = "block";
    document.getElementById("wRaw").innerHTML = weatherData.raw_text;
    var obsTime = new Date(weatherData.observation_time);
	var now = new Date();
	var diff = Math.round((now - obsTime) / 60000);
    document.getElementById("wTime").innerHTML = obsTime.getHours() + ":" + zeroPad(obsTime.getMinutes(), 2)
        + " (UTC " + -(obsTime.getTimezoneOffset()/60) + ") <div id='timeDiff'>(" + diff + " mins ago)</div>";
	if (diff <= 55) {
		document.getElementById("timeDiff").style.color = "green";
	} else if (55 < diff && diff <= 60) {
		document.getElementById("timeDiff").style.color = "#ffc107";
	} else {
		document.getElementById("timeDiff").style.color = "red";
	}
	document.getElementById("wCat").innerHTML = weatherData.flight_category;
	console.info(weatherData);
	switch(weatherData.flight_category){
		case "VFR":
			document.getElementById("wCat").style.color = "white";
			document.getElementById("wCatL").style.color = "white";
			document.getElementById("wCat").style.backgroundColor = "#07c502";
			document.getElementById("wCatL").style.backgroundColor = "#07c502";
			break;
		case "MVFR":
			document.getElementById("wCat").style.color = "white";
			document.getElementById("wCatL").style.color = "white";
			document.getElementById("wCat").style.backgroundColor = "#236ed8";
			document.getElementById("wCatL").style.backgroundColor = "#236ed8";
			break;
		case "IFR":
			document.getElementById("wCat").style.color = "white";
			document.getElementById("wCatL").style.color = "white";
			document.getElementById("wCat").style.backgroundColor = "#ff2700";
			document.getElementById("wCatL").style.backgroundColor = "#ff2700";
			break;
		case "LIFR":
			document.getElementById("wCat").style.color = "white";
			document.getElementById("wCatL").style.color = "white";
			document.getElementById("wCat").style.backgroundColor = "#ff40ff";
			document.getElementById("wCatL").style.backgroundColor = "#ff40ff";
			break;
	}
		
    var windDir = "";
    if ((weatherData.wind_dir_degrees === "0") && (weatherData.wind_speed_kt === "0")){
        windDir = "Calm";
        document.getElementById("wWind").innerHTML = windDir;
    }
    else{
        if (weatherData.wind_dir_degrees === "0"){
            windDir = "Variable";
        }
        else{
            windDir = parseFloat(weatherData.wind_dir_degrees);
            if (windDir < 100){
                windDir = "0" + windDir.toFixed(0).toString() + "&deg";
            }
            else{
                windDir = windDir.toFixed(0).toString() + "&deg";
            }
        }
        if ("wind_gust_kt" in weatherData){
            document.getElementById("wWind").innerHTML = windDir + " @ " + weatherData.wind_speed_kt
                + " kts G " + weatherData.wind_gust_kt + " kts";
        }
        else {
            document.getElementById("wWind").innerHTML = windDir + " @ " + weatherData.wind_speed_kt + " kts";
        }
    }
	if (weatherData.visibility_statute_mi) {
    	document.getElementById("wVisibility").innerHTML = parseFloat(weatherData.visibility_statute_mi) + " sm";
		document.getElementById("wVisibility").style.backgroundColor = "white";
	} else {
		document.getElementById("wVisibility").innerHTML = "MISSING";
		document.getElementById("wVisibility").style.backgroundColor = "#ffc107";
	}
    var rawCeilings = weatherData.sky_condition;
    var ceilingString = "";
    if (Array.isArray(rawCeilings)){
        for (var i = 0; i < rawCeilings.length; i++){
            var ceilingAttribute = rawCeilings[i]["@attributes"];
            ceilingString += "<p style='margin: 0'>" + ceilingAttribute["sky_cover"] + " @ " + ceilingAttribute["cloud_base_ft_agl"] + "'</p>";
        }
    }
    else{
        ceilingAttribute = rawCeilings["@attributes"];
        if (ceilingAttribute["sky_cover"] === "CLR"){
            ceilingString = "Clear";
        }
        else{
            ceilingString += "<p style='margin: 0'>" + ceilingAttribute["sky_cover"] + " @ "
                + ceilingAttribute["cloud_base_ft_agl"] + "'</p>";
        }
    }

    document.getElementById("wCeilings").innerHTML = ceilingString;
    var temp = parseFloat(weatherData.temp_c);
    var dewpoint = parseFloat(weatherData.dewpoint_c);
    document.getElementById("wTemp").innerHTML = temp + " &degC (" + Math.round(temp * 9/5 + 32) + " &degF)";
    document.getElementById("wDewpoint").innerHTML = dewpoint + " &degC (" + Math.round(dewpoint * 9/5 + 32) + " &degF)";
    document.getElementById("wAltimeter").innerHTML = parseFloat(weatherData.altim_in_hg).toFixed(2) + " inHg";
    var fldAlt = parseFloat(weatherData.elevation_m)*3.28084;
	var pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg))*1000);
    var altimeterHg = parseFloat(weatherData.altim_in_hg);
    /*variables below used to compute Density altitude without humidity compensation, so slightly off*/
    var stationPressure = Math.pow((Math.pow(altimeterHg,0.1903)-(.00001313*fldAlt)),5.255);
    var tempRankine = ((9/5)*(temp+273.15));
    var densityAlt = (145442.16*(1-((17.326*stationPressure)/(tempRankine))**0.235));
    document.getElementById("wPressureAlt").innerHTML = pressureAlt.toFixed(0) + " ft";
    document.getElementById("wDensityAlt").innerHTML = densityAlt.toFixed(0) + " ft";
	if (weatherData.wx_string == null) {
		document.getElementById("wWeather").parentNode.style.display = "none";
	} else {
		document.getElementById("wWeather").innerHTML = weatherData.wx_string;
		document.getElementById("wWeather").parentNode.style.display = "table-row";
	}
	getRunways(weatherData);
}

function getFormattedUTCTime() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const month = months[now.getUTCMonth()];
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const formattedUTCDate = `${month} ${day} ${hours}:${minutes}Z`;
  return formattedUTCDate;
}

function setTAF(weatherTAF){
    /*TAF*/
    var rawTAF = weatherTAF.raw_text;
    var nLines = weatherTAF.forecast.length;
    var index = 0;
    var line = "";
    var newLines = [];
    if (nLines == null){
        newLines.push(rawTAF);
    }
    else{
        var indicator = weatherTAF.forecast[1].change_indicator;
        index = rawTAF.indexOf(indicator);
        newLines.push(rawTAF.slice(0, index));
        line = rawTAF.slice(index);
        for (i = 1; i < nLines; i++){
            var tempLine = line.slice(indicator.length);
            if (i+1 === nLines){
                newLines.push(indicator+tempLine);
            }
            else{
                var nextIndicator = weatherTAF.forecast[i+1].change_indicator;
                index = tempLine.indexOf(nextIndicator);
                newLines.push(indicator+tempLine.slice(0,index));
                indicator = nextIndicator;
                line = tempLine.slice(index);
            }
        }
    }

    document.getElementById("TAF").innerHTML = "Current Time: " + getFormattedUTCTime() + "<br>";
    for (i=0; i < newLines.length; i++){
        document.getElementById("TAF").innerHTML += newLines[i] + "<br>"
    }
}

function runwayChange(str, station_id = null){
    /**Called when the runway heading input changes,
     * it then calls the compute functions to recalculate distances**/
	displayError("");
    if (str === ""){
		document.getElementById("xWind").innerHTML = "";
        document.getElementById("headWind").innerHTML = "";
		document.getElementById("TODistance").innerHTML = "";
        document.getElementById("TO50Distance").innerHTML = "";
		document.getElementById("LDGDistance").innerHTML = "";
        document.getElementById("LDG50Distance").innerHTML = "";
		document.getElementById("tgDistance").innerHTML = "";
        document.getElementById("climbFPM").innerHTML = "";
		document.getElementById("perfTable").style.display = "none";
        heading = "";
        return;
    }
    heading = parseFloat(str);
    if ((heading > 360) || (heading < 1)){
        document.getElementById("xWind").innerHTML = "";
        document.getElementById("headWind").innerHTML = "";
		document.getElementById("TODistance").innerHTML = "";
        document.getElementById("TO50Distance").innerHTML = "";
		document.getElementById("LDGDistance").innerHTML = "";
        document.getElementById("LDG50Distance").innerHTML = "";
		document.getElementById("tgDistance").innerHTML = "";
        document.getElementById("climbFPM").innerHTML = "";
		document.getElementById("perfTable").style.display = "none";
        heading = "";
		displayError("Invalid runway heading");
        return;
    }
	if (!station_id) {
		station_id = document.getElementById("weatherID").value.toUpperCase();
	}
	var allWeatherData = JSON.parse(sessionStorage.getItem("weather"));
	console.log(station_id, allWeatherData);
	if (allWeatherData && allWeatherData[station_id] && allWeatherData[station_id]["metar"]){
        var weatherData = allWeatherData[station_id]["metar"];
        var weatherTAF = allWeatherData[station_id]["taf"];
        document.getElementById("weatherWarning").style.display = "none";

        if (weatherData["wind_dir_degrees"] === "0"){
			winds = {xWind : 0, hWind : 0};			
        }
        else{
            winds = windComponents(heading, weatherData["wind_dir_degrees"], weatherData["wind_speed_kt"]);
        }
        if (weatherTAF != null){
            setTAF(weatherTAF);
        } else {
            document.getElementById("TAF").innerHTML = "No TAF Available";
        }
			document.getElementById("headWind").innerHTML = winds.hWind.toFixed(0);
			if (winds.xWind < 0){
				document.getElementById("xWind").innerHTML = -winds.xWind.toFixed(0) + " (Right)";
			}
			else if (winds.xWind > 0){
				document.getElementById("xWind").innerHTML = winds.xWind.toFixed(0) + " (Left)";
			}
			else{
				document.getElementById("xWind").innerHTML = winds.xWind.toFixed(0);
			}
		
        performanceCompute(station_id, winds, heading);
    		if (weatherData["wind_speed_kt"] !== "0" && weatherData["wind_dir_degrees"] === "0") {
				document.getElementById("headWind").innerHTML = "VRB";
				document.getElementById("xWind").innerHTML = "VRB";
			}
	} else {
        document.getElementById("weatherWarning").style.display = "block";
        document.getElementById("weatherWarning").innerHTML = "Enter Weather Data";
    }
}

function getRunways(weatherData) {
	//var weatherData;
	//if (weatherDataI == null) {weatherData = publicWeatherData;} else {weatherData = weatherDataI;}
	if (window.XMLHttpRequest){
        var request = new XMLHttpRequest();
    }
    else{
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    request.onreadystatechange=function(){
        if (this.readyState===4 && this.status===200){

            if(this.responseText){
                try {
                    var airportResults = JSON.parse(this.responseText);
                    if (airportResults["id"] !== null){
						var runways = [];
                        var runwayData = airportResults["runways"];
                        for (var key in runwayData){
							if (runwayData[key]['closed'] == '0' && (runwayData[key]['surface'] == "ASP" || runwayData[key]['surface'] == "CON")) {
								runways[runwayData[key]['le_ident']] = runwayData[key]['length_ft'];
								runways[runwayData[key]['he_ident']] = runwayData[key]['length_ft'];
							}
						}
						
						var windData = [];
						
						for (var key in runways) {
							var value = key + "0";
							if (value.endsWith("R0") || value.endsWith("C0") || value.endsWith("L0")) {
								value = value.slice(0, -2);
								value += "0";
							}
							windData[key] = windComponents(value, weatherData['wind_dir_degrees'], weatherData['wind_speed_kt']);
						}
						var best;
						for (var key in windData) {
							if (best == null || windData[key]["hWind"] > windData[best]["hWind"]){
								best = key;
							}
							if (windData[key]["hWind"] == windData[best]["hWind"] && parseInt(runways[key]) > parseInt(runways[best])){
								best = key;
							}
						}
						var autoChange = false;
						var output = '<select class="form-control" id="runwaySelect" onChange="autoRunwayChange()"><option value="0">Enter Runway Heading</option>';
						for (var key in runways) {
							if (key == best) {output += '<option value="' + key + '0" selected>' + key + ' (Length: ' + runways[key] + ' ft)</option>'; autoChange = true;}
							else {output += '<option value="' + key + '0">' + key + ' (Length: ' + runways[key] + ' ft)</option>';}
						}
						output += "</select>";
						var current = document.getElementById("runwaySelectDiv").innerHTML;
						document.getElementById("test").innerHTML = output;
						output = document.getElementById("test").innerHTML;
						document.getElementById("test").innerHTML = "";
						if (output != current) {
							document.getElementById("runwaySelectDiv").innerHTML = output;
						}
						if (autoChange) {
							autoRunwayChange();
						}
                    }
                } catch(e){
                    /*Most likely due to the PHP server not being setup/running*/
					console.log(e);
					document.getElementById("runwaySelectDiv").innerHTML = "";
					document.getElementById("runwayHdg").value = "";
					runwayChange("", weatherData['station_id']);
                }
            }
		}
    }
    request.open("GET", "server2.php?q="+weatherData['station_id'],true);
    request.send();
}

function getFldAlt(weatherData) {
	var airportResults;
	if (window.XMLHttpRequest){
        var request = new XMLHttpRequest();
    }
    else{
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    request.onreadystatechange=function(){
        if (this.readyState===4 && this.status===200){

            if(this.responseText){
                try {
                    airportResults = JSON.parse(this.responseText);
					//publicAlt = parseFloat(airportResults["elevation_ft"]);
					setWeather(weatherData);
                } catch(e){
                    /*Most likely due to the PHP server not being setup/running*/
					console.log(e);
                }
            }
		}
    }
    request.open("GET", "server2.php?q="+weatherData['station_id'],true);
    request.send();

}


function autoRunwayChange() {
	var value = document.getElementById("runwaySelect").value;
	if (value.endsWith("R0") || value.endsWith("C0") || value.endsWith("L0")) {
		value = value.slice(0, -2);
		value += "0";
	}
	var station_id = document.getElementById("weatherID").value.toUpperCase();
	runwayChange(value, station_id);
	
	document.getElementById("runwayHdg").value = value;
}

function windComponents(heading, windDir, windSpeed){
    /**Takes the runway heading, wind direction, and wind speed in kts
     * Returns the cross wind and head wind components for the given runway **/
	if (windDir == "0") {
		return {xWind : 0, hWind : 0};
	}
    var diffAngle = heading - parseFloat(windDir);
    var radAngle = diffAngle*Math.PI/180;
    var xWindSpd = Math.sin(radAngle)*parseFloat(windSpeed);
    var hWindSpd = Math.cos(radAngle)*parseFloat(windSpeed);
    return {xWind : xWindSpd, hWind : hWindSpd};
}

function performanceCompute(station_id, winds, heading){
    /**Takes wind data, then imports weight data, weather data, aircraft data from local storage
     * Uses stored data to compute takeoff/landing/climb performance values depending on aircraft model**/
	var weatherData = JSON.parse(sessionStorage.getItem("weather"));
	// console.log("weather data: ", station_id);
    if (localStorage.getItem("userInput") == null){
		displayError("Weight and Balance incomplete");
        return;
    }
    else if (localStorage.getItem("computedData") == null){
		displayError("Weight and Balance incomplete");
        return;
	}
    else if (!weatherData || !weatherData[station_id] || !weatherData[station_id]["metar"]){
		displayError("Weather error");
        return;
    }
    var userData = JSON.parse(localStorage.getItem("userInput"));
    var computedData = JSON.parse(localStorage.getItem("computedData"));
    weatherData = weatherData[station_id]["metar"];

	var aircraftObj = userData.obj;
	console.info("aircraftObj perf.js", aircraftObj);
   
    var takeoffWeight = computedData.takeOffWeight;
    var landingWeight = computedData.landingWeight;
    var temp = parseFloat(weatherData.temp_c);
    var fldAlt = parseFloat(weatherData.elevation_m)*3.281;
    var pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg))*1000);

    var takeoffDistance = getPerformanceNumbers(aircraftObj.model, "takeoff", pressureAlt,
        temp, takeoffWeight, winds.hWind, aircraftObj.maxWeight)*3.281;
    document.getElementById("TODistance").innerHTML = "Ground Roll: "
        + (takeoffDistance/10).toFixed(0)*10 + " ft";
    var takeoff50Distance = getPerformanceNumbers(aircraftObj.model, "takeoff50", pressureAlt,
        temp, takeoffWeight, winds.hWind, aircraftObj.maxWeight)*3.281;
    document.getElementById("TO50Distance").innerHTML = "Over 50': "
        + (takeoff50Distance/10).toFixed(0)*10 + " ft";
    var landingDistance = getPerformanceNumbers(aircraftObj.model, "landing", pressureAlt,
        temp, landingWeight, winds.hWind, aircraftObj.maxWeight)*3.281;
    document.getElementById("LDGDistance").innerHTML = "Ground Roll: "
        + (landingDistance/10).toFixed(0)*10 + " ft";
    var landing50Distance = getPerformanceNumbers(aircraftObj.model, "landing50", pressureAlt,
        temp, landingWeight, winds.hWind, aircraftObj.maxWeight)*3.281;
    document.getElementById("LDG50Distance").innerHTML = "Over 50': "
        + (landing50Distance/10).toFixed(0)*10 + " ft";
    var climbPerf = getPerformanceNumbers(aircraftObj.model, "climb", pressureAlt, temp,
        takeoffWeight, winds.hWind, aircraftObj.maxWeight);
    document.getElementById("climbFPM").innerHTML = (climbPerf/10).toFixed(0)*10 + " FPM";

    document.getElementById("tgDistance").innerHTML = ((takeoffDistance + landingDistance)/10).toFixed(0)*10 + " ft";
	var performanceData = JSON.parse(sessionStorage.getItem("performance"));
	if (!performanceData) performanceData = {};
    const airportPerformance = {
        "tail" : aircraftObj.tail,
        "takeoffDistance" : takeoffDistance,
        "takeoff50Distance" : takeoff50Distance,
        "landingDistance" : landingDistance,
        "landing50Distance" : landing50Distance,
        "climbPerf" : climbPerf,
        "pressureAlt" : pressureAlt,
        "headWind" : winds.hWind,
        "crossWind" : winds.xWind,
        "runwayHdg" : heading
    }
	performanceData[station_id] = airportPerformance;
	displayError("");
    document.getElementById("perfTable").style.display = "flex";
    sessionStorage.setItem("performance", JSON.stringify(performanceData));
	updateDataTimestamp();
    document.getElementById("navbarSummary").classList.remove("disabled");
	document.getElementById("next-button").disabled = false;
	updateAirports();
}

function getPerformanceNumbers(modelString, typeString, pressureAlt, temp, weight, hWind, maxWeight){
    /**
     * Takes data from perfdata.js. The function name is the type of aircraft.
     * The first value passed is one of:
     * "takeoff","takeoff50","landing","landing50"
     * The second value passed is one of:
     * "DA" -> this is for the first portion of the chart that computes the density altitude
     * "weight" -> the weight portion of the chart
     * "hwind"-> the wind portion of the chart
     *
     * **/
    if (modelString === "DA40F"){
        var last_result;
        if (typeString === "climb"){
            DA_Result = densityAltitudeChart(DA40FP(typeString, "DA"), pressureAlt, temp);
            last_result = weightChart(DA40FP(typeString, "weight"), DA_Result, weight, maxWeight);
        }
        else {
            var DA_Result = densityAltitudeChart(DA40FP(typeString, "DA"),pressureAlt, temp);
            var weight_Result = weightChart(DA40FP(typeString, "weight"), DA_Result, weight, maxWeight);

            if (hWind > 0){
                last_result = windObstacleChart(DA40FP(typeString, "hwind"), weight_Result, hWind);
            }
            else if (hWind < 0){
                last_result = windObstacleChart(DA40FP(typeString, "twind"), weight_Result, Math.abs(hWind));
            }
            else if (hWind === 0){
                last_result = weight_Result;
            }
        }
        var scale = DA40FP(typeString, "scale");
        return last_result*(parseFloat(scale.max) - parseFloat(scale.min))/100 + parseFloat(scale.min);
    }
    else if ((modelString === "DA40CS") || (modelString === "DA40XL") || (modelString === "DA40XLS")){
        if (typeString === "climb"){
            DA_Result = densityAltitudeChart(DA40CS(typeString, "DA"), pressureAlt, temp);
            last_result = weightChart(DA40CS(typeString, "weight"), DA_Result, weight, 2646);
        }
        else{
            var use50 = false;
            var reverse = false;
            if (typeString === "landing50"){
                typeString = "landing";
            }
            else if (typeString === "takeoff50"){
                use50 = true;
                typeString = "takeoff";
            }
            else if (typeString === "landing"){
                use50 = true;
                reverse = true;
            }
            var wind_result;
            DA_Result = densityAltitudeChart(DA40CS(typeString, "DA"),pressureAlt, temp);
            weight_Result = weightChart(DA40CS(typeString, "weight"), DA_Result, weight, 2646);
            if (hWind > 0){
                wind_result = windObstacleChart(DA40CS(typeString, "hwind"), weight_Result, hWind, false);
            }
            else if (hWind < 0){
                /*There is no landing tailwind chart, so we will assume every 2 knots increases by 10%*/
                if (typeString === "landing"){
                    wind_result = weight_Result*(.05*Math.abs(hWind)) + weight_Result;
                }
                else{
                    wind_result = windObstacleChart(DA40CS(typeString, "twind"), weight_Result, Math.abs(hWind), false);
                }
            }
            else if (hWind === 0){
                wind_result = weight_Result;
            }
            if (use50){
                if (reverse){
                    last_result = windObstacleChart(DA40CS(typeString, "obstacle"), wind_result, 0, true);
                }
                else {
                    last_result = windObstacleChart(DA40CS(typeString, "obstacle"), wind_result, 50, false);
                }
            }
            else {
                last_result = wind_result;
            }
        }
        scale = DA40CS(typeString, "scale");
        return last_result*(parseFloat(scale.max) - parseFloat(scale.min))/100 + parseFloat(scale.min);
    }
    else if (modelString === "DA42"){
        if (typeString === "climb"){
            DA_Result = densityAltitudeChart(DA40CS(typeString, "DA"), pressureAlt, temp);
            last_result = weightChart(DA40CS(typeString, "weight"), DA_Result, weight, maxWeight);
        }
        else{
            if (weight > 3748){
                typeString += "Heavy";
            }
            else{
                maxWeight = 3748;
            }

            DA_Result = densityAltitudeChart(DA42(typeString, "DA"),pressureAlt, temp);
            weight_Result = weightChart(DA42(typeString, "weight"), DA_Result, weight, maxWeight);

            if (hWind > 0){
                last_result = windObstacleChart(DA42(typeString, "hwind"), weight_Result, hWind);
            }
            else if (hWind < 0){
                last_result = windObstacleChart(DA42(typeString, "twind"), weight_Result, Math.abs(hWind));
            }
            else if (hWind === 0){
                last_result = weight_Result;
            }
        }
        scale = DA42(typeString, "scale");
        return last_result*(parseFloat(scale.max) - parseFloat(scale.min))/100 + parseFloat(scale.min);
    }
}

function  densityAltitudeChart(PA_lines, pressureAlt, temp){
    /**Takes pressure Altitude and OAT and outputs first part of landing chart**/
    const PA_Values = Object.keys(PA_lines);
    for (i = 0; i < PA_Values.length; i++) {
        bottomPA = parseFloat(PA_Values[i]);
        var useExp = false;
        var useExp1= false;
        if ("e" in PA_lines[bottomPA]){
            useExp = true;
        }
        if (i + 1 >= PA_Values.length) {
            /*We have reached the end of lines but haven't found our value, so just use top line*/
            if (useExp){
                return parseFloat(PA_lines[bottomPA].b) * Math.E ** (parseFloat(PA_lines[bottomPA].e) * temp);
            }
            else{
                return parseFloat(PA_lines[bottomPA].m) * temp + parseFloat(PA_lines[bottomPA].b);
            }
        }
        else {
            topPA = parseFloat(PA_Values[i + 1]);
            if ("e" in PA_lines[topPA]){
                useExp1 = true;
            }
            if (pressureAlt < bottomPA) {
                /*if less than 0 PA just use 0 PA*/
                if (useExp){
                    return parseFloat(PA_lines[bottomPA].b) * Math.E ** (parseFloat(PA_lines[bottomPA].e) * temp);
                }
                else {
                    return parseFloat(PA_lines[bottomPA].m) * temp + parseFloat(PA_lines[bottomPA].b);
                }

            } else if ((pressureAlt >= bottomPA) && (pressureAlt < topPA)) {
                /*Between two lines (usually we use this) */
                skew = (pressureAlt - bottomPA) / (topPA - bottomPA);
                if (useExp){
                    bottomValue = parseFloat(PA_lines[bottomPA].b) * Math.E ** (parseFloat(PA_lines[bottomPA].e) * temp);
                }
                else{
                    bottomValue = parseFloat(PA_lines[bottomPA].m) * temp + parseFloat(PA_lines[bottomPA].b);
                }
                if (useExp1){
                    topValue = parseFloat(PA_lines[topPA].b) * Math.E ** (parseFloat(PA_lines[topPA].e) * temp);
                }
                else{
                    topValue = parseFloat(PA_lines[topPA].m) * temp + parseFloat(PA_lines[topPA].b);
                }
                return ((topValue - bottomValue) * skew) + bottomValue;
            }
        }
    }
}

function weightChart(lines, DA_Result, weight, maxWeight){
    /**Takes the result from the first portion of the chart (DA_Result) and landing weight to find the next section**/

    for (i=0; i < lines.length; i++){
        var useExp = false;
        var useLog = false;
        if ("e" in lines[i]){
            useExp = true;
            bottomIntercept = parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * maxWeight);
        }
        else if ("c" in lines[i]){
            useLog = true;
            bottomIntercept = parseFloat(lines[i].c) * Math.log(maxWeight) + parseFloat(lines[i].b);
        }
        else {
            bottomIntercept = parseFloat(lines[i].m) * maxWeight + parseFloat(lines[i].b);
        }
        if (i+1 >= lines.length) {
            /*We have reached the end of lines but haven't found our value, so use top line and add a skew*/
            if (useExp) {
                return (parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * weight)) + (DA_Result - bottomIntercept);
            }
            else if (useLog){
                return parseFloat(lines[i].c) * Math.log(weight) + parseFloat(lines[i].b) + (DA_Result - bottomIntercept);
            }
            else {
                return parseFloat(lines[i].m) * weight + parseFloat(lines[i].b) + (DA_Result - bottomIntercept);
            }
        }
        else {
            var useExp1 = false;
            var useLog1 = false;
            if("e" in lines[i+1]){
                useExp1 = true;
                topIntercept = parseFloat(lines[i+1].b) * Math.E ** (parseFloat(lines[i+1].e) * maxWeight);
            }
            else if ("c" in lines[i+1]){
                useLog1 = true;
                topIntercept =  parseFloat(lines[i+1].c) * Math.log(maxWeight) + parseFloat(lines[i+1].b);
            }
            else{
                topIntercept = parseFloat(lines[i+1].m) * maxWeight + parseFloat(lines[i+1].b);
            }
            /*We are below bottom line so just use bottom line with some skew*/
            if (DA_Result < bottomIntercept){
                if (useExp){
                    return (parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * weight)) - (bottomIntercept - DA_Result);
                }
                else if (useLog){
                    return (parseFloat(lines[i].c) * Math.log(weight) + parseFloat(lines[i].b)) - (bottomIntercept - DA_Result);
                }
                else{
                    return parseFloat(lines[i].m) * weight + parseFloat(lines[i].b) - (bottomIntercept - DA_Result);
                }
            }
            else if ((DA_Result >= bottomIntercept) && (DA_Result < topIntercept)){
                /*Between two lines (usually we use this) */
                skew = (DA_Result - bottomIntercept)/(topIntercept-bottomIntercept);
                if (useExp1){
                    topValue = parseFloat(lines[i+1].b) * Math.E ** (parseFloat(lines[i+1].e) * weight);
                }
                else if (useLog1){
                    topValue = parseFloat(lines[i+1].c) * Math.log(weight) + parseFloat(lines[i+1].b);
                }
                else{
                    topValue = parseFloat(lines[i+1].m) * weight + parseFloat(lines[i+1].b);
                }
                if (useExp){
                    bottomValue = parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * weight);
                }
                else if (useLog){
                    bottomValue = parseFloat(lines[i].c) * Math.log(weight) + parseFloat(lines[i].b);
                }
                else{
                    bottomValue = parseFloat(lines[i].m) * weight + parseFloat(lines[i].b);
                }
                return ((topValue - bottomValue) * skew) + bottomValue;
            }
        }
    }
}

function windObstacleChart(lines, previous_result, input_x, reverse= false){
    /**Interpolates the wind or obstacle lines section of the landing data.
     * It will do either since both start at 0
     * **/
    for (i=0; i < lines.length; i++){
        var useExp = false;
        var useExp1 = false;
        if ("e" in lines[i]){
            useExp = true;
        }
        if (reverse){
            if (useExp){
                bottomIntercept = parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * 50);
            }
            else{
                bottomIntercept = parseFloat(lines[i].m)*50 + parseFloat(lines[i].b);
            }
        }
        else{
            bottomIntercept = parseFloat(lines[i].b);
        }

        if (i+1 >= lines.length){
            /*We have reached the end of lines but haven't found our value, so use top line and add a skew*/
            if (useExp){
                return (parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * input_x)) + (previous_result - bottomIntercept);
            }
            else{
                return parseFloat(lines[i].m) * input_x + parseFloat(lines[i].b) + (previous_result - bottomIntercept);
            }
        }
        else {
            if ("e" in lines[i+1]){
                useExp1 = true;
            }
            if (reverse){
                if (useExp1) {
                    topIntercept = parseFloat(lines[i+1].b) * Math.E ** (parseFloat(lines[i+1].e) * 50);
                }
                else {
                    topIntercept = parseFloat(lines[i + 1].m) * 50 + parseFloat(lines[i + 1].b);
                }
            }
            else{
                topIntercept = parseFloat(lines[i+1].b);
            }

            /*We are below bottom line so just use bottom line with some skew*/
            if (previous_result < bottomIntercept){
                if (useExp){
                    return (parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * input_x)) + (bottomIntercept - previous_result);
                }
                else{
                    return parseFloat(lines[i].m) * input_x + parseFloat(lines[i].b) - (bottomIntercept - previous_result);
                }
            }
            else if ((previous_result >= bottomIntercept) && (previous_result < topIntercept)){
                /*Between two lines (usually we use this) */
                skew = (previous_result - bottomIntercept)/(topIntercept-bottomIntercept);
                if (useExp){
                    bottomValue = parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * input_x);
                }
                else {
                    bottomValue = parseFloat(lines[i].m) * input_x + parseFloat(lines[i].b);
                }
                if (useExp1){
                    topValue = parseFloat(lines[i+1].b) * Math.E ** (parseFloat(lines[i+1].e) * input_x);
                }
                else{
                    topValue = parseFloat(lines[i+1].m) * input_x + parseFloat(lines[i+1].b);
                }
                return ((topValue - bottomValue) * skew) + bottomValue;
            }
        }
    }
}

function displayError(message) {
	document.getElementById("errorDiv").innerHTML = message;
	if (message) {
		document.getElementById("errorDiv").classList.remove("hidden");
	} else {
		document.getElementById("errorDiv").classList.add("hidden");
	}
}

function updateAirports() {
	clearAirportTabs();
	var requiredFields = ["temp_c", "altim_in_hg", "wind_dir_degrees", "wind_speed_kt"];
	var perfData = JSON.parse(sessionStorage.getItem("performance"));
	var weatherData = JSON.parse(sessionStorage.getItem("weather"));
	if (!perfData || !weatherData) return;
	for (let airport in perfData) {
		let valid = true;
		for (i = 0; i < requiredFields.length; i++){
			valid = valid && requiredFields[i] in weatherData[airport].metar;
		}
		if (valid) {
			addAirportTab(airport);
		} else {
			removeAirportData(airport);
		}
	}
}

function removeAirport(identifier) {
	removeAirportData(identifier);
	updateAirports();
}

function removeAirportData(identifier) {
	let weatherData = JSON.parse(sessionStorage.getItem("weather"));
	if (weatherData[identifier]) delete weatherData[identifier];
	sessionStorage.setItem("weather", JSON.stringify(weatherData));

	
	let performanceData = JSON.parse(sessionStorage.getItem("performance"));
	if (performanceData[identifier]) delete performanceData[identifier];
	sessionStorage.setItem("performance", JSON.stringify(performanceData));
}

function clearAirportTabs() {
	var airportContainer = document.getElementById("airport-container");
	while (airportContainer.firstChild) {
		airportContainer.removeChild(airportContainer.firstChild);
	}
}

function addAirportTab(identifier) {
	var airportContainer = document.getElementById("airport-container");
	var airportTab = document.createElement("div");
	airportTab.classList.add("airport-select");
	airportTab.dataset.identifier = identifier;
	airportTab.innerHTML = identifier;
	airportTab.addEventListener("mouseenter", function(event) {
		event.target.style.backgroundColor = "#9DADBD";
		event.target.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
		airportTab.firstChild.addEventListener("click", function(e) {
			e.preventDefault();
			removeAirport(e.target.parentElement.dataset.identifier);
		});
	});
	airportTab.addEventListener("mouseleave", function(event) {
		event.target.style.backgroundColor = "#009FFF";
		event.target.innerHTML = event.target.dataset.identifier;
	});
	airportTab.addEventListener("click", function(event) {
		event.preventDefault();
		removeAirport(event.target.dataset.identifier);
	});
	airportContainer.appendChild(airportTab);
}
document.getElementById("previous-button").addEventListener("click", function(){
	window.location.href = "weightbalance.html";
});
document.getElementById("next-button").addEventListener("click", function(){
	window.location.href = "risk.html";
});

if (sessionStorage.getItem("performance") !== null){
    document.getElementById("navbarSummary").classList.remove("disabled");
	document.getElementById("next-button").disabled = false;
	updateAirports();
}



function updateDataTimestamp() {
	sessionStorage.setItem("modified", new Date().getTime());
	localStorage.setItem("modified", new Date().getTime());
}