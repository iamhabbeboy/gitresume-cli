import { create } from "zustand";
import axios from "axios";
import type {
  CommitMessage,
  CustomCommitMessage,
  Project,
} from "../types/project";
import { baseUri } from "../util/config";

type ProjectStore = {
  projects: Project[];
  commits: CommitMessage[];
  loading: boolean;
  error: string | null;
};

type Action = {
  fetchProjects: () => void;
  updateCommits: (projectName: string, commits: CommitMessage[]) => void;
  bulkUpdateCommit: (
    projectName: string,
    payload: CustomCommitMessage[],
  ) => void;
  updateCommitsWithAI: (projectName: string, commits: CommitMessage[]) => void;
  updateAllCommitsWithAI: (projectName: string, commits: string[]) => void;
  fetchCommitSummary: (projectId: number) => void;
};

export const useStore = create<ProjectStore & Action>()((set, get) => ({
  projects: [],
  commits: [],
  loading: false,
  error: "",
  fetchProjects: async () => {
    set({ loading: true, error: null, projects: [] });
    try {
      const res = await axios.get<{ data: Project[] }>(
        `${baseUri}/api/projects`,
      );
      set({ projects: res.data.data, loading: false });
    } catch (err) {
      set({
        error: "Failed to fetch users" + JSON.stringify(err),
        loading: false,
      });
    }
  },
  fetchCommitSummary: async (projectId: number) => {
    try {
      const { data } = await axios.post(`${baseUri}/api/projects/${projectId}`);
      set({ commits: data, loading: false });
    } catch (e) {
      console.error(e);
    }
  },
  updateAllCommitsWithAI: async (projectName: string, commits: string[]) => {
    try {
      const { data } = await axios.post(`${baseUri}/api/ai`, {
        commits: commits,
      });
      console.log(data);
      const payload: CustomCommitMessage[] = data.map((c: string) => ({
        project_id: 1,
        message: c,
      }));

      get().bulkUpdateCommit(projectName, payload);
    } catch (e) {
      console.log(e);
    }
  },
  updateCommitsWithAI: async (
    projectName: string,
    commits: CommitMessage[],
  ) => {
    try {
      const { data } = await axios.post(`${baseUri}/api/ai`, {
        commits: commits,
      });
      const payload: CustomCommitMessage[] = data.map((c) => ({
        project_id: 1,
        message: c,
      }));

      get().bulkUpdateCommit(projectName, payload);
    } catch (err) {
      set({
        error: "Failed to translate commit messages:" + JSON.stringify(err),
        loading: false,
      });
    }
  },
  updateCommits: (projectName: string, commits: CommitMessage[]) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.name === projectName
          ? {
            ...p,
            commits: commits,
          }
          : p
      ),
    }));
  },
  bulkUpdateCommit: async (
    projectName: string,
    payload: CustomCommitMessage[],
  ) => {
    try {
      await axios.put(`${baseUri}/api/commits/bulk-update`, {
        data: payload,
      });

      const commitMap = new Map(
        payload.map((c) => [c.commit_id, c.message]),
      );

      set((state) => ({
        projects: state.projects.map((p) =>
          p.name === projectName
            ? {
              ...p,
              commits: p.commits.map((c) =>
                commitMap.has(c.commit_id)
                  ? { ...c, ai_generated_msg: commitMap.get(c.commit_id) }
                  : c
              ),
            }
            : p
        ),
      }));
    } catch (e) {
      console.error(e);
    }
  },
}));
