/*All aircraft listed here*/



const aircraft = [
	
	{

        tail: "N118GM",

        model: "DA40CS",

        emptyWeight: 1727.0,

        maxWeight: 2535,

        aircraftArm: 96.94,
        
        autopilot: "KAP"

    },
	
	{
		
        tail: "N1707S",

        model: "DA40CS",

        emptyWeight: 1727.19,

        maxWeight: 2646,

        aircraftArm: 96.68,
        
        autopilot: "KAP"

    },
	
	{

        tail: "N321FS",

        model: "DA40CS",

        emptyWeight: 1761,

        maxWeight: 2535,

        aircraftArm: 97.11,
        
        autopilot: "KAP"

    },
	
	{

        tail: "N344AF",

        model: "DA40CS",

        emptyWeight: 1800,

        maxWeight: 2646,

        aircraftArm: 97.37,
        
        autopilot: "none"

    },    

    {

        tail: "N415AM",

        model: "DA40CS",

        emptyWeight: 1753.6,

        maxWeight: 2535,

        aircraftArm: 96.53,
        
        autopilot: "none"

    },

    {

        tail: "N543JW",

        model: "DA40CS",

        emptyWeight: 1758.6,

        maxWeight: 2535,

        aircraftArm: 96.486,
        
        autopilot: "none"

    },

    {

        tail: "N127KC",

        model: "DA40XLS",

        emptyWeight: 1828.85,

        maxWeight: 2646,

        aircraftArm: 98.50,
        
        autopilot: "GFC"

    },

    {

        tail: "N230DC",

        model: "DA40XLS",

        emptyWeight: 1843.0,

        maxWeight: 2646,

        aircraftArm: 98.00,
        
        autopilot: "GFC"

    },
	
	{
		tail: "N239DC",
		
		model: "DA40XLS", 
		
		emptyWeight: 1824.22,
		
		maxWeight: 2646,
		
		aircraftArm: 98.30, 
		
		autopilot: "GFC"
	},
	
	{

        tail: "N384CA",

        model: "DA40XLS",

        emptyWeight: 1812,

        maxWeight: 2646,

        aircraftArm: 98.31,
        
        autopilot: "GFC"

    },

    {

        tail: "N605CA",

        model: "DA40XLS",

        emptyWeight: 1804,

        maxWeight: 2646,

        aircraftArm: 99.04,
        
        autopilot: "GFC"

    },
		
	{
		tail: "N616ML",
		
		model: "DA40XLS", 
		
		emptyWeight: 1787.00,
		
		maxWeight: 2646,
		
		aircraftArm: 98.34, 
		
		autopilot: "GFC"
	}, 

    {

        tail: "N704PA",

        model: "DA40XLS",

        emptyWeight: 1797.8,

        maxWeight: 2646,

        aircraftArm: 97.74,
        
        autopilot: "GFC"

    },
	
	{

        tail: "N734M",

        model: "DA40XLS",

        emptyWeight: 1860,

        maxWeight: 2646,

        aircraftArm: 97.99,
        
        autopilot: "GFC"

    },
	
	{

        tail: "N74SW",

        model: "DA40XLS",

        emptyWeight: 1833.35,

        maxWeight: 2646,

        aircraftArm: 97.7,
        
        autopilot: "GFC"

    },

    {

        tail: "N759PA",

        model: "DA40XLS",

        emptyWeight: 1800.56,

        maxWeight: 2646,

        aircraftArm: 97.11,
        
        autopilot: "GFC"

    },

    {

        tail: "N78US",

        model: "DA40XL",

        emptyWeight: 1817.0,

        maxWeight: 2646,

        aircraftArm: 97.26,
        
        autopilot: "GFC",

        standardTank: true

    },

    {

        tail: "N79US",

        model: "DA40XL",

        emptyWeight: 1817.0,

        maxWeight: 2646,

        aircraftArm: 97.34,
        
        autopilot: "GFC",

        standardTank: true

    },

    { 

        tail: "N831JL",

        model: "DA40XLS",

        emptyWeight: 1819.81,

        maxWeight: 2646,

        aircraftArm: 97.98,
        
        autopilot: "GFC"

    },
	
	{

        tail: "N866US",

        model: "DA40XLS",

        emptyWeight: 1817,

        maxWeight: 2646,

        aircraftArm: 97.55,
        
        autopilot: "GFC"

    },
	
	{
		tail: "N894SA",
		
		model: "DA40XLS", 
		
		emptyWeight: 1808,
		
		maxWeight: 2646,
		
		aircraftArm: 98.00, 
		
		autopilot: "GFC"
	}

];



