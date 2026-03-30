import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';

export default function PasswordScreen() {
  const router  = useRouter();
  const palette = useAppStore(s => s.palette);
  const p = palette;

  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');

  function handleChange() {
    if (!current)              { Alert.alert('현재 비밀번호를 입력해주세요'); return; }
    if (next.length < 6)       { Alert.alert('새 비밀번호는 6자 이상이어야 해요'); return; }
    if (next !== confirm)      { Alert.alert('새 비밀번호가 일치하지 않아요'); return; }
    Alert.alert('변경됐어요!');
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={[s.header, { backgroundColor: p.cr, borderBottomColor: p.tx3+'30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={p.pri} />
        </TouchableOpacity>
        <Text style={[s.title, { color: p.tx }]}>비밀번호 변경</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {[
          { label: '현재 비밀번호', value: current, onChange: setCurrent, placeholder: '현재 비밀번호' },
          { label: '새 비밀번호',   value: next,    onChange: setNext,    placeholder: '6자 이상' },
          { label: '새 비밀번호 확인', value: confirm, onChange: setConfirm, placeholder: '새 비밀번호 재입력' },
        ].map(field => (
          <View key={field.label}>
            <Text style={[s.label, { color: p.tx3 }]}>{field.label}</Text>
            <TextInput
              style={[s.input, { backgroundColor: p.bg2, color: p.tx, borderColor: p.tx3+'40' }]}
              value={field.value}
              onChangeText={field.onChange}
              placeholder={field.placeholder}
              placeholderTextColor={p.tx3}
              secureTextEntry
            />
          </View>
        ))}

        {/* 불일치 경고 */}
        {confirm.length > 0 && next !== confirm && (
          <Text style={[s.warnTxt, { color: p.dan }]}>⚠ 비밀번호가 일치하지 않아요</Text>
        )}

        <TouchableOpacity
          style={[s.saveBtn, { backgroundColor: p.pri }]}
          onPress={handleChange}>
          <Text style={[s.saveTxt, { color: p.cr }]}>변경</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  backBtn: { marginRight: 8, padding: 2 },
  title:   { fontSize: 18, fontWeight: '600' },
  label:   { fontSize: 11, marginBottom: 6 },
  input:   { padding: 12, borderRadius: 8, borderWidth: 0.5, fontSize: 14, marginBottom: 16 },
  warnTxt: { fontSize: 11, marginBottom: 12 },
  saveBtn: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  saveTxt: { fontSize: 14, fontWeight: '600' },
});