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
function toggleZone(checkbox, target) {
    if (d3.select(checkbox).property("checked")) {
        d3.selectAll(target).style("opacity", 1);
    } else {
        d3.selectAll(target).style("opacity", 0);
    }
}
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