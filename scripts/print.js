const zeroPad = (num, places) => String(num).padStart(places, '0');
function fillData(){
    /**Main call to fetch all data from local or session storage and call all the fill functions**/

    var userData = JSON.parse(localStorage.getItem("userInput"));
	var weatherData = JSON.parse(sessionStorage.getItem("weather"));
    var computedData = JSON.parse(localStorage.getItem("computedData"));
    var performanceData = JSON.parse(sessionStorage.getItem("performance"));
	var riskData = sessionStorage.getItem("riskData");
    var resultCG = JSON.parse(localStorage.getItem("CG"));
    var colors = JSON.parse(localStorage.getItem("colors"));
    var tailNumber = userData.obj.tail;
    var aircraftObj = JSON.parse(localStorage.getItem("userInput")).obj;
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);
    document.getElementById("title").innerHTML = tailNumber + " Summary";
    fillWB(computedData, userData, resultCG.fwdCG, resultCG.validCG, false);
	fillRisk(riskData);
    drawCG(computedData, userData, modelData, colors);
	
	let airports = [];
	for (let i in performanceData) {
		airports.push(i);
	}
	for (let i in airports) {
		if (i > 0) addWeatherTable(i);
		fillWeather(weatherData[airports[i]].metar, weatherData[airports[i]].taf, false, i);
		fillPerformance(performanceData[airports[i]], false, tailNumber, i);
	}
	fillVSpeeds(computedData, modelData);
	document.getElementById("header").innerHTML = tailNumber + " Weight and Balance " + ` (${new Date().toDateString()})`;
}

