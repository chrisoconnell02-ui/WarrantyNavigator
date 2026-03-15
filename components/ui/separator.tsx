import * as React from "react";
import { cn } from "@/lib/utils";

export function Separator({ className, orientation = "horizontal", ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      className={cn(orientation === "horizontal" ? "h-px w-full" : "h-full w-px", "bg-slate-200", className)}
      {...props}
    />
  );
}
