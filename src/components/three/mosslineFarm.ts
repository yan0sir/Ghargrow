import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { agWheel, buildAxion, buildPivot, fbm } from "@/components/farm/models";

/*
 * The landing for the Mossline fly-in: once the camera is down at eye level the moss
 * landscape gives way to neat, freshly mown farmland with Ghargrow's product lines on it.
 * Units are metres; the camera looks down -Z.
 */

const SKY = 0xdfe3e0;

export type FarmAnchor = { id: string; pos: THREE.Vector3 };

/* ───────── textures ───────── */
function grassTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#6c8a45";
  g.fillRect(0, 0, 512, 512);
  // thousands of tiny strokes = a close-cropped sward
  for (let i = 0; i < 26000; i++) {
    const x = Math.random() * 512,
      y = Math.random() * 512;
    const l = 2 + Math.random() * 5;
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
    const t = Math.random();
    g.strokeStyle = t < 0.33 ? "#56743a" : t < 0.66 ? "#7f9c55" : t < 0.95 ? "#6e8c4a" : "#a3b87a";
    g.globalAlpha = 0.55 + Math.random() * 0.45;
    g.lineWidth = 0.8 + Math.random() * 0.8;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function labelTexture(lines: { text: string; font: string; y: number; color: string }[], bg: string, band?: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 320;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 320);
  // woven polypropylene texture
  g.globalAlpha = 0.08;
  g.fillStyle = "#000";
  for (let y = 0; y < 320; y += 4) g.fillRect(0, y, 512, 1);
  for (let x = 0; x < 512; x += 4) g.fillRect(x, 0, 1, 320);
  g.globalAlpha = 1;
  if (band) {
    g.fillStyle = band;
    g.fillRect(0, 210, 512, 60);
  }
  g.textAlign = "center";
  lines.forEach((l) => {
    g.font = l.font;
    g.fillStyle = l.color;
    g.fillText(l.text, 256, l.y);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function strawTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#d8bb6a";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * 256,
      y = Math.random() * 256;
    g.strokeStyle = ["#c9a650", "#e8d48e", "#b38f3e", "#f0e2a8"][(Math.random() * 4) | 0];
    g.globalAlpha = 0.7;
    g.lineWidth = 1 + Math.random();
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 6 + Math.random() * 14, y + (Math.random() - 0.5) * 3);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ───────── pieces ───────── */
function pallet(w: number, d: number) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0xb48a5a, roughness: 0.9 });
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.022, d / 9), wood);
    b.position.set(0, 0.135, -d / 2 + d / 14 + (i * (d - d / 7)) / 6);
    g.add(b);
  }
  for (const x of [-w / 2 + 0.05, 0, w / 2 - 0.05]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, d), wood);
    s.position.set(x, 0.07, 0);
    g.add(s);
  }
  return g;
}

/** Seeds & fertilizers: a pallet of branded woven sacks with a couple leaning against it. */
function buildSacks() {
  const g = new THREE.Group();
  g.add(pallet(1.25, 1.05));
  const seedTex = labelTexture(
    [
      { text: "GHARGROW", font: "600 54px Inter Tight, Arial", y: 92, color: "#10291a" },
      { text: "CERTIFIED SEED", font: "500 30px JetBrains Mono, monospace", y: 150, color: "#43780e" },
      { text: "ALFALFA · 25 KG", font: "500 30px JetBrains Mono, monospace", y: 252, color: "#ffffff" },
    ],
    "#f1eee6",
    "#43780e",
  );
  const fertTex = labelTexture(
    [
      { text: "GHARGROW", font: "600 54px Inter Tight, Arial", y: 92, color: "#ffffff" },
      { text: "NPK 20-20-20", font: "500 34px JetBrains Mono, monospace", y: 156, color: "#c6f35c" },
      { text: "FERTILIZER · 50 KG", font: "500 28px JetBrains Mono, monospace", y: 252, color: "#10291a" },
    ],
    "#1f4a2a",
    "#c6f35c",
  );
  const sack = (tex: THREE.Texture) => {
    const geo = new RoundedBoxGeometry(0.58, 0.2, 0.9, 4, 0.08);
    // pillowy: bulge the middle, pinch the corners
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / 0.29,
        z = p.getZ(i) / 0.45;
      const k = (1 - x * x * 0.5) * (1 - z * z * 0.6);
      p.setY(i, p.getY(i) * (0.55 + 0.75 * k) + fbm(x * 3, z * 3) * 0.015);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
    m.castShadow = m.receiveShadow = true;
    return m;
  };
  let y = 0.2;
  for (let layer = 0; layer < 4; layer++) {
    for (let i = 0; i < 2; i++) {
      const s = sack(layer % 2 ? fertTex : seedTex);
      const rot = layer % 2 ? Math.PI / 2 : 0;
      s.rotation.y = rot + (Math.random() - 0.5) * 0.06;
      if (layer % 2) s.position.set(0, y, (i - 0.5) * 0.6);
      else s.position.set((i - 0.5) * 0.6, y, 0);
      g.add(s);
    }
    y += 0.2;
  }
  // a sack slumped against the pallet
  const lean = sack(seedTex);
  lean.position.set(0.95, 0.38, 0.1);
  lean.rotation.set(0, 0.2, 1.15);
  g.add(lean);
  return g;
}

