import { lstat, mkdir, realpath, writeFile as fsWriteFile } from "node:fs/promises";
import path from "node:path";

const ROOT = await realpath(process.cwd());

const BLOCKED = new Set([
    "node_modules",
    ".git",
    ".env",
    "dist",
  ]);

export async function writeFile(
    filePath: string,
    content: string
): Promise<string> {
    const target = path.resolve(ROOT, filePath);
    const relative = path.relative(ROOT, target);

    if (
        relative === "" ||
        relative === ".." ||
        relative.startsWith(".." + path.sep) ||
        path.isAbsolute(relative)
      ) {
        throw new Error("Access denied: outside workspace");
    }
    
    const parts = relative.split(path.sep);

    if (
        parts.some(
          (part) => BLOCKED.has(part)
        )
      ) {
        throw new Error("Access denied: protected file");
      }
    
    let current = ROOT;

    for (const part of parts) {
        current = path.join(current, part);

        try {
            const stat = await lstat(current);
            
            if (stat.isSymbolicLink()) {
                throw new Error("Access denied: symbolic link");
            }
        } catch (error) {
            if (
                (error as NodeJS.ErrnoException).code !="ENOENT"
            ) {
                throw error;
            }
        break;
        }
    }

    await mkdir(path.dirname(target), {
        recursive: true,
      });

    await fsWriteFile(target, content, "utf-8");

    return `Successfully wrote file: ${filePath}`;
}