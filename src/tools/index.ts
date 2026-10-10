import type OpenAI from "openai";

import { listFiles } from "./list-files.ts";
import { readFile } from "./read-file.ts";

export const tools: OpenAI.Responses.Tool[] = [
    {
        type: "function",
        name: "list_files",
        description: "列出工作区指定目录下的文件和子目录",
        parameters: {
            type: "object",
            properties: {
                directory: {
                    type: "string",
                    description: "相对工作区根目录的路径，例如 . 或 src",
                },
            },
            required: ["directory"],
            additionalProperties: false,
        },
        strict: true,
    },
    {
        type: "function",
        name: "read_file",
        description: "读取工作区指定文本文件的内容",
        parameters: {
            type: "object",
            properties: {
                file_path: {
                    type: "string",
                    description: "相对工作区根目录的文件路径",
                },
            },
            required: ["file_path"],
            additionalProperties: false,
        },
        strict: true,
    }
];

export async function executeTool(
    name: string,
    rawArguments: string
): Promise<string> {
    const args: unknown = JSON.parse(rawArguments);

    if (
        typeof args !== "object" ||
        args === null ||
        Array.isArray(args)
    ) {
        throw new Error("Invalid tool arguments");
    }

    const params = args as Record<string, unknown>;

    switch (name) {
        case "list_files": {
            if (typeof params.directory !== "string") {
                throw new Error("directory must be a string");
            }

            const result = await listFiles(params.directory);
            return JSON.stringify(result);
        }

        case "read_file": {
            if (typeof params.file_path !== "string") {
                throw new Error("file_path must be a string");
            }

            return await readFile(params.file_path);
        }

        default:
            throw new Error('Unknown tool: ${name}');
    }
}