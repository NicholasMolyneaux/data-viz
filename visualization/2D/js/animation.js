function updatePosition(time_series_data, svg) {
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

function runAnimation(voronoi_poly_layer ,voronoi_canvas,  pedes_layer, tmin, tmax) {
    trajData.map( each_time => {
        d3.timeout( () => {
            // Filter by OD
            let filtered_time_series_data = filterByOD(each_time.data, trajSummary);
            checkVoronoi(filtered_time_series_data, voronoi_poly_layer, voronoi_canvas);
            updatePosition(filtered_time_series_data, pedes_layer);
        }, (each_time.time-tmin) * 1000);
    })
}