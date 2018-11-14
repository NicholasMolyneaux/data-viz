let line = d3.line()
    .x(d => d[0])
    .y(d => d[1]);

async function drawWallsByPath(json, svg) {
    let line = d3.line()
        .x( d => d.x)
        .y( d => d.y)
        .curve(d3.curveMonotoneX);
    const wall = await d3.json(json);
    // Draw walls
    let data = Array.prototype.concat.apply([], wall["walls"].map( (w)  =>
        [{'x': w.x1, 'y': w.y1}, {'x': w.x2, 'y': w.y2}]
    ));

    svg.append("path")
        .attr("class", "the-walls")
        .attr("d", line(data));
    d3.select("#wallMask").append("path")
        .attr("d", line(data))
        .attr("fill", "white");
}
async function drawWalls(json, svg) {
    const wall = await d3.json(json);
    // Draw walls
    wall["walls"].map( (w)  => {
        svg.append("line")
            .attr("class", "the-walls")
            .attr("x1", w["x1"])
            .attr("y1", w["y1"])
            .attr("x2", w["x2"])
            .attr("y2", w["y2"]);
    }) ;
}
async function drawZones(json, svg) {
    const graph = await d3.json(json);
    graph["nodes"].map( (g) => {
        svg.append("rect")
            .attr("class", "the-zones")
            .attr("x", g["x1"])
            .attr("y", g["y1"])
            .attr("width", g["x2"]-g["x1"])
            .attr("height", g["y3"]-g["y2"]);
    });

    // Draw controlled area
    graph["controlled_areas"].map( (c) => {
        svg.append("rect")
            .attr("class", "controlled-areas")
            .attr("x", c["x1"] )
            .attr("y", c["y1"] )
            .attr("width", c["x2"] - c["x1"])
            .attr("height", c["y3"] - c["y2"]);
    } );

    // Draw flow gate?
    graph["flow_gates"].map( f => {
        svg.append("line")
            .attr("class", "flow-gates")
            .attr("x1", f["start_pos_x"] )
            .attr("y1", f["start_pos_y"] )
            .attr("x2", f["end_pos_x"] )
            .attr("y2", f["end_pos_y"] );
    } );
}
function updatePosition(time_series_data, svg) {
    // Update circles (pedestrians)
    let pedes = svg.selectAll(".ped-individual").data(time_series_data, d => d.id);
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

//TODO: map to true rgb. gray scale now.
function drawVoronoi(data, svg) {
    let vertices = data.map( d => [d.x, d.y]);
    let rect = rectangleContainPolygon(".voronoi-area");
    let v = d3.voronoi()
        .extent(rect);
    let clip = polygonIDToArray(".voronoi-area");
    let voronoi_polygons = v.polygons(filterPointInPolygon(vertices, ".voronoi-area")).map(p => d3.polygonClip(clip, p));
    let areas = voronoi_polygons.map(d => d3.polygonArea(d));
    let voronois = svg.selectAll(".voronoi-poly").data(voronoi_polygons);
    voronois.enter().append("path")
        .attr("class", "voronoi-poly")
        .attr("d", line)
        .style("fill", (d,i)=> pedLosColor(areas[i]))
        .attr("mask", "url(#voronoi-mask)");
}

function pedLosColor(p) {
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


function clearCanvas(voronoi_clip_canvas) {
    voronoi_clip_canvas.selectAll("*").remove();
}
function deleteVoronoi(svg) {
    svg.selectAll(".voronoi-poly").remove();
}
function filterPointInPolygon(data, polygon_id) {
    let polygon_array = polygonIDToArray(polygon_id);
    return data.filter(d => d3.polygonContains(polygon_array, d));
}

function polygonIDToArray(polygon_id) {
    let polygon = d3.select(polygon_id);
    let polygon_array = polygon.attr("points").split(" ").map(s => s.split(",").map(n => Number(n)));
    return polygon_array;
}
function rectangleContainPolygon(polygon_id) {
    let polygon_array = polygonIDToArray(polygon_id);
    let x_coordinates = polygon_array.map(d => d[0]);
    let y_coordinates = polygon_array.map(d => d[1]);
    return [[d3.min(x_coordinates), d3.min(y_coordinates)], [d3.max(x_coordinates), d3.max(y_coordinates)]];
}

function runAnimation(json, voronoi_poly_layer , pedes_layer) {
    d3.json(json)
        .then(data => {
            data.map( each_time => {
                d3.timeout( () => {
                    checkVoronoi(each_time.data, voronoi_poly_layer);
                    updatePosition(each_time.data, pedes_layer);
                }, each_time.time * 1000);
            })
        });
}
function checkVoronoi(data, voronoi_poly_layer) {
    if (d3.select("#voronoi_checkbox").property("checked")) {
        deleteVoronoi(voronoi_poly_layer);
        drawVoronoi(data, voronoi_poly_layer);
    } else {
        deleteVoronoi(voronoi_poly_layer);
    }
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
function setVoronoiArea() {
    let svg = d3.select("svg");
    let voronoi_clip_canvas = d3.select(".voronoi_clip_layer");
    clearCanvas(voronoi_clip_canvas);

    svg.on("click", function () {
        let mouse = d3.mouse(this);
        voronoi_clip_canvas.append("circle")
            .attr("class", "voronoi-pre-circle")
            .attr("cx", mouse[0])
            .attr("cy", mouse[1]);
        if (d3.event.shiftKey) {
            let pre_circles = Array.from(document.getElementsByClassName('voronoi-pre-circle')).map(d => [Number(d.attributes.cx.value), Number(d.attributes.cy.value)]);
            drawVoronoiArea(voronoi_clip_canvas, pre_circles);
            console.log(`mouse click with shift at ${mouse[0]} and ${mouse[1]}`);

        }

    })
}

function drawVoronoiArea(svg, polygon) {
    clearCanvas(svg);
    let polygon_hull = d3.polygonHull(polygon);
    polygon_hull.map(d => {
        svg.append("circle")
            .attr("class", "voronoi-pre-circle")
            .attr("cx", d[0])
            .attr("cy", d[1]);
    });
    svg.append("mask")
        .attr("id", "voronoi-mask")
        .append("polygon")
        .attr("points", polygon_hull.map(p => p.join(",")).join(" "))
        .attr("fill", "white");

    svg.append("polygon")
        .attr("class", "voronoi-area")
        .attr("points", polygon_hull.map(p => p.join(",")).join(" "));
}