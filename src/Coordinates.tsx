import { useLayoutEffect } from "react";
import * as THREE from 'three';
import { useScene, useSceneSettings } from "./Mafs3D.js";

/**
 * Overlays 3 axis and a grid on the scene
 */
export function Coordinates() {
    const scene = useScene();
    const sceneSettings = useSceneSettings();

    useLayoutEffect(() => {
        const [minX, maxX] = sceneSettings.viewBox.x;
        const [minY, maxY] = sceneSettings.viewBox.y;
        const [minZ, maxZ] = sceneSettings.viewBox.z;

        // Create grid first so it renders under axes
        const gridSize = Math.max(maxX - minX, maxY - minY);
        const divisions = Math.floor(gridSize);
        const grid = new THREE.GridHelper(gridSize, divisions, 0x888888, 0x888888);
        
        // Position grid to start at min bounds
        grid.position.set(
            (maxX + minX) / 2, // Center X
            0,
            -(maxY + minY) / 2 // Center Y (negated because of coordinate system)
        );

        // Add clipping planes to grid
        const gridMaterial = grid.material as THREE.Material;
        gridMaterial.clippingPlanes = [
            new THREE.Plane(new THREE.Vector3(-1, 0, 0), maxX),
            new THREE.Plane(new THREE.Vector3(1, 0, 0), -minX),
            new THREE.Plane(new THREE.Vector3(0, 0, -1), maxY),
            new THREE.Plane(new THREE.Vector3(0, 0, 1), -minY)
        ];
        gridMaterial.clipIntersection = true;

        scene.add(grid);

        // Create axes clipped to viewBox with thicker lines
        const xAxis = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(minX, 0, 0),
                new THREE.Vector3(maxX, 0, 0)
            ]),
            new THREE.LineBasicMaterial({ color: 0xffb3b3, linewidth: 4 })
        );

        const yAxis = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, -minY),
                new THREE.Vector3(0, 0, -maxY)
            ]),
            new THREE.LineBasicMaterial({ color: 0xb3ffb3, linewidth: 4 })
        );

        const zAxis = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, minZ, 0),
                new THREE.Vector3(0, maxZ, 0)
            ]),
            new THREE.LineBasicMaterial({ color: 0xb3b3ff, linewidth: 4 })
        );

        // Add ticks and labels
        const tickSize = 0.2;
        const tickInterval = 1;

        // Helper function to create ticks and labels for an axis
        function createTicksAndLabels(axis: 'x' | 'y' | 'z', color: number) {
            const [min, max] = axis === 'x' ? [minX, maxX] : 
                              axis === 'y' ? [minY, maxY] : 
                              [minZ, maxZ];

            for (let i = Math.ceil(min); i <= Math.floor(max); i++) {
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
                        new THREE.Vector3(-tickSize/2, 0, -i * tickInterval),
                        new THREE.Vector3(tickSize/2, 0, -i * tickInterval)
                    ]);
                    labelPosition.set(-tickSize, 0, -i * tickInterval);
                } else {
                    tickGeometry.setFromPoints([
                        new THREE.Vector3(-tickSize/2, i * tickInterval, 0),
                        new THREE.Vector3(tickSize/2, i * tickInterval, 0)
                    ]);
                    labelPosition.set(-tickSize, i * tickInterval, 0);
                }

                const tick = new THREE.Line(
                    tickGeometry,
                    new THREE.LineBasicMaterial({ color, linewidth: 4 })
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

        return () => {
            scene.remove(xAxis);
            scene.remove(yAxis);
            scene.remove(zAxis);
            scene.remove(grid);
            // Note: Other objects will be cleaned up when scene is cleared
        };
    }, [scene, sceneSettings]);

    return null;
}