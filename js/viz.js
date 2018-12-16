// General global parameters
let pedMover;
let currentTimeShownIdx = 0;
const INTERVAL2D = 100;
let SPEEDFACTOR = 1;
let paused = false;
let threeDButtonDisabled = false;

function prepViz(change3DStyle=false) {

    if (viz3D) {

        container = document.getElementById("viz");

        // Set Camera position
        camera = new THREE.PerspectiveCamera( 45, document.body.clientWidth / vizHeight, 0.1, 1000 );
        camera.position.set( cameraInitPos[0], cameraInitPos[1], cameraInitPos[2]);

        // Set the controls
        controls = new THREE.OrbitControls( camera, container );
        controls.target.set( 0,0,0 );

        controls.update();

        // New scene
        scene = new THREE.Scene();
        camera.lookAt(scene.position);

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

        resizeViz();

        renderer.render( scene, camera );

        // Mouse stuff

        const canvas = document.getElementById("canvas");

        canvas.addEventListener("mouseover", () => {
            document.addEventListener('keypress', onKeyPress, false);
            document.addEventListener( 'mousemove', onDocumentMouseMove, false);
            document.addEventListener( 'mousedown', onDocumentMouseDown, false);

        });


        canvas.addEventListener("mouseout",function() {
            document.removeEventListener("keypress", onKeyPress, false);
            document.removeEventListener( 'mousemove', onDocumentMouseMove, false);
            document.removeEventListener( 'mousedown', onDocumentMouseDown, false);
        });

        animate();

    } else if (viz2D) {

        cancelAnimationFrame(animation);

        const xmin = selectedInfra.xmin,
            xmax = selectedInfra.xmax,
            ymin = selectedInfra.ymin,
            ymax = selectedInfra.ymax;

        let svg = d3.select("#viz")
            .append("svg")
            .attr("class", "container-fluid")
            .attr("id", "svgCont")
            .attr("height", vizHeight)
            .attr("viewBox", `${xmin-1} ${ymin} ${xmax} ${ymax+10}`);
        let svg_zoom = svg.append('g')
            .attr("id", "subSvgCont");

        svg.call(d3.zoom().on("zoom", () => {
            console.log("hello");
            svg_zoom.attr("transform", d3.event.transform);
            }
        ));



        document.getElementById("mainViz").style.height = 0 + "px";

        vizHeight = getVizHeight();

        document.getElementById("mainViz").style.height = vizHeight + "px";

        document.getElementById("svgCont").style.height = vizHeight + "px";

        let structure_layer = svg_zoom.append("g")
            .attr("class", "structure_layer");

        let voronoi_clip_layer = svg_zoom.append("g")
            .attr("class", "voronoi_clip_layer");
        let voronoi_canvas = svg_zoom.append("g")
            .attr("class", "voronoi_canvas");
        let voronoi_poly_layer = svg_zoom.append("g")
            .attr("class", "voronoi_poly_layer");
        let pedes_layer = svg_zoom.append("g")
            .attr("class", "pedes_layer");

        // layer for showing all trajectories
        let trajectories_layer = svg.append("g")
            .attr("class", "trajectories_layer");

        // Read json data and draw frameworks (walls and zones)

        drawStructures(structure_layer);

        let viewBox = svg.attr("viewBox").split(" ").map(d => Number(d));
        let padding = 1;
        let r = [1/10, 1/7];


        let los_colors = ["rgb(255,0,0)","rgb(255,128,0)","rgb(255,255,0)","rgb(0,255,0)","rgb(0,255,255)","rgb(0,0,255)"];
        let boundaries = [0, 0.46, 0.93, 1.39, 2.32, 3.24, "∞"];
        drawColorbar("colorbar", svg, d3.schemeRdYlGn[10], [0,2], viewBox[2]-(viewBox[2]-viewBox[0])*r[0],
            viewBox[3]-5, (viewBox[2]-viewBox[0])*r[0], 5, padding, "Speed [m/s]");
        drawColorbar("voronoi-los", svg, los_colors, boundaries, viewBox[2]-(viewBox[2]-viewBox[0])*(r[1]+r[0])-3*padding, viewBox[3]-5, (viewBox[2]-viewBox[0])*r[1], 5, padding, "Level of service [m^2/ped]");


        //drawColorbar("", svg, los_colors, boundaries, );
        //drawLOSColorbar(svg);
        prepareDensityData();
    }

    if (!change3DStyle) {
        appendOptions();
    }

    resizeViz();
    vizPrepared = true;
}

