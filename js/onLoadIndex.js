const baseURL = 'http://transporsrv2.epfl.ch/db/';

let infrastructures = null;
let trajectories = null;

let selectedInfra = null;
let selectedTraj = null;

$(document).ready(function() {

    // Load the infrastructures
    loadInfra();

});

// Load the infrastructure by doing an ajax call
function loadInfra() {
    const url = baseURL + 'infrastructures';


    $.ajax({
        type: "GET",
        //dataType: "json",
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
            alert(xhr.responseText);
            alert(textStatus);
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
            alert(xhr.responseText);
            alert(textStatus);
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

