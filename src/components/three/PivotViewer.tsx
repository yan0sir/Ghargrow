"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ScrollTrigger } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { ContactButton } from "@/components/contact/ContactButton";
import { buildPivot, setGroupOpacity, DIM, pipeY, STEP_INFO } from "./pivotModel";

/*
 * Scroll-driven assembly of a Western CP600 one-span centre pivot.
 * Pinned section: each scroll step drops the next assembly in place while the camera
 * frames it; at the end the finished pivot walks its circle and can be orbited by dragging.
 */
const ASSEMBLE_END = 0.8; // share of the pinned scroll spent assembling; the rest shows it running

type Key = { pos: [number, number, number]; tgt: [number, number, number] };
const KEYS: Key[] = [
  { pos: [-10, 7.5, 15], tgt: [0, 2.8, 0] }, // pivot point
  { pos: [4, 17, 36], tgt: [19, 3.5, 0] }, // span pipe
  { pos: [15, 1.8, 13], tgt: [20, 3.4, 0] }, // truss (from below)
  { pos: [49, 5.5, 14], tgt: [38.4, 2.4, 0] }, // drive tower
  { pos: [29, 6.5, 16], tgt: [36, 3, 0] }, // braces
  { pos: [53, 9.5, 13], tgt: [40.5, 4.2, 0] }, // overhang
  { pos: [19, 4.5, 16], tgt: [22, 2.4, 0] }, // drops
];
const FINAL: Key = { pos: [6, 62, 78], tgt: [4, 0, 0] };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function PivotViewer() {
  const { d, lang } = useSite();
  const root = useRef<HTMLElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const n = 7;

  const steps = STEP_INFO;

  useEffect(() => {
    const el = holder.current!;
    const lite = document.documentElement.classList.contains("lite");
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xe9e1d2, 70, 170);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400);

    scene.add(new THREE.HemisphereLight(0xdce7f5, 0x8a7a55, 1.1));
    const sun = new THREE.DirectionalLight(0xfff1dc, 2.4);
    sun.position.set(-30, 45, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 140 });
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    // ground: sand, the irrigated circle, wheel track
    const ground = new THREE.Mesh(new THREE.CircleGeometry(170, 64), new THREE.MeshStandardMaterial({ color: 0xd8c39a, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const field = new THREE.Mesh(new THREE.CircleGeometry(DIM.total + 1.5, 96), new THREE.MeshStandardMaterial({ color: 0x6f9a38, roughness: 0.95 }));
    field.rotation.x = -Math.PI / 2;
    field.position.y = 0.01;
    field.receiveShadow = true;
    scene.add(field);
    const track = new THREE.Mesh(
      new THREE.RingGeometry(DIM.tower - 0.35, DIM.tower + 0.35, 128),
      new THREE.MeshStandardMaterial({ color: 0x9b8458, roughness: 1 }),
    );
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.02;
    track.receiveShadow = true;
    scene.add(track);
    const pad = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), new THREE.MeshStandardMaterial({ color: 0xbdb7aa, roughness: 0.9 }));
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.03;
    pad.receiveShadow = true;
    scene.add(pad);

    // the machine
    const { steps: parts, wheels, heads } = buildPivot();
    const rig = new THREE.Group();
    parts.forEach((p) => rig.add(p.group));
    // water: translucent spray umbrellas under each sprinkler (+ end gun arc)
    const waterMat = new THREE.MeshStandardMaterial({ color: 0xd8ecff, transparent: true, opacity: 0, roughness: 0.2, depthWrite: false });
    const sprays = new THREE.Group();
    heads.forEach((h) => {
      const c = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.35, 24, 1, true), waterMat);
      c.position.set(h.x, h.y - 0.68, h.z);
      sprays.add(c);
    });
    const arc = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.06, 6, 30, Math.PI * 0.75), waterMat);
    arc.position.set(DIM.total + 2.6, pipeY(DIM.total) - 1.6, 0);
    arc.rotation.z = Math.PI * 0.1;
    sprays.add(arc);
    rig.add(sprays);
    scene.add(rig);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.enabled = false;

    const lerpKey = (t: number) => {
      const i = Math.min(KEYS.length - 1, Math.floor(t));
      const j = Math.min(KEYS.length - 1, i + 1);
      // hold on each part while it drops in, then glide to the next view in the last 40% of the step
      const f = ease(clamp((t - i - 0.6) / 0.4));
      const a = KEYS[i],
        b = KEYS[j];
      return {
        pos: new THREE.Vector3(...a.pos).lerp(new THREE.Vector3(...b.pos), f),
        tgt: new THREE.Vector3(...a.tgt).lerp(new THREE.Vector3(...b.tgt), f),
      };
    };

    let progress = lite ? 1 : 0;
    let raf = 0;
    let spinAngle = 0;
    let lastStep = -2;
    let lastDone = false;
    let freeCam = false;
    let mx = 0,
      my = 0,
      px = 0,
      py = 0;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove);

    const st = lite
      ? null
      : ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "+=520%",
          pin: root.current!.querySelector("[data-stage]"),
          scrub: true,
          onUpdate: (s) => (progress = s.progress),
        });

    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // pull back on tall/narrow screens so the frame still fits
      camera.fov = w / h < 0.8 ? 55 : 38;
      // desktop: shift the frame so the machine sits right of the text column
      if (w / h > 1.1) camera.setViewOffset(w, h, -w * 0.14, 0, w, h);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const clock = new THREE.Clock();
    const tick = () => {
      const dt = Math.min(0.05, clock.getDelta());
      const t = (clamp(progress / ASSEMBLE_END) * n) as number; // 0..7
      // assembly: each part drops in and fades up in turn
      parts.forEach((p, i) => {
        const k = ease(clamp(t - i));
        p.group.position.y = (1 - k) * 7;
        setGroupOpacity(p.group, k);
      });
      const run = clamp((progress - ASSEMBLE_END) / (1 - ASSEMBLE_END));
      // running: the span walks its circle, wheels roll, water on
      if (run > 0.98) spinAngle += 0.06 * dt; // keeps walking slowly once fully revealed
      rig.rotation.y = -(run * 1.4 + spinAngle);
      wheels.forEach((w) => (w.rotation.z = -rig.rotation.y * (DIM.tower / DIM.wheelR)));
      waterMat.opacity = 0.32 * run;
      sprays.visible = run > 0.01;

      // camera
      if (run >= 0.999 && !freeCam) {
        freeCam = true;
        controls.target.set(...FINAL.tgt);
        controls.enabled = true;
      } else if (run < 0.999 && freeCam) {
        freeCam = false;
        controls.enabled = false;
      }
      if (!freeCam) {
        const k = progress < ASSEMBLE_END ? lerpKey(Math.min(n - 1, t)) : null;
        let pos: THREE.Vector3, tgt: THREE.Vector3;
        if (k) {
          pos = k.pos;
          tgt = k.tgt;
        } else {
          const last = lerpKey(n - 1);
          const f = ease(run);
          pos = last.pos.lerp(new THREE.Vector3(...FINAL.pos), f);
          tgt = last.tgt.lerp(new THREE.Vector3(...FINAL.tgt), f);
        }
        // scroll drives the camera directly (scrub already smooths it); pointer adds a little parallax
        px += (mx - px) * 0.08;
        py += (my - py) * 0.08;
        pos.x += px * 1.5;
        pos.y += -py * 1;
        camera.position.copy(pos);
        camera.lookAt(tgt);
      } else {
        controls.update();
      }

      const s = progress >= ASSEMBLE_END ? n : Math.min(n - 1, Math.floor(t));
      if (s !== lastStep) {
        lastStep = s;
        setStep(s);
      }
      const isDone = run > 0.3;
      if (isDone !== lastDone) {
        lastDone = isDone;
        setDone(isDone);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    if (lite) {
      camera.position.set(...FINAL.pos);
      controls.target.set(...FINAL.tgt);
      controls.enabled = true;
      freeCam = true;
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      st?.kill();
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          const mat = m.material as THREE.Material | THREE.Material[];
          (Array.isArray(mat) ? mat : [mat]).forEach((x) => x.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const current = step >= 0 && step < n ? steps[step] : null;

  return (
    <section ref={root} className="relative bg-sand-100" data-immersive>
      <div data-stage className="relative h-svh overflow-hidden" style={{ background: "linear-gradient(180deg,#9db8e3 0%,#dce7f5 45%,#efe4cf 80%,#e9e1d2 100%)" }}>
        <div ref={holder} className="absolute inset-0 cursor-grab active:cursor-grabbing [&>canvas]:size-full" />

        <div className="pointer-events-none absolute inset-x-0 top-0 px-[var(--gutter)] pt-24 md:pt-28">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-md">
              <h2 className="h1">{lang === "ar" ? "نظام ري محوري، قطعة بقطعة" : "A centre pivot, piece by piece"}</h2>
              <p className="mt-3 text-ink-700">
                {lang === "ar"
                  ? "Western CP600 بامتداد واحد — مرّر لترى كيف يُجمَّع، ثم اسحب لتدويره."
                  : "Western CP600, one span — scroll to watch it assemble, then drag to look around."}
              </p>
            </div>
            <div className="flex gap-2 font-mono text-xs text-ink-900">
              {[
                ["42.54 m", lang === "ar" ? "الطول" : "length"],
                ["5.64 m", lang === "ar" ? "الارتفاع" : "height"],
                ["5.18 m", lang === "ar" ? "العرض" : "width"],
              ].map(([v, l]) => (
                <span key={l} className="bg-sand-50/80 px-3 py-2 backdrop-blur">
                  <b className="block text-base font-medium">{v}</b>
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* step card */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-[var(--gutter)] pb-10">
          <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-6">
            <div className="pointer-events-auto max-w-sm bg-sand-50/85 p-5 backdrop-blur md:p-6">
              {current ? (
                <div key={current.key}>
                  <p className="font-mono text-xs text-green-700">
                    0{step + 1} / 0{n}
                  </p>
                  <p className="h3 mt-2">{current.title[lang]}</p>
                  <p className="mt-2 text-[15px] text-ink-700">{current.body[lang]}</p>
                </div>
              ) : (
                <div>
                  <p className="h3">{lang === "ar" ? "يعمل الآن" : "Up and running"}</p>
                  <p className="mt-2 text-[15px] text-ink-700">
                    {lang === "ar"
                      ? "يدور الامتداد حول المحور ويروي دائرة بنصف قطر 42.5 متراً تقريباً — نحو 0.57 هكتار."
                      : "The span walks around the pivot, watering a circle about 42.5 m in radius — roughly 0.57 ha."}
                  </p>
                  {done && (
                    <div className="mt-4">
                      <ContactButton topic={{ label: "Western CP600 pivot", kind: "quote", detail: "1 span, 42.54 m" }}>{d.cta.getQuote}</ContactButton>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="hidden gap-1.5 md:flex">
              {Array.from({ length: n }, (_, i) => (
                <span key={i} className={`h-1 w-8 transition-colors ${i <= step ? "bg-green-700" : "bg-ink-900/15"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
