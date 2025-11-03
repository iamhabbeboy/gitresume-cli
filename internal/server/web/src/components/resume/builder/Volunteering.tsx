import { useState } from "react";
import type { Education as EducationType, Volunteer } from "../type";
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

const Volunteering = () => {
  const { resume, deleteVolunteer, upsertVolunteer, patchVolunteer } =
    useResumeStore();
  const volunteers = resume.volunteers || [];

  const updateVolunteer = (id: number, value: Partial<Volunteer>) => {
    const values = volunteers.map((vol, index) =>
      index === id ? { ...vol, ...value } : vol
    );
    patchVolunteer(values);
  };

  const [openId, setOpenId] = useState<number | null>(null);
  const handleCollapse = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const handleCreateVolunteer = () => {
    const isEmptyTitle = volunteers.some((prj) => prj.title === "");
    if (isEmptyTitle) {
      return t({ message: "Title cannot be empty", icon: <Info /> });
    }
    const IsInvalidLink = volunteers.some(
      (prj) => prj.link !== "" && !isValidUrl(prj.link as string)
    );
    if (IsInvalidLink) {
      return t({ message: "Invalid link", icon: <Info /> });
    }
    upsertVolunteer(volunteers);
    return t({
      message: "Great! Your volunteering activity has been added",
      icon: <CircleCheck />,
    });
  };

  const removeVolunteer = (index: number) => {
    if (!confirm("Are you sure ?")) {
      return;
    }
    const local = volunteers.find((_, idx) => index === idx);
    const vol = volunteers.filter((_, idx) => idx !== index);

    if (local?.id) {
      deleteVolunteer(local.id);
    } else {
      patchVolunteer(vol);
    }
  };
  return (
    <div className="space-y-6">
      {volunteers.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No project added yet. Click "Add" to get started.
        </p>
      ) : (
        volunteers.map((vol, id) => (
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
                    {vol.title || "Volunteering " + Number(id + 1)}{" "}
                  </span>
                )}
              </div>
              <Button
                onClick={() => removeVolunteer(id)}
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
                    placeholder=""
                    value={vol.title || ""}
                    onChange={(e) => {
                      updateVolunteer(id, {
                        title: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder=""
                    className="my-1 border-gray-300"
                    value={vol.description}
                    onChange={(e) =>
                      updateVolunteer(id, {
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Link</Label>
                  <Input
                    className="my-1 border-gray-300"
                    placeholder=""
                    value={vol.link}
                    onChange={(e) =>
                      updateVolunteer(id, {
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
      {volunteers.length > 0 && (
        <button
          className="bg-cyan-600 hover:bg-cyan-500 px-5 py-3 rounded-md text-sm text-white"
          onClick={handleCreateVolunteer}
        >
          Save
        </button>
      )}
    </div>
  );
};
export default Volunteering;
