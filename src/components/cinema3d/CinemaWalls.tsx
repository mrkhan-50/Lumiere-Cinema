import * as THREE from "three";
import { createAcousticWallTexture } from "./textures";

export interface WallsConfig {
  roomWidth: number;
  roomLength: number;
  roomHeight: number;
}

/**
 * Builds the warm golden-amber acoustic walls, vertical LED strips,
 * concentric circular golden wall sconces, oval decorative panels,
 * ceiling with linear lights and saucer pendants, and rear projection wall matching the reference photo.
 */
export function buildCinemaWalls(scene: THREE.Scene, config: WallsConfig) {
  const group = new THREE.Group();

  const wallTexture = createAcousticWallTexture();
  wallTexture.repeat.set(4, 2);

  // 1. Materials
  // Warm Amber / Golden Brown Acoustic Wall Panels (#A86518)
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xa86518,
    map: wallTexture,
    roughness: 0.55,
    metalness: 0.15,
  });

  // Darker Amber for recessed wall bays (#7E4610)
  const wallBayMaterial = new THREE.MeshStandardMaterial({
    color: 0x7e4610,
    roughness: 0.7,
    metalness: 0.1,
  });

  // Dark Bronze Acoustic Ceiling (#21170F)
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x21170f,
    roughness: 0.85,
    metalness: 0.25,
  });

  // Warm White LED Emissive Material (#FFE4B5)
  const ledMaterial = new THREE.MeshBasicMaterial({
    color: 0xffe4b5,
  });

  // Metallic Champagne Gold for Sconces & Accents (#D4AF37)
  const metallicGoldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.28,
    metalness: 0.88,
  });

  // Matte Black for Surround Speakers (#181818)
  const speakerMaterial = new THREE.MeshStandardMaterial({
    color: 0x181818,
    roughness: 0.8,
    metalness: 0.2,
  });

  const halfW = config.roomWidth / 2;
  const halfL = config.roomLength / 2;
  const halfH = config.roomHeight / 2;
  const centerZ = halfL - 6;

  // 2. Base Left Wall
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, config.roomHeight, config.roomLength), wallBayMaterial);
  leftWall.position.set(-halfW, halfH, centerZ);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // 3. Base Right Wall
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, config.roomHeight, config.roomLength), wallBayMaterial);
  rightWall.position.set(halfW, halfH, centerZ);
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // 4. Large Layered Architectural Wall Sections (with depth & champagne gold trim)
  const panelZPositions = [-2, 4, 10, 16, 22, 28];
  const panelWidth = 4.8;
  const panelThickness = 0.25;

  panelZPositions.forEach((z) => {
    // Left Wall Acoustic Panel Block
    const leftPanel = new THREE.Mesh(
      new THREE.BoxGeometry(panelThickness, config.roomHeight - 1.2, panelWidth),
      wallMaterial
    );
    leftPanel.position.set(-halfW + 0.18, halfH, z);
    leftPanel.receiveShadow = true;
    group.add(leftPanel);

    // Left Panel Champagne Gold Perimeter Border Trim
    const leftTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, config.roomHeight - 1.1, panelWidth + 0.1),
      metallicGoldMaterial
    );
    leftTrim.position.set(-halfW + 0.3, halfH, z);
    group.add(leftTrim);

    // Right Wall Acoustic Panel Block
    const rightPanel = new THREE.Mesh(
      new THREE.BoxGeometry(panelThickness, config.roomHeight - 1.2, panelWidth),
      wallMaterial
    );
    rightPanel.position.set(halfW - 0.18, halfH, z);
    rightPanel.receiveShadow = true;
    group.add(rightPanel);

    // Right Panel Champagne Gold Perimeter Border Trim
    const rightTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, config.roomHeight - 1.1, panelWidth + 0.1),
      metallicGoldMaterial
    );
    rightTrim.position.set(halfW - 0.3, halfH, z);
    group.add(rightTrim);
  });

  // 5. Vertical Floor-to-Ceiling Warm-White LED Light Bars
  const verticalStripZ = [-5, 1, 7, 13, 19, 25, 31];
  verticalStripZ.forEach((z) => {
    // Left vertical strip
    const stripL = new THREE.Mesh(new THREE.BoxGeometry(0.12, config.roomHeight - 0.5, 0.12), ledMaterial);
    stripL.position.set(-halfW + 0.35, halfH, z);
    group.add(stripL);

    // Right vertical strip
    const stripR = new THREE.Mesh(new THREE.BoxGeometry(0.12, config.roomHeight - 0.5, 0.12), ledMaterial);
    stripR.position.set(halfW - 0.35, halfH, z);
    group.add(stripR);
  });

  // 6. Concentric Circular Golden Wall Ornaments with Illuminated Rings & Ovals
  // (Signature architectural feature from the reference photograph)
  const sconceZPositions = [1, 7, 13, 19, 25];

  sconceZPositions.forEach((z, idx) => {
    const sconceY = 5.2 + (idx % 2 === 0 ? 0 : 2.6); // Staggered heights like reference photo

    const buildSconceGroup = (isLeft: boolean) => {
      const sGroup = new THREE.Group();
      const xSign = isLeft ? -1 : 1;
      sGroup.position.set(xSign * (halfW - 0.38), sconceY, z);
      sGroup.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;

      // 1. Large Outer Golden Disc
      const outerRing = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.08, 36), metallicGoldMaterial);
      outerRing.rotation.x = Math.PI / 2;
      sGroup.add(outerRing);

      // 2. Middle Illuminated Accent Ring
      const midRing = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.11, 32), ledMaterial);
      midRing.rotation.x = Math.PI / 2;
      sGroup.add(midRing);

      // 3. Inner Stepped Golden Disc
      const innerRing = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.14, 32), metallicGoldMaterial);
      innerRing.rotation.x = Math.PI / 2;
      sGroup.add(innerRing);

      // 4. Center Glowing Warm Dome
      const centerDome = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), ledMaterial);
      centerDome.position.set(0, 0, 0.12);
      sGroup.add(centerDome);

      // 5. Smaller Oval Decorative Acoustic Panels flanking each side
      const ovalGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 24);
      const ovalTop = new THREE.Mesh(ovalGeo, metallicGoldMaterial);
      ovalTop.position.set(0, 1.9, -0.02);
      ovalTop.scale.set(1.4, 1.0, 0.8);
      ovalTop.rotation.x = Math.PI / 2;
      sGroup.add(ovalTop);

      const ovalBottom = new THREE.Mesh(ovalGeo, metallicGoldMaterial);
      ovalBottom.position.set(0, -1.9, -0.02);
      ovalBottom.scale.set(1.4, 1.0, 0.8);
      ovalBottom.rotation.x = Math.PI / 2;
      sGroup.add(ovalBottom);

      // 6. Warm wall wash point light radiating outward
      const pLight = new THREE.PointLight(0xffe4b5, 0.85, 8);
      pLight.position.set(0, 0, 0.5);
      sGroup.add(pLight);

      return sGroup;
    };

    group.add(buildSconceGroup(true));  // Left wall
    group.add(buildSconceGroup(false)); // Right wall

    // Surround Sound Speakers between sconces
    if (idx < sconceZPositions.length - 1) {
      const speakerZ = z + 3;
      const speakerY = 7.6;

      const spkL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.65, 0.42), speakerMaterial);
      spkL.position.set(-halfW + 0.4, speakerY, speakerZ);
      spkL.rotation.z = -0.22; // angled downward into audience
      group.add(spkL);

      const spkR = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.65, 0.42), speakerMaterial);
      spkR.position.set(halfW - 0.4, speakerY, speakerZ);
      spkR.rotation.z = 0.22;
      group.add(spkR);
    }
  });

  // 7. Ceiling Design
  // Main Ceiling Slab
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(config.roomWidth, 0.4, config.roomLength), ceilingMaterial);
  ceiling.position.set(0, config.roomHeight, centerZ);
  group.add(ceiling);

  // Recessed Center Ceiling Vault / Architectural Coffer
  const cofferMat = new THREE.MeshStandardMaterial({
    color: 0x16100b,
    roughness: 0.9,
    metalness: 0.15,
  });
  const coffer = new THREE.Mesh(
    new THREE.BoxGeometry(config.roomWidth - 6, 0.5, config.roomLength - 4),
    cofferMat
  );
  coffer.position.set(0, config.roomHeight + 0.35, centerZ);
  group.add(coffer);

  // Continuous Warm-White Perimeter LED Cove Lighting around Coffer
  const coveLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, config.roomLength - 4), ledMaterial);
  coveLeft.position.set(-(config.roomWidth - 6) / 2 + 0.1, config.roomHeight + 0.05, centerZ);
  group.add(coveLeft);

  const coveRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, config.roomLength - 4), ledMaterial);
  coveRight.position.set((config.roomWidth - 6) / 2 - 0.1, config.roomHeight + 0.05, centerZ);
  group.add(coveRight);

  // Horizontal Warm Linear LED Strips across Ceiling
  const ceilingStripZ = [0, 8, 16, 24];
  ceilingStripZ.forEach((z) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(config.roomWidth - 4, 0.06, 0.16), ledMaterial);
    strip.position.set(0, config.roomHeight - 0.05, z);
    group.add(strip);
  });

  // Hanging Golden Saucer / Bowl Chandelier Sculptures (near front of auditorium)
  const saucerGeo = new THREE.CylinderGeometry(1.9, 1.2, 0.36, 36);
  const saucerPositions: [number, number, number][] = [
    [0, config.roomHeight - 1.2, 0],
    [-3.0, config.roomHeight - 0.9, 1.8],
    [3.0, config.roomHeight - 0.9, 1.8],
    [-1.6, config.roomHeight - 0.7, -1.8],
    [1.6, config.roomHeight - 0.7, -1.8],
  ];

  saucerPositions.forEach(([x, y, z]) => {
    const saucer = new THREE.Mesh(saucerGeo, metallicGoldMaterial);
    saucer.position.set(x, y, z);
    saucer.rotation.x = Math.PI; // Inverted bowl form
    group.add(saucer);

    // Warm downlight spotlight from center of saucer
    const sLight = new THREE.SpotLight(0xffe4b5, 1.2, 16, 0.6, 0.7);
    sLight.position.set(x, y - 0.2, z);
    sLight.target.position.set(x, 0, z);
    group.add(sLight);
    group.add(sLight.target);
  });

  // 8. Rear Wall & Projection Booth Windows
  const rearWall = new THREE.Mesh(new THREE.BoxGeometry(config.roomWidth, config.roomHeight, 0.4), wallMaterial);
  rearWall.position.set(0, halfH, config.roomLength - 6);
  rearWall.receiveShadow = true;
  group.add(rearWall);

  // Projection Port Glass Windows with projector beam glow
  const boothMat = new THREE.MeshBasicMaterial({ color: 0x3d4f63 });
  const booth1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 0.45), boothMat);
  booth1.position.set(-1.4, config.roomHeight - 2.5, config.roomLength - 6.05);
  group.add(booth1);

  const booth2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 0.45), boothMat);
  booth2.position.set(1.4, config.roomHeight - 2.5, config.roomLength - 6.05);
  group.add(booth2);

  // Soft projector light cone from booth pointing toward screen
  const projectorBeam = new THREE.SpotLight(0xfffaea, 2.0, 60, 0.45, 0.85);
  projectorBeam.position.set(0, config.roomHeight - 2.5, config.roomLength - 6.2);
  projectorBeam.target.position.set(0, 4.5, -4);
  group.add(projectorBeam);
  group.add(projectorBeam.target);

  scene.add(group);
  return group;
}
