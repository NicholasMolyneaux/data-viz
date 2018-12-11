// General global parameters
let pedMover;
let currentTimeShownIdx = 0;
const INTERVAL2D = 100;
let SPEEDFACTOR = 1;
let paused = false;

function prepViz() {

    console.log(viz3D);

    if (viz3D) {

        container = document.getElementById("viz");

        // Set Camera position
        camera = new THREE.PerspectiveCamera( 45, document.body.clientWidth / vizHeight, 0.1, 2000 );
        camera.position.set( -42.39557080736188, 67.12576960977573, 69.11641657512034);

        // Set the controls
        controls = new THREE.OrbitControls( camera, container );
        controls.target.set( 0,0,0 );
        controls.update();

        // New scene
        scene = new THREE.Scene();
        camera.lookAt(scene.position);

        console.log(walls);

        // If walls are not built, build them!
        buildWalls(wallsData);

        // Load pedestrians
        //interpolateAndAnimate(trajData);

        // Load one pedestrian (DEBUG PURPOSE)
        //loadMinecraft();

        // Load one zombie (DEBUG PURPOSE)
        //loadZombie();

        // Add axes (DEBUG PURPOSE)
        //var worldAxis = new THREE.AxesHelper(20);
        //scene.add(worldAxis);

        // Light
        if (STYLE == "normal") {
            scene.background = new THREE.Color(0xffffff);

            light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
            light.position.set( 0, wallHeight, 0 );
            light.castShadow = true;
            scene.add( light );

        } else if (STYLE == "TWD") {
            scene.background = new THREE.Color(0x000000);

            light = new THREE.HemisphereLight( 0xffffff, 0x444422, 0.02 );
            light.position.set( 0, wallHeight, 0 );
            light.castShadow = true;
            scene.add( light );

            addTWDLights(scene, zonesData);
        }


        raycaster = new THREE.Raycaster();

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );

        renderer.setSize(document.body.clientWidth, vizHeight);
        renderer.gammaOutput = true;
        renderer.domElement.id = 'canvas';
        container.appendChild( renderer.domElement );

        // stats (DEBUG)
        // stats = new Stats();
        // container.appendChild( stats.dom );

        // Mouse stuff
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mousedown', onDocumentMouseDown, false );

        // Key stuff
        document.addEventListener( 'keypress', onKeyPress, false);

        resizeViz();

        renderer.render( scene, camera );
        animate();

    } else {

        const xmin = selectedInfra.xmin,
            xmax = selectedInfra.xmax,
            ymin = selectedInfra.ymin,
            ymax = selectedInfra.ymax;

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

        document.getElementById("mainViz").style.height = 0 + "px";

        vizHeight = $('.footer').offset().top - $('#viz').offset().top;

        document.getElementById("mainViz").style.height = vizHeight + "px";

        document.getElementById("svgCont").style.height = vizHeight + "px";

        let structure_layer = svg.append("g")
            .attr("class", "structure_layer");

        let voronoi_clip_layer = svg.append("g")
            .attr("class", "voronoi_clip_layer");
        let voronoi_canvas = svg.append("g")
            .attr("class", "voronoi_canvas");
        let voronoi_poly_layer = svg.append("g")
            .attr("class", "voronoi_poly_layer");
        let pedes_layer = svg.append("g")
            .attr("class", "pedes_layer");

        // Read json data and draw frameworks (walls and zones)
        drawStructures(structure_layer);
    }

    appendOptions();

}

function runViz() {

    if (viz3D) {
        runAnimation3D();

    } else {
        //Pedestrians
        runAnimation2D();

    }
}

function do1Step() {
    if (viz3D) {
        runOneStep3D();
    } else {
        runOneStep2D();
    }
}

function updateTimer(time) {
    document.getElementById("timer").innerHTML = secondsToHms(time);

    slider.noUiSlider.setHandle(1, time, true);

}

