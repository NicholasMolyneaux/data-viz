/*********************************************************/
/*                                                       */
/*   All the function used to add some overlying maps    */
/*   in the 2D visualization.                            */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

///////////////////////////////////////////////////////////
//                                                       //
//                 Density functions                     //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Draw the Voronoi area (drawn by the user)
 *
 * This function is not used to draw the densities inside. Just the lines around it.
 *
 * @param: svg - SVG layer
 * @param: polygon - array of points defining a polygon
 */
function drawVoronoiArea(svg, polygon) {

    // First, we clear the canvas, just in case
    svg.select("#subSvgCont").selectAll("*").remove();

    // Compute the polygon hull (defined in library d3-polygon.v1)
    let polygon_hull = d3.polygonHull(polygon);

    // Add circle at each vertex
    polygon_hull.map(d => {
        svg.append("circle")
            .attr("class", "voronoi-pre-circle")
            .attr("cx", d[0])
            .attr("cy", d[1])
            .attr("r", 0.15);
    });

    // Add a mask to to hide the density (later on) outside of the polygon
    svg.append("mask")
        .attr("id", "voronoi-mask")
        .append("polygon")
        .attr("points", polygon_hull.map(p => p.join(",")).join(" "))
        .attr("fill", "white");

    // Draw the polygon hull
    d3.select(".voronoi_poly_layer").append("polygon")
        .attr("id", "voronoi-area")
        .attr("points", polygon_hull.map(p => p.join(",")).join(" "));
}

/**
 * Check if the density checkbox has been checked. If yes, draw the densities on the SVG
 *
 * @param: data - pedestrian positions
 * @param: voronoi_poly_layer - SVG layer with the polygon of the control area
 * @param: voronoi_canvas - SVG layer on which we'll draw the densities
 */
function checkVoronoi(data, voronoi_poly_layer, voronoi_canvas) {
    // Check if the checkbox is checked
    if (d3.select("#voronoi_checkbox").property("checked")) {
        // Clear the canvas
        voronoi_canvas.selectAll("*").remove();

        // Show the colorbar
        d3.selectAll(".voronoi-los").style("opacity",1);
        // For each voronoi area
        voronoi_poly_layer.selectAll("*").each(function () {
            // We compute and draw the density
            // Defined below
            drawDensityInVoronoi(data, d3.select(this), voronoi_canvas);
        })

    } else {
        // Otherwise, we delete the canvas and hide the colorbar for the Level of Service (LOS)
        d3.selectAll(".voronoi-los").style("opacity",0);
        voronoi_canvas.selectAll("*").remove();
    }
}

/**
 * Draw the density inside the polygon, i.e. the voronoi areas
 *
 * @param: data - pedestrian positions
 * @param: polygon - Polygon object from d3-polygon.v1
 * @param: canvas - SVG layer
 */
function drawDensityInVoronoi(data, polygon, canvas) {
    // Get the rectangle around the voronoi area
    // Defined below
    let rect = rectangleContainPolygon(polygon);

    // Using the d3-voronoi.v1 library, we extent the rectangle to compute the voronoi areas inside
    let v = d3.voronoi()
        .extent(rect);

    // Transform the polygon into an array
    // Defined below
    let clip = polygonToArray(polygon);

    // Check which pedestrian is inside the polygon
    // Defined below
    let data_in_voronoi_area = filterPointInPolygon(data, polygon);

    // Get the center of each voronoi area
    let voronoi_polygons = v.polygons(data_in_voronoi_area.map(d => [d.x, d.y]));
    if (polygon.attr("id") === "voronoi-area") {
        voronoi_polygons = voronoi_polygons.map(p =>d3.polygonClip(clip, p));
    }

    // Compute the areas of the voronoi areas
    let areas = voronoi_polygons.map(d => d3.polygonArea(d));

    // Map the voronoi polygons with some IDs
    let voronoi_polygons_with_id = voronoi_polygons.map((d,i) => {return {"d":d, "id":data_in_voronoi_area[i].id}});

    // DEBUG
    // let publish_json = encodeJson(data_in_voronoi_area, areas);
    // console.log(publish_json);

    // Draw the areas with the color based on the LOS (Level Of Service)
    let voronois = canvas.selectAll("path").data(voronoi_polygons_with_id, d => d.id);
    voronois.enter().append("path")
        .attr("class", "voronoi-poly")
        .merge(voronois)
        .attr("d", d => line(d.d))
        // pedLosColor defined below
        .style("fill", (d,i)=> pedLosColor(areas[i]))
        .style("opacity", 0.7);
}

/**
 * Extract the rectangle around the polygon
 *
 * @param: polygon - Polygon object from d3-polygon.v1
 */
function rectangleContainPolygon(polygon) {
    // Transform the polygon into an array
    // Defined below
    let polygon_array = polygonToArray(polygon);

    // Get the X and Y coordinates
    let x_coordinates = polygon_array.map(d => d[0]);
    let y_coordinates = polygon_array.map(d => d[1]);

    // Get the min and max values, i.e. two corners of the rectangle
    return [[d3.min(x_coordinates), d3.min(y_coordinates)], [d3.max(x_coordinates), d3.max(y_coordinates)]];
}

