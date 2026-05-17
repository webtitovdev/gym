import { useEffect, useState } from 'preact/hooks';

const DISMISS_KEY = 'ios-install-dismissed';

export function IOSInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari quirk
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    const dismissed = localStorage.getItem(DISMISS_KEY) === '1';
    if (isIOS && !isStandalone && !dismissed) setShow(true);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setShow(false);
  };

  return (
    <div class="mx-4 mt-3 p-3 bg-blue-950/60 border border-blue-900/60 rounded-xl flex items-start gap-3">
      <div class="text-2xl shrink-0 leading-none">📱</div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-bold text-blue-300">
          Установить как приложение
        </div>
        <div class="text-xs text-zinc-400 mt-1 leading-relaxed">
          В Safari внизу нажми{' '}
          <span class="inline-block px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300 font-mono text-[11px]">
            ⎙
          </span>{' '}
          Поделиться → <span class="text-zinc-200 font-semibold">«На экран Домой»</span>. Будет
          работать как обычное приложение, в том числе оффлайн.
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        class="text-zinc-500 active:text-zinc-300 -mt-1 -mr-1 px-2 leading-none"
        aria-label="закрыть"
      >
        ✕
      </button>
    </div>
  );
}
