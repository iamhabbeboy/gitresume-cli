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
  updateEducation: (edu: Education[]) => void;
  addEducation: () => void;
  deleteEducation: (id: number) => void;
  removeSkill: (index: number) => void;
  updateSkills: (skill: string[]) => void;
  deleteExperience: (id: number) => void;
  addExperience: () => void;
  patchExperience: (id: number, exp: Partial<WorkExperience>) => void;
  updateExperience: (exp: WorkExperience[]) => void;
  resetResume: () => void;
  deleteResume: (id: number) => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
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
      patchResume: (resume: Partial<Resume>) => {
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
      },
      fetchResumeById: async (id: number) => {
        const resume = get().resumes.find((r) => r.id === id);
        if (resume) {
          resume.education = resume.education ?? [];
          set({ resume });
        }
        const { data } = await axios.get(`${baseUri}/api/resumes/${id}`);
        const res = data as Resume;
        const wk = res.work_experiences.map((wk) => {
          const prj = String(wk.projects);
          const project = JSON.parse(prj);
          return {
            ...wk,
            projects: project,
          };
        });
        res.work_experiences = wk;

        set({ resume: res });
      },
      createResume: async (): Promise<Partial<Resume>> => {
        try {
          const payload = get().resume;
          delete payload.id;
          const request = await axios.post(`${baseUri}/api/resumes`, payload);
          set((state) => ({ resumes: [...state.resumes, request.data] }));
          return request.data.data;
        } catch (e) {
          console.error(e);
          return {};
        }
      },
      deleteResume: async (id: number) => {
        try {
          await axios.delete(`${baseUri}/api/resumes/${id}`);
          set((state) => ({
            resumes: state.resumes.filter((res) => res.id !== id),
          }));
        } catch (e) {
          console.log(e);
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
      addWorkExperiences: (
        workExperiences: WorkExperience[],
        prjIDs: string[],
      ) => {
        const newExp = workExperiences.map((wk) => ({
          company: wk.company,
          role: wk.role,
          location: wk.location,
          start_date: wk.start_date,
          end_date: wk.end_date,
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
            workExperiences: [
              ...state.resume.work_experiences,
              ...workExperiences,
            ],
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
          const resume = get().resume;
          const payload: Partial<Resume> = {
            version: 1,
            title: resume.title,
            is_published: false,
            profile: resume.profile,
          };
          await axios.put(
            `${baseUri}/api/resumes/${userId}`,
            payload,
          );
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
      deleteEducation: async (id: number) => {
        try {
          const edu = get().resume.education ?? [];
          const eduObj = edu.find((_, idx) => idx === id);
          if (!eduObj) return alert("Education not found");

          await axios.delete(
            `${baseUri}/api/educations/${eduObj?.id}`,
          );
          const updateEdu = edu.filter((e) => e.id !== eduObj.id);

          set((state) => ({
            resume: {
              ...state.resume,
              education: updateEdu,
            },
          }));
        } catch (e) {
          console.log(e);
        }
      },
      deleteExperience: async (id: number) => {
        try {
          const exp = get().resume.work_experiences ?? [];
          const expObj = exp.find((_, idx) => idx === id);
          if (!expObj) return alert("Work experience not found");

          await axios.delete(
            `${baseUri}/api/work-experiences/${expObj?.id}`,
          );
          const updateExp = exp.filter((e) => e.id !== expObj.id);

          set((state) => ({
            resume: {
              ...state.resume,
              work_experiences: updateExp,
            },
          }));
        } catch (e) {
          console.log(e);
        }
      },
      updateExperience: async (exp: WorkExperience[]) => {
        const resumeId = get().resume.id;
        try {
          const request = await axios.put(
            `${baseUri}/api/work-experiences/${resumeId}`,
            { work_experiences: exp },
          );

          const ids = request.data.data.ids;
          const updateExperienceIds = exp.map((p, i) => ({ ...p, id: ids[i] }));

          set((state) => ({
            resume: {
              ...state.resume,
              work_experiences: updateExperienceIds,
            },
          }));
        } catch (e) {
          console.log(e);
        }
      },
      updateEducation: async (education: Education[]) => {
        const resumeId = get().resume.id;
        try {
          const request = await axios.put(
            `${baseUri}/api/educations/${resumeId}`,
            { education },
          );

          const ids = request.data.data.ids;
          const updateEduIds = education.map((p, i) => ({ ...p, id: ids[i] }));

          set((state) => ({
            resume: {
              ...state.resume,
              education: updateEduIds,
            },
          }));
        } catch (e) {
          console.log(e);
        }
      },
      removeSkill: (id: number) => {
        const newSkills = get().resume.skills.filter((_, idx) => idx !== id);
        set((state) => ({
          resume: {
            ...state.resume,
            skills: newSkills,
          },
        }));
        get().updateSkills(newSkills);
      },
      updateSkills: async (skills: string[]) => {
        const resumeId = get().resume.id;
        const payload = {
          skills: skills,
        };
        try {
          const request = await axios.put(
            `${baseUri}/api/resumes/${resumeId}`,
            payload,
          );
          console.log(request);
        } catch (e) {
          console.log(e);
        }
        set((state) => ({
          resume: {
            ...state.resume,
            skills,
          },
        }));
      },
      addExperience: () => {
        const exp: WorkExperience = {
          id: get().resume.work_experiences.length + 1,
          company: "",
          role: "",
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
      patchExperience: async (id: number, exp: Partial<WorkExperience>) => {
        const resumeId = get().resume.id;
        const payload = {
          work_experiences: get().resume.work_experiences,
        };
        try {
          const request = await axios.put(
            `${baseUri}/api/resumes/${resumeId}`,
            payload,
          );
          const expId = request.data.id ?? 0;
          if (expId > 0) {
            exp.id = expId;
            // return alert("An error occured");
          }
          const wkState = get().resume.work_experiences.map((p) =>
            p.id === id ? { ...p, ...exp } : p
          );

          set((state) => ({
            resume: { ...state.resume, work_experiences: wkState },
          }));
        } catch (e) {
          console.log(e);
        }
      },
      resetResume: () => {
        localStorage.removeItem("gitresume-preview");
        const data = {
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
        };
        set(() => ({ resume: data }));
      },
    }),
    {
      name: "resume-storage",
    },
  ),
);

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
