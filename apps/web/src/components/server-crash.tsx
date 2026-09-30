"use client";

import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";

// "Server Crash" event card: the old site blows up and collapses into a pile.
// Runs once per page load. Add ?live to the URL to skip it.

const NEW_PRODUCT_URL = process.env.NEXT_PUBLIC_NEW_PRODUCT_URL ?? "";
const MAX_BODIES = 140;

type Phase = "idle" | "alarm" | "boom" | "dead";

export function ServerCrash() {
  const [phase, setPhase] = useState<Phase>("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("live")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setPhase("dead"), 800);
      return () => clearTimeout(t);
    }

    let raf = 0;
    let engine: Matter.Engine | null = null;
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => {
        window.scrollTo(0, 0);
        setPhase("alarm");
        document.documentElement.classList.add("crash-alarm");
      }, 1400),
    );

    timers.push(
      setTimeout(() => {
        document.documentElement.classList.remove("crash-alarm");
        setPhase("boom");
        const run = explode(canvasRef.current);
        engine = run.engine;
        raf = run.raf();
      }, 3200),
    );

    timers.push(setTimeout(() => setPhase("dead"), 6600));

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      if (engine) Matter.Engine.clear(engine);
    };
  }, []);

  if (phase === "idle") return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" data-crash-ui>
      {phase === "alarm" && (
        <div className="crash-alarm-overlay absolute inset-0 flex items-start justify-center pt-24">
          <div className="crash-ticker rounded-full bg-no px-5 py-2 font-mono text-sm font-bold tracking-widest text-ink">
            ⚠ EVENT CARD: SERVER CRASH · CRITICAL FAILURE
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {phase === "boom" && <div className="crash-flash absolute inset-0 bg-white" />}
      {phase === "dead" && (
        <div className="crash-end pointer-events-auto absolute inset-0 flex flex-col items-center justify-center gap-6 bg-ink/75 px-6 text-center text-white backdrop-blur-[2px]">
          <span className="rounded-full bg-no px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-ink">EVENT CARD DRAWN</span>
          <h1 className="crash-glitch font-display text-[56px] font-extrabold leading-[0.9] tracking-tighter sm:text-[120px]" data-text="SERVER CRASH">
            SERVER CRASH
          </h1>
          <p className="max-w-md text-base text-[#d9d6ce] sm:text-lg">
            Viber Predict v1 is gone. Every line of it. We are rebuilding from zero — the new product is live.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {NEW_PRODUCT_URL ? (
              <a href={NEW_PRODUCT_URL} className="flex h-14 items-center justify-center rounded-full bg-lime px-8 text-[17px] font-semibold text-ink">
                Open the new product →
              </a>
            ) : (
              <span className="flex h-14 items-center justify-center gap-2 rounded-full bg-lime px-8 text-[17px] font-semibold text-ink">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                Rebuilding…
              </span>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-14 rounded-full border border-[#3a3b40] px-8 text-[15px]"
            >
              Replay the crash
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Turns the visible page into rigid bodies, blasts them from the centre and lets them pile up. */
function explode(canvas: HTMLCanvasElement | null) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const root = document.documentElement;
  root.classList.add("crash-dead");

  const picked = pickPieces(vw, vh);

  // Strip the chrome of containers left behind so no empty boxes hang in the air.
  const keep = new Set(picked);
  for (const el of picked) {
    let p = el.parentElement;
    while (p && p !== document.body && !keep.has(p)) {
      p.style.background = "transparent";
      p.style.borderColor = "transparent";
      p.style.boxShadow = "none";
      p.style.backdropFilter = "none";
      p = p.parentElement;
    }
  }

  const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.4 } });
  const wall = { isStatic: true, restitution: 0.2, friction: 0.8 };
  Matter.Composite.add(engine.world, [
    Matter.Bodies.rectangle(vw / 2, vh + 50, vw * 3, 100, wall),
    Matter.Bodies.rectangle(-50, vh / 2, 100, vh * 4, wall),
    Matter.Bodies.rectangle(vw + 50, vh / 2, 100, vh * 4, wall),
  ]);

  const cx = vw / 2;
  const cy = vh * 0.45;
  const pieces = picked.map((el) => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const body = Matter.Bodies.rectangle(x, y, Math.max(r.width, 6), Math.max(r.height, 6), {
      restitution: 0.35,
      friction: 0.6,
      frictionAir: 0.012,
      chamfer: { radius: Math.min(12, r.width / 4, r.height / 4) },
    });
    // Blast away from the epicentre, stronger for closer and lighter pieces.
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.max(60, Math.hypot(dx, dy));
    const power = (22 * 380) / (dist + 180) * (0.7 + Math.random() * 0.6);
    const mass = Math.sqrt(r.width * r.height) / 60;
    const k = power / Math.max(0.8, mass);
    Matter.Body.setVelocity(body, { x: (dx / dist) * k, y: (dy / dist) * k - 6 - Math.random() * 6 });
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.5);
    el.style.animation = "none";
    el.style.transition = "none";
    el.style.willChange = "transform";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.style.zIndex = "60";
    return { el, body, x0: x, y0: y };
  });
  Matter.Composite.add(engine.world, pieces.map((p) => p.body));

  const sparks = makeSparks(canvas, cx, cy, vw, vh);

  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(32, now - last);
    last = now;
    Matter.Engine.update(engine, dt);
    for (const p of pieces) {
      const { x, y } = p.body.position;
      p.el.style.transform = `translate(${x - p.x0}px, ${y - p.y0}px) rotate(${p.body.angle}rad)`;
    }
    sparks(dt);
    handle.id = requestAnimationFrame(frame);
  };
  const handle = { id: 0 };
  return {
    engine,
    raf: () => {
      handle.id = requestAnimationFrame(frame);
      return handle.id;
    },
  };
}