/** Bale handling: a stacked block of small square bales, as an accumulator leaves them. */
function buildBaleStack() {
  const g = new THREE.Group();
  const tex = strawTexture();
  const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0xf3e2a6, roughness: 0.95 });
  const twine = new THREE.MeshStandardMaterial({ color: 0xd8502a, roughness: 0.7 });
  const geo = new RoundedBoxGeometry(1.0, 0.42, 0.48, 3, 0.05);
  const bale = (x: number, y: number, z: number, ry: number) => {
    const b = new THREE.Group();
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = m.receiveShadow = true;
    b.add(m);
    for (const dx of [-0.22, 0.22]) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.008, 4, 4), twine);
      t.scale.set(1, 0.95, 1);
      t.rotation.set(0, Math.PI / 2, Math.PI / 4);
      t.position.x = dx;
      b.add(t);
    }
    b.position.set(x, y, z);
    b.rotation.y = ry + (Math.random() - 0.5) * 0.05;
    g.add(b);
  };
  // a tidy block, as an accumulator + grab leaves them: 2 long × 4 deep, 3 high, stepped top
  for (let l = 0; l < 3; l++) {
    const y = 0.21 + l * 0.42;
    const deep = l === 2 ? 2 : 4;
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < deep; j++) bale((i - 0.5) * 1.02, y, (j - (deep - 1) / 2) * 0.49, 0);
  }
  // a few loose bales on the grass
  bale(1.8, 0.21, 0.9, 0.5);
  bale(2.1, 0.21, -0.4, 1.3);
  bale(1.9, 0.63, 0.3, 0.9);
  return g;
}

/** Spare parts: a pallet with tyres, a crate of genuine parts and a gear. */
function buildParts() {
  const g = new THREE.Group();
  g.add(pallet(1.6, 1.2));
  // crate
  const crateTex = labelTexture(
    [
      { text: "GENUINE PARTS", font: "600 50px Inter Tight, Arial", y: 140, color: "#2f2a20" },
      { text: "GHARGROW · CLAAS", font: "500 30px JetBrains Mono, monospace", y: 200, color: "#43780e" },
    ],
    "#c79c66",
  );
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.6), new THREE.MeshStandardMaterial({ map: crateTex, roughness: 0.85 }));
  crate.position.set(-0.35, 0.45, 0);
  crate.castShadow = crate.receiveShadow = true;
  g.add(crate);
  // slats on the crate
  const slat = new THREE.MeshStandardMaterial({ color: 0xa57c4c, roughness: 0.9 });
  for (const y of [0.2, 0.7]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.06, 0.62), slat);
    s.position.set(-0.35, y, 0);
    g.add(s);
  }
  // stacked tyres lying flat
  for (let i = 0; i < 2; i++) {
    const w = agWheel(0.42, 0.28);
    w.g.rotation.x = Math.PI / 2;
    w.g.position.set(0.45, 0.3 + i * 0.29, 0.05);
    g.add(w.g);
  }
  // a tyre leaning on the pallet
  const lean = agWheel(0.48, 0.3);
  lean.g.position.set(0.3, 0.5, 0.78);
  lean.g.rotation.set(0.35, 0.3, 0);
  g.add(lean.g);
  // gear wheel
  const shape = new THREE.Shape();
  const teeth = 18,
    ro = 0.24,
    ri = 0.2;
  for (let i = 0; i <= teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const r = i % 4 < 2 ? ro : ri;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.06, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const gear = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2 }),
    new THREE.MeshStandardMaterial({ color: 0x8e9499, metalness: 0.85, roughness: 0.35 }),
  );
  gear.rotation.set(-1.2, 0, 0.3);
  gear.position.set(-0.35, 0.82, 0.05);
  gear.castShadow = true;
  g.add(gear);
  return g;
}

