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

export const NEPTUNE_BLUEPRINT_ID = "f2000000-0000-4000-8000-000000000007";

const PHONOFIDDLE_PASSAGE = `Before the invention of electronic vacuum-tube amplifiers and microphones in the 1920s, musicians and instrument makers experimented with mechanical methods to increase the acoustic volume of string instruments. In busy nineteenth-century performance halls, outdoor markets, and early wax-cylinder recording studios, conventional wooden violins often struggled to project their sound above brass sections or ambient street noise.

One of the most inventive solutions was the phonofiddle (along with the closely related Stroh violin), patented at the turn of the twentieth century. Instead of relying on a hollow wooden soundbox to resonate air, the phonofiddle transmitted string vibrations from the bridge directly to a flexible mica or aluminum diaphragm attached to a flared conical metal horn. Acting like the bell of a trumpet or gramophone, the horn concentrated and directed acoustic energy toward the audience or recording horn, paving the way for the later amplification revolution in modern music.`;

const CHIAROSCURO_PASSAGE = `During the seventeenth-century Baroque era, European painters developed dramatic new techniques for rendering light and shadow to heighten emotional intensity. Central to this stylistic shift was chiaroscuro—an Italian term meaning "light-dark"—which used strong tonal contrasts between brightly illuminated figures and deeply shaded backgrounds to create the illusion of three-dimensional volume.

While Italian master Caravaggio popularized theatrical spotlighting in crowded religious dramas, the French Baroque painter Georges de La Tour refined a quieter, deeply contemplative approach to tenebrism. De La Tour's nocturnal scenes frequently feature a single visible or concealed candle flame as the sole source of illumination inside an austere room. By filtering warm golden light across smooth, simplified geometric forms and eliminating distracting background detail, De La Tour imbued everyday figures with a sense of stillness, intimacy, and quiet mystery.`;

const CENTIPEDES_TRANSCRIPT = `Narrator: Listen to a talk on a biology podcast.
Host: Did you ever see a little bug scuttle past you quickly and wonder whether it was a centipede or a millipede? Both centipedes and millipedes have bodies made up of many segments and have poor vision. The name centipede comes from Latin and means 100 feet, while millipede means 1,000 feet—though neither actually has that exact number. Here is the key structural difference: millipedes have two sets of legs for each segment of their body, positioned right underneath their body. By contrast, centipedes have just one set of legs for each body segment, positioned on the side of the body. Their defense behaviors are different, too: centipedes might bite and quickly run away, whereas millipedes roll themselves up into a coil and emit a foul-smelling odor to deter predators.`;

const MODELING_SCAFFOLDING_TRANSCRIPT = `Narrator: Listen to a lecture in an education class.
Professor: Earlier we discussed the concept of modeling—when a teacher demonstrates a skill or process so students can observe and learn from that example. For instance, if you're teaching essay writing, you might write a paragraph in front of the class, thinking aloud through your choices. Now let's talk about a related but distinct concept: scaffolding. Scaffolding is a teaching strategy that provides temporary supports to help learners accomplish tasks they might not manage independently. Just as construction scaffolds support workers until a building can stand on its own, instructional scaffolds—such as outlines, sentence starters, and graphic organizers—support students until they gain mastery. As students grow more confident, the teacher gradually removes these supports, fostering autonomy and independent skill.`;

let idx = 1;
const nextId = () => makeItemId(7, idx++);

