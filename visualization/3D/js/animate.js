function loadPedestrians() {

    const infraName = "lausannetest5";
    const TrajName = "test1";

    const url = "http://transporsrv2.epfl.ch/api/trajectoriesbytime/"+infraName+"/"+TrajName;

    fetch(url)
        .then(response => response.json())
        .then(json => {
            interpolateAndAnimate(json);
        })
}

function intersection(o1, o2) {
    return Object.keys(o1).filter({}.hasOwnProperty.bind(o2));
}

function interpolateAndAnimate(json) {

    console.log(json[0]);
    console.log(json[10]);

    const arrayToObject = (array) =>
        array.reduce((obj, item) => {
            obj[item.id] = item
            return obj
        }, {});

    const delta = 0.1;

    let interpJson = [];

    for(let i=0; i<json.length-1; i++) {
        interpJson.push(json[i]);

        const init = arrayToObject(json[i].data);
        const final = arrayToObject(json[i+1].data);

        const inter = intersection(init, final);

        for(let j=1; j<=INTERP; j++) {
            let interpObj = new Object();
            interpObj['time'] = json[i].time + delta/(INTERP+1)*j

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
            interpJson.push(interpObj);
        }
    }

    interpJson.forEach((item, index) => {
        setTimeout(() => {
            animatePedestrians(item)
        }, CUSTOMINTERVAL * index);
    })

}



function animatePedestrians(json) {

    // Update the time
    document.getElementById("timer").innerHTML = json.time.toFixed(2) + " [s.]";

    var listIds = [];

    // Go through data
    json.data.forEach(ped => {

        listIds.push(ped.id);

        // Check if its ID is in the dct of ped
        if (dctPed.hasOwnProperty(ped.id)){
            // Update the position of this pedestrian
            updatePosition(ped);
        } else {
            // Create a pedestrian
            //createPedestrian(ped);
            createZombie(ped);
        }

    });

    deletePedestrian(listIds);

    //console.log(json.data);

}

function deletePedestrian(listIds) {

    // Find which pedestrian is not in the dctPed anymore
    var knownIds = new Set(Object.keys(dctPed));
    var theseIds = new Set(listIds);

    var diff = new Set([...knownIds].filter(x => !theseIds.has(x)));

    // Delete all the lost pedestrians
    diff.forEach(pedId => {
        var ped = dctPed[pedId];
        scene.remove(ped);
        delete dctPed[pedId];
    })
}

function createPedestrian(ped) {

    console.log("Create Pedestrian with ID " + ped.id);
    dctPed[ped.id] = new Object();

    loader.load( modelsFolder + 'minecraft-char.glb', gltf => {

        // Bounding box to get the size of the object
        var box = new THREE.Box3().setFromObject( gltf.scene );
        var size = box.getSize();

        // Define the ration and scale the minecraft steve
        var ratio = peopleHeight/size.y;
        gltf.scene.scale.set(ratio, ratio, ratio);

        // Set the position
        gltf.scene.position.set(ped.x-avg[0],0,ped.y-avg[1]);

        gltf.scene.matrixWorldNeedsUpdate = true;
        gltf.scene.updateMatrixWorld();

        // Add the pedestrian to dct
        dctPed[ped.id] = gltf.scene;

        // Add the object to the scene
        scene.add( gltf.scene );


    }, undefined, function ( e ) {
        console.error( e );
    } );

}

function createZombie(ped) {

    console.log("Create Zombie with ID " + ped.id);
    dctPed[ped.id] = new Object();

    let gender = 'male';

    if (Math.random() > 0.5) {
        gender = 'female';
    }

    const nbr = Math.floor(Math.random() * 3) + 1;

    const texture = Math.floor(Math.random() * 10) + 1;

    const proba = Math.random();

    let anim = "lunwalk";

    if (proba < 0.2) {
        anim = "crawl";
    } else if (proba < 0.6) {
        anim = "walk";
    }

    loader.load(modelsFolder + '3DRT/zombie_' + gender + nbr + '_text' + texture + '_' + anim + '.glb', function (gltf) {

        let object = gltf.scene;

        object.traverse(function (child) {
            if (child.isMesh) {

                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Bounding box to get the size of the object
        var box = new THREE.Box3().setFromObject(object);
        var size = box.getSize();

        // Define the ration and scale the minecraft steve
        var ratio = peopleHeight / size.y;
        console.log("ratio = " + ratio);
        object.scale.set(ratio, ratio, ratio);

        // Animation of the object
        object.mixer = new THREE.AnimationMixer( object );

        mixers.push( object.mixer );
        var action = object.mixer.clipAction( gltf.animations[0]);
        action.play();

        clocks.push(new THREE.Clock());

        // Set the position
        gltf.scene.position.set(ped.x-avg[0],0,ped.y-avg[1]);

        gltf.scene.matrixWorldNeedsUpdate = true;
        gltf.scene.updateMatrixWorld();

        // Add the pedestrian to dct
        dctPed[ped.id] = gltf.scene;

        // Add the object to the scene
        scene.add( gltf.scene );

    }, undefined, function ( e ) {
        console.error( e );
    } );


}

function updatePosition(ped) {
    if (dctPed[ped.id].hasOwnProperty("position")) {

        var oldX = dctPed[ped.id].position['x'];
        var oldY = dctPed[ped.id].position['z'];

        var newX = ped.x-avg[0];
        var newY = ped.y-avg[1];

        var direction = [newX-oldX, newY-oldY];

        var norm = Math.sqrt(Math.pow(direction[0],2) + Math.pow(direction[1],2));

        direction[0] /= norm;
        direction[1] /= norm;

        var angle = 0;

        if (direction[0] > 0) {
            angle = Math.atan(direction[1]/direction[0]) - Math.PI/2;
        } else {
            angle = Math.atan(direction[1]/direction[0]) + Math.PI/2;
        }

        angle = angle - Math.PI/2;

        dctPed[ped.id].position.set(newX, 0, newY);
        if (norm > 0) {
            dctPed[ped.id].rotation.set(0, -angle, 0);
        }
    }
}