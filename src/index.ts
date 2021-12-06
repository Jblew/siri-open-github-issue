import { HttpBackendServer } from "./HttpBackendServer";
import { createTokenAuth } from "@octokit/auth-token";
import { GithubIssueMaker } from "./GithubIssueMaker";
import { envMust } from "./util";

process
  .on("SIGINT", function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    process.exit(1);
  })
  .on("SIGTERM", function () {
    console.log("\nGracefully shutting down from SIGTERM");
    process.exit(1);
  });

const port = parseInt(process.env.PORT || "80");
const apiKeyForClients = envMust("APIKEY_FOR_CLIENTS");
const issueMaker = new GithubIssueMaker({
  owner: envMust("OWNER"),
  repo: envMust("REPO"),
  token: envMust("GITHUB_TOKEN"),
  projectNumber: parseInt(envMust("PROJECT_NUMBER")),
});
const server = new HttpBackendServer({
  port,
});
server.get(`/open-issue`, async ({ query }) => {
  const apiKey = query.key;
  if (!apiKey) return "Missing key";
  else if (apiKey !== apiKeyForClients) return "Invalid api key";
  const message = query.message;
  if (!message) return "Missing message";
  const { number } = await issueMaker.createIssue({ title: message });
  return `Created issue ${message} with number ${number}`;
});
server.listen();
