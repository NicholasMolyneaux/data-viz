console.clear();

var container, stats, controls;
var camera, scene, renderer, light;
//get our <DIV> container
var container = document.getElementById('container');

var walls = [];
var wallHeight = 2.5;
var wallDepth = 0.1;
var peopleHeight = 1.8;



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
    loadMinecraft();

    // Add axes
    var worldAxis = new THREE.AxesHelper(20);
    scene.add(worldAxis);

    var path = new THREE.Path();

    path.lineTo( 0, 0.8 );
    path.quadraticCurveTo( 0, 1, 0.2, 1 );
    path.lineTo( 1, 1 );

    var points = path.getPoints();

    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    var material = new THREE.LineBasicMaterial( { color: 0xffffff } );

    var line = new THREE.Line( geometry, material );
    scene.add( line );

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
function loadMinecraft() {

    var loader = new THREE.GLTFLoader();
    loader.load( './model/minecraft-char.glb', gltf => {

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

    fetch("./data/walls.json")
        .then(response => response.json())
        .then(json => buildWalls(json.walls));

}

function buildWalls(jsonWalls) {

    var avg = [0,0];

    var corners = [];

    jsonWalls.forEach(function(w) {

        // Add the corners
        corners.push([w.x1, w.y1]);
        corners.push([w.x2, w.y1]);

        var length = Math.max(Math.abs(w.x1-w.x2), Math.abs(w.y1-w.y2));

        var vector = [w.x2-w.x1, w.y2-w.y1];
        var norm = Math.abs(vector[0]) + Math.abs(vector[1]);
        vector[0] /= norm;
        vector[1] /= norm;

        var angle = 0;

        if (vector[0] > 0) {
            angle = Math.atan(vector[1]/vector[0]) - Math.PI;
        } else {
            angle = Math.atan(vector[1]/vector[0]);
        }

        var geometry = new THREE.BoxGeometry(length+wallDepth, wallHeight, wallDepth);

        var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
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

        var worldAxis = new THREE.AxesHelper(1);
        c.add(worldAxis);

        scene.add(c);

    });

    // Update the corners position
    var centered_corners = []

    corners.forEach(c => {
        centered_corners.push([c[0]-avg[0], c[1]-avg[1]])
    })

    centered_corners = Array.from(new Set(centered_corners.map(JSON.stringify)), JSON.parse);

    centered_corners.push(centered_corners[0]);

    buildFloor(centered_corners);

}

function buildFloor(centered_corners) {

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

    addShape( floor, 0xffee00, 0, 0, 0, 0, 0, 0, 1 );



}

function addShape( shape, color, x, y, z, rx, ry, rz, s ) {
    // flat shape
    var geometry = new THREE.ShapeBufferGeometry( shape );
    var material = new THREE.MeshBasicMaterial( { color: color, overdraw: 0.5 } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( x, y, z );
    mesh.rotation.set( rx-Math.PI/2, ry, rz );
    mesh.scale.set( s, s, s );
    scene.add( mesh );

    // flat shape
    var geometry = new THREE.ShapeBufferGeometry( shape );
    var material = new THREE.MeshBasicMaterial( { color: color, overdraw: 0.5 } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( x, y, z );
    mesh.rotation.set( rx+Math.PI/2, ry, rz );
    mesh.scale.set( s, s, s );
    scene.add( mesh );


}