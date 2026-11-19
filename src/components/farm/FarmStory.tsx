"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Link from "next/link";
import { ScrollTrigger } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { href } from "@/lib/i18n";
import {
  animateAnt,
  buildAnt,
  buildBales,
  buildCombine,
  buildDesert,
  buildMacroSand,
  buildPivot,
  buildTractorCart,
  buildWheat,
  fieldMaterial,
  harvestPose,
  RIN,
  v3,
} from "./models";


/*
 * "From sand to harvest" — one pinned, scroll-driven Three.js story:
 *   0.00–0.05  an ant walks across Libyan sand (driven by scroll only)
 *   0.05–0.11  the camera pulls back from millimetres to hundreds of metres
 *   0.11–0.24  three centre pivots roll in and spray (the wet sector follows each arm)
 *   0.24–0.70  aerial time-lapse: autumn sowing → winter rain → spring growth → golden summer;
 *              at the very end the camera latches onto a pivot arm's edge and rides it round
 *   0.70–0.92  like the pivots: close up on the machines as they drive in, then the camera pulls out to a
 *              bird's-eye view while combines spiral in, AXION tractors with grain carts alongside, bales drop.
 *              The pivot arm always stays opposite.
 *   0.92–1.00  the land turns lush green as the view settles high over the circles, then drag to explore
 */
const SEG = { hero: [0, 0.05], pan: [0.05, 0.11], piv: [0.11, 0.24], season: [0.24, 0.7], harvest: [0.7, 0.92], end: [0.92, 1] } as const;
const R = 40;
const RINGS = 5;
const FIELDS = [v3(0, 0, 0), v3(96, 0, -20), v3(-94, 0, 22)];
const ANT_HOME = v3(31, 0, 13);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, s: readonly [number, number]) => clamp((p - s[0]) / (s[1] - s[0]));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = THREE.MathUtils.lerp;
const lerpAngle = (a: number, b: number, t: number) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};
const sph = (tgt: THREE.Vector3, dist: number, elev: number, azi: number) =>
  v3(tgt.x + Math.cos(azi) * Math.cos(elev) * dist, tgt.y + Math.sin(elev) * dist, tgt.z + Math.sin(azi) * Math.cos(elev) * dist);

