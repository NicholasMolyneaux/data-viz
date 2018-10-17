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
function updatePosition(data) {
    let pedes = d3.select("g").selectAll("circle").data(data, d => d.id);
    pedes.enter().append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d  => d.y)
        .attr("r", 0.1);
    pedes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    pedes.exit().remove();
}

// function showVoronoi(data) {
//
// }

function runAnimation(json) {
    let g = d3.select("g");
    g.selectAll("circle").remove();
    d3.json(json)
        .then(data => {
            data.map( each_time => {
                d3.timeout( () => {
                    updatePosition(each_time.data);
                    //showVoronoi(each_time.data);
                    }, each_time.time * 1000);
            })
        });
}