/** Distant crops and a windbreak of trees, so it reads as a farm, not a lawn. */
function buildSurroundings() {
  const g = new THREE.Group();
  // golden wheat field beyond the mown strip
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const x = c.getContext("2d")!;
  for (let i = 0; i < 256; i++) {
    x.fillStyle = i % 8 < 5 ? "#b9ab73" : "#978d5c";
    x.fillRect(0, i, 64, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(30, 40);
  t.colorSpace = THREE.SRGBColorSpace;
  const wheat = new THREE.Mesh(new THREE.PlaneGeometry(600, 220), new THREE.MeshLambertMaterial({ map: t }));
  wheat.rotation.x = -Math.PI / 2;
  wheat.position.set(0, 0.02, -170);
  g.add(wheat);
  // windbreak
  const leaf = new THREE.MeshLambertMaterial({ color: 0x4d6b38 });
  const trunk = new THREE.MeshLambertMaterial({ color: 0x5a4a3a });
  for (let i = 0; i < 70; i++) {
    const tx = -260 + i * 7.5 + (Math.random() - 0.5) * 3;
    const h = 7 + Math.random() * 5;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, h * 0.4, 6), trunk);
    tr.position.set(tx, h * 0.2, -150);
    g.add(tr);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), leaf);
    crown.scale.set(2.2 + Math.random(), h * 0.45, 2.2 + Math.random());
    crown.position.set(tx, h * 0.62, -150 + (Math.random() - 0.5) * 4);
    g.add(crown);
  }
  return g;
}

/** Close-cropped grass blades near the camera, coloured by the mowing stripe they sit in. */
function buildBlades(stripe: number) {
  const blade = new THREE.BufferGeometry();
  blade.setAttribute("position", new THREE.Float32BufferAttribute([-0.006, 0, 0, 0.006, 0, 0, 0.001, 1, 0.004], 3));
  blade.computeVertexNormals();
  const N = 140000;
  const mesh = new THREE.InstancedMesh(blade, new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), N);
  const m = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    s = new THREE.Vector3(),
    p = new THREE.Vector3(),
    col = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const z = 30 - 30 * Math.pow(Math.random(), 0.7),
      x = (Math.random() - 0.5) * (16 + (30 - z) * 1.2);
    const light = Math.floor(x / stripe + 100) % 2 === 0;
    p.set(x, 0, z);
    q.setFromEuler(new THREE.Euler((Math.random() - 0.5) * 0.5 + (light ? -0.25 : 0.25), Math.random() * Math.PI, (Math.random() - 0.5) * 0.4));
    const h = 0.035 + Math.random() * 0.035;
    s.set(1, h, 1);
    m.compose(p, q, s);
    mesh.setMatrixAt(i, m);
    col.setHSL(0.24 + Math.random() * 0.03, 0.32, (light ? 0.3 : 0.24) + Math.random() * 0.06);
    mesh.setColorAt(i, col);
  }
  mesh.receiveShadow = true;
  return mesh;
}

