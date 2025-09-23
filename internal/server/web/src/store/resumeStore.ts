import { create } from "zustand";
import type {
  Profile,
  Resume,
  WorkExperience,
} from "../components/resume/type";

interface ResumeState {
  resume: Resume;
  updateProfile: (profile: Profile) => void;
  updateWorkExperience: (workExperience: WorkExperience) => void;
  addWorkExperiences: (workExperiences: WorkExperience[]) => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resume: {
    profile: {
      name: "",
      email: "",
      phone: "",
      links: [],
      website: "",
    },
    education: [],
    workExperiences: [],
    skills: [],
  },
  updateProfile: (profile: Profile) =>
    set((state) => ({
      resume: {
        ...state.resume,
        profile: { ...state.resume.profile, ...profile },
      },
    })),
  updateWorkExperience: (workExperiences: WorkExperience) =>
    set((state) => ({
      resume: {
        ...state.resume,
        workExperiences: state.resume.workExperiences.map((wk) =>
          wk.company === workExperiences.company
            ? { ...wk, ...workExperiences }
            : wk,
        ),
      },
    })),
  addWorkExperiences: (workExperiences: WorkExperience[]) =>
    set((state) => ({
      resume: {
        ...state.resume,
        workExperiences: [...state.resume.workExperiences, ...workExperiences],
      },
    })),
}));
