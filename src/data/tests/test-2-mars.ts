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

export const MARS_BLUEPRINT_ID = "f2000000-0000-4000-8000-000000000002";

const BOOKSTORE_NOTICE_STIMULUS = `CAMPUS BOOKSTORE — FALL SEMESTER TEXTBOOK RETURN POLICY

Students who wish to return or exchange textbooks purchased for the Fall semester must do so within 14 calendar days of the first day of classes.

Requirements for a Full Refund:
• Original printed or digital receipt must be presented at the Customer Service counter.
• New textbooks must be completely free of highlighting, handwriting, or water damage.
• Shrink-wrapped bundles and digital access codes cannot be returned once opened or scratched off.

After the 14-day window closes, textbooks may only be sold back during Finals Week under our standard Campus Buyback Program at up to 50% of the original purchase price.`;

const URBAN_HEAT_ISLANDS_PASSAGE = `Rapid urbanization has transformed natural landscapes of soil and vegetation into dense concentrations of asphalt, concrete, and steel. One of the most significant environmental consequences of this transformation is the urban heat island (UHI) effect, a phenomenon in which metropolitan areas experience noticeably warmer temperatures than surrounding rural regions. During clear, calm summer nights, the temperature difference between a city center and nearby countryside can reach as much as five to ten degrees Celsius.

Several physical mechanisms drive the formation of urban heat islands. Dark, impermeable surfaces such as rooftops and paved roads have a low albedo, meaning they absorb a large fraction of incoming solar radiation rather than reflecting it back into the atmosphere. These materials also possess high thermal heat capacity, storing heat throughout the day and slowly releasing it after sunset. Furthermore, the replacement of trees and grasslands with buildings drastically reduces evapotranspiration—the natural cooling process by which plants release water vapor through their leaves—while waste heat from vehicles, air-conditioning units, and industrial facilities adds additional thermal energy to the urban air canopy.

To mitigate the public health and energy burdens associated with elevated urban temperatures, city planners are increasingly turning to green infrastructure. Installing vegetative "green roofs," planting shade trees along pedestrian corridors, and resurfacing streets with high-albedo reflective coatings can significantly lower ambient surface temperatures. Studies show that expanding urban tree cover by just twenty percent can reduce neighborhood cooling energy demand by up to fifteen percent while simultaneously improving stormwater retention and local air quality.`;

const MESOPOTAMIAN_TRADE_PASSAGE = `Although ancient Mesopotamia possessed fertile alluvial soils watered by the Tigris and Euphrates rivers, the region was remarkably scarce in essential raw materials such as timber, building stone, copper, tin, and precious gems. To sustain its monumental architecture and bronze metallurgy, Mesopotamian city-states developed sophisticated long-distance trade networks stretching from Anatolia and the Levant to the Iranian plateau and the Indus Valley as early as the third millennium BCE.

Both riverine and overland routes facilitated the movement of goods. Bulk commodities such as grain, dried fish, and woven woolen textiles—Mesopotamia's primary exports—were transported efficiently along canals and rivers on wooden barges. Meanwhile, donkey caravans traversed rugged mountain passes to import Anatolian silver and Afghan lapis lazuli, while seafaring vessels sailed through the Persian Gulf to trade with the merchant ports of Dilmun and Magan, which supplied vast quantities of copper ingots.

This economic interdependence catalyzed major administrative innovations. Merchants and temple officials utilized cuneiform clay tablets, cylinder seals, and standardized weights based on the talent and shekel to record contracts, verify cargo authenticity, and finance commercial expeditions. In doing so, long-distance trade not only supplied Mesopotamia with vital physical resources but also fostered cultural and technological exchange across the ancient Near East.`;

const CONFIRMATION_BIAS_TRANSCRIPT = `Narrator: Listen to part of a psychology podcast.
Host: My brother Alex had always wanted to get a cat. He likes cats better than dogs. One day, he sent me an online article titled "Which Pet Is Right for You?" and said, "See, even experts agree cats are better." But when I read the article, nowhere did it say that. The article presented balanced facts: dogs are loyal and trainable, while cats are independent and low maintenance. My brother was not being dishonest. He simply focused only on the parts that praised cats and skimmed over or dismissed the parts that highlighted dogs' advantages. This is called confirmation bias. Our brains are lazy; they like consistency. Information that aligns with what we already know is easier to understand and less mentally taxing, so our brains seek it out and filter out the rest. This affects the decisions we make in our daily lives as well. Scientists are not immune to confirmation bias. Researchers may unintentionally design experiments or interpret data in ways that support their hypothesis, overlooking results that do not fit their expectations. Flawed conclusions in scientific studies can lead to serious consequences. So, what can we do to minimize confirmation bias? The first step is to recognize the existence of confirmation bias—you might be biased. Then actively seek out information that challenges your beliefs. Don't only talk with people who hold the same views as you. And slow down—don't make hasty decisions.`;

