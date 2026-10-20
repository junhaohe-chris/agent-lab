import type OpenAI from "openai";

import { client, model } from "../llm/client.ts";
import { executeTool, tools as localTools } from "../tools/index.ts";
import { createGitMcp } from "../mcp/git.ts";

type InputItem = OpenAI.Responses.ResponseInputItem;

const MAX_STEPS = 10;

export async function runAgent(
    userMessage: string
): Promise<string> {

    const git = await createGitMcp();

    const tools = [
    ...localTools,
    ...git.tools.map(t => ({
        type: "function" as const,
        name: t.name,
        description: t.description ?? "",
        parameters: t.inputSchema,
        strict: false as const,
    })),
    ];

    const history: InputItem[] = [
        {
            role: "user",
            content: userMessage,
        },
    ];

    for (let step = 0; step < MAX_STEPS; step++) {
        console.log(`\n[Agent] Step ${step + 1}`);

        const response = await client.responses.create({
            model,
            instructions: `
            你是一个本地编程Agent。
            工作区根目录是当前项目目录。
            需要文件信息时，必须调用工具验证。
            不要编造不存在的文件。
            `,
            input: history,
            tools,
        });

        if (response.status !== "completed") {
            throw new Error(
                `Model response status: ${response.status}`
            );
        }

        history.push(...response.output as InputItem[]);
    
        const calls = response.output.filter(
            (item) => item.type === "function_call"
        );

        if (calls.length === 0) {
            return response.output_text;
        }

        for (const call of calls) {
            console.log(`[Tool] ${call.name}`);
            console.log(`[Args] ${call.arguments}`);

            let result: string;

            try {
                if (git.tools.some(t => t.name === call.name)) {
                    const output = await git.call(
                      call.name,
                      JSON.parse(call.arguments)
                    );
                  
                    result = JSON.stringify(output);
                  } else {
                    result = await executeTool(
                      call.name,
                      call.arguments
                    );
                  }
            } catch (error) {
                result = JSON.stringify({
                    error:
                        error instanceof Error
                        ? error.message
                        : "Unknown tool error",
                });
            }

            console.log(`[Result] ${result.slice(0, 500)}`);

            history.push({
                type: "function_call_output",
                call_id: call.call_id,
                output: result,
            })
        }
    }

    throw new Error("Agent exceeded maximum steps");
}