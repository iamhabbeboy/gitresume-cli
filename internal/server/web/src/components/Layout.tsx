import { Toaster } from "sonner";
import "../App.css";
import Header from "./Header";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <section>
      <Header />
      <div className="mt-10 container mx-auto p-10 border border-gray-300 rounded-lg bg-white flex">
        {children}
      </div>
      <Toaster />
    </section>
  );
};

export default Layout;
