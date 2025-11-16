import { Component, ReactNode } from 'react';
import type { ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
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
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f1f5f9',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            maxWidth: '600px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              💥
            </div>
            <h2 style={{ color: '#ef4444', marginBottom: '15px' }}>应用出错</h2>
            <p style={{ color: '#94a3b8', marginBottom: '10px' }}>
              组件渲染时发生错误：
            </p>
            <pre style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '15px',
              borderRadius: '8px',
              color: '#fecaca',
              fontSize: '12px',
              textAlign: 'left',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {this.state.error?.message || '未知错误'}
            </pre>
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}
              >
                🔄 重新加载
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
