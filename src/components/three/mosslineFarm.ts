import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { agWheel, buildAxion, buildPivot, fbm } from "@/components/farm/models";

/*
 * The landing for the Mossline fly-in: once the camera is down at eye level the moss
 * landscape gives way to neat, freshly mown farmland with Ghargrow's product lines on it.
 * Units are metres; the camera looks down -Z.
 */

const SKY = 0xdfe3e0;

export type FarmAnchor = { id: string; pos: THREE.Vector3 };

/* ───────── textures ───────── */
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

/* ───────── moss world (matches the floating island) ───────── */
function mossTexture(bright = false) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = bright ? "#7f9c3f" : "#5d7834";
  g.fillRect(0, 0, 512, 512);
  const tones = bright
    ? ["#6c8a33", "#94b04d", "#a9c05a", "#bccb6c", "#5c7a2c", "#8aa444"]
    : ["#4a6527", "#6f8c3c", "#86a049", "#9cb057", "#3d5622", "#788f3e"];
  // soft cushions of moss (drawn wrapped so the tile repeats seamlessly)
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * 512,
      y = Math.random() * 512,
      r = 3 + Math.random() * 16;
    for (const ox of [-512, 0, 512])
      for (const oy of [-512, 0, 512]) {
        const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        const col = tones[(Math.random() * tones.length) | 0];
        gr.addColorStop(0, col);
        gr.addColorStop(1, "rgba(0,0,0,0)");
        g.globalAlpha = 0.45;
        g.fillStyle = gr;
        g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
      }
  }
  // sporophyte specks + tiny grass strokes
  g.globalAlpha = 0.9;
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = Math.random() < 0.7 ? "#a9bb62" : "#c9d48a";
    g.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
  }
  for (let i = 0; i < 2500; i++) {
    const x = Math.random() * 512,
      y = Math.random() * 512;
    g.strokeStyle = Math.random() < 0.5 ? "#7d9a45" : "#53702c";
    g.globalAlpha = 0.6;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (Math.random() - 0.5) * 3, y - 2 - Math.random() * 4);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Ground as a polar grid around the hand-off point: dense near the camera so the dome bend stays smooth. */
