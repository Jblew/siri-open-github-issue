import { createTokenAuth } from "@octokit/auth-token";
import { Octokit } from "@octokit/rest";
export class GithubIssueMaker {
  private octokit: Octokit;

  constructor(
    private config: {
      token: string;
      repo: string;
      owner: string;
      projectNumber: number;
    }
  ) {
    this.octokit = new Octokit({
      authStrategy: createTokenAuth(config.token),
    });
  }

  async createIssue({ title }: { title: string }) {
    const resp = await this.octokit.issues.create({
      title,
      repo: this.config.repo,
      owner: this.config.owner,
    });
    const number = resp.data;
    return { number };
  }
}
