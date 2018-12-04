function updatePosition2D(time_series_data, od, svg) {
    // Update circles (pedestrians)
    // Filter by OD

    // TODO: FIX WHEN NOT CLICKED
    //let filtered_time_series_data = filterByOD(time_series_data, od);
    let pedes = svg.selectAll(".ped-individual").data(time_series_data, d => d.id);
    pedes.enter().append("circle")
        .attr("class", "ped-individual")
        .attr("id", d => d.id)
        .merge(pedes)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 0.25);
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

function runAnimation(voronoi_poly_layer , pedes_layer) {

    const timeBounds = [minTime, maxTime];

    const trajDataFiltered = trajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);

    function walkData() {
        if (currentTimeShownIdx >= trajDataFiltered.length) {
            currentTimeShownIdx = 0;
            //clearInterval(pedMover);
        }
        checkVoronoi(trajDataFiltered[currentTimeShownIdx].data, voronoi_poly_layer);
        updatePosition2D(trajDataFiltered[currentTimeShownIdx].data, trajSummary, pedes_layer);
        updateTimer(trajDataFiltered[currentTimeShownIdx].time);
        currentTimeShownIdx += 1;
    }

    pedMover = setInterval(walkData, INTERVAL2D/SPEEDFACTOR);
}

function runOneStep(voronoi_poly_layer , pedes_layer) {
    const timeBounds = [minTime, maxTime];

    const trajDataFiltered = trajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);

    updatePosition2D(trajDataFiltered[currentTimeShownIdx].data, trajSummary, pedes_layer);
    updateTimer(trajDataFiltered[currentTimeShownIdx].time);
}