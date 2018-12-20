/*********************************************************/
/*                                                       */
/*   Some DEBUG functions used while developing          */
/*   Not very commented, sorry...                        */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

// Load the Minecraft Steve
function loadMinecraft() {

    console.log("DEBUG FUNCTION!")

    var loader = new THREE.GLTFLoader();
    loader.load( modelsFolder + 'minecraft-char.glb', gltf => {

        console.log(gltf);

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

// Load a zombie
function loadZombie() {

    console.log("DEBUG FUNCTION!");

    let nbr = 30;

    for ( var i = 0; i < nbr; i ++ ) {
        var loader = new THREE.GLTFLoader();

        let text = i%10+1;
        let val = i;

        loader.load(modelsFolder + '3DRT/zombie_male3_text' + text + '_walk.glb', function (gltf) {

            let object = gltf.scene;

            object.traverse(function (child) {
                if (child.isMesh) {

                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            object.position.set(val, 0, 0);

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

            scene.add(object);

            clocks.push(new THREE.Clock());

        }, undefined, function ( e ) {
            console.error( e );
        } );
    }

    for ( var i = 0; i < nbr; i ++ ) {
        var loader = new THREE.GLTFLoader();

        let text = i%10+1;
        let val = i;

        loader.load(modelsFolder + '3DRT/zombie_male1_text' + text + '_crawl.glb', function (gltf) {

            let object = gltf.scene;

            object.traverse(function (child) {
                if (child.isMesh) {

                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            object.position.set(val, 0, 1.5);

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

            scene.add(object);

            clocks.push(new THREE.Clock());

        }, undefined, function ( e ) {
            console.error( e );
        } );
    }

    for ( var i = 0; i < nbr; i ++ ) {
        var loader = new THREE.GLTFLoader();

        let text = i%10+1;
        let val = i;

        loader.load(modelsFolder + '3DRT/zombie_male2_text' + text + '_lunwalk.glb', function (gltf) {

            let object = gltf.scene;

            object.traverse(function (child) {
                if (child.isMesh) {

                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            object.position.set(val, 0, 3);

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

            scene.add(object);

            clocks.push(new THREE.Clock());

        }, undefined, function ( e ) {
            console.error( e );
        } );
    }

}