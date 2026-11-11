/* Zero-dependency smoke test: bundle identity, no runtime requires,
   gated style injection and teardown. Run with `npm test`. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let captured = null;
const intervals = [];

const fakeEl = (tag) => ({
  tagName: tag,
  style: {},
  id: '',
  attributes: {},
  setAttribute(k, v) { this.attributes[k] = v; },
  appendChild() {},
  remove() { if (this._parent) this._parent.children = this._parent.children.filter((c) => c !== this); },
  getContext: () => null,
});

const head = { children: [], appendChild(el) { el._parent = this; this.children.push(el); } };
const body = {
  attributes: {},
  setAttribute(k, v) { this.attributes[k] = v; },
  removeAttribute(k) { delete this.attributes[k]; },
  hasAttribute(k) { return k in this.attributes; },
  appendChild() {},
  insertBefore() {},
  parentNode: null,
  firstChild: null,
};

const window = {
  __ModuleLoader__: { load(cfg) { captured = cfg; } },
  addEventListener() {},
  setInterval: (fn) => { intervals.push(fn); return intervals.length; },
  clearInterval() {},
  matchMedia: () => ({ matches: false }),
  innerWidth: 1200,
  innerHeight: 800,
  devicePixelRatio: 1,
  localStorage: { getItem: () => null, setItem() {} },
  performance: { now: () => Date.now() },
  Path2D: class {},
};

const document = {
  head,
  body,
  documentElement: { style: {}, setAttribute() {}, removeAttribute() {}, addEventListener() {} },
  createElement: fakeEl,
  getElementById: (id) => head.children.find((c) => c.id === id) || null,
  querySelector: () => null,
  addEventListener() {},
};

const sandbox = {
  window,
  document,
  console,
  performance: window.performance,
  Math,
  Date,
  innerWidth: 1200,
  innerHeight: 800,
  devicePixelRatio: 1,
  requestAnimationFrame: () => 0,
  cancelAnimationFrame() {},
  setInterval: (fn) => { intervals.push(fn); return intervals.length; },
  clearInterval() {},
  setTimeout: (fn) => { fn(); return 1; },
  clearTimeout() {},
  MutationObserver: class { observe() {} disconnect() {} },
  ResizeObserver: class { observe() {} disconnect() {} },
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'lib', 'client.js'), 'utf8'), sandbox);

if (!captured || captured.id !== 'dsh-dshomepage-skin') throw new Error('module id mismatch');

const mod = captured.factory(() => { throw new Error('the bundle must not require() anything'); });
const effects = [];
const ctx = {
  effect(fn) { const d = fn(); effects.push(d); return d; },
  slots: { inject() { throw new Error('slots must not be used'); }, register() { throw new Error('slots must not be used'); } },
  locale: { register() { throw new Error('locale must not be used'); } },
};
mod.apply(ctx);

if (effects.length !== 1) throw new Error('expected exactly one effect, got ' + effects.length);
if (head.children.length !== 1) throw new Error('style not injected');
const css = head.children[0].textContent;
if (!css.includes('body[data-dsh-dshomepage-skin]')) throw new Error('gate attribute missing from CSS');
if (css.includes('dsh-dshomepage-skin-btn')) throw new Error('settings button CSS still present');
if (mod.inject.length !== 0) throw new Error('inject should be empty, got ' + JSON.stringify(mod.inject));
if (intervals.length === 0) throw new Error('engine did not start polling for the frame');

effects[0]();
if (head.children.length !== 0) throw new Error('teardown did not remove the style');

console.log('SMOKE_OK: id=yes, requires=none, inject=[], style=gated, teardown=ok');
