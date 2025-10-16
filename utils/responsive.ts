import { Dimensions, PixelRatio } from 'react-native';

// Get device dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Screen size categories
export const isSmallScreen = screenWidth < 375; // iPhone SE
export const isMediumScreen = screenWidth >= 375 && screenWidth < 414; // iPhone 12/13/14
export const isLargeScreen = screenWidth >= 414; // iPhone Pro Max, tablets

// Screen density
export const pixelRatio = PixelRatio.get();

// Responsive functions
export const wp = (percentage: number) => {
  return (screenWidth * percentage) / 100;
};

export const hp = (percentage: number) => {
  return (screenHeight * percentage) / 100;
};

// Font scaling based on screen size
export const getFontSize = (baseSize: number) => {
  if (isSmallScreen) return baseSize * 0.9;
  if (isLargeScreen) return baseSize * 1.1;
  return baseSize;
};

// Responsive spacing
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