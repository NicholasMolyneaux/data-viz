let wallsData = null;
let zonesData = null;
let gatesData = null;
let areasData = null;
let trajData = null;
let trajSummary = null;

// original set of keys for chord diagram
let chordKeysOriginalData = [];

// data used for plotting trajectories of pedestrians
let trajectoryDataByID = [];

let histTT = null;
let densityData = null;
let histDensity = null;


const INTERP = 4;
let interpolatedTrajData = null;

async function loadInfraData() {

    await fetch(baseURL + "infra/walls/" + selectedInfra.name).then(response => {
        return response.json();
    }).then(walls => {
        wallsData = walls;
    }).catch(err => {
        console.log(err)
    });

    await fetch(baseURL + "infra/zones/" + selectedInfra.name).then(response => {
        return response.json();
    }).then(zones => {
        zonesData = zones;
    }).catch(err => {
        console.log(err)
    });

    await fetch(baseURL + "infra/gates/" + selectedInfra.name).then(response => {
        return response.json();
    }).then(gates => {
        gatesData = gates;
    }).catch(err => {
        console.log(err)
    });

    await fetch(baseURL + "infra/monitoredareas/" + selectedInfra.name).then(response => {
        return response.json();
    }).then(monitoredareas => {
        areasData = monitoredareas;
    }).catch(err => {
        //Do nothing
    });


}

async function loadTrajData() {

    const urlTraj = "http://transporsrv2.epfl.ch/api/trajectoriesbytime/"+selectedInfra.name+"/"+selectedTraj.name;

    await fetch(urlTraj).then(response => {
        return response.json();
    }).then(data => {
        trajData = data;
    }).catch(err => {
        console.log(err)
    });

    const urlSummary = "http://transporsrv2.epfl.ch/api/summary/"+selectedInfra.name+"/"+selectedTraj.name;

    await fetch(urlSummary).then(response => {
        return response.json();
    }).then(data => {
        trajSummary = data;
    }).catch(err => {
        console.log(err)
    });
}

function interPolateData() {

    const arrayToObject = (array) =>
        array.reduce((obj, item) => {
            obj[item.id] = item;
            return obj
        }, {});

    interpolatedTrajData = [];

    for(let i=0; i<trajData.length-1; i++) {
        interpolatedTrajData.push(trajData[i]);

        const init = arrayToObject(trajData[i].data);
        const final = arrayToObject(trajData[i+1].data);

        const inter = intersection(init, final);

        for(let j=1; j<=INTERP; j++) {
            let interpObj = new Object();
            interpObj['time'] = trajData[i].time + INTERVAL2D/(INTERP+1)*j/1000;

            let data = [];
            for(let k=0; k<inter.length; k++) {
                const id = inter[k];
                let obj = new Object();
                obj['id'] = init[id]['id'];
                obj['x'] = (final[id]['x']-init[id]['x'])/(INTERP+1)*j + init[id]['x'];
                obj['y'] = (final[id]['y']-init[id]['y'])/(INTERP+1)*j + init[id]['y'];
                data.push(obj);
            }
            interpObj['data'] = data;
            interpolatedTrajData.push(interpObj);
        }
    }

}

function downSampleTrajectories() {
    fetch("http://transporsrv2.epfl.ch/api/trajectoriesbyid/" + selectedInfra.name + "/" + selectedTraj.name).then(response => {
        return response.json();
    }).then(data => {
        for (ped of data) {
            let downsampledPed = {};
            downsampledPed["id"] = ped.id;
            downsampledPed["time"] = [];
            downsampledPed["x"] = [];
            downsampledPed["y"] = [];
            for (idx = 0; idx < ped.time.length; idx = idx+10) {
                downsampledPed.time.push(ped.time[idx]);
                downsampledPed.x.push(ped.x[idx]);
                downsampledPed.y.push(ped.y[idx]);
            }
            trajectoryDataByID.push(downsampledPed);
        }
        allTrajLoaded = true;

        document.getElementById("all_trajectories_checkbox").disabled = false;
    }).catch(err => {
        console.log(err)
    });
}

function prepareHistTT() {

    histTT = [];
    let add = false;
    const restrOrigins = od_selection.Origins.size > 0;
    const restrDest = od_selection.Destinations.size > 0;

    console.log(trajSummary);

    trajSummary.forEach(ped => {

        add = true;

        if(restrOrigins) {
            console.log(od_selection.Origins);
            if (!od_selection.Origins.has(ped.o)){
                add = false;
            }
        }

        if(restrDest) {
            if (!od_selection.Destinations.has(ped.d)){
                add = false;
            }
        }

        if(ped.en >= minTime && ped.ex <= maxTime && add) {

            histTT.push(ped.ex-ped.en);
        }

    });
}

function prepareDensityData() {

    const voronoi_poly_layer = d3.select(".voronoi_poly_layer");

    densityData = [];

    if (areasData.length > 0 || stateControlAreaButton === 'drawn') {
        if (stateControlAreaButton != 'drawn') {
            drawHiddenControlAreas(areasData, voronoi_poly_layer);
        }

        trajData.forEach(data => {

            let timedData = new Object();
            timedData.time = data.time;
            let tmp  = [];


            voronoi_poly_layer.selectAll("*").each(function () {
                tmp.push(computeDensities(data.data, d3.select(this)))
            });

            timedData.area = [].concat.apply([], tmp);

            densityData.push(timedData);
        });

        if (stateControlAreaButton != 'drawn') {
            d3.selectAll(".controlled-areas-hidden").remove();
        }
    }

    prepareHistDensity();
}

function prepareHistDensity() {

    let tmp = densityData.filter(d => (d.time <= maxTime && d.time >= minTime)).map(a => a.area);

    let areas = [].concat.apply([], tmp);

    histDensity = areas.map(val => 1.0/val);
}

function computeDensities(data, polygon) {
    let rect = rectangleContainPolygon(polygon);
    let v = d3.voronoi()
        .extent(rect);
    let clip = polygonToArray(polygon);
    let data_in_voronoi_area = filterPointInPolygon(data, polygon);
    let voronoi_polygons = v.polygons(data_in_voronoi_area.map(d => [d.x, d.y]));
    if (polygon.attr("id") === "voronoi-area") {
        voronoi_polygons = voronoi_polygons.map(p =>d3.polygonClip(clip, p));
    }
    return voronoi_polygons.map(d => d3.polygonArea(d));
}