function hasChrome(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const bg = cs.backgroundColor;
  const solidBg = bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg);
  return solidBg || cs.backgroundImage !== "none" || parseFloat(cs.borderTopWidth) > 0;
}

function isLeafy(el: HTMLElement) {
  if (["IMG", "svg", "BUTTON", "INPUT", "TEXTAREA", "H1", "H2", "H3", "P", "LABEL"].includes(el.tagName)) return true;
  return !Array.from(el.children).some((c) => {
    const r = c.getBoundingClientRect();
    return r.width >= 8 && r.height >= 8;
  });
}

function pickPieces(vw: number, vh: number) {
  const maxArea = vw * vh * 0.4;
  const all = Array.from(document.body.querySelectorAll<HTMLElement>("*")).filter((el) => {
    if (el.closest("[data-crash-ui]")) return false;
    if (el instanceof SVGElement && el.tagName.toLowerCase() !== "svg") return false;
    if (["SCRIPT", "STYLE", "LINK", "META", "NOSCRIPT", "BR"].includes(el.tagName)) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return false;
    if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return false;
    return getComputedStyle(el).visibility !== "hidden";
  });
  const scored = all
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { el, area: r.width * r.height };
    })
    .sort((a, b) => b.area - a.area);

  // Pieces with their own look (cards, banners, buttons) fall whole; bare wrappers shatter into children.
  const chosen = new Set<HTMLElement>();
  for (const { el, area } of scored) {
    if (area > maxArea) continue;
    if (!hasChrome(el) && !isLeafy(el)) continue;
    let p = el.parentElement;
    let covered = false;
    while (p) {
      if (chosen.has(p)) {
        covered = true;
        break;
      }
      p = p.parentElement;
    }
    if (covered) continue;
    chosen.add(el);
    if (chosen.size >= MAX_BODIES) break;
  }
  return [...chosen];
}

/** Burst of brand-coloured sparks from the epicentre, drawn on the overlay canvas. */
function makeSparks(canvas: HTMLCanvasElement | null, cx: number, cy: number, vw: number, vh: number) {
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return () => {};
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = vw * dpr;
  canvas.height = vh * dpr;
  ctx.scale(dpr, dpr);
  const colors = ["#D7FF3D", "#FF5A1F", "#2459FF", "#FFB800", "#FFFFFF"];
  const ps = Array.from({ length: 220 }, () => {
    const a = Math.random() * Math.PI * 2;
    const s = 4 + Math.random() * 16;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 4,
      life: 1,
      decay: 0.006 + Math.random() * 0.012,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });
  let ring = 0;
  return (dt: number) => {
    const k = dt / 16.7;
    ctx.clearRect(0, 0, vw, vh);
    if (ring < 1) {
      ring = Math.min(1, ring + 0.03 * k);
      ctx.beginPath();
      ctx.arc(cx, cy, 40 + ring * Math.max(vw, vh), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(215,255,61,${0.6 * (1 - ring)})`;
      ctx.lineWidth = 18 * (1 - ring) + 2;
      ctx.stroke();
    }
    for (const p of ps) {
      if (p.life <= 0) continue;
      p.vy += 0.35 * k;
      p.vx *= 0.99;
      p.x += p.vx * k;
      p.y += p.vy * k;
      p.life -= p.decay * k;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size * 2);
    }
    ctx.globalAlpha = 1;
  };
}
