import { create } from 'zustand';
import { Platform } from 'react-native';
import { buildPalette, DEFAULT_PALETTE } from '../theme/themes';

// 플랫폼별 스토리지
let Storage;
if (Platform.OS === 'web') {
  Storage = {
    getItem:    (key) => Promise.resolve(localStorage.getItem(key)),
    setItem:    (key, value) => Promise.resolve(localStorage.setItem(key, value)),
    removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
  };
} else {
  try {
    Storage = require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    const memStore = {};
    Storage = {
      getItem:    (key) => Promise.resolve(memStore[key] ?? null),
      setItem:    (key, value) => { memStore[key] = value; return Promise.resolve(); },
      removeItem: (key) => { delete memStore[key]; return Promise.resolve(); },
    };
  }
}

const useAppStore = create((set, get) => ({

  // ── 팔레트 (테마 색상)
  palette: DEFAULT_PALETTE,
  setTheme: (pri, acc, dan) => {
    const palette = buildPalette(pri, acc, dan);
    set({ palette });
    Storage.setItem('theme', JSON.stringify({ pri, acc, dan }));
  },

  // ── 캘린더 설정
  calSettings: {
    view:        'month',
    startDay:    'sun',
    fadePast:    true,
    showDday:    true,
    showWeekend: true,
    showCat:     true,
  },
  setCalSetting: (key, value) => set(state => ({
    calSettings: { ...state.calSettings, [key]: value }
  })),

  // ── 일정
  events: [
    { id: 1, title: '카카오 서류 마감', date: '2026-03-24', cat: 'deadline' },
    { id: 2, title: 'LG 인적성',        date: '2026-03-28', cat: 'job'      },
    { id: 3, title: 'CS 스터디',        date: '2026-03-25', cat: 'study'    },
    { id: 4, title: '삼성 1차 면접',    date: '2026-04-05', cat: 'job'      },
    { id: 5, title: '헬스장',           date: '2026-03-22', cat: 'personal' },
    { id: 6, title: 'SK 최종 면접',     date: '2026-04-12', cat: 'job'      },
  ],
  addEvent: (event) => set(state => ({
    events: [...state.events, { ...event, id: Date.now() }]
  })),
  deleteEvent: (id) => set(state => ({
    events: state.events.filter(e => e.id !== id)
  })),
  updateEvent: (id, changes) => set(state => ({
    events: state.events.map(e => e.id === id ? { ...e, ...changes } : e)
  })),

  // ── 할 일
  todos: [
    { id: 1, text: 'CS 스터디 2시간',          done: false, pri: 'high', due: '2026-03-22' },
    { id: 2, text: '삼성 면접 예상 질문 정리', done: true,  pri: 'high', due: '2026-03-24' },
    { id: 3, text: '포트폴리오 최종 수정',      done: false, pri: 'mid',  due: '2026-03-28' },
    { id: 4, text: 'SQLD 모의고사 1회',         done: false, pri: 'mid',  due: '2026-03-30' },
    { id: 5, text: '독서 30분',                 done: false, pri: 'low',  due: ''           },
  ],
  toggleTodo: (id) => set(state => ({
    todos: state.todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
  })),
  addTodo: (todo) => set(state => ({
    todos: [{ ...todo, id: Date.now(), done: false }, ...state.todos]
  })),
  deleteTodo: (id) => set(state => ({
    todos: state.todos.filter(t => t.id !== id)
  })),

  // ── 지원현황
  apps: [
    { id: 1, co: '카카오',     role: '백엔드 개발', stage: '서류합격',    prog: 30 },
    { id: 2, co: 'LG전자',     role: '데이터 분석', stage: '필기/인적성', prog: 50 },
    { id: 3, co: '삼성전자',   role: '백엔드 개발', stage: '면접',        prog: 70 },
    { id: 4, co: '현대자동차', role: 'PM/기획',      stage: '지원완료',    prog: 10 },
    { id: 5, co: 'SK하이닉스', role: '프론트엔드',   stage: '최종',        prog: 90 },
    { id: 6, co: '네이버',     role: '백엔드 개발',  stage: '불합격',      prog: 20 },
  ],
  addApp: (app) => set(state => ({
    apps: [{ ...app, id: Date.now(), prog: 10 }, ...state.apps]
  })),
  updateApp: (id, changes) => set(state => ({
    apps: state.apps.map(a => a.id === id ? { ...a, ...changes } : a)
  })),
  deleteApp: (id) => set(state => ({
    apps: state.apps.filter(a => a.id !== id)
  })),

  // ── 직무 필터
  roles: ['전체', '백엔드 개발', '프론트엔드', '데이터 분석', 'PM/기획', 'iOS/Android'],
  activeRole: '전체',
  addRole:       (role) => set(state => ({ roles: [...state.roles, role] })),
  setActiveRole: (role) => set({ activeRole: role }),
  deleteRole:    (role) => set(state => ({
    roles:      state.roles.filter(r => r !== role),
    activeRole: state.activeRole === role ? '전체' : state.activeRole,
  })),

  // ── 희망 직무
  selectedJobs:    ['백엔드 개발'],
  setSelectedJobs: (jobs) => set({ selectedJobs: jobs }),

  // ── 알림 설정
  notiSettings: {
    deadline: true,
    reminder: true,
    weekly:   false,
    goal:     false,
    hour:     8,
    minute:   0,
  },
  setNotiSetting: (key, value) => set(state => ({
    notiSettings: { ...state.notiSettings, [key]: value }
  })),

  // ── 로컬 저장 / 불러오기
  saveAll: async () => {
    try {
      const s = get();
      const entries = {
        events:       s.events,
        todos:        s.todos,
        apps:         s.apps,
        roles:        s.roles,
        calSettings:  s.calSettings,
        notiSettings: s.notiSettings,
      };
      for (const [key, val] of Object.entries(entries)) {
        await Storage.setItem(key, JSON.stringify(val));
      }
    } catch (e) {
      console.log('saveAll error:', e);
    }
  },

  loadAll: async () => {
    try {
      const keys = ['events','todos','apps','roles','calSettings','notiSettings','theme'];
      const data = {};
      for (const key of keys) {
        const val = await Storage.getItem(key);
        data[key] = val ? JSON.parse(val) : null;
      }
      set({
        ...(data.events       && { events:       data.events       }),
        ...(data.todos        && { todos:         data.todos        }),
        ...(data.apps         && { apps:          data.apps         }),
        ...(data.roles        && { roles:         data.roles        }),
        ...(data.calSettings  && { calSettings:   data.calSettings  }),
        ...(data.notiSettings && { notiSettings:  data.notiSettings }),
      });
      if (data.theme) {
        const { pri, acc, dan } = data.theme;
        set({ palette: buildPalette(pri, acc, dan) });
      }
    } catch (e) {
      console.log('loadAll error:', e);
    }
  },

}));

export default useAppStore;