/**
 * @fileoverview Application-wide constants for CivicMind AI.
 * All election data, quiz questions, wizard steps, and GA4 event names
 * are defined here to prevent magic strings/numbers throughout the codebase.
 */

// ── Google Analytics 4 Event Names ──────────────────────────────────────────
/** @type {Record<string, string>} Named constants for all GA4 events */
export const GA_EVENTS = {
  PAGE_VIEW: 'page_view',
  TIMELINE_STAGE_OPENED: 'timeline_stage_opened',
  WIZARD_STEP_CHANGE: 'wizard_step_change',
  WIZARD_COMPLETE: 'wizard_complete',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  QUIZ_START: 'quiz_start',
  QUIZ_ANSWER: 'quiz_answer',
  QUIZ_COMPLETE: 'quiz_complete',
};

// ── Tab IDs ──────────────────────────────────────────────────────────────────
/** @type {Record<string, string>} Application tab identifiers */
export const TABS = {
  TIMELINE: 'timeline',
  WIZARD: 'wizard',
  CHAT: 'chat',
  QUIZ: 'quiz',
};

// ── Chat Config ──────────────────────────────────────────────────────────────
/** Maximum character count for chat input */
export const CHAT_MAX_CHARS = 500;

/** Warning threshold — char counter turns red above this */
export const CHAT_WARN_CHARS = 450;

/** @type {string[]} Suggested question chips shown in empty chat */
export const CHAT_CHIPS = [
  'How do I register to vote?',
  'What is the voting process?',
  'When are elections held?',
  'What ID do I need to vote?',
];

// ── Election Timeline Stages ─────────────────────────────────────────────────
/**
 * @typedef {Object} ElectionStage
 * @property {number} id - Unique stage identifier
 * @property {string} icon - Emoji icon for the stage
 * @property {string} title - Stage name
 * @property {string} duration - Typical duration of this phase
 * @property {string} description - 2-3 sentence explanation
 * @property {string[]} keyFacts - Bullet point facts about this stage
 */

/** @type {ElectionStage[]} Seven stages of the election lifecycle */
export const ELECTION_STAGES = [
  {
    id: 1,
    icon: '📢',
    title: 'Election Announcement',
    duration: '1–3 Days',
    description:
      'The election commission officially announces the date of the election, marking the formal start of the electoral process. This announcement triggers a Model Code of Conduct that restricts the ruling government from making policy announcements that could influence voters.',
    keyFacts: [
      'Election Commission announces the schedule and dates',
      'Model Code of Conduct comes into effect immediately',
      'Government cannot announce new schemes or policies after this point',
      'Polling staff begins recruitment and training',
    ],
  },
  {
    id: 2,
    icon: '📋',
    title: 'Voter Registration',
    duration: '2–4 Weeks',
    description:
      'Citizens who meet eligibility requirements register on the electoral roll to gain the right to vote. This is a critical period where new voters can enroll, existing voters can update details, and the electoral roll is published and open for corrections.',
    keyFacts: [
      'Citizens aged 18+ can register as voters',
      'Valid ID proof required for enrollment',
      'Electoral roll is published for public verification',
      'Last-minute registrations must be submitted before the deadline',
    ],
  },
  {
    id: 3,
    icon: '🏛️',
    title: 'Candidate Nomination',
    duration: '1–2 Weeks',
    description:
      'Political parties and independent candidates file their nomination papers with the returning officer. Each nomination is scrutinized for validity, and candidates can withdraw their nominations before a specified deadline.',
    keyFacts: [
      'Candidates submit nomination papers with required deposits',
      'Nominations are scrutinized for legal eligibility',
      'Withdrawal deadline gives candidates time to reconsider',
      'Final candidate list is published after the withdrawal period',
    ],
  },
  {
    id: 4,
    icon: '📣',
    title: 'Election Campaign',
    duration: '3–6 Weeks',
    description:
      'Candidates and parties campaign to win voter support through rallies, speeches, door-to-door canvassing, and media. The campaign period ends 48 hours before voting begins — this is called the "campaign silence" period.',
    keyFacts: [
      'Campaign spending is capped by election regulations',
      'Media must provide equal coverage to all major candidates',
      'Campaign silence begins 48 hours before polling day',
      'Political advertising is regulated to prevent misinformation',
    ],
  },
  {
    id: 5,
    icon: '🗳️',
    title: 'Voting Day',
    duration: '1–3 Days',
    description:
      'Registered voters visit their designated polling stations to cast their ballots. Polling stations are set up in schools, community halls, and public buildings. Strict security measures ensure the integrity of the vote.',
    keyFacts: [
      'Polls typically open 7 AM and close 6 PM',
      'Voters must bring valid photo identification',
      'Electronic Voting Machines (EVMs) are used in many countries',
      'Polling agents from each party can observe the process',
    ],
  },
  {
    id: 6,
    icon: '🔢',
    title: 'Vote Counting',
    duration: '1–2 Days',
    description:
      'After polling ends, sealed ballot boxes or EVMs are transported to counting centers under tight security. Counting is conducted in the presence of candidates, agents, and election observers to ensure transparency.',
    keyFacts: [
      'Counting begins after all polling stations have closed',
      'Representatives of each candidate observe the count',
      'Postal ballots and special votes are counted separately',
      'Running totals are announced as counting progresses',
    ],
  },
  {
    id: 7,
    icon: '🏆',
    title: 'Results & Certification',
    duration: '1–7 Days',
    description:
      'The election commission officially certifies the results and declares the winning candidates. Losing candidates can file election petitions in court within a specified period if they believe irregularities occurred.',
    keyFacts: [
      'Returning officers declare winners constituency by constituency',
      'Results are published in the official gazette',
      'Losing candidates can challenge results within 45 days',
      'Newly elected members take oath of office before assuming duties',
    ],
  },
];

