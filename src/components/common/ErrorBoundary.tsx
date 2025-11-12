import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Card } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card style={{ margin: '24px', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          <Alert
            message="Something went wrong"
            description={
              <div>
                <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReset}
                  style={{ marginTop: 16 }}
                >
                  Reload Page
                </Button>
              </div>
            }
            type="error"
            showIcon
          />
        </Card>
      );
    }

    return this.props.children;
  }
}

