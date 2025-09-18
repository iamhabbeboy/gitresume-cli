import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import { useStore } from "./store";
import type { Project } from "./types/project";
import axios from "axios";

function App() {
  const store = useStore();
  const [isLoading, setIsLoading] = useState(-1);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [editProjectName, setEditProjectName] = useState<string>("");
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    store.fetchProjects();
    // eslint-disable-next-line
  }, []);
  const projects = useMemo(
    () =>
      store.projects.map((prd: Project) => ({ name: prd.name, id: prd.id })),
    [store.projects],
  );

  const commits = useMemo(() => {
    const filter = store.projects.find((p) => p.name === selectedProject);
    return (
      filter?.commits.map((c, i) => ({
        index: i,
        msg: c.msg,
        ai: c.ai ?? "",
      })) ?? []
    );
  }, [store.projects, selectedProject]);

  const handleImproveWithAi = async (indx: number, msg: string) => {
    try {
      setIsLoading(indx);
      setIndex(indx);
      const { data } = await axios.post("http://localhost:4000/api/ai", {
        commit: msg,
      });
      setAiResponse(data);
      store.updateCommits(selectedProject, index, data);
    } catch (e) {
      alert(e);
    } finally {
      setIsLoading(-1);
    }
  };

  const handleAction = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
    action: "delete" | "edit",
    id: string,
  ) => {
    e.preventDefault();
    if (action === "edit") {
      setEditProjectName(id);
      return;
    }
  };
  return (
    <section>
      <Header />
      <div className="mt-10 container mx-auto p-10 border border-gray-300 rounded-lg bg-white flex">
        <div className="w-3/12 border-r border-gray-300">
          <h3 className="text-lg border-b border-gray-300 font-bold">
            Projects
            {editProjectName}
          </h3>
          <ul>
            {projects.map((project: { name: string; id: string }, key) => (
              <li
                className="py-3 border-b border-gray-300 cursor-pointer justify-between flex"
                key={key}
                onClick={() => setSelectedProject(project.name)}
              >
                {editProjectName !== project.id && (
                  <span> {project.name} </span>
                )}
                {editProjectName === project.id && (
                  <div>
                    <div className="flex">
                      {" "}
                      <input
                        type="text"
                        className="border-gray-300 border"
                        value={project.name}
                      />
                      <button className="flex w-20 justify-between bg-gray-100 rounded-md p-2 text-sm mr-2">
                        update
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            {" "}
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L12.7348 11.2045L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z"
                              fill=" #8b928d"
                            ></path>{" "}
                          </g>
                        </svg>
                      </button>
                    </div>
                    <a
                      href="#"
                      onClick={() => setEditProjectName("")}
                      className="text-xs text-red-400 underline hover:no-underline"
                    >
                      cancel
                    </a>
                  </div>
                )}
                {editProjectName !== project.id && (
                  <div>
                    <button
                      className="w-5 mr-2"
                      onClick={(e) => handleAction(e, "edit", project.id)}
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <path
                            d="M13 0L16 3L9 10H6V7L13 0Z"
                            fill="#5f5d5d"
                          ></path>{" "}
                          <path
                            d="M1 1V15H15V9H13V13H3V3H7V1H1Z"
                            fill=" #5f5d5d"
                          ></path>{" "}
                        </g>
                      </svg>
                    </button>

                    <button
                      className="w-5 mr-2"
                      onClick={() => alert("Are you sure")}
                    >
                      {" "}
                      <svg
                        viewBox="0 0 24 24"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        fill="#c73838"
                        stroke="#c73838"
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <title>delete_2_line</title>{" "}
                          <g
                            id="page-1"
                            stroke="none"
                            strokeWidth="1"
                            fill="none"
                            fillRule="evenodd"
                          >
                            {" "}
                            <g
                              id="System"
                              transform="translate(-576.000000, -192.000000)"
                              fillRule="nonzero"
                            >
                              {" "}
                              <g
                                id="delete_2_line"
                                transform="translate(576.000000, 192.000000)"
                              >
                                {" "}
                                <path
                                  d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z"
                                  id="MingCute"
                                  fillRule="nonzero"
                                >
                                  {" "}
                                </path>{" "}
                                <path
                                  d="M14.2792,2 C15.1401,2 15.9044,2.55086 16.1766,3.36754 L16.7208,5 L20,5 C20.5523,5 21,5.44772 21,6 C21,6.55227 20.5523,6.99998 20,7 L19.9975,7.07125 L19.9975,7.07125 L19.1301,19.2137 C19.018,20.7837 17.7117,22 16.1378,22 L7.86224,22 C6.28832,22 4.982,20.7837 4.86986,19.2137 L4.00254,7.07125 C4.00083,7.04735 3.99998,7.02359 3.99996,7 C3.44769,6.99998 3,6.55227 3,6 C3,5.44772 3.44772,5 4,5 L7.27924,5 L7.82339,3.36754 C8.09562,2.55086 8.8599,2 9.72076,2 L14.2792,2 Z M17.9975,7 L6.00255,7 L6.86478,19.0712 C6.90216,19.5946 7.3376,20 7.86224,20 L16.1378,20 C16.6624,20 17.0978,19.5946 17.1352,19.0712 L17.9975,7 Z M10,10 C10.51285,10 10.9355092,10.386027 10.9932725,10.8833761 L11,11 L11,16 C11,16.5523 10.5523,17 10,17 C9.48715929,17 9.06449214,16.613973 9.00672766,16.1166239 L9,16 L9,11 C9,10.4477 9.44771,10 10,10 Z M14,10 C14.5523,10 15,10.4477 15,11 L15,16 C15,16.5523 14.5523,17 14,17 C13.4477,17 13,16.5523 13,16 L13,11 C13,10.4477 13.4477,10 14,10 Z M14.2792,4 L9.72076,4 L9.38743,5 L14.6126,5 L14.2792,4 Z"
                                  id="形状"
                                  fill="#9f5050"
                                >
                                  {" "}
                                </path>{" "}
                              </g>{" "}
                            </g>{" "}
                          </g>{" "}
                        </g>
                      </svg>
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 w-full">
          <div className="flex justify-between">
            <div>
              <h3 className="text-2xl"> {selectedProject.toUpperCase()}</h3>
              <p className="text-sm text-gray-500">
                Below is the list of your contributions for this project{" "}
              </p>
            </div>
            <div>
              <button className="bg-cyan-600 text-white px-10 py-2 rounded-lg text-xs hover:bg-cyan-700">
                Improve with AI
              </button>
            </div>
          </div>
          <ul className="h-[600px] overflow-y-scroll">
            {commits &&
              commits.map((commit, key) => (
                <li
                  key={key}
                  className="py-3 text-gray-700 border-b border-gray-300 cursor-pointer"
                  onClick={() => setIndex(key)}
                >
                  <div className="flex justify-between">
                    <p>{commit.msg}</p>
                    <button
                      className="bg-blue-500 text-white px-5 py-1 rounded-lg text-xs hover:bg-blue-800"
                      onClick={() => handleImproveWithAi(key, commit.msg)}
                      disabled={isLoading === key}
                    >
                      use AI
                    </button>
                  </div>
                  <div
                    className={`text-gray-500 ${index === key ? "block" : "hidden"}`}
                  >
                    {isLoading === index && (
                      <>
                        <img src="/loading.svg" alt="loading" width="20" />
                      </>
                    )}
                    Index: {commit.index}{" "}
                    <p className="text-sm">AI response: {commit.ai}</p>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default App;
