import {
  type SeedBlueprintRow,
  type SeedQuestionItemRow,
  makeItemId,
  buildCompleteWordsItem,
  buildDailyLifeItem,
  buildAcademicReadingItem,
  buildListeningItem,
  buildSentenceItem,
  buildWriteEmailItem,
  buildAcademicDiscussionItem,
  buildListenRepeatItem,
  buildTakeInterviewItem,
} from "./types";

export const JUPITER_BLUEPRINT_ID = "f2000000-0000-4000-8000-000000000004";

const CLINIC_NOTICE_STIMULUS = `UNIVERSITY STUDENT HEALTH CENTER — ANNUAL WELLNESS CHECKUP REMINDER

All incoming full-time undergraduate and graduate students are required to complete an initial wellness screening and submit their immunization records by October 15.

How to Schedule Your Appointment:
1. Log in to the Student Health Portal using your university ID and password.
2. Select "Book a Primary Care Checkup" and choose an available 20-minute morning or afternoon slot.
3. Upload your signed vaccination history form at least 24 hours prior to your visit.

Please note: Students who do not submit their immunization documentation by October 15 will have a registration hold placed on their Spring semester course enrollment.`;

const BERINGIA_PASSAGE = `During the Last Glacial Maximum, approximately twenty thousand years ago, vast continental ice sheets locked up immense volumes of ocean water, causing global sea levels to drop by more than one hundred meters. This dramatic marine regression exposed a wide, ice-free landmass nearly one thousand miles across between northeastern Siberia and western Alaska, a region paleogeographers refer to as Beringia. Rather than being a narrow icy corridor, central Beringia supported a steppe-tundra ecosystem of grasses, sedges, and dwarf birch shrubs that sustained herds of woolly mammoths, steppe bison, and caribou.

Archaeological and genetic evidence indicates that ancestral Indigenous populations lived in Beringia for thousands of years before dispersing southward into the Americas as the Laurentide and Cordilleran ice sheets began to retreat. Coastal migration hypotheses suggest that early mariners traveled along the Pacific rim using kelp-forest marine resources, while interior corridor models trace inland routes east of the Rocky Mountains once deglaciation opened passable valleys.`;

const COLD_CHAIN_PASSAGE = `Modern global food systems rely heavily on cold-chain logistics—an uninterrupted series of refrigerated production, storage, and distribution activities that maintain perishable goods within a precise low-temperature range from harvest to consumer. Prior to the widespread adoption of mechanical refrigeration and insulated railcars in the late nineteenth and early twentieth centuries, fresh produce, dairy, and meat could rarely be transported beyond local markets without spoiling or requiring heavy salting, smoking, or canning.

By slowing microbial growth and enzymatic respiration in fruits and vegetables, temperature-controlled shipping containers and automated cold warehouses allow consumers in temperate and subarctic cities to purchase fresh tropical produce year-round. At the same time, cold-chain infrastructure plays a vital role in global public health by preserving temperature-sensitive vaccines and biologics during international transport.`;

const GROUPTHINK_TRANSCRIPT = `Narrator: Listen to a talk in a social psychology class.
Professor: Today we're examining groupthink, a psychological phenomenon that occurs within a cohesive group when the desire for harmony and conformity results in irrational or dysfunctional decision-making. A classic historical example is the 1961 Bay of Pigs invasion. Senior US government officials approved a poorly planned mission. Although several members had private concerns, few voiced them openly. The group prioritized agreement and loyalty over open and honest discussion, leading to a major failure. So what steps can we take to avoid the negative effects of groupthink? It's important to watch for signs such as a lack of debate, emphasis on conformity, or dismissal of contradictory evidence. Input from outsiders should be invited, and a devil's advocate should be assigned to challenge ideas and help explore all perspectives. By creating an environment in which disagreement is accepted and encouraged, groups are more likely to make sound, well-reasoned decisions.`;

