// 시그니처 테마
export const THEMES_SIG = [
  { name: '숲',     pri: '#4a6741', acc: '#5f8060', dan: '#c07070' },
  { name: '세이지', pri: '#5f8060', acc: '#7aaa8a', dan: '#b85c44' },
  { name: '황토',   pri: '#b85c44', acc: '#a08860', dan: '#c07070' },
  { name: '슬레이트',pri:'#6a7480', acc: '#8aadbe', dan: '#c07070' },
  { name: '올리브', pri: '#a8a85a', acc: '#4a6741', dan: '#c07070' },
  { name: '로즈',   pri: '#c07070', acc: '#e8c0b8', dan: '#b85c44' },
  { name: '미스트', pri: '#8aadbe', acc: '#7aaa8a', dan: '#c07070' },
  { name: '어스',   pri: '#6a6050', acc: '#a08860', dan: '#c07070' },
  { name: '다크',   pri: '#3a3c30', acc: '#7aaa8a', dan: '#c07070' },
  { name: '핑크',   pri: '#c07070', acc: '#e8c0b8', dan: '#a08860' },
];


// 기본 테마 (원색)
export const THEMES_BASIC = [
  { name: '레드',   pri: '#d93025', acc: '#e85d52', dan: '#c07020' },
  { name: '오렌지', pri: '#e8711a', acc: '#f09040', dan: '#d03030' },
  { name: '옐로우', pri: '#d4a000', acc: '#e8c030', dan: '#d04040' },
  { name: '그린',   pri: '#1e7e34', acc: '#28a048', dan: '#d03030' },
  { name: '블루',   pri: '#1a5fa8', acc: '#2878d0', dan: '#d04040' },
  { name: '네이비', pri: '#1a2c5a', acc: '#2848a0', dan: '#c03030' },
  { name: '퍼플',   pri: '#6a2a9a', acc: '#9040c0', dan: '#d04040' },
  { name: '핫핑크', pri: '#c01870', acc: '#e040a0', dan: '#a04000' },
  { name: '틸',     pri: '#0a7a6a', acc: '#18a090', dan: '#d04040' },
  { name: '브라운', pri: '#7a3a18', acc: '#b05828', dan: '#d04040' },
];


// 파스텔 테마
export const THEMES_PASTEL = [
  { name: '라벤더', pri: '#b8a8d8', acc: '#d4c8e8', dan: '#e8a8b8' },
  { name: '민트',   pri: '#8ecfc4', acc: '#aee0d8', dan: '#f0b8a8' },
  { name: '복숭아', pri: '#f0b8a0', acc: '#f5cdb8', dan: '#c8a8d0' },
  { name: '스카이', pri: '#90bce0', acc: '#b0d4f0', dan: '#f0b8a0' },
  { name: '버터',   pri: '#e0d090', acc: '#ece0a8', dan: '#e0a8b0' },
  { name: '라일락', pri: '#c8a8d8', acc: '#dcc0e8', dan: '#a8c8c0' },
  { name: '아쿠아', pri: '#88c8d0', acc: '#a8dce0', dan: '#f0b0a8' },
  { name: '레몬',   pri: '#d8d080', acc: '#e8e098', dan: '#d0a8c0' },
  { name: '코랄',   pri: '#e8a898', acc: '#f0bcb0', dan: '#a8b8d8' },
  { name: '모스',   pri: '#a8c8a0', acc: '#c0d8b8', dan: '#e8b0a8' },
];


// 색상 유틸 함수
export function lighten(hex, a = 0.82) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return '#' + [r,g,b]
    .map(v => Math.round(v + (255 - v) * a).toString(16).padStart(2,'0'))
    .join('');
}

export function darken(hex, a = 0.6) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return '#' + [r,g,b]
    .map(v => Math.round(v * a).toString(16).padStart(2,'0'))
    .join('');
}

// 테마 적용 시 전체 색상 팔레트 계산
export function buildPalette(pri, acc, dan) {
  return {
    pri,
    priL:  lighten(pri),
    priT:  darken(pri, 0.55),
    acc,
    accL:  lighten(acc),
    dan,
    danL:  lighten(dan, 0.85),
    danT:  darken(dan, 0.6),
    bg:    '#f8f6f0',
    bg2:   '#eeebe2',
    bg3:   '#e4e0d4',
    cr:    '#f0ede0',
    tx:    '#2e2c28',
    tx2:   '#6a6558',
    tx3:   '#9a9488',
  };
}

// 기본 팔레트 (앱 시작 시 사용)
export const DEFAULT_PALETTE = buildPalette('#4a6741', '#5f8060', '#c07070');