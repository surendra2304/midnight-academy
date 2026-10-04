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

export const VENUS_BLUEPRINT_ID = "f2000000-0000-4000-8000-000000000003";

const LIBRARY_BOOKING_EMAIL = `To: All Graduate & Undergraduate Students
From: University Library Services (rooms@library.edu)
Subject: Updated Group Study Room Reservation Policy

Beginning next Monday, the main library is launching a new online reservation portal for all 24 collaborative study rooms on the second and third floors.

Key Guidelines:
• Students may reserve a room for up to 2 hours per day, up to 7 days in advance.
• A minimum of 2 students must check in at the front desk within 15 minutes of the reservation start time; otherwise, the booking will be automatically canceled and released to waiting students.
• Food is strictly prohibited inside the study rooms, though covered beverages are permitted.`;

const RENAISSANCE_PRINTING_PASSAGE = `The introduction of movable metal type printing to Europe by Johannes Gutenberg in the mid-fifteenth century revolutionized the production and circulation of knowledge. Prior to the invention of the mechanical printing press in Mainz, Germany, books were painstakingly copied by hand in monastic scriptoria and urban workshops. Because a single illuminated manuscript could require months of labor by skilled scribes and parchment makers, books remained rare luxury items accessible primarily to royalty, high-ranking clergy, and wealthy patrons.

Gutenberg's innovation combined several existing technologies into an integrated manufacturing system: durable metal alloy type molds, an oil-based printing ink that adhered evenly to metal surfaces, and a wooden screw press adapted from agricultural wine and olive presses. Within five decades of the publication of the Gutenberg Bible around 1455, printing workshops had been established in more than two hundred European cities, producing an estimated twenty million volumes known as incunabula.

The rapid proliferation of affordable printed texts had far-reaching intellectual and social consequences. Standardized editions of classical Greek and Roman treatises fueled the Renaissance humanist movement, while vernacular translations of literature and religious texts encouraged rising literacy rates among urban merchants and artisans. Furthermore, scientists could share empirical diagrams and mathematical tables without the copying errors that had plagued handwritten manuscripts, laying the groundwork for the Scientific Revolution.`;

const GEOTHERMAL_PASSAGE = `Geothermal energy harnesses the natural heat stored within the Earth's crust—thermal energy generated both by the primordial formation of the planet and by the continuous radioactive decay of isotopes such as uranium, thorium, and potassium. Unlike solar and wind power, which fluctuate with weather conditions and daylight cycles, geothermal power plants provide a stable, continuous baseload electricity supply twenty-four hours a day.

In conventional hydrothermal systems, wells are drilled up to three kilometers deep into subterranean reservoirs of superheated water and steam located near tectonic plate boundaries. When this pressurized fluid reaches the surface, the steam drives turbines connected to electrical generators before the cooled water is reinjected into the reservoir to sustain pressure and thermal output. More recently, engineers have developed Enhanced Geothermal Systems (EGS), which create artificial underground heat exchangers by circulating water through hot, dry crystalline rock formations in regions that lack natural hydrothermal aquifers.`;

const SOCIAL_CAPITAL_TRANSCRIPT = `Narrator: Listen to a talk in a sociology class.
Professor: Today, we'll explore the concept of social capital. In business, capital refers to a financial resource or asset—something valuable that can be used. In sociology, social capital refers to the human networks, relationships, and norms that facilitate collective action within a community. So they also act like a kind of asset. Think about how trust and cooperation emerge among people and how these bonds can enhance economic and social outcomes. Take the city of Boston's community policing: officers don't just patrol, they engage with residents, earning trust and cooperation and reducing crime. Now, think about disaster response, like recent hurricanes. Mutual aid groups mobilized fast, organizing shelters, food, and medical aid, often reaching those in need before official relief arrived. Social capital isn't abstract—it's action, resilience, and real-world impact. And social capital isn't just about local communities; it can extend to professional networks as well. In the business world, social capital is vital for career advancement and organizational success. Networking events and collaborative projects help individuals build relationships that can lead to new opportunities and innovations. However, social capital can also have downsides. Excessive bonding within a group can lead to exclusion of outsiders—a kind of "us and them" mentality. It's important to balance strong internal networks with openness to external connections to avoid these pitfalls.`;

