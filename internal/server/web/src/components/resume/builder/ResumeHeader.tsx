import { useState } from "react";
import { useResumeStore } from "../../../store/resumeStore";
import { prependTailwindHTMLForExport } from "../../../../lib/utils";
import axios from "axios";
import { Download } from "lucide-react";
import { baseUri, defaultTitle, t } from "../../../util/config";
import Spinner from "../../Spinner";
import { Button } from "../../ui/Button";

type Props = {
  id: string;
  resumeHTML: HTMLDivElement | null;
};

const ResumeHeader: React.FC<Props> = ({ id, resumeHTML }) => {
  const { resume, patchResume } = useResumeStore();
  const [isEditable, setIsEditable] = useState(false);
  const handleChangeTitle = (value: string) => {
    patchResume({
      ...resume,
      id: Number(id),
      title: value.trim(),
    });
    setIsEditable(false);
  };

  const [format, setFormat] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (format === "") {
      return t("Select a export format", "error");
    }
    try {
      setIsDownloading(true);
      const resumeTitle = resume.title || defaultTitle;
      const formatTitle = resumeTitle.trim().replace(/[^a-zA-Z0-9]/g, "-");
      const res = await axios.post(
        `${baseUri}/api/export?format=${format}`,
        prependTailwindHTMLForExport(resumeHTML?.innerHTML as string),
        {
          headers: { "Content-Type": "text/html" },
          responseType: "blob",
        },
      );
      const blob = new Blob([res.data], {
        type: res.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `${formatTitle.toLowerCase()}.${format}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // clean up
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.log(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <header className="bg-background sticky top-0 z-10 flex">
      <div
        className={`w-10/12 text-gray-700 text-2xl p-2 focus:outline-none focus:border-blue-500 focus:ring-0
              empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none transition ${
          isEditable
            ? "border-b border-border border-gray-500 bg-gray-100"
            : "border-transparent bg-white cursor-pointer"
        }`}
        contentEditable={isEditable}
        suppressContentEditableWarning={true}
        onClick={() => !isEditable && setIsEditable(true)}
        onBlur={() => setIsEditable(false)}
        data-placeholder="Type here..."
        title="Click to edit"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleChangeTitle(
              e.currentTarget.textContent as string,
            );
          }
        }}
      >
        {resume.title ?? defaultTitle}
      </div>
      <div className=" w-4/12 flex gap-2 justify-end align-center">
        <select
          className="bg-white p-1 px-4 border border-1 border-gray-300 rounded-md h-10 focus:outline-none text-sm"
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="">Select format</option>
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
          <option value="md">Markdown</option>
        </select>
        <Button
          onClick={handleDownload}
          className="gap-2 bg-blue-400 text-white hover:bg-blue-500 transition"
          disabled={isDownloading}
        >
          {isDownloading ? <Spinner /> : <Download className="h-4 w-4" />}
          Download PDF
        </Button>
      </div>
    </header>
  );
};
export default ResumeHeader;
