'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { nasaAsteroids, asteroidBigQuerySQL, AsteroidBody } from '@/utils/bigqueryData';
import BigQueryQueryViewer from './BigQueryQueryViewer';

export default function OrbitalRadar() {
  const [selectedAsteroid, setSelectedAsteroid] = useState<AsteroidBody>(nasaAsteroids[0]);
  const [showSql, setShowSql] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [hoveredAsteroidName, setHoveredAsteroidName] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Reference to map asteroid meshes to data
  const asteroidMeshesRef = useRef<{ mesh: THREE.Mesh; data: AsteroidBody }[]>([]);
  const targetReticleRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    camera.position.set(0, 160, 240);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.borderRadius = '1.5rem';
    container.appendChild(renderer.domElement);

    // 2. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 700;
    controls.minDistance = 30;
    controls.autoRotate = isAutoRotating;
    controls.autoRotateSpeed = 0.6;
    controlsRef.current = controls;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(200, 100, 150);
    scene.add(sunLight);

    // 4. Background Starfield
    const starCount = 600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1600;
      starPositions[i + 1] = (Math.random() - 0.5) * 1600;
      starPositions[i + 2] = (Math.random() - 0.5) * 1600;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0x64748b, size: 1.5, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 5. Earth at Origin (0,0,0)
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Earth Core
    const earthGeo = new THREE.SphereGeometry(8, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
      roughness: 0.6,
      metalness: 0.2
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Earth Atmosphere Glow Ring
    const atmosphereGeo = new THREE.SphereGeometry(9.5, 32, 16);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    earthGroup.add(atmosphereMesh);

    // 6. Lunar Distance Concentric Rings on Ecliptic Plane (y = 0)
    const lunarRings = [
      { r: 25, label: '1 LD' },
      { r: 60, label: '3 LD' },
      { r: 120, label: '6 LD' },
      { r: 190, label: '10 LD' }
    ];

    lunarRings.forEach(ring => {
      const ringGeo = new THREE.RingGeometry(ring.r - 0.3, ring.r + 0.3, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      scene.add(ringMesh);
    });

    // 7. Asteroid 3D Orbits & Meshes
    asteroidMeshesRef.current = [];

    nasaAsteroids.forEach((ast) => {
      // 3D Orbital Plane Group tilted by real inclination
      const orbitGroup = new THREE.Group();
      orbitGroup.rotation.z = (ast.inclinationDeg * Math.PI) / 180;
      scene.add(orbitGroup);

      // Scaled semi-major radius
      const r = (ast.orbitRadius / 220) * 190;
      const rad = (ast.angleDeg * Math.PI) / 180;

      // Orbit Ellipse Curve
      const curve = new THREE.EllipseCurve(
        0, 0,
        r, r * (1 - ast.eccentricity * 0.2), // slightly elliptical
        0, 2 * Math.PI,
        false,
        0
      );
      const points = curve.getPoints(64);
      const curvePoints3D = points.map(p => new THREE.Vector3(p.x, 0, p.y));
      const orbitLineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints3D);
      const orbitLineMat = new THREE.LineBasicMaterial({
        color: ast.isPotentiallyHazardous ? 0xef4444 : 0x38bdf8,
        transparent: true,
        opacity: ast.isPotentiallyHazardous ? 0.25 : 0.12
      });
      const orbitLine = new THREE.Line(orbitLineGeo, orbitLineMat);
      orbitGroup.add(orbitLine);

      // Asteroid 3D Mesh
      const astSize = ast.isPotentiallyHazardous ? 2.8 : 2.0;
      const astGeo = new THREE.SphereGeometry(astSize, 16, 16);
      const astMat = new THREE.MeshStandardMaterial({
        color: ast.isPotentiallyHazardous ? 0xf43f5e : 0x38bdf8,
        emissive: ast.isPotentiallyHazardous ? 0xe11d48 : 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.4
      });
      const astMesh = new THREE.Mesh(astGeo, astMat);

      // Position along orbit
      const astX = Math.cos(rad) * r;
      const astZ = Math.sin(rad) * r * (1 - ast.eccentricity * 0.2);
      astMesh.position.set(astX, 0, astZ);
      orbitGroup.add(astMesh);

      asteroidMeshesRef.current.push({ mesh: astMesh, data: ast });
    });

    // 8. 3D Target Reticle for Selected Asteroid
    const reticleGroup = new THREE.Group();
    const reticleRing = new THREE.RingGeometry(5.5, 6.2, 32);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const reticleMesh = new THREE.Mesh(reticleRing, reticleMat);
    reticleMesh.rotation.x = Math.PI / 2;
    reticleGroup.add(reticleMesh);
    scene.add(reticleGroup);
    targetReticleRef.current = reticleGroup;

    // 9. Raycasting for Click & Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes = asteroidMeshesRef.current.map(item => item.mesh);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        const hit = asteroidMeshesRef.current.find(item => item.mesh === intersects[0].object);
        if (hit) setHoveredAsteroidName(hit.data.name);
      } else {
        renderer.domElement.style.cursor = 'grab';
        setHoveredAsteroidName(null);
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes = asteroidMeshesRef.current.map(item => item.mesh);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hit = asteroidMeshesRef.current.find(item => item.mesh === intersects[0].object);
        if (hit) {
          setSelectedAsteroid(hit.data);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // 10. Window Resize Handler
    const onResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', onResize);

    // 11. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Earth slow spin
      earthGroup.rotation.y = elapsedTime * 0.15;

      // Position 3D Target Reticle over selected asteroid
      const selectedItem = asteroidMeshesRef.current.find(item => item.data.id === selectedAsteroid.id);
      if (selectedItem && targetReticleRef.current) {
        const worldPos = new THREE.Vector3();
        selectedItem.mesh.getWorldPosition(worldPos);
        targetReticleRef.current.position.copy(worldPos);
        targetReticleRef.current.rotation.y = elapsedTime * 1.5; // spinning reticle
      }

      // Update controls
      controls.update();

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClick);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedAsteroid.id]);

  // Update controls auto-rotate state dynamically
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 160, 240);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-900/40 bg-gradient-to-br from-blue-950/20 via-zinc-950/80 to-black p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            3D DEEP SPACE RADAR
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            WebGL Three.js + BigQuery ML
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          Interactive 3D NASA Near-Earth Objects Orbital Radar
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
          Three-dimensional orbital simulation rendered in real-time with WebGL and Three.js. Drag to rotate in 3D, scroll to zoom, and click any asteroid or orbital plane to inspect its trajectory and BigQuery ML impact risk probability.
        </p>
      </div>

      {/* 3D Radar View & Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 3D WebGL Canvas Container */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-col relative overflow-hidden shadow-2xl">
          {/* Top Bar Controls */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 text-xs font-mono text-zinc-500 z-10">
            <span className="flex items-center gap-2 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>3D RADAR SWEEP ACTIVE</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  isAutoRotating
                    ? 'bg-blue-600/40 text-blue-300 border border-blue-500/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {isAutoRotating ? 'Auto-Rotate: ON' : 'Auto-Rotate: OFF'}
              </button>

              <button
                onClick={resetCamera}
                className="px-3 py-1 rounded-lg text-xs font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
              >
                Reset Camera
              </button>
            </div>
          </div>

          {/* 3D Three.js Mount */}
          <div
            ref={containerRef}
            className="relative w-full h-[460px] sm:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden bg-black/60 border border-zinc-900"
          >
            {/* Hover Tooltip Overlay */}
            {hoveredAsteroidName && (
              <div className="absolute top-4 left-4 bg-black/90 border border-zinc-700 text-white text-xs font-mono px-3 py-1.5 rounded-xl shadow-xl pointer-events-none z-10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>Target: <strong>{hoveredAsteroidName}</strong> (Click to lock)</span>
              </div>
            )}

            {/* Orbit Controls Guide Legend */}
            <div className="absolute bottom-4 left-4 bg-black/80 border border-zinc-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-zinc-400 pointer-events-none z-10 flex items-center gap-3">
              <span>🖱️ Drag: Rotate 3D</span>
              <span>🔍 Wheel: Zoom</span>
              <span>🎯 Click: Target</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-zinc-500 text-xs mt-4 font-mono">
            <span>Concentric rings: 1 LD (384k km), 3 LD, 6 LD, 10 LD</span>
            <span>Dataset: bigquery-public-data.nasa_jpl_neo</span>
          </div>
        </div>

        {/* Selected Asteroid Telemetry & ML Inspector */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-mono text-zinc-500">3D LOCKED TARGET</span>
                <h3 className="text-2xl font-bold text-white mt-0.5">{selectedAsteroid.name}</h3>
                <p className="text-xs text-blue-400 font-mono">Discovered: {selectedAsteroid.discoveryDate}</p>
              </div>

              <span
                className={`text-xs font-mono px-3 py-1 rounded-full font-bold uppercase ${
                  selectedAsteroid.isPotentiallyHazardous
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                }`}
              >
                {selectedAsteroid.isPotentiallyHazardous ? 'Hazard Alert' : 'Nominal Orbit'}
              </span>
            </div>

            {/* BigQuery ML Hazard Score Gauge */}
            <div className="bg-black/60 border border-zinc-800/80 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-zinc-400">BigQuery ML Impact Risk Score</span>
                <span className={`text-sm font-mono font-bold ${selectedAsteroid.hazardScore > 70 ? 'text-rose-400' : selectedAsteroid.hazardScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedAsteroid.hazardScore}%
                </span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedAsteroid.hazardScore > 70 ? 'bg-rose-500' : selectedAsteroid.hazardScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedAsteroid.hazardScore}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                Calculated via BigQuery ML binary logistic regression over minimum orbit intersection distance (MOID) and absolute magnitude.
              </p>
            </div>

            {/* Physical Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-xs font-mono">
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3">
                <span className="text-zinc-500 block mb-1">DIAMETER</span>
                <span className="text-white font-semibold text-sm">
                  {selectedAsteroid.estimatedDiameterM > 1000
                    ? `${(selectedAsteroid.estimatedDiameterM / 1000).toFixed(1)} km`
                    : `${selectedAsteroid.estimatedDiameterM} m`}
                </span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3">
                <span className="text-zinc-500 block mb-1">VELOCITY</span>
                <span className="text-white font-semibold text-sm">
                  {selectedAsteroid.velocityKmS} km/s
                </span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3">
                <span className="text-zinc-500 block mb-1">MISS DISTANCE</span>
                <span className="text-white font-semibold text-sm">
                  {selectedAsteroid.missDistanceLD} LD ({Math.round(selectedAsteroid.missDistanceKm).toLocaleString()} km)
                </span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3">
                <span className="text-zinc-500 block mb-1">3D INCLINATION</span>
                <span className="text-white font-semibold text-sm">
                  {selectedAsteroid.inclinationDeg}°
                </span>
              </div>
            </div>

            {/* Asteroid Selector List */}
            <div>
              <span className="text-xs font-mono text-zinc-500 block mb-2.5">ACTIVE 3D RADAR CATALOG</span>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {nasaAsteroids.map((ast) => (
                  <button
                    key={ast.id}
                    onClick={() => setSelectedAsteroid(ast)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-mono transition-all ${
                      ast.id === selectedAsteroid.id
                        ? 'bg-blue-600/30 text-white border border-blue-500/50'
                        : 'bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/60'
                    }`}
                  >
                    <span>{ast.name}</span>
                    <span className={ast.isPotentiallyHazardous ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {ast.missDistanceLD} LD
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle BigQuery Architecture Viewer */}
      <div className="bg-zinc-950/60 border border-zinc-800 rounded-3xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-semibold text-white">Inspect NASA BigQuery ML Classification Query</h4>
            <p className="text-xs text-zinc-500">View the logistic regression SQL pipeline executed over NASA JPL orbital telemetry.</p>
          </div>
          <button
            onClick={() => setShowSql(!showSql)}
            className="px-4 py-2 rounded-xl text-xs font-mono font-medium bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-zinc-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>{showSql ? 'Hide SQL Code' : 'View BigQuery ML SQL'}</span>
          </button>
        </div>

        {showSql && (
          <div className="mt-6 animate-in fade-in duration-300">
            <BigQueryQueryViewer
              createModelSql={asteroidBigQuerySQL.createModel}
              querySql={asteroidBigQuerySQL.predictionQuery}
              stats={asteroidBigQuerySQL.dremelStats}
            />
          </div>
        )}
      </div>
    </div>
  );
}
