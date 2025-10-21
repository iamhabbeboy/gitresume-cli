import Select from "react-dropdown-select";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Button } from "../../components/ui/Button";
import { useState } from "react";

const LLMConfig = () => {
  const options = [{
    label: "Ollama",
    value: 0,
  }, {
    label: "OpenAI",
    value: 1,
  }];

  const [config, setConfig] = useState([options[0]]);

  return (
    <section className="w-10/12 w-full">
      <div className="border-b border-gray-300 w-full mb-3 p-3">
        <h3 className="text-xl">LLM Config</h3>
      </div>
      <div className="p-3">
        {
          /* <div className="bg-blue-400 text-white text-sm p-3 rounded-md">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos labore
            eligendi repellat eum eius. Animi debitis et eaque placeat nostrum
            corrupti exercitationem harum repellat error. Tempore soluta
            blanditiis est dolore.
          </p>
        </div> */
        }
        {/* <h3 className="text-xl mt-1">Option available</h3> */}
        <div className="w-6/12">
          <div className="my-3">
            <Label htmlFor="key">Option</Label>
            <Select
              options={options}
              searchable
              values={config}
              onChange={(values) => setConfig(values)}
              style={{ borderRadius: "5px" }}
            />
          </div>
          <div className="my-3">
            <Label htmlFor="key">API Key</Label>
            <Input
              id="key"
              placeholder="Enter Secret key"
              className="my-1 border-gray-300"
              disabled={config.length > 0 && config[0].label === "Ollama"}
            />
          </div>
          <div>
            <Button className="bg-blue-400 text-white hover:bg-blue-500">
              Save
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default LLMConfig;