const CUBISM_TRANSCRIPT = `Narrator: Listen to a talk on an art podcast.
Host: Today, we'll dive into the world of Cubism, an innovative art movement that revolutionized the way we perceive and represent reality. Cubism emerged in the early twentieth century, spearheaded by artists like Pablo Picasso and Georges Braque. Unlike traditional art, which aimed to depict subjects from a single viewpoint, Cubism fragmented objects into geometric shapes and presented multiple angles simultaneously. This technique challenged conventional perspectives and provided a more dynamic and complex representation of the subject matter. One of the most iconic works of Cubism is Picasso's painting Les Demoiselles d'Avignon, or The Young Ladies of Avignon in English. It was revolutionary, breaking away from realism with distorted figures and jagged geometric shapes. Cubism can be divided into two phases: Analytical Cubism and Synthetic Cubism. Analytical Cubism focused on deconstructing objects into basic geometric forms and muted colors, whereas Synthetic Cubism introduced brighter colors and collage techniques, integrating different materials like newspapers and fabric into the artwork. The impact of Cubism extended beyond visual arts, influencing literature, architecture, and even music.`;

const SYNESTHESIA_TRANSCRIPT = `Narrator: Listen to a talk on a podcast about music.
Host: Today, let's explore the fascinating world of synesthesia, a condition where one sensory experience involuntarily triggers another. This phenomenon is particularly intriguing in the realm of music, where certain individuals can see sounds or taste music. Synesthetic experiences vary widely among individuals. For example, some might perceive specific colors when hearing particular musical notes or chords—a person might see red when they hear a C note or blue when they hear a G note. This blending of senses can enhance their emotional connection to the music and even influence their creative processes. A number of famous musicians, such as Duke Ellington, have reported experiencing synesthesia, which they claim helps them in composing and performing music. Neurologists theorize that synesthesia stems from heightened neural connections between sensory regions, allowing stimulation of one sense to trigger involuntary experiences with another. Though uncommon, it offers profound insight into perception and the mechanisms underlying sensory integration.`;

let idx = 1;
const nextId = () => makeItemId(3, idx++);

