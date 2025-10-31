import { useEffect } from "react";
import Table from "../../components/resume/Table";
import type { TableProps } from "../../components/resume/type";
import { useResumeStore } from "../../store/resumeStore";

const Resume: React.FC = () => {
  const { resumes, fetchResumes } = useResumeStore();
  // const [resumes, setResumes] = useState<ResumeType[]>([]);
  useEffect(() => {
    (async () => {
      await fetchResumes();
      // setResumes(resp ?? []);
    })();
  }, []);

  const reverse = resumes || [].reverse();

  const getSkillFormat = (skills: string[]): string => {
    if (skills.length === 0) return "";
    if (skills.length > 6) {
      return skills.splice(0, 6).join(", ") + " ...";
    }
    return skills.join(", ");
  };

  const table: TableProps = {
    data: [
      {
        name: "Title",
        values: reverse.map((res) => ({
          value: res.title ?? "",
          data: res.id,
        })),
      },
      {
        name: "Stack",
        values: reverse.map((res) => ({
          value: getSkillFormat(res.skills ?? []),
        })),
      },
      {
        name: "Version",
        values: reverse.map((res) => ({
          value: "version " + String(res.version),
        })),
      },
      {
        name: "Published",
        values: reverse.map((res) => ({
          value: res.is_published ? "Published 🚀" : "Draft",
        })),
      },
    ],
  };
  return (
    <div className="relative overflow-x-auto sm:rounded-lg">
      {reverse.length > 0 ? (
        <Table data={table.data} />
      ) : (
        <>
          <h1 className="text-2xl text-gray-400">No resume available</h1>
        </>
      )}
    </div>
  );
};

export default Resume;
