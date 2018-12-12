/**
 * Plots a single trajectory
 *
 * @param data
 * @param svg
 * @returns {Promise<*>}
 */
async function plotData(data, svg) {

    async function drawPath(traj) {
        const newData = [];
        for (i = 0; i < traj.x.length; i++) {newData.push({"x": traj.x[i], "y": traj.y[i]})}
        svg.append("path")
            .datum(newData)
            .attr("class", "trajectories")
            .attr("d", line);
    }

    var line = d3.line()
        .x(function(d, i) { return d.x; })
        .y(function(d, i) { return d.y; })
        .curve(d3.curveMonotoneX);



    for (lineData of data) {
        drawPath(lineData);
    }

}

function plotAllTrajectories(svg) {
    plotData(trajectoryDataByID, svg);

}