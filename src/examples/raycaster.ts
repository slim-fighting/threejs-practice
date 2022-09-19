import { AmbientLight, AxesHelper, Color,  GridHelper, HemisphereLight, IcosahedronGeometry, InstancedMesh, Matrix4, Mesh, MeshPhongMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Raycaster, Scene, SpotLight, SpotLightHelper, Vector2, Vector4, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const width = window.innerWidth;
const height = window.innerHeight;
const amount = 5
const count = Math.pow(amount, 3);
export class InitThreeEngine {

    private scene: Scene = new Scene();
    private camera: PerspectiveCamera
    private renderer = new WebGLRenderer({ antialias: true });
    private axesHelper = new AxesHelper(50);
    private gridHelper = new GridHelper(400, 20);
    private rayCaster= new Raycaster();
    private mouse = new Vector2()
    private color = new Color()
    private balls = new InstancedMesh(
        new IcosahedronGeometry(0.5, 2),
        new MeshPhongMaterial({ color: new Color().setHex(0xffffff)}),
        count
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
        this.setHelpers()
        this.resizeWindow()
        this.setRayCaster()
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
        //this.scene.add(this.axesHelper);
        this.scene.add(this.gridHelper);
    }

    setLights() {
        const ambientLight = new AmbientLight(0xffffff, 0.3);
        const hemisphereLight = new HemisphereLight(0xffffff, 0x888888);
        //hemisphereLight.castShadow = true;
        this.scene.add(ambientLight);
        this.scene.add(hemisphereLight);
    }

    setModel() {
        // const box = new Mesh(
        //     new BoxGeometry(10,10,10),
        //     new MeshStandardMaterial({ color: 'yellow' })
        // )
        // box.position.set(0,5,0);
        // box.castShadow = true;
        // const cylinder = new Mesh(
        //     new CylinderGeometry(5, 5, 3, 32, 1, false),
        //     new MeshPhongMaterial({ color: 0x4080ff })
        // )
        // cylinder.castShadow = true;
        // cylinder.position.set(0, 5, 0);
 
        const offset = (amount - 1) / 2;
        const matrix = new Matrix4();
        let index = 0
        this.balls.translateY(5);

        for (let x = 0; x < amount; x++) {
            for (let y = 0; y < amount; y++) {
                for (let z = 0; z < amount; z++) {
                    matrix.setPosition(x - offset, y - offset, z - offset);
                    this.balls.setMatrixAt(index,matrix);
                    this.balls.setColorAt(index, this.color)
                    index++
                }
            }
        }

        const floor = new Mesh(
            new PlaneGeometry(400, 400),
            new MeshStandardMaterial({ color: 0x808080 })
        )
        floor.rotateX(-Math.PI / 2);
        floor.receiveShadow = true;
        // this.scene.add(cylinder)
        this.scene.add(floor);
        this.scene.add(this.balls)
    }

    resizeWindow() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        })
    }

    setRayCaster() {
        document.addEventListener('click', event=>{
            const x = event.offsetX;
            const y = event.offsetY;
            this.mouse.x = x / width * 2 - 1;
            this.mouse.y = -y * 2 / height + 1;
            this.rayCaster.setFromCamera(this.mouse,this.camera);
            const intersectObjects  = this.rayCaster.intersectObjects(this.scene.children, false);
            if (intersectObjects && intersectObjects[0].instanceId){
                this.balls.getColorAt(intersectObjects[0].instanceId, this.color)
                if(this.color.equals(new Color().setHex(0xffffff))){
                    this.balls.setColorAt(intersectObjects[0].instanceId, this.color.setHex(Math.random() * 0xffffff));
                    if (this.balls.instanceColor) {
                        this.balls.instanceColor.needsUpdate = true
                    }
                }
               
            }
        })
    }
}