function prepViz2D(infra, xmin, xmax, ymin, ymax) {

    const margin = 0.01*(xmax-xmin);
    const ratio = (ymax-ymin)/(xmax-xmin);
    const pixelWidth = 900;

    let svg = d3.select("#viz")
        .append("svg")
        .attr("class", "container")
        .attr("id", "svgCont")
        .attr("width", pixelWidth)
        .attr("height", parseInt(ratio * pixelWidth))
        //.attr("width", pixelWidth)
        //.attr("height", (ratio * pixelWidth))
        .attr("viewBox", `${xmin-1} ${ymin} ${xmax} ${ymax}`)
        .call(d3.zoom().on("zoom", () => svg.attr("transform", d3.event.transform)))
        .append('g')
        .attr("id", "subSvgCont");

    let structure_layer = svg.append("g")
        .attr("class", "structure_layer");

    let voronoi_poly_layer = svg.append("g")
        .attr("class", "voronoi_poly_layer");
    let voronoi_clip_layer = svg.append("g")
        .attr("class", "voronoi_clip_layer");
    let pedes_layer = svg.append("g")
        .attr("class", "pedes_layer");

    // Read json data and draw frameworks (walls and zones)
    drawStructures("http://transporsrv2.epfl.ch/api/infra/", infra, structure_layer);

    appendOptions();

}



function runViz2D(data, tmin, tmax) {


    //Pedestrians
    runAnimation(data, d3.select(".voronoi_poly_layer"), d3.select(".pedes_layer"), tmin, tmax);
}

function prepareChord(data) {

    // canvas size and chord diagram radii
    const size = 700;

    var width = $("#ODCont").width();

    const svg = d3.select("#ODCont").append("svg")
        .attr("id", "containerForOD")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `${-size/2} ${-size/2} ${size} ${size}`)
        .append("svg:g")
        .attr("id", "circle");

    dynamicChord(data);
}

function prepareTrajectories() {

    // canvas size and chord diagram radii
    const size = 700;

    var width = $("#ODCont").width();

    const svg = d3.select("#trajectoriesOverlay").append("svg")
        .attr("id", "containerForOD")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `${-size/2} ${-size/2} ${size} ${size}`)
        .append("svg:g");

    const urls = ['http://transporsrv2.epfl.ch/api/trajectoriesbytime/lausanne/samplenostrategies',
        'http://transporsrv2.epfl.ch/api/trajectoriesbytime/lausanne/samplenostrategies',
        'http://transporsrv2.epfl.ch/api/trajectoriesbytime/lausanne/samplenostrategies'];

    function plotData(data){
        return new Promise(r => {
            setTimeout(r, 3000);
        })
    }

    const data = customStreaming(urls, plotData);
    //data.then(d => console.log(d));
}

// Options specific to a graph. key = graphID (Data + other options)
let graphOptions = new Object();

function addHistograms(hist) {

    $.get('visualization/stats/templates/graph.mst', function(graph) {
        var rendered = Mustache.render(graph, {id: 'tt'});
        $('#TTContainer').append(rendered);
    }).then(() => {
        graphOptions['tt'] = {'data': hist['tt'], 'xAxis': 'Travel Time [s]'};

        drawGraph('tt');
    });



    $.get('visualization/stats/templates/graph.mst', function(graph) {
        var rendered = Mustache.render(graph, {id: 'speed'});
        $('#speedContainer').append(rendered);
    }).then(() => {

        graphOptions['speed'] = {'data': hist['density'], 'xAxis': 'Speed [m/s]'};

        drawGraph('speed');

    });

}



