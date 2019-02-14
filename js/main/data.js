/*********************************************************/
/*                                                       */
/*   File with the functions linked to the data + some   */
/*   global variables.
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

///////////////////////////////////////////////////////////
//                                                       //
//                   Global variables                    //
//                                                       //
///////////////////////////////////////////////////////////

/** Global variables for the data */
let wallsData = null;
let zonesData = null;
let gatesData = null;
let areasData = null;
let trajData = null;
let trajSummary = null;

/** Original set of keys for chord diagram */
let chordKeysOriginalData = [];

/** data used for plotting trajectories of pedestrians */
let trajectoryDataByID = [];

/** Data for the histograms */
let histTT = null;
let densityData = null;
let histDensity = null;

/** Iinterpolated data */
let interpolatedTrajData = null;

///////////////////////////////////////////////////////////
//                                                       //
//              General Loading Functions                //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Load all the data linked to the infrastructure
 *
 * => walls, zones, gates, and control areas
 * !!! Async function !!!
 */
async function loadInfraData() {

    // Load the walls
    await fetch(baseURL + "infra/walls/" + selectedInfra.name).then(response => {
        return response.json();
    }).then(walls => {
        wallsData = walls;
    }).catch(err => {
        console.log(err)
    });

    // Load the OD zones
    await fetch(baseURL + "infra/zones/" + selectedInfra.name).then(response => {
        return response.json();
    }).then(zones => {
        zonesData = zones;
    }).catch(err => {
        console.log(err)
    });

    // Load the flow gates (NOT USED)
    await fetch(baseURL + "infra/gates/" + selectedInfra.name).then(response => {
        return response.json();
    }).then(gates => {
        gatesData = gates;
    }).catch(err => {
        console.log(err)
    });

    // Load the control areas
    await fetch(baseURL + "infra/monitoredareas/" + selectedInfra.name).then(response => {
        return response.json();
    }).then(monitoredareas => {
        areasData = monitoredareas;
    }).catch(err => {
        console.log(err)
    });
}

/**
 * Load all the data linked to the trajectories
 *
 * => trajectories by time and summary
 * !!! Async function !!!
 */
async function loadTrajData() {

    // Load the trajectories by time
    const urlTraj = baseURL + "trajectoriesbytime/"+selectedInfra.name+"/"+selectedTraj.name;

    await fetch(urlTraj).then(response => {
        return response.json();
    }).then(data => {
        trajData = data;
    }).catch(err => {
        console.log(err)
    });

    // load the summary of trajectories
    const urlSummary = baseURL + "summary/"+selectedInfra.name+"/"+selectedTraj.name;

    await fetch(urlSummary).then(response => {
        return response.json();
    }).then(data => {
        trajSummary = data;
    }).catch(err => {
        console.log(err)
    });
}

/**
 * Interpolate the trajectories
 *
 * Interpolate the data to add more data points by time.
 *
 * (Used by the 3D viz to avoid "jumping")
 */
function interPolateData() {

    // Function to go from array to an object
    const arrayToObject = (array) =>
        array.reduce((obj, item) => {
            obj[item.id] = item;
            return obj
        }, {});

    // Prepare the interpolated data
    interpolatedTrajData = [];

    // Go through the trajectories by time
    for(let i=0; i<trajData.length-1; i++) {

        // Push the initial data
        interpolatedTrajData.push(trajData[i]);

        // Get the initial and final
        const init = arrayToObject(trajData[i].data);
        const final = arrayToObject(trajData[i+1].data);

        // Intersection of keys
        // Defined in js/main/misc.js
        const inter = intersection(init, final);

        // Go through the number of interpolated points
        for(let j=1; j<=INTERP; j++) {

            // Create a new object and add the time
            let interpObj = new Object();
            interpObj['time'] = trajData[i].time + INTERVAL2D/(INTERP+1)*j/1000;

            // Go through each key (= pedestrian)
            let data = [];
            for(let k=0; k<inter.length; k++) {

                // Interpolate their x and y positions linearly
                const id = inter[k];
                let obj = new Object();
                obj['id'] = init[id]['id'];
                obj['x'] = (final[id]['x']-init[id]['x'])/(INTERP+1)*j + init[id]['x'];
                obj['y'] = (final[id]['y']-init[id]['y'])/(INTERP+1)*j + init[id]['y'];
                data.push(obj);
            }

            // Add them
            interpObj['data'] = data;
            interpolatedTrajData.push(interpObj);
        }
    }

}

