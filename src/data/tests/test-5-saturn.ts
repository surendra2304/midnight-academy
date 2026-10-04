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

export const SATURN_BLUEPRINT_ID = "f2000000-0000-4000-8000-000000000005";

const ARCHAEOLOGY_SYMPOSIUM_EMAIL = `To: All History & Classics Majors
From: Department of Historical Studies (events@history.edu)
Subject: Guest Lecture by Dr. Elena Rossi on Roman Urban Engineering

We are delighted to invite you to our annual Classical Antiquity Lecture this Thursday at 4:30 PM in Auditorium 3B. Visiting scholar Dr. Elena Rossi will present recent archaeological findings from excavations of ancient Roman aqueducts and amphitheaters.

Following the 45-minute lecture, there will be a 20-minute Q&A session and a light reception in the Atrium where students may speak directly with Dr. Rossi about summer fieldwork fellowships in Italy.`;

const CANYON_EROSION_PASSAGE = `Deep river canyons are among the most dramatic landforms on Earth's continental crust, carved over millions of years by the combined forces of fluvial incision, tectonic uplift, and slope weathering. When a tectonic plateau rises slowly above sea level, rivers flowing across its surface gain gravitational potential energy, increasing their velocity and capacity to transport abrasive sediment such as sand, gravel, and boulders.

As fast-moving water scours the riverbed, hydraulic action and abrasion cut downward into underlying rock strata—a process geomorphologists call vertical incision. Simultaneously, freeze-thaw cycles, rainwash, and gravitational mass wasting erode the canyon walls, gradually widening the gorge into a stepped profile where resistant sandstone and limestone cliffs alternate with gentler shale slopes.`;

const THERMOHALINE_PASSAGE = `Global ocean circulation is driven by two interconnected systems: wind-driven surface currents and deep-ocean thermohaline circulation. Often described as the "global conveyor belt," thermohaline circulation moves vast volumes of seawater across ocean basins based on differences in water density, which are controlled by temperature (thermo) and salinity (haline).

Warm surface currents such as the Gulf Stream transport tropical heat northward toward the North Atlantic, moderating winter climates across western Europe. As this warm water reaches high latitudes, chilly polar winds cool the surface and sea ice formation leaves dissolved salt behind, making the remaining seawater cold, salty, and dense. This dense water sinks into the deep ocean basin and flows southward toward Antarctica and the Indian and Pacific oceans, redistributing thermal energy and dissolved oxygen that deep-sea marine organisms depend on to survive.`;

let idx = 1;
const nextId = () => makeItemId(5, idx++);

