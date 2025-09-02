export type CommitMessage = {
  msg: string;
  timestamp: number;
};

export type Project = {
  project_name: string;
  commits: CommitMessage[];
};
