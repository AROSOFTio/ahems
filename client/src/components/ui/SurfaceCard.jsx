import { cn } from "../../utils/cn";

export function SurfaceCard({ className, children }) {
  return <section className={cn("panel-surface glass-outline", className)}>{children}</section>;
}

