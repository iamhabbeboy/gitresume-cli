import { Brain, Unplug } from "lucide-react";
import Layout from "../../components/Layout";
import { Button } from "../../components/ui/Button";
import { Link } from "react-router";

const Homepage = () => {
  return (
    <Layout>
      <section className="w-full">
        <section className="text-center w-full mb-8">
          <img src="/gitresume.svg" className="w-30 mx-auto" />
          <h1 className="text-[44px] my-3 text-[#579da5] font-bold">
            {" "}
            GitResume Dashboard
          </h1>
          <a
            href="https://forms.gle/EFdTiSLkxsXxoxDd9"
            target="_blank"
            className="underline hover:no-underline text-gray-500"
          >
            Give feedback
          </a>

          <a
            href="https://github.com/iamhabbeboy/gitresume-cli"
            target="_blank"
            className="underline hover:no-underline text-gray-500 ml-3"
          >
            Star on Github
          </a>
        </section>
        <section className="flex gap-10 justify-evenly mb-10">
          <div className="border border-gray-300 rounded-md p-3 w-3/12 text-center hover:shadow-lg hover:bg-gray-50 shadow-sm">
            <Link to="/settings/llm">
              <h2 className="my-3 flex justify-center">
                <Brain size={30} />
              </h2>
              <h2 className="my-2">Configure LLM Prompt</h2>
              <p className="text-sm text-gray-500">
                Set up your LLM API keys and customize your prompt configuration
                to control how your AI responds.
              </p>
            </Link>
          </div>
          <div className="border border-gray-300 rounded-md p-3 w-3/12 text-center hover:shadow-lg hover:bg-gray-50 shadow-sm">
            <Link to="/projects">
              <h2 className="my-3 flex justify-center">
                <Unplug size={30} />
              </h2>
              <h2 className="my-2">Review Projects</h2>
              <p className="text-sm text-gray-500">
                View project details, commits, and tech stacks. Easily review
                your project&quot;s performance and update prompts if needed.
              </p>
            </Link>
          </div>
          <div className="border border-gray-300 rounded-md p-3 w-3/12 text-center hover:shadow-lg hover:bg-gray-50 shadow-sm">
            <Link to="/resumes">
              <h2 className="my-3 flex justify-center">
                <Brain size={30} />
              </h2>
              <h2 className="my-2">Generate Resume</h2>
              <p className="text-sm text-gray-500">
                Automatically generate a professional resume using your project
                data, commits, and technical experience.{" "}
              </p>
            </Link>
          </div>
        </section>
      </section>
    </Layout>
  );
};

export default Homepage;
