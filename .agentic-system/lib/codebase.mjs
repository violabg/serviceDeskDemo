// Codebase clusters (contracts/codebase-clusters.md). Lab-authored, deterministic algorithm: a file belongs
// to one cluster per word of its base name; clusters with fewer than MIN_CLUSTER_SIZE files are dissolved
// and files left without a cluster go to `Uncategorized`.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { RuntimeError, arg, requireString } from "./util.mjs";

export const MIN_CLUSTER_SIZE = 5;
const WALK_EXCLUDES = new Set([".git", "node_modules", "bin", "obj", "dist", "build", "coverage", ".next", "target"]);
const SECONDARY_SUFFIXES = /\.(test|spec|stories|story|module|d)$/i;

function workspaceOf(ctx, args, tool) {
  const raw = arg(args, "WorkspacePath") ?? ctx.workspaceRoot;
  const workspace = isAbsolute(raw) ? raw : resolve(ctx.workspaceRoot, raw);
  if (!existsSync(workspace)) throw new RuntimeError(`${tool} failed: WorkspacePath does not exist: ${workspace}`);
  return workspace;
}

function extensionOf(args, tool) {
  const ext = requireString(arg(args, "fileExtension"), "fileExtension", tool);
  return ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
}

function listFiles(workspace) {
  try {
    return execFileSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], { cwd: workspace, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 256 * 1024 * 1024 })
      .split("\0")
      .filter(Boolean);
  } catch {
    const files = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir)) {
        if (WALK_EXCLUDES.has(entry)) continue;
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) walk(path);
        else files.push(relative(workspace, path).split("\\").join("/"));
      }
    };
    walk(workspace);
    return files;
  }
}

export function words(fileName, extension) {
  const base = fileName.slice(0, fileName.length - extension.length).replace(SECONDARY_SUFFIXES, "");
  const tokens = base
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 1 && !/^\d+$/.test(w));
  return [...new Set(tokens)];
}

export function buildClusters(ctx, args, tool) {
  const workspace = workspaceOf(ctx, args, tool);
  const extension = extensionOf(args, tool);
  const files = listFiles(workspace).filter((f) => f.toLowerCase().endsWith(extension));
  const clusters = new Map();
  for (const file of files) {
    for (const word of words(file.split("/").pop(), extension)) {
      if (!clusters.has(word)) clusters.set(word, []);
      clusters.get(word).push(file);
    }
  }
  for (const [word, members] of clusters) if (members.length < MIN_CLUSTER_SIZE) clusters.delete(word);
  const clustered = new Set([...clusters.values()].flat());
  const uncategorized = files.filter((f) => !clustered.has(f));
  if (uncategorized.length) clusters.set("Uncategorized", uncategorized);
  return { workspace, clusters };
}

export function clusters(ctx, args) {
  const { clusters } = buildClusters(ctx, args, "codebase-clusters");
  if (clusters.size === 0) return "No file with that extension exists in the workspace.";
  return [...clusters.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([name, members]) => `- ${name} (${members.length})`)
    .join("\n");
}

export function clusterFiles(ctx, args) {
  const tool = "codebase-cluster-files";
  const name = requireString(arg(args, "clusterName"), "clusterName", tool);
  const { workspace, clusters } = buildClusters(ctx, args, tool);
  const members = clusters.get(name) ?? clusters.get(name.toLowerCase());
  if (!members) throw new RuntimeError(`${tool} failed: cluster '${name}' does not exist; call codebase-clusters for the current list.`);
  return members.map((f) => join(workspace, f)).sort().join("\n");
}
