import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import { useState } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const useTabGesture = (initialTab: 'upcoming' | 'completed' = 'upcoming') => {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed'>(initialTab);
  const translateX = useSharedValue(0);
  const currentTabIndex = useSharedValue(0);

  const switchToTab = (tab: 'upcoming' | 'completed') => {
    const toValue = tab === 'upcoming' ? 0 : -SCREEN_WIDTH;
    const tabIndex = tab === 'upcoming' ? 0 : 1;
    
    translateX.value = withSpring(toValue, {
      damping: 20,
      stiffness: 200,
      mass: 1,
    });
    
    currentTabIndex.value = tabIndex;
    setSelectedTab(tab);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onBegin(() => {
      translateX.value = translateX.value;
    })
    .onUpdate((event) => {
      const baseOffset = currentTabIndex.value === 0 ? 0 : -SCREEN_WIDTH;
      const newTranslateX = baseOffset + event.translationX;
      
      if (newTranslateX <= 50 && newTranslateX >= -SCREEN_WIDTH - 50) {
        translateX.value = newTranslateX;
      }
    })
    .onEnd((event) => {
      const threshold = SCREEN_WIDTH * 0.25;
      
      if (event.translationX < -threshold && currentTabIndex.value === 0) {
        runOnJS(switchToTab)('completed');
      } else if (event.translationX > threshold && currentTabIndex.value === 1) {
        runOnJS(switchToTab)('upcoming');
      } else {
        const currentTab = currentTabIndex.value === 0 ? 'upcoming' : 'completed';
        runOnJS(switchToTab)(currentTab);
      }
    });

  return {
    selectedTab,
    switchToTab,
    animatedStyle,
    panGesture,
    SCREEN_WIDTH
  };
};