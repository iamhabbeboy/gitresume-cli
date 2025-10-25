import Select from "react-dropdown-select";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Button } from "../../components/ui/Button";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { baseUri, t } from "../../util/config";
import type { OptionType } from "../../components/resume/type";
import { CircleCheck, Info } from "lucide-react";
import { Textarea } from "../../components/ui/Textarea";

interface LLmConfig {
  name: string;
  model?: string;
  api_key?: string;
  is_default: boolean;
}

const LLMConfig = () => {
  const [llms, setLLms] = useState<LLmConfig[]>([]);

  const getLLms = async (): Promise<LLmConfig[]> => {
    const resp = await axios.get(`${baseUri}/api/config`);
    return resp.data;
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const resp = await getLLms();
        if (isMounted) setLLms(resp);
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
    const newDefaultConfig = { ...llmValue };
    newDefaultConfig.is_default = true;

    try {
      await axios.put(`${baseUri}/api/config`, newDefaultConfig);
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

  const prompt = [
    {
      role: "system",
      content:
        "You are a professional resume writer specializing in software engineering roles. Transform git commit messages into polished resume bullet points that highlight business value and technical achievements. Use action verbs, past tense, focus on impact, and keep concise (1-2 lines max). Output format: Single bullet point starting with •",
    },
    {
      role: "user",
      content: "",
    },
  ];

  return (
    <section className="w-10/12 w-full">
      <div className="border-b border-gray-300 w-full mb-3 p-3">
        <h3 className="text-xl">LLM Config</h3>
        <div className=""></div>
      </div>
      <div className="p-3">
        <div className="w-6/12">
          <div className="my-3">
            <Label htmlFor="key">Option</Label>
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

          {/* <hr className="border border-gray-300 my-5" />
          <h3>Custom Prompt</h3>
          <div className="my-3">
            <Label htmlFor="key">Role</Label>
            <Input
              id="key"
              placeholder=""
              className="my-1 border-gray-300"
              value={llmValue?.api_key}
              onChange={(e) =>
                setLlmValue({ ...llmValue, api_key: e.target.value })
              }
              // disabled={config.length > 0 && config[0].label === "llama"}
            />
          </div> */}
          {/* <div className="my-3">
            <Label htmlFor="key"></Label>
            <Textarea value={JSON.stringify(prompt)}></Textarea>
          </div> */}
          <div>
            <Button
              className="bg-blue-400 text-white hover:bg-blue-500"
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