/* ───────── scene ───────── */
export function mountFarm(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.Fog(SKY, 22, 210);

  scene.add(new THREE.HemisphereLight(0xeef1ee, 0x6a7558, 1.6));
  const sun = new THREE.DirectionalLight(0xfff6ea, 1.7);
  sun.position.set(-30, 45, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 140 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  // mown ground with stripes along the view direction
  const STRIPE = 3.2;
  const tex = grassTexture();
  tex.repeat.set(220, 220);
  const groundMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 });
  groundMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWp;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed,1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWp;")
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        float st = mod(floor(vWp.x / ${STRIPE.toFixed(2)} + 100.0), 2.0);
        float edge = smoothstep(0.0, 0.08, fract(vWp.x / ${STRIPE.toFixed(2)})) * smoothstep(1.0, 0.92, fract(vWp.x / ${STRIPE.toFixed(2)}));
        diffuseColor.rgb *= mix(0.82, 1.12, st) * mix(0.97, 1.0, edge);
        // field edge: the mown strip gives way to the crop
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.56, 0.3), smoothstep(-52.0, -62.0, vWp.z) * 0.5);`,
      );
  };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  scene.add(buildBlades(STRIPE));
  scene.add(buildSurroundings());

  /* products */
  const tractor = buildAxion();
  tractor.group.position.set(-7.2, 0, 2.5);
  tractor.group.rotation.y = -0.55;
  scene.add(tractor.group);

  const pivot = buildPivot(34);
  pivot.group.position.set(24, 0, -34);
  const armBase = Math.atan2(20, -30); // arm sweeps across the back of the view
  pivot.arm.rotation.y = armBase;
  const sprayMat = pivot.spray.material as THREE.ShaderMaterial;
  sprayMat.uniforms.uOn.value = 1;
  pivot.mist.opacity = 0.08;
  scene.add(pivot.group);

  const bales = buildBaleStack();
  bales.position.set(6.2, 0, 3.5);
  bales.rotation.y = -0.4;
  scene.add(bales);

  const sacks = buildSacks();
  sacks.position.set(-1.6, 0, 9.5);
  sacks.rotation.y = 0.35;
  scene.add(sacks);

  const parts = buildParts();
  parts.position.set(3.4, 0, 12.2);
  parts.rotation.y = -0.5;
  scene.add(parts);

  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m !== ground) m.castShadow = true;
  });

  const armPoint = new THREE.Vector3();
  const anchors: FarmAnchor[] = [
    { id: "tractors", pos: new THREE.Vector3(-7.2, 3.6, 2.5) },
    { id: "irrigation", pos: new THREE.Vector3() },
    { id: "bales", pos: new THREE.Vector3(6.2, 1.6, 3.5) },
    { id: "seeds", pos: new THREE.Vector3(-1.6, 1.15, 9.5) },
    { id: "parts", pos: new THREE.Vector3(3.4, 1.2, 12.2) },
  ];

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 900);
  const size = () => {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the product spread in frame on tall screens
    camera.fov = w / h < 1 ? 58 : 38;
    camera.updateProjectionMatrix();
  };
  size();
  window.addEventListener("resize", size);

  const tmp = new THREE.Vector3();
  const look = new THREE.Vector3();
  /**
   * k: 0 → 1 over the landing (descend from above the field to eye level, then a slow push-in).
   * Returns screen positions (px) of the product anchors.
   */
  const update = (k: number, time: number, sx: number, sy: number) => {
    if (canvas.width !== Math.round(canvas.clientWidth * renderer.getPixelRatio())) size();
    const land = THREE.MathUtils.smoothstep(k, 0, 0.35);
    const push = THREE.MathUtils.smoothstep(k, 0.25, 1);
    camera.position.set(-0.5 + sx * 0.8, THREE.MathUtils.lerp(9, 2.3, land) - sy * 0.3, THREE.MathUtils.lerp(34, 24, land) - push * 4);
    look.set(0, THREE.MathUtils.lerp(-1, 1.1, land), 0);
    camera.lookAt(look);

    pivot.arm.rotation.y = armBase + Math.sin(time * 0.05) * 0.04 + k * 0.12;
    sprayMat.uniforms.uTime.value = time;
    sprayMat.uniforms.uPx.value = renderer.getPixelRatio() * (canvas.clientHeight / 900);
    pivot.wheels.forEach((w) => (w.rotation.z = -k * 3));
    // irrigation anchor: two-thirds along the arm, at pipe height
    armPoint.set(34 * 0.55, 4.6, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), pivot.arm.rotation.y).add(pivot.group.position);
    anchors[1].pos.copy(armPoint);

    renderer.render(scene, camera);
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    return anchors.map((a) => {
      tmp.copy(a.pos).project(camera);
      return { id: a.id, x: (tmp.x * 0.5 + 0.5) * w, y: (-tmp.y * 0.5 + 0.5) * h, on: tmp.z < 1 };
    });
  };

  const dispose = () => {
    window.removeEventListener("resize", size);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    renderer.dispose();
  };
  return { update, dispose };
}
