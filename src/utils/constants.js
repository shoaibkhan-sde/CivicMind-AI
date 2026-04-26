/**
 * @fileoverview Application-wide constants for CivicMind AI "Adventure".
 * Includes stage details, adaptive quiz bank, simulation scenarios, and XP thresholds.
 */

// ── Tab IDs ──────────────────────────────────────────────────────────────────
export const TABS = {
  JOURNEY: 'journey',
  SIMULATE: 'simulate',
  MENTOR: 'mentor',
  QUIZ: 'quiz',
  SETTINGS: 'settings',
};

// ── GA4 Event Names ──────────────────────────────────────────────────────────
export const GA_EVENTS = {
  JOURNEY_STAGE_ENTER: 'journey_stage_enter',
  JOURNEY_STAGE_COMPLETE: 'journey_stage_complete',
  SIMULATION_START: 'simulation_start',
  SIMULATION_DECISION: 'simulation_decision',
  SIMULATION_COMPLETE: 'simulation_complete',
  QUIZ_START: 'quiz_start',
  QUIZ_ANSWER: 'quiz_answer',
  QUIZ_COMPLETE: 'quiz_complete',
  SAGE_MESSAGE_SENT: 'sage_message_sent',
  CONFUSION_DETECTED: 'confusion_detected',
  LEVEL_UP: 'level_up',
  STREAK_MAINTAINED: 'streak_maintained',
  GUEST_TO_ACCOUNT: 'guest_to_account',
};

// ── XP & Progression ─────────────────────────────────────────────────────────
export const XP_EVENTS = {
  STAGE_CARD_OPEN: 10,
  STAGE_TAB_VIEW: 5,
  MINI_CHALLENGE_CORRECT: 50,
  QUIZ_EASY_CORRECT: 30,
  QUIZ_MEDIUM_CORRECT: 50,
  QUIZ_HARD_CORRECT: 80,
  SIM_DECISION: 20,
  SIM_COMPLETE: 200,
  STAGE_COMPLETE: 100,
  STREAK_BONUS: 25,
  AI_MENTOR_ASK: 5,
};

export const XP_LEVELS = [
  { min: 0, title: 'New Voter', level: 1 },
  { min: 100, title: 'Aware Citizen', level: 2 },
  { min: 200, title: 'Active Voter', level: 3 },
  { min: 300, title: 'Civic Thinker', level: 4 },
];

// ── Journey Stages ───────────────────────────────────────────────────────────
export const JOURNEY_STAGES = [
  {
    id: 'announcement',
    title: 'Announcement',
    icon: '📢',
    order: 1,
  },
  {
    id: 'registration',
    title: 'Registration',
    icon: '📋',
    order: 2,
  },
  {
    id: 'nomination',
    title: 'Nomination',
    icon: '🏛️',
    order: 3,
  },
  {
    id: 'campaign',
    title: 'Campaign',
    icon: '📣',
    order: 4,
  },
  {
    id: 'voting',
    title: 'Voting Day',
    icon: '🗳️',
    order: 5,
  },
  {
    id: 'counting',
    title: 'Counting',
    icon: '🔢',
    order: 6,
  },
  {
    id: 'results',
    title: 'Results',
    icon: '🏆',
    order: 7,
  },
];

