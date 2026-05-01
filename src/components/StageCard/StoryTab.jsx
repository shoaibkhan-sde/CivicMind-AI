import React from 'react';
import FlowDiagram from '../FlowDiagram';

export default function StoryTab({ stageTitle, story, facts }) {
  return (
    <div className="tab-story">
      <h3 className="tab-heading-story">The Story of {stageTitle}</h3>
      <FlowDiagram nodes={(story || []).map((node, i) => ({
        ...node,
        fact: (facts || [])[i]
      }))} />
    </div>
  );
}
