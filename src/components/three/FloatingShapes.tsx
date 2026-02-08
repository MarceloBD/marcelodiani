"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh, Group } from "three";

interface ShapeProps {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
  geometry: "icosahedron" | "octahedron" | "torus";
}

function Shape({ position, scale, speed, color, geometry }: ShapeProps) {
  const meshReference = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshReference.current) {
      meshReference.current.rotation.x += delta * speed * 0.3;
      meshReference.current.rotation.y += delta * speed * 0.2;
    }
  });

  const geometryElement = useMemo(() => {
    switch (geometry) {
      case "icosahedron":
        return <icosahedronGeometry args={[1, 1]} />;
      case "octahedron":
        return <octahedronGeometry args={[1, 0]} />;
      case "torus":
        return <torusGeometry args={[1, 0.4, 16, 32]} />;
    }
  }, [geometry]);

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshReference} position={position} scale={scale}>
        {geometryElement}
        <MeshDistortMaterial
          color={color}
          roughness={0.4}
          metalness={0.8}
          distort={0.2}
          speed={2}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

const SHAPES: ShapeProps[] = [
  {
    position: [-3, 2, -2],
    scale: 0.6,
    speed: 1.5,
    color: "#3b82f6",
    geometry: "icosahedron",
  },
  {
    position: [3.5, -1, -3],
    scale: 0.8,
    speed: 1.2,
    color: "#60a5fa",
    geometry: "octahedron",
  },
  {
    position: [-2, -2.5, -4],
    scale: 0.5,
    speed: 2,
    color: "#2563eb",
    geometry: "torus",
  },
  {
    position: [2, 2.5, -5],
    scale: 0.4,
    speed: 1.8,
    color: "#93c5fd",
    geometry: "icosahedron",
  },
  {
    position: [4, 0.5, -6],
    scale: 0.3,
    speed: 1,
    color: "#1d4ed8",
    geometry: "octahedron",
  },
  {
    position: [-4, 0, -4],
    scale: 0.35,
    speed: 1.6,
    color: "#3b82f6",
    geometry: "torus",
  },
];

export function FloatingShapes() {
  const groupReference = useRef<Group>(null);

  useFrame((state) => {
    if (groupReference.current) {
      groupReference.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupReference}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#3b82f6" />

      {SHAPES.map((shape, index) => (
        <Shape key={index} {...shape} />
      ))}
    </group>
  );
}
