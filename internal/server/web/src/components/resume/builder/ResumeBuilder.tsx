"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import ResumePreview from "./ResumePreview";
import { Expand, Grip, Maximize, Plus } from "lucide-react";
import { useStore } from "../../../store";
import { useResumeStore } from "../../../store/resumeStore";
import { useParams } from "react-router";
import PersonalInformation from "./PersonalInformation";
import JobWorkExperience from "./JobWorkExperience";
import Education from "./Education";
import ResumeHeader from "./ResumeHeader";
import { DragControls, Reorder, useDragControls } from "motion/react";
import type { ReOrder } from "../type";
import SkillComponent from "./Skills";

export default function ResumeBuilder() {
  const { id } = useParams();
  const store = useStore();
  const {
    resume,
    addExperience,
    addEducation,
  } = useResumeStore();

  useEffect(() => {
    store.fetchProjects();
    // eslint-disable-next-line
  }, []);

  const previewStorageKey = "gitresume-preview";
  const resumeRef = useRef<HTMLDivElement>(null);
  const [fullScreen, setFullScreen] = useState(
    localStorage.getItem(previewStorageKey) === "1" || false,
  );

  const handlePreviewMode = () => {
    const currentStatus = localStorage.getItem(previewStorageKey) === "1";
    const newStatus = currentStatus ? "0" : "1";

    localStorage.setItem(previewStorageKey, newStatus);
    setFullScreen(!currentStatus);
  };

  const controls = useDragControls();

  const experience = (
    <WorkExperienceComp
      createExperience={addExperience}
      dragControls={controls}
      // item={items}
    />
  );

  const education = (
    <Card className="p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3 mb-4">
          <button
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => {
              controls.start(e);
            }}
          >
            <Grip size={20} />
          </button>
          <h2 className="text-xl font-semibold text-card-foreground">
            Education
          </h2>
        </div>

        <Button
          onClick={addEducation}
          size="sm"
          variant="outline"
          className="gap-2 bg-transparent bg-blue-400 text-white hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      <Education />
    </Card>
  );

  const skillComp = <SkillComponent />;

  const sections: ReOrder[] = [{
    label: "experience",
    component: experience,
  }, {
    label: "education",
    component: education,
  }, {
    label: "skills",
    component: skillComp,
  }];
  const [items, setItems] = useState(sections);

  return (
    <div className="min-h-screen bg-muted/30">
      <ResumeHeader resumeHTML={resumeRef.current} id={id as string} />
      <div className="container mx-auto px-4 py-8">
        <div className={`${fullScreen ? "" : "grid lg:grid-cols-2 gap-8"}`}>
          <div className={`space-y-6 ${fullScreen ? "hidden" : ""}`}>
            {/* Personal Information */}
            <Card className="p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">
                Personal Information
              </h2>
              <PersonalInformation />
            </Card>

            <div>
              <Reorder.Group
                axis="y"
                as="ul"
                values={items}
                onReorder={setItems}
              >
                {items.map((item) => (
                  <div key={item.label} className="my-5">
                    <Reorder.Item
                      value={item}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.15 },
                      }}
                      exit={{
                        opacity: 0,
                        y: 20,
                        transition: { duration: 0.3 },
                      }}
                      whileDrag={{ backgroundColor: "#e3e3e3" }}
                      className={item ? "selected" : ""}
                      dragListener={false}
                      dragControls={controls}
                    >
                      {item.component}
                    </Reorder.Item>
                  </div>
                ))}
              </Reorder.Group>
            </div>
          </div>

          {/* Preview Section */}
          <div
            className={`lg:sticky lg:top-0 h-fit overflow-y-auto w-full`}
          >
            <div className="flex justify-end">
              <button
                className="text-sm underline hover:no-underline cursor-pointer my-2"
                onClick={handlePreviewMode}
              >
                {fullScreen ? <Expand /> : <Maximize />}
              </button>
            </div>
            <div ref={resumeRef}>
              <ResumePreview
                data={resume}
                order={items.map((item) => item.label)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const WorkExperienceComp: React.FC<
  { createExperience: () => void; dragControls: DragControls }
> = (
  { createExperience, dragControls },
) => {
  return (
    <Card className="p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3 mb-4">
          <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing" //
            // onPointerDown={(event) => dragControls.start(event)}
            // // For better touch support consider adding onTouchStart too
            // onTouchStart={(event) => dragControls.start(event)}
            // aria-label={`Drag handle for ${item}`}
          >
            <Grip size={20} />
          </button>
          <h2 className="text-xl font-semibold text-card-foreground">
            Experience
          </h2>
        </div>
        <Button
          onClick={createExperience}
          size="sm"
          variant="outline"
          className="gap-2 bg-transparent bg-blue-400 text-white hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      <JobWorkExperience />
    </Card>
  );
};
