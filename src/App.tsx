import { useHashRoute } from './lib/hashRouter';
import { Today } from './pages/Today';
import { DayDetail } from './pages/DayDetail';
import { ExerciseView } from './pages/ExerciseView';
import { Session } from './pages/Session';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

export function App() {
  const path = useHashRoute();

  if (path === '/' || path === '') return <Today />;

  const dayMatch = path.match(/^\/day\/(.+)$/);
  if (dayMatch) return <DayDetail dayId={decodeURIComponent(dayMatch[1])} />;

  const exMatch = path.match(/^\/exercise\/(.+)$/);
  if (exMatch) return <ExerciseView exerciseId={decodeURIComponent(exMatch[1])} />;

  const sessionMatch = path.match(/^\/session\/(\d+)$/);
  if (sessionMatch) return <Session sessionId={Number(sessionMatch[1])} />;

  if (path === '/history') return <History />;
  if (path === '/settings') return <Settings />;

  return (
    <div class="min-h-screen bg-black text-white flex items-center justify-center">
      <div class="text-zinc-400">Страница не найдена</div>
    </div>
  );
}
