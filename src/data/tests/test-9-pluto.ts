/**
 * Pluto — TOEFL iBT 2026-Style Full Mock (Test 9)
 *
 * ALL content in this file is original practice material authored for
 * Midnight Academy. It follows the public TOEFL iBT 2026 task *format*
 * (item types, timing, scoring scale) but every passage, transcript,
 * prompt, option set, and answer key here is written from scratch for
 * this bank — none of it is copied from TestGlider, ETS, or any other
 * provider's proprietary tests.
 */
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

export const PLUTO_BLUEPRINT_ID = "f2000000-0000-4000-8000-000000000009";

/* ----------------------------- Reading stimuli ---------------------------- */

const CATHEDRAL_PASSAGE = `The great cathedrals of medieval Europe remain among the most ambitious engineering projects ever attempted with preindustrial technology. Their builders faced a structural paradox: the theological desire for walls of glass, which flooded the nave with symbolic divine light, stood in direct tension with the physical necessity of supporting enormous stone vaults that exerted constant outward thrust.

The solution emerged gradually through the twelfth and thirteenth centuries. Masons developed the pointed arch, which channels weight more steeply downward than a rounded arch, and paired it with ribbed vaulting that concentrates loads at discrete points rather than along continuous wall surfaces. From this insight followed the flying buttress: a slender arched strut that leaps across the aisle roof to carry the vault's lateral thrust outward to a massive external pier. Freed from their load-bearing duty, the walls between the piers could be opened into vast clerestory windows.

Master builders transmitted this knowledge through lodges and apprenticeships rather than written treatises, which is why so few structural calculations survive from the period. What does survive suggests an empirical culture: masons tested proportions, observed which cathedrals cracked and which did not, and codified rules of thumb across generations. Modern seismic surveys indicate that many of these structures have quietly accumulated damage from centuries of traffic vibration and thermal cycling, and conservation engineers now use laser scanning and finite-element modeling to identify which medieval geometries remain sound and which require intervention.`;

const SEISMOLOGY_PASSAGE = `Seismology transformed from a curiosity of instrument-keeping into a quantitative science of the Earth's interior through a single insight: seismic waves travel at speeds determined by the rocks they cross, so the arrival times of waves recorded thousands of kilometers from an earthquake act like a CT scan of the planet.

Two body waves dominate the record. Primary waves, or P-waves, compress and expand the material they pass through and can travel through both solids and liquids. Secondary waves, or S-waves, shear rock sideways and cannot propagate through fluids at all. When, in 1906, Richard Oldham noticed that S-waves vanished on the far side of the Earth, the simplest explanation was a liquid core blocking them, and by 1926 Inge Lehmann had refined the travel-time residuals to argue for a solid inner core nested inside that liquid outer one.

More recently, seismologists have learned to read not just when waves arrive but how their speeds vary by fractions of a percent. Tomographic models built from millions of such measurements reveal vast slow-velocity provinces sinking in the mantle beneath the Pacific and rising beneath Africa, reshaping pictures of how heat escapes from the deep Earth. Even faint 'PKP precursor' arrivals, waves that skim the boundary of the inner core, now hint that the innermost Earth may be a distinct chemical layer, a relic of the planet's first hundred million years.`;

const COFFEE_PASSAGE = `Before it reaches a grinder, green coffee has been largely flavorless: the aromas we associate with a morning brew exist almost entirely as tasteless precursors locked inside the bean, awaiting the chemistry of roasting. As bean temperature climbs past 150 degrees Celsius, Maillard reactions between amino acids and sugars begin generating hundreds of volatile compounds; around 200 degrees, caramelization of residual sugars deepens sweetness and color; and near 220 degrees, the cellulose structure of the bean begins to break down, releasing carbon dioxide and forcing the bean to swell and lighten along a fissure roasters call the 'first crack.'

Roast profiles are, in effect, recipes of time and temperature. A light roast stops shortly after first crack, preserving the bean's origin character — the floral and fruity compounds that dissipate with prolonged heat. A dark roast pushes toward 'second crack,' when gases escape with an audible pop and the bean's surface oils migrate outward, substituting smoky, bittersweet roast flavor for varietal nuance.

What happens after roasting is equally chemical. Degassing continues for days, and the same oxidation that makes roasted coffee stale accelerates with temperature and light. Recent packaging research suggests that the one-way valve, a small plastic disc that lets carbon dioxide escape without admitting oxygen, extended shelf life more than any change in roast technology in the past century — a reminder that the science of coffee lives as much in material engineering as in the bean itself.`;

const MUSEUM_NOTICE_STIMULUS = `CITY MARITIME MUSEUM — SUMMER EXHIBITION UPDATE

Beginning June 3, the temporary exhibition 'Salt, Ships, and Ledger Books' will relocate from Gallery 4 to the Main Rotunda, closing Mondays until further notice for conservation work. Members and school groups with reserved entries should use the Harbor Street entrance, where new turnstiles replaced the paper-ticket desk last month. Timed tickets must be scanned within 15 minutes of the printed entry window, after which the reservation is released to walk-up visitors. The auditorium screening of archival dockyard footage continues at 2:00 PM daily and requires no separate ticket.`;

const RESEARCH_SIGNUP_STIMULUS = `From: Dr. Amara Osei (Psychology Research Pool)
To: All Undergraduate Students
Date: September 4
Subject: Research Participation Credit Now Open

Dear students,

The Psychology Research Pool has opened sign-up for the fall term. Students enrolled in courses that award participation credit may now reserve one-hour sessions on judgment and decision-making in the Behavior Lab (Room 214). Sessions run weekdays from 9 AM to 7 PM and Saturdays until noon.

You may not enroll in more than six studies per term, and each study shows the exact number of remaining slots in the schedule. No-shows are counted as completed sessions, so please cancel at least two hours in advance if you cannot attend. At the end of the term your advisor's office receives an automatic transcript of completed hours — there is no need to keep paper receipts.`;

const STUDENT_CHAT_STIMULUS = `Priya (4:12 PM): Did anyone get a reply from Prof. Tanaka about moving Friday's exam?
Diego (4:15 PM): She posted on the course page — exam moves to next Wednesday, same time, same room.
Priya (4:15 PM): THANK YOU. That was my only final that week.
Mei (4:21 PM): Careful, the room changed too. Bldg 2 Room 118, not the lecture hall.
Diego (4:22 PM): Wait, what? Where does it say that?
Mei (4:23 PM): Bottom of the announcement. Apparently the lecture hall hosts the robotics showcase Friday... I mean Wednesday.
Priya (4:26 PM): Ok so: Wednesday, 118. I'll update the shared calendar before someone shows up at the wrong door again.`;

/* ---------------------------- Listening transcripts --------------------- */

