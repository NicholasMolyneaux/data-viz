import * as drawVoronoiArea from './drawings.js';

async function drawWallsByPath(json) {
    let line = d3.line()
        .x( d => d.x)
        .y( d => d.y)
        .curve(d3.curveMonotoneX);
    const wall = await d3.json(json);
    // Draw walls
    let group_walls = d3.select("g");
    let data = Array.prototype.concat.apply([], wall["walls"].map( (w)  =>
        [{'x': w.x1, 'y': w.y1}, {'x': w.x2, 'y': w.y2}]
    ));

    group_walls.append("path")
        .attr("class", "the-walls")
        .attr("d", line(data));
    d3.select("#wallMask").append("path")
        .attr("d", line(data))
        .attr("fill", "white");
}
async function drawWalls(json) {
    const wall = await d3.json(json);
    // Draw walls
    let group_walls = d3.select("g");
    wall["walls"].map( (w)  => {
        group_walls.append("line")
            .attr("class", "the-walls")
            .attr("x1", w["x1"])
            .attr("y1", w["y1"])
            .attr("x2", w["x2"])
            .attr("y2", w["y2"]);
    }) ;
}
async function drawZones(json) {
    const graph = await d3.json(json);
    let group_zones = d3.select("g");
    graph["nodes"].map( (g) => {
        group_zones.append("rect")
            .attr("class", "the-zones")
            .attr("x", g["x1"])
            .attr("y", g["y1"])
            .attr("width", g["x2"]-g["x1"])
            .attr("height", g["y3"]-g["y2"]);
    });

    // Draw controlled area
    let controlled_areas = d3.select("g");
    graph["controlled_areas"].map( (c) => {
        controlled_areas.append("rect")
            .attr("class", "controlled-areas")
            .attr("x", c["x1"] )
            .attr("y", c["y1"] )
            .attr("width", c["x2"] - c["x1"])
            .attr("height", c["y3"] - c["y2"]);
    } );

    // Draw flow gate?
    let flow_gates = d3.select("g");
    graph["flow_gates"].map( f => {
        flow_gates.append("line")
            .attr("class", "flow-gates")
            .attr("x1", f["start_pos_x"] )
            .attr("y1", f["start_pos_y"] )
            .attr("x2", f["end_pos_x"] )
            .attr("y2", f["end_pos_y"] );
    } );
}
function updatePosition(time_series_data) {
    // Update circles (pedestrians)
    let svg_g = d3.select("g");
    let pedes = svg_g.selectAll(".ped-individual").data(time_series_data, d => d.id);
    pedes.enter().append("circle")
        .attr("class", "ped-individual")
        .merge(pedes)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    pedes.exit().remove();

    // Update path of each pedestrian
    //TODO: TOO SLOW!!!!
    // let pedes_path = svg_g.selectAll(".ped-trajectory");
    // pedes_path.data(time_series_data, d => d.id)
    //     .enter().append("path")
    //     .attr("class", "ped-trajectory")
    //     .attr("id", d => `tj_${d.id}`)
    //     .attr("d", d => `M ${d.x} ${d.y}`);
    // pedes_path
    //     .attr("d", d => {
    //         let current_position = d3.select(`#tj_${d.id}`).attr("d");
    //         return `${current_position} L ${d.x} ${d.y}`;
    //     });
    // pedes_path.exit().remove();
}
let line = d3.line()
    .x(d => d[0])
    .y(d => d[1]);

function drawVoronoi(data) {
    let vertices = data.map( d => [d.x, d.y]);
    let svg = d3.select("svg");
    let v = d3.voronoi()
        .extent([[Number(svg.attr("x")), Number(svg.attr("y"))], [
            Number(svg.attr("width")) + Number(svg.attr("x")), Number(svg.attr("height")) + Number(svg.attr("y"))]]);
    let voronois = d3.select("g").selectAll(".voronoi-poly").data(v.polygons(filterPointInPolygon(vertices, ".voronoi-area")));
    voronois.enter().append("path")
        .attr("class", "voronoi-poly")
        .attr("d", line)
        .attr("mask", "url(#voronoi-mask)");
}
function deleteVoronoi() {
    d3.select("g").selectAll(".voronoi-poly").remove();
}

function filterPointInPolygon(data, polygon_id) {
    let polygon = d3.select(polygon_id);
    let polygon_array = polygon.attr("points").split(" ").map(s => s.split(",").map(n => Number(n)));
    return data.filter(d => d3.polygonContains(polygon_array, d));
}
function runAnimation(json) {
    d3.json(json)
        .then(data => {
            data.map( each_time => {
                d3.timeout( () => {
                    updatePosition(each_time.data);
                    checkVoronoi(each_time.data);
                }, each_time.time * 1000);
            })
        });
}

function checkVoronoi(data) {
    if (d3.select("#voronoi_checkbox").property("checked")) {
        deleteVoronoi();
        drawVoronoi(data);
    } else {
        deleteVoronoi();
    }
}

//checkboxes
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

function setVoronoiArea() {
    drawVoronoiArea.clearCanvas();
}

export {drawWallsByPath, drawZones, runAnimation, checkZone, checkControl, checkFlow, setVoronoiArea};