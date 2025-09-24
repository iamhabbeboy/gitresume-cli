import { create } from "zustand";
import axios from "axios";
import type { CommitMessage, Project } from "../types/project";

type ProjectStore = {
  projects: Project[];
  loading: boolean;
  error: string | null;
};

type Action = {
  fetchProjects: () => void;
  updateCommit: (projectName: string, index: number, ai: string) => void;
  updateCommits: (projectName: string, commits: CommitMessage[]) => void;
};

export const useStore = create<ProjectStore & Action>()((set) => ({
  projects: [],
  loading: false,
  error: "",
  fetchProjects: async () => {
    set({ loading: true, error: null, projects: [] });
    try {
      const res = await axios.get<{ data: Project[] }>(
        "http://localhost:4000/api/projects",
      );
      set({ projects: res.data.data, loading: false });
    } catch (err) {
      set({
        error: "Failed to fetch users" + JSON.stringify(err),
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
          : p,
      ),
    }));
  },
  updateCommit: (projectName: string, index: number, ai: string) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.name === projectName
          ? {
              ...p,
              commits: p.commits.map((c, i) =>
                i === index ? { ...c, ai_generated_msg: ai } : c,
              ),
            }
          : p,
      ),
    }));
  },
}));
