import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';

const CAT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  job:      { bg: '#c4d8c4', text: '#2a4a2a', dot: '#4a6741' },
  study:    { bg: '#d8d8a8', text: '#4a4a10', dot: '#a8a85a' },
  personal: { bg: '#e0c8b8', text: '#6a3820', dot: '#b85c44' },
  deadline: { bg: '#e8c4be', text: '#7a2828', dot: '#c07070' },
};

const CAT_LABEL: Record<string, string> = {
  job: '채용', study: '스터디', personal: '개인', deadline: '마감',
};

function dday(ds: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const t = new Date(ds);   t.setHours(0,0,0,0);
  return Math.ceil((t.getTime() - today.getTime()) / 86400000);
}

type CatFilter = 'all' | 'job' | 'study' | 'personal' | 'deadline';

export default function ListScreen() {
  const { events, addEvent, deleteEvent, palette } = useAppStore();

  const [catFilter,   setCatFilter]   = useState<CatFilter>('all');
  const [showAdd,     setShowAdd]     = useState(false);
  const [newTitle,    setNewTitle]    = useState('');
  const [newDate,     setNewDate]     = useState('');
  const [newCat,      setNewCat]      = useState<'job'|'study'|'personal'|'deadline'>('job');

  const filtered = events
    .filter(e => catFilter === 'all' || e.cat === catFilter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 월별 그룹
  const grouped: { month: string; items: typeof events }[] = [];
  filtered.forEach(e => {
    const d  = new Date(e.date);
    const mo = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    const last = grouped[grouped.length - 1];
    if (last && last.month === mo) last.items.push(e);
    else grouped.push({ month: mo, items: [e] });
  });

  function handleAdd() {
    if (!newTitle.trim() || !newDate) return;
    addEvent({ title: newTitle.trim(), date: newDate, cat: newCat });
    setNewTitle(''); setNewDate(''); setNewCat('job');
    setShowAdd(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>

      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: palette.cr, borderBottomColor: palette.tx3+'30' }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: palette.tx }]}>일정 목록</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: palette.pri }]}
            onPress={() => setShowAdd(true)}>
            <Ionicons name="add" size={16} color={palette.cr} />
            <Text style={[styles.addBtnTxt, { color: palette.cr }]}>일정 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 카테고리 필터 탭 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {(['all','job','study','personal','deadline'] as const).map(cat => {
              const on = catFilter === cat;
              const c  = cat !== 'all' ? CAT_COLORS[cat] : null;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    { borderColor: palette.tx3+'40', backgroundColor: palette.cr },
                    on && cat === 'all' && { backgroundColor: palette.pri, borderColor: palette.pri },
                    on && cat !== 'all' && { backgroundColor: c!.bg, borderColor: c!.text+'60' },
                  ]}
                  onPress={() => setCatFilter(cat)}>
                  {cat !== 'all' && (
                    <View style={[styles.filterDot, { backgroundColor: on ? c!.dot : palette.tx3 }]} />
                  )}
                  <Text style={[
                    styles.filterTxt,
                    { color: on && cat === 'all' ? palette.cr : on ? c!.text : palette.tx2 },
                  ]}>
                    {cat === 'all' ? '전체' : CAT_LABEL[cat]}
                  </Text>
                  <Text style={[styles.filterCount, {
                    color: on && cat === 'all' ? 'rgba(255,255,255,0.7)' : palette.tx3,
                    backgroundColor: on && cat === 'all' ? 'rgba(255,255,255,0.2)' : palette.bg2,
                  }]}>
                    {cat === 'all' ? events.length : events.filter(e => e.cat === cat).length}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 목록 */}
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={40} color={palette.tx3} />
            <Text style={[styles.emptyTxt, { color: palette.tx3 }]}>일정이 없어요</Text>
          </View>
        )}

        {grouped.map(group => (
          <View key={group.month}>
            {/* 월 헤더 */}
            <Text style={[styles.monthLabel, { color: palette.tx3 }]}>{group.month}</Text>

            {group.items.map(e => {
              const dd     = dday(e.date);
              const ddText = dd < 0 ? `${Math.abs(dd)}일 지남` : dd === 0 ? '오늘' : `D-${dd}`;
              const ddColor = dd < 0 ? palette.tx3 : dd <= 3 ? palette.dan : dd <= 7 ? palette.acc : palette.tx3;
              const c = CAT_COLORS[e.cat];

              return (
                <View key={e.id} style={[styles.item, { backgroundColor: palette.cr, borderColor: palette.tx3+'25' }]}>

                  {/* 왼쪽 카테고리 바 */}
                  <View style={[styles.catBar, { backgroundColor: c.dot }]} />

                  <View style={{ flex: 1, paddingLeft: 10 }}>
                    <Text style={[styles.itemTitle, { color: palette.tx }]}>{e.title}</Text>
                    <View style={styles.itemMeta}>
                      <Text style={[styles.itemDate, { color: palette.tx3 }]}>
                        {e.date.replace(/-/g, '/')}
                      </Text>
                      <View style={[styles.catBadge, { backgroundColor: c.bg }]}>
                        <Text style={[styles.catBadgeTxt, { color: c.text }]}>{CAT_LABEL[e.cat]}</Text>
                      </View>
                    </View>
                  </View>

                  {/* D-day */}
                  <Text style={[styles.ddTag, { color: ddColor }]}>{ddText}</Text>

                  {/* 삭제 버튼 */}
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteEvent(e.id)}>
                    <Ionicons name="trash-outline" size={14} color={palette.tx3} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* 일정 추가 모달 */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { backgroundColor: palette.cr }]}>

            <View style={styles.modalHd}>
              <Text style={[styles.modalTitle, { color: palette.tx }]}>일정 추가</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={20} color={palette.tx2} />
              </TouchableOpacity>
            </View>

            {/* 제목 */}
            <Text style={[styles.inputLabel, { color: palette.tx3 }]}>제목</Text>
            <TextInput
              style={[styles.input, { backgroundColor: palette.bg2, color: palette.tx, borderColor: palette.tx3+'40' }]}
              placeholder="일정 제목"
              placeholderTextColor={palette.tx3}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            {/* 날짜 */}
            <Text style={[styles.inputLabel, { color: palette.tx3 }]}>날짜</Text>
            <TextInput
              style={[styles.input, { backgroundColor: palette.bg2, color: palette.tx, borderColor: palette.tx3+'40' }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={palette.tx3}
              value={newDate}
              onChangeText={setNewDate}
            />

            {/* 카테고리 */}
            <Text style={[styles.inputLabel, { color: palette.tx3 }]}>카테고리</Text>
            <View style={styles.catBtnRow}>
              {(['job','study','personal','deadline'] as const).map(cat => {
                const on = newCat === cat;
                const c  = CAT_COLORS[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catBtn,
                      { borderColor: palette.tx3+'40', backgroundColor: palette.cr },
                      on && { backgroundColor: c.bg, borderColor: c.text+'60' },
                    ]}
                    onPress={() => setNewCat(cat)}>
                    <Text style={[styles.catBtnTxt, { color: on ? c.text : palette.tx2 }]}>
                      {CAT_LABEL[cat]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 버튼 */}
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: palette.tx3+'40' }]}
                onPress={() => setShowAdd(false)}>
                <Text style={{ color: palette.tx2, fontSize: 13 }}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.okBtn, { backgroundColor: palette.pri }]}
                onPress={handleAdd}>
                <Text style={{ color: palette.cr, fontSize: 13, fontWeight: '600' }}>추가</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:       { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 0.5 },
  headerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title:        { fontSize: 18, fontWeight: '600' },
  addBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  addBtnTxt:    { fontSize: 12, fontWeight: '500' },
  filterRow:    { flexDirection: 'row', gap: 5, paddingVertical: 2, paddingRight: 16 },
  filterChip:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, borderWidth: 1.5 },
  filterDot:    { width: 6, height: 6, borderRadius: 3 },
  filterTxt:    { fontSize: 11, fontWeight: '500' },
  filterCount:  { fontSize: 10, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 99, overflow: 'hidden' },
  empty:        { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTxt:     { fontSize: 13 },
  monthLabel:   { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6, marginTop: 4 },
  item:         { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 0.5, marginBottom: 6, overflow: 'hidden' },
  catBar:       { width: 4, alignSelf: 'stretch' },
  itemTitle:    { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  itemMeta:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemDate:     { fontSize: 11 },
  catBadge:     { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  catBadgeTxt:  { fontSize: 10, fontWeight: '500' },
  ddTag:        { fontSize: 11, fontWeight: '600', paddingHorizontal: 8 },
  deleteBtn:    { padding: 12 },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBox:     { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalHd:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle:   { fontSize: 15, fontWeight: '600' },
  inputLabel:   { fontSize: 11, marginBottom: 5 },
  input:        { padding: 10, borderRadius: 8, borderWidth: 0.5, fontSize: 13, marginBottom: 14 },
  catBtnRow:    { flexDirection: 'row', gap: 6, marginBottom: 20, flexWrap: 'wrap' },
  catBtn:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  catBtnTxt:    { fontSize: 12, fontWeight: '500' },
  modalBtns:    { flexDirection: 'row', gap: 8 },
  cancelBtn:    { flex: 1, padding: 12, borderRadius: 8, borderWidth: 0.5, alignItems: 'center' },
  okBtn:        { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
});