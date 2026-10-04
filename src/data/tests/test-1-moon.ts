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

export const MOON_BLUEPRINT_ID = "f2000000-0000-4000-8000-000000000000";

const JOB_EMAIL_STIMULUS = `Dear Ms. Smith,

I hope this email finds you well. I am writing to follow up on my application for the Marketing Coordinator position at your company, which I submitted last week. I am very enthusiastic about the opportunity to join your team and contribute to your upcoming campaigns.

Could you please let me know if there are any updates regarding the status of my application? I would be happy to provide any additional information or references if needed. Thank you for your time and consideration.

Best regards,
John Doe`;

const WEBINAR_EMAIL_STIMULUS = `Dear Alex,

Thank you for subscribing to our newsletter! We are excited to bring you the latest updates and insights from our industry.

As a subscriber, you will receive exclusive access to our upcoming webinar on digital marketing strategies, scheduled for next Wednesday at 3 PM. To join the webinar, simply click the registration link below and fill out the form.

We look forward to your active participation and hope you find the session informative and engaging.

Best regards,
Marketing Team
Tech Solutions`;

const TEXT_CHAIN_STIMULUS = `Mark Jenkins (10:00 AM): Hey team, just a quick reminder that our project presentation is tomorrow at 10 AM. Let's make sure everything is ready.

Convene (10:03 AM): Thanks, Mark. I've finalized the slides for my section and sent them to you. Did you get them?

Mark Jenkins (10:05 AM): Yes, I got them. They look great. Sam, how's your part coming along?

Sam Abrams (10:07 AM): Almost done! Just need to add a few more data points. I'll send them over by noon.

Mary Hiller (10:10 AM): I've reviewed the whole presentation and made some minor edits for consistency. Let's do a quick run-through at 3 PM today. Does that work for everyone?

Convene (10:12 AM): Works for me!

Sam Abrams (10:13 AM): Same here. See you all at 3 PM.`;

const POWER_OF_MUSIC_PASSAGE = `Music has been an integral part of human culture for millennia, serving not only as a form of entertainment but also as a powerful medium for emotional expression, social cohesion, and cognitive development. Across diverse civilizations, rhythmic and melodic traditions have accompanied ceremonial rituals, storytelling, and communal labor, suggesting that the capacity to appreciate and produce music is deeply embedded in human evolutionary history.

Modern neuroscientific research has revealed that listening to and performing music engages a widespread network of brain regions involved in auditory processing, motor control, executive function, and emotional regulation. When individuals learn to play a musical instrument, their brains undergo structural and functional changes known as neuroplasticity. Studies comparing trained musicians with non-musicians consistently demonstrate enhanced neural connectivity in the corpus callosum, as well as heightened verbal memory and spatial-temporal reasoning skills.

Beyond its cognitive benefits, music exerts a profound influence on physiological and psychological well-being. Clinical interventions utilizing music therapy have proven effective in reducing cortisol levels, alleviating chronic pain, and supporting emotional recovery in patients with neurological disorders. Even passive listening to familiar melodies can trigger the release of dopamine in the brain's reward pathways, fostering a sense of pleasure and calm while strengthening social bonds when experienced in group settings.`;

const CORAL_REEFS_PASSAGE = `Coral reefs are among the most biologically diverse and productive ecosystems on Earth, often referred to as the "rainforests of the sea." Although they occupy less than one percent of the global ocean floor, coral reefs provide essential habitat, shelter, and spawning grounds for approximately twenty-five percent of all known marine species. The structural foundation of these reefs is built by colonies of tiny marine invertebrates called coral polyps, which secrete calcium carbonate skeletons over thousands of years.

At the heart of a coral reef's productivity lies a mutually beneficial symbiotic relationship between the coral polyps and microscopic photosynthetic algae known as zooxanthellae. Living within the coral's tissues, zooxanthellae capture solar energy and convert it into organic nutrients that supply up to ninety percent of the coral's metabolic requirements. In return, the coral provides the algae with a protected environment and the compounds necessary for photosynthesis.

However, this delicate partnership is acutely vulnerable to environmental stress, particularly rising sea surface temperatures and ocean acidification. When water temperatures exceed normal seasonal thresholds by even one or two degrees Celsius for extended periods, corals expel their symbiotic algae, causing their tissues to turn transparent and expose the white limestone skeleton beneath—a phenomenon known as coral bleaching. While bleached corals are not immediately dead, prolonged thermal stress deprives them of their primary energy source, leading to widespread mortality and the collapse of reef-dependent marine communities.`;

const HONEYBEE_TALK_TRANSCRIPT = `Narrator: Listen to a talk on a science podcast.
Professor: Today's topic is the intriguing behavior of honeybees and their communication methods within the hive. Honeybees are known for their complex social structure and efficiency in gathering resources. One of the most fascinating aspects of their behavior is the waggle dance. This dance is used by worker bees to convey information about the location of food sources to other members of the hive. When a bee discovers a rich source of nectar, it returns to the hive and performs the waggle dance on the vertical surface of the honeycomb. The dance involves a figure-eight movement and a waggle phase during which the bee vibrates its body. The duration and angle of the waggle phase relative to the hive's vertical axis communicate the distance and direction of the food source. The waggle dance is a remarkable example of symbolic communication in insects. It allows the hive to efficiently gather food and is crucial for the colony's survival. Understanding the waggle dance has also provided insights into how bees navigate and the importance of environmental cues in their foraging behavior. However, studies have shown that environmental factors like the presence of pesticides can disrupt these communication methods, leading to less efficient foraging and potentially threatening the colony's health. The study of honeybee communication underscores the delicate balance of natural ecosystems and highlights the impact of human activities on these intricate systems.`;

const JAZZ_TALK_TRANSCRIPT = `Narrator: Listen to a talk in a music class.
Professor: You are probably all familiar with jazz music. Its history begins in the southern United States. It originated in the early twentieth century in the city of New Orleans, blending elements of different kinds of music like African rhythms, blues, and ragtime. One of the key characteristics of jazz is its emphasis on improvisation. Musicians often create spontaneous melodies and harmonies, making each performance unique. This contrasts with classical music, where compositions are typically played as written. Jazz musicians also use syncopation, which involves shifting the normal accents in the rhythm to create an unexpected and exciting sound. In the 1920s, jazz became widely popular and moved north to cities like Chicago and New York City. During the Jazz Age, as this period became known, famous jazz musicians like Louis Armstrong became household names, and jazz clubs flourished as social hubs. Over time, jazz continued to evolve, in part by incorporating elements from other musical traditions and cultures. Today, it remains a vibrant and influential genre celebrated for its creativity and expressive power. Next, we will look at the impact of jazz on other musical genres and how it has shaped contemporary music.`;

