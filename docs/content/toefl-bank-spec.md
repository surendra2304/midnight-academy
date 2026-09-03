# TOEFL 2026 Original Content Bank Specification & Calibration Guidelines

This document outlines the content bank taxonomy, item specifications, calibration criteria, and authoring guidelines for Midnight Academy's TOEFL iBT 2026 preparation platform.

---

## 1. Content Bank Taxonomy & Item Types

All content items strictly adhere to the official ETS 2026 test specification across all four skills:

### 📖 Reading Section

1. `complete_words`: Contextual cloze passage where learners complete missing vocabulary in numbered input fields. Supports deterministic alternative answer keys and weighted partial credit.
2. `read_daily_life`: Short practical text (schedules, campus notices, announcements) followed by multiple-choice factual/pragmatic questions with distractor rationales.
3. `read_academic`: High-level academic passage (biology, astronomy, sociology) followed by multiple-choice inference and synthesis questions.

### 🎧 Listening Section

1. `listen_choose_response`: Short audio prompt followed by pragmatic response selection.
2. `listen_conversation`: Campus and social dialogue tracks followed by comprehension questions.
3. `listen_announcement`: Institutional announcement tracks followed by factual/detail questions.
4. `listen_academic_talk`: Academic lecture audio tracks followed by main-idea and detail questions.

### ✍️ Writing Section

1. `build_sentence`: Interactive click-to-place and re-orderable word chips evaluated 100% deterministically against valid syntactic sequence keys.
2. `write_email`: Formal or semi-formal academic/campus email scenario evaluated on Task Fulfillment, Organization, and Language Use via versioned rubrics.
3. `academic_discussion`: Multilateral classroom debate board requiring learners to contribute an argument engaging with peers' viewpoints.

### 🎙️ Speaking Section

1. `listen_repeat`: Sentence repetition task evaluating phonetic accuracy, speech rhythm, and intonation.
2. `take_interview`: Spoken interview prompt with 15s preparation and 45s recording, evaluated across Task Fulfillment, Organization, Language Use, Delivery, and Pronunciation.

---

## 2. Security & Immutability Standard

1. **Zero Client-Side Answer Leakage**: All answer keys (`is_correct`, `distractor_rationale`, `acceptedSequences`) are stripped before blueprints are served to students.
2. **Audio Protection**: Transcripts are sealed during active examination and only made available upon submission.
3. **Database Immutability**: Published `test_versions` cannot be edited. Blueprint modifications require publishing a new version.

---

## 3. Seeded Tests Inventory

| Test Code       | Name                      | Category  | Difficulty | Sections                                                                     |
| :-------------- | :------------------------ | :-------- | :--------- | :--------------------------------------------------------------------------- |
| `TOEFL-MOCK-01` | Official Full Mock Test 1 | Full Mock | Medium     | Reading $\rightarrow$ Listening $\rightarrow$ Writing $\rightarrow$ Speaking |
| `TOEFL-MOCK-02` | Official Full Mock Test 2 | Full Mock | Hard       | Reading $\rightarrow$ Listening $\rightarrow$ Writing $\rightarrow$ Speaking |
| `TOEFL-RD-01`   | Reading Section Test 1    | Reading   | Medium     | Multistage Adaptive Reading                                                  |
| `TOEFL-RD-02`   | Reading Section Test 2    | Reading   | Hard       | Multistage Adaptive Reading                                                  |
| `TOEFL-LS-01`   | Listening Section Test 1  | Listening | Medium     | Audio Comprehension                                                          |
| `TOEFL-LS-02`   | Listening Section Test 2  | Listening | Hard       | Audio Comprehension                                                          |
| `TOEFL-WR-01`   | Writing Section Test 1    | Writing   | Medium     | Sentence, Email & Discussion                                                 |
| `TOEFL-WR-02`   | Writing Section Test 2    | Writing   | Hard       | Sentence, Email & Discussion                                                 |
| `TOEFL-SP-01`   | Speaking Section Test 1   | Speaking  | Medium     | Repetition & Interview                                                       |
| `TOEFL-SP-02`   | Speaking Section Test 2   | Speaking  | Hard       | Repetition & Interview                                                       |
