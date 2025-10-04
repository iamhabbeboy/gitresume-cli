import { Link, Outlet, useNavigate, useParams } from "react-router";
import Layout from "../Layout";
import { useLocation } from "react-router";
import { useResumeStore } from "../../store/resumeStore";
import { useEffect } from "react";

const ResumeLayout = () => {
  const location = useLocation();
  const router = useNavigate();
  const { id } = useParams();

  const store = useResumeStore();
  const isCreate = location.pathname === "/resumes/create";
  const handleCreateResume = async () => {
    const resp = await store.createResume();
    if (resp.id) {
      return router(`/resumes/${resp.id}`);
    }
    return alert("An error occured while creating a new resume");
  };

  useEffect(() => {
    if (id) {
      store.fetchResumeById(Number(id));
    }
  }, []);

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
              to={`${isCreate ? "#" : "#"}`}
              className="flex justify-between bg-cyan-600 text-white px-10 py-2 rounded-lg text-xs hover:bg-cyan-700"
              onClick={handleCreateResume}
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
