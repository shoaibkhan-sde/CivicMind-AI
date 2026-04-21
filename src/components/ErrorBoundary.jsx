/**
 * @fileoverview ErrorBoundary component — catches render errors per tab.
 * Displays a styled fallback card with a retry button instead of crashing
 * the entire application.
 */

import React from 'react';
import PropTypes from 'prop-types';
import logger from '../utils/logger.js';

/**
 * @typedef {Object} ErrorBoundaryProps
 * @property {React.ReactNode} children - Wrapped component tree
 * @property {React.ReactNode} [fallback] - Optional custom fallback UI
 */

/**
 * Class-based error boundary that wraps each major tab component.
 * Logs errors and renders a styled fallback instead of a white screen.
 *
 * @extends {React.Component<ErrorBoundaryProps, {hasError: boolean, errorMessage: string}>}
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
    this.handleRetry = this.handleRetry.bind(this);
  }

  /**
   * Update state so the next render shows the fallback UI.
   * @param {Error} error
   * @returns {{ hasError: true, errorMessage: string }}
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }

  /**
   * Log the error details for debugging.
   * @param {Error} error
   * @param {React.ErrorInfo} info
   */
  componentDidCatch(error, info) {
    logger.error('ErrorBoundary caught an error', { error, componentStack: info.componentStack });
  }

  /** Reset error state to allow re-render */
  handleRetry() {
    this.setState({ hasError: false, errorMessage: '' });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-card" role="alert" aria-live="assertive">
          <span className="error-boundary-icon" aria-hidden="true">⚠️</span>
          <h2 className="text-h3">Something went wrong</h2>
          <p className="text-body" style={{ color: 'var(--text-muted)', maxWidth: '380px' }}>
            {this.state.errorMessage || 'This section failed to load. Please try again.'}
          </p>
          <button
            className="btn btn-ghost"
            onClick={this.handleRetry}
            aria-label="Retry loading this section"
          >
            🔄 Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

ErrorBoundary.defaultProps = {
  fallback: null,
};

export default ErrorBoundary;
