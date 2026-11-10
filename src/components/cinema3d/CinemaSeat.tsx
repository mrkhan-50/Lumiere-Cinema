import * as THREE from "three";

export interface SeatMeta {
  id: string;
  row: string;
  number: number;
  category: "REGULAR" | "PREMIUM" | "EXECUTIVE" | "RECLINER";
  price: number;
  isOccupied?: boolean;
}

// Seat status colors matching LUMIÈRE luxury palette
export const SEAT_COLORS = {
  AVAILABLE: 0xe8c9a0, // Luxury Cream/Champagne Leather (#E8C9A0)
  HOVERED: 0xfde68a,   // Warm Golden Hover Highlight (#FDE68A)
  SELECTED: 0xf59e0b,  // Radiant Champagne Gold (#F59E0B)
  BOOKED: 0x8b1d2c,    // Muted Crimson Booked (#8B1D2C)
  HELD: 0xd97706,      // Warm Amber Reservation (#D97706)
};

// Reusable shared geometries to maximize WebGL performance across all seats
const cushionGeo = new THREE.BoxGeometry(1.22, 0.32, 1.05);
const backrestGeo = new THREE.BoxGeometry(1.22, 1.05, 0.26);
const headrestGeo = new THREE.BoxGeometry(0.96, 0.32, 0.22);
const armrestGeo = new THREE.BoxGeometry(0.24, 0.55, 0.96);
const armrestLedGeo = new THREE.BoxGeometry(0.04, 0.34, 0.04);
const cupHolderGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16);
const footrestGeo = new THREE.BoxGeometry(1.18, 0.44, 0.16);
const basePedestalGeo = new THREE.BoxGeometry(1.1, 0.22, 0.9);
const swivelTableGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.035, 20);
const swivelStemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.38, 12);
const pillowGeo = new THREE.BoxGeometry(0.42, 0.32, 0.16);

// Shared luxury materials
const velvetPillowMat = new THREE.MeshStandardMaterial({
  color: 0x7b1828, // Deep Maroon Velvet (#7B1828)
  roughness: 0.9,
  metalness: 0.05,
});

const armrestLedMat = new THREE.MeshBasicMaterial({
  color: 0xffe4b5, // Warm golden white LED
});

const cupHolderMat = new THREE.MeshStandardMaterial({
  color: 0xd4af37, // Champagne Gold
  roughness: 0.25,
  metalness: 0.9,
});

const darkBaseMat = new THREE.MeshStandardMaterial({
  color: 0x181310, // Dark bronze/espresso base
  roughness: 0.8,
  metalness: 0.3,
});

const woodConsoleMat = new THREE.MeshStandardMaterial({
  color: 0x2e1e14, // Dark walnut cocktail console
  roughness: 0.3,
  metalness: 0.3,
});

export interface CinemaSeatInstance {
  group: THREE.Group;
  interactiveMesh: THREE.Mesh;
  updateState: (state: "available" | "selected" | "booked" | "held" | "hovered") => void;
}

/**
 * Builds a highly detailed 3D luxury cream leather cinema recliner seat
 * with ergonomic contours, plush headrest, armrests with integrated vertical LED lights,
 * gold cup holders, swivel tray table, and maroon velvet throw pillow matching the reference photograph.
 */
