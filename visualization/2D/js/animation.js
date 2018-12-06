function updatePosition(time_series_data, od, svg) {
    // Update circles (pedestrians)
    // Filter by OD
    let filtered_time_series_data = filterByOD(time_series_data, od);
    let pedes = svg.selectAll(".ped-individual").data(filtered_time_series_data, d => d.id);
    pedes.enter().append("circle")
        .attr("class", "ped-individual")
        .attr("id", d => d.id)
        .merge(pedes)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 0.25);
    pedes.exit().remove();

}

function runAnimation(voronoi_poly_layer ,voronoi_canvas,  pedes_layer, tmin, tmax) {
    trajData.map( each_time => {
        d3.timeout( () => {
            checkVoronoi(each_time.data, voronoi_poly_layer, voronoi_canvas);
            updatePosition(each_time.data, trajSummary, pedes_layer);
        }, (each_time.time-tmin) * 1000);
    })
}