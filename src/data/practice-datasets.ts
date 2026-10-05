/**
 * Pre-seeded TOEFL 2026 Practice Datasets:
 * - Dictation Passages (sentence-level listening & transcription drills)
 * - Shadowing Drills (speaking rhythm, stress, and intonation drills)
 * - Academic Vocabulary Bank (SM-2 spaced-repetition flashcards)
 * - TOEFL 2026 Strategy Lessons
 * - Comprehension Practice Questions
 */

export const SEED_DICTATION_PASSAGES = [
  {
    id: "d1000000-0000-4000-8000-000000000001",
    title: "Honeybee Communication & The Waggle Dance",
    audio_Url: "/audio/dictation/honeybee-waggle-dance.mp3",
    transcript_Text:
      "When a worker bee discovers a rich source of nectar, it returns to the hive and performs the waggle dance on the vertical surface of the honeycomb. The duration and angle of the waggle phase communicate the exact distance and direction of the food source.",
    sentences_Json: [
      {
        index: 0,
        text: "When a worker bee discovers a rich source of nectar, it returns to the hive and performs the waggle dance on the vertical surface of the honeycomb.",
        startSec: 0,
        endSec: 9,
      },
      {
        index: 1,
        text: "The duration and angle of the waggle phase communicate the exact distance and direction of the food source.",
        startSec: 9,
        endSec: 17,
      },
    ],
    difficulty_Band: "middle",
    academic_Domain: "Biology",
    accent_Type: "US_Standard",
    speech_Rate_Wpm: 145,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "d1000000-0000-4000-8000-000000000002",
    title: "Neuroplasticity and Spatial Memory",
    audio_Url: "/audio/dictation/neuroplasticity-hippocampus.mp3",
    transcript_Text:
      "Researchers found that the hippocampus, an area of the brain involved in spatial memory, was significantly larger in London taxi drivers compared to bus drivers. This highlights how repeated cognitive demand can physically reshape neural pathways.",
    sentences_Json: [
      {
        index: 0,
        text: "Researchers found that the hippocampus, an area of the brain involved in spatial memory, was significantly larger in London taxi drivers compared to bus drivers.",
        startSec: 0,
        endSec: 10,
      },
      {
        index: 1,
        text: "This highlights how repeated cognitive demand can physically reshape neural pathways.",
        startSec: 10,
        endSec: 16,
      },
    ],
    difficulty_Band: "upper",
    academic_Domain: "Neuroscience",
    accent_Type: "UK_RP",
    speech_Rate_Wpm: 155,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "d1000000-0000-4000-8000-000000000003",
    title: "Campus Library Study Room Policy",
    audio_Url: "/audio/dictation/library-study-rooms.mp3",
    transcript_Text:
      "The library is still open until ten o'clock on weekdays, even during the renovations. They have temporarily relocated the quiet study areas to the east wing.",
    sentences_Json: [
      {
        index: 0,
        text: "The library is still open until ten o'clock on weekdays, even during the renovations.",
        startSec: 0,
        endSec: 6,
      },
      {
        index: 1,
        text: "They have temporarily relocated the quiet study areas to the east wing.",
        startSec: 6,
        endSec: 12,
      },
    ],
    difficulty_Band: "lower",
    academic_Domain: "Campus Life",
    accent_Type: "US_Standard",
    speech_Rate_Wpm: 135,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "d1000000-0000-4000-8000-000000000004",
    title: "Instructional Modeling vs. Scaffolding",
    audio_Url: "/audio/dictation/modeling-scaffolding.mp3",
    transcript_Text:
      "Scaffolding is a teaching strategy that provides temporary supports to help learners accomplish tasks they might not manage independently. As students grow more confident, the teacher gradually removes these supports.",
    sentences_Json: [
      {
        index: 0,
        text: "Scaffolding is a teaching strategy that provides temporary supports to help learners accomplish tasks they might not manage independently.",
        startSec: 0,
        endSec: 8,
      },
      {
        index: 1,
        text: "As students grow more confident, the teacher gradually removes these supports.",
        startSec: 8,
        endSec: 14,
      },
    ],
    difficulty_Band: "middle",
    academic_Domain: "Education",
    accent_Type: "US_Standard",
    speech_Rate_Wpm: 148,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  },
];

