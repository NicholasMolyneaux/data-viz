const baseURL = 'http://transporsrv2.epfl.ch/api/';
//const baseURL = 'http://localhost:9000/';


let infrastructures = null;
let overrideInfra = false;

let selectedInfra = null;
let trajectories = null;
let overrideTraj = false;

$(document).ready(function() {

    // Load the infrastructures
    loadInfra();

});

// Load the infrastructure by doing an ajax call
function loadInfra() {
    const url = baseURL + 'infralist';


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
    //infrastructures = [{'name': 'infra1', 'description': 'asdasdasd'}, {'name': 'infra2', 'description': '123123'}, {'name': 'infra3', 'description': 'Lorem Ipsum'}];

    infrastructures.forEach(infra => {
        $('#selectInfra').append($('<option>', {
            value: infra.name,
            text: infra.name
        }))
    })

    document.getElementById('descInfra').style.display = '';
    document.getElementById('textDescInfra').innerHTML = infrastructures[0]['description'];
}

function updateDescriptionInfraAndLoadTraj(e) {

    const infraName = e.options[e.selectedIndex].value;

    const idx = infrastructures.map(function(e) { return e.name; }).indexOf(infraName);

    selectedInfra = infrastructures[idx];

    document.getElementById('textDescInfra').innerHTML = selectedInfra['description'];

    loadTraj(selectedInfra);

}

// Load the infrastructure by doing an ajax call
function loadTraj(infra) {
    const url = baseURL + 'trajlist/' + infra['name'];

    // We will have to take into account the infra.

    $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        crossDomain : true,
    })
        .done(function( data ) {
            trajectories = data;
            // DEBUG
            //trajectories = [{'name': 'traj1-'+infra.name, 'description': 'asdasdasd'}, {'name': 'traj2-'+infra.name, 'description': '123123'}, {'name': 'traj3-'+infra.name, 'description': 'Lorem Ipsum'}];
            console.log(trajectories);
        })
        .fail( function(xhr, textStatus, errorThrown) {
            alert("Error, please reload the website.");
        });

}

function verifyTrajName(e) {

    const idx = trajectories.map(function(e) { return e.name; }).indexOf(e.value);

    if (idx != -1) {
        document.getElementById('overrideTraj').style.display = '';
        overrideTraj = true;
    } else {
        document.getElementById('overrideTraj').style.display = 'none';
        overrideTraj = false;
    }
}