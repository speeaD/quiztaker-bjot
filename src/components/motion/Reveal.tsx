"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { CSSProperties, ElementType, ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

/** Any tag framer-motion has a motion.* component for (motion.div, motion.ul, motion.li, ...) */
type MotionTag = keyof typeof motion;

const EASE = [0.22, 1, 0.36, 1] as const;

function offsetFor(direction: Direction, distance: number) {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    default:
      return {};
  }
}

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  style?: CSSProperties;
  as?: MotionTag;
}

/**
 * Fades + slides a block into place the first time it enters the viewport.
 * Wrap any section/element that should animate on scroll.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  distance = 28,
  once = true,
  amount = 0.2,
  className,
  style,
  as = "div",
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  const variants: Variants = {
    hidden: { opacity: 0, ...offsetFor(direction, distance) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, delay, ease: EASE },
    },
  };

  if (prefersReducedMotion) {
    const Tag = as as ElementType;
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
  as?: MotionTag;
}

/**
 * Wraps a list of StaggerItem children so they reveal one after another
 * as the group scrolls into view.
 */
export function StaggerGroup({
  children,
  className,
  style,
  stagger = 0.12,
  delayChildren = 0,
  once = true,
  amount = 0.15,
  as = "div",
}: StaggerGroupProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };

  if (prefersReducedMotion) {
    const Tag = as as ElementType;
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={container}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  direction?: Direction;
  distance?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  as?: MotionTag;
  "aria-label"?: string;
}

/** A single item inside a StaggerGroup. */
export function StaggerItem({
  children,
  direction = "up",
  distance = 24,
  duration = 0.5,
  className,
  style,
  as = "div",
  ...rest
}: StaggerItemProps) {
  const MotionTag = motion[as] as typeof motion.div;

  const variants: Variants = {
    hidden: { opacity: 0, ...offsetFor(direction, distance) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, ease: EASE },
    },
  };

  return (
    <MotionTag className={className} style={style} variants={variants} {...rest}>
      {children}
    </MotionTag>
  );
}