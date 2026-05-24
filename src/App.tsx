import { useHashRoute } from './lib/hashRouter';
import { Today } from './pages/Today';
import { DayDetail } from './pages/DayDetail';
import { ExerciseView } from './pages/ExerciseView';
import { Session } from './pages/Session';
import { SessionDone } from './pages/SessionDone';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

export function App() {
  const path = useHashRoute();

  if (path === '/' || path === '') return <Today />;

  const dayMatch = path.match(/^\/day\/(.+)$/);
  if (dayMatch) return <DayDetail dayId={decodeURIComponent(dayMatch[1])} />;

  const exMatch = path.match(/^\/exercise\/(.+)$/);
  if (exMatch) return <ExerciseView exerciseId={decodeURIComponent(exMatch[1])} />;

  // /session/:id or /session/:id/:exerciseIdx
  const sessionMatch = path.match(/^\/session\/(\d+)(?:\/(\d+))?$/);
  if (sessionMatch) {
    const sid = Number(sessionMatch[1]);
    const idx = sessionMatch[2] ? Number(sessionMatch[2]) : 0;
    return <Session sessionId={sid} exerciseIdx={idx} />;
  }

  const doneMatch = path.match(/^\/done\/(\d+)$/);
  if (doneMatch) return <SessionDone sessionId={Number(doneMatch[1])} />;

  if (path === '/history') return <History />;
  if (path === '/settings') return <Settings />;

  return (
    <div style={{ minHeight: '100vh', background: '#FBF7F1', color: '#2A2421', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9A8A78', fontFamily: '"Nunito",system-ui' }}>Страница не найдена</div>
    </div>
  );
}
