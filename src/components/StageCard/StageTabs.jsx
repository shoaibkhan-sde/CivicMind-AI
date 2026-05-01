import React from 'react';
import { BookOpen, AlertCircle, Target, Globe } from 'lucide-react';

export default function StageTabs({ activeTab, onTabChange }) {
  return (
    <div className="stage-tabs">
      <button 
        className={`stage-tab ${activeTab === 'story' ? 'active' : ''}`} 
        onClick={() => onTabChange('story')}
      >
        <BookOpen size={16} /> Visual Story
      </button>
      <button 
        className={`stage-tab ${activeTab === 'mistakes' ? 'active' : ''}`} 
        onClick={() => onTabChange('mistakes')}
      >
        <AlertCircle size={16} /> Mistakes
      </button>
      <button 
        className={`stage-tab ${activeTab === 'challenge' ? 'active' : ''}`} 
        onClick={() => onTabChange('challenge')}
      >
        <Target size={16} /> Challenge
      </button>
      <button 
        className={`stage-tab ${activeTab === 'data' ? 'active' : ''}`} 
        onClick={() => onTabChange('data')}
      >
        <Globe size={16} /> Real World
      </button>
    </div>
  );
}
