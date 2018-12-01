let pedMover;
let currentTimeShownIdx = 0;
let INTERVAL2D = 100;
let SPEEDFACTOR = 1;
let paused = false;

function prepViz2D(xmin, xmax, ymin, ymax) {

    const margin = 0.01*(xmax-xmin);
    const ratio = (ymax-ymin)/(xmax-xmin);
    const pixelWidth = 900;


    let svg = d3.select("#viz")
        .append("svg")
        .attr("class", "container-fluid")
        .attr("id", "svgCont")
        .attr("height", vizHeight)
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
    drawStructures(structure_layer);

    appendOptions();

}

function runViz2D() {
    //Pedestrians
    runAnimation(d3.select(".voronoi_poly_layer"), d3.select(".pedes_layer"));
}

function updateTimer(time) {
    document.getElementById("timer").innerHTML = secondsToHms(time);

    slider.noUiSlider.setHandle(1, time, true);

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
                .datum(newData)
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

// Faster and Slower buttons
$( "#forward" ).click(function() {

    clearInterval(pedMover);
    SPEEDFACTOR *= 2;

    if (SPEEDFACTOR < 1) {
        const frac = math.fraction(SPEEDFACTOR);
        document.getElementById("speed").innerHTML = "&#215;" + frac.n + "/" + frac.d;
    } else {
        document.getElementById("speed").innerHTML = "&#215;" + SPEEDFACTOR;
    }

    if (!paused) {
        runViz2D();
    }});

$( "#backward" ).click(function() {

    clearInterval(pedMover);
    SPEEDFACTOR /= 2;

    if (SPEEDFACTOR < 1) {
        const frac = math.fraction(SPEEDFACTOR);
        document.getElementById("speed").innerHTML = "&#215;" + frac.n + "/" + frac.d;
    } else {
        document.getElementById("speed").innerHTML = "&#215;" + SPEEDFACTOR;
    }

    if (!paused) {
        runViz2D();
    }
});

$( "#playPauseButton" ).click(function() {

    if (paused) {
        runViz2D(selectedTraj.tmin, selectedTraj.tmax);
        document.getElementById("playPauseButton").innerHTML = "<i class=\"fas fa-pause fa-lg\"></i>";
        paused = false;
    } else {
        clearInterval(pedMover);
        document.getElementById("playPauseButton").innerHTML = "<i class=\"fas fa-play fa-lg\"></i>";
        paused = true;
    }

});

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    let hDisplay = h;
    if (h < 10) {
        hDisplay = "0" + hDisplay;
    }

    let mDisplay = m;
    if (m < 10) {
        mDisplay = "0" + mDisplay;
    }

    let sDisplay = s;
    if (s < 10) {
        sDisplay = "0" + sDisplay;
    }
    return hDisplay + ":" + mDisplay + ":" + sDisplay;
}

function changeTimes(times) {

    const tmin = times[0].split(':').reduce((acc,time) => (60 * acc) + +time);
    const current = times[1].split(':').reduce((acc,time) => (60 * acc) + +time);
    const tmax = times[2].split(':').reduce((acc,time) => (60 * acc) + +time);

    let nbrIdx = parseInt(10*(tmin-minTime));
    
    currentTimeShownIdx -= nbrIdx;

    minTime = tmin;
    maxTime = tmax;

    console.log(currentTimeShownIdx);
    currentTimeShownIdx = parseInt(10*(current-minTime));
    console.log(currentTimeShownIdx);

    if (!paused) {
        clearInterval(pedMover);
        runViz2D();
    }
}

