/*********************************************************/
/*                                                       */
/*   File with some misc functions. (Didn't know where   */
/*   to put them =P)                                     */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

///////////////////////////////////////////////////////////
//                                                       //
//                   Random functions                    //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Get the size of the visualization based on the window size
 *
 * 56 corresponds to the size of the navbar
 */
function getVizHeight() {

    return window.innerHeight - 56;

}

/**
 * Fade in and then fade out
 *
 * @param: id - string of the id of an HTML element
 * @param: time - The time between the fade in and the fade out
 * @param: flashTime - the duration of the fading
 */
function fadeInFadeOut(id, time=1000, flashTime=1000) {

    $.when($("#" + id).fadeIn(flashTime)).then(() => {
        setTimeout(function() {
            $("#" + id).fadeOut(flashTime);
        }, time);
    });
}

/**
 * Fade in
 *
 * @param: id - string of the id of an HTML element
 * @param: flashTime - the duration of the fading
 */
function fadeIn(id, flashTime=1000){

    $.when($("#" + id).fadeIn(flashTime));
}

/**
 * Fade out
 *
 * @param: id - string of the id of an HTML element
 * @param: flashTime - the duration of the fading
 */
function fadeOut(id, flashTime=1000){

    $.when($("#" + id).fadeOut(flashTime));
}

/**
 * Fade in and fade out continuously
 *
 * We do this for the loading screen when the data are being loaded
 *
 * @param: obj - HTML object
 */
function keepFading($obj) {
    if (!trajDataLoaded) {
        $obj.fadeToggle(1000, function () {
            keepFading($obj)
        });
    }
}

/**
 * Transform seconds in HH:mm:ss
 *
 * @param: d - number of seconds since midnight
 */
function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

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
    return hDisplay + ":" + mDisplay + ":" + sDisplay;
}

/**
 * Transform seconds in HH:mm:ss.sss (milliseconds)
 *
 * @param: d - number of seconds since midnight
 */
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

/**
 * Intersection of keys between two objects
 */
function intersection(o1, o2) {
    return Object.keys(o1).filter({}.hasOwnProperty.bind(o2));
}

///////////////////////////////////////////////////////////
//                                                       //
//                   Export functions                    //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Export a SVG object
 *
 * Used to export the chord diagram, the two histograms and the main 2D viz
 *
 * @param: id - id of the graph
 */
function exportGraph(id) {

    // Get the input where the name of the file is
    const name = document.getElementById("exportName_" + id).value;

    // Check if a name was given
    if (name === "") {
        window.alert("Please, specify a name!")
    } else {
        let type = "png";

        // For the histograms, we can also export them as CSV
        if (id === "tt" || id === "density") {
            type = document.getElementById("exportType_" + id).value;
        }

        // Save the file as PNG or CSV
        if (type === 'png') {
            // Defined below
            saveAsPNG(id, name);
        } else if (type == 'csv') {
            // Defined below
            saveAsCSV(id, name);
        }
    }
}

/**
 * Save a SVG as PNG
 *
 * !!! This function is quite ugly. !!!
 * TODO: Make a better export function in the future
 *
 * @param: id - id of the graph
 * @param: name - name of the graph
 */
function saveAsPNG(id, name) {

    let svg;

    // Based on the id, we'll get different SVG, using d3
    if (id !== "mainViz") {
        svg = d3.select("#svgViz_" + id).node();
    } else {
        svg = d3.select("#svgCont").node();
    }

    // Get the height of the graph
    let height;

    if (id === 'tt' || id === 'density') {
        height = graphOptions[id]['height']
    } else if (id === 'OD') {
        height = 900;
    } else if (id === "mainVIz") {
        height = getVizHeight();
    }

    // Get the scale
    let scale;

    if ( id==="tt" || id === "density") {
        scale = 2;
    } else if (id === 'OD') {
        scale = 1;
    } else if (id === "mainViz") {
        scale = 50;
    }

    // Recenter the OD chord diagram
    let left = 0;

    if (id === "OD") {
        left = -450;
    }

    let top = 0;

    if (id === "OD") {
        top = -450;
    }

    // Save as PNG using the function from the library "saveSvgAsPng"
    saveSvgAsPng(svg, name + ".png", {scale: scale, backgroundColor: '#FFFFFF', height: height, top:top, left:left, encoderOptions: 0.2});

}

/**
 * Save a SVG as CSV
 *
 * Part of the function was taken from Internet
 *
 * @param: id - id of the graph
 * @param: name - name of the graph
 */
function saveAsCSV(id, name) {

    // Transform the data first
    let data = [];

    data.push(Object.keys(graphOptions[id]['binsData']));

    graphOptions[id]['binsData']['x'].forEach((x, i) => {
        data.push([x, graphOptions[id]['binsData']['y_count'][i], graphOptions[id]['binsData']['y_perc'][i]]);
    });

    // Rest of this function was taken on internet
    // No reference, sorry, again. =P

    // Building the CSV from the Data two-dimensional array
    // Each column is separated by ";" and new line "\n" for next row
    let csvContent = '';
    data.forEach(function(infoArray, index) {
        dataString = infoArray.join(';');
        csvContent += index < data.length ? dataString + '\n' : dataString;
    });

    // The download function takes a CSV string, the filename and mimeType as parameters
    // Scroll/look down at the bottom of this snippet to see how download is called
    var download = function(content, fileName, mimeType) {
        let a = document.createElement('a');
        mimeType = mimeType || 'application/octet-stream';

        if (navigator.msSaveBlob) { // IE10
            navigator.msSaveBlob(new Blob([content], {
                type: mimeType
            }), fileName);
        } else if (URL && 'download' in a) { //html5 A[download]
            a.href = URL.createObjectURL(new Blob([content], {
                type: mimeType
            }));
            a.setAttribute('download', fileName);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
        }
    };

    download(csvContent, name + '.csv', 'text/csv;encoding:utf-8');

}