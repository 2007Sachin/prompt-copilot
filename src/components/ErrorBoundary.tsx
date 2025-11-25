import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // Example: Sentry.captureException(error);

        this.setState({
            error,
            errorInfo
        });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-8 text-center">
                        <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <AlertTriangle className="text-red-400" size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-[#E0E0E0] mb-2">
                            Oops! Something went wrong
                        </h1>

                        <p className="text-[#A0A0A0] mb-6">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <details className="text-left mb-6 bg-[#252525] p-4 rounded-lg">
                                <summary className="text-[#BB86FC] cursor-pointer mb-2 font-medium">
                                    Error Details (Dev Mode)
                                </summary>
                                <pre className="text-xs text-red-400 overflow-auto max-h-48">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && '\n\n'}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="bg-[#BB86FC] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#a66af5] transition-colors flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw size={18} />
                            Refresh Page
                        </button>

                        <p className="text-xs text-[#666] mt-6">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
