import * as THREE from 'three';
import { BLOCK_SIZE } from './World.js';

export class InputManager {
    constructor(player, world) {
        this.player = player;
        this.world = world;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Listen for keyboard
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Listen for mouse
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', (e) => this.onClick(e));
        window.addEventListener('contextmenu', (e) => this.onRightClick(e));
        window.addEventListener('wheel', (e) => this.onScroll(e));
    }

    onKeyDown(event) {
        this.player.keys[event.key] = true;

        // Toggle fly mode with C
        if (event.key === 'c' || event.key === 'C') {
            this.player.toggleFlyMode();
        }
    }

    onKeyUp(event) {
        this.player.keys[event.key] = false;
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onClick(event) {
        // Left click - place block
        if (event.button === 0) {
            this.placeBlockAtCursor();
        }
    }

    onRightClick(event) {
        event.preventDefault();
        // Right click - remove block
        if (event.button === 2) {
            this.removeBlockAtCursor();
        }
    }

    onScroll(event) {
        // Change block type with scroll wheel
        event.preventDefault();
        const types = Object.values({
            GRASS: 0x2d8659,
            DIRT: 0x8b6f47,
            STONE: 0x808080,
            SAND: 0xe5d4a6,
            SNOW: 0xffffff,
        });

        const currentIndex = types.indexOf(this.world.currentBlockType);
        let newIndex = currentIndex;

        if (event.deltaY < 0) {
            newIndex = (currentIndex + 1) % types.length;
        } else {
            newIndex = (currentIndex - 1 + types.length) % types.length;
        }

        this.world.currentBlockType = types[newIndex];
    }

    placeBlockAtCursor() {
        this.raycaster.setFromCamera(this.mouse, this.player.camera);
        const intersects = this.raycaster.intersectObjects(this.world.blocks);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const normal = intersects[0].face.normal;

            // Place block adjacent to the hit surface
            const newPos = new THREE.Vector3();
            newPos.copy(point);
            newPos.addScaledVector(normal, BLOCK_SIZE / 2 + 0.1);

            // Snap to grid
            newPos.x = Math.round(newPos.x / BLOCK_SIZE) * BLOCK_SIZE;
            newPos.y = Math.round(newPos.y / BLOCK_SIZE) * BLOCK_SIZE;
            newPos.z = Math.round(newPos.z / BLOCK_SIZE) * BLOCK_SIZE;

            this.world.placeBlock(newPos.x, newPos.y, newPos.z);
        }
    }

    removeBlockAtCursor() {
        this.raycaster.setFromCamera(this.mouse, this.player.camera);
        const intersects = this.raycaster.intersectObjects(this.world.blocks);

        if (intersects.length > 0) {
            const block = intersects[0].object;
            const pos = block.position;
            this.world.removeBlock(pos);
        }
    }

    update() {
        // Update logic can go here if needed
    }
}
