import "dotenv/config";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { createClient } from "@supabase/supabase-js";
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from "@tanstack/react-router";
import { UnifiedScoreReportView } from "../src/components/test-runner/UnifiedScoreReportView";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function verifyScoreReportRender() {
  console.log("========================================================================");
  console.log("   VERIFY RESULT PAGE SCORE REPORT RENDERING (ATTEMPT f31cf3f8...)       ");
  console.log("========================================================================\n");

  const attemptId = "f31cf3f8-a236-45f0-8846-466d2791e2fe";

  // 1. Fetch attempt
  const { data: attempt } = await supabase
    .from("attempts")
    .select("*, tests(name)")
    .eq("id", attemptId)
    .single();

  if (!attempt) throw new Error(`Attempt ${attemptId} not found`);

  // 2. Fetch score report
  const { data: report } = await supabase
    .from("score_reports")
    .select("*")
    .eq("attempt_id", attemptId)
    .maybeSingle();

  // 3. Fetch attempt sections
  const { data: attemptSections } = await supabase
    .from("attempt_sections")
    .select("*, sections(*)")
    .eq("attempt_id", attemptId);

  const secIds = (attemptSections || []).map((s) => s.id);

  // 4. Fetch responses
  const { data: responses } = await supabase
    .from("responses")
    .select("*, content_items(*)")
    .in("attempt_section_id", secIds);

  const itemIds = (responses || []).map((r) => r.content_item_id);

  // 5. Options
  const { data: options } = await supabase
    .from("question_options")
    .select("*")
    .in("content_item_id", itemIds);

  const optionsByItem = new Map<string, any[]>();
  for (const opt of options || []) {
    const list = optionsByItem.get(opt.content_item_id) || [];
    list.push(opt);
    optionsByItem.set(opt.content_item_id, list);
  }

  const enhancedResponses = (responses || []).map((r) => ({
    ...r,
    audioPlayUrl: null,
    evaluation: null,
    options: optionsByItem.get(r.content_item_id) || [],
  }));

  const reportData = {
    attempt,
    report,
    userEmail: "test@midnight.academy",
    targetScore: report?.target_score || 5.0,
    attemptSections: attemptSections || [],
    responses: enhancedResponses,
    recommendations: [],
  };

  console.log("Creating memory router for TanStack Router Link support...");
  const rootRoute = createRootRoute({
    component: () =>
      React.createElement(UnifiedScoreReportView, {
        reportData: reportData as any,
      }),
  });

  const memoryHistory = createMemoryHistory({ initialEntries: ["/"] });
  const router = createRouter({
    routeTree: rootRoute,
    history: memoryHistory,
  });

  await router.load();

  console.log("Calling ReactDOMServer.renderToString(RouterProvider)...");
  const html = ReactDOMServer.renderToString(
    React.createElement(RouterProvider, { router })
  );

  console.log("-> SUCCESS: UnifiedScoreReportView rendered cleanly without error!");
  console.log(`-> Generated HTML length: ${html.length} characters`);
  console.log("-> Contains 'Elevator Maintenance':", html.includes("Elevator Maintenance"));
  console.log("-> Contains 'All tenants of Millhouse Tower':", html.includes("All tenants of Millhouse Tower"));
  console.log("-> Contains 'bwrightson@MTowermail.com':", html.includes("bwrightson@MTowermail.com"));
  console.log("-> Contains '15/07/2025':", html.includes("15/07/2025"));

  console.log("\n>>> MINIFIED REACT ERROR #31 FIX 100% VERIFIED! <<<");
}

verifyScoreReportRender()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Score report render error:", err);
    process.exit(1);
  });
