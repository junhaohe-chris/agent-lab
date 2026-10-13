import { lstat, realpath, writeFile as fsWriteFile } from "node:fs/promises";
import path from "node:path";

const ROOT = await realpath(process.cwd());

export async function writeFile(
    filePath: string,
    content: string
): Promise<string> {
    const target = path.resolve(ROOT, filePath);

    if (!target.startsWith(ROOT + path.sep)) {
        throw new Error("Access denied: outside workspace");
    }

    const relative = path.relative(ROOT, target);
    const parts = relative.split(path.sep);

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
        }
    }
    await fsWriteFile(target, content, "utf-8");

    return `Successfully wrote file: ${filePath}`;
}