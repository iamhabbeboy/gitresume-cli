export type CommitMessage = {
  commit_id: number;
  message: string;
  ai_generated_msg?: string;
};

export type Project = {
  id: string;
  name: string;
  commits: CommitMessage[];
};
