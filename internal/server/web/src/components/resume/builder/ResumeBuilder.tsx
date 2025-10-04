"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import { Textarea } from "../../ui/Textarea";
import ResumePreview from "./ResumePreview";
import { Plus, Trash2 } from "lucide-react";
import Select, { type MultiValue } from "react-select";
import { useStore } from "../../../store";
import { useResumeStore } from "../../../store/resumeStore";
import GREditor from "../../ui/GREditor";
import { useParams } from "react-router";
import type { CommitMessage } from "../../../types/project";
import Sample from "../../ui/Sample";

export default function ResumeBuilder() {
  const { id } = useParams();
  const store = useStore();
  const {
    resume,
    addSkill,
    removeSkill,
    updateProfile,
    patchResume,
    patchEducation,
    addEducation,
    removeEducation,
    addExperience,
    patchExperience,
    removeExperience,
  } = useResumeStore();

  const updatePersonalInfo = (field: string, value: string) => {
    const payload = { ...resume.profile, [field]: value };
    updateProfile(payload);
  };

  const [isEditable, setIsEditable] = useState(false);

  const handleChangeTitle = (value: string) => {
    patchResume({
      ...resume,
      id: Number(id),
      title: value.trim(),
    });
  };

  useEffect(() => {
    store.fetchProjects();
    // eslint-disable-next-line
  }, []);

  const projectList = useMemo(
    () => store.projects.map((p) => ({ label: p.name, value: p.id })),
    [store.projects],
  );

  const [skill, setSkill] = useState("");
  const [hasProjectSelected, setHasProjectSelected] = useState(false);
  const [projects, setProjects] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const handleProjectSelection = (
    e: MultiValue<{ label: string; value: string }>,
  ) => {
    // const values = e.map((item) => item.value);
    setProjects([...projects, ...e]);
    setHasProjectSelected(!!e.length);
  };

  const handleAddSkill = () => {
    addSkill(skill);
    setSkill("");
  };

  const handleAddResponsibility = async (version: number, id: number) => {
    let commits: CommitMessage[] = [];

    if (projects.length == 0) {
      return;
    }

    const originalCommitLogs = store.projects.filter((p) =>
      projects.some((prj) => prj.value === p.id)
    );

    const flatProjects = originalCommitLogs.flatMap((c) => c.commits);
    commits = flatProjects;

    if (version == 1) {
      const translatedCommits = await Promise.all(
        projects.map((p) => store.fetchCommitSummary(Number(p.value))),
      );
      commits = translatedCommits.flat();
    }
    const messages = commits.map((commit) => "<li>" + commit.message + "</li>");
    const value = "<ul>" + messages.join("\n\n") + "</ul>";

    patchExperience(id, { responsibilities: value });
  };

  const handleProjectVersion = async (version: string, id: number) => {
    await handleAddResponsibility(Number(version), Number(id));
  };

  const [isSticky, setIsSticky] = useState(true);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 300) {
        setIsSticky(false); // unstick when user scrolls past some point
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background sticky top-0 z-10">
        <div
          className={`text-gray-700 text-2xl p-2 focus:outline-none focus:border-blue-500 focus:ring-0
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
          onInput={(e) => handleChangeTitle(e.currentTarget.textContent)}
        >
          {resume.title ?? "Untitled Resume"}
        </div>
        {
          /* <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">
            Resume Builder
          </h1>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div> */
        }
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">
                Personal Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={resume.profile.name}
                    // value={resumeData.personalInfo.fullName}
                    onChange={(e) =>
                      updatePersonalInfo(
                        "name",
                        e.target.value,
                      )}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      // value={resumeData.personalInfo
                      //   .email}
                      value={resume.profile.email}
                      onChange={(e) =>
                        updatePersonalInfo(
                          "email",
                          e.target.value,
                        )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={resume.profile.phone}
                      onChange={(e) =>
                        updatePersonalInfo(
                          "phone",
                          e.target.value,
                        )}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={resume.profile.location}
                    onChange={(e) =>
                      updatePersonalInfo(
                        "location",
                        e.target.value,
                      )}
                  />
                </div>
                <div>
                  <Label htmlFor="summary">
                    Professional Summary
                  </Label>
                  <GREditor
                    placeholder="Brief overview of your professional background and goals..."
                    value={resume.profile.professional_summary}
                    handleEdit={(e) =>
                      updatePersonalInfo(
                        "professional_summary",
                        e,
                      )}
                  />
                </div>
              </div>
            </Card>

            {/* Experience */}
            <Card className="p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-card-foreground">
                  Experience
                </h2>
                <Button
                  onClick={addExperience}
                  size="sm"
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-6">
                {resume.work_experiences.length === 0
                  ? (
                    <p className="text-muted-foreground text-sm">
                      No experience added yet. Click "Add" to get started.
                    </p>
                  )
                  : (
                    resume.work_experiences.map((exp, id) => (
                      <div
                        key={exp.id}
                        className="space-y-4 p-4 bg-muted/50 rounded-lg relative"
                      >
                        <Button
                          onClick={() =>
                            removeExperience(
                              exp.id || id,
                            )}
                          size="icon"
                          variant="ghost"
                          className="absolute top-[-10px] right-2 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Company</Label>
                            <Input
                              placeholder="Company Name"
                              value={exp.company}
                              onChange={(e) =>
                                patchExperience(exp.id || id, {
                                  company: e.target.value,
                                })}
                            />
                          </div>
                          <div>
                            <Label>Position</Label>
                            <Input
                              placeholder="Job Title"
                              value={exp.job_title}
                              onChange={(e) =>
                                patchExperience(exp.id || id, {
                                  job_title: e.target.value,
                                })}
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label>
                              Start Date
                            </Label>
                            <Input
                              type="month"
                              value={exp.start_date}
                              onChange={(e) =>
                                patchExperience(exp.id || id, {
                                  start_date: e.target.value,
                                })}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="month"
                              value={exp.end_date}
                              onChange={(e) =>
                                patchExperience(exp.id || id, {
                                  end_date: e.target.value,
                                })}
                              placeholder="Present"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Select project(s)</Label>
                          <Select
                            isMulti
                            placeholder="Select the project you worked on while working at the company"
                            options={projectList}
                            className="h-8 bg-white dark:bg-gray-700 dark:text-white text-sm"
                            onChange={handleProjectSelection}
                          />
                        </div>
                        {hasProjectSelected && (
                          <div>
                            <select
                              className="w-full p-3"
                              onChange={(e) =>
                                handleProjectVersion(
                                  e.target.value,
                                  Number(exp.id),
                                )}
                            >
                              <option value="">Select project version</option>
                              <option value="0">Original</option>
                              <option value="1">Translated</option>
                            </select>
                          </div>
                        )}
                        <div>
                          <Label>Description</Label>
                          <GREditor
                            id={exp.id}
                            placeholder="Describe your responsibilities and achievements..."
                            handleEdit={(value) => {
                              patchExperience(exp.id || id, {
                                responsibilities: value,
                              });
                            }}
                            value={exp.responsibilities}
                          />
                        </div>
                      </div>
                    ))
                  )}
              </div>
            </Card>

            {/* Education */}

            <Card className="p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-card-foreground">
                  Education
                </h2>
                <Button
                  onClick={addEducation}
                  size="sm"
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-6">
                {resume.education.length === 0
                  ? (
                    <p className="text-muted-foreground text-sm">
                      No education added yet. Click "Add" to get started.
                    </p>
                  )
                  : (
                    resume.education.map((edu, id) => (
                      <div
                        key={edu.id || id}
                        className="space-y-4 p-4 bg-muted/50 rounded-lg relative"
                      >
                        <Button
                          onClick={() => {
                            if (window.confirm("Are you sure ?")) {
                              removeEducation(Number(edu.id));
                            }
                          }}
                          size="icon"
                          variant="ghost"
                          className="absolute top-[-10px] right-2 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        <div>
                          <Label>School</Label>
                          <Input
                            placeholder="University Name"
                            value={edu.school || ""}
                            onChange={(e) => {
                              patchEducation(
                                edu.id || id,
                                { school: e.target.value },
                              );
                            }}
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Degree</Label>
                            <Input
                              placeholder="Bachelor's, Master's, etc."
                              value={edu.degree}
                              onChange={(e) =>
                                patchEducation(
                                  edu.id || id,
                                  { degree: e.target.value },
                                )}
                            />
                          </div>
                          <div>
                            <Label>
                              Field of Study
                            </Label>
                            <Input
                              placeholder="Computer Science"
                              value={edu.field_of_study}
                              onChange={(e) =>
                                patchEducation(
                                  edu.id || id,
                                  { field_of_study: e.target.value },
                                )}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>
                            Graduation Date
                          </Label>
                          <Input
                            type="month"
                            value={edu.date_from}
                            onChange={(e) =>
                              patchEducation(
                                edu.id || id,
                                { date_from: e.target.value },
                              )}
                          />
                        </div>
                      </div>
                    ))
                  )}
              </div>
            </Card>

            {/* Skills */}

            <Card className="p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">
                Skills
              </h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., JavaScript, Project Management)"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  />
                  <Button onClick={handleAddSkill} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, index) => (
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
            </Card>
          </div>

          {/* Preview Section */}
          <div
            className={`lg:sticky lg:top-24 h-fit overflow-y-auto`}
          >
            <div className="flex gap-2 mb-2">
              <select className="bg-white p-4 my-2">
                <option>Select format</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
              </select>
              <button className="bg-blue-400 text-white text-xs rounded-md p-2">
                Download
              </button>
            </div>
            <ResumePreview data={resume} />
          </div>
        </div>
      </div>
    </div>
  );
}
