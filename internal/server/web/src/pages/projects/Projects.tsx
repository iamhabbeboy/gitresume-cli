import { useEffect, useState } from "react";
import { useStore } from "../../store";
import Layout from "../../components/Layout";
import Contribution from "../../components/project/Contribution";
import ProjectList from "../../components/project/ProjectList";
import type { Prop } from "./type";

function Projects() {
  const store = useStore();
  const [selectedProject, setSelectedProject] = useState<Prop | null>(null);

  useEffect(() => {
    store.fetchProjects();
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <div className="w-3/12 border-r border-gray-300">
        <h3 className="text-lg border-b border-gray-300 font-bold">
          Projects
        </h3>
        <ProjectList
          selectedProject={selectedProject}
          projects={store.projects}
          setSelectedProject={setSelectedProject}
        />
      </div>
      <div className="p-3 w-full">
        <Contribution selectedProject={selectedProject} />
      </div>
    </Layout>
  );
}

export default Projects;
