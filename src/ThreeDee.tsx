import { createContext, useContext, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const SceneProvider = createContext<THREE.Scene | null>(null);

export default function ThreeDee({ children }: { children?: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    if (!sceneRef.current) {
        sceneRef.current = new THREE.Scene();
    }

    useLayoutEffect(() => {
        const scene = sceneRef.current;
        const parent = ref.current;
        if (!scene || !parent || parent.childNodes.length > 0) {
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
    }, []);

    return (
        <>
            <div ref={ref} style={{ width: '100%', height: '100%' }}></div>
            <SceneProvider.Provider value={sceneRef.current}>
                {children}
            </SceneProvider.Provider>
        </>
    )
}

ThreeDee.Plot = function Plot({ z: zFn }: { z: (x: number, y: number) => number }) {
    const scene = useContextOrThrow(SceneProvider, 'ThreeDee.Plot');
    useLayoutEffect(() => {
        // Create arrays to store vertices and faces
        const vertices = [];
        const indices = [];
        const resolution = 200; // Points per axis
        const size = 10; // Total size of grid
        const step = size / resolution;

        // Generate vertices grid
        for (let i = 0; i <= resolution; i++) {
            for (let j = 0; j <= resolution; j++) {
                const x = (i * step) - (size / 2);
                const z = (j * step) - (size / 2);
                const y = zFn(x, z); // Z function maps to y value
                vertices.push(x, y, z);
            }
        }

        // Generate indices for triangles
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const a = i * (resolution + 1) + j;
                const b = a + 1;
                const c = a + (resolution + 1);
                const d = c + 1;

                // Create two triangles for each grid square
                indices.push(a, b, c); // First triangle
                indices.push(b, d, c); // Second triangle
            }
        }

        // Create geometry from vertices and indices
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals(); // Add normals for proper lighting

        // Create material with basic shading
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            side: THREE.DoubleSide,
            flatShading: true,
            wireframe: false
        });

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        return () => {
            scene.remove(mesh);
            geometry.dispose();
            material.dispose();
        };
    }, [scene, zFn]);
    return null;
}

function useContextOrThrow<T>(context: React.Context<T | null>, name: string): T {
    const value = useContext(context);
    if (!value) {
        throw new Error(`${name} must be used within a ${context.displayName} provider`);
    }
    return value;
}