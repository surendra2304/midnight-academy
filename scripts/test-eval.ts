import dotenv from "dotenv";
dotenv.config();

import { evaluateAnswer } from "../src/lib/evaluate.server";

async function test() {
  console.log("Testing random gibberish evaluation...");
  const gibberishRes = await evaluateAnswer({
    questionText:
      "The library allows members to borrow up to five books at a time for a period of two weeks.",
    referenceAnswer: "Members can borrow at most 5 books for up to 14 days.",
    concepts: ["Borrowing Limit", "Loan Duration"],
    constraints: ["Max 5 books", "2 weeks return window"],
    response: "asdfghjk qwertyuiop zxcvbnm test random text 123",
  });
  console.log("Gibberish result:", JSON.stringify(gibberishRes, null, 2));

  console.log("\nTesting correct answer evaluation...");
  const correctRes = await evaluateAnswer({
    questionText:
      "The library allows members to borrow up to five books at a time for a period of two weeks.",
    referenceAnswer: "Members can borrow at most 5 books for up to 14 days.",
    concepts: ["Borrowing Limit", "Loan Duration"],
    constraints: ["Max 5 books", "2 weeks return window"],
    response:
      "You can take at most 5 books from the library and you must return them within 2 weeks.",
  });
  console.log("Correct answer result:", JSON.stringify(correctRes, null, 2));
}

test().catch(console.error);
