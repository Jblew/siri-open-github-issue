import { createTokenAuth } from "@octokit/auth-token";
import { Octokit } from "@octokit/rest";
export class GithubIssueMaker {
  private octokit: Octokit;

  constructor(
    private config: {
      token: string;
      repo: string;
      owner: string;
      projectColumnId?: number;
    }
  ) {
    this.octokit = new Octokit({
      authStrategy: createTokenAuth(config.token),
    });
  }

  async createIssue({ title }: { title: string }) {
    const { number, id } = await this.doCreateIssue({ title });
    if (this.config.projectColumnId) {
      await this.addIssueToProject({ issueID: id });
    }
    return { number };
  }

  private async doCreateIssue({ title }: { title: string }) {
    const resp = await this.octokit.issues.create({
      title,
      repo: this.config.repo,
      owner: this.config.owner,
    });
    return { number: resp.data.number, id: resp.data.id };
  }

  private async addIssueToProject({ issueID }: { issueID: number }) {
    await this.octokit.projects.createCard({
      column_id: this.config.projectColumnId!,
      content_type: "issue",
      content_id: issueID,
    });
  }
}