function fillWeather(weatherData, weatherTAF, isPrint, suffix){
    /**Fills HTML elements with weather data**/
    if (!("raw_text" in weatherData)){
		document.getElementById("wIdent-" + suffix).innerHTML = weatherData.station_id;
        var temp = parseFloat(weatherData.temp_c);
        document.getElementById("wWind-" + suffix).innerHTML = weatherData.wind_dir_degrees + " @ " + weatherData.wind_speed_kt + " kts";
		document.getElementById("wTempDew-" + suffix).innerHTML = temp + " &degC/" + ((weatherData.dewpoint_c) ? (weatherData.dewpoint_c + " &degC") : "---");
		document.getElementById("wVisibility-" + suffix).innerHTML =  ((weatherData.visibility_statute_mi) ? parseFloat(weatherData.visibility_statute_mi) + " sm" : "MISSING");
        document.getElementById("wAltimeter-" + suffix).innerHTML = parseFloat(weatherData.altim_in_hg).toFixed(2) + " inHg";
        var fldAlt = parseFloat(weatherData.elevation_m)*3.281;
        var pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg))*1000);
        var altimeterHg = parseFloat(weatherData.altim_in_hg);
        /*variables below used to compute Density altitude without humidity compensation, so slightly off*/
        var stationPressure = ((altimeterHg**0.1903)-(.00001313*fldAlt))**5.255;
        var tempRankine = ((9/5)*(temp+273.15));
        var densityAlt = (145442.16*(1-((17.326*stationPressure)/(tempRankine))**0.235));
        document.getElementById("wPressureAlt-" + suffix).innerHTML = pressureAlt.toFixed(0) + " ft";
        document.getElementById("wDensityAlt-" + suffix).innerHTML = densityAlt.toFixed(0) + " ft";
    }
    else {
        if (isPrint){
            document.getElementById("wIdent-" + suffix).innerHTML = weatherData.station_id;
            temp = parseFloat(weatherData.temp_c);
            var dewpoint = parseFloat(weatherData.dewpoint_c);
            document.getElementById("wTemp-" + suffix).innerHTML = temp + " &degC";
			document.getElementById("wDewpoint-" + suffix).innerHTML = dewpoint + " &degC";
        }
        else{
			document.getElementById("wIdent-" + suffix).innerHTML = weatherData.station_id;
            temp = parseFloat(weatherData.temp_c);
            dewpoint = parseFloat(weatherData.dewpoint_c);
            document.getElementById("wTempDew-" + suffix).innerHTML = temp + " &degC/" + dewpoint + " &degC";
        }
		
        var obsTime = new Date(weatherData.observation_time);
        document.getElementById("wTime-" + suffix).innerHTML = zeroPad(obsTime.getHours(), 2) + ":" + zeroPad(obsTime.getMinutes(), 2)
            + " (UTC " + -(obsTime.getTimezoneOffset() / 60) + ")";
        var windDir = "";
        if ((weatherData.wind_dir_degrees === "0") && (weatherData.wind_speed_kt === "0")) {
            windDir = "Calm";
            document.getElementById("wWind-" + suffix).innerHTML = windDir;
        } else {
            if (weatherData.wind_dir_degrees === "0") {
                windDir = "Variable";
            } else {
                windDir = parseFloat(weatherData.wind_dir_degrees);
                if (windDir < 100) {
                    windDir = "0" + windDir.toFixed(0).toString() + "&deg";
                } else {
                    windDir = windDir.toFixed(0).toString() + "&deg";
                }
            }
            if ("wind_gust_kt" in weatherData) {
                document.getElementById("wWind-" + suffix).innerHTML = windDir + " @ " + weatherData.wind_speed_kt
                    + " kts G " + weatherData.wind_gust_kt + " kts";
            } else {
                document.getElementById("wWind-" + suffix).innerHTML = windDir + " @ " + weatherData.wind_speed_kt + " kts";
            }
        }
        document.getElementById("wVisibility-" + suffix).innerHTML =  ((weatherData.visibility_statute_mi) ? parseFloat(weatherData.visibility_statute_mi) + " sm" : "MISSING");
        var rawCeilings = weatherData.sky_condition;
        var ceilingString = "";
        if (Array.isArray(rawCeilings)) {
            for (var i = 0; i < rawCeilings.length; i++) {
                var ceilingAttribute = rawCeilings[i]["@attributes"];
                ceilingString += "<p style='margin: 0'>" + ceilingAttribute["sky_cover"] + " @ " + ceilingAttribute["cloud_base_ft_agl"] + "'</p>";
            }
        } else {
            ceilingAttribute = rawCeilings["@attributes"];
            if (ceilingAttribute["sky_cover"] === "CLR") {
                ceilingString = "Clear";
            } else {
                ceilingString += "<p style='margin: 0'>" + ceilingAttribute["sky_cover"] + " @ "
                    + ceilingAttribute["cloud_base_ft_agl"] + "'</p>";
            }
        }

        document.getElementById("wCeilings-" + suffix).innerHTML = ceilingString;
        document.getElementById("wAltimeter-" + suffix).innerHTML = parseFloat(weatherData.altim_in_hg).toFixed(2) + " inHg";
        fldAlt = parseFloat(weatherData.elevation_m) * 3.281;
        pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg)) * 1000);
        altimeterHg = parseFloat(weatherData.altim_in_hg);
        /*variables below used to compute Density altitude without humidity compensation, so slightly off*/
        stationPressure = ((altimeterHg ** 0.1903) - (.00001313 * fldAlt)) ** 5.255;
        tempRankine = ((9 / 5) * (temp + 273.15));
        densityAlt = (145442.16 * (1 - ((17.326 * stationPressure) / (tempRankine)) ** 0.235));
        document.getElementById("wPressureAlt-" + suffix).innerHTML = pressureAlt.toFixed(0) + " ft";
        document.getElementById("wDensityAlt-" + suffix).innerHTML = densityAlt.toFixed(0) + " ft";

        /*TAF*/
        if (weatherTAF !== null){
            setTAF(weatherTAF, suffix);
        }
        else{
            document.getElementById("TAF-" + suffix).innerHTML = "No TAF Available";
        }
    }
}

function setTAF(weatherTAF, suffix){
    /*TAF*/
	if (!weatherTAF) {
		document.getElementById("TAF-" + suffix).innerHTML = "No TAF available";
		return;
	}
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

    var now = new Date()
    for (i=0; i < newLines.length; i++){
        document.getElementById("TAF-" + suffix).innerHTML += newLines[i] + "<br>"
    }
}

