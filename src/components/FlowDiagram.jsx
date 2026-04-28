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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative', paddingLeft: '16px', margin: '24px 0' }}>
      {/* Vertical Timeline Line */}
      <div style={{ position: 'absolute', left: '47px', top: '30px', bottom: '30px', width: '2px', background: 'linear-gradient(to bottom, var(--blue), transparent)', opacity: 0.4 }} />
      
      {nodes.map((node) => (
        <div key={node.id} style={{ display: 'flex', gap: '24px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          
          {/* Icon Bubble */}
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            width: '64px', height: '64px', 
            background: 'var(--bg-surface)',
            borderRadius: '50%', fontSize: '28px', flexShrink: 0,
            border: '2px solid var(--blue)', boxShadow: '0 0 20px var(--blue-glow)',
            color: 'var(--blue)'
          }}>
            {NODE_ICON_MAP[node.id] || node.icon}
          </div>
          
          {/* Content Card */}
          <div style={{ 
            flex: 1,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-premium)',
            transition: 'transform 0.3s ease, border-color 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(8px)';
            e.currentTarget.style.borderColor = 'var(--blue)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'var(--text-primary)', fontWeight: '700', letterSpacing: '0.5px' }}>{node.label}</h4>
            <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{node.detail}</p>
            
            {node.fact && (
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px dashed var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ fontSize: '18px', background: 'var(--blue-subtle)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>💡</div>
                <span style={{ fontSize: '14px', color: 'var(--blue)', fontWeight: '600', lineHeight: '1.4' }}>{node.fact}</span>
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
