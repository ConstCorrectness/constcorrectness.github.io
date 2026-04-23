import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, Html } from '@react-three/drei';
import { useTheme } from '@mui/material';
import * as THREE from 'three';


function SpinningBox() {
  const meshRef = useRef<THREE.Mesh>(null);
  const theme = useTheme();
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={theme.palette.primary.main} wireframe />
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
  const theme = useTheme();
  
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
      <Suspense fallback={<Html center>Loading...</Html>}>
        <Stage 
          environment={theme.palette.mode === 'dark' ? "city" : "apartment"} 
          intensity={theme.palette.mode === 'dark' ? 1.0 : 0.5}
        >
          {modelUrl ? <GltfModel url={modelUrl} /> : <SpinningBox />}
        </Stage>
      </Suspense>
      <OrbitControls autoRotateSpeed={0.5} autoRotate />
    </Canvas>
  );
};
