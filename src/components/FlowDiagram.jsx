/**
 * @fileoverview FlowDiagram — Premium animated timeline visualization for election processes.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { 
  FileSignature, 
  Send, 
  Search, 
  CheckCircle2 
} from 'lucide-react';

const NODE_ICON_MAP = {
  fill: <FileSignature size={24} />,
  submit: <Send size={24} />,
  review: <Search size={24} />,
  accept: <CheckCircle2 size={24} />,
};

/**
 * Renders a vertical, premium timeline of process nodes.
 * @param {Object} props
 * @param {Array} props.nodes - Array of { icon, label, detail }
 */
export default function FlowDiagram({ nodes }) {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="flow-timeline">
      {/* Vertical Timeline Line */}
      <div className="flow-line" />
      
      {nodes.map((node) => (
        <div key={node.id} className="flow-node-row">
          
          {/* Icon Bubble */}
          <div className="flow-icon-bubble">
            {NODE_ICON_MAP[node.id] || node.icon}
          </div>
          
          {/* Content Card */}
          <div className="flow-content-card">
            <h4 className="flow-node-title">{node.label}</h4>
            <p className="flow-node-desc">{node.detail}</p>
            
            {node.fact && (
              <div className="flow-node-fact">
                <div className="flow-fact-bulb">💡</div>
                <span className="flow-fact-text">{node.fact}</span>
              </div>
            )}
          </div>
          
        </div>
      ))}
    </div>
  );
}

FlowDiagram.propTypes = {
  nodes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      detail: PropTypes.string.isRequired,
    })
  ).isRequired,
};