export const SEED_SHADOWING_DRILLS = [
  {
    id: "b1000000-0000-4000-8000-000000000001",
    title: "Art Museum Visitor Orientation (Moon Test)",
    speaker_Label: "Museum Tour Trainer",
    audio_Url: "/audio/shadowing/museum-tour.mp3",
    script_Text:
      "We offer group tours of gallery highlights at no extra charge. Unfortunately, the sculpture hall is currently under renovation, but our gift shop is running a special promotion on a wide selection of books.",
    phonetic_Guide_Json: {
      stressWords: [
        "group",
        "highlights",
        "extra",
        "sculpture",
        "renovation",
        "special",
        "promotion",
      ],
      pauseMarkers: ["charge.", "Unfortunately,", "renovation,"],
      intonationType: "falling",
    },
    target_Wpm: 140,
    difficulty_Band: "middle",
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "b1000000-0000-4000-8000-000000000002",
    title: "Community Center Welcome (Venus Test)",
    speaker_Label: "Community Coordinator",
    audio_Url: "/audio/shadowing/community-center.mp3",
    script_Text:
      "We have a notice board for updates on community events and important announcements. If you're interested in learning more about our new courses, pick up a free flyer at the information desk.",
    phonetic_Guide_Json: {
      stressWords: ["notice", "updates", "important", "interested", "courses", "free", "flyer"],
      pauseMarkers: ["announcements.", "courses,"],
      intonationType: "falling",
    },
    target_Wpm: 145,
    difficulty_Band: "lower",
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "b1000000-0000-4000-8000-000000000003",
    title: "Woodworking Birdhouse Instructions (Neptune Test)",
    speaker_Label: "Workshop Instructor",
    audio_Url: "/audio/shadowing/birdhouse-workshop.mp3",
    script_Text:
      "To attach the roof, hammer the nails in gently so the wood doesn't split or crack. To protect the birdhouse from weather, seal it well so it will last for years.",
    phonetic_Guide_Json: {
      stressWords: ["attach", "hammer", "gently", "split", "protect", "seal", "years"],
      pauseMarkers: ["roof,", "crack.", "weather,"],
      intonationType: "falling",
    },
    target_Wpm: 150,
    difficulty_Band: "upper",
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  },
];

