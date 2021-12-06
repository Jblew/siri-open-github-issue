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
console.log("siri-open-github-issue");
const apiKeyForClients = envMust("APIKEY_FOR_CLIENTS");
const issueMaker = new GithubIssueMaker({
  owner: envMust("OWNER"),
  repo: envMust("REPO"),
  token: envMust("GITHUB_TOKEN"),
  projectColumnId: parseInt(envMust("PROJECT_COLUMN_ID")),
});
const server = new HttpBackendServer({
  port: parseInt(process.env.PORT || "80"),
  hostname: process.env.HOST || "0.0.0.0",
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