function runViz() {

    if (viz3D) {
        runAnimation3D();
    } else if (viz2D)  {
        //Pedestrians
        runAnimation2D();
    }
}

function do1Step() {
    if (viz3D) {
        runOneStep3D();
    } else if (viz2D) {
        runOneStep2D();
    }
}

function updateTimer(time) {
    document.getElementById("timer").innerHTML = secondsToHms(time);

    slider.noUiSlider.setHandle(1, time, true);

}

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



// Options specific to a graph. key = graphID (Data + other options)
let graphOptions = new Object();

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

        if (!vizPaused) {
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

        if (!vizPaused) {
            runViz();
        }
    }

});

$( "#playPauseButton" ).click(function() {

    if (vizPaused) {
        runViz();
        document.getElementById("playPauseButton").innerHTML = "<i class=\"fas fa-pause fa-lg\"></i>";
        vizPaused = false;
    } else {
        clearInterval(pedMover);
        document.getElementById("playPauseButton").innerHTML = "<i class=\"fas fa-play fa-lg\"></i>";
        vizPaused = true;
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

    currentTimeShownIdx -= nbrIdx;

    let middleChanged = false;

    if (tmin == minTime && tmax == maxTime) {
        middleChanged = true;
    }

    minTime = tmin;
    maxTime = tmax;

    currentTimeShownIdx = parseInt(mult*(current-minTime));

    if (!vizPaused) {
        clearInterval(pedMover);
        runViz();
    } else {
        do1Step();
    }

    if (statsShown && !middleChanged) {
        reDrawHist();
    }
}

$( "#threeDButton" ).click(function() {
    transitionBetween2D3D()
});

function transitionBetween2D3D() {

    if (!threeDButtonDisabled) {

        threeDButtonDisabled = true;

        setTimeout(function() {
            threeDButtonDisabled = false;
        }, 1000);

        $("#dragOpt").remove();
        document.getElementById("optionsButton").style.display = "";
        optionsShown = false;

        if(viz3D) {

            document.getElementById("threeDButton").innerHTML = "<i class=\"fas fa-cube fa-lg\"></i>";
            document.getElementById("threeDButton").title = "3D viz";

            document.getElementById("help").title = "Scroll for zoom/dezoom; Click + Mouse to move around; Click on a zone to select it as an origin and ctrl+click to select it as a destination."

            viz3D = false;
            viz2D = true;

            clearInterval(pedMover);

            $("#canvas").remove();

            deleteStuff3D();

            if (SPEEDFACTOR <= 2) {
                currentTimeShownIdx = Math.floor(currentTimeShownIdx/(INTERP+1));
            }


        } else if (viz2D) {

            document.getElementById("threeDButton").innerHTML = "<i class=\"fas fa-square fa-lg\"></i>";
            document.getElementById("threeDButton").title = "2D viz";

            document.getElementById("help").title = "Scroll for zoom/dezoom; CTRL+Mouse/Arrow keys to more; Mouse to rotate."

            viz3D = true;
            viz2D = false;

            clearInterval(pedMover);

            deleteStuff2D();

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
    }
}

function deleteStuff3D() {
    // Have to delete correctly these stuff.
    topFloor = null;
    bottomFloor = null;
    ceiling = null;
    walls = [];
    clocks = [];
    lights = [];

    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    dctPed = new Object();
    mixers = [];
}

function deleteStuff2D() {
    $("#svgCont").remove();

    if (statsShown) {
        viz.classList.add("col");
        viz.classList.remove("col-xl-8");

        $('#statDiv').remove();
    }
}

function changeStyle3D() {

    cancelAnimationFrame(animation);

    clearInterval(pedMover);

    if (STYLE == "TWD") {
        STYLE = "normal";
    } else {
        STYLE = "TWD";
    }

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

    // TODO: Delete correctly the pedestrians!!!

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

    prepViz(true);

    if (!presentationPlaying) {
        if(vizPaused) {
            do1Step();
        } else {
            runViz();
        }
    }
}

