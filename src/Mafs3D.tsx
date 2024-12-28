import { createContext, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useContextOrThrow } from './utils.js';

const SceneProvider = createContext<THREE.Scene | null>(null);
const SceneSettingsProvider = createContext<{ viewBox: { x: [number, number], y: [number, number], z: [number, number] } } | null>(null);
const BoundingBoxMeshProvider = createContext<THREE.Object3D | null>(null);
export interface Mafs3DProps {
    children?: React.ReactNode;

    /**
     * Specifies an area of the graph to focus on.  Specifically:
     * 1. Changes the camera to zoom to fit the viewBox into view (and then rotates the camera slightly)
     * 2. Clips all plots and other elements to inside the viewBox
     * 3. The depth color gradient starts from the top of the viewBox and finishes at the bottom of the viewBox
     * 4. Adds a light source positioned just outside the viewBox
     * 
     * For better performance, use a small viewBox
     */
    viewBox?: { x: [number, number], y: [number, number], z: [number, number] };
}
/**
 * A 3D scene that can contain 3D plots, points, etc.
 */
export function Mafs3D({ children, viewBox = { x: [-10, 10], y: [-10, 10], z: [-10, 10] } }: Mafs3DProps) {
    const ref = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    if (!sceneRef.current) {
        sceneRef.current = new THREE.Scene();
    }
    const scene = sceneRef.current;
    const boundingBoxMesh = useMemo(() => createBoundingBoxMeshFromViewBox(viewBox), [viewBox]);

    useLayoutEffect(() => {
        const parent = ref.current;
        if (!parent || parent.childNodes.length > 0) {
            return;
        }

        const width = parent.clientWidth;
        const height = parent.clientHeight;

        const camera = new THREE.PerspectiveCamera( 50, width / height, 0.1, 1000 );
        
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( width, height );
        renderer.setAnimationLoop( animate );
        renderer.localClippingEnabled = true;  // Enable clipping
        parent.appendChild( renderer.domElement );

        // Add orbit controls with panning enabled
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Add smooth damping effect
        controls.enablePan = true; // Enable panning
        controls.screenSpacePanning = true; // Make panning work in screen space
        controls.panSpeed = 1.0; // Adjust pan speed as needed

        // Add a light source positioned just outside the viewBox
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(
            viewBox.x[1] + 2, // Just outside max X
            viewBox.z[1] + 2, // Just outside max Z 
            -viewBox.y[1] - 2 // Just outside max Y (negated due to coordinate system)
        );
        scene.add(light);

        // Add ambient light to prevent completely dark areas
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        // scene.add(boundingBoxMesh);

        fitCameraToObject(camera, boundingBoxMesh, 1.25, controls);
        rotateCameraAroundBoundingBox(camera, boundingBoxMesh, 20);
        
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
    }, [scene, boundingBoxMesh]);

    const sceneSettings = useMemo(() => ({ viewBox }), [viewBox]);

    return (
        <>
            <div ref={ref} style={{ width: '100%', height: '100%' }}></div>
                <SceneProvider.Provider value={scene}>
                    <SceneSettingsProvider.Provider value={sceneSettings}>
                        <BoundingBoxMeshProvider.Provider value={boundingBoxMesh}>
                            {children}
                        </BoundingBoxMeshProvider.Provider>
                    </SceneSettingsProvider.Provider>
            </SceneProvider.Provider>
        </>
    )
}

export function useScene() {
    return useContextOrThrow(SceneProvider, 'Component must be used inside Mafs3D');
}

export function useSceneSettings() {
    return useContextOrThrow(SceneSettingsProvider, 'Component must be used inside Mafs3D');
}

export function useBoundingBoxMesh() {
    return useContextOrThrow(BoundingBoxMeshProvider, 'Component must be used inside Mafs3D');
}

function fitCameraToObject(camera: THREE.PerspectiveCamera, object: THREE.Object3D, offset: number, orbitControls: OrbitControls) {
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject( object );

    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    // TODO: update this comment.  We made some changes to the camera fitting logic.

    // figure out how to fit the box in the view:
    // 1. figure out horizontal FOV (on non-1.0 aspects)
    // 2. figure out distance from the object in X and Y planes
    // 3. select the max distance (to fit both sides in)
    //
    // The reason is as follows:
    //
    // Imagine a bounding box (BB) is centered at (0,0,0).
    // Camera has vertical FOV (camera.fov) and horizontal FOV
    // (camera.fov scaled by aspect, see fovh below)
    //
    // Therefore if you want to put the entire object into the field of view,
    // you have to compute the distance as: z/2 (half of Z size of the BB
    // protruding towards us) plus for both X and Y size of BB you have to
    // figure out the distance created by the appropriate FOV.
    //
    // The FOV is always a triangle:
    //
    //  (size/2)
    // +--------+
    // |       /
    // |      /
    // |     /
    // | F° /
    // |   /
    // |  /
    // | /
    // |/
    //
    // F° is half of respective FOV, so to compute the distance (the length
    // of the straight line) one has to: `size/2 / Math.tan(F)`.
    //
    // FTR, from https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
    // the camera.fov is the vertical FOV.

    const fovRad = camera.fov * ( Math.PI / 180 );
    const fovh = 2*Math.atan(Math.tan(fovRad/2) * camera.aspect);

    let dx = boundingBox.max.z + Math.abs(size.x / 2 / Math.tan(fovh / 2));
    let dy = boundingBox.max.z + Math.abs(size.y / 2 / Math.tan(fovRad / 2));

    let cameraZ = Math.max(dx, dy);

    // offset the camera, if desired (to avoid filling the whole canvas)
    if( offset !== undefined && offset !== 0 ) cameraZ *= offset;

    camera.position.set( center.x, center.y, cameraZ );

    // set the far plane of the camera so that it easily encompasses the whole object
    const minZ = boundingBox.min.z;
    const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;

    camera.far = cameraToFarEdge * 3;
    camera.updateProjectionMatrix();

    if (orbitControls) {
        // set camera to rotate around the center
        orbitControls.target = center;

        // prevent camera from zooming out far enough to create far plane cutoff
        orbitControls.maxDistance = cameraToFarEdge * 2;
    }
};

