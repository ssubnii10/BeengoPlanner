import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';

const JOB_PRESETS = [
  '백엔드 개발','프론트엔드','풀스택','데이터 분석','AI/ML 엔지니어',
  'PM/기획','iOS 개발','Android 개발','DevOps/인프라','QA 엔지니어',
  '디자인(UX/UI)','마케팅','경영기획','HR/인사','영업/세일즈',
];

export default function GoalScreen() {
  const router = useRouter();
  const { selectedJobs, setSelectedJobs, palette } = useAppStore();
  const p = palette;

  const [targetDate,    setTargetDate]    = useState('2026-08');
  const [targetCount,   setTargetCount]   = useState('10~20개');
  const [targetCompany, setTargetCompany] = useState<string[]>(['대기업','중견기업']);

  function toggleJob(j: string) {
    setSelectedJobs(
      selectedJobs.includes(j)
        ? selectedJobs.filter(x => x !== j)
        : [...selectedJobs, j]
    );
  }

  function toggleCompany(c: string) {
    setTargetCompany(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={[s.header, { backgroundColor: p.cr, borderBottomColor: p.tx3+'30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={p.pri} />
        </TouchableOpacity>
        <Text style={[s.title, { color: p.tx }]}>목표 설정</Text>
      </View>

      <ScrollView>
        <View style={[s.infoBox, { backgroundColor: p.bg2 }]}>
          <Text style={[s.infoTxt, { color: p.tx3 }]}>
            취업 목표를 설정하면 달력 D-day와 리포트 진척도에 자동 반영돼요.
          </Text>
        </View>

        {/* 목표 취업 시기 */}
        <View style={[s.section, { backgroundColor: p.cr }]}>
          <Text style={[s.sectionLabel, { color: p.tx3 }]}>목표 취업 시기</Text>
          <TextInput
            style={[s.input, { backgroundColor: p.bg2, color: p.tx, borderColor: p.tx3+'40' }]}
            value={targetDate}
            onChangeText={setTargetDate}
            placeholder="YYYY-MM"
            placeholderTextColor={p.tx3}
          />
        </View>

        {/* 목표 지원 기업 수 */}
        <View style={[s.section, { backgroundColor: p.cr, marginTop: 8 }]}>
          <Text style={[s.sectionLabel, { color: p.tx3 }]}>목표 지원 기업 수</Text>
          <View style={s.optRow}>
            {(['10개 이하','10~20개','20~30개','30개 이상']).map(v => {
              const on = targetCount === v;
              return (
                <TouchableOpacity key={v}
                  style={[s.optBtn, { borderColor: p.tx3+'40', backgroundColor: p.cr },
                    on && { backgroundColor: p.pri, borderColor: p.pri }]}
                  onPress={() => setTargetCount(v)}>
                  <Text style={[s.optTxt, { color: on ? p.cr : p.tx2 }]}>{v}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 희망 직무 */}
        <View style={[s.section, { backgroundColor: p.cr, marginTop: 8 }]}>
          <Text style={[s.sectionLabel, { color: p.tx3 }]}>희망 직무 (복수 선택)</Text>
          <View style={s.chipGrid}>
            {JOB_PRESETS.map(j => {
              const on = selectedJobs.includes(j);
              return (
                <TouchableOpacity key={j}
                  style={[s.chip, { borderColor: p.tx3+'40', backgroundColor: p.cr },
                    on && { backgroundColor: p.priL ?? p.pri+'22', borderColor: p.pri }]}
                  onPress={() => toggleJob(j)}>
                  {on && <Ionicons name="checkmark" size={11} color={p.pri} />}
                  <Text style={[s.chipTxt, { color: on ? p.pri : p.tx2 }]}>{j}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 목표 기업군 */}
        <View style={[s.section, { backgroundColor: p.cr, marginTop: 8 }]}>
          <Text style={[s.sectionLabel, { color: p.tx3 }]}>목표 기업군 (복수 선택)</Text>
          <View style={s.optRow}>
            {(['대기업','중견기업','스타트업','공기업','외국계']).map(c => {
              const on = targetCompany.includes(c);
              return (
                <TouchableOpacity key={c}
                  style={[s.optBtn, { borderColor: p.tx3+'40', backgroundColor: p.cr },
                    on && { backgroundColor: p.pri, borderColor: p.pri }]}
                  onPress={() => toggleCompany(c)}>
                  <Text style={[s.optTxt, { color: on ? p.cr : p.tx2 }]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 저장 버튼 */}
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            style={[s.saveBtn, { backgroundColor: p.pri }]}
            onPress={() => router.back()}>
            <Text style={[s.saveTxt, { color: p.cr }]}>저장</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  backBtn:     { marginRight: 8, padding: 2 },
  title:       { fontSize: 18, fontWeight: '600' },
  infoBox:     { margin: 16, padding: 12, borderRadius: 8 },
  infoTxt:     { fontSize: 11, lineHeight: 18 },
  section:     { paddingHorizontal: 20, paddingVertical: 14 },
  sectionLabel:{ fontSize: 11, marginBottom: 10 },
  input:       { padding: 10, borderRadius: 8, borderWidth: 0.5, fontSize: 13 },
  optRow:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optBtn:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 0.5 },
  optTxt:      { fontSize: 13 },
  chipGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, borderWidth: 1 },
  chipTxt:     { fontSize: 12 },
  saveBtn:     { padding: 14, borderRadius: 10, alignItems: 'center' },
  saveTxt:     { fontSize: 14, fontWeight: '600' },
});