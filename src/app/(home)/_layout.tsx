import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/expo'
import { ActivityIndicator, View } from 'react-native'

export default function HomeLayout() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false })

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />

  return <Stack screenOptions={{ headerShown: false }} />
}