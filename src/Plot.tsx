import { useLayoutEffect } from "react";
import * as THREE from 'three';
import { useScene, useSceneSettings } from "./Mafs3D.js";
import { createBoundingBoxMeshFromViewBox } from "./utils.js";

/**
 * A plot is a 3D surface that is created by plotting a function of two variables.
 */
export function Plot({ z: zFn }: { z: (x: number, y: number) => number }) {
    const scene = useScene();
    const sceneSettings = useSceneSettings();

    useLayoutEffect(() => {
        // Create arrays to store vertices, faces and colors
        const vertices = [];
        const indices = [];
        const colors = [];
        const resolution = 200; // Points per axis

        // Get all viewbox bounds
        const [minX, maxX] = sceneSettings.viewBox.x;
        const [minY, maxY] = sceneSettings.viewBox.z;
        const [minZ, maxZ] = sceneSettings.viewBox.y;

        // Calculate steps based on viewbox size
        const stepX = (maxX - minX) / resolution;
        const stepZ = (maxZ - minZ) / resolution;

        // Generate vertices grid
        for (let i = 0; i <= resolution; i++) {
            for (let j = 0; j <= resolution; j++) {
                const x = minX + (i * stepX);
                const z = -(minZ + (j * stepZ)); // Negate z to flip the y axis
                const y = Math.max(minY, Math.min(maxY, zFn(x, -z)));
                vertices.push(x, y, z);
            }
        }

        // Generate colors based on y values
        for (let i = 0; i < vertices.length; i += 3) {
            const y = vertices[i + 1]!;
            const t = (y - minY) / (maxY - minY); // Normalize to [0,1] using viewbox bounds
            
            if (y >= sceneSettings.viewBox.z[1]) {
                colors.push(0, 0, 0, 0); // Fully transparent instead of black
            } else {
                // Interpolate between blue (low) and orange (high)
                const r = t;
                const g = t * 0.5;
                const b = 1 - t;
                colors.push(r, g, b, 1);
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
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
        geometry.setIndex(indices);
        geometry.computeVertexNormals(); // Add normals for proper lighting

        // Create material with vertex colors
        const material = new THREE.MeshPhongMaterial({ 
            vertexColors: true,
            side: THREE.DoubleSide,
            flatShading: true,
            wireframe: false,
            clippingPlanes: [
                new THREE.Plane(new THREE.Vector3(0, -1, 0), sceneSettings.viewBox.z[1] - 0.2), // Top clip
                new THREE.Plane(new THREE.Vector3(0, 1, 0), -sceneSettings.viewBox.z[0] - 0.2)        // Bottom clip
            ]
        });

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        return () => {
            scene.remove(mesh);
            geometry.dispose();
            material.dispose();
        };
    }, [scene, zFn, sceneSettings]);
    return null;
}