/**
 * Get and down sample all the trajectories
 *
 * (We do this because there would be too many points otherwise.)
 *
 * This function is not async since we don't want to wait until it's finished to start the animation.
 * We let it run and enable the button in the options if it's finished.
 */
function downSampleTrajectories() {

    // Fetch the data
    fetch(baseURL + "trajectoriesbyid/" + selectedInfra.name + "/" + selectedTraj.name).then(response => {
        return response.json();
    }).then(data => {
        // Then, we start to down sample the data for each pedestrian
        for (ped of data) {
            // Prepare the array and object
            let downsampledPed = {};
            downsampledPed["id"] = ped.id;
            downsampledPed["time"] = [];
            downsampledPed["x"] = [];
            downsampledPed["y"] = [];

            // Down sample by 10
            for (let idx = 0; idx < ped.time.length; idx = idx+10) {
                downsampledPed.time.push(ped.time[idx]);
                downsampledPed.x.push(ped.x[idx]);
                downsampledPed.y.push(ped.y[idx]);
            }
            // Add the trajectories in the global variable
            trajectoryDataByID.push(downsampledPed);
        }

        // Say that the trajectories have been loaded and enable the button in the options
        allTrajLoaded = true;
        document.getElementById("all_trajectories_checkbox").disabled = false;

    }).catch(err => {
        console.log(err)
    });
}

///////////////////////////////////////////////////////////
//                                                       //
//             Functions for the histograms              //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Prepare the data for the histogram on Travel Time (TT)
 *
 * These data come from the summary of trajectories.
 * They depend on the OD selection and the time bounds.
 */
function prepareHistTT() {

    // Prepare some variables
    histTT = [];
    let add;

    // Check if there are some restrictions on the Origins and Destinations
    const restrOrigins = od_selection.Origins.size > 0;
    const restrDest = od_selection.Destinations.size > 0;

    // Go through each pedestrian
    trajSummary.forEach(ped => {

        add = true;

        // If there's a restriction on the Origin
        if(restrOrigins) {
            // We check if the pedestrian origin is in the set of selected origins
            if (!od_selection.Origins.has(ped.o)){
                // If it's not the case, we won't add it.
                add = false;
            }
        }

        // Same thing for the Destination
        if(restrDest) {
            if (!od_selection.Destinations.has(ped.d)){
                add = false;
            }
        }

        // We check that the entry and exit time of the pedestrian are between the
        // lower and upper bounds. We also check if we can add it based on OD restrictions
        if(ped.en >= minTime && ped.ex <= maxTime && add) {

            // Add the TT as the difference between exit and entry time
            histTT.push(ped.ex-ped.en);
        }

    });
}

/**
 * Prepare the data for the histogram on density
 *
 * These data come directly from the drawn control areas (either hand-made or from the data).
 * Since the final histogram depends on the time bounds, we first prepare the data by time
 * in this function each time a new control area is given. Then, we'll use a smaller function
 * to restrict the data by time
 */
function prepareDensityData() {

    // Get the SVG layer with the control area
    const voronoi_poly_layer = d3.select(".voronoi_poly_layer");

    // Reset the data
    densityData = [];

    // We check if the areasData is not empty (some structures do not have control areas in the data)
    // or if the control area button is set to drawn, i.e. the user has drawn a control area.
    if (areasData.length > 0 || stateControlAreaButton === 'drawn') {
        // If the control area was not drawn
        if (stateControlAreaButton != 'drawn') {
            // We need to compute the density based on the control area from the data.
            // Thus, we draw them and hide them (we don't want to show them to the user
            // if he doesn't want to see them.
            // Defined in visualization/2D/js/structure.js
            drawHiddenControlAreas(areasData, voronoi_poly_layer);
        }

        // We go through each timed data
        trajData.forEach(data => {

            // Prepare the object and add the time
            let timedData = new Object();
            timedData.time = data.time;
            let tmp  = [];

            // Compute the density for each area in the layer
            voronoi_poly_layer.selectAll("*").each(function () {
                tmp.push(
                    // Defined below
                    computeDensities(data.data, d3.select(this))
                )
            });

            // Flatten the area (in case there are multiple areas)
            timedData.area = [].concat.apply([], tmp);

            densityData.push(timedData);
        });

        // If we had to draw the hidden control area, we need to remove them
        if (stateControlAreaButton != 'drawn') {
            d3.selectAll(".controlled-areas-hidden").remove();
        }
    }

    // Prepare the final histogram data
    prepareHistDensity();
}

