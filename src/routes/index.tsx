import { createFileRoute } from "@tanstack/react-router";
import { TestCatalog } from "./test.index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TOEFL Practice & Mock Tests — TestGlider" },
      {
        name: "description",
        content:
          "Official TOEFL 2026 Full-Length Mock Exams (Moon, Mars, Venus, Jupiter, Saturn, Mercury, Neptune, Uranus) and Single Section Mode practice with instant AI grading.",
      },
    ],
  }),
  component: TestCatalog,
});
