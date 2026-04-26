/**
 * @fileoverview StageCard — Detailed content for an election stage.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FlowDiagram from './FlowDiagram';
import { STAGE_DETAILS } from '../utils/constants';
import useXP from '../hooks/useXP';
import useJourney from '../hooks/useJourney';
import { BookOpen, AlertCircle, Target, Globe, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

/**
 * Renders the 4-tab immersive experience for a specific stage.
 */
export default function StageCard({ stageId }) {
  const [activeTab, setActiveTab] = useState('story');
  const [challengeResult, setChallengeResult] = useState(null);
  const [showStageComplete, setShowStageComplete] = useState(false);
  const [xpFloats, setXpFloats] = useState([]); // [{ id, x, y, amount }]
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  
  const { addXP } = useXP();
  const { stageProgress, updateStageProgress, completeStage } = useJourney();

  const details = STAGE_DETAILS[stageId] || STAGE_DETAILS.nomination;
  const currentProgress = stageProgress[stageId] || { currentIndex: 0, masteredSteps: [] };
  
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
        amount: 10 // Each step is 10XP
      };
      setXpFloats(prev => [...prev, newFloat]);
      addXP(10);
      setChallengeResult('correct');
      setSelectedOptionId(e.currentTarget.getAttribute('data-opt-id'));
      
      const newMastered = [...masteredSteps, currentChallengeIndex];
      updateStageProgress(stageId, { masteredSteps: newMastered });

      const isLastChallenge = currentChallengeIndex >= (details.challenges?.length - 1 || 0);
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
    if (currentChallengeIndex < (details.challenges?.length - 1 || 0)) {
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
      // 🔥 The map will auto-switch because JourneyMap listens to currentStage
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
            <h3 className="tab-heading">The Path to Candidacy</h3>
            <FlowDiagram nodes={details.story} />
            <div className="fact-chips">
              {details.facts.map((f, i) => (
                <div key={i} className="fact-chip">{f}</div>
              ))}
            </div>
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
              <div className="mastery-steps">Step {currentChallengeIndex + 1} of {details.challenges?.length || 1}</div>
            </div>
            
            <div className="mastery-progress-bar">
              <div 
                className="mastery-progress-fill" 
                style={{ width: `${((currentChallengeIndex + (challengeResult === 'correct' ? 1 : 0)) / (Math.max(details.challenges?.length || 1, 1))) * 100}%` }}
              />
            </div>

            <p className="challenge-q">
              {details.challenges ? details.challenges[currentChallengeIndex]?.question : details.challenge?.question}
            </p>

            <div className="choice-grid">
              {(details.challenges?.[currentChallengeIndex]?.options || details.challenge?.options || []).map((opt) => {
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
                    <div className="choice-info">{opt.text}</div>
                  </button>
                );
              })}
            </div>

            {(challengeResult || masteredSteps.includes(currentChallengeIndex)) && (
              <div className={`challenge-feedback-premium ${masteredSteps.includes(currentChallengeIndex) ? 'correct' : challengeResult}`}>
                <div className="feedback-content">
                  {(challengeResult === 'correct' || masteredSteps.includes(currentChallengeIndex)) ? <CheckCircle size={18} className="feedback-icon" /> : <AlertTriangle size={18} className="feedback-icon" />}
                  <span>
                    {masteredSteps.includes(currentChallengeIndex) || challengeResult === 'correct'
                      ? (details.challenges?.[currentChallengeIndex]?.options || details.challenge?.options || [])?.find(opt => opt?.correct)?.feedback
                      : "Not quite! Keep exploring the details above."}
                  </span>
                </div>
              </div>
            )}

            <div className="mastery-nav-controls">
              <button 
                className="mastery-nav-btn" 
                onClick={prevStep}
                disabled={currentChallengeIndex === 0}
              >
                ← Previous
              </button>
              <button 
                className="mastery-nav-btn next-primary" 
                onClick={nextStep}
                disabled={currentChallengeIndex === (details.challenges?.length - 1)}
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
                <div className="mastery-mini-card">
                  <div className="mastery-icon">🏆</div>
                  <h3>Mission Mastered!</h3>
                  <p>You have successfully completed the {details.title} stage. Your civic wisdom grows!</p>
                  <div className="mastery-actions">
                    <button className="mastery-btn ghost" onClick={() => setShowStageComplete(false)}>Stay Here</button>
                    <button className="mastery-btn" onClick={startNextMission}>Next Mission →</button>
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

StageCard.propTypes = {
  stageId: PropTypes.string.isRequired,
};