function rotateCameraAroundBoundingBox(camera: THREE.Camera, boundingBoxMesh: THREE.Object3D, angleDegrees: number) {
    const angle = THREE.MathUtils.degToRad(angleDegrees);
    const distance = camera.position.distanceTo(boundingBoxMesh.position);
    
    // Calculate horizontal rotation
    const horizontalDistance = distance * Math.cos(angle);
    camera.position.x = boundingBoxMesh.position.x + distance * Math.sin(angle);
    camera.position.z = boundingBoxMesh.position.z + horizontalDistance * Math.cos(angle);
    
    // Calculate vertical position using same angle
    camera.position.y = boundingBoxMesh.position.y + horizontalDistance * Math.sin(angle);
    
    camera.lookAt(boundingBoxMesh.position);
}

function createBoundingBoxMeshFromViewBox(viewBox: { x: [number, number], y: [number, number], z: [number, number] }) {
    const width = Math.abs(viewBox.x[1] - viewBox.x[0]);
    const height = Math.abs(viewBox.z[1] - viewBox.z[0]); 
    const depth = Math.abs(viewBox.y[1] - viewBox.y[0]);

    // Create edges geometry with proper vertex pairs
    const edges = [];
    
    // Bottom face edges (connected in sequence)
    edges.push(new THREE.Vector3(-width/2, -height/2, -depth/2));
    edges.push(new THREE.Vector3(width/2, -height/2, -depth/2));
    
    edges.push(new THREE.Vector3(width/2, -height/2, -depth/2));
    edges.push(new THREE.Vector3(width/2, -height/2, depth/2));
    
    edges.push(new THREE.Vector3(width/2, -height/2, depth/2));
    edges.push(new THREE.Vector3(-width/2, -height/2, depth/2));
    
    edges.push(new THREE.Vector3(-width/2, -height/2, depth/2));
    edges.push(new THREE.Vector3(-width/2, -height/2, -depth/2));

    // Top face edges (connected in sequence)
    edges.push(new THREE.Vector3(-width/2, height/2, -depth/2));
    edges.push(new THREE.Vector3(width/2, height/2, -depth/2));
    
    edges.push(new THREE.Vector3(width/2, height/2, -depth/2));
    edges.push(new THREE.Vector3(width/2, height/2, depth/2));
    
    edges.push(new THREE.Vector3(width/2, height/2, depth/2));
    edges.push(new THREE.Vector3(-width/2, height/2, depth/2));
    
    edges.push(new THREE.Vector3(-width/2, height/2, depth/2));
    edges.push(new THREE.Vector3(-width/2, height/2, -depth/2));

    // Vertical edges connecting top and bottom faces
    edges.push(new THREE.Vector3(-width/2, -height/2, -depth/2));
    edges.push(new THREE.Vector3(-width/2, height/2, -depth/2));
    
    edges.push(new THREE.Vector3(width/2, -height/2, -depth/2));
    edges.push(new THREE.Vector3(width/2, height/2, -depth/2));
    
    edges.push(new THREE.Vector3(width/2, -height/2, depth/2));
    edges.push(new THREE.Vector3(width/2, height/2, depth/2));
    
    edges.push(new THREE.Vector3(-width/2, -height/2, depth/2));
    edges.push(new THREE.Vector3(-width/2, height/2, depth/2));

    const geometry = new THREE.BufferGeometry().setFromPoints(edges);
    const material = new THREE.LineBasicMaterial({
        color: 0x808080,
        transparent: true,
        opacity: 0.5
    });

    const boundingBoxMesh = new THREE.LineSegments(geometry, material);
    boundingBoxMesh.position.set(
        (viewBox.x[0] + viewBox.x[1]) / 2,  // center x
        (viewBox.z[0] + viewBox.z[1]) / 2,   // center z (up)
        -(viewBox.y[0] + viewBox.y[1]) / 2,  // center y
    );
    return boundingBoxMesh;
}
