import { Link, Outlet, useNavigate, useParams } from "react-router";
import Layout from "../Layout";
import { useLocation } from "react-router";
import { useResumeStore } from "../../store/resumeStore";
import { useEffect } from "react";
import { t } from "../../util/config";
import { Toaster } from "sonner";
import { Info } from "lucide-react";
import { useStore } from "../../store";

const ResumeLayout = () => {
  const location = useLocation();
  const router = useNavigate();
  const { id } = useParams();
  const { fetchAIConfig } = useStore();

  const store = useResumeStore();
  const isListing = location.pathname === "/resumes";
  const handleCreateResume = async () => {
    store.resetResume();
    const resp = await store.createResume();
    if (resp.id) {
      return router(`/resumes/${resp.id}`);
    }
    return t({
      message: "An error occured while creating a new resume",
      icon: <Info />,
    });
  };

  useEffect(() => {
    fetchAIConfig();
    if (id) {
      (async () => {
        const resp = await store.fetchResumeById(Number(id));
        if (resp.error) {
          return router(`/resumes`);
        }
      })();
    }
    // eslint-disable-next-line
  }, [id, router]);

  return (
    <Layout>
      <div className="w-full">
        <div className="flex justify-between mb-5">
          <div>
            {/* {isListing && (
              <Link className="text-gray-500 underline" to="/resumes">
                Back{" "}
              </Link>
            )} */}
            <h3 className="text-lg border-gray-300 font-bold">Resume</h3>
          </div>
          <div>
            {isListing && (
              <Link
                to="#"
                className="flex justify-between bg-cyan-600 text-white px-10 py-2 rounded-lg text-xs hover:bg-cyan-700"
                onClick={handleCreateResume}
              >
                Create resume
              </Link>
            )}
          </div>
        </div>
        <div className="relative overflow-x-auto sm:rounded-lg">
          {/* Nested pages show up here */}
          <Outlet />
          <Toaster />
        </div>
      </div>
    </Layout>
  );
};
export default ResumeLayout;