export const NEPTUNE_ITEMS: SeedQuestionItemRow[] = [
  // =========================================================================
  // READING MODULE 1 (ZXDFqmJg9n0)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Artisanal Craftwork & Raw Materials (Q1–10)",
    passageText:
      "Traditional craftwo[0] transforms natural raw mater[1] such as clay, wood, and me[2] by ha[3] int[4] functional household prod[5]. These objects a[6] both use[7] and beau[8], turning each finished pi[9] into a work of art.",
    blanks: [
      { index: 0, prefix: "craftwo", answer: "rk" },
      { index: 1, prefix: "mater", answer: "ials" },
      { index: 2, prefix: "me", answer: "tal" },
      { index: 3, prefix: "ha", answer: "nd" },
      { index: 4, prefix: "int", answer: "o" },
      { index: 5, prefix: "prod", answer: "ucts" },
      { index: 6, prefix: "a", answer: "re" },
      { index: 7, prefix: "use", answer: "ful" },
      { index: 8, prefix: "beau", answer: "tiful" },
      { index: 9, prefix: "pi", answer: "ece" },
    ],
  }),
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Musical Rhythm, Lyrics & Expression (Q11–20)",
    passageText:
      "Through syncopated rhy[0] and espec[1] poetic ly[2], folk music as a ge[3] exp[4] the shared history o[5] a community. In many cultures, music holds a central pl[6] in spir[7] ceremonies rather than serving sim[8] t[9] entertain.",
    blanks: [
      { index: 0, prefix: "rhy", answer: "thm" },
      { index: 1, prefix: "espec", answer: "ially" },
      { index: 2, prefix: "ly", answer: "rics" },
      { index: 3, prefix: "ge", answer: "nre" },
      { index: 4, prefix: "exp", answer: "resses" },
      { index: 5, prefix: "o", answer: "f" },
      { index: 6, prefix: "pl", answer: "ace" },
      { index: 7, prefix: "spir", answer: "itual" },
      { index: 8, prefix: "sim", answer: "ply" },
      { index: 9, prefix: "t", answer: "o" },
    ],
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Acoustic Amplification Before Electricity (Q21)",
    stimulusText: PHONOFIDDLE_PASSAGE,
    questionSubType: "factual",
    questionStem: "How did the phonofiddle amplify the sound of vibrating strings without electricity?",
    options: [
      "It transmitted string vibrations from the bridge to a diaphragm attached to a flared conical metal horn.",
      "It used a battery-powered vacuum tube hidden inside the neck.",
      "It doubled the size of the hollow wooden soundbox.",
      "It connected the violin strings to a grand piano soundboard.",
    ],
    correctOptionId: "A",
    explanation: "Paragraph 2 states that 'the phonofiddle transmitted string vibrations from the bridge directly to a flexible mica or aluminum diaphragm attached to a flared conical metal horn' (A).",
  }),

  // =========================================================================
  // READING MODULE 2 (ZXDFqmJg9n0: plex, bles, tions, s, ment, ught, lls, he, tem, nicate)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Complete the Words: Complex Neural Networks & Signaling (M2 Q1–10)",
    passageText:
      "The human brain's com[0] architecture ena[1] rapid electrical connec[2] across billions of synapse[3]. Every physical move[4] and conscious tho[5] depends on specialized nerve ce[6] working together throughout t[7] nervous sys[8] to commu[9] signals.",
    blanks: [
      { index: 0, prefix: "com", answer: "plex" },
      { index: 1, prefix: "ena", answer: "bles" },
      { index: 2, prefix: "connec", answer: "tions" },
      { index: 3, prefix: "", answer: "s" },
      { index: 4, prefix: "move", answer: "ment" },
      { index: 5, prefix: "tho", answer: "ught" },
      { index: 6, prefix: "ce", answer: "lls" },
      { index: 7, prefix: "t", answer: "he" },
      { index: 8, prefix: "sys", answer: "tem" },
      { index: 9, prefix: "commu", answer: "nicate" },
    ],
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Baroque Chiaroscuro and Georges de La Tour (M2 Q11)",
    stimulusText: CHIAROSCURO_PASSAGE,
    questionSubType: "factual",
    questionStem: "What is a distinctive feature of Georges de La Tour's Baroque paintings described in paragraph 2?",
    options: [
      "Bright outdoor landscapes painted at midday",
      "Nocturnal interior scenes illuminated by a single candle flame with simplified geometric forms",
      "Crowded battle scenes filled with hundreds of soldiers",
      "Abstract collages made from newsprint and fabric",
    ],
    correctOptionId: "B",
    explanation: "Paragraph 2 explains that De La Tour's nocturnal scenes 'frequently feature a single visible or concealed candle flame as the sole source of illumination... across smooth, simplified geometric forms' (B).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Baroque Chiaroscuro and Georges de La Tour (M2 Lower Q1)",
    stimulusText: CHIAROSCURO_PASSAGE,
    questionSubType: "vocabulary",
    questionStem: "What does the Italian artistic term 'chiaroscuro' refer to in paragraph 1?",
    options: [
      "Carving marble statues using bronze chisels",
      "Strong tonal contrasts between light and dark to create three-dimensional volume",
      "Mixing oil paint with egg yolk",
      "Painting frescoes on wet plaster ceilings",
    ],
    correctOptionId: "B",
    explanation: "Paragraph 1 defines chiaroscuro as 'an Italian term meaning light-dark—which used strong tonal contrasts between brightly illuminated figures and deeply shaded backgrounds to create the illusion of three-dimensional volume' (B).",
  }),

  // =========================================================================
  // LISTENING MODULE 1 & MODULE 2 (Exact transcripts from ZXDFqmJg9n0)
  // =========================================================================
  buildListeningItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "University Event Announcement — Annual Cultural Night (Q1)",
    transcript: `Narrator: Listen to an announcement at a university event.
Speaker: Hello everyone. Just a quick reminder that the university's annual Cultural Night is happening this Friday beginning at 6:00 p.m. in the new L Wing of the student center. The celebration will include musical performances, food, and activities representing various international cultures. There are special door prizes for the first 50 students, so try to arrive early!`,
    campusContext: "Student Center",
    questionStem: "Why does the speaker encourage students to arrive early to Cultural Night?",
    options: [
      "Because the doors lock permanently at 6:05 p.m.",
      "Because there are special door prizes for the first 50 students",
      "Because parking is only free before 5:00 p.m.",
      "Because performers need help setting up chairs",
    ],
    correctOptionId: "B",
    explanation: "The speaker says: 'There are special door prizes for the first 50 students, so try to arrive early' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Classroom Announcement — New Schedule & Graduation Credits (Q2)",
    transcript: `Narrator: Listen to an announcement in a classroom.
Advisor: Students, next Monday will be the first day you may begin selecting your classes for next semester. Remember that we're moving to a new schedule: in-person classes will be held Monday through Thursday, and Fridays will be reserved for e-learning and attending office hours. Also, a reminder that the number of course credits required for graduation has decreased by six this year, so you may need fewer courses than you think in order to graduate.`,
    campusContext: "Academic Advising",
    questionStem: "How will Fridays be used under the university's new weekly schedule?",
    options: [
      "For mandatory laboratory exams",
      "For e-learning and attending faculty office hours",
      "For athletic competitions only",
      "For off-campus community service",
    ],
    correctOptionId: "B",
    explanation: "The advisor states: 'in-person classes will be held Monday through Thursday, and Fridays will be reserved for e-learning and attending office hours' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Biology Podcast — Centipedes vs. Millipedes (Q3)",
    transcript: CENTIPEDES_TRANSCRIPT,
    academicDomain: "Biology / Zoology",
    questionStem: "According to the speaker, how can you distinguish a millipede from a centipede by looking at its legs?",
    options: [
      "Millipedes have two sets of legs per body segment positioned underneath their body, whereas centipedes have one set per segment on the side.",
      "Centipedes have wings in addition to their legs.",
      "Millipedes have exactly one thousand legs and bright red eyes.",
      "Centipedes have no legs on the front half of their body.",
    ],
    correctOptionId: "A",
    explanation: "The host explains that millipedes have two sets of legs per segment underneath their body, while centipedes have one set of legs per segment positioned on the side (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Conversation — Laura's Cooking Class & Crumpets (M2 Q1)",
    transcript: `Man: Hi, Laura. Did you go to your cooking class yesterday?
Woman: Sure did! We learned how to make crumpets.
Man: Uh, what's a crumpet?
Woman: It's a bread that you make in a pan or a griddle. They're like English muffins.
Man: Oh, I know all about English muffins! They're great with butter and jam.
Woman: I like mine with honey, or I'll use them to make sandwiches for lunch. I'll show you how to make them!`,
    campusContext: "Student Lounge",
    questionStem: "What does Laura offer to do for the man?",
    options: [
      "Lend him her recipe textbook for the semester",
      "Show him how to make crumpets",
      "Sign him up for the advanced pastry course",
      "Buy him English muffins from the bakery",
    ],
    correctOptionId: "B",
    explanation: "At the end of the conversation, Laura says: 'I'll show you how to make them!' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Education Lecture — Modeling vs. Scaffolding (M2 Q2)",
    transcript: MODELING_SCAFFOLDING_TRANSCRIPT,
    academicDomain: "Education & Pedagogy",
    questionStem: "According to the professor, what is the key difference between modeling and scaffolding in instruction?",
    options: [
      "Modeling demonstrates a process by example, whereas scaffolding provides temporary supports that are gradually removed as students gain independence.",
      "Scaffolding is used only in university courses, while modeling is only for elementary schools.",
      "Modeling requires students to work in groups, while scaffolding forbids collaboration.",
      "Scaffolding is a permanent grading rubric used on final exams.",
    ],
    correctOptionId: "A",
    explanation: "The professor states: 'Modeling shows the process—it's about demonstration. Scaffolding, on the other hand, is about temporary support that helps students take steps toward independence' (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Education Lecture — Modeling vs. Scaffolding (M2 Lower Q1)",
    transcript: MODELING_SCAFFOLDING_TRANSCRIPT,
    academicDomain: "Education & Pedagogy",
    questionStem: "Why is the teaching strategy called 'scaffolding'?",
    options: [
      "It was invented by an architecture professor.",
      "Like construction scaffolds that support workers until a building stands on its own, instructional scaffolds temporarily support learners until they achieve mastery.",
      "It requires students to build physical models in class.",
      "It is named after the town where the first textbook was printed.",
    ],
    correctOptionId: "B",
    explanation: "The professor explains: 'The term comes from construction. Just as scaffolds support workers until a building can stand on its own, instructional scaffolds support students until they gain mastery' (B).",
  }),

  // =========================================================================
  // WRITING SECTION (10 Build a Sentence + Coffeemaker Email + Dr. Achebe History Discussion from ZXDFqmJg9n0)
  // =========================================================================
  buildSentenceItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 1,
    speakerAName: "Classmate",
    contextPrompt: "Which campus library branch do you prefer studying in?",
    targetSentence: "The library that has private study rooms is the best.",
    wordBank: [
      "that has",
      "The library",
      "is the best",
      "private study rooms",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 2,
    speakerAName: "Friend",
    contextPrompt: "The first act of the play just ended.",
    targetSentence: "Do you know how long the intermission is?",
    wordBank: ["how long", "Do you know", "is", "the intermission"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 3,
    speakerAName: "Neighbor",
    contextPrompt: "I'm looking for fresh local produce this weekend.",
    targetSentence: "Make sure to check out the farmer's market on Saturday.",
    wordBank: [
      "to check out",
      "Make sure",
      "on Saturday",
      "the farmer's market",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 4,
    speakerAName: "Colleague",
    contextPrompt: "The awards banquet has been moved to next month.",
    targetSentence: "Could you tell me why the event was postponed?",
    wordBank: ["why", "Could you tell me", "was postponed", "the event"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 5,
    speakerAName: "Roommate",
    contextPrompt: "Have you finished setting up your home office?",
    targetSentence: "The desk that I ordered last month still hasn't arrived.",
    wordBank: [
      "that I ordered",
      "The desk",
      "still hasn't arrived",
      "last month",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 6,
    speakerAName: "Coworker",
    contextPrompt: "Elena is taking two weeks off in August.",
    targetSentence: "Did she tell you where she is going for her vacation?",
    wordBank: [
      "where she",
      "Did she tell you",
      "for her vacation",
      "is going",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 7,
    speakerAName: "Friend",
    contextPrompt: "It looks like it's about to start pouring rain outside.",
    targetSentence: "I can't remember who I lent my umbrella to.",
    wordBank: ["who I", "I can't remember", "my umbrella to", "lent"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 8,
    speakerAName: "Resident",
    contextPrompt: "I'd like to start working out at the community center.",
    targetSentence: "Do you know if there is a fee to use the gym?",
    wordBank: [
      "if there is",
      "Do you know",
      "to use the gym",
      "a fee",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 9,
    speakerAName: "Applicant",
    contextPrompt: "I'm preparing my application for the lab assistant role.",
    targetSentence:
      "I want to know what requirements are needed for the position.",
    wordBank: [
      "what requirements",
      "I want to know",
      "for the position",
      "are needed",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 10,
    speakerAName: "Commuter",
    contextPrompt: "We just missed the 8:15 express train.",
    targetSentence: "Can you tell me when the next train arrives?",
    wordBank: ["when", "Can you tell me", "arrives", "the next train"],
  }),
  buildWriteEmailItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    title: "Write an Email — Defective Coffeemaker Replacement or Refund",
    scenarioContext:
      "Last week you purchased a programmable coffeemaker from an online store (Order #45892). When you unpacked and tested it this morning, water leaked from the bottom seal and the heating plate failed to warm up.",
    recipientRole: "To: Customer Service Team | Subject: Defective Coffeemaker — Order #45892",
    bulletPoints: [
      "Provide your order details and describe the specific defects with the coffeemaker.",
      "State whether you would prefer a replacement unit or a full refund.",
      "Ask for instructions on how to return the damaged appliance at no shipping cost.",
    ],
    sampleAnswer: `Dear Customer Service Team,

I am writing to report an issue with a programmable coffeemaker I purchased from your online store last week under Order #45892.

When the package arrived this morning, I followed all setup instructions carefully. However, as soon as I filled the reservoir, water began leaking steadily from the bottom seal onto my counter, and the heating plate failed to warm up at all. Because the appliance is defective out of the box, I would like to request either a brand-new replacement unit or a full refund to my original payment method.

Could you please send me a prepaid return shipping label and let me know how quickly a replacement can be dispatched?

Thank you for your prompt assistance.

Sincerely,
Morgan Lee`,
  }),
  buildAcademicDiscussionItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    title: "Writing for an Academic Discussion — Studying History to Solve Modern Challenges",
    courseName: "History 105: Historical Perspectives",
    professorName: "Dr. Achebe",
    professorPrompt:
      "In our opening seminar, we are considering the practical value of studying history. Some thinkers argue that examining past historical events is essential for understanding and solving contemporary global problems, while others contend that modern technological and environmental challenges are so unprecedented that history offers little relevant guidance. What is your view?",
    studentPosts: [
      {
        authorName: "Kelly",
        avatarSeed: "kelly-neptune",
        text: "I believe studying history is indispensable. Even though technology changes, human behavior, economic cycles, and political conflicts follow recurring patterns. Learning from past mistakes helps leaders avoid repeating them.",
      },
      {
        authorName: "Marcus",
        avatarSeed: "marcus-neptune",
        text: "While history is interesting, today's challenges—such as artificial intelligence, cybersecurity, and global climate change—have no historical equivalent. Relying on outdated models from centuries ago can actually prevent us from innovating.",
      },
    ],
    keyPointsToCover: [
      "Take a clear position on whether studying history helps address contemporary issues.",
      "Engage with Kelly's and/or Marcus's points with specific historical or modern examples.",
      "Demonstrate coherent organization and varied academic grammar.",
    ],
    sampleAnswer: `I strongly agree with Kelly that studying history is essential for understanding and addressing contemporary challenges, even in an era of rapid technological innovation.

While Marcus is correct that tools like artificial intelligence are new, the societal dilemmas they create—such as labor displacement, regulatory ethics, and information manipulation—closely mirror earlier transformations like the Industrial Revolution and the rise of mass print media. Furthermore, many current geopolitical conflicts and economic inequalities are direct legacies of past treaties, colonial borders, and policy decisions. Without historical literacy, policymakers treat only the surface symptoms of crises rather than their root causes. By combining historical insight into human institutions with modern scientific innovation, society can navigate future challenges far more wisely and effectively.`,
  }),

  // =========================================================================
  // SPEAKING SECTION (7 Listen & Repeat + 4 Take an Interview from ZXDFqmJg9n0)
  // =========================================================================
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 1,
    scenarioTitle: "Woodworking Workshop — Building a Birdhouse",
    sentence: "Measure each piece carefully before you cut.",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 2,
    scenarioTitle: "Woodworking Workshop — Building a Birdhouse",
    sentence: "Saw slowly to keep the line smooth and straight.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 3,
    scenarioTitle: "Woodworking Workshop — Building a Birdhouse",
    sentence: "Lightly sand the edges until they all feel smooth and clean.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 4,
    scenarioTitle: "Woodworking Workshop — Building a Birdhouse",
    sentence:
      "Make a round hole that the bird will use as the entrance to the house.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 5,
    scenarioTitle: "Woodworking Workshop — Building a Birdhouse",
    sentence:
      "Glue each side of the house together and give it some time to dry.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 6,
    scenarioTitle: "Woodworking Workshop — Building a Birdhouse",
    sentence:
      "To attach the roof, hammer the nails in gently so the wood doesn't split or crack.",
    responseSeconds: 12,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 7,
    scenarioTitle: "Woodworking Workshop — Building a Birdhouse",
    sentence:
      "To protect the birdhouse from weather, seal it well so it will last for years.",
    responseSeconds: 12,
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 1,
    interviewTopic: "DIY Projects, Handicrafts & Practical Skills",
    questionText:
      "Thank you for taking part in our survey. First, do you enjoy making or repairing things with your hands, such as woodworking, crafting, or home repairs? Why or why not?",
    expectedKeyPhrases: ["hands-on", "repair", "creative", "satisfying", "practical"],
    sampleAnswer:
      "Yes, I really enjoy assembling furniture, doing basic home repairs, and building small woodworking projects. Working with my hands is a relaxing break from staring at a computer screen, and it feels rewarding to create or fix something tangible.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 2,
    interviewTopic: "DIY Projects, Handicrafts & Practical Skills",
    questionText:
      "When something in your home breaks, do you usually try to fix it yourself first, or do you prefer to hire a professional right away? Explain your reasoning.",
    expectedKeyPhrases: ["fix it myself", "tutorial", "professional", "safety", "cost"],
    sampleAnswer:
      "For minor issues like a loose cabinet hinge, a leaky faucet washer, or a software problem, I always check an online tutorial and try to fix it myself first to save money. However, for electrical wiring or major plumbing, I hire a certified professional for safety reasons.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 3,
    interviewTopic: "DIY Projects, Handicrafts & Practical Skills",
    questionText:
      "Many people feel that traditional handcrafts and manual skills are being lost in the digital age. Do you think schools should still teach hands-on workshop classes?",
    expectedKeyPhrases: ["workshop", "problem-solving", "spatial", "creativity", "confidence"],
    sampleAnswer:
      "I definitely think schools should continue offering hands-on workshop and maker classes. Building physical objects teaches spatial reasoning, patience, and practical problem-solving skills that purely digital coursework cannot replicate.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: NEPTUNE_BLUEPRINT_ID,
    questionNumber: 4,
    interviewTopic: "DIY Projects, Handicrafts & Practical Skills",
    questionText:
      "Finally, why do you think handmade products often have a special appeal to consumers compared to mass-produced factory goods?",
    expectedKeyPhrases: ["handmade", "unique", "craftsmanship", "quality", "local artisans"],
    sampleAnswer:
      "Handmade products appeal to consumers because each piece is unique, reflects personal craftsmanship, and often uses higher-quality materials than mass-produced factory items. Buyers also value supporting local artisans and knowing the story behind how an object was made.",
  }),
];

