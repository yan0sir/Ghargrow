import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

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

/** A small, finely displaced patch of rippled sand + loose grains around the ant. */
export function buildMacroSand(center: THREE.Vector3) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(0.9, 0.9, 260, 260);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const fade = 1 - THREE.MathUtils.smoothstep(r, 0.3, 0.44);
    const h = (Math.sin(x * 95 + z * 22 + fbm(x * 12, z * 12) * 5) * 0.5 + 0.5) * 0.0011 + fbm(x * 40, z * 40) * 0.0006;
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
  // grains & pebbles
  const n = 2200;
  const grain = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ roughness: 0.9 }), n);
  const m = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    s = new THREE.Vector3(),
    p = new THREE.Vector3(),
    col = new THREE.Color();
  const tones = [0xc89f63, 0xe6cf9e, 0xa9784b, 0xf3e3c0, 0x8d6a45];
  for (let i = 0; i < n; i++) {
    const r = Math.sqrt(Math.random()) * 0.32,
      a = Math.random() * Math.PI * 2;
    const big = Math.random() < 0.03;
    const sz = big ? 0.0025 + Math.random() * 0.004 : 0.0003 + Math.random() * 0.0007;
    p.set(Math.cos(a) * r, sz * 0.4, Math.sin(a) * r);
    q.setFromEuler(new THREE.Euler(Math.random() * 3, Math.random() * 3, Math.random() * 3));
    s.set(sz, sz * (0.6 + Math.random() * 0.5), sz * (0.8 + Math.random() * 0.4));
    m.compose(p, q, s);
    grain.setMatrixAt(i, m);
    grain.setColorAt(i, col.setHex(tones[(Math.random() * tones.length) | 0]));
  }
  grain.castShadow = true;
  grain.receiveShadow = true;
  g.add(grain);
  g.position.copy(center);
  return g;
}

/* ───────────── ant ───────────── */
export type Ant = { group: THREE.Group; legs: THREE.Group[]; antennae: THREE.Group[]; body: THREE.Group };

export function buildAnt(): Ant {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  const chitin = new THREE.MeshPhysicalMaterial({ color: 0x3a160b, roughness: 0.28, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.25 });
  const dark = new THREE.MeshPhysicalMaterial({ color: 0x1a0905, roughness: 0.35, clearcoat: 0.6 });
  const eye = new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.1, clearcoat: 1 });
  const H = 0.0034; // body height above sand
  const blob = (r: number, sx: number, sy: number, sz: number, x: number, y: number, mat = chitin) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat);
    m.scale.set(sx, sy, sz);
    m.position.set(x, y, 0);
    m.castShadow = true;
    body.add(m);
    return m;
  };
  // head, thorax, petiole, gaster
  const head = blob(0.0017, 1.05, 0.95, 1.05, 0.0046, H + 0.0007);
  blob(0.0016, 1.55, 0.78, 0.82, 0.0014, H + 0.0002);
  blob(0.00075, 1.0, 1.1, 0.9, -0.0009, H + 0.0004, dark);
  blob(0.0026, 1.32, 1.0, 1.08, -0.0042, H + 0.0008);
  // eyes + mandibles
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.00045, 12, 10), eye);
    e.position.set(head.position.x + 0.0008, head.position.y + 0.0004, s * 0.0012);
    body.add(e);
    body.add(rod(v3(0.0058, H + 0.0001, s * 0.0007), v3(0.0069, H - 0.0001, s * 0.0002), 0.00018, dark));
  }
  // antennae: scape + funiculus, animated
  const antennae: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group();
    a.position.set(0.0056, H + 0.0016, s * 0.0007);
    a.add(rod(v3(0, 0, 0), v3(0.0006, 0.0028, s * 0.0011), 0.00012, dark));
    a.add(rod(v3(0.0006, 0.0028, s * 0.0011), v3(0.0045, 0.0031, s * 0.0024), 0.0001, dark));
    body.add(a);
    antennae.push(a);
  }
  // legs: hip group swings, coxa/femur up-out, tibia down to the sand
  const legs: THREE.Group[] = [];
  const hips = [0.0024, 0.0013, 0.0002];
  hips.forEach((hx, k) => {
    for (const s of [-1, 1]) {
      const hip = new THREE.Group();
      hip.position.set(hx, H, s * 0.0006);
      const spread = [0.0017, 0.0002, -0.0022][k];
      const knee = v3(spread * 0.6, 0.0019, s * 0.0034);
      const foot = v3(spread * 1.25, -H, s * 0.0068);
      hip.add(rod(v3(0, 0, 0), knee, 0.00024, chitin));
      hip.add(rod(knee, foot, 0.00017, dark));
      hip.userData = { side: s, pair: k };
      body.add(hip);
      legs.push(hip);
    }
  });
  group.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  return { group, legs, antennae, body };
}

