console.clear();

// Various folders
const assetsFolder = "./assets/";
const modelsFolder = "./models/";

let container, stats, controls, raycaster;
let camera, scene, renderer, light;
//get our <DIV> container
container = document.getElementById('container');

// Some variables
const wallHeight = 2.5;
const wallDepth = 0.1;
const peopleHeight = 1.6;
let wallsHidden = false;
let avg = [0,0];

// Some 3D objects
let topFloor, bottomFloor, ceiling;
let walls = [];

// Pedestrians
let loader = new THREE.GLTFLoader();
let dctPed = new Object();
let mixers = [];

let mouse = new THREE.Vector2(), INTERSECTED;
let SELECTED = new Object();

const INTERP = 4;
const INTSECOND = 100;
const INTERVAL = INTSECOND/(INTERP+1);

const FACTOR = 1;

const CUSTOMINTERVAL = INTERVAL/FACTOR;

console.log(FACTOR);

let clocks = [];
let lights = [];

//const STYLE = "normal";
const STYLE = "TWD";

const infraName = "lausannetest5";
const TrajName = "test4";

let wallsData = null;
let zonesData = null;
let trajData = null;

fetch("http://transporsrv2.epfl.ch/api/infra/walls/" + infraName)
    .then(response => response.json())
    .then(json => {
        wallsData = json;
    });

fetch("http://transporsrv2.epfl.ch/api/infra/zones/" + infraName)
    .then(response => response.json())
    .then(json => {
        zonesData = json;
    });

fetch("http://transporsrv2.epfl.ch/api/trajectoriesbytime/"+infraName+"/"+TrajName)
    .then(response => response.json())
    .then(json => {
        trajData = json;
    })
    .then(() => {
        init();
        animate();
    });

function init() {

    // Set Camera position
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );
    camera.position.set( 0, 50, 0);

    // Set the controls
    controls = new THREE.OrbitControls( camera );
    controls.target.set( 0,0,0 );
    controls.update();

    // New scene
    scene = new THREE.Scene();
    camera.lookAt(scene.position);

    // models
    buildWalls(wallsData);


    // Load pedestrians
    interpolateAndAnimate(trajData);

    // Load one pedestrian (DEBUG PURPOSE)
    //loadMinecraft();

    // Load one zombie (DEBUG PURPOSE)
    //loadZombie();

    // Add axes (DEBUG PURPOSE)
    //var worldAxis = new THREE.AxesHelper(20);
    //scene.add(worldAxis);

    // Light
    if (STYLE == "normal") {
        scene.background = new THREE.Color(0xffffff);

        light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
        light.position.set( 0, wallHeight, 0 );
        light.castShadow = true;
        scene.add( light );

    } else if (STYLE == "TWD") {
        scene.background = new THREE.Color(0x000000);

        light = new THREE.HemisphereLight( 0xffffff, 0x444422, 0.0001 );
        light.position.set( 0, wallHeight, 0 );
        light.castShadow = true;
        scene.add( light );

        addTWDLights(scene, zonesData);
    }


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

    // Mouse stuff
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );

    // Key stuff
    document.addEventListener( 'keypress', onKeyPress, false);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );

    if ( mixers.length > 0 ) {
        for ( var i = 0; i < mixers.length; i ++ ) {
            mixers[i].update( FACTOR*clocks[i].getDelta() );
        }
    }

    render();
    //console.log(camera.position)
    stats.update();

    for (var i=0; i<lights.length; i++) {
        const proba = Math.random();

        if (proba > 0.995) {
            // Change the state of the light

            if (lights[i]['on'] & Math.random() > 0.8) {
                lights[i].light.intensity = 0.1;
                lights[i]['on'] = false;
            } else {
                lights[i].light.intensity = Math.random();
                lights[i]['on'] = true;
            }
        }
    }

    //console.log(camera.position);
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
            console.log(INTERSECTED);
        }
    } else {
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
    }

    followPedestrian();

    renderer.render( scene, camera );
}