const LIBRARY_CONVO_TRANSCRIPT = `Woman: Excuse me, I'm on a student extension for this book, but I just realized I'm moving out of my apartment next week and I won't have a place to keep it.
Man: Do you want to check the due date on your account? Because the quickest option is usually to return it early to any of the drop boxes — you don't have to wait for the end of the extension.
Woman: Even though there's still a month left? I won't be charged anything?
Man: No charge. Early returns are welcome, and the copy goes right back on the shelf. Or, if you'd rather keep reading it, we can transfer your borrowing record to the off-campus annex, which mails materials to your new address.
Woman: The annex is the mail one, right? That might actually be easier.
Narrator: What does the woman mostly want to do?`;

const HOUSING_CONVO_TRANSCRIPT = `Man: You asked me to stop by about the housing application. I filled everything out, but the form asked for a guarantor and my parents don't have income statements anymore.
Woman: The university has an alternative — the emergency housing fund covers the deposit directly, and you repay in small monthly installments. It's designed for exactly this situation.
Man: Does that go through the same deadline as the regular application? Because I can't get the income paperwork at all.
Woman: That's the point: the fund bypasses the guarantor requirement. You'd submit the standard form, leave the guarantor block blank, and attach this one-page statement instead. I can email you the form now.
Man: That would be great. And if I miss the deadline this week?
Woman: Then we place you in the overflow list for February openings, but honestly, with the statement it shouldn't come to that.
Narrator: What problem does the student solve by using the emergency housing fund?`;

const ART_CLUB_TRANSCRIPT = `Woman: The spring exhibition committee wants your photography set, but there's one catch — they only display works printed on archival paper, and you've been printing on glossy stock.
Man: How different is archival? I mean, can I just reprint the same twelve images?
Woman: You can reprint, but archival prints take about two weeks from the specialty shop, and the committee's wall labels need your final titles before then.
Man: Okay, so if I order the reprints Monday, titles by Friday...
Woman: Then everything's in time. Oh, and the gallery lights are UV-filtered, so no protective glazing on your side, saving you some money.
Man: One less thing. I'll write out the titles tonight so nothing waits on me.
Narrator: What will the man do before Friday?`;

const VOLUNTEER_TRANSCRIPT = `Man: You signed up for the weekend river clean-up, and I'm confirming logistics for first-time volunteers. You'll need closed-toe boots — the banks have gravel and glass — and the gloves and grabbers are provided at the tent.
Woman: Is the morning shift for sorting recyclables the same location as the bank sweep?
Man: No, that's the trick — sorting happens at the boathouse, a mile east. The bus leaves the student center at eight, drops sweepers first, then continues to the boathouse, and it picks everyone up at noon.
Woman: So if I'm sorting, I stay on the bus past the first stop?
Man: Exactly. Bring a water bottle and one labeled bag for your own lunch; everything else we supply.
Narrator: What will the woman do on Saturday?`;

const PARKING_ANNOUNCEMENT = `Good afternoon. Facilities Management will repaint the lots north of the science complex starting Monday, and several access rules will apply for two weeks. During the first week, permit holders in lots N1 and N2 must use lot N3, where extra attendants will direct traffic at peak hours; a shuttle will run every fifteen minutes between lot N3 and the science quad. In the second week, N1 and N2 reopen, but loading zones on College Street remain closed for curb reconstruction. Evening residents of the terraces keep their overnight permits throughout both weeks. Reminders: unclosed barriers mean a citation is automatic, and appeals must be filed within seven days. Thank you.`;

const REGISTRATION_ANNOUNCEMENT = `Attention students. Priority registration for next term begins in seventy-two hours, and the registrar wants to flag three changes this cycle. First, the advising hold has moved online: meet with your advisor through the portal, and the hold lifts within one hour instead of one business day. Second, tuition payment plans must be selected during registration itself; previously they opened a week later. Third, waitlisted seats auto-enroll only once this year, so if you decline at midnight by email, the seat passes to the next student permanently. Departmental offices will host extended evening hours all week for plan questions. Repeat: advising holds now clear within one hour through the portal.`;

const MAGNETORECTION_TALK = `Professor: By now we've talked about how animals use the sun and stars to navigate, but today's question is harder: what happens when neither is visible? Migratory songbirds cross continents at night and sometimes in overcast skies, and decades of experiments point to something no less remarkable — a magnetic sense.

The evidence begins with cage experiments: birds whose exposure to the Earth's field is distorted by coils don't merely get confused; they shift their orientation predictably, as if a dial had been turned. And certain compounds in the birds' retina, cryptochromes, change their chemistry depending on magnetic alignment — with a catch that makes them extraordinary. The effect requires light; in darkness, the molecular compass goes silent.

So we're left with a strange possibility: the birds may literally see the field's inclination as a shading overlay on their vision. A second candidate system exists in beak tissue rich in iron-mineral crystals, likely sensing field strength rather than direction. Current models don't compete; they combine — a light-dependent compass for heading in the eye, and a magnetite-based ruler in the bill to read intensity. And that combination, if you think about it, turns an animal's head into an instrument more sensitive than anything humans carried on ships before the twentieth century.`;

const ECONOMICS_TALK = `Professor: Consider a rule that seems reasonable: give every bidder one minute, in order, on the phone, for a scarce license. Now imagine sixty bidders and one hour. Nothing is allocated by noon. What has gone wrong isn't time; it's that the rule asks bidders to pay with waiting instead of with money, and waiting destroys value for everyone, including the seller.

Auction design is the study of how rules turn private information into prices without wasting the thing being sold. The breakthrough came with clock auctions for radio spectrum: prices tick upward across many licenses simultaneously, and a bidder who wants an early slot bids her way to one rather than sitting through a queue. The Federal Communications Commission ran its first in 1994 and raised far more than fixed-price assignments had, which is the rarest compliment economics can pay a mechanism — both sides preferring it to what came before.

Here's the subtlety, and it's where homework today lives. Simultaneity means prices are complements: a firm wanting two adjacent licenses will bid differently when either one looks obtainable than when both look hopeless. Designers call this the exposure problem, and notice how it arises from nothing but the rule itself. So when we say 'efficient market,' the market is not the object we're discovering; it's the artifact we're building, one line of auction rule at a time.`;

const ASTRONOMY_TALK = `Professor: The night sky is not fixed, but people in antiquity concluded that for a defensible reason — over a human lifetime, nothing moves where you can see it. The exception that broke the rule came from careful archives: medieval astronomers in several cultures kept noting that certain 'stars' sometimes brightened until they were visible by day, and then faded. These were 'new stars,' what we now call supernovae.

For historians of science the significance is double. First, supernovae like the one that built the Crab Nebula in 1054 forced a slow concession that change happens in the heavens, which quietly weakened the architecture of perfect spheres. Second — and I want you to notice how unusual this is — our best records of those events come from East Asian court chronicles, not European ones, because dynastic astronomers were employed to watch the sky for exactly this reason, and a European observer without institutional backing was less likely to write anything down.

Modern astronomy has reversed the roles. Courts are gone, but the historical record itself is now data: by dating the shells of dust around remnants, we test chronicle entries against physics, and the Crab's expansion agrees with the recorded year within a margin of a few percent. A thousand-year-old bureaucracy has become a measurement instrument. Questions for Thursday: what does the term 'secular' mean in the phrase 'secular acceleration,' and can you find one culture that recorded 1054 but not 1006?`;