export const SATURN_ITEMS: SeedQuestionItemRow[] = [
  // =========================================================================
  // READING MODULE 1 (fc8fOM_oVxQ)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Canyon Formation & Geological Erosion (Q1–10)",
    passageText:
      "[0] river gorges [1] begin as narrow [2] channels [3] gradually [4] through continuous water [5] and [6] weathering [7] many [8] of [9] time.",
    blanks: [
      { index: 0, prefix: "de", answer: "ep" },
      { index: 1, prefix: "of", answer: "ten" },
      { index: 2, prefix: "in", answer: "ner" },
      { index: 3, prefix: "th", answer: "at" },
      { index: 4, prefix: "bro", answer: "aden" },
      { index: 5, prefix: "ero", answer: "sion" },
      { index: 6, prefix: "nat", answer: "ural" },
      { index: 7, prefix: "ov", answer: "er" },
      { index: 8, prefix: "cent", answer: "uries" },
      { index: 9, prefix: "geolo", answer: "gical" },
    ],
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Read in Daily Life: Roman Urban Engineering Guest Lecture (Q11)",
    formatType: "email",
    senderName: "Department of Historical Studies",
    senderHandle: "events@history.edu",
    subject: "Guest Lecture by Dr. Elena Rossi on Roman Urban Engineering",
    dateLabel: "Monday, 2:00 PM",
    stimulusText: ARCHAEOLOGY_SYMPOSIUM_EMAIL,
    questionStem: "What opportunity will students have during the reception in the Atrium after the lecture?",
    options: [
      "To purchase signed copies of textbooks at a discount",
      "To register for an introductory Latin grammar exam",
      "To speak directly with Dr. Rossi about summer fieldwork fellowships in Italy",
      "To view a live theatrical performance of a Roman comedy",
    ],
    correctOptionId: "C",
    explanation: "The email states that during the reception in the Atrium, 'students may speak directly with Dr. Rossi about summer fieldwork fellowships in Italy' (C).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Fluvial Geomorphology and Canyon Formation (Q12)",
    stimulusText: CANYON_EROSION_PASSAGE,
    questionSubType: "factual",
    questionStem: "According to paragraph 1, how does tectonic uplift contribute to the carving of deep river canyons?",
    options: [
      "It slows down river currents so sediment settles gently on the floodplain.",
      "It prevents freeze-thaw cycles from affecting canyon walls.",
      "It dissolves limestone bedrock using volcanic gases.",
      "It increases the gravitational potential energy and velocity of rivers, enhancing their ability to transport abrasive sediment.",
    ],
    correctOptionId: "D",
    explanation: "Paragraph 1 explains that when a plateau rises, 'rivers flowing across its surface gain gravitational potential energy, increasing their velocity and capacity to transport abrasive sediment' (D).",
  }),

  // =========================================================================
  // READING MODULE 2 (fc8fOM_oVxQ: Powerful, Move, Across, Oceans, Warmer, Toward, Regions, Helping, Life, Survive)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Complete the Words: Ocean Currents & Marine Ecosystems (M2 Q1–10)",
    passageText:
      "[0] currents [1] vast quantities of water [2] the world's [3], carrying [4] tropical waters [5] polar [6] and [7] diverse marine [8] to [9] in extreme climates.",
    blanks: [
      { index: 0, prefix: "pow", answer: "erful" },
      { index: 1, prefix: "m", answer: "ove" },
      { index: 2, prefix: "ac", answer: "ross" },
      { index: 3, prefix: "oc", answer: "eans" },
      { index: 4, prefix: "wa", answer: "rmer" },
      { index: 5, prefix: "to", answer: "ward" },
      { index: 6, prefix: "re", answer: "gions" },
      { index: 7, prefix: "he", answer: "lping" },
      { index: 8, prefix: "li", answer: "fe" },
      { index: 9, prefix: "sur", answer: "vive" },
    ],
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Thermohaline Circulation and Global Climate (M2 Q11)",
    stimulusText: THERMOHALINE_PASSAGE,
    questionSubType: "factual",
    questionStem: "According to paragraph 2, why does surface seawater in the North Atlantic sink into the deep ocean basin?",
    options: [
      "Strong equatorial trade winds push warm water downward.",
      "Cooling by polar winds and salt left behind by sea ice formation make the water cold, salty, and dense.",
      "Underwater volcanic vents pull surface water into tectonic trenches.",
      "Freshwater from melting glaciers increases the buoyancy of surface currents.",
    ],
    correctOptionId: "B",
    explanation: "Paragraph 2 explains: 'chilly polar winds cool the surface and sea ice formation leaves dissolved salt behind, making the remaining seawater cold, salty, and dense. This dense water sinks into the deep ocean basin' (B).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Thermohaline Circulation and Global Climate (M2 Lower Q1)",
    stimulusText: THERMOHALINE_PASSAGE,
    questionSubType: "factual",
    questionStem: "What two physical properties control seawater density in thermohaline circulation?",
    options: [
      "Temperature and salinity",
      "Wind speed and wave height",
      "Sunlight and cloud cover",
      "Tidal pull and ocean depth",
    ],
    correctOptionId: "A",
    explanation: "Paragraph 1 states that thermohaline circulation is driven by 'differences in water density, which are controlled by temperature (thermo) and salinity (haline)' (A).",
  }),

  // =========================================================================
  // LISTENING MODULE 1 & MODULE 2
  // =========================================================================
  buildListeningItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Conversation — Chemistry Lab Safety Orientation (Q1)",
    transcript: `Man: What did you think of the safety orientation for our chemistry lab?
Woman: Honestly, there are so many policies and procedures. I can't say I was expecting that. It's a lot of stuff to remember.
Man: I know! Like the example the professor gave about how someone mislabeled a bottle and it caused a delay with an experiment.
Woman: Right. I don't want that to be me.
Man: Same. Our first actual lab isn't scheduled until two weeks from now. Plus, the professor published the entire safety manual on his website.
Woman: I'll be downloading it tonight and referring to it often.`,
    campusContext: "Science Building",
    questionStem: "What does the woman plan to do tonight?",
    options: [
      "Download the chemistry safety manual from the professor's website",
      "Complete her first lab experiment early",
      "Buy new safety goggles at the campus store",
      "Switch to a different science course",
    ],
    correctOptionId: "A",
    explanation: "After the man mentions that the professor published the safety manual on his website, the woman says: 'I'll be downloading it tonight and referring to it often' (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Dormitory Announcement — Quiet Hours & Laundry Machines (Q2)",
    transcript: `Narrator: Listen to an announcement in a university dormitory.
Resident Advisor: Attention residents. We have a few important reminders for you. First, please remember that quiet hours run from 11:00 p.m. to 8:00 a.m. daily. We've recently received several complaints about noise during this period. Also, we have experienced an increase in broken laundry machines lately, meaning even longer waits for an open machine. Please remember to empty your pockets and shake out everything before placing it in the wash.`,
    campusContext: "Residence Hall",
    questionStem: "Why does the speaker ask residents to empty their pockets before doing laundry?",
    options: [
      "To prevent coins and small items from breaking the laundry machines",
      "Because the dormitory is installing new card readers",
      "To reduce electricity consumption during quiet hours",
      "Because lost items cannot be claimed from the front desk",
    ],
    correctOptionId: "A",
    explanation: "The speaker explains that there has been an increase in broken laundry machines lately and asks residents to empty their pockets and shake out clothes before washing (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Astronomy Class — Lightning in the Atmosphere of Venus (M2 Q1)",
    transcript: `Narrator: Listen to a talk in an astronomy class.
Professor: Today, I've got a topic that might just electrify your imagination: lightning in the atmosphere of Venus. The Soviet Venera space missions set out to explore Venus, one of Earth's closest neighbors, and found surprising evidence of lightning in Venus's thick sulfuric-acid-laden clouds. The presence of lightning suggests that the atmosphere of Venus is more dynamic than we once assumed. Lightning plays a crucial role in atmospheric chemistry, affecting the formation of molecules and influencing weather patterns. While Venus doesn't have plant life, understanding its atmospheric processes helps scientists build climate models that can be applied to other planets, including our own.`,
    academicDomain: "Planetary Astronomy",
    questionStem: "What did the Soviet Venera space missions discover in the clouds of Venus?",
    options: [
      "Liquid water oceans beneath the cloud layer",
      "Evidence of lightning in thick sulfuric-acid clouds, indicating a dynamic atmosphere",
      "Photosynthetic microorganisms floating in the upper atmosphere",
      "Large rings of ice crystals orbiting the planet",
    ],
    correctOptionId: "B",
    explanation: "The professor states that the Venera missions found 'surprising evidence of lightning in Venus's thick sulfuric-acid-laden clouds,' showing its atmosphere is highly dynamic (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "History Class — Stalagmites & the Maya Decline (M2 Lower Q1)",
    transcript: `Narrator: Listen to a talk in a history class.
Professor: Today, let's talk about the ancient Maya civilization and explore a fascinating revelation about its decline. Recent research has brought stalagmites into the spotlight. Stalagmites—those mineral formations rising up from the floor of a cave—serve as climate records, capturing changes in precipitation over thousands of years. Scientists analyzed stalagmites from caves near the former Maya heartlands, and the data revealed a series of prolonged droughts that coincided with periods of decline for Maya society. Because the Maya were heavily dependent on agriculture, water scarcity put immense pressure on food production and social structures.`,
    academicDomain: "Ancient History & Paleoclimatology",
    questionStem: "How did cave stalagmites help historians understand the decline of the Maya civilization?",
    options: [
      "They contained ancient Mayan inscriptions carved into the stone.",
      "They served as natural climate records revealing prolonged droughts during periods of Maya decline.",
      "They blocked underground rivers from reaching Mayan cities.",
      "They were used as currency in Mayan marketplaces.",
    ],
    correctOptionId: "B",
    explanation: "The professor explains that stalagmites 'serve as climate records, capturing changes in precipitation over thousands of years' and revealed prolonged droughts coinciding with Maya decline (B).",
  }),

  // =========================================================================
  // WRITING SECTION (10 Build a Sentence + Email to Dr. Rossi + Academic Discussion from fc8fOM_oVxQ)
  // =========================================================================
  buildSentenceItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 1,
    speakerAName: "Client",
    contextPrompt: "Did the legal department finalize the agreement yet?",
    targetSentence: "Sara called to tell me she had sent the contract.",
    wordBank: [
      "to tell me",
      "Sara called",
      "the contract",
      "she had sent",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 2,
    speakerAName: "Attendee",
    contextPrompt: "Did your conference registration go through?",
    targetSentence: "No, I have yet to receive the confirmation email.",
    wordBank: [
      "I have yet",
      "No,",
      "the confirmation email",
      "to receive",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 3,
    speakerAName: "Coordinator",
    contextPrompt: "Why isn't Brian here for the rehearsal?",
    targetSentence: "He told me that his bus got stuck in traffic.",
    wordBank: ["that his bus", "He told me", "in traffic", "got stuck"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 4,
    speakerAName: "Colleague",
    contextPrompt: "The projector in the boardroom keeps flickering.",
    targetSentence: "I will ask Rebecca in IT to take a look at it.",
    wordBank: [
      "Rebecca in IT",
      "I will ask",
      "a look at it",
      "to take",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 5,
    speakerAName: "Classmate",
    contextPrompt: "What did you think of the orientation webinar?",
    targetSentence: "I thought it was a bit long, but very helpful.",
    wordBank: [
      "it was",
      "I thought",
      "but very helpful",
      "a bit long,",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 6,
    speakerAName: "Neighbor",
    contextPrompt: "Do you have any travel plans for the spring break holiday?",
    targetSentence: "I am taking my family to Rome for a week.",
    wordBank: [
      "my family",
      "I am taking",
      "for a week",
      "to Rome",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 7,
    speakerAName: "Partner",
    contextPrompt: "Have the suppliers replied to our message?",
    targetSentence: "No, which means we should call them.",
    wordBank: ["which means", "No,", "call them", "we should"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 8,
    speakerAName: "Friend",
    contextPrompt: "Were you able to see the dentist today?",
    targetSentence: "No, but I made an appointment for next week.",
    wordBank: [
      "but I made",
      "No,",
      "for next week",
      "an appointment",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 9,
    speakerAName: "Student",
    contextPrompt: "Did you read the footnote on page twelve?",
    targetSentence: "Yes, I did, but I still don't understand what it meant.",
    wordBank: [
      "but I still",
      "Yes, I did,",
      "what it meant",
      "don't understand",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 10,
    speakerAName: "Visitor",
    contextPrompt: "Where is the keynote ceremony taking place?",
    targetSentence:
      "It will be held in the main auditorium on the third floor.",
    wordBank: [
      "in the main auditorium",
      "It will be held",
      "on the third floor",
    ],
  }),
  buildWriteEmailItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    title: "Write an Email — Requesting an Expert Interview with Dr. Rossi",
    scenarioContext:
      "You are writing a research paper on Roman civilization for your university history class. As part of the assignment, you must interview an expert in Roman archaeology and include quotations from the interview in your paper.",
    recipientRole: "To: Dr. Elena Rossi | Subject: Interview Request — Roman Archaeology Research Paper",
    bulletPoints: [
      "Introduce yourself and explain the history research paper you are writing on Roman civilization.",
      "Explain why you would like to interview Dr. Rossi based on her expertise in Roman archaeology.",
      "Ask to schedule a brief interview at her convenience, either in person, online, or by email.",
    ],
    sampleAnswer: `Dear Dr. Rossi,

I hope you are doing well. My name is Samira Patel, and I am an undergraduate student writing a research paper for my History class on Roman civilization. As part of this assignment, I am required to interview an expert in Roman archaeology and include quotations from the interview in my paper.

I would be honored to interview you because of your extensive field experience and respected research on Roman urban infrastructure, which closely relates to my topic. If possible, I would be grateful to arrange a short 15-minute interview at a time convenient for you, either in person, via video call, or by email.

Thank you very much in advance for your time and consideration.

Sincerely,
Samira Patel`,
  }),
  buildAcademicDiscussionItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    title: "Writing for an Academic Discussion — Handwriting vs. Keyboard Typing in Schools",
    courseName: "Education 108: Curriculum & Instruction",
    professorName: "Dr. Alcott",
    professorPrompt:
      "As laptops and tablets become standard tools in classrooms, educators are debating how much instructional time should be devoted to teaching handwriting. Some argue that teaching cursive and print handwriting is a waste of valuable classroom time when students will type almost everything in their future careers, while others maintain that handwriting remains a vital cognitive and practical skill. What is your perspective?",
    studentPosts: [
      {
        authorName: "Mark",
        avatarSeed: "mark-saturn",
        text: "Honestly, schools should focus on keyboarding and digital literacy instead of spending hours on penmanship. In university and modern workplaces, every report, exam, and message is typed on a computer.",
      },
      {
        authorName: "Siobhan",
        avatarSeed: "siobhan-saturn",
        text: "I disagree that teaching handwriting is a waste of time. Not all classrooms or households have equal access to laptops, and writing by hand helps young children develop fine motor skills and remember concepts much better when taking notes.",
      },
    ],
    keyPointsToCover: [
      "State a clear position on whether schools should continue teaching handwriting alongside typing.",
      "Engage with Mark's or Siobhan's points about digital efficiency, equity, and cognitive retention.",
      "Provide clear supporting reasons and examples.",
    ],
    sampleAnswer: `I understand the argument that typing has become a practical and frequently used skill in modern education, and I agree with Mark that students must be proficient with keyboards. However, I do not believe that teaching handwriting is a waste of time.

Writing by hand remains an essential skill, especially in situations where technology is unavailable or impractical. As Siobhan mentioned, not all classrooms provide equal access to computers or tablets, and many in-class assessments and mathematical diagrams still require handwritten work. In addition, cognitive research consistently shows that handwriting activates sensorimotor pathways that strengthen reading acquisition, fine motor coordination, and long-term memory retention when taking lecture notes. Therefore, elementary schools should teach both fluent handwriting and keyboarding so students are fully prepared for academic and real-life situations.`,
  }),

  // =========================================================================
  // SPEAKING SECTION (7 Listen & Repeat + 4 Take an Interview from fc8fOM_oVxQ)
  // =========================================================================
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 1,
    scenarioTitle: "Domestic Shipping Desk & Packaging Station",
    sentence: "This is the domestic shipping desk.",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 2,
    scenarioTitle: "Domestic Shipping Desk & Packaging Station",
    sentence: "Please fill out a shipping form here.",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 3,
    scenarioTitle: "Domestic Shipping Desk & Packaging Station",
    sentence: "Next, go to our packaging station and choose a box.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 4,
    scenarioTitle: "Domestic Shipping Desk & Packaging Station",
    sentence: "Place your items in the box, and tape it shut securely.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 5,
    scenarioTitle: "Domestic Shipping Desk & Packaging Station",
    sentence: "Take a number and wait for it to be displayed on the screen.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 6,
    scenarioTitle: "Domestic Shipping Desk & Packaging Station",
    sentence:
      "You may have a seat here while you wait for your turn at the counter.",
    responseSeconds: 11,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 7,
    scenarioTitle: "Domestic Shipping Desk & Packaging Station",
    sentence:
      "I will weigh your package on this scale, and then we can print out your shipping label.",
    responseSeconds: 12,
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 1,
    interviewTopic: "Five-Year Academic & Career Goals",
    questionText:
      "Welcome to our career and education interview. First, what is your main academic or professional goal for the next five years?",
    expectedKeyPhrases: ["five years", "study abroad", "graduate degree", "scholarship", "career"],
    sampleAnswer:
      "Within the next five years, my main goal is to complete a master's degree in computer science at a leading international university in the United States or Europe and then work as an artificial intelligence researcher.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 2,
    interviewTopic: "Five-Year Academic & Career Goals",
    questionText:
      "Why have you chosen this goal, and what steps are you currently taking to prepare for it?",
    expectedKeyPhrases: ["preparing", "TOEFL", "research", "global perspective", "skills"],
    sampleAnswer:
      "I chose this goal because studying in an international research environment will expose me to cutting-edge laboratories and diverse perspectives. Right now, I am preparing for the TOEFL exam, working as an undergraduate research assistant, and preparing my scholarship applications.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 3,
    interviewTopic: "Five-Year Academic & Career Goals",
    questionText:
      "Many students choose to pursue higher education in a foreign country. What do you think are the biggest advantages and challenges of studying abroad?",
    expectedKeyPhrases: ["independence", "cultural", "language barrier", "network", "adapt"],
    sampleAnswer:
      "The biggest advantages of studying abroad are gaining cross-cultural adaptability, building a global professional network, and becoming fluent in another language. The main challenges are adjusting to a new academic system and managing homesickness, which teaches resilience and independence.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: SATURN_BLUEPRINT_ID,
    questionNumber: 4,
    interviewTopic: "Five-Year Academic & Career Goals",
    questionText:
      "Finally, do you think universities should focus more on practical job training or broad academic knowledge to prepare students for the future?",
    expectedKeyPhrases: ["practical", "critical thinking", "combination", "internships", "adaptable"],
    sampleAnswer:
      "I believe universities should combine strong foundational theory with practical job training such as co-op internships. Specific software tools change every few years, so students need broad critical thinking skills to adapt, alongside hands-on project experience to succeed in their first job.",
  }),
];

export const SATURN_BLUEPRINT: SeedBlueprintRow = {
  id: SATURN_BLUEPRINT_ID,
  title: "Saturn | Full Test",
  slug: "saturn-full-test-2026",
  description:
    "Official TOEFL iBT 2026 TestGlider Mock Exam #5 (Saturn — Video fc8fOM_oVxQ). Features Adaptive Reading (Canyon Erosion, Roman Engineering Lecture, Thermohaline Ocean Currents), Listening (Lab Safety Orientation, Dormitory Reminders, Lightning on Venus, Mayan Stalagmites), Writing (10 Build a Sentence, Email to Dr. Rossi, Handwriting vs. Typing Discussion), and Speaking (Domestic Shipping Desk & Five-Year Goals Interview).",
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
        questionCount: 4,
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
    planetName: "Saturn",
    videoUrl: "https://youtu.be/fc8fOM_oVxQ",
    videoId: "fc8fOM_oVxQ",
    playlistUrl:
      "https://youtube.com/playlist?list=PLoDNaUsnugSqgJGJKo59X49nkQbwcksMV",
    difficultyLabel: "Standard 2026 Adaptive",
  },
  is_Published: true,
  created_At: "2026-09-05T10:00:00.000Z",
};
