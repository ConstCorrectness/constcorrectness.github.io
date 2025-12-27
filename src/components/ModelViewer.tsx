import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';

import * as THREE from 'three';


function SpinningBox() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#61dafb" wireframe />
    </mesh>
  );
}


function GltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

interface ViewerProps {
  modelUrl?: string;
}

export const ModelViewer: React.FC<ViewerProps> = ({ modelUrl }) => {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
      {/* Stage sets up generic "nice" lighting and centering automatically */}
      <Stage environment="city" intensity={0.6}>
        {modelUrl ? <GltfModel url={modelUrl} /> : <SpinningBox />}
      </Stage>
      <OrbitControls autoRotate />
    </Canvas>
  );
};

