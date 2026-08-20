import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
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
import { studentProfile } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Profile & Settings — Midnight Academy" },
      {
        name: "description",
        content:
          "Update your details, notification preferences and reading-time accommodations.",
      },
      { property: "og:title", content: "Profile & Settings — Midnight Academy" },
      {
        property: "og:description",
        content: "Manage your Midnight Academy account and accessibility settings.",
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

function ProfilePage() {
  const [extraTime, setExtraTime] = useState("none");

  return (
    <div className="min-h-screen">
      <AppNav />
      <PageShell className="max-w-[900px]">
        <SectionHeading title="Profile & Settings" subtitle="Your account, alerts and accommodations." />

        <Panel>
          <h2 className="text-base font-semibold text-foreground">Profile</h2>
          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Profile updated");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue={studentProfile.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pemail">Email</Label>
              <Input id="pemail" type="email" defaultValue={studentProfile.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inst">Institution</Label>
              <Input id="inst" defaultValue={studentProfile.institution} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year & programme</Label>
              <Input id="year" defaultValue={studentProfile.year} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save changes</Button>
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

        <Panel className="mt-6">
          <h2 className="text-base font-semibold text-foreground">Accessibility & accommodations</h2>
          <div className="mt-3">
            <Row
              title="Extended reading time"
              description="Adds extra time to the reading stage of every question. Requires instructor approval and is recorded on your attempts."
            >
              <Select value={extraTime} onValueChange={setExtraTime}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Standard time</SelectItem>
                  <SelectItem value="25">+25% time</SelectItem>
                  <SelectItem value="50">+50% time</SelectItem>
                  <SelectItem value="100">Double time</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row
              title="Larger question text"
              description="Renders question statements one step larger during the reading stage."
            >
              <Switch />
            </Row>
            <Row
              title="Reduce motion"
              description="Turns off count-up animations and stage transitions across the app."
            >
              <Switch />
            </Row>
          </div>
        </Panel>
      </PageShell>
    </div>
  );
}
