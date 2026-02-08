"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points } from "three";
import * as THREE from "three";

const PARTICLE_COUNT = 500;
const SPREAD = 20;

export function ParticleField() {
  const pointsReference = useRef<Points>(null);

  const positions = useMemo(() => {
    const positionArray = new Float32Array(PARTICLE_COUNT * 3);
    for (let index = 0; index < PARTICLE_COUNT; index++) {
      positionArray[index * 3] = (Math.random() - 0.5) * SPREAD;
      positionArray[index * 3 + 1] = (Math.random() - 0.5) * SPREAD;
      positionArray[index * 3 + 2] = (Math.random() - 0.5) * SPREAD;
    }
    return positionArray;
  }, []);

  useFrame((state) => {
    if (pointsReference.current) {
      pointsReference.current.rotation.y =
        state.clock.elapsedTime * 0.02;
      pointsReference.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={pointsReference}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={new THREE.Color("#3b82f6")}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
