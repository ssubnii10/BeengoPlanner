import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function dday(ds: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const t = new Date(ds);   t.setHours(0,0,0,0);
  return Math.ceil((t.getTime() - today.getTime()) / 86400000);
}

type ParsedItem = { stage: string; date: string; cat: string };

export default function AIParsing({ palette, onAdd }: { palette: any; onAdd: (e: any) => void }) {
  const p = palette;
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ParsedItem[]>([]);
  const [added,   setAdded]   = useState<Set<number>>(new Set());
  const [shown,   setShown]   = useState(false);

  async function doAI() {
    if (!company.trim()) return;
    setLoading(true);
    setShown(true);
    setResults([]);
    setAdded(new Set());
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: '한국 채용 전문가. 기업명 기반 공채 일정 추정해 JSON 배열만 반환. 형식:[{"stage":"전형단계","date":"YYYY-MM-DD","cat":"job 또는 deadline"}]. 4단계, 오늘부터 1~8주 후. JSON만.',
          messages: [{ role:'user', content: company.trim() }],
        }),
      });
      const data = await res.json();
      const raw  = data.content.map((c: any) => c.text || '').join('').replace(/```json|```/g,'').trim();
      let parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) parsed = [parsed];
      setResults(parsed);
    } catch {
      setResults([
        { stage:'서류 마감', date: offsetDate(7),  cat:'deadline' },
        { stage:'필기 시험', date: offsetDate(14), cat:'job'      },
        { stage:'1차 면접',  date: offsetDate(21), cat:'job'      },
        { stage:'최종 면접', date: offsetDate(28), cat:'job'      },
      ]);
    }
    setLoading(false);
  }

  function offsetDate(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0,10);
  }

  function handleAdd(i: number) {
    const item = results[i];
    onAdd({ title:`${company} ${item.stage}`, date:item.date, cat:item.cat });
    setAdded(prev => new Set([...prev, i]));
  }

  return (
    <View style={{ padding:12 }}>

        <Text style={{ fontSize:11, fontWeight:'500', color:p.tx2, marginBottom:8 }}>
          기업명 입력 → AI가 채용 일정 자동 생성
        </Text>

        {/* 입력창 */}
        <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
          <TextInput
            style={{ flex:1, padding:11, borderRadius:10, borderWidth:0.5, borderColor:p.tx3+'40', backgroundColor:p.bg2, color:p.tx, fontSize:13 }}
            placeholder="예) 카카오, 삼성전자"
            placeholderTextColor={p.tx3}
            value={company}
            onChangeText={setCompany}
            onSubmitEditing={doAI}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={{ paddingHorizontal:14, paddingVertical:11, borderRadius:10, backgroundColor:p.acc+'30', borderWidth:0.5, borderColor:p.acc, justifyContent:'center' }}
            onPress={doAI}>
            <Text style={{ fontSize:12, fontWeight:'600', color:p.pri }}>AI 검색 ↗</Text>
          </TouchableOpacity>
        </View>

        {/* 로딩 */}
        {loading && (
          <View style={{ padding:16, alignItems:'center' }}>
            <ActivityIndicator color={p.pri} />
            <Text style={{ fontSize:12, color:p.tx3, marginTop:8 }}>분석 중...</Text>
          </View>
        )}

        {/* 결과 */}
        {shown && !loading && results.length > 0 && (
          <View style={{ backgroundColor:p.bg2, borderRadius:10, overflow:'hidden', marginBottom:8 }}>
            <View style={{ padding:10, borderBottomWidth:0.5, borderBottomColor:p.tx3+'20' }}>
              <Text style={{ fontSize:11, fontWeight:'600', color:p.tx2 }}>추출된 채용 일정</Text>
            </View>
            {results.map((item, i) => {
              const dd   = dday(item.date);
              const done = added.has(i);
              const ddColor = dd <= 3 ? p.dan : dd <= 7 ? p.acc : p.tx3;
              return (
                <View key={i} style={{
                  flexDirection:'row', alignItems:'center', gap:6, padding:10,
                  borderBottomWidth: i < results.length-1 ? 0.5 : 0,
                  borderBottomColor: p.tx3+'20',
                }}>
                  <Text style={{ fontSize:12, fontWeight:'600', color:p.tx, minWidth:44 }}>{company}</Text>
                  <Text style={{ flex:1, fontSize:11, color:p.tx2 }}>{item.stage}</Text>
                  <Text style={{ fontSize:10, color:p.tx2, minWidth:36 }}>{item.date.slice(5).replace('-','/')}</Text>
                  <View style={{ paddingHorizontal:5, paddingVertical:2, borderRadius:99, backgroundColor: dd <= 3 ? p.dan+'20' : dd <= 7 ? p.acc+'20' : p.bg3 }}>
                    <Text style={{ fontSize:9, color:ddColor }}>D-{dd}</Text>
                  </View>
                  <TouchableOpacity
                    style={{ paddingHorizontal:9, paddingVertical:4, borderRadius:99, borderWidth:0.5,
                      borderColor: done ? p.tx3+'40' : p.acc,
                      backgroundColor: done ? 'transparent' : p.acc+'15' }}
                    onPress={() => !done && handleAdd(i)}
                    disabled={done}>
                    <Text style={{ fontSize:10, color: done ? p.tx3 : p.pri, fontWeight:'500' }}>
                      {done ? '완료' : '추가'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <Text style={{ fontSize:10, color:p.tx3, lineHeight:16 }}>
          실제 공고와 다를 수 있으니 채용 홈페이지에서 꼭 확인하세요.
        </Text>
      </View>
  );
}