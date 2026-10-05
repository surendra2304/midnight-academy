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

export const URANUS_BLUEPRINT_ID = "f2000000-0000-4000-8000-000000000008";

const KEYSTONE_SPECIES_PASSAGE = `In ecology, a keystone species is an organism that exerts a disproportionately large influence on the structure, biodiversity, and stability of its ecosystem relative to its numerical abundance. Just as removing the central wedge-shaped keystone from a stone arch causes the entire structure to collapse, the removal of a keystone species triggers a trophic cascade that dramatically alters habitat composition across multiple levels of the food web.

One of the most thoroughly documented examples of a trophic cascade occurred in Yellowstone National Park in the western United States. Following the eradication of gray wolves from the park in the 1920s under federal predator-control programs, elk populations multiplied unchecked. Without the threat of predation, large herds of elk lingered along river valleys and overbrowsed young willow, aspen, and cottonwood saplings. The loss of streamside vegetation accelerated streambank erosion and deprived beavers and songbirds of essential nesting and dam-building materials. When gray wolves were reintroduced to Yellowstone in 1995, elk altered their foraging behavior and avoided open riverbanks, allowing riparian forests, beaver colonies, and aquatic habitats to recover rapidly.`;

const SPIRAL_JETTY_PASSAGE = `Constructed in April 1970 by American sculptor Robert Smithson, Spiral Jetty is the most iconic monument of the Land Art movement—an avant-garde artistic current that rejected commercial galleries and museums in favor of creating site-specific earthworks directly within natural landscapes. Located on the northeastern shore of Utah's Great Salt Lake at Rozel Point, the sculpture consists of more than six thousand tons of black basalt boulders and earth arranged in a counterclockwise coil measuring 1,500 feet long and 15 feet wide.

Smithson chose the Great Salt Lake specifically for its stark, primordial atmosphere and extreme environmental variability, including halophilic microbes that tint the water rose-pink and fluctuating lake levels that periodically submerge and re-expose the basalt coil encrusted in white salt crystals. Central to Smithson's artistic philosophy was the concept of entropy—the inevitable transformation of ordered structures by geological time and natural forces. Ironically, because Rozel Point is remote and Spiral Jetty has spent decades underwater during high-water cycles, most people experience the earthwork only through static aerial photographs, raising intriguing questions about how site-specific art is mediated by documentation.`;

const ISOLATION_LITERATURE_TRANSCRIPT = `Narrator: Listen to a talk in a literature class.
Professor: A common theme in literature is isolation, and that's what we'll explore today. Isolation can be a powerful motif reflecting the psychological effects of being separated from society. One of the most classic examples is Mary Shelley's Frankenstein. In this novel, Victor Frankenstein's creation experiences profound isolation due to his appearance and the fear he instills in people, leading to anger and a desire for revenge. Another notable example is The Catcher in the Rye by J. D. Salinger, where Holden Caulfield struggles with alienation and loneliness. Yet another example that ends badly is Herman Melville's Moby-Dick, where Captain Ahab's obsessive quest for the white whale distances him from his crew and humanity. However, the portrayal of isolation in literature is not always negative. In Charlotte Bronte's Jane Eyre, the main character experiences isolation at unkind relatives' homes and boarding school, but Jane is resilient in the face of isolation, becoming strong and independent.`;

let idx = 1;
const nextId = () => makeItemId(8, idx++);

