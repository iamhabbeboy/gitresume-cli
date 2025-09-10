export type CommitMessage = {
  msg: string;
  timestamp: number;
};

export type Project = {
  id: string;
  name: string;
  commits: CommitMessage[];
};
