import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import useAppStore from '../../src/store/useAppStore';
import { useResponsive } from '../../src/hooks/useResponsive';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IoniconsName; iconActive: IoniconsName }[] = [
  { name: 'index',   title: '홈',   icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'list',    title: '목록', icon: 'list-outline',      iconActive: 'list'     },
  { name: 'menu',    title: '관리', icon: 'grid-outline',      iconActive: 'grid'     },
  { name: 'profile', title: '계정', icon: 'person-outline',    iconActive: 'person'   },
];

export default function TabLayout() {
  const palette    = useAppStore(s => s.palette);
  const { isMobile } = useResponsive();

  // 플랫폼별 탭바 높이
  const TAB_H  = Platform.OS === 'web' ? 64 : isMobile ? 68 : 72;
  const ICON_S = isMobile ? 17 : 19;

  return (
    <Tabs
      screenOptions={{
        headerShown:             false,
        tabBarActiveTintColor:   palette.pri,
        tabBarInactiveTintColor: palette.tx3,
        tabBarStyle: {
          backgroundColor: palette.cr,
          borderTopColor:  palette.tx3 + '40',
          borderTopWidth:  0.5,
          height:          TAB_H,
        },
        tabBarLabelStyle: {
          fontSize:   9,
          fontWeight: '500',
        },
      }}
    >
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={ICON_S}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}