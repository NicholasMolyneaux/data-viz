/*********************************************************/
/*                                                       */
/*   Main function for the chord diagram                 */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

/////////////////////////////////////////////////////////////////
////////////////// Dynamic chord elements ///////////////////////
/////////////////////////////////////////////////////////////////

// the animation object which can be vizPaused and started again.
let chordAnimation;

// boolean indicating the state of the simulation
let pausedChord = false;

// index of the slice of the animation currently shown
let chordAnimationCurrentTimeIdx = 0;



$( "#playPauseButtonChord" ).click(function() {

    if (pausedChord) {
        chordAnimation = setInterval(chordAnimateFunction, 1000);
        document.getElementById("playPauseButtonChord").innerHTML = "<i class=\"fas fa-pause fa-lg\"></i>";
        pausedChord = false;
    } else {
        clearInterval(chordAnimation);
        document.getElementById("playPauseButtonChord").innerHTML = "<i class=\"fas fa-play fa-lg\"></i>";
        pausedChord = true;
    }

});

/////////////////////////////////////////////////////////////////
/////////////////// Static chord variables //////////////////////
/////////////////////////////////////////////////////////////////

// current selection to make into same group
let makingNewGroup = [];

// new label for the group
let newGroupLabel = "";

// map from the index to group to the new label
let currentGroupingScheme = {};
let currentLabels;// = chordKeysOriginalData.slice();

// States of the grouping button
const IDLE = 0;
const SELECTING = 1;
let stateButtonChord = IDLE;

/**
 * On click function for the grouping of the zones in the chord diagram. This function will
 * either start the grouping process or append new values to the future group.
 */
function groupingChordGroups() {
    if (stateButtonChord === IDLE) {
        // Initializes elements to make new group.
        stateButtonChord = SELECTING;
        makingNewGroup = [];
        newGroupLabel = "";
        document.getElementById("chord-group-name").value = "";

        $(".btnOptChord").removeClass("col-4");
        $(".btnOptChord").addClass("col-3");
        $(".txtOptChord").show();

    } else if (stateButtonChord === SELECTING) {
        // When the button show "make group"
        stateButtonChord = IDLE;

        $(".btnOptChord").removeClass("col-3");
        $(".btnOptChord").addClass("col-4");
        $(".txtOptChord").hide();

        // For elements which have been selected (clicked), create new grouping object with name specified in th
        // input box which is filled by default with the concatenation of sub names.
        console.log(currentGroupingScheme);
        makingNewGroup.forEach(l => {
            let keyUpdate =  Object.keys(currentGroupingScheme).find(key => currentGroupingScheme[key] === currentLabels[l]);
            while (keyUpdate) {
                currentGroupingScheme[keyUpdate] = document.getElementById("chord-group-name").value;
                keyUpdate =  Object.keys(currentGroupingScheme).find(key => currentGroupingScheme[key] === currentLabels[l]);
            }
        });

        makingNewGroup.forEach(l => {
            currentGroupingScheme[currentLabels[l]] = document.getElementById("chord-group-name").value;
        });

        // delete old chord diagram
        deleteChord();

        // create new function mapping ids to visible names
        const getVisibleName = getVisibleNameMapping(currentGroupingScheme);

        // Copies original names and then removes the ones which have been grouped together.
        let keysTmp = currentLabels.slice();
        makingNewGroup.sort(function (a, b) {return b - a;})
            .forEach(i => keysTmp.splice(i, 1));
        console.log(keysTmp);
        console.log(currentGroupingScheme);

        currentLabels = Array.from(new Set(keysTmp.concat(Object.values(currentGroupingScheme))));
        // Builds the new chord diagram with the grouped names
        staticChord(trajSummary, getVisibleName, currentLabels);
    } else {
        console.log("ERROR WITH GROUPING CHORD DIAGRAM")
    }
}

/**
 * Deletes the current chord diagram and rebuilds the original one.
 */
function deleteCustomGroups() {
    currentGroupingScheme = {};
    currentLabels = chordKeysOriginalData;
    deleteChord();
    const getVisibleName = getVisibleNameMapping({});
    staticChord(trajSummary, getVisibleName, chordKeysOriginalData);
}

/**
 * Only deletes the chord, nothing else.
 */
function deleteChord() {
    const svg = d3.select("#circle");
    svg.selectAll(("g")).remove();
    svg.selectAll(("path")).remove();
}

/**
 * Builds a static chord diagram and adds the functionalites for clicking and highlithing the specific groups.
 * @param data raw summary data to group together
 * @param getVisibleName maps the index to another name if needed
 * @param keys list of keys to use
 */