const CHOICE_RESPONSE_1 = `Narrator: Listen to a student and a facilities worker.
Woman: Do I hand in the elevator access request at the same desk where I picked up the badge?
Man: It used to be. Now the whole thing is digital — the form routes to my queue automatically once your department chair approves it.
Narrator: What does the man mean?`;

const CHOICE_RESPONSE_2 = `Narrator: Listen to two researchers.
Man: Did the calibration on the spectrometer hold through the weekend?
Woman: Held long enough to capture three full cycles — which is one cycle short of the paper's claim but two more than anyone else has logged.
Narrator: What does the woman mean?`;

const CHOICE_RESPONSE_3 = `Narrator: Listen to a conversation about a group project.
Woman: I thought the client said the deadline was soft.
Man: Soft in the sense that penalties are negotiable, not that the date is. Read the contract again — the delivery milestone is underlined.
Narrator: What does the man mean?`;

const CHOICE_RESPONSE_4 = `Narrator: Listen to a student talking to a librarian.
Man: If I renew the book twice and it still isn't returned, does the account freeze automatically or does someone email me first?
Woman: The freeze is automatic on the forty-fifth day; the emails go out at thirty and forty.
Narrator: What will happen if the book is still out on the forty-fifth day?`;

/* ------------------------------ Content items ---------------------------- */

let idx = 0;
const nextId = () => makeItemId(9, ++idx);