const aircraftModels = [

    {

        model: "DA40F",

        maxFuel: 40.2,

        maxBaggage: 66,

        frontStationCG: 90.6,

        rearStationCG: 128,

        baggageStationCG: 143.7,

        fuelStationCG: 103.5,

        fuelType: "100LL",

        cgRange: {

            minAft: 102,

            midAft: 102,

            maxAft: 102,

            minFwd: 94.5,

            midFwd: 94.5,

            maxFwd: 96.9,

            minWgt: 1720,

            midWgt: 2161,

            maxWgt: 2535

        },

        vSpeeds : {

            vr : 59,

            vx : 66,

            vy : 66,

            vg : 73,

            va : {

                2161 : 94,

                2535 : 108

            }

        }

    },

    {

        model: "DA40CS",

        maxFuel: 40.2,

        maxBaggage: 66,

        frontStationCG: 90.6,

        rearStationCG: 128,

        baggageStationCG: 153.1,

        fuelStationCG: 103.5,

        fuelType: "100LL",

        cgRange: {

            minAft: 102,

            midAft: 102,

            maxAft: 102,

            minFwd: 94.5,

            midFwd: 94.5,

            maxFwd: 96.9,

            minWgt: 1720,

            midWgt: 2161,

            maxWgt: 2535

        },

        vSpeeds : {

            vr : 59,

            vx : 66,

            vy : 66,

            vg : 73,

            va : {

                2161 : 94,

                2535 : 108

            }

        }

    },

    {

        model: "DA40XL",

        maxFuel: 40.2,

        maxBaggage1 : 100,

        maxBaggage2 : 40,

        maxBaggage : 100,

        frontStationCG: 90.6,

        rearStationCG: 128,

        baggageStationCG: 153.1,

        baggageStation2CG: 178.7,

        fuelStationCG: 103.5,

        fuelType: "100LL",

        cgRange: {

            minAft: 102,

            midAft: 102,

            maxAft: 102,

            minFwd: 94.5,

            midFwd: 94.5,

            maxFwd: 97.6,

            minWgt: 1720,

            midWgt: 2161,

            maxWgt: 2646

        },

        vSpeeds : {

            vr : 59,

            vx : 66,

            vy : 66,

            vg : 73,

            va : {

                2161 : 94,

                2535 : 108,

                2646 : 111

            }

        }

    },

    {

        model: "DA40XLS",

        maxFuel: 50,

        maxBaggage1 : 100,

        maxBaggage2 : 40,

        maxBaggage : 100,

        frontStationCG: 90.6,

        rearStationCG: 128,

        baggageStationCG: 153.1,

        baggageStation2CG: 178.7,

        fuelStationCG: 103.5,

        fuelType: "100LL",

        cgRange: {

            minAft: 100.4,

            midAft: 100.4,

            maxAft: 100.4,

            minFwd: 94.5,

            midFwd: 94.5,

            maxFwd: 97.6,

            minWgt: 1720,

            midWgt: 2161,

            maxWgt: 2646

        },

        vSpeeds : {

            vr : 59,

            vx : 66,

            vy : 66,

            vg : 73,

            va : {

                2161 : 94,

                2535 : 108,

                2646 : 111

            }

        }

    },

    {

        model: "DA42",

        maxFuel: 50,

        maxAuxFuel : 26,

        maxNoseBaggage: 66,

        maxDeIce : 8.3,

        maxBaggage1 : 100,

        maxBaggage2 : 40,

        maxBaggage : 100,

        frontStationCG: 90.6,

        rearStationCG: 128,

        noseBagStationCG: 23.6,

        baggageStationCG: 153.1,

        baggageStation2CG: 178.7,

        fuelStationCG: 103.5,

        auxStationCG: 126,

        deIceStationCG: 39.4,

        fuelType: "JETA",

        cgRange: {

            minAft: 95.28,

            midAft: 98.03,

            maxAft: 98.03,

            minFwd: 92.52,

            midFwd: 92.52,

            maxFwd: 94.49,

            minWgt: 2756,

            midWgtFwd: 3236,

            midWgtAft: 3527,

            maxWgt: 3935

        },

        vSpeeds : {

            vr : "70-72",

            vx : "-",

            vy : "78/86",

            vg : "-",

            vyse : 82,

            vmc : 68,

            va : {

                3400 : 120,

                3935 : 126

            }

        }

    }

    /* This is where you could add a new aircraft type, but if you have to add more variables then you would need

    to edit the javascript code to make use of those variables

     */

];
