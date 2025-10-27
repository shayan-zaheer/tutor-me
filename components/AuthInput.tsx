import { FC } from 'react';
import { TextInput, KeyboardTypeOptions } from 'react-native';

interface AuthInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

const AuthInput: FC<AuthInputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
}) => {
  return (
    <TextInput
      className="bg-white border border-gray-300 rounded-lg text-black px-4 py-3"
      placeholder={placeholder}
      placeholderTextColor="#666"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
      keyboardType={keyboardType}
      autoCorrect={false}
    />
  );
};

export default AuthInput;
