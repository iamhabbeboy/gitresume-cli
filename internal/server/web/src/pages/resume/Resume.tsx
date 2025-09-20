import Layout from "../../components/Layout";
import Table from "../../components/resume/table";
import type { TableProps } from "../../components/resume/type";

const Resume: React.FC = () => {
  const table: TableProps = {
    data: [
      {
        name: "Role",
        values: [
          {
            value: "Python Developer",
          },
          {
            value: "Nodejs Developer",
          },
        ],
      },
      {
        name: "Stack",
        values: [
          {
            value: "Javascript, Typescript, Nodejs",
          },
          {
            value: "Python, Flask, Django",
          },
        ],
      },
      {
        name: "Category",
        values: [
          {
            value: "Backend",
          },
          {
            value: "Backend",
          },
        ],
      },
      {
        name: "Action",
        values: [
          {
            value: "Edit",
            url: "http://edit",
          },
          {
            value: "Delete",
            url: "http://delete",
          },
        ],
      },
    ],
  };
  return (
    <Layout>
      <div className="w-full">
        <div className="flex justify-between mb-5">
          <h3 className="text-lg border-gray-300 font-bold">Resume</h3>
          <button
            className="flex justify-between bg-cyan-600 text-white px-10 py-2 rounded-lg text-xs hover:bg-cyan-700"
            onClick={() => {}}
          >
            Create resume
          </button>
        </div>
        <div className="relative overflow-x-auto sm:rounded-lg">
          <Table data={table.data} />
        </div>
      </div>
    </Layout>
  );
};

export default Resume;
