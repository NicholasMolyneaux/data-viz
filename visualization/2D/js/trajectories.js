function prepareTrajectories(svg) {

    /**
     * Plots a chunk of data and returns a promise which will be completed once all the trajectories have been shown.
     *
     * @param data
     * @returns {Promise<*>}
     */
    async function plotData(data) {

        var line = d3.line()
            .x(function(d, i) { return d.x; })
            .y(function(d, i) { return d.y; })
            .curve(d3.curveMonotoneX);

        async function drawPath(traj) {
            const newData = [];
            for (i = 0; i < traj.x.length; i++) {newData.push({"x": traj.x[i], "y": traj.y[i]})}
            svg.append("path")
                .datum(newData)
                .attr("class", "trajectories")
                //.attr("stroke-opacity", 0.1)
                .attr("d", line);
            /*return new Promise((resolve) => {
                setTimeout(resolve, 1);
            });*/
        }

        for (lineData of data) {
            /*await*/ drawPath(lineData);
        }
        //data.forEach(traj => drawPath(traj));

        /*return new Promise((resolve) => {
            //data.forEach(traj => drawPath(traj));
            setTimeout(resolve, 1);
        });*/
    }

    console.log(trajectoryDataByID);

    plotData(trajectoryDataByID);
/*
    const pedIds = fetch('http://transporsrv2.epfl.ch/api/idlist/' + selectedInfra.name + '/' + selectedTraj.name).then(r => r.json());
    pedIds.then(ids => {
        const chunk = 75;
        const urls = [];
        for (i=0, j=ids.length; i<j; i+=chunk) {
            temparray = ids.slice(i,i+chunk);
            urls.push("http://transporsrv2.epfl.ch/api/trajectoriesbyid/" + selectedInfra.name + "/" + selectedTraj.name + "/" + temparray)
        }

        // For all the chunks of data, plots and loads the data.
        const allData = fetch(urls[0])
            .then(r => {return r.json()})
            .then(d => { return customStreaming(urls.slice(1), plotData, d); });

        allData.then(d => console.log(d));
    });*/


}