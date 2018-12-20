/*********************************************************/
/*                                                       */
/*   File with all the options in the visualization      */
/*   2D options first, 3D options afterwards.             */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

///////////////////////////////////////////////////////////
//                                                       //
//                      2D options                       //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Show the OD zones
 *
 * Show the OD zones if the checkbox is checked
 */
function checkZone() {
    // Checked?
    if (d3.select("#zone_checkbox").property("checked")) {
        // Yes => draw the zones
        // Defined in visualization/2D/js/structure.js
        drawZones(zonesData, d3.select(".structure_layer"));
    } else {
        // No, delete the zones and the overlays
        d3.selectAll(".the-zones").remove();
        d3.selectAll(".zone-text-overlay").remove();

        // Set the OD selection to its original state
        od_selection = {"Origins": new Set(), "Destinations": new Set()};

    }
}

/**
 * Show the control areas from the data
 *
 * Show the control areas zones if the checkbox is checked
 */
function checkControl() {
    // Checked?
    if (d3.select("#control_checkbox").property("checked")) {
        // Yes => draw the control areas
        // Defined in visualization/2D/js/structure.js
        drawControlAreas(areasData, d3.select(".voronoi_poly_layer"));

        // Make the density checkbox enabled
        document.getElementById("voronoi_checkbox").disabled = false;
    } else {
        // Delete the control areas
        d3.selectAll(".controlled-areas").remove();

        // Uncheck the density button and disabled it
        document.getElementById("voronoi_checkbox").disabled = true;
        document.getElementById("voronoi_checkbox").checked = false;
    }
}

/**
 * Show the flow gates from the data
 *
 * Show the flow gates if the checkbox is checked
 * Currently not used since they have not been implemented in the simulation, yet.
 */
function checkFlow() {
    // Checked?
    if (d3.select("#flow_checkbox").property("checked")) {
        // Yes => Show the gates
        d3.selectAll(".flow-gates").style("opacity", 1);
    } else {
        // No => Hide the gates
        d3.selectAll(".flow-gates").style("opacity", 0);
    }
}

/**
 * Draw the voronoi area, i.e. the new control zone
 *
 * This button has different state.
 *   State 1: Idle. Does nothing
 *   State 2: Drawing (let the user click to draw the area)
 *   State 3: Drawn (let the user display the density inside the newly drawn area)
 */
function setVoronoiArea() {

    // Get the SVG and the canvas to draw the voronoi area
    let svg = d3.select("svg");
    let voronoi_clip_canvas = d3.select(".voronoi_clip_layer");

    // Check for the different state of the button
    if (stateControlAreaButton === 'idle') {

        // We go from idle to drawing!

        // Remove the control areas from the data
        d3.selectAll(".controlled-areas").remove();

        // Change the state of the button and update its text
        stateControlAreaButton = 'drawing';
        document.getElementById("control_area").innerHTML = "Make Control Area";

        // Add the function to click on the svg and add the corners of the shape
        svg.on("click", function () {
            let mouse = d3.mouse(svg.select("#subSvgCont").node());
            voronoi_clip_canvas.append("circle")
                .attr("class", "voronoi-pre-circle")
                .attr("cx", mouse[0])
                .attr("cy", mouse[1])
                .attr("r", 0.15);
        });

        // Uncheck and disable the checkbox for the density
        document.getElementById("voronoi_checkbox").checked = false;
        document.getElementById("voronoi_checkbox").disabled = true;

        // Uncheck and disable the checkbox for the control areas from the data
        document.getElementById("control_checkbox").checked = false;
        document.getElementById("control_checkbox").disabled = true;


    } else if (stateControlAreaButton == 'drawing') {

        // We go from drawing to drawn!

        // Change state of button and update its text
        stateControlAreaButton = 'drawn';
        document.getElementById("control_area").innerHTML = "Delete Control Area";

        // Remove click function
        svg.on("click", null);

        // Get all the clicked position of the user
        let pre_circles = Array.from(document.getElementsByClassName('voronoi-pre-circle')).map(d => [Number(d.attributes.cx.value), Number(d.attributes.cy.value)]);
        // Draw the Voronoi area
        // Defined in visualization/2D/js/map.js
        drawVoronoiArea(voronoi_clip_canvas, pre_circles);
        // Delete the circles
        d3.selectAll(".voronoi-pre-circle").remove();

        // Prepare the density data with the new area
        // Defined in js/main/data.js
        prepareDensityData();

        // If the stats are shown, we redraw the histogram for density
        if (statsShown) {
            // Defined in visualization/stats/main.js
            reDrawHistDensity();
        }

        // Enable the button to show density
        document.getElementById("voronoi_checkbox").disabled = false;

    } else if (stateControlAreaButton == 'drawn') {

        // We go from drawn to iddle!

        // Change state of the button and update its text
        stateControlAreaButton = 'idle';
        document.getElementById("control_area").innerHTML = "Draw Control Area";

        // Delete the drawn voronoi area
        d3.select("#voronoi-area").remove();

        // Clear the canvas
        // Defined in visualization/2D/js/map.js
        clearCanvas(voronoi_clip_canvas);

        // Prepare the density data with the area from the data
        // Defined in js/main/data.js
        prepareDensityData();

        // If the stats are shown, we redraw the histogram for density
        if (statsShown) {
            // Defined in visualization/stats/main.js
            reDrawHistDensity();
        }

        // Disabled and uncheck the button to show density
        document.getElementById("voronoi_checkbox").disabled = true;
        document.getElementById("voronoi_checkbox").checked = false;

        // Enable the button to show the areas from the data
        document.getElementById("control_checkbox").disabled = false;
    }
}

