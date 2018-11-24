console.clear();

// Various folders
const assetsFolder = "./assets/";
const modelsFolder = "./models/";
const dataFolder = "./data/";

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

const FACTOR = 2;

const CUSTOMINTERVAL = INTERVAL/FACTOR;

console.log(FACTOR);

let clocks = [];

init();

animate();

function init() {

    // Set Camera position
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );
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

    // models
    loadAndBuildWalls();


    // Load pedestrians
    loadPedestrians();

    // Load one pedestrian (DEBUG PURPOSE)
    //loadMinecraft();

    // Load one zombie (DEBUG PURPOSE)
    //loadZombie();

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