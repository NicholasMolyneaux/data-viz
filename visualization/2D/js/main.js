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


// Time interval between two updates of the position for the 2D
const INTERVAL2D = 100;

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