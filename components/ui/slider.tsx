"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SliderProps = {
  value: number[];
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number[]) => void;
  className?: string;
};

export function Slider({ value, min, max, step = 1, onValueChange, className }: SliderProps) {
  const current = value[0] ?? min;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={current}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={cn("h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-slate-900", className)}
    />
  );
}
