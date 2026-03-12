import type { Variants } from "framer-motion";

export const slideInFromLeft = (delay = 0): Variants => ({
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay, duration: 0.6, ease: "easeOut" },
  },
});

export const slideInFromRight = (delay = 0): Variants => ({
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay, duration: 0.6, ease: "easeOut" },
  },
});

export const slideInFromTop: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.2, duration: 0.6, ease: "easeOut" },
  },
};