const HEROS_JOURNEY_TRANSCRIPT = `Narrator: Listen to a talk in a literature class.
Professor: So today we're looking at the hero's journey, a storytelling pattern that shows up in myths, literature, and stories from all over the world. This structure was brought into the spotlight by Joseph Campbell, an American mythologist. In his book The Hero with a Thousand Faces, Campbell studied myths across cultures and noticed they shared a common structure. Campbell called it the monomyth, and he believed it reflected something universal about the human experience. A journey usually kicks off with a call to adventure, some kind of invitation that pulls the hero out of their everyday life. They might resist at first, but eventually they accept, often with a mentor's help. Then come the trials—tests that push the hero to grow. At the center of it all is the abyss, the toughest part, where the hero faces their greatest fear or enemy. If they make it through, they're transformed. And here's the key part: they return with a gift—some kind of insight, wisdom, or ability that can help others. That gift is what makes the journey meaningful, not just for the hero, but for their community. Now, some critics argue this model oversimplifies storytelling. It can flatten out cultural differences and force diverse stories into a single mold. Still, I'd argue it's influential because it taps into something deeply human: the idea that struggle leads to growth and that we come back changed.`;

const POTTERY_EVOLUTION_TRANSCRIPT = `Narrator: Listen to a talk in an anthropology class.
Professor: Previously, we discussed the significance of pottery to ancient cultures, including pottery as an art form and pottery's crucial role in trade. Today, we'll focus on the development of pottery over time. One breakthrough was the invention of the potter's wheel around 3500 BCE in Mesopotamia. Before this, pottery was shaped mostly by hand, which was slow and produced less uniform results. The potter's wheel allowed artisans to spin and shape the clay more quickly and evenly, making it possible to create symmetrical vessels with greater precision and speed. Firing technology also advanced. Early pots were fired in open pits, which limited temperature control, resulting in uneven or fragile pots. So kilns were developed—enclosed ovens that could reach higher and more consistent temperatures. These allowed for stronger, more durable pottery. Another advance was the updraft kiln, which directed heat upward through the chamber. By adjusting the airflow, potters could control how much oxygen reached the fire. This helped them produce pottery with specific colors, like red or black, depending on how the clay reacted to the firing atmosphere. Then, in ancient China, potters developed kilns that could reach very high temperatures. This allowed them to create stoneware and eventually porcelain. Porcelain is made from a special mix of fine clay and minerals and must be fired at temperatures above 1,200 degrees Celsius. The result is a smooth, white ceramic that is strong, lightweight, and slightly translucent. Porcelain was a major breakthrough because it was more durable and versatile than earlier pottery.`;

const STARTUP_INCUBATORS_TRANSCRIPT = `Narrator: Listen to a talk in a business class.
Professor: Let's discuss the role of business incubators in supporting new businesses. These are programs designed to help startups navigate the early stages of development and increase their chances of success by providing resources, mentorship, and networking. To supply resources that a new business might lack, incubators often provide shared office space and administrative support to help startups get off the ground. And they also steer new businesses toward funding opportunities, connecting founders with angel investors and venture capital firms. Experienced mentors advise entrepreneurs on refining their business models and avoiding costly early mistakes.`;

let idx = 1;
const nextId = () => makeItemId(2, idx++);

