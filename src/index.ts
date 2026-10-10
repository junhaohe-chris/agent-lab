import "dotenv/config";

import { client, model } from "./llm/client.ts";
import { tools } from "./tools/index.ts";

async function main() {
  const response = await client.responses.create({
    model,
    instructions: `
你是代码分析助手。
当需要了解本地项目时，请调用工具。
不要猜测项目中的文件或目录。
    `,
    input: "请列出当前项目的根目录文件",
    tools,
  });

  console.dir(response.output, { depth: null });
}

main().catch(console.error);