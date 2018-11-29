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

function prepareTrajectories(infra, xmin, xmax, ymin, ymax) {

    // canvas size and chord diagram radii
    const size = 700;

    var width = $("#ODCont").width();

   /* const svg = d3.select("#trajectoriesOverlay").append("svg")
        .attr("id", "containerForOD")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `${-size/2} ${-size/2} ${size} ${size}`)
        .append("svg:g");*/

    const margin = 0.01*(xmax-xmin);
    const ratio = (ymax-ymin)/(xmax-xmin);
    const pixelWidth = 900;

    let svg = d3.select("#trajectoriesOverlay")
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

    drawStructures("http://transporsrv2.epfl.ch/api/infra/", infra, structure_layer);

    async function plotData(data) {

        var line = d3.line()
            .x(function(d, i) { return d.x; })
            .y(function(d, i) { return d.y; })
            .curve(d3.curveMonotoneX);

        async function drawPath(traj) {
            const newData = [];
            for (i = 0; i < traj.x.length; i++) {newData.push({"x": traj.x[i], "y": traj.y[i]})}
            structure_layer.append("path")
                .datum(newData,)
                .attr("class", "the-walls")
                .attr("stroke-opacity", 0.1)
                .attr("d", line);
            return new Promise((resolve) => {
                //data.forEach(traj => drawPath(traj));
                setTimeout(resolve, 100);
            });
        }

        for (lineData of data) {
            await drawPath(lineData);
        }
        //data.forEach(traj => drawPath(traj));

        return new Promise((resolve) => {
            //data.forEach(traj => drawPath(traj));
            setTimeout(resolve, 100);
        });
    }

    const pedIds = fetch('http://transporsrv2.epfl.ch/api/idlist/lausanne/samplenostrategies').then(r => r.json());
    pedIds.then(ids => {
        const chunk = 75;
        const urls = [];
        for (i=0, j=ids.length; i<j; i+=chunk) {
            temparray = ids.slice(i,i+chunk);
            urls.push("http://transporsrv2.epfl.ch/api/trajectoriesbyid/lausanne/samplenostrategies" + "/" + temparray)
        }

    const allData = fetch(urls[0])
        .then(r => {return r.json()})
        .then(d => { return customStreaming(urls.slice(1), plotData, d); });

        console.log(allData);
        allData.then(d => console.log(d));
    });


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



