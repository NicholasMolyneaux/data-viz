const dataFolder = '../../data/';

let pedestrianPaths, ODPed, hist;

let initTime, finalTime;

let data;

// Origin and Destination zones.
let listOrigin = new Array(),
    listDestination = new Array();

let graphDrawn = false;

let nbrGraphs = 0;

queue()
    .defer(d3.json, dataFolder + "small/sim_results_simulation_trajectories.json")
    .defer(d3.json, dataFolder + "small/sim_results_ped_IDS_per_OD.json")
    .defer(d3.json, dataFolder + "factice/hist.json")
    .await(main);

function main(error, trajectories, OD, histograms) {
    pedestrianPaths = trajectories;
    ODPed = OD;
    hist = histograms;

    update_info();
}

function drawGraphs() {

    graphDrawn = true;

    // Replace later with get the data
    prepareData();

    drawTT(hist['tt']);
}

function prepareData() {

    function getSelectedOptions(sel) {
        var opts = [], opt;

        // loop through options in select list
        for (var i=0, len=sel.options.length; i<len; i++) {
            opt = sel.options[i];

            // check if selected
            if ( opt.selected ) {
                // add to array of option elements to return from this function
                opts.push(opt.value);
            }
        }

        // return array containing references to selected option elements
        return opts;
    }

    // Get all selected origins
    const origins = document.getElementById("origin");

    let selectedOrigins = getSelectedOptions(origins);
    if (selectedOrigins.length == 0) {
        selectedOrigins = listOrigin;
    }

    // Get all selected destinations
    const destinations = document.getElementById("destination");

    let selectedDestinations = getSelectedOptions(destinations);
    if (selectedDestinations.length == 0) {
        selectedDestinations = listDestination;
    }

    // Get init time and final time
    const initTime = document.getElementById("init_time").value;
    const finalTime = document.getElementById("final_time").value;
}

function update_info() {

    // Get initial time
    initTime = pedestrianPaths[0]["time"];

    // Get final time
    finalTime = pedestrianPaths[pedestrianPaths.length -1]["time"];

    // Update in the HTML
    document.getElementById("init_time").value = initTime;
    document.getElementById("init_time").min = initTime;
    document.getElementById("init_time").max = finalTime;

    document.getElementById("final_time").value = finalTime;
    document.getElementById("final_time").min = initTime;
    document.getElementById("final_time").max = finalTime;

    // Check the name of Origin and Destination zones.
    Object.keys(ODPed).forEach(zone => {
        if (ODPed[zone]["O"].length > 0) {
            listOrigin.push(zone);
        }

        if (ODPed[zone]["D"].length > 0) {
            listDestination.push(zone);
        }
    });

    // Add Origin zones
    const selectOrigin = document.getElementById("origin");
    listOrigin.forEach(zone => {
       let opt = document.createElement("option");
       opt.text = zone;
       selectOrigin.add(opt);
    });

    // Add Origin zones
    const selectDestination = document.getElementById("destination");
    listDestination.forEach(zone => {
        let opt = document.createElement("option");
        opt.text = zone;
        selectDestination.add(opt);
    });
}