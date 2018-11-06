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
    let rect_area = (rect[1][0]-rect[0][0])*(rect[1][1]-rect[0][1]);
    let v = d3.voronoi()
        .extent(rect);
    let voronoi_polygons = v.polygons(filterPointInPolygon(vertices, ".voronoi-area"));
    let areas = voronoi_polygons.map(d => d3.polygonArea(d));
    let normalized_areas = areas.map(d => d/rect_area);
    let voronois = svg.selectAll(".voronoi-poly").data(voronoi_polygons);
    voronois.enter().append("path")
        .attr("class", "voronoi-poly")
        .attr("d", line)
        .style("fill", (d,i)=> pedQosColor(normalized_areas[i]))
        .attr("mask", "url(#voronoi-mask)");
}

function pedQosColor(p) {
    let color;
    if (p >= 0.7788)
        color = "rgb(0,0,255)";
    else if (p >= 0.5577 && p < 0.7788)
        color = "rgb(0,255,255)";
    else if (p >= 0.3341 && p < 0.5577)
        color = "rgb(0,255,0)";
    else if (p >= 0.2236 && p < 0.3341)
        color = "rgb(255,255,0)";
    else if (p >= 0.1106 && p < 0.2236)
        color = "rgb(255,128,0)";
    else
        color = "rgb(255,0,0)";
    return color;
}
function drawVoronoiArea(svg) {
//
//     var dragging = false, drawing = false, startPoint;
//     var svg = d3.select('body').append('svg')
//         .attr('height', 1000)
//         .attr('width', 1000);
//     var points = [], g;
// // behaviors
//     var dragger = d3.behavior.drag()
//         .on('drag', handleDrag)
//         .on('dragend', function(d){
//             dragging = false;
//         });
//     svg.on('mouseup', function(){
//         if(dragging) return;
//         drawing = true;
//         startPoint = [d3.mouse(this)[0], d3.mouse(this)[1]];
//         if(svg.select('g.drawPoly').empty()) g = svg.append('g').attr('class', 'drawPoly');
//         if(d3.event.target.hasAttribute('is-handle')) {
//             closePolygon();
//             return;
//         };
//         points.push(d3.mouse(this));
//         g.select('polyline').remove();
//         var polyline = g.append('polyline').attr('points', points)
//             .style('fill', 'none')
//             .attr('stroke', '#000');
//         for(var i = 0; i < points.length; i++) {
//             g.append('circle')
//                 .attr('cx', points[i][0])
//                 .attr('cy', points[i][1])
//                 .attr('r', 4)
//                 .attr('fill', 'yellow')
//                 .attr('stroke', '#000')
//                 .attr('is-handle', 'true')
//                 .style({cursor: 'pointer'});
//         }
//     });
//     function closePolygon() {
//         svg.select('g.drawPoly').remove();
//         var g = svg.append('g');
//         g.append('polygon')
//             .attr('points', points)
//             .style('fill', getRandomColor());
//         for(var i = 0; i < points.length; i++) {
//             var circle = g.selectAll('circles')
//                 .data([points[i]])
//                 .enter()
//                 .append('circle')
//                 .attr('cx', points[i][0])
//                 .attr('cy', points[i][1])
//                 .attr('r', 4)
//                 .attr('fill', '#FDBC07')
//                 .attr('stroke', '#000')
//                 .attr('is-handle', 'true')
//                 .style({cursor: 'move'})
//                 .call(dragger);
//         }
//         points.splice(0);
//         drawing = false;
//     }
//     svg.on('mousemove', function() {
//         if(!drawing) return;
//         var g = d3.select('g.drawPoly');
//         g.select('line').remove();
//         var line = g.append('line')
//             .attr('x1', startPoint[0])
//             .attr('y1', startPoint[1])
//             .attr('x2', d3.mouse(this)[0] + 2)
//             .attr('y2', d3.mouse(this)[1])
//             .attr('stroke', '#53DBF3')
//             .attr('stroke-width', 1);
//     })
//     function handleDrag() {
//         if(drawing) return;
//         var dragCircle = d3.select(this), newPoints = [], circle;
//         dragging = true;
//         var poly = d3.select(this.parentNode).select('polygon');
//         var circles = d3.select(this.parentNode).selectAll('circle');
//         dragCircle
//             .attr('cx', d3.event.x)
//             .attr('cy', d3.event.y);
//         for (var i = 0; i < circles[0].length; i++) {
//             circle = d3.select(circles[0][i]);
//             newPoints.push([circle.attr('cx'), circle.attr('cy')]);
//         }
//         poly.attr('points', newPoints);
//     }
//     function getRandomColor() {
//         var letters = '0123456789ABCDEF'.split('');
//         var color = '#';
//         for (var i = 0; i < 6; i++) {
//             color += letters[Math.floor(Math.random() * 16)];
//         }
//         return color;
//     }
//
//     //
//     svg.on("mousedown", function() {
//         console.log("clicked!");
//         console.log(`x coordinate: ${d3.mouse(this)[0]}, y coordinate: ${d3.mouse(this)[1]}`);
//     });

// HARD CODING

    let voronoi_area = [[17.33799934387207, 11.62181282043457],
        [14.961999893188477, 12.377812385559082],
        [14.961999893188477, 14.375812530517578],
        [17.607999801635742, 16.265811920166016],
        [20.038000106811523, 14.48381233215332],
        [19.983999252319336, 12.21581268310546]];

    svg.append("mask")
        .attr("id", "voronoi-mask")
        .append("polygon")
        .attr("points", voronoi_area.map(p => p.join(",")).join(" "))
        .attr("fill", "white");

    svg.append("polygon")
        .attr("class", "voronoi-area")
        .attr("points", voronoi_area.map(p => p.join(",")).join(" "));
}
function clearCanvas() {
    console.log("clearing voronoi_area");
    d3.select('voronoi_area').remove();
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

function runAnimation(json, voronoi_layer, pedes_layer) {
    d3.json(json)
        .then(data => {
            data.map( each_time => {
                d3.timeout( () => {
                    checkVoronoi(each_time.data, voronoi_layer);
                    updatePosition(each_time.data, pedes_layer);
                }, each_time.time * 1000);
            })
        });
}
function checkVoronoi(data, svg) {
    if (d3.select("#voronoi_checkbox").property("checked")) {
        deleteVoronoi(svg);
        drawVoronoi(data, svg);
    } else {
        deleteVoronoi(svg);
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
    clearCanvas();
}