function updatePosition2D(time_series_data, od, svg) {
    // Update circles (pedestrians)
    let pedes = svg.selectAll(".ped-individual").data(time_series_data, d => d.id);
    pedes.enter().append("circle")
        .attr("class", "ped-individual")
        .attr("id", d => d.id)
        .merge(pedes)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 0.25);
    pedes.exit().remove();

}

function runAnimation2D() {

    const voronoi_poly_layer = d3.select(".voronoi_poly_layer");
    const pedes_layer = d3.select(".pedes_layer");
    const voronoi_canvas = d3.select(".voronoi_canvas");

    const timeBounds = [minTime, maxTime];

    const trajDataFiltered = trajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);

    function walkData() {
        if (currentTimeShownIdx >= trajDataFiltered.length) {
            currentTimeShownIdx = 0;
            //clearInterval(pedMover);
        }
        checkVoronoi(trajDataFiltered[currentTimeShownIdx].data, voronoi_poly_layer, voronoi_canvas);
        updatePosition2D(trajDataFiltered[currentTimeShownIdx].data, trajSummary, pedes_layer);
        updateTimer(trajDataFiltered[currentTimeShownIdx].time);
        currentTimeShownIdx += 1;
    }

    pedMover = setInterval(walkData, INTERVAL2D/SPEEDFACTOR);
}

function runOneStep2D() {

    const voronoi_poly_layer = d3.select(".voronoi_poly_layer");
    const pedes_layer = d3.select(".pedes_layer");

    const timeBounds = [minTime, maxTime];

    const trajDataFiltered = trajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);

    updatePosition2D(trajDataFiltered[currentTimeShownIdx].data, trajSummary, pedes_layer);
    updateTimer(trajDataFiltered[currentTimeShownIdx].time);
}