import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';
import AIParsing from '../../src/components/AIParsing';

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  '지원완료':    { bg: '#d8d8a8', text: '#4a4a10' },
  '서류합격':    { bg: '#c4d8c4', text: '#2a4a2a' },
  '필기/인적성': { bg: '#e0c8b8', text: '#6a3820' },
  '면접':        { bg: '#dcd8e8', text: '#2a2a4a' },
  '최종':        { bg: '#e8c4be', text: '#7a2828' },
  '합격':        { bg: '#c4d8c4', text: '#2a4a2a' },
  '불합격':      { bg: '#eeebe2', text: '#6a6558' },
};

const STAGES = ['지원완료','서류합격','필기/인적성','면접','최종','합격','불합격'];

const PL: Record<string,string> = { high:'높음', mid:'보통', low:'낮음' };

function dday(ds: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const t = new Date(ds);   t.setHours(0,0,0,0);
  return Math.ceil((t.getTime() - today.getTime()) / 86400000);
}

type Seg = 'apps' | 'goals' | 'ai' | 'report';

export default function MenuScreen() {
  const { apps, todos, toggleTodo, addApp, addEvent, palette, roles } = useAppStore();

  const [seg,        setSeg]        = useState<Seg>('apps');
  const [showAddApp, setShowAddApp] = useState(false);
  const [newCo,      setNewCo]      = useState('');
  const [newRole,    setNewRole]    = useState(roles.filter(r => r !== '전체')[0] ?? '');
  const [newStage,   setNewStage]   = useState('지원완료');

  const total  = apps.length;
  const intvw  = apps.filter(a => ['면접','최종'].includes(a.stage)).length;
  const pass   = apps.filter(a => a.stage === '합격').length;
  const done   = todos.filter(t => t.done).length;
  const pct    = todos.length ? Math.round(done / todos.length * 100) : 0;

  // 마감 경고
  const warnings = (useAppStore.getState().events ?? [])
    .filter(e => e.cat === 'deadline' && dday(e.date) >= 0 && dday(e.date) <= 3);

  function handleAddApp() {
    if (!newCo.trim()) return;
    addApp({ co: newCo.trim(), role: newRole, stage: newStage });
    setNewCo(''); setShowAddApp(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>

      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: palette.cr, borderBottomColor: palette.tx3+'30' }]}>
        <Text style={[styles.title, { color: palette.tx }]}>관리</Text>
      </View>

      {/* 세그먼트 탭 */}
      <View style={[styles.segWrap, { backgroundColor: palette.cr, borderBottomColor: palette.tx3+'20' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.segRow}>
            {([
              { key: 'apps',   label: '지원현황' },
              { key: 'goals',  label: '할 일'    },
              { key: 'ai',     label: 'AI 파싱'  },
              { key: 'report', label: '리포트'   },
            ] as const).map(s => (
              <TouchableOpacity
                key={s.key}
                style={[
                  styles.segBtn,
                  { borderColor: palette.tx3+'30', backgroundColor: palette.cr },
                  seg === s.key && { backgroundColor: palette.pri, borderColor: palette.pri },
                ]}
                onPress={() => setSeg(s.key)}>
                <Text style={[styles.segTxt, { color: seg === s.key ? palette.cr : palette.tx2 }]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* ── 지원현황 탭 */}
        {seg === 'apps' && (
          <View>
            {/* 마감 경고 */}
            {warnings.map(e => (
              <View key={e.id} style={[styles.warnBox, { backgroundColor: palette.danL ?? '#f0dcd8', borderColor: palette.dan }]}>
                <View style={[styles.warnDot, { backgroundColor: palette.dan }]} />
                <Text style={[styles.warnTxt, { color: palette.danT ?? '#7a2828' }]}>
                  마감 D-{dday(e.date)} · {e.title}
                </Text>
              </View>
            ))}

            {/* 통계 4칸 */}
            <View style={styles.stat4}>
              {[
                { label: '총 지원', value: total,  color: palette.tx   },
                { label: '서류/필기', value: apps.filter(a=>['서류합격','필기/인적성'].includes(a.stage)).length, color: palette.acc },
                { label: '면접',    value: intvw,  color: '#6a7480'    },
                { label: '합격',    value: pass,   color: palette.pri  },
              ].map(st => (
                <View key={st.label} style={[styles.statBox, { backgroundColor: palette.bg2 }]}>
                  <Text style={[styles.statNum, { color: st.color }]}>{st.value}</Text>
                  <Text style={[styles.statLbl, { color: palette.tx2 }]}>{st.label}</Text>
                </View>
              ))}
            </View>

            {/* 전형 단계 진행바 */}
            <Text style={[styles.sectionLabel, { color: palette.tx2 }]}>전형 단계</Text>
            {[
              ['지원완료', palette.acc ],
              ['서류합격', palette.pri ],
              ['필기/인적성', '#b85c44'],
              ['면접',     '#6a7480'  ],
              ['최종',     palette.dan],
              ['합격',     palette.pri],
            ].map(([stage, color]) => {
              const cnt = apps.filter(a => a.stage === stage).length;
              const max = Math.max(...STAGES.map(s => apps.filter(a => a.stage === s).length), 1);
              return (
                <View key={stage} style={styles.barRow}>
                  <Text style={[styles.barLabel, { color: palette.tx2 }]}>{stage}</Text>
                  <View style={[styles.barTrack, { backgroundColor: palette.bg3 }]}>
                    <View style={[styles.barFill, { width: `${Math.round(cnt/max*100)}%` as any, backgroundColor: color as string }]} />
                  </View>
                  <Text style={[styles.barVal, { color: palette.tx }]}>{cnt}</Text>
                </View>
              );
            })}

            {/* 칸반 */}
            <Text style={[styles.sectionLabel, { color: palette.tx2, marginTop: 16 }]}>칸반 보드</Text>
            <View style={styles.kanban}>
              {[
                { label: '지원완료',      stages: ['지원완료']                              },
                { label: '서류·필기·면접', stages: ['서류합격','필기/인적성','면접','최종'] },
                { label: '합격·불합격',   stages: ['합격','불합격']                         },
              ].map(col => {
                const cards = apps.filter(a => col.stages.includes(a.stage));
                return (
                  <View key={col.label} style={[styles.kanbanCol, { backgroundColor: palette.bg2 }]}>
                    <View style={styles.kanbanHd}>
                      <Text style={[styles.kanbanHdTxt, { color: palette.tx2 }]} numberOfLines={1}>
                        {col.label}
                      </Text>
                      <View style={[styles.kanbanBadge, { backgroundColor: palette.cr }]}>
                        <Text style={[styles.kanbanBadgeTxt, { color: palette.tx2 }]}>{cards.length}</Text>
                      </View>
                    </View>
                    {cards.length === 0
                      ? <Text style={[styles.kanbanEmpty, { color: palette.tx3 }]}>없음</Text>
                      : cards.map(a => (
                        <View key={a.id} style={[styles.kanbanCard, { backgroundColor: palette.cr, borderColor: palette.tx3+'25' }]}>
                          <Text style={[styles.kanbanCo,   { color: palette.tx  }]}>{a.co}</Text>
                          <Text style={[styles.kanbanRole, { color: palette.tx2 }]}>{a.role}</Text>
                          <View style={[styles.stagePill, { backgroundColor: STAGE_COLORS[a.stage]?.bg ?? palette.bg2 }]}>
                            <Text style={[styles.stageTxt, { color: STAGE_COLORS[a.stage]?.text ?? palette.tx2 }]}>
                              {a.stage}
                            </Text>
                          </View>
                          {/* 진행 바 */}
                          <View style={[styles.progTrack, { backgroundColor: palette.bg3 }]}>
                            <View style={[styles.progFill, { width: `${a.prog}%` as any, backgroundColor: palette.pri }]} />
                          </View>
                        </View>
                      ))
                    }
                  </View>
                );
              })}
            </View>

            {/* 기업 추가 버튼 */}
            <TouchableOpacity
              style={[styles.addBtn, { borderColor: palette.tx3+'40' }]}
              onPress={() => setShowAddApp(true)}>
              <Ionicons name="add" size={14} color={palette.tx2} />
              <Text style={[styles.addBtnTxt, { color: palette.tx2 }]}>기업 추가</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── 할 일 탭 */}
        {seg === 'goals' && (
          <View>
            {/* 진행률 */}
            <View style={[styles.goalTop, { backgroundColor: palette.cr, borderColor: palette.tx3+'20' }]}>
              <View>
                <Text style={[styles.goalPct, { color: palette.tx }]}>{pct}%</Text>
                <Text style={[styles.goalSub, { color: palette.tx3 }]}>달성률</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.goalDone, { color: palette.tx }]}>{done}</Text>
                <Text style={[styles.goalSub, { color: palette.tx3 }]}>완료 / {todos.length}개</Text>
              </View>
            </View>
            <View style={[styles.bigBar, { backgroundColor: palette.bg3 }]}>
              <View style={[styles.bigBarFill, { width: `${pct}%` as any, backgroundColor: palette.acc }]} />
            </View>

            {/* 할일 목록 */}
            {todos.map(t => {
              const dd    = t.due ? dday(t.due) : null;
              const isOv  = dd !== null && dd < 0 && !t.done;
              const ddTxt = dd === null ? '' : dd < 0 ? `${Math.abs(dd)}일 초과` : dd === 0 ? '오늘 마감' : `D-${dd}`;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.todoItem, { backgroundColor: palette.cr, borderColor: isOv ? palette.dan : palette.tx3+'25' }]}
                  onPress={() => toggleTodo(t.id)}>
                  <View style={[styles.chk, t.done && { backgroundColor: palette.acc, borderColor: palette.acc }]}>
                    {t.done && <Ionicons name="checkmark" size={10} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.todoTxt, { color: palette.tx }, t.done && { textDecorationLine: 'line-through', color: palette.tx3 }]}>
                      {t.text}
                    </Text>
                    {!!ddTxt && (
                      <Text style={[styles.todoDue, { color: isOv || dd === 0 ? palette.dan : palette.tx3 }]}>
                        {ddTxt}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.priPill, {
                    backgroundColor: t.pri==='high' ? '#f0dcd8' : t.pri==='mid' ? '#d8d8a8' : '#c4d8c4'
                  }]}>
                    <Text style={{ fontSize: 9, color: palette.tx2 }}>{PL[t.pri]}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        
        {/* ── AI 파싱 탭 */}
        {seg === 'ai' && (
          <View>
            <AIParsing
              palette={palette}
              onAdd={(event: any) => addEvent({ ...event, id: Date.now() })}
            />
          </View>
        )}
        {/* ── 리포트 탭 */}
        {seg === 'report' && (
          <View>
            <View style={styles.stat4}>
              {[
                { label: '지원 기업', value: total,         color: palette.tx  },
                { label: '합격',      value: pass,          color: palette.pri },
                { label: '면접',      value: intvw,         color: '#6a7480'   },
                { label: '달성률',    value: `${pct}%`,     color: palette.acc },
              ].map(st => (
                <View key={st.label} style={[styles.statBox, { backgroundColor: palette.bg2 }]}>
                  <Text style={[styles.statNum, { color: st.color }]}>{st.value}</Text>
                  <Text style={[styles.statLbl, { color: palette.tx2 }]}>{st.label}</Text>
                </View>
              ))}
            </View>

            {/* 전형 단계 바 */}
            <Text style={[styles.sectionLabel, { color: palette.tx2 }]}>전형 단계</Text>
            {[
              ['지원완료', palette.acc],
              ['서류합격', palette.pri],
              ['필기/인적성', '#b85c44'],
              ['면접', '#6a7480'],
              ['최종', palette.dan],
              ['합격', palette.pri],
              ['불합격', palette.tx3],
            ].map(([stage, color]) => {
              const cnt = apps.filter(a => a.stage === stage).length;
              const max = Math.max(...STAGES.map(s => apps.filter(a => a.stage === s).length), 1);
              return (
                <View key={stage} style={styles.barRow}>
                  <Text style={[styles.barLabel, { color: palette.tx2 }]}>{stage}</Text>
                  <View style={[styles.barTrack, { backgroundColor: palette.bg3 }]}>
                    <View style={[styles.barFill, { width: `${Math.round(cnt/max*100)}%` as any, backgroundColor: color as string }]} />
                  </View>
                  <Text style={[styles.barVal, { color: palette.tx }]}>{cnt}</Text>
                </View>
              );
            })}

            {/* 직무별 바 */}
            <Text style={[styles.sectionLabel, { color: palette.tx2, marginTop: 16 }]}>직무별</Text>
            {roles.filter(r => r !== '전체').map(r => {
              const cnt = apps.filter(a => a.role === r).length;
              const max = Math.max(...roles.filter(r2 => r2 !== '전체').map(r2 => apps.filter(a => a.role === r2).length), 1);
              return (
                <View key={r} style={styles.barRow}>
                  <Text style={[styles.barLabel, { color: palette.tx2 }]}>{r}</Text>
                  <View style={[styles.barTrack, { backgroundColor: palette.bg3 }]}>
                    <View style={[styles.barFill, { width: `${Math.round(cnt/max*100)}%` as any, backgroundColor: palette.acc }]} />
                  </View>
                  <Text style={[styles.barVal, { color: palette.tx }]}>{cnt}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* 기업 추가 모달 */}
      <Modal visible={showAddApp} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { backgroundColor: palette.cr }]}>
            <View style={styles.modalHd}>
              <Text style={[styles.modalTitle, { color: palette.tx }]}>기업 추가</Text>
              <TouchableOpacity onPress={() => setShowAddApp(false)}>
                <Ionicons name="close" size={20} color={palette.tx2} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: palette.tx3 }]}>기업명</Text>
            <TextInput
              style={[styles.input, { backgroundColor: palette.bg2, color: palette.tx, borderColor: palette.tx3+'40' }]}
              placeholder="예) 카카오, 삼성전자"
              placeholderTextColor={palette.tx3}
              value={newCo}
              onChangeText={setNewCo}
            />

            <Text style={[styles.inputLabel, { color: palette.tx3 }]}>직무</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {roles.filter(r => r !== '전체').map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleBtn, { borderColor: palette.tx3+'40', backgroundColor: palette.cr },
                      newRole === r && { backgroundColor: palette.pri, borderColor: palette.pri }]}
                    onPress={() => setNewRole(r)}>
                    <Text style={[styles.roleBtnTxt, { color: newRole === r ? palette.cr : palette.tx2 }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.inputLabel, { color: palette.tx3 }]}>전형 단계</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {STAGES.map(st => (
                <TouchableOpacity
                  key={st}
                  style={[styles.roleBtn, { borderColor: palette.tx3+'40', backgroundColor: palette.cr },
                    newStage === st && { backgroundColor: STAGE_COLORS[st].bg, borderColor: STAGE_COLORS[st].text+'60' }]}
                  onPress={() => setNewStage(st)}>
                  <Text style={[styles.roleBtnTxt, { color: newStage === st ? STAGE_COLORS[st].text : palette.tx2 }]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: palette.tx3+'40' }]}
                onPress={() => setShowAddApp(false)}>
                <Text style={{ color: palette.tx2, fontSize: 13 }}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.okBtn, { backgroundColor: palette.pri }]}
                onPress={handleAddApp}>
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
  header:        { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  title:         { fontSize: 18, fontWeight: '600' },
  segWrap:       { borderBottomWidth: 0.5, paddingHorizontal: 16, paddingVertical: 10 },
  segRow:        { flexDirection: 'row', gap: 6 },
  segBtn:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 0.5 },
  segTxt:        { fontSize: 12, fontWeight: '500' },
  warnBox:       { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8, borderWidth: 0.5, marginBottom: 8 },
  warnDot:       { width: 6, height: 6, borderRadius: 3 },
  warnTxt:       { fontSize: 12 },
  stat4:         { flexDirection: 'row', gap: 6, marginBottom: 16 },
  statBox:       { flex: 1, borderRadius: 8, padding: 8, alignItems: 'center' },
  statNum:       { fontSize: 16, fontWeight: '700' },
  statLbl:       { fontSize: 9, marginTop: 1 },
  sectionLabel:  { fontSize: 11, fontWeight: '600', marginBottom: 8, color: '#6a6558' },
  barRow:        { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  barLabel:      { fontSize: 11, minWidth: 68 },
  barTrack:      { flex: 1, height: 10, borderRadius: 3, overflow: 'hidden' },
  barFill:       { height: '100%', borderRadius: 3 },
  barVal:        { fontSize: 11, fontWeight: '500', minWidth: 16, textAlign: 'right' },
  kanban:        { flexDirection: 'row', gap: 8, marginBottom: 10 },
  kanbanCol:     { flex: 1, borderRadius: 10, padding: 8 },
  kanbanHd:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.08)' },
  kanbanHdTxt:   { fontSize: 10, fontWeight: '700', flex: 1, marginRight: 4 },
  kanbanBadge:   { borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  kanbanBadgeTxt:{ fontSize: 10, fontWeight: '700' },
  kanbanEmpty:   { fontSize: 10, textAlign: 'center', paddingVertical: 8 },
  kanbanCard:    { borderRadius: 8, padding: 8, marginBottom: 6, borderWidth: 0.5 },
  kanbanCo:      { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  kanbanRole:    { fontSize: 10, marginBottom: 6 },
  stagePill:     { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, alignSelf: 'flex-start', marginBottom: 6 },
  stageTxt:      { fontSize: 9, fontWeight: '600' },
  progTrack:     { height: 3, borderRadius: 99, overflow: 'hidden' },
  progFill:      { height: '100%', borderRadius: 99 },
  goalTop:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 10, borderWidth: 0.5, marginBottom: 10 },
  goalPct:       { fontSize: 22, fontWeight: '700' },
  goalDone:      { fontSize: 20, fontWeight: '600' },
  goalSub:       { fontSize: 11, marginTop: 2 },
  bigBar:        { height: 6, borderRadius: 99, marginBottom: 14, overflow: 'hidden' },
  bigBarFill:    { height: '100%', borderRadius: 99 },
  todoItem:      { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, borderRadius: 10, borderWidth: 0.5, marginBottom: 5 },
  chk:           { width: 17, height: 17, borderRadius: 99, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  todoTxt:       { fontSize: 13 },
  todoDue:       { fontSize: 10, marginTop: 2 },
  priPill:       { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 99 },
  addBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 10, borderRadius: 8, borderWidth: 0.5, borderStyle: 'dashed', marginTop: 4 },
  addBtnTxt:     { fontSize: 12 },
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBox:      { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalHd:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle:    { fontSize: 15, fontWeight: '600' },
  inputLabel:    { fontSize: 11, marginBottom: 5 },
  input:         { padding: 10, borderRadius: 8, borderWidth: 0.5, fontSize: 13, marginBottom: 14 },
  roleBtn:       { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5 },
  roleBtnTxt:    { fontSize: 11, fontWeight: '500' },
  modalBtns:     { flexDirection: 'row', gap: 8 },
  cancelBtn:     { flex: 1, padding: 12, borderRadius: 8, borderWidth: 0.5, alignItems: 'center' },
  okBtn:         { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
});