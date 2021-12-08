import { Octokit } from "@octokit/rest";

export default function ({
  github,
  server,
}: {
  github: Octokit;
  server: Server;
}) {
  server.get("/", async () => "Hello");
}

interface Server {
  get(
    endpointPath: string,
    handler: (p: { query: Record<string, any> }) => Promise<string>
  ): void;
}
