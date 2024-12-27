import { useLayoutEffect } from "react";
import * as THREE from 'three';
import { useScene } from "./Mafs3D.js";

/**
 * A plot is a 3D surface that is created by plotting a function of two variables.
 */
export function Plot({ z: zFn }: { z: (x: number, y: number) => number }) {
    const scene = useScene();
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
