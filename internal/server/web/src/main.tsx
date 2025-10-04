import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router";
import CreateResume from "./pages/resume/Create.tsx";
import Resume from "./pages/resume/Resume.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => {
      const module = await import("./pages/home/Homepage.tsx");
      return { Component: module.default };
    },
  },
  {
    path: "/projects",
    lazy: async () => {
      const module = await import("./pages/projects/Projects.tsx");
      return { Component: module.default };
    },
  },
  {
    path: "/resumes",
    lazy: async () => {
      const module = await import("./components/resume/ResumeLayout.tsx");
      return { Component: module.default };
    },
    children: [
      {
        index: true,
        element: <Resume />,
      },
      {
        path: "create",
        element: <CreateResume />,
      },
      {
        path: ":id",
        element: <CreateResume />,
      },
    ],
  },
  {
    path: "/interview",
    lazy: async () => {
      const module = await import("./pages/interview/Interview.tsx");
      return { Component: module.default };
    },
  },
  {
    path: "/setting",
    lazy: async () => {
      const module = await import("./pages/setting/Setting.tsx");
      return { Component: module.default };
    },
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
