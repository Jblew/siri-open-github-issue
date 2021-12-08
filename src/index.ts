import { HttpBackendServer } from "./HttpBackendServer";
import { GithubIssueMaker } from "./GithubIssueMaker";
import { envMust } from "./util";
import endpoints from "./endpoints";
import { Octokit } from "@octokit/rest";

console.log("siri-open-github-issue");

process
  .on("SIGINT", function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    process.exit(1);
  })
  .on("SIGTERM", function () {
    console.log("\nGracefully shutting down from SIGTERM");
    process.exit(1);
  });

const apiKeyForClients = envMust("APIKEY_FOR_CLIENTS");
const token = envMust("GITHUB_TOKEN");
const owner = envMust("OWNER");
const repo = envMust("REPO");
const projectColumnId = parseInt(envMust("PROJECT_COLUMN_ID"));
const octokit = new Octokit({
  auth: token,
});
const issueMaker = new GithubIssueMaker({
  owner,
  repo,
  projectColumnId,
  octokit,
});
const server = new HttpBackendServer({
  port: parseInt(process.env.PORT || "80"),
  hostname: process.env.HOST || "0.0.0.0",
  routerBase: process.env.ROUTER_BASE || "",
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
endpoints({ server, github: octokit });
server.listen();
