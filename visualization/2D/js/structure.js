/*********************************************************/
/*                                                       */
/*   File with the structure of the station in d3.js     */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

/**
 * Draw the structures
 */
function drawStructures(main_layer) {
    // Draw the walls
    // Defined below
    drawWalls(wallsData, main_layer);

    // To be used later (draw the gates)
    //drawGates(gatesData, main_layer);
}

/**
 * Draw the walls
 *
 * @param: wall - Data with the walls
 * @param: svg - SVG canvas
 */
function drawWalls(wall, svg) {
    // Go through each wall and draw a line
    // We don't care about the order and direction
    wall.map( (w)  => {
        svg.append("line")
            .attr("class", "the-walls")
            .attr("x1", w["x1"])
            .attr("y1", w["y1"])
            .attr("x2", w["x2"])
            .attr("y2", w["y2"]);
    }) ;
}

/**
 * Draw the zones
 *
 * @param: wall - Data with the zones
 * @param: svg - SVG canvas
 */
function drawZones(zones, svg) {
    // Go through each zone and draw them using the class Zone
    zones.map( (g) => {
        let zone = new Zone(g["x1"], g["y1"], g["x2"]-g["x1"], g["y3"]-g["y2"], g["name"]);
        zone.drawOn(svg);
    });

}

/**
 * Draw the gates
 *
 * Not used yet. It will be used when the gating will be implemented in the simulation
 *
 * @param: gates - Data with the gates
 * @param: svg - SVG canvas
 */
function drawGates(gates, svg) {
    // Go through each gate and draw them
    gates.map( f => {
        svg.append("line")
            .attr("class", "flow-gates")
            .attr("x1", f["x1"] )
            .attr("y1", f["y1"] )
            .attr("x2", f["x2"] )
            .attr("y2", f["y2"] );
    } );
}

/**
 * Draw the control area
 *
 * @param: areas - Data with the areas
 * @param: layer - SVG layer
 */
function drawControlAreas(areas, layer) {
    // Go through each area and drawm them
    areas.map( (c) => {
        layer.append("polygon")
            .attr("class", "controlled-areas")
            .attr("id", c["name"])
            .attr("points", `${c.x1},${c.y1} ${c.x2},${c.y2} ${c.x3},${c.y3} ${c.x4},${c.y4}`);

    } );
}

/**
 * Draw the control area but hide them
 *
 * Almost same function as drawControlAreas
 *
 * @param: areas - Data with the areas
 * @param: layer - SVG layer
 */
function drawHiddenControlAreas(areas, layer) {
    // Go through each area and drawm them
    areas.map( (c) => {
        layer.append("polygon")
            // Only things that change between this function and drawHiddenControlAreas
            .attr("class", "controlled-areas-hidden")
            .attr("style", "display: none;")
            // Back to normal
            .attr("id", c["name"])
            .attr("points", `${c.x1},${c.y1} ${c.x2},${c.y2} ${c.x3},${c.y3} ${c.x4},${c.y4}`);

    } );
}


/**
 * Class for the zones.
 *
 * It was easier to do this since it has many functions
 */
class Zone{

    /**
     * Constructor
     *
     * @param: x - x coordinate of the center of the zone
     * @param: y - y coordinate of the center of the zone
     * @param: width - width of the zone
     * @param: height - height of the zone
     * @param: name - name of the zone
     */
    constructor(x, y, width, height, name) {

        // Simply store some variables in the class
        this.x = Number(x);
        this.y = Number(y);
        this.height = Number(height);
        this.width = Number(width);
        this.name = name;
        this.state_o = false;
        this.state_d = false;
        this.g = false;
    }