/**
 * Show all the trajectories
 *
 * Triggered when the show all trajectories button is selected in the 2D options.
 */
function checkTrajectories() {
    if (d3.select("#all_trajectories_checkbox").property("checked")) {
        // Show the trajectories
        // Defined in visualization/2D/js/map.js
        plotAllTrajectories(d3.select(".trajectories_layer"));

    } else {
        // Remove trajectories
        d3.select(".trajectories_layer").selectAll(".trajectories").remove();

    }
}

/**
 * Show statistics
 *
 * This function is called by the options for the statistics.
 * The goal is to show/hide the statistics.
 */
function showStatistics() {

    // Get the two divs from the main page
    let viz = document.getElementById("viz");
    let mainViz = document.getElementById("mainViz");

    // Check if the stats are shown or not
    if (statsShown) {
        statsShown = false;

        // Get the show stats button and update its text
        let showStats = document.getElementById("showStats");
        showStats.innerHTML = "Show Statistics";

        // Update the class of the visualization
        viz.classList.add("col");
        viz.classList.remove("col-xl-8");

        // Remove the div for the stats
        $('#statDiv').remove();

        // Hide the scroll bar
        $('body').css("overflow-y", "hidden");

        // Hide the button for the options of the stats
        document.getElementById("divOptStats").style.display = "none";

        // Reset the button for showing the options of the stats
        document.getElementById("optionsStatsButton").innerHTML = "<i class=\"fas fa-plus fa-lg\"></i>"

    } else {
        statsShown = true;

        // Show the button for the options of the stats
        document.getElementById("divOptStats").style.display = "";

        // Update the class of the visualization
        viz.classList.remove("col");
        viz.classList.add("col-xl-8");

        // Create a div to show the stats
        let statDiv = document.createElement("div");

        // Add some classes
        statDiv.classList.add("col");
        statDiv.classList.add("col-xl-4");

        // Add an id and add it to the mainViz
        statDiv.setAttribute("id", "statDiv");
        mainViz.appendChild(statDiv);

        // Load the mustache templates
        $.get('./assets/templates/stats.html', function(opts) {
            var rendered = Mustache.render(opts);

            // Append it to the stats
            $('#statDiv').append(rendered);

            // Prepare the graphs (defined in visualization/stats/js/main.js
            prepareChord();
            addHistograms();
        });

        // Update the button to hide the stats
        document.getElementById("showStats").innerHTML = "Hide Stats";

        // Check if we need to add the scrollbar for the stats
        if (window.innerWidth >= 1200) {
            $('body').css("overflow-y", "hidden");
            document.getElementById("statDiv").style.overflowY = 'auto';
        } else {
            $('body').css("overflow-y", "auto");
            document.getElementById("statDiv").style.overflowY = 'hidden';
        }
    }
}

///////////////////////////////////////////////////////////
//                                                       //
//                      3D options                       //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Hide/show the walls
 *
 * Simply change the height of the walls to something very small. =)
 */
function hideWalls() {

    // Check if the walls were hidden
    if (wallsHidden) {

        // For each walls, we put back the original position and scale
        walls.forEach(w => {
            w.scale.y = 1;
            w.position.y = wallHeight/2;
        });

        // Show the ceiling
        ceiling.visible = true;

        // Walls are not hidden anymore
        wallsHidden = false;
    } else {

        // Change scale and vertical position of the walls to
        // make them really small.
        walls.forEach(w => {
            w.scale.y = 0.01;
            w.position.y = 0.01;
        });

        // Hide the ceiling
        ceiling.visible = false;

        // Walls are hidden
        wallsHidden = true;
    }

}

/**
 * Change the style of the 3D viz (between TWD and normal)
 *
 * TWD = zombies + flickering lights
 * normal = pedestrians + normal light
 */
function changeStyle3D() {

    // Disable the changeStyle button to let the 3D reload all the models
    document.getElementById("changeStyle").disabled = true;

    // Cancel the 3D animation
    cancelAnimationFrame(animation);

    // Stop the visualization
    clearInterval(pedMover);

    // Change the style
    if (STYLE == "TWD") {
        STYLE = "normal";
    } else {
        STYLE = "TWD";
    }

    // Remove the canvas for the 3D
    $("#canvas").remove();

    // Delete everything in the 3D
    // Defined in visualization/3D/js/main.js
    deleteStuff3D();

    // Prepare the visualization again without reloading the options
    // Defined in js/main/viz.js
    prepViz(true);

    // Check if the presentation is playing. If it's the case, do nothing
    if (!presentationPlaying) {
        // Otherwise, check if the animation is paused.
        if(vizPaused) {
            // Yes => do 1 step to load the 3D models
            // Defined in js/main/viz.js
            do1Step();
        } else {
            // No => run the visualization
            // Defined in js/main/viz.js
            runViz();
        }
    }

    // Add a timeout of 2s. to enabled the changeStyle button again
    setTimeout(function() {
        document.getElementById("changeStyle").disabled = false;
    }, 2000);
}

///////////////////////////////////////////////////////////
//                                                       //
//                         Both                          //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Hide the options
 */
function hideOptions() {

    // Show the options button and hide the option div
    document.getElementById("optionsButton").style.display = "";
    document.getElementById("dragOpt").style.display = "none";

    optionsShown = false;
}