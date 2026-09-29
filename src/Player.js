import * as THREE from 'three';

export class Player {
    constructor(camera, world) {
        this.camera = camera;
        this.world = world;

        this.velocity = new THREE.Vector3();
        this.speed = 0.3;
        this.jumpForce = 0.8;
        this.gravity = 0.02;

        this.isJumping = false;
        this.isGrounded = false;
        this.canFly = false;
        this.isFalling = false;

        this.keys = {};

        // Raycaster for ground detection
        this.raycaster = new THREE.Raycaster();
        this.raycaster.ray.direction.y = -1;
    }

    update(deltaTime) {
        // Handle movement input
        this.handleMovement();

        // Apply gravity or flying
        if (!this.canFly) {
            this.velocity.y -= this.gravity;
        } else {
            this.velocity.y *= 0.9; // Dampen flying
        }

        // Update position
        this.camera.position.add(this.velocity);

        // Ground detection
        this.checkGround();

        // Constrain to world bounds
        const boundary = 200;
        this.camera.position.x = Math.max(-boundary, Math.min(boundary, this.camera.position.x));
        this.camera.position.z = Math.max(-boundary, Math.min(boundary, this.camera.position.z));

        // Prevent falling too far
        if (this.camera.position.y < -100) {
            this.camera.position.y = 50;
            this.velocity.y = 0;
        }
    }

    handleMovement() {
        const moveDirection = new THREE.Vector3();

        // Forward
        if (this.keys['w'] || this.keys['W']) {
            moveDirection.z -= this.speed;
        }
        // Backward
        if (this.keys['s'] || this.keys['S']) {
            moveDirection.z += this.speed;
        }
        // Left
        if (this.keys['a'] || this.keys['A']) {
            moveDirection.x -= this.speed;
        }
        // Right
        if (this.keys['d'] || this.keys['D']) {
            moveDirection.x += this.speed;
        }

        // Apply relative to camera direction
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        const right = new THREE.Vector3();
        right.crossVectors(this.camera.up, cameraDirection).normalize();

        const forward = new THREE.Vector3();
        forward.crossVectors(right, this.camera.up).normalize();

        const movementDelta = new THREE.Vector3();
        movementDelta.addScaledVector(forward, moveDirection.z);
        movementDelta.addScaledVector(right, moveDirection.x);

        this.velocity.x = movementDelta.x;
        this.velocity.z = movementDelta.z;

        // Jump
        if ((this.keys[' '] || this.keys['Spacebar']) && this.isGrounded && !this.canFly) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }

        // Flying controls
        if (this.canFly) {
            if (this.keys[' '] || this.keys['Spacebar']) {
                this.velocity.y = this.speed;
            }
            if (this.keys['Shift']) {
                this.velocity.y = -this.speed;
            }
        }
    }

    checkGround() {
        if (this.canFly) {
            this.isGrounded = false;
            return;
        }

        this.raycaster.ray.origin.copy(this.camera.position);
        const intersects = this.raycaster.intersectObjects(this.world.blocks);

        if (intersects.length > 0 && intersects[0].distance < 2) {
            this.isGrounded = true;
            this.velocity.y = Math.max(0, this.velocity.y);
        } else {
            this.isGrounded = false;
        }
    }

    toggleFlyMode() {
        this.canFly = !this.canFly;
        this.velocity.y = 0;
        console.log('Fly mode:', this.canFly ? 'ON' : 'OFF');
    }
}
