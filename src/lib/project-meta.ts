import type { Project } from "../data/portfolio";

export function projectMetaLine(p: Pick<Project, "period" | "status">): string {
  return `${p.period} · 상태: ${p.status}`;
}
