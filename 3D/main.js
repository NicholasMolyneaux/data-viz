console.clear();

var container, stats, controls;
var camera, scene, renderer, light;
//get our <DIV> container
var container = document.getElementById('container');

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
    scene.background = new THREE.Color(0xCD0000);
    camera.lookAt(scene.position);


    // Light
    light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
    light.position.set( 0, 1, 0 );
    scene.add( light );

    // model
    loadWalls(scene)
    loadMinecraft(scene)

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.gammaOutput = true;
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );


    // stats
    stats = new Stats();
    container.appendChild( stats.dom );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    //console.log(camera.position)
    stats.update();
}

// Load the Minecraft Steve
function loadMinecraft(scene) {

    var loader = new THREE.GLTFLoader();
    loader.load( './model/minecraft-char.glb', function ( gltf ) {
        gltf.scene.traverse( function ( child ) {
            /*if ( child.isMesh ) {
                child.material.envMap = envMap;
            }*/
        } );
        scene.add( gltf.scene );
    }, undefined, function ( e ) {
        console.error( e );
    } );

}

function loadWalls(scene) {

    

}