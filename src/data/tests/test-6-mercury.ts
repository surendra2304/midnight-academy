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

export const MERCURY_BLUEPRINT_ID = "f2000000-0000-4000-8000-000000000006";

const BIOLUMINESCENCE_PASSAGE = `In the mesopelagic and bathypelagic zones of the ocean—depths below two hundred meters where sunlight cannot penetrate—more than seventy-five percent of marine organisms produce their own light through a biochemical process known as bioluminescence. Light emission occurs when a light-emitting molecule called luciferin is oxidized in the presence of a catalytic enzyme known as luciferase, releasing energy almost entirely as visible blue-green light with minimal heat.

Deep-sea species have evolved bioluminescence independently dozens of times to serve a remarkable variety of ecological functions. Predators such as the anglerfish dangle a glowing bacterial lure in front of their jaws to attract curious prey in pitch-black water. Conversely, mesopelagic squid and lanternfish use ventral photophores to emit light on their undersides that matches the dim downwelling light from above, a defensive camouflage technique called counterillumination that hides their silhouettes from predators swimming below.`;

const CEPHALOPOD_CAMOUFLAGE_PASSAGE = `Octopuses, cuttlefish, and squid possess the most rapid and sophisticated camouflage system in the animal kingdom, capable of altering their skin color, contrast, and three-dimensional texture in less than a second. Unlike chameleons, which change color relatively slowly through hormonal signaling, cephalopods control their skin appearance directly through their nervous system.

Embedded within a cephalopod's skin are thousands of elastic pigment-filled sacs called chromatophores, each surrounded by radial muscle fibers connected to motor neurons in the brain. When the muscles contract, the sac expands into a flat disc of red, yellow, or brown pigment; when they relax, the sac shrinks to a pinpoint. Beneath the chromatophores lie iridophores and leucophores—specialized reflective cells that scatter ambient wavelengths of light—allowing the animal to blend seamlessly into coral reefs, sandy seafloors, or kelp beds.`;

let idx = 1;
const nextId = () => makeItemId(6, idx++);

