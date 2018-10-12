
/* Loads the walls from walls.json and plots them */
function createBackground() {
    const wallData = d3.json('data/walls.json', function (wallJSON) {

        // collect all coordinates in both drections
        const allCoordsX = wallJSON.walls.map(w => {
            return w.x1
        }).concat(wallJSON.walls.map(w => {
            return w.x2
        }));
        const allCoordsY = wallJSON.walls.map(w => {
            return w.y1
        }).concat(wallJSON.walls.map(w => {
            return w.y2
        }));

        // finds the range of the coordinates in each direction
        const maxX = Math.max(...allCoordsX);
        const maxY = Math.max(...allCoordsY);
        const minX = Math.min(...allCoordsX);
        const minY = Math.min(...allCoordsY);

        // Computes the height based on the backgound data;
        height = width * ((maxY - minY) / (maxX - minX));

        // sets the mapping functions so thath they can be accessed by other functions
        xScale = d3.scale.linear().domain([minX, maxX]).range([svgInnerMargins.left, width - svgInnerMargins.right]);
        yScale = d3.scale.linear().domain([minY, maxY]).range([svgInnerMargins.top, height - svgInnerMargins.bottom]);

        // SVG canvas
        svg.attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + svgCanvasMargins.left + "," + svgCanvasMargins.top + ")");

// Background
        svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "yellow");

        // not using path as the walls in the JSON file are not continuous, the order is *arbitrary*
        svg.selectAll("line")
            .data(wallJSON.walls)
            .enter().append("line")
            .attr("x1", function (d) {
                return xScale(d.x1)
            })
            .attr("y1", function (d) {
                return yScale(d.y1)
            })
            .attr("x2", function (d) {
                return xScale(d.x2)
            })
            .attr("y2", function (d) {
                return yScale(d.y2)
            })
            .attr("class", "background-walls");

    });
}


function drawPedestrians(trajData) {

    function updatePoints(points) {
        const dots = svg.selectAll("circle")
            .data(points, function (p) {
                return p.id;
            });

        dots.enter()
            .append('circle')
            .attr("cx", function (d) {
                return xScale(d.x)
            })
            .attr("cy", function (d) {
                return yScale(d.y)
            })
            .attr('r', "4px")
            .attr('fill', "red");

        dots.attr("cx", function (d) {
            return xScale(d.x)
        })
            .attr("cy", function (d) {
                return yScale(d.y)
            })
            .attr('r', "4px")
            .attr('fill', "red");

        dots.exit().remove();
    }

    const timeBounds = timeSlider.get();

    const trajDataFiltered = trajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);

    function walkData() {
        if (currentTimeShownIdx >= trajDataFiltered.length) {
            clearInterval(pedMover);
        }
        else {
            updatePoints(trajDataFiltered[currentTimeShownIdx].data);
            currentTimeShownIdx += 1;
        }
    }

    const button = document.getElementById('play-button');

    if (button.innerText === "Play the simulation !") {
        button.innerText = "Pause the simulation !";
        pedMover = setInterval(walkData, 5);
    } else if (button.innerText === "Resume the simulation !") {
        button.innerText = "Pause the simulation !";
        pedMover = setInterval(walkData, 5);
    } else if (button.innerText === "Pause the simulation !") {
        button.innerText = "Resume the simulation !";
        clearInterval(pedMover);
    }

}

