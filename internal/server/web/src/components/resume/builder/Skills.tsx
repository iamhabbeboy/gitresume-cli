import { Grip, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useResumeStore } from "../../../store/resumeStore";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
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
    const sks = [...resume.skills || [], skill];
    updateSkills(sks);
    setSkill("");
  };

  const removeSkill = (index: number) => {
    const newSkill = resume.skills.filter((_, indx) => indx !== index);
    updateSkills(newSkill);
  };

  return (
    <Card className="p-6 shadow-sm border-gray-300">
      <div className="flex gap-3 mb-4">
        <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
          <Grip size={20} />
        </button>
        <h2 className="text-xl font-semibold text-card-foreground">
          Skills
        </h2>
      </div>
      <div className="space-y-4">
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
            className="bg-blue-400 text-white"
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
        {
          /* {skills.length > 0 && (
          <button
            className="bg-blue-400 px-5 py-3 rounded-md text-sm text-white"
            onClick={handleSaveSkills}
          >
            Save
          </button>
        )} */
        }
      </div>
    </Card>
  );
};
export default SkillComponent;
