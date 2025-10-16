import { Dimensions, PixelRatio } from 'react-native';

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