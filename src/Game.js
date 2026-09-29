import * as THREE from 'three';
import { Player } from './Player.js';
import { World } from './World.js';
import { InputManager } from './InputManager.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        this.scene.fog = new THREE.Fog(0x87ceeb, 500, 1000);

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 50, 0);

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // Setup lighting
        this.setupLighting();

        // Create world and player
        this.world = new World(this.scene);
        this.player = new Player(this.camera, this.world);
        this.inputManager = new InputManager(this.player, this.world);

        // FPS counter
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        this.lastTime = performance.now();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -250;
        directionalLight.shadow.camera.right = 250;
        directionalLight.shadow.camera.top = 250;
        directionalLight.shadow.camera.bottom = -250;
        this.scene.add(directionalLight);
    }

    start() {
        this.renderer.setAnimationLoop(() => this.update());
    }

    update() {
        const deltaTime = this.clock.getDelta();

        // Update player
        this.player.update(deltaTime);

        // Update camera to follow player
        this.camera.position.lerp(this.player.camera.position, 0.1);
        this.camera.quaternion.slerp(this.player.camera.quaternion, 0.1);

        // Update input
        this.inputManager.update();

        // Update world
        this.world.update();

        // Render
        this.renderer.render(this.scene, this.camera);

        // Update FPS
        this.updateFPS();
    }

    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime >= this.lastTime + 1000) {
            document.getElementById('fps').textContent = `FPS: ${this.frameCount}`;
            document.getElementById('blocks').textContent = `Blocks: ${this.world.blockCount}`;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