/** Tripod gait: L1-R2-L3 swing while R1-L2-R3 stand, and vice versa. */
export function animateAnt(ant: Ant, t: number, speed: number) {
  const f = t * 9 * speed;
  ant.legs.forEach((leg) => {
    const { side, pair } = leg.userData as { side: number; pair: number };
    const phase = (pair % 2 === 0 ? 0 : Math.PI) + (side > 0 ? Math.PI : 0);
    const c = Math.sin(f + phase);
    leg.rotation.y = c * 0.38 * side;
    leg.rotation.x = Math.max(0, Math.cos(f + phase)) * 0.28 * side; // lift during swing
  });
  ant.antennae.forEach((a, i) => {
    a.rotation.z = Math.sin(t * 5 + i * 1.7) * 0.18;
    a.rotation.y = Math.sin(t * 3.3 + i) * 0.22;
  });
  ant.body.position.y = Math.abs(Math.sin(f)) * 0.00012;
  ant.body.rotation.x = Math.sin(f * 2) * 0.02;
}

/* ───────────── centre pivot ───────────── */
export type Pivot = { group: THREE.Group; arm: THREE.Group; wheels: THREE.Object3D[]; spray: THREE.Points; R: number };

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
  // drops every 4 m
  for (let x = 3; x < R + 2; x += 4) {
    arm.add(rod(v3(x, pipeY(x), 0), v3(x, 1.4, 0), 0.02, steel, 4));
  }
  // spray: droplets along the arm (animated in the shader, in arm space)
  const n = Math.round(R * 22);
  const geo = new THREE.BufferGeometry();
  const ax = new Float32Array(n * 3),
    seed = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    // nozzles at each drop (every 4 m), ~8% from the end gun
    ax[i * 3] = Math.random() < 0.08 ? R + 3.4 : 3 + Math.floor(Math.random() * Math.ceil((R - 1) / 4)) * 4;
    seed[i * 2] = Math.random();
    seed[i * 2 + 1] = Math.random() - 0.5;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(ax, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
  const spray = new THREE.Points(geo, sprayMaterial());
  spray.frustumCulled = false;
  arm.add(spray);
  arm.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  group.add(arm);
  group.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  return { group, arm, wheels, spray, R };
}

export function sprayMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uOn: { value: 0 }, uPx: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec2 aSeed;
      uniform float uTime; uniform float uPx;
      varying float vA;
      #include <common>
      #include <logdepthbuf_pars_vertex>
      void main(){
        float t = fract(uTime*0.85 + aSeed.x);
        vec3 p = position;
        p.y = 1.35 - 1.3*t*t;
        p.z = aSeed.y * 3.6 * (0.3 + t);
        p.x += sin(aSeed.x*40.0)*0.5*t;
        vA = (1.0 - t) * 0.85;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uPx * 60.0 / -mv.z;
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
  for (let r = 1.6; r < R; r += spacing) {
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
    float ringW = R / N;
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
      uniform float uGold, uDay; uniform vec3 uSun;
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
      uniform float uSweep, uGreen, uGold, uCut, uR, uN, uDay;
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

/* ───────────── combine + tractor & grain cart ───────────── */
export type Machine = { group: THREE.Group; wheels: THREE.Object3D[]; reel?: THREE.Object3D };

function wheel(r: number, w: number, rubber: THREE.Material, rimMat: THREE.Material) {
  const g = new THREE.Group();
  const spin = new THREE.Group();
  const tyre = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 22), rubber);
  tyre.rotation.x = Math.PI / 2;
  spin.add(tyre);
  for (let k = 0; k < 14; k++) {
    const lug = new THREE.Mesh(new THREE.BoxGeometry(r * 0.16, r * 0.1, w * 0.95), rubber);
    const a = (k / 14) * Math.PI * 2;
    lug.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
    lug.rotation.z = a;
    spin.add(lug);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, w * 1.04, 16), rimMat);
  hub.rotation.x = Math.PI / 2;
  spin.add(hub);
  g.add(spin);
  return { g, spin };
}

