import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Paper, Typography, Box } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Paper 
          sx={{ 
            height: '100%', 
            bgcolor: '#121212', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 2
          }}
        >
          <Box textAlign="center">
            <Typography variant="h6" color="error">
              Something went wrong
            </Typography>
            <Typography variant="body2" color="gray">
              There was an error loading this component.
            </Typography>
            {this.state.error && (
              <Typography variant="caption" color="gray" sx={{ mt: 2, display: 'block' }}>
                {this.state.error.toString()}
              </Typography>
            )}
          </Box>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
