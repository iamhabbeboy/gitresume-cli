import { create } from "zustand";
import axios from "axios";
import type { Project } from "../types/project";

type ProjectStore = {
  projects: Project[];
  loading: boolean;
  error: string | null;
};

type Action = {
  fetchProjects: () => void;
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
    } catch (_) {
      set({ error: "Failed to fetch users", loading: false });
    }
  },
}));
