function updatePosition2D(time_series_data, ped_speed, svg) {
    // Update circles (pedestrians)
    let pedes = svg.selectAll(".ped-individual").data(time_series_data, d => d.id);
    pedes.enter().append("circle")
        .attr("class", "ped-individual")
        .attr("id", d => d.id)
        .merge(pedes)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 0.25)
        .attr("fill", d => d3.interpolateRdYlGn((ped_speed.filter(p => p.id === d.id)[0].speed)/2));
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
        let current_time = trajDataFiltered[currentTimeShownIdx].time;
        let current_filtered_data_by_od = filterByOD(trajDataFiltered[currentTimeShownIdx].data, trajSummary);
        checkVoronoi(current_filtered_data_by_od, voronoi_poly_layer, voronoi_canvas);
        let ped_speed = current_filtered_data_by_od.map( d => {
            let v = 0;
            if (d3.select("#ped_speed").property("checked")) {
                if (currentTimeShownIdx !== 0) {
                    trajDataFiltered[currentTimeShownIdx - 1].data.map(p => {
                        if (p.id === d.id) {
                            v = Math.abs(Math.sqrt(Math.pow(p.x - d.x, 2) + Math.pow(p.y - d.y, 2))) / (Number(trajDataFiltered[currentTimeShownIdx].time) - Number(trajDataFiltered[currentTimeShownIdx - 1].time));
                        }
                    })
                }
            }
            return {"id":d.id, "speed": v};
        });
        updatePosition2D(current_filtered_data_by_od, ped_speed, pedes_layer);
        updateTimer(current_time);
        currentTimeShownIdx += 1;
    }

    pedMover = setInterval(walkData, INTERVAL2D/SPEEDFACTOR);
}

function runOneStep2D() {

    const voronoi_poly_layer = d3.select(".voronoi_poly_layer");
    const pedes_layer = d3.select(".pedes_layer");

    const timeBounds = [minTime, maxTime];

    const trajDataFiltered = trajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);

    let current_time = trajDataFiltered[currentTimeShownIdx].time;
    let current_filtered_data_by_od = filterByOD(trajDataFiltered[currentTimeShownIdx].data, trajSummary);
    checkVoronoi(current_filtered_data_by_od, voronoi_poly_layer, voronoi_canvas);
    let ped_speed = current_filtered_data_by_od.map( d => {
        let v = 0;
        if (d3.select("#ped_speed").property("checked")) {
            if (currentTimeShownIdx !== 0) {
                trajDataFiltered[currentTimeShownIdx - 1].data.map(p => {
                    if (p.id === d.id) {
                        v = Math.abs(Math.sqrt(Math.pow(p.x - d.x, 2) + Math.pow(p.y - d.y, 2))) / (Number(trajDataFiltered[currentTimeShownIdx].time) - Number(trajDataFiltered[currentTimeShownIdx - 1].time));
                    }
                })
            }
        }
            return {"id":d.id, "speed": v};
        });

    updatePosition2D(current_filtered_data_by_od, ped_speed, pedes_layer);
    updateTimer(current_time);
}