import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';

export default function CalDisplayScreen() {
  const router   = useRouter();
  const { calSettings, setCalSetting, palette } = useAppStore();
  const p = palette;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={[s.header, { backgroundColor: p.cr, borderBottomColor: p.tx3+'30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={p.pri} />
        </TouchableOpacity>
        <Text style={[s.title, { color: p.tx }]}>일정 표시 방법</Text>
      </View>

      <ScrollView>
        {/* 기본 뷰 */}
        <View style={[s.section, { backgroundColor: p.cr }]}>
          <Text style={[s.sectionLabel, { color: p.tx3 }]}>기본 뷰</Text>
          <View style={s.optRow}>
            {(['month','week','day'] as const).map(v => {
              const label = { month:'월간', week:'주간', day:'일간' }[v];
              const on = calSettings.view === v;
              return (
                <TouchableOpacity key={v}
                  style={[s.optBtn, { borderColor: p.tx3+'40', backgroundColor: p.cr },
                    on && { backgroundColor: p.pri, borderColor: p.pri }]}
                  onPress={() => setCalSetting('view', v)}>
                  <Text style={[s.optTxt, { color: on ? p.cr : p.tx2 }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 한 주 시작일 */}
        <View style={[s.section, { backgroundColor: p.cr, marginTop: 8 }]}>
          <Text style={[s.sectionLabel, { color: p.tx3 }]}>한 주 시작일</Text>
          <View style={s.optRow}>
            {(['sun','mon'] as const).map(v => {
              const label = { sun:'일요일', mon:'월요일' }[v];
              const on = calSettings.startDay === v;
              return (
                <TouchableOpacity key={v}
                  style={[s.optBtn, { borderColor: p.tx3+'40', backgroundColor: p.cr },
                    on && { backgroundColor: p.pri, borderColor: p.pri }]}
                  onPress={() => setCalSetting('startDay', v)}>
                  <Text style={[s.optTxt, { color: on ? p.cr : p.tx2 }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 표시 옵션 토글 */}
        <View style={[s.section, { backgroundColor: p.cr, marginTop: 8 }]}>
          <Text style={[s.sectionLabel, { color: p.tx3 }]}>표시 옵션</Text>
          {([
            { key: 'fadePast',    label: '지난 일정 흐리게 표시' },
            { key: 'showDday',    label: 'D-day 카운트 표시'     },
            { key: 'showWeekend', label: '주말 표시'              },
            { key: 'showCat',     label: '카테고리 색상 표시'     },
          ] as const).map(item => {
            const on = calSettings[item.key];
            return (
              <View key={item.key} style={[s.toggleRow, { borderBottomColor: p.tx3+'15' }]}>
                <Text style={[s.toggleLabel, { color: p.tx }]}>{item.label}</Text>
                <TouchableOpacity
                  style={[s.tog, { backgroundColor: on ? p.acc : p.bg3 }]}
                  onPress={() => setCalSetting(item.key, !on)}>
                  <View style={[s.togKnob, on && s.togKnobOn]} />
                </TouchableOpacity>
              </View>
            );
          })}
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
  sectionLabel:{ fontSize: 11, color: '#9a9488', marginBottom: 10 },
  optRow:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optBtn:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, borderWidth: 0.5 },
  optTxt:      { fontSize: 13 },
  toggleRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 0.5 },
  toggleLabel: { fontSize: 14 },
  tog:         { width: 44, height: 26, borderRadius: 99, justifyContent: 'center', paddingHorizontal: 2 },
  togKnob:     { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  togKnobOn:   { alignSelf: 'flex-end' },
});