import { AmbientLight, AxesHelper, BoxGeometry, Camera, CubeTextureLoader, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Scene, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
const width = window.innerWidth;
const height = window.innerHeight;

export class InitThreeEngine {

    private scene: Scene = new Scene();
    private camera: Camera
    private renderer = new WebGLRenderer({ antialias: true});
    private orbitControls: OrbitControls
    constructor() {

        this.camera = new PerspectiveCamera(40, width / height, 1, 1000);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        const animate = () => {
            this.orbitControls.update()
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(animate)
        }
        this.initRenderer()
        this.setCamera()
        this.setAxesHelper()
        this.setAmbientLight()
        this.setPointLight()
        this.setModel()
        animate()
    }

    initRenderer() {
        this.renderer.setSize(width, height, true);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
    }

    setCamera() {
        this.camera.position.set(0, 100, 200);
        this.camera.lookAt(0, 0, 0);
    }

    setAxesHelper() {
        const axesHelper = new AxesHelper(50);
        this.scene.add(axesHelper);
    }

    setAmbientLight() {
        const ambientLight = new AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
    }

    setPointLight() {
        const pointLight = new PointLight(0xffffff, 0.7);
        pointLight.position.set(0, 100,100);
        pointLight.castShadow = true;
        this.scene.add(pointLight);
    }

    setModel() {
        const box = new Mesh(
            new BoxGeometry(10,10,10),
            new MeshStandardMaterial({ color: 'yellow' })
        )
        box.position.set(0,5,0);
        box.castShadow = true;

        const floor = new Mesh(
            new PlaneGeometry(400,400),
            new MeshStandardMaterial({ color: 0x808080})
        )
        floor.rotateX(-Math.PI/2);
        floor.receiveShadow = true;
        this.scene.add(box);
        this.scene.add(floor);
    }

}