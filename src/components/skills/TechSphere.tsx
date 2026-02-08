"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { SKILLS, SKILL_CATEGORY_COLORS } from "@/data/skills";

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const AUTO_ROTATE_SPEED = 0.1;
const FOCUS_LERP_SPEED = 4;

function TechLabel({
  text,
  position,
  color,
  isHighlighted,
}: {
  text: string;
  position: [number, number, number];
  color: string;
  isHighlighted: boolean;
}) {
  return (
    <Billboard position={position} follow lockX={false} lockY={false} lockZ={false}>
      <Text
        fontSize={isHighlighted ? 0.26 : 0.18}
        color={isHighlighted ? "#ffffff" : color}
        anchorX="center"
        anchorY="middle"
        fillOpacity={isHighlighted ? 1 : 0.9}
      >
        {text}
      </Text>
    </Billboard>
  );
}

interface TechSphereProps {
  hoveredSkill: string | null;
}

export function TechSphere({ hoveredSkill }: TechSphereProps) {
  const groupReference = useRef<THREE.Group>(null);
  const targetQuaternion = useRef(new THREE.Quaternion());
  const rotationQuaternion = useRef(new THREE.Quaternion());
  const previousHoveredSkill = useRef<string | null>(null);
  const isFocusing = useRef(false);

  const techPositions = useMemo(() => {
    const radius = 3;
    const items = SKILLS;

    return items.map((skill, index) => {
      const phi = Math.acos(-1 + (2 * index) / items.length);
      const theta = Math.sqrt(items.length * Math.PI) * phi;

      return {
        name: skill.name,
        color: SKILL_CATEGORY_COLORS[skill.category],
        position: [
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi),
        ] as [number, number, number],
      };
    });
  }, []);

  useFrame(({ camera }, delta) => {
    if (!groupReference.current) return;

    // Detect hoveredSkill change and compute target rotation
    if (previousHoveredSkill.current !== hoveredSkill) {
      previousHoveredSkill.current = hoveredSkill;

      if (hoveredSkill) {
        const target = techPositions.find((tech) => tech.name === hoveredSkill);
        if (target) {
          const localDirection = new THREE.Vector3(...target.position).normalize();
          const cameraDirection = new THREE.Vector3().copy(camera.position).normalize();
          targetQuaternion.current.setFromUnitVectors(localDirection, cameraDirection);
          isFocusing.current = true;
        }
      } else {
        isFocusing.current = false;
      }
    }

    if (isFocusing.current) {
      // Smooth rotation towards the focused technology
      const lerpFactor = 1 - Math.exp(-FOCUS_LERP_SPEED * delta);
      groupReference.current.quaternion.slerp(targetQuaternion.current, lerpFactor);
    } else {
      // Gentle auto-rotation around Y axis
      rotationQuaternion.current.setFromAxisAngle(Y_AXIS, AUTO_ROTATE_SPEED * delta);
      groupReference.current.quaternion.premultiply(rotationQuaternion.current);
    }

    // Fade dots based on depth relative to camera
    groupReference.current.children.forEach((child) => {
      if (!("material" in child)) return;

      const mesh = child as THREE.Mesh;
      const worldPosition = new THREE.Vector3();
      mesh.getWorldPosition(worldPosition);
      const distanceToCamera = camera.position.distanceTo(worldPosition);
      const maxDistance = 12;
      const minDistance = 5;
      const depthOpacity =
        1 - Math.max(0, Math.min(1, (distanceToCamera - minDistance) / (maxDistance - minDistance)));

      if (mesh.material && "opacity" in mesh.material) {
        const isHighlightedDot = hoveredSkill && mesh.userData?.techName === hoveredSkill;
        (mesh.material as THREE.MeshBasicMaterial).opacity = isHighlightedDot
          ? 1
          : depthOpacity * 0.4;
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />

      <group ref={groupReference}>
        {/* Wireframe sphere */}
        <mesh>
          <sphereGeometry args={[2.8, 32, 32]} />
          <meshBasicMaterial
            color="#3b82f6"
            wireframe
            transparent
            opacity={0.05}
          />
        </mesh>

        {/* Tech labels -- Billboard keeps them facing the camera */}
        {techPositions.map(({ name, color, position }) => (
          <TechLabel
            key={name}
            text={name}
            position={position}
            color={color}
            isHighlighted={hoveredSkill === name}
          />
        ))}

        {/* Dots at each tech position */}
        {techPositions.map(({ name, color, position }) => (
          <mesh
            key={`dot-${name}`}
            position={position}
            scale={hoveredSkill === name ? 3 : 1}
            userData={{ techName: name }}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial
              color={hoveredSkill === name ? color : "#3b82f6"}
              transparent
              opacity={0.4}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