export function buildCombine(): Machine {
  const group = new THREE.Group();
  const lime = new THREE.MeshStandardMaterial({ color: 0xb6cd2b, roughness: 0.5, metalness: 0.2 });
  const grey = new THREE.MeshStandardMaterial({ color: 0x2d3133, roughness: 0.6, metalness: 0.3 });
  const red = new THREE.MeshStandardMaterial({ color: 0xc33a2b, roughness: 0.5 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x9fb8c4, roughness: 0.05, metalness: 0, transmission: 0.2, transparent: true, opacity: 0.55 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.5 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    group.add(m);
    return m;
  };
  box(6.2, 2.4, 3.0, lime, -0.6, 2.3); // body
  box(2.6, 1.3, 2.8, lime, -1.0, 4.1); // grain tank
  box(1.9, 1.9, 2.0, glass, 1.9, 4.2); // cab glass
  box(2.0, 0.15, 2.2, white, 1.9, 5.2); // roof
  box(1.6, 1.2, 1.6, grey, 2.2, 2.5); // feeder
  // header + reel
  box(1.4, 0.7, 7.2, red, 3.6, 0.75);
  box(0.25, 0.25, 7.4, grey, 4.2, 0.35);
  const reel = new THREE.Group();
  for (let k = 0; k < 6; k++) {
    const bat = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 7.0), lime);
    const a = (k / 6) * Math.PI * 2;
    bat.position.set(Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0);
    reel.add(bat);
  }
  reel.add(rod(v3(0, 0, -3.5), v3(0, 0, 3.5), 0.06, grey));
  reel.position.set(4.0, 1.5, 0);
  group.add(reel);
  // unloading auger
  group.add(rod(v3(-1.5, 4.5, 1.2), v3(-3.5, 5.2, 4.5), 0.18, lime, 10));
  // exhaust
  group.add(rod(v3(-2.6, 4.6, -1.0), v3(-2.6, 5.6, -1.0), 0.09, grey));
  const wheels: THREE.Object3D[] = [];
  const rim = new THREE.MeshStandardMaterial({ color: 0xc33a2b, roughness: 0.5 });
  for (const s of [-1, 1]) {
    const f = wheel(0.95, 0.75, rubber, rim);
    f.g.position.set(1.2, 0.95, s * 1.75);
    group.add(f.g);
    wheels.push(f.spin);
    const b = wheel(0.6, 0.5, rubber, rim);
    b.g.position.set(-2.9, 0.6, s * 1.55);
    group.add(b.g);
    wheels.push(b.spin);
  }
  group.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  return { group, wheels, reel };
}

export function buildTractorCart(): Machine {
  const group = new THREE.Group();
  const lime = new THREE.MeshStandardMaterial({ color: 0xb6cd2b, roughness: 0.5, metalness: 0.2 });
  const grey = new THREE.MeshStandardMaterial({ color: 0x2d3133, roughness: 0.6 });
  const cartMat = new THREE.MeshStandardMaterial({ color: 0x43780e, roughness: 0.55, metalness: 0.2 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x9fb8c4, roughness: 0.05, transparent: true, opacity: 0.55 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  const rim = new THREE.MeshStandardMaterial({ color: 0xc33a2b, roughness: 0.5 });
  const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    group.add(m);
    return m;
  };
  // tractor
  box(2.2, 1.0, 1.1, lime, 1.3, 1.3); // hood
  box(1.4, 1.5, 1.5, glass, -0.1, 2.3); // cab
  box(1.5, 0.12, 1.6, lime, -0.1, 3.1);
  box(1.6, 0.6, 1.4, grey, 0.2, 1.0);
  const wheels: THREE.Object3D[] = [];
  for (const s of [-1, 1]) {
    const r = wheel(0.85, 0.55, rubber, rim);
    r.g.position.set(-0.3, 0.85, s * 1.0);
    group.add(r.g);
    wheels.push(r.spin);
    const f = wheel(0.5, 0.35, rubber, rim);
    f.g.position.set(1.9, 0.5, s * 0.85);
    group.add(f.g);
    wheels.push(f.spin);
  }
  // drawbar + grain cart
  group.add(rod(v3(-1.0, 0.7, 0), v3(-2.2, 0.9, 0), 0.08, grey));
  box(4.0, 1.8, 2.4, cartMat, -4.4, 2.0);
  box(4.2, 0.12, 2.6, grey, -4.4, 2.95);
  for (const s of [-1, 1]) {
    const c = wheel(0.75, 0.5, rubber, rim);
    c.g.position.set(-4.4, 0.75, s * 1.35);
    group.add(c.g);
    wheels.push(c.spin);
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
export function harvestPose(R: number, N: number, s: number) {
  const ring = Math.min(N - 1, Math.floor(s * N));
  const frac = s * N - ring;
  const a = frac * Math.PI * 2;
  const r = R - (ring + 0.5) * (R / N);
  const x = Math.cos(a) * r,
    z = Math.sin(a) * r;
  const dx = -Math.sin(a),
    dz = Math.cos(a);
  return { x, z, r, a, heading: Math.atan2(-dz, dx) };
}
