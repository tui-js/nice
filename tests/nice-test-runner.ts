import { walk } from "./deps.ts";

// TODO: read keys y/n and fail if N
const currentPath = new URL(import.meta.resolve("./"));

for await (const file of walk(currentPath, { includeDirs: false, includeSymlinks: false, exts: ["nt.ts"] })) {
  const { render } = await import(file.path);

  render();
}
