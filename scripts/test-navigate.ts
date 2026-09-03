import "dotenv/config";
import { loadTestBlueprint } from "../src/lib/tests/blueprint-loader";
import { sessionReducer } from "../src/lib/tests/session-state";
import { attemptSessionService } from "../src/lib/tests/session-service.server";

async function testNavigate() {
  const attemptId = "c50fb940-0624-475c-9149-4d174122fe8f";
  const studentId = "5e79650a-9e22-4fa7-b7c2-dab49818b94b";

  try {
    const res = await attemptSessionService.resumeAttempt(attemptId, studentId);
    console.log("Resumed successfully!");
    console.log("Snapshot status:", res.snapshot.status);
    console.log("CurrentSectionIndex:", res.snapshot.currentSectionIndex);
    console.log("CurrentItemIndex:", res.snapshot.currentItemIndex);
    console.log("Current Section Name:", res.blueprint.sections[res.snapshot.currentSectionIndex]?.sectionType);
    console.log("Items in section:", res.blueprint.sections[res.snapshot.currentSectionIndex]?.items.length);

    console.log("Attempting NAVIGATE_ITEM to index 1...");
    const nextState = sessionReducer(
      res.snapshot,
      { type: "NAVIGATE_ITEM", itemIndex: 1 },
      res.blueprint,
    );
    console.log("NAVIGATE_ITEM SUCCESS! New itemIndex:", nextState.currentItemIndex);
  } catch (err) {
    console.error("NAVIGATE_ITEM FAILED WITH ERROR:", err);
  }
}

testNavigate();