/**
 * Prepare the final data for the histogram on density based on preprocessed data
 */
function prepareHistDensity() {

    // First, we filter by time and get the areas in one array of arrays
    let tmp = densityData.filter(d => (d.time <= maxTime && d.time >= minTime)).map(a => a.area);

    // We flatten this array
    let areas = [].concat.apply([], tmp);

    // And we transform the areas by pedestrian into densities. (ped/sq meters)
    histDensity = areas.map(val => 1.0/val);
}

/**
 * Compute the densities using the Voronoi diagrams.
 *
 * Most of the functions are used in the function drawDensityInVoronoi in
 * visualization/2D/js/map.js
 */
function computeDensities(data, polygon) {
    // Build a rectangle containing the drawn polygon
    // Defined in visualization/2D/js/map.js
    let rect = rectangleContainPolygon(polygon);

    // Use the Voronoi library to extent the rectangle
    let v = d3.voronoi()
        .extent(rect);

    // Transform the polygon to an array
    // Defined in visualization/2D/js/map.js
    let clip = polygonToArray(polygon);

    // Get all the points that are inside the polygon
    // Defined in visualization/2D/js/map.js
    let data_in_voronoi_area = filterPointInPolygon(data, polygon);

    // Map the data points inside a polygon to a (x,y) coordinate
    let voronoi_polygons = v.polygons(data_in_voronoi_area.map(d => [d.x, d.y]));

    if (polygon.attr("id") === "voronoi-area") {
        // Mask the the polygon inside the rectangle.
        // Comes from library d3-polygon-clip.js
        voronoi_polygons = voronoi_polygons.map(p =>d3.polygonClip(clip, p));
    }

    // Return the area around
    return voronoi_polygons.map(d => d3.polygonArea(d));
}

///////////////////////////////////////////////////////////
//                                                       //
//              Initial loading of the data              //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Initial loading of all the infrstructure
 *
 * First, we load the list of infrastructure.
 * Then, we load the data of the first chosen data.
 */
function loadInfra() {

    // URL to get the list of infrastructure
    const url = baseURL + 'infralist';

    // Ajay call
    $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        crossDomain : true,
    })
        .done(function( data ) {
            // Save all the infrastructure
            infrastructures = data;

            // Fill the Select for changing the infrastructure for the first time.
            addInfra();

            // Load the data for the first infrastructure
            loadInfraData().then(() => {
                infraDataLoaded = true;
            });

            // Load the trajectories.
            // It's here because it has to be done after loading the infrastructure. =)
            loadTraj();
        })
        .fail( function(xhr, textStatus, errorThrown) {
            alert("Error... The backend seems to be dead. Please contact nicholas.molyneaux@epfl.ch.");
        });
}

/**
 * Add the infrastructure to the select for changing them later on.
 *
 * Second purpose is to transform the string for the initial infrastructure into the object for this infrastructure.
 */
function addInfra() {
    let idx = -1;

    // Go through each infrastructure
    infrastructures.forEach((infra, index) => {

        // Check if the name of the current infra
        // corresponds to the string for the selectedInfra.
        if(infra.name == selectedInfra) {
            // Change the string to the real object
            selectedInfra = infra;
            idx = index;
        }

        // Add the data to the given select for changing them later
        $('#infraData').append($('<option>', {
            value: infra.name,
            text: infra.name
        }))
    });

    // Update the HTML with the description
    document.getElementById('textDescInfra').innerHTML = infrastructures[idx]['description'];
    document.getElementById("infraData").selectedIndex = idx;
}

/**
 * Load the initial trajectories.
 */
function loadTraj() {

    const url = baseURL + 'trajlist/' + selectedInfra['name'];

    // Ajax call to get the list of trajectories belonging to an infrastructure
    $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        crossDomain : true,
    })
        .done(function( data ) {

            // Save the data for later.
            trajectories = data;

            // Add the description of the trajectories
            addTrajDescription();

            // Load the trajectory summary and the trajectories by time
            loadTrajData().then(() => {

                // Set the lower and upper bounds for the time
                minTime = selectedTraj.tmin;
                maxTime = selectedTraj.tmax;

                trajDataLoaded = true;

                // Prepare the data for the histogram
                prepareHistTT();

                // Interpolate the data for the 3D
                interPolateData();

                // Load and down sample the trajectories
                // Not waiting untile it's finished. =)
                downSampleTrajectories();

                // Create the slider for the time
                // Defined in js/main/viz.js
                createSlider();

                // Now, we can show the skip button for the presentation =)
                document.getElementById("skipPresentation").style.display = "";
            });
        })
        .fail( function(xhr, textStatus, errorThrown) {
            alert("Error... The backend seems to be dead. Please contact nicholas.molyneaux@epfl.ch.");
        });

}