function fillPerformance(performanceData, isPrint, tailNumber, suffix) {
    /**Fills HTML elements with performance data**/
    runway = (performanceData.runwayHdg/10).toFixed(0);
    if (runway == 0){
        runway = 36;
    }
    if (!isPrint){
        document.getElementById("runwayHdg-" + suffix).innerHTML = "Runway " + runway;
    }

    document.getElementById("headWind-" + suffix).innerHTML = performanceData.headWind.toFixed(0) + " kts";
    if (performanceData.crossWind < 0){
        document.getElementById("crossWind-" + suffix).innerHTML = -performanceData.crossWind.toFixed(0) + " kts (Right)";
    }
    else if (performanceData.crossWind === 0){
        document.getElementById("crossWind-" + suffix).innerHTML = performanceData.crossWind.toFixed(0) + " kts";
    }
    else{
        document.getElementById("crossWind-" + suffix).innerHTML = performanceData.crossWind.toFixed(0) + " kts (Left)";
    }

    document.getElementById("TODistance-" + suffix).innerHTML = "Ground Roll: "
        + (performanceData.takeoffDistance/10).toFixed(0)*10 + " ft";
    document.getElementById("TO50Distance-" + suffix).innerHTML = "Over 50': "
        + (performanceData.takeoff50Distance/10).toFixed(0)*10 + " ft";
    document.getElementById("LDGDistance-" + suffix).innerHTML = "Ground Roll: "
        + (performanceData.landingDistance/10).toFixed(0)*10 + " ft";
    document.getElementById("LDG50Distance-" + suffix).innerHTML = "Over 50': "
        + (performanceData.landing50Distance/10).toFixed(0)*10 + " ft";
    document.getElementById("rateClimb-" + suffix).innerHTML = (performanceData.climbPerf/10).toFixed(0)*10 + " FPM";
    document.getElementById("tgDistance-" + suffix).innerHTML = ((performanceData.takeoffDistance + performanceData.landingDistance)/10).toFixed(0)*10 + " ft";

}

function fillRisk(riskData) {
	if (!riskData) return;
	let riskCat = JSON.parse(riskData).riskCat;
	document.getElementById("riskAssessmentHeader").classList.remove("hidden");
	document.getElementById("riskAssessment").classList.remove("hidden");
	document.getElementById("riskAssessment").innerHTML = `<strong>Risk Score: ${JSON.parse(riskData).riskScore}</strong><br>`;
	if (riskCat == 0) {
		document.getElementById("riskAssessment").innerHTML += "No unusual hazards. Use normal flight planning and established personal minimums and operating procedures";
	} else if (riskCat == 1) {
		document.getElementById("riskAssessment").innerHTML += "Slightly increased risk. Conduct flight planning with extra caution. Review personal minimums and operating procedures";
	} else if (riskCat == 2) {
		document.getElementById("riskAssessment").innerHTML += "Conditions present very high risk. Conduct flight planning with extra care and review all elements that present the most risk. Consult with more experienced pilots or flight instructors for guidance. Consider delaying flight until conditions improve";
	}
}

