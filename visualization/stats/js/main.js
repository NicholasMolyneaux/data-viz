function prepareChord() {

    // canvas size and chord diagram radii
    const size = 900;

    const svg = d3.select("#viz_OD").append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `${-size/2} ${-size/2} ${size} ${size}`)
        .attr("id", "svgViz_OD")
        .append("svg:g")
        .attr("id", "circle");


    //dynamicChord(data, {});
    const getVisibleName = getVisibleNameMapping({});
    chordKeysOriginalData = Array.from(new Set(trajSummary.map(v => getVisibleName(v.o)).concat(trajSummary.map(v => getVisibleName(v.d)))));
    currentLabels = chordKeysOriginalData.slice();
    staticChord(trajSummary, getVisibleName, chordKeysOriginalData);
}

function addHistograms() {

    $.get('visualization/stats/templates/graph.mst', function(graph) {
        var rendered = Mustache.render(graph, {id: 'tt'});
        $('#TTContainer').append(rendered);
    }).then(() => {
        graphOptions['tt'] = {'data': histTT, 'xAxis': 'Travel Time [s]'};

        drawGraph('tt');
    });



    $.get('visualization/stats/templates/graph.mst', function(graph) {
        var rendered = Mustache.render(graph, {id: 'density'});
        $('#densityContainer').append(rendered);
    }).then(() => {

        graphOptions['density'] = {'data': histDensity, 'xAxis': 'Ped/m^2 [m^-2]'};

        drawGraph('density');
    });

}

function reDrawHist() {
    reDrawHistTT();
    reDrawHistDensity();
}

function reDrawHistTT() {
    prepareHistTT();
    graphOptions['tt']['data'] = histTT;
    hist('tt', 'start');
}

function reDrawHistDensity() {
    prepareHistDensity();

    graphOptions['density']['data'] = histDensity;
    hist('density', 'start');
}