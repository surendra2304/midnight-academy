import { createFileRoute, Link } from "@tanstack/react-router";
import { AXIS_LABELS, adminStudents, scoreTextClass } from "@/lib/mock-data";
import { PageShell, SectionHeading, Tag } from "@/components/kit";

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

function Students() {
  return (
    <PageShell>
      <SectionHeading title="Students" subtitle={`${adminStudents.length} students in your cohort.`} />
      <div className="panel divide-y divide-border overflow-hidden p-0">
        {adminStudents.map((s) => (
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
            <Tag tone="warning">Weak: {AXIS_LABELS[s.weakest]}</Tag>
            <span className="text-right text-xs text-muted-foreground">{s.lastActive}</span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
