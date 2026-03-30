import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useAppStore from '../../src/store/useAppStore';

export default function ProfileScreen() {
  const { apps, palette } = useAppStore();
  const router = useRouter();
  const p = palette;

  const total = apps.length;
  const intvw = apps.filter(a => ['면접','최종'].includes(a.stage)).length;
  const pass  = apps.filter(a => a.stage === '합격').length;

  function getOnPress(label: string) {
    switch(label) {
      case '프로필 수정':    return () => router.push('/settings/profile-edit');
      case '비밀번호 변경':  return () => router.push('/settings/password');
      case '로그아웃':       return () => Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
                                { text: '취소', style: 'cancel' },
                                { text: '로그아웃', style: 'destructive', onPress: () => {} },
                              ]);
      case '일정 표시 방법': return () => router.push('/settings/cal-display');
      case '외부 캘린더':    return () => router.push('/settings/cal-sync');
      case '테마 설정':      return () => router.push('/settings/theme');
      case '알림 설정':      return () => router.push('/settings/noti');
      case '목표 설정':      return () => router.push('/settings/goal');
      default:               return () => {};
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={[styles.header, { backgroundColor: p.cr, borderBottomColor: p.tx3+'30' }]}>
        <Text style={[styles.title, { color: p.tx }]}>내 계정</Text>
      </View>

      <ScrollView>
        {/* 프로필 */}
        <View style={[styles.profileBox, { backgroundColor: p.cr, borderBottomColor: p.tx3+'20' }]}>
          <View style={[styles.avatar, { backgroundColor: p.bg2 }]}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </View>
          <Text style={[styles.name,  { color: p.tx  }]}>김취준</Text>
          <Text style={[styles.email, { color: p.tx3 }]}>jjun@email.com</Text>

          {/* Pro 전환 버튼 */}
          <TouchableOpacity
            style={{ marginBottom:14, paddingHorizontal:20, paddingVertical:8, borderRadius:99, borderWidth:1, borderColor:p.tx3+'40', flexDirection:'row', alignItems:'center', gap:6 }}
            onPress={() => router.push('/settings/pro')}>
            <Ionicons name="star-outline" size={14} color={p.pri} />
            <Text style={{ fontSize:12, fontWeight:'500', color:p.pri }}>Pro로 전환하기</Text>
          </TouchableOpacity>

          {/* 통계 */}
          <View style={styles.statsRow}>
            {[
              { label: '총 지원', value: total, color: p.tx     },
              { label: '면접',    value: intvw, color: '#b85c44' },
              { label: '합격',    value: pass,  color: p.pri     },
            ].map(s => (
              <View key={s.label} style={[styles.statBox, { backgroundColor: p.bg2 }]}>
                <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLbl, { color: p.tx2   }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 메뉴 그룹 */}
        {[
          {
            group: '계정',
            items: [
              { label: '프로필 수정',   desc: '이름, 이메일 변경' },
              { label: '비밀번호 변경', desc: ''                   },
              { label: '로그아웃',      desc: '', danger: true     },
            ],
          },
          {
            group: '캘린더 설정',
            items: [
              { label: '일정 표시 방법', desc: '기본 뷰, 주 시작일'         },
              { label: '외부 캘린더',    desc: 'Google · Apple 동기화'      },
              { label: '목표 설정',      desc: '취업 시기, 기업 수, 직무'   },
              { label: '테마 설정',      desc: '색상, 폰트 크기, 다크 모드' },
            ],
          },
          {
            group: '알림 설정',
            items: [
              { label: '알림 설정', desc: '마감 알림, 리마인더' },
            ],
          },
        ].map(section => (
          <View key={section.group} style={{ marginTop: 8 }}>
            <Text style={[styles.groupLabel, { color: p.tx3 }]}>{section.group}</Text>
            <View style={{ backgroundColor: p.cr }}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuRow,
                    { borderBottomColor: p.tx3+'20' },
                    idx === section.items.length - 1 && { borderBottomWidth: 0 },
                  ]}
                  onPress={getOnPress(item.label)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuLabel, { color: (item as any).danger ? p.dan : p.tx }]}>
                      {item.label}
                    </Text>
                    {!!item.desc && (
                      <Text style={[styles.menuDesc, { color: p.tx3 }]}>{item.desc}</Text>
                    )}
                  </View>
                  {!(item as any).danger && (
                    <Text style={[styles.chevron, { color: p.tx3 }]}>›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:     { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5 },
  title:      { fontSize: 18, fontWeight: '600' },
  profileBox: { alignItems: 'center', padding: 24, borderBottomWidth: 0.5 },
  avatar:     { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  name:       { fontSize: 16, fontWeight: '600' },
  email:      { fontSize: 12, marginTop: 2, marginBottom: 14 },
  statsRow:   { flexDirection: 'row', gap: 8, width: '100%' },
  statBox:    { flex: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
  statNum:    { fontSize: 18, fontWeight: '700' },
  statLbl:    { fontSize: 10, marginTop: 2 },
  groupLabel: { fontSize: 11, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, letterSpacing: 0.2 },
  menuRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 13, borderBottomWidth: 0.5 },
  menuLabel:  { fontSize: 14 },
  menuDesc:   { fontSize: 11, marginTop: 1 },
  chevron:    { fontSize: 18 },
});