function fillWB(computedData, userInput, fwdCG, validCG, isPrint){
    /**Fill HTML elements with weight and balance data**/

    var aircraftObj = JSON.parse(localStorage.getItem("userInput")).obj;
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);
	var tailNumber = aircraftObj.tail;

    document.getElementById("empty_wt_td").innerHTML = aircraftObj.emptyWeight;
    document.getElementById("empty_cg_td").innerHTML = aircraftObj.aircraftArm;
    document.getElementById("empty_mnt_td").innerHTML = computedData.emptyMoment;

    document.getElementById("front_wt_td").innerHTML = userInput.frontStationWeight;
    document.getElementById("front_cg_td").innerHTML = modelData.frontStationCG;
    document.getElementById("front_mnt_td").innerHTML = computedData.frontMoment;

    document.getElementById("rear_wt_td").innerHTML = userInput.rearStationWeight;
    document.getElementById("rear_cg_td").innerHTML = modelData.rearStationCG;
    document.getElementById("rear_mnt_td").innerHTML = computedData.rearMoment;

    document.getElementById("zero_wt_td").innerHTML = computedData.zeroFuelWeight;
    document.getElementById("zero_cg_td").innerHTML = computedData.zeroFuelCG;
    document.getElementById("zero_mnt_td").innerHTML = computedData.zeroFuelMoment.toFixed(2);

    document.getElementById("fuel_wt_td").innerHTML = userInput.fuelWeight;
    document.getElementById("fuel_cg_td").innerHTML = modelData.fuelStationCG;
    document.getElementById("fuel_mnt_td").innerHTML = computedData.fuelMoment;

    document.getElementById("takeoff_wt_td").innerHTML = computedData.takeOffWeight;
    document.getElementById("takeoff_cg_td").innerHTML = computedData.takeoffCG;
    document.getElementById("takeoff_mnt_td").innerHTML = computedData.takeOffMoment.toFixed(2);;

    document.getElementById("burn_wt_td").innerHTML = userInput.fuelBurnWeight;
    document.getElementById("burn_cg_td").innerHTML = modelData.fuelStationCG;
    document.getElementById("burn_mnt_td").innerHTML = computedData.fuelBurnMoment;

    document.getElementById("landing_wt_td").innerHTML = computedData.landingWeight;
    document.getElementById("landing_cg_td").innerHTML = computedData.landingCG;
    document.getElementById("landing_mnt_td").innerHTML = computedData.landingMoment;

    document.getElementById("fwd_cg").innerHTML = fwdCG;
    document.getElementById("act_cg").innerHTML = computedData.takeoffCG;
    document.getElementById("aft_cg").innerHTML = modelData.cgRange.midAft;

    document.getElementById("bag_wt_td").innerHTML = userInput.baggage1Weight;
    document.getElementById("bag_cg_td").innerHTML = modelData.baggageStationCG;
    document.getElementById("bag_mnt_td").innerHTML = computedData.baggageMoment;

    if (aircraftObj.model === "DA42") {
        document.getElementById("nose_wt_td").innerHTML = userInput.noseWeight;
        document.getElementById("nose_cg_td").innerHTML = modelData.noseBagStationCG;
        document.getElementById("nose_mnt_td").innerHTML = computedData.noseBagMoment;

        document.getElementById("deIce_wt_td").innerHTML = userInput.deIceWeight;
        document.getElementById("deIce_cg_td").innerHTML = modelData.deIceStationCG;
        document.getElementById("deIce_mnt_td").innerHTML = computedData.deIceMoment;

        document.getElementById("aux_wt_td").innerHTML = userInput.auxFuelWeight;
        document.getElementById("aux_cg_td").innerHTML = modelData.auxStationCG;
        document.getElementById("aux_mnt_td").innerHTML = computedData.auxFuelMoment;

        document.getElementById("bag2_tr").style.display = "";
        document.getElementById("bag2_wt_td").innerHTML = userInput.baggage2Weight;
        document.getElementById("bag2_cg_td").innerHTML = modelData.baggageStation2CG;
        document.getElementById("bag2_mnt_td").innerHTML = computedData.baggage2Moment;

        document.getElementById("max_wt_td").innerHTML = aircraftObj.maxTOWeight;

    }
    else {
        document.getElementById("max_wt_td").innerHTML = aircraftObj.maxWeight;
        if (!isPrint){
            document.getElementById("bag2_tr").style.display = "none";
        }
        document.getElementById("nose_wt_td").innerHTML = "-";
        document.getElementById("nose_cg_td").innerHTML = "-";
        document.getElementById("nose_mnt_td").innerHTML = "-";

        document.getElementById("deIce_wt_td").innerHTML = "-";
        document.getElementById("deIce_cg_td").innerHTML = "-";
        document.getElementById("deIce_mnt_td").innerHTML = "-";

        document.getElementById("aux_wt_td").innerHTML = "-";
        document.getElementById("aux_cg_td").innerHTML = "-";
        document.getElementById("aux_mnt_td").innerHTML = "-";

        document.getElementById("bag2_wt_td").innerHTML = "-";
        document.getElementById("bag2_cg_td").innerHTML = "-";
        document.getElementById("bag2_mnt_td").innerHTML = "-";

    }

    if ((aircraftObj.model === "DA40XL") || (aircraftObj.model === "DA40XLS")){
        if (!isPrint){
            document.getElementById("bag2_tr").style.display = "";
        }
        document.getElementById("bag2_wt_td").innerHTML = userInput.baggage2Weight;
        document.getElementById("bag2_cg_td").innerHTML = modelData.baggageStation2CG;
        document.getElementById("bag2_mnt_td").innerHTML = computedData.baggage2Moment;
    }
}

