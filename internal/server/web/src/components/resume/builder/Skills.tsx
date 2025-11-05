import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useResumeStore } from "../../../store/resumeStore";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";

const SkillComponent = () => {
  const { resume, updateSkills } = useResumeStore();
  const [skill, setSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    setSkills(resume.skills || []);
  }, [resume.education, resume.skills, resume.work_experiences]);

  const handleAddSkill = () => {
    if (skill === "") return;
    const sks = [...(resume.skills || []), skill];
    updateSkills(sks);
    setSkill("");
  };

  const removeSkill = (index: number) => {
    const newSkill = resume.skills.filter((_, indx) => indx !== index);
    updateSkills(newSkill);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Add a skill (e.g., JavaScript, Project Management)"
          className="my-1 border-gray-300 focus:border-gray-400 hover:border-gray-400"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
        />
        <Button
          onClick={handleAddSkill}
          size="icon"
          className="bg-cyan-600 hover:bg-cyan-500 text-white"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {skill}
            <button
              onClick={() => removeSkill(index)}
              className="hover:text-destructive"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SkillComponent;
