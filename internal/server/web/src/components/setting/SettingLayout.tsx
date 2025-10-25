import { Bot, Server, UserRoundPen } from "lucide-react";
import { Link, Outlet } from "react-router";
import Layout from "../../components/Layout";
import { useLocation } from "react-router";
import { Toaster } from "sonner";

const SettingLayout = () => {
  const location = useLocation();
  return (
    <Layout>
      <section className="w-full">
        <h1 className="text-2xl">Setting</h1>
        <div className="flex gap-3">
          <div className="border my-3 border-gray-300 w-4/12 rounded-md">
            <Link
              to="/settings"
              className={`px-2 hover:bg-gray-100 py-3 block border-b border-gray-300 w-full text-sm flex gap-2 ${
                location.pathname === "/settings"
                  ? "bg-gray-300 hover:bg-gray-400"
                  : ""
              }`}
            >
              <UserRoundPen size={20} /> Account Setting
            </Link>
            <Link
              to="/settings/llm"
              className={`px-2 hover:bg-gray-100 py-3 block border-b border-gray-300 w-full text-sm flex gap-2 ${
                location.pathname === "/settings/llm"
                  ? "bg-gray-300 hover:bg-gray-400"
                  : ""
              }`}
            >
              <Bot size={20} /> LLM Setting
            </Link>
            {/* <Link
              to="/settings/cloud"
              className={`px-2 hover:bg-gray-100 py-3 border-b border-gray-300 block w-full text-sm flex gap-2 ${
                location.pathname === "/settings/cloud"
                  ? "bg-gray-300 hover:bg-gray-400"
                  : ""
              }`}
            >
              <Server size={20} /> Cloud Setting
            </Link> */}
          </div>
          <div className="w-10/12 border border-gray-300 mt-3 rounded-md">
            <Outlet />
            <Toaster />
          </div>
        </div>
      </section>
    </Layout>
  );
};
export default SettingLayout;
