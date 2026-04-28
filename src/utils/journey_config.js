/**
 * @fileoverview Journey stages and immersive details.
 * Split from constants.js to optimize bundle size.
 */

export const JOURNEY_STAGES = [
  { id: 'announcement', title: 'Announcement', icon: '📢', order: 1 },
  { id: 'registration', title: 'Registration', icon: '📋', order: 2 },
  { id: 'nomination', title: 'Nomination', icon: '🏛️', order: 3 },
  { id: 'campaign', title: 'Campaign', icon: '📣', order: 4 },
  { id: 'voting', title: 'Voting Day', icon: '🗳️', order: 5 },
  { id: 'counting', title: 'Counting', icon: '🔢', order: 6 },
  { id: 'results', title: 'Results', icon: '🏆', order: 7 },
];

export const STAGE_DETAILS = {
  announcement: {
    story: [
      { id: 'press', icon: '🎤', label: 'Press Note', detail: 'The ECI calls a press conference to announce the schedule.' },
      { id: 'mcc', icon: '📜', label: 'MCC Active', detail: 'The Model Code of Conduct starts immediately after announcement.' },
    ],
    facts: ['📜 Code of Conduct starts Day 1', '🗳️ Over 900 Million voters'],
    mistakes: [
      { title: 'New Announcements', consequence: 'MCC Violation', fix: 'Wait until after election results.' },
      { title: 'Transferring Officials', consequence: 'Action by ECI', fix: 'Take prior approval from the Election Commission.' },
      { title: 'Using Govt Vehicles', consequence: 'Misuse of Power', fix: 'Use private vehicles for any political work.' }
    ],
  },
  registration: {
    story: [
      { id: 'form6', icon: '📝', label: 'Form 6', detail: 'Citizens fill out Form 6 to register as new voters.' },
      { id: 'epic', icon: '🪪', label: 'EPIC Issued', detail: 'The ECI issues the Electoral Photo Identity Card (Voter ID).' },
    ],
    facts: ['🪪 Must be 18 years old', '📝 Form 6 for new voters'],
    mistakes: [
      { title: 'Missing Deadline', consequence: 'Cannot Vote', fix: 'Register before the cutoff date.' },
      { title: 'Multiple Registrations', consequence: 'Offense under RPA', fix: 'Delete duplicate entries immediately.' },
      { title: 'False Information', consequence: 'Jail / Fine', fix: 'Provide accurate date of birth and address.' }
    ],
  },
  nomination: {
    story: [
      { id: 'file', icon: '📁', label: 'File Papers', detail: 'Candidates file their nomination papers with the Returning Officer.' },
      { id: 'scrutiny', icon: '🔎', label: 'Scrutiny', detail: 'The RO verifies the affidavits and documents.' },
    ],
    facts: ['🏛️ Must be 25+ years old for Lok Sabha', '💰 ₹25,000 security deposit'],
    mistakes: [
      { title: 'Incomplete Affidavit', consequence: 'Nomination Rejected', fix: 'Disclose all columns, leave nothing blank.' },
      { title: 'Hiding Criminal Cases', consequence: 'Disqualification', fix: 'Declare all pending cases and publish in newspapers.' },
      { title: 'Fake Proposers', consequence: 'Rejection & Fraud', fix: 'Ensure proposers are genuine voters of that constituency.' }
    ],
  },
  campaign: {
    story: [
      { id: 'rally', icon: '📣', label: 'Public Rallies', detail: 'Candidates address the public and share their manifesto.' },
      { id: 'silence', icon: '🤫', label: 'Campaign Silence', detail: 'All campaigning stops 48 hours before polling.' },
    ],
    facts: ['🛑 Ends 48 hours before voting', '💸 ₹95 Lakh expenditure limit'],
    mistakes: [
      { title: 'Hate Speech', consequence: 'MCC Violation & Ban', fix: 'Focus on development, avoid religious or personal attacks.' },
      { title: 'Bribing Voters', consequence: 'Corrupt Practice', fix: 'Never distribute cash, liquor, or freebies.' },
      { title: 'Campaigning in Silence Period', consequence: 'Arrest / Fine', fix: 'Stop all public meetings 48 hours before voting day.' }
    ],
  },
  voting: {
    story: [
      { id: 'booth', icon: '🏫', label: 'Polling Booth', detail: 'Voters arrive at designated polling stations.' },
      { id: 'evm', icon: '👆', label: 'Cast Vote', detail: 'Voters press the button on the EVM to cast their vote.' },
    ],
    facts: ['👆 EVMs used nationwide', '🧾 VVPAT provides paper trail'],
    mistakes: [
      { title: 'Taking Photos Inside', consequence: 'Arrest / Fine', fix: 'Leave your phone outside the polling booth.' },
      { title: 'Wearing Party Symbols', consequence: 'Prohibited', fix: 'Do not wear party caps or badges within 100 meters.' },
      { title: 'Proxy Voting', consequence: 'Impersonation Crime', fix: 'Only vote for yourself, never pretend to be someone else.' }
    ],
  },
  counting: {
    story: [
      { id: 'strongroom', icon: '🔐', label: 'Strong Room', detail: 'EVMs are brought from heavily guarded strong rooms.' },
      { id: 'tally', icon: '🔢', label: 'Tally Votes', detail: 'Votes are counted under the supervision of the Returning Officer.' },
    ],
    facts: ['✉️ Postal ballots counted first', '🔍 VVPAT slips cross-verified'],
    mistakes: [
      { title: 'Premature Celebration', consequence: 'Chaos / Clashes', fix: 'Wait for the official declaration by the ECI.' },
      { title: 'Breaching Strong Room', consequence: 'Security Threat', fix: 'Only authorized agents can enter the counting center.' },
      { title: 'Disrupting Counting', consequence: 'FIR / Arrest', fix: 'Maintain peace and respect the mandate.' }
    ],
  },
  results: {
    story: [
      { id: 'declare', icon: '📜', label: 'Declaration', detail: 'The RO hands over the winning certificate.' },
      { id: 'form_gov', icon: '🤝', label: 'Form Govt', detail: 'The majority party is invited to form the government.' },
    ],
    facts: ['🏆 272 seats needed for majority', '🤝 Coalitions form if hung parliament'],
    mistakes: [
      { title: 'Defection', consequence: 'Disqualification', fix: 'Adhere to the anti-defection law (10th Schedule).' },
      { title: 'Damaging Public Property', consequence: 'Arrest / Recovery', fix: 'Celebrate responsibly without vandalism.' },
      { title: 'Violence Against Opponents', consequence: 'Criminal Charges', fix: 'Respect the opposition and democratic process.' }
    ],
  },
};