export const PLUTO_ITEMS: SeedQuestionItemRow[] = [
  /* --------------------------- Reading (Module 1) ------------------------- */
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Medieval Cathedral Engineering (Q1–10)",
    passageText: `The builders of medieval cathedrals confronted a structural [1] paradox: the desire for walls of glass to fill the nave with symbolic light, set against the need to [2] support stone vaults that pushed outward with tremendous force. Their decisive innovation was the pointed arch, which channels weight more [3] steeply downward than a rounded arch and concentrates loads at discrete [4] points through ribbed vaulting. This insight enabled the flying buttress — a slender [5] arched strut that leaps across the aisle roof to carry lateral thrust to an external [6] pier. With the walls no longer bearing the vault's weight, masons could open the clerestory into vast [7] windows of colored glass. Knowledge passed between builders through lodges and apprenticeships rather than written [8] treatises, so surviving structural calculations are rare. What survives instead is an empirical [9] culture of observation: which cathedrals cracked, which did not. Modern conservators now scan these facades with laser instruments and simulate the results digitally to determine which medieval geometries remain [10] sound.`,
    blanks: [
      { index: 1, prefix: "para", answer: "dox" },
      { index: 2, prefix: "sup", answer: "port" },
      { index: 3, prefix: "stee", answer: "ply" },
      { index: 4, prefix: "po", answer: "ints" },
      { index: 5, prefix: "ar", answer: "ched" },
      { index: 6, prefix: "pe", answer: "ir" },
      { index: 7, prefix: "windo", answer: "ws" },
      { index: 8, prefix: "trea", answer: "tises" },
      { index: 9, prefix: "cult", answer: "ure" },
      { index: 10, prefix: "s", answer: "ound" },
    ],
    explanation:
      "Context: the passage traces a structural paradox, its load-bearing solution (pointed arch, ribbed vault, buttress to pier), the culture of treatise-free empiricism, and modern structural verification of what remains sound.",
  }),
  buildCompleteWordsItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Complete the Words: Seismology and Earth Imaging (Q11–20)",
    passageText: `Seismology became a quantitative science of the deep Earth through one observation: seismic waves travel at [11] speeds fixed by the rocks they cross, so arrival times recorded at distant stations act like a scan of the planet's [12] interior. Primary waves [13] compress and expand material and pass through solids and liquids alike, while secondary waves shear rock [14] sideways and cannot propagate through a fluid at all. The disappearance of S-waves in the far-side shadow led Oldham to conclude that the outer core is [15] liquid; Lehmann later read the residuals closely enough to detect a solid inner [16] core within it. Tomography now assembles millions of slight speed variations into models of vast slow [17] provinces sinking in the mantle. Faint precursor arrivals skimming the inner core's [18] boundary even hint that the innermost layer is chemically [19] distinct — a relic of the young planet preserved at [20] depth.`,
    blanks: [
      { index: 11, prefix: "sp", answer: "eeds" },
      { index: 12, prefix: "interi", answer: "or" },
      { index: 13, prefix: "com", answer: "press" },
      { index: 14, prefix: "side", answer: "ways" },
      { index: 15, prefix: "liq", answer: "uid" },
      { index: 16, prefix: "co", answer: "re" },
      { index: 17, prefix: "provi", answer: "nces" },
      { index: 18, prefix: "bound", answer: "ary" },
      { index: 19, prefix: "disti", answer: "nct" },
      { index: 20, prefix: "d", answer: "epth" },
    ],
    explanation:
      "Context: wave speeds, the solid/liquid distinction for P and S waves, the liquid outer and solid inner core, tomographic provinces, boundary layers, and deep preservation.",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Read in Daily Life: Museum Exhibition Notice (Q21)",
    formatType: "notice",
    senderName: "City Maritime Museum",
    senderHandle: "exhibits@maritimemuseum.org",
    subject: "Summer exhibition update",
    dateLabel: "June 1",
    stimulusText: MUSEUM_NOTICE_STIMULUS,
    questionStem:
      "Why must a visitor with a timed ticket arrive within fifteen minutes of the printed entry window?",
    options: [
      "Because the reservation is released to walk-up visitors after that time.",
      "Because Gallery 4 closes to the public on Mondays.",
      "Because the auditorium screening starts at 2:00 PM.",
      "Because members must enter through the Harbor Street door.",
    ],
    correctOptionId: "A",
    explanation:
      "The notice states timed tickets 'must be scanned within 15 minutes of the printed entry window, after which the reservation is released to walk-up visitors.' The Monday closure, screening, and member entrance are separate rules.",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Read in Daily Life: Museum Exhibition Notice (Q22)",
    formatType: "notice",
    senderName: "City Maritime Museum",
    senderHandle: "exhibits@maritimemuseum.org",
    subject: "Summer exhibition update",
    dateLabel: "June 1",
    stimulusText: MUSEUM_NOTICE_STIMULUS,
    questionStem: "What can be inferred about the school group's entry on a Monday in July?",
    options: [
      "They would need to choose a non-Monday date for the relocated exhibition.",
      "They will be refused entry unless they print paper tickets.",
      "They can enter through the Harbor Street door only with a special pass.",
      "Their visit will include the archival film screening at no extra charge only on Mondays.",
    ],
    correctOptionId: "A",
    explanation:
      "The relocated exhibition closes Mondays 'until further notice,' so a Monday school visit cannot see it. The film screening requires no separate ticket every day, so option D reverses the schedule logic.",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Read in Daily Life: Research Participation Email (Q23)",
    formatType: "email",
    senderName: "Dr. Amara Osei",
    senderHandle: "research-pool@university.edu",
    subject: "Research Participation Credit Now Open",
    dateLabel: "September 4",
    stimulusText: RESEARCH_SIGNUP_STIMULUS,
    questionStem:
      "According to the email, what happens if a student fails to cancel at least two hours before a session?",
    options: [
      "The missed session is counted as completed.",
      "The student is removed from the pool for the term.",
      "The advisor's office receives a warning letter.",
      "The student must attend a makeup orientation.",
    ],
    correctOptionId: "A",
    explanation:
      "The email states plainly: 'No-shows are counted as completed sessions, so please cancel at least two hours in advance.' No penalties like removal or makeup sessions are mentioned.",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Read in Daily Life: Research Participation Email (Q24)",
    formatType: "email",
    senderName: "Dr. Amara Osei",
    senderHandle: "research-pool@university.edu",
    subject: "Research Participation Credit Now Open",
    dateLabel: "September 4",
    stimulusText: RESEARCH_SIGNUP_STIMULUS,
    questionStem: "Which statement best describes how completion hours are recorded?",
    options: [
      "Automatically by the system at the end of the term.",
      "Only if students submit paper receipts by the last week.",
      "Manually by Dr. Osei at each session.",
      "Through the advisor, who approves hours in the portal.",
    ],
    correctOptionId: "A",
    explanation:
      "The email closes: 'At the end of the term your advisor's office receives an automatic transcript of completed hours — there is no need to keep paper receipts.'",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "lower",
    title: "Read in Daily Life: Exam Change Text Chain (Q25)",
    formatType: "text_chain",
    senderName: "Priya",
    senderHandle: "group-chat",
    subject: "Friday exam update",
    dateLabel: "Today",
    stimulusText: STUDENT_CHAT_STIMULUS,
    questionStem: "What will most likely happen if the group does not update the shared calendar?",
    options: [
      "Some students may appear for the exam at the wrong location.",
      "The exam may be postponed again past Wednesday.",
      "The robotics showcase will occupy Room 118.",
      "Priya will miss the exam because of a conflict.",
    ],
    correctOptionId: "A",
    explanation:
      "Diego asks 'Where does it say that?' about the room change, and Priya concludes by updating the calendar 'before someone shows up at the wrong door again' — referencing a prior mix-up. The showcase was Friday's scheduling reason, not a Wednesday conflict in 118.",
  }),
  buildDailyLifeItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Read in Daily Life: Exam Change Text Chain (Q26)",
    formatType: "text_chain",
    senderName: "Priya",
    senderHandle: "group-chat",
    subject: "Friday exam update",
    dateLabel: "Today",
    stimulusText: STUDENT_CHAT_STIMULUS,
    questionStem: "Why does Mei mention the lecture hall in the chain?",
    options: [
      "To explain why the exam cannot remain in the lecture hall on the new date.",
      "To complain that the professor changed rooms without notice.",
      "To suggest the group attend the robotics showcase instead.",
      "To confirm that the original Friday plan still stands.",
    ],
    correctOptionId: "A",
    explanation:
      "Mei writes that 'the room changed too' and cites the showcase occupying the hall, explaining why the relocated exam is in Room 118. She is offering the reason for the room change, not complaining or inviting attendance.",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Medieval Cathedral Engineering (Q28)",
    stimulusText: CATHEDRAL_PASSAGE,
    questionSubType: "factual",
    questionStem:
      "According to the passage, what directly allowed clerestory walls to be opened into large windows?",
    options: [
      "The flying buttress transferred the vault's lateral thrust to external piers.",
      "Iron tie-rods replaced the need for stone piers entirely.",
      "Ribbed vaulting made the nave roof light enough to rest on partitions.",
      "Written treatises standardized wall thickness across regions.",
    ],
    correctOptionId: "A",
    explanation:
      "Paragraph two states that once buttressing carried thrust outward, 'Freed from their load-bearing duty, the walls between the piers could be opened into vast clerestory windows.'",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Medieval Cathedral Engineering (Q29)",
    stimulusText: CATHEDRAL_PASSAGE,
    questionSubType: "vocabulary",
    questionStem: "The word 'ambitious' in the passage is closest in meaning to:",
    options: ["bold and demanding", "widely funded", "carefully planned", "universally admired"],
    correctOptionId: "A",
    explanation:
      "'Ambitious engineering projects' here connotes audacious scope and difficulty; the passage emphasizes daring, not funding or reputation.",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Medieval Cathedral Engineering (Q30)",
    stimulusText: CATHEDRAL_PASSAGE,
    questionSubType: "inference",
    questionStem:
      "What can be inferred about cathedral-building knowledge before modern digital modeling?",
    options: [
      "It was validated by generations of visible structural outcomes rather than calculations.",
      "It was lost entirely when printed engineering manuals replaced lodges.",
      "It relied on calculations that survived in parish archives.",
      "It assumed thermal cycling would not affect masonry.",
    ],
    correctOptionId: "A",
    explanation:
      "The third paragraph describes an empirical culture — 'observed which cathedrals cracked and which did not' — and notes few calculations survive; validation came from outcomes across generations.",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Seismology and Earth Imaging (Q31)",
    stimulusText: SEISMOLOGY_PASSAGE,
    questionSubType: "negative_factual",
    questionStem: "All of the following are mentioned as true of seismic waves EXCEPT:",
    options: [
      "S-waves travel faster than P-waves through the mantle.",
      "P-waves can travel through both liquids and solids.",
      "Wave arrival times at distant stations reveal interior structure.",
      "Tiny speed differences allow tomographic modeling.",
    ],
    correctOptionId: "A",
    explanation:
      "The passage never claims S-waves are faster — it notes only that S-waves cannot cross fluids. Options B, C, and D are all explicitly stated.",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Seismology and Earth Imaging (Q32)",
    stimulusText: SEISMOLOGY_PASSAGE,
    questionSubType: "rhetorical_purpose",
    questionStem:
      "Why does the author mention Oldham's 1906 observation and Lehmann's later analysis?",
    options: [
      "To show how successive refinements of one dataset revealed core structure.",
      "To argue that early seismologists had superior instruments.",
      "To demonstrate that S-waves arrive before P-waves at distant stations.",
      "To give examples of instruments invented for tomography.",
    ],
    correctOptionId: "A",
    explanation:
      "The passage chains Oldham's shadow-zone conclusion (liquid outer core) to Lehmann's residual analysis (solid inner core) — a sequence of refinement from shared observations.",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Seismology and Earth Imaging (Q33)",
    stimulusText: SEISMOLOGY_PASSAGE,
    questionSubType: "sentence_simplification",
    questionStem:
      "Which sentence best expresses the essential information in: 'by 1926 Inge Lehmann had refined the travel-time residuals to argue for a solid inner core nested inside that liquid outer one.'?",
    options: [
      "Lehmann reexamined timing discrepancies and concluded a solid core lies within the liquid outer core.",
      "Lehmann discovered that travel times had been measured incorrectly since 1906.",
      "Lehmann replaced P-wave data with S-wave data to map the outer core.",
      "Lehmann proved the inner core's chemistry differs from the mantle's.",
    ],
    correctOptionId: "A",
    explanation:
      "The core idea is refinement of residual timing data → the nested solid core claim. 'Residuals' means discrepancies in timing, not measurement errors to be replaced.",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "The Chemistry of Coffee Roasting (Q34)",
    stimulusText: COFFEE_PASSAGE,
    questionSubType: "factual",
    questionStem: "According to the passage, what occurs at 'first crack'?",
    options: [
      "Released gases force the bean to swell and split along a fissure.",
      "Surface oils migrate outward, darkening the bean.",
      "Caramelization begins converting amino acids into sugars.",
      "Oxidation starts inside the one-way valve.",
    ],
    correctOptionId: "A",
    explanation:
      "The passage says near 220°C the cellulose structure breaks down, 'releasing carbon dioxide and forcing the bean to swell and lighten along a fissure roasters call the first crack.' Oil migration belongs to darker roasts; the Maillard description in C reverses reactants.",
  }),
  buildAcademicReadingItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "The Chemistry of Coffee Roasting (Q35)",
    stimulusText: COFFEE_PASSAGE,
    questionSubType: "inference",
    questionStem: "What can the passage imply about stopping a roast 'shortly after first crack'?",
    options: [
      "It preserves compounds that later heat would destroy.",
      "It increases the bean's cellulose content before packaging.",
      "It prevents degassing from starting at all.",
      "It makes one-way valves unnecessary.",
    ],
    correctOptionId: "A",
    explanation:
      "Light roasts stop 'shortly after first crack, preserving the bean's origin character — the floral and fruity compounds that dissipate with prolonged heat.'",
  }),

  /* ------------------------------ Listening ------------------------------ */
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Listen and Choose — Library Early Return (Q1)",
    transcript: LIBRARY_CONVO_TRANSCRIPT,
    campusContext: "University Library",
    questionStem: "What does the woman mostly want to do?",
    options: [
      "Get rid of a borrowed book before she moves out.",
      "Extend her borrowing period by a month.",
      "Transfer her account to the off-campus annex.",
      "Ask why the drop boxes were replaced.",
    ],
    correctOptionId: "A",
    explanation:
      "She explains she is moving and will have no place for the book; both offered routes (early return, annex transfer) solve disposal, but her opening question is about handing it in. The annex is the man's alternative that she calls 'easier' only tentatively — the conversation's primary purpose is returning the book.",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Listen and Choose — Housing Guarantor (Q2)",
    transcript: HOUSING_CONVO_TRANSCRIPT,
    campusContext: "Housing Office",
    questionStem: "What problem does the student solve by using the emergency housing fund?",
    options: [
      "It removes the requirement his family cannot meet.",
      "It extends the application deadline by a week.",
      "It covers his rent for the entire first term.",
      "It guarantees a February room instead of a March one.",
    ],
    correctOptionId: "A",
    explanation:
      "The worker says 'the fund bypasses the guarantor requirement' — the block his parents' income situation can't satisfy. The deadline is unchanged; the fund covers the deposit, repaid in installments.",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Listen and Choose — Exhibition Reprints (Q3)",
    transcript: ART_CLUB_TRANSCRIPT,
    campusContext: "Student Gallery",
    questionStem: "What will the man do before Friday?",
    options: [
      "Finish a task the gallery needs even though his reprints are still in progress.",
      "Order archival paper from the specialty shop.",
      "Deliver twelve prints to the committee.",
      "Install UV filters for the exhibition lighting.",
    ],
    correctOptionId: "A",
    explanation:
      "Reprints take two weeks (so delivery is after Friday), but he says 'I'll write out the titles tonight' because labels are needed before the printing finishes. The glazing point means he avoids an extra purchase, not an install.",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_conversation",
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Listen and Choose — River Clean-up (Q4)",
    transcript: VOLUNTEER_TRANSCRIPT,
    campusContext: "Environmental Center",
    questionStem: "What will the woman do on Saturday?",
    options: [
      "Stay on the bus past the first stop to reach her work site.",
      "Bring her own gloves and a grabber to the tent.",
      "Return to the student center before noon.",
      "Sort recyclables at the same place she sweeps the banks.",
    ],
    correctOptionId: "A",
    explanation:
      "The bus drops sweepers first and continues to the boathouse where she is assigned: 'if I'm sorting, I stay on the bus past the first stop' — confirmed by the man. Gloves and grabbers are provided; noon is pickup for everyone.",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Listen and Choose — Parking Repaint (Q5)",
    transcript: PARKING_ANNOUNCEMENT,
    campusContext: "Campus Parking",
    questionStem: "What is the main reason attendants are placed in lot N3?",
    options: [
      "Permit holders from closed lots must be directed there during week one.",
      "The loading zones on College Street will remain open.",
      "Overnight terrace permits are suspended for two weeks.",
      "Shuttle vans cannot enter the science quad.",
    ],
    correctOptionId: "A",
    explanation:
      "During week one, N1/N2 holders 'must use lot N3, where extra attendants will direct traffic at peak hours.' The terraces keep permits; the shuttle exists because N3 is a mile from the quad — not because vans are banned from it.",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_announcement",
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Listen and Choose — Registration Changes (Q6)",
    transcript: REGISTRATION_ANNOUNCEMENT,
    campusContext: "Registrar's Office",
    questionStem:
      "According to the announcement, what must a student who declines a waitlisted seat accept?",
    options: [
      "The seat passes permanently to the next student.",
      "A second hold on their portal.",
      "Repayment of the tuition plan deposit.",
      "Loss of priority registration next term.",
    ],
    correctOptionId: "A",
    explanation:
      "The third change: 'waitlisted seats auto-enroll only once this year, so if you decline at midnight by email, the seat passes to the next student permanently.'",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "upper",
    title: "Listen and Choose — Magnetoreception (Q7)",
    transcript: MAGNETORECTION_TALK,
    academicDomain: "Biology",
    questionStem: "What makes the cryptochrome compass 'extraordinary,' as the professor puts it?",
    options: [
      "Its molecular response depends on light, linking the sense to vision.",
      "It replaces the magnetite system in overcast skies.",
      "It measures field strength rather than direction.",
      "It functions in total darkness inside the retina.",
    ],
    correctOptionId: "A",
    explanation:
      "The professor notes cryptochrome chemistry changes with magnetic alignment 'with a catch that makes them extraordinary. The effect requires light.' Strength-sensing belongs to the beak's magnetite system, which complements rather than replaces it.",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Listen and Choose — Magnetoreception (Q8)",
    transcript: MAGNETORECTION_TALK,
    academicDomain: "Biology",
    questionStem: "Why does the professor mention ships before the twentieth century?",
    options: [
      "To emphasize how sensitive the biological compass is.",
      "To trace the history of navigation instruments.",
      "To compare animal and human learning curves.",
      "To argue that migration evolved recently.",
    ],
    correctOptionId: "A",
    explanation:
      "The closing line — the birds' combined compass and ruler is 'more sensitive than anything humans carried on ships before the twentieth century' — is a rhetorical scale comparison underscoring sensitivity.",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Listen and Choose — Auction Design (Q9)",
    transcript: ECONOMICS_TALK,
    academicDomain: "Economics",
    questionStem: "What does the professor identify as wrong with one-minute sequential bidding?",
    options: [
      "It taxes bidders with waiting, destroying value the seller loses too.",
      "It allocates licenses to the slowest communicators.",
      "It allows collusion once prices tick past reserve.",
      "It favors firms wanting only one license.",
    ],
    correctOptionId: "A",
    explanation:
      "'Nothing is allocated by noon. What has gone wrong isn't time; it's that the rule asks bidders to pay with waiting instead of with money, and waiting destroys value for everyone, including the seller.'",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Listen and Choose — Auction Design (Q10)",
    transcript: ECONOMICS_TALK,
    academicDomain: "Economics",
    questionStem:
      "What does the professor mean when she says the market is 'the artifact we're building'?",
    options: [
      "Prices and strategies emerge from the rules chosen, not from nature alone.",
      "Auction houses physically manufacture trust between strangers.",
      "The FCC invented economics as an academic field in 1994.",
      "Clock auctions failed to improve on fixed-price assignment.",
    ],
    correctOptionId: "A",
    explanation:
      "The exposure problem 'arises from nothing but the rule itself,' leading to her conclusion that efficient markets are constructed by design. The FCC result was the opposite of D — it raised more.",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Listen and Choose — New Stars (Q11)",
    transcript: ASTRONOMY_TALK,
    academicDomain: "History of Science",
    questionStem:
      "According to the professor, why do 'new star' records concentrate in East Asian court chronicles?",
    options: [
      "Court astronomers were salaried to observe the sky systematically.",
      "European telescopes were not invented until the seventeenth century.",
      "The Crab supernova was only visible from East Asia.",
      "Dynastic scribes dated dust shells before recording events.",
    ],
    correctOptionId: "A",
    explanation:
      "The second paragraph explains institutional recording: employed court astronomers versus less-documented European observers. Telescopes are irrelevant (naked-eye events); dating shells is modern research that uses the chronicles.",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_academic_talk",
    moduleNumber: 2,
    difficultyBand: "upper",
    title: "Listen and Choose — New Stars (Q12)",
    transcript: ASTRONOMY_TALK,
    academicDomain: "History of Science",
    questionStem:
      "What is the professor's point in calling 'a thousand-year-old bureaucracy' a 'measurement instrument'?",
    options: [
      "Historical records now function as data testable by physical models.",
      "Ancient governments measured nebulae with court instruments.",
      "Chronicles are unreliable and must be discarded.",
      "Modern astronomers are as systematic as dynastic ones.",
    ],
    correctOptionId: "A",
    explanation:
      "She describes dating remnant shells against chronicle years, 'the recorded year within a margin of a few percent' — the archive becomes verifiable data.",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_choose_response",
    moduleNumber: 1,
    difficultyBand: "lower",
    title: "Listen and Choose a Response — Elevator Access (Q13)",
    transcript: CHOICE_RESPONSE_1,
    campusContext: "Access Services",
    questionStem: "What does the man mean?",
    options: [
      "The woman no longer needs to visit his desk at all.",
      "The badge office has moved to another building.",
      "Chair approval must be collected in person.",
      "The queue is processed only once a week.",
    ],
    correctOptionId: "A",
    explanation:
      "'It used to be. Now the whole thing is digital' — the request routes to his queue automatically after chair approval, so no physical drop-off is needed.",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_choose_response",
    moduleNumber: 1,
    difficultyBand: "middle",
    title: "Listen and Choose a Response — Spectrometer Calibration (Q14)",
    transcript: CHOICE_RESPONSE_2,
    campusContext: "Physics Lab",
    questionStem: "What does the woman mean?",
    options: [
      "They captured nearly enough data to matter, and more than prior work.",
      "The calibration failed over the weekend.",
      "The paper's claim needs a fourth cycle before publication.",
      "No one else has attempted three cycles.",
    ],
    correctOptionId: "A",
    explanation:
      "'One cycle short of the paper's claim but two more than anyone else has logged' — close to the target, still record-setting. D contradicts 'two more than anyone else.'",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_choose_response",
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Listen and Choose a Response — Client Deadline (Q15)",
    transcript: CHOICE_RESPONSE_3,
    campusContext: "Design Studio",
    questionStem: "What does the man mean?",
    options: [
      "The date is firm even though the fines are negotiable.",
      "The group should ask the client to move the date.",
      "The underlined text is probably a formatting error.",
      "Penalties have been waived for this milestone.",
    ],
    correctOptionId: "A",
    explanation:
      "'Soft in the sense that penalties are negotiable, not that the date is' — the underlined milestone date binds the team; only the consequences flex.",
  }),
  buildListeningItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    taskType: "listen_choose_response",
    moduleNumber: 2,
    difficultyBand: "middle",
    title: "Listen and Choose a Response — Book Freeze (Q16)",
    transcript: CHOICE_RESPONSE_4,
    campusContext: "University Library",
    questionStem: "What will happen if the book is still out on the forty-fifth day?",
    options: [
      "The account will be frozen without any further warning step.",
      "A third reminder email will be sent before any action.",
      "The renewal limits will reset automatically.",
      "The librarian will call before freezing anything.",
    ],
    correctOptionId: "A",
    explanation:
      "'The freeze is automatic on the forty-fifth day; the emails go out at thirty and forty' — reminders precede it; nothing follows except the freeze itself.",
  }),

  /* ------------------------------- Writing ------------------------------- */
  buildSentenceItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 1,
    contextPrompt: "A facilities worker explains why the north lots were repainted on a weekend.",
    targetSentence: "Crews worked overnight to finish the stripes before Monday traffic.",
    wordBank: [
      "Crews",
      "overnight",
      "stripes",
      "before",
      "finish",
      "worked",
      "to",
      "the",
      "Monday",
      "traffic",
      "because",
      "quiet",
    ],
    explanation:
      "Adverbial phrase of time (overnight) precedes the purpose clause (to finish...) and the deadline (before Monday traffic).",
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 2,
    contextPrompt: "You remind a classmate how early returns save everyone time.",
    targetSentence: "Returning the book early clears the shelf for the next borrower.",
    wordBank: [
      "Returning",
      "the",
      "book",
      "early",
      "clears",
      "shelf",
      "for",
      "next",
      "the",
      "the",
      "borrower",
      "late",
      "quietly",
    ],
    explanation:
      "The gerund subject takes a singular verb (clears); 'for the next borrower' completes the purpose.",
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 3,
    contextPrompt: "An advisor explains why the fund bypasses paperwork.",
    targetSentence: "The emergency fund replaces the guarantor requirement entirely.",
    wordBank: [
      "The",
      "fund",
      "replaces",
      "guarantor",
      "entirely",
      "emergency",
      "the",
      "requirement",
      "extends",
      "partly",
    ],
    explanation:
      "Subject (fund), transitive verb (replaces), object (requirement); 'entirely' modifies the whole action, while 'partly' contradicts the source.",
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 4,
    contextPrompt: "Two volunteers compare what each must bring Saturday.",
    targetSentence: "Gloves are provided so bring only boots and water.",
    wordBank: [
      "Gloves",
      "provided",
      "so",
      "bring",
      "only",
      "and",
      "boots",
      "water",
      "are",
      "never",
      "silence",
    ],
    explanation:
      "Passive first clause plus a coordinated imperative with the exclusion 'only'; 'never' inverts meaning.",
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 5,
    contextPrompt: "A curator describes what changed when the exhibition moved.",
    targetSentence: "Relocating the gallery gave the rotunda better natural light.",
    wordBank: [
      "Relocating",
      "the",
      "gallery",
      "gave",
      "the",
      "better",
      "natural",
      "light",
      "rotunda",
      "removed",
      "darkness",
    ],
    explanation:
      "Gerund phrase subject; ditransitive 'gave' takes the rotunda as indirect object and light as direct object.",
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 6,
    contextPrompt: "A student explains the safest way to cancel a session.",
    targetSentence: "Canceling two hours ahead prevents a no-show from counting.",
    wordBank: [
      "Canceling",
      "two",
      "hours",
      "ahead",
      "prevents",
      "no-show",
      "a",
      "from",
      "counting",
      "arriving",
      "loudly",
    ],
    explanation:
      "'Prevents X from counting' — preposition plus gerund is the fixed frame; 'arriving from' is ungrammatical.",
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 7,
    contextPrompt: "A professor notes which evidence first suggested the liquid core.",
    targetSentence: "Missing shear waves revealed a barrier no instrument could see.",
    wordBank: [
      "Missing",
      "shear",
      "waves",
      "revealed",
      "barrier",
      "a",
      "no",
      "could",
      "see",
      "instrument",
      "measured",
      "silently",
    ],
    explanation:
      "The subject clause 'no instrument could see' modifies 'barrier'; relative pronoun is correctly omitted.",
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 8,
    contextPrompt: "A photographer explains the printing order to a club mate.",
    targetSentence: "Titles go to the committee while the shop prints archival copies.",
    wordBank: [
      "Titles",
      "the",
      "committee",
      "while",
      "the",
      "shop",
      "prints",
      "archival",
      "copies",
      "go",
      "to",
      "cancel",
      "random",
    ],
    explanation:
      "'While' joins concurrent actions; the second clause keeps present tense for scheduled work.",
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 9,
    contextPrompt: "An economist summarizes why waiting rules destroy value.",
    targetSentence: "An hour of silence allocates nothing and wastes everyone's time.",
    wordBank: [
      "An",
      "hour",
      "of",
      "silence",
      "allocates",
      "nothing",
      "and",
      "wastes",
      "everyone's",
      "time",
      "silence",
      "sharp",
    ],
    explanation:
      "Coordinated verbs share the singular subject 'hour'; the possessive 'everyone's' closes the object.",
  }),
  buildSentenceItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 10,
    contextPrompt: "A court historian describes how records became data.",
    targetSentence: "Chronicle entries now anchor measurements of nebula expansion.",
    wordBank: [
      "Chronicle",
      "entries",
      "now",
      "anchor",
      "of",
      "measurements",
      "nebula",
      "expansion",
      "erase",
      "quietly",
    ],
    explanation:
      "Plural subject with present-tense verb; 'anchor' here means 'fix in time,' and the 'of' phrase links measurements to the nebula.",
  }),
  buildWriteEmailItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    title: "Write an Email — Lab Section Conflict",
    scenarioContext:
      "You have a doctor's appointment on the same day as your chemistry lab section's practical assessment. The assessment can be taken in an alternate section on Friday, but Friday you are working a paid shift. Your lab instructor, Dr. Reyes, allows schedule changes with documentation and requires requests at least three days before the assessment.",
    recipientRole: "your lab instructor, Dr. Reyes",
    bulletPoints: [
      "state the scheduling conflict with the practical assessment",
      "propose a specific solution that satisfies both the alternate-section rule and the three-day notice",
      "offer to provide the appointment documentation and ask what format is preferred",
    ],
    sampleAnswer:
      "Dear Dr. Reyes, I am writing about the practical assessment in my Tuesday 2 PM lab section. I have a standing medical appointment that cannot be moved to that time. I understand the alternate assessment is offered Friday in the 10 AM section; since today is Monday, I can request the switch within your three-day notice window if I confirm by Wednesday morning. I can also move my work shift. If you approve, I will send the appointment documentation — please let me know whether you prefer the letter from the clinic or a portal upload. Thank you for considering my request. Best regards, A. Student",
  }),
  buildAcademicDiscussionItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    title: "Academic Discussion — Campus Micro-Scheduling",
    courseName: "Urban Planning",
    professorName: "Prof. Almeida",
    professorPrompt:
      "Many transit agencies are testing on-demand micro-buses that reroute in real time based on app requests, instead of fixed shuttles on a loop. The trade-off: coverage per dollar can rise sharply, but wait times become unpredictable and riders without smartphones may lose access. Should our city replace the campus shuttle with on-demand micro-transit?",
    studentPosts: [
      {
        authorName: "Noor",
        avatarSeed: "noor-a",
        text: "I support it. My neighborhood's shuttle loops empty at 7 AM while packed at 5. If routing followed real demand, the same vans could add a third service window. Unpredictable waits can be tamed: show a predicted window, not a fixed schedule, and cap the ride at ten minutes by adding spare vans at peak.",
      },
      {
        authorName: "Ben",
        avatarSeed: "ben-b",
        text: "The smartphone point decides it for me. Half of the dining-hall workers take the shuttle at shift end, and the app-first design strands them. You can dial a hotline, sure, but then dispatchers become the schedule the project was trying to kill. Keep fixed loops for equity, add on-demand only as an after-midnight overlay.",
      },
    ],
    keyPointsToCover: [
      "take a clear position and defend it against at least one point raised by Noor or Ben",
      "address either the equity constraint or the wait-time constraint with a concrete mechanism",
      "go beyond restating: add a consideration neither student raised (e.g., service windows, dispatcher load, performance measurement)",
    ],
    sampleAnswer:
      "I side with a hybrid, but for a reason neither post stresses: the failure mode of fixed loops is not fairness — it is deadhead distance. Empty morning circuits consume the same vans that could cover shift-end demand, so a midnight on-demand overlay as Ben proposes would starve daytime service unless the fleet shrinks. I would run fixed loops through the two peak windows, and dispatch on-demand only off-peak, publishing a hard cap of twelve minutes measured weekly. That answers Noor's wait-time fear with a bound instead of an algorithm promise, and preserves Ben's equity guarantee because the app remains optional — a posted call box and the cap force the agency to honor the window for riders who never open a phone.",
  }),

  /* ------------------------------- Speaking ------------------------------ */
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 1,
    scenarioTitle: "Student Health Clinic",
    sentence: "Same-day appointments are released every morning at eight.",
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 2,
    scenarioTitle: "Student Health Clinic",
    sentence: "Bring your insurance card, or the front desk can quote the visit fee.",
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 3,
    scenarioTitle: "Student Health Clinic",
    sentence: "Prescription refills usually take one business day after review.",
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 4,
    scenarioTitle: "Student Health Clinic",
    sentence: "Flu shots are walk-in only until the end of October.",
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 5,
    scenarioTitle: "Student Health Clinic",
    sentence: "After-hours nurse lines handle triage, not medical records.",
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 6,
    scenarioTitle: "Campus Job Fair",
    sentence: "Employers set up tables in the field house by ten o'clock.",
  }),
  buildListenRepeatItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 7,
    scenarioTitle: "Campus Job Fair",
    sentence: "Bring printed copies of your resume even if you applied online.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 1,
    interviewTopic: "Learning Practical Skills",
    questionText:
      "Some people learn a hands-on skill best by watching others first; others learn fastest by starting with their own hands and fixing mistakes later. Which approach works better for you, and why? Use specific reasons and examples.",
    expectedKeyPhrases: [
      "clear preference stated early",
      "one concrete personal example",
      "reason tied to the example",
      "brief comparison to the other approach",
    ],
    sampleAnswer:
      "I learn best by starting hands-on. Last summer I assembled a bike from a kit; watching tutorials made the derailleur look simple, but the real lesson came when the chain skipped and I had to diagnose my own cable tension. That mistake taught me more in ten minutes than a week of videos. Watching first can save time for dangerous tasks, I'll grant that, but for ordinary skills the feedback from your own error is the teacher — and it sticks because you remember exactly what went wrong.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 2,
    interviewTopic: "Group Work",
    questionText:
      "A teammate in a group project quietly does less work than promised. What is the best first response, and why? Explain your choice with details.",
    expectedKeyPhrases: [
      "choose a first step such as a private direct conversation",
      "explain why not escalating immediately to the instructor",
      "mention documenting agreements or checkpoints",
      "acknowledge possible personal circumstances",
    ],
    sampleAnswer:
      "My first move would be a direct, private conversation — not the group chat, not the instructor's office. Asking 'how is the part you took on going, do you want to re-split anything?' gives the teammate a way to recommit or admit a problem like work overload at home. Going to the instructor first burns trust the rest of the term needs, and silent resentment poisons the whole project. If nothing changes, then we document our checkpoints and escalate with evidence, which is exactly how our last team handled it and the professor still gave us all credit for the attempt.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 3,
    interviewTopic: "Technology Habits",
    questionText:
      "Some universities ask students to lock phone use during lectures. Do you think that helps learning or creates new problems? Support your view with reasons.",
    expectedKeyPhrases: [
      "state a position on note-taking distraction versus access",
      "reference one real scenario such as emergencies or accessibility",
      "compare lecture capture or laptops as an alternative",
      "conclude with who should control attention",
    ],
    sampleAnswer:
      "A lock creates a new problem bigger than it solves: for students who need their phone as an accessibility tool or for a parent on call, removing the device removes access to learning itself. Attention is partly the professor's job — good lecturing with lecture capture reduces the temptation to scroll far more than a ban does. That said, I support a shared norm of silent, screens-down phones because one bright screen in a dark hall pulls many eyes, not just its owner's. So: default norms, universal capture, and exemptions by request rather than a device police at the door.",
  }),
  buildTakeInterviewItem({
    id: nextId(),
    blueprintId: PLUTO_BLUEPRINT_ID,
    questionNumber: 4,
    interviewTopic: "Campus Money",
    questionText:
      "Your university must spend a one-time surplus on either facility repairs or new student services. Which should it choose? Explain your reasoning with examples.",
    expectedKeyPhrases: [
      "pick one option and define the urgency",
      "mention deferred maintenance costs or service gaps concretely",
      "compare the longevity of each benefit",
      "offer a compromise or funding path for the loser",
    ],
    sampleAnswer:
      "I would choose repairs first, and the reason is arithmetic, not sentiment: deferred maintenance compounds. The elevator outages in our engineering building each semester cost more in emergency rentals than a scheduled overhaul would have, and the mold reports in the residence halls are health issues already. New services — say, extended counseling hours — genuinely matter, but they can be phased in from next year's operating budget or a partnership with the health system, whereas a leaking roof decided for you. Fix the building, then keep the surplus promise for services through next year's allocation so no one loses.",
  }),
];

