import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-primary)' }}>
          <div className="text-center max-w-md">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              ⚠️
            </div>
            <h2 className="font-display font-bold text-2xl text-white mb-3">Something went wrong</h2>
            <p className="text-slate-500 text-sm mb-2 font-mono bg-black/30 px-4 py-2 rounded-xl">
              {this.state.error?.message || 'Unexpected error'}
            </p>
            <p className="text-slate-600 text-sm mb-8">
              Try refreshing the page. If the problem persists, please report it.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-2xl text-sm font-body font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
              >
                Refresh page
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false })}
                className="px-6 py-2.5 rounded-2xl text-sm font-body text-slate-300 hover:text-white transition-colors"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
