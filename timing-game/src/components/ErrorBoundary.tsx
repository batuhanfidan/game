import { Component, type ErrorInfo, type ReactNode } from "react"; // Düzeltme 1 & 2
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-neutral-900 rounded-2xl p-8 border border-red-500/30 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-500/10 p-4 rounded-full mb-4">
                <AlertTriangle size={48} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Bir Hata Oluştu</h1>
              <p className="text-gray-400 mb-6">
                Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yeniden
                yükleyin.
              </p>

              {/* Düzeltme 3: process.env.NODE_ENV yerine import.meta.env.DEV kullanıldı */}
              {import.meta.env.DEV && this.state.error && (
                <details className="w-full mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300 mb-2">
                    Hata Detayları (Sadece Development)
                  </summary>
                  <pre className="text-xs bg-black/50 p-3 rounded overflow-auto max-h-40 text-red-400">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-white hover:bg-gray-100 text-black py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Yeniden Yükle
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Home size={18} /> Ana Sayfa
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
