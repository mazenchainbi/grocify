import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSupabase } from '../../../lib/supabase';

type University = { id: number; name: string; avatar_url: string | null };
type Club = { id: number; name: string; description: string | null; avatar_url: string | null };

// Round avatar: shows the image from the DB, or the first letter if missing / failed to load
function Avatar({ url, name, size = 44 }: { url?: string | null; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (url && !failed) {
    return (
      <Image
        source={{ uri: url }}
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E8E1D9' }}
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-[#F6E7E2] items-center justify-center"
    >
      <Text className="text-[#C56A53] font-bold" style={{ fontSize: size * 0.42 }}>
        {name?.trim().charAt(0).toUpperCase() || '?'}
      </Text>
    </View>
  );
}

export default function ClubsScreen() {
  const supabase = useSupabase();
  const [universities, setUniversities] = useState<University[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uniSearch, setUniSearch] = useState('');
  const [clubSearch, setClubSearch] = useState('');
  const [followedIds, setFollowedIds] = useState<number[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(true);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch universities
  useEffect(() => {
    const fetchUnis = async () => {
      setLoadingUnis(true);
      const { data, error } = await supabase
        .from('universities')
        .select('id, name, avatar_url')
        .order('name');
      console.log('UNIS:', data, error);
      if (error) setErrorMsg(error.message);
      else setUniversities(data ?? []);
      setLoadingUnis(false);
    };
    fetchUnis();
  }, []);

  // 2. Fetch clubs of the selected university
  useEffect(() => {
    if (!selectedUni) {
      setClubs([]);
      return;
    }
    const fetchClubs = async () => {
      setLoadingClubs(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, description, avatar_url')
        .eq('university_id', selectedUni.id);
      console.log('CLUBS:', data, error);
      if (error) {
        setErrorMsg(error.message);
        setClubs([]);
      } else {
        setClubs(data ?? []);
      }
      setLoadingClubs(false);
    };
    fetchClubs();
  }, [selectedUni]);

  // Search filters (case-insensitive)
  const filteredUnis = useMemo(() => {
    const q = uniSearch.trim().toLowerCase();
    return q ? universities.filter((u) => u.name.toLowerCase().includes(q)) : universities;
  }, [universities, uniSearch]);

  const filteredClubs = useMemo(() => {
    const q = clubSearch.trim().toLowerCase();
    return q
      ? clubs.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.description ?? '').toLowerCase().includes(q)
        )
      : clubs;
  }, [clubs, clubSearch]);

  const closeDropdown = () => {
    setDropdownOpen(false);
    setUniSearch('');
  };

  const handlePickUniversity = (uni: University) => {
    setSelectedUni(uni);
    setClubSearch('');
    closeDropdown();
  };

  // Follow / Unfollow (local for now)
  const toggleFollow = (clubId: number) => {
    setFollowedIds((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId]
    );
  };

  const handleMessageClub = (clubId: number, clubName: string) => {
    // Later: navigate to the chat screen with this club
    Alert.alert('Message', `Open a chat with ${clubName} (coming next!).`);
  };

  return (
    <View className="flex-1 bg-[#FAF7F2] pt-16 px-5">
      <Text className="text-3xl font-bold text-[#3D3D3D]">Discover Clubs</Text>
      <Text className="text-[#8A8A8A] text-base mt-1 mb-6">Pick a university to see its clubs</Text>

      {/* ---------- The "select" ---------- */}
      <Text className="text-[#4A4A4A] font-semibold text-sm mb-2">University</Text>
      <Pressable
        onPress={() => setDropdownOpen(true)}
        disabled={loadingUnis}
        className="flex-row items-center bg-white border border-[#E8E1D9] rounded-2xl px-4 py-3 mb-4 active:bg-[#F3EEE8]"
      >
        {loadingUnis ? (
          <ActivityIndicator color="#C56A53" />
        ) : (
          <>
            {selectedUni && (
              <View className="mr-3">
                <Avatar url={selectedUni.avatar_url} name={selectedUni.name} size={36} />
              </View>
            )}
            <Text
              className={`text-base flex-1 ${selectedUni ? 'text-[#3D3D3D] font-semibold' : 'text-[#8A8A8A] py-1'}`}
              numberOfLines={1}
            >
              {selectedUni ? selectedUni.name : 'Select a university'}
            </Text>
          </>
        )}
        <Text className="text-[#C56A53] text-lg ml-3">▾</Text>
      </Pressable>

      {/* ---------- Dropdown dialog with search ---------- */}
      <Modal visible={dropdownOpen} transparent animationType="fade" onRequestClose={closeDropdown}>
        <Pressable className="flex-1 bg-black/40 justify-start pt-24 px-6" onPress={closeDropdown}>
          <Pressable className="bg-white rounded-3xl pt-4 pb-2 max-h-[65%]" onPress={() => {}}>
            {/* Search box */}
            <View className="flex-row items-center bg-[#FAF7F2] border border-[#E8E1D9] rounded-2xl px-4 mx-4 mb-2">
              <Text className="text-[#8A8A8A] mr-2">🔍</Text>
              <TextInput
                value={uniSearch}
                onChangeText={setUniSearch}
                placeholder="Search university..."
                placeholderTextColor="#8A8A8A"
                autoFocus
                autoCorrect={false}
                className="flex-1 py-3 text-base text-[#3D3D3D]"
              />
              {uniSearch.length > 0 && (
                <Pressable onPress={() => setUniSearch('')} hitSlop={10}>
                  <Text className="text-[#8A8A8A] text-base">✕</Text>
                </Pressable>
              )}
            </View>

            <FlatList
              data={filteredUnis}
              keyExtractor={(item) => item.id.toString()}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View className="h-px bg-[#F0EBE5] mx-4" />}
              renderItem={({ item }) => {
                const isSelected = selectedUni?.id === item.id;
                return (
                  <Pressable
                    onPress={() => handlePickUniversity(item)}
                    className="flex-row items-center px-5 py-3 active:bg-[#F3EEE8]"
                  >
                    <View className="mr-3">
                      <Avatar url={item.avatar_url} name={item.name} size={40} />
                    </View>
                    <Text
                      className={`text-base flex-1 ${
                        isSelected ? 'text-[#C56A53] font-bold' : 'text-[#3D3D3D]'
                      }`}
                    >
                      {item.name}
                    </Text>
                    {isSelected && <Text className="text-[#C56A53] text-lg ml-3">✓</Text>}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text className="text-center text-[#8A8A8A] py-6">No university matches your search.</Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Error message */}
      {errorMsg && (
        <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
          <Text className="text-red-600 text-sm">{errorMsg}</Text>
        </View>
      )}

      {/* ---------- Clubs ---------- */}
      {loadingClubs ? (
        <ActivityIndicator size="large" color="#C56A53" className="mt-10" />
      ) : selectedUni ? (
        <>
          {/* Club search */}
          <View className="flex-row items-center bg-white border border-[#E8E1D9] rounded-2xl px-4 mb-4">
            <Text className="text-[#8A8A8A] mr-2">🔍</Text>
            <TextInput
              value={clubSearch}
              onChangeText={setClubSearch}
              placeholder="Search clubs..."
              placeholderTextColor="#8A8A8A"
              autoCorrect={false}
              className="flex-1 py-3 text-base text-[#3D3D3D]"
            />
            {clubSearch.length > 0 && (
              <Pressable onPress={() => setClubSearch('')} hitSlop={10}>
                <Text className="text-[#8A8A8A] text-base">✕</Text>
              </Pressable>
            )}
          </View>

          <FlatList
            data={filteredClubs}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => {
              const isFollowing = followedIds.includes(item.id);
              return (
                <View className="bg-white rounded-3xl p-5 mb-4 border border-[#F0EBE5]">
                  <View className="flex-row items-center">
                    <View className="mr-4">
                      <Avatar url={item.avatar_url} name={item.name} size={52} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-lg text-[#3D3D3D]">{item.name}</Text>
                      {!!item.description && (
                        <Text
                          className="text-[#8A8A8A] mt-1 text-sm leading-5"
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View className="flex-row mt-4">
                    {/* Follow / Following */}
                    <Pressable
                      onPress={() => toggleFollow(item.id)}
                      className={`flex-1 items-center py-2.5 rounded-full mr-3 border ${
                        isFollowing
                          ? 'bg-white border-[#C56A53]'
                          : 'bg-[#C56A53] border-[#C56A53]'
                      } active:opacity-80`}
                    >
                      <Text
                        className={`font-bold text-sm ${
                          isFollowing ? 'text-[#C56A53]' : 'text-white'
                        }`}
                      >
                        {isFollowing ? 'Following ✓' : 'Follow'}
                      </Text>
                    </Pressable>

                    {/* Message */}
                    <Pressable
                      onPress={() => handleMessageClub(item.id, item.name)}
                      className="flex-1 items-center py-2.5 rounded-full bg-[#FAF7F2] border border-[#E8E1D9] active:bg-[#E8E1D9]"
                    >
                      <Text className="font-bold text-sm text-[#4A4A4A]">Message</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              !errorMsg ? (
                <Text className="text-center mt-10 text-[#8A8A8A] text-base">
                  {clubSearch ? 'No club matches your search.' : 'No clubs found for this university yet.'}
                </Text>
              ) : undefined
            }
          />
        </>
      ) : (
        <View className="flex-1 items-center justify-center mb-20">
          <Text className="text-6xl mb-4">🎓</Text>
          <Text className="text-center text-[#8A8A8A] text-lg font-medium">
            Select a university to discover its clubs.
          </Text>
        </View>
      )}
    </View>
  );
}