const CULTURAL_RELATIVISM_TRANSCRIPT = `Narrator: Listen to a talk in a sociology class.
Professor: Cultural relativism is the idea that a person's beliefs and activities should be understood based on that person's own culture rather than be judged against the criteria of another culture. This concept contrasts with ethnocentrism, which is the practice of evaluating other cultures according to the standards of one's own culture. Cultural relativism encourages us to view cultural practices in their own context. For example, while arranged marriages may seem outdated to some, they are a norm in many cultures and often serve important social functions. Practicing cultural relativism allows sociologists and anthropologists to gain a deeper understanding of how cultural practices shape societies. However, cultural relativism is not without its challenges. Critics argue that it can lead to moral relativism, where all cultural practices are seen as equally valid, potentially excusing practices that violate human rights. Balancing respect for cultural diversity with the recognition of universal human rights is a complex issue. Next, we will explore case studies that illustrate the principles of cultural relativism and its application in cross-cultural research.`;

let idx = 1;
const nextId = () => makeItemId(1, idx++);

export const MOON_ITEMS: SeedQuestionItemRow[] = [
  // =========================================================================
  // READING MODULE 1 (Questions 1–33 equivalent)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Paleontology and the Fossil Record (Q1–10)",
    passageText:
      "Paleontology is the scientific study of life that existed prior to the Holocene epoch. This [0] involves [1] the fossilized [2] of ancient [3] to understand their evolution and interactions. Fossils, which are preserved [4] sedimentary rock, provide a window [5] the past, showing [6] species adapted to changing environments. By analyzing these remnants, scientists can reconstruct ancient ecosystems and trace the lineage of modern [7]. Over millions of years, countless species have [8] and gone extinct, while others [9] to survive in new habitats.",
    blanks: [
      { index: 0, prefix: "fi", answer: "eld" },
      { index: 1, prefix: "exam", answer: "ining" },
      { index: 2, prefix: "rem", answer: "ains" },
      { index: 3, prefix: "orga", answer: "nisms" },
      { index: 4, prefix: "with", answer: "in" },
      { index: 5, prefix: "int", answer: "o" },
      { index: 6, prefix: "h", answer: "ow" },
      { index: 7, prefix: "", answer: "life" },
      { index: 8, prefix: "evo", answer: "lved" },
      { index: 9, prefix: "ada", answer: "pted" },
    ],
  }),
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Fungi in Terrestrial Ecosystems (Q11–20)",
    passageText:
      "Fungi play [0] essential role in maintaining healthy forest ecosystems. They are [1] in almost every terrestrial habitat, where they decompose organic matter and recycle nutrients. Unlike plants, [2] fungi do not produce their own food through photosynthesis. Instead, they absorb nutrients from their [3], often forming mutualistic partnerships with tree roots. Without fungi, dead leaves and wood would [4] on the forest floor, locking away vital [5] needed for new growth. These symbiotic [6] relationships allow [7] plant species to thrive in nutrient-poor soils, making fungi indispensable to the [8] and crucial for [9] biodiversity.",
    blanks: [
      { index: 0, prefix: "", answer: "an" },
      { index: 1, prefix: "fo", answer: "und" },
      { index: 2, prefix: "m", answer: "ost" },
      { index: 3, prefix: "envir", answer: "onment" },
      { index: 4, prefix: "st", answer: "ay" },
      { index: 5, prefix: "molecu", answer: "les" },
      { index: 6, prefix: "symb", answer: "ios" },
      { index: 7, prefix: "ma", answer: "ny" },
      { index: 8, prefix: "ecosyst", answer: "em" },
      { index: 9, prefix: "sustain", answer: "ning" },
    ],
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Read in Daily Life: Job Application Follow-Up Email (Q21)",
    formatType: "email",
    senderName: "John Doe",
    senderHandle: "john.doe@email.com",
    subject: "Follow-Up on Marketing Coordinator Application",
    dateLabel: "Monday, 9:15 AM",
    stimulusText: JOB_EMAIL_STIMULUS,
    questionStem: "What is the main purpose of John's email?",
    options: [
      "To submit a new job application",
      "To request a job interview",
      "To decline a job offer",
      "To inquire about the status of a job application",
    ],
    correctOptionId: "D",
    explanation:
      "John writes to follow up on the Marketing Coordinator application he submitted last week and asks for updates regarding its status (D).",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Read in Daily Life: Job Application Follow-Up Email (Q22)",
    formatType: "email",
    senderName: "John Doe",
    senderHandle: "john.doe@email.com",
    subject: "Follow-Up on Marketing Coordinator Application",
    dateLabel: "Monday, 9:15 AM",
    stimulusText: JOB_EMAIL_STIMULUS,
    questionStem: "What does John offer to do if needed?",
    options: [
      "Start working immediately",
      "Resubmit his resume",
      "Provide additional information or references",
      "Attend a training session",
    ],
    correctOptionId: "C",
    explanation:
      "In the second paragraph, John states: 'I would be happy to provide any additional information or references if needed' (C).",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Read in Daily Life: Digital Marketing Webinar Invitation (Q23)",
    formatType: "email",
    senderName: "Tech Solutions Marketing Team",
    senderHandle: "newsletter@techsolutions.io",
    subject: "Welcome & Exclusive Webinar Access",
    dateLabel: "Tuesday, 11:00 AM",
    stimulusText: WEBINAR_EMAIL_STIMULUS,
    questionStem: "What is the main purpose of the email?",
    options: [
      "To confirm a purchase",
      "To request feedback on a product",
      "To announce a new product launch",
      "To welcome a new subscriber and provide information about an upcoming webinar",
    ],
    correctOptionId: "D",
    explanation:
      "The email thanks Alex for subscribing to the newsletter and invites Alex to register for an exclusive upcoming webinar on digital marketing strategies (D).",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Read in Daily Life: Digital Marketing Webinar Invitation (Q24)",
    formatType: "email",
    senderName: "Tech Solutions Marketing Team",
    senderHandle: "newsletter@techsolutions.io",
    subject: "Welcome & Exclusive Webinar Access",
    dateLabel: "Tuesday, 11:00 AM",
    stimulusText: WEBINAR_EMAIL_STIMULUS,
    questionStem: "How can Alex join the upcoming webinar?",
    options: [
      "By replying to the email",
      "By calling the customer service number",
      "By clicking the registration link and filling out the form",
      "By visiting the company's office",
    ],
    correctOptionId: "C",
    explanation:
      "The email instructs Alex: 'To join the webinar, simply click the registration link below and fill out the form' (C).",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Read in Daily Life: Team Presentation Text Chain (Q25)",
    formatType: "text_chain",
    senderName: "Mark Jenkins, Convene, Sam Abrams, Mary Hiller",
    senderHandle: "#project-presentation",
    subject: "Tomorrow's Presentation Prep",
    dateLabel: "Today, 10:00 AM",
    stimulusText: TEXT_CHAIN_STIMULUS,
    questionStem: "What is the main purpose of the text message chain?",
    options: [
      "To schedule a team lunch",
      "To discuss a new project proposal",
      "To assign new roles to team members",
      "To prepare for an upcoming project presentation",
    ],
    correctOptionId: "D",
    explanation:
      "Mark initiates the chat to make sure everything is ready for tomorrow's 10 AM project presentation, and the team coordinates slides and a rehearsal (D).",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Read in Daily Life: Team Presentation Text Chain (Q26)",
    formatType: "text_chain",
    senderName: "Mark Jenkins, Convene, Sam Abrams, Mary Hiller",
    senderHandle: "#project-presentation",
    subject: "Tomorrow's Presentation Prep",
    dateLabel: "Today, 10:00 AM",
    stimulusText: TEXT_CHAIN_STIMULUS,
    questionStem: "When does Sam Abrams plan to send his part of the presentation?",
    options: ["By 10 AM", "By 3 PM", "By noon", "Tomorrow morning"],
    correctOptionId: "C",
    explanation:
      "Sam Abrams writes at 10:07 AM: 'Just need to add a few more data points. I'll send them over by noon' (C).",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Read in Daily Life: Team Presentation Text Chain (Q27)",
    formatType: "text_chain",
    senderName: "Mark Jenkins, Convene, Sam Abrams, Mary Hiller",
    senderHandle: "#project-presentation",
    subject: "Tomorrow's Presentation Prep",
    dateLabel: "Today, 10:00 AM",
    stimulusText: TEXT_CHAIN_STIMULUS,
    questionStem: "What did Mary Hiller do to the presentation?",
    options: [
      "She reviewed it and made minor edits for consistency.",
      "She added new data charts to Sam's section.",
      "She rescheduled the presentation for next week.",
      "She sent the presentation to the client.",
    ],
    correctOptionId: "A",
    explanation:
      "Mary Hiller states at 10:10 AM: 'I've reviewed the whole presentation and made some minor edits for consistency' (A).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "The Power of Music (Q28)",
    stimulusText: POWER_OF_MUSIC_PASSAGE,
    questionSubType: "factual",
    questionStem: "What is the main topic of the passage?",
    options: [
      "The history of musical instruments in ancient civilizations",
      "The differences between classical and modern music therapy",
      "How record labels market music to younger audiences",
      "The evolutionary, cognitive, and psychological effects of music on humans",
    ],
    correctOptionId: "D",
    explanation:
      "The passage examines music's cultural/evolutionary role, its neuroplastic effects on the brain, and its psychological/physiological benefits (D).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "The Power of Music (Q29)",
    stimulusText: POWER_OF_MUSIC_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to paragraph 2, what happens in the brain when an individual learns to play a musical instrument?",
    options: [
      "Auditory processing regions shrink to conserve energy.",
      "The brain undergoes structural and functional changes known as neuroplasticity.",
      "Cortisol levels increase permanently in the motor cortex.",
      "Verbal memory is replaced by spatial-temporal reasoning.",
    ],
    correctOptionId: "B",
    explanation:
      "Paragraph 2 explicitly states: 'When individuals learn to play a musical instrument, their brains undergo structural and functional changes known as neuroplasticity' (B).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "The Power of Music (Q30)",
    stimulusText: POWER_OF_MUSIC_PASSAGE,
    questionSubType: "vocabulary",
    questionStem:
      "The word 'profound' in paragraph 3 is closest in meaning to:",
    targetWord: "profound",
    options: ["Temporary", "Superficial", "Deep and significant", "Accidental"],
    correctOptionId: "C",
    explanation:
      "'Profound' in 'exerts a profound influence on physiological and psychological well-being' means deep and significant (C).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "The Power of Music (Q31)",
    stimulusText: POWER_OF_MUSIC_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to paragraph 2, compared with non-musicians, trained musicians consistently show:",
    options: [
      "Lower dopamine production when listening to familiar songs",
      "Reduced activity in the executive function network",
      "Enhanced neural connectivity in the corpus callosum and stronger verbal memory",
      "A preference for passive listening over active performance",
    ],
    correctOptionId: "C",
    explanation:
      "Paragraph 2 notes that trained musicians demonstrate 'enhanced neural connectivity in the corpus callosum, as well as heightened verbal memory and spatial-temporal reasoning skills' (C).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "The Power of Music (Q32)",
    stimulusText: POWER_OF_MUSIC_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to paragraph 3, what chemical messenger is released in the brain's reward pathways during passive listening to familiar melodies?",
    options: ["Cortisol", "Dopamine", "Adrenaline", "Melatonin"],
    correctOptionId: "B",
    explanation:
      "Paragraph 3 states that passive listening to familiar melodies 'can trigger the release of dopamine in the brain's reward pathways' (B).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "The Power of Music (Q33)",
    stimulusText: POWER_OF_MUSIC_PASSAGE,
    questionSubType: "inference",
    questionStem:
      "What can be inferred from paragraph 3 about music therapy in clinical settings?",
    options: [
      "It is only effective for professional musicians.",
      "It requires patients to compose their own original symphonies.",
      "It can serve as a non-invasive tool to help manage stress and physical pain.",
      "It has replaced all pharmacological treatments in modern hospitals.",
    ],
    correctOptionId: "C",
    explanation:
      "Because music therapy reduces cortisol levels, alleviates chronic pain, and supports emotional recovery, it can be inferred to serve as an effective non-invasive clinical tool (C).",
  }),

  // =========================================================================
  // READING MODULE 2 (Adaptive Upper & Lower — Industrial Revolution & Coral Reefs)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Complete the Words: Technological Innovation & Industrial Systems (M2 Q1–10)",
    passageText:
      "Over the past two centuries, rapid technological innovation has [0] a profound shift in human society. This change altered the [1] of workers toward time and labor, while increasing the [2] of urban populations to factories. New [3] of production, [4] by mechanical power rather than [5] labor, accelerated the [6] of goods. Such developments unlocked [7] economic growth and reshaped transportation [8], originally powered by the [9] engine.",
    blanks: [
      { index: 0, prefix: "produ", answer: "ced" },
      { index: 1, prefix: "atti", answer: "tude" },
      { index: 2, prefix: "proxi", answer: "mity" },
      { index: 3, prefix: "indus", answer: "tries" },
      { index: 4, prefix: "", answer: "driven" },
      { index: 5, prefix: "hu", answer: "man" },
      { index: 6, prefix: "cre", answer: "ation" },
      { index: 7, prefix: "substan", answer: "tial" },
      { index: 8, prefix: "", answer: "systems" },
      { index: 9, prefix: "st", answer: "eam" },
    ],
  }),
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Complete the Words: Technological Innovation & Industrial Systems (M2 Lower Q1–10)",
    passageText:
      "Over the past two centuries, rapid technological innovation has [0] a profound shift in human society. This change altered the [1] of workers toward time and labor, while increasing the [2] of urban populations to factories. New [3] of production, [4] by mechanical power rather than [5] labor, accelerated the [6] of goods. Such developments unlocked [7] economic growth and reshaped transportation [8], originally powered by the [9] engine.",
    blanks: [
      { index: 0, prefix: "produ", answer: "ced" },
      { index: 1, prefix: "atti", answer: "tude" },
      { index: 2, prefix: "proxi", answer: "mity" },
      { index: 3, prefix: "indus", answer: "tries" },
      { index: 4, prefix: "", answer: "driven" },
      { index: 5, prefix: "hu", answer: "man" },
      { index: 6, prefix: "cre", answer: "ation" },
      { index: 7, prefix: "substan", answer: "tial" },
      { index: 8, prefix: "", answer: "systems" },
      { index: 9, prefix: "st", answer: "eam" },
    ],
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Coral Reefs and Symbiosis (M2 Q12)",
    stimulusText: CORAL_REEFS_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to paragraph 1, what proportion of all known marine species rely on coral reefs for habitat and spawning grounds?",
    options: [
      "Less than one percent",
      "Approximately twenty-five percent",
      "Nearly fifty percent",
      "Up to ninety percent",
    ],
    correctOptionId: "B",
    explanation:
      "Paragraph 1 states that coral reefs provide essential habitat for 'approximately twenty-five percent of all known marine species' (B).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Coral Reefs and Symbiosis (M2 Q13)",
    stimulusText: CORAL_REEFS_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "How do zooxanthellae benefit the coral polyps in which they live?",
    options: [
      "They capture solar energy and convert it into organic nutrients for the coral.",
      "They secrete a hard calcium carbonate skeleton around the colony.",
      "They cool the surrounding seawater during summer heatwaves.",
      "They defend the coral from predatory fish.",
    ],
    correctOptionId: "A",
    explanation:
      "Paragraph 2 explains that zooxanthellae 'capture solar energy and convert it into organic nutrients that supply up to ninety percent of the coral's metabolic requirements' (A).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Coral Reefs and Symbiosis (M2 Q14)",
    stimulusText: CORAL_REEFS_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "What directly causes a coral to turn white during a coral bleaching event?",
    options: [
      "A coat of white sand settling over the reef",
      "Rapid overgrowth of white algae on the ocean floor",
      "The expulsion of symbiotic algae, which exposes the white limestone skeleton beneath transparent tissue",
      "A sudden drop in ocean salinity during winter storms",
    ],
    correctOptionId: "C",
    explanation:
      "Paragraph 3 states that corals expel their symbiotic algae under thermal stress, 'causing their tissues to turn transparent and expose the white limestone skeleton beneath' (C).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Coral Reefs and Symbiosis (M2 Q15)",
    stimulusText: CORAL_REEFS_PASSAGE,
    questionSubType: "vocabulary",
    questionStem:
      "The word 'acutely' in paragraph 3 is closest in meaning to:",
    targetWord: "acutely",
    options: ["Severely", "Rarely", "Slightly", "Temporarily"],
    correctOptionId: "A",
    explanation:
      "'Acutely vulnerable' means severely or intensely sensitive to environmental stress (A).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Coral Reefs and Symbiosis (M2 Q16)",
    stimulusText: CORAL_REEFS_PASSAGE,
    questionSubType: "inference",
    questionStem:
      "What can be inferred from paragraph 3 about bleached corals?",
    options: [
      "They can never recover even if water temperatures return to normal quickly.",
      "They immediately dissolve into the surrounding seawater.",
      "They may survive if water temperatures cool before they starve from lack of nutrients.",
      "They switch to feeding exclusively on small fish.",
    ],
    correctOptionId: "C",
    explanation:
      "Paragraph 3 notes that 'While bleached corals are not immediately dead, prolonged thermal stress deprives them of their primary energy source,' implying they can recover if thermal stress is not prolonged (C).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Coral Reefs and Symbiosis (M2 Lower Q12)",
    stimulusText: CORAL_REEFS_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to paragraph 1, what builds the structural foundation of coral reefs?",
    options: [
      "Deep-sea volcanic vents",
      "Colonies of coral polyps that secrete calcium carbonate skeletons",
      "Large schools of tropical fish",
      "Floating mats of seaweed",
    ],
    correctOptionId: "B",
    explanation:
      "Paragraph 1 states that the foundation is built by 'colonies of tiny marine invertebrates called coral polyps, which secrete calcium carbonate skeletons' (B).",
  }),

  // =========================================================================
  // LISTENING MODULE 1 (20 Questions matching iM8U5AnjJ14: B,C,A,C,B,D,C,A,C,D,B,A,A,B,A,C,C,B,B,A)
  // =========================================================================
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_choose_response",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Listen and Choose a Response — Library Hours (Q1)",
    transcript: "Woman: Excuse me, do you know what time the university library closes tonight?",
    questionStem: "Choose the best response to what you heard.",
    options: [
      "Yes, I returned the books yesterday.",
      "I believe it stays open until midnight on weekdays.",
      "The bookstore is on the first floor.",
      "No, I haven't read that chapter yet.",
    ],
    correctOptionId: "B",
    explanation: "The speaker asks what time the library closes tonight; 'I believe it stays open until midnight on weekdays' directly answers the question (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_choose_response",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Listen and Choose a Response — Lab Report (Q2)",
    transcript: "Man: Have you finished writing the discussion section for our chemistry lab report?",
    questionStem: "Choose the best response to what you heard.",
    options: [
      "The chemistry lab is in Building C.",
      "Yes, the professor graded it last week.",
      "I'm almost done, and I'll email you my draft in an hour.",
      "No, I don't have a lab coat.",
    ],
    correctOptionId: "C",
    explanation: "The man asks about progress on the lab report draft; saying 'I'm almost done, and I'll email you my draft in an hour' is the natural response (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_choose_response",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Listen and Choose a Response — Seminar Room (Q3)",
    transcript: "Woman: Where is Professor Miller's economics review session being held this afternoon?",
    questionStem: "Choose the best response to what you heard.",
    options: [
      "It was moved to Room 304 in the business building.",
      "The exam covers chapters five through eight.",
      "At three o'clock sharp.",
      "Yes, she is a great lecturer.",
    ],
    correctOptionId: "A",
    explanation: "'Where' asks for a location; 'It was moved to Room 304 in the business building' provides the location (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_choose_response",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Listen and Choose a Response — Office Printer (Q4)",
    transcript: "Man: The printer in the student lounge is out of toner again.",
    questionStem: "Choose the best response to what you heard.",
    options: [
      "I printed twenty copies yesterday.",
      "Yes, the lounge was painted last month.",
      "You can use the one on the second floor of the library instead.",
      "The paper size is standard letter.",
    ],
    correctOptionId: "C",
    explanation: "Suggesting an alternative working printer on the second floor of the library directly addresses the problem (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Campus Conversation — Yoga Studio Mat (Q5)",
    transcript: `Woman: Hey, are you still planning to go to the beginner's yoga class at the studio this evening?
Man: Definitely! Though I realized this morning that I don't actually own a yoga mat yet. Do you know where I can pick one up quickly?
Woman: There's a sporting goods store just a few blocks from the studio.
Man: Perfect. I'll stop by on my way. Hopefully, they have a decent selection.
Woman: Well, if not, the studio has plenty you can borrow. That's what I always do. See you there!`,
    campusContext: "Recreation & Wellness",
    questionStem: "What problem does the man mention?",
    options: [
      "He forgot what time the yoga class starts.",
      "He does not have a yoga mat for the class.",
      "He injured his back at the gym.",
      "He cannot find the address of the yoga studio.",
    ],
    correctOptionId: "B",
    explanation: "The man says he realized this morning that he doesn't own a yoga mat yet (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Campus Conversation — Yoga Studio Mat (Q6)",
    transcript: `Woman: Hey, are you still planning to go to the beginner's yoga class at the studio this evening?
Man: Definitely! Though I realized this morning that I don't actually own a yoga mat yet. Do you know where I can pick one up quickly?
Woman: There's a sporting goods store just a few blocks from the studio.
Man: Perfect. I'll stop by on my way. Hopefully, they have a decent selection.
Woman: Well, if not, the studio has plenty you can borrow. That's what I always do. See you there!`,
    campusContext: "Recreation & Wellness",
    questionStem: "What does the woman say the man can do if the store does not have a good selection?",
    options: [
      "Order a mat online for next week",
      "Take a spinning class instead",
      "Use her extra mat",
      "Borrow a mat from the yoga studio",
    ],
    correctOptionId: "D",
    explanation: "The woman says: 'Well, if not, the studio has plenty you can borrow. That's what I always do' (D).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Campus Announcement — Annual Charity Auction (Q7)",
    transcript: `Narrator: Listen to an announcement at a university event.
Speaker: Attention everyone. We are thrilled to announce that the university's annual charity auction will be held next Saturday at 6:00 p.m. in the main hall. All proceeds will go to local charities. We hope to see you there and appreciate your support.`,
    campusContext: "University Main Hall",
    questionStem: "What is the main purpose of the announcement?",
    options: [
      "To recruit volunteers for a campus clean-up day",
      "To announce the winners of a scholarship competition",
      "To invite students to attend an upcoming charity auction",
      "To reschedule a concert in the main hall",
    ],
    correctOptionId: "C",
    explanation: "The speaker announces that the university's annual charity auction will be held next Saturday at 6:00 p.m. in the main hall (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Campus Announcement — Annual Charity Auction (Q8)",
    transcript: `Narrator: Listen to an announcement at a university event.
Speaker: Attention everyone. We are thrilled to announce that the university's annual charity auction will be held next Saturday at 6:00 p.m. in the main hall. All proceeds will go to local charities. We hope to see you there and appreciate your support.`,
    campusContext: "University Main Hall",
    questionStem: "How will the money raised at the event be used?",
    options: [
      "It will be donated to local charities.",
      "It will fund new athletic equipment.",
      "It will pay for student travel grants.",
      "It will renovate the main hall stage.",
    ],
    correctOptionId: "A",
    explanation: "The speaker explicitly states: 'All proceeds will go to local charities' (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Club Announcement — Saturday Hiking Trip (Q9)",
    transcript: `Narrator: Listen to an announcement at a university club meeting.
Speaker: Welcome everyone. Just a reminder that our club's annual hiking trip will be this Saturday. We'll meet at 8:00 a.m. at the student center and head out to the trails together. Make sure to bring water, snacks, and comfortable shoes.`,
    campusContext: "Outdoors Club",
    questionStem: "Where will the club members meet on Saturday morning?",
    options: [
      "At the campus bus stop",
      "At the trail entrance",
      "At the student center",
      "At the recreation gym",
    ],
    correctOptionId: "C",
    explanation: "The speaker states: 'We'll meet at 8:00 a.m. at the student center and head out to the trails together' (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Club Announcement — Saturday Hiking Trip (Q10)",
    transcript: `Narrator: Listen to an announcement at a university club meeting.
Speaker: Welcome everyone. Just a reminder that our club's annual hiking trip will be this Saturday. We'll meet at 8:00 a.m. at the student center and head out to the trails together. Make sure to bring water, snacks, and comfortable shoes.`,
    campusContext: "Outdoors Club",
    questionStem: "What are participants reminded to bring?",
    options: [
      "A tent and sleeping bag",
      "A compass and printed trail map",
      "A student ID card and cash",
      "Water, snacks, and comfortable shoes",
    ],
    correctOptionId: "D",
    explanation: "The speaker reminds everyone: 'Make sure to bring water, snacks, and comfortable shoes' (D).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Sociology Lecture — Cultural Relativism (Q11)",
    transcript: CULTURAL_RELATIVISM_TRANSCRIPT,
    academicDomain: "Sociology",
    questionStem: "What is the main topic of the talk?",
    options: [
      "The history of marriage laws in Europe",
      "The concept of cultural relativism and its challenges",
      "How anthropologists conduct archaeological excavations",
      "Why ethnocentrism is beneficial for modern societies",
    ],
    correctOptionId: "B",
    explanation: "The talk defines cultural relativism, contrasts it with ethnocentrism, and discusses its benefits and ethical challenges (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Sociology Lecture — Cultural Relativism (Q12)",
    transcript: CULTURAL_RELATIVISM_TRANSCRIPT,
    academicDomain: "Sociology",
    questionStem: "How does the speaker define ethnocentrism?",
    options: [
      "Evaluating other cultures according to the standards of one's own culture",
      "Studying a culture from the perspective of its own members",
      "Adopting the customs of a foreign country permanently",
      "Rejecting all forms of traditional social institutions",
    ],
    correctOptionId: "A",
    explanation: "The professor states that ethnocentrism 'is the practice of evaluating other cultures according to the standards of one's own culture' (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Sociology Lecture — Cultural Relativism (Q13)",
    transcript: CULTURAL_RELATIVISM_TRANSCRIPT,
    academicDomain: "Sociology",
    questionStem: "Why does the speaker mention arranged marriages?",
    options: [
      "To give an example of a practice that serves important social functions within its own cultural context",
      "To argue that marriage customs are identical across all societies",
      "To illustrate a custom that has completely disappeared",
      "To show how laws regulate family size",
    ],
    correctOptionId: "A",
    explanation: "Arranged marriages are cited as an example of a practice that may seem unfamiliar to outsiders but is a norm serving important social functions in many cultures (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Sociology Lecture — Cultural Relativism (Q14)",
    transcript: CULTURAL_RELATIVISM_TRANSCRIPT,
    academicDomain: "Sociology",
    questionStem: "According to critics mentioned in the talk, what is a potential danger of cultural relativism?",
    options: [
      "It makes field research too expensive to conduct.",
      "It can lead to moral relativism that excuses practices violating human rights.",
      "It prevents students from learning foreign languages.",
      "It encourages ethnocentrism among sociologists.",
    ],
    correctOptionId: "B",
    explanation: "The speaker notes: 'Critics argue that it can lead to moral relativism where all cultural practices are seen as equally valid, potentially excusing practices that violate human rights' (B).",
  }),

  // =========================================================================
  // LISTENING MODULE 2 (Exact transcripts from iM8U5AnjJ14: Choose Response, Book Fair, Craft Fair, Honeybee Waggle Dance, History of Jazz)
  // =========================================================================
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_choose_response",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Listen and Choose a Response — Assignment Help (M2 Q1)",
    transcript: "Woman: Can you help me with this assignment?",
    questionStem: "Choose the best response to what you heard.",
    options: [
      "Sure, let's look at the instructions together after lunch.",
      "The assignment was graded last month.",
      "No, I don't know where the building is.",
      "Yes, the professor signed the form.",
    ],
    correctOptionId: "A",
    explanation: "Offering to look at the instructions together after lunch directly responds to the request for help (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_choose_response",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Listen and Choose a Response — Subway Station (M2 Q2)",
    transcript: "Man: Where is the nearest subway station?",
    questionStem: "Choose the best response to what you heard.",
    options: [
      "The train leaves at five o'clock.",
      "It's just two blocks north, right across from the post office.",
      "I usually take the bus to work.",
      "Yes, the ticket machine accepts credit cards.",
    ],
    correctOptionId: "B",
    explanation: "Giving the direction ('two blocks north, right across from the post office') directly answers 'Where is the nearest subway station?' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Conversation — Saturday Book Fair (M2 Q3)",
    transcript: `Woman: Are you interested in going to the book fair this Saturday?
Man: Absolutely. I love discovering new authors. What time does it start?
Woman: It starts at 10:00 a.m. and goes until 4:00 p.m. There will be author readings and book signings.
Man: Sounds perfect. I'll bring my list of favorite authors.
Woman: Great. Let's meet up at the entrance at 10:00.`,
    campusContext: "Community Book Fair",
    questionStem: "What activities does the woman say will take place at the book fair?",
    options: [
      "A poetry writing workshop and film screening",
      "Author readings and book signings",
      "A used textbook exchange for science majors",
      "A panel discussion on digital publishing",
    ],
    correctOptionId: "B",
    explanation: "The woman says: 'There will be author readings and book signings' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Conversation — Weekend Craft Fair (M2 Q4)",
    transcript: `Man: Are you going to the craft fair this weekend?
Woman: Yes, I love looking at handmade items and unique crafts.
Man: Me, too. I'm hoping to find some nice gifts for my family.
Woman: That's a good idea. I've heard there will be a lot of local artists there.
Man: Great. Let's meet up there around 10:00.`,
    campusContext: "Weekend Craft Fair",
    questionStem: "Why is the man excited to attend the craft fair?",
    options: [
      "He is selling his own pottery at a booth.",
      "He wants to interview local artists for the school paper.",
      "He hopes to find some nice gifts for his family.",
      "He is performing acoustic music on the main stage.",
    ],
    correctOptionId: "C",
    explanation: "The man says: 'I'm hoping to find some nice gifts for my family' (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Science Podcast — Honeybee Waggle Dance (M2 Q5)",
    transcript: HONEYBEE_TALK_TRANSCRIPT,
    academicDomain: "Biology / Entomology",
    questionStem: "What is the primary purpose of the honeybee's waggle dance?",
    options: [
      "To defend the hive against rival insect colonies",
      "To communicate the distance and direction of food sources to other bees",
      "To regulate the internal temperature of the honeycomb",
      "To select a new queen bee for the colony",
    ],
    correctOptionId: "B",
    explanation: "The podcast explains that worker bees use the waggle dance 'to convey information about the location of food sources... The duration and angle of the waggle phase relative to the hive's vertical axis communicate the distance and direction of the food source' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Science Podcast — Honeybee Waggle Dance (M2 Q6)",
    transcript: HONEYBEE_TALK_TRANSCRIPT,
    academicDomain: "Biology / Entomology",
    questionStem: "According to the speaker, what environmental factor can disrupt honeybee communication?",
    options: [
      "Heavy autumn rainfall",
      "Competition from migrating birds",
      "The presence of pesticides",
      "Changes in the Earth's magnetic field",
    ],
    correctOptionId: "C",
    explanation: "The speaker notes: 'studies have shown that environmental factors like the presence of pesticides can disrupt these communication methods' (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Music Class — History of Jazz (M2 Q7)",
    transcript: JAZZ_TALK_TRANSCRIPT,
    academicDomain: "Music History",
    questionStem: "According to the professor, how does jazz differ from classical music?",
    options: [
      "Jazz compositions are strictly played as written without variation.",
      "Jazz emphasizes improvisation, where musicians create spontaneous melodies and harmonies.",
      "Jazz uses only string instruments and avoids percussion.",
      "Jazz originated in nineteenth-century Vienna.",
    ],
    correctOptionId: "B",
    explanation: "The professor states: 'One of the key characteristics of jazz is its emphasis on improvisation... This contrasts with classical music, where compositions are typically played as written' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Music Class — History of Jazz (M2 Q8)",
    transcript: JAZZ_TALK_TRANSCRIPT,
    academicDomain: "Music History",
    questionStem: "What does the professor mean by the term 'syncopation'?",
    options: [
      "Playing all instruments at the exact same volume",
      "Shifting the normal accents in the rhythm to create an unexpected sound",
      "Translating lyrics from French into English",
      "Recording music in an outdoor amphitheater",
    ],
    correctOptionId: "B",
    explanation: "The professor defines syncopation as 'shifting the normal accents in the rhythm to create an unexpected and exciting sound' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Music Class — History of Jazz (M2 Lower Q1)",
    transcript: JAZZ_TALK_TRANSCRIPT,
    academicDomain: "Music History",
    questionStem: "In which city did jazz originate in the early twentieth century?",
    options: ["Chicago", "New York City", "New Orleans", "Boston"],
    correctOptionId: "C",
    explanation: "The professor states: 'It originated in the early twentieth century in the city of New Orleans' (C).",
  }),

  // =========================================================================
  // WRITING SECTION (10 Build a Sentence + Write an Email + Academic Discussion)
  // =========================================================================
  buildSentenceItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 1,
    speakerAName: "Taylor",
    contextPrompt: "How did your assignment submission go yesterday?",
    targetSentence: "Unfortunately, I did not meet the deadline.",
    wordBank: ["did not", "I", "the deadline", "meet", "Unfortunately,"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 2,
    speakerAName: "Jordan",
    contextPrompt: "Were you able to get feedback from all the attendees?",
    targetSentence: "No, most of them left right after the session.",
    wordBank: ["left", "most of them", "No,", "the session", "right after"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 3,
    speakerAName: "Sam",
    contextPrompt: "Did you hear about the new research collaboration?",
    targetSentence: "I heard they will be working with the biology department.",
    wordBank: [
      "will be",
      "I heard",
      "the biology department",
      "they",
      "working with",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 4,
    speakerAName: "Alex",
    contextPrompt: "Why was the morning train delayed today?",
    targetSentence: "The train was delayed because of a signal failure.",
    wordBank: [
      "because of",
      "was delayed",
      "a signal failure",
      "The train",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 5,
    speakerAName: "Morgan",
    contextPrompt: "Did the coordinator mention anything about the presentation?",
    targetSentence: "Yes, she wanted to know if we needed extra slides.",
    wordBank: [
      "if we",
      "wanted to know",
      "Yes,",
      "needed",
      "she",
      "extra slides",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 6,
    speakerAName: "Riley",
    contextPrompt: "Has Marcus prepared for the client meeting tomorrow?",
    targetSentence:
      "He was wondering if he needs to bring the financial reports.",
    wordBank: [
      "if he",
      "He was wondering",
      "the financial reports",
      "needs to bring",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 7,
    speakerAName: "Casey",
    contextPrompt: "Were there any technical issues during the webinar?",
    targetSentence: "Yes, there were, but the support team resolved them quickly.",
    wordBank: [
      "but",
      "Yes, there were,",
      "resolved them",
      "the support team",
      "quickly",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 8,
    speakerAName: "Jamie",
    contextPrompt: "I'm starting my new internship at the hospital tomorrow.",
    targetSentence: "Could you let me know how the first day goes?",
    wordBank: ["how", "Could you", "the first day", "let me know", "goes"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 9,
    speakerAName: "Robin",
    contextPrompt: "I really enjoyed reading that new historical novel.",
    targetSentence: "Could you tell me what you liked most about it?",
    wordBank: ["what you", "Could you", "about it", "tell me", "liked most"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 10,
    speakerAName: "Drew",
    contextPrompt: "What did the director ask during the budget review?",
    targetSentence: "She wanted to know how much revenue we can expect.",
    wordBank: ["how much", "She wanted", "we can expect", "to know", "revenue"],
  }),
  buildWriteEmailItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    title: "Write an Email — Group Project Timeline & Task Division",
    scenarioContext:
      "You have been assigned to work on a group presentation with a classmate named Jake for your Environmental Studies seminar. The final presentation is due next Friday, and you have not yet divided the tasks or set a timeline.",
    recipientRole: "To: Jake Miller | Subject: Group Project Plan",
    bulletPoints: [
      "Express enthusiasm about working together on the presentation.",
      "Propose a specific way to divide the research and slide preparation tasks.",
      "Suggest a time to meet this week to review progress before next Friday's deadline.",
    ],
    sampleAnswer: `Dear Jake,

I hope you are having a great week! I am really looking forward to collaborating with you on our Environmental Studies presentation due next Friday.

To help us stay on track, I suggest we divide the workload into two main parts. I can handle the background research and data analysis on renewable energy adoption, while you could focus on case studies and designing the slide deck. Once we both finish our initial drafts by Tuesday, we can combine our sections and refine the transitions together.

Would you be free to meet at the campus library this Wednesday at 3:00 PM for a quick practice run? Please let me know if that time works for you.

Best regards,
Alex`,
  }),
  buildAcademicDiscussionItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    title: "Writing for an Academic Discussion — Drivers of Social Mobility",
    courseName: "Sociology 204: Social Stratification",
    professorName: "Dr. Diaz",
    professorPrompt:
      "This week we are examining social mobility—the ability of individuals to move toward a higher socioeconomic status. Some sociologists argue that formal education and supportive government policies are the primary drivers of upward mobility, while others believe that professional networking and social connections play a decisive role. Which factor do you think is most crucial for improving social mobility today, and why?",
    studentPosts: [
      {
        authorName: "Kelly",
        avatarSeed: "kelly-moon",
        text: "I strongly believe that access to quality education and supportive public policies are the foundation of social mobility. Without affordable higher education and fair labor policies, talented students from low-income backgrounds never get the skills needed to compete for high-paying careers.",
      },
      {
        authorName: "Paul",
        avatarSeed: "paul-moon",
        text: "While education is important, professional networking often makes the biggest difference in real life. Many of the best job opportunities are filled through referrals and mentorships, so building strong social capital is essential for career advancement.",
      },
    ],
    keyPointsToCover: [
      "Take a clear position on the primary drivers of social mobility (education/policy, networking, or a synthesis of both).",
      "Engage directly with Kelly's or Paul's points using concrete reasoning or examples.",
      "Maintain an academic register with strong cohesion and varied sentence structures.",
    ],
    sampleAnswer: `While Kelly makes a compelling point that education and public policy establish the foundation for upward mobility, I believe that combining accessible education with professional networking is essential for lasting socioeconomic advancement.

Education undoubtedly equips individuals with technical qualifications and critical thinking skills; however, as Paul notes, a degree alone rarely guarantees access to competitive industries. Students from underprivileged backgrounds often lack the informal mentorship and industry connections that wealthier peers inherit naturally. Therefore, universities and governments should not only subsidize tuition but also integrate paid internships, alumni mentoring, and career networking programs directly into academic curricula. By bridging the gap between classroom credentials and professional social capital, society can ensure that talent and hard work genuinely translate into upward mobility.`,
  }),

  // =========================================================================
  // SPEAKING SECTION (7 Listen & Repeat + 4 Take an Interview from iM8U5AnjJ14)
  // =========================================================================
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 1,
    scenarioTitle: "Art Museum Tour Guide Training",
    sentence: "Is this your first time at our museum?",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 2,
    scenarioTitle: "Art Museum Tour Guide Training",
    sentence: "For modern art, visit the Eastern Wing.",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 3,
    scenarioTitle: "Art Museum Tour Guide Training",
    sentence: "Classical paintings are located on the second floor.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 4,
    scenarioTitle: "Art Museum Tour Guide Training",
    sentence: "The new exhibit of self-portraits is very popular.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 5,
    scenarioTitle: "Art Museum Tour Guide Training",
    sentence: "We offer group tours of gallery highlights at no extra charge.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 6,
    scenarioTitle: "Art Museum Tour Guide Training",
    sentence: "Unfortunately, the sculpture hall is currently under renovation.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 7,
    scenarioTitle: "Art Museum Tour Guide Training",
    sentence:
      "Our gift shop is running a special promotion on a wide selection of books.",
    responseSeconds: 12,
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 1,
    interviewTopic: "Outdoor Activities Research Study",
    questionText:
      "Thank you for your participation. I have some questions about your outdoor activities. First, what kind of outdoor sports do you or your friends generally like to do? For example, do you like hiking, cycling, tennis, or other types of sport?",
    expectedKeyPhrases: ["hiking", "cycling", "outdoor", "fresh air", "exercise"],
    sampleAnswer:
      "My friends and I really enjoy hiking and cycling on weekends. Living near scenic mountain trails makes it easy for us to get outdoors, breathe fresh air, and stay physically active after spending long hours studying indoors during the week.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 2,
    interviewTopic: "Outdoor Activities Research Study",
    questionText:
      "Thank you. When you participate in your favorite outdoor activity, do you prefer to do it alone or do you like to do it together with your family or friends? Why?",
    expectedKeyPhrases: ["together", "friends", "motivation", "safety", "social"],
    sampleAnswer:
      "I definitely prefer doing outdoor activities with my friends or family rather than alone. Not only is it much safer when hiking on long trails, but sharing the experience also keeps everyone motivated and gives us a great chance to catch up without digital distractions.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 3,
    interviewTopic: "Outdoor Activities Research Study",
    questionText:
      "Interesting. Next, I'd like to get your opinion. Where I live, outdoor activities are becoming increasingly popular. Do you think that in the place you live, the popularity of outdoor activities will increase in the future? Why or why not?",
    expectedKeyPhrases: ["increase", "health", "parks", "wellness", "remote work"],
    sampleAnswer:
      "Yes, I believe outdoor recreation will become even more popular in my city over the next few years. More people are working and studying on screens all day, so they are actively looking for ways to reduce stress, and our local government has been expanding bike lanes and public parks.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: MOON_BLUEPRINT_ID,
    questionNumber: 4,
    interviewTopic: "Outdoor Activities Research Study",
    questionText:
      "Good points. I just have one more question. Some people believe that outdoor activities are essential for children's physical and mental health. Do you agree with this idea? Or do you think indoor activities can be just as beneficial for children? Explain why you think so.",
    expectedKeyPhrases: ["essential", "children", "physical", "mental health", "sunlight"],
    sampleAnswer:
      "I completely agree that outdoor activities are essential for children's physical and mental development. While indoor activities like reading or puzzles build cognitive skills, playing outside provides natural sunlight, strengthens coordination and immunity, and teaches children teamwork and resilience in an unstructured environment.",
  }),
];

