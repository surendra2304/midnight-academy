import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageShell, Panel, SectionHeading, StatCard, StatusTag, Tag } from "@/components/kit";
import { AXIS_LABELS, type AxisKey, scoreTextClass } from "@/lib/mock-data";
import { formatToIST } from "@/lib/format";
import { getAdminStudent } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/students/$studentId")({
  head: () => ({
    meta: [
      { title: "Student Detail — Midnight Academy Admin" },
      {
        name: "description",
        content:
          "One student's attempt history, comprehension trend and category-level strengths and weaknesses.",
      },
      { property: "og:title", content: "Student Detail — Midnight Academy Admin" },
      {
        property: "og:description",
        content: "The instructor-side mirror of a student's progress page.",
      },
    ],
  }),
  component: StudentDetail,
});

type StudentDetailData = {
  student: {
    id: string;
    name: string;
    initials: string;
    email: string;
    institution: string | null;
    year: string | null;
    attempts: number;
    average: number;
    weakest: AxisKey;
    lastActive: string;
  };
  attempts: Array<{
    id: string;
    name: string;
    category: string;
    score: number;
    status: string;
    date: string;
  }>;
};

function StudentDetail() {
  const { studentId } = useParams({ from: "/admin/students/$studentId" });
  const [data, setData] = useState<StudentDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAdminStudent({ data: { studentId } });
        setData(res as StudentDetailData);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading student details...</p>
        </div>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
        <div className="panel p-8 text-center">
          <h2 className="text-lg font-bold text-foreground">Student Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This student has not attempted any tests created by your account.
          </p>
          <Button asChild className="mt-5">
            <Link to="/admin/students">Back to Students</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const { student, attempts } = data;

  return (
    <PageShell>
      <Link to="/admin/students" className="text-xs text-muted-foreground hover:text-foreground">
        ← All students
      </Link>
      <div className="mt-4 flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-full bg-primary/12 text-sm font-bold text-primary">
          {student.initials}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{student.name}</h1>
          <p className="text-sm text-muted-foreground">
            {student.email}
            {student.institution ? ` · ${student.institution}` : ""}
            {student.year ? ` · ${student.year}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attempts" value={student.attempts} />
        <StatCard
          label="Average"
          value={<span className={scoreTextClass(student.average)}>{student.average}%</span>}
        />
        <StatCard
          label="Weakest Axis"
          value={student.weakest ? AXIS_LABELS[student.weakest] : "No evaluations yet"}
        />
        <StatCard
          label="Last Active"
          value={
            student.lastActive.includes("T") ? formatToIST(student.lastActive) : student.lastActive
          }
        />
      </div>

      <div className="mt-6">
        <Panel className="p-0">
          <div className="p-5 lg:p-6">
            <SectionHeading title="Attempt History" className="mb-0" />
          </div>
          {attempts.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No attempts recorded yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {attempts.map((a) => (
                <li key={a.id}>
                  <Link
                    to="/result/$attemptId"
                    params={{ attemptId: a.id }}
                    className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2/60"
                  >
                    <span className="text-sm font-semibold text-foreground">{a.name}</span>
                    <Tag>{a.category}</Tag>
                    <span className={`ml-auto text-sm font-bold ${scoreTextClass(a.score)}`}>
                      {a.score}%
                    </span>
                    <span className="text-xs text-muted-foreground">{formatToIST(a.date)}</span>
                    <StatusTag status={a.status as "in_progress" | "evaluated"} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}

function Button({
  asChild,
  className,
  children,
}: {
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  if (asChild) return <div className={className}>{children}</div>;
  return <button className={className}>{children}</button>;
}
