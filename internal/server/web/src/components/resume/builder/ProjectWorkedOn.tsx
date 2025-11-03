import { useState } from "react";
import type { Project } from "../type";
import { useResumeStore } from "../../../store/resumeStore";
import { Label } from "@radix-ui/react-label";
import {
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Info,
  Trash2,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Textarea } from "../../ui/Textarea";
import { isValidUrl, t } from "../../../util/config";

const ProjectWorkedOn = () => {
  const { resume, deleteProject, upsertProjects, patchProject } =
    useResumeStore();
  const projects = resume.project_worked_on || [];

  const updateProject = (id: number, value: Partial<Project>) => {
    const values = projects.map((prj, index) =>
      index === id ? { ...prj, ...value } : prj
    );
    patchProject(values);
  };

  const [openId, setOpenId] = useState<number | null>(null);
  const handleCollapse = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const handleCreateProject = () => {
    const isEmptyTitle = projects.some((prj) => prj.title === "");
    if (isEmptyTitle) {
      return t({ message: "Title cannot be empty", icon: <Info /> });
    }
    const IsInvalidLink = projects.some(
      (prj) => prj.link !== "" && !isValidUrl(prj.link as string)
    );
    if (IsInvalidLink) {
      return t({ message: "Invalid link", icon: <Info /> });
    }
    upsertProjects(projects);
    return t({
      message: "Great! Your project has been added",
      icon: <CircleCheck />,
    });
  };

  const removeProject = (index: number) => {
    if (!confirm("Are you sure ?")) {
      return;
    }
    const local = projects.find((_, idx) => index === idx);
    const prj = projects.filter((_, idx) => idx !== index);

    if (local?.id) {
      deleteProject(local?.id);
    } else {
      patchProject(prj);
    }
  };
  return (
    <div className="space-y-6">
      {projects.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No project added yet. Click "Add" to get started.
        </p>
      ) : (
        projects.map((prj, id) => (
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
                    {prj.title || "Project " + Number(id + 1)}{" "}
                  </span>
                )}
              </div>
              <Button
                onClick={() => removeProject(id)}
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
                  <Label>Title</Label>
                  <Input
                    className="my-1 border-gray-300"
                    placeholder="Projet Title"
                    value={prj.title || ""}
                    onChange={(e) => {
                      updateProject(id, {
                        title: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    className="my-1 border-gray-300"
                    placeholder="Describe project"
                    value={prj.description || ""}
                    onChange={(e) => {
                      updateProject(id, {
                        description: e.target.value,
                      });
                    }}
                  />
                </div>

                <div>
                  <Label>Technologies</Label>
                  <Input
                    className="my-1 border-gray-300"
                    placeholder="Go, PHP, Reactjs, etc"
                    value={prj.technologies || ""}
                    onChange={(e) =>
                      updateProject(id, {
                        technologies: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Link</Label>
                  <Input
                    type="month"
                    className="my-1 border-gray-300"
                    value={prj.link || ""}
                    onChange={(e) =>
                      updateProject(id, {
                        link: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        ))
      )}
      {projects.length > 0 && (
        <button
          className="bg-cyan-600 hover:bg-cyan-500 px-5 py-3 rounded-md text-sm text-white"
          onClick={handleCreateProject}
        >
          Save
        </button>
      )}
    </div>
  );
};
export default ProjectWorkedOn;
