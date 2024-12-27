import { createContext, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useContextOrThrow } from './utils.js';

const SceneProvider = createContext<THREE.Scene | null>(null);

/**
 * A 3D scene that can contain 3D plots, points, etc.
 */
export function Mafs3D({ children }: { children?: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    if (!sceneRef.current) {
        sceneRef.current = new THREE.Scene();
    }
    const scene = sceneRef.current;

    useLayoutEffect(() => {
        const parent = ref.current;
        if (!parent || parent.childNodes.length > 0) {
            return;
        }

        const width = parent.clientWidth;
        const height = parent.clientHeight;

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
                new THREE.Vector3(0, 0, -1000),
                new THREE.Vector3(0, 0, 1000)
            ]),
            new THREE.LineBasicMaterial({ color: 0xb3ffb3 }) // Soft green for Y-axis
        );

        const zAxis = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, -1000, 0),
                new THREE.Vector3(0, 1000, 0)
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
                        new THREE.Vector3(i * tickInterval, 0, -tickSize/2),
                        new THREE.Vector3(i * tickInterval, 0, tickSize/2)
                    ]);
                    labelPosition.set(i * tickInterval, 0, -tickSize);
                } else if (axis === 'y') {
                    tickGeometry.setFromPoints([
                        new THREE.Vector3(-tickSize/2, 0, i * tickInterval),
                        new THREE.Vector3(tickSize/2, 0, i * tickInterval)
                    ]);
                    labelPosition.set(-tickSize, 0, i * tickInterval);
                } else {
                    tickGeometry.setFromPoints([
                        new THREE.Vector3(-tickSize/2, i * tickInterval, 0),
                        new THREE.Vector3(tickSize/2, i * tickInterval, 0)
                    ]);
                    labelPosition.set(-tickSize, i * tickInterval, 0);
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

        // Add a light source
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1);
        scene.add(light);

        // Add ambient light to prevent completely dark areas
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        camera.position.set(3, 3, 3);
        camera.lookAt(0, 0, 0);

        function animate() {
            if (!scene) return;
            controls.update(); // Update controls in animation loop
            renderer.render( scene, camera );
        }

        return () => {
            renderer.dispose();
            controls.dispose();
            scene.clear();
        }
    }, [scene]);

    return (
        <>
            <div ref={ref} style={{ width: '100%', height: '100%' }}></div>
            <SceneProvider.Provider value={scene}>
                {children}
            </SceneProvider.Provider>
        </>
    )
}

export function useScene() {
    return useContextOrThrow(SceneProvider, 'Component must be used inside Mafs3D');
}
