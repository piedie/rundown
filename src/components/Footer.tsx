import fs from "node:fs";
import path from "node:path";

function readVersion(): string {
  try {
    const p = path.join(process.cwd(), "VERSION");
    return fs.readFileSync(p, "utf8").trim();
  } catch {
    return "unknown";
  }
}

export function Footer() {
  const version = readVersion();
  return (
    <footer className="w-full border-t border-zinc-200 px-4 py-3 text-sm text-zinc-600">
      Rundown App — <span className="font-mono">{version}</span>
    </footer>
  );
}
