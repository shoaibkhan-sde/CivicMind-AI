/**
 * @fileoverview StageCard — Detailed content for an election stage.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FlowDiagram from './FlowDiagram';
import { STAGE_DETAILS } from '../utils/constants';
import { QUESTION_BANK } from '../utils/quiz_bank';
import useXP from '../hooks/useXP';
import useJourney from '../hooks/useJourney';
import { BookOpen, AlertCircle, Target, Globe, AlertTriangle, CheckCircle, MapPin, BarChart2, Scale, ExternalLink, Newspaper } from 'lucide-react';

// ── Real-world data per stage ─────────────────────────────────────────────────
const REAL_WORLD_DATA = {
  announcement: {
    stats: [
      { label: 'Voters in 2024 General Election', value: '96.8 Crore', icon: '🗳️' },
      { label: 'Polling Stations Set Up', value: '10.5 Lakh', icon: '🏫' },
      { label: 'Phases in 2024 Election', value: '7 Phases', icon: '📅' },
      { label: 'Days of MCC Enforcement', value: '77 Days', icon: '📜' },
    ],
    cases: [
      {
        title: 'ECI Announces 2024 General Elections',
        date: 'March 16, 2024',
        body: 'Chief Election Commissioner Rajiv Kumar announced a 7-phase schedule from April 19 to June 1. The Model Code of Conduct came into effect immediately, restricting government announcements and transfers.',
        verdict: 'ECI notified 543 Lok Sabha constituencies',
        icon: '📢',
      },
      {
        title: 'Historic Voter Registration Drive',
        date: '2024',
        body: 'The ECI ran "Meri Pehli Vote" campaigns targeting first-time voters aged 18–19. Over 1.8 crore new voters were added to the electoral roll ahead of the 2024 elections.',
        verdict: '1.8 Crore new first-time voters registered',
        icon: '📊',
      },
    ],
    link: { label: 'Read the ECI Press Release', url: 'https://www.eci.gov.in' },
  },
  registration: {
    stats: [
      { label: 'Total Registered Voters (2024)', value: '96.8 Crore', icon: '👥' },
      { label: 'Women Voters', value: '47.1 Crore', icon: '👩' },
      { label: 'First-Time Voters (18–19 yrs)', value: '1.8 Crore', icon: '🌟' },
      { label: 'NRI Registered Voters', value: '1.12 Lakh', icon: '✈️' },
    ],
    cases: [
      {
        title: 'Voter ID Becomes Proof of Address',
        date: '2023',
        body: 'The EPIC (Electoral Photo ID Card) was officially recognised as proof of address under multiple central government schemes, including Direct Benefit Transfers — boosting registration incentives.',
        verdict: 'EPIC used in over 12 government schemes',
        icon: '🪪',
      },
      {
        title: 'Duplicate Voter ID Scandal in Bihar',
        date: '2019',
        body: 'ECI investigations uncovered ~4 lakh duplicate voter entries in certain districts of Bihar. Affected entries were deleted under Section 22 of the Representation of the People Act, 1950.',
        verdict: '4 Lakh duplicate entries removed',
        icon: '⚠️',
      },
    ],
    link: { label: 'Register / Check Voter ID on NVSP', url: 'https://voters.eci.gov.in' },
  },
  nomination: {
    stats: [
      { label: 'Nominations Filed (2024 LS)', value: '8,360', icon: '📁' },
      { label: 'Nominations Rejected', value: '1,290', icon: '❌' },
      { label: 'Candidates After Withdrawal', value: '8,360', icon: '✅' },
      { label: 'Candidates with Criminal Cases', value: '46%', icon: '⚠️' },
    ],
    cases: [
      {
        title: 'ADR vs Union of India — Mandatory Disclosure',
        date: 'Supreme Court, 2002',
        body: 'The Supreme Court directed that candidates must disclose their criminal antecedents, assets, and educational qualifications in their nomination affidavit. This landmark ruling created the current Form 26 system.',
        verdict: 'Full disclosure mandatory for all candidates',
        icon: '⚖️',
      },
      {
        title: 'Nomination Rejected for Incomplete Affidavit',
        date: '2023 State Elections',
        body: 'Dozens of candidates in Rajasthan and MP assembly elections had their nominations rejected for leaving blank columns in Form 26, particularly sections related to pending criminal cases.',
        verdict: 'Returning Officers reject incomplete affidavits',
        icon: '📋',
      },
    ],
    link: { label: 'View Candidate Affidavits on MyNeta', url: 'https://myneta.info' },
  },
  campaign: {
    stats: [
      { label: 'Campaign Expenditure Limit (LS)', value: '₹95 Lakh', icon: '💸' },
      { label: 'MCC Violations Registered (2024)', value: '3,400+', icon: '🚨' },
      { label: 'Cash Seized (2024 Elections)', value: '₹4,600 Crore', icon: '💰' },
      { label: 'Paid News Cases Flagged', value: '2,800+', icon: '📰' },
    ],
    cases: [
      {
        title: 'WhatsApp Fake News Crackdown (2019)',
        date: '2019 General Elections',
        body: 'ECI partnered with WhatsApp to limit message forwarding to 5 chats. Over 3,000 pieces of misinformation were flagged through the "cVIGIL" citizen grievance app, with 90% resolved within 100 minutes.',
        verdict: 'cVIGIL App resolved 95% complaints in <100 mins',
        icon: '📱',
      },
      {
        title: '₹4,600 Crore Seized in 2024',
        date: 'April–June 2024',
        body: 'ECI enforcement teams seized record ₹4,600 crore in cash, drugs, liquor, and freebies during the 2024 general elections — over 3x the 2019 seizures — using Flying Squads and SSTs.',
        verdict: 'Record seizures — 3x more than 2019',
        icon: '🚔',
      },
    ],
    link: { label: 'File a Campaign Complaint via cVIGIL', url: 'https://cvigil.eci.gov.in' },
  },
  voting: {
    stats: [
      { label: 'Voter Turnout (2024 LS)', value: '65.79%', icon: '📊' },
      { label: 'Women Turnout (2024)', value: '65.78%', icon: '👩' },
      { label: 'EVMs Deployed', value: '55 Lakh+', icon: '🖥️' },
      { label: 'Booths with Webcasting', value: '1.5 Lakh+', icon: '📷' },
    ],
    cases: [
      {
        title: 'World\'s Longest Polling Route — Arunachal',
        date: '2024',
        body: 'ECI officials trekked 2 days through dense forest to reach a single-voter polling station in Malogam, Arunachal Pradesh — demonstrating that every vote counts in Indian democracy.',
        verdict: '1-voter booth in Malogam served faithfully',
        icon: '🏔️',
      },
      {
        title: 'EVM Tampering Allegations Dismissed',
        date: '2019 — Supreme Court',
        body: 'The Supreme Court upheld the integrity of EVMs while ordering VVPAT slip verification in at least 5 randomly selected polling stations per constituency to provide an independent audit trail.',
        verdict: 'Supreme Court: No credible evidence of EVM tampering',
        icon: '⚖️',
      },
    ],
    link: { label: 'Track Voter Turnout Live on ECI', url: 'https://results.eci.gov.in' },
  },
  counting: {
    stats: [
      { label: 'Counting Centres (2024)', value: '1,100+', icon: '🏛️' },
      { label: 'Observer Officials Deployed', value: '2,200+', icon: '👁️' },
      { label: 'VVPAT Slips Cross-Verified', value: '5 / Constituency', icon: '🧾' },
      { label: 'Time to Declare All Results', value: '~12 Hours', icon: '⏱️' },
    ],
    cases: [
      {
        title: 'Postal Ballot Decides Close Contest',
        date: '2019 — Rajasthan By-Election',
        body: 'In the Ramgarh constituency by-election, postal ballots proved decisive in a result decided by fewer than 2,000 votes. The ECI counted all postal ballots first, followed by EVM results, preventing delays.',
        verdict: 'Postal ballots counted first — critical process',
        icon: '✉️',
      },
      {
        title: 'Strong Room Security Protocols',
        date: 'Standard Practice',
        body: 'EVMs are stored in triple-layer security after polling: CRPF guards outside, videography inside, and agent seals on the room. No EVM has ever been reported missing from a strong room in Indian election history.',
        verdict: '100% EVM accountability maintained since 1998',
        icon: '🔐',
      },
    ],
    link: { label: 'Watch Live Counting on ECI Results', url: 'https://results.eci.gov.in' },
  },
  results: {
    stats: [
      { label: 'Seats for Lok Sabha Majority', value: '272 of 543', icon: '🏆' },
      { label: 'NDA Seats Won (2024)', value: '293', icon: '📊' },
      { label: 'I.N.D.I.A. Alliance Seats (2024)', value: '234', icon: '📊' },
      { label: 'Women MPs Elected (2024)', value: '74', icon: '👩' },
    ],
    cases: [
      {
        title: '10th Schedule — Anti-Defection Law',
        date: 'In Force Since 1985',
        body: 'The Anti-Defection Law (10th Schedule) disqualifies any MP who voluntarily gives up party membership or votes against party whip. The Speaker of the Lok Sabha is the deciding authority — a power upheld by the Supreme Court in Kihoto Hollohan vs Zachillhu (1992).',
        verdict: 'MPs disqualified if they switch parties post-election',
        icon: '⚖️',
      },
      {
        title: 'Historic 2024 Mandate — Coalition Government',
        date: 'June 4, 2024',
        body: 'The BJP won 240 seats in 2024 — short of the 272-majority mark — forming a coalition NDA government with allies JD(U) and TDP. This marked the first time since 2014 that a coalition was necessary, reshaping the political balance.',
        verdict: 'Coalition government formed with 293 NDA seats',
        icon: '🤝',
      },
    ],
    link: { label: 'See Full 2024 Results on ECI', url: 'https://results.eci.gov.in' },
  },
};

/**
 * Renders the 4-tab immersive experience for a specific stage.
 */
