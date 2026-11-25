import React, { useRef, useLayoutEffect } from 'react';

export default function AutoFitText({
  text,
  maxFontSize = 14,
  minFontSize = 7,
  maxLines = 2,
  className = '',
  style = {},
}) {
  const boxRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const textEl = textRef.current;
    if (!box || !textEl) return;

    let cancelled = false;

    const fit = () => {
      if (cancelled || !box || !textEl) return;
      const availW = box.clientWidth;
      const availH = box.clientHeight;
      if (availW <= 0 || availH <= 0) return;

      const minSize = Math.max(6, Math.min(minFontSize, maxFontSize));
      const maxSize = Math.max(minSize, maxFontSize);

      textEl.style.lineHeight = '1.12';
      textEl.style.wordBreak = 'normal';
      textEl.style.overflowWrap = 'normal';

      const fitsAt = (size) => {
        textEl.style.fontSize = `${size}px`;
        const maxAllowedH = Math.min(availH, size * 1.12 * maxLines + 2);
        return (
          textEl.scrollWidth <= availW + 1 &&
          textEl.scrollHeight <= maxAllowedH + 1
        );
      };

      // Fast path: max size already fits
      if (fitsAt(maxSize)) return;

      let low = minSize;
      let high = maxSize;
      let best = minSize;

      while (high - low >= 0.5) {
        const mid = Math.round(((low + high) / 2) * 2) / 2;
        if (fitsAt(mid)) {
          best = mid;
          low = mid + 0.5;
        } else {
          high = mid - 0.5;
        }
      }

      textEl.style.fontSize = `${best}px`;

      // Fallback for single ultra-long words that still exceed width at minSize
      if (textEl.scrollWidth > availW + 1) {
        textEl.style.overflowWrap = 'anywhere';
      }
    };

    fit();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(box);

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(fit).catch(() => {});
    }

    return () => {
      cancelled = true;
      if (ro) ro.disconnect();
    };
  }, [text, maxFontSize, minFontSize, maxLines]);

  return (
    <div
      ref={boxRef}
      className="w-full flex items-center justify-center overflow-hidden"
      style={style}
    >
      <span
        ref={textRef}
        className={`block w-full text-center ${className}`}
      >
        {text}
      </span>
    </div>
  );
}
