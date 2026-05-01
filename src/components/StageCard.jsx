/**
 * @fileoverview StageCard — Lean wrapper orchestrating modular election stage content.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { STAGE_DETAILS } from '../utils/constants';
import { QUESTION_BANK } from '../utils/quiz_bank';
import useXP from '../hooks/useXP';
import useJourney from '../hooks/useJourney';

// Sub-components
import StageTabs from './StageCard/StageTabs';
import StoryTab from './StageCard/StoryTab';
import MistakesTab from './StageCard/MistakesTab';
import ChallengeTab from './StageCard/ChallengeTab';
import DataTab from './StageCard/DataTab';

/**
 * Main StageCard component — Manages state and orchestrates views.
 * @param {Object} props
 * @param {string} props.stageId
 */
function StageCard({ stageId }) {
  const [activeTab, setActiveTab] = useState('story');
  const [challengeResult, setChallengeResult] = useState(null);
  const [showStageComplete, setShowStageComplete] = useState(false);
  const [xpFloats, setXpFloats] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  
  const { addXP } = useXP();
  const { stageProgress, updateStageProgress, completeStage, allStages } = useJourney();

  const details = STAGE_DETAILS[stageId] || STAGE_DETAILS.announcement;
  const currentStageMeta = allStages?.find(s => s.id === stageId) || {};
  const stageTitle = currentStageMeta.title || (stageId.charAt(0).toUpperCase() + stageId.slice(1));
  const currentProgress = stageProgress[stageId] || { currentIndex: 0, masteredSteps: [] };
  
  const activeChallenges = useMemo(() => {
    const stageQuestions = QUESTION_BANK.filter(q => q.stage === stageId).slice(0, 5);
    return stageQuestions.length > 0 ? stageQuestions.map((q, index) => ({
      question: q.question,
      options: q.options.map((optText, i) => ({
        id: String.fromCharCode(65 + i),
        text: optText,
        correct: i === q.correctIndex,
        feedback: q.explanation
      }))
    })) : [];
  }, [stageId]);

  const currentChallengeIndex = (typeof currentProgress.currentIndex === 'number' && !isNaN(currentProgress.currentIndex)) 
    ? currentProgress.currentIndex : 0;
    
  const masteredSteps = Array.isArray(currentProgress.masteredSteps) ? currentProgress.masteredSteps : [];

  useEffect(() => {
    setChallengeResult(null);
    setXpFloats([]);
    setActiveTab('story');
    setSelectedOptionId(null);
    setShowStageComplete(false);
  }, [stageId]);

  const handleChallenge = useCallback((correct, e) => {
    if (masteredSteps.includes(currentChallengeIndex)) return;

    if (correct && challengeResult !== 'correct') {
      const rect = e.currentTarget.getBoundingClientRect();
      const newFloat = { id: Date.now(), x: e.clientX || (rect.left + rect.width / 2), y: e.clientY || rect.top, amount: 20 };
      setXpFloats(prev => [...prev, newFloat]);
      addXP(20);
      setChallengeResult('correct');
      setSelectedOptionId(e.currentTarget.getAttribute('data-opt-id'));
      
      const newMastered = [...masteredSteps, currentChallengeIndex];
      updateStageProgress(stageId, { masteredSteps: newMastered });

      if (currentChallengeIndex >= (activeChallenges.length - 1)) {
        completeStage(stageId);
        if (stageId === 'results') {
          window.dispatchEvent(new CustomEvent('civic_victory'));
        } else {
          setShowStageComplete(true);
        }
      }
      setTimeout(() => setXpFloats(prev => prev.filter(f => f.id !== newFloat.id)), 1200);
    } else if (!correct) {
      setSelectedOptionId(e.currentTarget.getAttribute('data-opt-id'));
      setChallengeResult('wrong');
      setTimeout(() => { setChallengeResult(null); setSelectedOptionId(null); }, 3000);
    }
  }, [currentChallengeIndex, masteredSteps, challengeResult, activeChallenges.length, stageId, addXP, updateStageProgress, completeStage]);

  return (
    <div className="stage-card">
      <StageTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="stage-content-body">
        {activeTab === 'story' && <StoryTab stageTitle={stageTitle} story={details.story} facts={details.facts} />}
        {activeTab === 'mistakes' && <MistakesTab mistakes={details.mistakes} />}
        {activeTab === 'challenge' && (
          <ChallengeTab 
            stageId={stageId}
            activeChallenges={activeChallenges}
            currentChallengeIndex={currentChallengeIndex}
            challengeResult={challengeResult}
            masteredSteps={masteredSteps}
            selectedOptionId={selectedOptionId}
            onChallenge={handleChallenge}
            onNext={() => updateStageProgress(stageId, { currentIndex: currentChallengeIndex + 1 })}
            onPrev={() => updateStageProgress(stageId, { currentIndex: currentChallengeIndex - 1 })}
            xpFloats={xpFloats}
            showStageComplete={showStageComplete}
            onStay={() => setShowStageComplete(false)}
            onNextMission={() => setShowStageComplete(false)}
            details={details}
          />
        )}
        {activeTab === 'data' && <DataTab stageId={stageId} stageTitle={stageTitle} />}
      </div>
    </div>
  );
}

export default React.memo(StageCard);
