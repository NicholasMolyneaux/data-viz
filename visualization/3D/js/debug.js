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