export const VENUS_ITEMS: SeedQuestionItemRow[] = [
  // =========================================================================
  // READING MODULE 1 (uBBSiFNUemM)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Plant Pollination and Photosynthesis (Q1–10)",
    passageText:
      "Flowering [0] rely on a complex [1] of biological interactions to reproduce and survive. By [2] nectar and vibrant petals, they attract insects that support seed [3] through cross-[4]. Different insect [5] are drawn to specific [6] shapes and scents, ensuring that [7] transfer pollen efficiently across a [8] geographic area while plants harness [9] for energy.",
    blanks: [
      { index: 0, prefix: "pla", answer: "nts" },
      { index: 1, prefix: "pro", answer: "cess" },
      { index: 2, prefix: "for", answer: "ming" },
      { index: 3, prefix: "gro", answer: "wth" },
      { index: 4, prefix: "polli", answer: "nation" },
      { index: 5, prefix: "spe", answer: "cies" },
      { index: 6, prefix: "flo", answer: "wer" },
      { index: 7, prefix: "th", answer: "ey" },
      { index: 8, prefix: "spec", answer: "ific" },
      { index: 9, prefix: "sunli", answer: "ght" },
    ],
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Read in Daily Life: Group Study Room Reservation Policy (Q11)",
    formatType: "email",
    senderName: "University Library Services",
    senderHandle: "rooms@library.edu",
    subject: "Updated Group Study Room Reservation Policy",
    dateLabel: "Friday, 1:30 PM",
    stimulusText: LIBRARY_BOOKING_EMAIL,
    questionStem: "What happens if students do not check in at the front desk within 15 minutes of their reservation start time?",
    options: [
      "Their booking is automatically canceled and released to waiting students.",
      "They are charged a ten-dollar late fee on their student account.",
      "Their reservation is shortened to thirty minutes.",
      "They are barred from using the library for one month.",
    ],
    correctOptionId: "A",
    explanation: "The second guideline states that if a minimum of 2 students do not check in within 15 minutes, 'the booking will be automatically canceled and released to waiting students' (A).",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Read in Daily Life: Group Study Room Reservation Policy (Q12)",
    formatType: "email",
    senderName: "University Library Services",
    senderHandle: "rooms@library.edu",
    subject: "Updated Group Study Room Reservation Policy",
    dateLabel: "Friday, 1:30 PM",
    stimulusText: LIBRARY_BOOKING_EMAIL,
    questionStem: "What is the maximum duration a student group may reserve a study room per day?",
    options: ["1 hour", "90 minutes", "2 hours", "4 hours"],
    correctOptionId: "C",
    explanation: "The first bullet states: 'Students may reserve a room for up to 2 hours per day, up to 7 days in advance' (C).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "The Rise of Printed Books in Renaissance Europe (Q13)",
    stimulusText: RENAISSANCE_PRINTING_PASSAGE,
    questionSubType: "factual",
    questionStem: "According to paragraph 1, why were books rare luxury items in Europe prior to the mid-fifteenth century?",
    options: [
      "They had to be painstakingly copied by hand by skilled scribes and parchment makers.",
      "Paper and parchment were illegal to import into European cities.",
      "Only Greek and Roman Emperors were permitted to learn how to read.",
      "Monasteries destroyed manuscripts after reading them once.",
    ],
    correctOptionId: "A",
    explanation: "Paragraph 1 explains that books were copied by hand in monastic scriptoria and urban workshops, requiring months of labor (A).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "The Rise of Printed Books in Renaissance Europe (Q14)",
    stimulusText: RENAISSANCE_PRINTING_PASSAGE,
    questionSubType: "factual",
    questionStem: "According to paragraph 3, how did the printing press contribute to the Scientific Revolution?",
    options: [
      "It allowed scientists to share empirical diagrams and mathematical tables without copying errors.",
      "It replaced Latin with German as the sole language of mathematics.",
      "It funded university astronomy laboratories through book taxes.",
      "It eliminated the study of classical Greek and Roman treatises.",
    ],
    correctOptionId: "A",
    explanation: "Paragraph 3 states that 'scientists could share empirical diagrams and mathematical tables without the copying errors that had plagued handwritten manuscripts, laying the groundwork for the Scientific Revolution' (A).",
  }),

  // =========================================================================
  // READING MODULE 2 (uBBSiFNUemM: cludes, as, cation, grams, cies, at, fe, ments, essionals, tify)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Complete the Words: Public Health & Preventive Medicine (M2 Q1–10)",
    passageText:
      "Modern public health [0] a wide range of initiatives, such [1] community health [2] and immunization [3]. Public health [4] work tirelessly [5] the local and global levels to keep drinking water [6] and monitor environmental [7]. Healthcare [8] also analyze epidemiological data to [9] emerging disease outbreaks before they spread.",
    blanks: [
      { index: 0, prefix: "in", answer: "cludes" },
      { index: 1, prefix: "", answer: "as" },
      { index: 2, prefix: "edu", answer: "cation" },
      { index: 3, prefix: "pro", answer: "grams" },
      { index: 4, prefix: "agen", answer: "cies" },
      { index: 5, prefix: "", answer: "at" },
      { index: 6, prefix: "sa", answer: "fe" },
      { index: 7, prefix: "ele", answer: "ments" },
      { index: 8, prefix: "prof", answer: "essionals" },
      { index: 9, prefix: "iden", answer: "tify" },
    ],
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Geothermal Energy Systems (M2 Q11)",
    stimulusText: GEOTHERMAL_PASSAGE,
    questionSubType: "factual",
    questionStem: "According to paragraph 1, what is a key advantage of geothermal energy over solar and wind power?",
    options: [
      "It requires no drilling or underground equipment.",
      "It generates electricity only during peak afternoon hours.",
      "It can be installed on residential rooftops.",
      "It provides a stable, continuous baseload electricity supply regardless of weather or daylight.",
    ],
    correctOptionId: "D",
    explanation: "Paragraph 1 states that unlike solar and wind power, 'geothermal power plants provide a stable, continuous baseload electricity supply twenty-four hours a day' (D).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Geothermal Energy Systems (M2 Lower Q1)",
    stimulusText: GEOTHERMAL_PASSAGE,
    questionSubType: "factual",
    questionStem: "According to paragraph 2, why is cooled water reinjected into the underground reservoir in hydrothermal plants?",
    options: [
      "To sustain reservoir pressure and thermal output",
      "To freeze surrounding volcanic magma",
      "To irrigate nearby farmland",
      "To clean the blades of wind turbines",
    ],
    correctOptionId: "A",
    explanation: "Paragraph 2 states that 'the cooled water is reinjected into the reservoir to sustain pressure and thermal output' (A).",
  }),

  // =========================================================================
  // LISTENING MODULE 1 (Exact transcripts from uBBSiFNUemM)
  // =========================================================================
  buildListeningItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "University Event Announcement — Annual Job Fair (Q1)",
    transcript: `Narrator: Listen to an announcement at a university event.
Speaker: Attention everyone. We are excited to announce that the university's annual job fair will take place next Wednesday from 10:00 a.m. to 4:00 p.m. in the main hall. This is a great opportunity to meet potential employers and explore career options. We hope to see you there.`,
    campusContext: "Main Hall",
    questionStem: "When will the university's annual job fair take place?",
    options: [
      "Next Wednesday from 10:00 a.m. to 4:00 p.m.",
      "This Friday at 6:00 p.m.",
      "Tomorrow morning at 8:00 a.m.",
      "Next Saturday afternoon",
    ],
    correctOptionId: "A",
    explanation: "The announcer states that the job fair will take place 'next Wednesday from 10:00 a.m. to 4:00 p.m. in the main hall' (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Club Meeting Announcement — Charity Bake Sale (Q2)",
    transcript: `Narrator: Listen to an announcement at a university club meeting.
Speaker: Welcome everyone. Today we'll be discussing the schedule for our upcoming fundraiser event. We'll be hosting a charity bake sale next Friday in the student center. All proceeds will go to local food banks. We hope you all can participate and make a difference.`,
    campusContext: "Student Center",
    questionStem: "What organization will receive the proceeds from the club's bake sale?",
    options: [
      "The university athletic department",
      "Local food banks",
      "The campus radio station",
      "An international study-abroad fund",
    ],
    correctOptionId: "B",
    explanation: "The speaker states: 'All proceeds will go to local food banks' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Sociology Class — Social Capital (Q3)",
    transcript: SOCIAL_CAPITAL_TRANSCRIPT,
    academicDomain: "Sociology",
    questionStem: "Why does the professor mention Boston's community policing and hurricane mutual aid groups?",
    options: [
      "To argue that government emergency agencies are no longer needed",
      "To provide real-world examples of how social capital builds trust, cooperation, and community resilience",
      "To compare urban crime rates with rural weather patterns",
      "To explain how police officers are trained at the university",
    ],
    correctOptionId: "B",
    explanation: "The professor uses Boston's community policing and hurricane mutual aid groups to illustrate how social capital produces real-world trust, cooperation, and resilience (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Sociology Class — Social Capital (Q4)",
    transcript: SOCIAL_CAPITAL_TRANSCRIPT,
    academicDomain: "Sociology",
    questionStem: "According to the professor, what is a potential downside of excessive bonding within a group?",
    options: [
      "It reduces cooperation among members of the same group.",
      "It can lead to the exclusion of outsiders and an 'us and them' mentality.",
      "It prevents employees from attending networking events.",
      "It lowers financial capital in the banking sector.",
    ],
    correctOptionId: "B",
    explanation: "The professor warns: 'Excessive bonding within a group can lead to exclusion of outsiders, a kind of us and them mentality' (B).",
  }),

  // =========================================================================
  // LISTENING MODULE 2 (Exact transcripts from uBBSiFNUemM)
  // =========================================================================
  buildListeningItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    taskType: "listen_choose_response",
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Listen and Choose a Response — Reception Clean-Up (M2 Q1)",
    transcript: "Woman: Do you need help cleaning up after the reception tomorrow?",
    questionStem: "Choose the best response to what you heard.",
    options: [
      "That would be wonderful—thank you so much for offering!",
      "The reception started an hour ago.",
      "Yes, the phone reception is very clear here.",
      "No, I didn't attend the lecture yesterday.",
    ],
    correctOptionId: "A",
    explanation: "Thanking the speaker for offering to help is the direct and natural response (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Conversation — Library Maintenance & East Wing (M2 Q2)",
    transcript: `Man: Hi Anna, do you happen to know whether the library is staying open late tonight? I heard there might be a schedule change due to the maintenance work.
Woman: Actually, yes. It's still open until 10:00 p.m. on weekdays, even during the renovations. They've just relocated the study areas to the east wing temporarily.
Man: That's a relief. I've got a big exam tomorrow, and I really need a quiet place to focus. My apartment's been too noisy lately.
Woman: I get that. Just make sure you pace yourself. Take breaks so you don't burn out. Studying non-stop can backfire.`,
    campusContext: "Campus Library",
    questionStem: "How has the maintenance work affected the library?",
    options: [
      "The library now closes at 5:00 p.m. on weekdays.",
      "The study areas have been temporarily relocated to the east wing, while hours remain until 10:00 p.m.",
      "Only graduate students are allowed to enter the building.",
      "All quiet study areas have been moved to the cafeteria.",
    ],
    correctOptionId: "B",
    explanation: "Anna states: 'It's still open until 10:00 p.m. on weekdays, even during the renovations. They've just relocated the study areas to the east wing temporarily' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Conversation — Dropping Internet Connection (M2 Q3)",
    transcript: `Woman: I'm having trouble with my internet connection. It keeps dropping every few minutes.
Man: That's frustrating. Have you contacted your service provider?
Woman: Yes, I called them this morning. They said they'd send a technician out tomorrow.
Man: Hopefully, they can fix it quickly.
Woman: I hope so. I have an important video conference scheduled for tomorrow afternoon.
Man: Make sure to let them know about that. Maybe they can prioritize your request.`,
    campusContext: "Off-Campus Apartment",
    questionStem: "What does the man suggest the woman do?",
    options: [
      "Buy a new laptop before tomorrow afternoon",
      "Cancel her video conference immediately",
      "Inform the service provider about her important video conference so they might prioritize her repair",
      "Switch to a different internet company next month",
    ],
    correctOptionId: "C",
    explanation: "The man advises: 'Make sure to let them know about that. Maybe they can prioritize your request' (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Art Podcast — Analytical vs. Synthetic Cubism (M2 Q4)",
    transcript: CUBISM_TRANSCRIPT,
    academicDomain: "Art History",
    questionStem: "According to the speaker, how did Synthetic Cubism differ from Analytical Cubism?",
    options: [
      "Synthetic Cubism returned to traditional single-viewpoint Renaissance perspective.",
      "Synthetic Cubism introduced brighter colors and collage techniques using materials like newspapers and fabric.",
      "Synthetic Cubism used only marble sculptures instead of paintings.",
      "Synthetic Cubism was practiced exclusively in nineteenth-century Italy.",
    ],
    correctOptionId: "B",
    explanation: "The speaker states: 'Analytical Cubism focused on deconstructing objects into basic geometric forms and muted colors, whereas Synthetic Cubism introduced brighter colors and collage techniques, integrating different materials like newspapers and fabric into the artwork' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Music Podcast — Synesthesia in Music (M2 Lower Q1)",
    transcript: SYNESTHESIA_TRANSCRIPT,
    academicDomain: "Neuroscience & Music",
    questionStem: "What do neurologists theorize is the cause of synesthesia?",
    options: [
      "Years of formal training in classical music theory",
      "Heightened neural connections between sensory regions in the brain",
      "Listening to music at excessively high volumes",
      "A lack of color receptors in the retina",
    ],
    correctOptionId: "B",
    explanation: "The podcast host explains: 'Neurologists theorize that synesthesia stems from heightened neural connections between sensory regions, allowing stimulation of one sense to trigger involuntary experiences with another' (B).",
  }),

  // =========================================================================
  // WRITING SECTION (10 Build a Sentence + Email to Dr. Jones + Academic Discussion from uBBSiFNUemM)
  // =========================================================================
  buildSentenceItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 1,
    speakerAName: "Marcus",
    contextPrompt: "His explanation during the meeting was really confusing.",
    targetSentence: "I did not understand what he said either.",
    wordBank: ["what he said", "I did not", "either", "understand"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 2,
    speakerAName: "Elena",
    contextPrompt: "Excuse me, I'm looking for encyclopedias and dictionaries.",
    targetSentence: "Do you know where I can find the reference section?",
    wordBank: ["where I can", "Do you know", "the reference section", "find"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 3,
    speakerAName: "David",
    contextPrompt: "How did your manuscript peer review go?",
    targetSentence:
      "The feedback that the reviewers gave me was very constructive.",
    wordBank: [
      "that the reviewers",
      "The feedback",
      "was very constructive",
      "gave me",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 4,
    speakerAName: "Sophia",
    contextPrompt: "I'd love to see the symphony concert this Friday.",
    targetSentence: "Can you tell me how much the tickets cost?",
    wordBank: ["how much", "Can you tell me", "cost", "the tickets"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 5,
    speakerAName: "Daniel",
    contextPrompt: "Everyone just left the conference room.",
    targetSentence: "Could you tell me why the meeting was canceled?",
    wordBank: ["why", "Could you tell me", "was canceled", "the meeting"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 6,
    speakerAName: "Olivia",
    contextPrompt: "Course registration opens tomorrow morning.",
    targetSentence:
      "I have not decided what classes I will take next semester.",
    wordBank: [
      "what classes",
      "I have not decided",
      "next semester",
      "I will take",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 7,
    speakerAName: "Lucas",
    contextPrompt: "Did Sarah call you about the volunteer shift?",
    targetSentence: "She asked me whether I would be available this weekend.",
    wordBank: [
      "whether",
      "She asked me",
      "this weekend",
      "I would be available",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 8,
    speakerAName: "Emma",
    contextPrompt: "Why are you at the computer repair shop?",
    targetSentence:
      "The laptop that I bought last week is already having issues.",
    wordBank: [
      "that I bought",
      "The laptop",
      "is already having issues",
      "last week",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 9,
    speakerAName: "Ryan",
    contextPrompt: "I'm working on my summer fellowship essay.",
    targetSentence: "Do you remember when the application deadline is?",
    wordBank: ["when", "Do you remember", "deadline is", "the application"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 10,
    speakerAName: "Grace",
    contextPrompt: "The department chair stopped by our lab earlier.",
    targetSentence: "He wants to know who is responsible for the project.",
    wordBank: [
      "who is",
      "He wants to know",
      "for the project",
      "responsible",
    ],
  }),
  buildWriteEmailItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    title: "Write an Email — Research Project Deadline Extension Request",
    scenarioContext:
      "You are enrolled in Dr. Jones's Environmental Chemistry course, and your final research project report is due this Friday. Yesterday, the spectrometer in the laboratory malfunctioned, delaying your final sample analysis by two days.",
    recipientRole: "To: Dr. Jones | Subject: Request for Research Project Extension",
    bulletPoints: [
      "Explain the laboratory equipment malfunction that delayed your final data collection.",
      "Summarize the sections of the research project you have already completed.",
      "Politely request a three-day extension until Monday to submit the finished report.",
    ],
    sampleAnswer: `Dear Dr. Jones,

I hope this email finds you well. I am writing regarding the final research project for our Environmental Chemistry course, which is currently scheduled for submission this Friday.

I have already completed the literature review, methodology section, and initial water sample analyses. However, yesterday afternoon the UV-Vis spectrometer in Lab 204 experienced a calibration failure, and the technician informed me that repairs will not be finished until Thursday morning. Because I need to run my final three control samples before completing the results discussion, this unexpected equipment outage has delayed my analysis.

Would it be possible to receive a three-day extension to submit my completed report by Monday at 5:00 PM? I would be happy to share my current draft and raw data tables with you in the meantime.

Thank you very much for your time and understanding.

Sincerely,
Jordan`,
  }),
  buildAcademicDiscussionItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    title: "Writing for an Academic Discussion — Participant Observation in Anthropology",
    courseName: "Anthropology 210: Fieldwork Methods",
    professorName: "Dr. Vance",
    professorPrompt:
      "When cultural anthropologists conduct fieldwork in unfamiliar communities, they must decide how closely to involve themselves in daily life. Some scholars argue that anthropologists should actively participate in local customs and rituals to gain an authentic insider perspective, while others believe researchers should remain detached observers to preserve scientific objectivity. Which approach do you think produces more reliable anthropological insights?",
    studentPosts: [
      {
        authorName: "Andrew",
        avatarSeed: "andrew-venus",
        text: "I believe anthropologists should actively participate in the rituals and daily practices of the communities they study. You cannot truly understand the emotional and social meaning of a tradition just by watching from the sidelines with a notebook.",
      },
      {
        authorName: "Kelly",
        avatarSeed: "kelly-venus",
        text: "I disagree with Andrew. If researchers get too personally involved in local ceremonies, they risk losing their objectivity and might unintentionally alter the behavior of the people they are studying. Careful, respectful observation from a distance is more scientific.",
      },
    ],
    keyPointsToCover: [
      "Take a clear stance on active participation vs. detached observation in anthropological fieldwork.",
      "Engage with Andrew's and/or Kelly's viewpoints with specific reasoning.",
      "Demonstrate academic writing control and clear paragraph cohesion.",
    ],
    sampleAnswer: `While Kelly raises a valid concern about maintaining scientific objectivity, I agree with Andrew that respectful participant observation yields far deeper and more accurate anthropological insights than detached observation alone.

Human culture is not merely a sequence of external actions; it is rooted in shared meanings, emotions, and social trust. When an anthropologist remains an aloof outsider, community members often feel self-conscious and modify their behavior, which actually distorts the researcher's observations. By participating respectfully in everyday routines and community ceremonies—when invited by local hosts—researchers build mutual trust and gain firsthand understanding of why certain norms matter. As long as anthropologists pair this active engagement with rigorous reflective field notes and peer review, they can capture authentic insider perspectives without sacrificing analytical rigor.`,
  }),

  // =========================================================================
  // SPEAKING SECTION (7 Listen & Repeat + 4 Take an Interview from uBBSiFNUemM)
  // =========================================================================
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 1,
    scenarioTitle: "Community Center Visitor Orientation",
    sentence: "Welcome to the community center.",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 2,
    scenarioTitle: "Community Center Visitor Orientation",
    sentence: "Go to the information desk for help.",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 3,
    scenarioTitle: "Community Center Visitor Orientation",
    sentence: "The activity rooms hold various classes daily.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 4,
    scenarioTitle: "Community Center Visitor Orientation",
    sentence: "The gym is where our popular fitness programs are held.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 5,
    scenarioTitle: "Community Center Visitor Orientation",
    sentence: "We recommend a visit to the cafe for a snack or drink.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 6,
    scenarioTitle: "Community Center Visitor Orientation",
    sentence:
      "We have a notice board for updates on community events and important announcements.",
    responseSeconds: 12,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 7,
    scenarioTitle: "Community Center Visitor Orientation",
    sentence:
      "If you're interested in learning more about our new courses, pick up a free flyer.",
    responseSeconds: 12,
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 1,
    interviewTopic: "Dietary Habits Research Study",
    questionText:
      "Thank you for your participation. Today, I'd like to ask you some questions about your dietary habits. When you have a meal at school or work, do you prefer to bring homemade food or buy food from a cafeteria or restaurant? Why?",
    expectedKeyPhrases: ["homemade", "healthy", "budget", "ingredients", "prepare"],
    sampleAnswer:
      "When I have a meal at university or work, I generally prefer to bring homemade food rather than buying lunch at a cafeteria. Preparing meals at home lets me control the ingredients and portion sizes, saves a significant amount of money each week, and avoids long lunchtime queues.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 2,
    interviewTopic: "Dietary Habits Research Study",
    questionText:
      "I understand. When choosing what to eat, do you prioritize convenience and taste, or do you focus more on nutritional value? Please explain.",
    expectedKeyPhrases: ["nutrition", "balance", "energy", "vegetables", "focus"],
    sampleAnswer:
      "I try to prioritize nutritional value while still making sure the food tastes good. During busy exam weeks, eating balanced meals with whole grains, lean protein, and vegetables keeps my energy levels steady throughout the afternoon, whereas sugary convenience foods make me feel tired.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 3,
    interviewTopic: "Dietary Habits Research Study",
    questionText:
      "Interesting perspective. In many countries, fast food and processed meals have become increasingly common. What do you think are the main reasons for this trend?",
    expectedKeyPhrases: ["fast food", "schedule", "delivery", "affordable", "marketing"],
    sampleAnswer:
      "I think the rise in fast food and processed meals is mainly driven by long work hours, urban commuting, and the convenience of smartphone delivery apps. Many families feel they lack the time to cook from scratch every evening, and heavily marketed processed foods are often quick and inexpensive.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: VENUS_BLUEPRINT_ID,
    questionNumber: 4,
    interviewTopic: "Dietary Habits Research Study",
    questionText:
      "Finally, some people believe governments should place higher taxes on sugary drinks and unhealthy snacks to improve public health. Do you agree or disagree with this approach? Why?",
    expectedKeyPhrases: ["taxes", "public health", "subsidize", "fresh produce", "education"],
    sampleAnswer:
      "I agree with placing moderate taxes on sugary drinks, provided the revenue is used to subsidize fresh fruits and vegetables and fund nutrition education. A tax alone can burden lower-income households unless healthier alternatives are made equally affordable and accessible.",
  }),
];

