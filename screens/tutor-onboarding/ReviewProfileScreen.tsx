import { useEffect, useState } from 'react';
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../../services/userService';
import { PageContainer } from '../../components/PageContainer';
import SelectDropdown from 'react-native-select-dropdown';

const ReviewProfileScreen = () => {
  const subjects = [
    { title: 'Mathematics', icon: 'calculator-outline' },
    { title: 'Physics', icon: 'atom-outline' },
    { title: 'Chemistry', icon: 'flask-outline' },
    { title: 'Biology', icon: 'leaf-outline' },
    { title: 'English', icon: 'book-outline' },
    { title: 'History', icon: 'time-outline' },
    { title: 'Geography', icon: 'globe-outline' },
    { title: 'Computer Science', icon: 'laptop-outline' },
  ]

  const [showModal, setShowModal] = useState<string | null>(null);
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>(
    'Select your speciality',
  );
  const [user, setUser] = useState<any>(null);
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = userService.getUserProfileRealTime(
      currentUser.uid,
      (profile) => {
        if (profile) {
          setUser(profile);
          setSelectedSpeciality(profile?.profile?.speciality || 'Select your speciality');
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleProfileSave = async () => {
    if (currentUser?.uid && user) {
      try {
        await userService.updateUserProfile(currentUser.uid, {
          name: user.name,
          profile: {
            ...user.profile,
            bio: user.profile?.bio,
          },
        });
      } catch (err) {
        console.error('Error in saving profile:', err);
      } finally {
        setShowModal(null);
      }
    }
  };

  const handleSpecialitySave = async () => {
    if (!selectedSpeciality || selectedSpeciality === 'Select your speciality') {
      Alert.alert('Validation Error', 'Please select a speciality before saving.');
      return;
    }

    try {
      if (currentUser?.uid && user) {
        await userService.updateUserProfile(currentUser.uid, {
          profile: {
            ...user.profile,
            speciality: selectedSpeciality,
          },
        });
      }
    } catch (err) {
      console.error('Error in saving speciality:', err);
    } finally {
      setShowModal(null);
    }
  };

  const handleHourlyRateSave = async () => {
    const hourlyRate = parseFloat(user?.profile?.hourlyRate?.toString() || '0');
    
    if (isNaN(hourlyRate) || hourlyRate < 0) {
      Alert.alert('Validation Error', 'Please enter a valid hourly rate (0 or greater).');
      return;
    }

    try {
      if (currentUser?.uid && user) {
        await userService.updateUserProfile(currentUser.uid, {
          profile: {
            ...user.profile,
            hourlyRate: hourlyRate,
          },
        });
      }
    } catch (err) {
      console.error('Error in saving hourly rate:', err);
    } finally {
      setShowModal(null);
    }
  };

  const handleConfirmProfile = () => {
    const hasValidName = user?.name && user.name.trim().length > 0;
    const hasValidSpeciality = selectedSpeciality && selectedSpeciality !== 'Select your speciality';
    const hourlyRate = parseFloat(user?.profile?.hourlyRate?.toString() || '0');
    const hasValidHourlyRate = !isNaN(hourlyRate) && hourlyRate >= 0;
    
    if (!hasValidName) {
      Alert.alert('Profile Incomplete', 'Please add your name before confirming your profile.');
      return;
    }
    
    if (!hasValidSpeciality) {
      Alert.alert('Profile Incomplete', 'Please select your speciality before confirming your profile.');
      return;
    }
    
    if (!hasValidHourlyRate) {
      Alert.alert('Profile Incomplete', 'Please set a valid hourly rate before confirming your profile.');
      return;
    }
    
    Alert.alert('Success', 'Profile confirmed successfully!', [
      {
        text: 'OK',
      }
    ]);
  };

  return (
    <PageContainer>
      <View className="p-4 gap-y-4 flex-1">
      <Text className="text-xl font-bold">Review Your Profile</Text>
      <View className="flex-row items-center justify-between rounded-lg bg-white p-4">
        <View className="flex-row items-center flex-1">
          <View className="p-3 rounded-lg bg-teal-100 items-center justify-center">
            <Icon name="school-outline" size={20} color="#008080" />
          </View>
          <View className="ml-3 gap-y-2 flex-1">
            <Text className="text-lg">Expertise</Text>
            <Text className="text-gray-500">
              {user?.profile?.speciality}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowModal('speciality')}>
          <View className="flex-row items-center">
            <Icon name="pencil" size={15} color="#008080" />
            <Text className="ml-2 text-teal-600">Edit</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between rounded-lg bg-white p-4">
        <View className="flex-row items-center flex-1">
          <View className="p-3 rounded-lg bg-teal-100 items-center justify-center">
            <Icon name="person-outline" size={20} color="#008080" />
          </View>
          <View className="ml-3 gap-y-2 flex-1">
            <Text className="text-lg">Profile</Text>
            <Text className="text-gray-500">
              Bio: {user?.profile?.bio || 'Not set'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowModal('profile')}>
          <View className="flex-row items-center">
            <Icon name="pencil" size={15} color="#008080" />
            <Text className="ml-2 text-teal-600">Edit</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between rounded-lg bg-white p-4">
        <View className="flex-row items-center flex-1">
          <View className="p-3 rounded-lg bg-teal-100 items-center justify-center">
            <Icon name="cash-outline" size={20} color="#008080" />
          </View>
          <View className="ml-3 gap-y-2 flex-1">
            <Text className="text-lg">Hourly Rate</Text>
            <Text className="text-gray-500">
              PKR {user?.profile?.hourlyRate || '0'}/hour
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowModal('hourlyRate')}>
          <View className="flex-row items-center">
            <Icon name="pencil" size={15} color="#008080" />
            <Text className="ml-2 text-teal-600">Edit</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className="bg-teal-600 rounded-lg p-4"
        onPress={handleConfirmProfile}
      >
        <Text className="text-lg font-bold text-white text-center">
          Confirm & Activate Profile
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal === 'speciality'}
        animationType="slide"
        transparent
      >
        <View className="flex-1 bg-black/50 p-4 justify-center items-center">
          <View className="bg-white rounded-lg max-w-sm w-full p-6 gap-y-2">
            <Text className="text-center font-bold text-lg">
              Edit Speciality
            </Text>
            <Text className="font-semibold text-md ml-1">Speciality</Text>
            <View
            className="border border-gray-300 rounded-xl"
            >
              <SelectDropdown
                data={subjects}
                onSelect={(selectedItem) => {
                    setSelectedSpeciality(selectedItem.title);
                }}
                defaultValue={selectedSpeciality}
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View className='px-4 py-4 flex-row gap-x-2 items-center'>
                      {selectedItem && (
                        <Icon
                          name={selectedItem.icon}
                        />
                      )}
                      <Text>
                        {(selectedSpeciality) ||
                          'Select your speciality'}
                      </Text>
                      <Icon
                        name={isOpened ? 'chevron-up' : 'chevron-down'}
                      />
                    </View>
                  );
                }}
                renderItem={(item, index, isSelected) => {
                  return (
                    <View
                      className={`px-4 py-3 flex-row items-center gap-x-2 ${isSelected && "bg-[#D2D9DF]"}`}
                    >
                      <Icon
                        name={item.icon}
                      />
                      <Text>
                        {item.title}
                      </Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />
            </View>
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="flex-1 py-3 px-6 mr-2 bg-gray-300 rounded-xl"
                onPress={() => setShowModal(null)}
              >
                <Text className="text-center font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 px-6 ml-2 bg-teal-600 rounded-xl"
                onPress={handleSpecialitySave}
              >
                <Text className="text-center font-bold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showModal === 'profile'}
        animationType="slide"
        transparent
      >
        <View className="flex-1 bg-black/50 p-4 justify-center items-center">
          <View className="bg-white rounded-lg max-w-sm w-full p-6 gap-y-2">
            <Text className="text-center font-bold text-lg">Edit Profile</Text>
            <Text className="font-semibold text-md ml-1">Name</Text>
            <TextInput
              className="p-3 border border-gray-300 rounded-xl"
              placeholder="Enter your name"
              placeholderTextColor={'#666'}
              value={user?.name}
              onChangeText={text =>
                setUser((prev: any) => ({ ...prev, name: text }))
              }
              autoCorrect={false}
              spellCheck={false}
              autoCapitalize="none"
            />
            <Text className="font-semibold text-md ml-1">Bio</Text>
            <TextInput
              className="p-3 border border-gray-300 rounded-xl"
              placeholder="Enter your bio"
              placeholderTextColor={'#666'}
              value={user?.profile?.bio}
              autoCorrect={false}
              spellCheck={false}
              autoCapitalize="none"
              onChangeText={text =>
                setUser((prev: any) => ({
                  ...prev,
                  profile: { ...user.profile, bio: text },
                }))
              }
            />
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="bg-gray-300 rounded-xl flex-1 px-6 py-3 mr-2"
                onPress={() => setShowModal(null)}
              >
                <Text className="text-center font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-teal-600 rounded-xl flex-1 px-6 py-3 ml-2"
                onPress={handleProfileSave}
              >
                <Text className="text-center text-white font-bold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showModal === 'hourlyRate'}
        animationType="slide"
        transparent
      >
        <View className="flex-1 bg-black/50 p-4 justify-center items-center">
          <View className="bg-white rounded-lg max-w-sm w-full p-6 gap-y-2">
            <Text className="text-center font-bold text-lg">Set Hourly Rate</Text>
            <Text className="font-semibold text-md ml-1">Hourly Rate ($)</Text>
            <TextInput
              className="p-3 border border-gray-300 rounded-xl"
              placeholder="Enter your hourly rate (e.g., 25)"
              placeholderTextColor={'#666'}
              value={user?.profile?.hourlyRate?.toString() || ''}
              onChangeText={text => {
                const numericText = text.replace(/[^0-9.]/g, '');
                setUser((prev: any) => ({
                  ...prev,
                  profile: { 
                    ...prev?.profile, 
                    hourlyRate: numericText === '' ? '' : parseFloat(numericText) || 0
                  },
                }));
              }}
              keyboardType="decimal-pad"
              autoCorrect={false}
              spellCheck={false}
              autoCapitalize="none"
            />
            <Text className="text-xs text-gray-500 ml-1 mt-1">
              This rate will be used to calculate session prices based on duration.
            </Text>
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="bg-gray-300 rounded-xl flex-1 px-6 py-3 mr-2"
                onPress={() => setShowModal(null)}
              >
                <Text className="text-center font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-teal-600 rounded-xl flex-1 px-6 py-3 ml-2"
                onPress={handleHourlyRateSave}
              >
                <Text className="text-center text-white font-bold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </PageContainer>
  );
};

export default ReviewProfileScreen;
