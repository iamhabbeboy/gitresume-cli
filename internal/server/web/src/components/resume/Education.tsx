import type { Education as type } from "./type";

const Education: React.FC<type> = ({ ...education }) => {
  return (
    <>
      <h2 className="text-xl">{education.degree}</h2>
      <div className="">
        <p>{education.school}</p>
        <p className="italic">
          {education.end_date}
        </p>
      </div>
    </>
  );
};

export default Education;
