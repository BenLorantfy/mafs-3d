import { useLayoutEffect } from "react";
import { useScene } from "./Mafs3D.js";
import * as THREE from 'three';

export function Point({ x, y, z }: { x: number, y: number, z: number }) {
    const scene = useScene();

    useLayoutEffect(() => {
        const point = new THREE.Mesh(
            new THREE.SphereGeometry(0.1),
            new THREE.MeshPhongMaterial({ color: 0xffffff })
        );
        point.position.set(x, z, -y);
        scene.add(point);

        return () => {
            scene.remove(point);
        };
    }, [scene, x, y, z]);

    return null;
}