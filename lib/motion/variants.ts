import type { Variants, Transition } from "motion/react";

/**
 * Standard hardware-accelerated cubic-bezier transition for buttery smooth 60fps UI animations.
 */
export const standardTransition: Transition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
};

/**
 * Use for cards, section headlines, and content blocks entering the viewport with vertical elevation.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: standardTransition,
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.2 },
  },
};

/**
 * Use on parent containers wrapping grids, spec sheets, or card listings to orchestrate sequential child entrances.
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * Use for modals, dialogs, badges, and attention-grabbing tags scaling up smoothly into view.
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: standardTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

/**
 * Use for slide-over sidebars, mobile navigation sheets, and multi-step wizard form transitions.
 */
export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: standardTransition,
  },
  exit: {
    opacity: 0,
    x: -24,
    transition: { duration: 0.2 },
  },
};
