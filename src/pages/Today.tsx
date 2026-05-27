import { useEffect, useState } from 'preact/hooks';
import { loadProgram } from '../lib/loadData';
import { useLive } from '../lib/useLive';
import { db } from '../db/schema';
import { startSession } from '../db/queries';
import { navigate } from '../lib/hashRouter';
import { pal, formatDayDate, dayCode, DOW_RU_SHORT } from '../lib/designTokens';
import { BottomNav } from '../components/BottomNav';
import { IOSInstallBanner } from '../components/IOSInstallBanner';
import { getWeekStats, getCompletedDayIndicesThisWeek, formatVolume, type WeekStats } from '../lib/stats';
import type { Program, Day } from '../types';

export function Today() {
  const [program, setProgram] = useState<Program | null>(null);
  const [stats, setStats] = useState<WeekStats | null>(null);
  const [doneIdx, setDoneIdx] = useState<number[]>([]);

  useEffect(() => {
    loadProgram().then(setProgram);
    getWeekStats().then(setStats);
    getCompletedDayIndicesThisWeek().then(setDoneIdx);
  }, []);

  const activeSession = useLive(async () => {
    const sessions = await db.sessions.where('completedAt').equals(0).toArray();
    sessions.sort((a, b) => b.startedAt - a.startedAt);
    return sessions[0];
  });

  if (!program) {
    return <div style={{ padding: 20, color: pal.mute }}>Загрузка...</div>;
  }

  const now = new Date();
  const todayDow = now.getDay(); // 0=Sun..6=Sat
  const todayDay = program.days.find((d) => d.dayOfWeek === todayDow);
  const trainingDows = program.days.map((d) => d.dayOfWeek); // [1,3,5]
  const trainingIdx = trainingDows.map((d) => ((d || 7) - 1)); // convert to Mon=0..Sun=6

  // Compute today index in Mon-first week
  const todayMonIdx = ((todayDow || 7) - 1);

  // Compute next training day for "Up next" card
  let nextDay: Day | undefined;
  let nextDaysAway = 0;
  if (!todayDay) {
    for (let offset = 1; offset <= 7; offset++) {
      const dow = (todayDow + offset) % 7;
      const match = program.days.find((d) => d.dayOfWeek === dow);
      if (match) {
        nextDay = match;
        nextDaysAway = offset;
        break;
      }
    }
  } else {
    // also show next training day after today
    for (let offset = 1; offset <= 7; offset++) {
      const dow = (todayDow + offset) % 7;
      const match = program.days.find((d) => d.dayOfWeek === dow);
      if (match) {
        nextDay = match;
        nextDaysAway = offset;
        break;
      }
    }
  }

  // Week strip — render Mon..Sun
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - todayMonIdx);

  const startTodaysWorkout = async () => {
    if (activeSession?.id) {
      navigate(`/session/${activeSession.id}`);
      return;
    }
    if (!todayDay) return;
    const id = await startSession(todayDay.id);
    navigate(`/session/${id}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: pal.bg, paddingBottom: 110, maxWidth: 480, margin: '0 auto' }}>
      <IOSInstallBanner />

      {/* Greeting */}
      <div style={{ padding: '34px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, color: pal.mute, fontWeight: 600, textTransform: 'capitalize' }}>
            {formatDayDate(now)}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2, color: pal.ink }}>Привет</div>
        </div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            background: `linear-gradient(135deg,${pal.peachL},${pal.peach})`,
            flexShrink: 0,
          }}
        />
      </div>

      {/* Active session banner (if any) */}
      {activeSession?.id && (
        <a
          href={`#/session/${activeSession.id}`}
          style={{
            display: 'block',
            margin: '16px 20px 0',
            padding: 12,
            background: pal.peachL,
            border: `1px solid ${pal.peach}`,
            borderRadius: 16,
            textDecoration: 'none',
            color: pal.ink,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, color: pal.terraD, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800 }}>
                Тренировка в процессе
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>
                Продолжить →
              </div>
            </div>
            <div style={{ fontSize: 11, color: pal.terraD, fontWeight: 700 }}>
              {Math.floor((Date.now() - activeSession.startedAt) / 60000)} мин
            </div>
          </div>
        </a>
      )}

      {/* Week strip */}
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between' }}>
        {DOW_RU_SHORT.slice(1).concat([DOW_RU_SHORT[0]]).map((dLabel, i) => {
          // i is 0..6 Mon..Sun
          const isToday = i === todayMonIdx;
          const isTraining = trainingIdx.includes(i);
          const isDone = doneIdx.includes(i);
          const dateNum = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i).getDate();
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 36 }}>
              <span style={{ fontSize: 11, color: pal.mute, fontWeight: 700 }}>{dLabel}</span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  background: isToday ? pal.ink : (isDone ? pal.peachL : pal.bgSoft),
                  color: isToday ? pal.peachL : pal.ink,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  position: 'relative',
                  border: isTraining && !isToday && !isDone ? `1.5px dashed ${pal.muteSoft}` : 'none',
                }}
              >
                {dateNum}
                {isDone && (
                  <div style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 13,
                    height: 13,
                    borderRadius: 7,
                    background: pal.terra,
                    border: `2px solid ${pal.bg}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="6" height="5" viewBox="0 0 6 5">
                      <path d="M1 2.5L2.5 4l3-3.5" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hero — today */}
      <div style={{ padding: '20px 20px 0' }}>
        {todayDay ? (
          <div
            style={{
              position: 'relative',
              borderRadius: 28,
              background: `linear-gradient(150deg,${pal.peachL},${pal.peach} 65%,${pal.peachD})`,
              padding: 20,
              overflow: 'hidden',
              boxShadow: '0 14px 30px rgba(200,120,80,0.20)',
              minHeight: 200,
            }}
          >
            <div style={{ fontSize: 11, color: pal.terraD, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 800 }}>
              Сегодняшняя тренировка
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -1, color: pal.ink, marginTop: 6 }}>
              Full Body {dayCode(todayDay.id)}.
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: pal.ink2, marginTop: 2 }}>
              {todayDay.exercises.length} упражнений · ~45 мин
            </div>

            {/* progress ring (sessions this week / 3) */}
            <svg viewBox="0 0 100 100" width="150" height="150" style={{ position: 'absolute', right: -8, top: -8 }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(42,36,33,0.16)" strokeWidth="9" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={pal.ink}
                strokeWidth="9"
                strokeDasharray="251"
                strokeDashoffset={251 - 251 * (stats ? Math.min(1, stats.sessionsThisWeek / 3) : 0)}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="49" textAnchor="middle" fill={pal.ink} fontSize="15" fontWeight="900">
                {stats?.sessionsThisWeek ?? 0}/3
              </text>
              <text x="50" y="62" textAnchor="middle" fill={pal.ink2} fontSize="6" opacity=".75" fontWeight="800">
                ЭТА НЕДЕЛЯ
              </text>
            </svg>

            <button
              type="button"
              onClick={startTodaysWorkout}
              style={{
                position: 'absolute',
                left: 20,
                bottom: 20,
                padding: '12px 22px',
                background: pal.ink,
                color: pal.peachL,
                border: 'none',
                borderRadius: 100,
                fontWeight: 800,
                fontSize: 13,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              {activeSession?.id ? 'Продолжить' : 'Начать тренировку'}
              <svg width="11" height="11" viewBox="0 0 11 11">
                <path d="M1 5.5h9M6 1l4.5 4.5L6 10" stroke={pal.peachL} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            style={{
              borderRadius: 28,
              background: pal.card,
              padding: 20,
              border: `1px solid ${pal.line}`,
              minHeight: 120,
            }}
          >
            <div style={{ fontSize: 11, color: pal.mute, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 800 }}>
              Сегодня
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, color: pal.ink, marginTop: 6 }}>
              День отдыха
            </div>
            {nextDay && (
              <div style={{ fontSize: 12, color: pal.mute, fontWeight: 700, marginTop: 8 }}>
                Следующая тренировка — {DOW_RU_SHORT[nextDay.dayOfWeek]} (через {nextDaysAway} {nextDaysAway === 1 ? 'день' : 'дн'})
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8 }}>
        {[
          [stats ? formatVolume(stats.totalVolumeKg) : '—', 'Поднято', 'эта неделя'],
          [stats ? String(stats.totalSets) : '—', 'Сетов', 'сделано'],
          [stats ? `${stats.streakWeeks}нд` : '—', 'Серия', 'недель'],
        ].map(([v, l, s], i) => (
          <div key={i} style={{ flex: 1, background: pal.card, borderRadius: 18, padding: '12px 12px', border: `1px solid ${pal.line}` }}>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, color: pal.ink, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
            <div style={{ fontSize: 11, color: pal.mute, fontWeight: 700, marginTop: 2 }}>{l}</div>
            <div style={{ fontSize: 10, color: pal.muteSoft, fontWeight: 600 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* All program days */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 12, color: pal.mute, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>
          Все дни программы
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {program.days.map((d) => {
            const dayIdx = ((d.dayOfWeek || 7) - 1);
            const isToday = d.dayOfWeek === todayDow;
            const isDone = doneIdx.includes(dayIdx);
            const totalSets = d.exercises.reduce((s, e) => s + e.sets, 0);
            const tints: Record<string, string> = { '1': pal.peachL, '2': pal.lavender, '3': pal.butter };
            const accentBg = tints[d.id] || pal.peachL;
            return (
              <a
                key={d.id}
                href={`#/day/${d.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: pal.card,
                  borderRadius: 18,
                  padding: '12px 14px',
                  border: isToday ? `1.5px solid ${pal.peach}` : `1px solid ${pal.line}`,
                  textDecoration: 'none',
                  color: pal.ink,
                  position: 'relative',
                }}
              >
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  background: accentBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 18,
                  color: pal.ink,
                  flexShrink: 0,
                }}>
                  {dayCode(d.id)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>Full Body {dayCode(d.id)}</div>
                    {isToday && (
                      <span style={{ fontSize: 9, color: pal.terraD, fontWeight: 900, background: pal.peachL, padding: '1px 7px', borderRadius: 100, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                        сегодня
                      </span>
                    )}
                    {isDone && !isToday && (
                      <span style={{ fontSize: 9, color: '#2d7a5f', fontWeight: 900, background: '#c8e6d4', padding: '1px 7px', borderRadius: 100, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                        сделано
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: pal.mute, fontWeight: 700, marginTop: 2 }}>
                    {DOW_RU_SHORT[d.dayOfWeek]} · {d.exercises.length} упр · {totalSets} сетов
                  </div>
                </div>
                {isDone && (
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: pal.terra,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="12" height="9" viewBox="0 0 12 9">
                      <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                {!isDone && (
                  <svg width="6" height="10" viewBox="0 0 6 10"><path d="M1 1l4 4-4 4" stroke={pal.muteSoft} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </a>
            );
          })}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
