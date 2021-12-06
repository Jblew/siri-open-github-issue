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
    }
  ) {
    this.app = this.makeExpressApp();
  }

  get(
    endpointPath: string,
    handler: (p: { query: Record<string, any> }) => Promise<string>
  ) {
    const endpointPathResolved = path.join(
      this.config.routerBase,
      endpointPath
    );
    this.app.get(endpointPathResolved, async (req, res) => {
      try {
        const result = await handler({ query: req.query });
        res.status(200).send(result);
      } catch (err) {
        res.status(500).send("500 Server error");
        console.error(err);
      }
    });
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
}