export const URANUS_ITEMS: SeedQuestionItemRow[] = [
  // =========================================================================
  // READING MODULE 1 (cxB2YNapEA0)
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Early Cinema & Silent Film Music (Q1–10)",
    passageText:
      "[0] the [1] decades [2] motion-picture [3], projected [4] were [5] because filmmakers lacked [6] technology [7] record synchronized [8] directly [9] the celluloid film strip.",
    blanks: [
      { index: 0, prefix: "i", answer: "n" },
      { index: 1, prefix: "ear", answer: "ly" },
      { index: 2, prefix: "o", answer: "f" },
      { index: 3, prefix: "cin", answer: "ema" },
      { index: 4, prefix: "fi", answer: "lms" },
      { index: 5, prefix: "sil", answer: "ent" },
      { index: 6, prefix: "t", answer: "he" },
      { index: 7, prefix: "t", answer: "o" },
      { index: 8, prefix: "sou", answer: "nd" },
      { index: 9, prefix: "wi", answer: "th" },
    ],
  }),
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Sleep Architecture & Brain Restoration (Q11–20)",
    passageText:
      "Getting sufficient rest is vital [0] human health because [1] plays [2] critical [3] [4] both [5] recovery [6] [7] sharpness, allowing the [8] to consolidate memories [9] the night.",
    blanks: [
      { index: 0, prefix: "f", answer: "or" },
      { index: 1, prefix: "sl", answer: "eep" },
      { index: 2, prefix: "", answer: "a" },
      { index: 3, prefix: "ro", answer: "le" },
      { index: 4, prefix: "i", answer: "n" },
      { index: 5, prefix: "phys", answer: "ical" },
      { index: 6, prefix: "a", answer: "nd" },
      { index: 7, prefix: "men", answer: "tal" },
      { index: 8, prefix: "br", answer: "ain" },
      { index: 9, prefix: "dur", answer: "ing" },
    ],
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Keystone Species in Yellowstone National Park (Q21)",
    stimulusText: KEYSTONE_SPECIES_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to paragraph 2, how did the eradication of gray wolves in the 1920s affect Yellowstone's river valleys?",
    options: [
      "Beavers multiplied rapidly and flooded the entire park.",
      "Unchecked elk herds lingered along river valleys and overbrowsed young willow, aspen, and cottonwood saplings.",
      "Willow and cottonwood trees grew so dense that rivers dried up.",
      "Elk migrated permanently out of Yellowstone National Park.",
    ],
    correctOptionId: "B",
    explanation:
      "Paragraph 2 states that without wolves, 'large herds of elk lingered along river valleys and overbrowsed young willow, aspen, and cottonwood saplings' (B).",
  }),

  // =========================================================================
  // READING MODULE 2
  // =========================================================================
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Complete the Words: Planetary Atmospheres & Space Probes (M2 Q1–10)",
    passageText:
      "When robotic probes entered the [0]'s thick [1] of sulfuric [2], the space [3] [4] clear [5] of a [6] weather system whose complex [7] helps scientists refine climate [8] on geologically [9] worlds.",
    blanks: [
      { index: 0, prefix: "pla", answer: "net" },
      { index: 1, prefix: "clo", answer: "uds" },
      { index: 2, prefix: "ac", answer: "id" },
      { index: 3, prefix: "miss", answer: "ions" },
      { index: 4, prefix: "fo", answer: "und" },
      { index: 5, prefix: "evid", answer: "ence" },
      { index: 6, prefix: "dyna", answer: "mic" },
      { index: 7, prefix: "chem", answer: "istry" },
      { index: 8, prefix: "mod", answer: "els" },
      { index: 9, prefix: "act", answer: "ive" },
    ],
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Robert Smithson's Spiral Jetty and Land Art (M2 Q11)",
    stimulusText: SPIRAL_JETTY_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to paragraph 2, what is ironic about how most people experience Robert Smithson's Spiral Jetty?",
    options: [
      "Although Smithson designed the work to be experienced firsthand as a changing natural site, most people know it only through static photographs and films.",
      "The sculpture was dismantled and moved inside a commercial art gallery in New York.",
      "The basalt rocks floated away during the first storm on the Great Salt Lake.",
      "Visitors are only allowed to view the sculpture at midnight.",
    ],
    correctOptionId: "A",
    explanation:
      "Paragraph 2 points out the irony that although Spiral Jetty was meant to be experienced firsthand in nature, 'most people experience the earthwork only through static aerial photographs' (A).",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Robert Smithson's Spiral Jetty and Land Art (M2 Lower Q1)",
    stimulusText: SPIRAL_JETTY_PASSAGE,
    questionSubType: "factual",
    questionStem: "What materials were used to construct Spiral Jetty in Utah's Great Salt Lake?",
    options: [
      "Polished white marble and stainless steel cables",
      "More than six thousand tons of black basalt boulders and earth",
      "Recycled glass bottles and driftwood",
      "Poured concrete and painted fiberglass",
    ],
    correctOptionId: "B",
    explanation:
      "Paragraph 1 states that Spiral Jetty 'consists of more than six thousand tons of black basalt boulders and earth arranged in a counterclockwise coil' (B).",
  }),

  // =========================================================================
  // LISTENING MODULE 1 & MODULE 2 (Exact transcripts from cxB2YNapEA0)
  // =========================================================================
  buildListeningItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Conversation — House-Sitting in Italy & Two Dogs (Q1)",
    transcript: `Woman: Are you having any luck with your apartment search?
Man: Not yet, and I really need to find something soon.
Woman: Well, I might have a lead for you. A friend of mine has been transferred to Italy for work. It's just a nine-month gig, but he's looking for someone to live in the house and take care of it while he's away. I mentioned your name, and it's yours if you want it.
Man: Really? That sounds amazing!
Woman: There's just one catch, though: the house comes with two dogs.
Man: Even better! I love dogs.`,
    campusContext: "Off-Campus Housing",
    questionStem:
      "What 'catch' does the woman mention about her friend's house, and how does the man react?",
    options: [
      "The rent is very high, so the man declines the offer.",
      "The house comes with two dogs that need care, which makes the man even happier because he loves dogs.",
      "The house has no internet access, so the man decides to stay in the dorm.",
      "The house is located in Italy, so the man would have to drop his classes.",
    ],
    correctOptionId: "B",
    explanation:
      "The woman says 'the house comes with two dogs,' and the man responds 'Even better! I love dogs' (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Conversation — Saturday Book Club Mix-Up (Q2)",
    transcript: `Woman: Will you be at Saturday's book club meeting?
Man: I will! I loved the book—I can't wait to discuss it. Nathan Chow is now officially one of my favorite authors.
Woman: Wait a minute. Did you read Subtle Changes? That's on the schedule for next month!
Man: Oh, no. I must have read the wrong book.
Woman: Well, on the bright side, Carver's Canyon is only 150 pages, and you've still got two days.
Man: I know what I'll be doing tonight!`,
    campusContext: "Campus Book Club",
    questionStem: "What mistake did the man make?",
    options: [
      "He went to the book club meeting on the wrong day.",
      "He read next month's book (Subtle Changes) instead of this Saturday's assigned book (Carver's Canyon).",
      "He lost the library's only copy of Carver's Canyon.",
      "He forgot to invite the author to the meeting.",
    ],
    correctOptionId: "B",
    explanation:
      "The woman realizes he read Subtle Changes, which is on the schedule for next month, instead of Carver's Canyon (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Club Announcement — 700-Word Creative Writing Challenge (Q3)",
    transcript: `Narrator: Listen to an announcement at a student club meeting.
Speaker: The Creative Writing Club has a challenge for students! We want you to write amazing stories, but they must be under 700 words. Every submission must have a beginning, middle, and ending. Judging will be based on originality, writing quality, emotional impact, and technical skill. Winning entries with the greatest emotional impact will be published in the university's literary magazine, and winners will also get a gift card. For details, visit the Creative Writing Club's webpage.`,
    campusContext: "Creative Writing Club",
    questionStem:
      "What is the length requirement for stories submitted to the Creative Writing Club contest?",
    options: [
      "At least 2,000 words",
      "Exactly ten pages long",
      "Under 700 words",
      "Between five and十 chapters",
    ],
    correctOptionId: "C",
    explanation:
      "The speaker states: 'We want you to write amazing stories, but they must be under 700 words' (C).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Literature Class — The Motif of Isolation (Q4)",
    transcript: ISOLATION_LITERATURE_TRANSCRIPT,
    academicDomain: "English Literature",
    questionStem:
      "Why does the professor mention Charlotte Bronte's novel Jane Eyre at the end of the talk?",
    options: [
      "To show that the portrayal of isolation in literature is not always negative, as Jane grows resilient, strong, and independent",
      "To give an example of a character whose obsession leads to the destruction of a ship",
      "To argue that nineteenth-century novels avoided the theme of loneliness",
      "To compare science fiction monsters with modern detectives",
    ],
    correctOptionId: "A",
    explanation:
      "The professor contrasts Frankenstein, The Catcher in the Rye, and Moby-Dick with Jane Eyre to show that isolation is not always negative—Jane becomes resilient, strong, and independent (A).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Conversation — Theater Play vs. Chicago Journalism Awards (M2 Q1)",
    transcript: `Man: I just ran into Julie in the student union. She was telling me about the play she's going to be in for the university theater company this weekend. I told her I can't wait to see it!
Woman: Wait—this weekend? Won't you be in Chicago for the journalism awards?
Man: Oh, no! I completely forgot about that. I should text Julie to let her know. I hope she's not too disappointed.
Woman: I'm sure there will be other productions this year.`,
    campusContext: "Student Union",
    questionStem: "Why will the man not be able to attend Julie's play this weekend?",
    options: [
      "He has to work an evening shift at the campus library.",
      "He forgot that he will be in Chicago attending the journalism awards.",
      "All tickets for the theater production are sold out.",
      "He is performing in a music recital on the same night.",
    ],
    correctOptionId: "B",
    explanation:
      "The woman reminds him: 'Won't you be in Chicago for the journalism awards?' and he realizes he completely forgot about the trip (B).",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Conversation — Photography Club Contest (M2 Lower Q1)",
    transcript: `Woman: I just saw a flyer about a photo contest for members of the photography club. You're in that club, right?
Man: Yeah, I joined last semester.
Woman: You should enter! It said the winning photo gets a cash prize.
Man: I don't know. Some of the other members are really talented, like my friend John—he's a photojournalist for the university paper. I'm not sure anyone else stands a chance.
Woman: You never know! Have you talked to any other members about the contest?
Man: Yeah, some of my friends think they have a shot. I guess I could try to be optimistic like them.`,
    academicDomain: "Campus Activities",
    questionStem: "Why is the man initially hesitant to enter the photography club contest?",
    options: [
      "He does not own a digital camera.",
      "He thinks highly experienced members like his photojournalist friend John will easily win.",
      "The contest entry fee is too expensive.",
      "He is no longer a member of the photography club.",
    ],
    correctOptionId: "B",
    explanation:
      "The man says some members are really talented, like his friend John who is a photojournalist for the university paper, so he's not sure anyone else stands a chance (B).",
  }),

  // =========================================================================
  // WRITING SECTION (10 Build a Sentence + Seminar Email to Ms. Johnson + Parental Involvement Discussion from cxB2YNapEA0)
  // =========================================================================
  buildSentenceItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 1,
    speakerAName: "Classmate",
    contextPrompt: "How was your appointment at the career services center?",
    targetSentence: "The feedback that the career advisor gave me was really helpful.",
    wordBank: ["that the career advisor", "The feedback", "was really helpful", "gave me"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 2,
    speakerAName: "Friend",
    contextPrompt: "What did your academic dean ask you about your transcript?",
    targetSentence: "He wanted to know why I decided to change my major.",
    wordBank: ["why I decided", "He wanted to know", "my major", "to change"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 3,
    speakerAName: "New Student",
    contextPrompt: "Excuse me, I just arrived for the freshman welcome event.",
    targetSentence: "Can you tell me where the orientation session is being held?",
    wordBank: ["where", "Can you tell me", "is being held", "the orientation session"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 4,
    speakerAName: "Roommate",
    contextPrompt: "I need to buy a notebook before Monday morning.",
    targetSentence: "I am not sure whether the bookstore is open on Sundays.",
    wordBank: ["whether", "I am not sure", "on Sundays", "the bookstore is open"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 5,
    speakerAName: "Friend",
    contextPrompt: "Did you and your roommate sign a lease yet?",
    targetSentence: "The apartment that we looked at yesterday was too expensive.",
    wordBank: ["that we looked at", "The apartment", "was too expensive", "yesterday"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 6,
    speakerAName: "Partner",
    contextPrompt: "I'm reading through your presentation draft right now.",
    targetSentence: "Could you let me know when you finish reviewing the slides?",
    wordBank: ["when you finish", "Could you let me know", "the slides", "reviewing"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 7,
    speakerAName: "Lab Partner",
    contextPrompt: "Why did Rachel come back to the biology classroom?",
    targetSentence: "She asked if anyone had seen her notebook in the lab.",
    wordBank: ["if anyone", "She asked", "her notebook in the lab", "had seen"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 8,
    speakerAName: "Student",
    contextPrompt: "I'm thinking about adding a minor in data science.",
    targetSentence: "Do you know how many credits are required for this minor?",
    wordBank: ["how many credits", "Do you know", "for this minor", "are required"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 9,
    speakerAName: "Traveler",
    contextPrompt: "My flight departs at six o'clock this evening.",
    targetSentence: "I was wondering what time the shuttle leaves for the airport.",
    wordBank: ["what time", "I was wondering", "for the airport", "the shuttle leaves"],
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 10,
    speakerAName: "Classmate",
    contextPrompt: "Who is supervising the coastal ecology excursion?",
    targetSentence: "The professor who teaches marine biology is leading the trip.",
    wordBank: ["who teaches", "The professor", "is leading the trip", "marine biology"],
  }),
  buildWriteEmailItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    title: "Write an Email — Requesting Communication Seminar Materials from Ms. Johnson",
    scenarioContext:
      "Yesterday afternoon you attended a professional communication skills seminar organized by Ms. Johnson. Because you had a mandatory university exam at 4:00 PM, you had to leave thirty minutes before the seminar ended.",
    recipientRole:
      "To: Ms. Johnson, Seminar Organizer | Subject: Request for Communication Seminar Slides & Recording",
    bulletPoints: [
      "Thank Ms. Johnson for organizing the communication skills seminar and mention what you found valuable.",
      "Explain why you had to leave the session thirty minutes early.",
      "Ask if she can share the presentation slides or video recording from the final portion of the seminar.",
    ],
    sampleAnswer: `Dear Ms. Johnson,

Thank you very much for organizing yesterday's seminar on professional communication skills. I found the interactive exercises on active listening and structuring persuasive presentations extremely helpful.

Unfortunately, I had to leave the session thirty minutes before it ended because of a mandatory university midterm exam scheduled at 4:00 PM. As a result, I missed the final segment covering Q&A strategies and follow-up communication.

Would it be possible for you to share the presentation slide deck or a link to the video recording from the conclusion of the seminar? I would love to review the remaining material on my own.

Thank you again for your time and support.

Best regards,
Casey Brooks`,
  }),
  buildAcademicDiscussionItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    title: "Writing for an Academic Discussion — Parental Involvement in Children's Education",
    courseName: "Developmental Psychology 215: Family & Schooling",
    professorName: "Dr. Nguyen",
    professorPrompt:
      "Educators and psychologists frequently debate the ideal level of parental involvement in a child's schooling. Some argue that parents should closely monitor daily homework, course choices, and study schedules to ensure academic success, while others believe that excessive parental direction prevents children from developing self-reliance and intrinsic motivation. What level of parental involvement do you think is most beneficial?",
    studentPosts: [
      {
        authorName: "Claire",
        avatarSeed: "claire-uranus",
        text: "I believe active parental involvement is crucial, especially during elementary and middle school. When parents check homework daily and communicate regularly with teachers, children stay organized and feel supported in their education.",
      },
      {
        authorName: "Andrew",
        avatarSeed: "andrew-uranus",
        text: "While support is good, hovering over every assignment backfires. Students whose parents micromanage their schoolwork often struggle when they reach university because they never learned how to manage their own time or learn from mistakes.",
      },
    ],
    keyPointsToCover: [
      "State a clear position on how parents should balance academic support with fostering student autonomy.",
      "Engage with Claire's and/or Andrew's arguments using developmental or educational reasoning.",
      "Write with strong academic clarity and syntactic variety.",
    ],
    sampleAnswer: `Both Claire and Andrew highlight important aspects of child development, and I believe the most effective approach is a gradual transition from structured parental guidance in early childhood to supportive autonomy in adolescence.

As Claire points out, younger children in elementary school are still developing executive functioning skills, so they benefit greatly when parents help establish consistent reading routines and a quiet study environment. However, as Andrew rightly warns, micromanaging every assignment in middle and high school deprives teenagers of the opportunity to build self-regulation and resilience. Rather than checking every homework answer or choosing courses for older students, parents should act as supportive mentors—encouraging curiosity, discussing long-term goals, and allowing students to take ownership of their schedules and occasional setbacks. This balanced approach nurtures both academic confidence and lifelong independence.`,
  }),

  // =========================================================================
  // SPEAKING SECTION (7 Listen & Repeat from Eqv8sVGDRDM + 4 Take an Interview from cxB2YNapEA0)
  // =========================================================================
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 1,
    scenarioTitle: "Accounting Conference Staff Orientation",
    sentence: "Welcome to the accounting conference.",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 2,
    scenarioTitle: "Accounting Conference Staff Orientation",
    sentence: "Get your name tag at the main desk.",
    responseSeconds: 8,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 3,
    scenarioTitle: "Accounting Conference Staff Orientation",
    sentence: "The seminar halls are up the stairs on the right.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 4,
    scenarioTitle: "Accounting Conference Staff Orientation",
    sentence: "The main hall here is where companies have their booths.",
    responseSeconds: 9,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 5,
    scenarioTitle: "Accounting Conference Staff Orientation",
    sentence: "New product presentations will be in the rooms on the left.",
    responseSeconds: 10,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 6,
    scenarioTitle: "Accounting Conference Staff Orientation",
    sentence: "There is a dining hall in the back that is open all day if you get hungry.",
    responseSeconds: 11,
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 7,
    scenarioTitle: "Accounting Conference Staff Orientation",
    sentence: "A full schedule of all conference events is included in your information packet.",
    responseSeconds: 12,
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 1,
    interviewTopic: "Museums, Cultural Events & Cinema",
    questionText:
      "Thank you for joining this interview on leisure and culture. First, what types of museums or cultural exhibitions do you enjoy visiting most, such as science museums, history museums, or art galleries?",
    expectedKeyPhrases: ["science museum", "history", "interactive", "exhibits", "learn"],
    sampleAnswer:
      "I especially enjoy visiting natural history and interactive science museums. Seeing archaeological artifacts and hands-on engineering exhibits brings historical and scientific concepts to life in a way that textbooks alone cannot match.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 2,
    interviewTopic: "Museums, Cultural Events & Cinema",
    questionText:
      "When you visit a museum or exhibition, do you prefer to explore on your own at your own pace, or do you prefer to join a guided tour? Why?",
    expectedKeyPhrases: ["own pace", "audio guide", "guided tour", "context", "flexible"],
    sampleAnswer:
      "I usually prefer exploring at my own pace with an audio guide. That way, I can spend extra time examining exhibits that fascinate me while still hearing expert historical background whenever I want more detail.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 3,
    interviewTopic: "Museums, Cultural Events & Cinema",
    questionText:
      "Switching to entertainment, do you prefer watching new movies in a movie theater or streaming them at home? Explain your preference.",
    expectedKeyPhrases: ["movie theater", "big screen", "sound system", "streaming", "atmosphere"],
    sampleAnswer:
      "For visually impressive films or dramas with great soundtracks, I definitely prefer watching them in a movie theater because the giant screen, surround sound, and shared audience atmosphere make the experience immersive. For casual comedies, streaming at home is more convenient.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: URANUS_BLUEPRINT_ID,
    questionNumber: 4,
    interviewTopic: "Museums, Cultural Events & Cinema",
    questionText:
      "Finally, some people argue that public museums should always be free for all visitors, funded entirely by the government. Do you agree or disagree with this view?",
    expectedKeyPhrases: ["free admission", "public funding", "education", "accessible", "students"],
    sampleAnswer:
      "I agree that public museums should offer free general admission, or at least free entry for students and low-income families, supported by public funding. Museums preserve our shared cultural and scientific heritage, and everyone in society should have equal access to that knowledge regardless of income.",
  }),
];

export const URANUS_BLUEPRINT: SeedBlueprintRow = {
  id: URANUS_BLUEPRINT_ID,
  title: "Uranus | Full Test",
  slug: "uranus-full-test-2026",
  description:
    "Independent TOEFL iBT 2026-Style Practice Test #8 (Uranus — Video cxB2YNapEA0 & Eqv8sVGDRDM). Features Reading (Early Silent Cinema, Sleep & Brain Restoration, Yellowstone Keystone Species, Robert Smithson's Spiral Jetty), Listening (House-Sitting in Italy, Book Club Mix-Up, Motif of Isolation in Literature, Theater Play vs. Journalism Awards), Writing (10 Build a Sentence, Email to Ms. Johnson, Parental Involvement Discussion), and Speaking (Accounting Conference & Museums/Cinema Interview).",
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
    planetName: "Uranus",
    videoUrl: "https://youtu.be/cxB2YNapEA0",
    videoId: "cxB2YNapEA0",
    playlistUrl: "https://youtube.com/playlist?list=PLoDNaUsnugSqgJGJKo59X49nkQbwcksMV",
    difficultyLabel: "Standard 2026 Practice",
  },
  is_Published: true,
  created_At: "2026-09-08T10:00:00.000Z",
};
