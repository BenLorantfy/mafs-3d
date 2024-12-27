import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function ThreeDee() {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const parent = ref.current;
        if (!parent || parent.childNodes.length > 0) {
            return;
        }

        const width = parent.clientWidth;
        const height = parent.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
        
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( width, height );
        renderer.setAnimationLoop( animate );
        parent.appendChild( renderer.domElement );

        // Add orbit controls with panning enabled
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Add smooth damping effect
        controls.enablePan = true; // Enable panning
        controls.screenSpacePanning = true; // Make panning work in screen space
        controls.panSpeed = 1.0; // Adjust pan speed as needed

        // Create axes with much longer length (1000 units)
        const xAxis = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-1000, 0, 0),
                new THREE.Vector3(1000, 0, 0)
            ]),
            new THREE.LineBasicMaterial({ color: 0xffb3b3 }) // Soft red for X-axis
        );

        const yAxis = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, -1000, 0),
                new THREE.Vector3(0, 1000, 0)
            ]),
            new THREE.LineBasicMaterial({ color: 0xb3ffb3 }) // Soft green for Y-axis
        );

        const zAxis = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, -1000),
                new THREE.Vector3(0, 0, 1000)
            ]),
            new THREE.LineBasicMaterial({ color: 0xb3b3ff }) // Soft blue for Z-axis
        );

        // Add ticks and labels
        const tickSize = 0.2;
        const tickInterval = 1;
        const maxTicks = 10;

        // Helper function to create ticks and labels for an axis
        function createTicksAndLabels(axis: 'x' | 'y' | 'z', color: number) {
            for (let i = -maxTicks; i <= maxTicks; i++) {
                if (i === 0) continue; // Skip origin

                const tickGeometry = new THREE.BufferGeometry();
                const labelPosition = new THREE.Vector3();

                if (axis === 'x') {
                    tickGeometry.setFromPoints([
                        new THREE.Vector3(i * tickInterval, -tickSize/2, 0),
                        new THREE.Vector3(i * tickInterval, tickSize/2, 0)
                    ]);
                    labelPosition.set(i * tickInterval, -tickSize, 0);
                } else if (axis === 'y') {
                    tickGeometry.setFromPoints([
                        new THREE.Vector3(-tickSize/2, i * tickInterval, 0),
                        new THREE.Vector3(tickSize/2, i * tickInterval, 0)
                    ]);
                    labelPosition.set(-tickSize, i * tickInterval, 0);
                } else {
                    tickGeometry.setFromPoints([
                        new THREE.Vector3(0, -tickSize/2, i * tickInterval),
                        new THREE.Vector3(0, tickSize/2, i * tickInterval)
                    ]);
                    labelPosition.set(0, -tickSize, i * tickInterval);
                }

                const tick = new THREE.Line(
                    tickGeometry,
                    new THREE.LineBasicMaterial({ color })
                );
                scene.add(tick);

                // Create label
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (context) {
                    canvas.width = 64;
                    canvas.height = 32;
                    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
                    context.font = '24px Arial';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillText(i.toString(), 32, 16);

                    const texture = new THREE.CanvasTexture(canvas);
                    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                    const sprite = new THREE.Sprite(spriteMaterial);
                    sprite.position.copy(labelPosition);
                    sprite.scale.set(0.5, 0.25, 1);
                    scene.add(sprite);
                }
            }
        }

        // Create ticks and labels for each axis with softer colors
        createTicksAndLabels('x', 0xffb3b3); // Soft red
        createTicksAndLabels('y', 0xb3ffb3); // Soft green
        createTicksAndLabels('z', 0xb3b3ff); // Soft blue

        scene.add(xAxis);
        scene.add(yAxis);
        scene.add(zAxis);

        camera.position.set(3, 3, 3);
        camera.lookAt(0, 0, 0);

        function animate() {
            controls.update(); // Update controls in animation loop
            renderer.render( scene, camera );
        }
    }, []);

    return <div ref={ref} style={{ width: '100%', height: '100%' }}></div>
}