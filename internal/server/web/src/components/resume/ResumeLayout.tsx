import { Link, Outlet } from "react-router";
import Layout from "../Layout";
import { useLocation } from "react-router";

const ResumeLayout = () => {
  const location = useLocation();
  console.log(location);
  const isCreate = location.pathname === "/resumes/create";
  return (
    <Layout>
      <div className="w-full">
        <div className="flex justify-between mb-5">
          <div>
            {isCreate && (
              <Link className="text-gray-500 underline" to="/resumes">
                Back{" "}
              </Link>
            )}
            <h3 className="text-lg border-gray-300 font-bold">Resume</h3>
          </div>
          <div>
            <Link
              to={`${isCreate ? "#" : "/resumes/create"}`}
              className="flex justify-between bg-cyan-600 text-white px-10 py-2 rounded-lg text-xs hover:bg-cyan-700"
            >
              {isCreate ? "Publish" : "Create resume"}
            </Link>
          </div>
        </div>
        <div className="relative overflow-x-auto sm:rounded-lg">
          {/* Nested pages show up here */}
          <Outlet />
        </div>
      </div>
    </Layout>
  );
};
export default ResumeLayout;
