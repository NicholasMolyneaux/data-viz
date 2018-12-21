/*********************************************************/
/*                                                       */
/*   File with the main function for the viz.            */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

/**
 * Prepare the 2D or 3D visualization
 *
 * @param: change3DStyle - boolean parameter used to avoid reloading the options if only the style of the 3D was changed.
 */
function prepViz(change3DStyle=false) {

    if (viz3D) {
        // Defined in visualization/3D/js/main.js
        prepViz3D();

    } else {
        // Defined in visualization/2D/js/main.js
        prepViz2D();
    }

    // If we only change the style of the 3D, we don't want to reload the options
    if (!change3DStyle) {
        appendOptions();
    }

    // Defined below
    resizeViz();
    vizPrepared = true;
}

/**
 * Run the 2D or 3D visualization
 */
function runViz() {

    if (viz3D) {
        // Defined in visualization/3D/js/animation.js
        runAnimation3D();
    } else  {
        // Defined in visualization/2D/js/animation.js
        runAnimation2D();
    }
}

/**
 * Run one step of the 2D or 3D visualization
 */
function do1Step() {

    if (viz3D) {
        // Defined in visualization/3D/js/animation.js
        runOneStep3D();
    } else {
        // Defined in visualization/2D/js/animation.js
        runOneStep2D();
    }
}

/**
 * Transition between the 2D and the 3D
 */
function transitionBetween2D3D() {

    // Since some stuff have to be loaded (especially for the 3D), we want to have a timeout between
    // the transitions. Thus, we use this boolean to disabled the button for 1 second.
    if (!changeVizButtonDisabled) {

        // Transition has started. Function is disabled for 1 second
        changeVizButtonDisabled = true;
        setTimeout(function() {
            changeVizButtonDisabled = false;
        }, 1000);

        // Remove the options
        // Defined below
        removeOptions();

        if(viz3D) {

            // Change the button and its text
            document.getElementById("changeVizButton").innerHTML = "<i class=\"fas fa-cube fa-lg\"></i>";
            document.getElementById("changeVizButton").title = "3D viz";

            // Change the helper
            document.getElementById("help").title = "Scroll for zoom/dezoom; Click + Mouse to move around; Click on a zone to select it as an origin and ctrl+click to select it as a destination."

            viz3D = false;

            // Stop the animation
            clearInterval(pedMover);

            // Delete everything for the 3D
            // Defined in visualization/3D/js/main.js
            deleteStuff3D();

            // If the speed factor is less than 2, we have to go back to the non-interpolated data.
            // => we have to change the current index of the animation
            if (SPEEDFACTOR <= 2) {
                currentTimeShownIdx = Math.floor(currentTimeShownIdx/(INTERP+1));
            }


        } else {

            // Change the button and its text
            document.getElementById("changeVizButton").innerHTML = "<i class=\"fas fa-square fa-lg\"></i>";
            document.getElementById("changeVizButton").title = "2D viz";

            // Change the helper
            document.getElementById("help").title = "Scroll for zoom/dezoom; CTRL+Mouse/Arrow keys to more; Mouse to rotate."

            viz3D = true;

            // Remove the stats if they are shown
            if (statsShown) {
                statsShown = false;

                // Update the class of the visualization
                viz.classList.add("col");
                viz.classList.remove("col-xl-8");

                // Remove the div for the stats
                $('#statDiv').remove();

                // Hide the scroll bar
                $('body').css("overflow-y", "hidden");
            }

            // Stop the animation
            clearInterval(pedMover);

            // Delete everything for the 2D
            // Defined in visualization/2D/js/main.js
            deleteStuff2D();

            // If the speed factor is less than 2, we have to go back to the interpolated data.
            // => we have to change the current index of the animation
            if (SPEEDFACTOR <= 2) {
                currentTimeShownIdx *= (INTERP+1);
            }

        }

        // Prepare the visualization
        // Defined above
        prepViz();

        if(vizPaused) {
            // If the viz is paused, we only do 1 step
            // Defined above
            do1Step();
        } else {
            // Otherwise, we run the viz
            // Defined above
            runViz();
        }
    }
}

/**
 * Update the timer at each time step
 *
 * @param: time - time in seconds
 */
function updateTimer(time) {


    if (selectedTraj == null) {
        // We make sure that if no trajectory data are selected, we tell this to the user
        document.getElementById("timer").innerHTML = "No trajectory data!";
    } else {
        // Update the timer using the function secondsToHms defined in js/main/misc.js
        document.getElementById("timer").innerHTML = secondsToHms(time);
    }

    // Change the handle of the slider to display the current time
    slider.noUiSlider.setHandle(1, time, true);

}

function loading() {

    if (!presentationPlaying) {
        let timer = document.getElementById("timer");
        timer.innerHTML = "LOADING";

        keepFading($("#timer"));
    }
}



function finishedLoading() {

    $("#timer").stop(true, true);

    document.getElementById("timer").innerHTML = "0 [s.]";
    document.getElementById("timer").style.opacity = "1";
    document.getElementById("timer").style.display = "";

}

function createSlider() {

    slider = document.getElementById('slider');

    try {
        slider.noUiSlider.destroy();
    } catch (e) {
        // Do nothing
    };

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
    }, true);

    slider.noUiSlider.on('slide', function () {

        let times = slider.noUiSlider.get();

        changeTimes(times);
    });


    let handles = slider.querySelectorAll('.noUi-handle');
    handles[0].classList.add('outer');
    handles[1].classList.add('inner');
    handles[2].classList.add('outer');
}

