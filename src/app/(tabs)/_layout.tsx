import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '@clerk/expo'
import { useColorScheme } from 'nativewind';

export default function TabsLayout() {

  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const { user } = useUser();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tabTintColor = isDark ? '#fff' : '#000';

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />

  return ( <NativeTabs tintColor={tabTintColor} rippleColor="transparent" >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="clubs">
        <NativeTabs.Trigger.Icon sf="person.2" md="people" />
        <NativeTabs.Trigger.Label>Clubs</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="messages">
      <NativeTabs.Trigger.Icon sf={{default: 'envelope',selected: 'envelope.fill'}} md="message" />
        <NativeTabs.Trigger.Label>Messages</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon src={user?.imageUrl ? { uri: user.imageUrl } : undefined}
        renderingMode="original"
        />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
     )

}