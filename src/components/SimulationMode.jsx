import React, { useState } from 'react';
import { GA_EVENTS } from '../utils/constants.js';

const STAGES = {
  START: 0,
  ISSUE: 1,
  STRATEGY: 2,
  BUDGET: 3,
  RESULT: 4
};

export default function SimulationMode() {
  const [stage, setStage] = useState(STAGES.START);
  const [choices, setChoices] = useState({ issue: '', strategy: '', budget: '' });

  const handleChoice = (field, value, nextStage) => {
    setChoices(prev => ({ ...prev, [field]: value }));
    setStage(nextStage);
  };

  const calculateResult = () => {
    // Simple logic for the simulation outcome
    let score = 0;
    if (choices.issue === 'healthcare') score += 10;
    else if (choices.issue === 'education') score += 8;
    else score += 5;

    if (choices.strategy === 'door_to_door') score += 10; // High effort
    else if (choices.strategy === 'digital') score += 7;
    else score += 4;

    if (choices.budget === 'volunteers') score += 10; // Community building
    else if (choices.budget === 'ads') score += 6;
    else score += 3;

    if (score >= 25) return { won: true, message: "You won! Your grassroots campaign and focus on critical issues resonated with the voters." };
    if (score >= 18) return { won: false, message: "Close, but you lost! You had good ideas, but needed more community engagement." };
    return { won: false, message: "You lost! Your campaign lacked a clear message and direct voter connection." };
  };

  const restart = () => {
    setStage(STAGES.START);
    setChoices({ issue: '', strategy: '', budget: '' });
  };

  return (
    <div className="tab-pane">
      <header className="tab-header">
        <h1>Democracy Simulator</h1>
        <p>Step into the shoes of a candidate and see if you can win the election.</p>
      </header>

      <div className="simulation-container" style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '24px' }}>
        
        {stage === STAGES.START && (
          <div className="sim-step" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Ready to run for office?</h2>
            <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
              You are about to file your nomination. The decisions you make in your campaign will determine whether you win or lose.
            </p>
            <button className="btn primary" onClick={() => setStage(STAGES.ISSUE)}>
              File Nomination
            </button>
          </div>
        )}

        {stage === STAGES.ISSUE && (
          <div className="sim-step">
            <h2>Step 1: Pick your core issue</h2>
            <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>What will be the main focus of your campaign?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn outline" onClick={() => handleChoice('issue', 'healthcare', STAGES.STRATEGY)}>🏥 Better Healthcare Facilities</button>
              <button className="btn outline" onClick={() => handleChoice('issue', 'education', STAGES.STRATEGY)}>📚 Improving Local Schools</button>
              <button className="btn outline" onClick={() => handleChoice('issue', 'infrastructure', STAGES.STRATEGY)}>🛣️ Repairing Roads & Bridges</button>
            </div>
          </div>
        )}

        {stage === STAGES.STRATEGY && (
          <div className="sim-step">
            <h2>Step 2: Campaign Strategy</h2>
            <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>How will you reach the voters?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn outline" onClick={() => handleChoice('strategy', 'door_to_door', STAGES.BUDGET)}>🚶 Door-to-Door Canvassing</button>
              <button className="btn outline" onClick={() => handleChoice('strategy', 'digital', STAGES.BUDGET)}>📱 Viral Social Media Ads</button>
              <button className="btn outline" onClick={() => handleChoice('strategy', 'rallies', STAGES.BUDGET)}>🎤 Large Public Rallies</button>
            </div>
          </div>
        )}

        {stage === STAGES.BUDGET && (
          <div className="sim-step">
            <h2>Step 3: Budget Allocation</h2>
            <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Where will you spend the majority of your campaign funds?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn outline" onClick={() => handleChoice('budget', 'volunteers', STAGES.RESULT)}>🤝 Training Local Volunteers</button>
              <button className="btn outline" onClick={() => handleChoice('budget', 'ads', STAGES.RESULT)}>📺 TV and Radio Advertising</button>
              <button className="btn outline" onClick={() => handleChoice('budget', 'events', STAGES.RESULT)}>🎪 Fancy Campaign Events</button>
            </div>
          </div>
        )}

        {stage === STAGES.RESULT && (
          <div className="sim-step" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {calculateResult().won ? '🏆' : '❌'}
            </div>
            <h2>Election Results Are In!</h2>
            <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: 'bold' }}>
              {calculateResult().message}
            </p>
            <div style={{ marginTop: '32px' }}>
              <button className="btn primary outline" onClick={restart}>Try Again</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