const CLOUD_SEEDING_TRANSCRIPT = `Narrator: Listen to a talk in an environmental science class.
Professor: For much of human history, people have had very little control over the forces of nature. However, through the development of new technologies, manipulating weather conditions has become possible. One such intervention is cloud seeding, which is used to try to increase rainfall in dry areas. In this process, certain substances are added to clouds to encourage precipitation. One of the most common substances used is silver iodide, which has a crystalline structure similar to that of ice. When it is released into clouds, either by aircraft or ground-based equipment, moisture collects on the surface and forms ice crystals. These crystals then grow larger and eventually fall as rain or snow. While cloud seeding can be beneficial, it does raise some concerns. Some people worry about the possible environmental impact of releasing chemicals like silver iodide into the atmosphere, and there is also debate about whether it works as effectively as supporters claim.`;

const NEUROPLASTICITY_TRANSCRIPT = `Narrator: Listen to a talk in a psychology class.
Professor: The brain has an extraordinary ability to reorganize itself both structurally and functionally in response to learning, experience, or injury. Even in adulthood, targeted practice can yield significant cognitive gains through an ability called neuroplasticity. When I say plasticity, what I mean is that its structure isn't fixed: neural pathways can be strengthened, weakened, or even entirely rerouted depending on how frequently they're used. Let me tell you about a well-documented study involving London taxi drivers. These drivers undergo years of training to memorize the city's complex layout, navigating approximately 25,000 streets without maps or satellite navigation. Researchers found that the hippocampus—an area of the brain involved in spatial memory—was significantly larger in these taxi drivers compared to London bus drivers, who follow fixed routes. This highlights how high cognitive demand and repeated use of certain pathways can physically reshape brain structures.`;

let idx = 1;
const nextId = () => makeItemId(4, idx++);

