import * as THREE from "three";

export interface LightingControls {
  ambientLight: THREE.AmbientLight;
  hemiLight: THREE.HemisphereLight;
  mainDirLight: THREE.DirectionalLight;
  screenGlowLight: THREE.SpotLight;
  setMode: (mode: "warm" | "multiplex" | "showtime") => void;
}

/**
 * Sets up warm, golden, architectural cinema lighting matching the reference photograph.
 * Eliminates excessive darkness while maintaining rich contrast, visible textures, and soft shadows.
 */
export function setupCinemaLighting(scene: THREE.Scene): LightingControls {
  // 1. Hemisphere Light: Warm golden sky illumination (#FFE4B5) with warm amber ground reflection (#8B5A2B)
  const hemiLight = new THREE.HemisphereLight(0xffe4b5, 0x7c4e20, 1.6);
  hemiLight.position.set(0, 22, 10);
  scene.add(hemiLight);

  // 2. Ambient Fill Light: Soft warm fill so that all shadow areas remain clearly visible and legible
  const ambientLight = new THREE.AmbientLight(0xffeac9, 0.85);
  scene.add(ambientLight);

  // 3. Main Warm Directional Light: Mimicking overhead ceiling downlights across the auditorium
  const mainDirLight = new THREE.DirectionalLight(0xfff5dd, 1.8);
  mainDirLight.position.set(6, 20, 12);
  mainDirLight.castShadow = true;
  mainDirLight.shadow.mapSize.width = 2048;
  mainDirLight.shadow.mapSize.height = 2048;
  mainDirLight.shadow.camera.near = 1;
  mainDirLight.shadow.camera.far = 60;
  mainDirLight.shadow.camera.left = -22;
  mainDirLight.shadow.camera.right = 22;
  mainDirLight.shadow.camera.top = 30;
  mainDirLight.shadow.camera.bottom = -15;
  mainDirLight.shadow.bias = -0.0004;
  scene.add(mainDirLight);

  // 4. Secondary Soft Front Directional Light: Gently illuminates the seat backs, cushions, and textures
  const frontFillLight = new THREE.DirectionalLight(0xffeed1, 0.95);
  frontFillLight.position.set(0, 10, -14);
  frontFillLight.target.position.set(0, 5, 14);
  scene.add(frontFillLight);
  scene.add(frontFillLight.target);

  // 5. Curved Silver Screen Projector Bloom: Soft projector illumination from the screen into the front hall
  const screenGlowLight = new THREE.SpotLight(0xfff7e2, 2.2, 35, 1.1, 0.8);
  screenGlowLight.position.set(0, 7, -5);
  screenGlowLight.target.position.set(0, 3, 10);
  scene.add(screenGlowLight);
  scene.add(screenGlowLight.target);

  // 6. Central Staircase Aisle Step Lights (warm point lights along the central aisle)
  const stairLights: THREE.PointLight[] = [];
  const stairZSteps = [6, 11, 16, 21, 26];
  stairZSteps.forEach((z, i) => {
    const pLight = new THREE.PointLight(0xffd700, 0.65, 7);
    pLight.position.set(0, 1.8 + i * 0.9, z);
    scene.add(pLight);
    stairLights.push(pLight);
  });

  // Mode switcher
  const setMode = (mode: "warm" | "multiplex" | "showtime") => {
    if (mode === "multiplex") {
      // Maximum architectural visibility & brilliance
      hemiLight.intensity = 2.0;
      ambientLight.intensity = 1.1;
      mainDirLight.intensity = 2.2;
      screenGlowLight.intensity = 1.8;
      stairLights.forEach((l) => (l.intensity = 0.8));
    } else if (mode === "showtime") {
      // Cinematic movie screening ambience (screen focus with warm wall sconces remaining visible)
      hemiLight.intensity = 1.0;
      ambientLight.intensity = 0.55;
      mainDirLight.intensity = 0.9;
      screenGlowLight.intensity = 3.2;
      stairLights.forEach((l) => (l.intensity = 0.5));
    } else {
      // Warm (Default - Perfectly balanced luxury ambiance)
      hemiLight.intensity = 1.6;
      ambientLight.intensity = 0.85;
      mainDirLight.intensity = 1.8;
      screenGlowLight.intensity = 2.2;
      stairLights.forEach((l) => (l.intensity = 0.65));
    }
  };

  return { ambientLight, hemiLight, mainDirLight, screenGlowLight, setMode };
}
