import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const SIZE = 96;
const REST = { x: -0.16, y: 0.3 };
const FORCE = 0.24;
const VIEW = 78;
const STUDIO_LIGHT = 1.9;
const STUDIO_SHINE = 0.17;

function createRenderer(host: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xffffff, 0);
  renderer.setSize(SIZE, SIZE);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  host.appendChild(renderer.domElement);
  return renderer;
}

function applyStudio(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  scene.environment = env.texture;
  scene.environmentIntensity = STUDIO_LIGHT;
  return env;
}

function meshMaterials(node: THREE.Mesh) {
  return Array.isArray(node.material) ? node.material : [node.material];
}

function tintMaterial(material: THREE.Material, color: THREE.Color) {
  if (!('emissive' in material)) return;
  const standard = material as THREE.MeshStandardMaterial;
  standard.color.copy(color);
  standard.emissive.copy(color);
  standard.emissiveIntensity = 0.08;
  standard.roughness = STUDIO_SHINE;
  standard.metalness = 0;
}

function prepareLogo(object: THREE.Object3D, color: string) {
  const tint = new THREE.Color(color);
  object.traverse(node => {
    if (node.name === 'WatermarkTag') {
      node.visible = false;
      return;
    }
    if (!(node instanceof THREE.Mesh)) return;
    for (const material of meshMaterials(node)) tintMaterial(material, tint);
  });
}

function fitToView(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
  object.scale.multiplyScalar(VIEW / Math.max(size.y, 0.001));
}

function disposeObject(object: THREE.Object3D) {
  object.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    node.geometry.dispose();
    for (const material of meshMaterials(node)) material.dispose();
  });
}

function addPointerSpin(angularVelocity: THREE.Vector3, last: { x: number; y: number; time: number } | null, x: number, y: number, now: number) {
  if (!last || now - last.time >= 100) return;
  const dx = x - last.x;
  const dy = y - last.y;
  if (!(dx * dx + dy * dy)) return;
  angularVelocity.x += dy * FORCE;
  angularVelocity.y += dx * FORCE;
  angularVelocity.clampLength(0, 18);
}

function applySpin(object: THREE.Object3D, angularVelocity: THREE.Vector3, axis: THREE.Vector3, rotation: THREE.Quaternion, delta: number, reduced: boolean) {
  const speed = angularVelocity.length();
  if (speed <= 0.008) {
    angularVelocity.set(0, 0, 0);
    return false;
  }
  axis.copy(angularVelocity).normalize();
  rotation.setFromAxisAngle(axis, speed * delta);
  object.quaternion.premultiply(rotation);
  angularVelocity.multiplyScalar(Math.exp(-(reduced ? 12 : 2.8) * delta));
  return true;
}

export function mountNomoMark3D(host: HTMLElement, color: string, onError?: () => void) {
  const renderer = createRenderer(host);
  const scene = new THREE.Scene();
  const studio = applyStudio(renderer, scene);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);
  camera.position.z = 210;
  const root = new THREE.Group();
  root.rotation.set(REST.x, REST.y, 0);
  scene.add(root);
  const angularVelocity = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  let lastPointer: { x: number; y: number; time: number } | null = null;
  let frame = 0;
  let previousTime = 0;
  let disposed = false;

  function render(time: number) {
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    const spinning = applySpin(root, angularVelocity, axis, rotation, delta, reduced.matches);
    renderer.render(scene, camera);
    frame = spinning ? requestAnimationFrame(render) : 0;
    if (!frame) previousTime = 0;
  }

  function kick() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function onMove(event: PointerEvent) {
    if (reduced.matches || !fine.matches) return;
    const rect = host.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const now = performance.now();
    addPointerSpin(angularVelocity, lastPointer, x, y, now);
    lastPointer = { x, y, time: now };
    kick();
  }

  function onLeave() {
    lastPointer = null;
  }

  function onLost(event: Event) {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
  }

  new GLTFLoader().load('/nomo.glb', gltf => {
    if (disposed) {
      disposeObject(gltf.scene);
      return;
    }
    prepareLogo(gltf.scene, color);
    fitToView(gltf.scene);
    root.add(gltf.scene);
    renderer.render(scene, camera);
  }, undefined, () => onError?.());

  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);
  renderer.domElement.addEventListener('webglcontextlost', onLost);

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerleave', onLeave);
    renderer.domElement.removeEventListener('webglcontextlost', onLost);
    disposeObject(root);
    studio.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
