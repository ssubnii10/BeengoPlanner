import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';

export default function NotiScreen() {
  const router = useRouter();
  const { notiSettings, setNotiSetting, palette } = useAppStore();
  const p = palette;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={[s.header, { backgroundColor: p.cr, borderBottomColor: p.tx3+'30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={p.pri} />
        </TouchableOpacity>
        <Text style={[s.title, { color: p.tx }]}>알림 설정</Text>
      </View>

      <ScrollView>
        {/* 알림 종류 */}
        <View style={[s.section, { backgroundColor: p.cr }]}>
          <Text style={[s.sectionLabel, { color: p.tx3 }]}>알림 종류</Text>
          {([
            { key: 'deadline', label: '마감 알림',    desc: 'D-3, D-1 자동 알림'  },
            { key: 'reminder', label: '일정 리마인더', desc: '당일 아침 알림'       },
            { key: 'weekly',   label: '주간 리포트',   desc: '매주 월요일 요약'     },
            { key: 'goal',     label: '목표 달성 알림', desc: ''                   },
          ] as const).map(item => {
            const on = notiSettings[item.key];
            return (
              <View key={item.key} style={[s.toggleRow, { borderBottomColor: p.tx3+'15' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.toggleLabel, { color: p.tx }]}>{item.label}</Text>
                  {!!item.desc && <Text style={[s.toggleDesc, { color: p.tx3 }]}>{item.desc}</Text>}
                </View>
                <TouchableOpacity
                  style={[s.tog, { backgroundColor: on ? p.acc : p.bg3 }]}
                  onPress={() => setNotiSetting(item.key, !on)}>
                  <View style={[s.togKnob, on && s.togKnobOn]} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* 알림 수신 시간 */}
        <View style={[s.section, { backgroundColor: p.cr, marginTop: 8 }]}>
          <Text style={[s.sectionLabel, { color: p.tx3 }]}>알림 수신 시간</Text>
          <View style={s.timeRow}>
            {/* 시 */}
            <View style={[s.timeBox, { backgroundColor: p.bg2, borderColor: p.tx3+'40' }]}>
              <TouchableOpacity onPress={() => setNotiSetting('hour', (notiSettings.hour + 1) % 24)}>
                <Ionicons name="chevron-up" size={16} color={p.tx2} />
              </TouchableOpacity>
              <Text style={[s.timeNum, { color: p.tx }]}>
                {String(notiSettings.hour).padStart(2,'0')}
              </Text>
              <TouchableOpacity onPress={() => setNotiSetting('hour', (notiSettings.hour + 23) % 24)}>
                <Ionicons name="chevron-down" size={16} color={p.tx2} />
              </TouchableOpacity>
            </View>
            <Text style={[s.timeSep, { color: p.tx2 }]}>:</Text>
            {/* 분 (10분 단위) */}
            <View style={[s.timeBox, { backgroundColor: p.bg2, borderColor: p.tx3+'40' }]}>
              <TouchableOpacity onPress={() => setNotiSetting('minute', (notiSettings.minute + 10) % 60)}>
                <Ionicons name="chevron-up" size={16} color={p.tx2} />
              </TouchableOpacity>
              <Text style={[s.timeNum, { color: p.tx }]}>
                {String(notiSettings.minute).padStart(2,'0')}
              </Text>
              <TouchableOpacity onPress={() => setNotiSetting('minute', (notiSettings.minute + 50) % 60)}>
                <Ionicons name="chevron-down" size={16} color={p.tx2} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[s.timeDesc, { color: p.tx3 }]}>설정한 시간에 당일 일정을 알려드려요 (10분 단위)</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  backBtn:     { marginRight: 8, padding: 2 },
  title:       { fontSize: 18, fontWeight: '600' },
  section:     { paddingHorizontal: 20, paddingVertical: 14 },
  sectionLabel:{ fontSize: 11, marginBottom: 10 },
  toggleRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 0.5 },
  toggleLabel: { fontSize: 14 },
  toggleDesc:  { fontSize: 11, marginTop: 2 },
  tog:         { width: 44, height: 26, borderRadius: 99, justifyContent: 'center', paddingHorizontal: 2 },
  togKnob:     { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  togKnobOn:   { alignSelf: 'flex-end' },
  timeRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  timeBox:     { alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 0.5, minWidth: 64 },
  timeNum:     { fontSize: 24, fontWeight: '600', marginVertical: 6 },
  timeSep:     { fontSize: 24, fontWeight: '600' },
  timeDesc:    { fontSize: 11, marginTop: 4 },
});