function fillVSpeeds(computedData, modelData) {
    document.getElementById("Vr").innerHTML = modelData.vSpeeds.vr;
    document.getElementById("Vx").innerHTML = modelData.vSpeeds.vx;
    document.getElementById("Vy").innerHTML = modelData.vSpeeds.vy;
    document.getElementById("Vg").innerHTML = modelData.vSpeeds.vg;
    vaSpeeds = Object.keys(modelData.vSpeeds.va);
	
    for (i=0; i < vaSpeeds.length; i++){
        if (computedData.takeOffWeight <= parseFloat(vaSpeeds[i])){
            document.getElementById("Va").innerHTML = modelData.vSpeeds.va[vaSpeeds[i]];
            return;
        }
    }

}

function addWeatherTable(i) {
	var div = document.createElement("div");
	div.classList.add("weatherDiv");
	div.innerHTML = `<table class="table table-bordered table-sm table-striped"><tbody><tr><th colspan="4" class="centered" id="wIdent-${i}">Weather</th></tr><tr><th class="no-bottom-border">Time</th><th class="no-bottom-border">Wind Der/Vel</th><th class="no-bottom-border">Visibility</th><th></th></tr><tr><td id="wTime-${i}" class="no-top-border"></td><td id="wWind-${i}" class="no-top-border"></td><td id="wVisibility-${i}" class="no-top-border"></td><td></td></tr><tr><th class="no-bottom-border">Clouds</th><th class="no-bottom-border">Temp/Dew</th><th class="no-bottom-border">Altimeter</th><th></th></tr><tr><td id="wCeilings-${i}" class="no-top-border"></td><td id="wTempDew-${i}" class="no-top-border"></td><td id="wAltimeter-${i}" class="no-top-border"></td><td></td></tr><tr style="border-top: 2px solid black;"><th>Density Alt.</th><td id="wDensityAlt-${i}"></td><th>Pressure Alt.</th><td id="wPressureAlt-${i}"></td></tr><tr><th>Headwind</th><td id="headWind-${i}"></td><th>Crosswind</th><td id="crossWind-${i}"></td></tr><tr style="border-top: 2px solid black;"><th class="centered" colspan="2">Takeoff (<span id="runwayHdg-${i}"></span>)</th><th class="centered" colspan="2">Landing</th></tr><tr><th>Ground Roll</th><td id="TODistance-${i}"></td><th>Ground Roll</th><td id="LDGDistance-${i}"></td></tr><tr><th>Over 50'</th><td id="TO50Distance-${i}"></td><th>Over 50'</th><td id="LDG50Distance-${i}"></td></tr><tr style="border-top: 2px solid black;""><th>Touch and Go Distance</th><td id="tgDistance-${i}"></td><th>Rate of Climb</th><td id="rateClimb-${i}"></td></tr></tbody></table><p class="taf" id="TAF-${i}"></p>`;
	document.getElementById(i % 2 == 0 ? "weatherCol1" : "weatherCol2").appendChild(div);
}

fillData();

if (window.location.href.split("?").length <= 1 || window.location.href.split("?")[1] != "debug"){
	window.print();
	window.onfocus=function(){ window.close();}
}