export const SEED_VOCABULARY_WORDS = [
  {
    id: "c1000000-0000-4000-8000-000000000001",
    headword: "neuroplasticity",
    part_Of_Speech: "noun",
    ipa_Pronunciation: "/ˌnʊəroʊplæˈstɪsɪti/",
    cefr_Level: "C1",
    academic_Domain: "Neuroscience",
    definition_En:
      "The ability of the brain to form and reorganize synaptic connections, especially in response to learning, musical training, or experience.",
    example_Sentence:
      "When individuals learn to play a musical instrument, their brains undergo structural changes known as neuroplasticity.",
    synonyms: ["neural adaptability", "cortical remapping", "brain malleability"],
    collocations: ["experience-dependent neuroplasticity", "enhance neuroplasticity"],
    created_At: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "c1000000-0000-4000-8000-000000000002",
    headword: "ethnocentrism",
    part_Of_Speech: "noun",
    ipa_Pronunciation: "/ˌɛθnoʊˈsɛntrɪzəm/",
    cefr_Level: "C1",
    academic_Domain: "Sociology",
    definition_En:
      "The evaluation of other cultures according to preconceptions originating in the standards and customs of one's own culture.",
    example_Sentence:
      "Cultural relativism contrasts with ethnocentrism, encouraging researchers to view practices within their own cultural context.",
    synonyms: ["cultural bias", "insularity"],
    collocations: ["avoid ethnocentrism", "cultural relativism and ethnocentrism"],
    created_At: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "c1000000-0000-4000-8000-000000000003",
    headword: "symbiosis",
    part_Of_Speech: "noun",
    ipa_Pronunciation: "/ˌsɪmbaɪˈoʊsɪs/",
    cefr_Level: "B2",
    academic_Domain: "Biology",
    definition_En:
      "A close, prolonged biological interaction between two different organisms living in physical association, often for mutual benefit.",
    example_Sentence:
      "Coral reefs depend on a delicate symbiosis between coral polyps and photosynthetic zooxanthellae algae.",
    synonyms: ["mutualism", "interdependence", "coexistence"],
    collocations: ["mutualistic symbiosis", "symbiotic relationship"],
    created_At: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "c1000000-0000-4000-8000-000000000004",
    headword: "albedo",
    part_Of_Speech: "noun",
    ipa_Pronunciation: "/ælˈbiːdoʊ/",
    cefr_Level: "C1",
    academic_Domain: "Environmental Science",
    definition_En:
      "The proportion of incident light or solar radiation that is reflected by a surface, such as ice, clouds, or urban pavement.",
    example_Sentence:
      "Dark asphalt rooftops have a low albedo, absorbing solar radiation and intensifying the urban heat island effect.",
    synonyms: ["reflectivity", "surface reflectance"],
    collocations: ["high-albedo coating", "surface albedo"],
    created_At: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "c1000000-0000-4000-8000-000000000005",
    headword: "chiaroscuro",
    part_Of_Speech: "noun",
    ipa_Pronunciation: "/kiˌɑːrəˈskʊəroʊ/",
    cefr_Level: "C2",
    academic_Domain: "Art History",
    definition_En:
      "The treatment of light and shade in drawing and painting, using strong tonal contrasts to model three-dimensional forms.",
    example_Sentence:
      "Baroque painter Georges de La Tour used candlelit chiaroscuro to imbue interior scenes with quiet mystery.",
    synonyms: ["light-dark contrast", "tenebrism"],
    collocations: ["dramatic chiaroscuro", "Baroque chiaroscuro"],
    created_At: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "c1000000-0000-4000-8000-000000000006",
    headword: "scaffolding",
    part_Of_Speech: "noun",
    ipa_Pronunciation: "/ˈskæfəldɪŋ/",
    cefr_Level: "B2",
    academic_Domain: "Education",
    definition_En:
      "Temporary instructional support provided by a teacher to help students master a complex task before working independently.",
    example_Sentence:
      "Instructional scaffolding, such as essay outlines and sentence starters, is gradually removed as learners gain confidence.",
    synonyms: ["guided support", "pedagogical framework"],
    collocations: ["instructional scaffolding", "gradual release of scaffolding"],
    created_At: "2026-09-01T10:00:00.000Z",
  },
];

