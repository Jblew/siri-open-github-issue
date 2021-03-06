import { Octokit } from "@octokit/rest";
import { sleepMs } from "./util";
export class GithubIssueMaker {
  private octokit: Octokit;

  constructor(
    private config: {
      octokit: Octokit;
      repo: string;
      owner: string;
      projectColumnId?: number;
    }
  ) {
    this.octokit = config.octokit;
  }

  async createIssue({ title }: { title: string }) {
    const { number, id } = await this.doCreateIssue({ title });
    if (this.config.projectColumnId) {
      await sleepMs(1000);
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
      content_type: "Issue",
      content_id: issueID,
    });
  }
}
