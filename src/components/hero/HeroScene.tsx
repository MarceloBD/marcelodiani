"use client";

import { Canvas } from "@react-three/fiber";
import { FloatingShapes } from "../three/FloatingShapes";
import { ParticleField } from "../three/ParticleField";

export function HeroScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <FloatingShapes />
        <ParticleField />
      </Canvas>
    </div>
  );
}
