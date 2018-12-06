function intersection(o1, o2) {
    return Object.keys(o1).filter({}.hasOwnProperty.bind(o2));
}

function runAnimation3D() {

    const timeBounds = [minTime, maxTime];

    let trajDataFiltered = null;
    let interval = null;

    if (SPEEDFACTOR <= 2) {
        trajDataFiltered = interpolatedTrajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);
        interval = INTERVAL3D;
    } else {
        trajDataFiltered = trajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);
        interval = INTERVAL2D;
    }

    function walkData() {
        if (currentTimeShownIdx >= trajDataFiltered.length) {
            currentTimeShownIdx = 0;
            //clearInterval(pedMover);
        }
        animatePedestrians(trajDataFiltered[currentTimeShownIdx].data);
        updateTimer(trajDataFiltered[currentTimeShownIdx].time);
        currentTimeShownIdx += 1;
    }

    pedMover = setInterval(walkData, interval/SPEEDFACTOR);

}

function runOneStep3D() {
    const timeBounds = [minTime, maxTime];

    let trajDataFiltered = null;

    if (SPEEDFACTOR <= 2) {
        trajDataFiltered = interpolatedTrajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);
    } else {
        trajDataFiltered = trajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);
    }

    animatePedestrians(trajDataFiltered[currentTimeShownIdx].data);
    updateTimer(trajDataFiltered[currentTimeShownIdx].time);
}

function animatePedestrians(json) {

    var listIds = [];

    // Go through data
    json.forEach(ped => {

        listIds.push(ped.id);

        // Check if its ID is in the dct of ped
        if (dctPed.hasOwnProperty(ped.id)){
            // Update the position of this pedestrian
            updatePosition3D(ped);
        } else {
            // Create a pedestrian
            if (STYLE == "normal") {
                createPedestrian(ped);
            } else if (STYLE == "TWD") {
                createZombie(ped);
            }
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

    loader.load( modelsFolder + 'pedestrian.glb', gltf => {

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


function createSteve(ped) {

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

                console.log(child.material);

                child.castShadow = true;
                child.receiveShadow = true;
                child.material.refractionRatio = 0.5;
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
        if (anim == "crawl") {
            gltf.scene.position.set(ped.x-avg[0],0.1,ped.y-avg[1]);

        } else {
            gltf.scene.position.set(ped.x-avg[0],0,ped.y-avg[1]);
        }

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

function updatePosition3D(ped) {
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

        if (STYLE == "TWD") {
            angle = angle - Math.PI/2;
        }

        dctPed[ped.id].position.set(newX, dctPed[ped.id].position['y'], newY);
        if (norm > 0) {
            dctPed[ped.id].rotation.set(0, -angle, 0);
        }
    }
}