// ── Voting Wizard Steps ──────────────────────────────────────────────────────
/**
 * @typedef {Object} WizardStep
 * @property {number} id - Step number (1-indexed)
 * @property {string} icon - Emoji icon
 * @property {string} title - Step title
 * @property {string[]} bullets - Key points for this step
 */

/** @type {WizardStep[]} Five steps of the voting guide wizard */
export const WIZARD_STEPS = [
  {
    id: 1,
    icon: '✅',
    title: 'Am I Eligible to Vote?',
    bullets: [
      'You must be at least 18 years old on the qualifying date',
      'You must be a citizen of the country',
      'You must not have been disqualified under any electoral law',
      'You must be registered on the electoral roll for your constituency',
      'You must be of sound mind and not serving a criminal sentence that disqualifies you',
    ],
  },
  {
    id: 2,
    icon: '📝',
    title: 'How to Register as a Voter',
    bullets: [
      'Visit the official Election Commission website or your local electoral office',
      'Fill in the voter registration form (Form 6 for new voters)',
      'Submit proof of age (birth certificate or school certificate)',
      'Submit proof of residence (utility bill, rent agreement, or Aadhaar)',
      'Provide a passport-size photograph',
      'You will receive your Voter ID card within a few weeks of registration',
    ],
  },
  {
    id: 3,
    icon: '📍',
    title: 'Finding Your Polling Station',
    bullets: [
      'Your assigned polling station is printed on your Voter ID card',
      'Use the Election Commission website to look up your polling station by entering your voter ID number',
      'Polling stations are typically located in schools, community centers, or government buildings',
      'Each constituency is divided into booths — you must vote at your assigned booth',
      'The election commission publishes a full list of polling stations before the election',
    ],
  },
  {
    id: 4,
    icon: '🎒',
    title: 'What to Bring on Voting Day',
    bullets: [
      'Your Voter Photo ID Card (EPIC) — the most important document',
      'If you lost your EPIC: Aadhaar card, driving license, or passport also accepted',
      'Know your voter serial number (printed on the EPIC) for faster processing',
      'Do NOT bring electronic devices like phones into the voting compartment',
      'Arrive at the polling station during its open hours (check your local schedule)',
    ],
  },
  {
    id: 5,
    icon: '🗳️',
    title: 'How to Cast Your Vote',
    bullets: [
      'Join the queue at your designated polling booth',
      'Show your ID to the polling officer and get your name verified on the roll',
      'Your finger will be marked with indelible ink to prevent double voting',
      'Receive your ballot or be guided to the Electronic Voting Machine (EVM)',
      'Press the button next to your chosen candidate on the EVM',
      'The Voter Verified Paper Audit Trail (VVPAT) will briefly display your choice',
      'Your vote is now cast — you are done! Wear your ink mark with pride.',
    ],
  },
];

// ── Quiz Questions ───────────────────────────────────────────────────────────
/**
 * @typedef {Object} QuizQuestion
 * @property {number} id - Unique question identifier
 * @property {string} question - The question text
 * @property {string[]} options - Four answer choices (A, B, C, D)
 * @property {number} correctIndex - Zero-based index of the correct answer
 * @property {string} explanation - Explanation shown after answering
 */

