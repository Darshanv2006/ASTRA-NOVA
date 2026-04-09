import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("React ErrorBoundary Caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ backgroundColor: 'black', color: '#ff4d4d', padding: '30px', fontFamily: 'monospace', height: '100vh', overflow: 'auto', zIndex: 9999, position: 'relative' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Application Crashed 🚀💥</h2>
          <p style={{ color: 'white', marginBottom: '20px' }}>Please show this error message to the AI assistant to fix it:</p>
          <pre style={{ backgroundColor: '#222', padding: '15px', borderRadius: '8px', marginBottom: '15px', whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <pre style={{ backgroundColor: '#111', padding: '15px', borderRadius: '8px', color: '#aaa', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
