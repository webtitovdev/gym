class WakeLockManager {
  private lock: WakeLockSentinel | null = null;
  private active = false;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  private onVisibilityChange = async () => {
    if (
      this.active &&
      !this.lock &&
      document.visibilityState === 'visible' &&
      'wakeLock' in navigator
    ) {
      try {
        this.lock = await navigator.wakeLock.request('screen');
      } catch (e) {
        console.warn('Wake lock re-acquire failed:', e);
      }
    }
  };

  async acquire(): Promise<void> {
    if (!('wakeLock' in navigator)) return;
    this.active = true;
    if (!this.lock) {
      try {
        this.lock = await navigator.wakeLock.request('screen');
      } catch (e) {
        console.warn('Wake lock denied:', e);
      }
    }
  }

  async release(): Promise<void> {
    this.active = false;
    if (this.lock) {
      try {
        await this.lock.release();
      } catch {
        /* ignore */
      }
      this.lock = null;
    }
  }
}

export const wakeLock = new WakeLockManager();
