import { useState } from "react";
import type { Education as EducationType } from "../type";
import { useResumeStore } from "../../../store/resumeStore";
import { Label } from "@radix-ui/react-label";
import { ChevronDown, ChevronRight, CircleCheck, Trash2 } from "lucide-react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { t } from "../../../util/config";

const Education = () => {
  const { resume, deleteEducation, upsertEducation, patchEducation } =
    useResumeStore();
  const educations = resume.education || [];

  const updateEducation = (id: number, value: Partial<EducationType>) => {
    const values = educations.map((exp, index) =>
      index === id ? { ...exp, ...value } : exp
    );
    patchEducation(values);
  };

  const [openId, setOpenId] = useState<number | null>(null);
  const handleCollapse = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const handleCreateEducation = () => {
    upsertEducation(educations);
    return t({
      message: "Great! Your education has been added",
      icon: <CircleCheck />,
    });
  };

  const removeEducation = (index: number) => {
    if (!confirm("Are you sure ?")) {
      return;
    }
    const localEdu = educations.find((_, idx) => index === idx);
    const edu = educations.filter((_, idx) => idx !== index);

    if (localEdu?.id) {
      deleteEducation(localEdu?.id);
    } else {
      patchEducation(edu);
    }
  };
  return (
    <div className="space-y-6">
      {educations.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No education added yet. Click "Add" to get started.
        </p>
      ) : (
        educations.map((edu, id) => (
          <div
            key={id}
            className="space-y-4 px-4 bg-muted/50 rounded-lg relative"
          >
            <div className="flex justify-between">
              <div>
                <Button
                  className="h-8 w-8 mr-3 cursor-pointer bg-cyan-600 hover:bg-cyan-500"
                  onClick={() => handleCollapse(id)}
                >
                  {openId === id ? (
                    <ChevronRight className="text-white" />
                  ) : (
                    <ChevronDown className="text-white" />
                  )}
                </Button>
                {openId === id ? (
                  ""
                ) : (
                  <span
                    className="text-lg font-bold text-gray-600 cursor-pointer"
                    onClick={() => handleCollapse(id)}
                  >
                    {edu.school || "Education " + Number(id + 1)}{" "}
                  </span>
                )}
              </div>
              <Button
                onClick={() => removeEducation(id)}
                size="icon"
                variant="ghost"
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            {openId === id && (
              <div>
                <div>
                  <Label>School</Label>
                  <Input
                    className="my-1 border-gray-300"
                    placeholder="University Name"
                    value={edu.school || ""}
                    onChange={(e) => {
                      updateEducation(id, {
                        school: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Degree</Label>
                    <Input
                      placeholder="Bachelor's, Master's, etc."
                      className="my-1 border-gray-300"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(id, {
                          degree: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Field of Study</Label>
                    <Input
                      className="my-1 border-gray-300"
                      placeholder="Computer Science"
                      value={edu.field_of_study}
                      onChange={(e) =>
                        updateEducation(id, {
                          field_of_study: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Graduation Date</Label>
                  <Input
                    type="month"
                    className="my-1 border-gray-300"
                    value={edu.end_date}
                    onChange={(e) =>
                      updateEducation(id, {
                        end_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        ))
      )}
      {educations.length > 0 && (
        <button
          className="bg-cyan-600 hover:bg-cyan-500 px-5 py-3 rounded-md text-sm text-white"
          onClick={handleCreateEducation}
        >
          Save
        </button>
      )}
    </div>
  );
};
export default Education;