/**
 * Filter the points that are inside a polygon
 *
 * @param: data - Position of the pedestrians
 * @param: polygon - Polygon object from d3-polygon.v1
 */
function filterPointInPolygon(data, polygon) {
    // Transform the polygon into an array of points
    // Defined below
    let polygon_array = polygonToArray(polygon);
    // Filter them
    return data.filter(d => d3.polygonContains(polygon_array, [d.x, d.y]));
}

/**
 * Tranform a polygon into an array of points
 *
 * @param: polygon - Polygon object from d3-polygon.v1
 */
function polygonToArray(polygon) {
    return polygon.attr("points").split(" ").map(s => s.split(",").map(n => Number(n)));
}

///////////////////////////////////////////////////////////
//                                                       //
//              Trajectories functions                   //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Plots a single trajectory
 *
 * !!! Async function since there can be many trajectories !!!
 *
 * @param data: pedestrian data (one or multiple pedestrians)
 * @param svg - SVG layer
 */
async function plotData(data, svg) {

    // Draw the path of one trajectory
    async function drawPath(traj) {
        const newData = [];
        // Get the x and y coordinates of each position update
        for (i = 0; i < traj.x.length; i++) {newData.push({"x": traj.x[i], "y": traj.y[i]})}

        // Apped the path as a line
        svg.append("path")
            .datum(newData)
            .attr("class", "trajectories")
            .attr("id", `traj_${traj.id}`)
            .attr("d", line);
    }

    // Define the line
    var line = d3.line()
        .x(function(d, i) { return d.x; })
        .y(function(d, i) { return d.y; })
        .curve(d3.curveMonotoneX);

    // For each pedestrian in the data, we draw the path
    for (lineData of data) {
        drawPath(lineData);
    }

}

/**
 * Plot the trajectories for all the pedestrians
 *
 * @param svg - SVG layer
 */
function plotAllTrajectories(svg) {
    // Plot the traj for all the trajectories. (Can take some time...)
    plotData(trajectoryDataByID, svg);

}

///////////////////////////////////////////////////////////
//                                                       //
//                  Other functions                      //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Filter the pedestrians by the selected OD (Origin-Destination)
 *
 * @param data - position of the pedestrians at a given time
 * @param od - Set of selected Origin and Destination
 */
function filterByOD(data, od) {
    // Check od set is empty (no click at all)
    if (od_selection.Origins.size === 0 && od_selection.Destinations.size === 0) {
        // All pedestrians are selected
        return data.map(d => {return {"id": d.id, "x": d.x, "y": d.y, "selected": true}});
    }

    // Only destinations exist
    if (od_selection.Origins.size === 0) {
        return data.map(d => {
            let isSelected = false;
            let od_ped = od.filter(o => o.id === d.id)[0];
            if (od_ped === undefined) {
                isSelected = false;
            } else {
                // A pedestrian is selected if its destination is in the set of selected destinations
                isSelected = od_selection.Destinations.has(od_ped.d);
            }
            return {"id": d.id, "x": d.x, "y": d.y, "selected": isSelected};
        });
    }

    // Only origins exist
    if (od_selection.Destinations.size === 0) {
        return data.map(d => {
            let isSelected = false;
            let od_ped = od.filter(o => o.id === d.id)[0];
            if (od_ped === undefined) {
                isSelected = false;
            } else {
                // A pedestrian is selected if its origin is in the set of selected origins
                isSelected = od_selection.Origins.has(od_ped.o);
            }
            return {"id": d.id, "x": d.x, "y": d.y, "selected": isSelected};
        });
    }

    // Both exist
    return data.map(d => {
        let isSelected = false;
        let od_ped = od.filter(o => o.id === d.id)[0];
        if (od_ped === undefined) {
            isSelected = false;
        } else {
            // A pedestrian is selected if both its origin and destination are in the sets of
            // selected origins and destinations is in the set of selected origins
            isSelected = od_selection.Origins.has(od_ped.o) && od_selection.Destinations.has(od_ped.d);
        }
        return {"id": d.id, "x": d.x, "y": d.y, "selected": isSelected};
    });
}

/**
 * Colors for the Level of Service
 *
 * Check the Process Book to see the different colors and their values.
 *
 * @param p - Value (area)
 */
function pedLosColor(p) {
    // Simple If Else to get the color based on the value p

    let color;
    if (p >= 3.24)
        color = "rgb(0,0,255)";
    else if (p >= 2.32 && p < 3.24)
        color = "rgb(0,255,255)";
    else if (p >= 1.39 && p < 2.32)
        color = "rgb(0,255,0)";
    else if (p >= 0.93 && p < 1.39)
        color = "rgb(255,255,0)";
    else if (p >= 0.46 && p < 0.93)
        color = "rgb(255,128,0)";
    else
        color = "rgb(255,0,0)";
    return color;
}

/**
 * Encode the json to print it later
 *
 * Used to check the values of the areas in the creation of the voronoi areas
 *
 * Used in function drawDensityInVoronoi (But commented now)
 *
 * @param:  data - pedestrians in the voronoi areas
 * @param: areas - Areas of the voronoi areas
 */
function encodeJson(data, areas) {
    return data.map((d, i) => {
        return {"id": d["id"], "density": 1 / areas[i]}
    });
}