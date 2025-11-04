import { useMemo, useState } from "react";
import { useResumeStore } from "../../../store/resumeStore";
import type { OptionType, WorkExperience } from "../type";
import { htmlListToArray, t } from "../../../util/config";
import { Button } from "../../ui/Button";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Info,
  Trash2,
} from "lucide-react";
import Select from "react-dropdown-select";
import GREditor from "../../ui/GREditor";
import { Input } from "../../ui/Input";

import { Label } from "../../ui/Label";
import { useStore } from "../../../store";
import { AIAvailableOptions, type CommitMessage } from "../../../types/project";
import { buildAIBody, transformTech } from "../../../../lib/utils";
import Spinner from "../../Spinner";
import _ from "lodash";
import type { CustomPrompt } from "../../../types/ai-config";
const JobWorkExperience = () => {
  const {
    loading,
    updateSkills,
    upsertExperience,
    resume,
    deleteExperience,
    patchExperience,
    summarizeResponsibility,
  } = useResumeStore();
  const store = useStore();

  const [hasProjectSelected, setHasProjectSelected] = useState(false);
  const [projects, setProjects] = useState<OptionType[]>([]);
  const [version, setVersion] = useState(-1);
  const experiences = resume.work_experiences;
  const [techStacks, setTechStacks] = useState<string[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [lastChangedExpId, setLastChangedExpId] = useState<number>(-1);

  const updateExp = (id: number, value: Partial<WorkExperience>) => {
    const values = experiences.map((exp, index) =>
      index === id ? { ...exp, ...value } : exp
    );
    setLastChangedExpId(id);
    patchExperience(values);
  };

  const handleProjectSelection = async (values: OptionType[], id: number) => {
    setVersion(0);
    setProjects(values);
    setHasProjectSelected(!!values.length);
    await handleAddResponsibility(version, id, values);
  };

  const removeExperience = (index: number) => {
    if (!confirm("Are you sure ?")) {
      return;
    }

    const localExp = experiences.find((_, idx) => index === idx);
    const exp = experiences.filter((_, idx) => idx !== index);
    if (localExp?.id) {
      deleteExperience(localExp?.id);
      return;
    } else {
      patchExperience(exp);
    }
  };

  const handleAddResponsibility = async (
    version: number,
    experienceIndex: number,
    selectedProjects: OptionType[]
  ) => {
    let commits: CommitMessage[] = [];

    const matchedProjects = store.projects.filter((p) =>
      selectedProjects.some((sp) => sp.label === p.name)
    );

    const objs = matchedProjects.map((value) => ({
      id: value.id,
      name: value.name,
    }));
    commits = matchedProjects.flatMap((p) => p.commits ?? []);
    if (version === 1) {
      const newObj = objs.filter((obj) =>
        selectedProjects.some((sel) => sel.label === obj.name)
      );
      const fetchedCommitGroups = await Promise.all(
        newObj.map((p) => store.fetchCommitSummary(Number(p.id)))
      );
      commits = fetchedCommitGroups.flatMap((group) => group || []);
    }
    const tech = matchedProjects.map((value) => value.technologies);
    const techs = [];
    for (const value of tech) {
      const transformObj = transformTech(value);
      techs.push(transformObj);
    }
    const flatTechArray = techs.flat();
    setTechStacks([...new Set([...flatTechArray])]);

    const responsibilitiesHTML = `
    <ul>
      ${commits.map((c) => `<li>${c.message}</li>`).join("\n")}
    </ul>
  `;
    const update = experiences.map((exp, idx) =>
      idx === experienceIndex
        ? {
            ...exp,
            responsibilities: responsibilitiesHTML,
            projects: selectedProjects.map((value) => value.label),
          }
        : exp
    );
    const stack = [...techStacks, ...resume.skills];
    updateSkills(_.uniq(stack));
    patchExperience(update);
  };

  const handleProjectVersion = async (_version: string, id: number) => {
    setVersion(Number(_version));
    await handleAddResponsibility(Number(_version), Number(id), projects);
  };

  const projectList = useMemo(
    () =>
      store.projects?.map((p) => ({
        label: p.name,
        value: Number(p.id),
      })),
    [store.projects]
  );

  const handleCollapse = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const handleCreateExperience = async () => {
    const status = await upsertExperience(experiences);
    if (status) {
      handleCollapse(lastChangedExpId);
      return t({
        message: "Great! Your experience has been added",
        icon: <CircleCheck />,
      });
    }
  };

  const handleSummarize = async (data: string, expId: number) => {
    const transform = htmlListToArray(data);
    const aiPromptConfig = store.ai_config;

    const customPrompt = aiPromptConfig.custom_prompt;
    const defaultModel = aiPromptConfig.models.find(
      (prmpt) => prmpt.is_default
    );

    const promptAvailable = customPrompt.find(
      (cp) => cp.title === AIAvailableOptions.SummarizeWorkExperience
    );

    if (!promptAvailable) {
      return t({
        message:
          "Error occured: The prompt for the commit message is not found",
        icon: <Info />,
      });
    }
    const prompt = promptAvailable?.prompts;
    const transformer = buildAIBody(prompt, transform);

    const body: CustomPrompt = {
      temperature: promptAvailable.temperature,
      max_tokens: promptAvailable.max_tokens,
      model: defaultModel?.name,
      version: defaultModel?.model,
      prompts: transformer,
      title: "",
      api_key: defaultModel?.api_key,
    };

    const resp = await summarizeResponsibility(body);
    if (!resp.success) {
      return t({
        message: "An error occurred while processing your request",
        icon: <Info />,
      });
    }

    if (data.length === 0) {
      return t({
        message: "No response from the AI infrastucture",
        icon: <Info />,
      });
    }
    const responsibilitiesHTML = `
      <ul>
        ${resp.data.map((c) => `<li>${c}</li>`).join("\n")}
      </ul>
    `;
    const update = experiences.map((exp, idx) =>
      idx === expId ? { ...exp, responsibilities: responsibilitiesHTML } : exp
    );
    patchExperience(update);
  };
  return (
    <div className="space-y-6">
      {experiences.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No experience added yet. Click "Add" to get started.
        </p>
      ) : (
        experiences.map((exp, id) => (
          <div
            key={id}
            className={`space-y-4 px-4 bg-muted/50 rounded-lg relative`}
          >
            <div className="flex justify-between">
              <div>
                <Button
                  className="h-8 w-8 bg-cyan-600 hover:bg-cyan-500 mr-3 cursor-pointer "
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
                    {exp.company || "Role " + Number(id + 1)}{" "}
                    {exp.role !== "" ? "-" + exp.role : ""}
                  </span>
                )}
              </div>
              <Button
                onClick={() => removeExperience(id)}
                size="icon"
                variant="ghost"
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            {openId === id && (
              <div>
                <div className="grid sm:grid-cols-2 gap-4 mb-2">
                  <div>
                    <Label>Company</Label>
                    <Input
                      className="my-1 border-gray-300"
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) =>
                        updateExp(id, {
                          company: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Input
                      className="my-1 border-gray-300"
                      placeholder="Job Title"
                      value={exp.role}
                      onChange={(e) =>
                        updateExp(id, {
                          role: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4  mb-2">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      className="my-1 border-gray-300"
                      type="month"
                      value={exp.start_date}
                      onChange={(e) =>
                        updateExp(id, {
                          start_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      className="my-1 border-gray-300"
                      type="month"
                      value={exp.end_date}
                      onChange={(e) =>
                        updateExp(id, {
                          end_date: e.target.value,
                        })
                      }
                      placeholder="Present"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4  mb-2">
                  <div>
                    <Label>Location</Label>
                    <Input
                      className="my-1 border-gray-300"
                      type="location"
                      value={exp.location}
                      onChange={(e) =>
                        updateExp(id, {
                          location: e.target.value,
                        })
                      }
                      placeholder="Location"
                    />
                  </div>
                  <div>
                    <Label>Select project(s)</Label>
                    <Select
                      className="my-1"
                      multi
                      options={projectList}
                      onChange={(values) => handleProjectSelection(values, id)}
                      values={
                        exp.projects
                          ? exp.projects.map((value, indx) => ({
                              value: indx,
                              label: value,
                            }))
                          : []
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  {hasProjectSelected && (
                    <div className="w-6/12">
                      Translation Version:
                      <select
                        className="w-full border border-gray-100  text-sm shadow-xs transition-[color,box-shadow] outline-none h-9 rounded-md"
                        onChange={(e) =>
                          handleProjectVersion(e.target.value, id)
                        }
                      >
                        <option value="">Select project version</option>
                        <option value="0" selected={version === 0}>
                          Original
                        </option>
                        <option value="1" selected={version === 1}>
                          Translated
                        </option>
                      </select>
                    </div>
                  )}
                  <div>
                    <Button
                      className="bg-indigo-500 text-white cursor-pointer hover:bg-indigo-400 h-7"
                      disabled={loading}
                      onClick={() => handleSummarize(exp.responsibilities, id)}
                    >
                      {loading ? <Spinner /> : <Bot size={30} />} Summarize with
                      AI
                    </Button>
                  </div>
                </div>
                {techStacks.length > 0 && (
                  <div className="text-xs my-2 bg-indigo-500 rounded-md p-2 text-white">
                    <b>Tech stacks:</b> {techStacks.join(", ")}
                  </div>
                )}
                <div>
                  <Label className="my-2">Description</Label>
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
            )}
          </div>
        ))
      )}
      {experiences.length > 0 && (
        <button
          className="bg-cyan-600 hover:bg-cyan-500 px-5 py-3 rounded-md text-sm text-white"
          onClick={handleCreateExperience}
        >
          Save
        </button>
      )}
    </div>
  );
};
export default JobWorkExperience;
