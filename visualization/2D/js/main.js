let click_zone_active = false;
let connect_info;
let od_information;

// State of the control area button
let stateControlAreaButton = "idle";

// For OD filtering
let od_selection = {"Origins": new Set(), "Destinations": new Set()};


let line = d3.line()
    .x(d => d[0])
    .y(d => d[1]);

function centerOfRect(rect) {
    let x_center = Number(rect.attr("x")) + Number(rect.attr("width"))/2;
    let y_center = Number(rect.attr("y")) + Number(rect.attr("height"))/2;
    return {"x": x_center, "y": y_center};
}

function encodeJson(data, areas) {
    return data.map((d,i) => {return {"id": d["id"], "density": 1/areas[i]}});
}

function publish(json) {
    console.log(json);
}

//checkboxes

function checkZone() {
    if (d3.select("#zone_checkbox").property("checked")) {
        drawZones(zonesData, d3.select(".structure_layer"));
    } else {
        d3.selectAll(".the-zones").remove();
        d3.selectAll(".zone-text-overlay").remove();
        od_selection = {"Origins": new Set(), "Destinations": new Set()};

    }
}
function checkControl() {
    if (d3.select("#control_checkbox").property("checked")) {
        drawControlAreas(areasData, d3.select(".voronoi_poly_layer"));
    } else {
        d3.selectAll(".controlled-areas").remove();
    }
}
function checkFlow() {
    if (d3.select("#flow_checkbox").property("checked")) {
        d3.selectAll(".flow-gates").style("opacity", 1);
    } else {
        d3.selectAll(".flow-gates").style("opacity", 0);
    }
}

/**
 * Triggered when the show all trajectories button is selected in the 2D options.
 * The voronoi densities and the controlled areas must be removed when plotting the trajectories.
 * The moving pedestrians must also be removed.
 */
function checkTrajectories() {
    if (d3.select("#all_trajectories_checkbox").property("checked")) {

        // remove densites
        d3.select("#voronoi_checkbox").property("checked", false);
        clearCanvas(d3.select(".voronoi_canvas"));

        // removes control areas
        d3.select("#control_checkbox").property("checked", false);
        checkControl();

        // pausing time
        // Copied from viz.js lines 283-285. Wrap all of this into a functio ideally.
        clearInterval(pedMover);
        document.getElementById("playPauseButton").innerHTML = "<i class=\"fas fa-play fa-lg\"></i>";
        vizPaused = true;
        // removes dots
        d3.select(".pedes_layer").selectAll(".ped-individual").remove();

        // show trajectories
        plotAllTrajectories(d3.select(".trajectories_layer"));

    } else {
        // remove trajectories
        d3.select(".trajectories_layer").selectAll(".trajectories").remove();

        // add pedestrians again
        runViz();
        document.getElementById("playPauseButton").innerHTML = "<i class=\"fas fa-pause fa-lg\"></i>";
        vizPaused = false;

    }
}