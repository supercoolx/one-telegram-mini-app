import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const SphereMesh = () => {
    const meshRef = useRef();

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.5
            meshRef.current.rotation.y += delta * 0.75
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1.6, 32, 32]} />
            <meshBasicMaterial color="grey" wireframe={true} />
        </mesh>
    )
}

const Sphere = () => (
    <Canvas style={{ width: '100vw', height: '100vh' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <SphereMesh />
    </Canvas>
);


export default Sphere;