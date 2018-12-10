let wallsData = null;
let zonesData = null;
let gatesData = null;
let areasData = null;
let trajData = null;
let trajSummary = null;

let chordKeysOriginalData = [];

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