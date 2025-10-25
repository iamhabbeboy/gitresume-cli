import "./App.css";
import Header from "./components/Header";

function App() {
  return (
    <section>
      <Header />
      <div className="mt-10 container mx-auto p-10 border border-gray-300 rounded-lg bg-white flex">
        <div className="w-3/12 border-r border-gray-300"></div>
      </div>
    </section>
  );
}

export default App;
