import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ScoreBars, ScoreTrend } from "@/components/charts";
import { ComprehensionBreakdown } from "@/components/comprehension";
import {
  PageShell,
  Panel,
  SectionHeading,
  StatCard,
  StatusTag,
  Tag,
} from "@/components/kit";
import {
  AXIS_LABELS,
  adminStudents,
  attempts,
  categoryPerformance,
  formatDate,
  progressSeries,
  scoreTextClass,
  studentAxes,
} from "@/lib/mock-data";

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

function StudentDetail() {
  const { studentId } = useParams({ from: "/admin/students/$studentId" });
  const student = adminStudents.find((s) => s.id === studentId) ?? adminStudents[0]!;

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
          <p className="text-sm text-muted-foreground">{student.email}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attempts" value={student.attempts} />
        <StatCard
          label="Average"
          value={<span className={scoreTextClass(student.average)}>{student.average}%</span>}
        />
        <StatCard label="Weakest Axis" value={AXIS_LABELS[student.weakest]} />
        <StatCard label="Last Active" value={student.lastActive} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <SectionHeading title="Comprehension Trend" subtitle="Score per attempt." />
          <ScoreTrend data={progressSeries} height={280} />
        </Panel>
        <Panel>
          <SectionHeading title="Comprehension Profile" />
          <ComprehensionBreakdown axes={studentAxes} variant="bars" highlight={student.weakest} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel>
          <SectionHeading title="By Category" />
          <ScoreBars
            data={categoryPerformance as unknown as Record<string, string | number>[]}
            xKey="category"
            height={300}
          />
        </Panel>
        <Panel className="p-0">
          <div className="p-5 lg:p-6">
            <SectionHeading title="Attempt History" className="mb-0" />
          </div>
          <ul className="divide-y divide-border">
            {attempts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <span className="text-sm text-foreground">{a.name}</span>
                <Tag>{a.category}</Tag>
                <span className={`ml-auto text-sm font-bold ${scoreTextClass(a.score)}`}>
                  {a.score}%
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(a.date)}</span>
                <StatusTag status={a.status} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </PageShell>
  );
}
