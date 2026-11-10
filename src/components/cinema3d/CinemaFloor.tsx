import * as THREE from "three";
import { createLuxuryCarpetTexture } from "./textures";

export interface FloorTiersConfig {
  rowCount: number;
  rowDepth: number;
  rowRise: number;
  tierWidth: number;
  centerAisleWidth: number;
}

/**
 * Builds the tiered stadium risers, patterned carpet floor, central staircase,
 * side staircases, and golden LED step lights matching the reference photo.
 */
export function buildCinemaFloor(scene: THREE.Scene, config: FloorTiersConfig) {
  const carpetTexture = createLuxuryCarpetTexture();
  carpetTexture.repeat.set(14, 14);

  const carpetMaterial = new THREE.MeshStandardMaterial({
    map: carpetTexture,
    roughness: 0.8,
    metalness: 0.1,
  });

  const stepLightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffe4b5, // Warm golden white
  });

  const stepNumberMat = new THREE.MeshBasicMaterial({
    color: 0xfff0c4,
  });

  const riserMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f1610, // Dark bronze/espresso riser face
    roughness: 0.85,
    metalness: 0.2,
  });

  const group = new THREE.Group();

  // 1. Front Stage Flat Floor Area (between screen and row 1)
  const frontFloorGeo = new THREE.BoxGeometry(config.tierWidth + 4, 0.4, 14);
  const frontFloorMesh = new THREE.Mesh(frontFloorGeo, carpetMaterial);
  frontFloorMesh.position.set(0, 0, -2);
  frontFloorMesh.receiveShadow = true;
  group.add(frontFloorMesh);

  // 2. Ascending Stadium Tiers & Central/Side Staircases
  for (let r = 0; r < config.rowCount; r++) {
    const tierZ = 5 + r * config.rowDepth;
    const tierY = 0.2 + (r + 1) * config.rowRise;

    // Platform widths
    const leftWidth = (config.tierWidth - config.centerAisleWidth) / 2 - 1.2;
    const leftX = -(config.centerAisleWidth / 2 + leftWidth / 2);

    // Left Seating Tier Platform
    const leftGeo = new THREE.BoxGeometry(leftWidth, 0.4 + (r + 1) * config.rowRise, config.rowDepth);
    const leftMesh = new THREE.Mesh(leftGeo, carpetMaterial);
    leftMesh.position.set(leftX, tierY / 2, tierZ);
    leftMesh.receiveShadow = true;
    group.add(leftMesh);

    // Left Platform Riser Face (vertical dark bronze front)
    const riserGeo = new THREE.BoxGeometry(leftWidth, config.rowRise, 0.05);
    const leftRiser = new THREE.Mesh(riserGeo, riserMaterial);
    leftRiser.position.set(leftX, tierY - config.rowRise / 2, tierZ - config.rowDepth / 2);
    group.add(leftRiser);

    // Right Seating Tier Platform
    const rightX = config.centerAisleWidth / 2 + leftWidth / 2;
    const rightMesh = new THREE.Mesh(leftGeo, carpetMaterial);
    rightMesh.position.set(rightX, tierY / 2, tierZ);
    rightMesh.receiveShadow = true;
    group.add(rightMesh);

    // Right Platform Riser Face
    const rightRiser = new THREE.Mesh(riserGeo, riserMaterial);
    rightRiser.position.set(rightX, tierY - config.rowRise / 2, tierZ - config.rowDepth / 2);
    group.add(rightRiser);

    // 3. Central Staircase Steps (2 sub-steps per tier row)
    const subSteps = 2;
    for (let s = 0; s < subSteps; s++) {
      const stepY = 0.2 + (r + (s + 1) / subSteps) * config.rowRise;
      const stepZ = 5 + r * config.rowDepth + (s * config.rowDepth) / subSteps;
      const stepDepth = config.rowDepth / subSteps;

      const stepGeo = new THREE.BoxGeometry(config.centerAisleWidth, 0.2, stepDepth);
      const stepMesh = new THREE.Mesh(stepGeo, carpetMaterial);
      stepMesh.position.set(0, stepY, stepZ);
      stepMesh.receiveShadow = true;
      group.add(stepMesh);

      // Golden LED Step Light Strip along the step tread nose
      const ledGeo = new THREE.BoxGeometry(config.centerAisleWidth - 0.1, 0.03, 0.05);
      const ledMesh = new THREE.Mesh(ledGeo, stepLightMaterial);
      ledMesh.position.set(0, stepY + 0.11, stepZ - stepDepth / 2 + 0.03);
      group.add(ledMesh);

      // Small illuminated row/step number indicator on the riser edge
      if (s === 0) {
        const rowIndGeo = new THREE.BoxGeometry(0.12, 0.08, 0.02);
        const rowIndL = new THREE.Mesh(rowIndGeo, stepNumberMat);
        rowIndL.position.set(-config.centerAisleWidth / 2 + 0.1, stepY + 0.05, stepZ - stepDepth / 2 + 0.02);
        group.add(rowIndL);

        const rowIndR = new THREE.Mesh(rowIndGeo, stepNumberMat);
        rowIndR.position.set(config.centerAisleWidth / 2 - 0.1, stepY + 0.05, stepZ - stepDepth / 2 + 0.02);
        group.add(rowIndR);
      }
    }

    // 4. Side Walking Aisles / Stairs along Left & Right Walls
    const sideAisleWidth = 1.1;
    const sideGeo = new THREE.BoxGeometry(sideAisleWidth, 0.2 + (r + 1) * config.rowRise, config.rowDepth);

    const leftSideMesh = new THREE.Mesh(sideGeo, carpetMaterial);
    leftSideMesh.position.set(-config.tierWidth / 2 + sideAisleWidth / 2, tierY / 2, tierZ);
    group.add(leftSideMesh);

    const rightSideMesh = new THREE.Mesh(sideGeo, carpetMaterial);
    rightSideMesh.position.set(config.tierWidth / 2 - sideAisleWidth / 2, tierY / 2, tierZ);
    group.add(rightSideMesh);

    // Golden LED strip on outer aisle edge
    const sideLedGeo = new THREE.BoxGeometry(sideAisleWidth - 0.1, 0.03, 0.05);
    const sideLedL = new THREE.Mesh(sideLedGeo, stepLightMaterial);
    sideLedL.position.set(-config.tierWidth / 2 + sideAisleWidth / 2, tierY + 0.11, tierZ - config.rowDepth / 2 + 0.04);
    group.add(sideLedL);

    const sideLedR = new THREE.Mesh(sideLedGeo, stepLightMaterial);
    sideLedR.position.set(config.tierWidth / 2 - sideAisleWidth / 2, tierY + 0.11, tierZ - config.rowDepth / 2 + 0.04);
    group.add(sideLedR);
  }

  // 5. Front Balustrade / Black Marble Barrier (as seen in the foreground of reference photo)
  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x14100c, // Deep polished dark marble
    roughness: 0.18,
    metalness: 0.75,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.3,
    metalness: 0.85,
  });

  // Left Balustrade box with gold handrail cap
  const leftBarrier = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.25, 1.2), barrierMat);
  leftBarrier.position.set(-7.5, 0.85, -3.5);
  leftBarrier.castShadow = true;
  group.add(leftBarrier);

  const leftCap = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.08, 1.25), goldAccentMat);
  leftCap.position.set(-7.5, 1.5, -3.5);
  group.add(leftCap);

  // Right Balustrade box with gold handrail cap
  const rightBarrier = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.25, 1.2), barrierMat);
  rightBarrier.position.set(7.5, 0.85, -3.5);
  rightBarrier.castShadow = true;
  group.add(rightBarrier);

  const rightCap = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.08, 1.25), goldAccentMat);
  rightCap.position.set(7.5, 1.5, -3.5);
  group.add(rightCap);

  scene.add(group);
  return group;
}
