import * as THREE from "three";

/*
 * Western CP600 centre pivot, one span — built procedurally from the "CP600 PVT" assembly drawing
 * (the SolidWorks .SLDPRT/.SLDASM parts can't be read in the browser).
 *
 * Drawing facts: total length 42.54 m · total height 5.64 m · total width 5.18 m · drops every 6 m.
 * Measured from the drawing (≈0.0231 m/px): pivot base ≈3.1 m square, span pipe ≈4.4 m high,
 * five truss V-strut stations ≈6.1 m apart starting at 8.4 m, drive tower at ≈38.4 m,
 * truss chord ≈1.45 m below the pipe and ≈±1.55 m wide at mid-span, wheel track ±2.35 m.
 *
 * Units: metres. X runs along the span from the pivot centre, Y is up, Z across.
 */

export const DIM = {
  total: 42.54,
  height: 5.64,
  width: 5.18,
  tower: 38.4,
  pipeY: 4.4,
  arch: 0.28,
  pipeR: 0.084,
  baseHalf: 1.55,
  wheelZ: 2.35,
  wheelR: 0.62,
};

/** Height of the span pipe at distance x (gentle upward arch between pivot and tower). */
export const pipeY = (x: number) => {
  if (x <= DIM.tower) return DIM.pipeY + DIM.arch * Math.sin((Math.PI * x) / DIM.tower);
  return DIM.pipeY - (x - DIM.tower) * 0.015; // overhang droops slightly
};

export type Step = { key: string; title: { en: string; ar: string }; body: { en: string; ar: string }; group: THREE.Group };

const up = new THREE.Vector3(0, 1, 0);

function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, seg = 8) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg, 1), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
  m.castShadow = true;
  return m;
}
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function mats() {
  return {
    steel: new THREE.MeshStandardMaterial({ color: 0x2b2f31, metalness: 0.6, roughness: 0.45 }),
    galv: new THREE.MeshStandardMaterial({ color: 0xc9cdd1, metalness: 0.85, roughness: 0.32 }),
    rod: new THREE.MeshStandardMaterial({ color: 0xa9adb1, metalness: 0.8, roughness: 0.4 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x1b1b1a, metalness: 0, roughness: 0.9 }),
    rim: new THREE.MeshStandardMaterial({ color: 0x8b8f93, metalness: 0.7, roughness: 0.4 }),
    panel: new THREE.MeshStandardMaterial({ color: 0xbfc3c6, metalness: 0.5, roughness: 0.5 }),
    red: new THREE.MeshStandardMaterial({ color: 0xd2232a, metalness: 0.1, roughness: 0.6 }),
    hose: new THREE.MeshStandardMaterial({ color: 0x1f2224, metalness: 0.1, roughness: 0.8 }),
    green: new THREE.MeshStandardMaterial({ color: 0x43780e, metalness: 0.1, roughness: 0.7 }),
  };
}

/* 1 — pivot point: pyramid tower, riser, elbow, collector ring, control panel */
function pivotPoint(M: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  const h = DIM.baseHalf;
  const top = 3.95;
  const corners = [v(h, 0, h), v(-h, 0, h), v(-h, 0, -h), v(h, 0, -h)];
  const apex = (c: THREE.Vector3) => v(c.x * 0.12, top, c.z * 0.12);
  corners.forEach((c) => g.add(rod(c, apex(c), 0.055, M.steel)));
  // horizontal bracing rings
  for (let i = 0; i < 5; i++) {
    const t = 0.08 + i * 0.19;
    const ring = corners.map((c) => c.clone().lerp(apex(c), t));
    ring.forEach((p, k) => g.add(rod(p, ring[(k + 1) % 4], 0.03, M.steel)));
  }
  // concrete-pad anchors
  corners.forEach((c) => {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.45), M.panel);
    pad.position.set(c.x, 0.06, c.z);
    g.add(pad);
  });
  // riser pipe + elbow + collector ring
  g.add(rod(v(0, 0, 0), v(0, top + 0.35, 0), 0.11, M.galv, 16));
  const elbow = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 10, 16, Math.PI / 2), M.galv);
  elbow.position.set(0.3, top + 0.35, 0);
  elbow.rotation.z = Math.PI / 2;
  g.add(elbow);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 16), M.steel);
  ring.position.set(0, top + 0.95, 0);
  g.add(ring);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16), M.panel);
  cap.position.set(0, top + 1.2, 0);
  g.add(cap);
  // inlet elbow at ground
  g.add(rod(v(0, 0.35, 0), v(0.9, 0.35, 0.0), 0.11, M.galv, 16));
  // control panel (iControl) on the riser
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.3), M.panel);
  panel.position.set(-0.05, 1.7, 0.38);
  g.add(panel);
  return g;
}

