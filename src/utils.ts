import * as THREE from 'three';
import { useContext } from 'react';

export function useContextOrThrow<T>(context: React.Context<T | null>, errorMessage: string): T {
    const value = useContext(context);
    if (!value) {
        throw new Error(errorMessage);
    }
    return value;
}

export function createBoundingBoxMeshFromViewBox(viewBox: { x: [number, number], y: [number, number], z: [number, number] }) {
    const boundingBoxMesh = new THREE.Mesh(
        new THREE.BoxGeometry(
            Math.abs(viewBox.x[1] - viewBox.x[0]),
            Math.abs(viewBox.z[1] - viewBox.z[0]),
            Math.abs(viewBox.y[1] - viewBox.y[0]),
        ),
        new THREE.MeshBasicMaterial({
            color: 0x808080,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        })
    );
    boundingBoxMesh.position.set(
        (viewBox.x[0] + viewBox.x[1]) / 2,
        (viewBox.z[0] + viewBox.z[1]) / 2,
        -(viewBox.y[0] + viewBox.y[1]) / 2,
    );
    return boundingBoxMesh;
}
