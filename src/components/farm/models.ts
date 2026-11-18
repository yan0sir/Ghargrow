import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/*
 * Procedural 3D models for the "From sand to harvest" story. Units are metres.
 * Every model faces +X ("forward"); rotation.y = atan2(-dz, dx) points it along (dx, dz).
 */

const UP = new THREE.Vector3(0, 1, 0);
export const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, seg = 6) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg, 1), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
  m.castShadow = true;
  return m;
}

/* ───────────── value noise for dunes / ripples ───────────── */
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
export function noise(x: number, y: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y);
  const xf = x - xi,
    yf = y - yi;
  const u = xf * xf * (3 - 2 * xf),
    w = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi),
    b = hash(xi + 1, yi),
    c = hash(xi, yi + 1),
    d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
}
export function fbm(x: number, y: number, o = 4) {
  let s = 0,
    a = 0.5,
    f = 1;
  for (let i = 0; i < o; i++) {
    s += a * noise(x * f, y * f);
    f *= 2;
    a *= 0.5;
  }
  return s;
}

/* ───────────── desert ───────────── */
function sandTexture(size = 512, grain = 1) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#d8bd8c";
  g.fillRect(0, 0, size, size);
  const img = g.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 34 * grain;
    const warm = Math.random() < 0.04 ? 25 : 0;
    img.data[i] += n + warm;
    img.data[i + 1] += n * 0.9;
    img.data[i + 2] += n * 0.75 - warm * 0.4;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Dune height: flat farm zone in the middle, rolling dunes towards the horizon. */
export function duneHeight(x: number, z: number) {
  const d = Math.hypot(x, z);
  const farm = THREE.MathUtils.smoothstep(d, 150, 260);
  const dunes = Math.pow(fbm(x * 0.006 + 3, z * 0.009), 2.2) * 38 + Math.sin(x * 0.02 + fbm(x * 0.01, z * 0.01) * 6) * 3;
  const ripple = Math.sin(x * 0.35 + z * 0.12 + fbm(x * 0.05, z * 0.05) * 4) * 0.06;
  // ripples are flattened inside the farm zone so the field discs never z-fight with the sand
  return dunes * farm + ripple * (0.05 + 0.95 * farm);
}

export function buildDesert() {
  const g = new THREE.Group();
  const size = 1400;
  const geo = new THREE.PlaneGeometry(size, size, 220, 220);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, duneHeight(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals();
  const tex = sandTexture(512, 1);
  tex.repeat.set(size / 3, size / 3);
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, color: 0xf2dcb0, roughness: 1 }));
  ground.receiveShadow = true;
  g.add(ground);
  return g;
}

/* ───────────── pebbles ───────────── */
/** A weathered stone: subdivided icosahedron pushed around by layered noise, flattened underneath, vertex-coloured. */
function rockGeometry(seed: number, tones: number[]) {
  let geo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, 4);
  geo.deleteAttribute("normal");
  geo.deleteAttribute("uv");
  geo = mergeVertices(geo);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const n = new THREE.Vector3();
  const base = new THREE.Color(tones[seed % tones.length]);
  const alt = new THREE.Color(tones[(seed + 2) % tones.length]);
  const c = new THREE.Color();
  const sx = 0.8 + hash(seed, 1) * 0.6,
    sz = 0.7 + hash(seed, 2) * 0.5;
  for (let i = 0; i < pos.count; i++) {
    n.fromBufferAttribute(pos, i).normalize();
    const lump = fbm(n.x * 1.6 + seed * 7.1, n.y * 1.6 + n.z * 1.3, 3) - 0.5;
    const pit = fbm(n.x * 7 + n.z * 3 + seed, n.y * 7 - n.z * 2, 3) - 0.5;
    // a couple of sharp facets: clamp the radius against random planes
    let r = 1 + lump * 0.55 + pit * 0.12;
    for (let k = 0; k < 3; k++) {
      const a = hash(seed + k, 9) * Math.PI * 2,
        b = hash(seed, k + 4) * 1.2 - 0.3;
      const d = n.x * Math.cos(a) * Math.cos(b) + n.y * Math.sin(b) + n.z * Math.sin(a) * Math.cos(b);
      r = Math.min(r, (0.82 + hash(seed, k + 11) * 0.15) / Math.max(d, 0.05));
    }
    let y = n.y * r;
    if (y < -0.25) y = -0.25 + (y + 0.25) * 0.3; // sits flat in the sand
    pos.setXYZ(i, n.x * r * sx, y * 0.72, n.z * r * sz);
    // mottled mineral colour + darker crevices + bright speckles
    const t = THREE.MathUtils.clamp(fbm(n.x * 3 + seed, n.z * 3 - n.y * 2, 3) * 1.4 - 0.2, 0, 1);
    c.copy(base).lerp(alt, t);
    c.multiplyScalar(0.78 + (pit + 0.5) * 0.4);
    if (hash(i * 1.37, seed) < 0.035) c.lerp(new THREE.Color(0xf4ead6), 0.6);
    if (n.y < -0.1) c.multiplyScalar(0.8); // dusty underside
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/** A small, finely displaced patch of rippled sand + loose grains and pebbles around the ant. */
export function buildMacroSand(center: THREE.Vector3, heading = 0) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(0.9, 0.9, 300, 300);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const fade = 1 - THREE.MathUtils.smoothstep(r, 0.3, 0.44);
    const h = (Math.sin(x * 95 + z * 22 + fbm(x * 12, z * 12) * 5) * 0.5 + 0.5) * 0.0011 + fbm(x * 40, z * 40) * 0.0006 + fbm(x * 160, z * 160) * 0.00018;
    pos.setY(i, h * fade + 0.0004 * fade);
  }
  geo.computeVertexNormals();
  const tex = sandTexture(512, 1.4);
  tex.repeat.set(4, 4);
  const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0xf6e2b8, roughness: 1, transparent: true });
  // soften the patch edge into the big desert
  mat.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vMp;").replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvMp = position.xz;",
    );
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vMp;")
      .replace("#include <dithering_fragment>", "#include <dithering_fragment>\ngl_FragColor.a *= 1.0 - smoothstep(0.32, 0.45, length(vMp));");
  };
  const patch = new THREE.Mesh(geo, mat);
  patch.receiveShadow = true;
  g.add(patch);

  // keep the ant's walking line clear
  const dir = new THREE.Vector2(Math.cos(heading), -Math.sin(heading));
  const onPath = (x: number, z: number, pad: number) => {
    const t = THREE.MathUtils.clamp(x * dir.x + z * dir.y, -0.02, 0.14);
    return Math.hypot(x - dir.x * t, z - dir.y * t) < pad;
  };
  const m = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    s = new THREE.Vector3(),
    p = new THREE.Vector3(),
    col = new THREE.Color();

  // fine sand grains (rounded, quartz-coloured)
  const tones = [0xc89f63, 0xe6cf9e, 0xa9784b, 0xf3e3c0, 0x8d6a45, 0xd9b98a];
  const n = 3200;
  const grain = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ roughness: 0.7 }), n);
  for (let i = 0; i < n; i++) {
    const r = Math.sqrt(Math.random()) * 0.33,
      a = Math.random() * Math.PI * 2;
    const sz = 0.00025 + Math.pow(Math.random(), 3) * 0.0011;
    p.set(Math.cos(a) * r, sz * 0.35, Math.sin(a) * r);
    q.setFromEuler(new THREE.Euler(Math.random() * 3, Math.random() * 3, Math.random() * 3));
    s.set(sz, sz * (0.6 + Math.random() * 0.4), sz * (0.75 + Math.random() * 0.4));
    m.compose(p, q, s);
    grain.setMatrixAt(i, m);
    grain.setColorAt(i, col.setHex(tones[(Math.random() * tones.length) | 0]).multiplyScalar(0.9 + Math.random() * 0.2));
  }
  grain.castShadow = true;
  grain.receiveShadow = true;
  g.add(grain);

  // pebbles and a few stones: 8 unique shapes, instanced, half-buried, each with a dusting of sand at its foot
  const rockTones = [0xa98a68, 0x7d6650, 0xc4ad8c, 0x8f7a63, 0xb59572, 0x6e5a48, 0xd2bfa0];
  const rockMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 });
  const VARIANTS = 8;
  const placed: { x: number; z: number; r: number }[] = [];
  for (let v = 0; v < VARIANTS; v++) {
    const count = v < 2 ? 3 : 9;
    const rock = new THREE.InstancedMesh(rockGeometry(v * 3 + 1, rockTones), rockMat, count);
    let made = 0;
    for (let tries = 0; tries < 400 && made < count; tries++) {
      const big = v < 2;
      const sz = big ? 0.007 + Math.random() * 0.007 : 0.0012 + Math.pow(Math.random(), 2) * 0.004;
      const r = (big ? 0.06 : 0.015) + Math.sqrt(Math.random()) * (big ? 0.22 : 0.29),
        a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r,
        z = Math.sin(a) * r;
      if (onPath(x, z, sz * 1.6 + 0.012)) continue;
      if (placed.some((o) => Math.hypot(o.x - x, o.z - z) < (o.r + sz) * 1.3)) continue;
      placed.push({ x, z, r: sz });
      p.set(x, sz * 0.12, z);
      q.setFromEuler(new THREE.Euler((Math.random() - 0.5) * 0.3, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.3));
      s.setScalar(sz);
      m.compose(p, q, s);
      rock.setMatrixAt(made++, m);
    }
    rock.count = made;
    rock.castShadow = true;
    rock.receiveShadow = true;
    g.add(rock);
  }
  // little sand drifts banked against the windward side of each pebble
  const drift = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: tex, color: 0xf3dfb4, roughness: 1 }),
    placed.length,
  );
  placed.forEach((o, i) => {
    p.set(o.x - o.r * 0.6, 0, o.z + o.r * 0.2);
    q.setFromEuler(new THREE.Euler(0, Math.random() * 0.6, 0));
    s.set(o.r * 1.5, o.r * 0.22, o.r * 1.1);
    m.compose(p, q, s);
    drift.setMatrixAt(i, m);
  });
  drift.receiveShadow = true;
  g.add(drift);

  g.position.copy(center);
  return g;
}

