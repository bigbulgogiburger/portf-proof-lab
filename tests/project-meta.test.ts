import { test } from "node:test";
import assert from "node:assert/strict";
import { projectMetaLine } from "../src/lib/project-meta";
import { projects } from "../src/data/portfolio";

test("project detail metadata labels the status", () => {
  assert.equal(projectMetaLine({ period: "2025", status: "운영 중" }), "2025 · 상태: 운영 중");
  for (const p of projects) assert.match(projectMetaLine(p), / · 상태: /);
});
