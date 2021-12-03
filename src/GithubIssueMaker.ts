export class GithubIssueMaker {
  constructor(
    private config: { token: string; repo: string; projectNumber: number }
  ) {
    //
  }

  async createIssue({ title }: { title: string }) {
    return { number: 1 };
  }
}
