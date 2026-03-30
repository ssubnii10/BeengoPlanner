import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';

export default function ProScreen() {
  const router  = useRouter();
  const palette = useAppStore(s => s.palette);
  const p = palette;

  const [plan,    setPlan]    = useState<'monthly'|'yearly'>('monthly');
  const [cardNum, setCardNum] = useState('');
  const [expiry,  setExpiry]  = useState('');
  const [cvc,     setCvc]     = useState('');
  const [name,    setName]    = useState('');
  const [isPro,   setIsPro]   = useState(false);

  function fmtCard(v: string) {
    const d = v.replace(/\D/g,'').slice(0,16);
    return d.replace(/(\d{4})(?=\d)/g,'$1 ');
  }
  function fmtExpiry(v: string) {
    const d = v.replace(/\D/g,'').slice(0,4);
    return d.length > 2 ? d.slice(0,2)+' / '+d.slice(2) : d;
  }

  function handlePay() {
    if (cardNum.replace(/\s/g,'').length < 16) { alert('카드 번호를 입력해주세요'); return; }
    setIsPro(true);
  }

  if (isPro) {
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: p.bg }}>
        <View style={[styles.header, { backgroundColor: p.cr, borderBottomColor: p.tx3+'30' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={p.pri} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: p.tx }]}>Pro 전환</Text>
        </View>
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:32 }}>
          <View style={{ width:64, height:64, borderRadius:32, backgroundColor:p.pri+'20', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
            <Ionicons name="star" size={28} color={p.pri} />
          </View>
          <Text style={{ fontSize:20, fontWeight:'700', color:p.tx, marginBottom:8 }}>Pro 취준생이에요!</Text>
          <Text style={{ fontSize:13, color:p.tx3, textAlign:'center', lineHeight:20 }}>
            AI 파싱 무제한, 캘린더 동기화 등{'\n'}모든 Pro 기능을 사용할 수 있어요.
          </Text>
          <TouchableOpacity
            style={{ marginTop:32, paddingHorizontal:32, paddingVertical:14, borderRadius:12, backgroundColor:p.pri }}
            onPress={() => router.back()}>
            <Text style={{ color:p.cr, fontSize:14, fontWeight:'600' }}>확인</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: p.bg }}>
      <View style={[styles.header, { backgroundColor: p.cr, borderBottomColor: p.tx3+'30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={p.pri} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: p.tx }]}>Pro 전환</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding:20 }}>
        {/* 타이틀 */}
        <View style={{ alignItems:'center', marginBottom:20 }}>
          <Text style={{ fontSize:22, fontWeight:'700', color:p.tx, marginBottom:4 }}>취준플래너 Pro</Text>
          <Text style={{ fontSize:12, color:p.tx3 }}>취업 준비를 더 스마트하게</Text>
        </View>

        {/* 혜택 */}
        <View style={{ backgroundColor:p.bg2, borderRadius:12, padding:16, marginBottom:16 }}>
          <Text style={{ fontSize:10, fontWeight:'700', color:p.tx3, marginBottom:10, letterSpacing:0.5 }}>PRO 혜택</Text>
          {[
            'AI 파싱 무제한',
            'Google · Apple 캘린더 동기화',
            '고급 리포트 및 통계',
            '클라우드 무제한 백업',
          ].map(b => (
            <View key={b} style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:8 }}>
              <Ionicons name="checkmark" size={14} color={p.pri} />
              <Text style={{ fontSize:13, color:p.tx }}>{b}</Text>
            </View>
          ))}
        </View>

        {/* 플랜 선택 */}
        <View style={{ flexDirection:'row', gap:8, marginBottom:16 }}>
          {([
            { key:'monthly', label:'월간', price:'4,900', unit:'원 / 월', badge:null },
            { key:'yearly',  label:'연간', price:'3,500', unit:'원 / 월', badge:'-30%' },
          ] as const).map(pl => (
            <TouchableOpacity key={pl.key}
              style={[styles.planCard, { backgroundColor: plan===pl.key ? p.priL??p.pri+'20' : p.bg2, borderColor: plan===pl.key ? p.pri : p.tx3+'40' }]}
              onPress={() => setPlan(pl.key)}>
              <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                <Text style={{ fontSize:11, fontWeight:'600', color:p.tx2 }}>{pl.label}</Text>
                {pl.badge && (
                  <View style={{ backgroundColor:p.pri, paddingHorizontal:5, paddingVertical:1, borderRadius:99 }}>
                    <Text style={{ fontSize:9, color:'#fff', fontWeight:'700' }}>{pl.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize:20, fontWeight:'700', color:p.tx }}>{pl.price}</Text>
              <Text style={{ fontSize:10, color:p.tx3 }}>{pl.unit}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 카드 입력 */}
        <Text style={[styles.label, { color:p.tx3 }]}>카드 번호</Text>
        <TextInput
          style={[styles.input, { backgroundColor:p.bg2, color:p.tx, borderColor:p.tx3+'40' }]}
          placeholder="0000 0000 0000 0000"
          placeholderTextColor={p.tx3}
          value={cardNum}
          onChangeText={v => setCardNum(fmtCard(v))}
          keyboardType="number-pad"
          maxLength={19}
        />

        <View style={{ flexDirection:'row', gap:8, marginBottom:10 }}>
          <View style={{ flex:1 }}>
            <Text style={[styles.label, { color:p.tx3 }]}>유효기간</Text>
            <TextInput
              style={[styles.input, { backgroundColor:p.bg2, color:p.tx, borderColor:p.tx3+'40', marginBottom:0 }]}
              placeholder="MM / YY"
              placeholderTextColor={p.tx3}
              value={expiry}
              onChangeText={v => setExpiry(fmtExpiry(v))}
              keyboardType="number-pad"
              maxLength={7}
            />
          </View>
          <View style={{ flex:1 }}>
            <Text style={[styles.label, { color:p.tx3 }]}>CVC</Text>
            <TextInput
              style={[styles.input, { backgroundColor:p.bg2, color:p.tx, borderColor:p.tx3+'40', marginBottom:0 }]}
              placeholder="000"
              placeholderTextColor={p.tx3}
              value={cvc}
              onChangeText={setCvc}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
        </View>

        <Text style={[styles.label, { color:p.tx3, marginTop:10 }]}>카드 소유자명</Text>
        <TextInput
          style={[styles.input, { backgroundColor:p.bg2, color:p.tx, borderColor:p.tx3+'40' }]}
          placeholder="홍길동"
          placeholderTextColor={p.tx3}
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity
          style={{ padding:14, borderRadius:12, backgroundColor:p.pri, alignItems:'center', marginTop:8 }}
          onPress={handlePay}>
          <Text style={{ color:p.cr, fontSize:14, fontWeight:'700' }}>
            {plan === 'monthly' ? '월 4,900원 결제하기' : '연 41,900원 결제하기 (-30%)'}
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize:10, color:p.tx3, textAlign:'center', marginTop:10, lineHeight:16 }}>
          구독은 언제든지 해지할 수 있어요.{'\n'}실제 결제는 백엔드 연동 후 활성화돼요.
        </Text>
        <View style={{ height:32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:   { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:14, borderBottomWidth:0.5 },
  backBtn:  { marginRight:8, padding:2 },
  title:    { fontSize:18, fontWeight:'600' },
  planCard: { flex:1, borderRadius:12, padding:14, borderWidth:1.5 },
  label:    { fontSize:11, marginBottom:6 },
  input:    { padding:12, borderRadius:10, borderWidth:0.5, fontSize:14, marginBottom:14 },
});