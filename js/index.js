const baseURL = 'http://transporsrv2.epfl.ch/api/';

// indicates whether the animation is finished or not
let presentationPlaying = true;

// indicated whether the the prepViz function has already been called.
// This is needed for the skip button to determine at which stage of the animation we are
let vizPrepared = false;

// Indicator whether the viz is actually running or not. This should be changed when the play/pause button is clicked.
let vizPaused = true;

let vizHeight = getVizHeight();
let landscape = true;

let infrastructures = null;
let trajectories = null;

let selectedInfra = "lausannenew";
let selectedTraj = "test10";

let infraSelected = false;

let viz3D = false;
let trajDataLoaded = false;
let infraDataLoaded = false;

let optionsShown = false;

let slider = null;
let minTime;
let maxTime;

let timeOutPres = [];

let statsShown = false;
let allTrajLoaded = false;

$(document).ready(function() {

    // Load the infrastructures
    loadInfra();

    resizeViz();

    presentation();

    $("#fullscreen").on('click', function() {
        if(IsFullScreenCurrently())
            GoOutFullscreen();
        else
            GoInFullscreen($("#viz").get(0));
    });

});

/* INFRASTRUCTURE */

// Load the infrastructure by doing an ajax call
function loadInfra() {
    const url = baseURL + 'infralist';

    //console.log(url);

    $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        crossDomain : true,
    })
        .done(function( data ) {
            infrastructures = data;
            // Add the infra for the uploading the trajectories data
            addInfra();

            // Without animation
            /*loadInfraData().then(() => {
                prepViz();
                resizeViz();
            });*/

            infraDataLoaded = false;

            // With animation
            loadInfraData().then(() => {
                infraDataLoaded = true;
            });

            loadTraj();
        })
        .fail( function(xhr, textStatus, errorThrown) {
            alert("Error, please reload the website.");
        });
}


function addInfra() {
    //(infrastructures);

    // DEBUG
    //infrastructures = [{'name': 'infra1', 'description': 'asdasdasd'}, {'name': 'infra2', 'description': '123123'}, {'name': 'infra3', 'description': 'Lorem Ipsum'}];

    let idx = -1;

    infrastructures.forEach((infra, index) => {

        if(infra.name == selectedInfra) {
            selectedInfra = infra;
            idx = index;
        }

        $('#infraData').append($('<option>', {
            value: infra.name,
            text: infra.name
        }))
    });

    // TODO: To fix later

    document.getElementById('textDescInfra').innerHTML = infrastructures[idx]['description'];

    document.getElementById("infraData").selectedIndex = idx;
}

function updateDescriptionInfra(e) {

    const infraName = e.options[e.selectedIndex].value;

    const idx = infrastructures.map(function(e) { return e.name; }).indexOf(infraName);

    document.getElementById('textDescInfra').innerHTML = infrastructures[idx]['description'];

    if (infrastructures[idx]['description'] === "") {
        document.getElementById('textDescInfra').innerHTML = "No description";
    } else {
        document.getElementById('textDescInfra').innerHTML = infrastructures[idx]['description'];
    }

    infraSelected = true;

    const url = baseURL + 'trajlist/' + infrastructures[idx]['name'];

    // We will have to take into account the infra.

    $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        crossDomain : true,
    })
        .done(function( data ) {
            console.log(data);
            trajectories = data;
            //console.log(trajectories);
            // DEBUG
            addTraj();
        });

}

/* TRAJECTORIES */

function loadTraj() {

    infraSelected = true;

    const url = baseURL + 'trajlist/' + selectedInfra['name'];

    // We will have to take into account the infra.

    $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        crossDomain : true,
    })
        .done(function( data ) {
            trajectories = data;
            //console.log(trajectories);
            // DEBUG
            addTraj();

            // With animation
            loadTrajData().then(() => {
                minTime = selectedTraj.tmin;
                maxTime = selectedTraj.tmax;
                trajDataLoaded = true;

                prepareHistTT();
                interPolateData();
                createSlider();
                downSampleTrajectories();

                if (!presentationPlaying) {
                    finishedLoading();
                    runViz();
                } else {
                    document.getElementById("skipPresentation").style.display = "";
                }
            });
        })
        .fail( function(xhr, textStatus, errorThrown) {
            alert("Error, please reload the website.");
        });

}

