---
name: Explore Codebase
description: Navigate and understand codebase structure using the graphify knowledge graph
---

## Explore Codebase

Use the graphify knowledge graph (`graphify-out/graph.json`) to explore and understand the codebase.

### Steps

1. If `graphify-out/` is missing or may be stale, run `graphify update .` first.
2. Read `graphify-out/GRAPH_REPORT.md` for high-level community structure.
3. Run `graphify god-nodes` to find the most connected modules.
4. Use `graphify query "<question>"` to find specific functions, classes, or flows.
5. Use `graphify path "A" "B"` to trace how two things connect.
6. Use `graphify explain "X"` to understand one node and its neighbors.
7. Use `graphify affected "X"` to see what a change to X impacts.

### Tips

- Start broad (report, god nodes) then narrow down to specific areas.
- Keep `graphify query` output small with `--budget N`.
- Fall back to Grep/Glob/Read only when the graph doesn't cover what you need.
