import { useEffect, useState } from "react";
import Education from "../../components/resume/Education";
import type { Resume } from "../../components/resume/type";
import WorkExperience from "../../components/resume/WorkExperience";
import { useResumeStore } from "../../store/resumeStore";
import data from "../../data/resume.json";
import AddWorkExperience from "../../components/resume/AddWorkExperience";

const CreateResumex: React.FC = () => {
  const payload = data;
  const { updateProfile } = useResumeStore(
    (state) => state,
  );

  const resume: Resume = useResumeStore((state) => state.resume);

  //const handleCreateNewWorkExperience = () => {};

  useEffect(() => {
    updateProfile(payload?.profile);
    //addWorkExperiences(payload.workExperiences);
  }, [
    updateProfile,
    payload.profile,
    //addWorkExperiences,
    //payload.workExperiences,
  ]);

  const [show, setShow] = useState<number | null>(null);
  const expIndex = show && show > 0 ? show - 1 : 0;
  const selectedWExpEdit = resume.work_experiences.find((_, i) =>
    expIndex === i
  );

  return (
    <section>
      <div className="relative overflow-x-auto sm:rounded-lg">
        <div contentEditable className="text-2xl text-gray-400">
          Edit Title
        </div>
        <section className="my-5 border-b border-gray-200 pb-5">
          <h1 className="text-2xl text-gray-500">Profile Information</h1>
          <div className="flex justify-between">
            <h2 className="text-xl">{resume.profile.name}</h2>
            <button className="py-2 px-10 text-white rounded-md bg-indigo-500">
              Edit
            </button>
          </div>

          <div className="flex gap-5">
            <p>{resume.profile.email}</p>
            <p>{resume.profile.phone}</p>
            {resume.profile.links.map((link, index) => (
              <p key={index}>
                <a href={link.link} className="hover:underline">
                  {link.link}
                </a>
              </p>
            ))}
          </div>
        </section>
        <section>
          <h1 className="text-2xl text-gray-500">Skills</h1>
          <div className="flex gap-5">
            {resume.skills.map((skill) => <p>{skill}</p>)}
          </div>
        </section>
        <section className="my-5 border-b border-gray-200 pb-5">
          <div className="flex justify-between">
            <h1 className="text-2xl text-gray-500">Work Experience</h1>
            <button
              className="py-2 px-10 text-white rounded-md bg-indigo-500"
              onClick={() => setShow(-1)}
            >
              Add{" "}
            </button>
          </div>
          {resume.work_experiences.map((work, index) => (
            <WorkExperience
              work={work}
              index={index + 1}
              setModalStatus={setShow}
            />
          ))}
        </section>
        <section>
          <div className="flex justify-between">
            <h1 className="text-2xl text-gray-500">Education</h1>
            <button className="py-2 px-10 text-white rounded-md bg-indigo-500">
              Add{" "}
            </button>
          </div>
          {resume.education.map((education) => <Education {...education} />)}
        </section>
      </div>

      <AddWorkExperience
        isOpen={show}
        setIsOpen={setShow}
        data={selectedWExpEdit}
      />
    </section>
  );
};

export default CreateResumex;
