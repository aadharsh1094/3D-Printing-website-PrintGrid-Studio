"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  Center,
  ContactShadows,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
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
      meshRef.current.rotation.z += 0.0012;
    }
  });

  if (!finalGeometry) return null;

  return (
    <Center top>
      <mesh
        ref={meshRef}
        geometry={finalGeometry}
        scale={scale}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={color}
          metalness={0.15}
          roughness={0.45}
          clearcoat={0.25}
          clearcoatRoughness={0.45}
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
    const dist = maxDim * 2.5;
    camera.position.set(dist, dist * 0.85, dist);
    camera.lookAt(0, 0, 0);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.updateProjectionMatrix();
    }
  }, [geometry, camera]);

  return null;
}

export function StlViewer({ geometry, scale, color }: Props) {
  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted/60 via-background to-background">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[60, 50, 60]} fov={42} />

        <ambientLight intensity={0.35} />
        <directionalLight
          position={[40, 80, 30]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-40, 20, -40]} intensity={0.45} />
        <directionalLight position={[0, -40, 0]} intensity={0.15} />

        <Suspense fallback={null}>
          <Environment preset="city" />
          <Model geometry={geometry} scale={scale} color={color} />
        </Suspense>

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.45}
          scale={120}
          blur={2.5}
          far={20}
          resolution={512}
          frames={1}
        />

        <Grid
          args={[400, 400]}
          cellSize={10}
          cellThickness={0.6}
          cellColor="#9ca3af"
          sectionSize={50}
          sectionThickness={1}
          sectionColor="#6b7280"
          fadeDistance={300}
          fadeStrength={1.2}
          infiniteGrid
          position={[0, -0.02, 0]}
        />

        <CameraFit geometry={geometry} />
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={20}
          maxDistance={500}
          makeDefault
        />
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
