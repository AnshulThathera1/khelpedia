"use client";

import { AlertTriangle } from "lucide-react";

export default function MaintenanceBanner({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="w-full bg-amber-500/15 border-b border-amber-500/30 text-amber-200 px-4 py-2.5 text-xs flex items-center justify-center gap-2.5 text-center sticky top-0 z-50 backdrop-blur-md"
    >
      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
      <span className="font-semibold text-white">Maintenance Advisory:</span>
      <span>{message}</span>
    </div>
  );
}
