const dataFolder = '../../data/';

// Data -> to be removed later
let pedestrianPaths, ODPed, histData;

// Parameters for the options -> to be removed later
let initTime, finalTime;

// Origin and Destination zones.
let listOrigin = new Array(),
    listDestination = new Array();

// Parameters for the statistics

// Number of graphs (avoid having too much of them on the screen
let nbrGraphs = 0;

// IDs of the graphs (counter)
let graphId = 0;

// ID of the divs where the graphs are
let graphDivs = new Array();

// Options specific to a graph. key = graphID (Data + other options)
let graphOptions = new Object();

queue()
    .defer(d3.json, dataFolder + "factice/hist.json")
    .await(main);

function main(error, histograms) {
    histData = histograms;

    update_info();

    // DEBUG
    graphOptions['graph0'] = {'data': histData['tt'], 'type': 'histogram', 'xAxis': 'Travel Time [s]'};
    drawGraph('graph0');
}

function fetchDataAndDraw() {

    // Replace later with get the data
    prepareData();

    graphDivs.forEach(id => {

        console.log(id);

        const divTypes = document.getElementById(id + '_type');

        const type = divTypes.options[divTypes.selectedIndex].value;

        if (type == "TT") {
            console.log("Drawing TT graph");

            graphOptions[id] = {'data': histData['tt'], 'type': 'histogram', 'xAxis': 'Travel Time [s]'};

            drawGraph(id);
        } else if (type == "speed") {
            console.log("Drawing Speed histogram");

            graphOptions[id] = {'data': histData['density'], 'type': 'histogram', 'xAxis': 'Speed [m/s]'};

            drawGraph(id);
        } else if (type == "OD") {
            console.log("Drawing OD chord diagram")
        }

    });

    //drawTT(hist['tt']);
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