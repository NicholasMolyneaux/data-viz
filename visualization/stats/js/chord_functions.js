//Function for grouping zones together. The object (map) inside must be passed from the user somehow.
//TODO: Get the groupeddZones from the web page
function getVisibleName(str) {

    const groupedZones = {};
    //groupedZones["left-top"] = "left";
    //groupedZones["left-bottom"] = "left";
    //groupedZones["right-top"] = "right";
    //groupedZones["right-bottom"] = "right";

    if (groupedZones[str] === undefined) {
        return str;
    } else {
        return groupedZones[str];
    }
}

//create a key that will represent the relationship
//between these two groups *regardless*
//of which group is called 'source' and which 'target'
function chordKey(data) {
    return (data.source.index < data.target.index) ?
        data.source.index  + "-" + data.target.index:
        data.target.index  + "-" + data.source.index;

}


function chordTween(oldLayout, ribbon) {
    //this function will be called once per update cycle

    //Create a key:value version of the old layout's chords array
    //so we can easily find the matching chord
    //(which may not have a matching index)

    var oldChords = {};

    if (oldLayout) {
        oldLayout.forEach( function(chordData) {
            oldChords[ chordKey(chordData) ] = chordData;
        });
    }

    return function (d, i) {
        //this function will be called for each active chord

        var tween;
        var old = oldChords[ chordKey(d) ];
        if (old) {
            //old is not undefined, i.e.
            //there is a matching old chord value

            //check whether source and target have been switched:
            if (d.source.index !== old.source.index ){
                //swap source and target to match the new data
                old = {
                    source: old.target,
                    target: old.source
                };
            }

            tween = d3.interpolate(old, d);
        }
        else {
            //create a zero-width chord object
            var emptyChord = {
                source: { startAngle: d.source.startAngle,
                    endAngle: d.source.startAngle},
                target: { startAngle: d.target.startAngle,
                    endAngle: d.target.startAngle}
            };
            tween = d3.interpolate( emptyChord, d );
        }

        return function (t) {
            //this function calculates the intermediary shapes
            return ribbon(tween(t));
        };
    };
}


function arcTween(oldLayout, arc) {
    //this function will be called once per update cycle

    //Create a key:value version of the old layout's groups array
    //so we can easily find the matching group
    //even if the group index values don't match the array index
    //(because of sorting)
    var oldGroups = {};
    if (oldLayout) {
        oldLayout.groups.forEach( function(groupData) {
            oldGroups[ groupData.index ] = groupData;
        });
    }

    return function (d, i) {
        var tween;
        var old = oldGroups[d.index];
        if (old) { //there's a matching old group
            tween = d3.interpolate(old, d);
        }
        else {
            //create a zero-width arc object
            var emptyArc = {startAngle:d.startAngle,
                endAngle:d.startAngle};
            tween = d3.interpolate(emptyArc, d);
        }

        return function (t) {
            return arc( tween(t) );
        };
    };
}

function labelTween(oldLayout) {
    //this function will be called once per update cycle

    //Create a key:value version of the old layout's groups array
    //so we can easily find the matching group
    //even if the group index values don't match the array index
    //(because of sorting)
    var oldGroups = {};
    if (oldLayout) {
        oldLayout.groups.forEach( function(groupData) {
            oldGroups[ groupData.index ] = groupData;
        });
    }

    return function (d, i) {
        var tween;
        var old = oldGroups[d.index];
        if (old) { //there's a matching old group
            tween = d3.interpolate(old, d);
        }
        else {
            //create a zero-width arc object
            var emptyArc = {startAngle:d.startAngle,
                endAngle:d.startAngle};
            tween = d3.interpolate(emptyArc, d);
        }

        return function (t) {
            return arc( tween(t) );
        };
    };
}


function updateChordDiagram(canvas, chord, arc, ribbon, colors, matrix, keys, last_layout, geom) {

    const currentLayout = chord(matrix);

    // Creates canvas for diagram

    const groups = canvas.selectAll("g")
        .data(currentLayout.groups, function(d) {
            return d.index;
        });

    groups.exit()
        .transition()
        .duration(1000)
        .attr("opacity", 0.0)
        .remove();

    const entering = groups.enter().append("g");

    entering.append("path")
        .attr("class", "group")
        .style("stroke", "grey")
        .style("fill", function(d) {
            return colors(d.index);
        })
        .attr("d", arc);

    entering.append("text")
        .attr("class", "text")
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
            //console.log(d);
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                "translate(" + (geom.r0 + 75) + ")"+
                (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function(d) {
            return keys[d.index];
        });


    groups.select("text")
        .each(function(d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
        })
        .transition()
        .duration(1000)
        .attrTween("transform", labelTween(last_layout));


    groups.select("path")//.attr("class", "group")
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
        .attr("d", ribbon.radius(geom.r0))
        .transition()
        .duration(1000)
        .attrTween("d", chordTween(last_layout, ribbon));


    chordPaths.attr("class", "chord")
        .style("stroke", "grey")
        .style("fill", function(d, i) {
            return colors(d.source.index)
        })
        .attr("d", ribbon.radius(geom.r0))
        .transition()
        .duration(1000)
        .attrTween("d", chordTween(last_layout, ribbon));

    chordPaths.exit()
        .remove();

    //last_layout = currentLayout;

    function labelTween(oldLayout) {

        var oldGroups = {};
        if (oldLayout) {
            oldLayout.groups.forEach( function(groupData) {
                oldGroups[ groupData.index ] = groupData;
            });
        }

        return function(d, i) {
            return function(t) {
                let oldAngle = oldGroups[d.index].angle;
                console.log(oldAngle, d.angle);
                return "rotate(" + (oldAngle + (d.angle-oldAngle)*t * 180 / Math.PI - 90) + ")" +
                "translate(" + (geom.r0 + 75) + ")" +
                (d.angle > Math.PI ? "rotate(180)" : "")
            }
        }
    }


    return currentLayout;


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