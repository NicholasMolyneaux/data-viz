let click_zone_active = false;
let connect_info;

// State of the control area button
let stateControlAreaButton = "idle";

let findDestinationFromSource = function(source_id) {
    connect_info.map(a => {
        let from = a["node"];
        if (a["node"] === source_id) {
            return a["connected_to"];
        }
    });
};
let determineOD = function(id) {
    // check activate the click or not and change the state
    if (click_zone_active) {
        // check there is destination
        let destination = findDestinationFromSource(id);

    }
    else {
        click_zone_active = true
    }

};

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
        d3.selectAll(".the-zones").style("opacity", 1);
    } else {
        d3.selectAll(".the-zones").style("opacity", 0);
    }
}
function checkControl() {
    if (d3.select("#control_checkbox").property("checked")) {
        d3.selectAll(".controlled-areas").style("opacity", 1);
    } else {
        d3.selectAll(".controlled-areas").style("opacity", 0);
    }
}
function checkFlow() {
    if (d3.select("#flow_checkbox").property("checked")) {
        d3.selectAll(".flow-gates").style("opacity", 1);
    } else {
        d3.selectAll(".flow-gates").style("opacity", 0);
    }
}