export const NEPTUNE_BLUEPRINT: SeedBlueprintRow = {
  id: NEPTUNE_BLUEPRINT_ID,
  title: "Neptune | Full Test",
  slug: "neptune-full-test-2026",
  description:
    "Official TOEFL iBT 2026 TestGlider Mock Exam #7 (Neptune — Video ZXDFqmJg9n0). Features Adaptive Reading (Artisanal Craftwork, Folk Music & Lyrics, Phonofiddle Acoustic Amplification, Neural Networks, Baroque Chiaroscuro), Listening (Cultural Night, New E-Learning Friday Schedule, Centipedes vs. Millipedes, Instructional Modeling vs. Scaffolding), Writing (10 Build a Sentence, Leaking Coffeemaker Email, Dr. Achebe History Discussion), and Speaking (Building a Wooden Birdhouse & DIY Interview).",
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
        questionCount: 6,
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
    planetName: "Neptune",
    videoUrl: "https://youtu.be/ZXDFqmJg9n0",
    videoId: "ZXDFqmJg9n0",
    playlistUrl:
      "https://youtube.com/playlist?list=PLoDNaUsnugSqgJGJKo59X49nkQbwcksMV",
    difficultyLabel: "Standard 2026 Adaptive",
  },
  is_Published: true,
  created_At: "2026-09-07T10:00:00.000Z",
};
