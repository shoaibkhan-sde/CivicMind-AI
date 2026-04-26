/**
 * @fileoverview FlowDiagram — Pure CSS visualization for election processes.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { 
  FileSignature, 
  Send, 
  Search, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

const NODE_ICON_MAP = {
  fill: <FileSignature size={20} />,
  submit: <Send size={20} />,
  review: <Search size={20} />,
  accept: <CheckCircle2 size={20} />,
};

/**
 * Renders a horizontal chain of process nodes.
 * @param {Object} props
 * @param {Array} props.nodes - Array of { icon, label, detail }
 */
export default function FlowDiagram({ nodes }) {
  return (
    <div className="flow-container">
      {nodes.map((node, index) => (
        <React.Fragment key={node.id}>
          <div className="flow-node" title={node.detail}>
            <span className="flow-icon">{NODE_ICON_MAP[node.id] || node.icon}</span>
            <span className="flow-label">{node.label}</span>
          </div>
          {index < nodes.length - 1 && (
            <div className="flow-arrow"><ArrowRight size={14} className="icon-muted" /></div>
          )}
        </React.Fragment>
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
