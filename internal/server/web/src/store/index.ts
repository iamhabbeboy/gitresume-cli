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
  updateCommits: (projectName: string, index: number, ai: string) => void;
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
      set({ error: "Failed to fetch users" + err.message, loading: false });
    }
  },

  updateCommits: (projectName: string, index: number, ai: string) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.name === projectName
          ? {
              ...p,
              commits: p.commits.map((c, i) =>
                i === index ? { ...c, ai } : c,
              ),
            }
          : p,
      ),
    }));
  },
}));
