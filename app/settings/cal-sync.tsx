import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';

export default function CalSyncScreen() {
  const router  = useRouter();
  const palette = useAppStore(s => s.palette);
  const p = palette;

  const [google, setGoogle] = useState(false);
  const [apple,  setApple]  = useState(false);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: p.bg }}>
      <View style={[s.header, { backgroundColor: p.cr, borderBottomColor: p.tx3+'30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={p.pri} />
        </TouchableOpacity>
        <Text style={[s.title, { color: p.tx }]}>외부 캘린더</Text>
      </View>

      <ScrollView>
        <View style={{ marginTop:8, backgroundColor:p.cr }}>
          <Text style={{ fontSize:11, color:p.tx3, padding:14, paddingBottom:4 }}>캘린더 연결</Text>

          {/* Google */}
          <TouchableOpacity
            style={[s.row, { borderBottomColor:p.tx3+'20' }]}
            onPress={() => setGoogle(v => !v)}>
            <View style={[s.iconBox, { backgroundColor: p.bg2 }]}>
              <Ionicons name="logo-google" size={18} color="#4285F4" />
            </View>
            <View style={{ flex:1 }}>
              <Text style={[s.rowTitle, { color:p.tx }]}>Google 캘린더</Text>
              <Text style={[s.rowDesc,  { color:p.tx3 }]}>Android 기본 달력과 동기화</Text>
            </View>
            <View style={[s.badge,
              google
                ? { backgroundColor:p.pri+'20', borderColor:p.pri }
                : { backgroundColor:p.bg2,      borderColor:p.tx3+'40' }]}>
              <Text style={[s.badgeTxt, { color: google ? p.pri : p.tx3 }]}>
                {google ? '연결됨' : '연결'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Apple */}
          <TouchableOpacity
            style={[s.row, { borderBottomWidth:0 }]}
            onPress={() => setApple(v => !v)}>
            <View style={[s.iconBox, { backgroundColor: p.bg2 }]}>
              <Ionicons name="logo-apple" size={18} color={p.tx} />
            </View>
            <View style={{ flex:1 }}>
              <Text style={[s.rowTitle, { color:p.tx }]}>Apple 캘린더</Text>
              <Text style={[s.rowDesc,  { color:p.tx3 }]}>iOS 기본 달력과 동기화</Text>
            </View>
            <View style={[s.badge,
              apple
                ? { backgroundColor:p.pri+'20', borderColor:p.pri }
                : { backgroundColor:p.bg2,      borderColor:p.tx3+'40' }]}>
              <Text style={[s.badgeTxt, { color: apple ? p.pri : p.tx3 }]}>
                {apple ? '연결됨' : '연결'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ margin:16, padding:12, backgroundColor:p.bg2, borderRadius:10 }}>
          <Text style={{ fontSize:11, color:p.tx3, lineHeight:18 }}>
            연결하면 외부 일정이 달력에 자동 표시돼요.{'\n'}
            취준플래너 일정을 외부 캘린더로 내보낼 수도 있어요.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:   { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:14, borderBottomWidth:0.5 },
  backBtn:  { marginRight:8, padding:2 },
  title:    { fontSize:18, fontWeight:'600' },
  row:      { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14, borderBottomWidth:0.5 },
  iconBox:  { width:36, height:36, borderRadius:10, alignItems:'center', justifyContent:'center' },
  rowTitle: { fontSize:14, fontWeight:'500' },
  rowDesc:  { fontSize:11, marginTop:2 },
  badge:    { paddingHorizontal:10, paddingVertical:4, borderRadius:99, borderWidth:0.5 },
  badgeTxt: { fontSize:11, fontWeight:'500' },
});