export const MOON_BLUEPRINT: SeedBlueprintRow = {
  id: MOON_BLUEPRINT_ID,
  title: "Moon | Full Test",
  slug: "moon-full-test-2026",
  description:
    "Official TOEFL iBT 2026 TestGlider Mock Exam #1 (Moon). Features Adaptive Reading (Paleontology, Fungi, Job & Webinar Emails, Team Chat, Power of Music, Coral Reefs), Listening (Charity Auction, Cultural Relativism, Honeybee Waggle Dance, History of Jazz), Writing (10 Build a Sentence, Email to Jake, Social Mobility Discussion), and Speaking (Art Museum Tour Guide & Outdoor Activities Interview).",
  exam_Type: "full_mock",
  total_Duration_Seconds: 5160,
  blueprint_Json: {
    sections: [
      {
        section: "reading",
        order: 1,
        durationSeconds: 1620,
        moduleCount: 2,
        questionCount: 23,
        isAdaptive: true,
      },
      {
        section: "listening",
        order: 2,
        durationSeconds: 1560,
        moduleCount: 2,
        questionCount: 23,
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
    planetName: "Moon",
    videoUrl: "https://youtu.be/5giZh7nDyfk",
    videoId: "5giZh7nDyfk",
    playlistUrl:
      "https://youtube.com/playlist?list=PLoDNaUsnugSqgJGJKo59X49nkQbwcksMV",
    difficultyLabel: "Standard 2026 Adaptive",
  },
  is_Published: true,
  created_At: "2026-09-01T10:00:00.000Z",
};
