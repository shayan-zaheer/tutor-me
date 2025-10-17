import { useState, useEffect } from 'react';
import { Dimensions, PixelRatio } from 'react-native';

interface ScreenDimensions {
  width: number;
  height: number;
}

interface ResponsiveConfig {
  isSmallScreen: boolean;
  isLargeScreen: boolean;
  isLandscape: boolean;
  containerPadding: number;
  headerMargin: number;
  formMargin: number;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  spacing: {
    input: string;
    button: string;
  };
}

export const useResponsiveDesign = (): ResponsiveConfig => {
  const [screenData, setScreenData] = useState<ScreenDimensions>(
    Dimensions.get('window')
  );

  useEffect(() => {
    const onChange = (result: { window: ScreenDimensions }) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const { width, height } = screenData;
  const isSmallScreen = width < 375;
  const isLargeScreen = width >= 414;
  const isLandscape = width > height;

  const containerPadding = isSmallScreen ? 16 : isLargeScreen ? 32 : 24;
  const headerMargin = isSmallScreen ? 24 : 32;
  const formMargin = isSmallScreen ? 16 : 24;

  const fontSize = {
    xs: isSmallScreen ? 'text-xs' : 'text-sm',
    sm: isSmallScreen ? 'text-sm' : 'text-base',
    base: isSmallScreen ? 'text-base' : isLargeScreen ? 'text-lg' : 'text-base',
    lg: isSmallScreen ? 'text-lg' : isLargeScreen ? 'text-xl' : 'text-lg',
    xl: isSmallScreen ? 'text-lg' : isLargeScreen ? 'text-2xl' : 'text-xl',
    '2xl': isSmallScreen ? 'text-xl' : isLargeScreen ? 'text-3xl' : 'text-2xl',
    '3xl': isSmallScreen ? 'text-3xl' : isLargeScreen ? 'text-4xl' : 'text-3xl',
    '4xl': isSmallScreen ? 'text-3xl' : isLargeScreen ? 'text-5xl' : 'text-4xl',
  };

  const spacing = {
    input: isSmallScreen
      ? 'p-3 text-sm'
      : isLargeScreen
      ? 'px-5 py-4 text-lg'
      : 'px-4 py-3 text-base',
    button: isSmallScreen ? 'py-3 px-4' : isLargeScreen ? 'py-5 px-6' : 'py-4 px-5',
  };

  return {
    isSmallScreen,
    isLargeScreen,
    isLandscape,
    containerPadding,
    headerMargin,
    formMargin,
    fontSize,
    spacing,
  };
};

export const getScrollViewStyle = (
  isLandscape: boolean,
  containerPadding: number
) => ({
  flexGrow: 1,
  justifyContent: isLandscape ? 'flex-start' : 'center' as 'flex-start' | 'center',
  padding: containerPadding,
});

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const isSmallScreen = screenWidth < 375; // iPhone SE
export const isMediumScreen = screenWidth >= 375 && screenWidth < 414; // iPhone 12/13/14
export const isLargeScreen = screenWidth >= 414; // iPhone Pro Max, tablets

export const pixelRatio = PixelRatio.get();

export const wp = (percentage: number) => {
  return (screenWidth * percentage) / 100;
};

export const hp = (percentage: number) => {
  return (screenHeight * percentage) / 100;
};

export const getFontSize = (baseSize: number) => {
  if (isSmallScreen) return baseSize * 0.9;
  if (isLargeScreen) return baseSize * 1.1;
  return baseSize;
};

export const getSpacing = (baseSpacing: number) => {
  if (isSmallScreen) return baseSpacing * 0.8;
  if (isLargeScreen) return baseSpacing * 1.2;
  return baseSpacing;
};

console.log('Screen Info:', {
  width: screenWidth,
  height: screenHeight,
  pixelRatio,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen
});