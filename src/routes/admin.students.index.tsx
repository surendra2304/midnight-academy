import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AXIS_LABELS, type AxisKey, scoreTextClass } from "@/lib/mock-data";
import { PageShell, SectionHeading, Tag } from "@/components/kit";
import { formatToIST } from "@/lib/format";
import { listAdminStudents } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/students/")({
  head: () => ({
    meta: [
      { title: "Students — Midnight Academy Admin" },
      {
        name: "description",
        content:
          "Every student, their attempt count, average comprehension score and weakest reading axis.",
      },
      { property: "og:title", content: "Students — Midnight Academy Admin" },
      {
        property: "og:description",
        content: "Open a student to see their full comprehension history.",
      },
    ],
  }),
  component: Students,
});

type StudentRow = {
  id: string;
  name: string;
  initials: string;
  email: string;
  institution: string | null;
  attempts: number;
  average: number;
  weakest: AxisKey;
  lastActive: string;
};

function Students() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await listAdminStudents();
        setStudents(res as StudentRow[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your students...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeading
        title="Students"
        subtitle={`${students.length} students across your tests.`}
      />
      {students.length === 0 ? (
        <div className="panel p-10 text-center">
          <h3 className="text-base font-semibold text-foreground">No students yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Share active test codes with students to see their results here.
          </p>
        </div>
      ) : (
        <div className="panel divide-y divide-border overflow-hidden p-0">
          {students.map((s) => (
            <Link
              key={s.id}
              to="/admin/students/$studentId"
              params={{ studentId: s.id }}
              className="grid grid-cols-2 items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-2/60 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]"
            >
              <span className="col-span-2 flex items-center gap-3 lg:col-span-1">
                <span className="grid size-8 place-items-center rounded-full bg-primary/12 text-[11px] font-bold text-primary">
                  {s.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{s.name}</span>
                  <span className="block text-xs text-muted-foreground">{s.email}</span>
                </span>
              </span>
              <span className="text-sm text-muted-foreground">{s.attempts} attempts</span>
              <span className={`text-sm font-bold ${scoreTextClass(s.average)}`}>{s.average}%</span>
              <Tag tone="warning">
                {s.weakest ? `Weak: ${AXIS_LABELS[s.weakest]}` : "No evaluations yet"}
              </Tag>
              <span className="text-right text-xs text-muted-foreground">
                {s.lastActive.includes("T") ? formatToIST(s.lastActive) : s.lastActive}
              </span>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
