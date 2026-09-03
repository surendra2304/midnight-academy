import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

const ENGLISH_PRACTICE_TESTS = [
  {
    id: "e1000000-0000-0000-0000-000000000001",
    name: "English Practice Test 1",
    category: "English Comprehension",
    difficulty: "Easy",
    question_count: 3,
    seconds_per_question: 45,
    response_seconds: 90,
    status: "active",
    is_practice: true,
    code: "ENG-PRAC-01",
    questions: [
      {
        id: "e1000000-0000-0000-0000-000000000101",
        position: 0,
        text: "The library allows members to borrow up to five books for two weeks.\nReference books and daily newspapers must be read inside and cannot be taken home.",
        topic: "Borrowing Rules",
        difficulty: "Easy",
        concepts: ["Borrowing Limit", "Loan Duration", "In-Library Reference"],
        constraints: [
          "Max 5 books",
          "2-week duration",
          "No taking home reference books or newspapers",
        ],
        reference_answer:
          "Members can borrow a maximum of five books for a period of two weeks. Reference books and newspapers are strictly restricted for in-library reading and cannot be checked out.",
      },
      {
        id: "e1000000-0000-0000-0000-000000000102",
        position: 1,
        text: "Campus parking is free on weekends, but weekdays require a parking pass before 5 PM.\nVehicles parked without a pass during restricted weekday hours will be fined.",
        topic: "Parking Regulations",
        difficulty: "Easy",
        concepts: ["Weekend Free Parking", "Weekday Permit Cutoff", "Parking Violation Penalty"],
        constraints: [
          "Pass required on weekdays before 5 PM",
          "Free on weekends",
          "Fined if unpermitted during restricted hours",
        ],
        reference_answer:
          "Weekend parking on campus is completely free, whereas weekday parking before 5 PM requires an authorized parking pass. Any vehicle parked without a permit during those weekday hours will incur a fine.",
      },
      {
        id: "e1000000-0000-0000-0000-000000000103",
        position: 2,
        text: "Office employees can work from home on Mondays and Fridays with manager approval.\nTeam meetings scheduled on Wednesdays require all staff members to be present in person.",
        topic: "Work Policy",
        difficulty: "Medium",
        concepts: ["Remote Work Eligibility", "Manager Approval", "Mandatory In-Person Attendance"],
        constraints: ["WFH only on Mon/Fri with approval", "Wednesdays strictly in-person"],
        reference_answer:
          "Employees may work remotely on Mondays and Fridays provided they have manager approval. However, all employees must attend Wednesday team meetings in person at the office.",
      },
    ],
  },
  {
    id: "e2000000-0000-0000-0000-000000000002",
    name: "English Practice Test 2",
    category: "English Comprehension",
    difficulty: "Medium",
    question_count: 3,
    seconds_per_question: 45,
    response_seconds: 90,
    status: "active",
    is_practice: true,
    code: "ENG-PRAC-02",
    questions: [
      {
        id: "e2000000-0000-0000-0000-000000000201",
        position: 0,
        text: "Lab computers are available for all enrolled students during standard university hours.\nExternal USB storage devices are strictly blocked to protect the network from viruses.",
        topic: "Lab Policies",
        difficulty: "Easy",
        concepts: ["Student Computer Access", "Operating Hours", "USB Device Prohibition"],
        constraints: ["Enrolled students during uni hours", "No external USB devices allowed"],
        reference_answer:
          "Enrolled university students can use laboratory computers during normal campus hours. Connecting external USB flash drives or storage devices is strictly prohibited for virus prevention.",
      },
      {
        id: "e2000000-0000-0000-0000-000000000202",
        position: 1,
        text: "Course assignments submitted after the midnight deadline lose five points every hour.\nAny assignment received more than four hours late is marked as zero.",
        topic: "Submission Deadline",
        difficulty: "Medium",
        concepts: ["Late Penalty Rate", "Hourly Deduction", "Hard Submission Cutoff"],
        constraints: ["5 points lost per hour past midnight", "Zero score after 4 hours late"],
        reference_answer:
          "Submitting assignments after the midnight deadline results in a deduction of 5 points for each passing hour. If an assignment is submitted more than four hours late, it will automatically receive zero marks.",
      },
      {
        id: "e2000000-0000-0000-0000-000000000203",
        position: 2,
        text: "Full-time students receive free entry to the annual cultural festival with their ID card.\nOutside guests accompanying a student can purchase entry passes at a half-price discount.",
        topic: "Event Access",
        difficulty: "Easy",
        concepts: [
          "Student Free Admission",
          "Student ID Verification",
          "Accompanying Guest Discount",
        ],
        constraints: [
          "Free entry with valid student ID",
          "50% off entry passes for accompanying guests",
        ],
        reference_answer:
          "Full-time students get complimentary admission to the annual cultural festival by presenting their student ID card. Non-student guests who enter together with a student are eligible to buy entry tickets at half price.",
      },
    ],
  },
];

async function main() {
  const { data: adminRoles } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin")
    .limit(1);
  let ownerId = adminRoles?.[0]?.user_id;
  if (!ownerId) {
    const { data: anyUser } = await supabase.auth.admin.listUsers();
    ownerId = anyUser?.users?.[0]?.id;
  }

  console.log("Using Owner ID", ownerId);

  if (ownerId) {
    // Seed/sync practice tests into Supabase
    for (const t of ENGLISH_PRACTICE_TESTS) {
      await supabase.from("tests").upsert(
        {
          id: t.id,
          owner_id: ownerId,
          name: t.name,
          category: t.category,
          difficulty: t.difficulty,
          question_count: t.question_count,
          seconds_per_question: t.seconds_per_question,
          response_seconds: t.response_seconds,
          status: t.status,
          is_practice: t.is_practice,
          code: t.code,
        },
        { onConflict: "id" },
      );

      for (const q of t.questions) {
        await supabase.from("questions").upsert(
          {
            id: q.id,
            test_id: t.id,
            position: q.position,
            text: q.text,
            category: t.category,
            topic: q.topic,
            difficulty: q.difficulty,
            concepts: q.concepts,
            constraints: q.constraints,
            reference_answer: q.reference_answer,
            approved: true,
          },
          { onConflict: "id" },
        );
      }
    }
  }

  console.log("SEEDED DIRECTLY!");
}
main();
