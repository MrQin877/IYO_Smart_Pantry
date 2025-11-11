// simple global pub/sub using the window
export const UnreadBus = {
  get() {
    return Number(localStorage.getItem('unread_hint') || 0);
  },
  set(n) {
    const v = Math.max(0, Number(n || 0));
    localStorage.setItem('unread_hint', String(v));
    window.dispatchEvent(new CustomEvent('unread:set', { detail: { value: v }}));
  },
  dec() { this.set(this.get() - 1); },
  clear() { this.set(0); },
};
