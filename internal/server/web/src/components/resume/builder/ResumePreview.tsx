"use client";

import { Card } from "../../ui/Card";
import { Mail, MapPin, Phone } from "lucide-react";
// import type { ResumeData } from "./ResumeBuilder";
import type { Resume } from "../type";

interface ResumePreviewProps {
  data: Resume;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Present";
    const date = new Date(dateString + "-01");
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card className="p-8 shadow-lg bg-white print:shadow-none print:border-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-primary pb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">
            {data.profile.name || "Your Name"}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {data.profile.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{data.profile.email}</span>
              </div>
            )}
            {data.profile.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{data.profile.phone}</span>
              </div>
            )}
            {data.profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{data.profile.location}</span>
              </div>
            )}
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

        {/* Experience */}
        {data.work_experiences.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-primary mb-3">
              Experience
            </h2>
            <div className="space-y-4">
              {data.work_experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {exp.job_title ||
                          "Position Title"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {exp.company || "Company Name"}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(exp.start_date)} -{" "}
                      {formatDate(exp.end_date ?? "")}
                    </span>
                  </div>
                  {exp.responsibilities && (
                    <>
                      {
                        /*<p className="text-sm text-foreground mt-2 leading-relaxed text-pretty">
                        // {exp.description}
                        //
                      </p>*/
                      }
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
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-primary mb-3">
              Education
            </h2>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id}>
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
                      {formatDate(edu.date_from)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-primary mb-3">
              Skills
            </h2>
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
        )}

        {/* Empty State */}
        {
          /* {!data.personalInfo.fullName &&
          data.experience.length === 0 &&
          data.education.length === 0 &&
          data.skills.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">
              Start filling out the form to see your resume preview
            </p>
          </div>
        )}*/
        }
      </div>
    </Card>
  );
}
