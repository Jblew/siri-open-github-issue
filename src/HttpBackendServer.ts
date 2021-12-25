import express from "express";
import morgan from "morgan";
import * as path from "path";

export class HttpBackendServer {
  private app: express.Application;
  constructor(
    private config: {
      port: number;
      hostname?: string;
      routerBase: string;
      silent?: boolean;
      apiKey: string;
    }
  ) {
    this.app = this.makeExpressApp();
  }

  get(
    endpointPath: string,
    handler: (p: { query: Record<string, any> }) => Promise<string>
  ) {
    const path = this.getFullEndpointPath(endpointPath);
    console.log(`Listening to ${path}`);
    this.app.get(path, this.wrapHandler(handler));
  }

  listen(): { close(): void; address(): string | null | any } {
    const port = this.config.port || 80;
    const hostname = this.config.hostname || "0.0.0.0";
    const httpServer = this.app.listen(port, hostname, () => {
      console.log(`Listening at :${port}`);
    });
    return httpServer;
  }

  private makeExpressApp() {
    const app = express();
    if (!this.config.silent) {
      app.use(morgan("tiny"));
    }
    return app;
  }

  private getFullEndpointPath(endpointPath: string) {
    return path.join(this.config.routerBase, endpointPath);
  }

  private isAuthorized(req: express.Request): boolean {
    const key: string = `${req.query.key || ""}`;
    return key === this.config.apiKey;
  }

  private wrapHandler(
    handler: (p: { query: Record<string, any> }) => Promise<string>
  ) {
    return async (req: express.Request, res: express.Response) => {
      if (!this.isAuthorized(req)) {
        res.status(401).send("401 Unauthorized");
        console.error(`Unauthorized ${req.path}`, req.query);
        return;
      }
      try {
        const result = await handler({ query: req.query });
        res.status(200).send(result);
      } catch (err) {
        res.status(500).send("500 Server error");
        console.error(err);
      }
    };
  }
}
