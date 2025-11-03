import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import GREditor from "../../ui/GREditor";
import { useResumeStore } from "../../../store/resumeStore";
import { Button } from "../../ui/Button";
import { CircleCheck, Info, Plus } from "lucide-react";
import { useState } from "react";
import { isValidUrl, t } from "../../../util/config";

const PersonalInformation = () => {
  const { updateProfile, resume } = useResumeStore();
  const updatePersonalInfo = (field: string, value: string) => {
    const payload = { ...resume.profile, [field]: value };
    updateProfile(payload);
  };

  const [link, setLink] = useState("");

  const handleSaveLinks = () => {
    if (link === "") return;
    if (!isValidUrl(link)) {
      return t({
        message: "We couldn’t recognize that as a valid web link",
        icon: <Info />,
      });
    }
    const prevLinks = [...(resume.profile.links || []), link];
    const payload = { ...resume.profile, links: prevLinks };
    updateProfile(payload);
    setLink("");
    return t({
      message: "Great! Your link has been updated",
      icon: <CircleCheck />,
    });
  };

  const deleteLink = (index: number) => {
    const newLinks = resume.profile.links.filter((_, indx) => indx !== index);
    const payload = { ...resume.profile, links: newLinks };
    updateProfile(payload);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          value={resume.profile.name}
          className="my-1 border-gray-300"
          onChange={(e) => updatePersonalInfo("name", e.target.value)}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="my-1 border-gray-300"
            placeholder="john@example.com"
            value={resume.profile.email}
            onChange={(e) => updatePersonalInfo("email", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            className="my-1 border-gray-300"
            placeholder="+1 (555) 123-4567"
            value={resume.profile.phone}
            onChange={(e) => updatePersonalInfo("phone", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          className="my-1 border-gray-300"
          placeholder="San Francisco, CA"
          value={resume.profile.location}
          onChange={(e) => updatePersonalInfo("location", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="summary" className="my-1">
          Professional Summary
        </Label>
        <GREditor
          placeholder="Brief overview of your professional background and goals..."
          value={resume.profile.professional_summary}
          handleEdit={(e) => updatePersonalInfo("professional_summary", e)}
        />
      </div>
      <div className="flex gap-2">
        <div className="w-full">
          <Label htmlFor="links">Link(s)</Label>
          <Input
            id="links"
            placeholder="Add a link (e.g., github.com/username)"
            className="my-1 border-gray-300 focus:border-gray-400 hover:border-gray-400"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveLinks()}
          />
        </div>
        <Button
          onClick={handleSaveLinks}
          size="icon"
          className="bg-cyan-600 hover:bg-cyan-500 text-white mt-4"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(resume.profile.links || []).map((link, index) => (
          <div
            key={index}
            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {link}
            <button
              onClick={() => deleteLink(index)}
              className="hover:text-destructive"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalInformation;