export const SEED_LESSONS = [
  {
    id: "e1000000-0000-4000-8000-000000000001",
    title: "Mastering TOEFL 2026 Reading: Complete the Words & Daily Life Texts",
    slug: "mastering-toefl-2026-reading",
    summary:
      "Learn how the updated 2026 TOEFL iBT Reading section works, including prefix-guided word completion, workplace/campus emails, text message chains, and adaptive Module 2 routing.",
    content: `# Mastering the 2026 TOEFL iBT Reading Section

The updated 2026 TOEFL iBT Reading section uses a **multi-stage adaptive design** divided into **Module 1** and **Module 2** (27 minutes total).

## 1. Complete the Words (Cloze Passages)
In this task, you read a short academic paragraph where 10 words have had their ending letters removed.
- **Look at grammar first**: Determine whether the missing word is a noun, verb, adjective, or function word.
- **Count the letter boxes**: The number of blank underscores matches the exact number of missing letters.
- **Read the full sentence before typing**: Context clues in the second half of the sentence often confirm the tense ('-ed' vs. '-ing') or plural form ('-s' vs. '-ies').

## 2. Read in Daily Life (Emails, Notices & Group Chats)
You will read brief real-world texts such as job application follow-up emails, campus bookstore notices, and multi-participant Slack/text chains.
- **Identify the sender's primary intent**: Why was the message written?
- **Track timestamps and speaker turns**: In text chains, pay attention to who promised to deliver what and by what deadline.

## 3. Academic Passages & Adaptive Module 2
Your accuracy in Module 1 determines whether you route to the **Upper (Advanced)** or **Lower (Intermediate)** Module 2.`,
    topic: "TOEFL Reading",
    subtopic: "2026 Adaptive Format",
    difficulty: "medium",
    estimated_minutes: 12,
    sort_order: 1,
    is_published: true,
    created_at: "2026-09-01T10:00:00.000Z",
    updated_at: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "e1000000-0000-4000-8000-000000000002",
    title: "TOEFL 2026 Writing: Build a Sentence, Email & Academic Discussion",
    slug: "toefl-2026-writing-strategies",
    summary:
      "Step-by-step templates and grammatical rules for all three 2026 TOEFL Writing tasks: 10 Build a Sentence items, the 7-minute Write an Email task, and the 10-minute Academic Discussion.",
    content: `# TOEFL 2026 Writing Section Blueprint

The 2026 Writing section features **three distinct tasks** testing syntactic accuracy, pragmatic email communication, and academic argumentation.

## Task 1: Build a Sentence (Questions 1–10)
You see a conversational prompt from Speaker A and must arrange scrambled word/phrase chips to form Speaker B's response.
- **Watch embedded questions**: In indirect questions (*"Could you tell me where the meeting is?"* or *"He wanted to know how much profit we can expect"*), use **statement word order** (Subject + Verb) after the wh-word, NOT inverted question order!
- **Relative clauses**: Place relative clauses (*"that the reviewers gave me"*, *"who teaches marine biology"*) immediately after the noun they modify.

## Task 2: Write an Email (7 Minutes, 80–150 Words)
Address all **three bullet points** clearly using a polite subject line, salutation (*Dear Dr. Rossi,*), body paragraphs, and sign-off (*Sincerely,*).

## Task 3: Writing for an Academic Discussion (10 Minutes, 100+ Words)
State your position in the opening sentence, reference at least one classmate (*Kelly* or *Andrew*), and contribute a distinct argument supported by a concrete example.`,
    topic: "TOEFL Writing",
    subtopic: "Build a Sentence & Essays",
    difficulty: "medium",
    estimated_minutes: 15,
    sort_order: 2,
    is_published: true,
    created_at: "2026-09-01T10:00:00.000Z",
    updated_at: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "e1000000-0000-4000-8000-000000000003",
    title: "TOEFL 2026 Speaking: Listen and Repeat & Take an Interview",
    slug: "toefl-2026-speaking-mastery",
    summary:
      "How to score 5.0–6.0 on the new 11-question Speaking section: chunking memory techniques for Listen and Repeat (Q1–7) and structured 45-second responses for Take an Interview (Q8–11).",
    content: `# TOEFL 2026 Speaking Section Guide

The 2026 Speaking section contains **11 questions** across two task types, with **no preparation time** before speaking.

## Part 1: Listen and Repeat (Questions 1–7)
You are placed in a workplace or campus training scenario (such as an art museum, bank branch, community center, or woodworking workshop) and repeat 7 increasingly complex sentences.
- **Chunk by meaning**: Group words into 3-to-4-word grammatical phrases (*"For modern art,"* / *"visit the Eastern Wing"*).
- **Match natural stress and rhythm**: Emphasize content words (nouns, main verbs, adjectives) and link prepositions smoothly.

## Part 2: Take an Interview (Questions 8–11)
A researcher asks you 4 progressive questions on a single topic (45 seconds per answer).
- **Direct Answer (5 sec)**: Answer the question in your very first sentence.
- **Elaboration & Reason (20 sec)**: Explain *why* using causal transitions (*because, since, as a result*).
- **Concrete Example (20 sec)**: Share a brief personal habit or real-world illustration.`,
    topic: "TOEFL Speaking",
    subtopic: "Listen & Repeat + Interview",
    difficulty: "hard",
    estimated_minutes: 14,
    sort_order: 3,
    is_published: true,
    created_at: "2026-09-01T10:00:00.000Z",
    updated_at: "2026-09-01T10:00:00.000Z",
  },
];

