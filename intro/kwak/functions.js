async function drawWalls(json) {
    const wall = await d3.json(json);
    // Draw walls
    let group_walls = d3.select("svg").append("g");
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
    let group_zones = d3.select("svg").append("g");
    graph["nodes"].map( (g) => {
        group_zones.append("rect")
            .attr("class", "the-zones")
            .attr("x", g["x1"])
            .attr("y", g["y1"])
            .attr("width", g["x2"]-g["x1"])
            .attr("height", g["y3"]-g["y2"]);
    });


    // Draw controlled area
    let controlled_areas = d3.select("svg").append("g");
    graph["controlled_areas"].map( (c) => {
        controlled_areas.append("rect")
            .attr("class", "controlled-areas")
            .attr("x", c["x1"] )
            .attr("y", c["y1"] )
            .attr("width", c["x2"] - c["x1"])
            .attr("height", c["y3"] - c["y2"]);
    } );

    // Draw flow gate?
    let flow_gates = d3.select("svg").append("g");
    graph["flow_gates"].map( f => {
        flow_gates.append("line")
            .attr("class", "flow-gates")
            .attr("x1", f["start_pos_x"] )
            .attr("y1", f["start_pos_y"] )
            .attr("x2", f["end_pos_x"] )
            .attr("y2", f["end_pos_y"] );
    } );
}
function movePedestrians(pedes, data) {
    pedes.attr("cx", (d, i) => data[i].x)
        .attr("cy", (d, i) => data[i].y);
    pedes.enter()
        .append("circle")
        .attr("cx", (d, i) => data[i].x)
        .attr("cy", (d, i) => data[i].y)
        .attr("r", 0.1);
    pedes.exit().remove();
}
function runAnimation(json) {
    let svg = d3.select("svg");
    svg.selectAll("circle").remove();
    d3.json(json)
        .then(data => {
            data.map(each_time => {
                let pedes = svg.selectAll("circle").data(each_time.data.map(d => d.id));
                movePedestrians(pedes, each_time.data);
            })
        });
}