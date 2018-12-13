const baseURL = 'http://transporsrv2.epfl.ch/api/';

let presentationPlaying = true;

let vizHeight = getVizHeight();
let landscape = true;

let infrastructures = null;
let trajectories = null;

let selectedInfra = "lausannenew";
let selectedTraj = "test10";

let infraSelected = false;

let viz3D = false;
let viz2D = false;
let trajDataLoaded = false;
let infraDataLoaded = false;

let optionsShown = false;

let slider = null;
let minTime;
let maxTime;

let timeOutPres = [];

let statsShown = false;

$(document).ready(function() {

    // Load the infrastructures
    loadInfra();

    presentation();

    //viz2D();

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
            noDataSelected();

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

function noDataSelected() {

    if(!presentationPlaying) {
        document.getElementById("timer").innerHTML = "No trajectory data!";
    }
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

    document.getElementById('descInfra').style.display = '';
    document.getElementById('textDescInfra').innerHTML = infrastructures[idx]['description'];

    document.getElementById("infraData").selectedIndex = idx;
}

function updateDescriptionInfra(e) {

    const infraName = e.options[e.selectedIndex].value;

    const idx = infrastructures.map(function(e) { return e.name; }).indexOf(infraName);

    selectedInfra = infrastructures[idx];

    document.getElementById('textDescInfra').innerHTML = selectedInfra['description'];
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
            loading();

            // Without animation
            /*trajDataLoaded = false;
            loadTrajData().then(() => {
                trajDataLoaded = true;
                finishedLoading();
                runViz();
                }*/

            // With animation
            loadTrajData().then(() => {
                trajDataLoaded = true;
                interPolateData();
                createSlider();
                downSampleTrajectories();

                if (!presentationPlaying) {
                    finishedLoading();
                    runViz();
                } else {
                    document.getElementById("skipPresentation").style.display = "";
                }
            }
            );
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
    document.getElementById("buttons").style.display = "";

}

function createSlider() {

    slider = document.getElementById('slider');

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
    });

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
    var select = document.getElementById("trajData");
    var length = select.options.length;
    for (i = 0; i < length; i++) {
        select.options[i] = null;
    }

    let idx = -1;

    trajectories.forEach((traj, index) => {

        if(traj.name == selectedTraj) {
            selectedTraj = traj;
            idx = index;
        }

        $('#trajData').append($('<option>', {
            value: traj.name,
            text: traj.name
        }))
    });

    minTime = selectedTraj.tmin;
    maxTime = selectedTraj.tmax;

    document.getElementById('descTraj').style.display = '';
    document.getElementById('textDescTraj').innerHTML = trajectories[idx]['description'];

    document.getElementById("trajData").selectedIndex = idx;

}

function updateDescriptionTraj(e) {
    //console.log("updateDescriptionTraj");

    //console.log(e);
    const trajName = e.options[e.selectedIndex].value;
    function isSelectedTraj(traj){return traj.name === trajName}

    //console.log(trajName);
    //console.log(trajectories);
    //console.log();
    const idx = trajectories.findIndex(isSelectedTraj);//trajectories.map(function(e) { return e.name; }).indexOf(trajName);

    //console.log(idx);

    selectedTraj = trajectories[idx];

    //console.log(selectedTraj);

    document.getElementById('textDescTraj').innerHTML = selectedTraj['description'];
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

        document.getElementById("dragOpt").style.top = 10 + "px";
        document.getElementById("dragOpt").style.left = 10 + "px";

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
    });


}

$('#optionsButton').click(() => {
    if (optionsShown) {
        document.getElementById("optionsButton").innerHTML = "<i class=\"fas fa-plus fa-lg\"></i>";
        document.getElementById("dragOpt").style.display = "none";

        optionsShown = false;
    } else {
        document.getElementById("optionsButton").innerHTML = "<i class=\"fas fa-minus fa-lg\"></i>";
        document.getElementById("dragOpt").style.display = "";

        optionsShown = true;
    }
});

window.addEventListener('resize', function(){

    resizeViz();

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

    if (viz3D) {

        let width = document.body.clientWidth;

        camera.aspect = width / vizHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(width, vizHeight);

        //document.getElementById("canvas").height = vizHeight + "px";
        //document.getElementById("canvas").width = window.innerWidth + "px";
    } else if (viz2D) {
        document.getElementById("svgCont").style.height = vizHeight + "px";
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
            thirdTextLine.innerHTML = "<h2 id='textLine3' style='display: none'>Nevertheless, before these commuters have woken up,</h2>";
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

        document.getElementById("titleForPres").style.color = "white";
    document.getElementById("textLine1").style.color = "white";
    document.getElementById("textLine2").style.color = "white";
    document.getElementById("textLine3").style.color = "white";
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
        fourthTextLine .innerHTML = "<h2 id='textLine4' style='display: none'>the environment looks more like this...</h2>";
        fourthTextLine .classList.add("presentationOn3D");
        fourthTextLine .classList.add("presentationOn3D-text4");
        fourthTextLine.style.color = "white";

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

        runViz();
        controls.autoRotate = false;

        // Weird movement!
        // TODO: Fix this
        moveCameraToDesiredPosition(cameraPresPos);

    }, time);
    time += 10000 + 2*animTime;
    timeOutPres.push(idTO);


    idTO = setTimeout(function(){
        endOfPresentation();
    }, time);
    timeOutPres.push(idTO);
}

function skipPresentation() {

    // TODO: careful when the data is not entirely loaded!

    endOfPresentation();

    for(let i=0; i<timeOutPres.length; i++) {
        clearTimeout(timeOutPres[i])
    }

    if (!viz3D) {
        viz3D = true;
        prepViz();
    } else {
        controls.autoRotate = false;
    }

    runViz();
    moveCameraToDesiredPosition(cameraInitPos);
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