export const MERCURY_ITEMS: SeedQuestionItemRow[] = [
  // =========================================================================
  // READING MODULE 1 (bFot0R7_SsU)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Ancient Architectural Structures (Q1–10)",
    passageText:
      "Monumental stone [0] built by [1] civilizations [2] still [3] across the [4] world today. Teams of skilled mason[5] performed complex engineering [6], [7] massive limestone blocks and [8] temples that haveremained [9] for millennia.",
    blanks: [
      { index: 0, prefix: "struct", answer: "ures" },
      { index: 1, prefix: "anc", answer: "ient" },
      { index: 2, prefix: "a", answer: "re" },
      { index: 3, prefix: "fo", answer: "und" },
      { index: 4, prefix: "mod", answer: "ern" },
      { index: 5, prefix: "", answer: "s" },
      { index: 6, prefix: "ta", answer: "sks" },
      { index: 7, prefix: "carv", answer: "ing" },
      { index: 8, prefix: "build", answer: "ing" },
      { index: 9, prefix: "establ", answer: "ished" },
    ],
  }),
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Literature & Cultural Influence (Q11–20)",
    passageText:
      "Classical litera[0] continues to exert a lasting infl[1] on contemporary storytelling. By stud[2] how early authors portrayed human conflict, [3] can better understand modern themes. Whether written [4] verse or prose, works from one era [5] inspire [6] next, shaping [7] way readers refl[8] on histor[9] and human imagina[9].",
    blanks: [
      { index: 0, prefix: "litera", answer: "ture" },
      { index: 1, prefix: "infl", answer: "uence" },
      { index: 2, prefix: "stud", answer: "ying" },
      { index: 3, prefix: "th", answer: "ey" },
      { index: 4, prefix: "i", answer: "n" },
      { index: 5, prefix: "fu", answer: "rther" },
      { index: 6, prefix: "t", answer: "he" },
      { index: 7, prefix: "refl", answer: "ect" },
      { index: 8, prefix: "histor", answer: "y" },
      { index: 9, prefix: "imagina", answer: "tion" },
    ],
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Bioluminescence in Deep-Ocean Ecosystems (Q21)",
    stimulusText: BIOLUMINESCENCE_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to paragraph 1, how is light chemically produced in bioluminescent marine organisms?",
    options: [
      "Solar radiation is stored in scales during the day and released at night.",
      "High water pressure heats mineral crystals in the fish's skin.",
      "Deep-sea thermal vents charge electrical organs along the tail.",
      "A light-emitting molecule called luciferin is oxidized in the presence of the enzyme luciferase.",
    ],
    correctOptionId: "D",
    explanation:
      "Paragraph 1 states: 'Light emission occurs when a light-emitting molecule called luciferin is oxidized in the presence of a catalytic enzyme known as luciferase' (D).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Bioluminescence in Deep-Ocean Ecosystems (Q22)",
    stimulusText: BIOLUMINESCENCE_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "How does counterillumination help mesopelagic squid and lanternfish avoid predators?",
    options: [
      "It blinds predators with a sudden flash of red light.",
      "It illuminates the ocean floor so the squid can hide under rocks.",
      "Ventral photophores emit light on their undersides matching dim downwelling light, hiding their silhouettes from predators below.",
      "It attracts larger sharks that scare away smaller predators.",
    ],
    correctOptionId: "C",
    explanation:
      "Paragraph 2 explains that ventral photophores emit light on their undersides that matches dim downwelling light, hiding their silhouettes from predators swimming below (C).",
  }),

  // =========================================================================
  // READING MODULE 2 (bFot0R7_SsU: forms, to, ck, ence, ient, nd, nts, hin, ow, nisms)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Complete the Words: Geological Landforms & Soil Weathering (M2 Q1–10)",
    passageText:
      "Natural land[0] are constantly reshaped due [1] the gradual breakdown of bedro[2] in the pres[3] of water and wind. Over time, anc[4] boulders weather into fine sa[5] and mineral nutrie[6] that accumulate wit[7] topsoil, allowing plants to gr[8] and supporting diverse soil orga[9].",
    blanks: [
      { index: 0, prefix: "land", answer: "forms" },
      { index: 1, prefix: "", answer: "to" },
      { index: 2, prefix: "bedro", answer: "ck" },
      { index: 3, prefix: "pres", answer: "ence" },
      { index: 4, prefix: "anc", answer: "ient" },
      { index: 5, prefix: "sa", answer: "nd" },
      { index: 6, prefix: "nutrie", answer: "nts" },
      { index: 7, prefix: "wit", answer: "hin" },
      { index: 8, prefix: "gr", answer: "ow" },
      { index: 9, prefix: "orga", answer: "nisms" },
    ],
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Adaptive Camouflage in Cephalopods (M2 Q11)",
    stimulusText: CEPHALOPOD_CAMOUFLAGE_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "Why are cephalopods able to change their skin color much more rapidly than chameleons?",
    options: [
      "They absorb colored water directly into their bloodstream.",
      "They shed their outer layer of skin every few seconds.",
      "They live in warmer tropical waters than chameleons.",
      "Their pigment-filled chromatophores are controlled directly by motor neurons in the nervous system rather than slow hormonal signaling.",
    ],
    correctOptionId: "D",
    explanation:
      "Paragraphs 1 and 2 explain that unlike chameleons (which rely on hormonal signaling), cephalopods control their chromatophores directly through motor neurons in their nervous system (D).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Adaptive Camouflage in Cephalopods (M2 Lower Q1)",
    stimulusText: CEPHALOPOD_CAMOUFLAGE_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "What happens when the radial muscles surrounding a cephalopod's chromatophore contract?",
    options: [
      "The sac shrinks into an invisible pinpoint.",
      "The sac expands into a flat disc of visible pigment.",
      "The cell releases bioluminescent ink into the water.",
      "The skin becomes completely transparent.",
    ],
    correctOptionId: "B",
    explanation:
      "Paragraph 2 states: 'When the muscles contract, the sac expands into a flat disc of red, yellow, or brown pigment' (B).",
  }),

  // =========================================================================
  // LISTENING MODULE 1 & MODULE 2 (Transcripts from JaBx7cJYGCI / bFot0R7_SsU)
  // =========================================================================
  buildListeningItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "School Event Announcement — Goya Nature Reserve Field Trip (Q1)",
    transcript: `Narrator: Listen to an announcement at a school event.
Speaker: I want to tell you all what to expect on tomorrow's field trip to Goya Nature Reserve. You'll start your visit in the auditorium, where you'll get to hear from some experts in the field, including an ornithologist and a botanist. You'll take that information with you and use it to help you understand the wildlife you see while exploring nearby trails. Then, after lunch, there'll be two options: a mountain hike for experienced climbers only, or a trip to the tide pool for anyone interested.`,
    campusContext: "Field Trip Briefing",
    questionStem: "What will students do first when they arrive at Goya Nature Reserve?",
    options: [
      "Hear presentations from an ornithologist and a botanist in the auditorium",
      "Climb the mountain trail before lunch",
      "Collect marine specimens at the tide pool",
      "Set up tents at the campground",
    ],
    correctOptionId: "A",
    explanation:
      "The speaker states: 'You'll start your visit in the auditorium. You'll get to hear from some experts in the field, including an ornithologist and a botanist' (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Conversation — Campus Plastic Bottle Ban & Refill Stations (Q2)",
    transcript: `Woman: I heard they won't have single-use plastic bottles in vending machines anywhere on campus starting next week.
Man: Right. Something about water refill stations at different locations around campus instead.
Woman: But what if people don't remember to bring their reusable bottles?
Man: It'll just become a matter of habit, I guess. Plus, the dining halls will still have free water available all the time.
Woman: Ah, that's true. I guess I need to get myself a new reusable bottle then. My current one is cracked.
Man: The campus store's actually offering a discount on them until Friday.`,
    campusContext: "Campus Sustainability",
    questionStem: "Why does the woman need to buy a new reusable water bottle?",
    options: [
      "She lost her previous bottle on the campus shuttle.",
      "Her current reusable bottle is cracked.",
      "The dining halls charge a fee for paper cups.",
      "She wants to give one to her roommate as a gift.",
    ],
    correctOptionId: "B",
    explanation:
      "The woman says: 'I guess I need to get myself a new reusable bottle then. My current one is cracked' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Science Podcast — The Gut Microbiome & Serotonin (M2 Q1)",
    transcript: `Narrator: Listen to part of a talk on a science podcast.
Host: Have you ever experienced a sudden change in mood after you eat a meal? It's plausible that your gut microbiome played a role in that emotional shift. The microbiome is an intricate network of trillions of bacteria, fungi, and other microorganisms. We used to think of microbes primarily as pathogens, but we now recognize that microbes play an essential role in our health, strengthening the immune system and even shaping emotions. Microbes in the gut synthesize neurotransmitters—chemical messengers such as serotonin, which influences our emotional state. As research advances, doctors may soon prescribe personalized probiotic regimens tailored specifically to a patient's unique microbiome.`,
    academicDomain: "Microbiology & Neurobiology",
    questionStem:
      "According to the podcast, how do gut microbes influence a person's emotional state?",
    options: [
      "By blocking all nutrients from entering the bloodstream",
      "By synthesizing neurotransmitters such as serotonin that communicate with the nervous system",
      "By lowering body temperature after meals",
      "By replacing immune cells in the lymph nodes",
    ],
    correctOptionId: "B",
    explanation:
      "The host explains: 'Microbes in the gut synthesize neurotransmitters, chemical messengers, such as serotonin... a neurotransmitter that influences our emotional state' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Archaeology Class — Pre-Columbian Earthworks at Poverty Point (M2 Lower Q1)",
    transcript: `Narrator: Listen to a talk in an archaeology class.
Professor: Let's go back to 1700 BCE to a site now known as Poverty Point, located in what today is Louisiana in the United States. Poverty Point is a testament to the advanced engineering skills of pre-Columbian societies in North America. The builders created massive earthen mounds, including six rows of raised earth arranged in concentric half-circles stretching across 1.2 kilometers, all constructed by hand without draft animals or wheeled vehicles.`,
    academicDomain: "North American Archaeology",
    questionStem:
      "What makes the ancient site of Poverty Point in Louisiana remarkable to archaeologists?",
    options: [
      "Its massive earthen mounds arranged in concentric half-circles built around 1700 BCE",
      "Its iron skyscrapers built during the nineteenth century",
      "Its underwater stone pyramids off the Atlantic coast",
      "Its collection of printed European books",
    ],
    correctOptionId: "A",
    explanation:
      "The professor highlights that builders at Poverty Point around 1700 BCE created massive earthen mounds arranged in six concentric half-circles stretching across 1.2 kilometers (A).",
  }),

  // =========================================================================
  // WRITING SECTION (10 Build a Sentence + Email + Academic Discussion from bFot0R7_SsU)
  // =========================================================================
  buildSentenceItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 1,
    speakerAName: "Colleague",
    contextPrompt: "Who is giving the keynote address at tomorrow's symposium?",
    targetSentence: "I don't know who the speaker is yet.",
    wordBank: ["who", "I don't know", "is yet", "the speaker"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 2,
    speakerAName: "Student",
    contextPrompt: "What was the main point of the dean's opening remarks?",
    targetSentence:
      "She wanted to emphasize how technological advancements are crucial in education.",
    wordBank: [
      "how technological advancements",
      "She wanted to emphasize",
      "in education",
      "are crucial",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 3,
    speakerAName: "Guest",
    contextPrompt: "Why did you have trouble finding the reception hall?",
    targetSentence: "The invitation I received had the wrong address.",
    wordBank: ["I received", "The invitation", "the wrong address", "had"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 4,
    speakerAName: "Friend",
    contextPrompt: "Registration for the intramural tennis league closes tonight.",
    targetSentence: "Have you signed up yet?",
    wordBank: ["signed up", "Have you", "yet"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 5,
    speakerAName: "Roommate",
    contextPrompt: "Why is your backpack so heavy today?",
    targetSentence: "It has some books that I need to return to the campus library.",
    wordBank: ["that I need", "It has some books", "to the campus library", "to return"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 6,
    speakerAName: "Coworker",
    contextPrompt: "What did you get from the new deli across the street?",
    targetSentence: "I had a sandwich that was filled with vegetables.",
    wordBank: ["that was", "I had a sandwich", "with vegetables", "filled"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 7,
    speakerAName: "Lab Partner",
    contextPrompt: "Are you staying for the second panel of the seminar?",
    targetSentence: "The topic they are discussing is not relevant to my research.",
    wordBank: ["they are discussing", "The topic", "to my research", "is not relevant"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 8,
    speakerAName: "Host",
    contextPrompt: "We're having a team dinner at seven o'clock this Friday.",
    targetSentence: "I'm afraid I won't be able to make it.",
    wordBank: ["I won't", "I'm afraid", "to make it", "be able"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 9,
    speakerAName: "Friend",
    contextPrompt: "Where should we celebrate after our final exam?",
    targetSentence: "The restaurant that just opened downtown looks promising.",
    wordBank: ["that just opened", "The restaurant", "looks promising", "downtown"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 10,
    speakerAName: "Teammate",
    contextPrompt: "Did you bring the printed handouts for the workshop?",
    targetSentence: "I didn't have time to pack them this morning.",
    wordBank: ["to pack them", "I didn't have time", "this morning"],
  }),
  buildWriteEmailItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    title: "Write an Email — Recommending an Online Language Learning Platform",
    scenarioContext:
      "Your school program coordinator, Mrs. White, recently sent a message asking students for suggestions on digital resources to help incoming exchange students practice conversational English.",
    recipientRole:
      "To: Mrs. White, Program Coordinator | Subject: Online Language Learning Platform Recommendation",
    bulletPoints: [
      "Recommend a specific online language learning platform you have used.",
      "Describe two features of the platform (such as interactive speaking feedback and structured vocabulary drills) that make it effective.",
      "Offer to demonstrate the platform during next week's student orientation meeting.",
    ],
    sampleAnswer: `Dear Mrs. White,

I hope you are having a wonderful week. In response to your request for digital resource recommendations for incoming exchange students, I would like to suggest the interactive online language learning platform LinguaConnect.

I used LinguaConnect for six months while preparing for my university proficiency exams and found it exceptionally helpful. First, it offers real-time pronunciation and fluency feedback powered by speech recognition, allowing students to practice realistic campus conversations at their own pace. Second, it includes adaptive spaced-repetition vocabulary flashcards tailored to academic lectures.

I would be happy to give a brief five-minute demonstration of the platform during next week's orientation meeting if that would be helpful.

Best regards,
Jamie Chen`,
  }),
  buildAcademicDiscussionItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    title: "Writing for an Academic Discussion — Addressing Urban Environmental Pollution",
    courseName: "Environmental Policy 301: Urban Sustainability",
    professorName: "Dr. पटेल (Dr. Patel)",
    professorPrompt:
      "Municipal governments with limited environmental budgets often have to prioritize which form of pollution to tackle first. Some policy experts argue that cities should focus primarily on reducing urban air pollution from vehicles and industry, while others contend that protecting freshwater supplies and upgrading wastewater treatment should take top priority. Which area should cities prioritize, and why?",
    studentPosts: [
      {
        authorName: "Claire",
        avatarSeed: "claire-mercury",
        text: "I believe cities must prioritize reducing air pollution first. Millions of urban residents breathe polluted air every single minute, leading to asthma, cardiovascular disease, and climate-warming greenhouse gas emissions. Expanding electric public transit and clean energy cleans the air immediately.",
      },
      {
        authorName: "Liam",
        avatarSeed: "liam-mercury",
        text: "While air quality matters, clean water infrastructure is even more fundamental. Without safe drinking water and modern wastewater treatment, waterborne diseases and toxic runoff can devastate both human communities and aquatic ecosystems.",
      },
    ],
    keyPointsToCover: [
      "State a clear position on whether urban air pollution or water quality infrastructure should be prioritized.",
      "Respond to Claire's or Liam's points with specific public health and environmental reasoning.",
      "Demonstrate strong organization and syntactic variety.",
    ],
    sampleAnswer: `While Liam rightly emphasizes the necessity of safe water infrastructure, I agree with Claire that most modern metropolitan areas should prioritize reducing urban air pollution from transportation and industrial emissions.

In the majority of developed and rapidly industrializing cities, municipal water treatment systems already provide basic filtration, whereas ambient air pollution remains an inescapable daily hazard. Fine particulate matter and nitrogen oxides from traffic penetrate deep into the lungs and bloodstream of every resident, causing chronic respiratory illnesses and millions of premature deaths annually. Furthermore, policies that curb urban air pollution—such as electrifying bus fleets, expanding metro networks, and transitioning away from coal and diesel—simultaneously reduce carbon emissions and prevent acid rain from contaminating local watersheds. Thus, investing in clean air delivers immediate public health gains while indirectly protecting water ecosystems as well.`,
  }),

  // =========================================================================
  // SPEAKING SECTION (7 Listen & Repeat + 4 Take an Interview from bFot0R7_SsU)
  // =========================================================================
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 1,
    scenarioTitle: "Culinary Training — Preparing a Fresh Salad",
    sentence: "Begin by washing the vegetables.",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 2,
    scenarioTitle: "Culinary Training — Preparing a Fresh Salad",
    sentence: "Carefully chop the salad ingredients.",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 3,
    scenarioTitle: "Culinary Training — Preparing a Fresh Salad",
    sentence: "Collect the chopped vegetables and place them together.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 4,
    scenarioTitle: "Culinary Training — Preparing a Fresh Salad",
    sentence: "Slowly add the dressing so the salad does not get soggy.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 5,
    scenarioTitle: "Culinary Training — Preparing a Fresh Salad",
    sentence: "Toss everything together thoroughly so the flavors are mixed.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 6,
    scenarioTitle: "Culinary Training — Preparing a Fresh Salad",
    sentence: "Put any leftovers in a food container and place in the fridge for later.",
    responseSeconds: 11,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 7,
    scenarioTitle: "Culinary Training — Preparing a Fresh Salad",
    sentence: "When you have finished, be sure to clean up so the kitchen stays neat and clean.",
    responseSeconds: 12,
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 1,
    interviewTopic: "Cooking Habits & Culinary Education",
    questionText:
      "Thank you for joining our study on cooking habits. First, how often do you cook meals at home, and what kinds of dishes do you enjoy making?",
    expectedKeyPhrases: ["cook at home", "vegetables", "stir-fry", "pasta", "healthy"],
    sampleAnswer:
      "I cook meals at home almost every evening during the week. I especially enjoy making quick vegetable stir-fries, pasta dishes, and fresh salads because they are nutritious, affordable, and take less than thirty minutes to prepare.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 2,
    interviewTopic: "Cooking Habits & Culinary Education",
    questionText:
      "When you are learning to prepare a new recipe, do you prefer following a written cookbook, watching cooking videos online, or learning from a family member? Why?",
    expectedKeyPhrases: ["cooking videos", "visual", "technique", "step by step", "family"],
    sampleAnswer:
      "I prefer watching short cooking videos online when learning a new dish, combined with tips from my parents. Seeing each step visually—like how finely to chop ingredients or when a sauce has thickened properly—makes it much easier to follow than reading text alone.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 3,
    interviewTopic: "Cooking Habits & Culinary Education",
    questionText:
      "Some educators believe that culinary skills and nutrition should be a mandatory subject in middle and high schools. Do you agree or disagree with this idea?",
    expectedKeyPhrases: ["mandatory", "nutrition", "life skill", "self-sufficient", "health"],
    sampleAnswer:
      "I strongly agree that basic cooking and nutrition should be taught in schools. Knowing how to prepare balanced, hygienic meals on a budget is a fundamental life skill that promotes lifelong health and self-sufficiency once students leave home.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: MERCURY_BLUEPRINT_ID,
    questionNumber: 4,
    interviewTopic: "Cooking Habits & Culinary Education",
    questionText:
      "Finally, how do you think meal-kit delivery services and food delivery apps are changing traditional family dining habits?",
    expectedKeyPhrases: ["delivery apps", "meal kits", "convenience", "portion", "busy"],
    sampleAnswer:
      "Meal-kit services and food delivery apps have made weeknight dining much more convenient for busy households. Meal kits actually encourage people to cook at home with pre-measured ingredients, though over-relying on restaurant delivery apps can reduce family cooking traditions and increase packaging waste.",
  }),
];