/** @type {QuizQuestion[]} Ten multiple-choice questions about the election process */
export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'What is the minimum age to be eligible to vote in most democracies?',
    options: ['16 years', '18 years', '21 years', '25 years'],
    correctIndex: 1,
    explanation:
      'In most democratic countries, the voting age is 18 years. Some countries like Austria and Scotland have lowered it to 16 for certain elections.',
  },
  {
    id: 2,
    question: 'What is a ballot?',
    options: [
      'A list of registered voters',
      'The document used to cast a vote',
      'A polling station location',
      'An election announcement',
    ],
    correctIndex: 1,
    explanation:
      'A ballot is the document (paper or electronic) used by a voter to record their choice of candidate or position on an issue.',
  },
  {
    id: 3,
    question: 'What is the purpose of the "campaign silence" period?',
    options: [
      'To allow candidates to rest before voting day',
      'To prevent last-minute voter influence before polls open',
      'To give the media time to prepare results coverage',
      'To count postal ballots in advance',
    ],
    correctIndex: 1,
    explanation:
      'The campaign silence period (typically 48 hours before polls open) prevents candidates from making last-minute promises or statements that voters cannot fact-check before voting.',
  },
  {
    id: 4,
    question: 'What is voter registration?',
    options: [
      'Paying a fee to be allowed to vote',
      'The process of officially enrolling your name on the electoral roll',
      'Registering your preferred candidate with the election commission',
      'Signing a pledge to vote on election day',
    ],
    correctIndex: 1,
    explanation:
      'Voter registration is the process of enrolling your name on the electoral roll, confirming your eligibility and the constituency you belong to.',
  },
  {
    id: 5,
    question: 'Who is responsible for counting votes in an election?',
    options: [
      'The winning political party',
      'The police department',
      'Election Commission officials and returning officers',
      'International observers only',
    ],
    correctIndex: 2,
    explanation:
      'Votes are counted by election commission officials and returning officers, observed by representatives from each candidate and party to ensure transparency.',
  },
  {
    id: 6,
    question: 'What is a polling station?',
    options: [
      'A TV studio where results are announced',
      'The place where voters go to cast their ballots',
      'A building where candidates register their nominations',
      'The headquarters of the election commission',
    ],
    correctIndex: 1,
    explanation:
      'A polling station (or polling booth) is the location where registered voters go to cast their votes on election day.',
  },
  {
    id: 7,
    question: 'What does indelible ink on your finger signify after voting?',
    options: [
      'That you are a registered party member',
      'That you have paid the polling fee',
      'That you have already voted and cannot vote again',
      'That you are a poll worker',
    ],
    correctIndex: 2,
    explanation:
      'Indelible ink is applied to a voter\'s finger after they vote to prevent double voting. It cannot be washed off easily and stays visible for several days.',
  },
  {
    id: 8,
    question: 'What happens after all votes are counted in an election?',
    options: [
      'The election is immediately held again to confirm results',
      'Results are certified by the election commission and winners are declared',
      'International observers take over to validate the count',
      'The president automatically picks the winner',
    ],
    correctIndex: 1,
    explanation:
      'After counting, the election commission certifies the results, returning officers declare winners, and the results are officially published.',
  },
  {
    id: 9,
    question: 'What is an electoral roll?',
    options: [
      'A list of candidates who have filed nominations',
      'The official list of all registered eligible voters',
      'A schedule of election campaign events',
      'A log of donations made to political parties',
    ],
    correctIndex: 1,
    explanation:
      'An electoral roll (or voters list) is the official register of all citizens who are eligible to vote in a particular election or constituency.',
  },
  {
    id: 10,
    question: 'What is a by-election?',
    options: [
      'An election held alongside the main general election',
      'An election held to fill a single vacant seat mid-term',
      'An election where only one candidate runs unopposed',
      'An election decided by members of parliament only',
    ],
    correctIndex: 1,
    explanation:
      'A by-election (or special election) is held to fill a seat that has become vacant mid-term due to death, resignation, or disqualification of the sitting member.',
  },
];

// ── Sidebar Nav Items ────────────────────────────────────────────────────────
/**
 * @typedef {Object} NavItem
 * @property {string} id - Tab ID matching TABS constant
 * @property {string} icon - Emoji icon
 * @property {string} label - Short label shown below icon
 * @property {string} ariaLabel - Full accessible label
 */

/** @type {NavItem[]} Navigation items for the sidebar */
export const NAV_ITEMS = [
  {
    id: TABS.TIMELINE,
    icon: '🗓',
    label: 'Timeline',
    ariaLabel: 'Election Timeline',
  },
  {
    id: TABS.WIZARD,
    icon: '🗳',
    label: 'Guide',
    ariaLabel: 'Voting Guide',
  },
  {
    id: TABS.CHAT,
    icon: '🤖',
    label: 'AI Chat',
    ariaLabel: 'AI Assistant',
  },
  {
    id: TABS.QUIZ,
    icon: '🧠',
    label: 'Quiz',
    ariaLabel: 'Knowledge Quiz',
  },
];

// ── Tab Metadata ─────────────────────────────────────────────────────────────
/**
 * @typedef {Object} TabMeta
 * @property {string} title - Page title shown in topbar
 * @property {string} subtitle - Subtitle shown in topbar
 */

/** @type {Record<string, TabMeta>} Topbar metadata per tab */
export const TAB_META = {
  [TABS.TIMELINE]: {
    title: 'Election Timeline',
    subtitle: 'The complete election lifecycle, step by step',
  },
  [TABS.WIZARD]: {
    title: 'Voting Guide',
    subtitle: 'A step-by-step guide to exercising your right to vote',
  },
  [TABS.CHAT]: {
    title: 'AI Assistant',
    subtitle: 'Ask CivicMind anything about elections',
  },
  [TABS.QUIZ]: {
    title: 'Knowledge Quiz',
    subtitle: 'Test your election knowledge',
  },
};
