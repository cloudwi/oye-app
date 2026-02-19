import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BrandColors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { Sentry } from '@/services/sentry';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>!</Text>
          <Text style={styles.title}>문제가 발생했습니다</Text>
          <Text style={styles.message}>
            앱에서 예기치 않은 오류가 발생했습니다.{'\n'}
            다시 시도해주세요.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: '#0F0F0F',
  },
  icon: {
    fontSize: 48,
    fontWeight: '700',
    color: BrandColors.error,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BrandColors.error + '15',
    textAlign: 'center',
    lineHeight: 72,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSizes.md,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  button: {
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  buttonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
