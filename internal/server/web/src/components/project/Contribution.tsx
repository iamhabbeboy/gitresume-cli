import { useEffect, useState } from "react";
import { useStore } from "../../store";
import ReactMarkdown from "react-markdown";
import type { CommitMessage } from "../../types/project";
import type { Prop } from "../../pages/projects/type";

const Contribution: React.FC<{ selectedProject: Prop | null }> = (
  { selectedProject },
) => {
  const store = useStore();
  const [index, setIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(-1);
  const [commitIsLoading, setCommitIsLoading] = useState(false);

  const [commits, setCommits] = useState<CommitMessage[]>([]);

  // const commits = useMemo(() => {
  //   if (!store.projects) return [];
  //   const filter = store.projects.find((p) => p.name === selectedProject);
  //   return (
  //     filter?.commits || []
  //   );
  // }, [store.projects, selectedProject]);

  useEffect(() => {
    handleFetchCommits(0);
  }, []);

  const handleFetchCommits = (index: number = 0) => {
    let result = [];
    const filter = store.projects.find((p) =>
      Number(p.id) === selectedProject?.id
    );
    result = filter?.commits || [];
    if (index === 1) {
      const translatedCommits = store.commits;
      result = translatedCommits;
    }
    setCommits(result);
  };

  const handleImproveAllWithAI = async () => {
    try {
      setCommitIsLoading(true);
      const messages = commits.map((c) => c.message);
      store.updateAllCommitsWithAI(selectedProject?.name as string, messages);
      // const { data } = await axios.post(`${baseUri}/api/ai`, {
      //   commits: messages,
      // });

      // const summary = data.map((value: string) => ({
      //   message: value,
      //   project_id: 1,
      // }));
      // store.updateCommitsWithAI(selectedProject, summary);
      // store.updateCommits(selectedProject, updatedCommits);
    } catch (e) {
      console.log(e);
    } finally {
      setCommitIsLoading(false);
    }
  };

  const handleImproveWithAi = async (
    msg: string,
    commitId: number,
  ) => {
    try {
      setIsLoading(commitId);
      setIndex(commitId);
      // const { data } = await axios.post(`${baseUri}/api/ai`, {
      //   commits: [msg],
      // });
      // const output = data?.[0] ?? "";
      const output: CommitMessage[] = [{
        commit_id: commitId,
        message: msg,
      }];
      store.updateCommitsWithAI(selectedProject?.name as string, output);
    } catch (e) {
      console.log(e);
      alert(e);
    } finally {
      setIsLoading(-1);
    }
  };

  const toggle = (commitIndex: number) => {
    setIndex(commitIndex === index ? null : commitIndex);
  };

  return (
    <>
      <div className="flex justify-between">
        <div>
          <h3 className="text-2xl">{selectedProject?.name?.toUpperCase()}</h3>
          <p className="text-sm text-gray-500">
            Below is the list of your contributions for this project{" "}
          </p>
        </div>
        <div>
          <button
            className="flex justify-between bg-cyan-600 text-white px-10 py-2 rounded-lg text-xs hover:bg-cyan-700"
            onClick={() => handleImproveAllWithAI()}
          >
            Improve with AI {commitIsLoading && (
              <img
                src="/loading.svg"
                alt="ai"
                width="20"
              />
            )}
          </button>
        </div>
      </div>
      <div className="flex items-center w-full">
        <div className="ml-auto">
          <button
            className="underline hover:no-underline text-sm text-blue-400 mr-2"
            onClick={() => handleFetchCommits(0)}
          >
            Original
          </button>
          <button
            className="underline hover:no-underline text-sm text-gray-700 mr-2"
            onClick={() => handleFetchCommits(1)}
          >
            Translated
          </button>
        </div>
      </div>
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
                {index === commit.commit_id && (
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
                )}
              </div>
              <div
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
              </div>
            </li>
          ))}
      </ul>
    </>
  );
};
export default Contribution;
