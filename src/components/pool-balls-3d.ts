import * as THREE from 'three';
import { BALL_PALETTE } from '../lib/theme/nomoMark';

const BALL = 49;
const GAP = 7;
const FORCE = 0.24;

function textureFor(char: string, color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 256);
  for (const x of [128, 384]) {
    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath();
    ctx.arc(x, 128, 43, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0D0D0D';
    ctx.font = `600 ${char.length > 2 ? 43 : 64}px Helvetica Neue, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char.toLowerCase(), x, 130, 73);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
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

function applySpin(mesh: THREE.Object3D, angularVelocity: THREE.Vector3, axis: THREE.Vector3, rotation: THREE.Quaternion, delta: number, reduced: boolean) {
  const speed = angularVelocity.length();
  if (speed <= 0.008) {
    angularVelocity.set(0, 0, 0);
    return false;
  }
  axis.copy(angularVelocity).normalize();
  rotation.setFromAxisAngle(axis, speed * delta);
  mesh.quaternion.premultiply(rotation);
  angularVelocity.multiplyScalar(Math.exp(-(reduced ? 12 : 2.8) * delta));
  return true;
}

type Pointer = { x: number; y: number; time: number };
type Ball = { mesh: THREE.Mesh; angularVelocity: THREE.Vector3; texture: THREE.CanvasTexture; last: Pointer | null };

function hitBall(balls: Ball[], width: number, x: number, y: number) {
  const worldX = x - width / 2;
  const worldY = BALL / 2 - y;
  const reach = (BALL / 2) ** 2;
  return balls.find(ball => {
    const dx = worldX - ball.mesh.position.x;
    const dy = worldY - ball.mesh.position.y;
    return dx * dx + dy * dy <= reach;
  });
}

function createBalls(letters: string, radius: number) {
  const geometry = new THREE.SphereGeometry(1, 48, 32);
  const start = -((letters.length - 1) * (BALL + GAP)) / 2;
  return {
    geometry,
    balls: Array.from(letters).map((char, index): Ball => {
      const texture = textureFor(char, BALL_PALETTE[index % BALL_PALETTE.length]);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
      mesh.scale.setScalar(radius);
      mesh.position.x = start + index * (BALL + GAP);
      mesh.rotation.set((Math.random() - 0.5) * 0.22, (Math.random() - 0.5) * 0.22, (Math.random() - 0.5) * 0.58);
      return { mesh, angularVelocity: new THREE.Vector3(), texture, last: null };
    }),
  };
}

function createRenderer(host: HTMLElement, width: number) {
  const canvas = document.createElement('canvas');
  canvas.style.touchAction = 'none';
  host.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'default',
    failIfMajorPerformanceCaveat: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xffffff, 0);
  renderer.setSize(width, BALL);
  return renderer;
}

export function mountPoolBalls3D(host: HTMLElement, letters: string, onError?: () => void) {
  const width = letters.length * BALL + Math.max(0, letters.length - 1) * GAP;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = createRenderer(host, width);
  } catch {
    onError?.();
    return () => {};
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-width / 2, width / 2, BALL / 2, -BALL / 2, 0.1, 1000);
  camera.position.z = 500;
  const { geometry, balls } = createBalls(letters, BALL / 2);
  for (const ball of balls) scene.add(ball.mesh);

  const axis = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let previousTime = 0;

  function point(event: PointerEvent) {
    const rect = host.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top, time: performance.now() };
  }

  function render(time: number) {
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    let spinning = false;
    for (const ball of balls) spinning = applySpin(ball.mesh, ball.angularVelocity, axis, rotation, delta, reduced.matches) || spinning;
    renderer.render(scene, camera);
    frame = spinning ? requestAnimationFrame(render) : 0;
    if (!frame) previousTime = 0;
  }

  function kick() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function onDown(event: PointerEvent) {
    host.setPointerCapture(event.pointerId);
    const next = point(event);
    const hovered = hitBall(balls, width, next.x, next.y);
    for (const ball of balls) ball.last = ball === hovered ? next : null;
  }

  function onMove(event: PointerEvent) {
    if (reduced.matches) return;
    const next = point(event);
    const hovered = hitBall(balls, width, next.x, next.y);
    for (const ball of balls) {
      if (ball === hovered) addPointerSpin(ball.angularVelocity, ball.last, next.x, next.y, next.time);
      ball.last = ball === hovered ? next : null;
    }
    kick();
  }

  function onUp() {
    for (const ball of balls) ball.last = null;
  }

  renderer.render(scene, camera);
  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerup', onUp);
  host.addEventListener('pointercancel', onUp);
  host.addEventListener('pointerleave', onUp);

  return () => {
    cancelAnimationFrame(frame);
    host.removeEventListener('pointerdown', onDown);
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerup', onUp);
    host.removeEventListener('pointercancel', onUp);
    host.removeEventListener('pointerleave', onUp);
    for (const ball of balls) {
      (ball.mesh.material as THREE.Material).dispose();
      ball.texture.dispose();
    }
    geometry.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
