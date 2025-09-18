export type CommitMessage = {
  msg: string;
  ai?: string;
};

export type Project = {
  id: string;
  name: string;
  commits: CommitMessage[];
};