function groundGeometry(cx: number, cz: number) {
  const RINGS = 150,
    SEGS = 160;
  const pos: number[] = [],
    uv: number[] = [],
    idx: number[] = [];
  pos.push(cx, 0, cz);
  uv.push(cx / 3, -cz / 3);
  for (let i = 1; i <= RINGS; i++) {
    const r = 0.25 * (Math.pow(1.052, i) - 1) * 6;
    for (let j = 0; j < SEGS; j++) {
      const a = (j / SEGS) * Math.PI * 2;
      const x = cx + Math.cos(a) * r,
        z = cz + Math.sin(a) * r;
      pos.push(x, 0, z);
      uv.push(x / 3, -z / 3);
    }
  }
  const at = (i: number, j: number) => (i === 0 ? 0 : 1 + (i - 1) * SEGS + (j % SEGS));
  for (let j = 0; j < SEGS; j++) idx.push(0, at(1, j + 1), at(1, j));
  for (let i = 1; i < RINGS; i++)
    for (let j = 0; j < SEGS; j++) {
      const a = at(i, j),
        b = at(i, j + 1),
        c = at(i + 1, j),
        d = at(i + 1, j + 1);
      idx.push(a, b, c, b, d, c);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** Where the 3D camera picks up from the video: low over the moss, flying forward. */
const START = new THREE.Vector3(1.0, 1.25, 46);
/** The island-top patch around the hand-off: dense moss, ferns and pale rock, like the video's last flight frames. */
const inStartPatch = (x: number, z: number) => Math.abs(x - START.x) < 11 && z > START.z - 18 && z < START.z + 10;
const nearPath = (x: number) => Math.abs(x - START.x) < 1.3;

/** Keep-out zones: the product clearing and the camera's flight line. */
const inClearing = (x: number, z: number) => x > -12.5 && x < 10.5 && z > -3 && z < 16;
const onFlightLine = (x: number, z: number) => Math.abs(x - 0.5) < 1.6 && z > 17 && z < 52;

function scatter(n: number, test: (x: number, z: number) => boolean, xr: number, z0: number, z1: number) {
  const out: [number, number][] = [];
  for (let tries = 0; tries < n * 20 && out.length < n; tries++) {
    const x = (Math.random() - 0.5) * xr,
      z = z0 + Math.random() * (z1 - z0);
    if (test(x, z)) out.push([x, z]);
  }
  return out;
}

/** Cushions of moss: lumpy, flattened domes. */
function buildMossMounds() {
  let geo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, 3);
  geo.deleteAttribute("normal");
  geo = mergeVertices(geo);
  const p = geo.attributes.position as THREE.BufferAttribute;
  const n = new THREE.Vector3();
  const colors = new Float32Array(p.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    n.fromBufferAttribute(p, i).normalize();
    const r = 1 + (fbm(n.x * 2.2 + 3, n.z * 2.2 + n.y * 1.7, 4) - 0.5) * 0.5 + (fbm(n.x * 9 + n.y * 4, n.z * 9 - n.y * 3, 2) - 0.5) * 0.16;
    let y = n.y * r;
    if (y < 0) y *= 0.15;
    p.setXYZ(i, n.x * r, y, n.z * r);
    c.set(0xffffff).lerp(new THREE.Color(0xa9b98c), THREE.MathUtils.clamp(fbm(n.x * 4, n.z * 4 + n.y, 3) * 1.6 - 0.4, 0, 1));
    if (n.y < 0.2) c.multiplyScalar(0.78); // shaded skirts
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const spots = [
    ...scatter(800, (x, z) => (!inClearing(x, z) || Math.random() < 0.08) && !inStartPatch(x, z), 90, -40, 70),
    ...scatter(420, inStartPatch, 40, START.z - 20, START.z + 12),
  ];
  const cushion = mossTexture(true);
  cushion.repeat.set(3, 2);
  const mossMat = new THREE.MeshStandardMaterial({ map: cushion, vertexColors: true, roughness: 1, bumpMap: cushion, bumpScale: 2 });
  const mesh = new THREE.InstancedMesh(geo, mossMat, spots.length);
  const m = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    s = new THREE.Vector3(),
    v = new THREE.Vector3();
  spots.forEach(([x, z], i) => {
    const patch = inStartPatch(x, z);
    const near = onFlightLine(x, z) || Math.abs(x) < 4;
    const w = 0.35 + Math.pow(Math.random(), 2) * (patch ? 1.6 : near ? 1.0 : 2.2);
    const h = Math.min(w * (0.3 + Math.random() * 0.4), patch && nearPath(x) ? 0.42 : near && !patch ? 0.3 : 0.8);
    v.set(x, -0.04, z);
    q.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI * 2, 0));
    s.set(w, h, w * (0.7 + Math.random() * 0.5));
    m.compose(v, q, s);
    mesh.setMatrixAt(i, m);
  });
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

/** A fern plant: 7 arching fronds of paired leaflets, merged into one geometry. */
function fernGeometry() {
  const fronds: THREE.BufferGeometry[] = [];
  const dark = new THREE.Color(0x3f6a24),
    light = new THREE.Color(0x8cbf4f);
  for (let f = 0; f < 7; f++) {
    const pos: number[] = [],
      col: number[] = [];
    const rach = (t: number) => new THREE.Vector3(t, Math.sin(t * Math.PI * 0.85) * 0.42 - t * t * 0.1, 0);
    const N = 16;
    for (let i = 1; i < N; i++) {
      const t = i / N;
      const a = rach(t),
        b = rach(t + 0.5 / N);
      const len = 0.24 * Math.pow(1 - t, 0.6) * Math.min(1, t * 4);
      for (const side of [-1, 1]) {
        const tip = new THREE.Vector3(a.x + 0.05, a.y - 0.03, side * len);
        const mid1 = new THREE.Vector3((a.x + tip.x) / 2 - 0.012, (a.y + tip.y) / 2 + 0.008, side * len * 0.5);
        const mid2 = new THREE.Vector3((b.x + tip.x) / 2 + 0.012, (b.y + tip.y) / 2 + 0.008, side * len * 0.5);
        for (const v of [a, mid1, tip, a, tip, b, b, tip, mid2]) pos.push(v.x, v.y, v.z);
        const cc = dark.clone().lerp(light, 0.3 + t * 0.5 + Math.random() * 0.15);
        for (let k = 0; k < 9; k++) col.push(cc.r, cc.g, cc.b);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    const sc = 0.75 + Math.random() * 0.45;
    g.scale(sc, sc * (0.9 + Math.random() * 0.4), sc);
    g.rotateZ(0.1 + Math.random() * 0.25);
    g.rotateY((f / 7) * Math.PI * 2 + Math.random() * 0.4);
    fronds.push(g);
  }
  const merged = mergeGeometries(fronds)!;
  merged.computeVertexNormals();
  return merged;
}

function buildFerns() {
  const spots = [
    ...scatter(480, (x, z) => !inClearing(x, z) && !inStartPatch(x, z) && (!onFlightLine(x, z) || Math.random() < 0.15), 80, -30, 62),
    ...scatter(300, (x, z) => inStartPatch(x, z) && !nearPath(x), 40, START.z - 20, START.z + 12),
  ];
  const mesh = new THREE.InstancedMesh(fernGeometry(), new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.8 }), spots.length);
  const m = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    s = new THREE.Vector3(),
    v = new THREE.Vector3();
  spots.forEach(([x, z], i) => {
    v.set(x, 0, z);
    q.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI * 2, 0));
    s.setScalar(inStartPatch(x, z) ? 0.8 + Math.random() * 0.9 : onFlightLine(x, z) ? 0.5 : 0.6 + Math.random() * 0.9);
    m.compose(v, q, s);
    mesh.setMatrixAt(i, m);
  });
  mesh.castShadow = true;
  return mesh;
}