export const MARS_ITEMS: SeedQuestionItemRow[] = [
  // =========================================================================
  // READING MODULE 1 (Qyxo41WZwb4)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: European Narrative Literature (Q1–10)",
    passageText:
      "Miguel de Cervantes' Don Quixote [0] widely [1] one [2] the [3] works [4] the [5] of [6] literature. Published in the early seventeenth century, the novel [7] a complex [8] structure that blends satire, realism, [9] psychological depth.",
    blanks: [
      { index: 0, prefix: "", answer: "is" },
      { index: 1, prefix: "consi", answer: "dered" },
      { index: 2, prefix: "", answer: "of" },
      { index: 3, prefix: "grea", answer: "test" },
      { index: 4, prefix: "", answer: "in" },
      { index: 5, prefix: "his", answer: "tory" },
      { index: 6, prefix: "Euro", answer: "pean" },
      { index: 7, prefix: "estab", answer: "lishes" },
      { index: 8, prefix: "narr", answer: "ative" },
      { index: 9, prefix: "", answer: "and" },
    ],
  }),
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Critical Thinking in Higher Education (Q11–20)",
    passageText:
      "Critical [0] enables university [1] to [2] complex problems [3] rather than relying on passive memorization. By evaluating [4] from multiple perspectives, learners can [5] meaningful connections [6] theory and practice. They [7] learn to recognize underlying assumptions that [8] embedded in arguments, [9] experienced researchers do.",
    blanks: [
      { index: 0, prefix: "thin", answer: "king" },
      { index: 1, prefix: "stud", answer: "ents" },
      { index: 2, prefix: "appr", answer: "oach" },
      { index: 3, prefix: "systema", answer: "tically" },
      { index: 4, prefix: "inform", answer: "ation" },
      { index: 5, prefix: "ma", answer: "ke" },
      { index: 6, prefix: "betw", answer: "een" },
      { index: 7, prefix: "al", answer: "so" },
      { index: 8, prefix: "a", answer: "re" },
      { index: 9, prefix: "li", answer: "ke" },
    ],
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Read in Daily Life: Campus Bookstore Return Policy (Q21)",
    formatType: "notice",
    senderName: "University Campus Bookstore",
    senderHandle: "returns@bookstore.edu",
    subject: "Fall Semester Textbook Return Policy",
    dateLabel: "September 2",
    stimulusText: BOOKSTORE_NOTICE_STIMULUS,
    questionStem:
      "Within what time period must students return a textbook to receive a full refund?",
    options: [
      "Within 7 days of purchasing the book",
      "Within 14 calendar days of the first day of classes",
      "At any point before midterm exams begin",
      "During Finals Week at the end of the semester",
    ],
    correctOptionId: "B",
    explanation:
      "The notice states: 'Students who wish to return or exchange textbooks purchased for the Fall semester must do so within 14 calendar days of the first day of classes' (B).",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Read in Daily Life: Campus Bookstore Return Policy (Q22)",
    formatType: "notice",
    senderName: "University Campus Bookstore",
    senderHandle: "returns@bookstore.edu",
    subject: "Fall Semester Textbook Return Policy",
    dateLabel: "September 2",
    stimulusText: BOOKSTORE_NOTICE_STIMULUS,
    questionStem: "Which of the following items CANNOT be returned for a refund?",
    options: [
      "A new textbook accompanied by a digital receipt",
      "A hardcover textbook purchased on the first day of classes",
      "An unopened shrink-wrapped textbook bundle",
      "A shrink-wrapped bundle that has been opened or a scratched-off digital access code",
    ],
    correctOptionId: "D",
    explanation:
      "The third bullet point specifies: 'Shrink-wrapped bundles and digital access codes cannot be returned once opened or scratched off' (D).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Urban Heat Islands and Green Infrastructure (Q23)",
    stimulusText: URBAN_HEAT_ISLANDS_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to paragraph 2, why do dark asphalt roads and rooftops contribute to the urban heat island effect?",
    options: [
      "They have a low albedo and high thermal heat capacity, absorbing solar radiation and releasing heat slowly after sunset.",
      "They reflect most incoming sunlight directly into upper atmospheric clouds.",
      "They accelerate evapotranspiration from surrounding soil.",
      "They prevent vehicles from emitting exhaust heat.",
    ],
    correctOptionId: "A",
    explanation:
      "Paragraph 2 explains that dark, impermeable surfaces have a low albedo (absorbing solar radiation) and high thermal heat capacity (storing heat and releasing it after sunset) (A).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Urban Heat Islands and Green Infrastructure (Q24)",
    stimulusText: URBAN_HEAT_ISLANDS_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to paragraph 2, how does replacing vegetation with buildings affect natural cooling?",
    options: [
      "It increases night-time wind speeds across city streets.",
      "It raises the albedo of downtown sidewalks.",
      "It eliminates waste heat from air-conditioning systems.",
      "It drastically reduces evapotranspiration, the process by which plants release cooling water vapor.",
    ],
    correctOptionId: "D",
    explanation:
      "Paragraph 2 states that replacing trees and grasslands with buildings 'drastically reduces evapotranspiration—the natural cooling process by which plants release water vapor through their leaves' (D).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Urban Heat Islands and Green Infrastructure (Q25)",
    stimulusText: URBAN_HEAT_ISLANDS_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to paragraph 3, what is one documented benefit of expanding urban tree cover by twenty percent?",
    options: [
      "Eliminating the need for stormwater drainage systems entirely",
      "Lowering rural temperatures by ten degrees Celsius",
      "Reducing neighborhood cooling energy demand by up to fifteen percent",
      "Doubling the lifespan of asphalt roadways",
    ],
    correctOptionId: "C",
    explanation:
      "Paragraph 3 states: 'expanding urban tree cover by just twenty percent can reduce neighborhood cooling energy demand by up to fifteen percent' (C).",
  }),

  // =========================================================================
  // READING MODULE 2 (Qyxo41WZwb4: King, ularly, nd, de, ients, ier, so, mth, der, wing)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Complete the Words: Monarch Butterfly Migration & Thermal Currents (M2 Q1–10)",
    passageText:
      "Every autumn, millions of monarch butterflies embark on a [0] journey across North America, [1] traveling over three thousand miles to reach overwintering forests in central Mexico. Along the way, they [2] shelter in groves of trees when temperatures drop [3] freezing. To conserve energy, monarchs rely on rising air [4] known as thermals, which make long-distance flight [5] on their delicate wings. They [6] cluster together on branches for [7], huddling [8] dense canopies before taking [9] again each sunny morning.",
    blanks: [
      { index: 0, prefix: "breathta", answer: "king" },
      { index: 1, prefix: "reg", answer: "ularly" },
      { index: 2, prefix: "fi", answer: "nd" },
      { index: 3, prefix: "besi", answer: "de" },
      { index: 4, prefix: "grad", answer: "ients" },
      { index: 5, prefix: "eas", answer: "ier" },
      { index: 6, prefix: "al", answer: "so" },
      { index: 7, prefix: "war", answer: "mth" },
      { index: 8, prefix: "un", answer: "der" },
      { index: 9, prefix: "", answer: "wing" },
    ],
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Ancient Mesopotamian Trade Networks (M2 Q11)",
    stimulusText: MESOPOTAMIAN_TRADE_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "Why did ancient Mesopotamian city-states need to establish extensive long-distance trade networks?",
    options: [
      "The region lacked essential raw materials such as timber, building stone, copper, and tin.",
      "The Tigris and Euphrates rivers were too shallow for agriculture.",
      "Mesopotamian artisans did not know how to weave woolen textiles.",
      "Local laws prohibited mining within city boundaries.",
    ],
    correctOptionId: "A",
    explanation:
      "Paragraph 1 states that Mesopotamia 'was remarkably scarce in essential raw materials such as timber, building stone, copper, tin, and precious gems' (A).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Ancient Mesopotamian Trade Networks (M2 Q12)",
    stimulusText: MESOPOTAMIAN_TRADE_PASSAGE,
    questionSubType: "factual",
    questionStem: "According to paragraph 2, what were Mesopotamia's primary exports?",
    options: [
      "Silver and lapis lazuli",
      "Copper ingots and cedar timber",
      "Grain, dried fish, and woven woolen textiles",
      "Porcelain vessels and silk fabrics",
    ],
    correctOptionId: "C",
    explanation:
      "Paragraph 2 identifies 'Bulk commodities such as grain, dried fish, and woven woolen textiles—Mesopotamia's primary exports' (C).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Ancient Mesopotamian Trade Networks (M2 Lower Q1)",
    stimulusText: MESOPOTAMIAN_TRADE_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to paragraph 3, what tools did Mesopotamian merchants use to record contracts and verify cargo?",
    options: [
      "Papyrus scrolls and wax stamps",
      "Cuneiform clay tablets, cylinder seals, and standardized weights",
      "Printed paper ledgers and gold coins",
      "Carved wooden tallies",
    ],
    correctOptionId: "B",
    explanation:
      "Paragraph 3 states that merchants utilized 'cuneiform clay tablets, cylinder seals, and standardized weights based on the talent and shekel' (B).",
  }),

  // =========================================================================
  // LISTENING MODULE 1 (Exact transcripts from Qyxo41WZwb4)
  // =========================================================================
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Conversation — Campus Festival & Food Trucks (Q1)",
    transcript: `Woman: Are you going to the campus festival this Saturday? Do you know when it starts?
Man: It kicks off at 3:00 p.m. That's perfect. Oh, I remember hearing that there'll be food trucks.
Woman: Oh, right! And a dance floor.
Man: No way! You can't keep us away. Let's get there early so we can get a good spot.`,
    campusContext: "Campus Festival",
    questionStem: "What features of the campus festival do the speakers mention?",
    options: [
      "A debate tournament and art auction",
      "Food trucks and a dance floor",
      "A marathon race and swimming competition",
      "A textbook sale and career panel",
    ],
    correctOptionId: "B",
    explanation:
      "The speakers specifically mention that there will be food trucks and a dance floor starting at 3:00 p.m. (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Classroom Announcement — Weekly Reading Response Papers (Q2)",
    transcript: `Narrator: Listen to an announcement in a classroom.
Professor: I want to remind you all that we will have a paper due every Friday. The paper should be a response to the week's reading and should be at least two pages long. Papers should be uploaded to the class portal on Fridays by 5:00 p.m. I will grade them and send you feedback by the end of the weekend. Late papers will be marked down by one letter grade each day unless you speak with me ahead of time and receive an extension.`,
    campusContext: "University Seminar",
    questionStem:
      "What is the penalty for submitting a weekly response paper late without a prior extension?",
    options: [
      "The paper receives an automatic zero.",
      "The student must write an extra five-page essay.",
      "The paper is marked down by one letter grade for each day it is late.",
      "The student is dropped from the course portal.",
    ],
    correctOptionId: "C",
    explanation:
      "The professor states: 'Late papers will be marked down by one letter grade each day unless you speak with me ahead of time and receive an extension' (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "School Radio Announcement — Work-Study Application Portal (Q3)",
    transcript: `Narrator: Listen to a school radio announcement.
Announcer: Attention students. We apologize for the inconvenience caused by the recent changes to our work-study program application process. Unfortunately, due to system issues, some applications were not processed properly. We are working to resolve this problem as quickly as possible. Please resubmit your applications through the updated portal and phone the career center if you encounter any further issues. Additionally, we're pleased to announce several new part-time work opportunities available on campus. Just stop by the center to learn more.`,
    campusContext: "Campus Career Center",
    questionStem: "What are students who applied to the work-study program asked to do?",
    options: [
      "Wait until next semester to apply again",
      "Resubmit their applications through the updated online portal",
      "Mail a printed copy of their transcript to the financial aid office",
      "Attend a mandatory orientation on Saturday morning",
    ],
    correctOptionId: "B",
    explanation:
      "The announcer instructs students: 'Please resubmit your applications through the updated portal and phone the career center if you encounter any further issues' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Classroom Announcement — Corrected Syllabus Deadlines (Q4)",
    transcript: `Narrator: Listen to an announcement in a classroom.
Professor: Good afternoon, students. I'm sorry for the confusion regarding the deadlines for your upcoming assignment. As I wrote in this morning's email, the due dates on your syllabus are incorrect. Your research paper is actually due on Wednesday, the 31st, and your group presentations are due the following Friday. I regret any inconvenience this has caused. On the other hand, this means you have some extra time to complete your assignments. If you have any questions, feel free to reach out during office hours.`,
    campusContext: "Lecture Hall",
    questionStem: "How does the correction to the syllabus affect the students?",
    options: [
      "They must submit their research papers earlier than expected.",
      "The group presentation has been canceled entirely.",
      "They have extra time to complete their research paper and group presentation.",
      "They have to take an additional midterm exam on Wednesday.",
    ],
    correctOptionId: "C",
    explanation:
      "The professor says: 'On the other hand, this means you have some extra time to complete your assignments' (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Psychology Podcast — Confirmation Bias (Q5)",
    transcript: CONFIRMATION_BIAS_TRANSCRIPT,
    academicDomain: "Cognitive Psychology",
    questionStem:
      "Why does the speaker tell the story about his brother Alex reading the pet article?",
    options: [
      "To prove that cats are objectively better pets than dogs",
      "To illustrate how confirmation bias causes people to focus only on information that supports their existing beliefs",
      "To show that online articles are usually written by unreliable authors",
      "To explain why his brother decided not to adopt a pet",
    ],
    correctOptionId: "B",
    explanation:
      "Alex read a balanced article about dogs and cats but focused only on the parts praising cats and dismissed the parts praising dogs—a classic example of confirmation bias (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Psychology Podcast — Confirmation Bias (Q6)",
    transcript: CONFIRMATION_BIAS_TRANSCRIPT,
    academicDomain: "Cognitive Psychology",
    questionStem:
      "According to the speaker, what is one strategy for minimizing confirmation bias?",
    options: [
      "Making decisions as quickly as possible based on intuition",
      "Discussing topics only with people who share your opinions",
      "Actively seeking out information that challenges your existing beliefs",
      "Avoiding scientific articles altogether",
    ],
    correctOptionId: "C",
    explanation:
      "The speaker advises: 'The first step is to recognize the existence of confirmation bias... Then actively seek out information that challenges your beliefs' (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Literature Class — Joseph Campbell's Hero's Journey (Q7)",
    transcript: HEROS_JOURNEY_TRANSCRIPT,
    academicDomain: "Comparative Literature",
    questionStem:
      "According to the professor, what makes the hero's journey meaningful for the hero's community?",
    options: [
      "The hero refuses the call to adventure and stays home.",
      "The hero returns from the abyss with a gift—insight, wisdom, or ability that helps others.",
      "The mentor defeats the enemy on the hero's behalf.",
      "The story is written in ancient verse.",
    ],
    correctOptionId: "B",
    explanation:
      "The professor states: 'And here's the key part: they return with a gift—some kind of insight, wisdom, or ability that can help others. That gift is what makes the journey meaningful, not just for the hero, but for their community' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Literature Class — Joseph Campbell's Hero's Journey (Q8)",
    transcript: HEROS_JOURNEY_TRANSCRIPT,
    academicDomain: "Comparative Literature",
    questionStem: "What criticism of Joseph Campbell's monomyth model does the professor mention?",
    options: [
      "It only applies to modern science fiction movies.",
      "It is too complicated for undergraduate students to understand.",
      "It can oversimplify storytelling and flatten out cultural differences by forcing diverse stories into a single mold.",
      "It ignores the role of trials and challenges in character growth.",
    ],
    correctOptionId: "C",
    explanation:
      "The professor notes: 'some critics argue this model oversimplifies storytelling. It can flatten out cultural differences and force diverse stories into a single mold' (C).",
  }),

  // =========================================================================
  // LISTENING MODULE 2 (Exact transcripts from Qyxo41WZwb4)
  // =========================================================================
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_choose_response",
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Listen and Choose a Response — Class Presentation (M2 Q1)",
    transcript: "Woman: I loved your class presentation.",
    questionStem: "Choose the best response to what you heard.",
    options: [
      "Thanks! I spent a lot of time researching that topic.",
      "The presentation is next Tuesday.",
      "No, I haven't bought a present yet.",
      "It's in the main auditorium.",
    ],
    correctOptionId: "A",
    explanation:
      "'Thanks! I spent a lot of time researching that topic' is the appropriate response to a compliment on a class presentation (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Conversation — Dormitory Kitchen Renovation (M2 Q2)",
    transcript: `Woman: Have you heard they're finally updating the kitchen in the student lounge of this dormitory?
Man: It's about time! What are they doing?
Woman: Well, for one, all of the appliances are being replaced.
Man: Oh, that's great. The microwave hasn't been working properly for a while.
Woman: I heard they're replacing some of the cabinets, too.
Man: I hope it doesn't take too long. I cook there a lot.
Woman: Me, too. I think we'll have access to the place in the dorm next door, though.`,
    campusContext: "University Housing",
    questionStem:
      "Where does the woman think students will be able to cook while their dorm kitchen is being renovated?",
    options: [
      "In the main campus dining hall kitchen",
      "In the kitchen of the dormitory next door",
      "At an off-campus culinary school",
      "In the chemistry building lounge",
    ],
    correctOptionId: "B",
    explanation:
      "The woman says: 'I think we'll have access to the place in the dorm next door, though' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Conversation — Lisa's Guitar Lessons (M2 Q3)",
    transcript: `Man: Lisa, you've been taking guitar lessons, right? How's that going?
Woman: It's good! I'm having fun, and there are four or five songs that I can play pretty well now.
Man: I've been thinking about taking lessons too. I just finished a big work project, so I've got some spare time.
Woman: If you'll wait here a minute, I'll give you my teacher's information. She's great.
Man: Do you do it online or in person?
Woman: I took a few lessons in person to get started—it's helpful to have someone show you some basic things—but now we do it online and it works well.`,
    campusContext: "Student Union",
    questionStem: "How did Lisa structure her guitar lessons?",
    options: [
      "She has only ever taken group classes at a music conservatory.",
      "She started with online videos and later switched to in-person lessons.",
      "She took a few lessons in person to learn the basics and now takes lessons online.",
      "She taught herself using a book without an instructor.",
    ],
    correctOptionId: "C",
    explanation:
      "Lisa explains: 'I took a few lessons in person to get started—it's helpful to have someone show you some basic things—but now we do it online and it works well' (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Anthropology Class — Evolution of Pottery & Kilns (M2 Q4)",
    transcript: POTTERY_EVOLUTION_TRANSCRIPT,
    academicDomain: "Anthropology / Archaeology",
    questionStem:
      "How did the updraft kiln allow ancient potters to control the color of their pottery?",
    options: [
      "By adding synthetic chemical dyes after the pots cooled",
      "By adjusting the airflow to control how much oxygen reached the fire",
      "By submerging hot pots into cold river water",
      "By spinning the clay faster on the potter's wheel",
    ],
    correctOptionId: "B",
    explanation:
      "The professor states: 'By adjusting the airflow, potters could control how much oxygen reached the fire. This helped them produce pottery with specific colors, like red or black' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Anthropology Class — Evolution of Pottery & Kilns (M2 Q5)",
    transcript: POTTERY_EVOLUTION_TRANSCRIPT,
    academicDomain: "Anthropology / Archaeology",
    questionStem:
      "According to the professor, what was required to produce porcelain in ancient China?",
    options: [
      "Firing a special mix of fine clay and minerals at temperatures above 1,200 degrees Celsius",
      "Drying coarse river mud in open pits under the sun",
      "Mixing bronze shavings into Mesopotamian clay",
      "Baking vessels at low temperatures for several weeks",
    ],
    correctOptionId: "A",
    explanation:
      "The professor states: 'Porcelain is made from a special mix of fine clay and minerals and must be fired at temperatures above 1,200 degrees Celsius' (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Business Class — Startup Incubators (M2 Lower Q1)",
    transcript: STARTUP_INCUBATORS_TRANSCRIPT,
    academicDomain: "Business & Entrepreneurship",
    questionStem:
      "According to the professor, how do business incubators help early-stage startups?",
    options: [
      "By purchasing established corporations on the stock exchange",
      "By providing office space, mentorship, networking, and connections to funding opportunities",
      "By guaranteeing government tax exemptions for ten years",
      "By manufacturing consumer electronics overseas",
    ],
    correctOptionId: "B",
    explanation:
      "The professor explains that business incubators provide office space, mentorship, networking, and steer new businesses toward funding opportunities (B).",
  }),

  // =========================================================================
  // WRITING SECTION (10 Build a Sentence + Email to Mr. Davis + Academic Discussion from Qyxo41WZwb4)
  // =========================================================================
  buildSentenceItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 1,
    speakerAName: "Liam",
    contextPrompt: "What did your new academic advisor ask you during the meeting?",
    targetSentence:
      "He was curious to find out what types of reading I enjoyed in last semester's class.",
    wordBank: [
      "what types of reading",
      "He was curious",
      "in last semester's class",
      "to find out",
      "I enjoyed",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 2,
    speakerAName: "Hannah",
    contextPrompt: "Should we reserve our festival passes right now?",
    targetSentence: "Wait until Friday to book the tickets when the festival schedule comes out.",
    wordBank: [
      "to book the tickets",
      "Wait until Friday",
      "comes out",
      "when the festival schedule",
    ],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 3,
    speakerAName: "Noah",
    contextPrompt: "I'm helping Sarah set up the dining room for tonight.",
    targetSentence: "Do you know how many people she invited to the dinner party?",
    wordBank: ["how many people", "Do you know", "to the dinner party", "she invited"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 4,
    speakerAName: "Maya",
    contextPrompt: "How was the newly renovated lecture theater?",
    targetSentence: "The seats were much more comfortable than I expected.",
    wordBank: ["much more", "The seats were", "than I expected", "comfortable"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 5,
    speakerAName: "Ethan",
    contextPrompt: "What is the main focus of your management research group?",
    targetSentence: "We want to learn what makes successful companies different from others.",
    wordBank: ["what makes", "We want to learn", "different from others", "successful companies"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 6,
    speakerAName: "Chloe",
    contextPrompt: "Your bibliography on renewable grids was really thorough.",
    targetSentence: "Could you tell me where you found the articles you used in your paper?",
    wordBank: ["where you found", "Could you tell me", "you used in your paper", "the articles"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 7,
    speakerAName: "Lucas",
    contextPrompt: "I need to take the campus shuttle on Saturday morning.",
    targetSentence: "Can you tell me how often the bus runs on weekends?",
    wordBank: ["how often", "Can you tell me", "on weekends", "the bus runs"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 8,
    speakerAName: "Zoe",
    contextPrompt: "Are we ready to pack up the office furniture?",
    targetSentence: "I need to know when the movers are arriving tomorrow.",
    wordBank: ["when", "I need to know", "are arriving tomorrow", "the movers"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 9,
    speakerAName: "Owen",
    contextPrompt: "What are the engineers doing in the climate chamber?",
    targetSentence: "They are testing how different temperatures affect the battery.",
    wordBank: ["how", "They are testing", "affect the battery", "different temperatures"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 10,
    speakerAName: "Aria",
    contextPrompt: "Let's grab lunch at the new bistro near the library.",
    targetSentence: "I am wondering whether the cafe offers any vegan options.",
    wordBank: ["whether", "I am wondering", "any vegan options", "the cafe offers"],
  }),
  buildWriteEmailItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    title: "Write an Email — Yoga Class Schedule Adjustment",
    scenarioContext:
      "You recently enrolled in a Tuesday evening yoga class at the community wellness studio directed by Mr. Davis. However, your academic department just scheduled a mandatory weekly lab session on Tuesday evenings.",
    recipientRole: "To: Mr. Davis, Studio Director | Subject: Yoga Class Schedule Change Request",
    bulletPoints: [
      "Explain why you can no longer attend the Tuesday evening yoga class.",
      "Ask if you can transfer your registration to the Thursday morning or Saturday morning class instead.",
      "Inquire whether there is any administrative fee or form required to complete the switch.",
    ],
    sampleAnswer: `Dear Mr. Davis,

I hope this email finds you well. I am currently registered for your beginner's yoga class on Tuesday evenings at 6:00 PM, and I have really enjoyed the first session.

Unfortunately, my university department just announced a mandatory weekly chemistry lab that meets on Tuesday evenings for the rest of the semester. Because of this academic conflict, I will no longer be able to attend the Tuesday evening slot.

Could you please let me know if there is space available for me to transfer into the Thursday morning or Saturday morning yoga class instead? Additionally, please let me know if I need to fill out a schedule change form or pay any transfer fee.

Thank you very much for your understanding and assistance.

Best regards,
Taylor`,
  }),
  buildAcademicDiscussionItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    title: "Writing for an Academic Discussion — Individual Leaders vs. Broader Forces in History",
    courseName: "History 102: World Civilizations",
    professorName: "Dr. Reynolds",
    professorPrompt:
      "Historians have long debated what drives major historical transformations. Some scholars argue that history is primarily shaped by the vision and decisions of extraordinary individual leaders, while others contend that broader social, economic, and technological forces are the true catalysts of historical change. Which perspective do you find more convincing, and why?",
    studentPosts: [
      {
        authorName: "Andrew",
        avatarSeed: "andrew-mars",
        text: "I believe individual leaders play the decisive role in history. Throughout history, figures like Abraham Lincoln, Mahatma Gandhi, and Nelson Mandela made courageous choices at critical turning points that completely altered the trajectory of their nations.",
      },
      {
        authorName: "Kelly",
        avatarSeed: "kelly-mars",
        text: "While famous leaders get most of the attention in textbooks, I think broader social and economic forces matter much more. Even the most charismatic leader cannot succeed unless technological shifts, economic pressures, and grass-roots movements have already created the conditions for change.",
      },
    ],
    keyPointsToCover: [
      "State whether historical change is driven primarily by individual leaders, broader socioeconomic forces, or their interaction.",
      "Reference Andrew's or Kelly's argument and support your position with historical or contemporary examples.",
      "Use precise academic vocabulary and clear organizational transitions.",
    ],
    sampleAnswer: `I agree with Kelly that broader social, economic, and technological forces are the primary drivers of historical transformation, even though individual leaders often serve as visible catalysts at pivotal moments.

Consider the Industrial Revolution or the rise of the internet: neither transformation was dictated by a single ruler. Instead, demographic shifts, scientific discoveries, and economic incentives reshaped how millions of people lived and worked, creating pressure for political and legal reforms. Even when visionary leaders like Mahatma Gandhi or Nelson Mandela achieved historic breakthroughs, their success depended heavily on decades of collective grass-roots organizing, shifting global economics, and widespread public readiness for reform. Therefore, while exceptional leaders can accelerate or guide a movement, it is the underlying socioeconomic landscape that ultimately makes lasting historical change possible.`,
  }),

  // =========================================================================
  // SPEAKING SECTION (7 Listen & Repeat + 4 Take an Interview from Qyxo41WZwb4)
  // =========================================================================
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 1,
    scenarioTitle: "Electronics Store Customer Orientation",
    sentence: "Welcome to our electronics store.",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 2,
    scenarioTitle: "Electronics Store Customer Orientation",
    sentence: "Are you looking for anything in particular today?",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 3,
    scenarioTitle: "Electronics Store Customer Orientation",
    sentence: "Laptops and tablets are displayed on the center tables.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 4,
    scenarioTitle: "Electronics Store Customer Orientation",
    sentence: "Headphones and audio accessories are along the back wall.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 5,
    scenarioTitle: "Electronics Store Customer Orientation",
    sentence: "If you need technical support, our service desk is on the second floor.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 6,
    scenarioTitle: "Electronics Store Customer Orientation",
    sentence: "All computers come with a standard one-year manufacturer warranty.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 7,
    scenarioTitle: "Electronics Store Customer Orientation",
    sentence: "Please let any of our sales associates know if you would like to test a device.",
    responseSeconds: 12,
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 1,
    interviewTopic: "Personal Finance & Budgeting Study",
    questionText:
      "Thank you for joining this study on personal finance. First, how do you usually keep track of your daily expenses? Do you use a mobile app, a spreadsheet, or another method?",
    expectedKeyPhrases: ["budget", "mobile app", "expenses", "track", "spending"],
    sampleAnswer:
      "I usually track my daily expenses using a budgeting app linked to my bank account, along with a simple monthly spreadsheet. Categorizing my spending on groceries, transportation, and books helps me see exactly where my money goes and prevents overspending.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 2,
    interviewTopic: "Personal Finance & Budgeting Study",
    questionText:
      "I see. When you receive extra money, such as a bonus or a gift, do you prefer to save most of it or spend it on something you enjoy? Why?",
    expectedKeyPhrases: ["save", "emergency", "balance", "future", "enjoy"],
    sampleAnswer:
      "Whenever I receive extra money, I follow a rule of putting about seventy percent into my savings account and using the remaining thirty percent for something enjoyable, like a nice dinner or a book. That way I build financial security for emergencies without feeling deprived.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 3,
    interviewTopic: "Personal Finance & Budgeting Study",
    questionText:
      "That makes sense. Many people believe that high schools should require all students to take a course in personal finance and budgeting. Do you agree or disagree with this proposal?",
    expectedKeyPhrases: ["high school", "mandatory", "financial literacy", "credit", "taxes"],
    sampleAnswer:
      "I strongly agree that personal finance should be a required high school course. Every young adult eventually has to manage student loans, credit cards, taxes, and savings, and learning those practical skills early prevents costly financial mistakes later in life.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: MARS_BLUEPRINT_ID,
    questionNumber: 4,
    interviewTopic: "Personal Finance & Budgeting Study",
    questionText:
      "Finally, how do you think the shift toward cashless payments, such as digital wallets and credit cards, affects the way people manage their money?",
    expectedKeyPhrases: ["cashless", "digital wallets", "convenient", "impulse", "automated"],
    sampleAnswer:
      "Cashless payments have both positive and negative effects on money management. On one hand, digital wallets make transactions fast and automatically log every purchase; on the other hand, tapping a phone feels less tangible than handing over physical cash, which can encourage impulse buying if people aren't careful.",
  }),
];