export const SEED_COMPREHENSION_QUESTIONS = [
  {
    id: "91000000-0000-4000-8000-000000000001",
    title: "Embedded Question Word Order in Build-a-Sentence",
    slug: "embedded-question-word-order",
    prompt:
      "Which of the following sentences uses correct grammatical word order for a TOEFL 2026 Build-a-Sentence response?",
    content:
      "Speaker A: 'What did the director ask during the budget review?' Choose the grammatically correct indirect question response.",
    question_type: "multiple_choice",
    difficulty: "medium",
    topic: "TOEFL Writing",
    subtopic: "Build a Sentence",
    options: [
      { id: "a", text: "She wanted to know how much revenue can we expect." },
      { id: "b", text: "She wanted to know how much revenue we can expect." },
      { id: "c", text: "She wanted to know how much can we expect revenue." },
      { id: "d", text: "How much revenue we can expect she wanted to know?" },
    ],
    correct_answer: "b",
    explanation:
      "In embedded (indirect) questions following 'She wanted to know...', English requires standard subject-verb word order ('we can expect') rather than subject-auxiliary inversion ('can we expect').",
    hints: ["Check whether 'how much revenue' is followed by Subject + Verb."],
    tags: ["toefl-2026", "writing", "build-sentence", "grammar"],
    points: 10,
    is_active: true,
    created_at: "2026-09-01T10:00:00.000Z",
    updated_at: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "91000000-0000-4000-8000-000000000002",
    title: "Academic Reading Inference: Coral Bleaching Recovery",
    slug: "coral-bleaching-inference",
    prompt: "Based on the excerpt below, what can be validly inferred about bleached corals?",
    content:
      "'When water temperatures exceed normal seasonal thresholds by even one or two degrees Celsius for extended periods, corals expel their symbiotic algae, causing their tissues to turn transparent and expose the white limestone skeleton beneath—a phenomenon known as coral bleaching. While bleached corals are not immediately dead, prolonged thermal stress deprives them of their primary energy source, leading to widespread mortality.'",
    question_type: "multiple_choice",
    difficulty: "hard",
    topic: "TOEFL Reading",
    subtopic: "Inference",
    options: [
      {
        id: "a",
        text: "Bleached corals may recover if water temperatures return to normal before they starve from lack of nutrients.",
      },
      {
        id: "b",
        text: "Corals turn white because their limestone skeleton dissolves in warm water.",
      },
      {
        id: "c",
        text: "Symbiotic algae are harmful parasites that corals expel to stay healthy.",
      },
      {
        id: "d",
        text: "Coral bleaching occurs only in polar oceans during winter.",
      },
    ],
    correct_answer: "a",
    explanation:
      "Because the text notes that 'bleached corals are not immediately dead' and that 'prolonged thermal stress' causes mortality by depriving them of energy, we can infer that if thermal stress ends quickly, corals can survive.",
    hints: ["Focus on the contrast between 'not immediately dead' and 'prolonged thermal stress'."],
    tags: ["toefl-2026", "reading", "inference", "biology"],
    points: 15,
    is_active: true,
    created_at: "2026-09-01T10:00:00.000Z",
    updated_at: "2026-09-01T10:00:00.000Z",
  },
];