/* ───────────── ant ───────────── */
export type Ant = { group: THREE.Group; legs: THREE.Group[]; antennae: THREE.Group[]; body: THREE.Group };

/** Tapered limb segment from a to b with a ball joint at a. */
function limb(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, mat: THREE.Material) {
  const g = new THREE.Group();
  const len = a.distanceTo(b);
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 10, 4), mat);
  // slight bulge in the middle (femur-like)
  const cp = c.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < cp.count; i++) {
    const t = cp.getY(i) / len + 0.5;
    const k = 1 + Math.sin(t * Math.PI) * 0.18;
    cp.setX(i, cp.getX(i) * k);
    cp.setZ(i, cp.getZ(i) * k);
  }
  c.geometry.computeVertexNormals();
  c.position.copy(a).add(b).multiplyScalar(0.5);
  c.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
  g.add(c);
  const j = new THREE.Mesh(new THREE.SphereGeometry(r0 * 1.12, 10, 8), mat);
  j.position.copy(a);
  g.add(j);
  return g;
}

/** Body segment of revolution along X from a radius profile [x, r][] (ridged tergites etc.). */
function lathe(profile: [number, number][], mat: THREE.Material, sy = 1, sz = 1) {
  const geo = new THREE.LatheGeometry(
    profile.map(([x, r]) => new THREE.Vector2(r, x)),
    40,
  );
  geo.rotateZ(-Math.PI / 2); // lathe axis Y → X
  geo.scale(1, sy, sz);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

export function buildAnt(): Ant {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  const chitin = new THREE.MeshPhysicalMaterial({ color: 0x5a2410, roughness: 0.32, metalness: 0.05, clearcoat: 0.9, clearcoatRoughness: 0.2, sheen: 0.4, sheenColor: new THREE.Color(0xc06a36) });
  const gasterMat = new THREE.MeshPhysicalMaterial({ color: 0x2a0f07, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.3, sheenColor: new THREE.Color(0x9a5a30) });
  const dark = new THREE.MeshPhysicalMaterial({ color: 0x2b1108, roughness: 0.38, clearcoat: 0.6 });
  const leg = new THREE.MeshPhysicalMaterial({ color: 0x55220f, roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.3 });
  const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0806, roughness: 0.15, clearcoat: 1, flatShading: true });
  const H = 0.0034; // body height above sand
  const put = (o: THREE.Object3D, x: number, y: number, z = 0) => (o.position.set(x, y, z), body.add(o), o);

  /* head: wide heart-shaped capsule, flattened top/bottom */
  const headGeo = new THREE.SphereGeometry(0.0017, 36, 24);
  const hp = headGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < hp.count; i++) {
    const x = hp.getX(i),
      y = hp.getY(i),
      z = hp.getZ(i);
    // occipital notch at the back + a wider rear, narrowing to the clypeus
    const back = Math.max(0, -x / 0.0017);
    const notch = Math.exp(-Math.pow(z / 0.0004, 2)) * Math.pow(back, 3) * 0.00025;
    hp.setXYZ(i, x + notch, y * 0.8, z * (1.08 + back * 0.12 - Math.max(0, x / 0.0017) * 0.18));
  }
  headGeo.computeVertexNormals();
  const head = put(new THREE.Mesh(headGeo, chitin), 0.0046, H + 0.0008);
  head.rotation.z = -0.25;
  // clypeus plate
  const clyp = new THREE.Mesh(new THREE.SphereGeometry(0.0007, 16, 12), chitin);
  clyp.scale.set(0.6, 0.5, 1.1);
  put(clyp, 0.0061, H + 0.0004);
  // faceted compound eyes
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.IcosahedronGeometry(0.0005, 2), eyeMat);
    e.scale.set(1.2, 0.9, 0.7);
    put(e, 0.0049, H + 0.0012, s * 0.00148);
    // ocelli-like glint
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.00008, 6, 6), new THREE.MeshBasicMaterial({ color: 0x6a5a50 }));
    put(gl, 0.0050, H + 0.00145, s * 0.00165);
  }
  /* mandibles: curved toothed blades */
  for (const s of [-1, 1]) {
    const pts = [v3(0.0060, H + 0.0002, s * 0.00075), v3(0.0068, H - 0.0001, s * 0.0007), v3(0.0073, H - 0.0002, s * 0.0002)];
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.00014, 6), dark);
    body.add(m);
    for (let k = 0; k < 4; k++) {
      const t = 0.45 + k * 0.15;
      const at = new THREE.CatmullRomCurve3(pts).getPoint(t);
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.00006, 0.00018, 5), dark);
      tooth.position.copy(at);
      tooth.rotation.x = s * Math.PI * 0.5;
      body.add(tooth);
    }
  }

  /* antennae: long scape, elbow, 11-segment funiculus ending in a club */
  const antennae: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group();
    a.position.set(0.0057, H + 0.0012, s * 0.0006);
    const elbow = v3(0.0004, 0.0029, s * 0.0013);
    a.add(limb(v3(0, 0, 0), elbow, 0.00011, 0.00013, leg));
    let prev = elbow;
    for (let k = 0; k < 11; k++) {
      const t = (k + 1) / 11;
      const next = v3(elbow.x + t * 0.0040, elbow.y + Math.sin(t * Math.PI * 0.8) * 0.0006 - t * 0.0006, s * (0.0013 + t * 0.0012));
      const r = 0.000085 + (k > 7 ? (k - 7) * 0.00003 : 0);
      a.add(limb(prev, next, r, r * 0.9, leg));
      prev = next;
    }
    body.add(a);
    antennae.push(a);
  }

  /* mesosoma: pronotum hump, mesonotum, propodeum with paired spines */
  put(lathe([[-0.0004, 0], [-0.0003, 0.0006], [0, 0.001], [0.0005, 0.0011], [0.001, 0.0009], [0.0013, 0.0004], [0.0014, 0]], chitin, 1.05, 0.95), 0.0023, H + 0.0005);
  put(lathe([[-0.0008, 0], [-0.0006, 0.0005], [-0.0002, 0.0007], [0.0003, 0.00075], [0.0007, 0.0006], [0.0009, 0]], chitin, 0.95, 0.85), 0.0009, H + 0.0003);
  for (const s of [-1, 1]) body.add(rod(v3(-0.0001, H + 0.0007, s * 0.0002), v3(-0.0005, H + 0.0014, s * 0.0004), 0.00006, chitin, 5));

  /* petiole: stalk + upright scale-like node */
  body.add(rod(v3(-0.0002, H + 0.0002, 0), v3(-0.0016, H + 0.0003, 0), 0.00018, dark, 8));
  const node = new THREE.Mesh(new THREE.SphereGeometry(0.0005, 18, 14), chitin);
  node.scale.set(0.55, 1.35, 1);
  put(node, -0.0010, H + 0.0008);

  /* gaster: smooth teardrop with faint tergite seams, glossy */
  const gp: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40; // 0 = tip (rear), 1 = front
    const x = -0.003 + t * 0.0054;
    let r = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.75)), 0.6) * 0.0023;
    r *= 1 - 0.035 * Math.pow(Math.abs(Math.sin(t * Math.PI * 4.2)), 12); // tergite seams
    gp.push([x, Math.max(r, 0.00001)]);
  }
  const gaster = lathe(gp, gasterMat, 0.86, 1.0);
  gaster.rotation.z = 0.2;
  put(gaster, -0.0043, H + 0.0009);

  /* setae: fine golden hairs on gaster + head */
  const hair: number[] = [];
  const addHairs = (cx: number, cy: number, rx: number, ry: number, rz: number, count: number, len: number) => {
    for (let i = 0; i < count; i++) {
      const u = Math.random() * Math.PI * 2,
        v = Math.acos(Math.random() * 1.6 - 0.6);
      const nx = Math.sin(v) * Math.cos(u),
        ny = Math.cos(v),
        nz = Math.sin(v) * Math.sin(u);
      const x = cx + nx * rx,
        y = cy + ny * ry,
        z = nz * rz;
      hair.push(x, y, z, x + nx * len * 0.4 - len * 0.6, y + ny * len, z + nz * len * 0.5);
    }
  };
  addHairs(-0.0043, H + 0.0009, 0.0025, 0.0021, 0.0025, 110, 0.00035);
  addHairs(0.0046, H + 0.0008, 0.0016, 0.0013, 0.0018, 40, 0.0004);
  addHairs(0.0018, H + 0.0006, 0.0012, 0.0009, 0.0009, 30, 0.0003);
  const hg = new THREE.BufferGeometry();
  hg.setAttribute("position", new THREE.Float32BufferAttribute(hair, 3));
  body.add(new THREE.LineSegments(hg, new THREE.LineBasicMaterial({ color: 0xa8743f, transparent: true, opacity: 0.32 })));

  /* legs: coxa → trochanter → femur (up and out) → tibia (down) → 5-segment tarsus + claws */
  const legs: THREE.Group[] = [];
  const hips = [0.0026, 0.0012, 0.0001];
  hips.forEach((hx, k) => {
    for (const s of [-1, 1]) {
      const hip = new THREE.Group();
      hip.position.set(hx, H - 0.0001, s * 0.0005);
      const spread = [0.0018, 0.0002, -0.0024][k];
      const len = [0.92, 1, 1.12][k];
      const coxa = v3(spread * 0.15, -0.0006, s * 0.0007);
      const troch = v3(spread * 0.25, -0.0005, s * 0.0011);
      const knee = v3(spread * 0.7, 0.0013 * len, s * 0.0039 * len);
      const ankle = v3(spread * 1.1, -H + 0.0006, s * 0.0062 * len);
      hip.add(limb(v3(0, 0, 0), coxa, 0.00028, 0.00024, chitin));
      hip.add(limb(coxa, troch, 0.00022, 0.0002, leg));
      hip.add(limb(troch, knee, 0.00027, 0.00018, leg));
      hip.add(limb(knee, ankle, 0.00015, 0.0001, leg));
      // tibial spur
      hip.add(rod(ankle, ankle.clone().add(v3(-0.0002, 0.00005, -s * 0.0002)), 0.00003, dark, 4));
      let prev = ankle;
      for (let t = 0; t < 5; t++) {
        const next = prev.clone().add(v3(spread > 0 ? 0.00022 : -0.00012, -0.00012 + t * 0.00001, s * 0.00026));
        if (next.y < -H + 0.00004) next.y = -H + 0.00004;
        hip.add(limb(prev, next, 0.00008, 0.00007, leg));
        prev = next;
      }
      for (const c of [-1, 1]) hip.add(rod(prev, prev.clone().add(v3(0.00008, -0.00004, c * 0.00008)), 0.00002, dark, 4));
      // leg hairs
      const lh: number[] = [];
      for (let i = 0; i < 10; i++) {
        const t = Math.random();
        const at = knee.clone().lerp(ankle, t);
        lh.push(at.x, at.y, at.z, at.x - 0.0001, at.y - 0.00018, at.z + s * 0.0001);
      }
      const lg = new THREE.BufferGeometry();
      lg.setAttribute("position", new THREE.Float32BufferAttribute(lh, 3));
      hip.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xa8743f, transparent: true, opacity: 0.3 })));
      hip.userData = { side: s, pair: k };
      body.add(hip);
      legs.push(hip);
    }
  });
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true;
  });
  return { group, legs, antennae, body };
}