// ── Immersive Stage Details (TAB A, B, C) ────────────────────────────────────
export const STAGE_DETAILS = {
  announcement: {
    story: [
      { id: 'press', icon: '🎤', label: 'Press Note', detail: 'The ECI calls a press conference to announce the schedule.' },
      { id: 'mcc', icon: '📜', label: 'MCC Active', detail: 'The Model Code of Conduct starts immediately after announcement.' },
      { id: 'observers', icon: '🕵️', label: 'Observers', detail: 'General and Expenditure observers are deployed to the field.' },
      { id: 'teams', icon: '🚓', label: 'Flying Squads', detail: 'Special teams start monitoring for illegal cash or gifts.' },
    ],
    challenges: [
      {
        question: "When does the Model Code of Conduct (MCC) come into effect?",
        options: [
          { id: 'A', text: 'On Voting Day', correct: false, feedback: 'Too late!' },
          { id: 'B', text: 'Immediately after announcement', correct: true, feedback: 'Correct! The MCC is active from the moment the ECI speaks to ensure a level playing field for all parties from Day 1.' },
          { id: 'C', text: 'When candidates file papers', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Who appoints the Election Observers?",
        options: [
          { id: 'A', text: 'State Government', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Election Commission', correct: true, feedback: 'Correct! The ECI appoints senior civil servants as observers to ensure neutral oversight, independent of the state government.' },
          { id: 'C', text: 'Police Chief', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "What is the primary role of a 'Flying Squad' (FST)?",
        options: [
          { id: 'A', text: 'Distribute Voter Slips', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Stop illegal cash/liquor', correct: true, feedback: 'Correct! Flying Squads are high-speed response teams meant to intercept illegal inducements like cash, liquor, or gifts meant to bribe voters.' },
          { id: 'C', text: 'Conduct Exit Polls', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Which portal provides single-window rally permissions?",
        options: [
          { id: 'A', text: 'Suvidha Portal', correct: true, feedback: 'Correct! The Suvidha portal digitizes candidate requests for rallies and vehicle use, ensuring permissions are granted on a "first-come, first-served" basis.' },
          { id: 'B', text: 'Facebook Ads', correct: false, feedback: 'No.' },
          { id: 'C', text: 'WhatsApp', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "What is the expenditure limit for a major Lok Sabha seat?",
        options: [
          { id: 'A', text: '₹10 Lakhs', correct: false, feedback: 'Too low.' },
          { id: 'B', text: '₹95 Lakhs', correct: true, feedback: 'Correct! The limit for Lok Sabha candidates in larger states is ₹95 Lakhs, ensuring that candidates with less money can still compete fairly.' },
          { id: 'C', text: 'Unlimited', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "What does the 'cVIGIL' app allow citizens to do?",
        options: [
          { id: 'A', text: 'Register as a Voter', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Report MCC violations', correct: true, feedback: 'Correct! cVIGIL empowers citizens to report MCC violations (like hate speech or bribes) with photos/videos, which are auto-geotagged for investigation.' },
          { id: 'C', text: 'Chat with the PM', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "How much time does the FST have to reach a cVIGIL report spot?",
        options: [
          { id: 'A', text: '100 Minutes', correct: true, feedback: 'Correct! The ECI guarantees a response time of 100 minutes for cVIGIL reports, ensuring rapid action against election malpractices.' },
          { id: 'B', text: '24 Hours', correct: false, feedback: 'Too slow.' },
          { id: 'C', text: '7 Days', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Can the government announce new big projects during MCC?",
        options: [
          { id: 'A', text: 'Yes, anytime', correct: false, feedback: 'No.' },
          { id: 'B', text: 'No, it is paused', correct: true, feedback: 'Correct! To prevent the ruling party from using taxpayer money to influence voters with new welfare schemes or projects after the dates are set.' },
          { id: 'C', text: 'Only on weekends', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Who is the District Election Officer (DEO)?",
        options: [
          { id: 'A', text: 'District Magistrate (DM)', correct: true, feedback: 'Correct! The District Magistrate (or Collector) takes over as the DEO during elections, managing all polling logistics in the district.' },
          { id: 'B', text: 'Local Police Officer', correct: false, feedback: 'No.' },
          { id: 'C', text: 'Postman', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Must election posters show the printer's details?",
        options: [
          { id: 'A', text: 'No, optional', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Yes, mandatory', correct: true, feedback: 'Correct! Section 127A of the RP Act requires printer details on all pamphlets to track illegal expenditure and hold people accountable for hate speech.' },
          { id: 'C', text: 'Only if in color', correct: false, feedback: 'No.' },
        ]
      }
    ],
    facts: [
      '📜 Code of Conduct starts Day 1',
      '🗳️ Over 900 Million voters',
      '🇮🇳 World\'s largest democracy',
    ],
    mistakes: [
      { title: 'New Announcements', consequence: 'MCC Violation', fix: 'Wait until after election results.' },
      { title: 'Using Gov. Vehicles', consequence: 'Candidate Ban', fix: 'Use private or party vehicles only.' },
      { title: 'Hate Speech', consequence: 'Legal FIR', fix: 'Focus on policy, not religion or caste.' },
    ],
  },
  registration: {
    story: [
      { id: 'form6', icon: '📝', label: 'Form 6', detail: 'Apply to be a voter using Form 6 online or at a local office.' },
      { id: 'verify', icon: '🏠', label: 'Verification', detail: 'A Booth Level Officer (BLO) may visit to check your address.' },
      { id: 'roll', icon: '📖', label: 'The Roll', detail: 'Your name is added to the official Electoral Roll (Voter List).' },
      { id: 'epic', icon: '🆔', label: 'Voter ID', detail: 'You receive your EPIC card, though your name on the list is most important.' },
    ],
    challenges: [
      {
        question: "Which form is for New Voter Registration?",
        options: [
          { id: 'A', text: 'Form 7', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Form 6', correct: true, feedback: 'Correct! Form 6 is the primary application form for any Indian citizen residing in a constituency to join the electoral roll.' },
          { id: 'C', text: 'Form 8', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "What is the minimum age to register to vote?",
        options: [
          { id: 'A', text: '21 Years', correct: false, feedback: 'No.' },
          { id: 'B', text: '18 Years', correct: true, feedback: 'Correct! Article 326 of the Constitution gives every citizen aged 18 or above the right to vote (Universal Adult Suffrage).' },
          { id: 'C', text: '16 Years', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Which proof is required for registration?",
        options: [
          { id: 'A', text: 'School ID', correct: false, feedback: 'Not always valid.' },
          { id: 'B', text: 'Residence Proof', correct: true, feedback: 'Correct! You must prove you "ordinarily reside" in that constituency to be registered there.' },
          { id: 'C', text: 'Gym Card', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "What is the official website for Voter Services?",
        options: [
          { id: 'A', text: 'facebook.com', correct: false, feedback: 'No.' },
          { id: 'B', text: 'nvsp.in', correct: true, feedback: 'Correct! The National Voters\' Service Portal (NVSP) is the official ECI platform for all voter registration and card download services.' },
          { id: 'C', text: 'voter-id.gov', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Who is your local contact for voter list help?",
        options: [
          { id: 'A', text: 'Booth Level Officer (BLO)', correct: true, feedback: 'Correct! The BLO is a local government employee appointed by the ECI to help citizens with field verification and list updates.' },
          { id: 'B', text: 'The Mayor', correct: false, feedback: 'No.' },
          { id: 'C', text: 'Police Constable', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Can an NRI register as an 'Overseas Voter'?",
        options: [
          { id: 'A', text: 'No', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Yes, with Form 6A', correct: true, feedback: 'Correct! NRIs can register using Form 6A and vote in person at their Indian constituency on polling day.' },
          { id: 'C', text: 'Only if they pay tax', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Which form is used to Correct your name in the list?",
        options: [
          { id: 'A', text: 'Form 6', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Form 8', correct: true, feedback: 'Correct! Form 8 is the multi-purpose form for correction of details, shifting within a constituency, or replacement of ID cards.' },
          { id: 'C', text: 'Form 7', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "What does 'EPIC' stand for?",
        options: [
          { id: 'A', text: 'Elector Photo ID Card', correct: true, feedback: 'Correct! EPIC is the official name for your Voter ID card, used for identification at the polling station.' },
          { id: 'B', text: 'Election Power Card', correct: false, feedback: 'No.' },
          { id: 'C', text: 'Voter Passport', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Can you vote if you have an ID card but your name is NOT on the roll?",
        options: [
          { id: 'A', text: 'Yes', correct: false, feedback: 'No.' },
          { id: 'B', text: 'No, name on list is must', correct: true, feedback: 'Correct! The Electoral Roll is the final authority. Even with an ID, you cannot vote if your name was deleted from the list.' },
          { id: 'C', text: 'Only if the RO knows you', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "How many times a year can you qualify for registration?",
        options: [
          { id: 'A', text: 'Once', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Four times', correct: true, feedback: 'Correct! There are now four qualifying dates (Jan 1, Apr 1, Jul 1, Oct 1) for young citizens to register as soon as they turn 18.' },
          { id: 'C', text: 'Daily', correct: false, feedback: 'No.' },
        ]
      }
    ],
    facts: [
      '🔞 Age must be 18+',
      '🏠 Must be a resident',
      '💻 Apply on NVSP portal',
    ],
    mistakes: [
      { title: 'Duplicate Enrollment', consequence: 'Jail / Fine', fix: 'Only register in one constituency.' },
      { title: 'Wrong Age Proof', consequence: 'Rejection', fix: 'Use Birth Certificate or Class 10 Marksheet.' },
      { title: 'Missing the Roll', consequence: 'Cannot Vote', fix: 'Check name on NVSP 1 month before polling.' },
    ],
  },
  nomination: {
    story: [
      { id: 'fill', icon: '📝', label: 'Affidavit', detail: 'Candidate declares their assets, education, and criminal records (if any).' },
      { id: 'deposit', icon: '💰', label: 'Security Deposit', detail: 'Candidate pays a small fee (₹25,000 for General) to show they are serious.' },
      { id: 'scrutiny', icon: '🧐', label: 'Scrutiny', detail: 'Officers double-check every detail of the papers for errors.' },
      { id: 'final', icon: '📜', label: 'Final List', detail: 'The names of valid candidates are officially published.' },
    ],
    challenges: [
      {
        question: "What is the security deposit for Lok Sabha?",
        options: [
          { id: 'A', text: '₹5,000', correct: false, feedback: 'No.' },
          { id: 'B', text: '₹25,000', correct: true, feedback: 'Correct! A general candidate pays ₹25,000 to ensure only serious candidates contest. SC/ST candidates pay half.' },
          { id: 'C', text: '₹1 Lakh', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Which form is the mandatory Affidavit?",
        options: [
          { id: 'A', text: 'Form 10', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Form 26', correct: true, feedback: 'Correct! Form 26 is the most critical document where a candidate legally declares assets, educational history, and criminal record.' },
          { id: 'C', text: 'Form 6', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "How many proposers are needed for an independent candidate?",
        options: [
          { id: 'A', text: '1 person', correct: false, feedback: 'No.' },
          { id: 'B', text: '10 persons', correct: true, feedback: 'Correct! An independent candidate needs 10 local electors as proposers to show they have baseline community support.' },
          { id: 'C', text: '50 persons', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "What happens if a candidate gets less than 1/6th of total votes?",
        options: [
          { id: 'A', text: 'They go to jail', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Lose their deposit', correct: true, feedback: 'Correct! If a candidate fails to secure 1/6th of the valid votes cast, their security deposit is forfeited to the government.' },
          { id: 'C', text: 'Lose their ID', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Who is the final authority for scrutiny of papers?",
        options: [
          { id: 'A', text: 'Returning Officer (RO)', correct: true, feedback: 'Correct! The RO conducts the scrutiny process and has the legal power to accept or reject nomination papers based on valid grounds.' },
          { id: 'B', text: 'Chief Minister', correct: false, feedback: 'No.' },
          { id: 'C', text: 'Police Chief', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Maximum number of seats a candidate can contest?",
        options: [
          { id: 'B', text: '2 Seats', correct: true, feedback: 'Correct! Under Section 33 of the Representation of People Act, a candidate can contest from a maximum of two constituencies in a single election.' },
          { id: 'A', text: 'Unlimited', correct: false, feedback: 'No.' },
          { id: 'C', text: '1 Seat', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Minimum age to contest for Lok Sabha?",
        options: [
          { id: 'A', text: '18 Years', correct: false, feedback: 'No.' },
          { id: 'B', text: '25 Years', correct: true, feedback: 'Correct! While you can vote at 18, the Constitution requires you to be at least 25 to represent people in the Lok Sabha.' },
          { id: 'C', text: '35 Years', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Must spouse assets be declared in Form 26?",
        options: [
          { id: 'A', text: 'No', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Yes, mandatory', correct: true, feedback: 'Correct! The candidate must declare the assets of their spouse and dependents to ensure full financial transparency for voters.' },
          { id: 'C', text: 'Only if they are rich', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "How much time is given to withdraw nomination?",
        options: [
          { id: 'A', text: '1 Hour', correct: false, feedback: 'No.' },
          { id: 'B', text: '2 Days', correct: true, feedback: 'Correct! A 2-day window is provided after the scrutiny of papers for any candidate who wishes to withdraw their name from the race.' },
          { id: 'C', text: '7 Days', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Penalty for hiding a criminal case in affidavit?",
        options: [
          { id: 'A', text: 'Small fine', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Disqualification', correct: true, feedback: 'Correct! Suppressing material facts in Form 26 is a corrupt practice and can lead to disqualification and even imprisonment.' },
          { id: 'C', text: 'Warning', correct: false, feedback: 'No.' },
        ]
      }
    ],
    facts: [
      '👤 Age: 25+ years',
      '🖋️ Need 10 supporters',
      '📄 Affidavit is Public',
    ],
    mistakes: [
      { title: 'Incomplete Form 26', consequence: 'Rejection', fix: 'Fill every column, use "Nil" if no data.' },
      { title: 'Wrong Proposers', consequence: 'Invalid Papers', fix: 'Ensure proposers are from your constituency.' },
      { title: 'Late Submission', consequence: 'Disqualification', fix: 'Submit before 3 PM on the last day.' },
    ],
  },
  campaign: {
    story: [
      { id: 'manifesto', icon: '📖', label: 'Manifesto', detail: 'The party explains what they will do if they win the election.' },
      { id: 'rallies', icon: '🎤', label: 'Public Rallies', detail: 'Speakers meet voters, but must follow noise and time rules.' },
      { id: 'ads', icon: '📺', label: 'Media Ads', detail: 'Advertisements on TV and Social Media must be pre-approved.' },
      { id: 'silence', icon: '🤫', label: 'Silence Period', detail: 'All campaigning must stop 48 hours before the voting ends.' },
    ],
    challenges: [
      {
        question: "What is the 'Silence Period' duration?",
        options: [
          { id: 'A', text: '24 Hours', correct: false, feedback: 'No.' },
          { id: 'B', text: '48 Hours', correct: true, feedback: 'Correct! The 48-hour "Silence Period" before voting ends is designed to give voters a quiet time to reflect without being bombarded by rallies.' },
          { id: 'C', text: '7 Days', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Can religious places be used for campaigning?",
        options: [
          { id: 'A', text: 'Yes', correct: false, feedback: 'No.' },
          { id: 'B', text: 'No, strictly banned', correct: true, feedback: 'Correct! Using temples, mosques, or churches for election propaganda is a major MCC violation and can lead to candidate bans.' },
          { id: 'C', text: 'Only for prayers', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Who assigns symbols to independent candidates?",
        options: [
          { id: 'A', text: 'The Candidate', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Election Commission', correct: true, feedback: 'Correct! The ECI manages a list of "Free Symbols" and assigns them to non-party candidates to ensure no two people share the same logo.' },
          { id: 'C', text: 'Police', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Time limit for loudspeakers?",
        options: [
          { id: 'A', text: 'All Night', correct: false, feedback: 'No.' },
          { id: 'B', text: '6 AM to 10 PM', correct: true, feedback: 'Correct! To protect public health and students during exams, the use of loudspeakers is strictly prohibited during night hours (10 PM - 6 AM).' },
          { id: 'C', text: 'Only Sundays', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Do social media ads need pre-approval?",
        options: [
          { id: 'A', text: 'No', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Yes, from MCMC', correct: true, feedback: 'Correct! The Media Certification and Monitoring Committee (MCMC) must pre-approve all digital and TV ads to ensure they meet MCC standards.' },
          { id: 'C', text: 'Only on TV', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "What is 'Paid News'?",
        options: [
          { id: 'A', text: 'Free news', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Ads disguised as news', correct: true, feedback: 'Correct! Paid news is the practice of paying media houses to publish promotional content as if it were neutral reporting, which is a serious violation.' },
          { id: 'C', text: 'TV subscription', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Can candidates give gifts to voters?",
        options: [
          { id: 'A', text: 'Yes', correct: false, feedback: 'No.' },
          { id: 'B', text: 'No, it is bribery', correct: true, feedback: 'Correct! Offering cash, liquor, or any gift to a voter is a criminal offense under the IPC and leads to immediate arrest and disqualification.' },
          { id: 'C', text: 'Only small items', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Who monitors rally expenses on the ground?",
        options: [
          { id: 'A', text: 'Expenditure Observers', correct: true, feedback: 'Correct! They use Video Surveillance Teams to record rallies and count every chair, stage, and speaker to ensure candidates don\'t cross the 95L limit.' },
          { id: 'B', text: 'Bankers', correct: false, feedback: 'No.' },
          { id: 'C', text: 'Auditors', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Is providing transport to voters illegal?",
        options: [
          { id: 'A', text: 'No', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Yes, it is a crime', correct: true, feedback: 'Correct! Hiring vehicles to ferry voters to the booth is "Undue Influence" and is strictly prohibited by the ECI.' },
          { id: 'C', text: 'Only for buses', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Number of Star Campaigners for a major party?",
        options: [
          { id: 'A', text: '10', correct: false, feedback: 'No.' },
          { id: 'B', text: '40', correct: true, feedback: 'Correct! Recognized national/state parties can have 40 Star Campaigners whose travel costs are NOT added to the individual candidate\'s limit.' },
          { id: 'C', text: '100', correct: false, feedback: 'No.' },
        ]
      }
    ],
    facts: [
      '🤫 48h Silence Period',
      '💰 Spending limits apply',
      '🚫 No religious appeals',
    ],
    mistakes: [
      { title: 'Night Rallies', consequence: 'Noise Violation', fix: 'Stop all speakers after 10 PM.' },
      { title: 'Fake News', consequence: 'MCMC Notice', fix: 'Always verify claims before posting.' },
      { title: 'Religious Appeals', consequence: 'Candidate Ban', fix: 'Keep politics secular and inclusive.' },
    ],
  },
  voting: {
    story: [
      { id: 'mock', icon: '🗳️', label: 'Mock Poll', detail: 'Agents verify the EVM at 6 AM by casting 50 test votes.' },
      { id: 'ink', icon: '☝️', label: 'Indelible Ink', detail: 'The mark on your left index finger proves you have voted.' },
      { id: 'vvpat', icon: '📄', label: 'VVPAT', detail: 'The machine shows a slip for 7 seconds to confirm your choice.' },
      { id: 'seal', icon: '🔒', label: 'Sealing', detail: 'After 6 PM, the EVMs are sealed in front of all party agents.' },
    ],
    challenges: [
      {
        question: "Mock Poll vote count requirement?",
        options: [
          { id: 'A', text: '1 vote', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Minimum 50 votes', correct: true, feedback: 'Correct! A mock poll with at least 50 votes must be conducted before all party agents to prove the EVM is working perfectly.' },
          { id: 'C', text: '1000 votes', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "How long is VVPAT slip visible?",
        options: [
          { id: 'A', text: '1 Second', correct: false, feedback: 'No.' },
          { id: 'B', text: '7 Seconds', correct: true, feedback: 'Correct! The slip is displayed behind a glass for 7 seconds so the voter can verify that the machine printed exactly what they pressed.' },
          { id: 'C', text: '30 Seconds', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Where is the ink mark applied?",
        options: [
          { id: 'A', text: 'Thumb', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Left Index Finger', correct: true, feedback: 'Correct! The Indelible Ink is applied on the left index finger as a global symbol of an informed and active citizen.' },
          { id: 'C', text: 'Wrist', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Can you carry a mobile inside the booth?",
        options: [
          { id: 'A', text: 'Yes', correct: false, feedback: 'No.' },
          { id: 'B', text: 'No, strictly banned', correct: true, feedback: 'Correct! To protect the "Secrecy of Ballot," carrying cameras or phones inside the voting compartment is a criminal offense.' },
          { id: 'C', text: 'Only if switched off', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "What is a 'Tendered Vote'?",
        options: [
          { id: 'A', text: 'Vote by child', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Vote if name misused', correct: true, feedback: 'Correct! If someone else has already voted in your name, you can cast a "Tendered Vote" using a paper ballot after verification.' },
          { id: 'C', text: 'Double vote', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Role of First Polling Officer?",
        options: [
          { id: 'A', text: 'Cleaning', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Identify Voter', correct: true, feedback: 'Correct! The First Polling Officer is responsible for calling out your name and cross-checking your ID with the official roll.' },
          { id: 'C', text: 'Guard', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "What is NOTA?",
        options: [
          { id: 'A', text: 'None of the Above', correct: true, feedback: 'Correct! NOTA allows voters to officially reject all candidates. While it doesn\'t disqualify the winner, it sends a strong political signal.' },
          { id: 'B', text: 'New Official Vote', correct: false, feedback: 'No.' },
          { id: 'C', text: 'No Option', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Status of queue at 6 PM?",
        options: [
          { id: 'A', text: 'Sent back', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Everyone in line votes', correct: true, feedback: 'Correct! Even if it is 6 PM, every citizen who is already in the queue must be allowed to cast their vote. Tokens are usually distributed.' },
          { id: 'C', text: 'Only VIPs vote', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Can a blind voter have a companion?",
        options: [
          { id: 'A', text: 'No', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Yes, 18+ helper', correct: true, feedback: 'Correct! A visually challenged voter can bring one companion (18+) to help them press the button, ensuring their right to vote.' },
          { id: 'C', text: 'Only a guard', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Max votes an EVM can store?",
        options: [
          { id: 'A', text: '100', correct: false, feedback: 'No.' },
          { id: 'B', text: '2000 Votes', correct: true, feedback: 'Correct! Modern M3 EVMs are designed to store up to 2000 votes, though booths are usually limited to 1500 for better management.' },
          { id: 'C', text: '1 Million', correct: false, feedback: 'No.' },
        ]
      }
    ],
    facts: [
      '🗳️ Mock Poll is key',
      '📄 VVPAT confirms',
      '🤫 Secret Ballots',
    ],
    mistakes: [
      { title: 'Selfies with EVM', consequence: 'Arrest / FIR', fix: 'Leave phone outside the booth.' },
      { title: 'Disclosing Vote', consequence: 'Vote Canceled', fix: 'Keep your choice 100% secret.' },
      { title: 'Influencing Queue', consequence: 'Police Action', fix: 'Maintain silence near the booth.' },
    ],
  },
  counting: {
    story: [
      { id: 'strongroom', icon: '🔒', label: 'Strong Room', detail: 'EVMs are kept under 3-layer security until counting day.' },
      { id: 'agents', icon: '👮', label: 'Party Agents', detail: 'Agents sit at every table to watch the result of every machine.' },
      { id: 'rounds', icon: '🔢', label: 'Round Wise', detail: 'Counting happens in rounds, usually 14 tables at a time.' },
      { id: 'vvpat_match', icon: '⚖️', label: 'VVPAT Match', detail: 'Slips from 5 random booths are matched with EVM totals.' },
    ],
    challenges: [
      {
        question: "Who can watch the EVM seals being broken?",
        options: [
          { id: 'A', text: 'Only Police', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Candidate Agents', correct: true, feedback: 'Correct! Transparency is ensured by allowing agents from every party to inspect and verify that the EVM seals were not tampered with.' },
          { id: 'C', text: 'Media', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Standard number of tables per hall?",
        options: [
          { id: 'A', text: '5', correct: false, feedback: 'No.' },
          { id: 'B', text: '14 Tables', correct: true, feedback: 'Correct! ECI standard specifies 14 tables per hall to allow observers and agents to monitor the round-wise count effectively.' },
          { id: 'C', text: '50', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Security level of Strong Rooms?",
        options: [
          { id: 'A', text: 'Single lock', correct: false, feedback: 'No.' },
          { id: 'B', text: '3-Layer security', correct: true, feedback: 'Correct! Strong Rooms are guarded by Central Armed Police (CAPF) at the inner core, State Police in middle, and Local Police outside.' },
          { id: 'C', text: 'No security', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "If EVM screen fails, what is used?",
        options: [
          { id: 'A', text: 'Guessing', correct: false, feedback: 'No.' },
          { id: 'B', text: 'VVPAT Slip count', correct: true, feedback: 'Correct! The physical paper slips in the VVPAT drop-box serve as the ultimate backup if the electronic display fails.' },
          { id: 'C', text: 'New vote', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Which votes are counted first?",
        options: [
          { id: 'A', text: 'EVM votes', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Postal Ballots', correct: true, feedback: 'Correct! The counting process always begins with postal ballots, followed by the electronic votes from EVMs 30 minutes later.' },
          { id: 'C', text: 'VVPAT slips', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "How many booths' VVPAT are matched?",
        options: [
          { id: 'A', text: 'All', correct: false, feedback: 'No.' },
          { id: 'B', text: '5 random booths', correct: true, feedback: 'Correct! To build absolute trust, paper slips from 5 randomly selected booths in every assembly segment are manually tallied with EVM results.' },
          { id: 'C', text: '1 booth', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Authority to allow a recount?",
        options: [
          { id: 'A', text: 'The Winner', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Returning Officer (RO)', correct: true, feedback: 'Correct! A candidate can request a recount in writing, but the RO must decide if the request has a valid basis in fact.' },
          { id: 'C', text: 'Police', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Are mobile phones allowed inside?",
        options: [
          { id: 'A', text: 'Yes', correct: false, feedback: 'No.' },
          { id: 'B', text: 'No, strictly banned', correct: true, feedback: 'Correct! To prevent illegal communication or result leaks, even agents are not allowed to carry phones into the counting hall.' },
          { id: 'C', text: 'For agents only', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Official portal for live results?",
        options: [
          { id: 'A', text: 'Twitter', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Encore / ECI Portal', correct: true, feedback: 'Correct! The ECI "Encore" system feeds live data directly to results.eci.gov.in, which is the only legal source for real-time numbers.' },
          { id: 'C', text: 'News Apps', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Who signs the final round result sheet?",
        options: [
          { id: 'A', text: 'A Voter', correct: false, feedback: 'No.' },
          { id: 'B', text: 'RO and Observer', correct: true, feedback: 'Correct! Every round of counting must be authenticated by the Returning Officer and the ECI Observer before being publicized.' },
          { id: 'C', text: 'TV Host', correct: false, feedback: 'No.' },
        ]
      }
    ],
    facts: [
      '🔒 Strong Room Security',
      '👮 Agents at every table',
      '⚖️ VVPAT Match verification',
    ],
    mistakes: [
      { title: 'Mobile in Hall', consequence: 'Agent Removal', fix: 'Switch off and leave phone outside.' },
      { title: 'Tampering Seals', consequence: 'Arrest / Jail', fix: 'Inspect from a distance, don\'t touch.' },
      { title: 'Early Victory Rally', consequence: 'Crowd Hazard', fix: 'Wait for the official RO declaration.' },
    ],
  },
  results: {
    story: [
      { id: 'declare', icon: '📣', label: 'Declaration', detail: 'The Returning Officer officially announces the winner.' },
      { id: 'cert', icon: '📜', label: 'Certificate', detail: 'The winner receives "Form 21C"—the official Proof of Election.' },
      { id: 'expense', icon: '💰', label: 'Expenses', detail: 'All candidates must submit their spending details within 30 days.' },
      { id: 'service', icon: '🤝', label: 'Public Service', detail: 'The new representative begins their work for the people.' },
    ],
    challenges: [
      {
        question: "Final certificate name?",
        options: [
          { id: 'A', text: 'Form 6', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Form 21C', correct: true, feedback: 'Correct! Form 21C is the "Certificate of Election." It is the legal proof that the individual is now an elected member of the house.' },
          { id: 'C', text: 'Form A', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Days to file final expenses?",
        options: [
          { id: 'A', text: '7 Days', correct: false, feedback: 'No.' },
          { id: 'B', text: '30 Days', correct: true, feedback: 'Correct! Under the law, every candidate must submit a detailed account of their election spending within 30 days of the result declaration.' },
          { id: 'C', text: '1 Year', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Where is an 'Election Petition' filed?",
        options: [
          { id: 'A', text: 'Police Station', correct: false, feedback: 'No.' },
          { id: 'B', text: 'High Court', correct: true, feedback: 'Correct! If someone believes an election was rigged, they must file a legal petition in the State High Court within 45 days.' },
          { id: 'C', text: 'Parliament', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Who keeps the final voting records?",
        options: [
          { id: 'A', text: 'The Winner', correct: false, feedback: 'No.' },
          { id: 'B', text: 'District Treasury', correct: true, feedback: 'Correct! Final election records and sealed EVM paper slips are kept in safe custody at the District Treasury for 6 months to 1 year.' },
          { id: 'C', text: 'ECI Head Office', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Are victory rally costs monitored?",
        options: [
          { id: 'A', text: 'No', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Yes, for local laws', correct: true, feedback: 'Correct! While the official election limit ends on counting day, candidates must still follow local police rules and noise laws for rallies.' },
          { id: 'C', text: 'Only if it is night', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Validity period of Election Petition?",
        options: [
          { id: 'A', text: '1 Day', correct: false, feedback: 'No.' },
          { id: 'B', text: '45 Days', correct: true, feedback: 'Correct! The 45-day window ensures that any serious legal challenge to the victory is made immediately and not years later.' },
          { id: 'C', text: 'Forever', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "Can winner be disqualified later?",
        options: [
          { id: 'A', text: 'No', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Yes, if fraud proven', correct: true, feedback: 'Correct! If a Court finds that the winner used "Corrupt Practices" or lied in their affidavit, they can be removed and banned for 6 years.' },
          { id: 'C', text: 'Only if they die', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "First duty of a new MP/MLA?",
        options: [
          { id: 'A', text: 'Party', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Take the Oath', correct: true, feedback: 'Correct! Before participating in any legislative work, the member must take an oath to uphold the Constitution of India.' },
          { id: 'C', text: 'Travel', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "What happens to winner's deposit?",
        options: [
          { id: 'A', text: 'Lost', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Refunded', correct: true, feedback: 'Correct! The security deposit is returned to all candidates who win or secure more than 1/6th of the total valid votes.' },
          { id: 'C', text: 'Taxed', correct: false, feedback: 'No.' },
        ]
      },
      {
        question: "What marks the 'Finish Line' for the RO?",
        options: [
          { id: 'A', text: 'Winner\'s party', correct: false, feedback: 'No.' },
          { id: 'B', text: 'Signing Form 21C', correct: true, feedback: 'Correct! Once the Returning Officer signs Form 21C and hands it to the winner, their constitutional duty for that election is officially complete.' },
          { id: 'C', text: 'Going home', correct: false, feedback: 'No.' },
        ]
      }
    ],
    facts: [
      '📅 30 Days for Expenses',
      '📜 Form 21C Certificate',
      '🤝 Transition to service',
    ],
    mistakes: [
      { title: 'Missing Expense Deadline', consequence: '3-Year Ban', fix: 'Submit full records within 30 days.' },
      { title: 'Fake Victory News', consequence: 'Public Confusion', fix: 'Wait for official RO signature.' },
      { title: 'Ignoring Petition', consequence: 'Court Order', fix: 'Respond to High Court notices immediately.' },
    ],
  },
};

// ── Adaptive Question Bank ───────────────────────────────────────────────────
export const QUESTION_BANK = [
  {
    id: "q_ann_01",
    stage: "announcement",
    difficulty: "easy",
    type: "mcq",
    question: "Who is responsible for announcing the election dates in India?",
    options: ["The Prime Minister", "The President", "Election Commission of India", "Supreme Court"],
    correctIndex: 2,
    explanation: "The Election Commission of India (ECI) independently decides and announces the election schedule.",
    wrongExplanations: [
      "The PM is a candidate and cannot decide the dates.",
      "The President acts on the advice of the ECI, but the ECI makes the announcement.",
      "The Supreme Court monitors but doesn't set dates."
    ],
    xpReward: 30,
    tag: "authority",
  },
  {
    id: "q_reg_01",
    stage: "registration",
    difficulty: "medium",
    type: "scenario",
    question: "A citizen is 18 but their name is missing from the roll on voting day. Can they vote?",
    options: ["No, registration is mandatory", "Yes, with Aadhaar", "Yes, if they have a Voter ID", "Only if the officer allows"],
    correctIndex: 0,
    explanation: "Being on the electoral roll is a strict requirement for voting in India.",
    wrongExplanations: [
      "Aadhaar is identity proof, but doesn't grant voting rights without enrollment.",
      "Voter ID is secondary to the presence of your name on the roll.",
      "The officer cannot override the electoral roll."
    ],
    xpReward: 50,
    tag: "eligibility",
  },
  {
    id: "q_nom_01",
    stage: "nomination",
    difficulty: "easy",
    type: "mcq",
    question: "What is the primary document a candidate files during nomination?",
    options: ["Affidavit", "Voter ID", "Rally Permit", "Passport"],
    correctIndex: 0,
    explanation: "The Affidavit is a legal declaration of assets, liabilities, and educational qualifications.",
    wrongExplanations: [
      "Voter ID proves eligibility to vote, but not candidacy.",
      "Rally permits are for campaigning, not nomination.",
      "A passport proves citizenship but isn't the primary nomination document."
    ],
    xpReward: 30,
    tag: "candidacy",
  },
  {
    id: "q_cam_01",
    stage: "campaign",
    difficulty: "medium",
    type: "mcq",
    question: "When must active campaigning end before the polling begins?",
    options: ["12 hours before", "24 hours before", "48 hours before", "72 hours before"],
    correctIndex: 2,
    explanation: "Campaigning must stop 48 hours before the time fixed for the conclusion of the poll.",
    wrongExplanations: [
      "12 hours is too short for a cooling-off period.",
      "24 hours is used in some countries, but India requires 48.",
      "72 hours is longer than the standard Indian requirement."
    ],
    xpReward: 50,
    tag: "rules",
  },
  {
    id: "q_vot_01",
    stage: "voting",
    difficulty: "easy",
    type: "mcq",
    question: "What is used to mark a voter's finger to prevent multiple voting?",
    options: ["Permanent Marker", "Indelible Ink", "Paint", "Stamp Pad Ink"],
    correctIndex: 1,
    explanation: "Indelible ink containing silver nitrate is used as it is very difficult to wash off.",
    wrongExplanations: [
      "Markers can be cleaned off easily.",
      "Paint doesn't penetrate the skin/nail like the ink does.",
      "Stamp ink is water-soluble."
    ],
    xpReward: 30,
    tag: "process",
  },
];

// ── Simulation Scenarios ─────────────────────────────────────────────────────
export const SIM_SCENARIOS = {
  nomination: [
    {
      day: 1,
      scene: "Election Office",
      description: "You arrive to submit your papers. There is a long line of people. A stranger says you can jump to the front if you pay a small fee.",
      prompt: "What will you do to start your journey?",
      choices: [
        {
          id: 'wait',
          text: 'Wait in the line',
          cost: 0,
          stats: { trust: +10, corruption: 0 },
          hint: 'Fair Play: Everyone should follow the same rules.',
          lesson: 'Rule of Law: A good leader never breaks the line. This builds respect from other citizens.'
        },
        {
          id: 'bribe',
          text: 'Pay to jump the line',
          cost: 5000,
          stats: { trust: -25, corruption: +30 },
          hint: '⚠️ Very Risky',
          lesson: 'Anti-Bribery Law: Giving money for a favor is a crime. You can be banned from elections for 6 years for this.'
        },
        {
          id: 'check',
          text: 'Double check your papers',
          cost: 0,
          stats: { momentum: +10 },
          hint: 'Accuracy: Small mistakes cost big.',
          lesson: 'Paperwork Check: Many candidates lose their chance because of simple spelling or data errors in their forms.'
        },
      ],
    },
    {
      day: 2,
      scene: "Public Market",
      description: "You are meeting local people. A shop owner asks you to promise a government contract only to his family in exchange for his vote.",
      prompt: "How do you respond to this request?",
      choices: [
        {
          id: 'reject',
          text: 'Refuse and explain fairness',
          cost: 0,
          stats: { trust: +15, reach: +5 },
          hint: 'Justice: Contracts must be open to all.',
          lesson: 'Equal Opportunity: Giving favors to friends is "Nepotism." A fair leader gives everyone a chance based on skill.'
        },
        {
          id: 'accept',
          text: 'Agree to help him secretly',
          cost: 0,
          stats: { trust: -20, corruption: +20 },
          hint: '⚠️ Corruption Trap',
          lesson: 'Abuse of Power: Using your position to help friends is a misuse of public trust and can lead to legal trouble.'
        }
      ]
    },
    {
      day: 3,
      scene: "Media Interview",
      description: "A reporter asks about your past mistakes. You have a choice: tell the truth or hide it to look perfect.",
      prompt: "How will you handle your history?",
      choices: [
        {
          id: 'truth',
          text: 'Tell the truth clearly',
          cost: 0,
          stats: { trust: +20, momentum: +5 },
          hint: 'Honesty: Voters respect the truth.',
          lesson: 'Transparency: Being honest about mistakes shows strength. It prevents others from using your past against you later.'
        },
        {
          id: 'hide',
          text: 'Hide it and change the topic',
          cost: 0,
          stats: { trust: -15, momentum: -10 },
          hint: '⚠️ Privacy Risk',
          lesson: 'Public Disclosure: In an election, your history is public. If someone else finds the truth, you lose all trust.'
        }
      ]
    }
  ],
};

// ── Navigation ───────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  {
    id: TABS.JOURNEY,
    icon: '🗺️',
    label: 'Journey',
    ariaLabel: 'Your Civic Journey Map',
  },
  {
    id: TABS.SIMULATE,
    icon: '🎭',
    label: 'Simulate',
    ariaLabel: 'Candidate Simulator',
  },
  {
    id: TABS.MENTOR,
    icon: '🤖',
    label: 'Mentor',
    ariaLabel: 'AI Mentor Sage',
  },
  {
    id: TABS.QUIZ,
    icon: '🧠',
    label: 'Quiz',
    ariaLabel: 'Adaptive Quiz',
  },
];