export const SIM_SCENARIOS = {
  nomination: [
    {
      day: 1,
      scene: "Election Office",
      description: "You arrive to submit your papers. There is a long line of people. A stranger says you can jump to the front if you pay a small fee.",
      prompt: "How will you handle your first day as a candidate?",
      choices: [
        {
          id: 'wait',
          text: 'Wait in the line',
          cost: 0,
          stats: { trust: +10, corruption: 0 },
          hint: 'Fair Play: Everyone follows the same rules.',
          lesson: 'Rule of Law: A good leader never breaks the line. This builds respect from other citizens.'
        },
        {
          id: 'bribe',
          text: 'Pay to jump the line',
          cost: 5000,
          stats: { trust: -25, corruption: +30 },
          hint: '⚠️ High Risk',
          lesson: 'Anti-Bribery Law: Giving money for a favor is a crime. You can be banned for 6 years.'
        },
        {
          id: 'check',
          text: 'Double check your papers',
          cost: 0,
          stats: { momentum: +10 },
          hint: 'Accuracy: Small mistakes cost big.',
          lesson: 'Many candidates lose their chance because of simple spelling errors in their forms.'
        },
        {
          id: 'help',
          text: 'Help an elderly citizen in line',
          cost: 0,
          stats: { trust: +15, reach: +5 },
          hint: 'Civic Service: Lead by example.',
          lesson: 'Voters watch how you treat people. Compassion is a key trait of a servant leader.'
        }
      ],
    },
    {
      day: 2,
      scene: "Affidavit Filing",
      description: "You must declare your assets and criminal record. Some advisors suggest 'minimizing' your wealth to look more humble.",
      prompt: "How transparent will you be?",
      choices: [
        {
          id: 'full_disclosure',
          text: 'Full, honest disclosure',
          cost: 0,
          stats: { trust: +20, momentum: +5 },
          hint: 'Integrity: Truth is your best armor.',
          lesson: 'Transparency: Voters have a right to know. False affidavits can lead to disqualification.'
        },
        {
          id: 'hide_assets',
          text: 'Hide some property',
          cost: 0,
          stats: { trust: -30, corruption: +20 },
          hint: '⚠️ Legal Trap',
          lesson: 'Non-disclosure is a serious offense under the RP Act.'
        },
        {
          id: 'public_event',
          text: 'Turn filing into a media event',
          cost: 10000,
          stats: { reach: +20, momentum: +10 },
          hint: 'Visibility: Make some noise.',
          lesson: 'Publicity helps, but ensure your message matches your actions.'
        },
        {
          id: 'educational_post',
          text: 'Explain the process on social media',
          cost: 2000,
          stats: { reach: +10, trust: +10 },
          hint: 'Awareness: Educate your voters.',
          lesson: 'Empowered voters are your strongest supporters.'
        }
      ]
    }
  ],
  campaign: [
    {
      day: 6,
      scene: "Public Rally",
      description: "Thousands have gathered. Your opponent just made a personal attack against you. The crowd wants a strong response.",
      prompt: "What is your campaign style?",
      choices: [
        {
          id: 'focus_issues',
          text: 'Focus on development issues',
          cost: 50000,
          stats: { trust: +15, reach: +10 },
          hint: 'Statesmanship: Rise above.',
          lesson: 'Positive campaigning builds long-term credibility over temporary noise.'
        },
        {
          id: 'attack_back',
          text: 'Counter-attack with personal insults',
          cost: 10000,
          stats: { momentum: +20, trust: -15 },
          hint: 'Polarization: Excites the base.',
          lesson: 'Hate speech and personal attacks can violate the Model Code of Conduct.'
        },
        {
          id: 'community_feast',
          text: 'Organize a community feast (Langar)',
          cost: 100000,
          stats: { reach: +30, corruption: +10 },
          hint: '⚠️ MCC Boundary',
          lesson: 'Inducing voters with food or gifts is a corrupt practice.'
        },
        {
          id: 'town_hall',
          text: 'Conduct a Q&A Town Hall',
          cost: 20000,
          stats: { trust: +25, reach: +5 },
          hint: 'Direct Engagement: Listen to the people.',
          lesson: 'Participatory democracy starts with listening to constituents.'
        }
      ]
    },
    {
      day: 7,
      scene: "Social Media Storm",
      description: "A viral video falsely claims you were involved in a scandal. It's trending on Twitter and WhatsApp.",
      prompt: "How do you handle the misinformation?",
      choices: [
        {
          id: 'legal_action',
          text: 'File a defamation case and Cyber Cell report',
          cost: 15000,
          stats: { trust: +10, momentum: +5 },
          hint: 'Legal Recourse: Fight back with law.',
          lesson: 'Rule of Law: The legal system has mechanisms to fight "Fake News".'
        },
        {
          id: 'video_rebuttal',
          text: 'Release a live video with evidence',
          cost: 0,
          stats: { trust: +20, reach: +15 },
          hint: 'Direct Communication: Transparency wins.',
          lesson: 'Transparency is the strongest antidote to misinformation.'
        },
        {
          id: 'ignore_it',
          text: 'Ignore it and focus on your work',
          cost: 0,
          stats: { reach: -10, trust: -5 },
          hint: '⚠️ Perception Risk',
          lesson: 'In the digital age, silence can sometimes be seen as an admission of guilt.'
        },
        {
          id: 'fake_counter',
          text: 'Release a fake video about the opponent',
          cost: 20000,
          stats: { reach: +20, corruption: +40 },
          hint: '⚠️ Dark Arts',
          lesson: 'Creating fake content is unethical and can lead to criminal charges.'
        }
      ]
    }
  ],

  voting: [
    {
      day: 28,
      scene: "Polling Booth Visit",
      description: "It is voting day. You see some of your supporters trying to 'influence' voters near the entrance.",
      prompt: "How do you manage your team?",
      choices: [
        {
          id: 'stop_them',
          text: 'Order them to stop and move away',
          cost: 0,
          stats: { trust: +20, momentum: -5 },
          hint: 'Rule Follower: Strict MCC compliance.',
          lesson: 'No campaigning is allowed within 100 meters of the polling station.'
        },
        {
          id: 'ignore',
          text: 'Look the other way',
          cost: 0,
          stats: { corruption: +15, reach: +5 },
          hint: '⚠️ Silent Complicity',
          lesson: 'Leaders are responsible for the actions of their workers.'
        },
        {
          id: 'thank_voters',
          text: 'Thank people for voting (Generic)',
          cost: 0,
          stats: { trust: +10, reach: +10 },
          hint: 'Gratitude: Support the process.',
          lesson: 'Encouraging voting is good, but stay within the legal boundary.'
        },
        {
          id: 'monitor_booth',
          text: 'Check for malfunctioning EVMs',
          cost: 0,
          stats: { trust: +15, momentum: +5 },
          hint: 'Vigilance: Protect the vote.',
          lesson: 'Candidates have the right to ensure the voting process is fair and tech-error free.'
        }
      ]
    }
  ]
};
