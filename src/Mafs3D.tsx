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
