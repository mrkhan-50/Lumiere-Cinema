"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { formatPaise } from "@/lib/utils";
import { buildCinemaFloor } from "./CinemaFloor";
import { buildCinemaWalls } from "./CinemaWalls";
import { setupCinemaLighting, LightingControls } from "./CinemaLighting";
import { createLuxuryCinemaSeat, CinemaSeatInstance, SeatMeta } from "./CinemaSeat";
import { createCinemaScreenTexture } from "./textures";

const SEAT_PRICES: Record<string, number> = {
  REGULAR: 28000,
  PREMIUM: 38000,
  EXECUTIVE: 48000,
  RECLINER: 65000,
  VIP: 95000,
};

export interface SeatData {
  id: string;
  row: string;
  number: number;
  category: "REGULAR" | "PREMIUM" | "EXECUTIVE" | "RECLINER";
  position: [number, number, number];
  isOccupied?: boolean;
}

interface Cinema3DProps {
  onSeatSelect?: (seat: SeatData) => void;
  selectedSeatIds?: string[];
  bookedSeatIds?: string[];
  heldSeatIds?: string[];
}

export function Cinema3DAuditorium({
  onSeatSelect,
  selectedSeatIds = [],
  bookedSeatIds = [],
  heldSeatIds = [],
}: Cinema3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // HUD & Interaction State
  const [hoveredSeat, setHoveredSeat] = useState<SeatData | null>(null);
  const [cameraPreset, setCameraPreset] = useState<"overview" | "center" | "recliners" | "architecture" | "seat">("overview");
  const [activeSeatView, setActiveSeatView] = useState<SeatData | null>(null);
  const [lightingMode, setLightingMode] = useState<"warm" | "multiplex" | "showtime">("warm");

  // Keep references for animation loop and seat instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const seatInstancesRef = useRef<Map<string, CinemaSeatInstance>>(new Map());
  const lightingControlsRef = useRef<LightingControls | null>(null);
  const targetCameraPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);

  // Generate Auditorium Seats metadata aligned with stepped tiers
  const seatsData: SeatData[] = useMemo(() => {
    const rowTiers = [
      { row: "A", category: "REGULAR", z: 5.0, y: 0.85 },
      { row: "B", category: "REGULAR", z: 8.2, y: 1.5 },
      { row: "C", category: "PREMIUM", z: 11.4, y: 2.15 },
      { row: "D", category: "PREMIUM", z: 14.6, y: 2.8 },
      { row: "E", category: "EXECUTIVE", z: 17.8, y: 3.45 },
      { row: "F", category: "EXECUTIVE", z: 21.0, y: 4.1 },
      { row: "G", category: "RECLINER", z: 24.2, y: 4.75 },
    ];

    const generated: SeatData[] = [];
    rowTiers.forEach((tier) => {
      for (let num = 1; num <= 10; num++) {
        // Symmetrical layout: 5 seats on left platform, center aisle, 5 seats on right platform
        let xPos = 0;
        if (num <= 5) {
          xPos = -1.6 - (5 - num) * 1.8 - 0.9;
        } else {
          xPos = 1.6 + (num - 6) * 1.8 + 0.9;
        }

        const seatIdFormatted = `${tier.row}-${num}`;
        const isOccupiedDemo =
          (num === 4 && tier.row === "C") ||
          (num === 7 && tier.row === "E") ||
          (num === 8 && tier.row === "E");

        generated.push({
          id: seatIdFormatted,
          row: tier.row,
          number: num,
          category: tier.category as any,
          position: [xPos, tier.y, tier.z],
          isOccupied: isOccupiedDemo,
        });
      }
    });
    return generated;
  }, []);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 650;

    // 1. Scene with warm ambient background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1209); // Warm dark bronze/amber ambience
    sceneRef.current = scene;

    // 2. Camera: Elevated front-facing angle showing the full auditorium (matching reference photo)
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.5, 120);
    camera.position.set(0, 7.8, -2.5);
    cameraRef.current = camera;

    // 3. WebGL Renderer with HDR ACES Filmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35; // Bright, luminous luxury cinema atmosphere
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Stay above carpet floor
    controls.minDistance = 3.5;
    controls.maxDistance = 50;
    controls.target.set(0, 3.5, 15);
    controlsRef.current = controls;

    // 5. Lighting System (Warm, Golden, Multiplex Radiance)
    const lighting = setupCinemaLighting(scene);
    lightingControlsRef.current = lighting;

    // 6. Architecture: Golden-Amber Acoustic Walls & Bronze Ceiling
    buildCinemaWalls(scene, {
      roomWidth: 32,
      roomLength: 40,
      roomHeight: 12,
    });

    // 7. Architecture: Tiered Floor, Central Staircase & Geometric Carpet
    buildCinemaFloor(scene, {
      rowCount: 7,
      rowDepth: 3.2,
      rowRise: 0.65,
      tierWidth: 28,
      centerAisleWidth: 3.2,
    });

    // 8. Curved Silver IMAX Cinema Screen
    const screenTexture = createCinemaScreenTexture();
    const screenGeo = new THREE.CylinderGeometry(28, 28, 10, 48, 1, true, -Math.PI / 7, (2 * Math.PI) / 7);
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      roughness: 0.18,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveMap: screenTexture,
      emissiveIntensity: 0.52,
      side: THREE.DoubleSide,
    });
    const cinemaScreen = new THREE.Mesh(screenGeo, screenMat);
    cinemaScreen.position.set(0, 4.8, -32);
    cinemaScreen.rotation.y = Math.PI;
    scene.add(cinemaScreen);

    // 9. Generate Luxury Cream Leather Recliners across stepped tiers
    const seatInstances = new Map<string, CinemaSeatInstance>();
    seatInstancesRef.current = seatInstances;

    seatsData.forEach((seat) => {
      const seatMeta: SeatMeta = {
        id: seat.id,
        row: seat.row,
        number: seat.number,
        category: seat.category,
        price: SEAT_PRICES[seat.category] || 35000,
        isOccupied: seat.isOccupied,
      };

      const isSelected = selectedSeatIds.includes(seat.id) || selectedSeatIds.includes(`${seat.row}${seat.number}`);
      const isBooked = seat.isOccupied || bookedSeatIds.includes(seat.id);
      const isHeld = heldSeatIds.includes(seat.id);

      let initialState: "available" | "selected" | "booked" | "held" = "available";
      if (isBooked) initialState = "booked";
      else if (isHeld) initialState = "held";
      else if (isSelected) initialState = "selected";

      const seatInstance = createLuxuryCinemaSeat(seatMeta, initialState);
      seatInstance.group.position.set(...seat.position);
      scene.add(seatInstance.group);
      seatInstances.set(seat.id, seatInstance);
    });

    // 10. Raycasting for Seat Selection & Tooltip Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHoveredMesh: THREE.Mesh | null = null;

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find((i) => i.object.userData?.seatMeta);

      if (hit && hit.object.userData.seatMeta) {
        container.style.cursor = "pointer";
        const meta = hit.object.userData.seatMeta as SeatMeta;
        const matchingSeat = seatsData.find((s) => s.id === meta.id);
        if (matchingSeat) {
          setHoveredSeat(matchingSeat);
        }
        currentHoveredMesh = hit.object as THREE.Mesh;
      } else {
        container.style.cursor = "default";
        setHoveredSeat(null);
        currentHoveredMesh = null;
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find((i) => i.object.userData?.seatMeta);

      if (hit && hit.object.userData.seatMeta) {
        const meta = hit.object.userData.seatMeta as SeatMeta;
        const matchingSeat = seatsData.find((s) => s.id === meta.id);
        if (matchingSeat && !matchingSeat.isOccupied && !bookedSeatIds.includes(matchingSeat.id)) {
          if (onSeatSelect) {
            onSeatSelect(matchingSeat);
          }
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", onPointerMove);
    renderer.domElement.addEventListener("click", onPointerDown);

    // 11. Render Loop with Smooth Camera Interpolation
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera interpolation if transitioning
      if (targetCameraPos.current) {
        camera.position.lerp(targetCameraPos.current, 0.05);
        if (camera.position.distanceTo(targetCameraPos.current) < 0.08) {
          targetCameraPos.current = null;
        }
      }
      if (targetLookAt.current) {
        controls.target.lerp(targetLookAt.current, 0.05);
        if (controls.target.distanceTo(targetLookAt.current) < 0.08) {
          targetLookAt.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 12. Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.domElement.removeEventListener("mousemove", onPointerMove);
      renderer.domElement.removeEventListener("click", onPointerDown);
      renderer.dispose();
      screenTexture.dispose();
    };
  }, [seatsData]);

  // Synchronize dynamic seat states (Selected, Booked, Held, Available)
  useEffect(() => {
    seatsData.forEach((seat) => {
      const instance = seatInstancesRef.current.get(seat.id);
      if (!instance) return;

      const isSelected =
        selectedSeatIds.includes(seat.id) ||
        selectedSeatIds.includes(`${seat.row}${seat.number}`);
      const isBooked =
        seat.isOccupied ||
        bookedSeatIds.includes(seat.id) ||
        bookedSeatIds.includes(`${seat.row}${seat.number}`);
      const isHeld =
        heldSeatIds.includes(seat.id) ||
        heldSeatIds.includes(`${seat.row}${seat.number}`);

      if (isBooked) {
        instance.updateState("booked");
      } else if (isHeld) {
        instance.updateState("held");
      } else if (isSelected) {
        instance.updateState("selected");
      } else {
        instance.updateState("available");
      }
    });
  }, [selectedSeatIds, bookedSeatIds, heldSeatIds, seatsData]);

  // Handle Camera Presets
  const handlePresetChange = (preset: "overview" | "center" | "recliners" | "architecture") => {
    setCameraPreset(preset);
    setActiveSeatView(null);

    if (preset === "overview") {
      // Elevated front-facing angle looking across the entire auditorium (like reference photo)
      targetCameraPos.current = new THREE.Vector3(0, 7.8, -2.5);
      targetLookAt.current = new THREE.Vector3(0, 3.5, 15);
    } else if (preset === "center") {
      // Eye-level view down the central golden staircase
      targetCameraPos.current = new THREE.Vector3(0, 2.0, 2.0);
      targetLookAt.current = new THREE.Vector3(0, 4.0, 18);
    } else if (preset === "recliners") {
      // Close-up inspection of luxury cream leather recliner seats & tray tables
      targetCameraPos.current = new THREE.Vector3(4.2, 5.8, 21.5);
      targetLookAt.current = new THREE.Vector3(2.8, 4.8, 24.2);
    } else if (preset === "architecture") {
      // Admiring the golden acoustic walls, concentric sconces & vertical LED bars
      targetCameraPos.current = new THREE.Vector3(-8.0, 4.5, 10.0);
      targetLookAt.current = new THREE.Vector3(-15.8, 5.5, 13.0);
    }
  };

  // View Angle From This Seat (First-Person Screen POV)
  const handleViewFromSeat = (seat: SeatData) => {
    setActiveSeatView(seat);
    setCameraPreset("seat");
    // Position camera exactly at eye-level on this seat, looking forward at the IMAX screen
    targetCameraPos.current = new THREE.Vector3(
      seat.position[0],
      seat.position[1] + 1.25,
      seat.position[2] + 0.2
    );
    targetLookAt.current = new THREE.Vector3(0, 4.8, -4.5);
  };

  // Adjust Ambient Lighting Mode
  const handleLightingChange = (mode: "warm" | "multiplex" | "showtime") => {
    setLightingMode(mode);
    if (lightingControlsRef.current) {
      lightingControlsRef.current.setMode(mode);
    }
  };

  return (
    <div className="relative w-full h-[620px] sm:h-[720px] rounded-3xl overflow-hidden glass-panel-elevated border border-gold-500/40 shadow-2xl bg-neutral-950">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl glass-panel border border-gold-500/30 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-ping"></span>
          <span className="text-xs font-mono font-bold text-gold-400 uppercase tracking-widest">
            3D LUXURY AUDITORIUM:
          </span>
          <span className="text-xs text-white font-semibold">
            The Sovereign IMAX Hall (Screen 1)
          </span>
        </div>

        {/* Camera Preset Switches */}
        <div className="flex items-center gap-1.5 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => handlePresetChange("overview")}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              cameraPreset === "overview"
                ? "bg-gold-500 text-neutral-950 font-bold shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handlePresetChange("center")}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              cameraPreset === "center"
                ? "bg-gold-500 text-neutral-950 font-bold shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Central Aisle
          </button>
          <button
            onClick={() => handlePresetChange("recliners")}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              cameraPreset === "recliners"
                ? "bg-gold-500 text-neutral-950 font-bold shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Recliner Close-Up
          </button>
          <button
            onClick={() => handlePresetChange("architecture")}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              cameraPreset === "architecture"
                ? "bg-gold-500 text-neutral-950 font-bold shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Golden Walls
          </button>
          {activeSeatView && (
            <button
              onClick={() => handleViewFromSeat(activeSeatView)}
              className="px-3 py-1 text-xs rounded-lg font-bold bg-amber-500 text-neutral-950 animate-pulse shadow-md"
            >
              Seat {activeSeatView.row}{activeSeatView.number} POV
            </button>
          )}
        </div>

        {/* Ambient Lighting Toggles */}
        <div className="flex items-center gap-1 text-xs text-neutral-400">
          <span>Lighting:</span>
          <button
            onClick={() => handleLightingChange("warm")}
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition ${
              lightingMode === "warm"
                ? "bg-gold-500/25 border-gold-400 text-gold-300 font-bold"
                : "border-neutral-800 hover:text-white"
            }`}
          >
            Warm Gold
          </button>
          <button
            onClick={() => handleLightingChange("multiplex")}
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition ${
              lightingMode === "multiplex"
                ? "bg-amber-500/25 border-amber-400 text-amber-300 font-bold"
                : "border-neutral-800 hover:text-white"
            }`}
          >
            Brilliant
          </button>
          <button
            onClick={() => handleLightingChange("showtime")}
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition ${
              lightingMode === "showtime"
                ? "bg-neutral-800 border-gold-500/40 text-white font-bold"
                : "border-neutral-800 hover:text-white"
            }`}
          >
            Screen Focus
          </button>
        </div>
      </div>

      {/* Pure WebGL Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Hover Card / Seat Detail HUD */}
      {hoveredSeat && (
        <div className="absolute bottom-6 left-6 z-20 pointer-events-auto p-4 rounded-2xl glass-panel-elevated border border-gold-500/50 shadow-gold-glow animate-fadeIn min-w-[250px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
              Seat {hoveredSeat.row}{hoveredSeat.number}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gold-500/20 text-gold-300 border border-gold-500/30">
              {hoveredSeat.category}
            </span>
          </div>

          <div className="text-xl font-bold text-white mb-3">
            {formatPaise(SEAT_PRICES[hoveredSeat.category] || 35000)}
          </div>

          <div className="flex items-center gap-2">
            {!hoveredSeat.isOccupied && !bookedSeatIds.includes(hoveredSeat.id) ? (
              <>
                <button
                  onClick={() => onSeatSelect && onSeatSelect(hoveredSeat)}
                  className={`flex-1 py-1.5 rounded-lg font-button font-bold text-xs transition text-center ${
                    selectedSeatIds.includes(hoveredSeat.id) ||
                    selectedSeatIds.includes(`${hoveredSeat.row}${hoveredSeat.number}`)
                      ? "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
                      : "bg-gold-500 hover:bg-gold-400 text-neutral-950 shadow-gold-glow"
                  }`}
                >
                  {selectedSeatIds.includes(hoveredSeat.id) ||
                  selectedSeatIds.includes(`${hoveredSeat.row}${hoveredSeat.number}`)
                    ? "Deselect"
                    : "Select Chair"}
                </button>
                <button
                  onClick={() => handleViewFromSeat(hoveredSeat)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-gold-500/40 text-gold-300 font-button text-xs transition"
                  title="Simulate POV view towards screen from this seat"
                >
                  View POV
                </button>
              </>
            ) : (
              <span className="text-xs text-red-400 italic font-semibold">Seat Booked</span>
            )}
          </div>
        </div>
      )}

      {/* Legend & Instructions HUD */}
      <div className="absolute bottom-6 right-6 z-20 hidden sm:flex items-center gap-3.5 p-3 rounded-2xl glass-panel border border-gold-500/25 text-xs backdrop-blur-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#E8C9A0] border border-gold-500/40 shadow-sm"></span>
          <span className="text-neutral-200 font-medium">Cream Leather (Available)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B] border border-amber-300 shadow-gold-glow"></span>
          <span className="text-gold-300 font-bold">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#8B1D2C] border border-red-800"></span>
          <span className="text-neutral-400 font-medium">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#D97706] border border-amber-600"></span>
          <span className="text-amber-400 font-medium">Reserved Hold</span>
        </div>
      </div>
    </div>
  );
}