/* 2 — span pipe: arched galvanised pipe from the pivot elbow to the drive tower */
function spanPipe(M: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = 0.6 + ((DIM.tower - 0.6) * i) / 60;
    pts.push(v(x, pipeY(x), 0));
  }
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, DIM.pipeR, 12), M.galv);
  tube.castShadow = true;
  g.add(tube);
  // flanged joints every ~6 m
  for (let x = 6.1; x < DIM.tower; x += 6.1) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(DIM.pipeR * 1.6, DIM.pipeR * 1.6, 0.06, 14), M.galv);
    f.position.set(x, pipeY(x), 0);
    f.rotation.z = Math.PI / 2;
    g.add(f);
  }
  return g;
}

/* 3 — truss: two lower chord rods (spindle-shaped in plan) + five V-strut stations */
const chord = (x: number) => {
  const t = Math.min(1, Math.max(0, x / DIM.tower));
  const depth = 0.25 + 1.2 * Math.sin(Math.PI * Math.min(1, t * 1.05)) ** 0.9;
  const half = 0.15 + 1.4 * Math.sin(Math.PI * t) ** 0.8;
  return { y: pipeY(x) - depth, half };
};
function truss(M: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 50; i++) {
      const x = 0.8 + ((DIM.tower - 1.6) * i) / 50;
      const c = chord(x);
      pts.push(v(x, c.y, s * c.half));
    }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 100, 0.018, 6), M.rod));
  }
  const stations = [8.4, 14.6, 20.7, 26.8, 32.9];
  for (const x of stations) {
    const c = chord(x);
    const top = v(x, pipeY(x) - DIM.pipeR, 0);
    for (const s of [-1, 1]) {
      const bottom = v(x, c.y, s * c.half);
      // V-struts: pipe → chord, fore and aft
      g.add(rod(v(x - 1.0, pipeY(x - 1.0), 0), bottom, 0.022, M.rod, 6));
      g.add(rod(v(x + 1.0, pipeY(x + 1.0), 0), bottom, 0.022, M.rod, 6));
      g.add(rod(top, bottom, 0.018, M.rod, 6));
    }
    // cross brace between the two chords (the diamond in plan view)
    g.add(rod(v(x, c.y, -c.half), v(x, c.y, c.half), 0.02, M.rod, 6));
  }
  return g;
}

/* 4 — drive tower: A-frame legs, base beam, gearboxes, tyres, centre-drive motor */
function driveTower(M: ReturnType<typeof mats>, wheels: THREE.Object3D[]) {
  const g = new THREE.Group();
  const x = DIM.tower;
  const topY = pipeY(x) - 0.1;
  const baseY = DIM.wheelR + 0.25;
  const legTop = (s: number) => v(x, topY, s * 0.18);
  const legBot = (s: number) => v(x, baseY, s * DIM.wheelZ);
  for (const s of [-1, 1]) {
    g.add(rod(legTop(s), legBot(s), 0.06, M.steel));
    g.add(rod(v(x + 0.9, topY - 0.05, s * 0.15), legBot(s), 0.04, M.steel));
  }
  // ladder rungs
  for (let i = 1; i <= 6; i++) {
    const t = i / 7;
    g.add(rod(legTop(-1).lerp(legBot(-1), t), legTop(1).lerp(legBot(1), t), 0.025, M.steel));
  }
  // base beam
  g.add(rod(legBot(-1), legBot(1), 0.07, M.steel));
  // centre drive motor
  const motor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.38), M.panel);
  motor.position.set(x - 0.25, baseY + 0.05, 0);
  g.add(motor);
  for (const s of [-1, 1]) {
    // drive shaft + gearbox
    g.add(rod(v(x - 0.25, baseY, 0), v(x, DIM.wheelR, s * (DIM.wheelZ - 0.3)), 0.025, M.steel));
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.22), M.steel);
    box.position.set(x, DIM.wheelR, s * (DIM.wheelZ - 0.25));
    g.add(box);
    // tyre with tread lugs — the tower travels along Z, so the wheel plane is Y-Z (axle along X)
    const wheel = new THREE.Group();
    const spin = new THREE.Group();
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(DIM.wheelR - 0.14, 0.16, 12, 28), M.rubber);
    spin.add(tyre);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(DIM.wheelR - 0.24, DIM.wheelR - 0.24, 0.26, 20), M.rim);
    rim.rotation.x = Math.PI / 2;
    spin.add(rim);
    for (let k = 0; k < 16; k++) {
      const lug = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.34), M.rubber);
      const a = (k / 16) * Math.PI * 2;
      lug.position.set(Math.cos(a) * DIM.wheelR, Math.sin(a) * DIM.wheelR, 0);
      lug.rotation.z = a;
      spin.add(lug);
    }
    wheel.add(spin);
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(x, DIM.wheelR, s * DIM.wheelZ);
    wheel.traverse((o) => ((o as THREE.Mesh).castShadow = true));
    wheels.push(spin);
    g.add(wheel);
  }
  return g;
}

