const baseURL = 'http://transporsrv2.epfl.ch/db/';

let infrastructures = null;

$(document).ready(function() {

    // Load the infrastructures
    loadInfra();

});

function loadInfra() {
    const url = baseURL + 'infrastructures';


    $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        crossDomain : true,
    })
        .done(function( data ) {
            infrastructures = data;
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

    infrastructures = [{'name': 'infra1', 'description': 'asdasdasd'}, {'name': 'infra2', 'description': '123123'}, {'name': 'infra3', 'description': 'Lorem Ipsum'}]

    infrastructures.forEach(infra => {
        console.log(infra);
        $('#selectInfra').append($('<option>', {
            value: infra.name,
            text: infra.name
        }))
    })

    document.getElementById('descInfra').style.display = '';
    document.getElementById('textDescInfra').innerHTML = infrastructures[0]['description'];
}

function updateDescriptionInfra(e) {

    const infraName = e.options[e.selectedIndex].value;

    const idx = infrastructures.map(function(e) { return e.name; }).indexOf(infraName);

    document.getElementById('textDescInfra').innerHTML = infrastructures[idx]['description'];
    
}