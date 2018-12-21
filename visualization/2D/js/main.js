/*********************************************************/
/*                                                       */
/*   Main functions for the 2D visualization             */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

///////////////////////////////////////////////////////////
//                                                       //
//                   Global variables                    //
//                                                       //
///////////////////////////////////////////////////////////

// State of the control area button
let stateControlAreaButton = "idle";

// For OD filtering
let od_selection = {"Origins": new Set(), "Destinations": new Set()};

// A line in d3
let line = d3.line()
    .x(d => d[0])
    .y(d => d[1]);


// Time interval between two updates of the position for the 2D
const INTERVAL2D = 100;

///////////////////////////////////////////////////////////
//                                                       //
//               Function for the 2D viz                 //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Prepare the 2D visualization
 */
function prepViz2D() {

    // Make sure that the 3D animations are canceled
    cancelAnimationFrame(animation);

    // Get the min/max positions of the infrastructure
    const xmin = selectedInfra.xmin,
        xmax = selectedInfra.xmax,
        ymin = selectedInfra.ymin,
        ymax = selectedInfra.ymax;

    // Add the main SVG
    let svg = d3.select("#viz")
        .append("svg")
        .attr("class", "container-fluid")
        .attr("id", "svgCont")
        .attr("height", getVizHeight())
        .attr("viewBox", `${xmin-1} ${ymin} ${xmax} ${ymax+10}`);

    // Add a group to zoom inside
    let svg_zoom = svg.append('g')
        .attr("id", "subSvgCont");

    // Add the function zoom
    svg.call(d3.zoom().on("zoom", () => {
            svg_zoom.attr("transform", d3.event.transform);
        }
    ));

    // Change the height of the viz
    vizHeight = getVizHeight();
    document.getElementById("mainViz").style.height = vizHeight + "px";
    document.getElementById("svgCont").style.height = vizHeight + "px";

    ///////////////////////////////////////////////////////
    // Append the different layers for the visualization //
    ///////////////////////////////////////////////////////

    // Layer for the structure
    let structure_layer = svg_zoom.append("g")
        .attr("class", "structure_layer");

    // Layer for the voronoi clip
    svg_zoom.append("g").attr("class", "voronoi_clip_layer");

    // Layer for the voronoi density areas
    svg_zoom.append("g").attr("class", "voronoi_canvas");

    // Layer for the polygon fo the voronoi areas
    svg_zoom.append("g").attr("class", "voronoi_poly_layer");

    // Layer for the pedestrians
    svg_zoom.append("g").attr("class", "pedes_layer");

    // Layer for showing all trajectories
    svg_zoom.append("g").attr("class", "trajectories_layer");

    // Draw the structures (the walls of the station)
    // Defined in visualization/2D/js/structure.js
    drawStructures(structure_layer);

    // Get the values of the viewBox
    let viewBox = svg.attr("viewBox").split(" ").map(d => Number(d));

    // Define some stuff for the colorbars
    let padding = 1;
    let r = [1/10, 1/7];

    // Colors of the Level of Service (LOS) (for the density)
    let los_colors = ["rgb(255,0,0)","rgb(255,128,0)","rgb(255,255,0)","rgb(0,255,0)","rgb(0,255,255)","rgb(0,0,255)"];
    // Values to be shopwn on the color bar for the LOS
    let boundaries = ["∞", 2.17, 1.08, 0.72, 0.43, 0.31, 0];

    // Draw the colorbar for the LOS
    drawColorbar("voronoi-los", svg, los_colors, boundaries, viewBox[2]-(viewBox[2]-viewBox[0])*(r[1]+r[0])-3*padding,
        viewBox[3]-5, (viewBox[2]-viewBox[0])*r[1], 5, padding, "Level of service [ped/m^2]");

    // Draw the colorbar for the speed
    drawColorbar("colorbar", svg, d3.schemeRdYlGn[10], [0,2], viewBox[2]-(viewBox[2]-viewBox[0])*r[0],
        viewBox[3]-5, (viewBox[2]-viewBox[0])*r[0], 5, padding, "Speed [m/s]");

    // Prepare the density data
    // Defined in js/main/data.js
    prepareDensityData();
}

/**
 * Delete the 2D viz
 */
function deleteStuff2D() {

    // Remove the div
    $("#svgCont").remove();

    // If the stats are shown, we need to reset the original class to the viz
    if (statsShown) {

        // Add the initial class and remove the added one
        viz.classList.add("col");
        viz.classList.remove("col-xl-8");

        // Remove the div with the stats
        $('#statDiv').remove();
    }
}
