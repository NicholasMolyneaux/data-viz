const baseURL = 'http://transporsrv2.epfl.ch/db/';

let infrastructures = null;

$(document).ready(function() {

    console.log("TEST")

    // Load the infrastructures
    loadInfra();

});

function loadInfra() {
    const url = baseURL + 'infrastructures';

    var xhr = createCORSRequest('GET', url);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }

    // Response handlers.
    xhr.onload = function() {
        var text = xhr.responseText;
        var title = getTitle(text);
        alert('Response from CORS request to ' + url + ': ' + title);
    };

    xhr.onerror = function() {
        alert('Woops, there was an error making the request.');
    };

    xhr.send();
}

function addInfra() {
    infrastructures.forEach(infra => {
        $('#selectInfra').append($('<option>', {
            value: infra
        }))
    })
}

// Create the XHR object.
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }

    xhr.setRequestHeader(
        'X-Custom-Header', 'value'
    );

    return xhr;
}