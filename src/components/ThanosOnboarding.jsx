import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Infinity War Thanos Snap disintegration effect:
 * 1. Captures the card via html2canvas (fast scale:1) for true pixel color sampling & crumbling edge,
 *    with a live DOM clip-path fallback so the card ALWAYS visibly turns to ash left-to-right.
 * 2. Renders particles in a body-portaled fixed canvas so parent `overflow-hidden` containers
 *    (like ActivityHeatmap or modals) never clip the billowing ash cloud.
 * 3. Smoothly collapses height & margin once dissolved, then calls onDone().
 */
export function ThanosDisintegrate({ children, shouldDisintegrate, onDone, marginBottom = '1.25rem' }) {
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const onDoneRef = useRef(onDone);
  const startedRef = useRef(false);
  const collapsingRef = useRef(false);

  const [phase, setPhase] = useState('idle'); // 'idle' | 'snapping' | 'collapsing' | 'done'
  const [collapseHeight, setCollapseHeight] = useState(null);
  const [snapMetrics, setSnapMetrics] = useState(null); // { left, top, w, h, canvasW, canvasH, padTop, snapshot }
  const [domClipFallback, setDomClipFallback] = useState(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // Step 1: Capture snapshot & element screen rect when triggered
  useEffect(() => {
    if (!shouldDisintegrate || startedRef.current) return;
    startedRef.current = true;

    const el = cardRef.current;
    if (!el) {
      setPhase('done');
      onDoneRef.current?.();
      return;
    }

    const rect = el.getBoundingClientRect();
    const W = Math.round(rect.width);
    const H = Math.round(rect.height);

    if (W <= 0 || H <= 0) {
      setPhase('done');
      onDoneRef.current?.();
      return;
    }

    const PADDING_TOP = 72;
    const PADDING_RIGHT = 110;
    const CANVAS_W = W + PADDING_RIGHT;
    const CANVAS_H = H + PADDING_TOP;

    setCollapseHeight(H);

    let cancelled = false;
    let launched = false;

    const launch = (snapshotCanvas) => {
      if (cancelled) return;
      const freshRect = el.getBoundingClientRect();
      setSnapMetrics({
        left: freshRect.left,
        top: freshRect.top,
        w: W,
        h: H,
        canvasW: CANVAS_W,
        canvasH: CANVAS_H,
        padTop: PADDING_TOP,
        snapshot: snapshotCanvas || null,
      });
      setPhase('snapping');
    };

    const fallbackTimer = setTimeout(() => {
      if (!launched) {
        launched = true;
        launch(null);
      }
    }, 800);

    import('html2canvas')
      .then(({ default: html2canvas }) =>
        html2canvas(el, {
          backgroundColor: null,
          scale: 1,
          useCORS: true,
          logging: false,
          ignoreElements: (node) => node.tagName === 'CANVAS',
        })
      )
      .then((snap) => {
        if (!launched && !cancelled) {
          launched = true;
          clearTimeout(fallbackTimer);
          launch(snap);
        }
      })
      .catch(() => {
        if (!launched && !cancelled) {
          launched = true;
          clearTimeout(fallbackTimer);
          launch(null);
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
    };
  }, [shouldDisintegrate]);

  // Step 2: Run the canvas particle & crumbling-wave loop once the portaled canvas is mounted
  useEffect(() => {
    if (!snapMetrics || phase === 'idle' || phase === 'done') return;
    if (animFrameRef.current) return; // already running across 'snapping' -> 'collapsing'

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { w: W, h: H, canvasW: CANVAS_W, canvasH: CANVAS_H, padTop: PADDING_TOP, snapshot: snapshotCanvas } = snapMetrics;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setPhase('done');
      onDoneRef.current?.();
      return;
    }

    let sampleColors = [
      'rgba(148, 163, 184, 0.92)',
      'rgba(100, 116, 139, 0.95)',
      'rgba(71, 85, 105, 0.95)',
      'rgba(51, 65, 85, 0.98)',
      'rgba(16, 185, 129, 0.9)',
      'rgba(245, 158, 11, 0.95)',
      'rgba(251, 191, 36, 0.95)',
    ];
    let validSnapshot = null;

    if (snapshotCanvas && snapshotCanvas.width > 0 && snapshotCanvas.height > 0) {
      try {
        const sCtx = snapshotCanvas.getContext('2d');
        const imgData = sCtx.getImageData(
          0,
          0,
          Math.min(W, snapshotCanvas.width),
          Math.min(H, snapshotCanvas.height)
        );
        const data = imgData.data;
        const extracted = [];
        const stride = Math.max(4, Math.floor(data.length / 4 / 380) * 4);
        for (let i = 0; i < data.length; i += stride) {
          if (data[i + 3] > 35) {
            extracted.push(`rgba(${data[i]},${data[i + 1]},${data[i + 2]},${(data[i + 3] / 255).toFixed(2)})`);
          }
        }
        if (extracted.length > 24) {
          sampleColors = extracted;
          validSnapshot = snapshotCanvas;
        }
      } catch {
        // Keep rich ash/ember fallback palette & live DOM clip-path
      }
    }
    setDomClipFallback(!validSnapshot);

    const DURATION = 2100;
    const PARTICLE_COUNT = 1400;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const originX = Math.random() * W;
      const originY = Math.random() * H;
      const waveDelay = (originX / W) * (DURATION * 0.52) + (Math.random() - 0.5) * 140;
      const isEmber = Math.random() < 0.15;
      const color = isEmber
        ? (Math.random() < 0.5 ? 'rgba(251, 191, 36, 0.95)' : 'rgba(249, 115, 22, 0.9)')
        : sampleColors[Math.floor(Math.random() * sampleColors.length)];
      const size = isEmber ? (1.5 + Math.random() * 2.6) : (1.6 + Math.random() * 3.8);
      const angle = -Math.PI * 0.27 + (Math.random() - 0.5) * 0.55;
      const speed = 1.25 + Math.random() * 3.7;

      particles.push({
        x: originX,
        y: originY + PADDING_TOP,
        vx: Math.cos(angle) * speed + Math.random() * 0.7,
        vy: Math.sin(angle) * speed - (0.7 + Math.random() * 1.75),
        curl: (Math.random() - 0.5) * 0.085,
        size,
        color,
        delay: Math.max(0, waveDelay),
        life: 750 + Math.random() * 900,
      });
    }

    const startTime = performance.now();

    const render = (now) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const waveProgress = Math.min(1, elapsed / (DURATION * 0.54));
      const waveX = waveProgress * (W + 36);

      if (!validSnapshot && cardRef.current) {
        const pct = Math.min(100, (waveX / Math.max(1, W)) * 100);
        cardRef.current.style.clipPath = `inset(0 0 0 ${pct}%)`;
      }

      if (validSnapshot && waveProgress < 1) {
        ctx.save();
        ctx.translate(0, PADDING_TOP);
        ctx.beginPath();
        ctx.moveTo(waveX, 0);
        const steps = 20;
        for (let s = 0; s <= steps; s++) {
          const py = (H / steps) * s;
          const jitter = Math.sin(s * 2.1 + elapsed * 0.013) * 14 + Math.cos(s * 3.1) * 7;
          ctx.lineTo(waveX + jitter, py);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(W, 0);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(validSnapshot, 0, 0, validSnapshot.width, validSnapshot.height, 0, 0, W, H);
        ctx.restore();
      }

      // Glowing Infinity War ember seam along the crumbling edge
      if (waveProgress < 1) {
        ctx.save();
        ctx.translate(0, PADDING_TOP);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        const steps = 20;
        for (let s = 0; s <= steps; s++) {
          const py = (H / steps) * s;
          const jitter = Math.sin(s * 2.1 + elapsed * 0.013) * 14 + Math.cos(s * 3.1) * 7;
          if (s === 0) ctx.moveTo(waveX + jitter, py);
          else ctx.lineTo(waveX + jitter, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (elapsed < p.delay) continue;
        const age = elapsed - p.delay;
        if (age > p.life) continue;

        const prog = age / p.life;
        const alpha = (1 - prog) * (1 - Math.pow(prog, 1.7));

        p.vx += p.curl;
        p.vy -= 0.032;
        p.x += p.vx;
        p.y += p.vy;

        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = p.color;
        const s = p.size * (1 - prog * 0.45);
        ctx.fillRect(p.x, p.y, s, s);
      }
      ctx.globalAlpha = 1;

      if (elapsed > DURATION * 0.56 && !collapsingRef.current) {
        collapsingRef.current = true;
        setPhase('collapsing');
      }

      if (elapsed < DURATION) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        animFrameRef.current = null;
        setPhase('done');
        onDoneRef.current?.();
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [snapMetrics]);

  if (phase === 'done') return null;

  const useDomClip = domClipFallback || (snapMetrics && !snapMetrics.snapshot);
  const showLiveDom = phase === 'idle' || (phase === 'snapping' && useDomClip);

  return (
    <div
      style={{
        position: 'relative',
        overflow: phase === 'collapsing' ? 'hidden' : 'visible',
        height: phase === 'collapsing' ? 0 : (collapseHeight !== null ? `${collapseHeight}px` : 'auto'),
        opacity: phase === 'collapsing' ? 0 : 1,
        marginBottom: phase === 'collapsing' ? 0 : marginBottom,
        transition:
          phase === 'collapsing'
            ? 'height 550ms cubic-bezier(0.4, 0, 0.2, 1), margin-bottom 550ms cubic-bezier(0.4, 0, 0.2, 1), opacity 450ms ease'
            : 'none',
      }}
    >
      <div
        ref={cardRef}
        style={{
          visibility: showLiveDom ? 'visible' : 'hidden',
          display: phase === 'collapsing' ? 'none' : 'block',
        }}
      >
        {children}
      </div>

      {snapMetrics && phase !== 'idle' && typeof document !== 'undefined' && createPortal(
        <canvas
          ref={canvasRef}
          width={snapMetrics.canvasW}
          height={snapMetrics.canvasH}
          style={{
            position: 'fixed',
            top: snapMetrics.top - snapMetrics.padTop,
            left: snapMetrics.left,
            width: `${snapMetrics.canvasW}px`,
            height: `${snapMetrics.canvasH}px`,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />,
        document.body
      )}
    </div>
  );
}

const ACCENT_CLASSES = {
  emerald: {
    dark: 'bg-emerald-950/35 border-emerald-500/30',
    light: 'bg-emerald-50/90 border-emerald-200',
    icon: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    eyebrow: 'text-emerald-500',
    btnDark: 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/35 text-emerald-300',
    btnLight: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-800',
  },
  cyan: {
    dark: 'bg-cyan-950/30 border-cyan-500/30',
    light: 'bg-cyan-50/90 border-cyan-200',
    icon: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    eyebrow: 'text-cyan-400',
    btnDark: 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/35 text-cyan-300',
    btnLight: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300 text-cyan-800',
  },
  blue: {
    dark: 'bg-blue-950/30 border-blue-500/30',
    light: 'bg-blue-50/90 border-blue-200',
    icon: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    eyebrow: 'text-blue-400',
    btnDark: 'bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/35 text-blue-300',
    btnLight: 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800',
  },
  amber: {
    dark: 'bg-amber-950/30 border-amber-500/30',
    light: 'bg-amber-50/90 border-amber-200',
    icon: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    eyebrow: 'text-amber-500',
    btnDark: 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/35 text-amber-300',
    btnLight: 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800',
  },
  purple: {
    dark: 'bg-purple-950/30 border-purple-500/30',
    light: 'bg-purple-50/90 border-purple-200',
    icon: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    eyebrow: 'text-purple-400',
    btnDark: 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/35 text-purple-300',
    btnLight: 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800',
  },
};

export function TutorialTipCard({
  isVisible,
  isSnapping,
  onDismiss,
  onSnapDone,
  theme,
  accent = 'emerald',
  icon,
  eyebrow,
  title,
  description,
  badges = [],
  marginBottom = '1rem',
}) {
  if (!isVisible && !isSnapping) return null;
  const dk = theme === 'dark';
  const style = ACCENT_CLASSES[accent] || ACCENT_CLASSES.emerald;

  return (
    <ThanosDisintegrate
      shouldDisintegrate={isSnapping}
      onDone={onSnapDone}
      marginBottom={marginBottom}
    >
      <div
        className={`rounded-2xl border p-3.5 sm:p-4 transition-colors shadow-sm ${
          dk ? style.dark : style.light
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${style.icon}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[9px] font-black uppercase tracking-[0.18em] ${style.eyebrow}`}>
                  {eyebrow}
                </span>
                <span className={`text-xs font-black ${dk ? 'text-white' : 'text-slate-800'}`}>
                  {title}
                </span>
              </div>
              <p className={`text-[11px] font-medium leading-relaxed mt-0.5 ${dk ? 'text-slate-300' : 'text-slate-600'}`}>
                {description}
              </p>
              {badges.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {badges.map((b, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                        dk ? 'bg-slate-900/70 border-slate-700/80 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            disabled={isSnapping}
            className={`shrink-0 self-end sm:self-center px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 ${
              dk ? style.btnDark : style.btnLight
            }`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </ThanosDisintegrate>
  );
}
