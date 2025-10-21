export type CommitMessage = {
  commit_id: number;
  message: string;
  ai_generated_msg?: string;
  project_id?: number;
};

export type Project = {
  id: string;
  name: string;
  technologies: string;
  commits: CommitMessage[];
};

export type CustomCommitMessage = CommitMessage & {
  project_id: number;
};
