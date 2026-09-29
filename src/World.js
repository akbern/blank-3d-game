import * as THREE from 'three';

const BLOCK_SIZE = 2;
const BLOCK_TYPES = {
    GRASS: 0x2d8659,
    DIRT: 0x8b6f47,
    STONE: 0x808080,
    SAND: 0xe5d4a6,
    SNOW: 0xffffff,
};

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = [];
        this.blockMap = new Map();
        this.currentBlockType = BLOCK_TYPES.GRASS;
        this.blockCount = 0;

        // Generate initial terrain
        this.generateTerrain();
    }

    generateTerrain() {
        // Create a flat base platform
        for (let x = -20; x <= 20; x++) {
            for (let z = -20; z <= 20; z++) {
                this.placeBlock(x * BLOCK_SIZE, 0, z * BLOCK_SIZE, BLOCK_TYPES.GRASS);
            }
        }

        // Add some random hills
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * 40 - 20) * BLOCK_SIZE;
            const z = Math.floor(Math.random() * 40 - 20) * BLOCK_SIZE;
            const height = Math.floor(Math.random() * 5) + 2;

            for (let y = 1; y < height; y++) {
                this.placeBlock(x, y * BLOCK_SIZE, z, BLOCK_TYPES.DIRT);
            }
        }
    }

    placeBlock(x, y, z, type = this.currentBlockType) {
        const key = `${x},${y},${z}`;
        if (this.blockMap.has(key)) return; // Block already exists

        const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        const material = new THREE.MeshStandardMaterial({
            color: type,
            roughness: 0.7,
            metalness: 0.2,
        });

        const block = new THREE.Mesh(geometry, material);
        block.position.set(x, y, z);
        block.castShadow = true;
        block.receiveShadow = true;
        block.blockType = type;
        block.blockKey = key;

        this.scene.add(block);
        this.blocks.push(block);
        this.blockMap.set(key, block);
        this.blockCount++;
    }

    removeBlock(position) {
        const key = `${position.x},${position.y},${position.z}`;
        const block = this.blockMap.get(key);

        if (block) {
            this.scene.remove(block);
            this.blocks.splice(this.blocks.indexOf(block), 1);
            this.blockMap.delete(key);
            this.blockCount--;
        }
    }

    getBlockAtPosition(position) {
        const key = `${position.x},${position.y},${position.z}`;
        return this.blockMap.get(key);
    }

    update() {
        // Can add physics updates, animations, etc.
    }
}

export { BLOCK_SIZE, BLOCK_TYPES };