/** Tripod gait: L1-R2-L3 swing while R1-L2-R3 stand, and vice versa. */
export function animateAnt(ant: Ant, t: number, speed: number) {
  const f = t * 9 * speed;
  ant.legs.forEach((leg) => {
    const { side, pair } = leg.userData as { side: number; pair: number };
    const phase = (pair % 2 === 0 ? 0 : Math.PI) + (side > 0 ? Math.PI : 0);
    const c = Math.sin(f + phase);
    leg.rotation.y = c * 0.34 * side;
    leg.rotation.x = Math.max(0, Math.cos(f + phase)) * 0.24 * side; // lift during swing
  });
  ant.antennae.forEach((a, i) => {
    a.rotation.z = Math.sin(t * 5 + i * 1.7) * 0.16;
    a.rotation.y = Math.sin(t * 3.3 + i) * 0.2;
  });
  ant.body.position.y = Math.abs(Math.sin(f)) * 0.0001;
  ant.body.rotation.x = Math.sin(f * 2) * 0.015;
  ant.body.rotation.z = Math.sin(f) * 0.01;
}

/* ───────────── centre pivot ───────────── */
export type Pivot = { group: THREE.Group; arm: THREE.Group; wheels: THREE.Object3D[]; spray: THREE.Points; mist: THREE.MeshBasicMaterial; R: number };