function prepareChord(data) {

    // canvas size and chord diagram radii
    const size = 900;

    //var width = $("#ODCont").width();

    const svg = d3.select("#ODCont").append("svg")
        .attr("id", "containerForOD")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `${-size/2} ${-size/2} ${size} ${size}`)
        .append("svg:g")
        .attr("id", "circle");


    //dynamicChord(data, {});
    const getVisibleName = getVisibleNameMapping({});
    console.log(getVisibleName);
    chordKeysOriginalData = Array.from(new Set(data.map(v => getVisibleName(v.o)).concat(data.map(v => getVisibleName(v.d)))));
    currentLabels = chordKeysOriginalData.slice();
    staticChord(data, getVisibleName, chordKeysOriginalData);
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

    if (SPEEDFACTOR <= 16) {
        clearInterval(pedMover);

        if (viz3D & SPEEDFACTOR == 2) {
            currentTimeShownIdx = Math.round(currentTimeShownIdx/(INTERP+1));
        }

        SPEEDFACTOR *= 2;

        if (SPEEDFACTOR < 1) {
            const frac = math.fraction(SPEEDFACTOR);
            document.getElementById("speed").innerHTML = "&#215;" + frac.n + "/" + frac.d;
        } else {
            document.getElementById("speed").innerHTML = "&#215;" + SPEEDFACTOR;
        }

        if (!paused) {
            runViz();
        }
    }
});

$( "#backward" ).click(function() {

    if (SPEEDFACTOR >= 0.25) {
        clearInterval(pedMover);

        if (viz3D & SPEEDFACTOR == 4) {
            currentTimeShownIdx = currentTimeShownIdx*(INTERP+1);
        }


        SPEEDFACTOR /= 2;

        if (SPEEDFACTOR < 1) {
            const frac = math.fraction(SPEEDFACTOR);
            document.getElementById("speed").innerHTML = "&#215;" + frac.n + "/" + frac.d;
        } else {
            document.getElementById("speed").innerHTML = "&#215;" + SPEEDFACTOR;
        }

        if (!paused) {
            runViz();
        }
    }

});

$( "#playPauseButton" ).click(function() {

    if (paused) {
        runViz();
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

    let mult = 10;

    if (viz3D & SPEEDFACTOR <= 2) {
        mult *= (INTERP+1);
    }

    let nbrIdx = parseInt(mult*(tmin-minTime));

    console.log(nbrIdx);

    currentTimeShownIdx -= nbrIdx;

    minTime = tmin;
    maxTime = tmax;

    currentTimeShownIdx = parseInt(mult*(current-minTime));

    if (!paused) {
        clearInterval(pedMover);
        runViz();
    } else {
        do1Step();
    }
}

$( "#threeDButton" ).click(function() {

    $("#dragOpt").remove();
    document.getElementById("optionsButton").innerHTML = "<i class=\"fas fa-plus fa-lg\"></i>";
    optionsShown = false;


    if(viz3D) {

        document.getElementById("threeDButton").innerHTML = "<i class=\"fas fa-cube fa-lg\"></i>";
        document.getElementById("threeDButton").title = "3D viz";

        document.getElementById("help").title = "Scroll for zoom/dezoom; Click + Mouse to move around; Click on a zone to select it as an origin and ctrl+click to select it as a destination."

        viz3D = false;

        clearInterval(pedMover);

        $("#canvas").remove();


        // Have to delete correctly these stuff.
        topFloor = null;
        bottomFloor = null;
        ceiling = null;
        walls = [];
        clocks = [];
        lights = [];

        while(scene.children.length > 0){
            scene.remove(scene.children[0]);
        }

        controls = null;

        dctPed = new Object();
        mixers = [];

        container = null;
        stats = null;
        controls = null;
        raycaster = null;
        camera = null;
        scene = null;
        renderer = null;
        light = null;


        if (SPEEDFACTOR <= 2) {
            currentTimeShownIdx = Math.floor(currentTimeShownIdx/(INTERP+1));
        }


    } else {

        document.getElementById("threeDButton").innerHTML = "<i class=\"fas fa-square fa-lg\"></i>";
        document.getElementById("threeDButton").title = "2D viz";

        document.getElementById("help").title = "Scroll for zoom/dezoom; CTRL+Mouse/Arrow keys to more; Mouse to rotate."

        viz3D = true;

        clearInterval(pedMover);

        $("#svgCont").remove();

        if (SPEEDFACTOR <= 2) {
            currentTimeShownIdx *= (INTERP+1);
        }

    }

    prepViz();

    if(paused) {
        do1Step();
    } else {
        runViz();
    }
});

