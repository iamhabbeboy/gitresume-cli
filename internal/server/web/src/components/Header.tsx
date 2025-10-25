import { useLocation } from "react-router";
import { Link } from "react-router";

const Header = () => {
  const location = useLocation();
  return (
    <header>
      <nav className="bg-cyan-600 border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-cyan-800">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <a href="https://flowbite.com" className="flex items-center">
            <img
              src="https://flowbite.com/docs/images/logo.svg"
              className="mr-3 h-6 sm:h-9"
              alt="Flowbite Logo"
            />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              GitResume
            </span>
          </a>
          <div className="flex items-center lg:order-2">
            <Link
              to="/"
              className={`text-gray-50 dark:text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800 ${
                location.pathname === "/" ? "bg-gray-700 focus:ring-4" : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/projects"
              className={`text-gray-50 dark:text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800 ${
                location.pathname === "/projects"
                  ? "bg-gray-700 focus:ring-4"
                  : ""
              }`}
            >
              Projects
            </Link>
            <Link
              to="/resumes"
              className={`text-gray-50 dark:text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800  ${
                location.pathname === "/resumes"
                  ? "bg-gray-700 focus:ring-4"
                  : ""
              }`}
            >
              Resumes
            </Link>

            {/* <Link
              to="/interview"
              className={`text-gray-50 dark:text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800  ${
                location.pathname === "/interview"
                  ? "bg-gray-700 focus:ring-4"
                  : ""
              }`}
            >
              Interview
            </Link> */}
            <Link
              to="/settings"
              className={`text-gray-50 dark:text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800 ${
                location.pathname === "/setting"
                  ? "bg-gray-700 focus:ring-4"
                  : ""
              }`}
            >
              Setting
            </Link>
          </div>
          <div
            className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
            id="mobile-menu-2"
          ></div>
        </div>
      </nav>
    </header>
  );
};
export default Header;