function staticChord(data, getVisibleName, keys) {

    //////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// Static data processing ///////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    // Creation of the full OD matrix. First the data is gropued by OD using D3's nest function. Then the data is stored
    // into a OD matrix (two dimensional array).
    const groupedData = d3.nest()
        .key(function (d) {
            return getVisibleName(d.o)
        })
        .key(function (d) {
            return getVisibleName(d.d)
        })
        .rollup(function (d) {
            return d.length;
        })
        .entries(data);

    let odMatrix = Array.from(Array(keys.length), () => Array(keys.length).fill(0));

    groupedData.forEach(origin => {
        origin.values.forEach(destination => {
            odMatrix[keys.indexOf(origin.key)][keys.indexOf(destination.key)] = destination.value;
        })
    });

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// General chord settings //////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    const svgUp = d3.select("#containerForOD");

    // TODO: change sizes to take into account dynamic resizing
    const w = 900;//svgUp.node().getBoundingClientRect().width,
        h = 900;//svgUp.node().getBoundingClientRect().height;

    const geom = {"w": w, "h": h, "r1": h / 2, "r0": h / 2 - 110, "textSpacing": 40};

    // Main chord object
    const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    // Builder for the arcs
    const arc = d3.arc()
        .innerRadius(geom.r0)
        .outerRadius(geom.r0 + 20)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle);

    // Builder for the chords
    const ribbon = d3.ribbon()
        .radius(geom.r0)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle);

    // Colors
    const colors = d3.scaleOrdinal(d3.schemeRdYlGn[11]);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// Static chord diagram ////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    // selects the canvas where to draw the chord diagram
    const svg = d3.select("#circle");

    svg.append("circle")
        .attr("r", geom.r0 + 20);

    return updateChordDiagram(svg, chord, arc, ribbon, colors, odMatrix, keys, null, geom, 2000);
}

function dynamicChord(data, groupedZones) {

    const duration = 1000; // ms

    const getVisibleName = getVisibleNameMapping(groupedZones);

    //////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// Dynamic data processing //////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    // Set of keys computed from the grouped od zones.
    const keys = Array.from(new Set(data.map(v => getVisibleName(v.o)).concat(data.map(v => getVisibleName(v.d)))));
    //const keys = Array("left", "top", "right", "bottom")


    // Creation of time dependent OD matrix. An Array contains one OD matrix per time interval. Created in the same way
    // as the full OD matrix.
    const timeInterval = 10.0;
    const startTime = Math.min(...data.map(p => p.en));
    const endTime = Math.max(...data.map(p => p.ex));

    let odPerTime = Array();

    for (let t = startTime; t <= endTime; t += timeInterval) {
        const odData = d3.nest()
            .key(function (d) {
                return getVisibleName(d.o)
            })
            .key(function (d) {
                return getVisibleName(d.d)
            })
            .rollup(function (d) {
                return d.length;
            })
            .entries(data.filter(p => p.en <= t && t <= p.ex));

        let odMatrix = Array.from(Array(keys.length), () => Array(keys.length).fill(0));

        odData.forEach(origin => {
            origin.values.forEach(destination => {
                odMatrix[keys.indexOf(origin.key)][keys.indexOf(destination.key)] = destination.value;
            })
        });

        odPerTime.push(odMatrix);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// General chord settings //////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    const svgUp = d3.select("#viz_OD");

    const w = 800;//svgUp.node().offsetWidth,//.getBoundingClientRect().width,
    const h = 800;//svgUp.offsetHeight;//node().getBoundingClientRect().height;

    console.log(svgUp);
    console.log(w, h);

    const geom = {"w": w, "h": h, "r1": h / 2, "r0": h / 2 - 110, "textSpacing": 40};

    console.log(geom);

    const chord = d3.chord()
        .padAngle(0.05)
        //.sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    const arc = d3.arc()
        .innerRadius(geom.r0)
        .outerRadius(geom.r0 + 20)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle);


    const ribbon = d3.ribbon()
        .radius(geom.r0)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle);

    const colors = d3.scaleOrdinal(d3.schemeRdYlGn[11]);

    //////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////// Dynamic chord diagram //////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    const svg = d3.select("#circle");

    svg.append("circle")
        .attr("r", geom.r0 + 20);

    //let currentTimeIndex = 0;
    //let chordAnimation;

    let last_layout;

    function animateChordDiagram() {
        if (chordAnimationCurrentTimeIdx >= odPerTime.length) {
            clearInterval(chordAnimation);
        } else {
            last_layout = updateChordDiagram(svg, chord, arc, ribbon, colors, odPerTime[chordAnimationCurrentTimeIdx], keys, last_layout, geom, duration);
            chordAnimationCurrentTimeIdx += 1;
        }
    }

    //chordAnimation = setInterval(animateChordDiagram, duration);

    return animateChordDiagram;
}

