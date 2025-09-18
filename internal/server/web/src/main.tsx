import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router";

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
      const module = await import("./pages/resume/Resume.tsx");
      return { Component: module.default };
    },
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
