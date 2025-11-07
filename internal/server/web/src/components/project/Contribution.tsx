import { useCallback, useEffect, useState } from "react";
import { useStore } from "../../store";
import ReactMarkdown from "react-markdown";
import { AIAvailableOptions, type CommitMessage } from "../../types/project";
import type { Prop } from "../../pages/projects/type";
import { Bot, BriefcaseBusiness, ImportIcon, Info } from "lucide-react";
import { t } from "../../util/config";
import { Button } from "../ui/Button";
import Spinner from "../Spinner";
import { buildAIBody, transformTech } from "../../../lib/utils";
import type { CustomPrompt } from "../../types/ai-config";

const Contribution: React.FC<{ selectedProject: Prop | null }> = ({
  selectedProject,
}) => {
  const store = useStore();
  const [index, setIndex] = useState<number | null>(null);
  const [tab, setTab] = useState(0);

  const [commits, setCommits] = useState<CommitMessage[]>([]);
  const [isAIAction, setIsAIAction] = useState(false);

  const handleFetchCommits = useCallback(
    (index: number = 0) => {
      setTab(index);
      let result = [];
      const filter = store.projects?.find(
        (p) => Number(p.id) === selectedProject?.id
      );
      result = filter?.commits || [];
      if (index === 1) {
        const translatedCommits = store.commits;
        result = translatedCommits;
      }
      setCommits(result);
    },
    [selectedProject?.id, store.commits, store.projects]
  );

  useEffect(() => {
    if (!isAIAction) {
      handleFetchCommits(0);
    }
  }, [handleFetchCommits, isAIAction]);

  const handleImproveAllWithAI = async () => {
    const aiPromptConfig = store.ai_config;
    const customPrompt = aiPromptConfig.custom_prompt;
    const defaultModel = aiPromptConfig.models.find(
      (prmpt) => prmpt.is_default
    );

    console.log(defaultModel);

    if (!defaultModel && customPrompt.length === 0) {
      return t({
        message:
          "Error occured: It looks like your AI configuration hasn’t been set yet",
        icon: <Info />,
      });
    }

    const messages = commits.map((c) => c.message);
    if (messages.length === 0) {
      return t({
        message: "An error occurred, you have an empty commit messages",
        icon: <Info />,
      });
    }

    const promptAvailable = customPrompt.find(
      (cp) => cp.title === AIAvailableOptions.ProjectCommitMessages
    );
    if (!promptAvailable) {
      return t({
        message:
          "Error occured: The prompt for the commit message is not found",
        icon: <Info />,
      });
    }
    const prompt = promptAvailable?.prompts;
    const transformer = buildAIBody(prompt, messages);

    const body: CustomPrompt = {
      temperature: promptAvailable.temperature,
      max_tokens: promptAvailable.max_tokens,
      model: defaultModel?.name,
      version: defaultModel?.model,
      prompts: transformer,
      title: "",
      api_key: defaultModel?.api_key,
    };
    console.log(body);

    const response = await store.updateAllCommitsWithAI(
      selectedProject?.id as number,
      body
    );

    if (response.error) {
      const error = response.error;
      const llmError = error.includes("Request failed with status code 405");
      return t({
        message: `An error occured: ${error}. ${llmError ? " Your LLM service is most likely not responding" : ""}`,
        icon: <Info />,
      });
    }
    setTab(1);
    setCommits([]);
    setIsAIAction(true);
    setCommits(response.data);
  };

  const toggle = (commitIndex: number) => {
    setIndex(commitIndex === index ? null : commitIndex);
  };

  const tech = transformTech(selectedProject?.technologies as string);

  return (
    <>
      {!selectedProject && (
        <div className="flex h-30 items-center h-40 justify-center text-center">
          <div className="">
            <div className="flex justify-center">
              <BriefcaseBusiness size={60} className="text-gray-400" />
            </div>
            <h1 className="text-2xl text-gray-400">
              {store.projects?.length > 0
                ? "Select a project"
                : "No project available"}
            </h1>

            <Button className=" text-white mt-5 cursor-pointer bg-cyan-600 hover:bg-cyan-500">
              <a
                href="https://gitresume.app/git-integration"
                className="flex gap-3"
              >
                <ImportIcon /> Import from Github
              </a>
            </Button>
          </div>
        </div>
      )}
      {selectedProject && (
        <>
          <div className="flex justify-between">
            <div>
              <h3 className="text-2xl">
                {selectedProject?.name?.toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500">
                Below is the list of your contributions for this project{" "}
              </p>
              {tech?.length > 0 && (
                <p className="text-sm text-gray-600">
                  <b>Technology:</b> {tech.join(", ")}
                </p>
              )}
            </div>
            <div>
              <Button
                className="bg-indigo-500 text-white cursor-pointer hover:bg-indigo-400"
                disabled={store.loading}
                onClick={() => handleImproveAllWithAI()}
              >
                {store.loading ? <Spinner /> : <Bot size={30} />} Summarize with
                AI
              </Button>
            </div>
          </div>
          <div className="flex items-center w-full border-b border-gray-300">
            <div className="p-0 m-0">
              <h4 className="text-md font-bold text-cyan-800 mt-2">
                {tab === 0
                  ? "Original Commit Logs"
                  : "Translated/Updated Logs "}
              </h4>
            </div>
            <div className="ml-auto ">
              <button
                className={`${
                  tab === 0
                    ? "bg-blue-400 hover:bg-blue-800 text-white"
                    : "text-blue-400"
                } border border-blue-800 px-5 py-2 text-sm cursor-pointer`}
                onClick={() => handleFetchCommits(0)}
              >
                Original
              </button>
              <button
                className={` ${
                  tab === 1
                    ? "bg-blue-400 hover:bg-blue-800 text-white"
                    : "text-blue-400"
                } border px-5 py-2 text-sm text-blue-400 cursor-pointer`}
                onClick={() => handleFetchCommits(1)}
              >
                Translated
              </button>
            </div>
          </div>
          {tab == 1 && !commits?.length && (
            <div className="my-5">
              <h1 className="text-lg text-gray-400">
                Looks like there are no AI-translated commit messages yet
              </h1>
            </div>
          )}
          <ul className="h-[600px] overflow-y-scroll">
            {commits &&
              commits.map((commit, key) => (
                <li
                  key={key}
                  className="py-3 text-gray-700 border-b border-gray-300 cursor-pointer"
                  onClick={() => toggle(commit.commit_id)}
                >
                  <div className="flex justify-between">
                    <div className="w-10/12">
                      <ReactMarkdown>{commit.message}</ReactMarkdown>
                    </div>
                    {/* {index === commit.commit_id && (
                      <div className="w-2/12 flex items-center justify-end">
                        <button
                          className="bg-blue-500 text-white px-5 py-1 rounded-lg text-xs hover:bg-blue-800"
                          onClick={() =>
                            handleImproveWithAi(
                              commit.message,
                              commit.commit_id,
                            )}
                          disabled={isLoading === commit.commit_id}
                        >
                          use AI
                        </button>
                      </div>
                    )} */}
                  </div>
                  {/* <div
                    className={`text-gray-500 ${
                      index === commit.commit_id ? "block" : "hidden"
                    }`}
                  >
                    {isLoading === commit.commit_id && (
                      <>
                        <img src="/loading.svg" alt="loading" width="20" />
                      </>
                    )}
                    <div className="text-sm w-full py-2 pl-0 px-2">
                      <span className="font-bold">AI response:</span>{" "}
                      <p>{commit.ai_generated_msg}</p>
                    </div>
                  </div> */}
                </li>
              ))}
          </ul>
        </>
      )}
    </>
  );
};
export default Contribution;
