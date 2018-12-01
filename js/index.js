const baseURL = 'http://transporsrv2.epfl.ch/api/';

let vizHeight = $('.footer').offset().top - $('#viz').offset().top;

let landscape = true;

let infrastructures = null;
let trajectories = null;

let selectedInfra = "lausanne";
let selectedTraj = "samplenostrategies";

let infraSelected = false;

let fullScreenBool = false;

let fancyViz = false;
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
                console.log(wallsData);
                prepViz2D(selectedInfra.xmin, selectedInfra.xmax, selectedInfra.ymin, selectedInfra.ymax);
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
    console.log(url);

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
                runViz2D();
                }
            );

            //runViz();
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

    slider.noUiSlider.on('change', function () {
        let times = slider.noUiSlider.get();

        changeTimes(times[0], times[2]);
    });


    let handles = slider.querySelectorAll('.noUi-handle');
    handles[0].classList.add('outer');
    handles[1].classList.add('inner');
    handles[2].classList.add('outer');

    let origins = slider.getElementsByClassName('noUi-origin');
    origins[1].setAttribute('disabled', true);

    minTime = selectedTraj.tmin;
    maxTime = selectedTraj.tmax;

    document.getElementById("timer").innerHTML = "0 [s.]";
    document.getElementById("timer").style.opacity = "1";
    document.getElementById("timer").style.display = "";
    document.getElementById("buttons").style.display = "";

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


function runViz() {

    document.getElementById("mainViz").style.height = vizHeight + "px";

    prepareTrajectories(selectedInfra.name, selectedInfra.xmin, selectedInfra.xmax, selectedInfra.ymin, selectedInfra.ymax);

    const urlTraj = "http://transporsrv2.epfl.ch/api/trajectoriesbytime/"+selectedInfra.name+"/"+selectedTraj.name;

    fetch(urlTraj).then(response => {
        return response.json();
    }).then(data => {
        runViz2D(data, selectedTraj.tmin, selectedTraj.tmax);
    }).catch(err => {
        console.log(err)
    });

}

function dataSelected() {

    window.alert("UNUSED FUNCTION! TO BE CHANGED!!!!!")

    if (!infraSelected) {
        window.alert("Please, choose an infrastructure first.")
    } else {
        // Show the rest of the webpage
        document.getElementById("StatsCont").style.display = "";

        const urlSummary = "http://transporsrv2.epfl.ch/api/summary/"+selectedInfra.name+"/"+selectedTraj.name;

        fetch(urlSummary).then(response => {
            return response.json();
        }).then(data => {

            prepareChord(data);
        }).catch(err => {
            console.log(err)
        });

        prepareTrajectories(selectedInfra.name, selectedInfra.xmin, selectedInfra.xmax, selectedInfra.ymin, selectedInfra.ymax);

        const urlTraj = "http://transporsrv2.epfl.ch/api/trajectoriesbytime/"+selectedInfra.name+"/"+selectedTraj.name;
        //Todo: is the OD independent to the selected data set?
        const urlOD = "http://transporsrv2.epfl.ch/api/summary/"+selectedInfra.name+"/"+selectedTraj.name;
        let traj_data = fetch(urlTraj).then(response => {
            return response.json();
        });
        let od_info = fetch(urlOD).then(response => response.json());
        Promise.all([traj_data, od_info]).then(data => {
            let traj = data[0];
            let od = data[1];
            runViz2D(traj, od, selectedTraj.tmin, selectedTraj.tmax);
            staticChord(traj);
        }).catch(err => {
            console.log(err)
        });

        fetch("data/factice/hist.json").then(response => {
            return response.json();
        }).then(hist => {
            addHistograms(hist);

        }).catch(err => {
            console.log(err)
        });

    }

}

function fullScreen(e) {

    e.preventDefault();

    if (fullScreenBool) {
        // Not in full screen anymore
        fullScreenBool = false;

        // Update the size of the div
        const viz = document.getElementById("viz");
    } else {
        // Now in full screen
        fullScreenBool = true;
    }

    //console.log("LOL");
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

        const svgCont = document.getElementById("svgCont");
        svgCont.style.padding = "0";
        svgCont.style.maxWidth = "100%";
        svgCont.style.height = "100%";

        document.getElementById("dragOpt").style.top = 10 + "px";
        document.getElementById("dragOpt").style.left = 10 + "px";

    }
    else {
        document.getElementById("fullscreen").innerHTML = "<i class=\"fas fa-expand fa-lg\"></i>";

        $("#viz").removeAttr("style");

        $("#svgCont").removeAttr("style");

        document.getElementById("dragOpt").style.top = 10 + "px";
        document.getElementById("dragOpt").style.left = 10 + "px";

    }
});

function appendOptions() {
    $.get('./assets/templates/options.html', function(opts) {
        var rendered = Mustache.render(opts);

        $('#viz').append(rendered);

        document.getElementById("dragOpt").style.display = "none";

        document.getElementById("dragOpt").style.top = 10 + "px";
        document.getElementById("dragOpt").style.left = 10 + "px";

        $( function() {
            $( "#dragOpt" ).draggable(
                {
                    containment: $( "body" )
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

    document.getElementById("mainViz").style.height = 0 + "px";

    vizHeight = $('.footer').offset().top - $('#viz').offset().top;

    document.getElementById("mainViz").style.height = vizHeight + "px";

    document.getElementById("svgCont").style.height = vizHeight + "px";


}, true);

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






