import { readdir, realpath} from "node:fs/promises";
import path from "node:path";

const ROOT = await realpath(process.cwd());

const IGNORED = new Set([
    "node_modules",
    ".git",
    ".env",
    "dist"
]);

export async function listFiles(
    directory = "."
): Promise<string[]> {
    const target = await realpath(
        path.resolve(ROOT, directory)
    );

    if (target != ROOT && !target.startsWith(ROOT + path.sep)) {
        throw new Error("Access denied: outside workspace");
    }

    const entries = await readdir(target, {
        withFileTypes: true,
    });

    return entries
        .filter((entry) => !IGNORED.has(entry.name))
        .filter((entry) => !entry.isSymbolicLink())
        .map((entry) => {
            const suffix = entry.isDirectory() ? "/" : "";
            return entry.name + suffix;
        })
}