import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualizează state-ul pentru a afișa UI-ul de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Salvează detaliile erorii pentru debugging
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Poți loga eroarea la un serviciu de monitoring
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Icon */}
            <div className="mb-6">
              <svg 
                className="w-16 h-16 text-red-400 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Ceva nu a mers bine
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              A apărut o eroare neașteptată în aplicație. Ne cerem scuze pentru neplăcerea creată.
            </p>

            {/* Error details (doar în development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  Detalii eroare (development)
                </summary>
                <div className="text-xs text-gray-600 font-mono bg-white rounded p-3 overflow-auto max-h-32">
                  <div className="text-red-600 font-bold mb-2">
                    {this.state.error && this.state.error.toString()}
                  </div>
                  {this.state.errorInfo.componentStack}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                🔄 Reîncarcă pagina
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                🏠 Mergi la pagina principală
              </button>
            </div>

            {/* Support info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Dacă problema persistă, contactează-ne la{' '}
                <a 
                  href="mailto:contact@handmadestore.ro" 
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  contact@handmadestore.ro
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;