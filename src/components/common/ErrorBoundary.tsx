import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let displayMessage = "Something went wrong.";
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            displayMessage = `Firebase Permission Error: ${parsed.operationType} at ${parsed.path}. Please check your access rights.`;
          }
        }
      } catch {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 text-zinc-100 font-sans">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center border-vital-400/50">
            <h2 className="text-2xl font-bold mb-4 text-vital-400">System Alert</h2>
            <p className="text-zinc-400 mb-6">{displayMessage}</p>
            <button
              className="px-6 py-2 bg-zinc-100 text-zinc-950 rounded-full font-medium hover:bg-zinc-300 transition-colors"
              onClick={() => window.location.reload()}
            >
              Restart Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