function StageCard({ stageId }) {

  const [activeTab, setActiveTab] = useState('story');
  const [challengeResult, setChallengeResult] = useState(null);
  const [showStageComplete, setShowStageComplete] = useState(false);
  const [xpFloats, setXpFloats] = useState([]); // [{ id, x, y, amount }]
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  
  const { addXP } = useXP();
  const { stageProgress, updateStageProgress, completeStage, allStages } = useJourney();

  const details = STAGE_DETAILS[stageId] || STAGE_DETAILS.announcement || { story: [], facts: [], mistakes: [] };
  const currentStageMeta = allStages?.find(s => s.id === stageId) || {};
  const stageTitle = currentStageMeta.title || (stageId.charAt(0).toUpperCase() + stageId.slice(1));
  const currentProgress = stageProgress[stageId] || { currentIndex: 0, masteredSteps: [] };
  
  // Dynamically generate up to 5 challenges from QUESTION_BANK for this stage
  const activeChallenges = React.useMemo(() => {
    const stageQuestions = QUESTION_BANK.filter(q => q.stage === stageId).slice(0, 5);
    if (stageQuestions.length > 0) {
      return stageQuestions.map((q) => ({
        question: q.question,
        options: q.options.map((optText, index) => ({
          id: String.fromCharCode(65 + index), // A, B, C, D
          text: optText,
          correct: index === q.correctIndex,
          feedback: q.explanation // Detailed explanation
        }))
      }));
    }
    return details.challenges || [];
  }, [stageId, details.challenges]);

  // 🛡️ SANITIZER: Prevent NaN or undefined from breaking the UI
  const currentChallengeIndex = (typeof currentProgress.currentIndex === 'number' && !isNaN(currentProgress.currentIndex)) 
    ? currentProgress.currentIndex 
    : 0;
    
  const masteredSteps = Array.isArray(currentProgress.masteredSteps) ? currentProgress.masteredSteps : [];

  // 🔥 Reset state when switching missions
  React.useEffect(() => {
    setChallengeResult(null);
    setXpFloats([]);
    setActiveTab('story');
    setSelectedOptionId(null);
    setShowStageComplete(false);
  }, [stageId]);

  const handleChallenge = (correct, e) => {
    // 🛡️ SECURITY: Don't allow re-answering already mastered questions
    if (masteredSteps.includes(currentChallengeIndex)) return;

    if (correct && challengeResult !== 'correct') {
      const rect = e.currentTarget.getBoundingClientRect();
      const newFloat = {
        id: Date.now(),
        x: e.clientX || (rect.left + rect.width / 2),
        y: e.clientY || rect.top,
        amount: 20 // Upgraded to 20XP for premium
      };
      setXpFloats(prev => [...prev, newFloat]);
      addXP(20);
      setChallengeResult('correct');
      setSelectedOptionId(e.currentTarget.getAttribute('data-opt-id'));
      
      const newMastered = [...masteredSteps, currentChallengeIndex];
      updateStageProgress(stageId, { masteredSteps: newMastered });

      const isLastChallenge = currentChallengeIndex >= (activeChallenges.length - 1);
      if (isLastChallenge) {
        completeStage(stageId);
        if (stageId === 'results') {
          window.dispatchEvent(new CustomEvent('civic_victory'));
        } else {
          setShowStageComplete(true);
        }
      }

      // Clean up float after animation
      setTimeout(() => {
        setXpFloats(prev => prev.filter(f => f.id !== newFloat.id));
      }, 1200);
    } else if (!correct) {
      setSelectedOptionId(e.currentTarget.getAttribute('data-opt-id'));
      setChallengeResult('wrong');
      setTimeout(() => {
        setChallengeResult(null);
        setSelectedOptionId(null);
      }, 5000); // Increased to 5 seconds
    }
  };

  const nextStep = () => {
    if (currentChallengeIndex < activeChallenges.length - 1) {
      updateStageProgress(stageId, { currentIndex: currentChallengeIndex + 1 });
      setChallengeResult(null);
      setSelectedOptionId(null);
    }
  };

  const prevStep = () => {
    if (currentChallengeIndex > 0) {
      updateStageProgress(stageId, { currentIndex: currentChallengeIndex - 1 });
      setChallengeResult(null);
      setSelectedOptionId(null);
    }
  };

  const startNextMission = () => {
    const currentIndex = allStages.findIndex(s => s.id === stageId);
    if (currentIndex < allStages.length - 1) {
      const nextStage = allStages[currentIndex + 1];
      setShowStageComplete(false);
      // The map will auto-switch because JourneyMap listens to currentStage
    }
  };

  return (
    <div className="stage-card">
      <div className="stage-tabs">
        <button className={`stage-tab ${activeTab === 'story' ? 'active' : ''}`} onClick={() => setActiveTab('story')}><BookOpen size={16} /> Visual Story</button>
        <button className={`stage-tab ${activeTab === 'mistakes' ? 'active' : ''}`} onClick={() => setActiveTab('mistakes')}><AlertCircle size={16} /> Mistakes</button>
        <button className={`stage-tab ${activeTab === 'challenge' ? 'active' : ''}`} onClick={() => setActiveTab('challenge')}><Target size={16} /> Challenge</button>
        <button className={`stage-tab ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}><Globe size={16} /> Real World</button>
      </div>

      <div className="stage-content-body">
        {activeTab === 'story' && (
          <div className="tab-story">
            <h3 className="tab-heading" style={{ fontSize: '28px', background: 'linear-gradient(to right, var(--blue), var(--text-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '24px' }}>The Story of {stageTitle}</h3>
            <FlowDiagram nodes={(details.story || []).map((node, i) => ({
              ...node,
              fact: (details.facts || [])[i]
            }))} />
          </div>
        )}

        {activeTab === 'mistakes' && (
          <div className="tab-mistakes">
            <h3 className="tab-heading">Common Roadblocks</h3>
            <div className="mistake-grid">
              {(details.mistakes || []).map((m, i) => (
                <div key={i} className="mistake-card">
                  <div className="mistake-title"><AlertTriangle size={14} className="icon-orange" /> {m?.title || 'Unknown Issue'}</div>
                  <div className="mistake-consequence">↳ {m?.consequence || 'Potential risk'}</div>
                  <div className="mistake-fix"><CheckCircle size={14} className="icon-green" /> Fix: {m?.fix || 'Consult the ECI guide.'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'challenge' && (
          <div className="tab-challenge">
            <div className="challenge-progress-header">
              <h3 className="tab-heading">Mastery Series</h3>
              <div className="mastery-steps">Step {currentChallengeIndex + 1} of {Math.max(activeChallenges.length, 1)}</div>
            </div>
            
            <div className="mastery-progress-bar">
              <div 
                className="mastery-progress-fill" 
                style={{ width: `${((currentChallengeIndex + (challengeResult === 'correct' || masteredSteps.includes(currentChallengeIndex) ? 1 : 0)) / Math.max(activeChallenges.length, 1)) * 100}%` }}
              />
            </div>

            <p className="challenge-q">
              {activeChallenges[currentChallengeIndex]?.question || "No challenge available for this stage."}
            </p>

            <div className="choice-grid">
              {(activeChallenges[currentChallengeIndex]?.options || []).map((opt) => {
                if (!opt) return null;
                const isMastered = masteredSteps.includes(currentChallengeIndex);
                const isCorrectChoice = opt.correct;
                
                return (
                  <button 
                     key={opt.id}
                     data-opt-id={opt.id}
                     className={`choice-btn 
                       ${(challengeResult === 'correct' || isMastered) && isCorrectChoice ? 'correct' : ''} 
                       ${challengeResult === 'wrong' && opt.id === selectedOptionId ? 'shake wrong' : ''}
                     `}
                     onClick={(e) => handleChallenge(opt.correct, e)}
                     disabled={challengeResult === 'correct' || isMastered}
                  >
                    <div className="choice-info">
                      <span style={{ fontWeight: 'bold', marginRight: '8px', color: 'var(--blue)' }}>{opt.id}.</span> 
                      {opt.text}
                    </div>
                  </button>
                );
              })}
            </div>

            {(challengeResult || masteredSteps.includes(currentChallengeIndex)) && (
              <div className={`challenge-feedback-premium ${masteredSteps.includes(currentChallengeIndex) ? 'correct' : challengeResult}`} style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: challengeResult === 'wrong' && !masteredSteps.includes(currentChallengeIndex) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', border: challengeResult === 'wrong' && !masteredSteps.includes(currentChallengeIndex) ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)' }}>
                <div className="feedback-content" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {(challengeResult === 'correct' || masteredSteps.includes(currentChallengeIndex)) ? <CheckCircle size={24} className="feedback-icon" style={{ color: 'var(--green)', flexShrink: 0 }} /> : <AlertTriangle size={24} className="feedback-icon" style={{ color: 'var(--red)', flexShrink: 0 }} />}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {(challengeResult === 'correct' || masteredSteps.includes(currentChallengeIndex)) ? "Excellent!" : "Not quite!"}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {masteredSteps.includes(currentChallengeIndex) || challengeResult === 'correct'
                        ? activeChallenges[currentChallengeIndex]?.options?.find(opt => opt?.correct)?.feedback
                        : "Review the question carefully and try again."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mastery-nav-controls" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <button 
                className="btn" 
                onClick={prevStep}
                disabled={currentChallengeIndex === 0}
                style={{ opacity: currentChallengeIndex === 0 ? 0.3 : 1, cursor: currentChallengeIndex === 0 ? 'not-allowed' : 'pointer' }}
              >
                ← Previous
              </button>
              <button 
                className="btn btn-primary" 
                onClick={nextStep}
                disabled={currentChallengeIndex >= activeChallenges.length - 1}
                style={{ opacity: currentChallengeIndex >= activeChallenges.length - 1 ? 0.3 : 1, cursor: currentChallengeIndex >= activeChallenges.length - 1 ? 'not-allowed' : 'pointer' }}
              >
                Next Step →
              </button>
            </div>

            {/* XP Surge Nodes */}
            {xpFloats.map(f => (
              <div 
                key={f.id} 
                className="xp-float-node"
                style={{ left: f.x, top: f.y }}
              >
                +{f.amount} XP
              </div>
            ))}

            {/* Stage Mastery Overlay */}
            {showStageComplete && (
              <div className="stage-mastery-overlay">
                <div className="mastery-mini-card" style={{ background: 'var(--bg-elevated)', padding: '32px', borderRadius: '16px', border: '1px solid var(--blue)', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)', textAlign: 'center' }}>
                  <div className="mastery-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-primary)' }}>Mission Mastered!</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You have successfully completed the {details.title} challenges. Your civic wisdom grows!</p>
                  <div className="mastery-actions" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button className="btn" onClick={() => setShowStageComplete(false)}>Stay Here</button>
                    <button className="btn btn-primary" onClick={startNextMission}>Next Mission →</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (() => {
          const rw = REAL_WORLD_DATA[stageId] || REAL_WORLD_DATA.announcement;
          return (
            <div className="tab-data">
              <h3 className="tab-heading" style={{ marginBottom: '6px' }}>
                Real World · {stageTitle}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '28px' }}>
                Actual data, landmark rulings, and verified facts from Indian elections.
              </p>

              {/* Stats grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '16px', marginBottom: '32px'
              }}>
                {rw.stats.map((stat, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                    borderRadius: '16px', padding: '20px 16px', textAlign: 'center',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--blue)', lineHeight: 1.1, marginBottom: '6px' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Case studies */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Newspaper size={16} style={{ color: 'var(--gold)' }} />
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Landmark Cases & Notable Events
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                {rw.cases.map((c, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                    borderRadius: '16px', padding: '20px 22px',
                    borderLeft: '3px solid var(--blue)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <span style={{ fontSize: '26px', flexShrink: 0, marginTop: '2px' }}>{c.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>{c.title}</span>
                          <span style={{
                            fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)',
                            background: 'var(--bg-surface)', padding: '3px 10px', borderRadius: '99px',
                            border: '1px solid var(--border-subtle)', whiteSpace: 'nowrap',
                          }}>{c.date}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.65', margin: '0 0 12px' }}>
                          {c.body}
                        </p>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                          borderRadius: '8px', padding: '6px 12px',
                        }}>
                          <CheckCircle size={13} style={{ color: 'var(--success)', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success)' }}>{c.verdict}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* External link */}
              <a
                href={rw.link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'var(--blue)', color: '#fff',
                  padding: '12px 22px', borderRadius: '12px',
                  fontSize: '14px', fontWeight: '600', textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                <ExternalLink size={15} />
                {rw.link.label}
              </a>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default React.memo(StageCard);


