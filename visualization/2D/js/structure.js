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
        this.g = canvas.append("g");
        this.g.append("rect")
            .attr("class", "the-zones")
            .attr("id", this.name)
            .attr("x", this.x)
            .attr("y", this.y)
            .attr("width", this.width)
            .attr("height", this.height)
            .on("mouseover", d => {
                console.log(this.name);
                this.g.select(".tooltip")
                    .text(`The zone ${this.name}`);
            })
            .on("mouseout", d => {
                // this.g.select(".tooltip")
                //     .text("");
            })
            .on("click", () => {
                // activate Destination
                if (d3.event.shiftKey) {
                    this.setDestination();
                }
                // activate Origin
                else {
                    this.setOrigin();
                }});

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
            .attr("class", "tooltip")
            .attr("x", this.x)
            .attr("y", this.y)
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