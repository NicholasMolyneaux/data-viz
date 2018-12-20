/*********************************************************/
/*                                                       */
/*   File with all the buttons in the visualization      */
/*   Done with jquery since we're using the <a> tags     */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

/**
 * Play - Pause button.
 *
 * The goal is to pause the animation and restart it.
 */
$( "#playPauseButton" ).click(function() {

    if (vizPaused) {
        // Run the visualization
        // Defined in js/main/viz.js
        runViz();
        // Change the icon
        document.getElementById("playPauseButton").innerHTML = "<i class=\"fas fa-pause fa-lg\"></i>";
        vizPaused = false;
    } else {
        // Stop the animation
        clearInterval(pedMover);
        // Change the icon
        document.getElementById("playPauseButton").innerHTML = "<i class=\"fas fa-play fa-lg\"></i>";
        vizPaused = true;
    }

});

/**
 * Fast Forward button
 *
 * If clicked, the animation has to go faster.
 * !!! with the 3D animation since the data are interpolated.
 */
$( "#forward" ).click(function() {

    // We limit the speed at x16
    if (SPEEDFACTOR <= 16) {
        // Stop the animation
        clearInterval(pedMover);

        // Check if we need to change from interpolated data to non-interpolated data
        if (viz3D & SPEEDFACTOR == 2) {
            currentTimeShownIdx = Math.round(currentTimeShownIdx/(INTERP+1));
        }

        // Double the speed factor
        SPEEDFACTOR *= 2;

        // Update the speed in the HTML
        if (SPEEDFACTOR < 1) {
            const frac = math.fraction(SPEEDFACTOR);
            document.getElementById("speed").innerHTML = "&#215;" + frac.n + "/" + frac.d;
        } else {
            document.getElementById("speed").innerHTML = "&#215;" + SPEEDFACTOR;
        }

        // Continue the animation if it was not paused.
        if (!vizPaused) {
            // Defined in js/main/viz.js
            runViz();
        }
    }
});

/**
 * Fast Backward button
 *
 * If clicked, the animation has to go slower.
 * !!! with the 3D animation since the data are interpolated.
 */
$( "#backward" ).click(function() {

    // We limit the speed at x1/4
    if (SPEEDFACTOR >= 0.25) {
        // Stop the animation
        clearInterval(pedMover);

        // Check if we need to change from non-interpolated data to interpolated data
        if (viz3D & SPEEDFACTOR == 4) {
            currentTimeShownIdx = currentTimeShownIdx*(INTERP+1);
        }

        // Divide the speed by two
        SPEEDFACTOR /= 2;

        // Update the speed in the HTML
        if (SPEEDFACTOR < 1) {
            const frac = math.fraction(SPEEDFACTOR);
            document.getElementById("speed").innerHTML = "&#215;" + frac.n + "/" + frac.d;
        } else {
            document.getElementById("speed").innerHTML = "&#215;" + SPEEDFACTOR;
        }

        // Continue the animation if it was not paused.
        if (!vizPaused) {
            // Defined in js/main/viz.js
            runViz();
        }
    }

});

/**
 * 3D/2D button
 *
 * If clicked, the animation has to transition between the 2D and the 3D
 *
 * Function defined in the file viz.js
 */
$( "#changeVizButton" ).click(function() {

    // Defined in js/main/viz.js
    transitionBetween2D3D()
});

/**
 * Option button
 *
 * If clicked, the options have to be shown
 */
$('#optionsButton').click(() => {

    // Simply change the display to "" for the options
    document.getElementById("optionsButton").style.display = "none";
    document.getElementById("dragOpt").style.display = "";

    optionsShown = true;
});