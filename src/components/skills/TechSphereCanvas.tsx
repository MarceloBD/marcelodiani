"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TechSphere } from "./TechSphere";

interface TechSphereCanvasProps {
  hoveredSkill: string | null;
}

export function TechSphereCanvas({ hoveredSkill }: TechSphereCanvasProps) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}>
      <TechSphere hoveredSkill={hoveredSkill} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
      />
    </Canvas>
  );
}
