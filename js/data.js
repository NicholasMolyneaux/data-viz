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
        console.log(err)
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

    prepareHistTT();
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
        document.getElementById("all_trajectories_checkbox").removeAttribute('disabled');
    }).catch(err => {
        console.log(err)
    });
}

function prepareHistTT() {

    histTT = [];

    trajSummary.forEach(ped => {
        if(ped.en >= minTime && ped.ex <= maxTime) {
            histTT.push(ped.ex-ped.en);
        }

    });

}