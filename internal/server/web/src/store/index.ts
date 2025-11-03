import { create } from "zustand";
import axios from "axios";
import type {
  CommitMessage,
  CustomCommitMessage,
  Project,
} from "../types/project";
import { baseUri } from "../util/config";
import type { AIConfig, CustomPrompt } from "../types/ai-config";

type ProjectStore = {
  projects: Project[];
  commits: CommitMessage[];
  ai_config: AIConfig;
  loading: boolean;
  error: string | null;
};

type Action = {
  fetchProjects: () => void;
  updateCommits: (projectName: string, commits: CommitMessage[]) => void;
  bulkUpdateCommit: (projectID: number, payload: CustomCommitMessage[]) => void;
  updateCommitsWithAI: (projectID: number, commits: CommitMessage[]) => void;
  updateAllCommitsWithAI: (
    projtID: number,
    prompts: CustomPrompt
  ) => Promise<{ success: boolean; data: CommitMessage[]; error?: string }>;
  fetchCommitSummary: (projectId: number) => Promise<CommitMessage[]>;
  fetchAIConfig: () => void;
};

export const useStore = create<ProjectStore & Action>()((set, get) => ({
  projects: [],
  commits: [],
  ai_config: {
    custom_prompt: [],
    models: [],
  },
  loading: false,
  error: "",
  fetchProjects: async () => {
    set({ loading: true, error: null, projects: [] });
    try {
      const res = await axios.get<{ data: Project[] }>(
        `${baseUri}/api/projects`
      );
      set({ projects: res.data.data, loading: false });
    } catch (err) {
      set({
        error: "Failed to fetch users" + JSON.stringify(err),
        loading: false,
      });
    }
  },
  fetchAIConfig: async () => {
    const resp = await axios.get(`${baseUri}/api/config`);
    set((state) => ({ ...state, ai_config: resp.data }));
  },
  fetchCommitSummary: async (projectId: number): Promise<CommitMessage[]> => {
    try {
      set({ commits: [], loading: true });
      const { data } = await axios.post(`${baseUri}/api/projects/${projectId}`);
      set({ commits: data, loading: false });
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  updateAllCommitsWithAI: async (projectID: number, prompt: CustomPrompt) => {
    try {
      set((state) => ({ ...state, loading: true }));
      const { data } = await axios.post(`${baseUri}/api/ai`, {
        ...prompt,
      });

      const payload = data.map((c: string) => ({
        project_id: projectID,
        commit_id: 0,
        message: c,
      }));

      get().bulkUpdateCommit(projectID, payload);
      return { success: true, data: payload };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error occurred";
      set((state) => ({ ...state, error: message as string }));
      return { success: false, error: message, data: [] };
    } finally {
      set((state) => ({ ...state, loading: false, error: "" }));
    }
  },
  updateCommitsWithAI: async (projectID: number, commits: CommitMessage[]) => {
    try {
      const { data } = await axios.post(`${baseUri}/api/ai`, {
        commits: commits,
      });
      const payload = data.map((c: CustomCommitMessage) => ({
        project_id: projectID,
        commit_id: c.commit_id ?? 0,
        message: c,
      }));

      get().bulkUpdateCommit(projectID, payload);
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
    projectID: number,
    payload: CustomCommitMessage[]
  ) => {
    try {
      await axios.put(`${baseUri}/api/commits/bulk-update`, {
        data: payload,
      });

      const commitMap = new Map(payload.map((c) => [c.commit_id, c.message]));

      set((state) => ({
        loading: false,
        projects: state.projects.map((p) =>
          Number(p.id) === projectID
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
