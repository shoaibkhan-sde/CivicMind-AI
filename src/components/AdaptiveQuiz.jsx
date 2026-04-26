import React, { useState, useCallback } from 'react';
import useJourney from '../hooks/useJourney';
import useXP from '../hooks/useXP';
import useAdaptiveQuizAI from '../hooks/useAdaptiveQuizAI';

/**
 * Renders the AI-powered adaptive quiz experience.
 * Now generates unlimited, unique questions using Gemini.
 */
export default function AdaptiveQuiz() {
  const { currentStage, completeStage } = useJourney();
  const { addXP, updateStreak } = useXP();
  const { fetchQuestion, isLoading: isAIThinking } = useAdaptiveQuizAI();
  
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [missionActive, setMissionActive] = useState(false);

  // ── Mission Initialization ──
  const startMission = useCallback(async () => {
    setQuestions([]);
    setCurrentIdx(0);
    setScore(0);
    setShowResult(false);
    setMissionActive(true);
    
    const q = await fetchQuestion();
    if (q) setQuestions([q]);
  }, [fetchQuestion]);

  const nextQuestion = useCallback(async () => {
    if (currentIdx < 4) { // 5 questions per mission
      const q = await fetchQuestion();
      if (q) {
        setQuestions(prev => [...prev, q]);
        setCurrentIdx(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      }
    } else {
      setShowResult(true);
      completeStage(currentStage.id);
      updateStreak();
    }
  }, [currentIdx, fetchQuestion, currentStage.id, completeStage, updateStreak]);

  const handleAnswer = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    
    const isCorrect = idx === questions[currentIdx].correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      addXP(questions[currentIdx].xpReward || 50);
    }
  };

  const handleReset = () => {
    setMissionActive(false);
    setShowResult(false);
  };

  // ── Render States ─────────────────────────────────────────────────────────

  if (!missionActive) {
    return (
      <div className="quiz-welcome">
        <div className="sage-avatar-large">🦉</div>
        <h2>Ready for a Mission?</h2>
        <p>I will generate 5 unique challenges about the <strong>{currentStage.title}</strong> stage just for you.</p>
        <button className="badge save" onClick={startMission} style={{ margin: '20px auto', display: 'block' }}>
          🚀 Start AI Mission
        </button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="quiz-result-card">
        <div className="result-ring">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" className="ring-bg" />
            <circle 
              cx="50" cy="50" r="45" 
              className="ring-fill" 
              style={{ strokeDasharray: `${(score / 5) * 283} 283` }}
            />
          </svg>
          <div className="result-score">{Math.round((score / 5) * 100)}%</div>
        </div>
        <h3>Mission Complete!</h3>
        <p>You mastered {score} out of 5 AI challenges. 🦉</p>
        <button className="badge save" onClick={handleReset} style={{ margin: '20px auto', display: 'block' }}>Try Another Mission</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  if (!currentQuestion || isAIThinking) {
    return (
      <div className="quiz-loading" style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner" style={{ fontSize: '48px', marginBottom: '20px' }}>🦉</div>
        <p>Sage is crafting your next unique challenge...</p>
      </div>
    );
  }

  return (
    <div className="adaptive-quiz">
      <div className="quiz-header">
        <span className="quiz-difficulty">{currentQuestion.difficulty || 'Mission'}</span>
        <span className="quiz-progress">Challenge {currentIdx + 1} of 5</span>
      </div>

      <h2 className="quiz-question">{currentQuestion.question}</h2>

      <div className="quiz-options">
        {currentQuestion.options.map((option, idx) => {
          let stateClass = '';
          if (isAnswered) {
            if (idx === currentQuestion.correctIndex) stateClass = 'correct';
            else if (idx === selectedOption) stateClass = 'wrong';
          }

          return (
            <button
              key={idx}
              className={`quiz-option ${stateClass} ${selectedOption === idx ? 'selected' : ''}`}
              onClick={() => handleAnswer(idx)}
              disabled={isAnswered}
            >
              <span className="option-label">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text">{option}</span>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="quiz-explanation-bubble" style={{ marginTop: '32px' }}>
          <div className="sage-mini-icon">🦉</div>
          <p className="explanation-text">
            {selectedOption === currentQuestion.correctIndex 
              ? `Correct! ${currentQuestion.explanation}`
              : `Not quite. ${currentQuestion.wrongExplanations[selectedOption] || currentQuestion.explanation}`
            }
          </p>
          <button className="badge save" onClick={nextQuestion} style={{ marginTop: '20px' }}>
            {currentIdx < 4 ? 'Next Challenge →' : 'Finish Mission'}
          </button>
        </div>
      )}
    </div>
  );
}
