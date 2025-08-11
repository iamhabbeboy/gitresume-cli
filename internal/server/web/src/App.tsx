import "./App.css";
import Header from "./components/Header";

function App() {
  return (
    <section>
      <Header />
      <div className="mt-10 container mx-auto p-10 border border-gray-300 rounded-lg bg-white flex">
        <div className="w-3/12 border-r border-gray-300">
          <h3 className="text-lg border-b border-gray-300 font-bold">
            Project Listing
          </h3>
          <ul>
            <li className="py-3 border-b border-gray-300 cursor-pointer">
              Matchingday{" "}
            </li>
            <li className="py-3 border-b border-gray-300 cursor-pointer">
              {" "}
              Computer based test
            </li>
            <li className="cursor-pointer py-3 border-b border-gray-300">
              {" "}
              Git tracker
            </li>
          </ul>
        </div>
        <div className="p-3 w-full">
          <div className="flex justify-between">
            <div>
              <h3 className="text-2xl"> Matchingday </h3>
              <p className="text-sm text-gray-500">
                Below is the list of your contributions for this project{" "}
              </p>
            </div>
            <div>
              <button className="bg-cyan-600 text-white px-10 py-2 rounded-lg text-xs hover:bg-cyan-700">
                Improve with AI
              </button>
            </div>
          </div>
          <ul>
            <li className="py-3 text-gray-700 border-b border-gray-300 cursor-pointer">
              Matchingday{" "}
            </li>
            <li className="py-3 text-gray-700 border-b border-gray-300 cursor-pointer">
              {" "}
              Computer based test
            </li>
            <li className="cursor-pointer py-3 text-gray-700 border-b border-gray-300">
              {" "}
              Git tracker
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default App;