function loading() {

    if (!presentationPlaying) {
        let timer = document.getElementById("timer");
        timer.innerHTML = "LOADING";

        keepFading($("#timer"));
    }
}

function keepFading($obj) {
    if (!trajDataLoaded) {
        $obj.fadeToggle(1000, function () {
            keepFading($obj)
        });
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

function addTraj() {
    //console.log(trajectories);

    // Remove all options
    $('#trajData').children('option').remove();

    let idx = -1;

    $('#trajData').append($('<option>', {
        value: "None",
        text: "No trajectory data"
    }))

    trajectories.forEach((traj, index) => {

        if (presentationPlaying) {
            if(traj.name == selectedTraj) {
                selectedTraj = traj;
                idx = index;
            }
        }

        $('#trajData').append($('<option>', {
            value: traj.name,
            text: traj.name
        }))
    });

    if (idx > -1) {

        if(trajectories[idx]['description'] == "") {
            document.getElementById('textDescTraj').innerHTML = "No description";
        } else {
            document.getElementById('textDescTraj').innerHTML = trajectories[idx]['description'];
        }

        document.getElementById("trajData").selectedIndex = idx+1;
    } else {
        document.getElementById('textDescTraj').innerHTML = "Only show the structure";

        document.getElementById("trajData").selectedIndex = 0;
    }

}

function dataSelected() {

    trajDataLoaded = false;

    $("#dragOpt").remove();
    document.getElementById("optionsButton").style.display = "";
    optionsShown = false;

    if (statsShown) {
        viz.classList.add("col");
        viz.classList.remove("col-xl-8");

        $('#statDiv').remove();

        $('body').css("overflow-y", "hidden");

        statsShown = false;
    }

    console.log(selectedInfra, selectedTraj);

    clearInterval(pedMover);
    document.getElementById("playPauseButton").innerHTML = "<i class=\"fas fa-play fa-lg\"></i>";
    vizPaused = true;

    // Get selected infra
    let infraData = document.getElementById("infraData");
    const infraName = infraData.options[infraData.selectedIndex].value;

    let idx = infrastructures.map(function(e) { return e.name; }).indexOf(infraName);

    selectedInfra = infrastructures[idx];

    // Get selected trajectories
    let trajData = document.getElementById("trajData");
    const trajName = trajData.options[trajData.selectedIndex].value;

    function isSelectedTraj(traj){return traj.name === trajName}

    idx = trajectories.findIndex(isSelectedTraj);

    if (idx == -1) {
        selectedTraj = null;

        minTime = 0;
        maxTime = 0;
    } else {
        selectedTraj = trajectories[idx];

        minTime = selectedTraj.tmin;
        maxTime = selectedTraj.tmax;
    }

    loading();
    document.getElementById("slider").style.visibility = "hidden";
    document.getElementById("leftButtons").style.visibility = "hidden";

    if (viz3D) {
        deleteStuff3D();
    } else {
        deleteStuff2D();
    }

    if (selectedTraj == null) {
        loadInfraData().then(() => {
            infraDataLoaded = true;

            if (selectedInfra.name === "denhaag") {
                if (viz3D) {
                    transitionBetween2D3D();
                } else {
                    prepViz();
                }
                document.getElementById("threeDButton").style.display = "none";
            } else {
                document.getElementById("threeDButton").style.display = "";

                prepViz();
            }

            trajDataLoaded = true;

            finishedLoading();
            document.getElementById("timer").innerHTML = "No trajectory data!";
        });

    } else {
        loadInfraData().then(() => {
            infraDataLoaded = true;

            document.getElementById("threeDButton").style.display = "";

            if (selectedInfra.name === "denhaag") {
                if (viz3D) {
                    viz3D = false;
                }
                document.getElementById("threeDButton").style.display = "none";
            } else {
                document.getElementById("threeDButton").style.display = "";
            }

            prepViz();

            // With animation
            loadTrajData().then(() => {
                minTime = selectedTraj.tmin;
                maxTime = selectedTraj.tmax;
                trajDataLoaded = true;

                currentTimeShownIdx = 0;

                prepareHistTT();
                prepareDensityData();
                interPolateData();
                createSlider();
                downSampleTrajectories();

                finishedLoading();
                document.getElementById("slider").style.visibility = "visible";
                document.getElementById("leftButtons").style.visibility = "visible";

                document.getElementById("playPauseButton").innerHTML = "<i class=\"fas fa-pause fa-lg\"></i>";
                vizPaused = false;

                runViz();

            });


        });

    }
}

function updateDescriptionTraj(e) {
    //console.log("updateDescriptionTraj");

    console.log(trajectories);

    //console.log(e);
    const trajName = e.options[e.selectedIndex].value;

    function isSelectedTraj(traj){return traj.name === trajName}

    const idx = trajectories.findIndex(isSelectedTraj);

    console.log(idx);

    if (idx == -1) {
        document.getElementById('textDescTraj').innerHTML = "Only show the structure";
    } else {
        if (trajectories[idx]['description'] === "") {
            document.getElementById('textDescTraj').innerHTML = "No description";
        } else {
            document.getElementById('textDescTraj').innerHTML = trajectories[idx]['description'];
        }
    }

}

/* Is currently in full screen or not */
function IsFullScreenCurrently() {
    var full_screen_element = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || null;

    // If no element is in full-screen
    if(full_screen_element === null)
        return false;
    else
        return true;
}

/* Get into full screen */
function GoInFullscreen(element) {

    if(element.requestFullscreen)
        element.requestFullscreen();
    else if(element.mozRequestFullScreen)
        element.mozRequestFullScreen();
    else if(element.webkitRequestFullscreen)
        element.webkitRequestFullscreen();
    else if(element.msRequestFullscreen)
        element.msRequestFullscreen();
}

/* Get out of full screen */
function GoOutFullscreen() {

    // Change the button

    if(document.exitFullscreen)
        document.exitFullscreen();
    else if(document.mozCancelFullScreen)
        document.mozCancelFullScreen();
    else if(document.webkitExitFullscreen)
        document.webkitExitFullscreen();
    else if(document.msExitFullscreen)
        document.msExitFullscreen();

}

$(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function() {
    if(IsFullScreenCurrently()) {
        document.getElementById("fullscreen").innerHTML = "<i class=\"fas fa-compress fa-lg\"></i>";

        const viz = document.getElementById("viz");
        viz.style.height = "100%";
        viz.style.width = "100%";
        viz.style.backgroundColor = "white";
        viz.style.padding = "0";

        if (viz3D) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

        } else {
            const svgCont = document.getElementById("svgCont");
            svgCont.style.padding = "0";
            svgCont.style.maxWidth = "100%";
            svgCont.style.height = "100%";
        }

        document.getElementById("dragOpt").style.top = 10 + "px";
        document.getElementById("dragOpt").style.left = 10 + "px";

    }
    else {
        document.getElementById("fullscreen").innerHTML = "<i class=\"fas fa-expand fa-lg\"></i>";

        $("#viz").removeAttr("style");


        if (viz3D) {
            resizeViz();

        } else {
            $("#svgCont").removeAttr("style");
        }


        document.getElementById("dragOpt").style.top = 10 + "px";
        document.getElementById("dragOpt").style.left = 10 + "px";

    }
});

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

$('#optionsButton').click(() => {

    document.getElementById("optionsButton").style.display = "none";
    document.getElementById("dragOpt").style.display = "";

    optionsShown = true;
});

function hideOptions() {

    document.getElementById("optionsButton").style.display = "";
    document.getElementById("dragOpt").style.display = "none";

    optionsShown = false;
}

window.addEventListener('resize', function(){

    resizeViz();

}, true);

function getVizHeight() {

    return window.innerHeight - 56;

}

document.getElementById("mainViz").style.height = 0 + "px";

vizHeight = getVizHeight();

document.getElementById("mainViz").style.height = vizHeight + "px";

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

function secondsToHmss(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    var ss = Math.round(10*(d - Math.floor(d)));

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
    return hDisplay + ":" + mDisplay + ":" + sDisplay + "." + ss;
}

function presentation() {

    let idTO;

    // Transition time
    const animTime = 1000;

    // Web page title The Walking Data
    let titleDiv = document.createElement("div");
    titleDiv.innerHTML = "<h1 id='titleForPres' style='display: none'>The walking data</h1>";
    titleDiv.classList.add("presentation");
    titleDiv.classList.add("presentation-title");
    document.getElementById("mainViz").appendChild(titleDiv);

    // Main text container 1
    let firstTextLine = document.createElement("div");
    firstTextLine.innerHTML = "<h2 id='textLine1' style='display: none'>Welcome to the train station of Lausanne, Switzerland</h2>";
    firstTextLine.classList.add("presentation");
    firstTextLine.classList.add("presentation-text");
    document.getElementById("mainViz").appendChild(firstTextLine);

    // Main text container 2
    let secondTextLine = document.createElement("div");
    secondTextLine.innerHTML = "<h2 id='textLine2' style='display: none'>You are here to explore the movements of pedestrians during the morning peak hour.</h2>";
    secondTextLine.classList.add("presentation");
    secondTextLine.classList.add("presentation-text");
    document.getElementById("mainViz").appendChild(secondTextLine);

    // Padding to push the lines of text upwards
    let paddingDiv = document.createElement("div");
    paddingDiv.innerHTML = "<h2> </h2>";
    paddingDiv.classList.add("presentation");
    paddingDiv.classList.add("presentation-padding");
    document.getElementById("mainViz").appendChild(paddingDiv);


    // skip button
    var button = document.createElement("a");
    button.innerHTML = "<i class=\"fas fa-fast-forward fa-2x\"></i>";
    button.title = "Skip";
    button.setAttribute("role", "button");
    button.setAttribute("onclick", "skipPresentation()");
    button.id = "skipPresentation";
    button.style.display = "none";
    document.getElementById("mainViz").appendChild(button);

    // Shows the title
    let time = 0;
    fadeIn("titleForPres", animTime);
    time += 0 + 2*animTime;

    // Shows the first line of text
    idTO = setTimeout(function() {fadeInFadeOut("textLine1", 5000, animTime);}, time);
    time += 0 + 2*animTime;
    timeOutPres.push(idTO);

    // Shows the second line of text
    idTO = setTimeout(function() {fadeInFadeOut("textLine2", 3000, animTime);}, time);
    time += 3000 + 2*animTime;
    timeOutPres.push(idTO);

    // After the first two lines have disappeard, show the new first line again
    idTO = setTimeout(function() {
            firstTextLine.innerHTML = "<h2 id='textLine1' style='display: none'>This is the western underpass of the station,</h2>";
            fadeIn("textLine1", animTime);}
        , time);
    time += 0 + 1*animTime;
    timeOutPres.push(idTO);

    // Shows the infrastructure. The texts must be re-built over the animation, hence first we delete the old ones
    // before creating them again.
    idTO = setTimeout(function() {

        // Deletes all the first presentation objects
        $(".presentation").remove();
        $(".presentation-text").remove();
        $(".presentation-title").remove();
        $(".presentation-padding").remove();
        $("#skipPresentation").remove();

        // Shows the title again. No transition here as we do not want the reader to notice it changes.
        let titleDiv2Phase = document.createElement("div");
        titleDiv2Phase.innerHTML = "<h1 id='titleForPres' style='display: none'>The walking data</h1>";
        titleDiv2Phase.classList.add("presentationOn3D");
        titleDiv2Phase.classList.add("presentationOn3D-title");

        // Same as title, just replaces the first line of text without the reader noticing
        let firstTextLine = document.createElement("div");
        firstTextLine.innerHTML = "<h2 id='textLine1' style='display: none'>This is the western underpass of the station,</h2>";
        firstTextLine.classList.add("presentationOn3D");
        firstTextLine.classList.add("presentationOn3D-text1");

        document.getElementById("mainViz").appendChild(titleDiv2Phase);
        document.getElementById("mainViz").appendChild(firstTextLine);
        document.getElementById("mainViz").appendChild(button);

        // Sets the viz to 3D and adds the infrastucture in pretty mode.
        viz3D = true;
        prepViz();

        // do not rotate !
        controls.autoRotate = false;

        // Actually shows the title and first line of text.
        fadeIn("titleForPres", 0);
        fadeIn("textLine1", 0);
    }, time);
    time += 0 + 2*animTime;
    timeOutPres.push(idTO);


    // Shows the second line of text
    idTO = setTimeout(function() {
            // Main text container 2
            let secondTextLine = document.createElement("div");
            secondTextLine.innerHTML = "<h2 id='textLine2' style='display: none'>which is used by thousands of humans every morning.</h2>";
            secondTextLine.classList.add("presentationOn3D");
            secondTextLine.classList.add("presentationOn3D-text2");

            document.getElementById("mainViz").appendChild(secondTextLine);
            fadeIn("textLine2", 1000);
        }
        , time);
    time += 0 + 2*animTime;
    timeOutPres.push(idTO);

    // Shows the third line of text
    idTO = setTimeout(function() {
            // Main text container 2
            let thirdTextLine = document.createElement("div");
            thirdTextLine.innerHTML = "<h2 id='textLine3' style='display: none'>Nevertheless, before these commuters have woken up...</h2>";
            thirdTextLine.classList.add("presentationOn3D");
            thirdTextLine.classList.add("presentationOn3D-text3");

            document.getElementById("mainViz").appendChild(thirdTextLine);
            fadeIn("textLine3", 1000);
            }
        , time);
    time += 0 + 2*animTime;
    timeOutPres.push(idTO);

    /*idTO = setTimeout(function() {

    }, time);
    time += animTime;
    timeOutPres.push(idTO);*/

    // transition to TWD theme by first adding a black background.
    idTO = setTimeout(function() {

        // div for the black transition covers entire mainViz object
        let transition = document.createElement("div");
        transition.classList.add("presentationOn3D");
        transition.id = "transition2D3D";
        transition.style.backgroundColor = "black";
        transition.style.display = "none";
        transition.style.height ="100%";

        document.getElementById("mainViz").insertBefore(transition, document.getElementsByClassName("presentationOn3D-title")[0]);

        // make the transition happen
        fadeIn("transition2D3D", 1500);
        fadeOut("titleForPres", 250);
        fadeOut("textLine1",250);
        fadeOut("textLine2",250);
        fadeOut("textLine3",250);


    }, time);
    time += 250;
    timeOutPres.push(idTO);

    idTO = setTimeout(function() {

        document.getElementById("titleForPres").style.color = "#F7F4EA";
        document.getElementById("textLine1").style.color = "#F7F4EA";
        document.getElementById("textLine2").style.color = "#F7F4EA";
        document.getElementById("textLine3").style.color = "#F7F4EA";
        fadeIn("titleForPres",250);
        fadeIn("textLine1",250);
        fadeIn("textLine2",250);
        fadeIn("textLine3",250);

    }, time);
    time += 2000;
    timeOutPres.push(idTO);

    idTO = setTimeout(function() {

        // Text container 4
        let fourthTextLine = document.createElement("div");
        fourthTextLine .innerHTML = "<h2 id='textLine4' style='display: none'>the environment looks more like this !</h2>";
        fourthTextLine .classList.add("presentationOn3D");
        fourthTextLine .classList.add("presentationOn3D-text4");
        fourthTextLine.style.color = "#F7F4EA";

        document.getElementById("mainViz").appendChild(fourthTextLine );

        fadeIn("textLine4",1000);
        fadeOut("transition2D3D");

        document.getElementById("changeStyle").checked = true;
        changeStyle3D();

    }, time);
    time += 1000+animTime;
    timeOutPres.push(idTO);

    // Actually sets the TWD theme.
    idTO = setTimeout(function() {
        fadeOut("titleForPres");
        fadeOut("textLine1");
        fadeOut("textLine2");
        fadeOut("textLine3");
        fadeOut("textLine4");
    }, time);
    time += 2000;
    timeOutPres.push(idTO);

    // Starts the animation to make the zombies appear.
    idTO = setTimeout(function() {
        // remove all div used for showing the texts
        $(".presentationOn3D").remove();

        currentTimeShownIdx = 300;
        runViz();
        controls.autoRotate = false;

        // Weird movement!
        // TODO: Fix this
        moveCameraToDesiredPosition(cameraPresPos);

    }, time);
    time += 10500 + 2*animTime;
    timeOutPres.push(idTO);


    // Becomes serious.
    idTO = setTimeout(function() {

        // Same as title, just replaces the first line of text without the reader noticing
        let firstTextLine = document.createElement("div");
        firstTextLine.innerHTML = "<h2 id='textLine1' style='display: none'>Although this situation seems unrealistic, this work is still serious science.</h2>";
        firstTextLine.style.color = "white";
        firstTextLine.classList.add("presentationOn3D");
        firstTextLine.classList.add("presentationOn3D-title");

        document.getElementById("mainViz").appendChild(firstTextLine);
        fadeIn("textLine1",1000);

    }, time);
    time += 2000;
    timeOutPres.push(idTO);

    idTO = setTimeout(function() {
        let transition = document.createElement("div");
    transition.classList.add("presentationOn3D");
    transition.id = "transition3D2D";
    transition.style.backgroundColor = "#F7F4EA";
    transition.style.display = "none";
    transition.style.height ="100%";

    document.getElementById("mainViz").insertBefore(transition, document.getElementsByClassName("presentationOn3D-title")[0]);

    // make the transition happen
    fadeIn("transition3D2D", 1500);
        fadeOut("textLine1",250);

    }, time);
    time += 250;
    timeOutPres.push(idTO);

    idTO = setTimeout(function() {
        document.getElementById("textLine1").style.color = "#1D1B0D";
        fadeIn("textLine1",250);

    }, time);
    time += 1000;
    timeOutPres.push(idTO);

    idTO = setTimeout(function(){
        transitionBetween2D3D();

    }, time);
    timeOutPres.push(idTO);
    time +=1000;




    // Becomes serious.
    idTO = setTimeout(function() {
        d3.select("#control_checkbox").property("checked", true);
        d3.select("#voronoi_checkbox").property("checked", true);
        checkControl();

        // Same as title, just replaces the first line of text without the reader noticing
        let secondTextLine = document.createElement("div");
        secondTextLine .innerHTML = "<h2 id='textLine1' style='display: none'>The 2D analytics mode allows you to explore some of the specifities of pedestrian dynamics.</h2>";
        secondTextLine .style.color = "#1D1B0D";
        secondTextLine .classList.add("presentationOn3D");
        secondTextLine .classList.add("presentationOn3D-text1");

        document.getElementById("mainViz").appendChild(secondTextLine );
        fadeIn("textLine1",1000);
        fadeOut("transition3D2D",1000);

    }, time);
    time += 2000;
    timeOutPres.push(idTO);

    // Becomes serious.
    idTO = setTimeout(function() {

        // Same as title, just replaces the first line of text without the reader noticing
        let thirdTextLine = document.createElement("div");
        thirdTextLine  .innerHTML = "<h2 id='textLine4' style='display: none'>You can now freely explore The walking data visualization !</h2>";
        thirdTextLine  .style.color = "#1D1B0D";
        thirdTextLine.style.top = "75%";
        thirdTextLine  .classList.add("presentationOn3D");
        thirdTextLine  .classList.add("presentationOn3D-text4");

        document.getElementById("mainViz").appendChild(thirdTextLine);
        fadeIn("textLine4",1000);

    }, time);
    time += 5000;
    timeOutPres.push(idTO);

    idTO = setTimeout(function(){
        fadeOut("textLine1",1000);
        fadeOut("textLine4",1000);
        }, time);
    timeOutPres.push(idTO);
    time +=1000;

    idTO = setTimeout(function(){
        endOfPresentation();
    }, time);
    timeOutPres.push(idTO);
}

function skipPresentation() {

    // TODO: careful when the data is not entirely loaded!

    // tidies up the divs used for the introduction and shows the buttons

    // clears away all the timeouts
    for(let i=0; i<timeOutPres.length; i++) { clearTimeout(timeOutPres[i]) }

    // prepares the viz if skip is called very early on.
    if (!vizPrepared) {
        viz3D = false;

        document.getElementById("threeDButton").innerHTML = "<i class=\"fas fa-cube fa-lg\"></i>";
        document.getElementById("threeDButton").title = "3D viz";

        document.getElementById("help").title = "Scroll for zoom/dezoom; Click + Mouse to move around; Click on a zone to select it as an origin and ctrl+click to select it as a destination."

        prepViz();
        runViz();
    }

    if (vizPaused) {
        runViz()
    }

    endOfPresentation();


    /*
    if (!viz3D) {
        viz3D = true;
        prepViz();
    } else {
        controls.autoRotate = false;
    }

    runViz();
    moveCameraToDesiredPosition(cameraInitPos);
    */
}

function endOfPresentation() {
    presentationPlaying = false;

    $(".presentation").remove();
    $(".presentationOn3D").remove();
    $("#skipPresentation").remove();

    document.getElementById("buttons").style.display = "";
    document.getElementById("slider").style.display = "";
    document.getElementById("timer").style.display = "";
}

function fadeInFadeOut(id, time=1000, flashTime=1000) {

    $.when($("#" + id).fadeIn(flashTime)).then(() => {
        setTimeout(function() {
            $("#" + id).fadeOut(flashTime);
        }, time);
    });
}

function fadeIn(id, flashTime=1000){

    $.when($("#" + id).fadeIn(flashTime));
}

function fadeOut(id, flashTime=1000){

    $.when($("#" + id).fadeOut(flashTime));
}