/** Pale limestone boulders with moss on their shoulders, half-buried. */
function buildMossRocks() {
  let geo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, 3);
  geo.deleteAttribute("normal");
  geo = mergeVertices(geo);
  const p = geo.attributes.position as THREE.BufferAttribute;
  const n = new THREE.Vector3();
  const colors = new Float32Array(p.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    n.fromBufferAttribute(p, i).normalize();
    let r = 1 + (fbm(n.x * 1.8 + 9, n.y * 1.8 + n.z * 1.4, 4) - 0.5) * 0.7;
    r = Math.min(r, 0.92 / Math.max(0.1, n.x * 0.6 + n.y * 0.7)); // a flat fractured face
    p.setXYZ(i, n.x * r, n.y * r * 0.7, n.z * r);
    const moss = THREE.MathUtils.smoothstep(n.y + (fbm(n.x * 5, n.z * 5, 2) - 0.5) * 0.6, 0.25, 0.55);
    c.set(0xdedad0).multiplyScalar(0.8 + fbm(n.x * 8, n.z * 8 + n.y * 3, 3) * 0.35).lerp(new THREE.Color(0x6f8a3b), moss);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const spots = [
    ...scatter(60, (x, z) => !inClearing(x, z) && !onFlightLine(x, z) && !inStartPatch(x, z), 90, -30, 60),
    ...scatter(34, (x, z) => inStartPatch(x, z) && Math.abs(x - START.x) > 1.6, 40, START.z - 20, START.z + 12),
  ];
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }), spots.length);
  const m = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    s = new THREE.Vector3(),
    v = new THREE.Vector3();
  spots.forEach(([x, z], i) => {
    const sz = 0.35 + Math.pow(Math.random(), 2) * 1.3;
    v.set(x, -sz * 0.25, z);
    q.setFromEuler(new THREE.Euler((Math.random() - 0.5) * 0.4, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.4));
    s.set(sz, sz, sz * (0.7 + Math.random() * 0.5));
    m.compose(v, q, s);
    mesh.setMatrixAt(i, m);
  });
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

