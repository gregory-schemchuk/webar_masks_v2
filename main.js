// SETTINGS of this demo:
const SETTINGS = {
    gltfModelURL: 'gjel_mask/mask.gltf',
    //gltfModelURL: 'DamagedHelmet/glTF/DamagedHelmet.gltf',
    //gltfModelURL: 'Kokoshnik/Unreal Engine 4.gltf',
    //gltfModelURL: 'head_test/koltsa.gltf',
    cubeMapURL: 'Bridge2/',
    offsetYZ: [1.4, 0.65], // offset of the model in 3D along vertical and depth axis
    //scale: 2.5
    //offsetYZ: [2.7, -0.6], // offset of the model in 3D along vertical and depth axis
    scale: 3
    //offsetYZ: [-1, -20], // offset of the model in 3D along vertical and depth axis
    //scale: 45
};

let THREECAMERA = null;


// build the 3D. called once when Jeeliz Face Filter is OK
function init_threeScene(spec){
    const threeStuffs = JeelizThreeHelper.init(spec, null);

    // CREATE THE ENVMAP:
    /*
    const path = SETTINGS.cubeMapURL;
    const format = '.jpg';
    const envMap = new THREE.CubeTextureLoader().load( [
        path + 'posx' + format, path + 'negx' + format,
        path + 'posy' + format, path + 'negy' + format,
        path + 'posz' + format, path + 'negz' + format
    ] );
     */

    // IMPORT THE GLTF MODEL:
    // from https://threejs.org/examples/#webgl_loader_gltf
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load( SETTINGS.gltfModelURL, function ( gltf ) {
        gltf.scene.traverse( function ( child ) {
            if ( child.isMesh ) {
                //child.material.envMap = envMap;
            }
        } );
        gltf.scene.frustumCulled = false;

        // center and scale the object:
        const bbox = new THREE.Box3().expandByObject(gltf.scene);

        // center the model:
        const centerBBox = bbox.getCenter(new THREE.Vector3());
        gltf.scene.position.add(centerBBox.multiplyScalar(-1));
        gltf.scene.position.add(new THREE.Vector3(0,SETTINGS.offsetYZ[0], SETTINGS.offsetYZ[1]));

        // scale the model according to its width:
        const sizeX = bbox.getSize(new THREE.Vector3()).x;
        gltf.scene.scale.multiplyScalar(SETTINGS.scale / sizeX);

        // dispatch the model:
        threeStuffs.faceObject.add(gltf.scene);

        const light_2 = new THREE.DirectionalLight(0xFFFFFF);
        light_2.position.set(10, 10, 20);
        light_2.intensity = 3;
        //light_2.castShadow = true;
        threeStuffs.faceObject.add(light_2);
    } ); //end gltfLoader.load callback

    //CREATE THE CAMERA
    THREECAMERA = JeelizThreeHelper.create_camera();
} //end init_threeScene()


//entry point:
function main(){
    JeelizResizer.size_canvas({
        canvasId: 'jeeFaceFilterCanvas',
        isFullScreen: true,
        callback: start
    })
}


function start(){
    JEELIZFACEFILTER.init({
        videoSettings:{ // increase the default video resolution since we are in full screen
            'idealWidth': 1280,  // ideal video width in pixels
            'idealHeight': 800,  // ideal video height in pixels
            'maxWidth': 1920,    // max video width in pixels
            'maxHeight': 1920,    // max video height in pixels
            'flipX': true
        },
        followZRot: true,
        canvasId: 'jeeFaceFilterCanvas',
        NNCPath: './NN_DEFAULT.json', //root of NN_DEFAULT.json file
        callbackReady: function(errCode, spec){
            if (errCode){
                console.log('AN ERROR HAPPENS. SORRY BRO :( . ERR =', errCode);
                return;
            }

            console.log('INFO: JEELIZFACEFILTER IS READY');
            init_threeScene(spec);
        }, //end callbackReady()

        // called at each render iteration (drawing loop):
        callbackTrack: function(detectState){
            JeelizThreeHelper.render(detectState, THREECAMERA);
        }
    }); //end JEELIZFACEFILTER.init call
} //end start()


window.addEventListener('load', main);