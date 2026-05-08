import { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen mesh-bg flex items-center justify-center px-4">
          <div className="tile p-10 max-w-md w-full flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm break-words">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <Button onClick={this.reset} className="rounded-2xl mt-5">
              <RotateCcw className="w-4 h-4" /> Retry
            </Button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