/** Sprinkler drop positions along the arm (metres from the centre). */
const DROPS = (R: number) => {
  const out: number[] = [];
  for (let x = 2.5; x <= R + 2.6; x += 2.5) out.push(x);
  return out;
};
const NOZZLE_Y = 1.25; // spinner heads hang ~1.25 m above ground
const SPRAY_R = 1.7; // wetted radius of each head

export function buildPivot(R: number): Pivot {
  const group = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: 0x30353a, metalness: 0.6, roughness: 0.45 });
  const galv = new THREE.MeshStandardMaterial({ color: 0xc8ccd0, metalness: 0.85, roughness: 0.3 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1b1b1a, roughness: 0.9 });
  const rim = new THREE.MeshStandardMaterial({ color: 0x8c9196, metalness: 0.6, roughness: 0.4 });
  const top = 4.2;
  // centre tower
  const corners = [v3(1.5, 0, 1.5), v3(-1.5, 0, 1.5), v3(-1.5, 0, -1.5), v3(1.5, 0, -1.5)];
  corners.forEach((c) => group.add(rod(c, v3(c.x * 0.1, top, c.z * 0.1), 0.06, steel)));
  for (let i = 1; i < 5; i++) {
    const t = i * 0.2;
    const ring = corners.map((c) => c.clone().lerp(v3(c.x * 0.1, top, c.z * 0.1), t));
    ring.forEach((p, k) => group.add(rod(p, ring[(k + 1) % 4], 0.03, steel)));
  }
  group.add(rod(v3(0, 0, 0), v3(0, top + 0.6, 0), 0.12, galv, 12));
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.3), new THREE.MeshStandardMaterial({ color: 0xbfc4c7, metalness: 0.4, roughness: 0.5 }));
  box.position.set(0, 1.6, 0.4);
  group.add(box);
  // rotating arm
  const arm = new THREE.Group();
  arm.position.y = 0;
  const wheels: THREE.Object3D[] = [];
  const pipeY = (x: number) => top + Math.sin((Math.PI * x) / R) * 0.25 * (x < R ? 1 : 0);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = 0.4 + ((R + 3 - 0.4) * i) / 40;
    pts.push(v3(x, pipeY(x), 0));
  }
  arm.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 100, 0.09, 8), galv));
  const towersX = [R / 3, (2 * R) / 3, R];
  let prev = 0.4;
  towersX.forEach((tx) => {
    // truss under each span
    for (const s of [-1, 1]) {
      const tp: THREE.Vector3[] = [];
      for (let i = 0; i <= 12; i++) {
        const x = prev + ((tx - prev) * i) / 12;
        const k = Math.sin((Math.PI * i) / 12);
        tp.push(v3(x, pipeY(x) - 0.25 - k * 1.3, s * (0.15 + k * 1.0)));
      }
      arm.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tp), 40, 0.02, 4), galv));
      for (let i = 1; i < 4; i++) {
        const x = prev + ((tx - prev) * i) / 4;
        const k = Math.sin((Math.PI * i) / 4);
        arm.add(rod(v3(x, pipeY(x), 0), v3(x, pipeY(x) - 0.25 - k * 1.3, s * (0.15 + k * 1.0)), 0.02, galv, 4));
      }
    }
    // A-frame drive tower
    const ty = pipeY(tx);
    for (const s of [-1, 1]) {
      arm.add(rod(v3(tx, ty, s * 0.15), v3(tx, 0.85, s * 2.0), 0.06, steel));
      arm.add(rod(v3(tx - 1.2, pipeY(tx - 1.2) - 0.1, 0), v3(tx, 1.5, s * 1.7), 0.035, steel));
      const wheel = new THREE.Group();
      const spin = new THREE.Group();
      const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.17, 10, 22), rubber);
      spin.add(tyre);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.28, 16), rim);
      hub.rotation.x = Math.PI / 2;
      spin.add(hub);
      wheel.add(spin);
      wheel.rotation.y = Math.PI / 2; // rolls tangentially
      wheel.position.set(tx, 0.67, s * 2.0);
      wheels.push(spin);
      arm.add(wheel);
    }
    arm.add(rod(v3(tx, 0.85, -2.0), v3(tx, 0.85, 2.0), 0.07, steel));
    prev = tx;
  });
  // overhang end gun
  const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.7, 8), steel);
  gun.position.set(R + 3.2, pipeY(R) + 0.2, 0);
  gun.rotation.z = -Math.PI / 3;
  arm.add(gun);
  // drop hoses every 2.5 m (orange flexible hose, weight + spinner head ~1.2 m above the crop)
  const hose = new THREE.MeshStandardMaterial({ color: 0xd2532a, roughness: 0.6 });
  const head = new THREE.MeshStandardMaterial({ color: 0x2b2e31, metalness: 0.3, roughness: 0.5 });
  for (const x of DROPS(R)) {
    arm.add(rod(v3(x, pipeY(x) - 0.08, 0), v3(x, NOZZLE_Y + 0.22, 0), 0.025, hose, 6));
    const weight = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 10), galv);
    weight.position.set(x, NOZZLE_Y + 0.13, 0);
    arm.add(weight);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.05, 0.05, 14), head);
    plate.position.set(x, NOZZLE_Y, 0);
    arm.add(plate);
  }
  // spray: droplets along the arm (animated in the shader, in arm space)
  const n = Math.round(R * 70);
  const geo = new THREE.BufferGeometry();
  const ax = new Float32Array(n * 3),
    seed = new Float32Array(n * 2);
  const drops = DROPS(R);
  for (let i = 0; i < n; i++) {
    // every droplet leaves one of the sprinkler heads hanging under the pipe
    ax[i * 3] = drops[(Math.random() * drops.length) | 0];
    ax[i * 3 + 1] = NOZZLE_Y;
    seed[i * 2] = Math.random();
    seed[i * 2 + 1] = Math.random();
  }
  geo.setAttribute("position", new THREE.BufferAttribute(ax, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
  const spray = new THREE.Points(geo, sprayMaterial());
  spray.frustumCulled = false;
  arm.add(spray);
  arm.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  group.add(arm);
  group.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  // soft mist umbrella under each sprinkler head (apex at the nozzle; all share one material so they fade together)
  // alpha fades from the nozzle down to nothing at the crop so it reads as a veil of spray, not a solid cone
  const fadeCanvas = document.createElement("canvas");
  fadeCanvas.width = 4;
  fadeCanvas.height = 64;
  const fg = fadeCanvas.getContext("2d")!;
  const grad = fg.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, "#555");
  grad.addColorStop(0.12, "#fff");
  grad.addColorStop(0.5, "#666");
  grad.addColorStop(1, "#000");
  fg.fillStyle = grad;
  fg.fillRect(0, 0, 4, 64);
  const mist = new THREE.MeshBasicMaterial({
    color: 0xe6f4ff,
    alphaMap: new THREE.CanvasTexture(fadeCanvas),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const umbrella = new THREE.ConeGeometry(SPRAY_R, NOZZLE_Y - 0.1, 32, 1, true);
  umbrella.translate(0, -(NOZZLE_Y - 0.1) / 2, 0); // apex at origin, skirt down at the crop
  for (const x of drops) {
    const cone = new THREE.Mesh(umbrella, mist);
    cone.position.set(x, NOZZLE_Y, 0);
    arm.add(cone);
  }
  return { group, arm, wheels, spray, mist, R };
}

export function sprayMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uOn: { value: 0 }, uPx: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec2 aSeed;
      uniform float uTime; uniform float uPx;
      varying float vA;
      #include <common>
      #include <logdepthbuf_pars_vertex>
      void main(){
        float t = fract(uTime*1.1 + aSeed.x);
        float ang = aSeed.y * 6.2831853 + uTime * 2.4;       // spinner plate rotates
        float reach = 1.7 * (0.55 + 0.45 * fract(aSeed.x * 17.0)); // droplet size → throw distance
        vec3 p = position;
        float r = reach * (1.0 - (1.0 - t) * (1.0 - t));      // thrown out fast, slows as it falls
        p.x += cos(ang) * r;
        p.z += sin(ang) * r;
        p.y = position.y + 0.12 * t - 1.17 * t * t;            // short rise, then droops onto the crop
        vA = smoothstep(0.0, 0.08, t) * (1.0 - t) * 0.9;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uPx * 70.0 / -mv.z;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOn; varying float vA;
      #include <common>
      #include <logdepthbuf_pars_fragment>
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(0.86, 0.94, 1.0, vA * uOn * (1.0 - d*2.0));
        #include <logdepthbuf_fragment>
      }`,
  });
}

/* ───────────── wheat ───────────── */
const RIN_WHEAT = 8.5; // bare pad around the pivot centre (the harvest stops at RIN)
export function buildWheat(R: number, spacing: number) {
  // one tuft = 6 stalks with heads; attribute aTop (0 base → 1 tip) and aHead (1 on ear vertices)
  const parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + Math.random(),
      r = 0.05 + Math.random() * 0.16;
    const ox = Math.cos(a) * r,
      oz = Math.sin(a) * r;
    const h = 0.72 + Math.random() * 0.18;
    const tilt = (Math.random() - 0.5) * 0.18;
    const stalk = new THREE.CylinderGeometry(0.004, 0.006, h, 3, 1, true);
    stalk.translate(0, h / 2, 0);
    const ear = new THREE.CylinderGeometry(0.011, 0.017, 0.12, 4, 1, true);
    ear.translate(0, h + 0.05, 0);
    for (const [geo, isHead] of [
      [stalk, 0],
      [ear, 1],
    ] as const) {
      geo.rotateZ(tilt);
      geo.rotateY(a);
      geo.translate(ox, 0, oz);
      const n = geo.attributes.position.count;
      const top = new Float32Array(n),
        head = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        top[i] = Math.min(1, Math.max(0, geo.attributes.position.getY(i) / 0.9));
        head[i] = isHead;
      }
      geo.setAttribute("aTop", new THREE.BufferAttribute(top, 1));
      geo.setAttribute("aHead", new THREE.BufferAttribute(head, 1));
      const ni = geo.toNonIndexed();
      parts.push(ni);
    }
    // two leaves
    for (let l = 0; l < 2; l++) {
      const leaf = new THREE.PlaneGeometry(0.03, 0.34, 1, 2);
      const p = leaf.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i) + 0.17;
        p.setXYZ(i, p.getX(i) * (1 - y / 0.34), y, y * y * 0.9);
      }
      leaf.rotateY(a + l * Math.PI + 0.4);
      leaf.translate(ox, 0.08 + l * 0.12, oz);
      const n = leaf.attributes.position.count;
      const top = new Float32Array(n).fill(0.3),
        head = new Float32Array(n);
      leaf.setAttribute("aTop", new THREE.BufferAttribute(top, 1));
      leaf.setAttribute("aHead", new THREE.BufferAttribute(head, 1));
      leaf.deleteAttribute("uv");
      parts.push(leaf.toNonIndexed());
    }
  }
  parts.forEach((p) => p.deleteAttribute("uv"));
  const tuft = mergeGeometries(parts)!;
  tuft.computeVertexNormals();

  // concentric pivot rows
  const pos: number[] = [];
  for (let r = RIN_WHEAT; r < R; r += spacing) {
    const count = Math.floor((2 * Math.PI * r) / spacing);
    const off = Math.random() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const a = off + (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.02;
      const rr = r + (Math.random() - 0.5) * spacing * 0.4;
      pos.push(rr, ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2));
    }
  }
  const n = pos.length / 2;
  const mesh = new THREE.InstancedMesh(tuft, wheatMaterial(R), n);
  const rand = new Float32Array(n),
    polar = new Float32Array(n * 2);
  const m = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    s = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const r = pos[i * 2],
      a = pos[i * 2 + 1];
    q.setFromAxisAngle(UP, Math.random() * Math.PI * 2);
    const sc = 0.85 + Math.random() * 0.3;
    s.set(sc, sc, sc);
    m.compose(v3(Math.cos(a) * r, 0, Math.sin(a) * r), q, s);
    mesh.setMatrixAt(i, m);
    rand[i] = Math.random();
    polar[i * 2] = r;
    polar[i * 2 + 1] = a;
  }
  mesh.geometry.setAttribute("aRand", new THREE.InstancedBufferAttribute(rand, 1));
  mesh.geometry.setAttribute("aPolar", new THREE.InstancedBufferAttribute(polar, 2));
  mesh.frustumCulled = false;
  return mesh;
}

const HARVEST_GLSL = /* glsl */ `
  // spiral harvest: the combine cuts N rings from the outside in; s in [0,1]
  float harvestParam(float d, float a, float R, float N){
    float ringW = (R - 9.0) / N; // keep in sync with RIN
    float ring = clamp(floor((R - d) / ringW), 0.0, N - 1.0);
    return (ring + a / 6.2831853) / N;
  }`;

export function wheatMaterial(R: number) {
  return new THREE.ShaderMaterial({
    fog: true,
    uniforms: {
      ...THREE.UniformsLib.fog,
      uGrow: { value: 0 },
      uGold: { value: 0 },
      uCut: { value: 0 },
      uR: { value: R },
      uN: { value: 5 },
      uTime: { value: 0 },
      uWind: { value: 1 },
      uSun: { value: new THREE.Vector3(0, 1, 0) },
      uDay: { value: 1 },
      uLush: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aRand; attribute vec2 aPolar; attribute float aTop; attribute float aHead;
      uniform float uGrow, uCut, uR, uN, uTime, uWind;
      varying float vTop, vHead, vG, vCut, vR, vHeadShow; varying vec3 vN;
      #include <common>
      #include <fog_pars_vertex>
      #include <logdepthbuf_pars_vertex>
      ${HARVEST_GLSL}
      void main(){
        float g = clamp(uGrow * 1.35 - aRand * 0.35, 0.0, 1.0);
        float cut = (uCut > 0.0001 && harvestParam(aPolar.x, aPolar.y, uR, uN) < uCut) ? 1.0 : 0.0;
        vec3 p = position;
        float h = mix(0.04, 1.0, g);
        h = mix(h, min(h, 0.13), cut);
        p.y *= h;
        p.xz *= mix(0.45, 1.0, g);
        float sway = sin(uTime * 1.7 + aRand * 12.0 + aPolar.x * 0.4) * 0.07 * uWind * aTop * aTop * g * (1.0 - cut);
        p.x += sway; p.z += sway * 0.5;
        vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        vTop = aTop; vHead = aHead; vG = g; vCut = cut; vR = aRand;
        vHeadShow = smoothstep(0.55, 0.8, g) * (1.0 - cut);
        vN = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        #include <logdepthbuf_vertex>
        vec4 mvPosition = mv;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform float uGold, uDay, uLush; uniform vec3 uSun;
      varying float vTop, vHead, vG, vCut, vR, vHeadShow; varying vec3 vN;
      #include <common>
      #include <fog_pars_fragment>
      #include <logdepthbuf_pars_fragment>
      void main(){
        if (vHead > 0.5 && vHeadShow < 0.5) discard;
        vec3 young = vec3(0.42, 0.66, 0.2);
        vec3 green = vec3(0.24, 0.47, 0.12);
        vec3 gold  = vec3(0.87, 0.69, 0.32);
        vec3 c = mix(young, green, vG);
        c = mix(c, gold * (0.88 + 0.24 * vR), clamp(uGold * (0.75 + 0.5 * vR), 0.0, 1.0));
        if (vHead > 0.5) c = mix(c, mix(vec3(0.52, 0.62, 0.26), vec3(0.95, 0.79, 0.43), uGold), 0.85);
        c = mix(c, vec3(0.8, 0.69, 0.45), vCut);
        // finale: everything turns a deep, lush green
        c = mix(c, mix(vec3(0.2, 0.5, 0.1), vec3(0.36, 0.7, 0.18), vR), uLush);
        c *= mix(0.5, 1.05, vTop);
        vec3 n = normalize(vN);
        float l = abs(dot(n, normalize(uSun)));
        c *= (0.42 + 0.78 * l * uDay) * mix(0.28, 1.0, uDay);
        gl_FragColor = vec4(c, 1.0);
        #include <logdepthbuf_fragment>
        #include <fog_fragment>
      }`,
  });
}

