"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Center } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

type Props = {
  geometry: THREE.BufferGeometry | null;
  scale: number;
  color: string;
};

function Model({ geometry, scale, color }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);

  const finalGeometry = useMemo(() => {
    if (!geometry) return null;
    const g = geometry.clone();
    g.computeVertexNormals();
    g.center();
    return g;
  }, [geometry]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.0015;
    }
  });

  if (!finalGeometry) return null;

  return (
    <Center>
      <mesh ref={meshRef} geometry={finalGeometry} scale={scale} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          metalness={0.05}
          roughness={0.55}
          flatShading={false}
        />
      </mesh>
    </Center>
  );
}

function CameraFit({ geometry }: { geometry: THREE.BufferGeometry | null }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!geometry) return;
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return;
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * 2.2;
    camera.position.set(dist, dist, dist);
    camera.lookAt(0, 0, 0);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.updateProjectionMatrix();
    }
  }, [geometry, camera]);

  return null;
}

export function StlViewer({ geometry, scale, color }: Props) {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-border bg-gradient-to-b from-muted/40 to-background">
      <Canvas shadows camera={{ position: [60, 60, 60], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[50, 80, 30]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-40, -20, -30]} intensity={0.35} />

        <Suspense fallback={null}>
          <Model geometry={geometry} scale={scale} color={color} />
        </Suspense>

        <Grid
          args={[200, 200]}
          cellSize={10}
          cellColor="#666"
          sectionSize={50}
          sectionColor="#999"
          fadeDistance={250}
          infiniteGrid
          position={[0, -0.01, 0]}
        />

        <CameraFit geometry={geometry} />
        <OrbitControls enableDamping makeDefault />
      </Canvas>

      {!geometry && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Upload an STL to preview it here
        </div>
      )}
    </div>
  );
}

export async function parseStl(file: File): Promise<{
  geometry: THREE.BufferGeometry;
  volumeCm3: number;
  bboxCm: { x: number; y: number; z: number };
}> {
  const buffer = await file.arrayBuffer();
  const loader = new STLLoader();
  const geometry = loader.parse(buffer);

  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);

  const volumeMm3 = computeGeometryVolume(geometry);
  const volumeCm3 = volumeMm3 / 1000;

  return {
    geometry,
    volumeCm3,
    bboxCm: { x: size.x / 10, y: size.y / 10, z: size.z / 10 },
  };
}

function computeGeometryVolume(geometry: THREE.BufferGeometry): number {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const index = geometry.index;
  let volume = 0;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();

  const triangleCount = index ? index.count / 3 : position.count / 3;

  for (let i = 0; i < triangleCount; i++) {
    if (index) {
      a.fromBufferAttribute(position, index.getX(i * 3));
      b.fromBufferAttribute(position, index.getX(i * 3 + 1));
      c.fromBufferAttribute(position, index.getX(i * 3 + 2));
    } else {
      a.fromBufferAttribute(position, i * 3);
      b.fromBufferAttribute(position, i * 3 + 1);
      c.fromBufferAttribute(position, i * 3 + 2);
    }
    volume += a.dot(b.clone().cross(c)) / 6;
  }
  return Math.abs(volume);
}
