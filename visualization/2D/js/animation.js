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

function runAnimation(data, od, voronoi_poly_layer , pedes_layer, tmin, tmax) {
    data.map( each_time => {
        d3.timeout( () => {
            checkVoronoi(each_time.data, voronoi_poly_layer);
            updatePosition(each_time.data, od, pedes_layer);
        }, (each_time.time-tmin) * 1000);
    })
}