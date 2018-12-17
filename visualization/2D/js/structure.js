let maximum_speed = 2;
let num_of_colors = 10;

class Zone{
    constructor(x, y, width, height, name) {
        this.x = Number(x);
        this.y = Number(y);
        this.height = Number(height);
        this.width = Number(width);
        this.name = name;
        this.state_o = false;
        this.state_d = false;
        this.g = false;
    }
    drawOn(canvas) {
        this.g = canvas.append("g")
            .on("mouseover", d => {
                this.g.select("#tooltip-text")
                    .text(`Zone ${this.name}`)
                    .style("opacity", 1);
                this.g.selectAll(".zone-text-overlay")
                    .style("opacity", 0.2);
            })
            .on("mouseout", d => {
                this.g.select("#tooltip-text")
                    .text("");
                this.g.selectAll(".zone-text-overlay")
                    .style("opacity", 1);
            })
            .on("click", () => {
                // activate Destination
                this.g.selectAll(".zone-text-overlay")
                    .style("opacity", 1);
                this.g.select("#tooltip-text")
                    .style("opacity", 0.2);
                if (d3.event.shiftKey) {
                    this.setDestination();
                    if (statsShown) {
                        reDrawHistTT();
                    }
                }
                // activate Origin
                else {
                    this.setOrigin();
                    if (statsShown) {
                        reDrawHistTT();
                    }
                }});
        this.g.append("rect")
            .attr("class", "the-zones")
            .attr("id", this.name)
            .attr("x", this.x)
            .attr("y", this.y)
            .attr("width", this.width)
            .attr("height", this.height);

        this.g.append("text")
            .attr("class", "zone-text-overlay")
            .attr("id", "origin")
            .attr("x", this.x+this.width/2)
            .attr("y", this.y+this.height/3)
            .attr("dominant-baseline","middle")
            .attr("text-anchor","middle")
            .attr("fill", "red");

        this.g.append("text")
            .attr("class", "zone-text-overlay")
            .attr("id", "destination")
            .attr("x", this.x+this.width/2)
            .attr("y", this.y+this.height*2/3)
            .attr("dominant-baseline","middle")
            .attr("text-anchor","middle")
            .attr("fill", "blue");

        // for tooltip
        this.g.append("text")
            .attr("id", "tooltip-text")
            .attr("x", this.x+this.width/2)
            .attr("y", this.y+this.height/2)
            .attr("dominant-baseline","middle")
            .attr("text-anchor","middle")
            .attr("fill", "black");

    }
    setOrigin(){
        if (this.state_o) {
            this.desetOrigin();
        } else {
            this.state_o = true;
            od_selection.Origins.add(this.name);
            this.g.select("#origin").text("O");
        }
    }
    setDestination(){
        if (this.state_d) {
            this.desetDestination();
        } else {
            this.state_d = true;
            od_selection.Destinations.add(this.name);
            this.g.select("#destination").text("D");
        }
    }
    desetOrigin() {
        this.state_o = false;
        this.g.select("#origin").text("");
        od_selection.Origins.delete(this.name);
    }
    desetDestination() {
        this.state_d = false;
        this.g.select("#destination").text("");
        od_selection.Destinations.delete(this.name);
    }
}

function drawColorbar(id, svg, colors, boundaries, x, y, width, height, padding, title) {
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

function drawStructures(main_layer) {
    drawWalls(wallsData, main_layer);
    drawGates(gatesData, main_layer);
}

function drawWalls(wall, svg) {
    // Draw walls

    wall.map( (w)  => {
        svg.append("line")
            .attr("class", "the-walls")
            .attr("x1", w["x1"])
            .attr("y1", w["y1"])
            .attr("x2", w["x2"])
            .attr("y2", w["y2"]);
    }) ;
}

function drawZones(zones, svg) {
    zones.map( (g) => {
        let zone = new Zone(g["x1"], g["y1"], g["x2"]-g["x1"], g["y3"]-g["y2"], g["name"]);
        zone.drawOn(svg);
    });

}

function drawGates(gates, svg) {

    // Draw flow gate?
    gates.map( f => {
        svg.append("line")
            .attr("class", "flow-gates")
            .attr("x1", f["x1"] )
            .attr("y1", f["y1"] )
            .attr("x2", f["x2"] )
            .attr("y2", f["y2"] );
    } );
}

function drawControlAreas(areas, layer) {
    // Draw controlled area
    areas.map( (c) => {
        layer.append("polygon")
            .attr("class", "controlled-areas")
            .attr("id", c["name"])
            .attr("points", `${c.x1},${c.y1} ${c.x2},${c.y2} ${c.x3},${c.y3} ${c.x4},${c.y4}`);

    } );
}

function drawHiddenControlAreas(areas, layer) {
    // Draw controlled area
    areas.map( (c) => {
        layer.append("polygon")
            .attr("class", "controlled-areas-hidden")
            .attr("style", "display: none;")
            .attr("id", c["name"])
            .attr("points", `${c.x1},${c.y1} ${c.x2},${c.y2} ${c.x3},${c.y3} ${c.x4},${c.y4}`);

    } );
}