import { create } from "zustand";
import type {
  Education,
  Profile,
  Resume,
  WorkExperience,
} from "../components/resume/type";
import axios from "axios";
import { baseUri } from "../util/config";
import { persist } from "zustand/middleware";

interface ResumeState {
  resume: Resume;
  resumes: Resume[];
  updateProfile: (profile: Profile) => void;
  updateWorkExperience: (workExperience: WorkExperience) => void;
  addWorkExperiences: (wk: WorkExperience[], prjIDs: string[]) => void;
  store: (data: Record<string, unknown>) => Promise<Resume>;
  fetchResumes: () => Promise<Resume[]>;
  fetchUser: (userId: number) => Promise<Profile | null>;
  updateResume: (userId: number) => void;
  useDebounce: (userId: number) => void;
  patchResume: (resume: Partial<Resume>) => void;
  createResume: () => Promise<Partial<Resume>>;
  fetchResumeById: (id: number) => void;
  patchEducation: (id: number, edu: Partial<Education>) => void;
  addEducation: () => void;
  removeEducation: (id: number) => void;
  removeSkill: (index: number) => void;
  addSkill: (skill: string) => void;
  removeExperience: (id: number) => void;
  addExperience: () => void;
  patchExperience: (id: number, exp: Partial<WorkExperience>) => void;
}

export const useResumeStore = create<ResumeState>()(persist((set, get) => ({
  resumes: [],
  resume: {
    version: 1,
    user_id: 1,
    title: "Untitled resume",
    is_published: false,
    profile: {
      name: "",
      email: "",
      phone: "",
      links: [],
      website: "",
      professional_summary: "",
      location: "",
    },
    education: [],
    work_experiences: [],
    skills: [],
  },
  updateProfile: (profile: Profile) => {
    set((state) => ({
      resume: {
        ...state.resume,
        profile: { ...state.resume.profile, ...profile },
      },
    }));
    get().useDebounce(1);
  },
  patchResume: debounce((resume: Partial<Resume>) => {
    set((state) => ({
      resume: {
        ...state.resume,
        ...resume,
      },
      resumes: state.resumes.map((p) =>
        p.id === resume.id ? { ...p, ...resume } : p
      ),
    }));
    get().updateResume(1);
  }, 500),
  fetchResumeById: async (id: number) => {
    const resume = get().resumes.find((r) => r.id === id);
    if (resume) {
      resume.education = resume.education ?? [];
      set({ resume });
    }
    const { data } = await axios.get(`${baseUri}/api/resumes/${id}`);

    set({ resume: data });
  },
  createResume: async (): Promise<Partial<Resume>> => {
    try {
      const payload = get().resume;
      const request = await axios.post(`${baseUri}/api/resumes`, payload);
      set((state) => ({ resumes: [...state.resumes, request.data] }));
      return request.data;
    } catch (e) {
      console.error(e);
      return {};
    }
  },
  updateWorkExperience: (workExperiences: WorkExperience) =>
    set((state) => ({
      resume: {
        ...state.resume,
        work_experiences: state.resume.work_experiences.map((wk) =>
          wk.company === workExperiences.company
            ? { ...wk, ...workExperiences }
            : wk
        ),
      },
    })),
  addWorkExperiences: (workExperiences: WorkExperience[], prjIDs: string[]) => {
    const newExp = workExperiences.map((wk) => ({
      company: wk.company,
      role: wk.role,
      location: wk.location,
      start_date: wk.dateFrom,
      end_date: wk.dateTo,
      project_ids: prjIDs,
    }));

    const payload = {
      work_experiences: newExp,
      skills: ["PHP", "Nodejs", "Golang"],
    };
    const resp = get().store(payload);
    console.log(resp);

    set((state) => ({
      resume: {
        ...state.resume,
        workExperiences: [...state.resume.work_experiences, ...workExperiences],
      },
    }));
  },
  store: async (data: Partial<Resume>): Promise<Resume> => {
    const payload: Partial<Resume> = {
      user_id: data.user_id ?? 1,
      version: data.version ?? 2,
      title: data.title ?? "Untitled Resume",
      is_published: data.is_published,
    };

    if (data.work_experiences) {
      payload.work_experiences = data.work_experiences;
    }

    if (data.education) {
      payload.education = data.education;
    }

    if (data.skills) {
      payload.skills = data.skills;
    }
    try {
      const request = await axios.post(`${baseUri}/api/resumes`, payload);
      console.log(request.data);
    } catch (e) {
      console.error(e);
    }
  },
  updateResume: async (userId: number) => {
    try {
      const request = await axios.put(
        `${baseUri}/api/resumes/${userId}`,
        get().resume,
      );
      console.log(request.data);
    } catch (e) {
      console.error(e);
    }
  },
  useDebounce: debounce(() => {
    get().updateResume(1);
  }, 500),
  fetchResumes: async (): Promise<Resume[]> => {
    try {
      const { data } = await axios.get(`${baseUri}/api/resumes`);
      set({ resumes: data ?? [] });
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  fetchUser: async (userId: number): Promise<Profile | null> => {
    try {
      const { data } = await axios.get(`${baseUri}/api/users/${userId}`);
      set((state) => ({
        resume: {
          ...state.resume,
          profile: { ...state.resume.profile, ...data },
        },
      }));
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  addEducation: () => {
    set((state) => ({
      resume: {
        ...state.resume,
        education: [
          ...state.resume.education,
          {
            id: state.resume.education.length + 1 || 0,
            school: "",
            degree: "",
            field_of_study: "",
            date_from: "",
          },
        ],
      },
    }));
  },
  removeEducation: (id: number) => {
    set((state) => ({
      resume: {
        ...state.resume,
        education: state.resume.education.filter((edu) => edu.id !== id),
      },
    }));
  },
  patchEducation: async (id: number, education: Partial<Education>) => {
    try {
      set((state) => ({
        resume: {
          ...state.resume,
          education: state.resume.education.map((p) =>
            p.id === id ? { ...p, ...education } : p
          ),
        },
      }));
      const payload = get().resume.education;
      const { data } = await axios.put(
        `${baseUri}/api/resumes/education`,
        payload,
      );
    } catch (e) {
      console.log(e);
    }
  },
  removeSkill: (id: number) => {
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.filter((_, idx) => idx !== id),
      },
    }));
  },
  addSkill: (skill: string) => {
    set((state) => ({
      resume: {
        ...state.resume,
        skills: [...state.resume.skills, skill],
      },
    }));
  },
  addExperience: () => {
    const exp: WorkExperience = {
      id: get().resume.work_experiences.length + 1,
      company: "",
      job_title: "",
      location: "",
      start_date: "",
      end_date: "",
      is_current: false,
      project_ids: [],
      responsibilities: "",
    };
    set((state) => ({
      resume: {
        ...state.resume,
        work_experiences: [...state.resume.work_experiences, exp],
      },
    }));
  },
  removeExperience: (id: number) => {
  },
  patchExperience: async (id: number, exp: Partial<WorkExperience>) => {
    const resumeId = get().resume.id;
    const payload = {
      work_experiences: get().resume.work_experiences,
    };
    // const request = await axios.put(
    //   `${baseUri}/api/resumes/${resumeId}`,
    //   payload,
    // );
    // console.log(request);
    set((state) => ({
      resume: {
        ...state.resume,
        work_experiences: state.resume.work_experiences.map((p) =>
          p.id === id ? { ...p, ...exp } : p
        ),
      },
    }));
  },
}), {
  name: "resume-storage",
}));

function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
) {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
