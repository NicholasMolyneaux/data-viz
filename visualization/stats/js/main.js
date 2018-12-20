/*********************************************************/
/*                                                       */
/*   Main functions for the stats                        */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

///////////////////////////////////////////////////////////
//                                                       //
//                    Chord diagrams                     //
//                                                       //
///////////////////////////////////////////////////////////

// Options specific to a graph. key = graphID (Data + other options)
let graphOptions = new Object();

/**
* Prepare the chord diagram
*
* The goal is to pause the animation and restart it.
*/
function prepareChord() {

    // Canvas size and chord diagram radii
    const size = 900;

    // Prepare the SVG
    const svg = d3.select("#viz_OD").append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `${-size/2} ${-size/2} ${size} ${size}`)
        .attr("id", "svgViz_OD")
        .append("svg:g")
        .attr("id", "circle");

    // Mapping function
    // Defined in visualization/stats/chord/chord_functions.js
    const getVisibleName = getVisibleNameMapping({});

    // Map the origin and destinations linked to each other
    chordKeysOriginalData = Array.from(new Set(trajSummary.map(v => getVisibleName(v.o)).concat(trajSummary.map(v => getVisibleName(v.d)))));

    // Get the labels, i.e. the name of the zones
    currentLabels = chordKeysOriginalData.slice();

    // Draw the static Chord diagram
    // Defined in visualization/stats/chord/chord.js
    staticChord(trajSummary, getVisibleName, chordKeysOriginalData);
}

///////////////////////////////////////////////////////////
//                                                       //
//                      Histograms                       //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Add the histograms using mustache template files
 */
function addHistograms() {

    ///////////////////////////
    // Travel time histogram //
    ///////////////////////////

    // Get the template for the histogram
    $.get('visualization/stats/templates/graph.mst', function(graph) {
        // Render it, adding it an id
        var rendered = Mustache.render(graph, {id: 'tt'});

        // Add the rendered HTML in the corresponding container
        $('#TTContainer').append(rendered);
    }).then(() => {
        // Setup the options of the graph
        graphOptions['tt'] = {'data': histTT, 'xAxis': 'Travel Time [s]'};

        // Draw the graph
        drawGraph('tt');
    });

    ///////////////////////
    // Density histogram //
    ///////////////////////

    // Get the template for the histogram
    $.get('visualization/stats/templates/graph.mst', function(graph) {
        // Render it, adding it an id
        var rendered = Mustache.render(graph, {id: 'density'});

        // Add the rendered HTML in the corresponding container
        $('#densityContainer').append(rendered);
    }).then(() => {
        // Setup the options of the graph
        graphOptions['density'] = {'data': histDensity, 'xAxis': 'Ped/m^2 [m^-2]'};

        // Draw the graph
        // Defined in visualization/stats/js/hist/graph.js
        drawGraph('density');
    });

}

/**
 * Redraw both histograms
 *
 * Functions defined below
 */
function reDrawHist() {
    reDrawHistTT();
    reDrawHistDensity();
}

/**
 * Redraw travel time histogram
 */
function reDrawHistTT() {
    // Prepare the data
    // Defined in js/main/data.js
    prepareHistTT();

    // Update the data in the options
    graphOptions['tt']['data'] = histTT;

    // Draw the histogram
    // Defined in visualization/stats/js/hist/graph.js
    hist('tt', 'start');
}

/**
 * Redraw density histogram
 */
function reDrawHistDensity() {
    // Prepare the data
    // Defined in js/main/data.js
    prepareHistDensity();

    // Update the data in the options
    graphOptions['density']['data'] = histDensity;

    // Draw the histogram
    // Defined in visualization/stats/js/hist/graph.js
    hist('density', 'start');
}