export const JUPITER_ITEMS: SeedQuestionItemRow[] = [
  // =========================================================================
  // READING MODULE 1 (YpI_qLiymXs)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Beringia and Early Human Migration (Q1–10)",
    passageText:
      "Most [0] agree [1] the earliest Indigenous inhabitants of the Americas [2] from ancient [3] who [4] a vast [5] bridge leading [6] present-[7] Siberia [8] Alaska, a prehistoric region now [9] Beringia.",
    blanks: [
      { index: 0, prefix: "scie", answer: "ntists" },
      { index: 1, prefix: "th", answer: "at" },
      { index: 2, prefix: "desc", answer: "ended" },
      { index: 3, prefix: "peo", answer: "ple" },
      { index: 4, prefix: "cro", answer: "ssed" },
      { index: 5, prefix: "la", answer: "nd" },
      { index: 6, prefix: "fr", answer: "om" },
      { index: 7, prefix: "d", answer: "ay" },
      { index: 8, prefix: "t", answer: "o" },
      { index: 9, prefix: "cal", answer: "led" },
    ],
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Read in Daily Life: Student Health Center Wellness Reminder (Q11)",
    formatType: "notice",
    senderName: "University Student Health Center",
    senderHandle: "wellness@health.edu",
    subject: "Annual Wellness Screening & Immunization Deadline",
    dateLabel: "September 28",
    stimulusText: CLINIC_NOTICE_STIMULUS,
    questionStem: "What consequence will students face if they fail to submit their immunization records by October 15?",
    options: [
      "A registration hold will be placed on their Spring semester course enrollment.",
      "Their campus housing contract will be terminated immediately.",
      "They will be charged a two-hundred-dollar late fee.",
      "Their library borrowing privileges will be suspended.",
    ],
    correctOptionId: "A",
    explanation: "The notice states: 'Students who do not submit their immunization documentation by October 15 will have a registration hold placed on their Spring semester course enrollment' (A).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Beringia and Pleistocene Migration (Q12)",
    stimulusText: BERINGIA_PASSAGE,
    questionSubType: "factual",
    questionStem: "According to paragraph 1, what caused the landmass of Beringia to become exposed during the Last Glacial Maximum?",
    options: [
      "Volcanic eruptions along the Aleutian Islands created new mountain chains.",
      "Tectonic uplift pushed the Pacific Ocean floor above sea level.",
      "Continental ice sheets locked up vast amounts of ocean water, lowering global sea levels by more than one hundred meters.",
      "Ancient rivers deposited thick layers of desert sand between Siberia and Alaska.",
    ],
    correctOptionId: "C",
    explanation: "Paragraph 1 explains that 'vast continental ice sheets locked up immense volumes of ocean water, causing global sea levels to drop by more than one hundred meters. This dramatic marine regression exposed a wide, ice-free landmass' (C).",
  }),

  // =========================================================================
  // READING MODULE 2 (YpI_qLiymXs — Intermediate Lower & Advanced Upper)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Complete the Words: Geostationary Satellites in Space (M2 Intermediate Q1–10)",
    passageText:
      "Since the Space Age [0] with the launch of the first artificial [1] into [2] more [3] half a [4] ago, [5] of [6] have been placed in [7] orbits high [8] the Earth's [9].",
    blanks: [
      { index: 0, prefix: "be", answer: "gan" },
      { index: 1, prefix: "satel", answer: "lites" },
      { index: 2, prefix: "sp", answer: "ace" },
      { index: 3, prefix: "th", answer: "an" },
      { index: 4, prefix: "cen", answer: "tury" },
      { index: 5, prefix: "ma", answer: "ny" },
      { index: 6, prefix: "th", answer: "em" },
      { index: 7, prefix: "statio", answer: "nary" },
      { index: 8, prefix: "ab", answer: "ove" },
      { index: 9, prefix: "equa", answer: "tor" },
    ],
  }),
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Complete the Words: Modern Refrigeration & Perishable Foods (M2 Advanced Q1–10)",
    passageText:
      "For [0], fresh berries [1] seem like a [2] grocery item these [3], yet [4] over a [5] ago, most [6] could only [7] such [8] foods [9] a few miles of where they were harvested.",
    blanks: [
      { index: 0, prefix: "exa", answer: "mple" },
      { index: 1, prefix: "m", answer: "ay" },
      { index: 2, prefix: "com", answer: "mon" },
      { index: 3, prefix: "da", answer: "ys" },
      { index: 4, prefix: "ju", answer: "st" },
      { index: 5, prefix: "cen", answer: "tury" },
      { index: 6, prefix: "peo", answer: "ple" },
      { index: 7, prefix: "cons", answer: "ume" },
      { index: 8, prefix: "peris", answer: "hable" },
      { index: 9, prefix: "wit", answer: "hin" },
    ],
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Cold-Chain Logistics and Global Agriculture (M2 Q11)",
    stimulusText: COLD_CHAIN_PASSAGE,
    questionSubType: "factual",
    questionStem: "According to paragraph 2, how does cold-chain infrastructure benefit global public health beyond food distribution?",
    options: [
      "By eliminating the need for agricultural irrigation",
      "By preserving temperature-sensitive vaccines and biologics during international transport",
      "By sterilizing surgical instruments with steam",
      "By replacing vitamin supplements with salted meats",
    ],
    correctOptionId: "B",
    explanation: "Paragraph 2 states that 'cold-chain infrastructure plays a vital role in global public health by preserving temperature-sensitive vaccines and biologics during international transport' (B).",
  }),

  // =========================================================================
  // LISTENING MODULE 1 & MODULE 2
  // =========================================================================
  buildListeningItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Conversation — Studying in the Library vs. the Cafe (Q1)",
    transcript: `Man: I've got a lot to review for the midterm exam. I'm just trying to figure out whether I should study in the library or the cafe.
Woman: I always get distracted when I'm in the cafe.
Man: True, but I like ordering a coffee when I need a break.
Woman: I get that, but the library is much quieter, and it has printers and a copier if you need them.
Man: Good point.`,
    campusContext: "Campus Walkway",
    questionStem: "What advantages of studying in the library does the woman mention?",
    options: [
      "It serves free espresso and pastries.",
      "It is much quieter and has printers and a copier available.",
      "It allows students to talk loudly in study groups.",
      "It is closer to the football stadium.",
    ],
    correctOptionId: "B",
    explanation: "The woman says: 'the library is much quieter, and it has printers and a copier if you need them' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Conversation — West Lot Football Parking & Campus Shuttle (Q2)",
    transcript: `Woman: Let's park in the West Lot. It's the closest to the science building.
Man: We can't. There's a football game this evening. Remember, after 3:00, it's reserved for fans.
Woman: Seriously? That's annoying. We could try the East Lot, but that's so far—we'll have to walk forever.
Man: Not really. We can just take the campus shuttle. It'll take us right there.`,
    campusContext: "Campus Parking",
    questionStem: "Why can the speakers not park in the West Lot?",
    options: [
      "The West Lot is being repaved this week.",
      "Only faculty members are allowed to use the West Lot.",
      "After 3:00 p.m., it is reserved for fans attending the evening football game.",
      "The entrance gate is broken.",
    ],
    correctOptionId: "C",
    explanation: "The man explains: 'There's a football game this evening. Remember, after 3:00, it's reserved for fans' (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Campus Radio Announcement — Solar-Powered Footpath Lights (Q3)",
    transcript: `Narrator: Listen to an announcement on a campus radio station.
Announcer: The Facilities Management Office is pleased to announce that new solar-powered lights will soon be installed along all of the campus's main footpaths. These energy-efficient lights will improve safety while promoting sustainability. The project was made possible thanks to a generous grant from a charity called the Avery Environmental Foundation. A work crew is scheduled to set up the lights beginning on April 4th. The work will be carried out in phases to limit disruptions during peak campus hours.`,
    campusContext: "Campus Facilities",
    questionStem: "Why will the installation of the new solar-powered lights be carried out in phases?",
    options: [
      "Because the solar panels have not been manufactured yet",
      "To limit disruptions during peak campus hours",
      "Because the university is waiting for city permits",
      "To train engineering students how to wire streetlights",
    ],
    correctOptionId: "B",
    explanation: "The announcer states: 'The work will be carried out in phases to limit disruptions during peak campus hours' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Social Psychology Lecture — Avoiding Groupthink (Q4)",
    transcript: GROUPTHINK_TRANSCRIPT,
    academicDomain: "Social Psychology",
    questionStem: "According to the professor, what role does a 'devil's advocate' play in preventing groupthink?",
    options: [
      "Enforcing strict loyalty to the group leader's initial plan",
      "Challenging ideas so the group explores multiple perspectives and contradictory evidence",
      "Taking minutes and recording attendance during meetings",
      "Preventing outsiders from sharing their opinions",
    ],
    correctOptionId: "B",
    explanation: "The professor states: 'Input from outsiders should be invited, and a devil's advocate should be assigned to challenge ideas and help explore all perspectives' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Conversation — Graduate School Personal Statement (M2 Q1)",
    transcript: `Woman: I'm feeling a bit overwhelmed with these graduate school applications.
Man: Is there something in particular that's troubling you?
Woman: I'm not sure how to differentiate myself from the other candidates.
Man: Hmm. Are you using a general personal statement?
Woman: I was planning to. Why do you ask?
Man: Well, admissions committees appreciate when applicants reference unique aspects of their program.
Woman: You mean like specific research opportunities or faculty?
Man: Exactly. Tailor each application to the specific program. That will more clearly demonstrate that you're a good fit.
Woman: That makes sense. I'll revise accordingly.`,
    campusContext: "Academic Advising",
    questionStem: "What advice does the man give the woman about her graduate school applications?",
    options: [
      "Send the exact same personal statement to every university to save time",
      "Tailor each application by referencing specific research opportunities and faculty in that program",
      "Apply only to programs that do not require a personal statement",
      "Wait another year before applying to graduate school",
    ],
    correctOptionId: "B",
    explanation: "The man advises her to tailor each application to the specific program by referencing unique aspects such as research opportunities or faculty (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Environmental Science — Cloud Seeding with Silver Iodide (M2 Q2)",
    transcript: CLOUD_SEEDING_TRANSCRIPT,
    academicDomain: "Environmental Science",
    questionStem: "Why is silver iodide commonly used in cloud seeding?",
    options: [
      "It warms the surrounding air so clouds evaporate rapidly.",
      "It has a crystalline structure similar to ice, allowing moisture to collect and form ice crystals.",
      "It absorbs ultraviolet radiation from the upper stratosphere.",
      "It colors rain clouds so pilots can track wind speed.",
    ],
    correctOptionId: "B",
    explanation: "The professor explains: 'One of the most common substances used is silver iodide, which has a crystalline structure similar to that of ice. When it is released into clouds... moisture collects on the surface and forms ice crystals' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Psychology Class — Neuroplasticity & London Taxi Drivers (M2 Lower Q1)",
    transcript: NEUROPLASTICITY_TRANSCRIPT,
    academicDomain: "Cognitive Neuroscience",
    questionStem: "What did researchers discover about the brains of London taxi drivers compared with London bus drivers?",
    options: [
      "Taxi drivers had a significantly larger hippocampus due to memorizing thousands of streets.",
      "Bus drivers had a larger visual cortex because they drove larger vehicles.",
      "Both groups showed identical brain structures after five years.",
      "Taxi drivers relied exclusively on satellite navigation systems.",
    ],
    correctOptionId: "A",
    explanation: "The professor states: 'Researchers found that the hippocampus—an area of the brain involved in spatial memory—was significantly larger in these taxi drivers compared to London bus drivers' (A).",
  }),

  // =========================================================================
  // WRITING SECTION (10 Build a Sentence + Email to Dr. Rojas + Academic Discussion from YpI_qLiymXs)
  // =========================================================================
  buildSentenceItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 1,
    speakerAName: "Nurse",
    contextPrompt: "Why did the medical clinic reception desk call you this morning?",
    targetSentence:
      "They wanted to know when I would like to have my checkup.",
    wordBank: [
      "when I",
      "They wanted to know",
      "to have my checkup",
      "would like",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 2,
    speakerAName: "Coworker",
    contextPrompt: "Who is going to moderate the alumni panel on Friday?",
    targetSentence: "I have not heard who is going to be doing that.",
    wordBank: [
      "who is",
      "I have not heard",
      "doing that",
      "going to be",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 3,
    speakerAName: "Friend",
    contextPrompt: "Where did the hospitality students decide to travel for their study tour?",
    targetSentence: "I heard that they will be going to Macau.",
    wordBank: ["that they", "I heard", "going to Macau", "will be"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 4,
    speakerAName: "Supervisor",
    contextPrompt: "Why did you arrive twenty minutes late to the morning briefing?",
    targetSentence: "The subway was delayed because of an accident.",
    wordBank: ["because of", "The subway", "an accident", "was delayed"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 5,
    speakerAName: "Teammate",
    contextPrompt: "Did the media librarian stop by our study room?",
    targetSentence:
      "Yes, he wanted to know if we needed help finding visual aids.",
    wordBank: [
      "if we needed",
      "Yes, he wanted to know",
      "finding visual aids",
      "help",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 6,
    speakerAName: "Advisor",
    contextPrompt: "Did Kevin ask about the upcoming orientation workshop?",
    targetSentence:
      "He was wondering if he needs to prepare anything for it.",
    wordBank: [
      "if he needs",
      "He was wondering",
      "anything for it",
      "to prepare",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 7,
    speakerAName: "Manager",
    contextPrompt: "Were there any network glitches during the software rollout?",
    targetSentence:
      "Yes, there was, but Ellen from IT was able to resolve them.",
    wordBank: [
      "but Ellen from IT",
      "Yes, there was,",
      "to resolve them",
      "was able",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 8,
    speakerAName: "Classmate",
    contextPrompt: "I'm trying out the new speed-reading workshop this afternoon.",
    targetSentence: "Could you let me know how it goes for you?",
    wordBank: ["how it", "Could you", "for you", "let me know", "goes"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 9,
    speakerAName: "Roommate",
    contextPrompt: "This new productivity app has completely changed my study routine.",
    targetSentence: "Could you explain what you like about it?",
    wordBank: ["what you", "Could you", "about it", "explain", "like"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 10,
    speakerAName: "Partner",
    contextPrompt: "What did the CFO ask at the end of the quarterly forecast?",
    targetSentence: "She wanted to know how much profit we can expect.",
    wordBank: [
      "how much",
      "She wanted to know",
      "we can expect",
      "profit",
    ],
  }),
  buildWriteEmailItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    title: "Write an Email — Course Prerequisites & Syllabus Inquiry to Dr. Rojas",
    scenarioContext:
      "You are preparing to register for next semester's classes and are very interested in an upper-level seminar taught by Dr. Rojas. Before registering, you want to make sure your academic background matches the course expectations.",
    recipientRole: "To: Dr. Rojas | Subject: Inquiry Regarding Next Semester's Seminar",
    bulletPoints: [
      "Introduce yourself and express your interest in registering for Dr. Rojas's course next semester.",
      "Ask whether the class is suitable for a student with your academic background and what prerequisites are expected.",
      "Request information about the level of difficulty and the main topics covered.",
    ],
    sampleAnswer: `Dear Dr. Rojas,

I hope you are doing well. My name is Alex Rivera, and I am currently preparing to register for my classes for next semester. I recently read the description of your course, and it immediately caught my attention because I am very interested in the subject and would like to deepen my understanding in this area.

Before I register, I would like to ask if this class is suitable for a student with my background. Could you please let me know the expected prerequisites and the level of difficulty? I would also appreciate any information about the main topics covered and primary reading assignments.

Thank you very much for your time and assistance.

Sincerely,
Alex Rivera`,
  }),
  buildAcademicDiscussionItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    title: "Writing for an Academic Discussion — Book Bans vs. Freedom of Expression",
    courseName: "Political Philosophy 205: Civil Liberties",
    professorName: "Dr. Sterling",
    professorPrompt:
      "In recent years, public libraries and schools have faced growing debates over whether certain controversial books should be removed from shelves. Some argue that books containing offensive or historically distorted ideas should be restricted to protect readers, while others contend that banning books violates freedom of expression and undermines critical thinking. What is your view on this issue?",
    studentPosts: [
      {
        authorName: "Veronica",
        avatarSeed: "veronica-jupiter",
        text: "I understand why communities sometimes restrict certain books. Some texts spread harmful stereotypes or distort historical facts, which can negatively influence younger readers who may not yet have the background knowledge to recognize bias.",
      },
      {
        authorName: "Elizabeth",
        avatarSeed: "elizabeth-jupiter",
        text: "I strongly oppose banning books. Freedom of expression is a fundamental right, and once institutions start deciding which viewpoints are acceptable, important discussions get suppressed. Instead of prohibiting books, educators should help students analyze controversial ideas critically.",
      },
    ],
    keyPointsToCover: [
      "State a clear position on book restrictions versus open access and guided critical inquiry.",
      "Engage directly with Veronica's concern about harmful content and Elizabeth's defense of free expression.",
      "Provide well-structured academic arguments.",
    ],
    sampleAnswer: `In my opinion, banning books should be approached with great caution because it directly affects freedom of expression. I understand Veronica's concern that some books may spread prejudice or distort history, which can negatively influence uncritical readers. However, I agree more with Elizabeth that completely banning books is not the best solution. Instead of prohibiting access, educational institutions can provide guidance and critical context to help readers understand and evaluate controversial ideas.

Freedom of speech is a fundamental right, and limiting it may lead to further restrictions in the future. If governments or organizations start deciding which ideas are acceptable, this could create bias and suppress important discussions. On the other hand, harmful content should not be ignored; it should be challenged through education and open dialogue. Therefore, rather than banning books, society should encourage critical thinking skills so that individuals can distinguish between facts, opinions, and misleading information.`,
  }),

  // =========================================================================
  // SPEAKING SECTION (7 Listen & Repeat + 4 Take an Interview from YpI_qLiymXs)
  // =========================================================================
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 1,
    scenarioTitle: "Bank Branch Customer Welcome",
    sentence: "Good afternoon, and welcome to the bank.",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 2,
    scenarioTitle: "Bank Branch Customer Welcome",
    sentence: "Do you have an account with our bank?",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 3,
    scenarioTitle: "Bank Branch Customer Welcome",
    sentence: "If yes, take a number and wait here on the left.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 4,
    scenarioTitle: "Bank Branch Customer Welcome",
    sentence: "To open one, please meet with a loan officer on the right.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 5,
    scenarioTitle: "Bank Branch Customer Welcome",
    sentence: "To withdraw money, you can just use the ATMs by the entrance.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 6,
    scenarioTitle: "Bank Branch Customer Welcome",
    sentence:
      "If you would like to pay bills, you can use the kiosks along the left wall.",
    responseSeconds: 11,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 7,
    scenarioTitle: "Bank Branch Customer Welcome",
    sentence:
      "You may also enjoy some complimentary coffee in our lounge while you wait for help.",
    responseSeconds: 12,
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 1,
    interviewTopic: "Consumer Shopping Habits & Retail Trends",
    questionText:
      "Thank you for participating in our consumer study. First, how often do you shop for clothes or household items, and do you usually plan your purchases in advance?",
    expectedKeyPhrases: ["plan", "shopping list", "monthly", "budget", "discounts"],
    sampleAnswer:
      "I usually shop for clothes or household items once or twice a month, and I almost always plan my purchases in advance. Keeping a running list on my phone helps me wait for seasonal sales and prevents me from buying things I don't actually need.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 2,
    interviewTopic: "Consumer Shopping Habits & Retail Trends",
    questionText:
      "Where do you usually do your shopping—at department stores, specialty shops, or online stores—and why do you prefer those options?",
    expectedKeyPhrases: ["department stores", "online shopping", "variety", "reviews", "convenience"],
    sampleAnswer:
      "I usually do my shopping at department stores and online shops because they offer a wide variety of products in one place. Department stores are convenient since I can compare different brands, check quality directly, and find good discounts. I also like online shopping because it saves time and allows me to read customer reviews before buying.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 3,
    interviewTopic: "Consumer Shopping Habits & Retail Trends",
    questionText:
      "Some retail analysts predict that internet retail will completely replace physical brick-and-mortar stores in the coming decades. Do you agree or disagree with this prediction?",
    expectedKeyPhrases: ["disagree", "physical stores", "try products", "immediate service", "coexist"],
    sampleAnswer:
      "I disagree that internet retail will completely replace physical stores. Although online shopping is convenient and often cheaper, many people still prefer to see and try on products like shoes, furniture, or fresh groceries before buying them. Physical stores also provide immediate service, so both online and in-store shopping will continue to coexist.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: JUPITER_BLUEPRINT_ID,
    questionNumber: 4,
    interviewTopic: "Consumer Shopping Habits & Retail Trends",
    questionText:
      "Finally, how important are customer reviews and return policies when you decide to buy a product from a new brand?",
    expectedKeyPhrases: ["customer reviews", "return policy", "trust", "quality", "confidence"],
    sampleAnswer:
      "Customer reviews and clear return policies are crucial whenever I try a new brand. Detailed reviews with photos from verified buyers tell me whether a product holds up in real use, and a hassle-free return policy gives me the confidence to make a purchase without worrying about wasting money.",
  }),
];

