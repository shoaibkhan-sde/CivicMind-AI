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
import { BookOpen, AlertCircle, Target, Globe, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

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

        {activeTab === 'data' && (
          <div className="tab-data">
            <h3 className="tab-heading">Live Election Context</h3>
            <div className="data-placeholder">
              <div className="data-icon"><MapPin size={32} className="icon-blue" /></div>
              <p>Fetching real-time data from Indian Election Commission APIs...</p>
              <div className="data-shimmer" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(StageCard);