/**
 * Get the time values from the slider to change some stuff in the visualization
 *
 * @param: times - Array: [minTime, currentTime, maxTime] in format HH:MM:SS
 */
function changeTimes(times) {

    // Get lower, upper bound, and current time in seconds
    const tmin = times[0].split(':').reduce((acc,time) => (60 * acc) + +time);
    const current = times[1].split(':').reduce((acc,time) => (60 * acc) + +time);
    const tmax = times[2].split(':').reduce((acc,time) => (60 * acc) + +time);

    // Set the original multiple to compute the number of index we have to change in the viz
    let mult = 10;

    // check if we're using the interpolated data
    if (viz3D & SPEEDFACTOR <= 2) {
        // Update the multiple if needed
        mult *= (INTERP+1);
    }

    // Check if the middle handle changed
    let middleChanged = false;
    if (tmin == minTime && tmax == maxTime) {
        middleChanged = true;
    }

    // Update the upper and lower bounds of the visualization
    minTime = tmin;
    maxTime = tmax;

    // Change the value of the index of the position update
    currentTimeShownIdx = parseInt(mult*(current-minTime));

    if (!vizPaused) {
        // If the viz was not paused, we need to stop it and restart it
        clearInterval(pedMover);

        // Defined above
        runViz();
    } else {
        // Otherwise, we can just do 1 step
        // Defined above
        do1Step();
    }

    if (statsShown && !middleChanged) {
        // If the stats are shown and the lower or the upper bound was changed, we need to redraw the histograms
        // Defined in visualization/stats/js/main.js
        reDrawHist();
    }
}

/**
 * Append the options using an external HTML file
 */
function appendOptions() {

    let file;

    // Get the path of the file
    if (viz3D) {
        file = './assets/templates/options3D.html';
    } else {
        file = './assets/templates/options2D.html';
    }

    // Use jquery to get the file
    $.get(file, function(opts) {
        // Use Mustache to render the file
        var rendered = Mustache.render(opts);

        // Append the rendered file to the viz
        $('#viz').append(rendered);

        // Hide it
        document.getElementById("dragOpt").style.display = "none";

        // And place it
        document.getElementById("dragOpt").style.top = 0 + "px";
        document.getElementById("dragOpt").style.left = 0 + "px";

        // Add the option to drag it
        // Using jquery-ui
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

        // Now, we check which buttons are enabled
        if (!viz3D) {

            // Disable the button for the density
            document.getElementById("voronoi_checkbox").disabled = true;

            // Check if all the traj have been loaded. If it's not the case, we have to disabled the button
            if (!allTrajLoaded) {
                document.getElementById("all_trajectories_checkbox").disabled = true;
            }

            // If the user didn't select some trajectories, we hide some options
            if (selectedTraj == null) {
                document.getElementById("optTraj").style.display = "none";

            }

            // Add the option to show the options of the stats
            $( "#optionsStatsButton" ).click(function() {

                // Check if the options of the Chord diagram are shown
                // TODO: DO a better hack than this. =P
                if(document.getElementById("optODChord").style.display === "") {

                    // Change the icon
                    document.getElementById("optionsStatsButton").innerHTML = "<i class=\"fas fa-plus fa-lg\"></i>";

                    // Hide the options
                    document.getElementById("optODChord").style.display = "none";
                    document.getElementById("opt_tt").style.display = "none";
                    document.getElementById("opt_density").style.display = "none";
                } else {

                    // Change the icon
                    document.getElementById("optionsStatsButton").innerHTML = "<i class=\"fas fa-minus fa-lg\"></i>"

                    // Show the options
                    document.getElementById("optODChord").style.display = "";
                    document.getElementById("opt_tt").style.display = "";
                    document.getElementById("opt_density").style.display = "";
                }
            });
        } else if (STYLE == "TWD") {
            // If we are in 3D and using the style TWD, we need to check the appropriate checkbox
            document.getElementById("changeStyle").checked = true;
        }

    });
}

/**
 * Remove the options
 */
function removeOptions() {
    $("#dragOpt").remove();
    document.getElementById("optionsButton").style.display = "";
    optionsShown = false;
}

/**
 * Resize the visualization
 */
function resizeViz() {

    // Get the height of the viz
    // Defined in js/main/misc.js
    let vizHeight = getVizHeight();

    // Change the size of the div mainViz
    document.getElementById("mainViz").style.height = vizHeight + "px";

    if (vizPrepared) {
        // If the viz is prepared, we can update the 3D canvas or the 2D SVG
        // If not, we don't have to do anything =)
        if (viz3D) {

            // Get the width
            let width = document.body.clientWidth;

            // Update the camera
            camera.aspect = width / vizHeight;
            camera.updateProjectionMatrix();

            // Update the renderer
            renderer.setSize(width, vizHeight);

        } else {

            // Update the height of the SVG
            document.getElementById("svgCont").style.height = vizHeight + "px";
        }
    }

    // Scroll to the top (just in case)
    $('html,body').scrollTop(0);


    if (statsShown) {
        // If the stats are shown, we check if they have to be shown on the right or below.
        if (window.innerWidth >= 1200) {
            // If it's on the right (big screen), we hide the scrolling of the main page
            $('body').css("overflow-y", "hidden");
            // And show the scrolling for the stats
            document.getElementById("statDiv").style.overflowY = 'scroll';
        } else {
            // Otherwise (small screen), we show the scrolling of the main page
            $('body').css("overflow-y", "auto");
            // And hide the scrolling for the stats
            document.getElementById("statDiv").style.overflowY = 'hidden';
        }
    } else {
        $('body').css("overflow-y", "hidden");
    }
}

