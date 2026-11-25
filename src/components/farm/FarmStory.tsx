"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ScrollTrigger } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { buildBales, buildCombine, buildPivot, buildTractorCart, buildWheat, fieldMaterial, harvestPose, RIN, v3 } from "./models";

/*
 * "From sand to harvest": a short pinned overview. One pivot circle sits in the middle of the screen;
 * scroll waters it, grows the crop, ripens it and harvests it. Each stage's title and text sit to the
 * left or right of the model and show only while that stage is playing.
 */
const R = 40;
const RINGS = 5;
// stage windows on the journey's 0–1 progress
const STAGES: [number, number][] = [
  [0, 0.22], // water
  [0.22, 0.5], // grow
  [0.5, 0.66], // ripen
  [0.66, 1], // harvest
];

const COPY = {
  en: {
    title: "From Sand to Harvest",
    stages: [
      ["Water", "Western centre pivots turn bare sand into a field, laying an even layer of water across the whole circle."],
      ["Grow", "Within weeks the circle turns green. Seed and fertilizer from Ghargrow get the crop off to a strong start."],
      ["Ripen", "By early summer the grain turns gold and the field is ready for the combines."],
      ["Harvest", "CLAAS combines spiral in from the edge, an AXION and grain cart alongside, and Arcusin handles the bales."],
    ],
  },
  ar: {
    title: "من الرمال إلى الحصاد",
    stages: [
      ["الري", "تحوّل أنظمة Western المحورية الرمال الجرداء إلى حقل، بطبقة ماء متساوية على الدائرة كلها."],
      ["النمو", "خلال أسابيع تخضرّ الدائرة. بذور وأسمدة غرغار تمنح المحصول بداية قوية."],
      ["النضج", "مع بداية الصيف تصبح السنابل ذهبية ويصبح الحقل جاهزاً للحصادات."],
      ["الحصاد", "تدور حصادات CLAAS من الحافة نحو المركز، يرافقها جرار AXION وعربة حبوب، وتتولى Arcusin البالات."],
    ],
  },
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function FarmStory() {
  const { lang } = useSite();
  const t = COPY[lang];
  const root = useRef<HTMLElement>(null);
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = holder.current!;
    const rootEl = root.current!;
    const lite = document.documentElement.classList.contains("lite");
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      rootEl.style.display = "none";
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 1000);
    scene.add(new THREE.HemisphereLight(0xeef2f6, 0x9c8158, 1.4));
    const sun = new THREE.DirectionalLight(0xfff0d6, 2.4);
    sun.position.set(-60, 90, 40);
    scene.add(sun);

    /* one field: sand disc, crop, pivot, harvest machines */
    const fieldMat = fieldMaterial(R);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(R + 3, 128), fieldMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.09;
    scene.add(disc);
    const wheat = buildWheat(R, mobile ? 1.4 : 0.9);
    wheat.frustumCulled = false;
    const wheatMat = wheat.material as THREE.ShaderMaterial;
    scene.add(wheat);
    const pv = buildPivot(R);
    scene.add(pv.group);
    const comb = buildCombine();
    const cart = buildTractorCart();
    const BALES = 46;
    const bales = buildBales(BALES);
    bales.position.y = 0.23;
    scene.add(comb.group, cart.group, bales);
    const balePose = Array.from({ length: BALES }, (_, k) => {
      const s = (k + 0.6) / BALES;
      const p = harvestPose(R, RINGS, s);
      const out = (R - RIN) / RINGS / 2 + 0.6;
      return { s, x: Math.cos(p.a) * (p.r + out), z: Math.sin(p.a) * (p.r + out), heading: p.heading };
    });

    /* scroll: when it follows the photo strip, the stage first opens from the line the last photo closed to */
    let progress = lite ? 0.55 : 0;
    let sp = progress;
    const prev = rootEl.previousElementSibling as HTMLElement | null;
    const joined = !lite && !!prev?.matches("[data-pg]:not([data-still])") && window.matchMedia("(min-width: 768px)").matches;
    const REVEAL = joined ? 0.18 : 0;
    const stageEl = rootEl.querySelector("[data-stage]") as HTMLElement;
    if (joined) {
      rootEl.style.marginTop = "-100svh";
      rootEl.style.background = "linear-gradient(transparent 100svh, #f1f5f8 100svh)";
      stageEl.style.clipPath = "inset(50% 0 50% 0)";
    }
    const st = lite
      ? null
      : ScrollTrigger.create({
          trigger: rootEl,
          start: "top top",
          end: joined ? "+=330%" : "+=280%",
          pin: stageEl,
          scrub: true,
          onUpdate: (s) => {
            if (joined) {
              const k = clamp(s.progress / REVEAL);
              const c = 50 * (1 - k) ** 3;
              stageEl.style.clipPath = k >= 1 ? "" : `inset(${c}% 0 ${c}% 0)`;
            }
            progress = REVEAL ? clamp((s.progress - REVEAL) / (1 - REVEAL)) : s.progress;
          },
        });

    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const texts = Array.from(rootEl.querySelectorAll<HTMLElement>("[data-step]"));
    const mtx = new THREE.Matrix4();
    const qq = new THREE.Quaternion();
    const up = v3(0, 1, 0);
    const clock = new THREE.Clock();
    let raf = 0;

    const tick = () => {
      const dt = Math.min(0.05, clock.getDelta());
      const time = clock.elapsedTime;
      sp += (progress - sp) * (1 - Math.pow(0.86, (dt * 1000) / 16.7));
      if (Math.abs(progress - sp) < 0.0002) sp = progress;
      const p = sp;
      const water = clamp(p / STAGES[0][1]);
      const grow = clamp((p - STAGES[1][0]) / (STAGES[1][1] - STAGES[1][0]));
      const gold = clamp((p - STAGES[2][0]) / (STAGES[2][1] - STAGES[2][0]));
      const h = clamp((p - STAGES[3][0]) / (STAGES[3][1] - STAGES[3][0]));
      const cut = clamp((h - 0.1) / 0.85);

      /* pivot: sweeps the circle once while watering, keeps turning while the crop grows, then sits opposite the combine */
      const theta = p < STAGES[3][0] ? ease(water) * Math.PI * 2 + clamp((p - STAGES[1][0]) / 0.44) * Math.PI * 4 : cut * Math.PI * 2 * RINGS + Math.PI;
      pv.arm.rotation.y = -theta;
      pv.wheels.forEach((w, wi) => (w.rotation.z = -(theta * (R * ((wi >> 1) + 1)) / 3) / 0.67));
      const spray = pv.spray.material as THREE.ShaderMaterial;
      const sprayOn = clamp(water * 8) * (1 - clamp((p - STAGES[3][0]) * 30));
      spray.uniforms.uTime.value = time;
      spray.uniforms.uOn.value = sprayOn;
      spray.uniforms.uPx.value = renderer.getPixelRatio() * (el.clientHeight / 900);
      pv.mist.opacity = sprayOn * 0.09;
      pv.mist.visible = sprayOn > 0.01;

      fieldMat.uniforms.uSweep.value = p < STAGES[1][0] ? ease(water) * Math.PI * 2 : 7;
      fieldMat.uniforms.uGreen.value = clamp(grow / 0.6);
      fieldMat.uniforms.uGold.value = gold;
      fieldMat.uniforms.uCut.value = cut;
      wheat.visible = p >= STAGES[1][0];
      wheatMat.uniforms.uGrow.value = grow;
      wheatMat.uniforms.uGold.value = gold;
      wheatMat.uniforms.uCut.value = cut;
      wheatMat.uniforms.uTime.value = time;
      // brighter green while it grows, fading to gold as it ripens
      const lush = grow * (1 - gold) * 0.75;
      fieldMat.uniforms.uLush.value = lush;
      wheatMat.uniforms.uLush.value = lush;

      /* combine + cart: drive in, then spiral to the centre, dropping bales */
      const arrive = clamp(h / 0.1);
      const pose = harvestPose(R, RINGS, cut);
      let x = pose.x,
        z = pose.z,
        hd = pose.heading;
      if (arrive < 1) {
        z = THREE.MathUtils.lerp(-70, pose.z, ease(arrive));
        hd = Math.atan2(-1, 0);
      }
      comb.group.visible = cart.group.visible = bales.visible = p >= STAGES[3][0];
      comb.group.position.set(x, 0, z);
      comb.group.rotation.y = hd;
      comb.wheels.forEach((w) => (w.rotation.z = -(cut * 900 + arrive * 70)));
      if (comb.reel) comb.reel.rotation.z = -time * 3;
      const cp = harvestPose(R, RINGS, Math.max(0, cut - 0.004));
      cart.group.position.set(arrive < 1 ? x + 6 : Math.cos(cp.a) * (cp.r + 6), 0, arrive < 1 ? z - 6 : Math.sin(cp.a) * (cp.r + 6));
      cart.group.rotation.y = arrive < 1 ? hd : cp.heading;
      cart.wheels.forEach((w) => (w.rotation.z = -(cut * 1200 + arrive * 90)));
      balePose.forEach((b, k) => {
        const show = clamp((cut - b.s - 0.01) * 60);
        qq.setFromAxisAngle(up, b.heading);
        mtx.compose(v3(b.x, 0, b.z), qq, v3(show, show, show));
        bales.setMatrixAt(k, mtx);
      });
      bales.instanceMatrix.needsUpdate = true;

      /* camera: a slow orbit high over the circle */
      const azi = 0.9 + p * 0.8;
      const dist = mobile ? 200 : 175;
      camera.position.set(Math.cos(azi) * Math.cos(0.72) * dist, Math.sin(0.72) * dist, Math.sin(azi) * Math.cos(0.72) * dist);
      camera.lookAt(0, 0, 0);
      wheatMat.uniforms.uSun.value.copy(sun.position).normalize().transformDirection(camera.matrixWorldInverse);

      /* the stage's text shows only while that stage plays */
      texts.forEach((tx, i) => {
        const [a, b] = STAGES[i];
        const on = clamp((p - a + 0.02) / 0.04) * (i === 3 ? 1 : 1 - clamp((p - b + 0.02) / 0.04));
        tx.style.opacity = String(on);
        tx.style.transform = `translate3d(0, ${(1 - on) * 24}px, 0)`;
        tx.style.visibility = on > 0.01 ? "visible" : "hidden";
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      st?.kill();
      rootEl.style.marginTop = rootEl.style.background = stageEl.style.clipPath = "";
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

  // left column: stages 1 and 2; right column: stages 3 and 4 (like a spec sheet around the model)
  const step = (i: number, pos: string) => {
    const [title, body] = t.stages[i];
    return (
      <div
        key={i}
        data-step
        className={`invisible absolute w-[calc(100%-2*var(--gutter))] opacity-0 md:w-[min(320px,22vw)] ${pos}`}
      >
        <p className="font-mono text-[12px] tracking-[0.16em] text-green-700 uppercase">{String(i + 1).padStart(2, "0")}</p>
        <p className="h3 mt-2 border-b border-ink-900/15 pb-5">{title}</p>
        <p className="mt-5 text-[16px] leading-[1.5] text-pretty text-ink-900/70">{body}</p>
      </div>
    );
  };

  return (
    <section ref={root} className="relative bg-[#f1f5f8]">
      <div data-stage className="relative h-svh overflow-hidden bg-[#f1f5f8]">
        <h2 className="h2 absolute inset-x-0 top-[12svh] px-[var(--gutter)] text-center md:top-[10svh]">{t.title}</h2>
        <div ref={holder} className="absolute top-1/2 left-1/2 aspect-square w-[min(92vw,62svh)] -translate-x-1/2 -translate-y-[58%] md:w-[min(48vw,82svh)] md:-translate-y-[45%] [&>canvas]:size-full" />
        {step(0, "start-[var(--gutter)] bottom-[8svh] md:top-[32svh] md:bottom-auto")}
        {step(1, "start-[var(--gutter)] bottom-[8svh] md:top-[58svh] md:bottom-auto")}
        {step(2, "start-[var(--gutter)] bottom-[8svh] md:start-auto md:end-[var(--gutter)] md:top-[32svh] md:bottom-auto")}
        {step(3, "start-[var(--gutter)] bottom-[8svh] md:start-auto md:end-[var(--gutter)] md:top-[58svh] md:bottom-auto")}
      </div>
    </section>
  );
}
