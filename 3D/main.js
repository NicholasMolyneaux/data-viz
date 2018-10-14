console.clear();

// Various folders
var assetsFolder = "./assets/";
var modelsFolder = "./model/";
var dataFolder = "./data/";

var container, stats, controls, raycaster;
var camera, scene, renderer, light;
//get our <DIV> container
var container = document.getElementById('container');

// Some variables
var wallHeight = 2.5;
var wallDepth = 0.1;
var peopleHeight = 1.6;
var wallsHidden = false;
var avg = [0,0];

// Some 3D objects
var topFloor, bottomFloor, ceiling;
var walls = [];

// Pedestrians
var loader = new THREE.GLTFLoader();
var dctPed = new Object();

var mouse = new THREE.Vector2(), INTERSECTED;

init();

animate();

function init() {

    // Set Camera position
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 200 );
    camera.position.set( 0, 50, 0);

    // Set the controls
    controls = new THREE.OrbitControls( camera );
    controls.target.set( 0,0,0 );
    controls.update();

    // Background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    camera.lookAt(scene.position);


    // Light
    light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
    light.position.set( 0, 1, 0 );
    scene.add( light );

    // model
    loadAndBuildWalls();

    // Load pedestrians
    loadPedestrians();

    // Load on pedestrian (DEBUG PURPOSE)
    //loadMinecraft();

    // Add axes (DEBUG PURPOSE)
    //var worldAxis = new THREE.AxesHelper(20);
    //scene.add(worldAxis);

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.gammaOutput = true;
    container.appendChild( renderer.domElement );

    // stats
    stats = new Stats();
    container.appendChild( stats.dom );

    // Resize the window
    window.addEventListener( 'resize', onWindowResize, false );

    // Click to hide walls
    document.getElementById("hide").addEventListener("click", hideWalls);

    // Click on a pedestrian
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    render()
    //console.log(camera.position)
    stats.update();
}

function render() {
    // find intersections
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children, true );

    var intersects_glft = new Array();

    // Select only skinned mesh. (To see if it works later on)
    intersects.forEach(i => {
        if (i.object.type == 'SkinnedMesh') {
            intersects_glft.push(i);
        }
    })

    if ( intersects_glft.length > 0 ) {
        if ( INTERSECTED != intersects_glft[ 0 ].object ) {
            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            INTERSECTED = intersects_glft[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } else {
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
    }
    renderer.render( scene, camera );
}

// Load the Minecraft Steve
function loadMinecraft() {

    console.log("DEBUG FUNCTION!")

    var loader = new THREE.GLTFLoader();
    loader.load( modelsFolder + 'minecraft-char.glb', gltf => {

        // Set the position
        gltf.scene.position.set(0,0,0);

        // Bounding box to get the size of the object
        var box = new THREE.Box3().setFromObject( gltf.scene );
        var size = box.getSize();

        // Define the ration and scale the minecraft steve
        var ratio = peopleHeight/size.y;
        gltf.scene.scale.set(ratio, ratio, ratio);

        // Add the object to the scene
        scene.add( gltf.scene );
    }, undefined, function ( e ) {
        console.error( e );
    } );

}

function loadAndBuildWalls() {

    fetch(dataFolder + "small/walls.json")
        .then(response => response.json())
        .then(json => buildWalls(json.walls));

}

function buildWalls(jsonWalls) {

    var corners = [];

    jsonWalls.forEach(function(w) {

        // Add the corners
        corners.push([w.x1, w.y1]);
        corners.push([w.x2, w.y1]);

        var length = Math.max(Math.abs(w.x1-w.x2), Math.abs(w.y1-w.y2));

        var vector = [w.x2-w.x1, w.y2-w.y1];
        var norm = Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2));
        vector[0] /= norm;
        vector[1] /= norm;

        var angle = 0;

        if (vector[0] > 0) {
            angle = Math.atan(vector[1]/vector[0]) - Math.PI;
        } else {
            angle = Math.atan(vector[1]/vector[0]);
        }

        var geometry = new THREE.BoxGeometry(length+wallDepth, wallHeight, wallDepth);

        // Load the texture
        var texture = THREE.ImageUtils.loadTexture(assetsFolder + 'TexturesCom_MarbleTiles0167_5_seamless_S.jpg');

        // Repeat along all directions
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1,1);

        // Create the material
        var material = new THREE.MeshLambertMaterial({ map : texture });

        var cube = new THREE.Mesh( geometry, material );

        cube.rotateY(angle);

        cube.position.x = (w.x2+w.x1)/2;
        cube.position.z = (w.y2+w.y1)/2;
        cube.position.y = wallHeight/2;
        // Add more information to the object
        cube.length = length;
        cube.angle = angle;

        walls.push(cube);
        avg[0] += cube.position.x;
        avg[1] += cube.position.z;

    });

    avg[0] = avg[0]/walls.length;
    avg[1] = avg[1]/walls.length;

    walls.forEach(c => {

        c.position.x -= avg[0];
        c.position.z -= avg[1];

        //var worldAxis = new THREE.AxesHelper(1);
        //c.add(worldAxis);

        scene.add(c);

    });

    // Update the corners position
    var centered_corners = []

    corners.forEach(c => {
        centered_corners.push([c[0]-avg[0], c[1]-avg[1]])
    })

    centered_corners = Array.from(new Set(centered_corners.map(JSON.stringify)), JSON.parse);

    centered_corners.push(centered_corners[0]);

    buildFloorAndCeiling(centered_corners);

}

