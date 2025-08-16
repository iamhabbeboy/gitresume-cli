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
  fetchCommitsByProjectName: (projectName: string) => void;
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
  fetchCommitsByProjectName: (projectName: string) => {
    //set({ loading: true, error: null });
    //set((state) => ({
    //projects: state.projects.map((project) => {
    //  if (project.project_name === projectName) {
    //    return { ...project, commits: [] };
    //  }
    //  return project;
    //}),
    //loading: false,
    //})),
    // set((state: ProjectStore) => {
    //    return {
    //      items: state.projects.filter((item: Project) => item.project_name === projectName),
    //    };
    //}),
  },
}));
