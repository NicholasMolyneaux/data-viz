const baseURL = 'http://transporsrv2.epfl.ch/api/db/';

let infrastructures = null;
let trajectories = null;

let selectedInfra = null;
let selectedTraj = null;

let fullScreenBool = false;

$(document).ready(function() {

    // Load the infrastructures
    loadInfra();

    $("#fullscreen").on('click', function() {
        if(IsFullScreenCurrently())
            GoOutFullscreen();
        else
            GoInFullscreen($("#viz").get(0));
    });

});

// Load the infrastructure by doing an ajax call
function loadInfra() {
    const url = baseURL + 'infrastructures';

    console.log(url);

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
        })
        .fail( function(xhr, textStatus, errorThrown) {
            alert("Error, please reload the website.");
        });
}

function addInfra() {
    console.log(infrastructures);

    // DEBUG
    infrastructures = [{'name': 'infra1', 'description': 'asdasdasd'}, {'name': 'infra2', 'description': '123123'}, {'name': 'infra3', 'description': 'Lorem Ipsum'}];

    infrastructures.forEach(infra => {
        $('#infraData').append($('<option>', {
            value: infra.name,
            text: infra.name
        }))
    })

    document.getElementById('descInfra').style.display = '';
    document.getElementById('textDescInfra').innerHTML = infrastructures[0]['description'];

    selectedInfra = infrastructures[0];
}

function updateDescriptionInfra(e) {

    const infraName = e.options[e.selectedIndex].value;

    const idx = infrastructures.map(function(e) { return e.name; }).indexOf(infraName);

    selectedInfra = infrastructures[idx];

    document.getElementById('textDescInfra').innerHTML = selectedInfra['description'];

}

function getTraj() {

    const url = baseURL + 'infrastructures';

    // We will have to take into account the infra.

    $.ajax({
        type: "GET",
        //dataType: "json",
        url: url,
        crossDomain : true,
    })
        .done(function( data ) {
            // DEBUG
            trajectories = [{'name': 'traj1-'+selectedInfra.name, 'description': 'asdasdasd'}, {'name': 'traj2-'+selectedInfra.name, 'description': '123123'}, {'name': 'traj3-'+selectedInfra.name, 'description': 'Lorem Ipsum'}];
            addTraj()
        })
        .fail( function(xhr, textStatus, errorThrown) {
            alert("Error, please reload the website.");
        });

}

function addTraj() {
    console.log(trajectories);

    // Remove all options
    var select = document.getElementById("trajData");
    var length = select.options.length;
    for (i = 0; i < length; i++) {
        select.options[i] = null;
    }

    trajectories.forEach(infra => {
        $('#trajData').append($('<option>', {
            value: infra.name,
            text: infra.name
        }))
    })

    document.getElementById('descTraj').style.display = '';
    document.getElementById('textDescTraj').innerHTML = trajectories[0]['description'];

    selectedTraj = trajectories[0];
}

function updateDescriptionTraj(e) {

    const trajName = e.options[e.selectedIndex].value;

    const idx = trajectories.map(function(e) { return e.name; }).indexOf(trajName);

    selectedTraj = trajectories[idx];

    document.getElementById('textDescTraj').innerHTML = selectedTraj['description'];

}

function dataSelected() {
    window.alert('Infrastructure: ' + selectedInfra.name + '\nTrajectories: ' + selectedTraj.name);
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

    console.log("LOL");
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
        document.getElementById("fullscreen").style.display = 'none';

        const viz = document.getElementById("viz");

        viz.style.height = "100%";
        viz.style.width = "100%";
        viz.style.backgroundColor = "white";
        viz.style.padding = "0";

        const svgCont = document.getElementById("svgCont");
        svgCont.style.padding = "0";
        svgCont.style.maxWidth = "100%";
        svgCont.style.height = "100%";

    }
    else {
        document.getElementById("fullscreen").style.display = '';

        $("#viz").removeAttr("style");

        $("#svgCont").removeAttr("style");

    }
});


