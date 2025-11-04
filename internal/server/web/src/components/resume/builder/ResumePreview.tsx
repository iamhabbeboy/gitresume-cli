"use client";

import { Card } from "../../ui/Card";
import { Link, Mail, MapPin, Phone } from "lucide-react";
import { OrderLabel, type Resume } from "../type";
import { stripProtocol } from "../../../util/config";

interface ResumePreviewProps {
  data: Resume;
  order: string[];
}

export default function ResumePreview({ data, order }: ResumePreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Present";
    const date = new Date(dateString + "-01");
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const experience = (data.work_experiences || []).length > 0 && (
    <div>
      <h2 className="text-lg font-semibold text-primary mb-3">Experience</h2>
      <div className="space-y-4">
        {data.work_experiences.map((exp) => (
          <div key={exp.id}>
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="font-semibold text-foreground">
                  {exp.role || "Position Title"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {exp.company || "Company Name"}
                </p>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(exp.start_date)} - {formatDate(exp.end_date ?? "")}
              </span>
            </div>
            {exp.responsibilities && (
              <>
                <div
                  className="prose max-w-none text-sm text-foreground leading-relaxed text-pretty"
                  dangerouslySetInnerHTML={{
                    __html: exp.responsibilities,
                  }}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const education = data.education.length > 0 && (
    <div>
      <h2 className="text-lg font-semibold text-primary mb-3">Education</h2>
      <div className="space-y-3">
        {data.education.map((edu, i) => (
          <div key={i}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-foreground">
                  {edu.degree || "Degree"}{" "}
                  {edu.field_of_study && `in ${edu.field_of_study}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {edu.school || "School Name"}
                </p>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(edu.end_date as string)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const skills = data.skills.length > 0 && (
    <div>
      <h2 className="text-lg font-semibold text-primary mb-3">Skills</h2>
      <div className="flex flex-wrap gap-2">
        {data.skills.map((skill, index) => (
          <span
            key={index}
            className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );

  const projects = data.project_worked_on?.length > 0 && (
    <div>
      <h2 className="text-lg font-semibold text-primary mb-3">Projects</h2>
      <div className="space-y-3">
        {data.project_worked_on.map((prj, i) => (
          <div key={i}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-foreground">
                  {prj.title || "Title"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {prj.description || "Description"}
                </p>
                <p className="text-xs italic">Tech: {prj.technologies}</p>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  <a
                    href={prj.link}
                    className="underline hover:no-underline"
                    target="_blank"
                  >
                    {prj.link}
                  </a>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const volunteering = data.volunteers?.length > 0 && (
    <div>
      <h2 className="text-lg font-semibold text-primary mb-3">Volunteering</h2>
      <div className="space-y-3">
        {data.volunteers.map((vol, i) => (
          <div key={i}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-foreground">
                  {vol.title || "Title"}{" "}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {vol.description || "Description"}
                </p>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {vol.link}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const sectionOrder: ReOrder[] = [
    {
      label: OrderLabel.WorkExperience,
      component: experience,
    },
    {
      label: OrderLabel.Education,
      component: education,
    },
    {
      label: OrderLabel.Skills,
      component: skills,
    },
    {
      label: OrderLabel.Projects,
      component: projects,
    },
    {
      label: OrderLabel.Volunteer,
      component: volunteering,
    },
  ];

  const orderedSections: ReOrder[] = order
    .map((label) => sectionOrder.find((s) => s.label === label))
    .filter((s): s is ReOrder => Boolean(s));

  return (
    <Card className="p-8 shadow-lg bg-white print:shadow-none print:border-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-primary pb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">
            {/* Name */}
            {data.profile.name || "Your Name"}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {/* Email */}
            {data.profile.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{data.profile.email}</span>
              </div>
            )}
            {/* Phone */}
            {data.profile.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{data.profile.phone}</span>
              </div>
            )}
            {/* Location */}
            {data.profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{data.profile.location}</span>
              </div>
            )}
            {/* Links */}
            {(data.profile.links || []).map((link, key) => (
              <div className="flex items-center gap-1" key={key}>
                <Link className="h-4 w-4" />
                <span>
                  <a target="_blank" href={link}>
                    {stripProtocol(link)}
                  </a>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {data.profile.professional_summary && (
          <div>
            <h2 className="text-lg font-semibold text-primary mb-2">
              Professional Summary
            </h2>
            <div
              className="prose max-w-none text-sm text-foreground leading-relaxed text-pretty"
              dangerouslySetInnerHTML={{
                __html: data.profile.professional_summary,
              }}
            />
          </div>
        )}
        {orderedSections.map((section, key) => (
          <div key={key}>{section.component}</div>
        ))}
        {/* Experience */}
        {/* Education */}

        {/* Skills */}

        {/* Empty State */}
        {/* {!data.personalInfo.fullName &&
          data.experience.length === 0 &&
          data.education.length === 0 &&
          data.skills.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">
              Start filling out the form to see your resume preview
            </p>
          </div>
        )}*/}
      </div>
    </Card>
  );
}
