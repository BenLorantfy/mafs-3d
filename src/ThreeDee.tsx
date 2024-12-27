import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeDee() {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const parent = ref.current;
        if (!parent || parent.childNodes.length > 0) {
            return;
        }

        const width = parent.clientWidth;
        const height = parent.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
        
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( width, height );
        renderer.setAnimationLoop( animate );
        parent.appendChild( renderer.domElement );

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        scene.add( cube );

        camera.position.z = 5;

        function animate() {

            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
        
            renderer.render( scene, camera );
        
        }
    }, []);

    return <div ref={ref} style={{ width: '100%', height: '100%' }}></div>
}