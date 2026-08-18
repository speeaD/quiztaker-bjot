"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

interface CounterProps {
  /** e.g. "368", "30k+", "5k+", "4+" — the leading number is animated, everything else is preserved */
  value: string;
  duration?: number;
  className?: string;
}

export function Counter({ value, duration = 1.4, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion || !isInView) {
      if (!isInView) node.textContent = value;
      return;
    }

    const match = value.match(/[\d.]+/);
    if (!match) {
      node.textContent = value;
      return;
    }

    const numeric = parseFloat(match[0]);
    const prefix = value.slice(0, match.index);
    const suffix = value.slice((match.index ?? 0) + match[0].length);
    const isDecimal = match[0].includes(".");

    const controls = animate(0, numeric, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        const formatted = isDecimal ? latest.toFixed(1) : Math.round(latest).toString();
        node.textContent = `${prefix}${formatted}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}