export const VENUS_BLUEPRINT: SeedBlueprintRow = {
  id: VENUS_BLUEPRINT_ID,
  title: "Venus | Full Test",
  slug: "venus-full-test-2026",
  description:
    "Official TOEFL iBT 2026 TestGlider Mock Exam #3 (Venus — Video uBBSiFNUemM). Features Adaptive Reading (Plant Pollination, Study Room Policy, Renaissance Printing Press, Public Health, Geothermal Energy), Listening (Job Fair, Charity Bake Sale, Social Capital, Cubism, Synesthesia in Music), Writing (10 Build a Sentence, Email to Dr. Jones, Anthropology Fieldwork Discussion), and Speaking (Community Center Tour & Dietary Habits Interview).",
  exam_Type: "full_mock",
  total_Duration_Seconds: 5160,
  blueprint_Json: {
    sections: [
      {
        section: "reading",
        order: 1,
        durationSeconds: 1620,
        moduleCount: 2,
        questionCount: 8,
        isAdaptive: true,
      },
      {
        section: "listening",
        order: 2,
        durationSeconds: 1560,
        moduleCount: 2,
        questionCount: 9,
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
    planetName: "Venus",
    videoUrl: "https://youtu.be/uBBSiFNUemM",
    videoId: "uBBSiFNUemM",
    playlistUrl:
      "https://youtube.com/playlist?list=PLoDNaUsnugSqgJGJKo59X49nkQbwcksMV",
    difficultyLabel: "Standard 2026 Adaptive",
  },
  is_Published: true,
  created_At: "2026-09-03T10:00:00.000Z",
};