export const MERCURY_BLUEPRINT: SeedBlueprintRow = {
  id: MERCURY_BLUEPRINT_ID,
  title: "Mercury | Full Test",
  slug: "mercury-full-test-2026",
  description:
    "Independent TOEFL iBT 2026-Style Practice Test #6 (Mercury — Video bFot0R7_SsU). Features Reading (Ancient Structures, Literary Influence, Deep-Ocean Bioluminescence, Geological Landforms, Cephalopod Camouflage), Listening (Goya Nature Reserve, Plastic Bottle Ban, Gut Microbiome, Poverty Point Earthworks), Writing (10 Build a Sentence, Email to Mrs. White, Urban Pollution Discussion), and Speaking (Kitchen Salad Prep & Cooking Interview).",
  exam_Type: "full_mock",
  total_Duration_Seconds: 5160,
  blueprint_Json: {
    sections: [
      {
        section: "reading",
        order: 1,
        durationSeconds: 1620,
        moduleCount: 2,
        questionCount: 7,
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
    planetName: "Mercury",
    videoUrl: "https://youtu.be/bFot0R7_SsU",
    videoId: "bFot0R7_SsU",
    playlistUrl: "https://youtube.com/playlist?list=PLoDNaUsnugSqgJGJKo59X49nkQbwcksMV",
    difficultyLabel: "Standard 2026 Practice",
  },
  is_Published: true,
  created_At: "2026-09-06T10:00:00.000Z",
};
