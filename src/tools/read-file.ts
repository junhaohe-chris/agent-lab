import { readFile as fsReadFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = await realpath(process.cwd());

const BLOCKED = new Set([
    "node_modules",
    ".git",
    ".env",
    "dist"
]);

export async function readFile(
    filePath: string
): Promise<string> {
    const resolved = path.resolve(ROOT, filePath);

    const relative = path.relative(ROOT, resolved);

    if (
        relative === ".." ||
        relative.startsWith(".." + path.sep) ||
        path.isAbsolute(relative)
    ) {
        throw new Error("Access denied: outside workspace");
    }

    if (
        relative.split(path.sep).some(
            (segment) =>
                BLOCKED.has(segment) ||
            segment.startsWith(".env.")
        )
    ) {
        throw new Error("Access denied: protected file");
    }

    //防止agent越过工作区
    const target = await realpath(resolved);
    const actualRelative = path.relative(ROOT, target);

    if (
        actualRelative === ".." ||
        actualRelative.startsWith(".." + path.sep) ||
        path.isAbsolute(actualRelative)
    ) {
        throw new Error("Access denied: outside workspace");
    }

    const info = await stat(target);

    if (!info.isFile()) {
        throw new Error("Target is not a file");
    }

    if (info.size > 16 * 1024) {
        throw new Error("File too large (max 16 KB)");
    }

    return fsReadFile(target, "utf-8");
}