//import {chordKey, arcTween, chordTween} from "./chord_functions.js";

fetch('http://transporsrv2.epfl.ch/api/summary/crossjunction/test0').then(response => {
    return response.json();
}).then(data => {


//http://transporsrv2.epfl.ch/api/summary/lausannwpiw/test2
//http://transporsrv2.epfl.ch/api/summary/crossjunction/test0

    //Function for grouping zones together. The object (map) inside must be passed from the user somehow.
    //TODO: Get the map from the web page
    function getVisibleName(str) {

        const groupedZones = {};
        groupedZones["left-top"] = "left";
        groupedZones["left-bottom"] = "left";
        groupedZones["right-top"] = "right";
        groupedZones["right-bottom"] = "right";

        if (groupedZones[str] === undefined) {
            return str;
        } else {
            return groupedZones[str];
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////// Data processing //////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    // Set of keys computed from the grouped od zones.
    const keys = Array.from(new Set(data.map(v => getVisibleName(v.o)).concat(data.map(v => getVisibleName(v.d)))));
    //const keys = Array("left", "top", "right", "bottom")

    // Creation of the full OD matrix. First the data is gropued by OD using D3's nest function. Then the data is stored
    // into a OD matrix (two dimensional array).
    const groupedData = d3.nest()
        .key(function(d) {return getVisibleName(d.o)})
        .key(function(d) {return getVisibleName(d.d)})
        .rollup(function(d) {return d.length;})
        .entries(data);

    let odMatrix = Array.from(Array(keys.length), () => Array(keys.length).fill(0));

    groupedData.forEach(origin => {
        origin.values.forEach(destination => {
            odMatrix[keys.indexOf(origin.key)][keys.indexOf(destination.key)] = destination.value;
        })
    });

    // canvas size and chord diagram radii
    const w = 980,
        h = 800,
        r1 = h / 2,
        r0 = r1 - 110;

    var chord = d3.chord()
        .padAngle(0.05)
        //.sortSubgroups(d3.descending)
        .sortChords(d3.descending);


    var arc = d3.arc()
        .innerRadius(r0)
        .outerRadius(r0 + 20)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle );


    var ribbon = d3.ribbon()
        .radius(r0)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle);

    const colors = d3.scaleOrdinal(d3.schemeRdYlGn[11]);

    const svg = d3.select("body").append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("id", "circle")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

    svg.append("circle")
        .attr("r", r0 + 20);

    // Creation of time dependent OD matrix. An Array contains one OD matrix per time interval. Created in the same way
    // as the full OD matrix.
    const timeInterval = 10.0;
    const startTime = Math.min(...data.map(p => p.en));
    const endTime = Math.max(...data.map(p => p.ex));

    let odPerTime = Array();

    for (let t = startTime; t <= endTime; t+=timeInterval) {
        const odData = d3.nest()
            .key(function(d) {return getVisibleName(d.o)})
            .key(function(d) {return getVisibleName(d.d)})
            .rollup(function(d) {return d.length;})
            .entries(data.filter(p => p.en <= t && t <= p.ex));

        let odMatrix = Array.from(Array(keys.length), () => Array(keys.length).fill(0));

        odData.forEach(origin => {
            origin.values.forEach(destination => {
                odMatrix[keys.indexOf(origin.key)][keys.indexOf(destination.key)] = destination.value;
            })
        });

        odPerTime.push(odMatrix);
    }

    console.log(odPerTime);

    //updateChordDiagram(odPerTime[10]);

    let currentTimeIndex = 0;
    let chordAnimation;
    function animateChordDiagram() {
        if (currentTimeIndex >= odPerTime.length) {
            clearInterval(chordAnimation);
        } else {
            updateChordDiagram(svg, odPerTime[currentTimeIndex]);
            currentTimeIndex += 1;
        }
    }


    let last_layout;

    chordAnimation = setInterval(animateChordDiagram, 1000);



    //////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////// Chord diagram creation function ///////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////



    function updateChordDiagram(canvas, matrix) {

        const currentLayout = chord(matrix);

        // Creates canvas for diagram

        const groups = canvas.selectAll(".group")
            .data(currentLayout.groups, function(d) {
                return d.index;
            });

        groups.exit()
            .transition()
            .duration(1000)
            .attr("opacity", 0.0)
            .remove();

        groups.enter().append("path")
            .attr("class", "group")
            .style("stroke", "grey")
            .style("fill", function(d) {
                return colors(d.index);
            })
            .attr("d", arc);

        groups.attr("class", "group")
            .style("stroke", "grey")
            .style("fill", function(d) {
                return colors(d.index);
            })
            .attr("d", arc)
            .transition()
            .duration(1000)
            .attrTween("d", arcTween(last_layout, arc));

        const chordPaths = canvas.selectAll("path.chord")
            .data(currentLayout, function (d) {
                return chordKey(d);
            });

        chordPaths.enter().append("svg:path")
            .attr("class", "chord")
            .style("stroke", "grey")
            .style("fill", function(d, i) {
                return colors(d.source.index)
            })
            .attr("d", ribbon.radius(r0))
            .transition()
            .duration(1000)
            .attrTween("d", chordTween(last_layout, ribbon));


        chordPaths.attr("class", "chord")
            .style("stroke", "grey")
            .style("fill", function(d, i) {
                return colors(d.source.index)
            })
            .attr("d", ribbon.radius(r0))
            .transition()
            .duration(1000)
            .attrTween("d", chordTween(last_layout, ribbon));

        chordPaths.exit()
            .remove();

        last_layout = currentLayout;


       /*groups.append("path")
            .style("stroke", "grey")
            .style("fill", function(d) {
                return colors(d.index);
            })
            .attr("d", arc);*/

        /*groups.append("text")
            .each(function(d) {
                d.angle = (d.startAngle + d.endAngle) / 2;
            })
            .attr("dy", "0.35em")
            .style("font-family", "helvetica, arial, sans-serif")
            .style("font-size", "15px")
            //.attr("text-anchor", function(d) {
            //    return d.angle > Math.PI ? "end" : null;
            //})
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                    "translate(" + (r0 + 75) + ")" +
                    //"rotate(" + ((d.angle) * 180 / Math.PI - 90) + ")" +
                    (d.angle > Math.PI ? "rotate(180)" : "");
                ;
            })
            .text(function(d) {
                return keys[d.index];
            });


        var chordPaths = svg.selectAll("path.chord")
            .data(function(chords) {
                return chords;
            })
            .enter().append("svg:path")
            .attr("class", "chord")
            .style("stroke", "grey")
            .style("fill", function(d, i) {
                return colors(d.source.index)
            })
            .attr("d", ribbon.radius(r0));*/
/*
        // Get chord layout
        const chord = getDefaultLayout(matrix);

        //Create/update the group elements (bands around outside)
        console.log(chord);
        /*const groupG = svg.selectAll("g.group")
            .data(chord.groups(), function (d) {
                console.log(d);
                return d.index;
            });


        //remove groups who have exited after transitions are complete
        groupG.exit()
            .transition()
            .duration(1500)
            .attr("opacity", 0)
            .remove();

        //the enter selection of the groups is stored in a variable so we can
        //enter the <path>, <text>, and <title> elements as well
        const newGroups = groupG.enter().append("g")
            .attr("class", "group");

        //create the arc paths and set the constant attributes
        //(those based on the group index, not on the value)
        newGroups.append("path")
            .attr("id", function (d) {
                return "group" + d.index;
                //using d.index and not i to maintain consistency
                //even if groups are sorted
            })
            .style("fill", function (d) {
                return colors(d.index);
            });

        //update the paths to match the layout. The arcTween is a function which controls how the arcs are updated.
        groupG.select("path")
            .transition()
                .duration(1500)
                .attr("opacity", 0.5) //optional, just to observe the transition
            //.attrTween("d", arcTween( last_layout ))
                .transition().duration(100).attr("opacity", 1) //reset opacity

        //create the group labels
        newGroups.append("svg:text")
            .attr("xlink:href", function (d) {
                return "#group" + d.index;
            })
            .attr("dy", ".35em")
            .attr("color", "#fff")
            .text(function (d) {
                return keys[d.index];
            });

        //position group labels to match layout
        groupG.select("text")
            .transition()
            .duration(1500)
            .attr("transform", function(d) {
                d.angle = (d.startAngle + d.endAngle) / 2;
                //store the midpoint angle in the data object

                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                    " translate(" + (innerRadius + 26) + ")" +
                    (d.angle > Math.PI ? " rotate(180)" : " rotate(0)");
                //include the rotate zero so that transforms can be interpolated
            })
            .attr("text-anchor", function (d) {
                return d.angle > Math.PI ? "end" : "begin";
            });

        //Create/update the chord paths
        const chordPaths = g.selectAll("path.chord")
            .data(chord.chords(), chordKey );
        //specify a key function to match chords
        //between updates


        //create the new chord paths
        const newChords = chordPaths.enter()
            .append("path")
            .attr("class", "chord");


        //handle exiting paths:
        chordPaths.exit().transition()
            .duration(1500)
            .attr("opacity", 0)
            .remove();

        //update the path shape
        chordPaths.transition()
            .duration(1500)
            .attr("opacity", 0.5) //optional, just to observe the transition
            .style("fill", function (d) {
                return neighborhoods[d.source.index].color;
            })
            //.attrTween("d", chordTween(last_layout))
            .transition().duration(100).attr("opacity", 1) //reset opacity
        ;

        last_layout = chord; //save for next update
*/
    }
}).catch(err => {
    console.log(err)
});

