import { useState, useMemo, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, KeyboardAvoidingView, Platform, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';
import { useResponsive } from '../../src/hooks/useResponsive';
import AIParsing from '../../src/components/AIParsing';

const DAY_LABELS_SUN = ['일','월','화','수','목','금','토'];
const DAY_LABELS_MON = ['월','화','수','목','금','토','일'];

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  job:      { bg: '#c4d8c4', text: '#2a4a2a' },
  study:    { bg: '#d8d8a8', text: '#4a4a10' },
  personal: { bg: '#e0c8b8', text: '#6a3820' },
  deadline: { bg: '#e8c4be', text: '#7a2828' },
};

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  '지원완료':    { bg: '#d8d8a8', text: '#4a4a10' },
  '서류합격':    { bg: '#c4d8c4', text: '#2a4a2a' },
  '필기/인적성': { bg: '#e0c8b8', text: '#6a3820' },
  '면접':        { bg: '#dcd8e8', text: '#2a2a4a' },
  '최종':        { bg: '#e8c4be', text: '#7a2828' },
  '합격':        { bg: '#c4d8c4', text: '#2a4a2a' },
  '불합격':      { bg: '#e8e4d8', text: '#6a6558' },
};

function fmt(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
function todayStr() {
  const t = new Date();
  return fmt(t.getFullYear(), t.getMonth(), t.getDate());
}
function dday(ds: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const t = new Date(ds);   t.setHours(0,0,0,0);
  return Math.ceil((t.getTime() - today.getTime()) / 86400000);
}

type Panel = 'apps' | 'goals' | 'ai' | 'report' | null;
type PriFilter = 'all' | 'high' | 'mid' | 'low';

export default function HomeScreen() {
  const {
    events, calSettings, palette, apps, todos,
    toggleTodo, addTodo, addEvent, deleteEvent, updateEvent,
    roles, activeRole, setActiveRole, addRole,
  } = useAppStore();
  const { contentWidth } = useResponsive();

  // ── refs
  const scrollRef   = useRef<any>(null);

  // ── 달력 상태
  const [curYear,       setCurYear]       = useState(new Date().getFullYear());
  const [curMonth,      setCurMonth]      = useState(new Date().getMonth());
  const [activeCats,    setActiveCats]    = useState(new Set(['job','study','personal','deadline']));
  const [calGridHeight, setCalGridHeight] = useState(340);

  // ── 패널 상태
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [priFilter, setPriFilter] = useState<PriFilter>('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickYear, setPickYear]  = useState(new Date().getFullYear());
  const [pickMonth, setPickMonth] = useState(new Date().getMonth());

  // ── 직무 추가 모달
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleText, setNewRoleText] = useState('');

  // ── 할일 추가 모달
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoPri,  setNewTodoPri]  = useState<'high'|'mid'|'low'>('mid');

  // ── 일정 추가 모달
  const [showAddEvent,      setShowAddEvent]      = useState(false);
  const [newEventDate,      setNewEventDate]      = useState('');
  const [newEventTitle,     setNewEventTitle]     = useState('');
  const [newEventCat,       setNewEventCat]       = useState<'job'|'study'|'personal'|'deadline'>('job');
  const [newEventAllDay,    setNewEventAllDay]    = useState(true);
  const [newEventStartDate, setNewEventStartDate] = useState('');
  const [newEventEndDate,   setNewEventEndDate]   = useState('');
  const [newEventStartH,    setNewEventStartH]    = useState(9);
  const [newEventStartM,    setNewEventStartM]    = useState(0);
  const [newEventEndH,      setNewEventEndH]      = useState(10);
  const [newEventEndM,      setNewEventEndM]      = useState(0);

  // ── 일정 수정 모달
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editEvent,     setEditEvent]     = useState<any>(null);
  const [editTitle,     setEditTitle]     = useState('');
  const [editCat,       setEditCat]       = useState<'job'|'study'|'personal'|'deadline'>('job');

  // ── 헬퍼 함수
  function toggleCat(cat: string) {
    setActiveCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function togglePanel(p: Panel) {
    const next = openPanel === p ? null : p;
    setOpenPanel(next);
    if (next !== null) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: calGridHeight, animated: true });
      }, 100);
    }
  }

  function closeEdit() {
    setShowEditEvent(false);
    setTimeout(() => setEditEvent(null), 300);
  }

  function navCal(dir: number) {
    let m = curMonth + dir, y = curYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setCurMonth(m); setCurYear(y);
  }

  // ── 달력 계산
  const calDays = useMemo(() => {
    const isMon    = calSettings.startDay === 'mon';
    const days     = isMon ? DAY_LABELS_MON : DAY_LABELS_SUN;
    const firstRaw = new Date(curYear, curMonth, 1).getDay();
    const first    = isMon ? (firstRaw === 0 ? 6 : firstRaw - 1) : firstRaw;
    const last     = new Date(curYear, curMonth + 1, 0).getDate();
    const prev     = new Date(curYear, curMonth, 0).getDate();
    return { days, first, last, prev };
  }, [curYear, curMonth, calSettings.startDay]);

  // ── 스와이프
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) =>
      Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 10,
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_, gs) => {
      if (Math.abs(gs.dx) > Math.abs(gs.dy)) {
        if (gs.dx < -50)     navCal(1);
        else if (gs.dx > 50) navCal(-1);
      }
    },
  });

  // ── 파생 데이터
  const filteredApps  = activeRole === '전체' ? apps : apps.filter(a => a.role === activeRole);
  const doneTodos     = todos.filter(t => t.done).length;
  const todoPct       = todos.length ? Math.round(doneTodos / todos.length * 100) : 0;
  const warnings      = events.filter(e => e.cat === 'deadline' && dday(e.date) >= 0 && dday(e.date) <= 3);
  const filteredTodos = (priFilter === 'all' ? todos : todos.filter(t => t.pri === priFilter))
    .slice().sort((a, b) => a.done === b.done ? 0 : a.done ? 1 : -1);
  const PL: Record<string,string> = { high:'높음', mid:'보통', low:'낮음' };

  const s  = makeStyles(palette, contentWidth);
  const ts = todayStr();

  const modalBg = {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

        {/* ── 헤더 */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <TouchableOpacity
            style={{ flexDirection:'row', alignItems:'center', gap:4 }}
            onPress={() => {
              setPickYear(curYear);
              setPickMonth(curMonth);
              setShowDatePicker(true);
            }}>
            <Text style={s.monthTitle}>{curYear}년 {curMonth + 1}월</Text>
            <Ionicons name="chevron-down" size={14} color={palette.tx2} />
          </TouchableOpacity>
            <View style={s.navRow}>
              <TouchableOpacity style={s.navBtn} onPress={() => navCal(-1)}>
                <Text style={s.navArrow}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.todayBtn} onPress={() => {
                setCurYear(new Date().getFullYear());
                setCurMonth(new Date().getMonth());
              }}>
                <Text style={s.todayTxt}>오늘</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.navBtn} onPress={() => navCal(1)}>
                <Text style={s.navArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.catRow}>
            {(['job','study','personal','deadline'] as const).map(cat => {
              const on    = activeCats.has(cat);
              const c     = CAT_COLORS[cat];
              const label = { job:'채용', study:'스터디', personal:'개인', deadline:'마감' }[cat];
              return (
                <TouchableOpacity key={cat}
                  style={[s.catChip, on && { backgroundColor: c.bg, borderColor: c.text+'60' }]}
                  onPress={() => toggleCat(cat)}>
                  <View style={[s.catDot, { backgroundColor: on ? c.text : palette.tx3 }]} />
                  <Text style={[s.catLabel, { color: on ? c.text : palette.tx3 }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── 달력 그리드 */}
          <View
            style={s.grid}
            {...panResponder.panHandlers}
            onLayout={e => setCalGridHeight(e.nativeEvent.layout.height)}
          >
            {calDays.days.map(d => (
              <View key={d} style={s.dayHeader}>
                <Text style={s.dayHeaderTxt}>{d}</Text>
              </View>
            ))}
            {Array.from({ length: calDays.first }, (_, i) => (
              <View key={`p${i}`} style={[s.cell, s.cellOther]}>
                <Text style={s.cellNumOther}>{calDays.prev - calDays.first + i + 1}</Text>
              </View>
            ))}
            {Array.from({ length: calDays.last }, (_, i) => {
              const d         = i + 1;
              const ds        = fmt(curYear, curMonth, d);
              const isT       = ds === ts;
              const isPast    = new Date(ds) < new Date(ts);
              const dayEvents = events.filter(e => e.date === ds && activeCats.has(e.cat));
              const dd        = dday(ds);
              return (
                <TouchableOpacity
                  key={d}
                  activeOpacity={0.7}
                  style={[
                    s.cell,
                    isT && { backgroundColor: palette.pri + '18' },
                    calSettings.fadePast && isPast && !isT && { opacity: 0.35 },
                  ]}
                  onPress={() => {
                    setNewEventDate(ds);
                    setNewEventTitle('');
                    setNewEventCat('job');
                    setNewEventAllDay(true);
                    setNewEventStartDate(ds);
                    setNewEventEndDate(ds);
                    setNewEventStartH(9);
                    setNewEventStartM(0);
                    setNewEventEndH(10);
                    setNewEventEndM(0);
                    setShowAddEvent(true);
                  }}
                >
                  <View style={[s.dayNumWrap, isT && { backgroundColor: palette.pri }]}>
                    <Text style={[s.dayNum, isT && { color: '#fff' }]}>{d}</Text>
                  </View>
                  {calSettings.showDday && dd >= 0 && dd <= 3 && !isT && (
                    <Text style={[s.ddayTxt, { color: palette.dan }]}>D-{dd}</Text>
                  )}
                  {dayEvents.slice(0, 2).map(e => (
                    <TouchableOpacity
                      key={e.id}
                      style={[s.evChip, { backgroundColor: calSettings.showCat ? CAT_COLORS[e.cat].bg : palette.bg3 }]}
                      onPress={ev => {
                        ev.stopPropagation();
                        setEditEvent(e);
                        setEditTitle(e.title);
                        setEditCat(e.cat);
                        setShowEditEvent(true);
                      }}
                    >
                      <Text
                        style={[s.evTxt, { color: calSettings.showCat ? CAT_COLORS[e.cat].text : palette.tx2 }]}
                        numberOfLines={1}
                      >{e.title}</Text>
                    </TouchableOpacity>
                  ))}
                  {dayEvents.length > 2 && (
                    <Text style={[s.moreEvTxt, { color: palette.tx3 }]}>+{dayEvents.length - 2}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
            {Array.from({ length: 42 - calDays.first - calDays.last }, (_, i) => (
              <View key={`n${i}`} style={[s.cell, s.cellOther]}>
                <Text style={s.cellNumOther}>{i + 1}</Text>
              </View>
            ))}
          </View>

          {/* ── 패널 탭 버튼 */}
          <View style={s.tabRow}>
            {([
              { key: 'apps',   label: '지원현황', badge: String(filteredApps.length) },
              { key: 'goals',  label: '할 일',    badge: todoPct + '%' },
              { key: 'ai',     label: 'AI 파싱',  badge: null },
              { key: 'report', label: '리포트',   badge: null },
            ] as const).map(tab => (
              <TouchableOpacity key={tab.key}
                style={[s.tabBtn, openPanel === tab.key && { backgroundColor: palette.pri, borderColor: palette.pri }]}
                onPress={() => togglePanel(tab.key)}>
                <Text style={[s.tabBtnTxt, { color: openPanel === tab.key ? palette.cr : palette.tx2 }]}>
                  {tab.label}
                </Text>
                {tab.badge && (
                  <View style={[s.badge, { backgroundColor: openPanel === tab.key ? 'rgba(255,255,255,0.2)' : palette.bg3 }]}>
                    <Text style={[s.badgeTxt, { color: openPanel === tab.key ? palette.cr : palette.tx3 }]}>
                      {tab.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── 지원현황 패널 */}
          {openPanel === 'apps' && (
            <View style={[s.panel, { borderColor: palette.tx3+'30' }]}>
              <View style={s.panelHd}>
                <Text style={[s.panelTitle, { color: palette.tx }]}>지원현황</Text>
                <TouchableOpacity onPress={() => setOpenPanel(null)}>
                  <Ionicons name="close" size={18} color={palette.tx2} />
                </TouchableOpacity>
              </View>
              {warnings.map(e => (
                <View key={e.id} style={[s.warnBox, { backgroundColor: palette.danL ?? '#f0dcd8', borderColor: palette.dan }]}>
                  <View style={[s.warnDot, { backgroundColor: palette.dan }]} />
                  <Text style={[s.warnTxt, { color: palette.danT ?? '#7a2828' }]}>
                    마감 D-{dday(e.date)} · {e.title}
                  </Text>
                </View>
              ))}
              {/* 직무 필터 */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 2 }}>
                <View style={{ flexDirection:'row', gap:0, paddingHorizontal:10, paddingVertical:4, alignItems:'center' }}>
                  {roles.map(r => (
                    <TouchableOpacity key={r}
                      style={[s.roleChip, activeRole === r && { backgroundColor: palette.pri, borderColor: palette.pri }]}
                      onPress={() => setActiveRole(r)}
                      onLongPress={() => {
                        if (r !== '전체') useAppStore.getState().deleteRole(r);
                      }}
                    >
                      <Text style={[s.roleChipTxt, { color: activeRole === r ? palette.cr : palette.tx2 }]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={{ paddingHorizontal:10, paddingVertical:4, borderRadius:99, borderWidth:0.5, borderStyle:'dashed', borderColor:palette.tx3+'60', marginVertical:4 }}
                    onPress={() => setShowAddRole(true)}>
                    <Text style={{ fontSize:11, color:palette.tx3 }}>+ 직무</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              {/* 통계 */}
              <View style={s.stat4}>
                {[
                  { label:'총 지원',   value: filteredApps.length,                                                        color: palette.tx  },
                  { label:'서류/필기', value: filteredApps.filter(a=>['서류합격','필기/인적성'].includes(a.stage)).length, color: palette.acc },
                  { label:'면접',      value: filteredApps.filter(a=>['면접','최종'].includes(a.stage)).length,           color: '#6a7480'   },
                  { label:'합격',      value: filteredApps.filter(a=>a.stage==='합격').length,                            color: palette.pri },
                ].map(st => (
                  <View key={st.label} style={[s.statBox, { backgroundColor: palette.bg2 }]}>
                    <Text style={[s.statNum, { color: st.color }]}>{st.value}</Text>
                    <Text style={[s.statLbl, { color: palette.tx2 }]}>{st.label}</Text>
                  </View>
                ))}
              </View>
              {/* 칸반 */}
              <View style={s.kanban}>
                {[
                  { label:'지원완료',       stages:['지원완료'] },
                  { label:'서류/필기/면접', stages:['서류합격','필기/인적성','면접','최종'] },
                  { label:'합격/불합격',    stages:['합격','불합격'] },
                ].map(col => {
                  const cards = filteredApps.filter(a => col.stages.includes(a.stage));
                  return (
                    <View key={col.label} style={[s.kanbanCol, { backgroundColor: palette.bg2 }]}>
                      <View style={s.kanbanHd}>
                        <Text style={[s.kanbanHdTxt, { color: palette.tx2 }]}>{col.label}</Text>
                        <View style={[s.kanbanBadge, { backgroundColor: palette.cr }]}>
                          <Text style={[s.kanbanBadgeTxt, { color: palette.tx2 }]}>{cards.length}</Text>
                        </View>
                      </View>
                      {cards.length === 0
                        ? <Text style={[s.kanbanEmpty, { color: palette.tx3 }]}>없음</Text>
                        : cards.map(a => (
                          <View key={a.id} style={[s.kanbanCard, { backgroundColor: palette.cr, borderColor: palette.tx3+'25' }]}>
                            <Text style={[s.kanbanCo,   { color: palette.tx  }]}>{a.co}</Text>
                            <Text style={[s.kanbanRole, { color: palette.tx2 }]}>{a.role}</Text>
                            <View style={[s.stagePill, { backgroundColor: STAGE_COLORS[a.stage]?.bg ?? palette.bg2 }]}>
                              <Text style={[s.stagePillTxt, { color: STAGE_COLORS[a.stage]?.text ?? palette.tx2 }]}>{a.stage}</Text>
                            </View>
                          </View>
                        ))
                      }
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── 할 일 패널 */}
          {openPanel === 'goals' && (
            <View style={[s.panel, { borderColor: palette.tx3+'30' }]}>
              <View style={s.panelHd}>
                <Text style={[s.panelTitle, { color: palette.tx }]}>할 일</Text>
                <TouchableOpacity onPress={() => setOpenPanel(null)}>
                  <Ionicons name="close" size={18} color={palette.tx2} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8, paddingHorizontal:12, paddingTop:12 }}>
                <View>
                  <Text style={{ fontSize:20, fontWeight:'700', color:palette.tx }}>{todoPct}%</Text>
                  <Text style={{ fontSize:11, color:palette.tx3 }}>이번 주 달성률</Text>
                </View>
                <View style={{ alignItems:'flex-end' }}>
                  <Text style={{ fontSize:18, fontWeight:'600', color:palette.tx }}>{doneTodos}</Text>
                  <Text style={{ fontSize:11, color:palette.tx3 }}>완료 / {todos.length}개</Text>
                </View>
              </View>
              <View style={[s.bigBar, { backgroundColor: palette.bg3 }]}>
                <View style={[s.bigBarFill, { width:`${todoPct}%` as any, backgroundColor:palette.acc }]} />
              </View>
              <View style={{ flexDirection:'row', gap:5, marginBottom:10, paddingHorizontal:12 }}>
                {(['all','high','mid','low'] as const).map(p => (
                  <TouchableOpacity key={p}
                    style={[s.priBtn, priFilter===p && { backgroundColor:palette.pri, borderColor:palette.pri }]}
                    onPress={() => setPriFilter(p)}>
                    <Text style={[s.priBtnTxt, { color:priFilter===p ? palette.cr : palette.tx2 }]}>
                      {{ all:'전체', high:'높음', mid:'보통', low:'낮음' }[p]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {filteredTodos.map(t => {
                const dd    = t.due ? dday(t.due) : null;
                const isOv  = dd !== null && dd < 0 && !t.done;
                const ddTxt = dd===null ? '' : dd<0 ? `${Math.abs(dd)}일 초과` : dd===0 ? '오늘 마감' : `D-${dd}`;
                return (
                  <TouchableOpacity key={t.id}
                    style={[s.todoItem, { backgroundColor:palette.cr, borderColor:isOv ? palette.dan : palette.tx3+'25' }]}
                    onPress={() => toggleTodo(t.id)}>
                    <View style={[s.chk, t.done && { backgroundColor:palette.acc, borderColor:palette.acc }]}>
                      {t.done && <Ionicons name="checkmark" size={10} color="#fff" />}
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={[s.todoTxt, { color:palette.tx }, t.done && { textDecorationLine:'line-through', color:palette.tx3 }]}>
                        {t.text}
                      </Text>
                      {!!ddTxt && (
                        <Text style={[s.todoDue, { color:isOv||dd===0 ? palette.dan : palette.tx3 }]}>{ddTxt}</Text>
                      )}
                    </View>
                    <View style={[s.priPill, { backgroundColor:t.pri==='high' ? '#f0dcd8' : t.pri==='mid' ? '#d8d8a8' : '#c4d8c4' }]}>
                      <Text style={{ fontSize:9, color:palette.tx2 }}>{PL[t.pri]}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={[s.addBtn, { borderColor:palette.tx3+'40' }]} onPress={() => setShowAddTodo(true)}>
                <Ionicons name="add" size={14} color={palette.tx2} />
                <Text style={[s.addBtnTxt, { color:palette.tx2 }]}>할 일 추가</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── AI 파싱 패널 */}
          {openPanel === 'ai' && (
            <View style={[s.panel, { borderColor: palette.tx3+'30' }]}>
              <View style={s.panelHd}>
                <Text style={[s.panelTitle, { color: palette.tx }]}>AI 파싱</Text>
                <TouchableOpacity onPress={() => setOpenPanel(null)}>
                  <Ionicons name="close" size={18} color={palette.tx2} />
                </TouchableOpacity>
              </View>
              <AIParsing palette={palette} onAdd={event => addEvent(event)} />
            </View>
          )}

          {/* ── 리포트 패널 */}
          {openPanel === 'report' && (
            <View style={[s.panel, { borderColor: palette.tx3+'30', marginHorizontal:8, paddingBottom:8 }]}>
              <View style={s.panelHd}>
                <Text style={[s.panelTitle, { color: palette.tx }]}>리포트</Text>
                <TouchableOpacity onPress={() => setOpenPanel(null)}>
                  <Ionicons name="close" size={18} color={palette.tx2} />
                </TouchableOpacity>
              </View>
              <View style={s.stat4}>
                {[
                  { label:'지원 기업', value:apps.length,                                              color:palette.tx  },
                  { label:'합격',      value:apps.filter(a=>a.stage==='합격').length,                  color:palette.pri },
                  { label:'면접',      value:apps.filter(a=>['면접','최종'].includes(a.stage)).length,  color:'#6a7480'   },
                  { label:'달성률',    value:todoPct+'%',                                              color:palette.acc },
                ].map(st => (
                  <View key={st.label} style={[s.statBox, { backgroundColor: palette.bg2 }]}>
                    <Text style={[s.statNum, { color: st.color }]}>{st.value}</Text>
                    <Text style={[s.statLbl, { color: palette.tx2 }]}>{st.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={[s.reportSection, { color: palette.tx2 }]}>전형 단계</Text>
              {[
                ['지원완료','#a8a85a'],['서류합격',palette.pri],['필기/인적성','#b85c44'],
                ['면접','#6a7480'],['최종',palette.dan],['합격',palette.pri],['불합격',palette.tx3],
              ].map(([stage, color]) => {
                const cnt = apps.filter(a => a.stage === stage).length;
                const max = Math.max(...['지원완료','서류합격','필기/인적성','면접','최종','합격','불합격'].map(s2=>apps.filter(a=>a.stage===s2).length), 1);
                return (
                  <View key={stage} style={s.barRow}>
                    <Text style={[s.barLabel, { color: palette.tx2 }]}>{stage}</Text>
                    <View style={[s.barTrack, { backgroundColor: palette.cr }]}>
                      <View style={[s.barFill, { width:`${Math.round(cnt/max*100)}%` as any, backgroundColor:color as string }]} />
                    </View>
                    <Text style={[s.barVal, { color: palette.tx }]}>{cnt}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* ══════════════════════════════════════
            할일 추가 모달
        ══════════════════════════════════════ */}
        <Modal visible={showAddTodo} transparent animationType="fade">
          <TouchableOpacity style={modalBg} activeOpacity={1}
            onPress={() => { setShowAddTodo(false); setNewTodoText(''); }}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width:'100%' }}>
              <View style={{ backgroundColor:palette.cr, borderRadius:20, padding:24, width:'100%' }}>
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <Text style={{ fontSize:16, fontWeight:'700', color:palette.tx }}>할 일 추가</Text>
                  <TouchableOpacity
                    style={{ width:28, height:28, borderRadius:99, backgroundColor:palette.bg2, alignItems:'center', justifyContent:'center' }}
                    onPress={() => { setShowAddTodo(false); setNewTodoText(''); }}>
                    <Ionicons name="close" size={16} color={palette.tx2} />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize:11, color:palette.tx3, marginBottom:6 }}>내용</Text>
                <TextInput
                  style={{ padding:11, borderRadius:10, borderWidth:0.5, borderColor:palette.tx3+'40', backgroundColor:palette.bg2, color:palette.tx, fontSize:13, marginBottom:16 }}
                  placeholder="할 일 내용"
                  placeholderTextColor={palette.tx3}
                  value={newTodoText}
                  onChangeText={setNewTodoText}
                  autoFocus
                />
                <Text style={{ fontSize:11, color:palette.tx3, marginBottom:8 }}>우선순위</Text>
                <View style={{ flexDirection:'row', gap:6, marginBottom:20 }}>
                  {(['high','mid','low'] as const).map(p => (
                    <TouchableOpacity key={p}
                      style={[s.priBtn, newTodoPri===p && { backgroundColor:palette.pri, borderColor:palette.pri }]}
                      onPress={() => setNewTodoPri(p)}>
                      <Text style={[s.priBtnTxt, { color:newTodoPri===p ? palette.cr : palette.tx2 }]}>
                        {{ high:'높음', mid:'보통', low:'낮음' }[p]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection:'row', gap:8 }}>
                  <TouchableOpacity
                    style={{ flex:1, padding:13, borderRadius:10, borderWidth:0.5, borderColor:palette.tx3+'40', alignItems:'center' }}
                    onPress={() => { setShowAddTodo(false); setNewTodoText(''); }}>
                    <Text style={{ color:palette.tx2, fontSize:13 }}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex:1, padding:13, borderRadius:10, backgroundColor:palette.pri, alignItems:'center' }}
                    onPress={() => {
                      if (!newTodoText.trim()) return;
                      addTodo({ text:newTodoText.trim(), pri:newTodoPri, due:'' });
                      setNewTodoText('');
                      setShowAddTodo(false);
                    }}>
                    <Text style={{ color:palette.cr, fontSize:13, fontWeight:'600' }}>추가</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* ══════════════════════════════════════
            일정 추가 모달
        ══════════════════════════════════════ */}
        <Modal visible={showAddEvent} transparent animationType="fade">
          <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableOpacity style={modalBg} activeOpacity={1} onPress={() => setShowAddEvent(false)}>
              <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width:'100%' }}>
                <View style={{ backgroundColor:palette.cr, borderRadius:20, padding:24, width:'100%' }}>
                  <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                    <View>
                      <Text style={{ fontSize:16, fontWeight:'700', color:palette.tx }}>일정 추가</Text>
                      <Text style={{ fontSize:11, color:palette.tx3, marginTop:2 }}>
                        {newEventDate.replace(/-/g, '.')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{ width:28, height:28, borderRadius:99, backgroundColor:palette.bg2, alignItems:'center', justifyContent:'center' }}
                      onPress={() => setShowAddEvent(false)}>
                      <Ionicons name="close" size={16} color={palette.tx2} />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ fontSize:11, color:palette.tx3, marginBottom:6 }}>제목</Text>
                  <TextInput
                    style={{ padding:11, borderRadius:10, borderWidth:0.5, borderColor:palette.tx3+'40', backgroundColor:palette.bg2, color:palette.tx, fontSize:13, marginBottom:16 }}
                    placeholder="일정 제목"
                    placeholderTextColor={palette.tx3}
                    value={newEventTitle}
                    onChangeText={setNewEventTitle}
                    autoFocus
                  />
                  <Text style={{ fontSize:11, color:palette.tx3, marginBottom:8 }}>카테고리</Text>
                  <View style={{ flexDirection:'row', gap:6, marginBottom:16, flexWrap:'wrap' }}>
                    {(['job','study','personal','deadline'] as const).map(cat => {
                      const on    = newEventCat === cat;
                      const label = { job:'채용', study:'스터디', personal:'개인', deadline:'마감' }[cat];
                      const c     = CAT_COLORS[cat];
                      return (
                        <TouchableOpacity key={cat}
                          style={{ paddingHorizontal:14, paddingVertical:7, borderRadius:99, borderWidth: on ? 1.5 : 0.5, borderColor: on ? c.text+'80' : palette.tx3+'40', backgroundColor: on ? c.bg : palette.cr }}
                          onPress={() => setNewEventCat(cat)}>
                          <Text style={{ fontSize:12, fontWeight: on ? '600' : '400', color: on ? c.text : palette.tx2 }}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {/* 하루종일 토글 */}
                  <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:12, borderTopWidth:0.5, borderTopColor:palette.tx3+'20', marginBottom:12 }}>
                    <Text style={{ fontSize:13, fontWeight:'500', color:palette.tx }}>하루종일</Text>
                    <TouchableOpacity
                      style={{ width:44, height:26, borderRadius:99, backgroundColor: newEventAllDay ? palette.acc : palette.bg3, justifyContent:'center', paddingHorizontal:2 }}
                      onPress={() => setNewEventAllDay(prev => !prev)}>
                      <View style={{ width:22, height:22, borderRadius:11, backgroundColor:'#fff', alignSelf: newEventAllDay ? 'flex-end' : 'flex-start' }} />
                    </TouchableOpacity>
                  </View>
                  {/* 날짜 범위 */}
                  {newEventAllDay && (
                    <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:16 }}>
                      <View style={{ flex:1 }}>
                        <Text style={{ fontSize:10, color:palette.tx3, marginBottom:4 }}>시작일</Text>
                        <TextInput
                          style={{ padding:10, borderRadius:10, borderWidth:0.5, borderColor:palette.tx3+'40', backgroundColor:palette.bg2, color:palette.tx, fontSize:13, textAlign:'center' }}
                          value={newEventStartDate} onChangeText={setNewEventStartDate}
                          placeholder="YYYY-MM-DD" placeholderTextColor={palette.tx3}
                        />
                      </View>
                      <Text style={{ color:palette.tx3, marginTop:16 }}>~</Text>
                      <View style={{ flex:1 }}>
                        <Text style={{ fontSize:10, color:palette.tx3, marginBottom:4 }}>종료일</Text>
                        <TextInput
                          style={{ padding:10, borderRadius:10, borderWidth:0.5, borderColor:palette.tx3+'40', backgroundColor:palette.bg2, color:palette.tx, fontSize:13, textAlign:'center' }}
                          value={newEventEndDate} onChangeText={setNewEventEndDate}
                          placeholder="YYYY-MM-DD" placeholderTextColor={palette.tx3}
                        />
                      </View>
                    </View>
                  )}
                  {/* 시간 범위 */}
                  {!newEventAllDay && (
                    <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:16 }}>
                      {[
                        { label:'시작 시간', h: newEventStartH, m: newEventStartM, setH: setNewEventStartH, setM: setNewEventStartM },
                        { label:'종료 시간', h: newEventEndH,   m: newEventEndM,   setH: setNewEventEndH,   setM: setNewEventEndM   },
                      ].map((item, idx) => (
                        <View key={idx} style={{ flex:1 }}>
                          <Text style={{ fontSize:10, color:palette.tx3, marginBottom:4 }}>{item.label}</Text>
                          <View style={{ flexDirection:'row', gap:4 }}>
                            {[
                              { val: item.h, up: () => item.setH((h:number) => (h+1)%24),   dn: () => item.setH((h:number) => (h+23)%24) },
                              { val: item.m, up: () => item.setM((m:number) => (m+10)%60), dn: () => item.setM((m:number) => (m+50)%60) },
                            ].map((col, ci) => (
                              <View key={ci} style={{ flex:1, alignItems:'center', padding:8, borderRadius:10, borderWidth:0.5, borderColor:palette.tx3+'40', backgroundColor:palette.bg2 }}>
                                <TouchableOpacity onPress={col.up}><Ionicons name="chevron-up" size={14} color={palette.tx2} /></TouchableOpacity>
                                <Text style={{ fontSize:16, fontWeight:'600', color:palette.tx, marginVertical:4 }}>
                                  {String(col.val).padStart(2,'0')}
                                </Text>
                                <TouchableOpacity onPress={col.dn}><Ionicons name="chevron-down" size={14} color={palette.tx2} /></TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={{ flexDirection:'row', gap:8 }}>
                    <TouchableOpacity
                      style={{ flex:1, padding:13, borderRadius:10, borderWidth:0.5, borderColor:palette.tx3+'40', alignItems:'center' }}
                      onPress={() => setShowAddEvent(false)}>
                      <Text style={{ color:palette.tx2, fontSize:13 }}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flex:1, padding:13, borderRadius:10, backgroundColor:palette.pri, alignItems:'center' }}
                      onPress={() => {
                        if (!newEventTitle.trim()) return;
                        const timeStr = newEventAllDay
                          ? `${newEventStartDate}~${newEventEndDate}`
                          : `${String(newEventStartH).padStart(2,'0')}:${String(newEventStartM).padStart(2,'0')}~${String(newEventEndH).padStart(2,'0')}:${String(newEventEndM).padStart(2,'0')}`;
                        addEvent({ title:newEventTitle.trim(), date:newEventDate, cat:newEventCat, time:timeStr, allDay:newEventAllDay });
                        setNewEventTitle('');
                        setShowAddEvent(false);
                      }}>
                      <Text style={{ color:palette.cr, fontSize:13, fontWeight:'600' }}>추가</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>

        {/* ══════════════════════════════════════
            일정 수정 모달
        ══════════════════════════════════════ */}
        {editEvent && (
          <Modal visible={showEditEvent} transparent animationType="fade">
            <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <TouchableOpacity style={modalBg} activeOpacity={1} onPress={closeEdit}>
                <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width:'100%' }}>
                  <View style={{ backgroundColor:palette.cr, borderRadius:20, padding:24, width:'100%' }}>
                    <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                      <View>
                        <Text style={{ fontSize:16, fontWeight:'700', color:palette.tx }}>일정 수정</Text>
                        <Text style={{ fontSize:11, color:palette.tx3, marginTop:2 }}>
                          {editEvent.date.replace(/-/g, '.')}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={{ width:28, height:28, borderRadius:99, backgroundColor:palette.bg2, alignItems:'center', justifyContent:'center' }}
                        onPress={closeEdit}>
                        <Ionicons name="close" size={16} color={palette.tx2} />
                      </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize:11, color:palette.tx3, marginBottom:6 }}>제목</Text>
                    <TextInput
                      style={{ padding:11, borderRadius:10, borderWidth:0.5, borderColor:palette.tx3+'40', backgroundColor:palette.bg2, color:palette.tx, fontSize:13, marginBottom:16 }}
                      placeholder="일정 제목"
                      placeholderTextColor={palette.tx3}
                      value={editTitle}
                      onChangeText={setEditTitle}
                      autoFocus
                    />
                    <Text style={{ fontSize:11, color:palette.tx3, marginBottom:8 }}>카테고리</Text>
                    <View style={{ flexDirection:'row', gap:6, marginBottom:24, flexWrap:'wrap' }}>
                      {(['job','study','personal','deadline'] as const).map(cat => {
                        const on    = editCat === cat;
                        const label = { job:'채용', study:'스터디', personal:'개인', deadline:'마감' }[cat];
                        const c     = CAT_COLORS[cat];
                        return (
                          <TouchableOpacity key={cat}
                            style={{ paddingHorizontal:14, paddingVertical:8, borderRadius:99, borderWidth: on ? 1.5 : 0.5, borderColor: on ? c.text+'80' : palette.tx3+'40', backgroundColor: on ? c.bg : palette.cr }}
                            onPress={() => setEditCat(cat)}>
                            <Text style={{ fontSize:12, fontWeight: on ? '600' : '400', color: on ? c.text : palette.tx2 }}>{label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <View style={{ flexDirection:'row', gap:8 }}>
                      <TouchableOpacity
                        style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:4, padding:13, borderRadius:10, borderWidth:0.5, borderColor:palette.dan+'60', backgroundColor:palette.danL??'#f8eded' }}
                        onPress={() => { deleteEvent(editEvent.id); closeEdit(); }}>
                        <Ionicons name="trash-outline" size={13} color={palette.dan} />
                        <Text style={{ color:palette.dan, fontSize:13, fontWeight:'500' }}>삭제</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ flex:1, padding:13, borderRadius:10, borderWidth:0.5, borderColor:palette.tx3+'40', alignItems:'center' }}
                        onPress={closeEdit}>
                        <Text style={{ color:palette.tx2, fontSize:13 }}>취소</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ flex:1, padding:13, borderRadius:10, backgroundColor:palette.pri, alignItems:'center' }}
                        onPress={() => {
                          if (!editTitle.trim()) return;
                          updateEvent(editEvent.id, { title:editTitle.trim(), cat:editCat });
                          closeEdit();
                        }}>
                        <Text style={{ color:palette.cr, fontSize:13, fontWeight:'600' }}>저장</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </Modal>
        )}

        {/* ══════════════════════════════════════
            직무 추가 모달
        ══════════════════════════════════════ */}
        <Modal visible={showAddRole} transparent animationType="fade">
          <TouchableOpacity
            style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center', paddingHorizontal:20 }}
            activeOpacity={1}
            onPress={() => { setShowAddRole(false); setNewRoleText(''); }}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width:'100%' }}>
              <View style={{ backgroundColor:palette.cr, borderRadius:20, padding:24, width:'100%' }}>
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <Text style={{ fontSize:16, fontWeight:'700', color:palette.tx }}>직무 추가</Text>
                  <TouchableOpacity
                    style={{ width:28, height:28, borderRadius:99, backgroundColor:palette.bg2, alignItems:'center', justifyContent:'center' }}
                    onPress={() => { setShowAddRole(false); setNewRoleText(''); }}>
                    <Ionicons name="close" size={16} color={palette.tx2} />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize:11, color:palette.tx3, marginBottom:6 }}>직무명</Text>
                <TextInput
                  style={{ padding:11, borderRadius:10, borderWidth:0.5, borderColor:palette.tx3+'40', backgroundColor:palette.bg2, color:palette.tx, fontSize:13, marginBottom:16 }}
                  placeholder="예) 백엔드 개발, PM/기획"
                  placeholderTextColor={palette.tx3}
                  value={newRoleText}
                  onChangeText={setNewRoleText}
                  autoFocus
                />
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6, marginBottom:20 }}>
                  {['백엔드 개발','프론트엔드','풀스택','데이터 분석','AI/ML','PM/기획','iOS 개발','Android 개발','DevOps','디자인']
                    .filter(p => !roles.includes(p))
                    .map(preset => (
                      <TouchableOpacity key={preset}
                        style={{ paddingHorizontal:10, paddingVertical:6, borderRadius:99, borderWidth:0.5, borderColor:palette.tx3+'40', backgroundColor:palette.bg2 }}
                        onPress={() => setNewRoleText(preset)}>
                        <Text style={{ fontSize:11, color:palette.tx2 }}>{preset}</Text>
                      </TouchableOpacity>
                    ))
                  }
                </View>
                <View style={{ flexDirection:'row', gap:8 }}>
                  <TouchableOpacity
                    style={{ flex:1, padding:13, borderRadius:10, borderWidth:0.5, borderColor:palette.tx3+'40', alignItems:'center' }}
                    onPress={() => { setShowAddRole(false); setNewRoleText(''); }}>
                    <Text style={{ color:palette.tx2, fontSize:13 }}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex:1, padding:13, borderRadius:10, backgroundColor:palette.pri, alignItems:'center' }}
                    onPress={() => {
                      if (!newRoleText.trim()) return;
                      if (!roles.includes(newRoleText.trim())) addRole(newRoleText.trim());
                      setNewRoleText('');
                      setShowAddRole(false);
                    }}>
                    <Text style={{ color:palette.cr, fontSize:13, fontWeight:'600' }}>추가</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* ══════════════════════════════════════
            날짜 피커 모달
        ══════════════════════════════════════ */}
        <Modal visible={showDatePicker} transparent animationType="fade">
          <TouchableOpacity
            style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center', paddingHorizontal:20 }}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width:'100%' }}>
              <View style={{ backgroundColor:palette.cr, borderRadius:20, padding:24, width:'100%' }}>

                {/* 헤더 */}
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <Text style={{ fontSize:16, fontWeight:'700', color:palette.tx }}>날짜 선택</Text>
                  <TouchableOpacity
                    style={{ width:28, height:28, borderRadius:99, backgroundColor:palette.bg2, alignItems:'center', justifyContent:'center' }}
                    onPress={() => setShowDatePicker(false)}>
                    <Ionicons name="close" size={16} color={palette.tx2} />
                  </TouchableOpacity>
                </View>

                {/* 년도 선택 */}
                <Text style={{ fontSize:11, color:palette.tx3, marginBottom:8 }}>년도</Text>
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <TouchableOpacity
                    style={{ width:36, height:36, borderRadius:99, backgroundColor:palette.bg2, alignItems:'center', justifyContent:'center' }}
                    onPress={() => setPickYear(y => y - 1)}>
                    <Ionicons name="chevron-back" size={18} color={palette.tx2} />
                  </TouchableOpacity>
                  <Text style={{ fontSize:20, fontWeight:'700', color:palette.tx }}>{pickYear}년</Text>
                  <TouchableOpacity
                    style={{ width:36, height:36, borderRadius:99, backgroundColor:palette.bg2, alignItems:'center', justifyContent:'center' }}
                    onPress={() => setPickYear(y => y + 1)}>
                    <Ionicons name="chevron-forward" size={18} color={palette.tx2} />
                  </TouchableOpacity>
                </View>

                {/* 월 선택 */}
                <Text style={{ fontSize:11, color:palette.tx3, marginBottom:8 }}>월</Text>
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:24 }}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const on = pickMonth === i;
                    return (
                      <TouchableOpacity key={i}
                        style={{
                          width: '22%', paddingVertical:10, borderRadius:10,
                          alignItems:'center',
                          backgroundColor: on ? palette.pri : palette.bg2,
                          borderWidth: on ? 0 : 0.5,
                          borderColor: palette.tx3+'30',
                        }}
                        onPress={() => setPickMonth(i)}>
                        <Text style={{ fontSize:13, fontWeight: on ? '700' : '400', color: on ? palette.cr : palette.tx2 }}>
                          {i + 1}월
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 버튼 */}
                <View style={{ flexDirection:'row', gap:8 }}>
                  <TouchableOpacity
                    style={{ flex:1, padding:13, borderRadius:10, borderWidth:0.5, borderColor:palette.tx3+'40', alignItems:'center' }}
                    onPress={() => setShowDatePicker(false)}>
                    <Text style={{ color:palette.tx2, fontSize:13 }}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex:1, padding:13, borderRadius:10, backgroundColor:palette.pri, alignItems:'center' }}
                    onPress={() => {
                      setCurYear(pickYear);
                      setCurMonth(pickMonth);
                      setShowDatePicker(false);
                    }}>
                    <Text style={{ color:palette.cr, fontSize:13, fontWeight:'600' }}>이동</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(p: any, containerWidth: number) {
  const cellW = (containerWidth - 24) / 7;
  return StyleSheet.create({
    safe:          { flex:1 },
    header:        { backgroundColor:p.cr, borderBottomWidth:0.5, borderBottomColor:p.tx3+'30', paddingHorizontal:16, paddingTop:12, paddingBottom:10 },
    headerRow:     { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
    monthTitle:    { fontSize:18, fontWeight:'600', color:p.tx },
    navRow:        { flexDirection:'row', alignItems:'center', gap:6 },
    navBtn:        { width:28, height:28, borderRadius:7, borderWidth:0.5, borderColor:p.tx3+'60', alignItems:'center', justifyContent:'center' },
    navArrow:      { fontSize:18, color:p.tx2 },
    todayBtn:      { paddingHorizontal:14, paddingVertical:7, borderRadius:99, borderWidth:0.5, borderColor:p.tx3+'60' },
    todayTxt:      { fontSize:12, color:p.tx2, fontWeight:'500' },
    catRow:        { flexDirection:'row', gap:5, flexWrap:'wrap' },
    catChip:       { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:10, paddingVertical:4, borderRadius:99, borderWidth:1.5, borderColor:p.bg3, backgroundColor:p.bg2 },
    catDot:        { width:6, height:6, borderRadius:3 },
    catLabel:      { fontSize:11, fontWeight:'500' },
    grid:          { flexDirection:'row', flexWrap:'wrap', paddingHorizontal:12, paddingTop:8 },
    dayHeader:     { width:cellW, alignItems:'center', paddingVertical:3 },
    dayHeaderTxt:  { fontSize:10, color:p.tx3, fontWeight:'500' },
    cell:          { width:cellW, minHeight:60, borderRadius:7, padding:3, backgroundColor:p.bg2, marginBottom:2 },
    cellOther:     { opacity:0.25 },
    dayNumWrap:    { width:18, height:18, borderRadius:9, alignItems:'center', justifyContent:'center', marginBottom:2 },
    dayNum:        { fontSize:10, fontWeight:'500', color:p.tx2 },
    ddayTxt:       { fontSize:8, fontWeight:'600', lineHeight:10 },
    evChip:        { borderRadius:3, paddingHorizontal:3, paddingVertical:1, marginBottom:1 },
    evTxt:         { fontSize:9, lineHeight:13 },
    moreEvTxt:     { fontSize:8, marginTop:1 },
    cellNumOther:  { fontSize:10, color:p.tx3 },
    tabRow:        { flexDirection:'row', gap:6, padding:10, flexWrap:'wrap' },
    tabBtn:        { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:14, paddingVertical:8, borderRadius:8, borderWidth:0.5, borderColor:p.tx3+'40', backgroundColor:p.cr },
    tabBtnTxt:     { fontSize:12 },
    badge:         { paddingHorizontal:5, paddingVertical:1, borderRadius:99 },
    badgeTxt:      { fontSize:10 },
    panel:         { marginHorizontal:16, marginBottom:8, borderWidth:0.5, borderRadius:12, overflow:'hidden', backgroundColor:p.cr },
    panelHd:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:12, backgroundColor:p.bg2, borderBottomWidth:0.5, borderBottomColor:p.tx3+'20' },
    panelTitle:    { fontSize:13, fontWeight:'600' },
    warnBox:       { flexDirection:'row', alignItems:'center', gap:8, margin:12, marginBottom:4, padding:8, borderRadius:8, borderWidth:0.5 },
    warnDot:       { width:6, height:6, borderRadius:3 },
    warnTxt:       { fontSize:12 },
    roleChip:      { paddingHorizontal:10, paddingVertical:5, borderRadius:99, borderWidth:0.5, borderColor:p.tx3+'40', backgroundColor:p.cr, marginRight:4 },
    roleChipTxt:   { fontSize:11 },
    stat4:         { flexDirection:'row', gap:6, padding:12, paddingTop:8 },
    statBox:       { flex:1, borderRadius:8, padding:8, alignItems:'center' },
    statNum:       { fontSize:16, fontWeight:'700' },
    statLbl:       { fontSize:9, marginTop:1 },
    kanban:        { flexDirection:'row', gap:6, padding:12, paddingTop:4 },
    kanbanCol:     { flex:1, borderRadius:8, padding:8 },
    kanbanHd:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:6, paddingBottom:5, borderBottomWidth:0.5, borderBottomColor:p.tx3+'20' },
    kanbanHdTxt:   { fontSize:10, fontWeight:'600' },
    kanbanBadge:   { borderRadius:99, paddingHorizontal:5, paddingVertical:1 },
    kanbanBadgeTxt:{ fontSize:10, fontWeight:'600' },
    kanbanEmpty:   { fontSize:10, textAlign:'center', paddingVertical:8 },
    kanbanCard:    { backgroundColor:p.cr, borderRadius:6, padding:8, marginBottom:4, borderWidth:0.5 },
    kanbanCo:      { fontSize:12, fontWeight:'600' },
    kanbanRole:    { fontSize:10, marginTop:1 },
    stagePill:     { marginTop:5, paddingHorizontal:5, paddingVertical:2, borderRadius:99, alignSelf:'flex-start' },
    stagePillTxt:  { fontSize:9, fontWeight:'500' },
    bigBar:        { height:6, borderRadius:99, marginBottom:12, marginHorizontal:12, overflow:'hidden' },
    bigBarFill:    { height:'100%', borderRadius:99 },
    priBtn:        { paddingHorizontal:11, paddingVertical:4, borderRadius:99, borderWidth:0.5, borderColor:p.tx3+'40', backgroundColor:p.cr },
    priBtnTxt:     { fontSize:11 },
    todoItem:      { flexDirection:'row', alignItems:'center', gap:9, padding:10, borderRadius:10, borderWidth:0.5, marginBottom:5, marginHorizontal:12 },
    chk:           { width:17, height:17, borderRadius:99, borderWidth:1.5, borderColor:p.tx3+'60', alignItems:'center', justifyContent:'center' },
    todoTxt:       { fontSize:13 },
    todoDue:       { fontSize:10, marginTop:2 },
    priPill:       { paddingHorizontal:5, paddingVertical:2, borderRadius:99 },
    addBtn:        { flexDirection:'row', alignItems:'center', gap:5, margin:12, marginTop:6, padding:8, borderRadius:8, borderWidth:0.5, borderStyle:'dashed' },
    addBtnTxt:     { fontSize:12 },
    reportSection: { fontSize:11, fontWeight:'600', marginHorizontal:12, marginTop:4, marginBottom:6 },
    barRow:        { flexDirection:'row', alignItems:'center', gap:8, marginHorizontal:14, marginBottom:8 },
    barLabel:      { fontSize:11, minWidth:72 },
    barTrack:      { flex:1, height:10, borderRadius:4, overflow:'hidden', borderWidth:0.5, borderColor:p.tx3+'20' },
    barFill:       { height:'100%', borderRadius:3 },
    barVal:        { fontSize:11, fontWeight:'500', minWidth:16, textAlign:'right' },
  });
}
