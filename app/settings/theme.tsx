import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';
import { THEMES_SIG, THEMES_PASTEL, THEMES_BASIC, buildPalette } from '../../src/theme/themes';

type ThemeGroup = 'sig' | 'pastel' | 'basic';

export default function ThemeScreen() {
  const router  = useRouter();
  const { setTheme, palette } = useAppStore();
  const p = palette;

  const [group,    setGroup]    = useState<ThemeGroup>('sig');
  const [selIdx,   setSelIdx]   = useState(-1);
  const [preview,  setPreview]  = useState<typeof THEMES_SIG[0] | null>(null);

  const groupMap = { sig: THEMES_SIG, pastel: THEMES_PASTEL, basic: THEMES_BASIC };
  const groupLabel = { sig:'시그니처 테마', pastel:'파스텔 테마', basic:'기본 테마' };
  const themes = groupMap[group];

  function pickTheme(i: number) {
    const t = themes[i];
    setSelIdx(i);
    setPreview(t);
    setTheme(t.pri, t.acc, t.dan);
  }

  // 미리보기용 팔레트 (선택한 테마 기준)
  const prev = preview ? buildPalette(preview.pri, preview.acc, preview.dan) : p;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={[s.header, { backgroundColor: p.cr, borderBottomColor: p.tx3+'30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={p.pri} />
        </TouchableOpacity>
        <Text style={[s.title, { color: p.tx }]}>테마 설정</Text>
      </View>

      <ScrollView>
        {/* 그룹 탭 */}
        <View style={[s.groupRow, { backgroundColor: p.cr, borderBottomColor: p.tx3+'20' }]}>
          {(['sig','pastel','basic'] as const).map(g => (
            <TouchableOpacity key={g}
              style={[s.groupBtn, group === g && { borderBottomColor: p.pri, borderBottomWidth: 2 }]}
              onPress={() => { setGroup(g); setSelIdx(-1); setPreview(null); }}>
              <Text style={[s.groupTxt, { color: group === g ? p.pri : p.tx3 }]}>
                {{ sig:'시그니처', pastel:'파스텔', basic:'기본' }[g]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: 16 }}>
          <Text style={[s.groupLabel, { color: p.tx3 }]}>{groupLabel[group]}</Text>

          {/* 팔레트 그리드 */}
          <View style={s.palette}>
            {themes.map((t, i) => (
              <TouchableOpacity key={t.name}
                style={[s.swatch, { backgroundColor: t.pri },
                  selIdx === i && { borderColor: p.tx, borderWidth: 3 }]}
                onPress={() => pickTheme(i)}>
                <Text style={s.swatchName}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 미리보기 */}
          {preview && (
            <View style={[s.previewBox, { borderColor: prev.pri }]}>
              <View style={[s.previewHd, { backgroundColor: prev.bg2 }]}>
                <Text style={[s.previewHdTxt, { color: prev.tx }]}>{preview.name} 테마 미리보기</Text>
                <TouchableOpacity onPress={() => { setPreview(null); setSelIdx(-1); }}>
                  <Ionicons name="close" size={16} color={prev.tx2} />
                </TouchableOpacity>
              </View>
              {/* 미니 달력 */}
              <View style={{ padding: 10 }}>
                <View style={[s.miniCalHd, { backgroundColor: prev.bg2 }]}>
                  <Text style={[s.miniCalTitle, { color: prev.tx }]}>2026년 4월</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <View style={[s.miniBadge, { backgroundColor: prev.priL ?? prev.pri+'30' }]}>
                      <Text style={[s.miniBadgeTxt, { color: prev.priT ?? prev.pri }]}>채용</Text>
                    </View>
                    <View style={[s.miniBadge, { backgroundColor: prev.danL ?? prev.dan+'30' }]}>
                      <Text style={[s.miniBadgeTxt, { color: prev.danT ?? prev.dan }]}>마감</Text>
                    </View>
                  </View>
                </View>
                {/* 버튼/배지 미리보기 */}
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 10 }}>
                  <View style={[s.prevBtn, { backgroundColor: prev.pri }]}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>기본 버튼</Text>
                  </View>
                  <View style={[s.prevBadge, { backgroundColor: prev.priL ?? prev.pri+'25' }]}>
                    <Text style={{ color: prev.priT ?? prev.pri, fontSize: 10, fontWeight: '500' }}>채용</Text>
                  </View>
                  <View style={[s.prevBadge, { backgroundColor: prev.danL ?? prev.dan+'25' }]}>
                    <Text style={{ color: prev.danT ?? prev.dan, fontSize: 10, fontWeight: '500' }}>마감</Text>
                  </View>
                  {/* 토글 */}
                  <View style={[s.prevTog, { backgroundColor: prev.pri }]}>
                    <View style={s.prevTogKnob} />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* 다크 모드 */}
          <View style={[s.darkRow, { backgroundColor: p.cr, borderColor: p.tx3+'20' }]}>
            <View>
              <Text style={[s.darkLabel, { color: p.tx }]}>다크 모드</Text>
              <Text style={[s.darkDesc, { color: p.tx3 }]}>앱 전체 어두운 테마</Text>
            </View>
            <TouchableOpacity style={[s.tog, { backgroundColor: p.bg3 }]}>
              <View style={s.togKnob} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  backBtn:      { marginRight: 8, padding: 2 },
  title:        { fontSize: 18, fontWeight: '600' },
  groupRow:     { flexDirection: 'row', borderBottomWidth: 0.5 },
  groupBtn:     { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  groupTxt:     { fontSize: 13, fontWeight: '500' },
  groupLabel:   { fontSize: 11, marginBottom: 10 },
  palette:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  swatch:       { width: '18%', aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4, borderWidth: 2, borderColor: 'transparent' },
  swatchName:   { fontSize: 7, color: '#fff', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 2 },
  previewBox:   { borderRadius: 12, borderWidth: 1.5, overflow: 'hidden', marginBottom: 16 },
  previewHd:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  previewHdTxt: { fontSize: 12, fontWeight: '600' },
  miniCalHd:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 8, marginBottom: 4 },
  miniCalTitle: { fontSize: 12, fontWeight: '600' },
  miniBadge:    { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  miniBadgeTxt: { fontSize: 10, fontWeight: '500' },
  prevBtn:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  prevBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  prevTog:      { width: 34, height: 20, borderRadius: 99, justifyContent: 'center', paddingHorizontal: 2 },
  prevTogKnob:  { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', alignSelf: 'flex-end' },
  darkRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 10, borderWidth: 0.5 },
  darkLabel:    { fontSize: 14, fontWeight: '500' },
  darkDesc:     { fontSize: 11, marginTop: 2 },
  tog:          { width: 44, height: 26, borderRadius: 99, justifyContent: 'center', paddingHorizontal: 2 },
  togKnob:      { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
});