/* ------------------------------- Blueprint ------------------------------- */

export const PLUTO_BLUEPRINT: SeedBlueprintRow = {
  id: PLUTO_BLUEPRINT_ID,
  title: "Pluto | Full Test",
  slug: "pluto-full-test-2026",
  description:
    "Original TOEFL iBT 2026-Style Practice Test #9 (Pluto). Reading: medieval cathedral engineering, seismology and Earth imaging, the chemistry of coffee roasting, daily-life notices, emails, and a group-chat text chain. Listening: library early returns, the housing guarantor workaround, archival printing for a gallery show, river clean-up logistics, parking and registration announcements, plus talks on bird magnetoreception, auction design, and the historical record of supernovae. Writing: 10 Build-a-Sentence items, a lab-section conflict email, and a micro-transit discussion. Speaking: 7 Listen-and-Repeat pairs (health clinic, job fair) and 4 interview questions on practical skills, group work, technology habits, and campus spending.",
  exam_Type: "full_mock",
  total_Duration_Seconds: 5160,
  blueprint_Json: {
    sections: [
      {
        section: "reading",
        order: 1,
        durationSeconds: 1620,
        moduleCount: 2,
        questionCount: 16,
        isAdaptive: true,
      },
      {
        section: "listening",
        order: 2,
        durationSeconds: 1560,
        moduleCount: 2,
        questionCount: 16,
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
    planetName: "Pluto",
    videoUrl: "",
    videoId: "",
    playlistUrl: "",
    difficultyLabel: "Standard 2026 Practice",
  },
  is_Published: true,
  created_At: "2026-10-05T10:00:00.000Z",
};
