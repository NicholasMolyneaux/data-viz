const baseURL = 'http://transporsrv2.epfl.ch/api/';

let introductionPlaying = true;

let vizHeight = getVizHeight();
let landscape = true;

let infrastructures = null;
let trajectories = null;

let selectedInfra = "lausannenew";
let selectedTraj = "test10";

let infraSelected = false;

let viz3D = true;
let trajDataLoaded = false;

let optionsShown = false;

let slider = null;
let minTime;
let maxTime;

$(document).ready(function() {

    // Load the infrastructures
    loadInfra();

    //viz2D();

    $("#fullscreen").on('click', function() {
        if(IsFullScreenCurrently())
            GoOutFullscreen();
        else
            GoInFullscreen($("#viz").get(0));
    });

    /*$("#threeDButton").on('click', function() {
        if(fancyViz)
        {
            fancyViz = false;
            viz2D();
        } else {
            fancyViz = true;
            viz3D();
        }
    });*/

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
            loadInfraData().then(() => {
                prepViz();
                resizeViz();
            });
            loadTraj();
        })
        .fail( function(xhr, textStatus, errorThrown) {
            alert("Error, please reload the website.");
        });
}

function noDataSelected() {
    document.getElementById("timer").innerHTML = "No trajectory data!";
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
            //trajectories = [{'name': 'traj1-'+selectedInfra.name, 'description': 'asdasdasd'}, {'name': 'traj2-'+selectedInfra.name, 'description': '123123'}, {'name': 'traj3-'+selectedInfra.name, 'description': 'Lorem Ipsum'}];
            addTraj();
            loading();
            trajDataLoaded = false;
            loadTrajData().then(() => {
                trajDataLoaded = true;
                finishedLoading();
                runViz();
                }
            );
        })
        .fail( function(xhr, textStatus, errorThrown) {
            alert("Error, please reload the website.");
        });

}

function loading() {
    let timer = document.getElementById("timer");
    timer.innerHTML = "LOADING";

    keepFading($("#timer"));

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

    minTime = selectedTraj.tmin;
    maxTime = selectedTraj.tmax;

    document.getElementById("timer").innerHTML = "0 [s.]";
    document.getElementById("timer").style.opacity = "1";
    document.getElementById("timer").style.display = "";
    document.getElementById("buttons").style.display = "";

    interPolateData();

    prepareChord(trajSummary);

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

}, true);

function getVizHeight() {

    return $(window).height() - $('#VizCont').offset().top;

}

function resizeViz() {

    document.getElementById("mainViz").style.height = 0 + "px";

    vizHeight = getVizHeight();

    document.getElementById("mainViz").style.height = vizHeight + "px";

    if (viz3D) {

        let width = document.body.clientWidth;

        if (introductionPlaying) {
            width = window.innerWidth
        }

        camera.aspect = width / vizHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(width, vizHeight);

        //document.getElementById("canvas").height = vizHeight + "px";
        //document.getElementById("canvas").width = window.innerWidth + "px";
    } else {
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

// During intro, no scrolling
$('.allExceptFooter').css('padding-bottom', '0px');

setTimeout(function(){

    document.getElementById("StatsCont").style.display = "";
    document.getElementById("dataCont").style.display = "";
    document.getElementById("footer").style.display = "";

    $('.allExceptFooter').css('padding-bottom', '60px');

    $('body').css('background-color', 'white');

    introductionPlaying = false;
    resizeViz();

}, 5000);








