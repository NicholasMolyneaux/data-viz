// Import graph.js and wall.js
//import wall from "./wall.js";
//import graph from "./graph.js";

const x_offset = Math.min(...wall["walls"].map( (w) => Math.min(w["x1"], w["x2"]) ));
const y_offset = Math.min(...wall["walls"].map( (w) => Math.min(w["y1"], w["y2"]) ));
const x_length = Math.max(...wall["walls"].map( (w) => Math.max(w["x1"], w["x2"]) )) - x_offset;
const y_length = Math.max(...wall["walls"].map( (w) => Math.max(w["y1"], w["y2"]) )) - y_offset;
const xy_ratio = y_length/x_length;

// Define Height and width for SVG canvas
const width = 500;
const height = xy_ratio*width;
const pad = 0.01;
const scale = width/x_length;

// SVG canvas
let svg = d3.select("body").append("svg")
    .attr("class", "container")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox",`${x_offset} ${y_offset} ${x_length} ${y_length}`);

// Draw walls
let group_walls = svg.append("g");
wall["walls"].map( (w)  => {
    group_walls.append("line")
        .attr("class", "the-walls")
        .attr("x1", w["x1"])
        .attr("y1", w["y1"])
        .attr("x2", w["x2"])
        .attr("y2", w["y2"]);
}) ;

// Draw zones
let group_zones = svg.append("g");
graph["nodes"].map( (g) => {
     group_zones.append("rect")
         .attr("class", "the-zones")
         .attr("x", g["x1"])
         .attr("y", g["y1"])
         .attr("width", g["x2"]-g["x1"])
         .attr("height", g["y3"]-g["y2"]);
 });


// Draw controlled area
let controlled_areas = svg.append("g");
graph["controlled_areas"].map( (c) => {
    controlled_areas.append("rect")
        .attr("class", "controlled-areas")
        .attr("x", c["x1"] )
        .attr("y", c["y1"] )
        .attr("width", c["x2"] - c["x1"])
        .attr("height", c["y3"] - c["y2"]);
} );

// Draw flow gate?
let flow_gates = svg.append("g");
graph["flow_gates"].map( f => {
    flow_gates.append("line")
        .attr("class", "flow-gates")
        .attr("x1", f["start_pos_x"] )
        .attr("y1", f["start_pos_y"] )
        .attr("x2", f["end_pos_x"] )
        .attr("y2", f["end_pos_y"] );
} );

// Draw trajectories
let ped_trajectories = svg.append("g");
let ped_individuals = svg.append("g");
let lineFunction = d3.svg.line()
    .x(d => d.x)
    .y(d => d.y)
    .interpolate("linear");

const trajectories_list = Object.keys(trajectories).map(k => k);
trajectories_list.map( t => {
    // Ready trajectories (paths)
    ped_trajectories.append("path")
        .attr("class", "ped-trajectory")
        .attr("id",`path_${t}`)
        .attr("d", lineFunction(trajectories[t]));

    // Ready pedestrians
    ped_individuals.append("circle")
        .attr("class", "ped-individual")
        .attr("id", `user_${t}`);
} );

// Move pedestrians
let svgNS = 'http://www.w3.org/2000/svg';
let cumDistance = (arr) => {
    let temp_arr = arr;
    return arr.map( (a, i) => {
        let pos;
        if(i == 0)
            {pos = temp_arr[0];}
        else
            {pos = temp_arr[i-1];}
        return Math.hypot(a.x-pos.x, a.y-pos.y);
    } ).reduce( (a, x, i) => [...a, x + (a[i-1] || 0)], []);
};

trajectories_list.map( t => {
    let indivisual = document.getElementById(`user_${t}`);
    let ani = document.createElementNS(svgNS, "animateMotion");
    let begin = trajectories[t][0]['time'];
    let dur = trajectories[t][trajectories[t].length-1]['time']-begin;
    let mpath = document.createElementNS(svgNS, "mpath");
    let path_position = cumDistance(trajectories[t]);

    ani.setAttribute("dur", dur);
    ani.setAttribute("class", "animation");
    ani.setAttribute("begin", trajectories[t][0]['time']);
    ani.setAttribute("calcMode", "linear");
    ani.setAttribute("keyTimes", trajectories[t].map( u => (u.time - begin)/dur).join(";"));
    ani.setAttribute("keyPoints" , path_position.map(p => p/path_position[path_position.length-1]).join(";"));
    mpath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#path_${t}`);
    ani.appendChild(mpath);
    indivisual.appendChild(ani);
});
