import Table from "../../components/resume/Table";
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
    <div className="relative overflow-x-auto sm:rounded-lg">
      <Table data={table.data} />
    </div>
  );
};

export default Resume;