export const JUPITER_BLUEPRINT: SeedBlueprintRow = {
  id: JUPITER_BLUEPRINT_ID,
  title: "Jupiter | Adaptive Test",
  slug: "jupiter-adaptive-test-2026",
  description:
    "Official TOEFL iBT 2026 TestGlider Mock Exam #4 (Jupiter — Video YpI_qLiymXs). Features Multi-Stage Adaptive Reading (Beringia Migration, Geostationary Satellites, Cold-Chain Perishable Logistics), Listening (Groupthink, Solar Footpath Lights, Cloud Seeding, Neuroplasticity), Writing (10 Build a Sentence, Email to Dr. Rojas, Book Bans & Free Expression Discussion), and Speaking (Bank Customer Orientation & Retail Shopping Interview).",
  exam_Type: "full_mock",
  total_Duration_Seconds: 5160,
  blueprint_Json: {
    sections: [
      {
        section: "reading",
        order: 1,
        durationSeconds: 1620,
        moduleCount: 2,
        questionCount: 6,
        isAdaptive: true,
      },
      {
        section: "listening",
        order: 2,
        durationSeconds: 1560,
        moduleCount: 2,
        questionCount: 7,
        isAdaptive: true,
      },
      {
        section: "writing",
        order: 3,
        durationSeconds: 1380,
        moduleCount: 1,
        questionCount: 12,
        isAdaptive: false,
      },
      {
        section: "speaking",
        order: 4,
        durationSeconds: 600,
        moduleCount: 1,
        questionCount: 11,
        isAdaptive: false,
      },
    ],
    scoringScale: "1-6_and_0-120",
    planetName: "Jupiter",
    videoUrl: "https://youtu.be/YpI_qLiymXs",
    videoId: "YpI_qLiymXs",
    playlistUrl:
      "https://youtube.com/playlist?list=PLoDNaUsnugSqgJGJKo59X49nkQbwcksMV",
    difficultyLabel: "Multi-Stage Adaptive",
  },
  is_Published: true,
  created_At: "2026-09-04T10:00:00.000Z",
};
