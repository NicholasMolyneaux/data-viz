/*********************************************************/
/*                                                       */
/*   File with the animation of the pedestrian in 2D     */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

/**
 * Run the 2D animation, i.e. prepare everything to update the position of the pedestrians
 */
function runAnimation2D() {

    // Get some SVG layers
    const voronoi_poly_layer = d3.select(".voronoi_poly_layer");
    const pedes_layer = d3.select(".pedes_layer");
    const voronoi_canvas = d3.select(".voronoi_canvas");

    // Get the time bounds and filter the data based on the bounds
    const timeBounds = [minTime, maxTime];
    const trajDataFiltered = trajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);

    // Main function to be used at regular intervals
    function walkData() {
        // Reset the index of the positions of the pedestrians once we're at the end
        if (currentTimeShownIdx >= trajDataFiltered.length) {
            currentTimeShownIdx = 0;
        }

        // Get the current time
        let current_time = trajDataFiltered[currentTimeShownIdx].time;

        // Get the current position and filter them by OD
        // filterByOD defined in visualization/2D/js/map.js
        let current_filtered_data_by_od = filterByOD(trajDataFiltered[currentTimeShownIdx].data, trajSummary);

        // Check if the density checkbox has been checked. If it's the case, draw the densities
        // Defined in visualization/2D/js/map.js
        checkVoronoi(current_filtered_data_by_od, voronoi_poly_layer, voronoi_canvas);

        // Compute the pedestrian speed by using the position difference between two intervals
        let ped_speed = current_filtered_data_by_od.map( d => {
            let v = 0;
            // Check if we want to show the ped speed
            // If not, the speed will be 0 which corresponds to the color red
            if (d3.select("#ped_speed").property("checked")) {
                // Show the colorbar
                d3.selectAll(".colorbar").style("opacity", 1);

                if (currentTimeShownIdx !== 0) {
                    // Get the previous position
                    trajDataFiltered[currentTimeShownIdx - 1].data.map(p => {
                        // Get the one linked to the current pedestrian d
                        if (p.id === d.id) {
                            // Compute the absolute value of the speed
                            v = Math.abs(Math.sqrt(Math.pow(p.x - d.x, 2) + Math.pow(p.y - d.y, 2))) / (Number(trajDataFiltered[currentTimeShownIdx].time) - Number(trajDataFiltered[currentTimeShownIdx - 1].time));
                        }
                    })
                }
            } else {
                // Hide the colorbar
                d3.selectAll(".colorbar").style("opacity", 0);
            }

            // Return the id and the speed
            return {"id":d.id, "speed": v};
        });
        // Update the position of the pedestrians
        // Defined below
        updatePosition2D(current_filtered_data_by_od, ped_speed, pedes_layer);

        // Update the time
        // Defined in js/main/viz.js
        updateTimer(current_time);

        // Update the index of the position
        currentTimeShownIdx += 1;
    }

    // Set the interval and say that the viz is running
    pedMover = setInterval(walkData, INTERVAL2D/SPEEDFACTOR);
    vizPaused = false;
}

/**
 * Run one step of the 2D animation
 *
 * Basically, move the pedestrians where they are supposed to be at the current time
 */