export function createLuxuryCinemaSeat(
  meta: SeatMeta,
  initialState: "available" | "selected" | "booked" | "held" = "available"
): CinemaSeatInstance {
  const seatGroup = new THREE.Group();

  let initialColor = SEAT_COLORS.AVAILABLE;
  if (meta.isOccupied || initialState === "booked") {
    initialColor = SEAT_COLORS.BOOKED;
  } else if (initialState === "selected") {
    initialColor = SEAT_COLORS.SELECTED;
  } else if (initialState === "held") {
    initialColor = SEAT_COLORS.HELD;
  }

  // Primary Leather PBR Material
  const leatherMaterial = new THREE.MeshStandardMaterial({
    color: initialColor,
    roughness: 0.42,
    metalness: 0.12,
  });

  if (initialState === "selected") {
    leatherMaterial.emissive.setHex(0xd4af37);
    leatherMaterial.emissiveIntensity = 0.35;
  }

  // 1. Recliner Base Pedestal
  const basePedestal = new THREE.Mesh(basePedestalGeo, darkBaseMat);
  basePedestal.position.set(0, 0.11, 0);
  basePedestal.castShadow = true;
  basePedestal.receiveShadow = true;
  seatGroup.add(basePedestal);

  // 2. Thick Contoured Cushion (Interactive Mesh for Raycasting)
  const cushion = new THREE.Mesh(cushionGeo, leatherMaterial);
  cushion.position.set(0, 0.42, 0);
  cushion.castShadow = true;
  cushion.receiveShadow = true;
  cushion.userData = { seatMeta: meta };
  seatGroup.add(cushion);

  // 3. Plush Ergonomic Backrest (angled back for natural luxury recline)
  const backrest = new THREE.Mesh(backrestGeo, leatherMaterial);
  backrest.position.set(0, 0.98, -0.38);
  backrest.rotation.x = -0.16;
  backrest.castShadow = true;
  backrest.receiveShadow = true;
  backrest.userData = { seatMeta: meta };
  seatGroup.add(backrest);

  // 4. Padded Headrest Cushion
  const headrest = new THREE.Mesh(headrestGeo, leatherMaterial);
  headrest.position.set(0, 1.48, -0.46);
  headrest.rotation.x = -0.16;
  headrest.castShadow = true;
  headrest.receiveShadow = true;
  headrest.userData = { seatMeta: meta };
  seatGroup.add(headrest);

  // 5. Recliner Footrest (folded front tier)
  const footrest = new THREE.Mesh(footrestGeo, leatherMaterial);
  footrest.position.set(0, 0.22, 0.52);
  footrest.rotation.x = 0.12;
  footrest.castShadow = true;
  seatGroup.add(footrest);

  // 6. Left Armrest with Integrated LED Light Strip & Gold Cup Holder
  const leftArm = new THREE.Mesh(armrestGeo, leatherMaterial);
  leftArm.position.set(-0.7, 0.62, 0);
  leftArm.castShadow = true;
  seatGroup.add(leftArm);

  const leftLed = new THREE.Mesh(armrestLedGeo, armrestLedMat);
  leftLed.position.set(-0.7, 0.62, 0.48);
  seatGroup.add(leftLed);

  const leftCup = new THREE.Mesh(cupHolderGeo, cupHolderMat);
  leftCup.position.set(-0.7, 0.9, 0.32);
  seatGroup.add(leftCup);

  // 7. Right Armrest with Integrated LED Light Strip, Cup Holder & Swivel Tray
  const rightArm = new THREE.Mesh(armrestGeo, leatherMaterial);
  rightArm.position.set(0.7, 0.62, 0);
  rightArm.castShadow = true;
  seatGroup.add(rightArm);

  const rightLed = new THREE.Mesh(armrestLedGeo, armrestLedMat);
  rightLed.position.set(0.7, 0.62, 0.48);
  seatGroup.add(rightLed);

  const rightCup = new THREE.Mesh(cupHolderGeo, cupHolderMat);
  rightCup.position.set(0.7, 0.9, 0.32);
  seatGroup.add(rightCup);

  // Swivel Cocktail Tray / Drink Table on Right Armrest
  const tableStem = new THREE.Mesh(swivelStemGeo, cupHolderMat);
  tableStem.position.set(0.7, 1.05, 0.05);
  seatGroup.add(tableStem);

  const tableTop = new THREE.Mesh(swivelTableGeo, woodConsoleMat);
  tableTop.position.set(0.7, 1.24, 0.05);
  tableTop.castShadow = true;
  seatGroup.add(tableTop);

  // 8. Plush Maroon Velvet Accent Pillow in Seat Corner (authentic reference photo detail)
  const pillow = new THREE.Mesh(pillowGeo, velvetPillowMat);
  pillow.position.set(0.32, 0.56, -0.2);
  pillow.rotation.y = -0.22;
  pillow.rotation.z = 0.08;
  pillow.castShadow = true;
  seatGroup.add(pillow);

  // Dynamic state updater
  const updateState = (state: "available" | "selected" | "booked" | "held" | "hovered") => {
    if (state === "booked") {
      leatherMaterial.color.setHex(SEAT_COLORS.BOOKED);
      leatherMaterial.emissive.setHex(0x000000);
      leatherMaterial.emissiveIntensity = 0;
    } else if (state === "selected") {
      leatherMaterial.color.setHex(SEAT_COLORS.SELECTED);
      leatherMaterial.emissive.setHex(0xd4af37);
      leatherMaterial.emissiveIntensity = 0.45;
    } else if (state === "held") {
      leatherMaterial.color.setHex(SEAT_COLORS.HELD);
      leatherMaterial.emissive.setHex(0xd97706);
      leatherMaterial.emissiveIntensity = 0.25;
    } else if (state === "hovered") {
      leatherMaterial.color.setHex(SEAT_COLORS.HOVERED);
      leatherMaterial.emissive.setHex(0xf59e0b);
      leatherMaterial.emissiveIntensity = 0.2;
    } else {
      leatherMaterial.color.setHex(SEAT_COLORS.AVAILABLE);
      leatherMaterial.emissive.setHex(0x000000);
      leatherMaterial.emissiveIntensity = 0;
    }
  };

  return { group: seatGroup, interactiveMesh: cushion, updateState };
}