/** Grass tufts through the moss (denser near the flight line). */
function buildTufts() {
  const blade = new THREE.BufferGeometry();
  blade.setAttribute("position", new THREE.Float32BufferAttribute([-0.008, 0, 0, 0.008, 0, 0, 0.001, 1, 0.01], 3));
  blade.computeVertexNormals();
  const N = 120000;
  const mesh = new THREE.InstancedMesh(blade, new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), N);
  const m = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    s = new THREE.Vector3(),
    p = new THREE.Vector3(),
    col = new THREE.Color();
  for (let i = 0; i < N; i++) {
    // clumps: pick a clump centre, then jitter
    const z = 52 - 56 * Math.pow(Math.random(), 0.75);
    const x = (Math.random() - 0.5) * (14 + (52 - z) * 1.1);
    p.set(x + (Math.random() - 0.5) * 0.15, 0, z + (Math.random() - 0.5) * 0.15);
    q.setFromEuler(new THREE.Euler((Math.random() - 0.5) * 0.7, Math.random() * Math.PI, (Math.random() - 0.5) * 0.7));
    s.set(1, 0.05 + Math.random() * (inClearing(x, z) ? 0.05 : 0.14), 1);
    m.compose(p, q, s);
    mesh.setMatrixAt(i, m);
    col.setHSL(0.22 + Math.random() * 0.05, 0.45, 0.19 + Math.random() * 0.1);
    mesh.setColorAt(i, col);
  }
  mesh.receiveShadow = true;
  return mesh;
}