/** Watered field disc: wet sector follows the pivot sweep, then green → gold, then stubble behind the combine. */
export function fieldMaterial(R: number) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: true,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    uniforms: {
      ...THREE.UniformsLib.fog,
      uSweep: { value: 0 },
      uGreen: { value: 0 },
      uGold: { value: 0 },
      uCut: { value: 0 },
      uR: { value: R },
      uN: { value: 5 },
      uDay: { value: 1 },
      uLush: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      #include <common>
      #include <fog_pars_vertex>
      #include <logdepthbuf_pars_vertex>
      void main(){
        vP = position.xy;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <logdepthbuf_vertex>
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform float uSweep, uGreen, uGold, uCut, uR, uN, uDay, uLush;
      varying vec2 vP;
      #include <common>
      #include <fog_pars_fragment>
      #include <logdepthbuf_pars_fragment>
      ${HARVEST_GLSL}
      void main(){
        float d = length(vP);
        float a = atan(-vP.y, vP.x); if (a < 0.0) a += 6.2831853;
        float wet = uSweep >= 6.2831 ? 1.0 : smoothstep(0.0, 0.06, uSweep - a);
        float edge = 1.0 - smoothstep(uR + 0.5, uR + 3.0, d);
        float alpha = wet * edge;
        if (alpha < 0.01) discard;
        vec3 soil = vec3(0.45, 0.32, 0.2);
        vec3 c = mix(soil, vec3(0.27, 0.36, 0.14), uGreen);
        c = mix(c, vec3(0.6, 0.5, 0.27), uGold);
        float cut = (uCut > 0.0001 && harvestParam(d, a, uR, uN) < uCut) ? 1.0 : 0.0;
        c = mix(c, vec3(0.78, 0.67, 0.43), cut);
        c = mix(c, vec3(0.22, 0.5, 0.12), uLush);
        c *= 0.9 + 0.1 * sin(d * 5.7);
        // wheel tracks
        for (int i = 1; i <= 3; i++) { float tr = uR * float(i) / 3.0; c *= 1.0 - 0.25 * (1.0 - smoothstep(0.0, 0.5, abs(d - tr - 2.0))); }
        c *= mix(0.3, 1.0, uDay);
        gl_FragColor = vec4(c, alpha);
        #include <logdepthbuf_fragment>
        #include <fog_fragment>
      }`,
  });
}

/* ───────────── machines: CLAAS-style AXION tractor, combine, grain cart ───────────── */
export type Machine = { group: THREE.Group; wheels: THREE.Object3D[]; reel?: THREE.Object3D };

const LIME = 0xb5c920;
const ORANGE_RED = 0xe2492b;
const limePaint = () => new THREE.MeshPhysicalMaterial({ color: LIME, roughness: 0.34, metalness: 0.15, clearcoat: 0.7, clearcoatRoughness: 0.25 });
const blackPaint = () => new THREE.MeshStandardMaterial({ color: 0x17191a, roughness: 0.5, metalness: 0.3 });
const whitePaint = () => new THREE.MeshPhysicalMaterial({ color: 0xf3f3ef, roughness: 0.35, clearcoat: 0.5 });
const tintGlass = () =>
  new THREE.MeshPhysicalMaterial({ color: 0x1d2a2e, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.42, clearcoat: 1, side: THREE.DoubleSide });

/** Lug-tread agricultural tyre on a red-orange dished rim. Rolls around local Z. */
export function agWheel(radius: number, width: number) {
  const g = new THREE.Group();
  const spin = new THREE.Group();
  g.add(spin);
  const rubber = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.92 });
  const ri = radius * 0.6;
  // carcass: rounded-rectangle profile lathed around Y, then turned to roll around Z
  const prof = [
    new THREE.Vector2(ri, -width / 2),
    new THREE.Vector2(radius - 0.1, -width / 2),
    new THREE.Vector2(radius - 0.025, -width / 2 + 0.06),
    new THREE.Vector2(radius, -width / 2 + 0.14),
    new THREE.Vector2(radius, width / 2 - 0.14),
    new THREE.Vector2(radius - 0.025, width / 2 - 0.06),
    new THREE.Vector2(radius - 0.1, width / 2),
    new THREE.Vector2(ri, width / 2),
  ];
  const carcass = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), rubber);
  carcass.rotation.x = Math.PI / 2;
  spin.add(carcass);
  // chevron lugs (instanced), alternating halves
  const N = Math.round(radius * 30);
  const lug = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, radius * 0.13, width * 0.52), rubber, N * 2);
  const d = new THREE.Object3D();
  for (let i = 0; i < N * 2; i++) {
    const half = i % 2 ? 1 : -1;
    const a = ((Math.floor(i / 2) + (half > 0 ? 0.5 : 0)) / N) * Math.PI * 2;
    d.position.set(Math.cos(a) * (radius + 0.015), Math.sin(a) * (radius + 0.015), half * width * 0.24);
    d.rotation.set(0, 0, a);
    d.rotateX(half * 0.5);
    d.updateMatrix();
    lug.setMatrixAt(i, d.matrix);
  }
  spin.add(lug);
  // rim: barrel, dished disc with holes, hub, bolts
  const red = new THREE.MeshPhysicalMaterial({ color: ORANGE_RED, roughness: 0.38, clearcoat: 0.6 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(ri, ri, width * 0.92, 40, 1, true), red);
  barrel.rotation.x = Math.PI / 2;
  barrel.material.side = THREE.DoubleSide;
  spin.add(barrel);
  for (const s of [-1, 1]) {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(ri * 0.98, 40), red);
    disc.position.z = s * width * 0.18;
    if (s < 0) disc.rotation.y = Math.PI;
    spin.add(disc);
    const holes = new THREE.InstancedMesh(new THREE.CircleGeometry(ri * 0.06, 12), new THREE.MeshBasicMaterial({ color: 0x2a0d06 }), 10);
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      d.position.set(Math.cos(a) * ri * 0.66, Math.sin(a) * ri * 0.66, s * (width * 0.18 + 0.002));
      d.rotation.set(0, s < 0 ? Math.PI : 0, 0);
      d.updateMatrix();
      holes.setMatrixAt(k, d.matrix);
    }
    spin.add(holes);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(ri * 0.3, ri * 0.34, 0.16, 20), new THREE.MeshStandardMaterial({ color: 0x2b2d2e, metalness: 0.6, roughness: 0.4 }));
    hub.rotation.x = Math.PI / 2;
    hub.position.z = s * (width * 0.18 + 0.07);
    spin.add(hub);
    const bolts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 6), new THREE.MeshStandardMaterial({ color: 0x9a9da0, metalness: 0.8, roughness: 0.3 }), 8);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      d.position.set(Math.cos(a) * ri * 0.22, Math.sin(a) * ri * 0.22, s * (width * 0.18 + 0.16));
      d.rotation.set(Math.PI / 2, 0, 0);
      d.updateMatrix();
      bolts.setMatrixAt(k, d.matrix);
    }
    spin.add(bolts);
  }
  g.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  return { g, spin };
}

/** Arc fender (annulus sector in X-Y, extruded along Z). */
function fender(rOuter: number, thick: number, a0: number, a1: number, width: number, mat: THREE.Material) {
  const s = new THREE.Shape();
  s.absarc(0, 0, rOuter, a0, a1, false);
  s.absarc(0, 0, rOuter - thick, a1, a0, true);
  const geo = new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 32 });
  geo.translate(0, 0, -width / 2);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  return m;
}

/** White model panel with "CLAAS"-style red wordmark and a model line, as a decal plane. */
function badge(model: string, line: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 200;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f6f6f2";
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(512, 0);
  g.lineTo(512, 200);
  g.lineTo(60, 200);
  g.quadraticCurveTo(0, 200, 0, 140);
  g.closePath();
  g.fill();
  g.fillStyle = "#d4202a";
  g.font = "italic 900 92px Arial Black, Arial, sans-serif";
  g.fillText("CLAAS", 40, 98);
  g.fillStyle = "#1c1c1c";
  g.font = "300 34px Arial, sans-serif";
  g.fillText(line, 196, 140);
  g.font = "600 52px Arial, sans-serif";
  g.fillText(model, 150, 186);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.45, polygonOffset: true, polygonOffsetFactor: -2 });
}

function ventTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#121314";
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = "#3a3d3f";
  for (let x = 6; x < 128; x += 16) g.fillRect(x, 6, 6, 116);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 });
}

/** CLAAS AXION-style tractor, ~5.3 m long, 3.1 m high. Rear axle at x = 0, faces +X. */
export function buildAxion(): Machine {
  const group = new THREE.Group();
  const lime = limePaint();
  const black = blackPaint();
  const white = whitePaint();
  const glass = tintGlass();
  const steel = new THREE.MeshStandardMaterial({ color: 0x3a3e41, roughness: 0.45, metalness: 0.6 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xb9bdc0, roughness: 0.25, metalness: 0.9 });
  const add = <T extends THREE.Object3D>(o: T) => (group.add(o), o);
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z = 0, r = 0.04) => {
    const geo = r > 0 ? new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) - 0.001) : new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    return add(mesh);
  };

  // chassis / engine block / fuel tank & steps
  box(3.5, 0.32, 0.72, steel, 1.85, 0.92, 0, 0.03);
  box(1.0, 0.45, 0.6, black, 2.6, 0.75, 0, 0.05);
  for (const s of [-1, 1]) {
    box(0.72, 1.05, 0.16, black, 0.9, 1.05, s * 0.63, 0.03);
    for (let k = 0; k < 3; k++) box(0.42, 0.03, 0.2, steel, 0.95, 0.62 + k * 0.32, s * 0.72, 0);
  }

  // hood: sculpted side profile, extruded and bevelled
  const hp = new THREE.Shape();
  hp.moveTo(1.3, 1.08);
  hp.lineTo(3.78, 1.08);
  hp.quadraticCurveTo(3.98, 1.1, 3.98, 1.32);
  hp.lineTo(3.95, 1.78);
  hp.quadraticCurveTo(3.9, 2.0, 3.62, 2.03);
  hp.lineTo(1.3, 2.16);
  hp.closePath();
  const hoodGeo = new THREE.ExtrudeGeometry(hp, { depth: 0.94, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 5, curveSegments: 16 });
  hoodGeo.translate(0, 0, -0.47);
  const hood = add(new THREE.Mesh(hoodGeo, lime));
  hood.castShadow = true;
  // black grille nose with four round lights
  box(0.12, 0.62, 0.92, black, 4.0, 1.5, 0, 0.06);
  for (const z of [-0.33, -0.17, 0.17, 0.33]) {
    const l = add(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 20), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3d0, emissiveIntensity: 0.6, roughness: 0.1 })));
    l.rotation.z = Math.PI / 2;
    l.position.set(4.07, 1.66, z);
  }
  box(0.62, 0.3, 1.04, black, 3.62, 1.2, 0, 0.05); // lower front panel
  // side vents, badge and black lower hood band on both sides
  const vents = ventTexture();
  const plate = badge("AXION", "820");
  for (const s of [-1, 1]) {
    const v = add(new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.34), vents));
    v.position.set(3.05, 1.78, s * 0.556);
    v.rotation.y = s < 0 ? Math.PI : 0;
    const b = add(new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.34), plate));
    b.position.set(2.2, 1.62, s * 0.557);
    b.rotation.y = s < 0 ? Math.PI : 0;
  }

  // cab: black frame, tinted glass, white rounded roof, beacon, mirrors
  const cx0 = -0.28,
    cx1 = 1.32,
    cy0 = 1.62,
    cy1 = 3.02,
    cz = 0.66;
  box(cx1 - cx0, 0.36, cz * 2, black, (cx0 + cx1) / 2, cy0 + 0.18, 0, 0.05);
  const g2 = add(new THREE.Mesh(new THREE.BoxGeometry(cx1 - cx0 - 0.08, cy1 - cy0 - 0.4, cz * 2 - 0.08), glass));
  g2.position.set((cx0 + cx1) / 2, (cy0 + 0.36 + cy1) / 2, 0);
  for (const x of [cx0 + 0.04, 0.55, cx1 - 0.04])
    for (const s of [-1, 1]) box(0.08, cy1 - cy0 - 0.2, 0.08, black, x, (cy0 + cy1) / 2 + 0.08, s * (cz - 0.04), 0.02);
  box(0.06, 0.06, cz * 2, black, cx1 - 0.04, cy1 - 0.08, 0, 0);
  box(1.88, 0.2, cz * 2 + 0.26, white, (cx0 + cx1) / 2 + 0.06, cy1 + 0.1, 0, 0.09);
  box(0.12, 0.1, cz * 2 + 0.12, black, cx1 + 0.12, cy1 + 0.05, 0, 0.03); // roof light bar
  const beacon = add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.16, 16), new THREE.MeshStandardMaterial({ color: 0xff9a1a, emissive: 0xff7a00, emissiveIntensity: 0.5, roughness: 0.2 })));
  beacon.position.set(cx0 + 0.25, cy1 + 0.3, -cz + 0.15);
  add(rod(v3(cx0 + 0.25, cy1 + 0.2, -cz + 0.15), v3(cx0 + 0.25, cy1 + 0.25, -cz + 0.15), 0.02, black));
  for (const s of [-1, 1]) {
    add(rod(v3(cx1 - 0.1, cy1 - 0.25, s * cz), v3(cx1 + 0.05, cy1 - 0.35, s * (cz + 0.42)), 0.02, black));
    box(0.06, 0.34, 0.16, black, cx1 + 0.06, cy1 - 0.5, s * (cz + 0.45), 0.02);
  }

  // exhaust with perforated silver guard, front-right corner of the cab
  add(rod(v3(1.45, 2.0, 0.4), v3(1.45, 3.3, 0.4), 0.065, black, 14));
  add(rod(v3(1.45, 2.05, 0.4), v3(1.45, 2.95, 0.4), 0.09, silver, 16));

  // fenders: lime over the rear wheels, black over the front wheels
  for (const s of [-1, 1]) {
    const rf = add(fender(1.07, 0.06, Math.PI * 0.06, Math.PI * 0.86, 0.74, lime));
    rf.position.set(0, 0.92, s * 0.95);
    const ff = add(fender(0.82, 0.04, Math.PI * 0.12, Math.PI * 0.82, 0.52, black));
    ff.position.set(2.95, 0.72, s * 0.95);
  }

  // front weight block + rear linkage
  box(0.38, 0.5, 0.86, black, 4.32, 0.98, 0, 0.06);
  box(0.24, 0.2, 0.3, steel, 4.1, 0.95, 0, 0.03);
  for (const s of [-1, 1]) add(rod(v3(-0.25, 0.9, s * 0.35), v3(-0.75, 0.55, s * 0.42), 0.04, steel));
  add(rod(v3(-0.25, 1.35, 0), v3(-0.75, 1.0, 0), 0.035, steel));

  // wheels
  const wheels: THREE.Object3D[] = [];
  for (const s of [-1, 1]) {
    const r = agWheel(0.92, 0.62);
    r.g.position.set(0, 0.92, s * 0.98);
    add(r.g);
    wheels.push(r.spin);
    const f = agWheel(0.72, 0.5);
    f.g.position.set(2.95, 0.72, s * 0.98);
    add(f.g);
    wheels.push(f.spin);
  }
  group.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  return { group, wheels };
}

/** CLAAS-style combine: lime body, white roof, glass cab, red header with reel, unloading auger. Faces +X. */
export function buildCombine(): Machine {
  const group = new THREE.Group();
  const lime = limePaint();
  const black = blackPaint();
  const white = whitePaint();
  const glass = tintGlass();
  const red = new THREE.MeshPhysicalMaterial({ color: 0xc8342a, roughness: 0.4, clearcoat: 0.5 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x3a3e41, roughness: 0.45, metalness: 0.6 });
  const add = <T extends THREE.Object3D>(o: T) => (group.add(o), o);
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z = 0, r = 0.08) => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) - 0.001), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    return add(mesh);
  };
  box(6.4, 2.2, 3.0, lime, -0.7, 2.25, 0, 0.18); // body
  box(5.6, 0.5, 3.04, black, -0.9, 1.25, 0, 0.06); // lower band
  box(3.0, 1.2, 2.9, lime, -1.3, 3.9, 0, 0.2); // grain tank
  box(2.9, 0.12, 2.95, black, -1.3, 4.52, 0, 0.04);
  // cab
  const cab = add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.7, 2.1), glass));
  cab.position.set(1.85, 4.1, 0);
  for (const x of [1.0, 2.7]) for (const s of [-1, 1]) box(0.08, 1.8, 0.08, black, x, 4.1, s * 1.02, 0.02);
  box(2.2, 0.2, 2.4, white, 1.85, 5.05, 0, 0.09);
  box(1.8, 0.7, 2.2, black, 1.85, 3.0, 0, 0.06);
  const beacon = add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.18, 16), new THREE.MeshStandardMaterial({ color: 0xff9a1a, emissive: 0xff7a00, emissiveIntensity: 0.5 })));
  beacon.position.set(1.2, 5.3, -0.9);
  // badges
  const plate = badge("LEXION", "");
  for (const s of [-1, 1]) {
    const b = add(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.62), plate));
    b.position.set(-0.4, 2.7, s * 1.52);
    b.rotation.y = s < 0 ? Math.PI : 0;
  }
  // feeder house + header + reel
  box(1.6, 1.0, 1.6, black, 2.9, 1.6, 0, 0.06);
  box(1.3, 0.7, 7.4, red, 3.75, 0.8, 0, 0.1);
  box(0.2, 0.18, 7.5, steel, 4.42, 0.32, 0, 0.03);
  for (const s of [-1, 1]) box(1.3, 1.1, 0.08, red, 3.75, 1.05, s * 3.68, 0.03);
  const reel = new THREE.Group();
  for (let k = 0; k < 6; k++) {
    const bat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 7.0), lime);
    const a = (k / 6) * Math.PI * 2;
    bat.position.set(Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0);
    reel.add(bat);
    for (const z of [-3.2, 0, 3.2]) reel.add(rod(v3(0, 0, z), v3(Math.cos(a) * 0.55, Math.sin(a) * 0.55, z), 0.015, steel, 4));
  }
  reel.add(rod(v3(0, 0, -3.5), v3(0, 0, 3.5), 0.05, steel));
  reel.position.set(4.05, 1.55, 0);
  add(reel);
  // unloading auger + exhaust
  add(rod(v3(-1.8, 4.4, 1.3), v3(-4.0, 5.1, 4.6), 0.17, lime, 12));
  add(rod(v3(-4.0, 5.1, 4.6), v3(-4.1, 4.7, 4.75), 0.17, lime, 12));
  add(rod(v3(-2.8, 4.5, -1.0), v3(-2.8, 5.6, -1.0), 0.08, black, 12));
  const wheels: THREE.Object3D[] = [];
  for (const s of [-1, 1]) {
    const f = agWheel(0.98, 0.78);
    f.g.position.set(1.25, 0.98, s * 1.75);
    add(f.g);
    wheels.push(f.spin);
    const b = agWheel(0.62, 0.5);
    b.g.position.set(-3.0, 0.62, s * 1.55);
    add(b.g);
    wheels.push(b.spin);
    const ff = add(fender(1.12, 0.05, Math.PI * 0.1, Math.PI * 0.85, 0.8, lime));
    ff.position.set(1.25, 0.98, s * 1.75);
  }
  group.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  return { group, wheels, reel };
}

/** AXION tractor pulling a Ghargrow-green grain cart (cart behind, along -X). */
export function buildTractorCart(): Machine {
  const group = new THREE.Group();
  const t = buildAxion();
  group.add(t.group);
  const green = new THREE.MeshPhysicalMaterial({ color: 0x43780e, roughness: 0.4, metalness: 0.2, clearcoat: 0.5 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x3a3e41, roughness: 0.45, metalness: 0.6 });
  const shape = new THREE.Shape();
  shape.moveTo(-2.3, 0);
  shape.lineTo(2.3, 0);
  shape.lineTo(2.6, 1.7);
  shape.lineTo(-2.6, 1.7);
  shape.closePath();
  const body = new THREE.ExtrudeGeometry(shape, { depth: 2.3, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 });
  body.translate(0, 0, -1.15);
  const cart = new THREE.Mesh(body, green);
  cart.position.set(-4.4, 1.15, 0);
  cart.castShadow = true;
  group.add(cart);
  const grain = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.1, 2.2), new THREE.MeshStandardMaterial({ color: 0xd8b25a, roughness: 1 }));
  grain.position.set(-4.4, 2.7, 0);
  group.add(grain);
  group.add(rod(v3(-0.75, 0.55, 0), v3(-2.2, 1.0, 0), 0.07, steel));
  const wheels = [...t.wheels];
  for (const s of [-1, 1]) {
    const w = agWheel(0.78, 0.55);
    w.g.position.set(-4.4, 0.78, s * 1.48);
    group.add(w.g);
    wheels.push(w.spin);
  }
  group.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  return { group, wheels };
}

/** Straw bales dropped behind each combine, revealed along the harvest path. */
export function buildBales(count: number) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xd9bd6c, roughness: 0.95 });
  const geo = new THREE.BoxGeometry(1.1, 0.45, 0.5);
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Spiral harvest path: position + heading of a combine at harvest parameter s (0..1). */
/** Inner radius the harvest stops at, so the combine never reaches the centre tower. Wheat starts here too. */
export const RIN = 9;

export function harvestPose(R: number, N: number, s: number) {
  const ring = Math.min(N - 1, Math.floor(s * N));
  const frac = s * N - ring;
  const a = frac * Math.PI * 2;
  const r = R - (ring + 0.5) * ((R - RIN) / N);
  const x = Math.cos(a) * r,
    z = Math.sin(a) * r;
  const dx = -Math.sin(a),
    dz = Math.cos(a);
  return { x, z, r, a, heading: Math.atan2(-dz, dx) };
}
