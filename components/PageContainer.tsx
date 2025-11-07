import React from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StatusBar,
} from 'react-native';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  safeAreaClassName?: string;
  keyboardAvoidingClassName?: string;
  keyboardBehavior?: 'padding' | 'height' | 'position';
  keyboardVerticalOffset?: number;
  enableKeyboardAvoiding?: boolean;
  backgroundColor?: string;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = 'flex-1',
  style,
  safeAreaClassName,
  keyboardAvoidingClassName,
  keyboardBehavior = 'padding',
  keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 100,
  enableKeyboardAvoiding = true,
  backgroundColor = '#f8fafc',
  statusBarStyle = 'dark-content',
}) => {
  const safeAreaClasses = safeAreaClassName || `flex-1 bg-[${backgroundColor}]`;
  const keyboardAvoidingClasses = keyboardAvoidingClassName || 'flex-1';

  return (
    <>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      <SafeAreaView className={safeAreaClasses} style={style}>
        {enableKeyboardAvoiding ? (
          <KeyboardAvoidingView
            behavior={keyboardBehavior}
            keyboardVerticalOffset={keyboardVerticalOffset}
            className={`${keyboardAvoidingClasses} ${className}`}
          >
            {children}
          </KeyboardAvoidingView>
        ) : (
          <>{children}</>
        )}
      </SafeAreaView>
    </>
  );
};

export default PageContainer;