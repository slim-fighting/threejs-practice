import { Body, Plane, Vec3, World, Material, Sphere, ContactMaterial } from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import dat from "dat.gui";
import { AxesHelper, BoxGeometry, Clock, Color, DirectionalLight, GridHelper, HemisphereLight, InstancedMesh, Matrix4, Mesh, MeshLambertMaterial, MeshPhongMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Raycaster, Scene, SphereGeometry, SpotLight, SpotLightHelper, Vector2, Vector4, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


const width = window.innerWidth;
const height = window.innerHeight;
export class CannonDebuggerTest {

    private scene: Scene = new Scene();
    private camera: PerspectiveCamera
    private renderer = new WebGLRenderer({ antialias: true });
    private axesHelper = new AxesHelper(100);
    private gridHelper = new GridHelper(400, 20);
    private boxes = new InstancedMesh(
        new BoxGeometry(0.1, 0.1, 0.1),
        new MeshLambertMaterial({ color: '#ffffff' }),
        10
    )
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

        const floor = new Mesh(
            new PlaneGeometry(20, 20),
            new MeshStandardMaterial({ color: 0x808080 })
        )

        floor.rotateX(-Math.PI / 2);
        floor.receiveShadow = true;
        this.scene.add(floor);

        const ball = new Mesh(
            new SphereGeometry(2, 32),
            new MeshPhongMaterial({ color: new Color().setHex(Math.random() * 0xffffff) })
        )
        this.scene.add(ball)
        const ballMaterial = new Material('ball');
        const ballBody = new Body({
            mass: 5,
            shape: new Sphere(2),
            material: ballMaterial
        })
        ballBody.position.set(10,20,0)

        const ball2 = new Mesh(
            new SphereGeometry(2, 32),
            new MeshPhongMaterial({ color: new Color().setHex(Math.random() * 0xffffff) })
        )
        this.scene.add(ball2)

        const ballBody2 = new Body({
            mass: 5,
            shape: new Sphere(2),
            material: ballMaterial
        })
        ballBody2.position.set(20,20,0)
        this.world.addBody(ballBody2);

        // add contactMaterial
        const defaultContactMaterial = new ContactMaterial(floorMaterial, ballMaterial, {
            friction: 0.1,
            restitution: 0.7,
        })
        this.world.addContactMaterial(defaultContactMaterial)
        this.world.addBody(ballBody)

        const cannonMeshes: THREE.Mesh[] = []
        const cannonDebugger = CannonDebugger(this.scene, this.world, {
            onInit(ballBody, ball) {
                ball.visible = false
                cannonMeshes.push(ball)
            },
        })
        //set gui
        const gui = new dat.GUI()
        const physicsDebugger = gui.addFolder('physics')
        const guiObj = {
            drop() {
                ballBody.position = new Vec3(0, 20, 0)
            },
            CannonDebugger: false,
        }
        physicsDebugger.add(guiObj, 'CannonDebugger').name('CannonDebugger ball visible').onChange(v=>{
            cannonMeshes.forEach(item=>{
                item.visible = v;
            })
        })

        const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        const animate = () => {
            orbitControls.update()
            cannonDebugger.update()
            this.world.fixedStep()
            ballBody.applyForce(new Vec3(20, 0, 0), new Vec3(0, 0, 0))
           // ballBody2.applyForce(new Vec3(-10, 0, 0), new Vec3(0, 0, 0))
            floor.position.copy(floorBody.position as any)
            ball.position.copy(ballBody.position as any)
            ball2.position.copy(ballBody2.position as any)
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
        const matrix = new Matrix4();
        for (let i = 0; i < 10; i++) {
            matrix.setPosition(
                Math.random() - 0.5,
                Math.random() * 2,
                Math.random() - 0.5)
            this.boxes.setMatrixAt(i, matrix);
            this.boxes.setColorAt(i, new Color().setHex(Math.random() * 0xffffff))
        }
        this.boxes.translateY(0.05);
        this.boxes.castShadow = true;
        const floor = new Mesh(
            new PlaneGeometry(400, 400),
            new MeshStandardMaterial({ color: 0x808080 })
        )
        floor.rotateX(-Math.PI / 2);
        floor.receiveShadow = true;
        // this.scene.add(floor);
        // this.scene.add(this.boxes)
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