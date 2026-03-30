import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';

export default function ProfileEditScreen() {
  const router  = useRouter();
  const palette = useAppStore(s => s.palette);
  const p = palette;

  const [name,  setName]  = useState('김취준');
  const [email, setEmail] = useState('jjun@email.com');

  function isValidEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function handleSave() {
    if (!isValidEmail(email)) {
      Alert.alert('이메일 형식을 확인해주세요');
      return;
    }
    Alert.alert('저장됐어요!');
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={[s.header, { backgroundColor: p.cr, borderBottomColor: p.tx3+'30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={p.pri} />
        </TouchableOpacity>
        <Text style={[s.title, { color: p.tx }]}>프로필 수정</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[s.label, { color: p.tx3 }]}>이름</Text>
        <TextInput
          style={[s.input, { backgroundColor: p.bg2, color: p.tx, borderColor: p.tx3+'40' }]}
          value={name}
          onChangeText={setName}
          placeholder="이름"
          placeholderTextColor={p.tx3}
        />

        <Text style={[s.label, { color: p.tx3 }]}>이메일</Text>
        <TextInput
          style={[s.input, { backgroundColor: p.bg2, color: p.tx, borderColor: p.tx3+'40' }]}
          value={email}
          onChangeText={setEmail}
          placeholder="이메일"
          placeholderTextColor={p.tx3}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={[s.emailMsg, {
          color: email.length > 0
            ? isValidEmail(email) ? '#5f8060' : p.dan
            : 'transparent'
        }]}>
          {email.length > 0
            ? isValidEmail(email) ? '✔ 올바른 이메일 형식이에요' : '⚠ 올바른 이메일 형식이 아니에요'
            : '.'}
        </Text>

        <TouchableOpacity
          style={[s.saveBtn, { backgroundColor: p.pri }]}
          onPress={handleSave}>
          <Text style={[s.saveTxt, { color: p.cr }]}>저장</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  backBtn:  { marginRight: 8, padding: 2 },
  title:    { fontSize: 18, fontWeight: '600' },
  label:    { fontSize: 11, marginBottom: 6 },
  input:    { padding: 12, borderRadius: 8, borderWidth: 0.5, fontSize: 14, marginBottom: 6 },
  emailMsg: { fontSize: 11, marginBottom: 16, height: 16 },
  saveBtn:  { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  saveTxt:  { fontSize: 14, fontWeight: '600' },
});