    /**
     * Draw the zone on a given canvas (i.e. svg layer)
     *
     * @param: canvas - SVG layer
     */
    drawOn(canvas) {

        // First, we add some functions
        this.g = canvas.append("g")
            // Mouse over is used to to show the name of the zone
            .on("mouseover", d => {
                this.g.select("#tooltip-text")
                    .text(`Zone ${this.name}`)
                    .style("opacity", 1);
                this.g.selectAll(".zone-text-overlay")
                    .style("opacity", 0.2);
            })
            // Mouse out is used to remove the name of the zone
            .on("mouseout", d => {
                this.g.select("#tooltip-text")
                    .text("");
                this.g.selectAll(".zone-text-overlay")
                    .style("opacity", 1);
            })
            // Click is used to either select the zone as an Origin or a Destination
            .on("click", () => {
                // activate Destination
                this.g.selectAll(".zone-text-overlay")
                    .style("opacity", 1);
                this.g.select("#tooltip-text")
                    .style("opacity", 0.2);
                // Click + Shift => Destination
                if (d3.event.shiftKey) {
                    // Defined below
                    this.setDestination();

                }
                // Simple click => Origin
                else {
                    this.setOrigin();
                }

                if (statsShown) {
                    // Need to redraw the histogram of the travel time
                    // Defined in visualization/stats/js/main.js
                    reDrawHistTT();
                }
            });

        // Draw the rectangle delimiting the zone
        this.g.append("rect")
            .attr("class", "the-zones")
            .attr("id", this.name)
            .attr("x", this.x)
            .attr("y", this.y)
            .attr("width", this.width)
            .attr("height", this.height);

        // Add the text for the origin (a simple red O)
        this.g.append("text")
            .attr("class", "zone-text-overlay")
            .attr("id", "origin")
            .attr("x", this.x+this.width/2)
            .attr("y", this.y+this.height/3)
            .attr("dominant-baseline","middle")
            .attr("text-anchor","middle")
            .attr("fill", "red");

        // Add the text for the destination (a simple blue D)
        this.g.append("text")
            .attr("class", "zone-text-overlay")
            .attr("id", "destination")
            .attr("x", this.x+this.width/2)
            .attr("y", this.y+this.height*2/3)
            .attr("dominant-baseline","middle")
            .attr("text-anchor","middle")
            .attr("fill", "blue");

        // Draw the tooltip
        this.g.append("text")
            .attr("id", "tooltip-text")
            .attr("x", this.x+this.width/2)
            .attr("y", this.y+this.height/2)
            .attr("dominant-baseline","middle")
            .attr("text-anchor","middle")
            .attr("fill", "black");

    }

    /**
     * Set the origin, i.e. this zone is an origin
     */
    setOrigin(){
        // Check the state of this zone
        if (this.state_o) {
            // If it's already an origin, we deselect it
            this.state_o = false;
            // Remove the red O
            this.g.select("#origin").text("");
            // Remove it from the restrictions
            od_selection.Origins.delete(this.name);
        } else {
            // Otherwise, we set it as an origin
            this.state_o = true;
            // Add it in the restrictions Object
            od_selection.Origins.add(this.name);
            // And show the O
            this.g.select("#origin").text("O");
        }
    }

    /**
     * Set the destination, i.e. this zone is a destination
     */
    setDestination(){
        // Check the state of this zone
        if (this.state_d) {
            // If it's already a destination, we deselect it
            this.state_d = false;
            // Remove the blue D
            this.g.select("#destination").text("");
            // Remove it from the restrictions
            od_selection.Destinations.delete(this.name);
        } else {
            // Otherwise, we set it as a destination
            this.state_d = true;
            // Add it in the restrictions Object
            od_selection.Destinations.add(this.name);
            // And show the D (No, it's not a bad joke...)
            this.g.select("#destination").text("D");
        }
    }
}

/**
 * Draw the colorbar. Used for the pedestrian speed and the density
 *
 * @param: id - ID of the colorbar
 * @param: svg - SVG canvas
 * @param: colors - Colors to draw
 * @param: boundaries - array of values defining the boundaries
 * @param: x - x position of the colorbar
 * @param: y - y position of the colorbar
 * @param: width - width of the colorbar
 * @param: height - height of the colorbar
 * @param: padding - padding of the colorbar
 * @param: title - title to put on top of the colorbar
 */
function drawColorbar(id, svg, colors, boundaries, x, y, width, height, padding, title) {

    // First we draw the rectangle for the colors.
    // Its width depends on the number of colors
    let width_rect = width/colors.length;
    svg.append("rect")
        .style("opacity", 0)
        .attr("class", `${id} boundary`)
        .attr("x", x-padding)
        .attr("y", y)
        .attr("width", width+2*padding)
        .attr("height", height)
        .attr("rx", 1)
        .attr("ry", 1)
        .attr("fill", "#F7F4EA");

    // We add the title of the colorbar
    svg.append("text")
        .style("opacity", 0)
        .attr("class", `${id} text`)
        .attr("x", x+width/2)
        .attr("y", y+height/5)
        .attr("dominant-baseline","middle")
        .attr("text-anchor","middle")
        .text(title)
        .style("font-size", "0.7pt")
        .attr("fill", "black");

    // We add the colorbar values
    svg.selectAll(`.${id} range`)
        .data(boundaries)
        .enter()
        .append("text")
        .style("opacity", 0)
        .attr("class", `${id} range`)
        .attr("y", y+height/5*4)
        .attr("x", (d,i) => x+i*width/(boundaries.length-1))
        .attr("dominant-baseline","middle")
        .attr("text-anchor","middle")
        .text(d => d)
        .style("font-size", "0.6pt")
        .attr("fill", "black");

    // Now, we can color the rectangles
    let rects = svg.selectAll(`.${id} rects`)
        .data(colors)
        .enter()
        .append("rect")
        .style("opacity", 0)
        .attr("class", `${id} rects`)
        .attr("height", height/5)
        .attr("y", y+height/5*2)
        .attr("x", (d,i) => x+i*width_rect)
        .attr("width", width_rect)
        .attr("fill", d=> d);
}