function runOneStep2D() {

    // If a trajectory was selected, we can do something
    if (selectedTraj != null) {

        // Get some SVG layers
        const voronoi_poly_layer = d3.select(".voronoi_poly_layer");
        const pedes_layer = d3.select(".pedes_layer");
        const voronoi_canvas = d3.select(".voronoi_canvas");

        // Get the time bounds and filter the data based on the bounds
        const timeBounds = [minTime, maxTime];
        const trajDataFiltered = trajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);

        // Get the current time
        let current_time = trajDataFiltered[currentTimeShownIdx].time;

        // Get the current position and filter them by OD
        // filterByOD defined in visualization/2D/js/map.js
        let current_filtered_data_by_od = filterByOD(trajDataFiltered[currentTimeShownIdx].data, trajSummary);

        // Sometimes, we can have error if some buttons are disabled => try catch =)
        try {
            // Check if the density checkbox has been checked. If it's the case, draw the densities
            // Defined in visualization/2D/js/map.js
            checkVoronoi(current_filtered_data_by_od, voronoi_poly_layer, voronoi_canvas);
        } catch (e) {
            // Do Nothing;
        }

        // Compute the pedestrian speed by using the position difference between two intervals
        let ped_speed = current_filtered_data_by_od.map( d => {
            let v = 0;

            // Same as computing the densities
            try {
                // Check if we want to show the ped speed
                // If not, the speed will be 0 which corresponds to the color red
                if (d3.select("#ped_speed").property("checked")) {
                    if (currentTimeShownIdx !== 0) {
                        // Get the previous position
                        trajDataFiltered[currentTimeShownIdx - 1].data.map(p => {
                            // Get the one linked to the current pedestrian d
                            if (p.id === d.id) {
                                // Compute the absolute value of the speed
                                v = Math.abs(Math.sqrt(Math.pow(p.x - d.x, 2) + Math.pow(p.y - d.y, 2))) / (Number(trajDataFiltered[currentTimeShownIdx].time) - Number(trajDataFiltered[currentTimeShownIdx - 1].time));
                            }
                        })
                    }
                }
            } catch (e) {
                // Do Nothing!
            }

            // Return the id and the speed
            return {"id":d.id, "speed": v};
        });

        // Update the position of the pedestrians
        // Defined below
        updatePosition2D(current_filtered_data_by_od, ped_speed, pedes_layer);

        // Update the time
        // Defined in js/main/viz.js
        updateTimer(current_time);
    } else {
        // Otherwise, we make sure that the pedestrians are removed
        d3.selectAll('.ped-individual').remove();
    }
}

/**
 * Update the position of the pedestrians in 2D, i.e. redraw them =)
 *
 * @param: time_series_data - the data with all the pedestrians positions at a given time
 * @param: ped_speed - Array of object with the pedestrian speed and its id
 * @param: svg - SVG layer
 */
function updatePosition2D(time_series_data, ped_speed, svg) {

    // Get the pedestrian that are already in the viz and the new ones
    let pedes = svg.selectAll(".ped-individual").data(time_series_data, d => d.id);

    // If it's a new pedestrian, we append a circle
    let circles = pedes.enter().append("circle");

    // Update the attributes of the pedestrians
    circles
        .attr("class", "ped-individual")
        .attr("id", d => `ped_${d.id}`)
        .merge(pedes)
        // position
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 0.2)
        // There opacity based on the OD selection
        .attr("opacity", d => {
            if (d.selected) {
                return 1;
            } else {
                return 0.15;
            }
        })
        // Color in function of the speed
        .attr("fill", d => d3.interpolateRdYlGn((ped_speed.filter(p => p.id === d.id)[0].speed)/2))
        // Click function to show its trajectory
        .on("click", d => {
            const trajectory_canvas = d3.select(".trajectories_layer");
            if (trajectory_canvas.select(`#traj_${d.id}`).empty()) {
                const traj_data = trajectoryDataByID.filter(td => td.id === d.id);
                plotData(traj_data, trajectory_canvas);
            } else {
                trajectory_canvas.select(`#traj_${d.id}`).remove();
            }
        })
        // Functions to highlight it
        .on("mouseover", function () {
            d3.select(this).style("r", 0.3);
        })
        .on("mouseout", function () {
            d3.select(this).style("r", 0.2);
        });

    // If a pedestrian left, we need to delete it and remove its trajectory
    pedes.exit()
        .each(d => {
            const trajectory_canvas = d3.select(".trajectories_layer");
            trajectory_canvas.select(`#traj_${d.id}`).remove();
        })
        .remove();

}