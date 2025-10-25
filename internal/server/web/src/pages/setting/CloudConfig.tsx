import { Info } from "lucide-react";

const CloudConfig = () => {
  return (
    <section className="w-10/12 w-full">
      <div className="border-b border-gray-300 w-full mb-3 p-3">
        <h3 className="text-xl">Cloud Config</h3>
      </div>
      <div className="p-3 text-gray-600 flex justify-center my-5">
        <div className="text-center w-5/12">
          <div className="flex justify-center">
            <Info className="w-12 h-12 text-gray-500" />
          </div>
          <h1 className="text-xl">
            Cloud deployment(coming soon for Pro users)
          </h1>
          <p>
            We're setting up a cloud environment to make deployment faster and
            more reliable.
          </p>
        </div>
      </div>
    </section>
  );
};
export default CloudConfig;
