"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import ResumePreview from "./ResumePreview";
import { Download, Expand, Maximize, Plus, Trash2 } from "lucide-react";
// import type { MultiValue } from "react-select";
import Select from "react-dropdown-select";
import { useStore } from "../../../store";
import { useResumeStore } from "../../../store/resumeStore";
import GREditor from "../../ui/GREditor";
import { useParams } from "react-router";
import type { CommitMessage } from "../../../types/project";
import type { Education, OptionType, WorkExperience } from "../type";
import axios from "axios";
import { baseUri } from "../../../util/config";

export default function ResumeBuilder() {
  const { id } = useParams();
  const store = useStore();
  const {
    resume,
    updateSkills,
    removeSkill,
    updateProfile,
    patchResume,
    deleteEducation,
    updateExperience,
    deleteExperience,
    updateEducation,
  } = useResumeStore();

  const updatePersonalInfo = (field: string, value: string) => {
    const payload = { ...resume.profile, [field]: value };
    updateProfile(payload);
  };

  const [isEditable, setIsEditable] = useState(false);

  const [experience, setExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);

  useEffect(() => {
    setSkills(resume.skills || []);
    setExperience(resume.work_experiences || []);
    setEducation(resume.education || []);
  }, [resume.education, resume.skills, resume.work_experiences]);

  const removeExperience = (id: number) => {
    deleteExperience(id);
  };

  const createExperience = () => {
    const exp: WorkExperience = {
      company: "",
      role: "",
      location: "",
      start_date: "",
      end_date: "",
      is_current: false,
      projects: [],
      responsibilities: "",
    };
    setExperience([...experience, exp]);
  };

  const updateExp = (id: number, value: Partial<WorkExperience>) => {
    const values = experience.map((exp, index) =>
      index === id ? { ...exp, ...value } : exp
    );
    setExperience(values);
  };

  const handleChangeTitle = (value: string) => {
    patchResume({
      ...resume,
      id: Number(id),
      title: value.trim(),
    });
    setIsEditable(false);
  };

  useEffect(() => {
    store.fetchProjects();
    // eslint-disable-next-line
  }, []);

  const projectList = useMemo(
    () => store.projects.map((p, indx) => ({ label: p.name, value: indx })),
    [store.projects],
  );

  const [skill, setSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [hasProjectSelected, setHasProjectSelected] = useState(false);
  const [projects, setProjects] = useState<OptionType[]>([]);

  const handleProjectSelection = (values: OptionType[], id: number) => {
    setProjects([...projects, ...values]);
    setHasProjectSelected(!!values.length);
    const value = values.map((prj) => prj.label);
    updateExp(id, { projects: value });
  };

  const handleAddSkill = () => {
    setSkills([...skills, skill]);
    setSkill("");
  };

  const handleSaveSkills = () => {
    updateSkills(skills);
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

    setExperience((prev) =>
      prev.map((exp, idx) =>
        idx === id ? { ...exp, responsibilities: value } : exp
      )
    );
  };

  const handleProjectVersion = async (version: string, id: number) => {
    await handleAddResponsibility(Number(version), Number(id));
  };

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

  const [format, setFormat] = useState("");

  const handleDownload = async () => {
    try {
      console.log("preparing");
      const resumeData = resumeRef.current;
      const resumeTitle = resume.title || "Untitled Resume";
      const formatTitle = resumeTitle.replace(/[^a-zA-Z0-9]/g, "-");
      const res = await axios.post(`${baseUri}/api/export?format=${format}`, {
        data: resumeData?.innerHTML,
      });
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
    }
  };

  const createEducation = () => {
    const edu: Education = {
      school: "",
      degree: "",
      field_of_study: "",
      end_date: "",
    };
    setEducation([...education, edu]);
  };

  const handleCreateExperience = () => {
    updateExperience(experience);
  };

  const patchEducation = (id: number, value: Partial<Education>) => {
    const values = education.map((exp, index) =>
      index === id ? { ...exp, ...value } : exp
    );
    setEducation(values);
  };

  const handleCreateEducation = () => {
    updateEducation(education);
  };

  return (
    <div className="min-h-screen bg-muted/30">
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
              handleChangeTitle(e.currentTarget.textContent as string);
            }
          }}
        >
          {resume.title ?? "Untitled Resume"}
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
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className={`${fullScreen ? "" : "grid lg:grid-cols-2 gap-8"}`}>
          {/* Form Section */}
          <div className={`space-y-6 ${fullScreen ? "hidden" : ""}`}>
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
                    onChange={(e) => updatePersonalInfo("name", e.target.value)}
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
                        updatePersonalInfo("email", e.target.value)}
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
                        updatePersonalInfo("phone", e.target.value)}
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
                      updatePersonalInfo("location", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="summary">Professional Summary</Label>
                  <GREditor
                    placeholder="Brief overview of your professional background and goals..."
                    value={resume.profile.professional_summary}
                    handleEdit={(e) =>
                      updatePersonalInfo("professional_summary", e)}
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
                  onClick={createExperience}
                  size="sm"
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-6">
                {experience.length === 0
                  ? (
                    <p className="text-muted-foreground text-sm">
                      No experience added yet. Click "Add" to get started.
                    </p>
                  )
                  : (
                    experience.map((exp, id) => (
                      <div
                        key={id}
                        className={`space-y-4 p-4 bg-muted/50 rounded-lg relative`}
                      >
                        <Button
                          onClick={() => removeExperience(id)}
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
                                updateExp(id, {
                                  company: e.target.value,
                                })}
                            />
                          </div>
                          <div>
                            <Label>Position</Label>
                            <Input
                              placeholder="Job Title"
                              value={exp.role}
                              onChange={(e) =>
                                updateExp(id, {
                                  role: e.target.value,
                                })}
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="month"
                              value={exp.start_date}
                              onChange={(e) =>
                                updateExp(id, {
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
                                updateExp(id, {
                                  end_date: e.target.value,
                                })}
                              placeholder="Present"
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Location</Label>
                            <Input
                              type="location"
                              value={exp.location}
                              onChange={(e) =>
                                updateExp(id, {
                                  location: e.target.value,
                                })}
                              placeholder="Location"
                            />
                          </div>
                          <div>
                            <Label>Select project(s)</Label>
                            <Select
                              multi
                              options={projectList}
                              onChange={(values) =>
                                handleProjectSelection(values, id)}
                              values={exp.projects
                                ? exp.projects.map((value, indx) => ({
                                  value: indx,
                                  label: value,
                                }))
                                : []}
                            />
                          </div>
                        </div>
                        {hasProjectSelected && (
                          <div>
                            <select
                              className="w-full p-3 border border-gray-100"
                              onChange={(e) =>
                                handleProjectVersion(
                                  e.target.value,
                                  id,
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
                              updateExp(id, {
                                responsibilities: value,
                              });
                            }}
                            value={exp.responsibilities}
                          />
                        </div>
                      </div>
                    ))
                  )}
                {experience.length > 0 && (
                  <button
                    className="bg-blue-400 px-5 py-3 rounded-md text-sm text-white"
                    onClick={handleCreateExperience}
                  >
                    Save
                  </button>
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
                  onClick={createEducation}
                  size="sm"
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-6">
                {education.length === 0
                  ? (
                    <p className="text-muted-foreground text-sm">
                      No education added yet. Click "Add" to get started.
                    </p>
                  )
                  : (
                    education.map((edu, id) => (
                      <div
                        key={id}
                        className="space-y-4 p-4 bg-muted/50 rounded-lg relative"
                      >
                        <Button
                          onClick={() => {
                            if (window.confirm("Are you sure ?")) {
                              deleteEducation(id);
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
                              patchEducation(id, {
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
                              value={edu.degree}
                              onChange={(e) =>
                                patchEducation(id, {
                                  degree: e.target.value,
                                })}
                            />
                          </div>
                          <div>
                            <Label>Field of Study</Label>
                            <Input
                              placeholder="Computer Science"
                              value={edu.field_of_study}
                              onChange={(e) =>
                                patchEducation(id, {
                                  field_of_study: e.target.value,
                                })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Graduation Date</Label>
                          <Input
                            type="month"
                            value={edu.end_date}
                            onChange={(e) =>
                              patchEducation(id, {
                                end_date: e.target.value,
                              })}
                          />
                        </div>
                      </div>
                    ))
                  )}
                {education.length > 0 && (
                  <button
                    className="bg-blue-400 px-5 py-3 rounded-md text-sm text-white"
                    onClick={handleCreateEducation}
                  >
                    Save
                  </button>
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
                {skills.length > 0 && (
                  <button
                    className="bg-blue-400 px-5 py-3 rounded-md text-sm text-white"
                    onClick={handleSaveSkills}
                  >
                    Save
                  </button>
                )}
              </div>
            </Card>
          </div>

          {/* Preview Section */}
          <div
            className={`lg:sticky lg:top-0 h-fit overflow-y-auto w-full`}
            ref={resumeRef}
          >
            <div className="flex justify-end">
              <button
                className="text-sm underline hover:no-underline cursor-pointer my-2"
                onClick={handlePreviewMode}
              >
                {fullScreen ? <Expand /> : <Maximize />}
              </button>
            </div>
            <ResumePreview data={resume} />
          </div>
        </div>
      </div>
    </div>
  );
}
