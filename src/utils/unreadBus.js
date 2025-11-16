// utils/unreadBus.js
export const UnreadBus = {
  _v: 0,
  get(){ return this._v; },
  set(n){
    this._v = Number(n || 0);
    window.dispatchEvent(new CustomEvent('unread:set', { detail: { value: this._v }}));
  },
  inc(k=1){ this.set(this._v + Number(k)); },
  dec(k=1){ this.set(Math.max(0, this._v - Number(k))); },
  clear(){ this.set(0); }
};
