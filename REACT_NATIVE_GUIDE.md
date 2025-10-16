# React Native Components Guide for React Developers

## Your AuthScreen Components Explained:

### 1. **View** (replaces `<div>`)
```tsx
<View className="flex-1 justify-center p-6 bg-blue-50">
```
- **Purpose**: Container element, like `<div>` in React
- **Styling**: Uses flexbox by default
- **Key Props**: 
  - `style` or `className` (with NativeWind)

### 2. **Text** (replaces `<span>`, `<p>`, `<h1>`, etc.)
```tsx
<Text className="text-3xl font-bold text-gray-800 mb-2 text-center">
  {isLogin ? 'Welcome Back! 👋' : 'Create Account 🚀'}
</Text>
```
- **Purpose**: Display ANY text content
- **Rule**: ALL text must be inside Text components
- **Key Props**: 
  - `numberOfLines`: Limit text lines
  - `ellipsizeMode`: How to truncate text

### 3. **TextInput** (replaces `<input>`)
```tsx
<TextInput
  className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  autoCorrect={false}
/>
```
- **Purpose**: Text input field
- **Key Props**:
  - `value`: Controlled input value
  - `onChangeText`: Handler for text changes (not `onChange`!)
  - `placeholder`: Placeholder text
  - `secureTextEntry`: For passwords (like `type="password"`)
  - `keyboardType`: "email-address", "numeric", "phone-pad", etc.
  - `autoCapitalize`: "none", "sentences", "words", "characters"
  - `autoCorrect`: Enable/disable autocorrect

### 4. **TouchableOpacity** (replaces `<button>`)
```tsx
<TouchableOpacity 
  className={`rounded-lg py-4 mb-4 ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
  onPress={handleAuth}
  disabled={isLoading}
>
  <Text className="text-white font-semibold text-lg text-center">
    {isLogin ? 'Sign In' : 'Sign Up'}
  </Text>
</TouchableOpacity>
```
- **Purpose**: Clickable element with opacity feedback
- **Key Props**:
  - `onPress`: Click handler (not `onClick`!)
  - `disabled`: Disable interaction
  - `activeOpacity`: Opacity when pressed (0-1)

### 5. **ActivityIndicator** (replaces loading spinners)
```tsx
<ActivityIndicator color="white" />
```
- **Purpose**: Loading spinner
- **Key Props**:
  - `color`: Spinner color
  - `size`: "small" or "large"

## React Native Specific Concepts:

### **Flexbox by Default**
- All Views use flexbox layout by default
- `flex-1` means "take all available space"
- Direction is `column` by default (unlike web which is `row`)

### **No CSS Files**
- Use `style` prop or NativeWind classes
- No external CSS files
- Styles are objects or className strings

### **Platform Differences**
- iOS and Android may render slightly differently
- Some props are platform-specific
- Test on both platforms

### **Event Handlers**
| **React (Web)** | **React Native** |
|-----------------|------------------|
| `onClick` | `onPress` |
| `onChange` | `onChangeText` |
| `onSubmit` | `onPress` |

### **Common Layout Patterns**

#### **Centering Content**
```tsx
<View className="flex-1 justify-center items-center">
  <Text>Centered content</Text>
</View>
```

#### **Form Layout**
```tsx
<View className="p-4">
  <Text className="mb-2">Label</Text>
  <TextInput 
    className="border border-gray-300 rounded p-2 mb-4"
    value={value}
    onChangeText={setValue}
  />
</View>
```

#### **Button with Loading**
```tsx
<TouchableOpacity 
  className="bg-blue-500 p-4 rounded"
  onPress={handlePress}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text className="text-white text-center">Press Me</Text>
  )}
</TouchableOpacity>
```

## Key Differences Summary:

1. **No HTML tags** → Use React Native components
2. **All text in `<Text>`** → Mandatory wrapper for text
3. **`onPress` not `onClick`** → Different event handlers
4. **`onChangeText` not `onChange`** → For TextInput
5. **Flexbox everywhere** → Default layout system
6. **No CSS files** → Use style props or NativeWind
7. **Platform-aware** → iOS/Android differences

## Your AuthScreen Translation:
- `<View>` = Container divs
- `<Text>` = All text elements (h1, p, span, etc.)
- `<TextInput>` = Input fields
- `<TouchableOpacity>` = Buttons
- `<ActivityIndicator>` = Loading spinners

This is why your form works perfectly - you're using the correct React Native components with NativeWind styling! 🎉