/**
 * Initial adding of the description of the trajectories
 */
function addTrajDescription() {
    // Remove all options in the select
    $('#trajData').children('option').remove();

    let idx = -1;

    // Add the "no trajectory option"
    $('#trajData').append($('<option>', {
        value: "None",
        text: "No trajectory data"
    }));

    // Go through all trajectories
    trajectories.forEach((traj, index) => {

        // Initially, we want to get the object of the initial selected trajectory
        // Same as for the infrastructure
        if (presentationPlaying) {
            if(traj.name == selectedTraj) {
                selectedTraj = traj;
                idx = index;
            }
        }

        // Add the options in the select
        $('#trajData').append($('<option>', {
            value: traj.name,
            text: traj.name
        }))
    });

    // Update the description if some trajectories were selected or not.
    if (idx > -1) {

        // Check if the description was given or not
        if(trajectories[idx]['description'] == "") {
            document.getElementById('textDescTraj').innerHTML = "No description";
        } else {
            document.getElementById('textDescTraj').innerHTML = trajectories[idx]['description'];
        }
        document.getElementById("trajData").selectedIndex = idx+1;
    } else {
        document.getElementById('textDescTraj').innerHTML = "Only show the structure";

        document.getElementById("trajData").selectedIndex = 0;
    }

}

///////////////////////////////////////////////////////////
//                                                       //
//           Change data and update some HTML            //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Update the description of the infrastructure
 *
 * @param element HTML element (select)
 */
function updateDescriptionInfra(element) {

    // Get the name of the selected infrastructure
    const infraName = element.options[element.selectedIndex].value;

    // Get the index of the selected infrastructure
    const idx = infrastructures.map(function (e) {
        return e.name;
    }).indexOf(infraName);

    // Change the description of this infrastructure
    // If there is no description, just write no description =)
    if (infrastructures[idx]['description'] === "") {
        document.getElementById('textDescInfra').innerHTML = "No description";
    } else {
        document.getElementById('textDescInfra').innerHTML = infrastructures[idx]['description'];
    }

    // URL to have the list of trajectories linked to an infrastructure
    const url = baseURL + 'trajlist/' + infrastructures[idx]['name'];

    // Ajax call to get the trajectories
    $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        crossDomain: true,
    }).done(function (data) {
            // Update the list of trajectories
            trajectories = data;

            // Add the trajectories in the HTML
            // Define in
            addTrajDescription();
        }
    );
}

/**
 * Update the description of the trajectories
 *
 * @param element HTML element (select)
 */
function updateDescriptionTraj(element) {

    // Get the name of the selected trajectory
    const trajName = element.options[element.selectedIndex].value;

    // Get the index of this trajectory
    function isSelectedTraj(traj){return traj.name === trajName}
    const idx = trajectories.findIndex(isSelectedTraj);

    // Based on if it's something that exists or the option "no trajectory", we update the description
    if (idx == -1) {
        document.getElementById('textDescTraj').innerHTML = "Only show the structure";
    } else {

        // Just check if the description was given or not
        if (trajectories[idx]['description'] === "") {
            document.getElementById('textDescTraj').innerHTML = "No description";
        } else {
            document.getElementById('textDescTraj').innerHTML = trajectories[idx]['description'];
        }
    }

}

/**
 * New data have been selected, so we'll change them!
 */
