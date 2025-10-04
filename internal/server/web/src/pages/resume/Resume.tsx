import { useEffect, useState } from "react";
import Table from "../../components/resume/Table";
import type {
  Resume as ResumeType,
  TableProps,
} from "../../components/resume/type";
import { useResumeStore } from "../../store/resumeStore";

const Resume: React.FC = () => {
  const { fetchResumes } = useResumeStore();
  const [resumes, setResumes] = useState<ResumeType[]>([]);
  useEffect(() => {
    (async () => {
      const resp = await fetchResumes();
      setResumes(resp ?? []);
    })();
  }, []);

  const table: TableProps = {
    data: [
      {
        name: "Title",
        values: resumes.map((res) => ({
          value: res.title ?? "",
          data: res.id,
        })),
      },
      {
        name: "Stack",
        values: resumes.map((res) => ({
          value: res.skills.join(", "),
        })),
      },
      {
        name: "Version",
        values: resumes.map((res) => ({
          value: "version " + String(res.version),
        })),
      },
      {
        name: "Published",
        values: resumes.map((res) => ({
          value: res.is_published ? "Published 🚀" : "Draft",
        })),
      },
    ],
  };
  return (
    <div className="relative overflow-x-auto sm:rounded-lg">
      <Table data={table.data} />
    </div>
  );
};

export default Resume;
