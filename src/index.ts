import "dotenv/config";
import { client } from "./llm/client.ts";

async function main() {
    const response = await client.responses.create({
        model: process.env.DEEPSEEK_MODEL!,
        instructions: "你是一个专业的编程助手",
        input: "请解释什么是 Agent Loop",
    });

    console.log(response);
    console.log("模型输出：");
    console.log(response.output_text);
}

main();