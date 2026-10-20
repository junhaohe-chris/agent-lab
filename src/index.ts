
import "dotenv/config";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { runAgent } from "./agent/loop.ts";

async function main() {
  const rl = readline.createInterface({
    input,
    output,
  });

  console.log("> local code agent");
  console.log("当前工作区:", process.cwd());
  console.log("输入 exit 或 quit 退出\n");

  try {
    while (true) {
      let question: string;

      try {
        question = (await rl.question("> ")).trim();
      } catch {
        // Ctrl+C 或输入流结束
        break;
      }

      if (!question) {
        continue;
      }

      if (question === "exit" || question === "quit") {
        break;
      }

      try {
        console.log("\nAgent 正在思考...\n");

        const agentResponse = await runAgent(question);

        console.log(agentResponse);
        console.log();
      } catch (error: unknown) {
        console.error("Agent Error:", error);
      }
    }
  } finally {
    rl.close();
    console.log("CLI 已退出");
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
