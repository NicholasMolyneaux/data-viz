/*********************************************************/
/*                                                       */
/*   File with the main global variables                 */
/*   + some basic functions                              */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

///////////////////////////////////////////////////////////
//                                                       //
//                   Global variables                    //
//                                                       //
///////////////////////////////////////////////////////////

// The base URL for the API
const baseURL = 'http://transporsrv2.epfl.ch/api/';

// Indicates whether the presentation is finished or not
let presentationPlaying = true;

// Indicated whether the the prepViz function has already been called.
// This is needed for the skip button to determine at which stage of the animation we are
let vizPrepared = false;

// Indicator whether the viz is actually running or not. This should be changed when the play/pause button is clicked.
let vizPaused = true;

// list of infrastructures and trajectories
let infrastructures = null;
let trajectories = null;

// Initial selected Infrastructure and Trajectories
// They will have to be transformed into the real objects
let selectedInfra = "lausannenew";
let selectedTraj = "test10";

// Boolean to say if the viz is in 3D or 2D
let viz3D = false;

// Boolean to say if the trajectories/infrastructures have been loaded or not
let trajDataLoaded = false;
let infraDataLoaded = false;

// Say if the options are currently being shown or not
let optionsShown = false;

// Slider for the time selection
let slider = null;

// Upper and lower bounds for the time
let minTime;
let maxTime;

// Array of IDs for the time out (in the presentation
let timeOutPres = [];

// Boolean to say if the stats are being shown or not
let statsShown = false;

// Boolean to say if all the trajectories are loaded or not
let allTrajLoaded = false;

// Global parameters for the viz

// Interval to be updated by JS
let pedMover;

// Current index for the update of the positions
let currentTimeShownIdx = 0;

// Speed of the visualization
let SPEEDFACTOR = 1;

// Boolean to say if the button for changing the viz is disabled or not
let changeVizButtonDisabled = false;

// Number of interpolated data for the 3D
const INTERP = 4;

///////////////////////////////////////////////////////////
//                                                       //
//             Starting point of the website             //
//                                                       //
///////////////////////////////////////////////////////////

// Set the size of the main div
document.getElementById("mainViz").style.height = vizHeight + "px";

// Initialize the visualization
$(document).ready(function() {

    // Load the infrastructure (and then the trajectories
    // Defined in js/main/data.js
    loadInfra();

    // Resize the visualization
    // Defined in js/main/viz.js
    resizeViz();

    // Start the presentation
    // Defined in js/main/presentation.js
    presentation();

    // Initialize the click function to go full screen
    $("#fullscreen").on('click', function() {
        if(IsFullScreenCurrently())
            GoOutFullscreen();
        else
            GoInFullscreen($("#viz").get(0));
    });

});

// Window resize function
window.addEventListener('resize', function(){

    // Defined in js/main/viz.js
    resizeViz();

}, true);

///////////////////////////////////////////////////////////
//                                                       //
//                 Fullscreen functions                  //
//    The core functions have been found somewhere on    //
//      Internet. I don't have the reference. Sorry.     //
//                                                       //
///////////////////////////////////////////////////////////

$(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function() {
    if(IsFullScreenCurrently()) {
        // Going to fullscreen

        // Change the icon for the full screen
        document.getElementById("fullscreen").innerHTML = "<i class=\"fas fa-compress fa-lg\"></i>";

        // Change the style of the viz to be 100%
        const viz = document.getElementById("viz");
        viz.style.height = "100%";
        viz.style.width = "100%";
        viz.style.backgroundColor = "white";
        viz.style.padding = "0";

        if (viz3D) {
            // Change the camera aspect if we're in 3D
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

        } else {
            // Change the SVG if we're in 2D
            const svgCont = document.getElementById("svgCont");
            svgCont.style.padding = "0";
            svgCont.style.maxWidth = "100%";
            svgCont.style.height = "100%";
        }

        // Reset the position of the options
        document.getElementById("dragOpt").style.top = 10 + "px";
        document.getElementById("dragOpt").style.left = 10 + "px";

    }
    else {
        // Leaving fullscreen

        // change the icon
        document.getElementById("fullscreen").innerHTML = "<i class=\"fas fa-expand fa-lg\"></i>";

        // Remove the previously added attributes
        $("#viz").removeAttr("style");

        // If 2D, remove the attributes of the SVG
        if (!viz3D) {
            $("#svgCont").removeAttr("style");
        }

        // Resize the viz
        // Defined in js/main/viz.js
        resizeViz();

        // Reposition the options
        document.getElementById("dragOpt").style.top = 0 + "px";
        document.getElementById("dragOpt").style.left = 0 + "px";

    }
});

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

