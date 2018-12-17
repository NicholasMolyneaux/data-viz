/**
 * Creates a function which maps the name to either itself or to an aggregate name if specified. The argument is an object
 * which contains the list of names to update the corresponding new name to show.
 *
 * @param groupedZones names to updates
 * @returns {f}
 */
function getVisibleNameMapping(groupedZones) {

    return function f(str) {
        if (groupedZones[str] === undefined) {
            return str;
        } else {
            return groupedZones[str];
        }
    };
}

//create a key that will represent the relationship
//between these two groups *regardless*
//of which group is called 'source' and which 'target'
function chordKey(data) {
    return (data.source.index < data.target.index) ?
        data.source.index  + "-" + data.target.index:
        data.target.index  + "-" + data.source.index;

}

/**
 * Moves the labels along the edge of the diagram to the new positions
 *
 * @param oldLayout
 * @param geom
 * @returns {function(*, *): function(*): string}
 */
function labelTween(oldLayout, geom) {

    var oldGroups = {};
    if (oldLayout) {
        oldLayout.groups.forEach( function(groupData) {
            oldGroups[ groupData.index ] = groupData;
        });
    }

    return function(d, i) {
        return function(t) {
            let oldAngle = oldGroups[d.index].angle;
            //console.log(oldAngle, d.angle);
            //console.log(oldAngle, d.angle, (oldAngle + (d.angle-oldAngle)*t * 180 / Math.PI - 90));
            return "rotate(" + (oldAngle*180/Math.PI + (d.angle-oldAngle)*t * 180 / Math.PI - 90) + ")" +
                "translate(" + (geom.r0 + geom.textSpacing) + ")" +
                ((oldAngle + (d.angle-oldAngle)*t) > Math.PI ? "rotate(180)" : "")
        }
    }
}

/**
 * Updates the chords themselves so they transition to the new position
 *
 * @param oldLayout
 * @param ribbon
 * @returns {function(*=, *): function(*=): *}
 */
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

/**
 * Updates the groups around the edge of the diagram
 *
 * @param oldLayout
 * @param arc
 * @returns {function(*=, *): function(*=): *}
 */
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


/**
 * Builds from scratch or updates the chord diagram if an old one is passed as an argument.
 *
 * @param canvas where to draw the diagram
 * @param chord main chord object
 * @param arc group builder
 * @param ribbon chord builder
 * @param colors color map to user
 * @param matrix data to plot
 * @param keys set of keys to show
 * @param last_layout previous layout to use (null)
 * @param geom geometry parameters
 * @param duration duration of the transition
 * @returns {*} new chord specification
 */
function updateChordDiagram(canvas, chord, arc, ribbon, colors, matrix, keys, last_layout, geom, duration) {

    /**
     * Changes the opacity when the mouses passes over elements
     * @param opacity
     * @returns {Function}
     */
    function hideOnMouseOver(opacity) {
        return function(g, i) {
            canvas.selectAll("path.chord")
                .filter(function(d) { return d.source.index !== i && d.target.index !== i; })
                .transition()
                .style("opacity", opacity);
        };
    }

    /**
     * Places the id of the group to be grouped later on
     * @param id
     */
    function groupOnClick(id) {
        makingNewGroup.push(id);
        if (newGroupLabel.length === 0) newGroupLabel = keys[id].toString(); else {newGroupLabel = newGroupLabel + " / " + keys[id];}
        document.getElementById("chord-group-name").value = newGroupLabel;
    }

    // stores the current layout for reference
    const currentLayout = chord(matrix);

    // Creates canvas for diagram
    const groups = canvas.selectAll("g")
        .data(currentLayout.groups, function(d) {
            return d.index;
        });

    // Removes old groups
    groups.exit()
        .transition()
        .duration(duration)
        .attr("opacity", 0.0)
        .remove();

    // Adds new groups into the diagram
    const entering = groups.enter()
        .append("g")
        .on("mouseover", hideOnMouseOver(0.1))
        .on("mouseout", hideOnMouseOver(1.0))
        .on("click", d => {
            groupOnClick(d.index);
        });

    // Adds the new paths into the diagram
    entering.append("path")
        .attr("class", "group")
        .style("stroke", "grey")
        .style("fill", function(d) {
            return colors(d.index);
        })
        .attr("d", arc);

    // Adds the new labels to each group
    entering.append("text")
        .attr("class", "chordlabels")
        .each(function(d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", function(d) {if (d.angle > Math.PI) {return "end";} else { return "start";}})
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                "translate(" + (geom.r0 + geom.textSpacing) + ")"+
                (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function(d) {
            return keys[d.index];
        });

    // Updates the positions of the existing labels
    groups.select("text")
        .each(function(d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
        })
        .transition()
        .duration(duration)
        .attrTween("transform", labelTween(last_layout, geom));

    // Update the groups
    groups.select("path")//.attr("class", "group")
        .style("stroke", "grey")
        .style("fill", function(d) {
            return colors(d.index);
        })
        .attr("d", arc)
        .transition()
        .duration(duration)
        .attrTween("d", arcTween(last_layout, arc));


    // selects the existing chords
    const chordPaths = canvas.selectAll("path.chord")
        .data(currentLayout, function (d) {
            return chordKey(d);
        });

    // adds the new paths
    chordPaths.enter().append("svg:path")
        .attr("class", "chord")
        .style("stroke", "grey")
        .style("fill", function(d, i) {
            return colors(d.source.index)
        })
        .attr("d", ribbon.radius(geom.r0))
        .transition()
        .duration(duration)
        .attrTween("d", chordTween(last_layout, ribbon));

    // updates existing paths
    chordPaths.attr("class", "chord")
        .style("stroke", "grey")
        .style("fill", function(d, i) {
            return colors(d.source.index)
        })
        .attr("d", ribbon.radius(geom.r0))
        .transition()
        .duration(duration)
        .attrTween("d", chordTween(last_layout, ribbon));

    // removes the old paths
    chordPaths.exit()
        .remove();



    return currentLayout;
}