import { Body, Plane, Vec3, World, Material, Sphere, ContactMaterial, Box } from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import dat from "dat.gui";
import {
    AxesHelper, BoxGeometry, Clock, Color, DirectionalLight,
    GridHelper, HemisphereLight, InstancedMesh, Matrix4, Mesh, MeshLambertMaterial,
    MeshPhongMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry,
    PointLight, Raycaster, Scene, SphereGeometry, SpotLight, SpotLightHelper,
    TextureLoader,
    Vector2, Vector4, WebGLRenderer
} from "three"

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


const width = window.innerWidth;
const height = window.innerHeight;
let cannonMeshes : any[] = []
export class RollDice {

    private scene: Scene = new Scene();
    private camera: PerspectiveCamera
    private renderer = new WebGLRenderer({ antialias: true });
    private axesHelper = new AxesHelper(100);
    private gridHelper = new GridHelper(400, 20);
    private world = new World();

    constructor() {
        this.camera = new PerspectiveCamera(40, width / height, 1, 1000);
        // Setup our world
        this.world.gravity.set(0, -9.82, 0); // m/s²
        // Create a plane
        const floorMaterial = new Material('floor');
        const floorBody = new Body({
            mass: 0,
            shape: new Plane(),
            material: floorMaterial
        })
        floorBody.quaternion.setFromAxisAngle(new Vec3(-1, 0, 0), Math.PI * 0.5)
        this.world.addBody(floorBody);

        const textureLoader = new TextureLoader()
        const frameColor = textureLoader.load('frame_Color.jpg');
        const frameDisplacement = textureLoader.load('frame_Displacement.jpg');
        const frameRoughness = textureLoader.load('frame_Roughness.jpg');

        const floor = new Mesh(
            new PlaneGeometry(40, 40),
            new MeshStandardMaterial({
            map: frameColor,
            bumpMap: frameDisplacement,
            roughnessMap: frameRoughness
        }))

        floor.rotateX(-Math.PI / 2);
        floor.receiveShadow = true
        this.scene.add(floor);

        //create a box
        const diceMaterial = new Material('dice')
       

        
        
        const gltfLoader = new GLTFLoader();
        let cannonDebugger:any = null
        let dice: any = null
        gltfLoader.loadAsync('骰子.glb').then(group => {
            const diceBody = new Body({
                mass: 0,
                shape: new Box(new Vec3(1, 1, 1)),
                material: diceMaterial
            })
            diceBody.position = (new Vec3(0,30,0))
            this.world.addBody(diceBody);

            dice = group.scene;
            dice.castShadow = true
            console.log(dice.position);
            
            // dice.scale.set(2,2,2)
            // dice.position.set(0,0,0)
            this.scene.add(dice)
            // const cannonMeshes: THREE.Mesh[] = []

            cannonDebugger = CannonDebugger(this.scene, this.world, {
                onInit(diceBody, dice) {
                    dice.visible = false
                    cannonMeshes.push({mesh:dice,body:diceBody})
                },
            })
            //set gui
            const gui = new dat.GUI()
            const physicsDebugger = gui.addFolder('physics')
            const guiObj = {
                drop() {
                    //
                    diceBody.position = new Vec3(0, 20, 0)
                },
                CannonDebugger: false,
            }
            physicsDebugger.add(guiObj, 'CannonDebugger').name('CannonDebugger ball visible').onChange(v => {
                cannonMeshes.forEach(item => {
                    item.mesh.visible = v;
                })
            })
        })
       
        // add contactMaterial
        const defaultContactMaterial = new ContactMaterial(floorMaterial, diceMaterial, {
            friction: 0.1,
            restitution: 0.7,
        })
        this.world.addContactMaterial(defaultContactMaterial)

        const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        const animate = () => {
            orbitControls.update()
          
            this.world.fixedStep()
            floor.position.copy(floorBody.position as any)
            if (cannonDebugger) {
                cannonDebugger.update()
            }
            cannonMeshes.forEach(item => {
                item.mesh.position.copy(item.body.position)
            })
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(animate)
        }
        this.initRenderer()
        this.setCamera()
        this.setLights()
        this.setModel()
        this.enablePhysics()
        this.setHelpers()
        this.resizeWindow()
        animate()
    }

    initRenderer() {
        this.renderer.setSize(width, height, true);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
    }

    setCamera() {
        this.camera.position.set(0, 200, 200);
        this.camera.lookAt(0, 0, 0);
    }

    setHelpers() {
        this.scene.add(this.axesHelper);
        this.scene.add(this.gridHelper);
    }

    setLights() {
        const hemisphereLight = new HemisphereLight(0xffffff, 0x888888, 0.5);
        const directionalLight = new DirectionalLight();
        directionalLight.position.set(5, 5, -5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        this.scene.background = new Color(0x888888);
        this.scene.add(hemisphereLight);
    }

    setModel() {
        // const floor = new Mesh(
        //     new PlaneGeometry(400, 400),
        //     new MeshStandardMaterial({ color: 0x808080 })
        // )
        // floor.rotateX(-Math.PI / 2);
        // floor.receiveShadow = true;
        // this.scene.add(floor);
    }

    enablePhysics() {

    }

    resizeWindow() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        })
    }
}