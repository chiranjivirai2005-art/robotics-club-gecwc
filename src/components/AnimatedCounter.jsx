"use client";

import { useEffect, useMemo } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function AnimatedCounter({ value, className = "" }) {
  const { target, suffix, isNumeric } = useMemo(() => {
    if (typeof value === "number") {
      return { target: value, suffix: "", isNumeric: true };
    }

    const match = String(value).match(/^(\d+)(.*)$/);
    if (!match) {
      return { target: 0, suffix: String(value), isNumeric: false };
    }

    return {
      target: Number(match[1]),
      suffix: match[2] || "",
      isNumeric: true,
    };
  }, [value]);

  const spring = useSpring(0, { stiffness: 90, damping: 22, mass: 0.7 });
  const display = useTransform(spring, (latest) => `${Math.round(latest)}${suffix}`);

  useEffect(() => {
    spring.set(target);
  }, [spring, target]);

  if (!isNumeric) {
    return <span className={className}>{value}</span>;
  }

  return <motion.span className={className}>{display}</motion.span>;
}
