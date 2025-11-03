import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ---------------------------------------------
// Single-file demo: <ModelViewer src="/model.glb" />
// Put your .glb in the Vite `public/` folder (e.g., public/model.glb)
// npm i three
// ---------------------------------------------

type ModelViewerProps = {
  /** URL to a .glb/.gltf model. For Vite, files in `public/` are served at root, e.g. "/model.glb" */
  src: string;
  /** Enable slow autorotation */
  autoRotate?: boolean;
  /** Canvas background color (CSS color string). Leave undefined for transparent. */
  background?: string;
  /** Height of the viewer (e.g., "480px" or "60vh"). */
  height?: string | number;
};

function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    // Dispose geometries & materials
    if ((child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
    if ((child as THREE.Mesh).material) {
      const mat = (child as THREE.Mesh).material as THREE.Material | THREE.Material[];
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else {
        mat.dispose();
      }
    }
    // Dispose textures
    if ((child as any).material?.map) {
      ((child as any).material.map as THREE.Texture).dispose();
    }
  });
}

function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  controls: OrbitControls
) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  // Re-center model at the origin for nicer controls
  object.position.sub(center);

  // Compute an appropriate distance for the camera
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2));
  cameraZ *= 1.6; // padding factor

  camera.position.set(cameraZ, cameraZ * 0.5, cameraZ); // isometric-ish
  camera.near = cameraZ / 100;
  camera.far = cameraZ * 100;
  camera.updateProjectionMatrix();

  controls.target.set(0, 0, 0);
  controls.update();
}

export function ModelViewer2({ src, autoRotate = true, background, height = 480 }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    if (background) {
      scene.background = new THREE.Color(background);
    } else {
      scene.background = null; // transparent
    }

    // Camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    const container = containerRef.current;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.6;
    controlsRef.current = controls;

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    hemi.position.set(0, 1, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 10, 7.5);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    scene.add(dir);

    // Ground (shadow receiver)
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.2 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.001;
    ground.receiveShadow = true;
    scene.add(ground);

    // Sizing
    const resize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(clientWidth, clientHeight, false);
    };

    // Use ResizeObserver to track container size
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);

    // Animation loop
    const animate = (t: number) => {
      controls.update();
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    // Initial size
    resize();

    // Load GLTF/GLB model
    const loader = new GLTFLoader();
    setLoading(true);
    setError(null);

    loader.load(
      src,
      (gltf) => {
        // Clean up any previous model
        if (modelRef.current) {
          scene.remove(modelRef.current);
          disposeObject3D(modelRef.current);
          modelRef.current = null;
        }

        const root = gltf.scene || new THREE.Group();
        root.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        scene.add(root);
        modelRef.current = root;

        // Position camera nicely
        fitCameraToObject(camera, root, controls);
        setLoading(false);
      },
      undefined,
      (e) => {
        console.error("GLTF load error:", e);
        setError("Failed to load model. Check the `src` path and the browser console.");
        setLoading(false);
      }
    );

    // Cleanup
    return () => {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      if (controls) controls.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      }
      if (modelRef.current) {
        disposeObject3D(modelRef.current);
        modelRef.current = null;
      }
      scene.clear();
    };
  }, [src, autoRotate, background]);

  return (
    <div style={{ width: "100%" }}>
      <div
        ref={containerRef}
        style={{ width: "100%", height: typeof height === "number" ? `${height}px` : height, borderRadius: 12, overflow: "hidden", background: background ?? "transparent" }}
      />
      <div style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
        {loading && "Loading model..."}
        {error && <span style={{ color: "crimson" }}>{error}</span>}
      </div>
    </div>
  );
}


export default ModelViewer2;

// --- Demo component for quick tryout ---
// export default function ModelViewer2() {
//   // Put your model as public/model.glb or change the path below.
//   return (
//     <div style={{ padding: 24, maxWidth: 960, margin: "0 auto", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" }}>
//       <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>3D Model Viewer (Three.js + React + Vite)</h1>
//       <p style={{ marginBottom: 12 }}>
//         Drop a <code>.glb</code> file into <code>public/</code> (e.g., <code>public/model.glb</code>) and run <code>npm run dev</code>.
//       </p>
//       <ModelViewer2 src="/model.glb" autoRotate background="#111315" height={520} />
//       <p style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
//         Tip: If your model was compressed with Draco and doesn't load, you'll need to add a DRACOLoader
//         and point it to a local decoder in <code>public/draco/</code>.
//       </p>
//     </div>
//   );
// }
