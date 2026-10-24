# Codebase clusters

Lab-authored contract. The captured server returns clusters named after file-name words with their sizes, but does not expose its algorithm; this deterministic algorithm reproduces the observed behaviour and is implemented in `runtime/lib/codebase.mjs`.

## clusters

`#capability:codebase-clusters` — arguments `WorkspacePath` (also accepted as `workspacePath`; defaults to the workspace root) and `fileExtension` (`.tsx` or `tsx`).

1. List the workspace files with `git ls-files -co --exclude-standard`; outside git, walk the tree skipping `.git`, `node_modules`, `bin`, `obj`, `dist`, `build`, `coverage`, `.next` and `target`.
2. Keep the files with the extension.
3. Split each base name into words: drop the extension and a secondary suffix (`.test`, `.spec`, `.stories`, `.story`, `.module`, `.d`), split camelCase, PascalCase, digits and punctuation, lowercase, and drop one-letter and numeric words. `useCentralConstraints.tsx` gives `use`, `central`, `constraints`.
4. A file belongs to one cluster per word, so a file can be in several clusters.
5. Dissolve every cluster with fewer than **5** files (Lab-authored threshold). Files left in no cluster form `Uncategorized`.
6. Answer one line per cluster, largest first, then by name: `- <cluster> (<file count>)`.

The list is a snapshot of the working tree: it changes when files change.

## cluster-files

`#capability:codebase-cluster-files` — the same arguments plus `clusterName`. Answer the absolute paths of the cluster's files, one per line. A listed path exists.
