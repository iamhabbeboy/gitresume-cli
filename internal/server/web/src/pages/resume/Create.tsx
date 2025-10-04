import { useEffect } from "react";
import ResumeBuilder from "../../components/resume/builder/ResumeBuilder";
import { useResumeStore } from "../../store/resumeStore";

const CreateResume: React.FC = () => {
  const { fetchUser } = useResumeStore();
  useEffect(() => {
    (async () => {
      fetchUser(1);
    })();
  }, []);

  return <ResumeBuilder />;
};
export default CreateResume;
