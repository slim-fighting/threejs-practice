import { Audio, AudioListener, AmbientLight, AxesHelper, Color, CylinderGeometry, GridHelper, Mesh, MeshPhongMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Scene, SpotLight, SpotLightHelper, WebGLRenderer, AudioLoader, AudioAnalyser } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import { songUrl } from "../utils/songs";
import { song } from "../main";

const width = window.innerWidth;
const height = window.innerHeight;
let sound:any 
export class AudioTest {

    private scene: Scene = new Scene();
    private camera: PerspectiveCamera
    private renderer = new WebGLRenderer({ antialias: true });
    private spotLight = new SpotLight(0xffffff, 1);
    private spotLightHelper = new SpotLightHelper(this.spotLight);
    private axesHelper = new AxesHelper(50);
    private gridHelper = new GridHelper(400, 20);
    private ambientLight = new AmbientLight(0xffffff, 0.3);
    private pointLight = new PointLight(0xffffff, 1);
  

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
        this.setGUI()
        this.setAudio()
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
        this.camera.position.set(0, 100, 200);
        this.camera.lookAt(0, 0, 0);
    }

    setHelpers() {
        this.spotLightHelper.update()
        this.scene.add(this.spotLightHelper);
        this.scene.add(this.axesHelper);
        this.scene.add(this.gridHelper);
    }

    setLights() {
        const spotLight = this.spotLight;
        this.pointLight.position.set(-50, 80, 0);
        this.pointLight.castShadow = true;
        this.pointLight.visible = false;
        spotLight.position.set(-50, 80, 0);
        spotLight.angle = Math.PI / 6;
        spotLight.castShadow = true;
        spotLight.penumbra = 0;

        this.scene.add(spotLight);
        this.scene.add(this.ambientLight);
        this.scene.add(this.pointLight);
    }

    setModel() {
        // const box = new Mesh(
        //     new BoxGeometry(10,10,10),
        //     new MeshStandardMaterial({ color: 'yellow' })
        // )
        // box.position.set(0,5,0);
        // box.castShadow = true;
        const cylinder = new Mesh(
            new CylinderGeometry(5, 5, 3, 32, 1, false),
            new MeshPhongMaterial({ color: 0x4080ff })
        )
        cylinder.castShadow = true;
        cylinder.position.set(0, 5, 0);

        const floor = new Mesh(
            new PlaneGeometry(400, 400),
            new MeshStandardMaterial({ color: 0x808080 })
        )
        floor.rotateX(-Math.PI / 2);
        floor.receiveShadow = true;
        this.scene.add(cylinder)
        this.scene.add(floor);
    }

    setGUI() {
        const gui = new dat.GUI();
        const obj = {
            color: '#ffffff', // 或者 color:0xbbffaa
        }
        const spotFolder = gui.addFolder("Spot Light");
        const cameraFolder = gui.addFolder("Camera");
        const helpersFolder = gui.addFolder("Helpers");
        const ambientLightHelper = gui.addFolder('AmbientLight');
        const pointLightHelper = gui.addFolder('PointLight');
        const audioFolder = gui.addFolder('Audio')

        spotFolder.addColor(obj, 'color').onChange((color) => {
            this.spotLight.color = new Color(color);
        });
        spotFolder.add(this.spotLight, 'angle', 0, Math.PI / 2).onChange(() => {
            this.spotLightHelper.update();
        });
        spotFolder.add(this.spotLight, 'penumbra', 0, 1);
        spotFolder.add(this.spotLight, 'visible').onChange((v) => {
            this.spotLightHelper.visible = v;
        })

        cameraFolder.add(this.camera.position, 'x', -1000, 1000);
        cameraFolder.add(this.camera.position, 'y', -1000, 1000);
        cameraFolder.add(this.camera.position, 'z', -1000, 1000);

        helpersFolder.add(this.axesHelper, 'visible').name('AxesHelper');
        helpersFolder.add(this.gridHelper, 'visible').name('GridHelper');
        helpersFolder.add(this.spotLightHelper, 'visible').name('SpotLightHelper');

        ambientLightHelper.add(this.ambientLight, 'visible');
        ambientLightHelper.addColor(obj, 'color').onChange((color) => {
            this.ambientLight.color = new Color(color);
        });
        pointLightHelper.add(this.pointLight, 'visible');

        const ISound = {
            isPlaying: false
        }
        audioFolder.add(ISound, 'isPlaying').onChange(v=> v==true? sound.play():sound.pause())
        gui.close()
    }

    setAudio() {
        // 创建一个 AudioListener 并将其添加到 camera 中
        const listener = new AudioListener();
        this.camera.add(listener);

        // 创建一个全局 audio 源
        sound = new Audio(listener);

        // 加载一个 sound 并将其设置为 Audio 对象的缓冲区
        const audioLoader = new AudioLoader();
        audioLoader.load('1.mp3', function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
        });

        // create an AudioAnalyser, passing in the sound and desired fftSize
        const analyser = new AudioAnalyser(sound, 32);

        // get the average frequency of the sound
        const data = analyser.getAverageFrequency();
        console.log(data);
        
    }
    resizeWindow() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        })
    }
}