import { useLayoutEffect } from "react";
import { useBoundingBoxMesh, useScene } from "./Mafs3D.js";

/**
 * Renders a border box around the scene
 */
export function Border() {
    const scene = useScene();
    const boundingBoxMesh = useBoundingBoxMesh();

    useLayoutEffect(() => {
        scene.add(boundingBoxMesh);
        return () => {
            scene.remove(boundingBoxMesh);
        };
    }, [scene, boundingBoxMesh]);

    return null;
}
