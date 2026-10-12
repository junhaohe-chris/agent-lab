import "dotenv/config";

import { runAgent } from "./agent/loop";

async function main() {
    const question =
        process.argv.slice(2).join(" ") ||
        "这个项目的入口文件是什么？";

    console.log("Question:", question);

    const agentResponse = await runAgent(question);

    console.log('\n=== Agent Response===');
    console.log(agentResponse);
}

main().catch((error: unknown) => {
    console.error(error);
    // process.exitCode = 1;
});