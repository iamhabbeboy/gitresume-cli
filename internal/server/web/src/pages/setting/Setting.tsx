import { useState } from "react";
import GREditor from "../../components/ui/GREditor";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { useResumeStore } from "../../store/resumeStore";
import type { Profile } from "../../components/resume/type";
import { Button } from "../../components/ui/Button";
import { CircleCheck, Info } from "lucide-react";
import { t } from "../../util/config";

const Setting = () => {
  const { error, resume, updateProfile } = useResumeStore();
  const [user, setUser] = useState<Partial<Profile>>({ ...resume.profile });

  const handleSave = () => {
    const payload = { ...resume.profile, ...user };
    updateProfile(payload);
    const hasError = typeof error === "string" && error !== "";
    if (hasError) {
      return t({
        message: "An error occurred while updating profile information!",
        icon: <Info />,
      });
    }

    t({
      message: "Profile information updated successfully!",
      icon: <CircleCheck />,
    });
  };
  return (
    <section className="w-10/12 w-full">
      <div className="border-b border-gray-300 w-full mb-3 p-3">
        <h3 className="text-xl">Account Setting</h3>
      </div>
      <div className="p-3">
        <div className="w-7/12">
          <div className="bg-indigo-400 rounded-md text-white text-sm p-3 flex">
            <span className="mr-2">
              <Info />
            </span>
            <p className="w-11/12">
              Your profile information will automatically populate all your
              resumes by default.
            </p>
          </div>

          <div className="my-3">
            <Label htmlFor="key">Full Name</Label>
            <Input
              id="key"
              placeholder=""
              className="my-1 border-gray-300"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>
          <div className="my-3">
            <Label htmlFor="key">Email</Label>
            <Input
              id="key"
              placeholder=""
              className="my-1 border-gray-300"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
          <div className="my-3">
            <Label htmlFor="key">Phone Number</Label>
            <Input
              id="key"
              placeholder=""
              className="my-1 border-gray-300"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />
          </div>
          <div className="my-3">
            <Label htmlFor="key">Location</Label>
            <Input
              id="key"
              placeholder=""
              className="my-1 border-gray-300"
              value={user.location}
              onChange={(e) => setUser({ ...user, location: e.target.value })}
            />
          </div>
          <div className="my-3">
            <Label htmlFor="key">Location</Label>
            <GREditor
              placeholder="Brief overview of your professional background and goals..."
              value={user.professional_summary}
              handleEdit={(value) =>
                setUser({
                  ...user,
                  professional_summary: value,
                })
              }
            />
          </div>
          <Button
            className="bg-blue-400 text-white hover:bg-blue-500"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Setting;
