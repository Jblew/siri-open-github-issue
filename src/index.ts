import { HttpBackendServer } from "./HttpBackendServer";

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
const repo = process.env.REPO;

const server = new HttpBackendServer({
  port,
});
server.get("/open-issue", async ({ query }) => {
  const message = query.message;
  if (!message) return "Missing message";
  const no = 1;
  return `Created issue ${message} with number ${no}`;
});
server.listen();