/* 5 — tower braces: knee braces tying the tower base back to the span pipe */
function braces(M: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  const x = DIM.tower;
  const baseY = DIM.wheelR + 0.25;
  for (const s of [-1, 1]) {
    g.add(rod(v(x, baseY + 1.1, s * (DIM.wheelZ - 0.35)), v(33.6, pipeY(33.6) - 0.05, 0), 0.04, M.steel));
    g.add(rod(v(x, baseY + 2.1, s * (DIM.wheelZ - 0.9)), v(35.8, pipeY(35.8) - 0.05, s * 0.05), 0.035, M.steel));
  }
  return g;
}

/* 6 — overhang: pipe past the tower, sign mast with stays, end gun, Western sign */
function overhang(M: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  const x0 = DIM.tower;
  const x1 = DIM.total;
  g.add(rod(v(x0, pipeY(x0), 0), v(x1, pipeY(x1), 0), 0.06, M.galv, 12));
  // mast at the tower (sets total height 5.64 m)
  const mastTop = v(x0 - 0.3, DIM.height, 0);
  g.add(rod(v(x0 - 0.3, pipeY(x0), 0), mastTop, 0.025, M.steel));
  // stay cables
  g.add(rod(mastTop, v(x1 - 0.2, pipeY(x1 - 0.2), 0), 0.008, M.rod, 4));
  g.add(rod(mastTop, v(x0 - 4, pipeY(x0 - 4), 0), 0.008, M.rod, 4));
  // end gun
  const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.6, 10), M.steel);
  gun.position.set(x1 + 0.15, pipeY(x1) + 0.2, 0);
  gun.rotation.z = -Math.PI / 3;
  g.add(gun);
  // Western sign (red triangle) on the tower brace
  const sign = new THREE.Mesh(new THREE.CircleGeometry(0.55, 3), M.red);
  sign.position.set(x0 - 1.4, pipeY(x0 - 1.4) + 0.65, 0.12);
  sign.rotation.z = Math.PI / 2;
  g.add(sign);
  return g;
}

/* 7 — drops: hoses every 6 m with pressure regulators and sprinkler heads */
function drops(M: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  const heads: THREE.Vector3[] = [];
  for (let x = 4.6; x < DIM.total - 1; x += 6.1) {
    const y = pipeY(x);
    // gooseneck
    g.add(rod(v(x, y + DIM.pipeR, 0), v(x, y + 0.22, 0), 0.015, M.galv, 6));
    g.add(rod(v(x, y + 0.22, 0), v(x + 0.15, y + 0.22, 0), 0.015, M.galv, 6));
    g.add(rod(v(x + 0.15, y + 0.22, 0), v(x + 0.15, 1.5, 0), 0.016, M.hose, 6));
    const reg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 10), M.panel);
    reg.position.set(x + 0.15, 1.55, 0);
    g.add(reg);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.1, 10), M.green);
    head.position.set(x + 0.15, 1.43, 0);
    head.rotation.x = Math.PI;
    g.add(head);
    heads.push(v(x + 0.15, 1.4, 0));
  }
  return { g, heads };
}

