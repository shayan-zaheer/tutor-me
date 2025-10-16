import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Dimensions, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'

const AuthScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [screenData, setScreenData] = useState(Dimensions.get('window'))

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window)
    }
    
    const subscription = Dimensions.addEventListener('change', onChange)
    return () => subscription?.remove()
  }, [])

  const { width, height } = screenData
  const isSmallScreen = width < 375
  const isLargeScreen = width >= 414
  const isLandscape = width > height
  
  const containerPadding = isSmallScreen ? 16 : isLargeScreen ? 32 : 24
  const headerMargin = isSmallScreen ? 24 : 32
  const formMargin = isSmallScreen ? 16 : 24

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    try {
      if (isLogin) {
        // Login logic will be implemented with Firebase
        console.log('Login:', email, password)
        Alert.alert('Success', 'Login functionality will be implemented with Firebase')
      } else {
        // Signup logic will be implemented with Firebase
        console.log('Signup:', email, password)
        Alert.alert('Success', 'Signup functionality will be implemented with Firebase')
      }
    } catch (error) {
      Alert.alert('Error', 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    Alert.alert('Google Sign-In', 'Google Sign-In will be implemented with Firebase')
  }

  return (
    <ScrollView 
      className="flex-1 bg-blue-50"
      contentContainerStyle={{ 
        flexGrow: 1,
        justifyContent: isLandscape ? 'flex-start' : 'center',
        padding: containerPadding
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View className="items-center" style={{ marginBottom: headerMargin }}>
        <Text 
          className={`font-bold text-gray-800 mb-2 text-center ${
            isSmallScreen ? 'text-2xl' : isLargeScreen ? 'text-4xl' : 'text-3xl'
          }`}
        >
          {isLogin ? 'Welcome Back! 👋' : 'Create Account 🚀'}
        </Text>
        <Text className={`text-gray-600 text-center ${isSmallScreen ? 'text-sm' : 'text-base'}`}>
          {isLogin ? 'Sign in to continue' : 'Join us today'}
        </Text>
      </View>

      <View style={{ marginBottom: formMargin }}>
        <View className="mb-4">
          <Text className={`font-medium text-gray-700 mb-2 ${isSmallScreen ? 'text-xs' : 'text-sm'}`}>
            Email
          </Text>
          <TextInput
            className={`bg-white border border-gray-300 rounded-lg ${
              isSmallScreen ? 'px-3 py-2 text-sm' : isLargeScreen ? 'px-5 py-4 text-lg' : 'px-4 py-3 text-base'
            }`}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={{ marginBottom: formMargin }}>
          <Text className={`font-medium text-gray-700 mb-2 ${isSmallScreen ? 'text-xs' : 'text-sm'}`}>
            Password
          </Text>
          <TextInput
            className={`bg-white border border-gray-300 rounded-lg ${
              isSmallScreen ? 'px-3 py-2 text-sm' : isLargeScreen ? 'px-5 py-4 text-lg' : 'px-4 py-3 text-base'
            }`}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          className={`rounded-lg py-4 mb-4 ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
          onPress={handleAuth}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-lg text-center">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white border border-gray-300 rounded-lg py-4 mb-4 flex-row justify-center items-center"
          onPress={handleGoogleSignIn}
        >
          <Text className="text-gray-700 font-medium text-base mr-2">🔍</Text>
          <Text className="text-gray-700 font-medium text-base">
            Continue with Google
          </Text>
        </TouchableOpacity>
      </View>

      <View className="items-center">
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text className="text-blue-600 font-medium">
            {isLogin 
              ? "Don't have an account? Sign Up" 
              : "Already have an account? Sign In"
            }
          </Text>
        </TouchableOpacity>
      </View>

      {isLogin && (
        <TouchableOpacity className="items-center mt-4">
          <Text className="text-gray-500 font-medium">Forgot Password?</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

export default AuthScreen