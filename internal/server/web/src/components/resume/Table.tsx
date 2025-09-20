import type { TableProps } from "./type";

const Table: React.FC<TableProps> = ({ data }) => {
  // assume all columns have the same row length
  const rowCount = data[0]?.values.length || 0;
  return (
    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            #{" "}
          </th>
          {data.map((v) => (
            <th scope="col" className="px-6 py-3">
              {v.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <tr
            className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
            key={rowIndex}
          >
            <th
              scope="row"
              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {rowIndex + 1}
            </th>
            {data.map((col) => (
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {col.values[rowIndex]?.url ? (
                  <a
                    href={col.values[rowIndex].url}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    {col.values[rowIndex].value}
                  </a>
                ) : (
                  col.values[rowIndex]?.value || ""
                )}
              </th>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default Table;
