import Select from "react-dropdown-select";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Button } from "../../components/ui/Button";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { baseUri, t } from "../../util/config";
import type { OptionType } from "../../components/resume/type";
import { ChevronDown, CircleCheck, Info, Plus } from "lucide-react";
import { Textarea } from "../../components/ui/Textarea";
import type { CustomPrompt, LLmConfig, Prompt } from "../../types/ai-config";
import { useStore } from "../../store";

const LLMConfig = () => {
  const [llms, setLLms] = useState<LLmConfig[]>([]);
  const { ai_config } = useStore();

  const [promptOption, setPromptOption] = useState<CustomPrompt[]>([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const resp = ai_config;
        if (isMounted) {
          setLLms(resp.models);
          setPromptOption(resp.custom_prompt);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return t({
          message: "Failed to fetch LLMs:" + message,
          icon: <Info />,
        });
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const options = useMemo(
    () => llms.map((llm, index) => ({ label: llm.name, value: index })),
    [llms]
  );

  const defaultLLm = useMemo(() => llms.find((llm) => llm.is_default), [llms]);

  const [config, setConfig] = useState<Array<OptionType>>([]);

  const [llmValue, setLlmValue] = useState<LLmConfig>({
    name: "",
    api_key: "",
    is_default: false,
    model: "",
  });

  useEffect(() => {
    if (llms.length === 0) return;
    setConfig([
      {
        label: defaultLLm?.name ?? "",
        value: defaultLLm ? llms.findIndex((llm) => llm.is_default) : 0,
      },
    ]);
    setLlmValue({
      name: defaultLLm?.name ?? "",
      model: defaultLLm?.model ?? "",
      api_key: defaultLLm?.api_key ?? "",
      is_default: defaultLLm?.is_default ?? false,
    });
  }, [llms.length]);

  const handleConfig = (values: OptionType[]) => {
    setConfig(values);
    const llm = llms.find((ll) => ll.name === values?.[0]?.label);
    if (!llm) return;
    setLlmValue({ ...llm, name: values?.[0]?.label });
  };

  const handleSaveConfig = async () => {
    if (promptConfig.title === "") {
      return t({
        message: "The prompt for option is required!",
        icon: <Info />,
      });
    }

    const newDefaultConfig = { ...llmValue };
    newDefaultConfig.is_default = true;

    const conf = {
      models: [newDefaultConfig],
      custom_prompt: [
        {
          ...promptConfig,
          prompts,
        },
      ],
    };

    try {
      await axios.put(`${baseUri}/api/config`, conf);
      const newUpdate = llms.map((llm) =>
        llm.name !== newDefaultConfig.name ? { ...llm, is_default: false } : llm
      );
      setLLms(newUpdate);
      t({ message: "LLM config updated successfully!", icon: <CircleCheck /> });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      t({ message, icon: <Info /> });
    }
  };

  const [openId, setOpenId] = useState<number | null>(null);
  const handleCollapse = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptConfig, setPromptConfig] = useState({
    title: "",
    max_tokens: 0,
    temperature: 0,
  });

  useEffect(() => {
    if (promptOption.length > 0) {
      const opt = promptOption.find((c) => c.title === promptConfig.title);
      setPromptConfig({
        title: promptConfig.title,
        max_tokens: opt?.max_tokens || 0,
        temperature: opt?.temperature || 0,
      });
      setPrompts(opt?.prompts || []);
    }
  }, [promptConfig.title, promptOption]);

  useEffect(() => {
    if (promptOption.length > 0) {
      const defaultConfig = promptOption[0];
      setPromptConfig({
        title: defaultConfig.title,
        max_tokens: defaultConfig.max_tokens || 0,
        temperature: defaultConfig.temperature || 0,
      });
      setPrompts(defaultConfig?.prompts || []);
    }
  }, [promptOption]);

  const handleChange = (
    id: number,
    field: string,
    newValue: string | number
  ) => {
    setPrompts((prev) =>
      prev.map((value, index) =>
        index === id ? { ...value, [field]: newValue } : value
      )
    );
  };

  const handleAddCustomPrompt = () => {
    const newPromt: Prompt = {
      role: "",
      content: "%content%",
    };

    if (prompts.length >= 1) {
      const isRoleFieldEmpty = prompts.some((prmpt) => prmpt.role === "");
      const isContentFieldEmpty = prompts.some((prmpt) => prmpt.content === "");

      if (isRoleFieldEmpty) {
        return t({
          message: "The role field is required!",
          icon: <Info />,
        });
      }
      if (isContentFieldEmpty) {
        return t({
          message: "The content field is required!",
          icon: <Info />,
        });
      }
    }

    if (prompts.length > 3) {
      return t({ message: "The Maximum role prompt is 3", icon: <Info /> });
    }

    setPrompts([...prompts, newPromt]);

    handleCollapse(prompts.length - 1);
  };

  const availableRoles = ["system", "user", "assistant"];
  const usedRoles = prompts.map((msg) => msg.role);

  return (
    <section className="w-10/12 w-full">
      <div className="border-b border-gray-300 w-full mb-3 p-3">
        <h3 className="text-xl">LLM Config</h3>
        <div className=""></div>
      </div>
      <div className="p-3">
        <div className="w-6/12">
          <div className="my-3">
            <Label htmlFor="key" className="mb-1">
              Option
            </Label>
            <Select
              options={options}
              searchable
              values={config}
              onChange={(values) => handleConfig(values)}
              style={{ borderRadius: "5px" }}
            />
          </div>
          <div className="my-3">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="Enter Secret key"
              className="my-1 border-gray-300"
              value={llmValue?.model}
              onChange={(e) =>
                setLlmValue({ ...llmValue, model: e.target.value })
              }
              // disabled={config.length > 0 && config[0].label === "llama"}
            />
          </div>
          <div className="my-3">
            <Label htmlFor="key">API Key</Label>
            <Input
              id="key"
              placeholder="Enter Secret key"
              className="my-1 border-gray-300"
              value={llmValue?.api_key}
              onChange={(e) =>
                setLlmValue({ ...llmValue, api_key: e.target.value })
              }
              // disabled={config.length > 0 && config[0].label === "llama"}
            />
          </div>

          <hr className="text-gray-300 my-5" />
          <div>
            <h3>Prompt</h3>
          </div>
          <div className="mt-3">
            <Label htmlFor="key" className="justify-between flex">
              Prompt For
            </Label>
            <select
              className="my-1 border border-gray-300 w-full p-2 rounded-md shadow-sm text-sm"
              value={promptConfig.title || ""}
              onChange={(e) =>
                setPromptConfig({ ...promptConfig, title: e.target.value })
              }
            >
              <option value="">Select</option>
              <option value="project">Translate commit messages</option>
              <option value="summary">Summarize work responsibilities</option>
            </select>
          </div>
          <div className="my-3">
            <Label htmlFor="temperature">Temperature</Label>
            <Input
              type="number"
              id="temperature"
              value={promptConfig.temperature}
              className="my-1 border-gray-300 hover:border-gray-600"
              onChange={(e) =>
                setPromptConfig({
                  ...promptConfig,
                  temperature: +e.target.value,
                })
              }
            />
          </div>
          <div className="my-3 mb-5">
            <Label htmlFor="max_token">Max Tokens</Label>
            <Input
              type="number"
              id="max_token"
              value={promptConfig.max_tokens}
              className="my-1 border-gray-300"
              onChange={(e) =>
                setPromptConfig({
                  ...promptConfig,
                  max_tokens: +e.target.value,
                })
              }
            />
          </div>
          <Button
            className="bg-blue-400 text-white h-8 text-xs"
            onClick={handleAddCustomPrompt}
          >
            Add New Role <Plus />
          </Button>
          <div className="rounded-md bg-indigo-400 p-2 text-xs text-white my-1 flex gap-2">
            <Info /> Include %content% in one of the custom prompt role to mark
            where the platform should inject your dynamic input during LLM
            processing.
          </div>
          {prompts.map((prmp, indx) => (
            <div key={indx}>
              <div className="mt-3">
                <Label htmlFor="key" className="justify-between flex">
                  Role {prmp.role !== "" ? "- " + prmp.role : ""}
                  <Button
                    className="bg-gray-300 h-6"
                    onClick={() => handleCollapse(indx)}
                  >
                    <ChevronDown />
                  </Button>
                </Label>
              </div>
              {openId === indx && (
                <>
                  <div className="mb-3">
                    <select
                      className="my-1 border border-gray-300 w-full p-2 rounded-md shadow-sm text-sm"
                      value={prmp.role || ""}
                      onChange={(e) =>
                        handleChange(indx, "role", e.target.value)
                      }
                    >
                      <option value=""> Select </option>
                      {availableRoles.map((role) => (
                        <option
                          key={role}
                          value={role}
                          disabled={
                            usedRoles.includes(role) && prmp.role !== role
                          }
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="my-3">
                    <Label htmlFor="key">Content</Label>
                    <Textarea
                      className="h-48 my-1 border-gray-300"
                      value={prmp.content}
                      onChange={(e) =>
                        handleChange(indx, "content", e.target.value)
                      }
                    ></Textarea>
                  </div>
                </>
              )}
            </div>
          ))}
          <div>
            <Button
              className="bg-blue-400 text-white hover:bg-blue-500 mt-4"
              onClick={handleSaveConfig}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default LLMConfig;
