import { useEffect, useState } from 'preact/hooks';
import { pal } from '../lib/designTokens';

const DISMISS_KEY = 'ios-install-dismissed';

export function IOSInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
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
    <div style={{
      margin: '12px 16px 0',
      padding: 12,
      background: pal.lavender,
      borderRadius: 16,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
    }}>
      <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>📱</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: pal.ink }}>
          Установить как приложение
        </div>
        <div style={{ fontSize: 11, color: pal.ink2, marginTop: 4, lineHeight: 1.4, fontWeight: 600 }}>
          В Safari нажми{' '}
          <span style={{ padding: '1px 6px', background: pal.card, borderRadius: 5, fontFamily: 'ui-monospace,monospace', fontSize: 10 }}>⎙</span>
          {' '}→ <span style={{ fontWeight: 800 }}>«На экран Домой»</span>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        style={{ background: 'transparent', border: 'none', color: pal.ink2, padding: '0 4px', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' }}
        aria-label="закрыть"
      >
        ✕
      </button>
    </div>
  );
}
