'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clamp01, ease, pathX } from '@/lib/terrainMath';

/**
 * @param {{
 *   heroRef: React.RefObject<HTMLElement>,
 *   pointerRef: React.MutableRefObject<{nx:number,ny:number,active:boolean}>,
 *   cursorRef: React.MutableRefObject<THREE.Vector2>,
 *   fovDegrees: number,
 *   reducedMotion: boolean
 * }} props
 */
export default function CameraRig({ heroRef, pointerRef, cursorRef, fovDegrees, reducedMotion }) {
  const { camera } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -2), []);
  const introStart = useRef();
  const cursorTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    if (introStart.current === undefined) introStart.current = performance.now();
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const rect = heroEl.getBoundingClientRect();
    const scrollP = reducedMotion ? 0 : clamp01(-rect.top / Math.max(1, rect.height * 0.9));
    const eased = ease(scrollP);
    const introElapsed = performance.now() - introStart.current;
    const intro = reducedMotion ? 1 : 1 - Math.pow(1 - Math.min(1, introElapsed / 3400), 3);

    const camZ = 72 + (1 - intro) * 24 - 58 * eased;
    const camY = 7.4 - 2.6 * eased;
    camera.position.set(pathX(camZ), camY, camZ);
    const tz = camZ - 38;
    camera.lookAt(pathX(tz), 4.6 - eased * 0.6, tz);

    const { nx, ny, active } = pointerRef.current;
    const px = active ? nx : 0;
    const py = active ? ny : 0;
    camera.rotateY(-px * 0.16);
    camera.rotateX(py * 0.07);

    if (camera.isPerspectiveCamera) {
      camera.fov += (fovDegrees - camera.fov) * 0.1;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();

    // Where the cursor points on the ground, for the terrain shader's light.
    let groundX;
    let groundZ;
    if (active) {
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hit = raycaster.ray.intersectPlane(groundPlane, cursorTarget.current);
      if (hit) {
        groundX = hit.x;
        groundZ = hit.z;
      } else {
        groundX = cursorRef.current.x;
        groundZ = cursorRef.current.y;
      }
    } else {
      const t = performance.now() / 1000;
      groundX = pathX(camZ - 46) + Math.sin(t * 0.35) * 11;
      groundZ = camZ - 46 + Math.cos(t * 0.27) * 14;
    }
    cursorRef.current.x += (groundX - cursorRef.current.x) * 0.12;
    cursorRef.current.y += (groundZ - cursorRef.current.y) * 0.12;
  });

  return null;
}
