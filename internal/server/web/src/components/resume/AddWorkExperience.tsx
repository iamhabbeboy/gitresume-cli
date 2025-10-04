import { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import type { WorkExperience } from "./type";
import { useResumeStore } from "../../store/resumeStore";
import { useStore } from "../../store";
import Select, { type MultiValue } from "react-select";
import type { CommitMessage } from "../../types/project";

interface Prop {
  isOpen: number | null;
  setIsOpen: React.Dispatch<React.SetStateAction<number | null>>;
  data: WorkExperience | null;
}

const AddWorkExperience: React.FC<Prop> = ({ isOpen, setIsOpen, data }) => {
  const store = useStore();

  useEffect(() => {
    store.fetchProjects();
    // eslint-disable-next-line
  }, []);

  const projectList = useMemo(
    () => store.projects.map((p) => ({ label: p.name, value: p.id })),
    [store.projects],
  );

  const [workExperiences, setWorkExperiences] = useState<WorkExperience>({
    company: data?.company ?? "",
    role: data?.role ?? "",
    location: data?.location ?? "",
    dateFrom: data?.dateFrom ?? "",
    dateTo: data?.dateTo ?? "",
    responsibilities: [],
  });
  const { addWorkExperiences } = useResumeStore((state) => state);

  const [responsibilities, setResponsibilities] = useState<CommitMessage[]>([]);
  const [responsibility, setResponsibility] = useState<string>("");
  const [projects, setProjects] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [hasProjectSelected, setHasProjectSelected] = useState(false);
  const [messageType, setMessageType] = useState<number>(0);

  const handleResponsibility = () => {
    setResponsibilities([
      ...responsibilities,
      { commit_id: 0, message: responsibility },
    ]);
    setResponsibility("");
  };

  const handleProjectSelection = (
    e: MultiValue<{ label: string; value: string }>,
  ) => {
    // const values = e.map((item) => item.value);
    setProjects([...projects, ...e]);
    setHasProjectSelected(!!e.length);
  };

  const handleAddWrk = async () => {
    workExperiences.responsibilities = responsibilities;
    let commits: CommitMessage[] = [];

    if (projects.length == 0) {
      return;
    }

    const originalCommitLogs = store.projects.filter((p) =>
      projects.some((prj) => prj.value === p.id)
    );

    const flatProjects = originalCommitLogs.flatMap((c) => c.commits);
    commits = flatProjects;

    if (messageType == 1) {
      const translatedCommits = await Promise.all(
        projects.map((p) => store.fetchCommitSummary(Number(p.value))),
      );
      commits = translatedCommits.flat();
    }

    workExperiences.responsibilities = [
      ...workExperiences.responsibilities,
      ...commits,
    ];
    const projectIDs = projects.map((p) => p.value);
    addWorkExperiences([workExperiences], projectIDs);
    setIsOpen(null);
    setWorkExperiences({
      company: "",
      role: "",
      location: "",
      dateFrom: "",
      dateTo: "",
      responsibilities: [],
    });
    setResponsibilities([]);
    setResponsibility("");
    setProjects([]);
  };
  return (
    <section>
      <Modal
        title={"Add Work Experience"}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <div className="p-4 md:p-5">
          <div className="grid gap-4 mb-4 grid-cols-2">
            <div className="col-span-2">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Company Name
              </label>
              <input
                onChange={(e) => {
                  setWorkExperiences({
                    ...workExperiences,
                    company: e.target.value,
                  });
                }}
                value={workExperiences.company}
                type="text"
                name="role"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Type your role"
              />
            </div>

            <div className="col-span-2">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Role
              </label>
              <input
                onChange={(e) => {
                  setWorkExperiences({
                    ...workExperiences,
                    role: e.target.value,
                  });
                }}
                value={workExperiences.role}
                type="text"
                name="role"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Type your role"
              />
            </div>
            <div className="col-span-2">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Location
              </label>
              <input
                onChange={(e) => {
                  setWorkExperiences({
                    ...workExperiences,
                    location: e.target.value,
                  });
                }}
                value={workExperiences.location}
                type="text"
                name="location"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Location, e.g. Remote, New York"
                required
              />
            </div>
            <div className="col-span-2 flex justify-between">
              <div className="w-6/12">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Date From
                </label>
                <input
                  onChange={(e) => {
                    setWorkExperiences({
                      ...workExperiences,
                      dateFrom: e.target.value,
                    });
                  }}
                  value={workExperiences.dateFrom}
                  type="date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                />
              </div>
              <div className="w-5/12">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Date To
                </label>
                <input
                  onChange={(e) => {
                    setWorkExperiences({
                      ...workExperiences,
                      dateTo: e.target.value,
                    });
                  }}
                  value={workExperiences.dateTo}
                  type="date"
                  className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block  p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Select project(s)
              </label>
              <Select
                isMulti
                options={projectList}
                className="h-8 bg-white dark:bg-gray-700 dark:text-white"
                onChange={handleProjectSelection}
              />

              {hasProjectSelected && (
                <select
                  className="h-8 bg-white dark:bg-gray-700 dark:text-white mt-5 w-full"
                  onChange={(e) => setMessageType(Number(e.target.value))}
                >
                  <option value="0">Default</option>
                  <option value="1">Translated</option>
                </select>
              )}
            </div>

            {responsibilities.length > 0 && (
              <div className="col-span-2">
                <ul className="list-disc list-inside">
                  {responsibilities.map((value, indx) => (
                    <li className="text-gray-500 dark:text-gray-50" key={indx}>
                      {value.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="col-span-2">
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Or Add your Work Achievement
              </label>
              <textarea
                id="description"
                rows={4}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Write your work achievement"
                onChange={(e) => setResponsibility(e.target.value)}
                value={responsibility}
              >
              </textarea>
              <button
                onClick={handleResponsibility}
                className="underline text-xs text-gray-50 cursor-pointer hover:no-underline"
              >
                Add more
              </button>
            </div>
          </div>
          <button
            onClick={handleAddWrk}
            type="submit"
            className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg
              className="me-1 -ms-1 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              >
              </path>
            </svg>
            Add
          </button>
        </div>
      </Modal>
    </section>
  );
};

export default AddWorkExperience;