export const MARS_BLUEPRINT: SeedBlueprintRow = {
  id: MARS_BLUEPRINT_ID,
  title: "Mars | Full Test",
  slug: "mars-full-test-2026",
  description:
    "Independent TOEFL iBT 2026-Style Practice Test #2 (Mars — Video Qyxo41WZwb4). Features Reading (European Narrative Literature, Critical Thinking, Urban Heat Islands, Monarch Migration, Mesopotamian Trade), Listening (Confirmation Bias, Hero's Journey Monomyth, Pottery & Kilns, Startup Incubators), Writing (10 Build a Sentence, Yoga Schedule Email, Leaders vs. Social Forces Discussion), and Speaking (Electronics Store & Personal Finance Interview).",
  exam_Type: "full_mock",
  total_Duration_Seconds: 5160,
  blueprint_Json: {
    sections: [
      {
        section: "reading",
        order: 1,
        durationSeconds: 1620,
        moduleCount: 2,
        questionCount: 11,
        isAdaptive: true,
      },
      {
        section: "listening",
        order: 2,
        durationSeconds: 1560,
        moduleCount: 2,
        questionCount: 14,
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
    planetName: "Mars",
    videoUrl: "https://youtu.be/Qyxo41WZwb4",
    videoId: "Qyxo41WZwb4",
    playlistUrl: "https://youtube.com/playlist?list=PLoDNaUsnugSqgJGJKo59X49nkQbwcksMV",
    difficultyLabel: "Standard 2026 Practice",
  },
  is_Published: true,
  created_At: "2026-09-02T10:00:00.000Z",
};
