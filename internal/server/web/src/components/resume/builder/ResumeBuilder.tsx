"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "../../ui/Card";
import ResumePreview from "./ResumePreview";
import { Expand, Maximize } from "lucide-react";
import { useStore } from "../../../store";
import { useResumeStore } from "../../../store/resumeStore";
import { useParams } from "react-router";
import PersonalInformation from "./PersonalInformation";
import JobWorkExperience from "./JobWorkExperience";
import Education from "./Education";
import ResumeHeader from "./ResumeHeader";
import { Reorder } from "motion/react";
import { OrderLabel, type ReOrderType } from "../type";
import SkillComponent from "./Skills";
import ProjectWorkedOn from "./ProjectWorkedOn";
import ReOrderSection from "./ReOrderSection";
import Volunteering from "./Volunteering";

export default function ResumeBuilder() {
  const { id } = useParams();
  const store = useStore();
  const { resume, addExperience, addEducation, addProject, addVolunteer } =
    useResumeStore();

  useEffect(() => {
    store.fetchProjects();
    // eslint-disable-next-line
  }, []);

  const previewStorageKey = "gitresume-preview";
  const resumeRef = useRef<HTMLDivElement>(null);
  const [fullScreen, setFullScreen] = useState(
    localStorage.getItem(previewStorageKey) === "1" || false
  );

  const handlePreviewMode = () => {
    const currentStatus = localStorage.getItem(previewStorageKey) === "1";
    const newStatus = currentStatus ? "0" : "1";

    localStorage.setItem(previewStorageKey, newStatus);
    setFullScreen(!currentStatus);
  };

  const sections: ReOrderType[] = [
    {
      label: OrderLabel.WorkExperience,
      addEvent: addExperience,
      component: <JobWorkExperience />,
    },
    {
      label: OrderLabel.Education,
      addEvent: addEducation,
      component: <Education />,
    },
    {
      label: OrderLabel.Skills,
      component: <SkillComponent />,
    },
    {
      label: OrderLabel.Projects,
      addEvent: addProject,
      component: <ProjectWorkedOn />,
    },
    {
      label: OrderLabel.Volunteer,
      addEvent: addVolunteer,
      component: <Volunteering />,
    },
  ];
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
                    <ReOrderSection item={item} />
                  </div>
                ))}
              </Reorder.Group>
            </div>
          </div>

          {/* Preview Section */}
          <div className={`lg:sticky lg:top-0 h-fit overflow-y-auto w-full`}>
            <div className="flex justify-between">
              <select className="border border-gray-100 px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none h-9 rounded-md">
                <option value="default">Default layout</option>
              </select>
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
