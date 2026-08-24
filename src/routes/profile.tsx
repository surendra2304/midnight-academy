import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell, Panel, SectionHeading } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getStudentDashboardData,
  updateStudentProfile,
  type StudentAnalytics,
} from "@/lib/student.functions";

export const Route = createFileRoute("/profile")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Profile & Settings — Midnight Academy" },
      {
        name: "description",
        content: "Update your name, registration number, branch and notification preferences.",
      },
      { property: "og:title", content: "Profile & Settings — Midnight Academy" },
      {
        property: "og:description",
        content: "Manage your Midnight Academy account details.",
      },
    ],
  }),
  component: ProfilePage,
});

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border py-4 last:border-0">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0 pt-1">{children}</div>
    </div>
  );
}

const BRANCHES = [
  "CSE",
  "CSD",
  "CSIT",
  "IT",
  "ECE",
  "EEE",
  "Mechanical",
  "Civil",
  "AI & ML",
  "Other",
];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduated"];

function ProfilePage() {
  const [data, setData] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [regdNumber, setRegdNumber] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getStudentDashboardData();
        setData(res);
        setName(res.profile.fullName);
        setRegdNumber(res.profile.codeNumber || "");
        setYear(res.profile.year || "");
        setBranch(res.profile.branch || "");
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regdNumber.length !== 10) {
      toast.error("Regd. Number must be exactly 10 characters.");
      return;
    }
    setSaving(true);
    try {
      await updateStudentProfile({
        data: {
          fullName: name.trim(),
          regdNumber: regdNumber.trim().toUpperCase(),
          year: year || undefined,
          branch: branch || undefined,
        },
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              profile: {
                ...prev.profile,
                fullName: name.trim(),
                codeNumber: regdNumber.trim().toUpperCase(),
                year: year || null,
                branch: branch || null,
              },
            }
          : prev,
      );
      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppNav />
        <PageShell className="max-w-[900px]">
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your profile...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppNav />
      <PageShell className="max-w-[900px]">
        <SectionHeading
          title="Profile & Settings"
          subtitle="Your account details and alert preferences."
        />

        <Panel>
          <h2 className="text-base font-semibold text-foreground">Profile</h2>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSave}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pemail">Email</Label>
              <Input id="pemail" type="email" value={data?.profile.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regd">Regd. Number</Label>
              <Input
                id="regd"
                value={regdNumber}
                onChange={(e) => setRegdNumber(e.target.value.toUpperCase())}
                minLength={10}
                maxLength={10}
                placeholder="21P31A0501"
                required
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">Exactly 10 characters.</p>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={branch} onValueChange={setBranch} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end sm:col-span-2">
              <Button type="submit" disabled={saving || !name.trim() || regdNumber.length !== 10}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>
        </Panel>

        <Panel className="mt-6">
          <h2 className="text-base font-semibold text-foreground">Notifications</h2>
          <div className="mt-3">
            <Row
              title="Test invitations"
              description="Email me when an instructor publishes a test my class is included in."
            >
              <Switch defaultChecked />
            </Row>
            <Row
              title="Evaluation ready"
              description="Notify me the moment my comprehension evaluation finishes processing."
            >
              <Switch defaultChecked />
            </Row>
            <Row
              title="Weekly progress digest"
              description="A short Sunday summary of your five-axis movement and one suggested drill."
            >
              <Switch />
            </Row>
          </div>
        </Panel>
      </PageShell>
    </div>
  );
}
