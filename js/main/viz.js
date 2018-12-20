

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
            scene.background = new THREE.Color(0xf7f4ea);

            light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
            light.position.set( 0, wallHeight, 0 );
            light.castShadow = true;
            scene.add( light );

        } else if (STYLE == "TWD") {
            scene.background = new THREE.Color(0x00000);

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

    } else {

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
        let trajectories_layer = svg_zoom.append("g")
            .attr("class", "trajectories_layer");

        // Read json data and draw frameworks (walls and zones)

        drawStructures(structure_layer);

        let viewBox = svg.attr("viewBox").split(" ").map(d => Number(d));
        let padding = 1;
        let r = [1/10, 1/7];


        let los_colors = ["rgb(255,0,0)","rgb(255,128,0)","rgb(255,255,0)","rgb(0,255,0)","rgb(0,255,255)","rgb(0,0,255)"];
        let boundaries = ["∞", 2.17, 1.08, 0.72, 0.43, 0.31, 0];
        drawColorbar("colorbar", svg, d3.schemeRdYlGn[10], [0,2], viewBox[2]-(viewBox[2]-viewBox[0])*r[0],
            viewBox[3]-5, (viewBox[2]-viewBox[0])*r[0], 5, padding, "Speed [m/s]");
        drawColorbar("voronoi-los", svg, los_colors, boundaries, viewBox[2]-(viewBox[2]-viewBox[0])*(r[1]+r[0])-3*padding, viewBox[3]-5, (viewBox[2]-viewBox[0])*r[1], 5, padding, "Level of service [ped/m^2]");


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
    } else  {
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

    if (selectedTraj == null) {
        document.getElementById("timer").innerHTML = "No trajectory data!";
    } else {
        document.getElementById("timer").innerHTML = secondsToHms(time);
    }

    slider.noUiSlider.setHandle(1, time, true);

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

function transitionBetween2D3D() {

    if (!changeVizButtonDisabled) {

        changeVizButtonDisabled = true;

        setTimeout(function() {
            changeVizButtonDisabled = false;
        }, 1000);

        $("#dragOpt").remove();
        document.getElementById("optionsButton").style.display = "";
        optionsShown = false;

        if(viz3D) {

            document.getElementById("changeVizButton").innerHTML = "<i class=\"fas fa-cube fa-lg\"></i>";
            document.getElementById("changeVizButton").title = "3D viz";

            document.getElementById("help").title = "Scroll for zoom/dezoom; Click + Mouse to move around; Click on a zone to select it as an origin and ctrl+click to select it as a destination."

            viz3D = false;

            clearInterval(pedMover);

            deleteStuff3D();

            if (SPEEDFACTOR <= 2) {
                currentTimeShownIdx = Math.floor(currentTimeShownIdx/(INTERP+1));
            }


        } else {

            document.getElementById("changeVizButton").innerHTML = "<i class=\"fas fa-square fa-lg\"></i>";
            document.getElementById("changeVizButton").title = "2D viz";

            document.getElementById("help").title = "Scroll for zoom/dezoom; CTRL+Mouse/Arrow keys to more; Mouse to rotate."

            viz3D = true;

            clearInterval(pedMover);

            deleteStuff2D();

            if (SPEEDFACTOR <= 2) {
                currentTimeShownIdx *= (INTERP+1);
            }

        }

        prepViz();

        if(vizPaused) {
            do1Step();
        } else {
            runViz();
        }
    }
}

function deleteStuff2D() {
    $("#svgCont").remove();

    if (statsShown) {
        viz.classList.add("col");
        viz.classList.remove("col-xl-8");

        $('#statDiv').remove();
    }
}

function loading() {

    if (!presentationPlaying) {
        let timer = document.getElementById("timer");
        timer.innerHTML = "LOADING";

        keepFading($("#timer"));
    }
}



function finishedLoading() {

    $("#timer").stop(true, true);

    document.getElementById("timer").innerHTML = "0 [s.]";
    document.getElementById("timer").style.opacity = "1";
    document.getElementById("timer").style.display = "";

}

function createSlider() {

    slider = document.getElementById('slider');

    try {
        slider.noUiSlider.destroy();
    } catch (e) {
        // Do nothing
    };

    noUiSlider.create(slider, {
        start: [selectedTraj.tmin, selectedTraj.tmin, selectedTraj.tmax],
        connect: [false, true, true, false],
        range: {
            'min': selectedTraj.tmin,
            'max': selectedTraj.tmax
        },
        tooltips: [true, false, true],
        format: {
            to: secondsToHmss,
            from: Number
        }
    }, true);

    slider.noUiSlider.on('slide', function () {

        let times = slider.noUiSlider.get();

        changeTimes(times);
    });


    let handles = slider.querySelectorAll('.noUi-handle');
    handles[0].classList.add('outer');
    handles[1].classList.add('inner');
    handles[2].classList.add('outer');

    //let origins = slider.getElementsByClassName('noUi-origin');
    //origins[1].setAttribute('disabled', true);
}

function appendOptions() {

    let file;

    if (viz3D) {
        file = './assets/templates/options3D.html';
    } else {
        file = './assets/templates/options2D.html';
    }

    $.get(file, function(opts) {
        var rendered = Mustache.render(opts);

        $('#viz').append(rendered);

        document.getElementById("dragOpt").style.display = "none";

        document.getElementById("dragOpt").style.top = 0 + "px";
        document.getElementById("dragOpt").style.left = 0 + "px";

        $( function() {
            $( "#dragOpt" ).draggable(
                {
                    containment: $( "body" ),
                    start: function() {
                        if (viz3D) {
                            controls.enabled = false;
                        }
                    },
                    stop: function() {
                        if (viz3D) {
                            controls.enabled = true;
                        }
                    },
                });
        } );

        if (!viz3D) {
            document.getElementById("voronoi_checkbox").disabled = true;

            if (!allTrajLoaded) {
                document.getElementById("all_trajectories_checkbox").disabled = true;
            }

            if (selectedTraj == null) {
                document.getElementById("optTraj").style.display = "none";

            }

            $( "#optionsStatsButton" ).click(function() {

                if(document.getElementById("optODChord").style.display === "") {

                    document.getElementById("optionsStatsButton").innerHTML = "<i class=\"fas fa-plus fa-lg\"></i>";

                    document.getElementById("optODChord").style.display = "none";
                    document.getElementById("opt_tt").style.display = "none";
                    document.getElementById("opt_density").style.display = "none";
                } else {

                    document.getElementById("optionsStatsButton").innerHTML = "<i class=\"fas fa-minus fa-lg\"></i>"

                    document.getElementById("optODChord").style.display = "";
                    document.getElementById("opt_tt").style.display = "";
                    document.getElementById("opt_density").style.display = "";
                }
            });
        }

        if (viz3D && STYLE == "TWD") {

            document.getElementById("changeStyle").checked = true;
        }

    });


}

function resizeViz() {

    document.getElementById("mainViz").style.height = 0 + "px";

    vizHeight = getVizHeight();

    document.getElementById("mainViz").style.height = vizHeight + "px";
    if (vizPrepared) {
        if (viz3D) {

            let width = document.body.clientWidth;

            camera.aspect = width / vizHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(width, vizHeight);

            //document.getElementById("canvas").height = vizHeight + "px";
            //document.getElementById("canvas").width = window.innerWidth + "px";
        } else {
            document.getElementById("svgCont").style.height = vizHeight + "px";
        }
    }

    $('html,body').scrollTop(0);

    if (statsShown) {

        if (window.innerWidth >= 1200) {
            $('body').css("overflow-y", "hidden");
            document.getElementById("statDiv").style.overflowY = 'auto';
        } else {
            $('body').css("overflow-y", "auto");
            document.getElementById("statDiv").style.overflowY = 'hidden';
        }
    } else {
        $('body').css("overflow-y", "hidden");
    }
}

