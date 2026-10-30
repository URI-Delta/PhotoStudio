import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Interactive three.js hero: a stylized photo studio — curved seamless
 * backdrop, softbox light rigs, a camera on tripod, and a floating subject
 * cube. Drag to orbit, scroll to zoom; it also auto-rotates when idle.
 */
export default function Studio3D({ className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0c10);
    scene.fog = new THREE.Fog(0x0b0c10, 14, 34);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(6.5, 4.2, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.4, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;
    controls.minDistance = 5;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.enablePan = false;

    // user interaction pauses the auto-rotate for a while
    let idleTimer = null;
    const pauseAuto = () => {
      controls.autoRotate = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { controls.autoRotate = true; }, 3000);
    };
    renderer.domElement.addEventListener('pointerdown', pauseAuto);
    renderer.domElement.addEventListener('wheel', pauseAuto, { passive: true });

    const disposables = { geoms: [], mats: [], addL() { return null; } };
    const track = (obj) => (obj.geometry ? disposables.geoms.push(obj.geometry) : null,
      obj.material ? disposables.mats.push(obj.material) : obj);
    const box = (w, h, d, mat) => track(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat));

    // ---- lights ----
    scene.add(new THREE.AmbientLight(0x334, 0.6));
    const hemi = new THREE.HemisphereLight(0x8899bb, 0x111018, 0.5);
    scene.add(hemi);

    const key = new THREE.SpotLight(0xfff2df, 260, 30, Math.PI / 5, 0.4, 2);
    key.position.set(-4.5, 5.5, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key, key.target);
    key.target.position.set(0, 1.2, 0);

    const fill = new THREE.PointLight(0x7ec8ff, 60, 24);
    fill.position.set(5.5, 3.5, 4);
    scene.add(fill);

    const rim = new THREE.SpotLight(0xb9a4ff, 190, 30, Math.PI / 4, 0.5, 2);
    rim.position.set(2.5, 5, -6);
    rim.castShadow = true;
    scene.add(rim, rim.target);
    rim.target.position.set(0, 1, 0);

    // ---- floor ----
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x14151b, roughness: 0.85, metalness: 0.15 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    disposables.geoms.push(floorGeo);
    disposables.mats.push(floorMat);

    // subtle grid painted onto the floor
    const grid = new THREE.GridHelper(40, 40, 0x2a2d38, 0x1c1e26);
    grid.position.y = 0.01;
    scene.add(grid);

    // ---- curved seamless backdrop ----
    const backdropGeo = new THREE.CylinderGeometry(7, 7, 7, 48, 1, true, Math.PI * 0.62, Math.PI * 1.76);
    const backdropMat = new THREE.MeshStandardMaterial({
      color: 0x1c1e27, roughness: 0.95, metalness: 0, side: THREE.DoubleSide,
    });
    const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
    backdrop.position.y = 3.5;
    backdrop.receiveShadow = true;
    scene.add(backdrop);
    disposables.geoms.push(backdropGeo);
    disposables.mats.push(backdropMat);

    // cyclorama skirt curving floor into wall
    const skirtGeo = new THREE.TorusGeometry(6.9, 0.5, 12, 48, Math.PI);
    const skirtMat = new THREE.MeshStandardMaterial({ color: 0x1c1e27, roughness: 0.95 });
    const skirt = new THREE.Mesh(skirtGeo, skirtMat);
    skirt.rotation.x = Math.PI / 2;
    skirt.position.y = 0.5;
    scene.add(skirt);
    disposables.geoms.push(skirtGeo);
    disposables.mats.push(skirtMat);

    // ---- softbox helper: stand + glowing panel ----
    const mkSoftbox = (x, z, rotY, w = 1.5, h = 2.1) => {
      const g = new THREE.Group();

      const standMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.5, metalness: 0.6 });
      disposables.mats.push(standMat);
      const standGeo = new THREE.CylinderGeometry(0.05, 0.07, 3.2, 12);
      disposables.geoms.push(standGeo);
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.y = 1.6;
      stand.castShadow = true;
      g.add(stand);

      const baseGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.08, 16);
      disposables.geoms.push(baseGeo);
      const base = new THREE.Mesh(baseGeo, standMat);
      base.position.y = 0.04;
      g.add(base);

      const panelGeo = new THREE.BoxGeometry(w, h, 0.16);
      disposables.geoms.push(panelGeo);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xfff3dd });
      disposables.mats.push(glowMat);
      const panel = new THREE.Mesh(panelGeo, glowMat);
      panel.position.y = 3.4;
      panel.castShadow = true;
      g.add(panel);

      const frameGeo = new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.1);
      disposables.geoms.push(frameGeo);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x15161b, roughness: 0.4, metalness: 0.5 });
      disposables.mats.push(frameMat);
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(0, 3.4, 0.09);
      g.add(frame);

      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      return g;
    };
    scene.add(mkSoftbox(-4.8, 3.2, Math.PI / 3));
    scene.add(mkSoftbox(4.6, 3.4, -Math.PI / 3));
    scene.add(mkSoftbox(0, -5.6, 0, 2.4, 1.1)); // overhead strip

    // ---- studio camera on tripod ----
    const camGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(0.7, 0.55, 0.5);
    disposables.geoms.push(bodyGeo);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111217, roughness: 0.35, metalness: 0.7 });
    disposables.mats.push(bodyMat);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.7;
    body.castShadow = true;
    camGroup.add(body);

    const lensGeo = new THREE.CylinderGeometry(0.17, 0.2, 0.45, 20);
    disposables.geoms.push(lensGeo);
    const lens = new THREE.Mesh(lensGeo, bodyMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 1.68, 0.48);
    camGroup.add(lens);

    const frontGeo = new THREE.CircleGeometry(0.16, 20);
    disposables.geoms.push(frontGeo);
    const front = new THREE.Mesh(frontGeo, new THREE.MeshBasicMaterial({ color: 0x3b5bdb }));
    front.position.set(0, 1.68, 0.72);
    camGroup.add(front);
    disposables.mats.push(front.material);

    for (let i = 0; i < 3; i++) {
      const legGeo = new THREE.CylinderGeometry(0.025, 0.03, 1.5, 8);
      disposables.geoms.push(legGeo);
      const leg = new THREE.Mesh(legGeo, bodyMat);
      const a = (i / 3) * Math.PI * 2;
      leg.position.set(Math.sin(a) * 0.18, 0.75, Math.cos(a) * 0.18);
      leg.rotation.set(Math.cos(a) * 0.22, 0, -Math.sin(a) * 0.22);
      camGroup.add(leg);
    }
    camGroup.position.set(-2.6, 0, 5.4);
    camGroup.lookAt(0, 1.5, 0);
    scene.add(camGroup);

    // ---- subject pedestal + floating cube ----
    const pedGeo = new THREE.CylinderGeometry(0.9, 1.0, 0.25, 32);
    disposables.geoms.push(pedGeo);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x26282f, roughness: 0.6, metalness: 0.3 });
    disposables.mats.push(pedMat);
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = 0.125;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const cubeGeo = new THREE.BoxGeometry(1.1, 1.1, 1.1);
    disposables.geoms.push(cubeGeo);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x8b7cf6, roughness: 0.25, metalness: 0.55, flatShading: true,
    });
    disposables.mats.push(cubeMat);
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.y = 1.55;
    cube.castShadow = true;
    scene.add(cube);

    // ---- dust motes ----
    const DUST = 220;
    const dustPos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 10;
      dustPos[i * 3 + 1] = Math.random() * 4.5;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    disposables.geoms.push(dustGeo);
    const dustMat = new THREE.PointsMaterial({
      color: 0xfff3dd, size: 0.035, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    disposables.mats.push(dustMat);
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ---- sizing / loop / cleanup ----
    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      cube.rotation.y = t * 0.4;
      cube.rotation.x = t * 0.2;
      cube.position.y = 1.55 + Math.sin(t * 1.1) * 0.08;
      const p = dustGeo.attributes.position.array;
      for (let i = 0; i < DUST; i++) {
        p[i * 3 + 1] += 0.0025;
        if (p[i * 3 + 1] > 4.8) p[i * 3 + 1] = 0;
      }
      dustGeo.attributes.position.needsUpdate = true;
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
      observer.disconnect();
      controls.dispose();
      disposables.geoms.forEach((g) => g.dispose());
      disposables.mats.forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} />;
}
