import { AxesHelper, BoxGeometry, Color, DirectionalLight, GridHelper, HemisphereLight, InstancedMesh, Matrix4, Mesh, MeshLambertMaterial, MeshPhongMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Raycaster, Scene, SpotLight, SpotLightHelper, Vector2, Vector4, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { AmmoPhysics } from "three/examples/jsm/physics/AmmoPhysics"

const width = window.innerWidth;
const height = window.innerHeight;
export class OimoPhysics {

    private scene: Scene = new Scene();
    private camera: PerspectiveCamera
    private renderer = new WebGLRenderer({ antialias: true });
    private axesHelper = new AxesHelper(100);
    private gridHelper = new GridHelper(400, 20);
    private boxes = new InstancedMesh(
        new BoxGeometry(0.1, 0.1,0.1),
        new MeshLambertMaterial({ color: '#ffffff' }),
        10
    )
    constructor() {

        this.camera = new PerspectiveCamera(40, width / height, 1, 1000);
        const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        const animate = () => {
            orbitControls.update()
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
        this.camera.position.set(20, 20, 20);
        this.camera.lookAt(0, 0, 0);
    }

    setHelpers() {
        this.scene.add(this.axesHelper);
        this.scene.add(this.gridHelper);
    }

    setLights() {
        const hemisphereLight = new HemisphereLight(0xffffff, 0x888888,0.3);
        const directionalLight = new DirectionalLight();
        directionalLight.position.set(5,5,-5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        this.scene.background = new Color(0x888888);
        this.scene.add(hemisphereLight);
    }

    setModel() {
        const matrix = new Matrix4();
        for (let i = 0; i < 10; i++) {
            matrix.setPosition(
                Math.random()-0.5,
                Math.random()*2,
                Math.random()-0.5)
            this.boxes.setMatrixAt(i,matrix);
            this.boxes.setColorAt(i, new Color().setHex(Math.random()*0xffffff))
        }
        this.boxes.translateY(0.05);
        this.boxes.castShadow =true;
        const floor = new Mesh(
            new PlaneGeometry(400, 400),
            new MeshStandardMaterial({ color: 0x808080 })
        )
        floor.rotateX(-Math.PI / 2);
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.scene.add(this.boxes)
    }

    enablePhysics() {
        const oimo = new OimoPhysics()
    }

    resizeWindow() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        })
    }
}