function dataSelected() {

    // First, we say that the trajectories data are not loaded anymore
    trajDataLoaded = false;

    // We also remove the options (just to avoid some bugs)
    // Defined in js/main/viz.js
    removeOptions();

    // If the stats are shown, we go back to a full view without them
    if (statsShown) {

        // Change the class of the "viz"
        viz.classList.add("col");
        viz.classList.remove("col-xl-8");

        // Remove the div with the stats
        $('#statDiv').remove();

        // Hide the vertical scrollbar
        $('body').css("overflow-y", "hidden");

        statsShown = false;
    }

    // Stop the animation and change the icon
    clearInterval(pedMover);
    document.getElementById("playPauseButton").innerHTML = "<i class=\"fas fa-play fa-lg\"></i>";
    vizPaused = true;

    // We get the selected infrastructure
    let infraData = document.getElementById("infraData");
    const infraName = infraData.options[infraData.selectedIndex].value;

    let idx = infrastructures.map(function(e) { return e.name; }).indexOf(infraName);
    selectedInfra = infrastructures[idx];

    // We get the selected trajectories
    let trajData = document.getElementById("trajData");
    const trajName = trajData.options[trajData.selectedIndex].value;

    function isSelectedTraj(traj){return traj.name === trajName}

    idx = trajectories.findIndex(isSelectedTraj);

    // If the index == -1, it means that the user selected to not have the trajectories
    // Thus, we have to set the selectedTraj to null and the bounds to 0.
    if (idx == -1) {
        selectedTraj = null;

        minTime = 0;
        maxTime = 0;
    } else {
        // Otherwise, we give the true values of the trajectory.
        selectedTraj = trajectories[idx];

        minTime = selectedTraj.tmin;
        maxTime = selectedTraj.tmax;
    }

    // We start the loading screen
    // Defined in js/main/viz.js
    loading();

    // Hide some stuff
    document.getElementById("slider").style.visibility = "hidden";
    document.getElementById("leftButtons").style.visibility = "hidden";

    // Now, we delete the visualization based on if it was 2D or 3D
    if (viz3D) {
        deleteStuff3D();
    } else {
        deleteStuff2D();
    }

    // Depending whether a trajectory was selected, we need to do two different things.
    if (selectedTraj == null) {
        // Option: "No trajectory"

        // First, we load the infrastructure
        loadInfraData().then(() => {
            infraDataLoaded = true;

            // !!! HACK !!!
            // denhaag is too big to be shown in 3D
            // TODO: Add a 3D flag in the database
            if (selectedInfra.name === "denhaag") {
                // If denhaag is selected and we're in 3D, we need to go back to 2D.
                // Otherwise, we can simply prepare the viz.
                if (viz3D) {
                    viz3D = false;
                }
                // Hide the button for the 2D/3D
                document.getElementById("changeVizButton").style.display = "none";
            } else {

                // Make sure the button for the 2D/3D is visible
                document.getElementById("changeVizButton").style.display = "";
            }

            // Prepare the visualization
            // Defined in js/main/viz.js
            prepViz();

            // Even if we don't have trajectories, we need to set this value to true to stop the
            // continuous fade in/fade out. (defined in js/main/misc.js)
            trajDataLoaded = true;

            // Finish the loading
            // Defined in js/main/viz.js
            finishedLoading();

            // Just show instead of the time that there is no trajectory data!
            document.getElementById("timer").innerHTML = "No trajectory data!";
        });

    } else {
        // Option: Trajectories were chosen

        //First, we load the infra
        loadInfraData().then(() => {
            infraDataLoaded = true;


            // Still the same hack with denhaag
            // TODO: Add a 3D flag in the database
            if (selectedInfra.name === "denhaag") {
                // If denhaag is selected and we're in 3D, we need to go back to 2D.
                // Otherwise, we can simply prepare the viz.
                if (viz3D) {
                    viz3D = false;
                }

                // Hide the button for the 2D/3D
                document.getElementById("changeVizButton").style.display = "none";
            } else {
                // We make sure the 2D/3D button is shown.
                document.getElementById("changeVizButton").style.display = "";
            }

            // Prepare the visualization
            // Defined in js/main/viz.js
            prepViz();

            // Load the trajectory summary and the trajectories by time
            loadTrajData().then(() => {
                // Set the upper and lower bounds for the time
                minTime = selectedTraj.tmin;
                maxTime = selectedTraj.tmax;

                // Reset the index for the visualization
                currentTimeShownIdx = 0;

                // Prepare the time travel data
                prepareHistTT();

                // Prepare the density data
                prepareDensityData();

                // Interpolate the data for the 3D
                interPolateData();

                // Create the slider for the time
                createSlider();

                // Down sample the trajectories to plot them later on.
                downSampleTrajectories();

                // Trajectories finally loaded
                trajDataLoaded = true;

                // Finish the loading
                finishedLoading();

                // Make sure all the button are shown
                document.getElementById("slider").style.visibility = "visible";
                document.getElementById("leftButtons").style.visibility = "visible";

                // Play the visualization
                document.getElementById("playPauseButton").innerHTML = "<i class=\"fas fa-pause fa-lg\"></i>";
                vizPaused = false;

                // Defined in js/main/viz.js
                runViz();
            });
        });
    }
}