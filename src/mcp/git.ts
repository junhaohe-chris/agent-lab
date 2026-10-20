
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

export async function createGitMcp() {
  const client = new Client({
    name: "agent-lab",
    version: "0.1.0",
  });

  await client.connect(new StdioClientTransport({
    command: "uvx",
    args: ["mcp-server-git", "--repository", process.cwd()],
  }));

  const allowed = new Set([
    "git_status",
    "git_diff",
    "git_diff_staged",
    "git_diff_unstaged",
    "git_log",
    "git_show",
  ]);

  const { tools } = await client.listTools();

  return {
    tools: tools.filter(t => allowed.has(t.name)),

    async call(name: string, args: Record<string, unknown>) {
      if (!allowed.has(name)) throw new Error("Tool denied");

      return client.callTool({
        name,
        arguments: { ...args, repo_path: process.cwd() },
      });
    },

    close: () => client.close(),
  };
}