export const STEP_INFO = [
  { key: "pivot", title: { en: "Pivot point", ar: "نقطة المحور" }, body: { en: "A pyramid tower anchored to a concrete pad. Water rises through the riser to an elbow; the collector ring on top carries power, and the iControl panel runs the machine.", ar: "برج هرمي مثبت على قاعدة خرسانية. يصعد الماء عبر الأنبوب العمودي إلى الكوع، والحلقة المجمعة في الأعلى تنقل الكهرباء، ولوحة iControl تشغّل النظام." } },
  { key: "span", title: { en: "Span pipe", ar: "أنبوب الامتداد" }, body: { en: "One arched, galvanised span pipe carries water out to the drive tower — about 38 m from the pivot centre.", ar: "أنبوب امتداد واحد مقوّس ومجلفن ينقل الماء إلى برج الدفع — نحو 38 متراً من مركز المحور." } },
  { key: "truss", title: { en: "Truss rods & struts", ar: "قضبان الشدّ والدعامات" }, body: { en: "Two truss rods run under the pipe, held by five V-strut stations about 6 m apart, so the span keeps its arch when full of water.", ar: "قضيبا شدّ يمتدان تحت الأنبوب وتثبتهما خمس محطات دعامات على شكل V كل 6 أمتار تقريباً، ليحافظ الامتداد على تقوّسه وهو ممتلئ بالماء." } },
  { key: "tower", title: { en: "Drive tower", ar: "برج الدفع" }, body: { en: "An A-frame tower on two high-flotation tyres. A centre-drive motor turns both wheel gearboxes and walks the span around the circle.", ar: "برج على شكل A فوق إطارين عاليي الطفو. محرك الدفع المركزي يدير علبتي تروس العجلتين ليتحرك الامتداد حول الدائرة." } },
  { key: "braces", title: { en: "Tower braces", ar: "دعامات البرج" }, body: { en: "Knee braces tie the tower base back to the span pipe for a rigid, square-running structure.", ar: "دعامات تربط قاعدة البرج بأنبوب الامتداد لهيكل صلب يسير بشكل مستقيم." } },
  { key: "overhang", title: { en: "Overhang & end gun", ar: "الامتداد الخارجي والمدفع الطرفي" }, body: { en: "The pipe continues past the tower on stay cables to 42.54 m, finishing with an end gun that throws water to the edge of the field.", ar: "يستمر الأنبوب بعد البرج مثبتاً بكوابل حتى 42.54 متراً، وينتهي بمدفع طرفي يرش الماء حتى حافة الحقل." } },
  { key: "drops", title: { en: "Drops & sprinklers", ar: "الأنابيب المتدلية والرشاشات" }, body: { en: "Drop hoses every 6 m bring regulated pressure down to sprinkler heads close to the crop, for even water with less wind drift.", ar: "أنابيب متدلية كل 6 أمتار تنقل ضغطاً منظماً إلى رشاشات قريبة من المحصول، لري متساوٍ مع فاقد أقل بسبب الرياح." } },
];

export function buildPivot() {
  const M = mats();
  const wheels: THREE.Object3D[] = [];
  const d = drops(M);
  const groups = [pivotPoint(M), spanPipe(M), truss(M), driveTower(M, wheels), braces(M), overhang(M), d.g];
  const steps: Step[] = STEP_INFO.map((m, i) => ({ ...m, group: groups[i] }));
  // per-step material clones so each step can fade on its own
  for (const s of steps) {
    const cache = new Map<THREE.Material, THREE.Material>();
    s.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      const src = m.material as THREE.Material;
      if (!cache.has(src)) {
        const c = src.clone();
        c.transparent = true;
        cache.set(src, c);
      }
      m.material = cache.get(src)!;
    });
  }
  return { steps, wheels, heads: d.heads };
}

export function setGroupOpacity(g: THREE.Object3D, o: number) {
  const seen = new Set<THREE.Material>();
  g.traverse((n) => {
    const m = n as THREE.Mesh;
    if (!m.isMesh) return;
    const mat = m.material as THREE.MeshStandardMaterial;
    if (seen.has(mat)) return;
    seen.add(mat);
    mat.opacity = o;
    mat.depthWrite = o > 0.99;
  });
  g.visible = o > 0.001;
}
