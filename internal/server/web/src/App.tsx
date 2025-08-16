import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import { useStore } from "./store";
import type { Project } from "./types/project";
import axios from "axios";

function App() {
  const store = useStore();
  const [selectedProject, setSelectedProject] = useState<string>("");
  useEffect(() => {
    store.fetchProjects();
    // eslint-disable-next-line
  }, []);
  const projects = useMemo(
    () => store.projects.map((name: Project) => name.project_name),
    [store.projects],
  );
  const commits = useMemo(() => {
    if (store.projects) {
      const filter = store.projects.find(
        (p) => p.project_name === selectedProject,
      );
      return filter?.commits;
    }
    return [];
  }, [store.projects, selectedProject]);

  const handleImproveWithAi = async () => {
    const logs = commits?.map((c) => c.msg);
    const result = await axios.post("http://localhost:4000/api/ai", {
      commits: logs,
    });
    console.log(result);
  };
  return (
    <section>
      <Header />
      <div className="mt-10 container mx-auto p-10 border border-gray-300 rounded-lg bg-white flex">
        <div className="w-3/12 border-r border-gray-300">
          <h3 className="text-lg border-b border-gray-300 font-bold">
            Project Listing
          </h3>
          <ul>
            {projects.map((project, key) => (
              <li
                className="py-3 border-b border-gray-300 cursor-pointer"
                key={key}
                onClick={() => setSelectedProject(project)}
              >
                {project}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 w-full">
          <div className="flex justify-between">
            <div>
              <h3 className="text-2xl"> Matchingday </h3>
              <p className="text-sm text-gray-500">
                Below is the list of your contributions for this project{" "}
              </p>
            </div>
            <div>
              <button
                onClick={handleImproveWithAi}
                className="bg-cyan-600 text-white px-10 py-2 rounded-lg text-xs hover:bg-cyan-700"
              >
                Improve with AI
              </button>
            </div>
          </div>
          <ul>
            {commits &&
              commits.map((commit, key) => (
                <li
                  key={key}
                  className="py-3 text-gray-700 border-b border-gray-300 cursor-pointer"
                >
                  {commit.msg}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default App;