/* ───────── world bend: the island's dome flattening into the earth ───────── */
const bendUniforms = { uBend: { value: 0 }, uBendC: { value: new THREE.Vector2() } };
const BEND_DECL = "uniform float uBend;\nuniform vec2 uBendC;\n";
const BEND_PROJECT = /* glsl */ `
  vec4 bwp = vec4( transformed, 1.0 );
  #ifdef USE_INSTANCING
    bwp = instanceMatrix * bwp;
  #endif
  bwp = modelMatrix * bwp;
  vec2 bd = bwp.xz - uBendC;
  bwp.y -= uBend * dot( bd, bd );
  vec4 mvPosition = viewMatrix * bwp;
  gl_Position = projectionMatrix * mvPosition;
`;
function bendMaterial(mat: THREE.Material) {
  if (mat.userData.bent) return;
  mat.userData.bent = true;
  if ((mat as THREE.ShaderMaterial).isShaderMaterial) {
    const sm = mat as THREE.ShaderMaterial;
    Object.assign(sm.uniforms, bendUniforms);
    sm.vertexShader = BEND_DECL + sm.vertexShader.replace(
      "vec4 mv = modelViewMatrix * vec4(p,1.0);",
      "vec4 bw = modelMatrix * vec4(p,1.0); vec2 bd = bw.xz - uBendC; bw.y -= uBend * dot(bd, bd); vec4 mv = viewMatrix * bw;",
    );
    return;
  }
  const prev = mat.onBeforeCompile.bind(mat);
  mat.onBeforeCompile = (sh, r) => {
    prev(sh, r);
    sh.uniforms.uBend = bendUniforms.uBend;
    sh.uniforms.uBendC = bendUniforms.uBendC;
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\n" + BEND_DECL).replace("#include <project_vertex>", BEND_PROJECT);
  };
  mat.customProgramCacheKey = () => "bend";
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
  scene.fog = new THREE.Fog(SKY, 18, 200);

  scene.add(new THREE.HemisphereLight(0xeef1ee, 0x5f6e44, 1.7));
  const sun = new THREE.DirectionalLight(0xfff6ea, 1.6);
  sun.position.set(-30, 45, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 140 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  // moss floor; the product clearing is cropped shorter (lighter, finer) and the far field turns to crop
  const tex = mossTexture();
  const groundMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1 });
  groundMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWp;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed,1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWp;")
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        vec2 cq = vec2(clamp(vWp.x, -12.5, 10.5), clamp(vWp.z, -3.0, 16.0));
        float clearing = 1.0 - smoothstep(0.0, 6.0, length(vWp.xz - cq));
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.06, 1.1, 0.96), clearing);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.58, 0.36), smoothstep(-52.0, -66.0, vWp.z) * 0.5);`,
      );
  };
  const ground = new THREE.Mesh(groundGeometry(START.x, START.z), groundMat);
  ground.receiveShadow = true;
  scene.add(ground);
  scene.add(buildTufts());
  scene.add(buildMossMounds());
  scene.add(buildFerns());
  scene.add(buildMossRocks());
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
    const mat = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach(bendMaterial);
    else if (mat) bendMaterial(mat);
  });

  const armPoint = new THREE.Vector3();
  const anchors: FarmAnchor[] = [
    { id: "tractors", pos: new THREE.Vector3(-7.2, 3.6, 2.5) },
    { id: "irrigation", pos: new THREE.Vector3() },
    { id: "bales", pos: new THREE.Vector3(6.2, 1.6, 3.5) },
    { id: "seeds", pos: new THREE.Vector3(-1.6, 1.15, 9.5) },
    { id: "parts", pos: new THREE.Vector3(3.4, 1.2, 12.2) },
  ];

  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 900);
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
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  /**
   * k: 0 → 1 from the hand-off to the end of the story.
   *   0 → .32  carry on the video's forward flight low over the moss; the island's dome flattens into level farmland
   *   .32 → 1  a slow push-in across the product clearing
   * Returns screen positions (px) of the product anchors.
   */
  const update = (k: number, time: number, sx: number, sy: number) => {
    if (canvas.width !== Math.round(canvas.clientWidth * renderer.getPixelRatio())) size();
    const a = easeOut(THREE.MathUtils.clamp(k / 0.32, 0, 1));
    const rise = THREE.MathUtils.smoothstep(a, 0.1, 1);
    const push = THREE.MathUtils.smoothstep(k, 0.3, 1);
    camera.position.set(
      THREE.MathUtils.lerp(START.x, -0.5, a) + sx * 0.6,
      THREE.MathUtils.lerp(START.y, 2.3, rise) - sy * 0.25,
      THREE.MathUtils.lerp(START.z, 27, a) - push * 5,
    );
    look.set(THREE.MathUtils.lerp(START.x, 0, a), THREE.MathUtils.lerp(-3.6, 1.1, rise), camera.position.z - THREE.MathUtils.lerp(11, 24, a));
    camera.lookAt(look);
    // dome: radius ~35 m at the hand-off (the island top), flat earth by the time the camera has landed
    const flat = THREE.MathUtils.smoothstep(k, 0, 0.3);
    bendUniforms.uBend.value = 0.014 * Math.pow(1 - flat, 2);
    bendUniforms.uBendC.value.set(camera.position.x, camera.position.z);

    pivot.arm.rotation.y = armBase + Math.sin(time * 0.05) * 0.04 + k * 0.12;
    sprayMat.uniforms.uTime.value = time;
    sprayMat.uniforms.uPx.value = renderer.getPixelRatio() * (canvas.clientHeight / 900);
    pivot.wheels.forEach((w) => (w.rotation.z = -k * 3));
    // irrigation anchor: part-way along the arm, at pipe height
    armPoint.set(34 * 0.55, 4.6, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), pivot.arm.rotation.y).add(pivot.group.position);
    anchors[1].pos.copy(armPoint);

    renderer.render(scene, camera);
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    return anchors.map((an) => {
      tmp.copy(an.pos);
      const dx = tmp.x - camera.position.x,
        dz = tmp.z - camera.position.z;
      tmp.y -= bendUniforms.uBend.value * (dx * dx + dz * dz);
      tmp.project(camera);
      return { id: an.id, x: (tmp.x * 0.5 + 0.5) * w, y: (-tmp.y * 0.5 + 0.5) * h, on: tmp.z < 1 };
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