function buildFloorAndCeiling(centered_corners) {

    var floor = new THREE.Shape();

    var first = true;

    centered_corners.forEach(function(c) {

        if (first) {

            floor.moveTo(c[0], c[1]);

            first = false;
        }

        floor.lineTo(c[0], c[1]);

        console.log(c[0], c[1])
        console.log(" ")

    });

    console.log(floor);

    addShapes( floor, 0, 0, 0, 0, 0, 0, 1 );

}

function addShapes( shape, x, y, z, rx, ry, rz, s ) {
    // Floor top

    // Load the texture
    var texture = THREE.ImageUtils.loadTexture(assetsFolder + 'floor_checkerboard.jpg');

    // Repeat along all directions
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1,1);

    // Create the material
    var material = new THREE.MeshLambertMaterial({ map : texture });

    // Create the geometry
    var geometry = new THREE.ShapeBufferGeometry( shape );

    // Create the Mesh
    topFloor = new THREE.Mesh( geometry, material );

    // Position, Rotate, and Scale
    topFloor.position.set( x, y, z );
    topFloor.rotation.set( rx-Math.PI/2, ry, rz );
    topFloor.scale.set( s, s, s );
    scene.add( topFloor );

    // Floor bottom

    // Simple black material
    var geometry = new THREE.ShapeBufferGeometry( shape );
    var material = new THREE.MeshBasicMaterial( { color: 0x0000, overdraw: 0.5 } );
    bottomFloor = new THREE.Mesh( geometry, material );
    bottomFloor.position.set( x, y, z );
    bottomFloor.rotation.set( rx+Math.PI/2, ry, rz );
    bottomFloor.scale.set( s, s, s );
    scene.add( bottomFloor );

    // Ceiling

    // Load the texture
    var texture = THREE.ImageUtils.loadTexture(assetsFolder + 'TexturesCom_MetalPlatesPainted0075_1_seamless_S.jpg');

    // Repeat along all directions
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1,1);

    // Create the material
    var material = new THREE.MeshLambertMaterial({ map : texture });

    // Create the geometry
    var geometry = new THREE.ShapeBufferGeometry( shape );

    // Create the Mesh
    ceiling = new THREE.Mesh( geometry, material );

    // Position, Rotate, and Scale
    ceiling.position.set( x, y+wallHeight, z );
    ceiling.rotation.set( rx+Math.PI/2, ry, rz );
    ceiling.scale.set( s, s, s );
    scene.add( ceiling );

}

function loadPedestrians() {

    const INTERVAL = 10;	// in milliseconds

    fetch(dataFolder + "small/pedestrians_clean.json")
        .then(response => response.json())
        .then(json => {
                json.forEach((item, index) => {
                    setTimeout(() => {
                        animatePedestrians(item)
                    }, INTERVAL * index);
                })
            }
        )
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
            createPedestrian(ped);
        }

    });

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

    //console.log(json.data);

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

        dctPed[ped.id].position.set(newX, 0, newY);
        if (norm > 0) {
            dctPed[ped.id].rotation.set(0, -angle, 0);
        }
    }
}

function hideWalls() {
    if (wallsHidden) {
        console.log("Walls shown!");

        walls.forEach(w => {
            w.scale.y = 1;
            w.position.y = wallHeight/2;
        });

        ceiling.visible = true;

        wallsHidden = false;
    } else {
        console.log("Walls hidden!");

        walls.forEach(w => {
            w.scale.y = 0.01;
            w.position.y = 0.01;
        });

        ceiling.visible = false;

        wallsHidden = true;
    }

}

function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}