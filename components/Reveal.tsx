"use client";

import { motion } from "motion/react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: RevealProps) {
  const offsets = {
    up:    { y: 32, x: 0 },
    down:  { y: -32, x: 0 },
    left:  { y: 0, x: 32 },
    right: { y: 0, x: -32 },
    none:  { y: 0, x: 0 },
  };

  const { x, y } = offsets[direction];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1], // spring-like easing
      }}
    >
      {children}
    </motion.div>
  );
}
