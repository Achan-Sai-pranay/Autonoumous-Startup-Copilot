import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Maximize2, RotateCcw, Compass, Info, ShieldCheck, Zap } from "lucide-react";

/**
 * MarketTopology3D
 * Institutional 3D WebGL Vector Space built with Three.js.
 * Renders an interactive 3D coordinate sphere & topological nodes
 * representing competitive positioning, risk hazards, and market capture zones.
 */
export default function MarketTopology3D() {
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState({
    id: "wedge",
    label: "LaunchPilot (Your Wedge)",
    cluster: "Blue Ocean Wedge",
    tam: "$4.2B SAM",
    moat: "Zero-retention contract parser",
    vector: "[0.42, 0.88, -0.15]",
    status: "Defensible",
  });

  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group for all rotating objects
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf97316, 2, 20);
    pointLight.position.set(2, 4, 3);
    scene.add(pointLight);

    const secondaryLight = new THREE.PointLight(0x38bdf8, 1.5, 20);
    secondaryLight.position.set(-3, -2, -2);
    scene.add(secondaryLight);

    // 2. Coordinate Grid Plane
    const gridHelper = new THREE.GridHelper(8, 16, 0xf97316, 0x1e293b);
    gridHelper.position.y = -1.2;
    worldGroup.add(gridHelper);

    // 3. Orbital Ring Rings
    const ringGeo = new THREE.RingGeometry(2.8, 2.83, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x334155,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -0.5;
    worldGroup.add(ringMesh);

    // 4. Data Nodes (Market Clusters)
    const nodes = [
      {
        id: "wedge",
        label: "LaunchPilot (Your Wedge)",
        cluster: "Blue Ocean Wedge",
        tam: "$4.2B SAM",
        moat: "Zero-retention contract parser",
        vector: "[0.42, 0.88, -0.15]",
        pos: new THREE.Vector3(0.5, 0.6, 0.4),
        color: 0xf97316,
        size: 0.22,
      },
      {
        id: "incumbent",
        label: "Legacy Enterprise CLM (Ironclad)",
        cluster: "Procurement Moat",
        tam: "$18.6B TAM",
        moat: "6-month sales cycle & high seat tax",
        vector: "[-1.8, 1.2, -1.1]",
        pos: new THREE.Vector3(-1.8, 1.0, -1.0),
        color: 0xef4444,
        size: 0.28,
      },
      {
        id: "generic_ai",
        label: "Generic AI Chatbots (ChatGPT)",
        cluster: "Hallucination Risk",
        tam: "$80B Broad",
        moat: "Zero domain arithmetic or Mom Test checks",
        vector: "[1.6, -0.4, -1.4]",
        pos: new THREE.Vector3(1.6, -0.3, -1.4),
        color: 0xa855f7,
        size: 0.22,
      },
      {
        id: "manual",
        label: "Manual Legal & Spreadsheet Audits",
        cluster: "High Churn Friction",
        tam: "$2.1B Niche",
        moat: "Labor-intensive 40hr human review",
        vector: "[-0.8, -0.8, 1.2]",
        pos: new THREE.Vector3(-0.8, -0.7, 1.2),
        color: 0x64748b,
        size: 0.18,
      },
      {
        id: "self_serve",
        label: "Self-Serve PLG Connector",
        cluster: "Growth Vector",
        tam: "$6.8B Expansion",
        moat: "1-Click Slack / Drive automated sync",
        vector: "[1.4, 1.4, 0.8]",
        pos: new THREE.Vector3(1.4, 1.3, 0.8),
        color: 0x10b981,
        size: 0.2,
      },
    ];

    const nodeMeshes = [];
    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);

    nodes.forEach((data) => {
      const mat = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.3,
        metalness: 0.7,
        emissive: data.color,
        emissiveIntensity: 0.35,
      });

      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.scale.setScalar(data.size);
      mesh.position.copy(data.pos);
      mesh.userData = data;
      worldGroup.add(mesh);
      nodeMeshes.push(mesh);

      // Glowing outer ring for our wedge
      if (data.id === "wedge") {
        const haloGeo = new THREE.TorusGeometry(data.size * 1.8, 0.02, 16, 48);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0xf97316,
          transparent: true,
          opacity: 0.8,
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        haloMesh.rotation.x = Math.PI / 2;
        mesh.add(haloMesh);
      }
    });

    // 5. Inter-vector Connecting Splines (Network Edges)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.5,
    });

    const connections = [
      ["wedge", "incumbent"],
      ["wedge", "generic_ai"],
      ["wedge", "self_serve"],
      ["incumbent", "manual"],
    ];

    connections.forEach(([idA, idB]) => {
      const nodeA = nodes.find((n) => n.id === idA);
      const nodeB = nodes.find((n) => n.id === idB);
      if (nodeA && nodeB) {
        const points = [nodeA.pos, nodeB.pos];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMat);
        worldGroup.add(line);
      }
    });

    // 6. Interactive Mouse Drag Orbit Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let rotVelX = 0;
    let rotVelY = 0.003;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      rotVelY = deltaX * 0.005;
      rotVelX = deltaY * 0.005;

      worldGroup.rotation.y += rotVelY;
      worldGroup.rotation.x += rotVelX;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch support for mobile/tablet
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMousePos.x;
        const deltaY = e.touches[0].clientY - prevMousePos.y;
        worldGroup.rotation.y += deltaX * 0.005;
        worldGroup.rotation.x += deltaY * 0.005;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchEnd = () => {
      isDragging = false;
    };
    dom.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Raycaster for Node Clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e) => {
      const rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object.userData;
        if (hit) setSelectedNode(hit);
      }
    };
    dom.addEventListener("click", onClick);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (!isDragging) {
        worldGroup.rotation.y += 0.003;
      }

      // Gentle floating breathing effect
      const t = clock.getElapsedTime();
      worldGroup.position.y = Math.sin(t * 0.8) * 0.08;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      dom.removeEventListener("click", onClick);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
      ringGeo.dispose();
      gridHelper.dispose();
    };
  }, []);

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass size={15} className="text-orange-500" />
            <h3 className="text-sm font-bold text-white font-display">
              3D Competitive Vector Space &amp; Risk Topology
            </h3>
          </div>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Real-time WebGL vector projection. Drag with mouse to orbit 3D space, click any node to inspect market positioning.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            WebGL Active
          </span>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative w-full h-[320px] rounded-2xl bg-slate-950 border border-slate-800/90 overflow-hidden shadow-inner group">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Orbit Helper Watermark */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none flex items-center gap-1.5">
          <RotateCcw size={11} className="text-orange-400" />
          <span>Click &amp; Drag to Orbit 3D</span>
        </div>

        {/* Selected Node Overlay Telemetry */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md p-3.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl text-slate-200">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <span className="font-bold text-white text-xs font-display flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{
                  backgroundColor:
                    selectedNode.id === "wedge"
                      ? "#f97316"
                      : selectedNode.id === "incumbent"
                      ? "#ef4444"
                      : selectedNode.id === "self_serve"
                      ? "#10b981"
                      : "#a855f7",
                }}
              />
              {selectedNode.label}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-orange-400">
              {selectedNode.cluster}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono my-2 py-1.5 border-y border-slate-800 text-slate-400">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Market Size</span>
              <span className="text-slate-200 font-semibold">{selectedNode.tam}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Coordinate Vector</span>
              <span className="text-slate-200">{selectedNode.vector}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-snug">
            <strong className="text-slate-100">Moat Analysis:</strong> {selectedNode.moat}
          </p>
        </div>
      </div>

      {/* Cluster Legend Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
          <span className="text-slate-300 truncate">Your Wedge (Opportunity)</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span className="text-slate-300 truncate">Incumbent Gate (Hazard)</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-300 truncate">PLG Expansion (Growth)</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
          <span className="text-slate-300 truncate">Generic AI (Shallow Moat)</span>
        </div>
      </div>
    </div>
  );
}