const SKY = {
  desert: ["#8fb0dc", "#f6dcae"],
  autumn: ["#8fb3e0", "#f2d9b4"],
  winter: ["#7d90aa", "#d6dade"],
  spring: ["#86bdea", "#e7efdc"],
  summer: ["#a6c1de", "#f4dfb6"],
  night: ["#08122b", "#25304d"],
};
const mixHex = (a: string, b: string, t: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();

const SEASONS = {
  en: [
    ["Autumn", "Sowing"],
    ["Winter", "Sprouting"],
    ["Spring", "Ripening"],
    ["Summer", "Golden"],
  ],
  ar: [
    ["الخريف", "البذر"],
    ["الشتاء", "الإنبات"],
    ["الربيع", "النضج"],
    ["الصيف", "الحصاد الذهبي"],
  ],
};

const COPY = {
  en: {
    title: "From Sand to Harvest",
    sub: "Follow one season on a Libyan farm — from a single ant on bare sand to a golden harvest.",
    begin: "Begin the journey",
    pan: "Most of Libya is open desert. Every field we farm starts here — on bare sand, with a little life already moving across it.",
    pivT: "Then the water arrives.",
    pivP: "Western centre pivots roll in and start to turn. Each sweep lays an even layer of water across a full circle — and the sand starts to change colour.",
    harvT: "When the grain turns gold, the combines roll in.",
    harvP: "Combines spiral in from the edge of each circle, a tractor and grain cart alongside, straw bales left behind.",
    endT: "Grow with Trust",
    endP: "Irrigation, machinery and service for every stage of the season.",
    talk: "Talk to us",
    drag: "Drag to explore the fields",
    scroll: "Scroll to explore",
    sim: "Simulation",
    day: "Day",
    season: "Season",
    hs: [
      ["Western centre pivot", "Irrigation", "Western"],
      ["Alfalfa & wheat seed", "Seeds & fertilizers", "Ghargrow"],
      ["CLAAS combine", "Harvest", "CLAAS LEXION"],
      ["AXION + grain cart", "Tractors", "CLAAS AXION"],
      ["Bale handling", "Bales", "Arcusin"],
    ],
    jump: ["Desert", "Water", "Sow", "Grow", "Ripen", "Harvest"],
    cards: [
      ["Irrigation", "Western centre and linear pivots, designed and installed for your field.", "/products/irrigation"],
      ["Machinery", "CLAAS tractors, combines, mowers and balers for every task in the season.", "/products/tractors-machinery"],
      ["Service", "Training, maintenance and genuine parts from our three branches.", "/services"],
    ],
  },
  ar: {
    title: "من الرمال إلى الحصاد",
    sub: "تابع موسماً واحداً في مزرعة ليبية — من نملة على رمال جرداء إلى حصاد ذهبي.",
    begin: "ابدأ الرحلة",
    pan: "معظم ليبيا صحراء مفتوحة. كل حقل نزرعه يبدأ من هنا — رمال جرداء، وحياة صغيرة تتحرك فوقها.",
    pivT: "ثم يصل الماء.",
    pivP: "تدخل أنظمة Western المحورية وتبدأ بالدوران. كل دورة تنشر طبقة متساوية من الماء على دائرة كاملة — فيبدأ لون الرمال بالتغيّر.",
    harvT: "حين تصبح السنابل ذهبية، تدخل الحصادات.",
    harvP: "تدور الحصادات من حافة كل دائرة نحو مركزها، يرافقها جرار وعربة حبوب، وتترك خلفها بالات القش.",
    endT: "ازرع بثقة",
    endP: "ري ومعدات وخدمة لكل مرحلة من مراحل الموسم.",
    talk: "تحدث معنا",
    drag: "اسحب لاستكشاف الحقول",
    scroll: "مرّر للاستكشاف",
    sim: "محاكاة",
    day: "اليوم",
    season: "الموسم",
    hs: [
      ["نظام Western المحوري", "الري", "Western"],
      ["بذور البرسيم والقمح", "البذور والأسمدة", "غرغار"],
      ["حصادة CLAAS", "الحصاد", "CLAAS LEXION"],
      ["AXION مع عربة الحبوب", "الجرارات", "CLAAS AXION"],
      ["مناولة البالات", "البالات", "Arcusin"],
    ],
    jump: ["الصحراء", "الماء", "البذر", "النمو", "النضج", "الحصاد"],
    cards: [
      ["الري", "أنظمة Western المحورية والخطية، بتصميم وتركيب يناسب حقلك.", "/products/irrigation"],
      ["المعدات", "جرارات وحصادات ومحشات ومكابس CLAAS لكل مهمة في الموسم.", "/products/tractors-machinery"],
      ["الخدمة", "تدريب وصيانة وقطع غيار أصلية من فروعنا الثلاثة.", "/services"],
    ],
  },
};

const JUMP_AT = [0.02, 0.14, 0.27, 0.42, 0.58, 0.78];

/** Per-character fade (StaggeredFade from the reference), CSS-driven. */
function Stagger({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span key={i} className="inline-block opacity-0 [animation:fs-in_.9s_ease_forwards]" style={{ animationDelay: `${delay + i * 0.07}s` }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </>
  );
}

export function FarmStory() {
  const { lang, lenis, openContact } = useSite();
  const t = COPY[lang];
  const root = useRef<HTMLElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);

  const jump = (p: number) => {
    const st = stRef.current;
    if (!st) return;
    const y = st.start + p * (st.end - st.start);
    if (lenis.current) lenis.current.scrollTo(y, { duration: 1.6 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    const el = holder.current!;
    const rootEl = root.current!;
    const q = <T extends HTMLElement = HTMLElement>(s: string) => rootEl.querySelector(s) as T;
    const qa = <T extends HTMLElement = HTMLElement>(s: string) => Array.from(rootEl.querySelectorAll(s)) as T[];
    const lite = document.documentElement.classList.contains("lite");
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    /* renderer / scene */
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    } catch {
      rootEl.style.display = "none"; // WebGL unavailable: skip the 3D journey rather than break the page
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf6dcae, 200, 700);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.002, 3000);

    const hemi = new THREE.HemisphereLight(0xdce7f5, 0x9c8158, 1.0);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff0d6, 2.6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
    sun.shadow.bias = -0.0002;
    sun.shadow.normalBias = 0.02;
    scene.add(sun, sun.target);

    /* world */
    const desert = buildDesert();
    scene.add(desert);
    // the open land around the fields: sand that turns green for the finale
    const groundMat = (desert.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
    const SAND = new THREE.Color(0xf2dcb0);
    const LUSH = new THREE.Color(0x6fd245);
    const ANT_HEADING = 0.4;
    scene.add(buildMacroSand(ANT_HOME, ANT_HEADING));
    const ant = buildAnt();
    ant.group.position.copy(ANT_HOME);
    scene.add(ant.group);

    const fieldMat = fieldMaterial(R);
    // the field the camera walks into is planted densely; the two aerial-only fields more sparsely
    const wheat = buildWheat(R, mobile ? 1.2 : 0.72);
    const wheatMat = wheat.material as THREE.ShaderMaterial;
    const fieldWheat = [wheat, ...[1, 2].map(() => {
      const w = buildWheat(R, mobile ? 1.8 : 1.2);
      (w.material as THREE.Material).dispose();
      w.material = wheatMat;
      return w;
    })];
    const pivots = FIELDS.map((c) => {
      const disc = new THREE.Mesh(new THREE.CircleGeometry(R + 3, 128), fieldMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(c.x, 0.09, c.z);
      disc.renderOrder = 1;
      scene.add(disc);
      const w = fieldWheat[FIELDS.indexOf(c)];
      w.position.set(c.x, 0, c.z);
      w.frustumCulled = false;
      scene.add(w);
      const pv = buildPivot(R);
      scene.add(pv.group);
      return { c, pv };
    });
    const machines = FIELDS.map((c) => {
      const comb = buildCombine();
      const cart = buildTractorCart();
      const bales = buildBales(46);
      bales.position.set(c.x, 0.23, c.z);
      scene.add(comb.group, cart.group, bales);
      const balePose = Array.from({ length: 46 }, (_, k) => {
        const s = (k + 0.6) / 46;
        const p = harvestPose(R, RINGS, s);
        const out = (R - RIN) / RINGS / 2 + 0.6;
        return { s, x: Math.cos(p.a) * (p.r + out), z: Math.sin(p.a) * (p.r + out), heading: p.heading };
      });
      return { c, comb, cart, bales, balePose, lastS: 0 };
    });

    /* rain (winter) */
    const rainN = mobile ? 2500 : 6000;
    const rainGeo = new THREE.BufferGeometry();
    const rp = new Float32Array(rainN * 3);
    for (let i = 0; i < rainN; i++) {
      rp[i * 3] = (Math.random() - 0.5) * 320;
      rp[i * 3 + 1] = Math.random() * 70;
      rp[i * 3 + 2] = (Math.random() - 0.5) * 220;
    }
    rainGeo.setAttribute("position", new THREE.BufferAttribute(rp, 3));
    const rainMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uOn: { value: 0 } },
      vertexShader: /* glsl */ `
        uniform float uTime; varying float vA;
        #include <common>
        #include <logdepthbuf_pars_vertex>
        void main(){
          vec3 p = position; p.y = mod(p.y - uTime * 38.0, 70.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = 90.0 / -mv.z; vA = 0.55;
          #include <logdepthbuf_vertex>
        }`,
      fragmentShader: /* glsl */ `
        uniform float uOn; varying float vA;
        #include <common>
        #include <logdepthbuf_pars_fragment>
        void main(){
          vec2 c = gl_PointCoord - 0.5; if (abs(c.x) > 0.08) discard;
          gl_FragColor = vec4(0.85, 0.9, 1.0, vA * uOn * (1.0 - abs(c.y) * 2.0));
          #include <logdepthbuf_fragment>
        }`,
    });
    const rain = new THREE.Points(rainGeo, rainMat);
    rain.frustumCulled = false;
    scene.add(rain);

    /* the ant is driven by scroll only: distance walked = f(progress) */

    /* controls (free orbit at the very end) */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.enabled = false;

    /* scroll */
    let progress = lite ? 0.6 : 0;
    let sp = progress;
    const st = lite
      ? null
      : ScrollTrigger.create({
          trigger: rootEl,
          start: "top top",
          end: "+=900%",
          pin: q("[data-stage]"),
          scrub: true,
          onUpdate: (s) => (progress = s.progress),
        });
    stRef.current = st;

    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 0.8 ? 62 : 45;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    /* DOM handles for per-frame updates */
    const sky = q("[data-sky]");
    const stars = q("[data-stars]");
    const heroBack = q("[data-hero-back]");
    const heroFront = q("[data-hero-front]");
    const panWords = qa("[data-pan] [data-w]");
    const panBox = q("[data-pan]");
    const pivBox = q("[data-piv]");
    const pivWords = qa("[data-piv] [data-w]");
    const seasonEls = qa("[data-season]");
    const hud = q("[data-hud]");
    const hudDay = q("[data-hud-day]");
    const hudSeason = q("[data-hud-season]");
    const giant = q("[data-giant]");
    const harvBox = q("[data-harv]");
    const strip = q("[data-strip]");
    const cards = qa("[data-card]");
    const endBox = q("[data-end]");
    const prog = q("[data-prog]");
    const hint = q("[data-hint]");
    const hotspots = qa("[data-hs]");
    const jumps = qa("[data-jump]");
    // product anchors, refreshed every frame (the machines move), and when each one is on stage
    const hsWorld = [v3(0, 5.2, 0), v3(18, 1.1, 10), v3(0, 0, 0), v3(0, 0, 0), v3(0, 0, 0)];
    const HS_WINDOW: [number, number][] = [
      [0.16, 0.7], // pivot: watering through the seasons
      [0.3, 0.68], // seed: once the crop is up
      [0.74, 0.93], // combine
      [0.74, 0.93], // tractor + cart
      [0.8, 0.95], // bales on the ground
    ];
    const baleMtx = new THREE.Matrix4();

    const clock = new THREE.Clock();
    let raf = 0;
    let freeCam = false;

    const tick = () => {
      const dt = Math.min(0.05, clock.getDelta());
      const time = clock.elapsedTime;
      sp += (progress - sp) * (1 - Math.pow(0.86, (dt * 1000) / 16.7));
      if (Math.abs(progress - sp) < 0.0002) sp = progress;
      const p = sp;

      const fPan = ease(seg(p, SEG.pan));
      const fPiv = seg(p, SEG.piv);
      const g = seg(p, SEG.season);
      const h = seg(p, SEG.harvest);
      const fEnd = ease(seg(p, SEG.end));

      /* ── ant (scroll only) ── */
      const walked = clamp(p / SEG.pan[1]) * 0.12; // metres
      const heading = ANT_HEADING + Math.sin(walked * 38) * 0.18;
      ant.group.position.set(
        ANT_HOME.x + Math.cos(ANT_HEADING) * walked,
        0,
        ANT_HOME.z - Math.sin(ANT_HEADING) * walked + Math.sin(walked * 38) * 0.006,
      );
      ant.group.rotation.y = heading;
      animateAnt(ant, walked * 70, 1);
      ant.group.visible = p < 0.2;

      /* ── pivots arrive, then water ── */
      const arrive = (i: number) => ease(clamp((fPiv - i * 0.07) / 0.3));
      let theta: number;
      if (p < SEG.season[0]) theta = ease(clamp((fPiv - 0.3) / 0.7)) * Math.PI * 2;
      else if (p < SEG.harvest[0]) theta = Math.PI * 2 + g * Math.PI * 7;
      else theta = Math.PI; // replaced per field below by the combine-opposite angle
      pivots.forEach(({ c, pv }, i) => {
        const k = p >= SEG.season[0] ? 1 : arrive(i);
        const out = c.clone().setY(0);
        const dir = out.lengthSq() > 1 ? out.normalize() : v3(-0.6, 0, -0.8);
        pv.group.position.set(c.x + dir.x * (1 - k) * 170, 0, c.z + dir.z * (1 - k) * 170);
        pv.group.visible = k > 0.001;
        let th = theta;
        if (p >= SEG.harvest[0]) th = machines[i].lastS * Math.PI * 2 * RINGS + Math.PI;
        pv.arm.rotation.y = -th;
        pv.wheels.forEach((w, wi) => (w.rotation.z = -(th * (R * ((wi >> 1) + 1)) / 3) / 0.67 - (1 - k) * 40));
        const sprayMat = pv.spray.material as THREE.ShaderMaterial;
        sprayMat.uniforms.uTime.value = time;
        const sprayOn = (p >= SEG.season[0] ? 1 : clamp((fPiv - 0.3) * 6)) * (1 - clamp((p - SEG.harvest[0]) * 40));
        sprayMat.uniforms.uOn.value = sprayOn;
        pv.mist.opacity = sprayOn * (0.09 + Math.sin(time * 7 + i) * 0.02);
        pv.mist.visible = sprayOn > 0.01;
        sprayMat.uniforms.uPx.value = renderer.getPixelRatio() * (el.clientHeight / 900);
      });
      fieldMat.uniforms.uSweep.value = p >= SEG.season[0] ? 7 : theta;

      /* ── seasons ── */
      const grow = clamp((g - 0.1) / 0.62);
      const gold = clamp((g - 0.66) / 0.29);
      wheatMat.uniforms.uGrow.value = p >= SEG.season[0] ? grow : 0;
      wheatMat.uniforms.uGold.value = gold;
      wheatMat.uniforms.uTime.value = time;
      fieldMat.uniforms.uGreen.value = clamp((g - 0.12) / 0.4);
      fieldMat.uniforms.uGold.value = gold;
      fieldWheat.forEach((w) => (w.visible = p >= SEG.season[0] - 0.002));
      // finale: the whole landscape greens up
      const lush = smooth(clamp((p - 0.9) / 0.08));
      wheatMat.uniforms.uLush.value = lush;
      fieldMat.uniforms.uLush.value = lush;
      groundMat.color.copy(SAND).lerp(LUSH, lush);

      // day/night: one cycle per season during the time-lapse
      const base = lerp(0.07, 0.17, fPan);
      // three day/night cycles while the crop grows, then daylight for the golden field and harvest
      const turns = p >= SEG.season[0] && p < SEG.season[1] ? 3 * smooth(clamp(g / 0.62)) : 0;
      const sa = (base + turns) * Math.PI * 2;
      const sunDir = v3(Math.cos(sa) * 0.8, Math.sin(sa), 0.45).normalize();
      const day = clamp(Math.sin(sa) * 2.4 + 0.2);
      const seasonIdx = Math.min(3, Math.floor(g * 4));
      // one season title at a time: fade out before the next fades in
      const sw = [0, 1, 2, 3].map((k) => clamp((0.42 - Math.abs(g * 4 - 0.5 - k)) * 8));
      const palette = p < SEG.season[0] ? SKY.desert : p >= SEG.season[1] ? SKY.summer : null;
      let top: string, hor: string;
      if (palette) [top, hor] = palette;
      else {
        const keys = [SKY.autumn, SKY.winter, SKY.spring, SKY.summer];
        const x = clamp(g * 4 - 0.5, 0, 3),
          i0 = Math.floor(x),
          i1 = Math.min(3, i0 + 1),
          f = smooth(x - i0);
        top = mixHex(keys[i0][0], keys[i1][0], f);
        hor = mixHex(keys[i0][1], keys[i1][1], f);
        if (g < 0.125) {
          top = mixHex(SKY.desert[0], top, g * 8);
          hor = mixHex(SKY.desert[1], hor, g * 8);
        }
      }
      top = mixHex(SKY.night[0], top, day);
      hor = mixHex(SKY.night[1], hor, day);
      sky.style.background = `linear-gradient(180deg, ${top} 0%, ${hor} 62%, ${hor} 100%)`;
      stars.style.opacity = String(clamp(1 - day * 1.6));
      (scene.fog as THREE.Fog).color.set(hor);
      if (p > 0.9) (scene.fog as THREE.Fog).color.lerp(new THREE.Color(0xcfe3c0), smooth(clamp((p - 0.9) / 0.08)));
      sun.intensity = 2.6 * day + 0.05;
      sun.color.set(day < 0.5 ? 0xffb37a : 0xfff0d6);
      hemi.intensity = 0.25 + 0.85 * day;
      wheatMat.uniforms.uDay.value = 0.25 + 0.75 * day;
      fieldMat.uniforms.uDay.value = 0.35 + 0.65 * day;
      const winter = p >= SEG.season[0] && p < SEG.season[1] ? clamp(1 - Math.abs(g - 0.375) / 0.11) : 0;
      rainMat.uniforms.uOn.value = winter;
      rainMat.uniforms.uTime.value = time;
      wheatMat.uniforms.uWind.value = 0.6 + winter * 1.4;

      /* ── harvest machines ── */
      machines.forEach((m) => {
        const arriveH = clamp(h / 0.14);
        const s = clamp((h - 0.14) / 0.82);
        m.lastS = s;
        const pose = harvestPose(R, RINGS, s);
        let x = pose.x,
          z = pose.z,
          hd = pose.heading;
        if (arriveH < 1) {
          // drive in from outside the circle, along the tangent of the first ring
          const k = ease(arriveH);
          x = pose.x;
          z = lerp(-70, pose.z, k);
          hd = Math.atan2(-1, 0);
        }
        const vis = p >= SEG.harvest[0] - 0.005;
        m.comb.group.visible = m.cart.group.visible = vis;
        m.comb.group.position.set(m.c.x + x, 0, m.c.z + z);
        m.comb.group.rotation.y = hd;
        m.comb.wheels.forEach((w) => (w.rotation.z = -(s * 900 + arriveH * 70)));
        if (m.comb.reel) m.comb.reel.rotation.z = -time * 3;
        // tractor + grain cart alongside, on the already-harvested outer ring
        const cp = harvestPose(R, RINGS, Math.max(0, s - 0.004));
        const ox = Math.cos(cp.a) * (cp.r + 6),
          oz = Math.sin(cp.a) * (cp.r + 6);
        m.cart.group.position.set(m.c.x + (arriveH < 1 ? x + 6 : ox), 0, m.c.z + (arriveH < 1 ? z - 6 : oz));
        m.cart.group.rotation.y = arriveH < 1 ? hd : cp.heading;
        m.cart.wheels.forEach((w) => (w.rotation.z = -(s * 1200 + arriveH * 90)));
        wheatMat.uniforms.uCut.value = s;
        fieldMat.uniforms.uCut.value = s;
        const mtx = new THREE.Matrix4(),
          qq = new THREE.Quaternion();
        m.balePose.forEach((b, k) => {
          const show = clamp((s - b.s - 0.01) * 60);
          qq.setFromAxisAngle(v3(0, 1, 0), b.heading);
          mtx.compose(v3(b.x, 0, b.z), qq, v3(show, show, show));
          m.bales.setMatrixAt(k, mtx);
        });
        m.bales.instanceMatrix.needsUpdate = true;
        m.bales.visible = vis;
      });

      /* ── camera ── */
      const antP = ant.group.position.clone();
      const heroAzi = heading + Math.PI + 0.6;
      const heroTgt = antP.clone().add(v3(Math.cos(heading) * 0.01, 0.007, -Math.sin(heading) * 0.01));
      const heroPos = sph(heroTgt, 0.055, 0.13, -heroAzi);
      const AER_T = v3(4, 0, 0);
      const aerial = (dist: number, elev: number, azi: number) => ({ pos: sph(AER_T, dist, elev, azi), tgt: AER_T.clone() });
      // grabbed onto the edge of pivot 1's arm: just outside the end tower, trailing slightly, looking in along the arm
      const grab = (th: number) => ({
        pos: v3(Math.cos(th - 0.15) * (R + 13), 11, Math.sin(th - 0.15) * (R + 13)),
        tgt: v3(Math.cos(th + 0.05) * R * 0.48, 1.5, Math.sin(th + 0.05) * R * 0.48),
      });
      let pos: THREE.Vector3, tgt: THREE.Vector3;
      if (p < SEG.pan[0]) {
        pos = heroPos;
        tgt = heroTgt;
      } else if (p < SEG.pan[1]) {
        const dist = Math.exp(lerp(Math.log(0.055), Math.log(235), fPan));
        const elev = lerp(0.13, 0.74, fPan);
        const azi = lerpAngle(-heroAzi, 0.95, smooth(fPan));
        const tf = ease(clamp((fPan - 0.35) / 0.65));
        tgt = heroTgt.clone().lerp(AER_T, tf);
        pos = sph(tgt, dist, elev, azi);
      } else if (p < SEG.season[0]) {
        const a = aerial(lerp(235, 200, fPiv), lerp(0.74, 0.62, fPiv), 0.95 + fPiv * 0.35);
        pos = a.pos;
        tgt = a.tgt;
      } else if (p < SEG.harvest[0]) {
        // aerial time-lapse, then at the very end latch onto the edge of pivot 1's arm and ride it round
        const a = aerial(lerp(200, 150, clamp(g / 0.6)), lerp(0.62, 0.5, clamp(g / 0.6)), 1.3 + g * 1.1);
        const gr = grab(theta);
        const k = ease(clamp((g - 0.68) / 0.14));
        pos = a.pos.lerp(gr.pos, k);
        tgt = a.tgt.lerp(gr.tgt, k);
      } else {
        // hold where the arm left us while the machines drive in, then ease into following them
        const hold = grab(Math.PI);
        const m = machines[0];
        const cpos = m.comb.group.position;
        const fwd = v3(Math.cos(m.comb.group.rotation.y), 0, -Math.sin(m.comb.group.rotation.y));
        const side = v3(fwd.z, 0, -fwd.x);
        // from the harvested (outer) side: AXION + grain cart nearest the camera, the combine cutting just beyond
        const mid = cpos.clone().lerp(m.cart.group.position, 0.5);
        const follow = {
          pos: mid.clone().add(side.clone().multiplyScalar(19)).add(fwd.clone().multiplyScalar(-7)).add(v3(0, 5, 0)),
          tgt: mid.clone().add(fwd.clone().multiplyScalar(2)).add(v3(0, 1.6, 0)),
        };
        const k = ease(clamp((h - 0.12) / 0.14));
        pos = hold.pos.lerp(follow.pos, k);
        tgt = hold.tgt.lerp(follow.tgt, k);
        // then, like the pivots, expand from the close-up to a bird's-eye view over all three circles
        const up = ease(clamp((h - 0.3) / 0.45));
        const bird = aerial(lerp(150, 260, up), lerp(0.55, 1.12, up), 2.2 + up * 0.4);
        pos = pos.lerp(bird.pos, up);
        tgt = tgt.lerp(bird.tgt, up);
        if (p >= SEG.end[0]) {
          const fin = aerial(300, 0.95, 2.6);
          pos.lerp(fin.pos, fEnd);
          tgt.lerp(fin.tgt, fEnd);
        }
      }
      const dist = pos.distanceTo(tgt);

      if (p > 0.985 && !freeCam) {
        freeCam = true;
        controls.target.copy(tgt);
        camera.position.copy(pos);
        controls.enabled = true;
      } else if (p <= 0.985 && freeCam) {
        freeCam = false;
        controls.enabled = false;
      }
      if (freeCam) controls.update();
      else {
        camera.position.copy(pos);
        camera.lookAt(tgt);
      }
      camera.near = Math.max(0.0015, dist * 0.02);
      camera.updateProjectionMatrix();

      // sun + shadow frustum follow the view scale
      const size = clamp(dist * 1.4, 0.12, 170);
      const focus = freeCam ? controls.target : tgt;
      sun.target.position.copy(focus);
      sun.position.copy(focus).add(sunDir.clone().multiplyScalar(size * 3));
      const sc = sun.shadow.camera;
      sc.left = -size;
      sc.right = size;
      sc.top = size;
      sc.bottom = -size;
      sc.near = size * 0.2;
      sc.far = size * 6;
      sc.updateProjectionMatrix();
      const fog = scene.fog as THREE.Fog;
      fog.near = Math.max(140, dist * 1.4);
      fog.far = Math.max(650, dist * 4.5);
      wheatMat.uniforms.uSun.value.copy(sunDir).transformDirection(camera.matrixWorldInverse);

      /* ── overlays ── */
      const heroOut = clamp(p / 0.04);
      heroBack.style.opacity = String(1 - heroOut);
      heroBack.style.transform = `translate3d(0, ${-heroOut * 60}px, 0)`;
      heroFront.style.opacity = String(1 - clamp(p / 0.03));
      heroFront.style.visibility = p < 0.03 ? "visible" : "hidden";
      hint.style.opacity = String(1 - clamp(p / 0.02));

      const panIn = clamp((p - 0.055) / 0.03),
        panOut = clamp((p - 0.1) / 0.015);
      panWords.forEach((w, i) => {
        const k = clamp(panIn * 2.2 - (i / panWords.length) * 1.2);
        w.style.opacity = String((0.12 + 0.88 * k) * (1 - panOut));
        w.style.filter = `blur(${(1 - k) * 6 + panOut * 10}px)`;
      });
      panBox.style.visibility = panIn > 0 && panOut < 1 ? "visible" : "hidden";

      const pivIn = clamp((p - 0.115) / 0.04),
        pivOut = clamp((p - 0.225) / 0.02);
      pivWords.forEach((w, i) => {
        const k = clamp(pivIn * 2.2 - (i / pivWords.length) * 1.2);
        w.style.opacity = String((0.12 + 0.88 * k) * (1 - pivOut));
        w.style.filter = `blur(${(1 - k) * 6 + pivOut * 10}px)`;
      });
      pivBox.style.visibility = pivIn > 0 && pivOut < 1 ? "visible" : "hidden";

      const inSeason = p >= SEG.season[0] && p < SEG.season[1];
      seasonEls.forEach((s, k) => {
        const o = inSeason ? sw[k] : 0;
        s.style.opacity = String(o);
        s.style.transform = `translate3d(0, ${(1 - o) * 24}px, 0)`;
        s.style.filter = `blur(${(1 - o) * 8}px)`;
      });
      const hudOn = clamp((p - 0.16) * 20) * (1 - clamp((p - 0.72) * 25));
      hud.style.opacity = String(hudOn);
      const dayN = Math.round(g * 270);
      hudDay.textContent = String(dayN).padStart(3, "0");
      hudSeason.textContent = p < SEG.season[0] ? (lang === "ar" ? "—" : "—") : SEASONS[lang][seasonIdx][0];

      // hotspots: projected from the world, live values
      const m0 = machines[0];
      hsWorld[2].copy(m0.comb.group.position).add(v3(0, 4.4, 0));
      hsWorld[3].copy(m0.cart.group.position).add(v3(0, 3.8, 0));
      m0.bales.getMatrixAt(0, baleMtx);
      hsWorld[4].setFromMatrixPosition(baleMtx).add(v3(0, 1.1, 0));
      hotspots.forEach((hs, i) => {
        const [a, b] = HS_WINDOW[i];
        const w = hsWorld[i].clone().project(camera);
        const visible = p > a && p < b && w.z < 1 && Math.abs(w.x) < 0.95 && Math.abs(w.y) < 0.9;
        hs.style.visibility = visible ? "visible" : "hidden";
        hs.style.transform = `translate3d(${((w.x + 1) / 2) * el.clientWidth}px, ${((1 - w.y) / 2) * el.clientHeight}px, 0)`;
      });

      // harvest: giant letters slide behind the machines (in the sky layer), strip slides in from the right
      const hv = clamp((p - 0.72) / 0.17);
      const gw = giant.offsetWidth;
      giant.style.transform = `translate3d(${window.innerWidth - hv * (gw + window.innerWidth)}px, 0, 0)`;
      giant.style.visibility = hv > 0 && hv < 1 ? "visible" : "hidden";
      const hIn = clamp((p - 0.715) / 0.04),
        hOut = clamp((p - 0.81) / 0.03);
      harvBox.style.opacity = String(hIn * (1 - hOut));
      harvBox.style.transform = `translate3d(0, ${(1 - hIn) * 30}px, 0)`;
      const sr = clamp((p - 0.79) / 0.14);
      const sW = strip.scrollWidth;
      strip.style.transform = `translate3d(${window.innerWidth - sr * (sW + window.innerWidth * 0.2)}px, 0, 0)`;
      strip.style.visibility = sr > 0 && sr < 1 ? "visible" : "hidden";
      cards.forEach((c) => {
        const left = c.getBoundingClientRect().left / window.innerWidth;
        const s = clamp((0.98 - left) / 0.3, -0.4, 1.6) * 100;
        c.style.setProperty("--s", `${s}%`);
      });
      const endIn = clamp((p - 0.93) / 0.05);
      endBox.style.opacity = String(endIn);
      endBox.style.visibility = endIn > 0 ? "visible" : "hidden";
      endBox.style.transform = `translate3d(-50%, ${(1 - endIn) * 30}px, 0)`;
      prog.style.transform = `scaleX(${p})`;
      const activeJump = JUMP_AT.reduce((acc, j, i) => (p >= j - 0.015 ? i : acc), 0);
      jumps.forEach((b, i) => b.classList.toggle("is-on", i === activeJump));

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      st?.kill();
      stRef.current = null;
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((x) => x.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [lang]);

  const words = (s: string) =>
    s.split(" ").map((w, i) => (
      <span key={i} data-w className="inline">
        {w}{" "}
      </span>
    ));

  return (
    <section ref={root} className="relative bg-[#0b0f0a]" data-immersive>
      <style>{`
        @keyframes fs-in { to { opacity: 1 } }
        .font-garamond { font-family: var(--font-display); font-weight: 500; letter-spacing: -0.03em; }
        .liquid-glass { background: rgba(255,255,255,.04); background-blend-mode: luminosity; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          box-shadow: inset 0 1px 1px rgba(255,255,255,.12); position: relative; overflow: hidden; transition: background .3s, transform .2s; }
        .liquid-glass::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.4px;
          background: linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.18) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,.18) 80%, rgba(255,255,255,.55) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .liquid-glass:hover { background: rgba(255,255,255,.1); }
        .liquid-glass:active { transform: scale(.98); }
        [data-card] .sweep { background: linear-gradient(90deg, #fff calc(var(--s,0%) - 34%), #a9c98a calc(var(--s,0%) - 6%), transparent calc(var(--s,0%) + 26%));
          -webkit-background-clip: text; background-clip: text; color: transparent; }
        [data-jump].is-on { background: rgba(255,255,255,.9); color: #14140f; }
        [data-hs].on [data-hs-val], [data-hs]:hover [data-hs-val] { max-height: 22px; }
      `}</style>
      <div data-stage className="relative h-svh overflow-hidden">
        {/* sky + things that sit "behind" the 3D world (the canvas is transparent where there is sky) */}
        <div data-sky className="absolute inset-0" />
        <div
          data-stars
          className="absolute inset-0 opacity-0"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 12% 18%, #fff 50%, transparent), radial-gradient(1px 1px at 28% 9%, #fff 50%, transparent), radial-gradient(1.4px 1.4px at 46% 22%, #fff 50%, transparent), radial-gradient(1px 1px at 63% 12%, #fff 50%, transparent), radial-gradient(1.2px 1.2px at 81% 26%, #fff 50%, transparent), radial-gradient(1px 1px at 92% 7%, #fff 50%, transparent), radial-gradient(1px 1px at 37% 31%, #fff 50%, transparent), radial-gradient(1px 1px at 72% 34%, #fff 50%, transparent)",
          }}
        />
        <div data-hero-back className="pointer-events-none absolute inset-x-0 top-[17%] px-4 text-center text-white md:top-[15%]">
          <h1 className="font-garamond text-[13vw] leading-[1.02] font-normal tracking-tight [text-shadow:0_2px_40px_rgba(80,50,10,.25)] md:text-[8.4vw]">
            <Stagger text={t.title} delay={0.3} />
          </h1>
        </div>
        <div
          data-giant
          className="font-garamond pointer-events-none invisible absolute top-[14%] left-0 text-[28vw] leading-[.8] whitespace-nowrap text-white/55 md:top-[8%]"
        >
          {lang === "ar" ? "الحصاد" : "HARVEST"}
        </div>

        <div ref={holder} className="absolute inset-0 [&>canvas]:size-full" />

        {/* front overlays */}
        <div data-hero-front className="pointer-events-none absolute inset-x-0 bottom-[11%] flex flex-col items-center px-5 text-center text-white">
          <p className="max-w-xs text-sm leading-relaxed font-light text-white/85 [text-shadow:0_1px_12px_rgba(40,20,0,.5)] sm:max-w-md sm:text-base md:text-lg">{t.sub}</p>
          <button
            type="button"
            onClick={() => jump(0.1)}
            className="liquid-glass pointer-events-auto mt-7 rounded-full px-8 py-3.5 text-xs tracking-[0.2em] text-white/90 uppercase sm:px-10 sm:py-4"
          >
            {t.begin}
          </button>
        </div>
        <div data-hint className="pointer-events-none absolute end-6 bottom-8 hidden items-center gap-3 font-mono text-[11px] tracking-[0.16em] text-white/80 uppercase md:flex">
          <span className="block h-8 w-px animate-pulse bg-white/80" />
          {t.scroll}
        </div>

        <div data-pan className="pointer-events-none invisible absolute start-[var(--gutter)] top-[18vh] max-w-[min(560px,86vw)]">
          <p className="font-garamond text-[clamp(26px,2.7vw,40px)] leading-[1.15] text-white [text-shadow:0_2px_24px_rgba(20,15,5,.55)]">{words(t.pan)}</p>
        </div>

        <div data-piv className="pointer-events-none invisible absolute start-[var(--gutter)] top-[16vh] max-w-[min(560px,86vw)] text-white [text-shadow:0_2px_24px_rgba(20,15,5,.55)]">
          <p className="font-garamond text-[clamp(34px,4vw,60px)] leading-[1.05]">{words(t.pivT)}</p>
          <p className="mt-4 text-[17px] leading-relaxed text-white/90">{words(t.pivP)}</p>
        </div>

        {SEASONS[lang].map(([name, sub], k) => (
          <div key={name} data-season className="pointer-events-none absolute end-[var(--gutter)] top-24 text-end text-white opacity-0 [text-shadow:0_2px_30px_rgba(10,10,5,.45)] md:top-28">
            <p className="font-garamond text-[clamp(40px,5.2vw,80px)] leading-none">{name}</p>
            <p className="mt-2 font-mono text-xs tracking-[0.3em] text-white/85 uppercase">
              {String(k + 1).padStart(2, "0")} · {sub}
            </p>
          </div>
        ))}

        <div data-hud className="pointer-events-none absolute start-[var(--gutter)] top-24 font-mono text-[11px] leading-[1.9] tracking-[0.14em] text-white uppercase opacity-0 [text-shadow:0_1px_8px_rgba(0,0,0,.45)] md:top-28">
          <p className="mb-1 inline-block bg-green-700 px-2 text-[10px] text-sand-50 [text-shadow:none]">{t.sim}</p>
          <p>
            {t.day} <span data-hud-day>000</span> / 270
          </p>
          <p>
            {t.season} — <span data-hud-season>—</span>
          </p>
        </div>

        {/* world-anchored hotspots */}
        {t.hs.map(([label, sub, brand]) => (
          <div key={label} data-hs className="invisible absolute top-0 left-0" onClick={(e) => (e.currentTarget as HTMLElement).classList.toggle("on")}>
            <div className="flex -translate-x-[11px] -translate-y-[11px] cursor-pointer items-start gap-2">
              <span className="relative grid size-[22px] shrink-0 place-items-center rounded-full bg-green-700 text-sand-50 ring-2 ring-sand-50 transition hover:scale-110">
                <span className="absolute inset-0 animate-ping rounded-full bg-green-700/45" />
                <span className="relative text-sm leading-none">+</span>
              </span>
              <span className="rounded bg-sand-50/90 px-2.5 py-1.5 font-mono text-[10.5px] tracking-[0.14em] text-ink-900 uppercase backdrop-blur">
                {label}
                <span className="block text-green-700">{sub}</span>
                <em data-hs-val className="block max-h-0 overflow-hidden text-green-700 not-italic transition-[max-height] duration-500">
                  {brand}
                </em>
              </span>
            </div>
          </div>
        ))}

        <div data-harv className="pointer-events-none absolute start-[var(--gutter)] top-[16vh] max-w-[min(520px,86vw)] text-white opacity-0 [text-shadow:0_2px_24px_rgba(20,15,5,.55)]">
          <p className="font-garamond text-[clamp(34px,4vw,60px)] leading-[1.05]">{t.harvT}</p>
          <p className="mt-4 text-[17px] leading-relaxed text-white/90">{t.harvP}</p>
        </div>

        {/* services strip (KV-style), slides in from the right, text sweeps green → white */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34vh] min-h-[220px] bg-gradient-to-t from-black/70 via-black/35 to-transparent" />
        <div data-strip className="invisible absolute bottom-[6vh] left-0 flex gap-0 pe-[10vw] text-white">
          {t.cards.map(([title, body, path], i) => (
            <Link
              key={title}
              href={href(path, lang)}
              data-card
              className={`pointer-events-auto block w-[min(300px,72vw)] px-7 ${i ? "border-s border-white/15" : ""}`}
            >
              <p className="sweep font-garamond text-[clamp(30px,3vw,44px)] leading-none">{title}</p>
              <p className="sweep mt-3 text-[14px] leading-relaxed">{body}</p>
              <span className="sweep mt-4 inline-block font-mono text-[11px] tracking-[0.16em] uppercase">→</span>
            </Link>
          ))}
        </div>

        <div data-end className="invisible absolute top-[22vh] left-1/2 w-[min(640px,90vw)] text-center text-white opacity-0 [text-shadow:0_2px_30px_rgba(10,10,5,.5)]">
          <p className="font-garamond text-[clamp(52px,7vw,110px)] leading-none">{t.endT}</p>
          <p className="mt-5 text-white/85">{t.endP}</p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <button type="button" onClick={() => openContact()} className="liquid-glass rounded-full px-10 py-4 text-xs tracking-[0.2em] text-white uppercase">
              {t.talk}
            </button>
            <span className="font-mono text-[11px] tracking-[0.16em] text-white/70 uppercase">↔ {t.drag}</span>
          </div>
        </div>

        {/* chapter jumps */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center px-3 md:bottom-5">
          <div className="liquid-glass flex max-w-full gap-1 overflow-x-auto rounded-full p-1 no-scrollbar">
            {t.jump.map((j, i) => (
              <button
                key={j}
                type="button"
                data-jump
                onClick={() => jump(JUMP_AT[i])}
                className="shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-white/85 uppercase transition hover:bg-white/20 md:px-4"
              >
                {j}
              </button>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute top-[72px] left-1/2 h-[2px] w-[120px] -translate-x-1/2 overflow-hidden rounded bg-white/25 md:top-[86px]">
          <div data-prog className="h-full origin-left bg-[#c6f35c]" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </section>
  );
}
