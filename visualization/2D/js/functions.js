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

async function drawStructures(baseURL, name, svg) {

    // Draw the walls
    fetch(baseURL + "walls" + "/" + name).then(response => {
        return response.json();
    }).then(wall => {
        drawWalls(wall, svg)
    }).catch(err => {
        console.log(err)
    });

    // Draw the zones
    fetch(baseURL + "zones" + "/" + name).then(response => {
        return response.json();
    }).then(zones => {
        drawZones(zones, svg)
    }).catch(err => {
        console.log(err)
    });

    // Draw the gates
    fetch(baseURL + "gates" + "/" + name).then(response => {
        return response.json();
    }).then(gates => {
        drawGates(gates, svg)
    }).catch(err => {
        console.log(err)
    });

    /*
    // Draw the Areas
    fetch(baseURL + "areas" + "/" + name).then(response => {
        return response.json();
    }).then(zones => {
        drawAreas(zones, svg)
    }).catch(err => {
        console.log(err)
    });
    */
}

function drawWalls(wall, svg) {
    // Draw walls
    console.log(wall);
    wall.map( (w)  => {
        svg.append("line")
            .attr("class", "the-walls")
            .attr("x1", w["x1"])
            .attr("y1", w["y1"])
            .attr("x2", w["x2"])
            .attr("y2", w["y2"]);
    }) ;
}
function drawZones(zones, svg) {

    zones.map( (g) => {
        // Append zones
        let node = svg.append("rect")
            .attr("class", "the-zones")
            .attr("id", g["name"])
            .attr("x", g["x1"])
            .attr("y", g["y1"])
            .attr("width", g["x2"]-g["x1"])
            .attr("height", g["y3"]-g["y2"]);

        // Control zones
        node.on("click", function () {
            determineOD(this.getAttribute("id"));
        });

    });
    // Draw invisible arrows
    // connect_info = graph["connectivity"];
    // graph["connectivity"].map( a => {
    //     let from = a["node"];
    //     let to = a["connected_to"];
    //     if (!(to.length == 0)) {
    //         let from_center = centerOfRect(d3.selectAll(".the-zones").filter(`#${from}`));
    //         to.map( d => {
    //             let to_center = centerOfRect(d3.selectAll(".the-zones").filter(`#${d}`));
    //             svg.append("line")
    //                 .attr("class", "the-flow-lines")
    //                 .attr("id", `${from}:${d}`)
    //                 .attr("x1", from_center["x"])
    //                 .attr("y1", from_center["y"])
    //                 .attr("x2", to_center["x"])
    //                 .attr("y2", to_center["y"]);
    //         })
    //     }
    // });
}

function drawGates(gates, svg) {
    // Draw flow gate?
    gates.map( f => {
        svg.append("line")
            .attr("class", "flow-gates")
            .attr("x1", f["start_pos_x"] )
            .attr("y1", f["start_pos_y"] )
            .attr("x2", f["end_pos_x"] )
            .attr("y2", f["end_pos_y"] );
    } );
}

function drawAreas(areas, svg) {
    // Draw controlled area
    areas.map( (c) => {
        svg.append("rect")
            .attr("class", "controlled-areas")
            .attr("id", c["name"])
            .attr("x", c["x1"] )
            .attr("y", c["y1"] )
            .attr("width", c["x2"] - c["x1"])
            .attr("height", c["y3"] - c["y2"]);
    } );
}


function centerOfRect(rect) {
    let x_center = Number(rect.attr("x")) + Number(rect.attr("width"))/2;
    let y_center = Number(rect.attr("y")) + Number(rect.attr("height"))/2;
    return {"x": x_center, "y": y_center};
}

function updatePosition(time_series_data, svg) {
    // Update circles (pedestrians)
    let pedes = svg.selectAll(".ped-individual").data(time_series_data, d => d.id);
    pedes.enter().append("circle")
        .attr("class", "ped-individual")
        .attr("id", d => d.id)
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
    let data_in_voronoi_area = filterPointInPolygon(data, ".voronoi-area");
    let voronoi_polygons = v.polygons(data_in_voronoi_area.map(d => [d.x, d.y])).map(p => d3.polygonClip(clip, p));
    let areas = voronoi_polygons.map(d => d3.polygonArea(d));
    let publish_json = encodeJson(data_in_voronoi_area, areas);
    //publish(publish_json);
    let voronois = svg.selectAll(".voronoi-poly").data(voronoi_polygons);
    voronois.enter().append("path")
        .attr("class", "voronoi-poly")
        .attr("d", line)
        .style("fill", (d,i)=> pedLosColor(areas[i]))
        .style("opacity", 0.7)
        .attr("mask", "url(#voronoi-mask)");
}
function encodeJson(data, areas) {
    return data.map((d,i) => {return {"id": d["id"], "density": 1/areas[i]}});
}
function publish(json) {
    console.log(json);
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
    return data.filter(d => d3.polygonContains(polygon_array, [d.x, d.y]));
}

function polygonIDToArray(polygon_id) {
    let polygon = d3.select(polygon_id);
    console.log(polygon);
    let polygon_array = polygon.attr("points").split(" ").map(s => s.split(",").map(n => Number(n)));
    return polygon_array;
}
function rectangleContainPolygon(polygon_id) {
    let polygon_array = polygonIDToArray(polygon_id);
    let x_coordinates = polygon_array.map(d => d[0]);
    let y_coordinates = polygon_array.map(d => d[1]);
    return [[d3.min(x_coordinates), d3.min(y_coordinates)], [d3.max(x_coordinates), d3.max(y_coordinates)]];
}

function runAnimation(data, voronoi_poly_layer , pedes_layer, tmin, tmax) {
    data.map( each_time => {
        d3.timeout( () => {
            checkVoronoi(each_time.data, voronoi_poly_layer);
            updatePosition(each_time.data, pedes_layer);
        }, (each_time.time-tmin) * 1000);
    })
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

    if (stateControlAreaButton == 'idle') {

        stateControlAreaButton = 'drawing';
        document.getElementById("control_area").innerHTML = "Make Control Area";

        svg.on("click", function () {
            let mouse = d3.mouse(svg.select("#subSvgCont").node());
            console.log(mouse);
            voronoi_clip_canvas.append("circle")
                .attr("class", "voronoi-pre-circle")
                .attr("cx", mouse[0])
                .attr("cy", mouse[1]);
        })

    } else if (stateControlAreaButton == 'drawing') {

        stateControlAreaButton = 'drawn';
        document.getElementById("control_area").innerHTML = "Delete Control Area";

        // Remove onclick function
        svg.on("click", null);

        let pre_circles = Array.from(document.getElementsByClassName('voronoi-pre-circle')).map(d => [Number(d.attributes.cx.value), Number(d.attributes.cy.value)]);
        drawVoronoiArea(voronoi_clip_canvas, pre_circles);

    } else if (stateControlAreaButton == 'drawn') {

        console.log("ASD");

        stateControlAreaButton = 'idle';
        document.getElementById("control_area").innerHTML = "Draw Control Area";

        clearCanvas(voronoi_clip_canvas);
    }

    /*
    svg.on("click", function () {
        let mouse = d3.mouse(svg.select("#subSvgCont").node());
        console.log(mouse);
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
    */
}

function drawVoronoiArea(svg, polygon) {
    clearCanvas(svg.select("#subSvgCont"));
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