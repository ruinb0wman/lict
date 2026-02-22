var gd = Object.defineProperty;
var Ni = (e) => {
  throw TypeError(e);
};
var _d = (e, t, r) => t in e ? gd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Xr = (e, t, r) => _d(e, typeof t != "symbol" ? t + "" : t, r), ks = (e, t, r) => t.has(e) || Ni("Cannot " + r);
var Y = (e, t, r) => (ks(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Xe = (e, t, r) => t.has(e) ? Ni("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Ce = (e, t, r, n) => (ks(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), ft = (e, t, r) => (ks(e, t, "access private method"), r);
import tl, { app as pt, ipcMain as tt, dialog as rl, screen as vd, BrowserWindow as wd, Tray as Ed, Menu as bd, clipboard as Sd } from "electron";
import W from "node:fs";
import { fileURLToPath as Pd } from "node:url";
import Z from "node:path";
import fe from "node:process";
import { promisify as Se, isDeepStrictEqual as Ri } from "node:util";
import Jr from "node:crypto";
import Oi from "node:assert";
import nl from "node:os";
import "node:events";
import "node:stream";
const dr = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, sl = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), al = 1e6, Nd = (e) => e >= "0" && e <= "9";
function ol(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const t = Number.parseInt(e, 10);
    return t <= Number.MAX_SAFE_INTEGER && t <= al;
  }
  return !1;
}
function Cs(e, t) {
  return sl.has(e) ? !1 : (e && ol(e) ? t.push(Number.parseInt(e, 10)) : t.push(e), !0);
}
function Rd(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  const t = [];
  let r = "", n = "start", s = !1, a = 0;
  for (const o of e) {
    if (a++, s) {
      r += o, s = !1;
      continue;
    }
    if (o === "\\") {
      if (n === "index")
        throw new Error(`Invalid character '${o}' in an index at position ${a}`);
      if (n === "indexEnd")
        throw new Error(`Invalid character '${o}' after an index at position ${a}`);
      s = !0, n = n === "start" ? "property" : n;
      continue;
    }
    switch (o) {
      case ".": {
        if (n === "index")
          throw new Error(`Invalid character '${o}' in an index at position ${a}`);
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (!Cs(r, t))
          return [];
        r = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error(`Invalid character '${o}' in an index at position ${a}`);
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (n === "property" || n === "start") {
          if ((r || n === "property") && !Cs(r, t))
            return [];
          r = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          if (r === "")
            r = (t.pop() || "") + "[]", n = "property";
          else {
            const l = Number.parseInt(r, 10);
            !Number.isNaN(l) && Number.isFinite(l) && l >= 0 && l <= Number.MAX_SAFE_INTEGER && l <= al && r === String(l) ? t.push(l) : t.push(r), r = "", n = "indexEnd";
          }
          break;
        }
        if (n === "indexEnd")
          throw new Error(`Invalid character '${o}' after an index at position ${a}`);
        r += o;
        break;
      }
      default: {
        if (n === "index" && !Nd(o))
          throw new Error(`Invalid character '${o}' in an index at position ${a}`);
        if (n === "indexEnd")
          throw new Error(`Invalid character '${o}' after an index at position ${a}`);
        n === "start" && (n = "property"), r += o;
      }
    }
  }
  switch (s && (r += "\\"), n) {
    case "property": {
      if (!Cs(r, t))
        return [];
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function hs(e) {
  if (typeof e == "string")
    return Rd(e);
  if (Array.isArray(e)) {
    const t = [];
    for (const [r, n] of e.entries()) {
      if (typeof n != "string" && typeof n != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${r}, got ${typeof n}`);
      if (typeof n == "number" && !Number.isFinite(n))
        throw new TypeError(`Path segment at index ${r} must be a finite number, got ${n}`);
      if (sl.has(n))
        return [];
      typeof n == "string" && ol(n) ? t.push(Number.parseInt(n, 10)) : t.push(n);
    }
    return t;
  }
  return [];
}
function Ii(e, t, r) {
  if (!dr(e) || typeof t != "string" && !Array.isArray(t))
    return r === void 0 ? e : r;
  const n = hs(t);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (e = e[a], e == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function bn(e, t, r) {
  if (!dr(e) || typeof t != "string" && !Array.isArray(t))
    return e;
  const n = e, s = hs(t);
  if (s.length === 0)
    return e;
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    if (a === s.length - 1)
      e[o] = r;
    else if (!dr(e[o])) {
      const c = typeof s[a + 1] == "number";
      e[o] = c ? [] : {};
    }
    e = e[o];
  }
  return n;
}
function Od(e, t) {
  if (!dr(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const r = hs(t);
  if (r.length === 0)
    return !1;
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (n === r.length - 1)
      return Object.hasOwn(e, s) ? (delete e[s], !0) : !1;
    if (e = e[s], !dr(e))
      return !1;
  }
}
function Ds(e, t) {
  if (!dr(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const r = hs(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!dr(e) || !(n in e))
      return !1;
    e = e[n];
  }
  return !0;
}
const jt = nl.homedir(), Pa = nl.tmpdir(), { env: Er } = fe, Id = (e) => {
  const t = Z.join(jt, "Library");
  return {
    data: Z.join(t, "Application Support", e),
    config: Z.join(t, "Preferences", e),
    cache: Z.join(t, "Caches", e),
    log: Z.join(t, "Logs", e),
    temp: Z.join(Pa, e)
  };
}, Td = (e) => {
  const t = Er.APPDATA || Z.join(jt, "AppData", "Roaming"), r = Er.LOCALAPPDATA || Z.join(jt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: Z.join(r, e, "Data"),
    config: Z.join(t, e, "Config"),
    cache: Z.join(r, e, "Cache"),
    log: Z.join(r, e, "Log"),
    temp: Z.join(Pa, e)
  };
}, jd = (e) => {
  const t = Z.basename(jt);
  return {
    data: Z.join(Er.XDG_DATA_HOME || Z.join(jt, ".local", "share"), e),
    config: Z.join(Er.XDG_CONFIG_HOME || Z.join(jt, ".config"), e),
    cache: Z.join(Er.XDG_CACHE_HOME || Z.join(jt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: Z.join(Er.XDG_STATE_HOME || Z.join(jt, ".local", "state"), e),
    temp: Z.join(Pa, t, e)
  };
};
function Ad(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), fe.platform === "darwin" ? Id(e) : fe.platform === "win32" ? Td(e) : jd(e);
}
const Et = (e, t) => {
  const { onError: r } = t;
  return function(...s) {
    return e.apply(void 0, s).catch(r);
  };
}, ht = (e, t) => {
  const { onError: r } = t;
  return function(...s) {
    try {
      return e.apply(void 0, s);
    } catch (a) {
      return r(a);
    }
  };
}, kd = 250, bt = (e, t) => {
  const { isRetriable: r } = t;
  return function(s) {
    const { timeout: a } = s, o = s.interval ?? kd, l = Date.now() + a;
    return function c(...d) {
      return e.apply(void 0, d).catch((u) => {
        if (!r(u) || Date.now() >= l)
          throw u;
        const h = Math.round(o * Math.random());
        return h > 0 ? new Promise((g) => setTimeout(g, h)).then(() => c.apply(void 0, d)) : c.apply(void 0, d);
      });
    };
  };
}, St = (e, t) => {
  const { isRetriable: r } = t;
  return function(s) {
    const { timeout: a } = s, o = Date.now() + a;
    return function(...c) {
      for (; ; )
        try {
          return e.apply(void 0, c);
        } catch (d) {
          if (!r(d) || Date.now() >= o)
            throw d;
          continue;
        }
    };
  };
}, br = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!br.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !Cd && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!br.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!br.isNodeError(e))
      throw e;
    if (!br.isChangeErrorOk(e))
      throw e;
  }
}, Sn = {
  onError: br.onChangeError
}, ze = {
  onError: () => {
  }
}, Cd = fe.getuid ? !fe.getuid() : !1, Pe = {
  isRetriable: br.isRetriableError
}, Oe = {
  attempt: {
    /* ASYNC */
    chmod: Et(Se(W.chmod), Sn),
    chown: Et(Se(W.chown), Sn),
    close: Et(Se(W.close), ze),
    fsync: Et(Se(W.fsync), ze),
    mkdir: Et(Se(W.mkdir), ze),
    realpath: Et(Se(W.realpath), ze),
    stat: Et(Se(W.stat), ze),
    unlink: Et(Se(W.unlink), ze),
    /* SYNC */
    chmodSync: ht(W.chmodSync, Sn),
    chownSync: ht(W.chownSync, Sn),
    closeSync: ht(W.closeSync, ze),
    existsSync: ht(W.existsSync, ze),
    fsyncSync: ht(W.fsync, ze),
    mkdirSync: ht(W.mkdirSync, ze),
    realpathSync: ht(W.realpathSync, ze),
    statSync: ht(W.statSync, ze),
    unlinkSync: ht(W.unlinkSync, ze)
  },
  retry: {
    /* ASYNC */
    close: bt(Se(W.close), Pe),
    fsync: bt(Se(W.fsync), Pe),
    open: bt(Se(W.open), Pe),
    readFile: bt(Se(W.readFile), Pe),
    rename: bt(Se(W.rename), Pe),
    stat: bt(Se(W.stat), Pe),
    write: bt(Se(W.write), Pe),
    writeFile: bt(Se(W.writeFile), Pe),
    /* SYNC */
    closeSync: St(W.closeSync, Pe),
    fsyncSync: St(W.fsyncSync, Pe),
    openSync: St(W.openSync, Pe),
    readFileSync: St(W.readFileSync, Pe),
    renameSync: St(W.renameSync, Pe),
    statSync: St(W.statSync, Pe),
    writeSync: St(W.writeSync, Pe),
    writeFileSync: St(W.writeFileSync, Pe)
  }
}, Dd = "utf8", Ti = 438, Md = 511, Vd = {}, Ld = fe.geteuid ? fe.geteuid() : -1, Fd = fe.getegid ? fe.getegid() : -1, zd = 1e3, Ud = !!fe.getuid;
fe.getuid && fe.getuid();
const ji = 128, qd = (e) => e instanceof Error && "code" in e, Ai = (e) => typeof e == "string", Ms = (e) => e === void 0, Kd = fe.platform === "linux", il = fe.platform === "win32", Na = ["SIGHUP", "SIGINT", "SIGTERM"];
il || Na.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Kd && Na.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class Gd {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (il && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? fe.kill(fe.pid, "SIGTERM") : fe.kill(fe.pid, t));
      }
    }, this.hook = () => {
      fe.once("exit", () => this.exit());
      for (const t of Na)
        try {
          fe.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const Hd = new Gd(), Xd = Hd.register, Ie = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${s}`;
  },
  get: (e, t, r = !0) => {
    const n = Ie.truncate(t(e));
    return n in Ie.store ? Ie.get(e, t, r) : (Ie.store[n] = r, [n, () => delete Ie.store[n]]);
  },
  purge: (e) => {
    Ie.store[e] && (delete Ie.store[e], Oe.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Ie.store[e] && (delete Ie.store[e], Oe.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Ie.store)
      Ie.purgeSync(e);
  },
  truncate: (e) => {
    const t = Z.basename(e);
    if (t.length <= ji)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - ji;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Xd(Ie.purgeSyncAll);
function cl(e, t, r = Vd) {
  if (Ai(r))
    return cl(e, t, { encoding: r });
  const s = { timeout: r.timeout ?? zd };
  let a = null, o = null, l = null;
  try {
    const c = Oe.attempt.realpathSync(e), d = !!c;
    e = c || e, [o, a] = Ie.get(e, r.tmpCreate || Ie.create, r.tmpPurge !== !1);
    const u = Ud && Ms(r.chown), h = Ms(r.mode);
    if (d && (u || h)) {
      const E = Oe.attempt.statSync(e);
      E && (r = { ...r }, u && (r.chown = { uid: E.uid, gid: E.gid }), h && (r.mode = E.mode));
    }
    if (!d) {
      const E = Z.dirname(e);
      Oe.attempt.mkdirSync(E, {
        mode: Md,
        recursive: !0
      });
    }
    l = Oe.retry.openSync(s)(o, "w", r.mode || Ti), r.tmpCreated && r.tmpCreated(o), Ai(t) ? Oe.retry.writeSync(s)(l, t, 0, r.encoding || Dd) : Ms(t) || Oe.retry.writeSync(s)(l, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Oe.retry.fsyncSync(s)(l) : Oe.attempt.fsync(l)), Oe.retry.closeSync(s)(l), l = null, r.chown && (r.chown.uid !== Ld || r.chown.gid !== Fd) && Oe.attempt.chownSync(o, r.chown.uid, r.chown.gid), r.mode && r.mode !== Ti && Oe.attempt.chmodSync(o, r.mode);
    try {
      Oe.retry.renameSync(s)(o, e);
    } catch (E) {
      if (!qd(E) || E.code !== "ENAMETOOLONG")
        throw E;
      Oe.retry.renameSync(s)(o, Ie.truncate(e));
    }
    a(), o = null;
  } finally {
    l && Oe.attempt.closeSync(l), o && Ie.purge(o);
  }
}
function ll(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var aa = { exports: {} }, ul = {}, xe = {}, jr = {}, yn = {}, x = {}, mn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(v) {
      if (super(), !e.IDENTIFIER.test(v))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(v) {
      super(), this._items = typeof v == "string" ? [v] : v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const v = this._items[0];
      return v === "" || v === '""';
    }
    get str() {
      var v;
      return (v = this._str) !== null && v !== void 0 ? v : this._str = this._items.reduce((N, R) => `${N}${R}`, "");
    }
    get names() {
      var v;
      return (v = this._names) !== null && v !== void 0 ? v : this._names = this._items.reduce((N, R) => (R instanceof r && (N[R.str] = (N[R.str] || 0) + 1), N), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...v) {
    const N = [m[0]];
    let R = 0;
    for (; R < v.length; )
      l(N, v[R]), N.push(m[++R]);
    return new n(N);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...v) {
    const N = [g(m[0])];
    let R = 0;
    for (; R < v.length; )
      N.push(a), l(N, v[R]), N.push(a, g(m[++R]));
    return c(N), new n(N);
  }
  e.str = o;
  function l(m, v) {
    v instanceof n ? m.push(...v._items) : v instanceof r ? m.push(v) : m.push(h(v));
  }
  e.addCodeArg = l;
  function c(m) {
    let v = 1;
    for (; v < m.length - 1; ) {
      if (m[v] === a) {
        const N = d(m[v - 1], m[v + 1]);
        if (N !== void 0) {
          m.splice(v - 1, 3, N);
          continue;
        }
        m[v++] = "+";
      }
      v++;
    }
  }
  function d(m, v) {
    if (v === '""')
      return m;
    if (m === '""')
      return v;
    if (typeof m == "string")
      return v instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof v != "string" ? `${m.slice(0, -1)}${v}"` : v[0] === '"' ? m.slice(0, -1) + v.slice(1) : void 0;
    if (typeof v == "string" && v[0] === '"' && !(m instanceof r))
      return `"${m}${v.slice(1)}`;
  }
  function u(m, v) {
    return v.emptyStr() ? m : m.emptyStr() ? v : o`${m}${v}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : g(Array.isArray(m) ? m.join(",") : m);
  }
  function E(m) {
    return new n(g(m));
  }
  e.stringify = E;
  function g(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = g;
  function w(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = w;
  function _(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = _;
  function $(m) {
    return new n(m.toString());
  }
  e.regexpCode = $;
})(mn);
var oa = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = mn;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(c) {
    c[c.Started = 0] = "Started", c[c.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: u } = {}) {
      this._names = {}, this._prefixes = d, this._parent = u;
    }
    toName(d) {
      return d instanceof t.Name ? d : this.name(d);
    }
    name(d) {
      return new t.Name(this._newName(d));
    }
    _newName(d) {
      const u = this._names[d] || this._nameGroup(d);
      return `${d}${u.index++}`;
    }
    _nameGroup(d) {
      var u, h;
      if (!((h = (u = this._parent) === null || u === void 0 ? void 0 : u._prefixes) === null || h === void 0) && h.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  e.Scope = s;
  class a extends t.Name {
    constructor(d, u) {
      super(u), this.prefix = d;
    }
    setValue(d, { property: u, itemIndex: h }) {
      this.value = d, this.scopePath = (0, t._)`.${new t.Name(u)}[${h}]`;
    }
  }
  e.ValueScopeName = a;
  const o = (0, t._)`\n`;
  class l extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? o : t.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new a(d, this._newName(d));
    }
    value(d, u) {
      var h;
      if (u.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const E = this.toName(d), { prefix: g } = E, w = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let _ = this._values[g];
      if (_) {
        const v = _.get(w);
        if (v)
          return v;
      } else
        _ = this._values[g] = /* @__PURE__ */ new Map();
      _.set(w, E);
      const $ = this._scope[g] || (this._scope[g] = []), m = $.length;
      return $[m] = u.ref, E.setValue(u, { property: g, itemIndex: m }), E;
    }
    getValue(d, u) {
      const h = this._values[d];
      if (h)
        return h.get(u);
    }
    scopeRefs(d, u = this._values) {
      return this._reduceValues(u, (h) => {
        if (h.scopePath === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return (0, t._)`${d}${h.scopePath}`;
      });
    }
    scopeCode(d = this._values, u, h) {
      return this._reduceValues(d, (E) => {
        if (E.value === void 0)
          throw new Error(`CodeGen: name "${E}" has no value`);
        return E.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, E) {
      let g = t.nil;
      for (const w in d) {
        const _ = d[w];
        if (!_)
          continue;
        const $ = h[w] = h[w] || /* @__PURE__ */ new Map();
        _.forEach((m) => {
          if ($.has(m))
            return;
          $.set(m, n.Started);
          let v = u(m);
          if (v) {
            const N = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            g = (0, t._)`${g}${N} ${m} = ${v};${this.opts._n}`;
          } else if (v = E == null ? void 0 : E(m))
            g = (0, t._)`${g}${v}${this.opts._n}`;
          else
            throw new r(m);
          $.set(m, n.Completed);
        });
      }
      return g;
    }
  }
  e.ValueScope = l;
})(oa);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = mn, r = oa;
  var n = mn;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = oa;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(i, f) {
      return this;
    }
  }
  class o extends a {
    constructor(i, f, b) {
      super(), this.varKind = i, this.name = f, this.rhs = b;
    }
    render({ es5: i, _n: f }) {
      const b = i ? r.varKinds.var : this.varKind, I = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${b} ${this.name}${I};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = T(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class l extends a {
    constructor(i, f, b) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = b;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = T(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return oe(i, this.rhs);
    }
  }
  class c extends l {
    constructor(i, f, b, I) {
      super(i, b, I), this.op = f;
    }
    render({ _n: i }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + i;
    }
  }
  class d extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `${this.label}:` + i;
    }
  }
  class u extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `break${this.label ? ` ${this.label}` : ""};` + i;
    }
  }
  class h extends a {
    constructor(i) {
      super(), this.error = i;
    }
    render({ _n: i }) {
      return `throw ${this.error};` + i;
    }
    get names() {
      return this.error.names;
    }
  }
  class E extends a {
    constructor(i) {
      super(), this.code = i;
    }
    render({ _n: i }) {
      return `${this.code};` + i;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(i, f) {
      return this.code = T(this.code, i, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class g extends a {
    constructor(i = []) {
      super(), this.nodes = i;
    }
    render(i) {
      return this.nodes.reduce((f, b) => f + b.render(i), "");
    }
    optimizeNodes() {
      const { nodes: i } = this;
      let f = i.length;
      for (; f--; ) {
        const b = i[f].optimizeNodes();
        Array.isArray(b) ? i.splice(f, 1, ...b) : b ? i[f] = b : i.splice(f, 1);
      }
      return i.length > 0 ? this : void 0;
    }
    optimizeNames(i, f) {
      const { nodes: b } = this;
      let I = b.length;
      for (; I--; ) {
        const j = b[I];
        j.optimizeNames(i, f) || (A(i, j.names), b.splice(I, 1));
      }
      return b.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => H(i, f.names), {});
    }
  }
  class w extends g {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class _ extends g {
  }
  class $ extends w {
  }
  $.kind = "else";
  class m extends w {
    constructor(i, f) {
      super(f), this.condition = i;
    }
    render(i) {
      let f = `if(${this.condition})` + super.render(i);
      return this.else && (f += "else " + this.else.render(i)), f;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const i = this.condition;
      if (i === !0)
        return this.nodes;
      let f = this.else;
      if (f) {
        const b = f.optimizeNodes();
        f = this.else = Array.isArray(b) ? new $(b) : b;
      }
      if (f)
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(V(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var b;
      if (this.else = (b = this.else) === null || b === void 0 ? void 0 : b.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = T(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return oe(i, this.condition), this.else && H(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class v extends w {
  }
  v.kind = "for";
  class N extends v {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = T(this.iteration, i, f), this;
    }
    get names() {
      return H(super.names, this.iteration.names);
    }
  }
  class R extends v {
    constructor(i, f, b, I) {
      super(), this.varKind = i, this.name = f, this.from = b, this.to = I;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: b, from: I, to: j } = this;
      return `for(${f} ${b}=${I}; ${b}<${j}; ${b}++)` + super.render(i);
    }
    get names() {
      const i = oe(super.names, this.from);
      return oe(i, this.to);
    }
  }
  class O extends v {
    constructor(i, f, b, I) {
      super(), this.loop = i, this.varKind = f, this.name = b, this.iterable = I;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = T(this.iterable, i, f), this;
    }
    get names() {
      return H(super.names, this.iterable.names);
    }
  }
  class K extends w {
    constructor(i, f, b) {
      super(), this.name = i, this.args = f, this.async = b;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  K.kind = "func";
  class B extends g {
    render(i) {
      return "return " + super.render(i);
    }
  }
  B.kind = "return";
  class de extends w {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var b, I;
      return super.optimizeNames(i, f), (b = this.catch) === null || b === void 0 || b.optimizeNames(i, f), (I = this.finally) === null || I === void 0 || I.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && H(i, this.catch.names), this.finally && H(i, this.finally.names), i;
    }
  }
  class he extends w {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  he.kind = "catch";
  class ye extends w {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  ye.kind = "finally";
  class z {
    constructor(i, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = i, this._scope = new r.Scope({ parent: i }), this._nodes = [new _()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(i) {
      return this._scope.name(i);
    }
    // reserves unique name in the external scope
    scopeName(i) {
      return this._extScope.name(i);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(i, f) {
      const b = this._extScope.value(i, f);
      return (this._values[b.prefix] || (this._values[b.prefix] = /* @__PURE__ */ new Set())).add(b), b;
    }
    getScopeValue(i, f) {
      return this._extScope.getValue(i, f);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(i) {
      return this._extScope.scopeRefs(i, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(i, f, b, I) {
      const j = this._scope.toName(f);
      return b !== void 0 && I && (this._constants[j.str] = b), this._leafNode(new o(i, j, b)), j;
    }
    // `const` declaration (`var` in es5 mode)
    const(i, f, b) {
      return this._def(r.varKinds.const, i, f, b);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(i, f, b) {
      return this._def(r.varKinds.let, i, f, b);
    }
    // `var` declaration with optional assignment
    var(i, f, b) {
      return this._def(r.varKinds.var, i, f, b);
    }
    // assignment code
    assign(i, f, b) {
      return this._leafNode(new l(i, f, b));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new c(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new E(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [b, I] of i)
        f.length > 1 && f.push(","), f.push(b), (b !== I || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, I));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(i, f, b) {
      if (this._blockNode(new m(i)), f && b)
        this.code(f).else().code(b).endIf();
      else if (f)
        this.code(f).endIf();
      else if (b)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(i) {
      return this._elseNode(new m(i));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new $());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, $);
    }
    _for(i, f) {
      return this._blockNode(i), f && this.code(f).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(i, f) {
      return this._for(new N(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, b, I, j = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const F = this._scope.toName(i);
      return this._for(new R(j, F, f, b), () => I(F));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, b, I = r.varKinds.const) {
      const j = this._scope.toName(i);
      if (this.opts.es5) {
        const F = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${F}.length`, (L) => {
          this.var(j, (0, t._)`${F}[${L}]`), b(j);
        });
      }
      return this._for(new O("of", I, j, f), () => b(j));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, b, I = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, b);
      const j = this._scope.toName(i);
      return this._for(new O("in", I, j, f), () => b(j));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(v);
    }
    // `label` statement
    label(i) {
      return this._leafNode(new d(i));
    }
    // `break` statement
    break(i) {
      return this._leafNode(new u(i));
    }
    // `return` statement
    return(i) {
      const f = new B();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(B);
    }
    // `try` statement
    try(i, f, b) {
      if (!f && !b)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const I = new de();
      if (this._blockNode(I), this.code(i), f) {
        const j = this.name("e");
        this._currNode = I.catch = new he(j), f(j);
      }
      return b && (this._currNode = I.finally = new ye(), this.code(b)), this._endBlockNode(he, ye);
    }
    // `throw` statement
    throw(i) {
      return this._leafNode(new h(i));
    }
    // start self-balancing block
    block(i, f) {
      return this._blockStarts.push(this._nodes.length), i && this.code(i).endBlock(f), this;
    }
    // end the current self-balancing block
    endBlock(i) {
      const f = this._blockStarts.pop();
      if (f === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const b = this._nodes.length - f;
      if (b < 0 || i !== void 0 && b !== i)
        throw new Error(`CodeGen: wrong number of nodes: ${b} vs ${i} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(i, f = t.nil, b, I) {
      return this._blockNode(new K(i, f, b)), I && this.code(I).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(K);
    }
    optimize(i = 1) {
      for (; i-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(i) {
      return this._currNode.nodes.push(i), this;
    }
    _blockNode(i) {
      this._currNode.nodes.push(i), this._nodes.push(i);
    }
    _endBlockNode(i, f) {
      const b = this._currNode;
      if (b instanceof i || f && b instanceof f)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${f ? `${i.kind}/${f.kind}` : i.kind}"`);
    }
    _elseNode(i) {
      const f = this._currNode;
      if (!(f instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = f.else = i, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const i = this._nodes;
      return i[i.length - 1];
    }
    set _currNode(i) {
      const f = this._nodes;
      f[f.length - 1] = i;
    }
  }
  e.CodeGen = z;
  function H(y, i) {
    for (const f in i)
      y[f] = (y[f] || 0) + (i[f] || 0);
    return y;
  }
  function oe(y, i) {
    return i instanceof t._CodeOrName ? H(y, i.names) : y;
  }
  function T(y, i, f) {
    if (y instanceof t.Name)
      return b(y);
    if (!I(y))
      return y;
    return new t._Code(y._items.reduce((j, F) => (F instanceof t.Name && (F = b(F)), F instanceof t._Code ? j.push(...F._items) : j.push(F), j), []));
    function b(j) {
      const F = f[j.str];
      return F === void 0 || i[j.str] !== 1 ? j : (delete i[j.str], F);
    }
    function I(j) {
      return j instanceof t._Code && j._items.some((F) => F instanceof t.Name && i[F.str] === 1 && f[F.str] !== void 0);
    }
  }
  function A(y, i) {
    for (const f in i)
      y[f] = (y[f] || 0) - (i[f] || 0);
  }
  function V(y) {
    return typeof y == "boolean" || typeof y == "number" || y === null ? !y : (0, t._)`!${S(y)}`;
  }
  e.not = V;
  const D = p(e.operators.AND);
  function G(...y) {
    return y.reduce(D);
  }
  e.and = G;
  const M = p(e.operators.OR);
  function P(...y) {
    return y.reduce(M);
  }
  e.or = P;
  function p(y) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${y} ${S(f)}`;
  }
  function S(y) {
    return y instanceof t.Name ? y : (0, t._)`(${y})`;
  }
})(x);
var k = {};
Object.defineProperty(k, "__esModule", { value: !0 });
k.checkStrictMode = k.getErrorPath = k.Type = k.useFunc = k.setEvaluated = k.evaluatedPropsToName = k.mergeEvaluated = k.eachItem = k.unescapeJsonPointer = k.escapeJsonPointer = k.escapeFragment = k.unescapeFragment = k.schemaRefOrVal = k.schemaHasRulesButRef = k.schemaHasRules = k.checkUnknownRules = k.alwaysValidSchema = k.toHash = void 0;
const ie = x, Jd = mn;
function Wd(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
k.toHash = Wd;
function Bd(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (dl(e, t), !fl(t, e.self.RULES.all));
}
k.alwaysValidSchema = Bd;
function dl(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || pl(e, `unknown keyword: "${a}"`);
}
k.checkUnknownRules = dl;
function fl(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
k.schemaHasRules = fl;
function Yd(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
k.schemaHasRulesButRef = Yd;
function Qd({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ie._)`${r}`;
  }
  return (0, ie._)`${e}${t}${(0, ie.getProperty)(n)}`;
}
k.schemaRefOrVal = Qd;
function Zd(e) {
  return hl(decodeURIComponent(e));
}
k.unescapeFragment = Zd;
function xd(e) {
  return encodeURIComponent(Ra(e));
}
k.escapeFragment = xd;
function Ra(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
k.escapeJsonPointer = Ra;
function hl(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
k.unescapeJsonPointer = hl;
function ef(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
k.eachItem = ef;
function ki({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, l) => {
    const c = o === void 0 ? a : o instanceof ie.Name ? (a instanceof ie.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof ie.Name ? (t(s, o, a), a) : r(a, o);
    return l === ie.Name && !(c instanceof ie.Name) ? n(s, c) : c;
  };
}
k.mergeEvaluated = {
  props: ki({
    mergeNames: (e, t, r) => e.if((0, ie._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, ie._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, ie._)`${r} || {}`).code((0, ie._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, ie._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ie._)`${r} || {}`), Oa(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: ml
  }),
  items: ki({
    mergeNames: (e, t, r) => e.if((0, ie._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ie._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ie._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ie._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function ml(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ie._)`{}`);
  return t !== void 0 && Oa(e, r, t), r;
}
k.evaluatedPropsToName = ml;
function Oa(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ie._)`${t}${(0, ie.getProperty)(n)}`, !0));
}
k.setEvaluated = Oa;
const Ci = {};
function tf(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Ci[t.code] || (Ci[t.code] = new Jd._Code(t.code))
  });
}
k.useFunc = tf;
var ia;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(ia || (k.Type = ia = {}));
function rf(e, t, r) {
  if (e instanceof ie.Name) {
    const n = t === ia.Num;
    return r ? n ? (0, ie._)`"[" + ${e} + "]"` : (0, ie._)`"['" + ${e} + "']"` : n ? (0, ie._)`"/" + ${e}` : (0, ie._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ie.getProperty)(e).toString() : "/" + Ra(e);
}
k.getErrorPath = rf;
function pl(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
k.checkStrictMode = pl;
var Ue = {};
Object.defineProperty(Ue, "__esModule", { value: !0 });
const Ne = x, nf = {
  // validation function arguments
  data: new Ne.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Ne.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Ne.Name("instancePath"),
  parentData: new Ne.Name("parentData"),
  parentDataProperty: new Ne.Name("parentDataProperty"),
  rootData: new Ne.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Ne.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Ne.Name("vErrors"),
  // null or array of validation errors
  errors: new Ne.Name("errors"),
  // counter of validation errors
  this: new Ne.Name("this"),
  // "globals"
  self: new Ne.Name("self"),
  scope: new Ne.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Ne.Name("json"),
  jsonPos: new Ne.Name("jsonPos"),
  jsonLen: new Ne.Name("jsonLen"),
  jsonPart: new Ne.Name("jsonPart")
};
Ue.default = nf;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = x, r = k, n = Ue;
  e.keywordError = {
    message: ({ keyword: $ }) => (0, t.str)`must pass "${$}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: $, schemaType: m }) => m ? (0, t.str)`"${$}" keyword must be ${m} ($data)` : (0, t.str)`"${$}" keyword is invalid ($data)`
  };
  function s($, m = e.keywordError, v, N) {
    const { it: R } = $, { gen: O, compositeRule: K, allErrors: B } = R, de = h($, m, v);
    N ?? (K || B) ? c(O, de) : d(R, (0, t._)`[${de}]`);
  }
  e.reportError = s;
  function a($, m = e.keywordError, v) {
    const { it: N } = $, { gen: R, compositeRule: O, allErrors: K } = N, B = h($, m, v);
    c(R, B), O || K || d(N, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o($, m) {
    $.assign(n.default.errors, m), $.if((0, t._)`${n.default.vErrors} !== null`, () => $.if(m, () => $.assign((0, t._)`${n.default.vErrors}.length`, m), () => $.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function l({ gen: $, keyword: m, schemaValue: v, data: N, errsCount: R, it: O }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const K = $.name("err");
    $.forRange("i", R, n.default.errors, (B) => {
      $.const(K, (0, t._)`${n.default.vErrors}[${B}]`), $.if((0, t._)`${K}.instancePath === undefined`, () => $.assign((0, t._)`${K}.instancePath`, (0, t.strConcat)(n.default.instancePath, O.errorPath))), $.assign((0, t._)`${K}.schemaPath`, (0, t.str)`${O.errSchemaPath}/${m}`), O.opts.verbose && ($.assign((0, t._)`${K}.schema`, v), $.assign((0, t._)`${K}.data`, N));
    });
  }
  e.extendErrors = l;
  function c($, m) {
    const v = $.const("err", m);
    $.if((0, t._)`${n.default.vErrors} === null`, () => $.assign(n.default.vErrors, (0, t._)`[${v}]`), (0, t._)`${n.default.vErrors}.push(${v})`), $.code((0, t._)`${n.default.errors}++`);
  }
  function d($, m) {
    const { gen: v, validateName: N, schemaEnv: R } = $;
    R.$async ? v.throw((0, t._)`new ${$.ValidationError}(${m})`) : (v.assign((0, t._)`${N}.errors`, m), v.return(!1));
  }
  const u = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function h($, m, v) {
    const { createErrors: N } = $.it;
    return N === !1 ? (0, t._)`{}` : E($, m, v);
  }
  function E($, m, v = {}) {
    const { gen: N, it: R } = $, O = [
      g(R, v),
      w($, v)
    ];
    return _($, m, O), N.object(...O);
  }
  function g({ errorPath: $ }, { instancePath: m }) {
    const v = m ? (0, t.str)`${$}${(0, r.getErrorPath)(m, r.Type.Str)}` : $;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, v)];
  }
  function w({ keyword: $, it: { errSchemaPath: m } }, { schemaPath: v, parentSchema: N }) {
    let R = N ? m : (0, t.str)`${m}/${$}`;
    return v && (R = (0, t.str)`${R}${(0, r.getErrorPath)(v, r.Type.Str)}`), [u.schemaPath, R];
  }
  function _($, { params: m, message: v }, N) {
    const { keyword: R, data: O, schemaValue: K, it: B } = $, { opts: de, propertyName: he, topSchemaRef: ye, schemaPath: z } = B;
    N.push([u.keyword, R], [u.params, typeof m == "function" ? m($) : m || (0, t._)`{}`]), de.messages && N.push([u.message, typeof v == "function" ? v($) : v]), de.verbose && N.push([u.schema, K], [u.parentSchema, (0, t._)`${ye}${z}`], [n.default.data, O]), he && N.push([u.propertyName, he]);
  }
})(yn);
Object.defineProperty(jr, "__esModule", { value: !0 });
jr.boolOrEmptySchema = jr.topBoolOrEmptySchema = void 0;
const sf = yn, af = x, of = Ue, cf = {
  message: "boolean schema is false"
};
function lf(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? yl(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(of.default.data) : (t.assign((0, af._)`${n}.errors`, null), t.return(!0));
}
jr.topBoolOrEmptySchema = lf;
function uf(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), yl(e)) : r.var(t, !0);
}
jr.boolOrEmptySchema = uf;
function yl(e, t) {
  const { gen: r, data: n } = e, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, sf.reportError)(s, cf, void 0, t);
}
var $e = {}, fr = {};
Object.defineProperty(fr, "__esModule", { value: !0 });
fr.getRules = fr.isJSONType = void 0;
const df = ["string", "number", "integer", "boolean", "null", "object", "array"], ff = new Set(df);
function hf(e) {
  return typeof e == "string" && ff.has(e);
}
fr.isJSONType = hf;
function mf() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
fr.getRules = mf;
var yt = {};
Object.defineProperty(yt, "__esModule", { value: !0 });
yt.shouldUseRule = yt.shouldUseGroup = yt.schemaHasRulesForType = void 0;
function pf({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && $l(e, n);
}
yt.schemaHasRulesForType = pf;
function $l(e, t) {
  return t.rules.some((r) => gl(e, r));
}
yt.shouldUseGroup = $l;
function gl(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
yt.shouldUseRule = gl;
Object.defineProperty($e, "__esModule", { value: !0 });
$e.reportTypeError = $e.checkDataTypes = $e.checkDataType = $e.coerceAndCheckDataType = $e.getJSONTypes = $e.getSchemaTypes = $e.DataType = void 0;
const yf = fr, $f = yt, gf = yn, ee = x, _l = k;
var Nr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(Nr || ($e.DataType = Nr = {}));
function _f(e) {
  const t = vl(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
$e.getSchemaTypes = _f;
function vl(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(yf.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
$e.getJSONTypes = vl;
function vf(e, t) {
  const { gen: r, data: n, opts: s } = e, a = wf(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, $f.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = Ia(t, n, s.strictNumbers, Nr.Wrong);
    r.if(l, () => {
      a.length ? Ef(e, t, a) : Ta(e);
    });
  }
  return o;
}
$e.coerceAndCheckDataType = vf;
const wl = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function wf(e, t) {
  return t ? e.filter((r) => wl.has(r) || t === "array" && r === "array") : [];
}
function Ef(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, ee._)`typeof ${s}`), l = n.let("coerced", (0, ee._)`undefined`);
  a.coerceTypes === "array" && n.if((0, ee._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, ee._)`${s}[0]`).assign(o, (0, ee._)`typeof ${s}`).if(Ia(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, ee._)`${l} !== undefined`);
  for (const d of r)
    (wl.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), Ta(e), n.endIf(), n.if((0, ee._)`${l} !== undefined`, () => {
    n.assign(s, l), bf(e, l);
  });
  function c(d) {
    switch (d) {
      case "string":
        n.elseIf((0, ee._)`${o} == "number" || ${o} == "boolean"`).assign(l, (0, ee._)`"" + ${s}`).elseIf((0, ee._)`${s} === null`).assign(l, (0, ee._)`""`);
        return;
      case "number":
        n.elseIf((0, ee._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(l, (0, ee._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, ee._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(l, (0, ee._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, ee._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(l, !1).elseIf((0, ee._)`${s} === "true" || ${s} === 1`).assign(l, !0);
        return;
      case "null":
        n.elseIf((0, ee._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(l, null);
        return;
      case "array":
        n.elseIf((0, ee._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(l, (0, ee._)`[${s}]`);
    }
  }
}
function bf({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, ee._)`${t} !== undefined`, () => e.assign((0, ee._)`${t}[${r}]`, n));
}
function ca(e, t, r, n = Nr.Correct) {
  const s = n === Nr.Correct ? ee.operators.EQ : ee.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, ee._)`${t} ${s} null`;
    case "array":
      a = (0, ee._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, ee._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, ee._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, ee._)`typeof ${t} ${s} ${e}`;
  }
  return n === Nr.Correct ? a : (0, ee.not)(a);
  function o(l = ee.nil) {
    return (0, ee.and)((0, ee._)`typeof ${t} == "number"`, l, r ? (0, ee._)`isFinite(${t})` : ee.nil);
  }
}
$e.checkDataType = ca;
function Ia(e, t, r, n) {
  if (e.length === 1)
    return ca(e[0], t, r, n);
  let s;
  const a = (0, _l.toHash)(e);
  if (a.array && a.object) {
    const o = (0, ee._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, ee._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = ee.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, ee.and)(s, ca(o, t, r, n));
  return s;
}
$e.checkDataTypes = Ia;
const Sf = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, ee._)`{type: ${e}}` : (0, ee._)`{type: ${t}}`
};
function Ta(e) {
  const t = Pf(e);
  (0, gf.reportError)(t, Sf);
}
$e.reportTypeError = Ta;
function Pf(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, _l.schemaRefOrVal)(e, n, "type");
  return {
    gen: t,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: e
  };
}
var ms = {};
Object.defineProperty(ms, "__esModule", { value: !0 });
ms.assignDefaults = void 0;
const pr = x, Nf = k;
function Rf(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      Di(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => Di(e, a, s.default));
}
ms.assignDefaults = Rf;
function Di(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, pr._)`${a}${(0, pr.getProperty)(t)}`;
  if (s) {
    (0, Nf.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let c = (0, pr._)`${l} === undefined`;
  o.useDefaults === "empty" && (c = (0, pr._)`${c} || ${l} === null || ${l} === ""`), n.if(c, (0, pr._)`${l} = ${(0, pr.stringify)(r)}`);
}
var ct = {}, ne = {};
Object.defineProperty(ne, "__esModule", { value: !0 });
ne.validateUnion = ne.validateArray = ne.usePattern = ne.callValidateCode = ne.schemaProperties = ne.allSchemaProperties = ne.noPropertyInData = ne.propertyInData = ne.isOwnProperty = ne.hasPropFunc = ne.reportMissingProp = ne.checkMissingProp = ne.checkReportMissingProp = void 0;
const le = x, ja = k, Pt = Ue, Of = k;
function If(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(ka(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, le._)`${t}` }, !0), e.error();
  });
}
ne.checkReportMissingProp = If;
function Tf({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, le.or)(...n.map((a) => (0, le.and)(ka(e, t, a, r.ownProperties), (0, le._)`${s} = ${a}`)));
}
ne.checkMissingProp = Tf;
function jf(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
ne.reportMissingProp = jf;
function El(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, le._)`Object.prototype.hasOwnProperty`
  });
}
ne.hasPropFunc = El;
function Aa(e, t, r) {
  return (0, le._)`${El(e)}.call(${t}, ${r})`;
}
ne.isOwnProperty = Aa;
function Af(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} !== undefined`;
  return n ? (0, le._)`${s} && ${Aa(e, t, r)}` : s;
}
ne.propertyInData = Af;
function ka(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} === undefined`;
  return n ? (0, le.or)(s, (0, le.not)(Aa(e, t, r))) : s;
}
ne.noPropertyInData = ka;
function bl(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
ne.allSchemaProperties = bl;
function kf(e, t) {
  return bl(t).filter((r) => !(0, ja.alwaysValidSchema)(e, t[r]));
}
ne.schemaProperties = kf;
function Cf({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, c, d) {
  const u = d ? (0, le._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Pt.default.instancePath, (0, le.strConcat)(Pt.default.instancePath, a)],
    [Pt.default.parentData, o.parentData],
    [Pt.default.parentDataProperty, o.parentDataProperty],
    [Pt.default.rootData, Pt.default.rootData]
  ];
  o.opts.dynamicRef && h.push([Pt.default.dynamicAnchors, Pt.default.dynamicAnchors]);
  const E = (0, le._)`${u}, ${r.object(...h)}`;
  return c !== le.nil ? (0, le._)`${l}.call(${c}, ${E})` : (0, le._)`${l}(${E})`;
}
ne.callValidateCode = Cf;
const Df = (0, le._)`new RegExp`;
function Mf({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, le._)`${s.code === "new RegExp" ? Df : (0, Of.useFunc)(e, s)}(${r}, ${n})`
  });
}
ne.usePattern = Mf;
function Vf(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const l = t.let("valid", !0);
    return o(() => t.assign(l, !1)), l;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(l) {
    const c = t.const("len", (0, le._)`${r}.length`);
    t.forRange("i", 0, c, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: ja.Type.Num
      }, a), t.if((0, le.not)(a), l);
    });
  }
}
ne.validateArray = Vf;
function Lf(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, ja.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), l = t.name("_valid");
  t.block(() => r.forEach((c, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, l);
    t.assign(o, (0, le._)`${o} || ${l}`), e.mergeValidEvaluated(u, l) || t.if((0, le.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
ne.validateUnion = Lf;
Object.defineProperty(ct, "__esModule", { value: !0 });
ct.validateKeywordUsage = ct.validSchemaType = ct.funcKeywordCode = ct.macroKeywordCode = void 0;
const Te = x, tr = Ue, Ff = ne, zf = yn;
function Uf(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), c = Sl(r, n, l);
  o.opts.validateSchema !== !1 && o.self.validateSchema(l, !0);
  const d = r.name("valid");
  e.subschema({
    schema: l,
    schemaPath: Te.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: c,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
ct.macroKeywordCode = Uf;
function qf(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: c } = e;
  Gf(c, t);
  const d = !l && t.compile ? t.compile.call(c.self, a, o, c) : t.validate, u = Sl(n, s, d), h = n.let("valid");
  e.block$data(h, E), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function E() {
    if (t.errors === !1)
      _(), t.modifying && Mi(e), $(() => e.error());
    else {
      const m = t.async ? g() : w();
      t.modifying && Mi(e), $(() => Kf(e, m));
    }
  }
  function g() {
    const m = n.let("ruleErrs", null);
    return n.try(() => _((0, Te._)`await `), (v) => n.assign(h, !1).if((0, Te._)`${v} instanceof ${c.ValidationError}`, () => n.assign(m, (0, Te._)`${v}.errors`), () => n.throw(v))), m;
  }
  function w() {
    const m = (0, Te._)`${u}.errors`;
    return n.assign(m, null), _(Te.nil), m;
  }
  function _(m = t.async ? (0, Te._)`await ` : Te.nil) {
    const v = c.opts.passContext ? tr.default.this : tr.default.self, N = !("compile" in t && !l || t.schema === !1);
    n.assign(h, (0, Te._)`${m}${(0, Ff.callValidateCode)(e, u, v, N)}`, t.modifying);
  }
  function $(m) {
    var v;
    n.if((0, Te.not)((v = t.valid) !== null && v !== void 0 ? v : h), m);
  }
}
ct.funcKeywordCode = qf;
function Mi(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Te._)`${n.parentData}[${n.parentDataProperty}]`));
}
function Kf(e, t) {
  const { gen: r } = e;
  r.if((0, Te._)`Array.isArray(${t})`, () => {
    r.assign(tr.default.vErrors, (0, Te._)`${tr.default.vErrors} === null ? ${t} : ${tr.default.vErrors}.concat(${t})`).assign(tr.default.errors, (0, Te._)`${tr.default.vErrors}.length`), (0, zf.extendErrors)(e);
  }, () => e.error());
}
function Gf({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function Sl(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Te.stringify)(r) });
}
function Hf(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
ct.validSchemaType = Hf;
function Xf({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((l) => !Object.prototype.hasOwnProperty.call(e, l)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const c = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(c);
    else
      throw new Error(c);
  }
}
ct.validateKeywordUsage = Xf;
var Vt = {};
Object.defineProperty(Vt, "__esModule", { value: !0 });
Vt.extendSubschemaMode = Vt.extendSubschemaData = Vt.getSubschema = void 0;
const ot = x, Pl = k;
function Jf(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const l = e.schema[t];
    return r === void 0 ? {
      schema: l,
      schemaPath: (0, ot._)`${e.schemaPath}${(0, ot.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: l[r],
      schemaPath: (0, ot._)`${e.schemaPath}${(0, ot.getProperty)(t)}${(0, ot.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, Pl.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
Vt.getSubschema = Jf;
function Wf(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, E = l.let("data", (0, ot._)`${t.data}${(0, ot.getProperty)(r)}`, !0);
    c(E), e.errorPath = (0, ot.str)`${d}${(0, Pl.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, ot._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof ot.Name ? s : l.let("data", s, !0);
    c(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function c(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
Vt.extendSubschemaData = Wf;
function Bf(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Vt.extendSubschemaMode = Bf;
var Ee = {}, ps = function e(t, r) {
  if (t === r) return !0;
  if (t && r && typeof t == "object" && typeof r == "object") {
    if (t.constructor !== r.constructor) return !1;
    var n, s, a;
    if (Array.isArray(t)) {
      if (n = t.length, n != r.length) return !1;
      for (s = n; s-- !== 0; )
        if (!e(t[s], r[s])) return !1;
      return !0;
    }
    if (t.constructor === RegExp) return t.source === r.source && t.flags === r.flags;
    if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === r.valueOf();
    if (t.toString !== Object.prototype.toString) return t.toString() === r.toString();
    if (a = Object.keys(t), n = a.length, n !== Object.keys(r).length) return !1;
    for (s = n; s-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(r, a[s])) return !1;
    for (s = n; s-- !== 0; ) {
      var o = a[s];
      if (!e(t[o], r[o])) return !1;
    }
    return !0;
  }
  return t !== t && r !== r;
}, Nl = { exports: {} }, Ct = Nl.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Xn(t, n, s, e, "", e);
};
Ct.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
Ct.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Ct.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Ct.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function Xn(e, t, r, n, s, a, o, l, c, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, l, c, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in Ct.arrayKeywords)
          for (var E = 0; E < h.length; E++)
            Xn(e, t, r, h[E], s + "/" + u + "/" + E, a, s, u, n, E);
      } else if (u in Ct.propsKeywords) {
        if (h && typeof h == "object")
          for (var g in h)
            Xn(e, t, r, h[g], s + "/" + u + "/" + Yf(g), a, s, u, n, g);
      } else (u in Ct.keywords || e.allKeys && !(u in Ct.skipKeywords)) && Xn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, l, c, d);
  }
}
function Yf(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Qf = Nl.exports;
Object.defineProperty(Ee, "__esModule", { value: !0 });
Ee.getSchemaRefs = Ee.resolveUrl = Ee.normalizeId = Ee._getFullPath = Ee.getFullPath = Ee.inlineRef = void 0;
const Zf = k, xf = ps, eh = Qf, th = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function rh(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !la(e) : t ? Rl(e) <= t : !1;
}
Ee.inlineRef = rh;
const nh = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function la(e) {
  for (const t in e) {
    if (nh.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(la) || typeof r == "object" && la(r))
      return !0;
  }
  return !1;
}
function Rl(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !th.has(r) && (typeof e[r] == "object" && (0, Zf.eachItem)(e[r], (n) => t += Rl(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function Ol(e, t = "", r) {
  r !== !1 && (t = Rr(t));
  const n = e.parse(t);
  return Il(e, n);
}
Ee.getFullPath = Ol;
function Il(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Ee._getFullPath = Il;
const sh = /#\/?$/;
function Rr(e) {
  return e ? e.replace(sh, "") : "";
}
Ee.normalizeId = Rr;
function ah(e, t, r) {
  return r = Rr(r), e.resolve(t, r);
}
Ee.resolveUrl = ah;
const oh = /^[a-z_][-a-z0-9._]*$/i;
function ih(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = Rr(e[r] || t), a = { "": s }, o = Ol(n, s, !1), l = {}, c = /* @__PURE__ */ new Set();
  return eh(e, { allKeys: !0 }, (h, E, g, w) => {
    if (w === void 0)
      return;
    const _ = o + E;
    let $ = a[w];
    typeof h[r] == "string" && ($ = m.call(this, h[r])), v.call(this, h.$anchor), v.call(this, h.$dynamicAnchor), a[E] = $;
    function m(N) {
      const R = this.opts.uriResolver.resolve;
      if (N = Rr($ ? R($, N) : N), c.has(N))
        throw u(N);
      c.add(N);
      let O = this.refs[N];
      return typeof O == "string" && (O = this.refs[O]), typeof O == "object" ? d(h, O.schema, N) : N !== Rr(_) && (N[0] === "#" ? (d(h, l[N], N), l[N] = h) : this.refs[N] = _), N;
    }
    function v(N) {
      if (typeof N == "string") {
        if (!oh.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), l;
  function d(h, E, g) {
    if (E !== void 0 && !xf(h, E))
      throw u(g);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Ee.getSchemaRefs = ih;
Object.defineProperty(xe, "__esModule", { value: !0 });
xe.getData = xe.KeywordCxt = xe.validateFunctionCode = void 0;
const Tl = jr, Vi = $e, Ca = yt, rs = $e, ch = ms, nn = ct, Vs = Vt, U = x, X = Ue, lh = Ee, $t = k, Wr = yn;
function uh(e) {
  if (kl(e) && (Cl(e), Al(e))) {
    hh(e);
    return;
  }
  jl(e, () => (0, Tl.topBoolOrEmptySchema)(e));
}
xe.validateFunctionCode = uh;
function jl({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, U._)`${X.default.data}, ${X.default.valCxt}`, n.$async, () => {
    e.code((0, U._)`"use strict"; ${Li(r, s)}`), fh(e, s), e.code(a);
  }) : e.func(t, (0, U._)`${X.default.data}, ${dh(s)}`, n.$async, () => e.code(Li(r, s)).code(a));
}
function dh(e) {
  return (0, U._)`{${X.default.instancePath}="", ${X.default.parentData}, ${X.default.parentDataProperty}, ${X.default.rootData}=${X.default.data}${e.dynamicRef ? (0, U._)`, ${X.default.dynamicAnchors}={}` : U.nil}}={}`;
}
function fh(e, t) {
  e.if(X.default.valCxt, () => {
    e.var(X.default.instancePath, (0, U._)`${X.default.valCxt}.${X.default.instancePath}`), e.var(X.default.parentData, (0, U._)`${X.default.valCxt}.${X.default.parentData}`), e.var(X.default.parentDataProperty, (0, U._)`${X.default.valCxt}.${X.default.parentDataProperty}`), e.var(X.default.rootData, (0, U._)`${X.default.valCxt}.${X.default.rootData}`), t.dynamicRef && e.var(X.default.dynamicAnchors, (0, U._)`${X.default.valCxt}.${X.default.dynamicAnchors}`);
  }, () => {
    e.var(X.default.instancePath, (0, U._)`""`), e.var(X.default.parentData, (0, U._)`undefined`), e.var(X.default.parentDataProperty, (0, U._)`undefined`), e.var(X.default.rootData, X.default.data), t.dynamicRef && e.var(X.default.dynamicAnchors, (0, U._)`{}`);
  });
}
function hh(e) {
  const { schema: t, opts: r, gen: n } = e;
  jl(e, () => {
    r.$comment && t.$comment && Ml(e), gh(e), n.let(X.default.vErrors, null), n.let(X.default.errors, 0), r.unevaluated && mh(e), Dl(e), wh(e);
  });
}
function mh(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, U._)`${r}.evaluated`), t.if((0, U._)`${e.evaluated}.dynamicProps`, () => t.assign((0, U._)`${e.evaluated}.props`, (0, U._)`undefined`)), t.if((0, U._)`${e.evaluated}.dynamicItems`, () => t.assign((0, U._)`${e.evaluated}.items`, (0, U._)`undefined`));
}
function Li(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, U._)`/*# sourceURL=${r} */` : U.nil;
}
function ph(e, t) {
  if (kl(e) && (Cl(e), Al(e))) {
    yh(e, t);
    return;
  }
  (0, Tl.boolOrEmptySchema)(e, t);
}
function Al({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function kl(e) {
  return typeof e.schema != "boolean";
}
function yh(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && Ml(e), _h(e), vh(e);
  const a = n.const("_errs", X.default.errors);
  Dl(e, a), n.var(t, (0, U._)`${a} === ${X.default.errors}`);
}
function Cl(e) {
  (0, $t.checkUnknownRules)(e), $h(e);
}
function Dl(e, t) {
  if (e.opts.jtd)
    return Fi(e, [], !1, t);
  const r = (0, Vi.getSchemaTypes)(e.schema), n = (0, Vi.coerceAndCheckDataType)(e, r);
  Fi(e, r, !n, t);
}
function $h(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, $t.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function gh(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, $t.checkStrictMode)(e, "default is ignored in the schema root");
}
function _h(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, lh.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function vh(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function Ml({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, U._)`${X.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, U.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, U._)`${X.default.self}.opts.$comment(${a}, ${o}, ${l}.schema)`);
  }
}
function wh(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, U._)`${X.default.errors} === 0`, () => t.return(X.default.data), () => t.throw((0, U._)`new ${s}(${X.default.vErrors})`)) : (t.assign((0, U._)`${n}.errors`, X.default.vErrors), a.unevaluated && Eh(e), t.return((0, U._)`${X.default.errors} === 0`));
}
function Eh({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof U.Name && e.assign((0, U._)`${t}.props`, r), n instanceof U.Name && e.assign((0, U._)`${t}.items`, n);
}
function Fi(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: l, opts: c, self: d } = e, { RULES: u } = d;
  if (a.$ref && (c.ignoreKeywordsWithRef || !(0, $t.schemaHasRulesButRef)(a, u))) {
    s.block(() => Fl(e, "$ref", u.all.$ref.definition));
    return;
  }
  c.jtd || bh(e, t), s.block(() => {
    for (const E of u.rules)
      h(E);
    h(u.post);
  });
  function h(E) {
    (0, Ca.shouldUseGroup)(a, E) && (E.type ? (s.if((0, rs.checkDataType)(E.type, o, c.strictNumbers)), zi(e, E), t.length === 1 && t[0] === E.type && r && (s.else(), (0, rs.reportTypeError)(e)), s.endIf()) : zi(e, E), l || s.if((0, U._)`${X.default.errors} === ${n || 0}`));
  }
}
function zi(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, ch.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, Ca.shouldUseRule)(n, a) && Fl(e, a.keyword, a.definition, t.type);
  });
}
function bh(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (Sh(e, t), e.opts.allowUnionTypes || Ph(e, t), Nh(e, e.dataTypes));
}
function Sh(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      Vl(e.dataTypes, r) || Da(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), Oh(e, t);
  }
}
function Ph(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Da(e, "use allowUnionTypes to allow union type keyword");
}
function Nh(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, Ca.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => Rh(t, o)) && Da(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function Rh(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function Vl(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function Oh(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    Vl(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Da(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, $t.checkStrictMode)(e, t, e.opts.strictTypes);
}
let Ll = class {
  constructor(t, r, n) {
    if ((0, nn.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, $t.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", zl(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, nn.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", X.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, U.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, U.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, U._)`${r} !== undefined && (${(0, U.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? Wr.reportExtraError : Wr.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, Wr.reportError)(this, this.def.$dataError || Wr.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, Wr.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = U.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = U.nil, r = U.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, U.or)((0, U._)`${s} === undefined`, r)), t !== U.nil && n.assign(t, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== U.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, U.or)(o(), l());
    function o() {
      if (n.length) {
        if (!(r instanceof U.Name))
          throw new Error("ajv implementation error");
        const c = Array.isArray(n) ? n : [n];
        return (0, U._)`${(0, rs.checkDataTypes)(c, r, a.opts.strictNumbers, rs.DataType.Wrong)}`;
      }
      return U.nil;
    }
    function l() {
      if (s.validateSchema) {
        const c = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, U._)`!${c}(${r})`;
      }
      return U.nil;
    }
  }
  subschema(t, r) {
    const n = (0, Vs.getSubschema)(this.it, t);
    (0, Vs.extendSubschemaData)(n, this.it, t), (0, Vs.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return ph(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = $t.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = $t.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, U.Name)), !0;
  }
};
xe.KeywordCxt = Ll;
function Fl(e, t, r, n) {
  const s = new Ll(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, nn.funcKeywordCode)(s, r) : "macro" in r ? (0, nn.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, nn.funcKeywordCode)(s, r);
}
const Ih = /^\/(?:[^~]|~0|~1)*$/, Th = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function zl(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return X.default.rootData;
  if (e[0] === "/") {
    if (!Ih.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = X.default.rootData;
  } else {
    const d = Th.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const u = +d[1];
    if (s = d[2], s === "#") {
      if (u >= t)
        throw new Error(c("property/index", u));
      return n[t - u];
    }
    if (u > t)
      throw new Error(c("data", u));
    if (a = r[t - u], !s)
      return a;
  }
  let o = a;
  const l = s.split("/");
  for (const d of l)
    d && (a = (0, U._)`${a}${(0, U.getProperty)((0, $t.unescapeJsonPointer)(d))}`, o = (0, U._)`${o} && ${a}`);
  return o;
  function c(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
xe.getData = zl;
var $n = {};
Object.defineProperty($n, "__esModule", { value: !0 });
let jh = class extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
};
$n.default = jh;
var Dr = {};
Object.defineProperty(Dr, "__esModule", { value: !0 });
const Ls = Ee;
let Ah = class extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Ls.resolveUrl)(t, r, n), this.missingSchema = (0, Ls.normalizeId)((0, Ls.getFullPath)(t, this.missingRef));
  }
};
Dr.default = Ah;
var Ae = {};
Object.defineProperty(Ae, "__esModule", { value: !0 });
Ae.resolveSchema = Ae.getCompilingSchema = Ae.resolveRef = Ae.compileSchema = Ae.SchemaEnv = void 0;
const Je = x, kh = $n, xt = Ue, Qe = Ee, Ui = k, Ch = xe;
let ys = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Qe.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
Ae.SchemaEnv = ys;
function Ma(e) {
  const t = Ul.call(this, e);
  if (t)
    return t;
  const r = (0, Qe.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Je.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: kh.default,
    code: (0, Je._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = o.scopeName("validate");
  e.validateName = c;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: xt.default.data,
    parentData: xt.default.parentData,
    parentDataProperty: xt.default.parentDataProperty,
    dataNames: [xt.default.data],
    dataPathArr: [Je.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Je.stringify)(e.schema) } : { ref: e.schema }),
    validateName: c,
    ValidationError: l,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Je.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Je._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, Ch.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(xt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const g = new Function(`${xt.default.self}`, `${xt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(c, { ref: g }), g.errors = null, g.schema = e.schema, g.schemaEnv = e, e.$async && (g.$async = !0), this.opts.code.source === !0 && (g.source = { validateName: c, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: w, items: _ } = d;
      g.evaluated = {
        props: w instanceof Je.Name ? void 0 : w,
        items: _ instanceof Je.Name ? void 0 : _,
        dynamicProps: w instanceof Je.Name,
        dynamicItems: _ instanceof Je.Name
      }, g.source && (g.source.evaluated = (0, Je.stringify)(g.evaluated));
    }
    return e.validate = g, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
Ae.compileSchema = Ma;
function Dh(e, t, r) {
  var n;
  r = (0, Qe.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = Lh.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: l } = this.opts;
    o && (a = new ys({ schema: o, schemaId: l, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = Mh.call(this, a);
}
Ae.resolveRef = Dh;
function Mh(e) {
  return (0, Qe.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Ma.call(this, e);
}
function Ul(e) {
  for (const t of this._compilations)
    if (Vh(t, e))
      return t;
}
Ae.getCompilingSchema = Ul;
function Vh(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function Lh(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || $s.call(this, e, t);
}
function $s(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Qe._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Qe.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Fs.call(this, r, e);
  const a = (0, Qe.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const l = $s.call(this, e, o);
    return typeof (l == null ? void 0 : l.schema) != "object" ? void 0 : Fs.call(this, r, l);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || Ma.call(this, o), a === (0, Qe.normalizeId)(t)) {
      const { schema: l } = o, { schemaId: c } = this.opts, d = l[c];
      return d && (s = (0, Qe.resolveUrl)(this.opts.uriResolver, s, d)), new ys({ schema: l, schemaId: c, root: e, baseId: s });
    }
    return Fs.call(this, r, o);
  }
}
Ae.resolveSchema = $s;
const Fh = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Fs(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const l of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const c = r[(0, Ui.unescapeFragment)(l)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Fh.has(l) && d && (t = (0, Qe.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Ui.schemaHasRulesButRef)(r, this.RULES)) {
    const l = (0, Qe.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = $s.call(this, n, l);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new ys({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const zh = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Uh = "Meta-schema for $data reference (JSON AnySchema extension proposal)", qh = "object", Kh = [
  "$data"
], Gh = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, Hh = !1, Xh = {
  $id: zh,
  description: Uh,
  type: qh,
  required: Kh,
  properties: Gh,
  additionalProperties: Hh
};
var Va = {}, gs = { exports: {} };
const Jh = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), ql = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function Kl(e) {
  let t = "", r = 0, n = 0;
  for (n = 0; n < e.length; n++)
    if (r = e[n].charCodeAt(0), r !== 48) {
      if (!(r >= 48 && r <= 57 || r >= 65 && r <= 70 || r >= 97 && r <= 102))
        return "";
      t += e[n];
      break;
    }
  for (n += 1; n < e.length; n++) {
    if (r = e[n].charCodeAt(0), !(r >= 48 && r <= 57 || r >= 65 && r <= 70 || r >= 97 && r <= 102))
      return "";
    t += e[n];
  }
  return t;
}
const Wh = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function qi(e) {
  return e.length = 0, !0;
}
function Bh(e, t, r) {
  if (e.length) {
    const n = Kl(e);
    if (n !== "")
      t.push(n);
    else
      return r.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function Yh(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, o = !1, l = Bh;
  for (let c = 0; c < e.length; c++) {
    const d = e[c];
    if (!(d === "[" || d === "]"))
      if (d === ":") {
        if (a === !0 && (o = !0), !l(s, n, r))
          break;
        if (++t > 7) {
          r.error = !0;
          break;
        }
        c > 0 && e[c - 1] === ":" && (a = !0), n.push(":");
        continue;
      } else if (d === "%") {
        if (!l(s, n, r))
          break;
        l = qi;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (l === qi ? r.zone = s.join("") : o ? n.push(s.join("")) : n.push(Kl(s))), r.address = n.join(""), r;
}
function Gl(e) {
  if (Qh(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = Yh(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let r = t.address, n = t.address;
    return t.zone && (r += "%" + t.zone, n += "%25" + t.zone), { host: r, isIPV6: !0, escapedHost: n };
  }
}
function Qh(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
function Zh(e) {
  let t = e;
  const r = [];
  let n = -1, s = 0;
  for (; s = t.length; ) {
    if (s === 1) {
      if (t === ".")
        break;
      if (t === "/") {
        r.push("/");
        break;
      } else {
        r.push(t);
        break;
      }
    } else if (s === 2) {
      if (t[0] === ".") {
        if (t[1] === ".")
          break;
        if (t[1] === "/") {
          t = t.slice(2);
          continue;
        }
      } else if (t[0] === "/" && (t[1] === "." || t[1] === "/")) {
        r.push("/");
        break;
      }
    } else if (s === 3 && t === "/..") {
      r.length !== 0 && r.pop(), r.push("/");
      break;
    }
    if (t[0] === ".") {
      if (t[1] === ".") {
        if (t[2] === "/") {
          t = t.slice(3);
          continue;
        }
      } else if (t[1] === "/") {
        t = t.slice(2);
        continue;
      }
    } else if (t[0] === "/" && t[1] === ".") {
      if (t[2] === "/") {
        t = t.slice(2);
        continue;
      } else if (t[2] === "." && t[3] === "/") {
        t = t.slice(3), r.length !== 0 && r.pop();
        continue;
      }
    }
    if ((n = t.indexOf("/", 1)) === -1) {
      r.push(t);
      break;
    } else
      r.push(t.slice(0, n)), t = t.slice(n);
  }
  return r.join("");
}
function xh(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function em(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    if (!ql(r)) {
      const n = Gl(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var Hl = {
  nonSimpleDomain: Wh,
  recomposeAuthority: em,
  normalizeComponentEncoding: xh,
  removeDotSegments: Zh,
  isIPv4: ql,
  isUUID: Jh,
  normalizeIPv6: Gl
};
const { isUUID: tm } = Hl, rm = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Xl(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function Jl(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Wl(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function nm(e) {
  return e.secure = Xl(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function sm(e) {
  if ((e.port === (Xl(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function am(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(rm);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, a = La(s);
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function om(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = La(s);
  a && (e = a.serialize(e, t));
  const o = e, l = e.nss;
  return o.path = `${n || t.nid}:${l}`, t.skipEscape = !0, o;
}
function im(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !tm(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function cm(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Bl = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: Jl,
    serialize: Wl
  }
), lm = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Bl.domainHost,
    parse: Jl,
    serialize: Wl
  }
), Jn = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: nm,
    serialize: sm
  }
), um = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: Jn.domainHost,
    parse: Jn.parse,
    serialize: Jn.serialize
  }
), dm = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: am,
    serialize: om,
    skipNormalize: !0
  }
), fm = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: im,
    serialize: cm,
    skipNormalize: !0
  }
), ns = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Bl,
    https: lm,
    ws: Jn,
    wss: um,
    urn: dm,
    "urn:uuid": fm
  }
);
Object.setPrototypeOf(ns, null);
function La(e) {
  return e && (ns[
    /** @type {SchemeName} */
    e
  ] || ns[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var hm = {
  SCHEMES: ns,
  getSchemeHandler: La
};
const { normalizeIPv6: mm, removeDotSegments: en, recomposeAuthority: pm, normalizeComponentEncoding: Pn, isIPv4: ym, nonSimpleDomain: $m } = Hl, { SCHEMES: gm, getSchemeHandler: Yl } = hm;
function _m(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  lt(vt(e, t), t) : typeof e == "object" && (e = /** @type {T} */
  vt(lt(e, t), t)), e;
}
function vm(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = Ql(vt(e, n), vt(t, n), n, !0);
  return n.skipEscape = !0, lt(s, n);
}
function Ql(e, t, r, n) {
  const s = {};
  return n || (e = vt(lt(e, r), r), t = vt(lt(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = en(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = en(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = en(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = en(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function wm(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = lt(Pn(vt(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = lt(Pn(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = lt(Pn(vt(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = lt(Pn(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
}
function lt(e, t) {
  const r = {
    host: e.host,
    scheme: e.scheme,
    userinfo: e.userinfo,
    port: e.port,
    path: e.path,
    query: e.query,
    nid: e.nid,
    nss: e.nss,
    uuid: e.uuid,
    fragment: e.fragment,
    reference: e.reference,
    resourceName: e.resourceName,
    secure: e.secure,
    error: ""
  }, n = Object.assign({}, t), s = [], a = Yl(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = pm(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let l = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (l = en(l)), o === void 0 && l[0] === "/" && l[1] === "/" && (l = "/%2F" + l.slice(2)), s.push(l);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const Em = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function vt(e, t) {
  const r = Object.assign({}, t), n = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  };
  let s = !1;
  r.reference === "suffix" && (r.scheme ? e = r.scheme + ":" + e : e = "//" + e);
  const a = e.match(Em);
  if (a) {
    if (n.scheme = a[1], n.userinfo = a[3], n.host = a[4], n.port = parseInt(a[5], 10), n.path = a[6] || "", n.query = a[7], n.fragment = a[8], isNaN(n.port) && (n.port = a[5]), n.host)
      if (ym(n.host) === !1) {
        const c = mm(n.host);
        n.host = c.host.toLowerCase(), s = c.isIPV6;
      } else
        s = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const o = Yl(r.scheme || n.scheme);
    if (!r.unicodeSupport && (!o || !o.unicodeSupport) && n.host && (r.domainHost || o && o.domainHost) && s === !1 && $m(n.host))
      try {
        n.host = URL.domainToASCII(n.host.toLowerCase());
      } catch (l) {
        n.error = n.error || "Host's domain name can not be converted to ASCII: " + l;
      }
    (!o || o && !o.skipNormalize) && (e.indexOf("%") !== -1 && (n.scheme !== void 0 && (n.scheme = unescape(n.scheme)), n.host !== void 0 && (n.host = unescape(n.host))), n.path && (n.path = escape(unescape(n.path))), n.fragment && (n.fragment = encodeURI(decodeURIComponent(n.fragment)))), o && o.parse && o.parse(n, r);
  } else
    n.error = n.error || "URI can not be parsed.";
  return n;
}
const Fa = {
  SCHEMES: gm,
  normalize: _m,
  resolve: vm,
  resolveComponent: Ql,
  equal: wm,
  serialize: lt,
  parse: vt
};
gs.exports = Fa;
gs.exports.default = Fa;
gs.exports.fastUri = Fa;
var Zl = gs.exports;
Object.defineProperty(Va, "__esModule", { value: !0 });
const xl = Zl;
xl.code = 'require("ajv/dist/runtime/uri").default';
Va.default = xl;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = xe;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = x;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = $n, s = Dr, a = fr, o = Ae, l = x, c = Ee, d = $e, u = k, h = Xh, E = Va, g = (P, p) => new RegExp(P, p);
  g.code = "new RegExp";
  const w = ["removeAdditional", "useDefaults", "coerceTypes"], _ = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), $ = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, v = 200;
  function N(P) {
    var p, S, y, i, f, b, I, j, F, L, ae, Fe, Ft, zt, Ut, qt, Kt, Gt, Ht, Xt, Jt, Wt, Bt, Yt, Qt;
    const He = P.strict, Zt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Gr = Zt === !0 || Zt === void 0 ? 1 : Zt || 0, Hr = (y = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && y !== void 0 ? y : g, As = (i = P.uriResolver) !== null && i !== void 0 ? i : E.default;
    return {
      strictSchema: (b = (f = P.strictSchema) !== null && f !== void 0 ? f : He) !== null && b !== void 0 ? b : !0,
      strictNumbers: (j = (I = P.strictNumbers) !== null && I !== void 0 ? I : He) !== null && j !== void 0 ? j : !0,
      strictTypes: (L = (F = P.strictTypes) !== null && F !== void 0 ? F : He) !== null && L !== void 0 ? L : "log",
      strictTuples: (Fe = (ae = P.strictTuples) !== null && ae !== void 0 ? ae : He) !== null && Fe !== void 0 ? Fe : "log",
      strictRequired: (zt = (Ft = P.strictRequired) !== null && Ft !== void 0 ? Ft : He) !== null && zt !== void 0 ? zt : !1,
      code: P.code ? { ...P.code, optimize: Gr, regExp: Hr } : { optimize: Gr, regExp: Hr },
      loopRequired: (Ut = P.loopRequired) !== null && Ut !== void 0 ? Ut : v,
      loopEnum: (qt = P.loopEnum) !== null && qt !== void 0 ? qt : v,
      meta: (Kt = P.meta) !== null && Kt !== void 0 ? Kt : !0,
      messages: (Gt = P.messages) !== null && Gt !== void 0 ? Gt : !0,
      inlineRefs: (Ht = P.inlineRefs) !== null && Ht !== void 0 ? Ht : !0,
      schemaId: (Xt = P.schemaId) !== null && Xt !== void 0 ? Xt : "$id",
      addUsedSchema: (Jt = P.addUsedSchema) !== null && Jt !== void 0 ? Jt : !0,
      validateSchema: (Wt = P.validateSchema) !== null && Wt !== void 0 ? Wt : !0,
      validateFormats: (Bt = P.validateFormats) !== null && Bt !== void 0 ? Bt : !0,
      unicodeRegExp: (Yt = P.unicodeRegExp) !== null && Yt !== void 0 ? Yt : !0,
      int32range: (Qt = P.int32range) !== null && Qt !== void 0 ? Qt : !0,
      uriResolver: As
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: y } = this.opts.code;
      this.scope = new l.ValueScope({ scope: {}, prefixes: _, es5: S, lines: y }), this.logger = H(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), O.call(this, $, p, "NOT SUPPORTED"), O.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = ye.call(this), p.formats && de.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && he.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), B.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: y } = this.opts;
      let i = h;
      y === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[y], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let y;
      if (typeof p == "string") {
        if (y = this.getSchema(p), !y)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        y = this.compile(p);
      const i = y(S);
      return "$async" in y || (this.errors = y.errors), i;
    }
    compile(p, S) {
      const y = this._addSchema(p, S);
      return y.validate || this._compileSchemaEnv(y);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: y } = this.opts;
      return i.call(this, p, S);
      async function i(L, ae) {
        await f.call(this, L.$schema);
        const Fe = this._addSchema(L, ae);
        return Fe.validate || b.call(this, Fe);
      }
      async function f(L) {
        L && !this.getSchema(L) && await i.call(this, { $ref: L }, !0);
      }
      async function b(L) {
        try {
          return this._compileSchemaEnv(L);
        } catch (ae) {
          if (!(ae instanceof s.default))
            throw ae;
          return I.call(this, ae), await j.call(this, ae.missingSchema), b.call(this, L);
        }
      }
      function I({ missingSchema: L, missingRef: ae }) {
        if (this.refs[L])
          throw new Error(`AnySchema ${L} is loaded but ${ae} cannot be resolved`);
      }
      async function j(L) {
        const ae = await F.call(this, L);
        this.refs[L] || await f.call(this, ae.$schema), this.refs[L] || this.addSchema(ae, L, S);
      }
      async function F(L) {
        const ae = this._loading[L];
        if (ae)
          return ae;
        try {
          return await (this._loading[L] = y(L));
        } finally {
          delete this._loading[L];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, y, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, y, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (f = p[b], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, c.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, y, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, y = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, y), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let y;
      if (y = p.$schema, y !== void 0 && typeof y != "string")
        throw new Error("$schema must be a string");
      if (y = y || this.opts.defaultMeta || this.defaultMeta(), !y)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate(y, p);
      if (!i && S) {
        const f = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(f);
        else
          throw new Error(f);
      }
      return i;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(p) {
      let S;
      for (; typeof (S = K.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: y } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: y });
        if (S = o.resolveSchema.call(this, i, p), !S)
          return;
        this.refs[p] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(p) {
      if (p instanceof RegExp)
        return this._removeAllSchemas(this.schemas, p), this._removeAllSchemas(this.refs, p), this;
      switch (typeof p) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = K.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let y = p[this.opts.schemaId];
          return y && (y = (0, c.normalizeId)(y), delete this.schemas[y], delete this.refs[y]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(p) {
      for (const S of p)
        this.addKeyword(S);
      return this;
    }
    addKeyword(p, S) {
      let y;
      if (typeof p == "string")
        y = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = y);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, y = S.keyword, Array.isArray(y) && !y.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (T.call(this, y, S), !S)
        return (0, u.eachItem)(y, (f) => A.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)(y, i.type.length === 0 ? (f) => A.call(this, f, i) : (f) => i.type.forEach((b) => A.call(this, f, i, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const y of S.rules) {
        const i = y.rules.findIndex((f) => f.keyword === p);
        i >= 0 && y.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: y = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${y}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const y = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let b = p;
        for (const I of f)
          b = b[I];
        for (const I in y) {
          const j = y[I];
          if (typeof j != "object")
            continue;
          const { $data: F } = j.definition, L = b[I];
          F && L && (b[I] = M(L));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const y in p) {
        const i = p[y];
        (!S || S.test(y)) && (typeof i == "string" ? delete p[y] : i && !i.meta && (this._cache.delete(i.schema), delete p[y]));
      }
    }
    _addSchema(p, S, y, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let b;
      const { schemaId: I } = this.opts;
      if (typeof p == "object")
        b = p[I];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let j = this._cache.get(p);
      if (j !== void 0)
        return j;
      y = (0, c.normalizeId)(b || y);
      const F = c.getSchemaRefs.call(this, p, y);
      return j = new o.SchemaEnv({ schema: p, schemaId: I, meta: S, baseId: y, localRefs: F }), this._cache.set(j.schema, j), f && !y.startsWith("#") && (y && this._checkUnique(y), this.refs[y] = j), i && this.validateSchema(p, !0), j;
    }
    _checkUnique(p) {
      if (this.schemas[p] || this.refs[p])
        throw new Error(`schema with key or id "${p}" already exists`);
    }
    _compileSchemaEnv(p) {
      if (p.meta ? this._compileMetaSchema(p) : o.compileSchema.call(this, p), !p.validate)
        throw new Error("ajv implementation error");
      return p.validate;
    }
    _compileMetaSchema(p) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, p);
      } finally {
        this.opts = S;
      }
    }
  }
  R.ValidationError = n.default, R.MissingRefError = s.default, e.default = R;
  function O(P, p, S, y = "error") {
    for (const i in P) {
      const f = i;
      f in p && this.logger[y](`${S}: option ${i}. ${P[f]}`);
    }
  }
  function K(P) {
    return P = (0, c.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function B() {
    const P = this.opts.schemas;
    if (P)
      if (Array.isArray(P))
        this.addSchema(P);
      else
        for (const p in P)
          this.addSchema(P[p], p);
  }
  function de() {
    for (const P in this.opts.formats) {
      const p = this.opts.formats[P];
      p && this.addFormat(P, p);
    }
  }
  function he(P) {
    if (Array.isArray(P)) {
      this.addVocabulary(P);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in P) {
      const S = P[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function ye() {
    const P = { ...this.opts };
    for (const p of w)
      delete P[p];
    return P;
  }
  const z = { log() {
  }, warn() {
  }, error() {
  } };
  function H(P) {
    if (P === !1)
      return z;
    if (P === void 0)
      return console;
    if (P.log && P.warn && P.error)
      return P;
    throw new Error("logger must implement log, warn and error methods");
  }
  const oe = /^[a-z_$][a-z0-9_$:-]*$/i;
  function T(P, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(P, (y) => {
      if (S.keywords[y])
        throw new Error(`Keyword ${y} is already defined`);
      if (!oe.test(y))
        throw new Error(`Keyword ${y} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function A(P, p, S) {
    var y;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let b = i ? f.post : f.rules.find(({ type: j }) => j === S);
    if (b || (b = { type: S, rules: [] }, f.rules.push(b)), f.keywords[P] = !0, !p)
      return;
    const I = {
      keyword: P,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? V.call(this, b, I, p.before) : b.rules.push(I), f.all[P] = I, (y = p.implements) === null || y === void 0 || y.forEach((j) => this.addKeyword(j));
  }
  function V(P, p, S) {
    const y = P.rules.findIndex((i) => i.keyword === S);
    y >= 0 ? P.rules.splice(y, 0, p) : (P.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function D(P) {
    let { metaSchema: p } = P;
    p !== void 0 && (P.$data && this.opts.$data && (p = M(p)), P.validateSchema = this.compile(p, !0));
  }
  const G = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function M(P) {
    return { anyOf: [P, G] };
  }
})(ul);
var za = {}, Ua = {}, qa = {};
Object.defineProperty(qa, "__esModule", { value: !0 });
const bm = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
qa.default = bm;
var wt = {};
Object.defineProperty(wt, "__esModule", { value: !0 });
wt.callRef = wt.getValidate = void 0;
const Sm = Dr, Ki = ne, Me = x, yr = Ue, Gi = Ae, Nn = k, Pm = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: l, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = Gi.resolveRef.call(c, d, s, r);
    if (u === void 0)
      throw new Sm.default(n.opts.uriResolver, s, r);
    if (u instanceof Gi.SchemaEnv)
      return E(u);
    return g(u);
    function h() {
      if (a === d)
        return Wn(e, o, a, a.$async);
      const w = t.scopeValue("root", { ref: d });
      return Wn(e, (0, Me._)`${w}.validate`, d, d.$async);
    }
    function E(w) {
      const _ = eu(e, w);
      Wn(e, _, w, w.$async);
    }
    function g(w) {
      const _ = t.scopeValue("schema", l.code.source === !0 ? { ref: w, code: (0, Me.stringify)(w) } : { ref: w }), $ = t.name("valid"), m = e.subschema({
        schema: w,
        dataTypes: [],
        schemaPath: Me.nil,
        topSchemaRef: _,
        errSchemaPath: r
      }, $);
      e.mergeEvaluated(m), e.ok($);
    }
  }
};
function eu(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Me._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
wt.getValidate = eu;
function Wn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: c } = a, d = c.passContext ? yr.default.this : Me.nil;
  n ? u() : h();
  function u() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const w = s.let("valid");
    s.try(() => {
      s.code((0, Me._)`await ${(0, Ki.callValidateCode)(e, t, d)}`), g(t), o || s.assign(w, !0);
    }, (_) => {
      s.if((0, Me._)`!(${_} instanceof ${a.ValidationError})`, () => s.throw(_)), E(_), o || s.assign(w, !1);
    }), e.ok(w);
  }
  function h() {
    e.result((0, Ki.callValidateCode)(e, t, d), () => g(t), () => E(t));
  }
  function E(w) {
    const _ = (0, Me._)`${w}.errors`;
    s.assign(yr.default.vErrors, (0, Me._)`${yr.default.vErrors} === null ? ${_} : ${yr.default.vErrors}.concat(${_})`), s.assign(yr.default.errors, (0, Me._)`${yr.default.vErrors}.length`);
  }
  function g(w) {
    var _;
    if (!a.opts.unevaluated)
      return;
    const $ = (_ = r == null ? void 0 : r.validate) === null || _ === void 0 ? void 0 : _.evaluated;
    if (a.props !== !0)
      if ($ && !$.dynamicProps)
        $.props !== void 0 && (a.props = Nn.mergeEvaluated.props(s, $.props, a.props));
      else {
        const m = s.var("props", (0, Me._)`${w}.evaluated.props`);
        a.props = Nn.mergeEvaluated.props(s, m, a.props, Me.Name);
      }
    if (a.items !== !0)
      if ($ && !$.dynamicItems)
        $.items !== void 0 && (a.items = Nn.mergeEvaluated.items(s, $.items, a.items));
      else {
        const m = s.var("items", (0, Me._)`${w}.evaluated.items`);
        a.items = Nn.mergeEvaluated.items(s, m, a.items, Me.Name);
      }
  }
}
wt.callRef = Wn;
wt.default = Pm;
Object.defineProperty(Ua, "__esModule", { value: !0 });
const Nm = qa, Rm = wt, Om = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  Nm.default,
  Rm.default
];
Ua.default = Om;
var Ka = {}, Ga = {};
Object.defineProperty(Ga, "__esModule", { value: !0 });
const ss = x, Nt = ss.operators, as = {
  maximum: { okStr: "<=", ok: Nt.LTE, fail: Nt.GT },
  minimum: { okStr: ">=", ok: Nt.GTE, fail: Nt.LT },
  exclusiveMaximum: { okStr: "<", ok: Nt.LT, fail: Nt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Nt.GT, fail: Nt.LTE }
}, Im = {
  message: ({ keyword: e, schemaCode: t }) => (0, ss.str)`must be ${as[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, ss._)`{comparison: ${as[e].okStr}, limit: ${t}}`
}, Tm = {
  keyword: Object.keys(as),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Im,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, ss._)`${r} ${as[t].fail} ${n} || isNaN(${r})`);
  }
};
Ga.default = Tm;
var Ha = {};
Object.defineProperty(Ha, "__esModule", { value: !0 });
const sn = x, jm = {
  message: ({ schemaCode: e }) => (0, sn.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, sn._)`{multipleOf: ${e}}`
}, Am = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: jm,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, sn._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, sn._)`${o} !== parseInt(${o})`;
    e.fail$data((0, sn._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Ha.default = Am;
var Xa = {}, Ja = {};
Object.defineProperty(Ja, "__esModule", { value: !0 });
function tu(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Ja.default = tu;
tu.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Xa, "__esModule", { value: !0 });
const rr = x, km = k, Cm = Ja, Dm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, rr.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, rr._)`{limit: ${e}}`
}, Mm = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: Dm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? rr.operators.GT : rr.operators.LT, o = s.opts.unicode === !1 ? (0, rr._)`${r}.length` : (0, rr._)`${(0, km.useFunc)(e.gen, Cm.default)}(${r})`;
    e.fail$data((0, rr._)`${o} ${a} ${n}`);
  }
};
Xa.default = Mm;
var Wa = {};
Object.defineProperty(Wa, "__esModule", { value: !0 });
const Vm = ne, Lm = k, Sr = x, Fm = {
  message: ({ schemaCode: e }) => (0, Sr.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Sr._)`{pattern: ${e}}`
}, zm = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: Fm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e, l = o.opts.unicodeRegExp ? "u" : "";
    if (n) {
      const { regExp: c } = o.opts.code, d = c.code === "new RegExp" ? (0, Sr._)`new RegExp` : (0, Lm.useFunc)(t, c), u = t.let("valid");
      t.try(() => t.assign(u, (0, Sr._)`${d}(${a}, ${l}).test(${r})`), () => t.assign(u, !1)), e.fail$data((0, Sr._)`!${u}`);
    } else {
      const c = (0, Vm.usePattern)(e, s);
      e.fail$data((0, Sr._)`!${c}.test(${r})`);
    }
  }
};
Wa.default = zm;
var Ba = {};
Object.defineProperty(Ba, "__esModule", { value: !0 });
const an = x, Um = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, an.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, an._)`{limit: ${e}}`
}, qm = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: Um,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? an.operators.GT : an.operators.LT;
    e.fail$data((0, an._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Ba.default = qm;
var Ya = {};
Object.defineProperty(Ya, "__esModule", { value: !0 });
const Br = ne, on = x, Km = k, Gm = {
  message: ({ params: { missingProperty: e } }) => (0, on.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, on._)`{missingProperty: ${e}}`
}, Hm = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Gm,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: l } = o;
    if (!a && r.length === 0)
      return;
    const c = r.length >= l.loopRequired;
    if (o.allErrors ? d() : u(), l.strictRequired) {
      const g = e.parentSchema.properties, { definedProperties: w } = e.it;
      for (const _ of r)
        if ((g == null ? void 0 : g[_]) === void 0 && !w.has(_)) {
          const $ = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${_}" is not defined at "${$}" (strictRequired)`;
          (0, Km.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (c || a)
        e.block$data(on.nil, h);
      else
        for (const g of r)
          (0, Br.checkReportMissingProp)(e, g);
    }
    function u() {
      const g = t.let("missing");
      if (c || a) {
        const w = t.let("valid", !0);
        e.block$data(w, () => E(g, w)), e.ok(w);
      } else
        t.if((0, Br.checkMissingProp)(e, r, g)), (0, Br.reportMissingProp)(e, g), t.else();
    }
    function h() {
      t.forOf("prop", n, (g) => {
        e.setParams({ missingProperty: g }), t.if((0, Br.noPropertyInData)(t, s, g, l.ownProperties), () => e.error());
      });
    }
    function E(g, w) {
      e.setParams({ missingProperty: g }), t.forOf(g, n, () => {
        t.assign(w, (0, Br.propertyInData)(t, s, g, l.ownProperties)), t.if((0, on.not)(w), () => {
          e.error(), t.break();
        });
      }, on.nil);
    }
  }
};
Ya.default = Hm;
var Qa = {};
Object.defineProperty(Qa, "__esModule", { value: !0 });
const cn = x, Xm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, cn.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, cn._)`{limit: ${e}}`
}, Jm = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Xm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? cn.operators.GT : cn.operators.LT;
    e.fail$data((0, cn._)`${r}.length ${s} ${n}`);
  }
};
Qa.default = Jm;
var Za = {}, gn = {};
Object.defineProperty(gn, "__esModule", { value: !0 });
const ru = ps;
ru.code = 'require("ajv/dist/runtime/equal").default';
gn.default = ru;
Object.defineProperty(Za, "__esModule", { value: !0 });
const zs = $e, ve = x, Wm = k, Bm = gn, Ym = {
  message: ({ params: { i: e, j: t } }) => (0, ve.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, ve._)`{i: ${e}, j: ${t}}`
}, Qm = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: Ym,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: l } = e;
    if (!n && !s)
      return;
    const c = t.let("valid"), d = a.items ? (0, zs.getSchemaTypes)(a.items) : [];
    e.block$data(c, u, (0, ve._)`${o} === false`), e.ok(c);
    function u() {
      const w = t.let("i", (0, ve._)`${r}.length`), _ = t.let("j");
      e.setParams({ i: w, j: _ }), t.assign(c, !0), t.if((0, ve._)`${w} > 1`, () => (h() ? E : g)(w, _));
    }
    function h() {
      return d.length > 0 && !d.some((w) => w === "object" || w === "array");
    }
    function E(w, _) {
      const $ = t.name("item"), m = (0, zs.checkDataTypes)(d, $, l.opts.strictNumbers, zs.DataType.Wrong), v = t.const("indices", (0, ve._)`{}`);
      t.for((0, ve._)`;${w}--;`, () => {
        t.let($, (0, ve._)`${r}[${w}]`), t.if(m, (0, ve._)`continue`), d.length > 1 && t.if((0, ve._)`typeof ${$} == "string"`, (0, ve._)`${$} += "_"`), t.if((0, ve._)`typeof ${v}[${$}] == "number"`, () => {
          t.assign(_, (0, ve._)`${v}[${$}]`), e.error(), t.assign(c, !1).break();
        }).code((0, ve._)`${v}[${$}] = ${w}`);
      });
    }
    function g(w, _) {
      const $ = (0, Wm.useFunc)(t, Bm.default), m = t.name("outer");
      t.label(m).for((0, ve._)`;${w}--;`, () => t.for((0, ve._)`${_} = ${w}; ${_}--;`, () => t.if((0, ve._)`${$}(${r}[${w}], ${r}[${_}])`, () => {
        e.error(), t.assign(c, !1).break(m);
      })));
    }
  }
};
Za.default = Qm;
var xa = {};
Object.defineProperty(xa, "__esModule", { value: !0 });
const ua = x, Zm = k, xm = gn, ep = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, ua._)`{allowedValue: ${e}}`
}, tp = {
  keyword: "const",
  $data: !0,
  error: ep,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, ua._)`!${(0, Zm.useFunc)(t, xm.default)}(${r}, ${s})`) : e.fail((0, ua._)`${a} !== ${r}`);
  }
};
xa.default = tp;
var eo = {};
Object.defineProperty(eo, "__esModule", { value: !0 });
const tn = x, rp = k, np = gn, sp = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, tn._)`{allowedValues: ${e}}`
}, ap = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: sp,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const l = s.length >= o.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, rp.useFunc)(t, np.default));
    let u;
    if (l || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const g = t.const("vSchema", a);
      u = (0, tn.or)(...s.map((w, _) => E(g, _)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (g) => t.if((0, tn._)`${d()}(${r}, ${g})`, () => t.assign(u, !0).break()));
    }
    function E(g, w) {
      const _ = s[w];
      return typeof _ == "object" && _ !== null ? (0, tn._)`${d()}(${r}, ${g}[${w}])` : (0, tn._)`${r} === ${_}`;
    }
  }
};
eo.default = ap;
Object.defineProperty(Ka, "__esModule", { value: !0 });
const op = Ga, ip = Ha, cp = Xa, lp = Wa, up = Ba, dp = Ya, fp = Qa, hp = Za, mp = xa, pp = eo, yp = [
  // number
  op.default,
  ip.default,
  // string
  cp.default,
  lp.default,
  // object
  up.default,
  dp.default,
  // array
  fp.default,
  hp.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  mp.default,
  pp.default
];
Ka.default = yp;
var to = {}, Mr = {};
Object.defineProperty(Mr, "__esModule", { value: !0 });
Mr.validateAdditionalItems = void 0;
const nr = x, da = k, $p = {
  message: ({ params: { len: e } }) => (0, nr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, nr._)`{limit: ${e}}`
}, gp = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: $p,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, da.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    nu(e, n);
  }
};
function nu(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const l = r.const("len", (0, nr._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, nr._)`${l} <= ${t.length}`);
  else if (typeof n == "object" && !(0, da.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, nr._)`${l} <= ${t.length}`);
    r.if((0, nr.not)(d), () => c(d)), e.ok(d);
  }
  function c(d) {
    r.forRange("i", t.length, l, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: da.Type.Num }, d), o.allErrors || r.if((0, nr.not)(d), () => r.break());
    });
  }
}
Mr.validateAdditionalItems = nu;
Mr.default = gp;
var ro = {}, Vr = {};
Object.defineProperty(Vr, "__esModule", { value: !0 });
Vr.validateTuple = void 0;
const Hi = x, Bn = k, _p = ne, vp = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return su(e, "additionalItems", t);
    r.items = !0, !(0, Bn.alwaysValidSchema)(r, t) && e.ok((0, _p.validateArray)(e));
  }
};
function su(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: l } = e;
  u(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = Bn.mergeEvaluated.items(n, r.length, l.items));
  const c = n.name("valid"), d = n.const("len", (0, Hi._)`${a}.length`);
  r.forEach((h, E) => {
    (0, Bn.alwaysValidSchema)(l, h) || (n.if((0, Hi._)`${d} > ${E}`, () => e.subschema({
      keyword: o,
      schemaProp: E,
      dataProp: E
    }, c)), e.ok(c));
  });
  function u(h) {
    const { opts: E, errSchemaPath: g } = l, w = r.length, _ = w === h.minItems && (w === h.maxItems || h[t] === !1);
    if (E.strictTuples && !_) {
      const $ = `"${o}" is ${w}-tuple, but minItems or maxItems/${t} are not specified or different at path "${g}"`;
      (0, Bn.checkStrictMode)(l, $, E.strictTuples);
    }
  }
}
Vr.validateTuple = su;
Vr.default = vp;
Object.defineProperty(ro, "__esModule", { value: !0 });
const wp = Vr, Ep = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, wp.validateTuple)(e, "items")
};
ro.default = Ep;
var no = {};
Object.defineProperty(no, "__esModule", { value: !0 });
const Xi = x, bp = k, Sp = ne, Pp = Mr, Np = {
  message: ({ params: { len: e } }) => (0, Xi.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Xi._)`{limit: ${e}}`
}, Rp = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: Np,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, bp.alwaysValidSchema)(n, t) && (s ? (0, Pp.validateAdditionalItems)(e, s) : e.ok((0, Sp.validateArray)(e)));
  }
};
no.default = Rp;
var so = {};
Object.defineProperty(so, "__esModule", { value: !0 });
const Ke = x, Rn = k, Op = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ke.str)`must contain at least ${e} valid item(s)` : (0, Ke.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ke._)`{minContains: ${e}}` : (0, Ke._)`{minContains: ${e}, maxContains: ${t}}`
}, Ip = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: Op,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, l;
    const { minContains: c, maxContains: d } = n;
    a.opts.next ? (o = c === void 0 ? 1 : c, l = d) : o = 1;
    const u = t.const("len", (0, Ke._)`${s}.length`);
    if (e.setParams({ min: o, max: l }), l === void 0 && o === 0) {
      (0, Rn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && o > l) {
      (0, Rn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, Rn.alwaysValidSchema)(a, r)) {
      let _ = (0, Ke._)`${u} >= ${o}`;
      l !== void 0 && (_ = (0, Ke._)`${_} && ${u} <= ${l}`), e.pass(_);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    l === void 0 && o === 1 ? g(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), l !== void 0 && t.if((0, Ke._)`${s}.length > 0`, E)) : (t.let(h, !1), E()), e.result(h, () => e.reset());
    function E() {
      const _ = t.name("_valid"), $ = t.let("count", 0);
      g(_, () => t.if(_, () => w($)));
    }
    function g(_, $) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: Rn.Type.Num,
          compositeRule: !0
        }, _), $();
      });
    }
    function w(_) {
      t.code((0, Ke._)`${_}++`), l === void 0 ? t.if((0, Ke._)`${_} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Ke._)`${_} > ${l}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Ke._)`${_} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
so.default = Ip;
var _s = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = x, r = k, n = ne;
  e.error = {
    message: ({ params: { property: c, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${c} is present`;
    },
    params: ({ params: { property: c, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${c},
    missingProperty: ${h},
    depsCount: ${d},
    deps: ${u}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(c) {
      const [d, u] = a(c);
      o(c, d), l(c, u);
    }
  };
  function a({ schema: c }) {
    const d = {}, u = {};
    for (const h in c) {
      if (h === "__proto__")
        continue;
      const E = Array.isArray(c[h]) ? d : u;
      E[h] = c[h];
    }
    return [d, u];
  }
  function o(c, d = c.schema) {
    const { gen: u, data: h, it: E } = c;
    if (Object.keys(d).length === 0)
      return;
    const g = u.let("missing");
    for (const w in d) {
      const _ = d[w];
      if (_.length === 0)
        continue;
      const $ = (0, n.propertyInData)(u, h, w, E.opts.ownProperties);
      c.setParams({
        property: w,
        depsCount: _.length,
        deps: _.join(", ")
      }), E.allErrors ? u.if($, () => {
        for (const m of _)
          (0, n.checkReportMissingProp)(c, m);
      }) : (u.if((0, t._)`${$} && (${(0, n.checkMissingProp)(c, _, g)})`), (0, n.reportMissingProp)(c, g), u.else());
    }
  }
  e.validatePropertyDeps = o;
  function l(c, d = c.schema) {
    const { gen: u, data: h, keyword: E, it: g } = c, w = u.name("valid");
    for (const _ in d)
      (0, r.alwaysValidSchema)(g, d[_]) || (u.if(
        (0, n.propertyInData)(u, h, _, g.opts.ownProperties),
        () => {
          const $ = c.subschema({ keyword: E, schemaProp: _ }, w);
          c.mergeValidEvaluated($, w);
        },
        () => u.var(w, !0)
        // TODO var
      ), c.ok(w));
  }
  e.validateSchemaDeps = l, e.default = s;
})(_s);
var ao = {};
Object.defineProperty(ao, "__esModule", { value: !0 });
const au = x, Tp = k, jp = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, au._)`{propertyName: ${e.propertyName}}`
}, Ap = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: jp,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, Tp.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, au.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
ao.default = Ap;
var vs = {};
Object.defineProperty(vs, "__esModule", { value: !0 });
const On = ne, Be = x, kp = Ue, In = k, Cp = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Be._)`{additionalProperty: ${e.additionalProperty}}`
}, Dp = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: Cp,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: l, opts: c } = o;
    if (o.props = !0, c.removeAdditional !== "all" && (0, In.alwaysValidSchema)(o, r))
      return;
    const d = (0, On.allSchemaProperties)(n.properties), u = (0, On.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Be._)`${a} === ${kp.default.errors}`);
    function h() {
      t.forIn("key", s, ($) => {
        !d.length && !u.length ? w($) : t.if(E($), () => w($));
      });
    }
    function E($) {
      let m;
      if (d.length > 8) {
        const v = (0, In.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, On.isOwnProperty)(t, v, $);
      } else d.length ? m = (0, Be.or)(...d.map((v) => (0, Be._)`${$} === ${v}`)) : m = Be.nil;
      return u.length && (m = (0, Be.or)(m, ...u.map((v) => (0, Be._)`${(0, On.usePattern)(e, v)}.test(${$})`))), (0, Be.not)(m);
    }
    function g($) {
      t.code((0, Be._)`delete ${s}[${$}]`);
    }
    function w($) {
      if (c.removeAdditional === "all" || c.removeAdditional && r === !1) {
        g($);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: $ }), e.error(), l || t.break();
        return;
      }
      if (typeof r == "object" && !(0, In.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        c.removeAdditional === "failing" ? (_($, m, !1), t.if((0, Be.not)(m), () => {
          e.reset(), g($);
        })) : (_($, m), l || t.if((0, Be.not)(m), () => t.break()));
      }
    }
    function _($, m, v) {
      const N = {
        keyword: "additionalProperties",
        dataProp: $,
        dataPropType: In.Type.Str
      };
      v === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
vs.default = Dp;
var oo = {};
Object.defineProperty(oo, "__esModule", { value: !0 });
const Mp = xe, Ji = ne, Us = k, Wi = vs, Vp = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Wi.default.code(new Mp.KeywordCxt(a, Wi.default, "additionalProperties"));
    const o = (0, Ji.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Us.mergeEvaluated.props(t, (0, Us.toHash)(o), a.props));
    const l = o.filter((h) => !(0, Us.alwaysValidSchema)(a, r[h]));
    if (l.length === 0)
      return;
    const c = t.name("valid");
    for (const h of l)
      d(h) ? u(h) : (t.if((0, Ji.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(c, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(c);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, c);
    }
  }
};
oo.default = Vp;
var io = {};
Object.defineProperty(io, "__esModule", { value: !0 });
const Bi = ne, Tn = x, Yi = k, Qi = k, Lp = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, Bi.allSchemaProperties)(r), c = l.filter((_) => (0, Yi.alwaysValidSchema)(a, r[_]));
    if (l.length === 0 || c.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof Tn.Name) && (a.props = (0, Qi.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const _ of l)
        d && g(_), a.allErrors ? w(_) : (t.var(u, !0), w(_), t.if(u));
    }
    function g(_) {
      for (const $ in d)
        new RegExp(_).test($) && (0, Yi.checkStrictMode)(a, `property ${$} matches pattern ${_} (use allowMatchingProperties)`);
    }
    function w(_) {
      t.forIn("key", n, ($) => {
        t.if((0, Tn._)`${(0, Bi.usePattern)(e, _)}.test(${$})`, () => {
          const m = c.includes(_);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: _,
            dataProp: $,
            dataPropType: Qi.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, Tn._)`${h}[${$}]`, !0) : !m && !a.allErrors && t.if((0, Tn.not)(u), () => t.break());
        });
      });
    }
  }
};
io.default = Lp;
var co = {};
Object.defineProperty(co, "__esModule", { value: !0 });
const Fp = k, zp = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, Fp.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const s = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), e.failResult(s, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
co.default = zp;
var lo = {};
Object.defineProperty(lo, "__esModule", { value: !0 });
const Up = ne, qp = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Up.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
lo.default = qp;
var uo = {};
Object.defineProperty(uo, "__esModule", { value: !0 });
const Yn = x, Kp = k, Gp = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Yn._)`{passingSchemas: ${e.passing}}`
}, Hp = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Gp,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), l = t.let("passing", null), c = t.name("_valid");
    e.setParams({ passing: l }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let E;
        (0, Kp.alwaysValidSchema)(s, u) ? t.var(c, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, c), h > 0 && t.if((0, Yn._)`${c} && ${o}`).assign(o, !1).assign(l, (0, Yn._)`[${l}, ${h}]`).else(), t.if(c, () => {
          t.assign(o, !0), t.assign(l, h), E && e.mergeEvaluated(E, Yn.Name);
        });
      });
    }
  }
};
uo.default = Hp;
var fo = {};
Object.defineProperty(fo, "__esModule", { value: !0 });
const Xp = k, Jp = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, Xp.alwaysValidSchema)(n, a))
        return;
      const l = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(l);
    });
  }
};
fo.default = Jp;
var ho = {};
Object.defineProperty(ho, "__esModule", { value: !0 });
const os = x, ou = k, Wp = {
  message: ({ params: e }) => (0, os.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, os._)`{failingKeyword: ${e.ifClause}}`
}, Bp = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Wp,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, ou.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Zi(n, "then"), a = Zi(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), l = t.name("_valid");
    if (c(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(l, d("then", u), d("else", u));
    } else s ? t.if(l, d("then")) : t.if((0, os.not)(l), d("else"));
    e.pass(o, () => e.error(!0));
    function c() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, l);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const E = e.subschema({ keyword: u }, l);
        t.assign(o, l), e.mergeValidEvaluated(E, o), h ? t.assign(h, (0, os._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function Zi(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, ou.alwaysValidSchema)(e, r);
}
ho.default = Bp;
var mo = {};
Object.defineProperty(mo, "__esModule", { value: !0 });
const Yp = k, Qp = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Yp.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
mo.default = Qp;
Object.defineProperty(to, "__esModule", { value: !0 });
const Zp = Mr, xp = ro, ey = Vr, ty = no, ry = so, ny = _s, sy = ao, ay = vs, oy = oo, iy = io, cy = co, ly = lo, uy = uo, dy = fo, fy = ho, hy = mo;
function my(e = !1) {
  const t = [
    // any
    cy.default,
    ly.default,
    uy.default,
    dy.default,
    fy.default,
    hy.default,
    // object
    sy.default,
    ay.default,
    ny.default,
    oy.default,
    iy.default
  ];
  return e ? t.push(xp.default, ty.default) : t.push(Zp.default, ey.default), t.push(ry.default), t;
}
to.default = my;
var po = {}, Lr = {};
Object.defineProperty(Lr, "__esModule", { value: !0 });
Lr.dynamicAnchor = void 0;
const qs = x, py = Ue, xi = Ae, yy = wt, $y = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => iu(e, e.schema)
};
function iu(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, qs._)`${py.default.dynamicAnchors}${(0, qs.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : gy(e);
  r.if((0, qs._)`!${s}`, () => r.assign(s, a));
}
Lr.dynamicAnchor = iu;
function gy(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: o, meta: l } = t.root, { schemaId: c } = n.opts, d = new xi.SchemaEnv({ schema: r, schemaId: c, root: s, baseId: a, localRefs: o, meta: l });
  return xi.compileSchema.call(n, d), (0, yy.getValidate)(e, d);
}
Lr.default = $y;
var Fr = {};
Object.defineProperty(Fr, "__esModule", { value: !0 });
Fr.dynamicRef = void 0;
const ec = x, _y = Ue, tc = wt, vy = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => cu(e, e.schema)
};
function cu(e, t) {
  const { gen: r, keyword: n, it: s } = e;
  if (t[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const a = t.slice(1);
  if (s.allErrors)
    o();
  else {
    const c = r.let("valid", !1);
    o(c), e.ok(c);
  }
  function o(c) {
    if (s.schemaEnv.root.dynamicAnchors[a]) {
      const d = r.let("_v", (0, ec._)`${_y.default.dynamicAnchors}${(0, ec.getProperty)(a)}`);
      r.if(d, l(d, c), l(s.validateName, c));
    } else
      l(s.validateName, c)();
  }
  function l(c, d) {
    return d ? () => r.block(() => {
      (0, tc.callRef)(e, c), r.let(d, !0);
    }) : () => (0, tc.callRef)(e, c);
  }
}
Fr.dynamicRef = cu;
Fr.default = vy;
var yo = {};
Object.defineProperty(yo, "__esModule", { value: !0 });
const wy = Lr, Ey = k, by = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, wy.dynamicAnchor)(e, "") : (0, Ey.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
yo.default = by;
var $o = {};
Object.defineProperty($o, "__esModule", { value: !0 });
const Sy = Fr, Py = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, Sy.dynamicRef)(e, e.schema)
};
$o.default = Py;
Object.defineProperty(po, "__esModule", { value: !0 });
const Ny = Lr, Ry = Fr, Oy = yo, Iy = $o, Ty = [Ny.default, Ry.default, Oy.default, Iy.default];
po.default = Ty;
var go = {}, _o = {};
Object.defineProperty(_o, "__esModule", { value: !0 });
const rc = _s, jy = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: rc.error,
  code: (e) => (0, rc.validatePropertyDeps)(e)
};
_o.default = jy;
var vo = {};
Object.defineProperty(vo, "__esModule", { value: !0 });
const Ay = _s, ky = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, Ay.validateSchemaDeps)(e)
};
vo.default = ky;
var wo = {};
Object.defineProperty(wo, "__esModule", { value: !0 });
const Cy = k, Dy = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, Cy.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
wo.default = Dy;
Object.defineProperty(go, "__esModule", { value: !0 });
const My = _o, Vy = vo, Ly = wo, Fy = [My.default, Vy.default, Ly.default];
go.default = Fy;
var Eo = {}, bo = {};
Object.defineProperty(bo, "__esModule", { value: !0 });
const It = x, nc = k, zy = Ue, Uy = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, It._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, qy = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: Uy,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: a } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: l } = a;
    l instanceof It.Name ? t.if((0, It._)`${l} !== true`, () => t.forIn("key", n, (h) => t.if(d(l, h), () => c(h)))) : l !== !0 && t.forIn("key", n, (h) => l === void 0 ? c(h) : t.if(u(l, h), () => c(h))), a.props = !0, e.ok((0, It._)`${s} === ${zy.default.errors}`);
    function c(h) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: h }), e.error(), o || t.break();
        return;
      }
      if (!(0, nc.alwaysValidSchema)(a, r)) {
        const E = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: h,
          dataPropType: nc.Type.Str
        }, E), o || t.if((0, It.not)(E), () => t.break());
      }
    }
    function d(h, E) {
      return (0, It._)`!${h} || !${h}[${E}]`;
    }
    function u(h, E) {
      const g = [];
      for (const w in h)
        h[w] === !0 && g.push((0, It._)`${E} !== ${w}`);
      return (0, It.and)(...g);
    }
  }
};
bo.default = qy;
var So = {};
Object.defineProperty(So, "__esModule", { value: !0 });
const sr = x, sc = k, Ky = {
  message: ({ params: { len: e } }) => (0, sr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, sr._)`{limit: ${e}}`
}, Gy = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: Ky,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const o = t.const("len", (0, sr._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, sr._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, sc.alwaysValidSchema)(s, r)) {
      const c = t.var("valid", (0, sr._)`${o} <= ${a}`);
      t.if((0, sr.not)(c), () => l(c, a)), e.ok(c);
    }
    s.items = !0;
    function l(c, d) {
      t.forRange("i", d, o, (u) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: u, dataPropType: sc.Type.Num }, c), s.allErrors || t.if((0, sr.not)(c), () => t.break());
      });
    }
  }
};
So.default = Gy;
Object.defineProperty(Eo, "__esModule", { value: !0 });
const Hy = bo, Xy = So, Jy = [Hy.default, Xy.default];
Eo.default = Jy;
var Po = {}, No = {};
Object.defineProperty(No, "__esModule", { value: !0 });
const me = x, Wy = {
  message: ({ schemaCode: e }) => (0, me.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, me._)`{format: ${e}}`
}, By = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Wy,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: l } = e, { opts: c, errSchemaPath: d, schemaEnv: u, self: h } = l;
    if (!c.validateFormats)
      return;
    s ? E() : g();
    function E() {
      const w = r.scopeValue("formats", {
        ref: h.formats,
        code: c.code.formats
      }), _ = r.const("fDef", (0, me._)`${w}[${o}]`), $ = r.let("fType"), m = r.let("format");
      r.if((0, me._)`typeof ${_} == "object" && !(${_} instanceof RegExp)`, () => r.assign($, (0, me._)`${_}.type || "string"`).assign(m, (0, me._)`${_}.validate`), () => r.assign($, (0, me._)`"string"`).assign(m, _)), e.fail$data((0, me.or)(v(), N()));
      function v() {
        return c.strictSchema === !1 ? me.nil : (0, me._)`${o} && !${m}`;
      }
      function N() {
        const R = u.$async ? (0, me._)`(${_}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, me._)`${m}(${n})`, O = (0, me._)`(typeof ${m} == "function" ? ${R} : ${m}.test(${n}))`;
        return (0, me._)`${m} && ${m} !== true && ${$} === ${t} && !${O}`;
      }
    }
    function g() {
      const w = h.formats[a];
      if (!w) {
        v();
        return;
      }
      if (w === !0)
        return;
      const [_, $, m] = N(w);
      _ === t && e.pass(R());
      function v() {
        if (c.strictSchema === !1) {
          h.logger.warn(O());
          return;
        }
        throw new Error(O());
        function O() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function N(O) {
        const K = O instanceof RegExp ? (0, me.regexpCode)(O) : c.code.formats ? (0, me._)`${c.code.formats}${(0, me.getProperty)(a)}` : void 0, B = r.scopeValue("formats", { key: a, ref: O, code: K });
        return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, me._)`${B}.validate`] : ["string", O, B];
      }
      function R() {
        if (typeof w == "object" && !(w instanceof RegExp) && w.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, me._)`await ${m}(${n})`;
        }
        return typeof $ == "function" ? (0, me._)`${m}(${n})` : (0, me._)`${m}.test(${n})`;
      }
    }
  }
};
No.default = By;
Object.defineProperty(Po, "__esModule", { value: !0 });
const Yy = No, Qy = [Yy.default];
Po.default = Qy;
var Ar = {};
Object.defineProperty(Ar, "__esModule", { value: !0 });
Ar.contentVocabulary = Ar.metadataVocabulary = void 0;
Ar.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Ar.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(za, "__esModule", { value: !0 });
const Zy = Ua, xy = Ka, e$ = to, t$ = po, r$ = go, n$ = Eo, s$ = Po, ac = Ar, a$ = [
  t$.default,
  Zy.default,
  xy.default,
  (0, e$.default)(!0),
  s$.default,
  ac.metadataVocabulary,
  ac.contentVocabulary,
  r$.default,
  n$.default
];
za.default = a$;
var Ro = {}, ws = {};
Object.defineProperty(ws, "__esModule", { value: !0 });
ws.DiscrError = void 0;
var oc;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(oc || (ws.DiscrError = oc = {}));
Object.defineProperty(Ro, "__esModule", { value: !0 });
const vr = x, fa = ws, ic = Ae, o$ = Dr, i$ = k, c$ = {
  message: ({ params: { discrError: e, tagName: t } }) => e === fa.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, vr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, l$ = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: c$,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const l = n.propertyName;
    if (typeof l != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const c = t.let("valid", !1), d = t.const("tag", (0, vr._)`${r}${(0, vr.getProperty)(l)}`);
    t.if((0, vr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: fa.DiscrError.Tag, tag: d, tagName: l })), e.ok(c);
    function u() {
      const g = E();
      t.if(!1);
      for (const w in g)
        t.elseIf((0, vr._)`${d} === ${w}`), t.assign(c, h(g[w]));
      t.else(), e.error(!1, { discrError: fa.DiscrError.Mapping, tag: d, tagName: l }), t.endIf();
    }
    function h(g) {
      const w = t.name("valid"), _ = e.subschema({ keyword: "oneOf", schemaProp: g }, w);
      return e.mergeEvaluated(_, vr.Name), w;
    }
    function E() {
      var g;
      const w = {}, _ = m(s);
      let $ = !0;
      for (let R = 0; R < o.length; R++) {
        let O = o[R];
        if (O != null && O.$ref && !(0, i$.schemaHasRulesButRef)(O, a.self.RULES)) {
          const B = O.$ref;
          if (O = ic.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, B), O instanceof ic.SchemaEnv && (O = O.schema), O === void 0)
            throw new o$.default(a.opts.uriResolver, a.baseId, B);
        }
        const K = (g = O == null ? void 0 : O.properties) === null || g === void 0 ? void 0 : g[l];
        if (typeof K != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${l}"`);
        $ = $ && (_ || m(O)), v(K, R);
      }
      if (!$)
        throw new Error(`discriminator: "${l}" must be required`);
      return w;
      function m({ required: R }) {
        return Array.isArray(R) && R.includes(l);
      }
      function v(R, O) {
        if (R.const)
          N(R.const, O);
        else if (R.enum)
          for (const K of R.enum)
            N(K, O);
        else
          throw new Error(`discriminator: "properties/${l}" must have "const" or "enum"`);
      }
      function N(R, O) {
        if (typeof R != "string" || R in w)
          throw new Error(`discriminator: "${l}" values must be unique strings`);
        w[R] = O;
      }
    }
  }
};
Ro.default = l$;
var Oo = {};
const u$ = "https://json-schema.org/draft/2020-12/schema", d$ = "https://json-schema.org/draft/2020-12/schema", f$ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, h$ = "meta", m$ = "Core and Validation specifications meta-schema", p$ = [
  {
    $ref: "meta/core"
  },
  {
    $ref: "meta/applicator"
  },
  {
    $ref: "meta/unevaluated"
  },
  {
    $ref: "meta/validation"
  },
  {
    $ref: "meta/meta-data"
  },
  {
    $ref: "meta/format-annotation"
  },
  {
    $ref: "meta/content"
  }
], y$ = [
  "object",
  "boolean"
], $$ = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", g$ = {
  definitions: {
    $comment: '"definitions" has been replaced by "$defs".',
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    deprecated: !0,
    default: {}
  },
  dependencies: {
    $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $dynamicRef: "#meta"
        },
        {
          $ref: "meta/validation#/$defs/stringArray"
        }
      ]
    },
    deprecated: !0,
    default: {}
  },
  $recursiveAnchor: {
    $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
    $ref: "meta/core#/$defs/anchorString",
    deprecated: !0
  },
  $recursiveRef: {
    $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
    $ref: "meta/core#/$defs/uriReferenceString",
    deprecated: !0
  }
}, _$ = {
  $schema: u$,
  $id: d$,
  $vocabulary: f$,
  $dynamicAnchor: h$,
  title: m$,
  allOf: p$,
  type: y$,
  $comment: $$,
  properties: g$
}, v$ = "https://json-schema.org/draft/2020-12/schema", w$ = "https://json-schema.org/draft/2020-12/meta/applicator", E$ = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, b$ = "meta", S$ = "Applicator vocabulary meta-schema", P$ = [
  "object",
  "boolean"
], N$ = {
  prefixItems: {
    $ref: "#/$defs/schemaArray"
  },
  items: {
    $dynamicRef: "#meta"
  },
  contains: {
    $dynamicRef: "#meta"
  },
  additionalProperties: {
    $dynamicRef: "#meta"
  },
  properties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependentSchemas: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  propertyNames: {
    $dynamicRef: "#meta"
  },
  if: {
    $dynamicRef: "#meta"
  },
  then: {
    $dynamicRef: "#meta"
  },
  else: {
    $dynamicRef: "#meta"
  },
  allOf: {
    $ref: "#/$defs/schemaArray"
  },
  anyOf: {
    $ref: "#/$defs/schemaArray"
  },
  oneOf: {
    $ref: "#/$defs/schemaArray"
  },
  not: {
    $dynamicRef: "#meta"
  }
}, R$ = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, O$ = {
  $schema: v$,
  $id: w$,
  $vocabulary: E$,
  $dynamicAnchor: b$,
  title: S$,
  type: P$,
  properties: N$,
  $defs: R$
}, I$ = "https://json-schema.org/draft/2020-12/schema", T$ = "https://json-schema.org/draft/2020-12/meta/unevaluated", j$ = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, A$ = "meta", k$ = "Unevaluated applicator vocabulary meta-schema", C$ = [
  "object",
  "boolean"
], D$ = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, M$ = {
  $schema: I$,
  $id: T$,
  $vocabulary: j$,
  $dynamicAnchor: A$,
  title: k$,
  type: C$,
  properties: D$
}, V$ = "https://json-schema.org/draft/2020-12/schema", L$ = "https://json-schema.org/draft/2020-12/meta/content", F$ = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, z$ = "meta", U$ = "Content vocabulary meta-schema", q$ = [
  "object",
  "boolean"
], K$ = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, G$ = {
  $schema: V$,
  $id: L$,
  $vocabulary: F$,
  $dynamicAnchor: z$,
  title: U$,
  type: q$,
  properties: K$
}, H$ = "https://json-schema.org/draft/2020-12/schema", X$ = "https://json-schema.org/draft/2020-12/meta/core", J$ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, W$ = "meta", B$ = "Core vocabulary meta-schema", Y$ = [
  "object",
  "boolean"
], Q$ = {
  $id: {
    $ref: "#/$defs/uriReferenceString",
    $comment: "Non-empty fragments not allowed.",
    pattern: "^[^#]*#?$"
  },
  $schema: {
    $ref: "#/$defs/uriString"
  },
  $ref: {
    $ref: "#/$defs/uriReferenceString"
  },
  $anchor: {
    $ref: "#/$defs/anchorString"
  },
  $dynamicRef: {
    $ref: "#/$defs/uriReferenceString"
  },
  $dynamicAnchor: {
    $ref: "#/$defs/anchorString"
  },
  $vocabulary: {
    type: "object",
    propertyNames: {
      $ref: "#/$defs/uriString"
    },
    additionalProperties: {
      type: "boolean"
    }
  },
  $comment: {
    type: "string"
  },
  $defs: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    }
  }
}, Z$ = {
  anchorString: {
    type: "string",
    pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
  },
  uriString: {
    type: "string",
    format: "uri"
  },
  uriReferenceString: {
    type: "string",
    format: "uri-reference"
  }
}, x$ = {
  $schema: H$,
  $id: X$,
  $vocabulary: J$,
  $dynamicAnchor: W$,
  title: B$,
  type: Y$,
  properties: Q$,
  $defs: Z$
}, e0 = "https://json-schema.org/draft/2020-12/schema", t0 = "https://json-schema.org/draft/2020-12/meta/format-annotation", r0 = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, n0 = "meta", s0 = "Format vocabulary meta-schema for annotation results", a0 = [
  "object",
  "boolean"
], o0 = {
  format: {
    type: "string"
  }
}, i0 = {
  $schema: e0,
  $id: t0,
  $vocabulary: r0,
  $dynamicAnchor: n0,
  title: s0,
  type: a0,
  properties: o0
}, c0 = "https://json-schema.org/draft/2020-12/schema", l0 = "https://json-schema.org/draft/2020-12/meta/meta-data", u0 = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, d0 = "meta", f0 = "Meta-data vocabulary meta-schema", h0 = [
  "object",
  "boolean"
], m0 = {
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  deprecated: {
    type: "boolean",
    default: !1
  },
  readOnly: {
    type: "boolean",
    default: !1
  },
  writeOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  }
}, p0 = {
  $schema: c0,
  $id: l0,
  $vocabulary: u0,
  $dynamicAnchor: d0,
  title: f0,
  type: h0,
  properties: m0
}, y0 = "https://json-schema.org/draft/2020-12/schema", $0 = "https://json-schema.org/draft/2020-12/meta/validation", g0 = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, _0 = "meta", v0 = "Validation vocabulary meta-schema", w0 = [
  "object",
  "boolean"
], E0 = {
  type: {
    anyOf: [
      {
        $ref: "#/$defs/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/$defs/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  const: !0,
  enum: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  maxItems: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  maxContains: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minContains: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 1
  },
  maxProperties: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/$defs/stringArray"
  },
  dependentRequired: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/stringArray"
    }
  }
}, b0 = {
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 0
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, S0 = {
  $schema: y0,
  $id: $0,
  $vocabulary: g0,
  $dynamicAnchor: _0,
  title: v0,
  type: w0,
  properties: E0,
  $defs: b0
};
Object.defineProperty(Oo, "__esModule", { value: !0 });
const P0 = _$, N0 = O$, R0 = M$, O0 = G$, I0 = x$, T0 = i0, j0 = p0, A0 = S0, k0 = ["/properties"];
function C0(e) {
  return [
    P0,
    N0,
    R0,
    O0,
    I0,
    t(this, T0),
    j0,
    t(this, A0)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, k0) : n;
  }
}
Oo.default = C0;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = ul, n = za, s = Ro, a = Oo, o = "https://json-schema.org/draft/2020-12/schema";
  class l extends r.default {
    constructor(g = {}) {
      super({
        ...g,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((g) => this.addVocabulary(g)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: g, meta: w } = this.opts;
      w && (a.default.call(this, g), this.refs["http://json-schema.org/schema"] = o);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv2020 = l, e.exports = t = l, e.exports.Ajv2020 = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var c = xe;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return c.KeywordCxt;
  } });
  var d = x;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return d._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return d.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return d.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return d.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return d.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return d.CodeGen;
  } });
  var u = $n;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return u.default;
  } });
  var h = Dr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(aa, aa.exports);
var D0 = aa.exports, ha = { exports: {} }, lu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(z, H) {
    return { validate: z, compare: H };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(a, o),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(c(!0), d),
    "date-time": t(E(!0), g),
    "iso-time": t(c(), u),
    "iso-date-time": t(E(), w),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: m,
    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
    // uri-template: https://tools.ietf.org/html/rfc6570
    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    // For the source: https://gist.github.com/dperini/729294
    // For test cases: https://mathiasbynens.be/demo/url-regex
    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
    regex: ye,
    // uuid: http://tools.ietf.org/html/rfc4122
    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    // JSON-pointer: https://tools.ietf.org/html/rfc6901
    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
    // byte: https://github.com/miguelmota/is-base64
    byte: N,
    // signed 32 bit integer
    int32: { type: "number", validate: K },
    // signed 64 bit integer
    int64: { type: "number", validate: B },
    // C-type float
    float: { type: "number", validate: de },
    // C-type double
    double: { type: "number", validate: de },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
    time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
    "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, g),
    "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, u),
    "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, w),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, e.formatNames = Object.keys(e.fullFormats);
  function r(z) {
    return z % 4 === 0 && (z % 100 !== 0 || z % 400 === 0);
  }
  const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, s = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function a(z) {
    const H = n.exec(z);
    if (!H)
      return !1;
    const oe = +H[1], T = +H[2], A = +H[3];
    return T >= 1 && T <= 12 && A >= 1 && A <= (T === 2 && r(oe) ? 29 : s[T]);
  }
  function o(z, H) {
    if (z && H)
      return z > H ? 1 : z < H ? -1 : 0;
  }
  const l = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function c(z) {
    return function(oe) {
      const T = l.exec(oe);
      if (!T)
        return !1;
      const A = +T[1], V = +T[2], D = +T[3], G = T[4], M = T[5] === "-" ? -1 : 1, P = +(T[6] || 0), p = +(T[7] || 0);
      if (P > 23 || p > 59 || z && !G)
        return !1;
      if (A <= 23 && V <= 59 && D < 60)
        return !0;
      const S = V - p * M, y = A - P * M - (S < 0 ? 1 : 0);
      return (y === 23 || y === -1) && (S === 59 || S === -1) && D < 61;
    };
  }
  function d(z, H) {
    if (!(z && H))
      return;
    const oe = (/* @__PURE__ */ new Date("2020-01-01T" + z)).valueOf(), T = (/* @__PURE__ */ new Date("2020-01-01T" + H)).valueOf();
    if (oe && T)
      return oe - T;
  }
  function u(z, H) {
    if (!(z && H))
      return;
    const oe = l.exec(z), T = l.exec(H);
    if (oe && T)
      return z = oe[1] + oe[2] + oe[3], H = T[1] + T[2] + T[3], z > H ? 1 : z < H ? -1 : 0;
  }
  const h = /t|\s/i;
  function E(z) {
    const H = c(z);
    return function(T) {
      const A = T.split(h);
      return A.length === 2 && a(A[0]) && H(A[1]);
    };
  }
  function g(z, H) {
    if (!(z && H))
      return;
    const oe = new Date(z).valueOf(), T = new Date(H).valueOf();
    if (oe && T)
      return oe - T;
  }
  function w(z, H) {
    if (!(z && H))
      return;
    const [oe, T] = z.split(h), [A, V] = H.split(h), D = o(oe, A);
    if (D !== void 0)
      return D || d(T, V);
  }
  const _ = /\/|:/, $ = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(z) {
    return _.test(z) && $.test(z);
  }
  const v = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function N(z) {
    return v.lastIndex = 0, v.test(z);
  }
  const R = -2147483648, O = 2 ** 31 - 1;
  function K(z) {
    return Number.isInteger(z) && z <= O && z >= R;
  }
  function B(z) {
    return Number.isInteger(z);
  }
  function de() {
    return !0;
  }
  const he = /[^\\]\\Z/;
  function ye(z) {
    if (he.test(z))
      return !1;
    try {
      return new RegExp(z), !0;
    } catch {
      return !1;
    }
  }
})(lu);
var uu = {}, ma = { exports: {} }, du = {}, et = {}, kr = {}, _n = {}, re = {}, pn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(v) {
      if (super(), !e.IDENTIFIER.test(v))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(v) {
      super(), this._items = typeof v == "string" ? [v] : v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const v = this._items[0];
      return v === "" || v === '""';
    }
    get str() {
      var v;
      return (v = this._str) !== null && v !== void 0 ? v : this._str = this._items.reduce((N, R) => `${N}${R}`, "");
    }
    get names() {
      var v;
      return (v = this._names) !== null && v !== void 0 ? v : this._names = this._items.reduce((N, R) => (R instanceof r && (N[R.str] = (N[R.str] || 0) + 1), N), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...v) {
    const N = [m[0]];
    let R = 0;
    for (; R < v.length; )
      l(N, v[R]), N.push(m[++R]);
    return new n(N);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...v) {
    const N = [g(m[0])];
    let R = 0;
    for (; R < v.length; )
      N.push(a), l(N, v[R]), N.push(a, g(m[++R]));
    return c(N), new n(N);
  }
  e.str = o;
  function l(m, v) {
    v instanceof n ? m.push(...v._items) : v instanceof r ? m.push(v) : m.push(h(v));
  }
  e.addCodeArg = l;
  function c(m) {
    let v = 1;
    for (; v < m.length - 1; ) {
      if (m[v] === a) {
        const N = d(m[v - 1], m[v + 1]);
        if (N !== void 0) {
          m.splice(v - 1, 3, N);
          continue;
        }
        m[v++] = "+";
      }
      v++;
    }
  }
  function d(m, v) {
    if (v === '""')
      return m;
    if (m === '""')
      return v;
    if (typeof m == "string")
      return v instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof v != "string" ? `${m.slice(0, -1)}${v}"` : v[0] === '"' ? m.slice(0, -1) + v.slice(1) : void 0;
    if (typeof v == "string" && v[0] === '"' && !(m instanceof r))
      return `"${m}${v.slice(1)}`;
  }
  function u(m, v) {
    return v.emptyStr() ? m : m.emptyStr() ? v : o`${m}${v}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : g(Array.isArray(m) ? m.join(",") : m);
  }
  function E(m) {
    return new n(g(m));
  }
  e.stringify = E;
  function g(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = g;
  function w(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = w;
  function _(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = _;
  function $(m) {
    return new n(m.toString());
  }
  e.regexpCode = $;
})(pn);
var pa = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = pn;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(c) {
    c[c.Started = 0] = "Started", c[c.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: u } = {}) {
      this._names = {}, this._prefixes = d, this._parent = u;
    }
    toName(d) {
      return d instanceof t.Name ? d : this.name(d);
    }
    name(d) {
      return new t.Name(this._newName(d));
    }
    _newName(d) {
      const u = this._names[d] || this._nameGroup(d);
      return `${d}${u.index++}`;
    }
    _nameGroup(d) {
      var u, h;
      if (!((h = (u = this._parent) === null || u === void 0 ? void 0 : u._prefixes) === null || h === void 0) && h.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  e.Scope = s;
  class a extends t.Name {
    constructor(d, u) {
      super(u), this.prefix = d;
    }
    setValue(d, { property: u, itemIndex: h }) {
      this.value = d, this.scopePath = (0, t._)`.${new t.Name(u)}[${h}]`;
    }
  }
  e.ValueScopeName = a;
  const o = (0, t._)`\n`;
  class l extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? o : t.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new a(d, this._newName(d));
    }
    value(d, u) {
      var h;
      if (u.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const E = this.toName(d), { prefix: g } = E, w = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let _ = this._values[g];
      if (_) {
        const v = _.get(w);
        if (v)
          return v;
      } else
        _ = this._values[g] = /* @__PURE__ */ new Map();
      _.set(w, E);
      const $ = this._scope[g] || (this._scope[g] = []), m = $.length;
      return $[m] = u.ref, E.setValue(u, { property: g, itemIndex: m }), E;
    }
    getValue(d, u) {
      const h = this._values[d];
      if (h)
        return h.get(u);
    }
    scopeRefs(d, u = this._values) {
      return this._reduceValues(u, (h) => {
        if (h.scopePath === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return (0, t._)`${d}${h.scopePath}`;
      });
    }
    scopeCode(d = this._values, u, h) {
      return this._reduceValues(d, (E) => {
        if (E.value === void 0)
          throw new Error(`CodeGen: name "${E}" has no value`);
        return E.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, E) {
      let g = t.nil;
      for (const w in d) {
        const _ = d[w];
        if (!_)
          continue;
        const $ = h[w] = h[w] || /* @__PURE__ */ new Map();
        _.forEach((m) => {
          if ($.has(m))
            return;
          $.set(m, n.Started);
          let v = u(m);
          if (v) {
            const N = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            g = (0, t._)`${g}${N} ${m} = ${v};${this.opts._n}`;
          } else if (v = E == null ? void 0 : E(m))
            g = (0, t._)`${g}${v}${this.opts._n}`;
          else
            throw new r(m);
          $.set(m, n.Completed);
        });
      }
      return g;
    }
  }
  e.ValueScope = l;
})(pa);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = pn, r = pa;
  var n = pn;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = pa;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(i, f) {
      return this;
    }
  }
  class o extends a {
    constructor(i, f, b) {
      super(), this.varKind = i, this.name = f, this.rhs = b;
    }
    render({ es5: i, _n: f }) {
      const b = i ? r.varKinds.var : this.varKind, I = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${b} ${this.name}${I};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = T(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class l extends a {
    constructor(i, f, b) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = b;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = T(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return oe(i, this.rhs);
    }
  }
  class c extends l {
    constructor(i, f, b, I) {
      super(i, b, I), this.op = f;
    }
    render({ _n: i }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + i;
    }
  }
  class d extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `${this.label}:` + i;
    }
  }
  class u extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `break${this.label ? ` ${this.label}` : ""};` + i;
    }
  }
  class h extends a {
    constructor(i) {
      super(), this.error = i;
    }
    render({ _n: i }) {
      return `throw ${this.error};` + i;
    }
    get names() {
      return this.error.names;
    }
  }
  class E extends a {
    constructor(i) {
      super(), this.code = i;
    }
    render({ _n: i }) {
      return `${this.code};` + i;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(i, f) {
      return this.code = T(this.code, i, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class g extends a {
    constructor(i = []) {
      super(), this.nodes = i;
    }
    render(i) {
      return this.nodes.reduce((f, b) => f + b.render(i), "");
    }
    optimizeNodes() {
      const { nodes: i } = this;
      let f = i.length;
      for (; f--; ) {
        const b = i[f].optimizeNodes();
        Array.isArray(b) ? i.splice(f, 1, ...b) : b ? i[f] = b : i.splice(f, 1);
      }
      return i.length > 0 ? this : void 0;
    }
    optimizeNames(i, f) {
      const { nodes: b } = this;
      let I = b.length;
      for (; I--; ) {
        const j = b[I];
        j.optimizeNames(i, f) || (A(i, j.names), b.splice(I, 1));
      }
      return b.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => H(i, f.names), {});
    }
  }
  class w extends g {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class _ extends g {
  }
  class $ extends w {
  }
  $.kind = "else";
  class m extends w {
    constructor(i, f) {
      super(f), this.condition = i;
    }
    render(i) {
      let f = `if(${this.condition})` + super.render(i);
      return this.else && (f += "else " + this.else.render(i)), f;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const i = this.condition;
      if (i === !0)
        return this.nodes;
      let f = this.else;
      if (f) {
        const b = f.optimizeNodes();
        f = this.else = Array.isArray(b) ? new $(b) : b;
      }
      if (f)
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(V(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var b;
      if (this.else = (b = this.else) === null || b === void 0 ? void 0 : b.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = T(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return oe(i, this.condition), this.else && H(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class v extends w {
  }
  v.kind = "for";
  class N extends v {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = T(this.iteration, i, f), this;
    }
    get names() {
      return H(super.names, this.iteration.names);
    }
  }
  class R extends v {
    constructor(i, f, b, I) {
      super(), this.varKind = i, this.name = f, this.from = b, this.to = I;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: b, from: I, to: j } = this;
      return `for(${f} ${b}=${I}; ${b}<${j}; ${b}++)` + super.render(i);
    }
    get names() {
      const i = oe(super.names, this.from);
      return oe(i, this.to);
    }
  }
  class O extends v {
    constructor(i, f, b, I) {
      super(), this.loop = i, this.varKind = f, this.name = b, this.iterable = I;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = T(this.iterable, i, f), this;
    }
    get names() {
      return H(super.names, this.iterable.names);
    }
  }
  class K extends w {
    constructor(i, f, b) {
      super(), this.name = i, this.args = f, this.async = b;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  K.kind = "func";
  class B extends g {
    render(i) {
      return "return " + super.render(i);
    }
  }
  B.kind = "return";
  class de extends w {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var b, I;
      return super.optimizeNames(i, f), (b = this.catch) === null || b === void 0 || b.optimizeNames(i, f), (I = this.finally) === null || I === void 0 || I.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && H(i, this.catch.names), this.finally && H(i, this.finally.names), i;
    }
  }
  class he extends w {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  he.kind = "catch";
  class ye extends w {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  ye.kind = "finally";
  class z {
    constructor(i, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = i, this._scope = new r.Scope({ parent: i }), this._nodes = [new _()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(i) {
      return this._scope.name(i);
    }
    // reserves unique name in the external scope
    scopeName(i) {
      return this._extScope.name(i);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(i, f) {
      const b = this._extScope.value(i, f);
      return (this._values[b.prefix] || (this._values[b.prefix] = /* @__PURE__ */ new Set())).add(b), b;
    }
    getScopeValue(i, f) {
      return this._extScope.getValue(i, f);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(i) {
      return this._extScope.scopeRefs(i, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(i, f, b, I) {
      const j = this._scope.toName(f);
      return b !== void 0 && I && (this._constants[j.str] = b), this._leafNode(new o(i, j, b)), j;
    }
    // `const` declaration (`var` in es5 mode)
    const(i, f, b) {
      return this._def(r.varKinds.const, i, f, b);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(i, f, b) {
      return this._def(r.varKinds.let, i, f, b);
    }
    // `var` declaration with optional assignment
    var(i, f, b) {
      return this._def(r.varKinds.var, i, f, b);
    }
    // assignment code
    assign(i, f, b) {
      return this._leafNode(new l(i, f, b));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new c(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new E(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [b, I] of i)
        f.length > 1 && f.push(","), f.push(b), (b !== I || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, I));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(i, f, b) {
      if (this._blockNode(new m(i)), f && b)
        this.code(f).else().code(b).endIf();
      else if (f)
        this.code(f).endIf();
      else if (b)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(i) {
      return this._elseNode(new m(i));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new $());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, $);
    }
    _for(i, f) {
      return this._blockNode(i), f && this.code(f).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(i, f) {
      return this._for(new N(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, b, I, j = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const F = this._scope.toName(i);
      return this._for(new R(j, F, f, b), () => I(F));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, b, I = r.varKinds.const) {
      const j = this._scope.toName(i);
      if (this.opts.es5) {
        const F = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${F}.length`, (L) => {
          this.var(j, (0, t._)`${F}[${L}]`), b(j);
        });
      }
      return this._for(new O("of", I, j, f), () => b(j));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, b, I = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, b);
      const j = this._scope.toName(i);
      return this._for(new O("in", I, j, f), () => b(j));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(v);
    }
    // `label` statement
    label(i) {
      return this._leafNode(new d(i));
    }
    // `break` statement
    break(i) {
      return this._leafNode(new u(i));
    }
    // `return` statement
    return(i) {
      const f = new B();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(B);
    }
    // `try` statement
    try(i, f, b) {
      if (!f && !b)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const I = new de();
      if (this._blockNode(I), this.code(i), f) {
        const j = this.name("e");
        this._currNode = I.catch = new he(j), f(j);
      }
      return b && (this._currNode = I.finally = new ye(), this.code(b)), this._endBlockNode(he, ye);
    }
    // `throw` statement
    throw(i) {
      return this._leafNode(new h(i));
    }
    // start self-balancing block
    block(i, f) {
      return this._blockStarts.push(this._nodes.length), i && this.code(i).endBlock(f), this;
    }
    // end the current self-balancing block
    endBlock(i) {
      const f = this._blockStarts.pop();
      if (f === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const b = this._nodes.length - f;
      if (b < 0 || i !== void 0 && b !== i)
        throw new Error(`CodeGen: wrong number of nodes: ${b} vs ${i} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(i, f = t.nil, b, I) {
      return this._blockNode(new K(i, f, b)), I && this.code(I).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(K);
    }
    optimize(i = 1) {
      for (; i-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(i) {
      return this._currNode.nodes.push(i), this;
    }
    _blockNode(i) {
      this._currNode.nodes.push(i), this._nodes.push(i);
    }
    _endBlockNode(i, f) {
      const b = this._currNode;
      if (b instanceof i || f && b instanceof f)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${f ? `${i.kind}/${f.kind}` : i.kind}"`);
    }
    _elseNode(i) {
      const f = this._currNode;
      if (!(f instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = f.else = i, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const i = this._nodes;
      return i[i.length - 1];
    }
    set _currNode(i) {
      const f = this._nodes;
      f[f.length - 1] = i;
    }
  }
  e.CodeGen = z;
  function H(y, i) {
    for (const f in i)
      y[f] = (y[f] || 0) + (i[f] || 0);
    return y;
  }
  function oe(y, i) {
    return i instanceof t._CodeOrName ? H(y, i.names) : y;
  }
  function T(y, i, f) {
    if (y instanceof t.Name)
      return b(y);
    if (!I(y))
      return y;
    return new t._Code(y._items.reduce((j, F) => (F instanceof t.Name && (F = b(F)), F instanceof t._Code ? j.push(...F._items) : j.push(F), j), []));
    function b(j) {
      const F = f[j.str];
      return F === void 0 || i[j.str] !== 1 ? j : (delete i[j.str], F);
    }
    function I(j) {
      return j instanceof t._Code && j._items.some((F) => F instanceof t.Name && i[F.str] === 1 && f[F.str] !== void 0);
    }
  }
  function A(y, i) {
    for (const f in i)
      y[f] = (y[f] || 0) - (i[f] || 0);
  }
  function V(y) {
    return typeof y == "boolean" || typeof y == "number" || y === null ? !y : (0, t._)`!${S(y)}`;
  }
  e.not = V;
  const D = p(e.operators.AND);
  function G(...y) {
    return y.reduce(D);
  }
  e.and = G;
  const M = p(e.operators.OR);
  function P(...y) {
    return y.reduce(M);
  }
  e.or = P;
  function p(y) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${y} ${S(f)}`;
  }
  function S(y) {
    return y instanceof t.Name ? y : (0, t._)`(${y})`;
  }
})(re);
var C = {};
Object.defineProperty(C, "__esModule", { value: !0 });
C.checkStrictMode = C.getErrorPath = C.Type = C.useFunc = C.setEvaluated = C.evaluatedPropsToName = C.mergeEvaluated = C.eachItem = C.unescapeJsonPointer = C.escapeJsonPointer = C.escapeFragment = C.unescapeFragment = C.schemaRefOrVal = C.schemaHasRulesButRef = C.schemaHasRules = C.checkUnknownRules = C.alwaysValidSchema = C.toHash = void 0;
const ce = re, M0 = pn;
function V0(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
C.toHash = V0;
function L0(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (fu(e, t), !hu(t, e.self.RULES.all));
}
C.alwaysValidSchema = L0;
function fu(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || yu(e, `unknown keyword: "${a}"`);
}
C.checkUnknownRules = fu;
function hu(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
C.schemaHasRules = hu;
function F0(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
C.schemaHasRulesButRef = F0;
function z0({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ce._)`${r}`;
  }
  return (0, ce._)`${e}${t}${(0, ce.getProperty)(n)}`;
}
C.schemaRefOrVal = z0;
function U0(e) {
  return mu(decodeURIComponent(e));
}
C.unescapeFragment = U0;
function q0(e) {
  return encodeURIComponent(Io(e));
}
C.escapeFragment = q0;
function Io(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
C.escapeJsonPointer = Io;
function mu(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
C.unescapeJsonPointer = mu;
function K0(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
C.eachItem = K0;
function cc({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, l) => {
    const c = o === void 0 ? a : o instanceof ce.Name ? (a instanceof ce.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof ce.Name ? (t(s, o, a), a) : r(a, o);
    return l === ce.Name && !(c instanceof ce.Name) ? n(s, c) : c;
  };
}
C.mergeEvaluated = {
  props: cc({
    mergeNames: (e, t, r) => e.if((0, ce._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, ce._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, ce._)`${r} || {}`).code((0, ce._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, ce._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ce._)`${r} || {}`), To(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: pu
  }),
  items: cc({
    mergeNames: (e, t, r) => e.if((0, ce._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ce._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ce._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ce._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function pu(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ce._)`{}`);
  return t !== void 0 && To(e, r, t), r;
}
C.evaluatedPropsToName = pu;
function To(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ce._)`${t}${(0, ce.getProperty)(n)}`, !0));
}
C.setEvaluated = To;
const lc = {};
function G0(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: lc[t.code] || (lc[t.code] = new M0._Code(t.code))
  });
}
C.useFunc = G0;
var ya;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(ya || (C.Type = ya = {}));
function H0(e, t, r) {
  if (e instanceof ce.Name) {
    const n = t === ya.Num;
    return r ? n ? (0, ce._)`"[" + ${e} + "]"` : (0, ce._)`"['" + ${e} + "']"` : n ? (0, ce._)`"/" + ${e}` : (0, ce._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ce.getProperty)(e).toString() : "/" + Io(e);
}
C.getErrorPath = H0;
function yu(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
C.checkStrictMode = yu;
var dt = {};
Object.defineProperty(dt, "__esModule", { value: !0 });
const Re = re, X0 = {
  // validation function arguments
  data: new Re.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Re.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Re.Name("instancePath"),
  parentData: new Re.Name("parentData"),
  parentDataProperty: new Re.Name("parentDataProperty"),
  rootData: new Re.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Re.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Re.Name("vErrors"),
  // null or array of validation errors
  errors: new Re.Name("errors"),
  // counter of validation errors
  this: new Re.Name("this"),
  // "globals"
  self: new Re.Name("self"),
  scope: new Re.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Re.Name("json"),
  jsonPos: new Re.Name("jsonPos"),
  jsonLen: new Re.Name("jsonLen"),
  jsonPart: new Re.Name("jsonPart")
};
dt.default = X0;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = re, r = C, n = dt;
  e.keywordError = {
    message: ({ keyword: $ }) => (0, t.str)`must pass "${$}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: $, schemaType: m }) => m ? (0, t.str)`"${$}" keyword must be ${m} ($data)` : (0, t.str)`"${$}" keyword is invalid ($data)`
  };
  function s($, m = e.keywordError, v, N) {
    const { it: R } = $, { gen: O, compositeRule: K, allErrors: B } = R, de = h($, m, v);
    N ?? (K || B) ? c(O, de) : d(R, (0, t._)`[${de}]`);
  }
  e.reportError = s;
  function a($, m = e.keywordError, v) {
    const { it: N } = $, { gen: R, compositeRule: O, allErrors: K } = N, B = h($, m, v);
    c(R, B), O || K || d(N, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o($, m) {
    $.assign(n.default.errors, m), $.if((0, t._)`${n.default.vErrors} !== null`, () => $.if(m, () => $.assign((0, t._)`${n.default.vErrors}.length`, m), () => $.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function l({ gen: $, keyword: m, schemaValue: v, data: N, errsCount: R, it: O }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const K = $.name("err");
    $.forRange("i", R, n.default.errors, (B) => {
      $.const(K, (0, t._)`${n.default.vErrors}[${B}]`), $.if((0, t._)`${K}.instancePath === undefined`, () => $.assign((0, t._)`${K}.instancePath`, (0, t.strConcat)(n.default.instancePath, O.errorPath))), $.assign((0, t._)`${K}.schemaPath`, (0, t.str)`${O.errSchemaPath}/${m}`), O.opts.verbose && ($.assign((0, t._)`${K}.schema`, v), $.assign((0, t._)`${K}.data`, N));
    });
  }
  e.extendErrors = l;
  function c($, m) {
    const v = $.const("err", m);
    $.if((0, t._)`${n.default.vErrors} === null`, () => $.assign(n.default.vErrors, (0, t._)`[${v}]`), (0, t._)`${n.default.vErrors}.push(${v})`), $.code((0, t._)`${n.default.errors}++`);
  }
  function d($, m) {
    const { gen: v, validateName: N, schemaEnv: R } = $;
    R.$async ? v.throw((0, t._)`new ${$.ValidationError}(${m})`) : (v.assign((0, t._)`${N}.errors`, m), v.return(!1));
  }
  const u = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function h($, m, v) {
    const { createErrors: N } = $.it;
    return N === !1 ? (0, t._)`{}` : E($, m, v);
  }
  function E($, m, v = {}) {
    const { gen: N, it: R } = $, O = [
      g(R, v),
      w($, v)
    ];
    return _($, m, O), N.object(...O);
  }
  function g({ errorPath: $ }, { instancePath: m }) {
    const v = m ? (0, t.str)`${$}${(0, r.getErrorPath)(m, r.Type.Str)}` : $;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, v)];
  }
  function w({ keyword: $, it: { errSchemaPath: m } }, { schemaPath: v, parentSchema: N }) {
    let R = N ? m : (0, t.str)`${m}/${$}`;
    return v && (R = (0, t.str)`${R}${(0, r.getErrorPath)(v, r.Type.Str)}`), [u.schemaPath, R];
  }
  function _($, { params: m, message: v }, N) {
    const { keyword: R, data: O, schemaValue: K, it: B } = $, { opts: de, propertyName: he, topSchemaRef: ye, schemaPath: z } = B;
    N.push([u.keyword, R], [u.params, typeof m == "function" ? m($) : m || (0, t._)`{}`]), de.messages && N.push([u.message, typeof v == "function" ? v($) : v]), de.verbose && N.push([u.schema, K], [u.parentSchema, (0, t._)`${ye}${z}`], [n.default.data, O]), he && N.push([u.propertyName, he]);
  }
})(_n);
Object.defineProperty(kr, "__esModule", { value: !0 });
kr.boolOrEmptySchema = kr.topBoolOrEmptySchema = void 0;
const J0 = _n, W0 = re, B0 = dt, Y0 = {
  message: "boolean schema is false"
};
function Q0(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? $u(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(B0.default.data) : (t.assign((0, W0._)`${n}.errors`, null), t.return(!0));
}
kr.topBoolOrEmptySchema = Q0;
function Z0(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), $u(e)) : r.var(t, !0);
}
kr.boolOrEmptySchema = Z0;
function $u(e, t) {
  const { gen: r, data: n } = e, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, J0.reportError)(s, Y0, void 0, t);
}
var ge = {}, hr = {};
Object.defineProperty(hr, "__esModule", { value: !0 });
hr.getRules = hr.isJSONType = void 0;
const x0 = ["string", "number", "integer", "boolean", "null", "object", "array"], eg = new Set(x0);
function tg(e) {
  return typeof e == "string" && eg.has(e);
}
hr.isJSONType = tg;
function rg() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
hr.getRules = rg;
var gt = {};
Object.defineProperty(gt, "__esModule", { value: !0 });
gt.shouldUseRule = gt.shouldUseGroup = gt.schemaHasRulesForType = void 0;
function ng({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && gu(e, n);
}
gt.schemaHasRulesForType = ng;
function gu(e, t) {
  return t.rules.some((r) => _u(e, r));
}
gt.shouldUseGroup = gu;
function _u(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
gt.shouldUseRule = _u;
Object.defineProperty(ge, "__esModule", { value: !0 });
ge.reportTypeError = ge.checkDataTypes = ge.checkDataType = ge.coerceAndCheckDataType = ge.getJSONTypes = ge.getSchemaTypes = ge.DataType = void 0;
const sg = hr, ag = gt, og = _n, te = re, vu = C;
var Or;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(Or || (ge.DataType = Or = {}));
function ig(e) {
  const t = wu(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
ge.getSchemaTypes = ig;
function wu(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(sg.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
ge.getJSONTypes = wu;
function cg(e, t) {
  const { gen: r, data: n, opts: s } = e, a = lg(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, ag.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = jo(t, n, s.strictNumbers, Or.Wrong);
    r.if(l, () => {
      a.length ? ug(e, t, a) : Ao(e);
    });
  }
  return o;
}
ge.coerceAndCheckDataType = cg;
const Eu = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function lg(e, t) {
  return t ? e.filter((r) => Eu.has(r) || t === "array" && r === "array") : [];
}
function ug(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, te._)`typeof ${s}`), l = n.let("coerced", (0, te._)`undefined`);
  a.coerceTypes === "array" && n.if((0, te._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, te._)`${s}[0]`).assign(o, (0, te._)`typeof ${s}`).if(jo(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, te._)`${l} !== undefined`);
  for (const d of r)
    (Eu.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), Ao(e), n.endIf(), n.if((0, te._)`${l} !== undefined`, () => {
    n.assign(s, l), dg(e, l);
  });
  function c(d) {
    switch (d) {
      case "string":
        n.elseIf((0, te._)`${o} == "number" || ${o} == "boolean"`).assign(l, (0, te._)`"" + ${s}`).elseIf((0, te._)`${s} === null`).assign(l, (0, te._)`""`);
        return;
      case "number":
        n.elseIf((0, te._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(l, (0, te._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, te._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(l, (0, te._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, te._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(l, !1).elseIf((0, te._)`${s} === "true" || ${s} === 1`).assign(l, !0);
        return;
      case "null":
        n.elseIf((0, te._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(l, null);
        return;
      case "array":
        n.elseIf((0, te._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(l, (0, te._)`[${s}]`);
    }
  }
}
function dg({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, te._)`${t} !== undefined`, () => e.assign((0, te._)`${t}[${r}]`, n));
}
function $a(e, t, r, n = Or.Correct) {
  const s = n === Or.Correct ? te.operators.EQ : te.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, te._)`${t} ${s} null`;
    case "array":
      a = (0, te._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, te._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, te._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, te._)`typeof ${t} ${s} ${e}`;
  }
  return n === Or.Correct ? a : (0, te.not)(a);
  function o(l = te.nil) {
    return (0, te.and)((0, te._)`typeof ${t} == "number"`, l, r ? (0, te._)`isFinite(${t})` : te.nil);
  }
}
ge.checkDataType = $a;
function jo(e, t, r, n) {
  if (e.length === 1)
    return $a(e[0], t, r, n);
  let s;
  const a = (0, vu.toHash)(e);
  if (a.array && a.object) {
    const o = (0, te._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, te._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = te.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, te.and)(s, $a(o, t, r, n));
  return s;
}
ge.checkDataTypes = jo;
const fg = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, te._)`{type: ${e}}` : (0, te._)`{type: ${t}}`
};
function Ao(e) {
  const t = hg(e);
  (0, og.reportError)(t, fg);
}
ge.reportTypeError = Ao;
function hg(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, vu.schemaRefOrVal)(e, n, "type");
  return {
    gen: t,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: e
  };
}
var Es = {};
Object.defineProperty(Es, "__esModule", { value: !0 });
Es.assignDefaults = void 0;
const $r = re, mg = C;
function pg(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      uc(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => uc(e, a, s.default));
}
Es.assignDefaults = pg;
function uc(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, $r._)`${a}${(0, $r.getProperty)(t)}`;
  if (s) {
    (0, mg.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let c = (0, $r._)`${l} === undefined`;
  o.useDefaults === "empty" && (c = (0, $r._)`${c} || ${l} === null || ${l} === ""`), n.if(c, (0, $r._)`${l} = ${(0, $r.stringify)(r)}`);
}
var ut = {}, se = {};
Object.defineProperty(se, "__esModule", { value: !0 });
se.validateUnion = se.validateArray = se.usePattern = se.callValidateCode = se.schemaProperties = se.allSchemaProperties = se.noPropertyInData = se.propertyInData = se.isOwnProperty = se.hasPropFunc = se.reportMissingProp = se.checkMissingProp = se.checkReportMissingProp = void 0;
const ue = re, ko = C, Rt = dt, yg = C;
function $g(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(Do(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ue._)`${t}` }, !0), e.error();
  });
}
se.checkReportMissingProp = $g;
function gg({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ue.or)(...n.map((a) => (0, ue.and)(Do(e, t, a, r.ownProperties), (0, ue._)`${s} = ${a}`)));
}
se.checkMissingProp = gg;
function _g(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
se.reportMissingProp = _g;
function bu(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ue._)`Object.prototype.hasOwnProperty`
  });
}
se.hasPropFunc = bu;
function Co(e, t, r) {
  return (0, ue._)`${bu(e)}.call(${t}, ${r})`;
}
se.isOwnProperty = Co;
function vg(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} !== undefined`;
  return n ? (0, ue._)`${s} && ${Co(e, t, r)}` : s;
}
se.propertyInData = vg;
function Do(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} === undefined`;
  return n ? (0, ue.or)(s, (0, ue.not)(Co(e, t, r))) : s;
}
se.noPropertyInData = Do;
function Su(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
se.allSchemaProperties = Su;
function wg(e, t) {
  return Su(t).filter((r) => !(0, ko.alwaysValidSchema)(e, t[r]));
}
se.schemaProperties = wg;
function Eg({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, c, d) {
  const u = d ? (0, ue._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Rt.default.instancePath, (0, ue.strConcat)(Rt.default.instancePath, a)],
    [Rt.default.parentData, o.parentData],
    [Rt.default.parentDataProperty, o.parentDataProperty],
    [Rt.default.rootData, Rt.default.rootData]
  ];
  o.opts.dynamicRef && h.push([Rt.default.dynamicAnchors, Rt.default.dynamicAnchors]);
  const E = (0, ue._)`${u}, ${r.object(...h)}`;
  return c !== ue.nil ? (0, ue._)`${l}.call(${c}, ${E})` : (0, ue._)`${l}(${E})`;
}
se.callValidateCode = Eg;
const bg = (0, ue._)`new RegExp`;
function Sg({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ue._)`${s.code === "new RegExp" ? bg : (0, yg.useFunc)(e, s)}(${r}, ${n})`
  });
}
se.usePattern = Sg;
function Pg(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const l = t.let("valid", !0);
    return o(() => t.assign(l, !1)), l;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(l) {
    const c = t.const("len", (0, ue._)`${r}.length`);
    t.forRange("i", 0, c, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: ko.Type.Num
      }, a), t.if((0, ue.not)(a), l);
    });
  }
}
se.validateArray = Pg;
function Ng(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, ko.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), l = t.name("_valid");
  t.block(() => r.forEach((c, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, l);
    t.assign(o, (0, ue._)`${o} || ${l}`), e.mergeValidEvaluated(u, l) || t.if((0, ue.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
se.validateUnion = Ng;
Object.defineProperty(ut, "__esModule", { value: !0 });
ut.validateKeywordUsage = ut.validSchemaType = ut.funcKeywordCode = ut.macroKeywordCode = void 0;
const je = re, ar = dt, Rg = se, Og = _n;
function Ig(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), c = Pu(r, n, l);
  o.opts.validateSchema !== !1 && o.self.validateSchema(l, !0);
  const d = r.name("valid");
  e.subschema({
    schema: l,
    schemaPath: je.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: c,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
ut.macroKeywordCode = Ig;
function Tg(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: c } = e;
  Ag(c, t);
  const d = !l && t.compile ? t.compile.call(c.self, a, o, c) : t.validate, u = Pu(n, s, d), h = n.let("valid");
  e.block$data(h, E), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function E() {
    if (t.errors === !1)
      _(), t.modifying && dc(e), $(() => e.error());
    else {
      const m = t.async ? g() : w();
      t.modifying && dc(e), $(() => jg(e, m));
    }
  }
  function g() {
    const m = n.let("ruleErrs", null);
    return n.try(() => _((0, je._)`await `), (v) => n.assign(h, !1).if((0, je._)`${v} instanceof ${c.ValidationError}`, () => n.assign(m, (0, je._)`${v}.errors`), () => n.throw(v))), m;
  }
  function w() {
    const m = (0, je._)`${u}.errors`;
    return n.assign(m, null), _(je.nil), m;
  }
  function _(m = t.async ? (0, je._)`await ` : je.nil) {
    const v = c.opts.passContext ? ar.default.this : ar.default.self, N = !("compile" in t && !l || t.schema === !1);
    n.assign(h, (0, je._)`${m}${(0, Rg.callValidateCode)(e, u, v, N)}`, t.modifying);
  }
  function $(m) {
    var v;
    n.if((0, je.not)((v = t.valid) !== null && v !== void 0 ? v : h), m);
  }
}
ut.funcKeywordCode = Tg;
function dc(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, je._)`${n.parentData}[${n.parentDataProperty}]`));
}
function jg(e, t) {
  const { gen: r } = e;
  r.if((0, je._)`Array.isArray(${t})`, () => {
    r.assign(ar.default.vErrors, (0, je._)`${ar.default.vErrors} === null ? ${t} : ${ar.default.vErrors}.concat(${t})`).assign(ar.default.errors, (0, je._)`${ar.default.vErrors}.length`), (0, Og.extendErrors)(e);
  }, () => e.error());
}
function Ag({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function Pu(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, je.stringify)(r) });
}
function kg(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
ut.validSchemaType = kg;
function Cg({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((l) => !Object.prototype.hasOwnProperty.call(e, l)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const c = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(c);
    else
      throw new Error(c);
  }
}
ut.validateKeywordUsage = Cg;
var Lt = {};
Object.defineProperty(Lt, "__esModule", { value: !0 });
Lt.extendSubschemaMode = Lt.extendSubschemaData = Lt.getSubschema = void 0;
const it = re, Nu = C;
function Dg(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const l = e.schema[t];
    return r === void 0 ? {
      schema: l,
      schemaPath: (0, it._)`${e.schemaPath}${(0, it.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: l[r],
      schemaPath: (0, it._)`${e.schemaPath}${(0, it.getProperty)(t)}${(0, it.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, Nu.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
Lt.getSubschema = Dg;
function Mg(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, E = l.let("data", (0, it._)`${t.data}${(0, it.getProperty)(r)}`, !0);
    c(E), e.errorPath = (0, it.str)`${d}${(0, Nu.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, it._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof it.Name ? s : l.let("data", s, !0);
    c(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function c(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
Lt.extendSubschemaData = Mg;
function Vg(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Lt.extendSubschemaMode = Vg;
var be = {}, Ru = { exports: {} }, Dt = Ru.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Qn(t, n, s, e, "", e);
};
Dt.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
Dt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Dt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Dt.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function Qn(e, t, r, n, s, a, o, l, c, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, l, c, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in Dt.arrayKeywords)
          for (var E = 0; E < h.length; E++)
            Qn(e, t, r, h[E], s + "/" + u + "/" + E, a, s, u, n, E);
      } else if (u in Dt.propsKeywords) {
        if (h && typeof h == "object")
          for (var g in h)
            Qn(e, t, r, h[g], s + "/" + u + "/" + Lg(g), a, s, u, n, g);
      } else (u in Dt.keywords || e.allKeys && !(u in Dt.skipKeywords)) && Qn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, l, c, d);
  }
}
function Lg(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Fg = Ru.exports;
Object.defineProperty(be, "__esModule", { value: !0 });
be.getSchemaRefs = be.resolveUrl = be.normalizeId = be._getFullPath = be.getFullPath = be.inlineRef = void 0;
const zg = C, Ug = ps, qg = Fg, Kg = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function Gg(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !ga(e) : t ? Ou(e) <= t : !1;
}
be.inlineRef = Gg;
const Hg = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function ga(e) {
  for (const t in e) {
    if (Hg.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(ga) || typeof r == "object" && ga(r))
      return !0;
  }
  return !1;
}
function Ou(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !Kg.has(r) && (typeof e[r] == "object" && (0, zg.eachItem)(e[r], (n) => t += Ou(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function Iu(e, t = "", r) {
  r !== !1 && (t = Ir(t));
  const n = e.parse(t);
  return Tu(e, n);
}
be.getFullPath = Iu;
function Tu(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
be._getFullPath = Tu;
const Xg = /#\/?$/;
function Ir(e) {
  return e ? e.replace(Xg, "") : "";
}
be.normalizeId = Ir;
function Jg(e, t, r) {
  return r = Ir(r), e.resolve(t, r);
}
be.resolveUrl = Jg;
const Wg = /^[a-z_][-a-z0-9._]*$/i;
function Bg(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = Ir(e[r] || t), a = { "": s }, o = Iu(n, s, !1), l = {}, c = /* @__PURE__ */ new Set();
  return qg(e, { allKeys: !0 }, (h, E, g, w) => {
    if (w === void 0)
      return;
    const _ = o + E;
    let $ = a[w];
    typeof h[r] == "string" && ($ = m.call(this, h[r])), v.call(this, h.$anchor), v.call(this, h.$dynamicAnchor), a[E] = $;
    function m(N) {
      const R = this.opts.uriResolver.resolve;
      if (N = Ir($ ? R($, N) : N), c.has(N))
        throw u(N);
      c.add(N);
      let O = this.refs[N];
      return typeof O == "string" && (O = this.refs[O]), typeof O == "object" ? d(h, O.schema, N) : N !== Ir(_) && (N[0] === "#" ? (d(h, l[N], N), l[N] = h) : this.refs[N] = _), N;
    }
    function v(N) {
      if (typeof N == "string") {
        if (!Wg.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), l;
  function d(h, E, g) {
    if (E !== void 0 && !Ug(h, E))
      throw u(g);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
be.getSchemaRefs = Bg;
Object.defineProperty(et, "__esModule", { value: !0 });
et.getData = et.KeywordCxt = et.validateFunctionCode = void 0;
const ju = kr, fc = ge, Mo = gt, is = ge, Yg = Es, ln = ut, Ks = Lt, q = re, J = dt, Qg = be, _t = C, Yr = _n;
function Zg(e) {
  if (Cu(e) && (Du(e), ku(e))) {
    t_(e);
    return;
  }
  Au(e, () => (0, ju.topBoolOrEmptySchema)(e));
}
et.validateFunctionCode = Zg;
function Au({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, q._)`${J.default.data}, ${J.default.valCxt}`, n.$async, () => {
    e.code((0, q._)`"use strict"; ${hc(r, s)}`), e_(e, s), e.code(a);
  }) : e.func(t, (0, q._)`${J.default.data}, ${xg(s)}`, n.$async, () => e.code(hc(r, s)).code(a));
}
function xg(e) {
  return (0, q._)`{${J.default.instancePath}="", ${J.default.parentData}, ${J.default.parentDataProperty}, ${J.default.rootData}=${J.default.data}${e.dynamicRef ? (0, q._)`, ${J.default.dynamicAnchors}={}` : q.nil}}={}`;
}
function e_(e, t) {
  e.if(J.default.valCxt, () => {
    e.var(J.default.instancePath, (0, q._)`${J.default.valCxt}.${J.default.instancePath}`), e.var(J.default.parentData, (0, q._)`${J.default.valCxt}.${J.default.parentData}`), e.var(J.default.parentDataProperty, (0, q._)`${J.default.valCxt}.${J.default.parentDataProperty}`), e.var(J.default.rootData, (0, q._)`${J.default.valCxt}.${J.default.rootData}`), t.dynamicRef && e.var(J.default.dynamicAnchors, (0, q._)`${J.default.valCxt}.${J.default.dynamicAnchors}`);
  }, () => {
    e.var(J.default.instancePath, (0, q._)`""`), e.var(J.default.parentData, (0, q._)`undefined`), e.var(J.default.parentDataProperty, (0, q._)`undefined`), e.var(J.default.rootData, J.default.data), t.dynamicRef && e.var(J.default.dynamicAnchors, (0, q._)`{}`);
  });
}
function t_(e) {
  const { schema: t, opts: r, gen: n } = e;
  Au(e, () => {
    r.$comment && t.$comment && Vu(e), o_(e), n.let(J.default.vErrors, null), n.let(J.default.errors, 0), r.unevaluated && r_(e), Mu(e), l_(e);
  });
}
function r_(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, q._)`${r}.evaluated`), t.if((0, q._)`${e.evaluated}.dynamicProps`, () => t.assign((0, q._)`${e.evaluated}.props`, (0, q._)`undefined`)), t.if((0, q._)`${e.evaluated}.dynamicItems`, () => t.assign((0, q._)`${e.evaluated}.items`, (0, q._)`undefined`));
}
function hc(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, q._)`/*# sourceURL=${r} */` : q.nil;
}
function n_(e, t) {
  if (Cu(e) && (Du(e), ku(e))) {
    s_(e, t);
    return;
  }
  (0, ju.boolOrEmptySchema)(e, t);
}
function ku({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function Cu(e) {
  return typeof e.schema != "boolean";
}
function s_(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && Vu(e), i_(e), c_(e);
  const a = n.const("_errs", J.default.errors);
  Mu(e, a), n.var(t, (0, q._)`${a} === ${J.default.errors}`);
}
function Du(e) {
  (0, _t.checkUnknownRules)(e), a_(e);
}
function Mu(e, t) {
  if (e.opts.jtd)
    return mc(e, [], !1, t);
  const r = (0, fc.getSchemaTypes)(e.schema), n = (0, fc.coerceAndCheckDataType)(e, r);
  mc(e, r, !n, t);
}
function a_(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, _t.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function o_(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, _t.checkStrictMode)(e, "default is ignored in the schema root");
}
function i_(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, Qg.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function c_(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function Vu({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, q._)`${J.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, q.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, q._)`${J.default.self}.opts.$comment(${a}, ${o}, ${l}.schema)`);
  }
}
function l_(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, q._)`${J.default.errors} === 0`, () => t.return(J.default.data), () => t.throw((0, q._)`new ${s}(${J.default.vErrors})`)) : (t.assign((0, q._)`${n}.errors`, J.default.vErrors), a.unevaluated && u_(e), t.return((0, q._)`${J.default.errors} === 0`));
}
function u_({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof q.Name && e.assign((0, q._)`${t}.props`, r), n instanceof q.Name && e.assign((0, q._)`${t}.items`, n);
}
function mc(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: l, opts: c, self: d } = e, { RULES: u } = d;
  if (a.$ref && (c.ignoreKeywordsWithRef || !(0, _t.schemaHasRulesButRef)(a, u))) {
    s.block(() => zu(e, "$ref", u.all.$ref.definition));
    return;
  }
  c.jtd || d_(e, t), s.block(() => {
    for (const E of u.rules)
      h(E);
    h(u.post);
  });
  function h(E) {
    (0, Mo.shouldUseGroup)(a, E) && (E.type ? (s.if((0, is.checkDataType)(E.type, o, c.strictNumbers)), pc(e, E), t.length === 1 && t[0] === E.type && r && (s.else(), (0, is.reportTypeError)(e)), s.endIf()) : pc(e, E), l || s.if((0, q._)`${J.default.errors} === ${n || 0}`));
  }
}
function pc(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, Yg.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, Mo.shouldUseRule)(n, a) && zu(e, a.keyword, a.definition, t.type);
  });
}
function d_(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (f_(e, t), e.opts.allowUnionTypes || h_(e, t), m_(e, e.dataTypes));
}
function f_(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      Lu(e.dataTypes, r) || Vo(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), y_(e, t);
  }
}
function h_(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Vo(e, "use allowUnionTypes to allow union type keyword");
}
function m_(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, Mo.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => p_(t, o)) && Vo(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function p_(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function Lu(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function y_(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    Lu(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Vo(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, _t.checkStrictMode)(e, t, e.opts.strictTypes);
}
class Fu {
  constructor(t, r, n) {
    if ((0, ln.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, _t.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Uu(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, ln.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", J.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, q.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, q.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, q._)`${r} !== undefined && (${(0, q.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? Yr.reportExtraError : Yr.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, Yr.reportError)(this, this.def.$dataError || Yr.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, Yr.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = q.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = q.nil, r = q.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, q.or)((0, q._)`${s} === undefined`, r)), t !== q.nil && n.assign(t, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== q.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, q.or)(o(), l());
    function o() {
      if (n.length) {
        if (!(r instanceof q.Name))
          throw new Error("ajv implementation error");
        const c = Array.isArray(n) ? n : [n];
        return (0, q._)`${(0, is.checkDataTypes)(c, r, a.opts.strictNumbers, is.DataType.Wrong)}`;
      }
      return q.nil;
    }
    function l() {
      if (s.validateSchema) {
        const c = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, q._)`!${c}(${r})`;
      }
      return q.nil;
    }
  }
  subschema(t, r) {
    const n = (0, Ks.getSubschema)(this.it, t);
    (0, Ks.extendSubschemaData)(n, this.it, t), (0, Ks.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return n_(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = _t.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = _t.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, q.Name)), !0;
  }
}
et.KeywordCxt = Fu;
function zu(e, t, r, n) {
  const s = new Fu(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, ln.funcKeywordCode)(s, r) : "macro" in r ? (0, ln.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, ln.funcKeywordCode)(s, r);
}
const $_ = /^\/(?:[^~]|~0|~1)*$/, g_ = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Uu(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return J.default.rootData;
  if (e[0] === "/") {
    if (!$_.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = J.default.rootData;
  } else {
    const d = g_.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const u = +d[1];
    if (s = d[2], s === "#") {
      if (u >= t)
        throw new Error(c("property/index", u));
      return n[t - u];
    }
    if (u > t)
      throw new Error(c("data", u));
    if (a = r[t - u], !s)
      return a;
  }
  let o = a;
  const l = s.split("/");
  for (const d of l)
    d && (a = (0, q._)`${a}${(0, q.getProperty)((0, _t.unescapeJsonPointer)(d))}`, o = (0, q._)`${o} && ${a}`);
  return o;
  function c(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
et.getData = Uu;
var vn = {};
Object.defineProperty(vn, "__esModule", { value: !0 });
class __ extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
vn.default = __;
var zr = {};
Object.defineProperty(zr, "__esModule", { value: !0 });
const Gs = be;
class v_ extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Gs.resolveUrl)(t, r, n), this.missingSchema = (0, Gs.normalizeId)((0, Gs.getFullPath)(t, this.missingRef));
  }
}
zr.default = v_;
var Le = {};
Object.defineProperty(Le, "__esModule", { value: !0 });
Le.resolveSchema = Le.getCompilingSchema = Le.resolveRef = Le.compileSchema = Le.SchemaEnv = void 0;
const We = re, w_ = vn, er = dt, Ze = be, yc = C, E_ = et;
class bs {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Ze.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Le.SchemaEnv = bs;
function Lo(e) {
  const t = qu.call(this, e);
  if (t)
    return t;
  const r = (0, Ze.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new We.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: w_.default,
    code: (0, We._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = o.scopeName("validate");
  e.validateName = c;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: er.default.data,
    parentData: er.default.parentData,
    parentDataProperty: er.default.parentDataProperty,
    dataNames: [er.default.data],
    dataPathArr: [We.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, We.stringify)(e.schema) } : { ref: e.schema }),
    validateName: c,
    ValidationError: l,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: We.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, We._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, E_.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(er.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const g = new Function(`${er.default.self}`, `${er.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(c, { ref: g }), g.errors = null, g.schema = e.schema, g.schemaEnv = e, e.$async && (g.$async = !0), this.opts.code.source === !0 && (g.source = { validateName: c, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: w, items: _ } = d;
      g.evaluated = {
        props: w instanceof We.Name ? void 0 : w,
        items: _ instanceof We.Name ? void 0 : _,
        dynamicProps: w instanceof We.Name,
        dynamicItems: _ instanceof We.Name
      }, g.source && (g.source.evaluated = (0, We.stringify)(g.evaluated));
    }
    return e.validate = g, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
Le.compileSchema = Lo;
function b_(e, t, r) {
  var n;
  r = (0, Ze.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = N_.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: l } = this.opts;
    o && (a = new bs({ schema: o, schemaId: l, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = S_.call(this, a);
}
Le.resolveRef = b_;
function S_(e) {
  return (0, Ze.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Lo.call(this, e);
}
function qu(e) {
  for (const t of this._compilations)
    if (P_(t, e))
      return t;
}
Le.getCompilingSchema = qu;
function P_(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function N_(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || Ss.call(this, e, t);
}
function Ss(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Ze._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Ze.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Hs.call(this, r, e);
  const a = (0, Ze.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const l = Ss.call(this, e, o);
    return typeof (l == null ? void 0 : l.schema) != "object" ? void 0 : Hs.call(this, r, l);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || Lo.call(this, o), a === (0, Ze.normalizeId)(t)) {
      const { schema: l } = o, { schemaId: c } = this.opts, d = l[c];
      return d && (s = (0, Ze.resolveUrl)(this.opts.uriResolver, s, d)), new bs({ schema: l, schemaId: c, root: e, baseId: s });
    }
    return Hs.call(this, r, o);
  }
}
Le.resolveSchema = Ss;
const R_ = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Hs(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const l of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const c = r[(0, yc.unescapeFragment)(l)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !R_.has(l) && d && (t = (0, Ze.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, yc.schemaHasRulesButRef)(r, this.RULES)) {
    const l = (0, Ze.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = Ss.call(this, n, l);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new bs({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const O_ = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", I_ = "Meta-schema for $data reference (JSON AnySchema extension proposal)", T_ = "object", j_ = [
  "$data"
], A_ = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, k_ = !1, C_ = {
  $id: O_,
  description: I_,
  type: T_,
  required: j_,
  properties: A_,
  additionalProperties: k_
};
var Fo = {};
Object.defineProperty(Fo, "__esModule", { value: !0 });
const Ku = Zl;
Ku.code = 'require("ajv/dist/runtime/uri").default';
Fo.default = Ku;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = et;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = re;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = vn, s = zr, a = hr, o = Le, l = re, c = be, d = ge, u = C, h = C_, E = Fo, g = (P, p) => new RegExp(P, p);
  g.code = "new RegExp";
  const w = ["removeAdditional", "useDefaults", "coerceTypes"], _ = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), $ = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, v = 200;
  function N(P) {
    var p, S, y, i, f, b, I, j, F, L, ae, Fe, Ft, zt, Ut, qt, Kt, Gt, Ht, Xt, Jt, Wt, Bt, Yt, Qt;
    const He = P.strict, Zt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Gr = Zt === !0 || Zt === void 0 ? 1 : Zt || 0, Hr = (y = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && y !== void 0 ? y : g, As = (i = P.uriResolver) !== null && i !== void 0 ? i : E.default;
    return {
      strictSchema: (b = (f = P.strictSchema) !== null && f !== void 0 ? f : He) !== null && b !== void 0 ? b : !0,
      strictNumbers: (j = (I = P.strictNumbers) !== null && I !== void 0 ? I : He) !== null && j !== void 0 ? j : !0,
      strictTypes: (L = (F = P.strictTypes) !== null && F !== void 0 ? F : He) !== null && L !== void 0 ? L : "log",
      strictTuples: (Fe = (ae = P.strictTuples) !== null && ae !== void 0 ? ae : He) !== null && Fe !== void 0 ? Fe : "log",
      strictRequired: (zt = (Ft = P.strictRequired) !== null && Ft !== void 0 ? Ft : He) !== null && zt !== void 0 ? zt : !1,
      code: P.code ? { ...P.code, optimize: Gr, regExp: Hr } : { optimize: Gr, regExp: Hr },
      loopRequired: (Ut = P.loopRequired) !== null && Ut !== void 0 ? Ut : v,
      loopEnum: (qt = P.loopEnum) !== null && qt !== void 0 ? qt : v,
      meta: (Kt = P.meta) !== null && Kt !== void 0 ? Kt : !0,
      messages: (Gt = P.messages) !== null && Gt !== void 0 ? Gt : !0,
      inlineRefs: (Ht = P.inlineRefs) !== null && Ht !== void 0 ? Ht : !0,
      schemaId: (Xt = P.schemaId) !== null && Xt !== void 0 ? Xt : "$id",
      addUsedSchema: (Jt = P.addUsedSchema) !== null && Jt !== void 0 ? Jt : !0,
      validateSchema: (Wt = P.validateSchema) !== null && Wt !== void 0 ? Wt : !0,
      validateFormats: (Bt = P.validateFormats) !== null && Bt !== void 0 ? Bt : !0,
      unicodeRegExp: (Yt = P.unicodeRegExp) !== null && Yt !== void 0 ? Yt : !0,
      int32range: (Qt = P.int32range) !== null && Qt !== void 0 ? Qt : !0,
      uriResolver: As
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: y } = this.opts.code;
      this.scope = new l.ValueScope({ scope: {}, prefixes: _, es5: S, lines: y }), this.logger = H(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), O.call(this, $, p, "NOT SUPPORTED"), O.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = ye.call(this), p.formats && de.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && he.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), B.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: y } = this.opts;
      let i = h;
      y === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[y], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let y;
      if (typeof p == "string") {
        if (y = this.getSchema(p), !y)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        y = this.compile(p);
      const i = y(S);
      return "$async" in y || (this.errors = y.errors), i;
    }
    compile(p, S) {
      const y = this._addSchema(p, S);
      return y.validate || this._compileSchemaEnv(y);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: y } = this.opts;
      return i.call(this, p, S);
      async function i(L, ae) {
        await f.call(this, L.$schema);
        const Fe = this._addSchema(L, ae);
        return Fe.validate || b.call(this, Fe);
      }
      async function f(L) {
        L && !this.getSchema(L) && await i.call(this, { $ref: L }, !0);
      }
      async function b(L) {
        try {
          return this._compileSchemaEnv(L);
        } catch (ae) {
          if (!(ae instanceof s.default))
            throw ae;
          return I.call(this, ae), await j.call(this, ae.missingSchema), b.call(this, L);
        }
      }
      function I({ missingSchema: L, missingRef: ae }) {
        if (this.refs[L])
          throw new Error(`AnySchema ${L} is loaded but ${ae} cannot be resolved`);
      }
      async function j(L) {
        const ae = await F.call(this, L);
        this.refs[L] || await f.call(this, ae.$schema), this.refs[L] || this.addSchema(ae, L, S);
      }
      async function F(L) {
        const ae = this._loading[L];
        if (ae)
          return ae;
        try {
          return await (this._loading[L] = y(L));
        } finally {
          delete this._loading[L];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, y, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, y, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (f = p[b], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, c.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, y, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, y = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, y), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let y;
      if (y = p.$schema, y !== void 0 && typeof y != "string")
        throw new Error("$schema must be a string");
      if (y = y || this.opts.defaultMeta || this.defaultMeta(), !y)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate(y, p);
      if (!i && S) {
        const f = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(f);
        else
          throw new Error(f);
      }
      return i;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(p) {
      let S;
      for (; typeof (S = K.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: y } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: y });
        if (S = o.resolveSchema.call(this, i, p), !S)
          return;
        this.refs[p] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(p) {
      if (p instanceof RegExp)
        return this._removeAllSchemas(this.schemas, p), this._removeAllSchemas(this.refs, p), this;
      switch (typeof p) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = K.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let y = p[this.opts.schemaId];
          return y && (y = (0, c.normalizeId)(y), delete this.schemas[y], delete this.refs[y]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(p) {
      for (const S of p)
        this.addKeyword(S);
      return this;
    }
    addKeyword(p, S) {
      let y;
      if (typeof p == "string")
        y = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = y);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, y = S.keyword, Array.isArray(y) && !y.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (T.call(this, y, S), !S)
        return (0, u.eachItem)(y, (f) => A.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)(y, i.type.length === 0 ? (f) => A.call(this, f, i) : (f) => i.type.forEach((b) => A.call(this, f, i, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const y of S.rules) {
        const i = y.rules.findIndex((f) => f.keyword === p);
        i >= 0 && y.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: y = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${y}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const y = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let b = p;
        for (const I of f)
          b = b[I];
        for (const I in y) {
          const j = y[I];
          if (typeof j != "object")
            continue;
          const { $data: F } = j.definition, L = b[I];
          F && L && (b[I] = M(L));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const y in p) {
        const i = p[y];
        (!S || S.test(y)) && (typeof i == "string" ? delete p[y] : i && !i.meta && (this._cache.delete(i.schema), delete p[y]));
      }
    }
    _addSchema(p, S, y, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let b;
      const { schemaId: I } = this.opts;
      if (typeof p == "object")
        b = p[I];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let j = this._cache.get(p);
      if (j !== void 0)
        return j;
      y = (0, c.normalizeId)(b || y);
      const F = c.getSchemaRefs.call(this, p, y);
      return j = new o.SchemaEnv({ schema: p, schemaId: I, meta: S, baseId: y, localRefs: F }), this._cache.set(j.schema, j), f && !y.startsWith("#") && (y && this._checkUnique(y), this.refs[y] = j), i && this.validateSchema(p, !0), j;
    }
    _checkUnique(p) {
      if (this.schemas[p] || this.refs[p])
        throw new Error(`schema with key or id "${p}" already exists`);
    }
    _compileSchemaEnv(p) {
      if (p.meta ? this._compileMetaSchema(p) : o.compileSchema.call(this, p), !p.validate)
        throw new Error("ajv implementation error");
      return p.validate;
    }
    _compileMetaSchema(p) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, p);
      } finally {
        this.opts = S;
      }
    }
  }
  R.ValidationError = n.default, R.MissingRefError = s.default, e.default = R;
  function O(P, p, S, y = "error") {
    for (const i in P) {
      const f = i;
      f in p && this.logger[y](`${S}: option ${i}. ${P[f]}`);
    }
  }
  function K(P) {
    return P = (0, c.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function B() {
    const P = this.opts.schemas;
    if (P)
      if (Array.isArray(P))
        this.addSchema(P);
      else
        for (const p in P)
          this.addSchema(P[p], p);
  }
  function de() {
    for (const P in this.opts.formats) {
      const p = this.opts.formats[P];
      p && this.addFormat(P, p);
    }
  }
  function he(P) {
    if (Array.isArray(P)) {
      this.addVocabulary(P);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in P) {
      const S = P[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function ye() {
    const P = { ...this.opts };
    for (const p of w)
      delete P[p];
    return P;
  }
  const z = { log() {
  }, warn() {
  }, error() {
  } };
  function H(P) {
    if (P === !1)
      return z;
    if (P === void 0)
      return console;
    if (P.log && P.warn && P.error)
      return P;
    throw new Error("logger must implement log, warn and error methods");
  }
  const oe = /^[a-z_$][a-z0-9_$:-]*$/i;
  function T(P, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(P, (y) => {
      if (S.keywords[y])
        throw new Error(`Keyword ${y} is already defined`);
      if (!oe.test(y))
        throw new Error(`Keyword ${y} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function A(P, p, S) {
    var y;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let b = i ? f.post : f.rules.find(({ type: j }) => j === S);
    if (b || (b = { type: S, rules: [] }, f.rules.push(b)), f.keywords[P] = !0, !p)
      return;
    const I = {
      keyword: P,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? V.call(this, b, I, p.before) : b.rules.push(I), f.all[P] = I, (y = p.implements) === null || y === void 0 || y.forEach((j) => this.addKeyword(j));
  }
  function V(P, p, S) {
    const y = P.rules.findIndex((i) => i.keyword === S);
    y >= 0 ? P.rules.splice(y, 0, p) : (P.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function D(P) {
    let { metaSchema: p } = P;
    p !== void 0 && (P.$data && this.opts.$data && (p = M(p)), P.validateSchema = this.compile(p, !0));
  }
  const G = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function M(P) {
    return { anyOf: [P, G] };
  }
})(du);
var zo = {}, Uo = {}, qo = {};
Object.defineProperty(qo, "__esModule", { value: !0 });
const D_ = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
qo.default = D_;
var mr = {};
Object.defineProperty(mr, "__esModule", { value: !0 });
mr.callRef = mr.getValidate = void 0;
const M_ = zr, $c = se, Ve = re, gr = dt, gc = Le, jn = C, V_ = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: l, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = gc.resolveRef.call(c, d, s, r);
    if (u === void 0)
      throw new M_.default(n.opts.uriResolver, s, r);
    if (u instanceof gc.SchemaEnv)
      return E(u);
    return g(u);
    function h() {
      if (a === d)
        return Zn(e, o, a, a.$async);
      const w = t.scopeValue("root", { ref: d });
      return Zn(e, (0, Ve._)`${w}.validate`, d, d.$async);
    }
    function E(w) {
      const _ = Gu(e, w);
      Zn(e, _, w, w.$async);
    }
    function g(w) {
      const _ = t.scopeValue("schema", l.code.source === !0 ? { ref: w, code: (0, Ve.stringify)(w) } : { ref: w }), $ = t.name("valid"), m = e.subschema({
        schema: w,
        dataTypes: [],
        schemaPath: Ve.nil,
        topSchemaRef: _,
        errSchemaPath: r
      }, $);
      e.mergeEvaluated(m), e.ok($);
    }
  }
};
function Gu(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Ve._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
mr.getValidate = Gu;
function Zn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: c } = a, d = c.passContext ? gr.default.this : Ve.nil;
  n ? u() : h();
  function u() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const w = s.let("valid");
    s.try(() => {
      s.code((0, Ve._)`await ${(0, $c.callValidateCode)(e, t, d)}`), g(t), o || s.assign(w, !0);
    }, (_) => {
      s.if((0, Ve._)`!(${_} instanceof ${a.ValidationError})`, () => s.throw(_)), E(_), o || s.assign(w, !1);
    }), e.ok(w);
  }
  function h() {
    e.result((0, $c.callValidateCode)(e, t, d), () => g(t), () => E(t));
  }
  function E(w) {
    const _ = (0, Ve._)`${w}.errors`;
    s.assign(gr.default.vErrors, (0, Ve._)`${gr.default.vErrors} === null ? ${_} : ${gr.default.vErrors}.concat(${_})`), s.assign(gr.default.errors, (0, Ve._)`${gr.default.vErrors}.length`);
  }
  function g(w) {
    var _;
    if (!a.opts.unevaluated)
      return;
    const $ = (_ = r == null ? void 0 : r.validate) === null || _ === void 0 ? void 0 : _.evaluated;
    if (a.props !== !0)
      if ($ && !$.dynamicProps)
        $.props !== void 0 && (a.props = jn.mergeEvaluated.props(s, $.props, a.props));
      else {
        const m = s.var("props", (0, Ve._)`${w}.evaluated.props`);
        a.props = jn.mergeEvaluated.props(s, m, a.props, Ve.Name);
      }
    if (a.items !== !0)
      if ($ && !$.dynamicItems)
        $.items !== void 0 && (a.items = jn.mergeEvaluated.items(s, $.items, a.items));
      else {
        const m = s.var("items", (0, Ve._)`${w}.evaluated.items`);
        a.items = jn.mergeEvaluated.items(s, m, a.items, Ve.Name);
      }
  }
}
mr.callRef = Zn;
mr.default = V_;
Object.defineProperty(Uo, "__esModule", { value: !0 });
const L_ = qo, F_ = mr, z_ = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  L_.default,
  F_.default
];
Uo.default = z_;
var Ko = {}, Go = {};
Object.defineProperty(Go, "__esModule", { value: !0 });
const cs = re, Ot = cs.operators, ls = {
  maximum: { okStr: "<=", ok: Ot.LTE, fail: Ot.GT },
  minimum: { okStr: ">=", ok: Ot.GTE, fail: Ot.LT },
  exclusiveMaximum: { okStr: "<", ok: Ot.LT, fail: Ot.GTE },
  exclusiveMinimum: { okStr: ">", ok: Ot.GT, fail: Ot.LTE }
}, U_ = {
  message: ({ keyword: e, schemaCode: t }) => (0, cs.str)`must be ${ls[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, cs._)`{comparison: ${ls[e].okStr}, limit: ${t}}`
}, q_ = {
  keyword: Object.keys(ls),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: U_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, cs._)`${r} ${ls[t].fail} ${n} || isNaN(${r})`);
  }
};
Go.default = q_;
var Ho = {};
Object.defineProperty(Ho, "__esModule", { value: !0 });
const un = re, K_ = {
  message: ({ schemaCode: e }) => (0, un.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, un._)`{multipleOf: ${e}}`
}, G_ = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: K_,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, un._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, un._)`${o} !== parseInt(${o})`;
    e.fail$data((0, un._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Ho.default = G_;
var Xo = {}, Jo = {};
Object.defineProperty(Jo, "__esModule", { value: !0 });
function Hu(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Jo.default = Hu;
Hu.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Xo, "__esModule", { value: !0 });
const or = re, H_ = C, X_ = Jo, J_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, or.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, or._)`{limit: ${e}}`
}, W_ = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: J_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? or.operators.GT : or.operators.LT, o = s.opts.unicode === !1 ? (0, or._)`${r}.length` : (0, or._)`${(0, H_.useFunc)(e.gen, X_.default)}(${r})`;
    e.fail$data((0, or._)`${o} ${a} ${n}`);
  }
};
Xo.default = W_;
var Wo = {};
Object.defineProperty(Wo, "__esModule", { value: !0 });
const B_ = se, Y_ = C, Pr = re, Q_ = {
  message: ({ schemaCode: e }) => (0, Pr.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Pr._)`{pattern: ${e}}`
}, Z_ = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: Q_,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e, l = o.opts.unicodeRegExp ? "u" : "";
    if (n) {
      const { regExp: c } = o.opts.code, d = c.code === "new RegExp" ? (0, Pr._)`new RegExp` : (0, Y_.useFunc)(t, c), u = t.let("valid");
      t.try(() => t.assign(u, (0, Pr._)`${d}(${a}, ${l}).test(${r})`), () => t.assign(u, !1)), e.fail$data((0, Pr._)`!${u}`);
    } else {
      const c = (0, B_.usePattern)(e, s);
      e.fail$data((0, Pr._)`!${c}.test(${r})`);
    }
  }
};
Wo.default = Z_;
var Bo = {};
Object.defineProperty(Bo, "__esModule", { value: !0 });
const dn = re, x_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, dn.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, dn._)`{limit: ${e}}`
}, ev = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: x_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? dn.operators.GT : dn.operators.LT;
    e.fail$data((0, dn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Bo.default = ev;
var Yo = {};
Object.defineProperty(Yo, "__esModule", { value: !0 });
const Qr = se, fn = re, tv = C, rv = {
  message: ({ params: { missingProperty: e } }) => (0, fn.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, fn._)`{missingProperty: ${e}}`
}, nv = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: rv,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: l } = o;
    if (!a && r.length === 0)
      return;
    const c = r.length >= l.loopRequired;
    if (o.allErrors ? d() : u(), l.strictRequired) {
      const g = e.parentSchema.properties, { definedProperties: w } = e.it;
      for (const _ of r)
        if ((g == null ? void 0 : g[_]) === void 0 && !w.has(_)) {
          const $ = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${_}" is not defined at "${$}" (strictRequired)`;
          (0, tv.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (c || a)
        e.block$data(fn.nil, h);
      else
        for (const g of r)
          (0, Qr.checkReportMissingProp)(e, g);
    }
    function u() {
      const g = t.let("missing");
      if (c || a) {
        const w = t.let("valid", !0);
        e.block$data(w, () => E(g, w)), e.ok(w);
      } else
        t.if((0, Qr.checkMissingProp)(e, r, g)), (0, Qr.reportMissingProp)(e, g), t.else();
    }
    function h() {
      t.forOf("prop", n, (g) => {
        e.setParams({ missingProperty: g }), t.if((0, Qr.noPropertyInData)(t, s, g, l.ownProperties), () => e.error());
      });
    }
    function E(g, w) {
      e.setParams({ missingProperty: g }), t.forOf(g, n, () => {
        t.assign(w, (0, Qr.propertyInData)(t, s, g, l.ownProperties)), t.if((0, fn.not)(w), () => {
          e.error(), t.break();
        });
      }, fn.nil);
    }
  }
};
Yo.default = nv;
var Qo = {};
Object.defineProperty(Qo, "__esModule", { value: !0 });
const hn = re, sv = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, hn.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, hn._)`{limit: ${e}}`
}, av = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: sv,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? hn.operators.GT : hn.operators.LT;
    e.fail$data((0, hn._)`${r}.length ${s} ${n}`);
  }
};
Qo.default = av;
var Zo = {}, wn = {};
Object.defineProperty(wn, "__esModule", { value: !0 });
const Xu = ps;
Xu.code = 'require("ajv/dist/runtime/equal").default';
wn.default = Xu;
Object.defineProperty(Zo, "__esModule", { value: !0 });
const Xs = ge, we = re, ov = C, iv = wn, cv = {
  message: ({ params: { i: e, j: t } }) => (0, we.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, we._)`{i: ${e}, j: ${t}}`
}, lv = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: cv,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: l } = e;
    if (!n && !s)
      return;
    const c = t.let("valid"), d = a.items ? (0, Xs.getSchemaTypes)(a.items) : [];
    e.block$data(c, u, (0, we._)`${o} === false`), e.ok(c);
    function u() {
      const w = t.let("i", (0, we._)`${r}.length`), _ = t.let("j");
      e.setParams({ i: w, j: _ }), t.assign(c, !0), t.if((0, we._)`${w} > 1`, () => (h() ? E : g)(w, _));
    }
    function h() {
      return d.length > 0 && !d.some((w) => w === "object" || w === "array");
    }
    function E(w, _) {
      const $ = t.name("item"), m = (0, Xs.checkDataTypes)(d, $, l.opts.strictNumbers, Xs.DataType.Wrong), v = t.const("indices", (0, we._)`{}`);
      t.for((0, we._)`;${w}--;`, () => {
        t.let($, (0, we._)`${r}[${w}]`), t.if(m, (0, we._)`continue`), d.length > 1 && t.if((0, we._)`typeof ${$} == "string"`, (0, we._)`${$} += "_"`), t.if((0, we._)`typeof ${v}[${$}] == "number"`, () => {
          t.assign(_, (0, we._)`${v}[${$}]`), e.error(), t.assign(c, !1).break();
        }).code((0, we._)`${v}[${$}] = ${w}`);
      });
    }
    function g(w, _) {
      const $ = (0, ov.useFunc)(t, iv.default), m = t.name("outer");
      t.label(m).for((0, we._)`;${w}--;`, () => t.for((0, we._)`${_} = ${w}; ${_}--;`, () => t.if((0, we._)`${$}(${r}[${w}], ${r}[${_}])`, () => {
        e.error(), t.assign(c, !1).break(m);
      })));
    }
  }
};
Zo.default = lv;
var xo = {};
Object.defineProperty(xo, "__esModule", { value: !0 });
const _a = re, uv = C, dv = wn, fv = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, _a._)`{allowedValue: ${e}}`
}, hv = {
  keyword: "const",
  $data: !0,
  error: fv,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, _a._)`!${(0, uv.useFunc)(t, dv.default)}(${r}, ${s})`) : e.fail((0, _a._)`${a} !== ${r}`);
  }
};
xo.default = hv;
var ei = {};
Object.defineProperty(ei, "__esModule", { value: !0 });
const rn = re, mv = C, pv = wn, yv = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, rn._)`{allowedValues: ${e}}`
}, $v = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: yv,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const l = s.length >= o.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, mv.useFunc)(t, pv.default));
    let u;
    if (l || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const g = t.const("vSchema", a);
      u = (0, rn.or)(...s.map((w, _) => E(g, _)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (g) => t.if((0, rn._)`${d()}(${r}, ${g})`, () => t.assign(u, !0).break()));
    }
    function E(g, w) {
      const _ = s[w];
      return typeof _ == "object" && _ !== null ? (0, rn._)`${d()}(${r}, ${g}[${w}])` : (0, rn._)`${r} === ${_}`;
    }
  }
};
ei.default = $v;
Object.defineProperty(Ko, "__esModule", { value: !0 });
const gv = Go, _v = Ho, vv = Xo, wv = Wo, Ev = Bo, bv = Yo, Sv = Qo, Pv = Zo, Nv = xo, Rv = ei, Ov = [
  // number
  gv.default,
  _v.default,
  // string
  vv.default,
  wv.default,
  // object
  Ev.default,
  bv.default,
  // array
  Sv.default,
  Pv.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Nv.default,
  Rv.default
];
Ko.default = Ov;
var ti = {}, Ur = {};
Object.defineProperty(Ur, "__esModule", { value: !0 });
Ur.validateAdditionalItems = void 0;
const ir = re, va = C, Iv = {
  message: ({ params: { len: e } }) => (0, ir.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, ir._)`{limit: ${e}}`
}, Tv = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Iv,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, va.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Ju(e, n);
  }
};
function Ju(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const l = r.const("len", (0, ir._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, ir._)`${l} <= ${t.length}`);
  else if (typeof n == "object" && !(0, va.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, ir._)`${l} <= ${t.length}`);
    r.if((0, ir.not)(d), () => c(d)), e.ok(d);
  }
  function c(d) {
    r.forRange("i", t.length, l, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: va.Type.Num }, d), o.allErrors || r.if((0, ir.not)(d), () => r.break());
    });
  }
}
Ur.validateAdditionalItems = Ju;
Ur.default = Tv;
var ri = {}, qr = {};
Object.defineProperty(qr, "__esModule", { value: !0 });
qr.validateTuple = void 0;
const _c = re, xn = C, jv = se, Av = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Wu(e, "additionalItems", t);
    r.items = !0, !(0, xn.alwaysValidSchema)(r, t) && e.ok((0, jv.validateArray)(e));
  }
};
function Wu(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: l } = e;
  u(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = xn.mergeEvaluated.items(n, r.length, l.items));
  const c = n.name("valid"), d = n.const("len", (0, _c._)`${a}.length`);
  r.forEach((h, E) => {
    (0, xn.alwaysValidSchema)(l, h) || (n.if((0, _c._)`${d} > ${E}`, () => e.subschema({
      keyword: o,
      schemaProp: E,
      dataProp: E
    }, c)), e.ok(c));
  });
  function u(h) {
    const { opts: E, errSchemaPath: g } = l, w = r.length, _ = w === h.minItems && (w === h.maxItems || h[t] === !1);
    if (E.strictTuples && !_) {
      const $ = `"${o}" is ${w}-tuple, but minItems or maxItems/${t} are not specified or different at path "${g}"`;
      (0, xn.checkStrictMode)(l, $, E.strictTuples);
    }
  }
}
qr.validateTuple = Wu;
qr.default = Av;
Object.defineProperty(ri, "__esModule", { value: !0 });
const kv = qr, Cv = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, kv.validateTuple)(e, "items")
};
ri.default = Cv;
var ni = {};
Object.defineProperty(ni, "__esModule", { value: !0 });
const vc = re, Dv = C, Mv = se, Vv = Ur, Lv = {
  message: ({ params: { len: e } }) => (0, vc.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, vc._)`{limit: ${e}}`
}, Fv = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: Lv,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, Dv.alwaysValidSchema)(n, t) && (s ? (0, Vv.validateAdditionalItems)(e, s) : e.ok((0, Mv.validateArray)(e)));
  }
};
ni.default = Fv;
var si = {};
Object.defineProperty(si, "__esModule", { value: !0 });
const Ge = re, An = C, zv = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ge.str)`must contain at least ${e} valid item(s)` : (0, Ge.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ge._)`{minContains: ${e}}` : (0, Ge._)`{minContains: ${e}, maxContains: ${t}}`
}, Uv = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: zv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, l;
    const { minContains: c, maxContains: d } = n;
    a.opts.next ? (o = c === void 0 ? 1 : c, l = d) : o = 1;
    const u = t.const("len", (0, Ge._)`${s}.length`);
    if (e.setParams({ min: o, max: l }), l === void 0 && o === 0) {
      (0, An.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && o > l) {
      (0, An.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, An.alwaysValidSchema)(a, r)) {
      let _ = (0, Ge._)`${u} >= ${o}`;
      l !== void 0 && (_ = (0, Ge._)`${_} && ${u} <= ${l}`), e.pass(_);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    l === void 0 && o === 1 ? g(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), l !== void 0 && t.if((0, Ge._)`${s}.length > 0`, E)) : (t.let(h, !1), E()), e.result(h, () => e.reset());
    function E() {
      const _ = t.name("_valid"), $ = t.let("count", 0);
      g(_, () => t.if(_, () => w($)));
    }
    function g(_, $) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: An.Type.Num,
          compositeRule: !0
        }, _), $();
      });
    }
    function w(_) {
      t.code((0, Ge._)`${_}++`), l === void 0 ? t.if((0, Ge._)`${_} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Ge._)`${_} > ${l}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Ge._)`${_} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
si.default = Uv;
var Bu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = re, r = C, n = se;
  e.error = {
    message: ({ params: { property: c, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${c} is present`;
    },
    params: ({ params: { property: c, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${c},
    missingProperty: ${h},
    depsCount: ${d},
    deps: ${u}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(c) {
      const [d, u] = a(c);
      o(c, d), l(c, u);
    }
  };
  function a({ schema: c }) {
    const d = {}, u = {};
    for (const h in c) {
      if (h === "__proto__")
        continue;
      const E = Array.isArray(c[h]) ? d : u;
      E[h] = c[h];
    }
    return [d, u];
  }
  function o(c, d = c.schema) {
    const { gen: u, data: h, it: E } = c;
    if (Object.keys(d).length === 0)
      return;
    const g = u.let("missing");
    for (const w in d) {
      const _ = d[w];
      if (_.length === 0)
        continue;
      const $ = (0, n.propertyInData)(u, h, w, E.opts.ownProperties);
      c.setParams({
        property: w,
        depsCount: _.length,
        deps: _.join(", ")
      }), E.allErrors ? u.if($, () => {
        for (const m of _)
          (0, n.checkReportMissingProp)(c, m);
      }) : (u.if((0, t._)`${$} && (${(0, n.checkMissingProp)(c, _, g)})`), (0, n.reportMissingProp)(c, g), u.else());
    }
  }
  e.validatePropertyDeps = o;
  function l(c, d = c.schema) {
    const { gen: u, data: h, keyword: E, it: g } = c, w = u.name("valid");
    for (const _ in d)
      (0, r.alwaysValidSchema)(g, d[_]) || (u.if(
        (0, n.propertyInData)(u, h, _, g.opts.ownProperties),
        () => {
          const $ = c.subschema({ keyword: E, schemaProp: _ }, w);
          c.mergeValidEvaluated($, w);
        },
        () => u.var(w, !0)
        // TODO var
      ), c.ok(w));
  }
  e.validateSchemaDeps = l, e.default = s;
})(Bu);
var ai = {};
Object.defineProperty(ai, "__esModule", { value: !0 });
const Yu = re, qv = C, Kv = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Yu._)`{propertyName: ${e.propertyName}}`
}, Gv = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: Kv,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, qv.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Yu.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
ai.default = Gv;
var Ps = {};
Object.defineProperty(Ps, "__esModule", { value: !0 });
const kn = se, Ye = re, Hv = dt, Cn = C, Xv = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Ye._)`{additionalProperty: ${e.additionalProperty}}`
}, Jv = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: Xv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: l, opts: c } = o;
    if (o.props = !0, c.removeAdditional !== "all" && (0, Cn.alwaysValidSchema)(o, r))
      return;
    const d = (0, kn.allSchemaProperties)(n.properties), u = (0, kn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Ye._)`${a} === ${Hv.default.errors}`);
    function h() {
      t.forIn("key", s, ($) => {
        !d.length && !u.length ? w($) : t.if(E($), () => w($));
      });
    }
    function E($) {
      let m;
      if (d.length > 8) {
        const v = (0, Cn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, kn.isOwnProperty)(t, v, $);
      } else d.length ? m = (0, Ye.or)(...d.map((v) => (0, Ye._)`${$} === ${v}`)) : m = Ye.nil;
      return u.length && (m = (0, Ye.or)(m, ...u.map((v) => (0, Ye._)`${(0, kn.usePattern)(e, v)}.test(${$})`))), (0, Ye.not)(m);
    }
    function g($) {
      t.code((0, Ye._)`delete ${s}[${$}]`);
    }
    function w($) {
      if (c.removeAdditional === "all" || c.removeAdditional && r === !1) {
        g($);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: $ }), e.error(), l || t.break();
        return;
      }
      if (typeof r == "object" && !(0, Cn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        c.removeAdditional === "failing" ? (_($, m, !1), t.if((0, Ye.not)(m), () => {
          e.reset(), g($);
        })) : (_($, m), l || t.if((0, Ye.not)(m), () => t.break()));
      }
    }
    function _($, m, v) {
      const N = {
        keyword: "additionalProperties",
        dataProp: $,
        dataPropType: Cn.Type.Str
      };
      v === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
Ps.default = Jv;
var oi = {};
Object.defineProperty(oi, "__esModule", { value: !0 });
const Wv = et, wc = se, Js = C, Ec = Ps, Bv = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Ec.default.code(new Wv.KeywordCxt(a, Ec.default, "additionalProperties"));
    const o = (0, wc.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Js.mergeEvaluated.props(t, (0, Js.toHash)(o), a.props));
    const l = o.filter((h) => !(0, Js.alwaysValidSchema)(a, r[h]));
    if (l.length === 0)
      return;
    const c = t.name("valid");
    for (const h of l)
      d(h) ? u(h) : (t.if((0, wc.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(c, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(c);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, c);
    }
  }
};
oi.default = Bv;
var ii = {};
Object.defineProperty(ii, "__esModule", { value: !0 });
const bc = se, Dn = re, Sc = C, Pc = C, Yv = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, bc.allSchemaProperties)(r), c = l.filter((_) => (0, Sc.alwaysValidSchema)(a, r[_]));
    if (l.length === 0 || c.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof Dn.Name) && (a.props = (0, Pc.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const _ of l)
        d && g(_), a.allErrors ? w(_) : (t.var(u, !0), w(_), t.if(u));
    }
    function g(_) {
      for (const $ in d)
        new RegExp(_).test($) && (0, Sc.checkStrictMode)(a, `property ${$} matches pattern ${_} (use allowMatchingProperties)`);
    }
    function w(_) {
      t.forIn("key", n, ($) => {
        t.if((0, Dn._)`${(0, bc.usePattern)(e, _)}.test(${$})`, () => {
          const m = c.includes(_);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: _,
            dataProp: $,
            dataPropType: Pc.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, Dn._)`${h}[${$}]`, !0) : !m && !a.allErrors && t.if((0, Dn.not)(u), () => t.break());
        });
      });
    }
  }
};
ii.default = Yv;
var ci = {};
Object.defineProperty(ci, "__esModule", { value: !0 });
const Qv = C, Zv = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, Qv.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const s = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), e.failResult(s, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
ci.default = Zv;
var li = {};
Object.defineProperty(li, "__esModule", { value: !0 });
const xv = se, ew = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: xv.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
li.default = ew;
var ui = {};
Object.defineProperty(ui, "__esModule", { value: !0 });
const es = re, tw = C, rw = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, es._)`{passingSchemas: ${e.passing}}`
}, nw = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: rw,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), l = t.let("passing", null), c = t.name("_valid");
    e.setParams({ passing: l }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let E;
        (0, tw.alwaysValidSchema)(s, u) ? t.var(c, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, c), h > 0 && t.if((0, es._)`${c} && ${o}`).assign(o, !1).assign(l, (0, es._)`[${l}, ${h}]`).else(), t.if(c, () => {
          t.assign(o, !0), t.assign(l, h), E && e.mergeEvaluated(E, es.Name);
        });
      });
    }
  }
};
ui.default = nw;
var di = {};
Object.defineProperty(di, "__esModule", { value: !0 });
const sw = C, aw = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, sw.alwaysValidSchema)(n, a))
        return;
      const l = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(l);
    });
  }
};
di.default = aw;
var fi = {};
Object.defineProperty(fi, "__esModule", { value: !0 });
const us = re, Qu = C, ow = {
  message: ({ params: e }) => (0, us.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, us._)`{failingKeyword: ${e.ifClause}}`
}, iw = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: ow,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Qu.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Nc(n, "then"), a = Nc(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), l = t.name("_valid");
    if (c(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(l, d("then", u), d("else", u));
    } else s ? t.if(l, d("then")) : t.if((0, us.not)(l), d("else"));
    e.pass(o, () => e.error(!0));
    function c() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, l);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const E = e.subschema({ keyword: u }, l);
        t.assign(o, l), e.mergeValidEvaluated(E, o), h ? t.assign(h, (0, us._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function Nc(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Qu.alwaysValidSchema)(e, r);
}
fi.default = iw;
var hi = {};
Object.defineProperty(hi, "__esModule", { value: !0 });
const cw = C, lw = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, cw.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
hi.default = lw;
Object.defineProperty(ti, "__esModule", { value: !0 });
const uw = Ur, dw = ri, fw = qr, hw = ni, mw = si, pw = Bu, yw = ai, $w = Ps, gw = oi, _w = ii, vw = ci, ww = li, Ew = ui, bw = di, Sw = fi, Pw = hi;
function Nw(e = !1) {
  const t = [
    // any
    vw.default,
    ww.default,
    Ew.default,
    bw.default,
    Sw.default,
    Pw.default,
    // object
    yw.default,
    $w.default,
    pw.default,
    gw.default,
    _w.default
  ];
  return e ? t.push(dw.default, hw.default) : t.push(uw.default, fw.default), t.push(mw.default), t;
}
ti.default = Nw;
var mi = {}, pi = {};
Object.defineProperty(pi, "__esModule", { value: !0 });
const pe = re, Rw = {
  message: ({ schemaCode: e }) => (0, pe.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, pe._)`{format: ${e}}`
}, Ow = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Rw,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: l } = e, { opts: c, errSchemaPath: d, schemaEnv: u, self: h } = l;
    if (!c.validateFormats)
      return;
    s ? E() : g();
    function E() {
      const w = r.scopeValue("formats", {
        ref: h.formats,
        code: c.code.formats
      }), _ = r.const("fDef", (0, pe._)`${w}[${o}]`), $ = r.let("fType"), m = r.let("format");
      r.if((0, pe._)`typeof ${_} == "object" && !(${_} instanceof RegExp)`, () => r.assign($, (0, pe._)`${_}.type || "string"`).assign(m, (0, pe._)`${_}.validate`), () => r.assign($, (0, pe._)`"string"`).assign(m, _)), e.fail$data((0, pe.or)(v(), N()));
      function v() {
        return c.strictSchema === !1 ? pe.nil : (0, pe._)`${o} && !${m}`;
      }
      function N() {
        const R = u.$async ? (0, pe._)`(${_}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, pe._)`${m}(${n})`, O = (0, pe._)`(typeof ${m} == "function" ? ${R} : ${m}.test(${n}))`;
        return (0, pe._)`${m} && ${m} !== true && ${$} === ${t} && !${O}`;
      }
    }
    function g() {
      const w = h.formats[a];
      if (!w) {
        v();
        return;
      }
      if (w === !0)
        return;
      const [_, $, m] = N(w);
      _ === t && e.pass(R());
      function v() {
        if (c.strictSchema === !1) {
          h.logger.warn(O());
          return;
        }
        throw new Error(O());
        function O() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function N(O) {
        const K = O instanceof RegExp ? (0, pe.regexpCode)(O) : c.code.formats ? (0, pe._)`${c.code.formats}${(0, pe.getProperty)(a)}` : void 0, B = r.scopeValue("formats", { key: a, ref: O, code: K });
        return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, pe._)`${B}.validate`] : ["string", O, B];
      }
      function R() {
        if (typeof w == "object" && !(w instanceof RegExp) && w.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, pe._)`await ${m}(${n})`;
        }
        return typeof $ == "function" ? (0, pe._)`${m}(${n})` : (0, pe._)`${m}.test(${n})`;
      }
    }
  }
};
pi.default = Ow;
Object.defineProperty(mi, "__esModule", { value: !0 });
const Iw = pi, Tw = [Iw.default];
mi.default = Tw;
var Cr = {};
Object.defineProperty(Cr, "__esModule", { value: !0 });
Cr.contentVocabulary = Cr.metadataVocabulary = void 0;
Cr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Cr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(zo, "__esModule", { value: !0 });
const jw = Uo, Aw = Ko, kw = ti, Cw = mi, Rc = Cr, Dw = [
  jw.default,
  Aw.default,
  (0, kw.default)(),
  Cw.default,
  Rc.metadataVocabulary,
  Rc.contentVocabulary
];
zo.default = Dw;
var yi = {}, Ns = {};
Object.defineProperty(Ns, "__esModule", { value: !0 });
Ns.DiscrError = void 0;
var Oc;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Oc || (Ns.DiscrError = Oc = {}));
Object.defineProperty(yi, "__esModule", { value: !0 });
const wr = re, wa = Ns, Ic = Le, Mw = zr, Vw = C, Lw = {
  message: ({ params: { discrError: e, tagName: t } }) => e === wa.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, wr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, Fw = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: Lw,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const l = n.propertyName;
    if (typeof l != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const c = t.let("valid", !1), d = t.const("tag", (0, wr._)`${r}${(0, wr.getProperty)(l)}`);
    t.if((0, wr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: wa.DiscrError.Tag, tag: d, tagName: l })), e.ok(c);
    function u() {
      const g = E();
      t.if(!1);
      for (const w in g)
        t.elseIf((0, wr._)`${d} === ${w}`), t.assign(c, h(g[w]));
      t.else(), e.error(!1, { discrError: wa.DiscrError.Mapping, tag: d, tagName: l }), t.endIf();
    }
    function h(g) {
      const w = t.name("valid"), _ = e.subschema({ keyword: "oneOf", schemaProp: g }, w);
      return e.mergeEvaluated(_, wr.Name), w;
    }
    function E() {
      var g;
      const w = {}, _ = m(s);
      let $ = !0;
      for (let R = 0; R < o.length; R++) {
        let O = o[R];
        if (O != null && O.$ref && !(0, Vw.schemaHasRulesButRef)(O, a.self.RULES)) {
          const B = O.$ref;
          if (O = Ic.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, B), O instanceof Ic.SchemaEnv && (O = O.schema), O === void 0)
            throw new Mw.default(a.opts.uriResolver, a.baseId, B);
        }
        const K = (g = O == null ? void 0 : O.properties) === null || g === void 0 ? void 0 : g[l];
        if (typeof K != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${l}"`);
        $ = $ && (_ || m(O)), v(K, R);
      }
      if (!$)
        throw new Error(`discriminator: "${l}" must be required`);
      return w;
      function m({ required: R }) {
        return Array.isArray(R) && R.includes(l);
      }
      function v(R, O) {
        if (R.const)
          N(R.const, O);
        else if (R.enum)
          for (const K of R.enum)
            N(K, O);
        else
          throw new Error(`discriminator: "properties/${l}" must have "const" or "enum"`);
      }
      function N(R, O) {
        if (typeof R != "string" || R in w)
          throw new Error(`discriminator: "${l}" values must be unique strings`);
        w[R] = O;
      }
    }
  }
};
yi.default = Fw;
const zw = "http://json-schema.org/draft-07/schema#", Uw = "http://json-schema.org/draft-07/schema#", qw = "Core schema meta-schema", Kw = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/nonNegativeInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, Gw = [
  "object",
  "boolean"
], Hw = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  readOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: !0
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: !0,
  enum: {
    type: "array",
    items: !0,
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, Xw = {
  $schema: zw,
  $id: Uw,
  title: qw,
  definitions: Kw,
  type: Gw,
  properties: Hw,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = du, n = zo, s = yi, a = Xw, o = ["/properties"], l = "http://json-schema.org/draft-07/schema";
  class c extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((w) => this.addVocabulary(w)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const w = this.opts.$data ? this.$dataMetaSchema(a, o) : a;
      this.addMetaSchema(w, l, !1), this.refs["http://json-schema.org/schema"] = l;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(l) ? l : void 0);
    }
  }
  t.Ajv = c, e.exports = t = c, e.exports.Ajv = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
  var d = et;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var u = re;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return u._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return u.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return u.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return u.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return u.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return u.CodeGen;
  } });
  var h = vn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var E = zr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return E.default;
  } });
})(ma, ma.exports);
var Jw = ma.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = Jw, r = re, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: l, schemaCode: c }) => (0, r.str)`should be ${s[l].okStr} ${c}`,
    params: ({ keyword: l, schemaCode: c }) => (0, r._)`{comparison: ${s[l].okStr}, limit: ${c}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(l) {
      const { gen: c, data: d, schemaCode: u, keyword: h, it: E } = l, { opts: g, self: w } = E;
      if (!g.validateFormats)
        return;
      const _ = new t.KeywordCxt(E, w.RULES.all.format.definition, "format");
      _.$data ? $() : m();
      function $() {
        const N = c.scopeValue("formats", {
          ref: w.formats,
          code: g.code.formats
        }), R = c.const("fmt", (0, r._)`${N}[${_.schemaCode}]`);
        l.fail$data((0, r.or)((0, r._)`typeof ${R} != "object"`, (0, r._)`${R} instanceof RegExp`, (0, r._)`typeof ${R}.compare != "function"`, v(R)));
      }
      function m() {
        const N = _.schema, R = w.formats[N];
        if (!R || R === !0)
          return;
        if (typeof R != "object" || R instanceof RegExp || typeof R.compare != "function")
          throw new Error(`"${h}": format "${N}" does not define "compare" function`);
        const O = c.scopeValue("formats", {
          key: N,
          ref: R,
          code: g.code.formats ? (0, r._)`${g.code.formats}${(0, r.getProperty)(N)}` : void 0
        });
        l.fail$data(v(O));
      }
      function v(N) {
        return (0, r._)`${N}.compare(${d}, ${u}) ${s[h].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const o = (l) => (l.addKeyword(e.formatLimitDefinition), l);
  e.default = o;
})(uu);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = lu, n = uu, s = re, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), l = (d, u = { keywords: !0 }) => {
    if (Array.isArray(u))
      return c(d, u, r.fullFormats, a), d;
    const [h, E] = u.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, a], g = u.formats || r.formatNames;
    return c(d, g, h, E), u.keywords && (0, n.default)(d), d;
  };
  l.get = (d, u = "full") => {
    const E = (u === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!E)
      throw new Error(`Unknown format "${d}"`);
    return E;
  };
  function c(d, u, h, E) {
    var g, w;
    (g = (w = d.opts.code).formats) !== null && g !== void 0 || (w.formats = (0, s._)`require("ajv-formats/dist/formats").${E}`);
    for (const _ of u)
      d.addFormat(_, h[_]);
  }
  e.exports = t = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
})(ha, ha.exports);
var Ww = ha.exports;
const Bw = /* @__PURE__ */ ll(Ww), Yw = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), a = Object.getOwnPropertyDescriptor(t, r);
  !Qw(s, a) && n || Object.defineProperty(e, r, a);
}, Qw = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Zw = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, xw = (e, t) => `/* Wrapped ${e}*/
${t}`, eE = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), tE = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), rE = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = xw.bind(null, n, t.toString());
  Object.defineProperty(s, "name", tE);
  const { writable: a, enumerable: o, configurable: l } = eE;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: o, configurable: l });
};
function nE(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    Yw(e, t, s, r);
  return Zw(e, t), rE(e, t, n), e;
}
const Tc = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: s = !1,
    after: a = !0
  } = t;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!s && !a)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let o, l, c;
  const d = function(...u) {
    const h = this, E = () => {
      o = void 0, l && (clearTimeout(l), l = void 0), a && (c = e.apply(h, u));
    }, g = () => {
      l = void 0, o && (clearTimeout(o), o = void 0), a && (c = e.apply(h, u));
    }, w = s && !o;
    return clearTimeout(o), o = setTimeout(E, r), n > 0 && n !== Number.POSITIVE_INFINITY && !l && (l = setTimeout(g, n)), w && (c = e.apply(h, u)), c;
  };
  return nE(d, e), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), l && (clearTimeout(l), l = void 0);
  }, d;
};
var Ea = { exports: {} };
const sE = "2.0.0", Zu = 256, aE = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, oE = 16, iE = Zu - 6, cE = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var Rs = {
  MAX_LENGTH: Zu,
  MAX_SAFE_COMPONENT_LENGTH: oE,
  MAX_SAFE_BUILD_LENGTH: iE,
  MAX_SAFE_INTEGER: aE,
  RELEASE_TYPES: cE,
  SEMVER_SPEC_VERSION: sE,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const lE = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var Os = lE;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = Rs, a = Os;
  t = e.exports = {};
  const o = t.re = [], l = t.safeRe = [], c = t.src = [], d = t.safeSrc = [], u = t.t = {};
  let h = 0;
  const E = "[a-zA-Z0-9-]", g = [
    ["\\s", 1],
    ["\\d", s],
    [E, n]
  ], w = ($) => {
    for (const [m, v] of g)
      $ = $.split(`${m}*`).join(`${m}{0,${v}}`).split(`${m}+`).join(`${m}{1,${v}}`);
    return $;
  }, _ = ($, m, v) => {
    const N = w(m), R = h++;
    a($, R, m), u[$] = R, c[R] = m, d[R] = N, o[R] = new RegExp(m, v ? "g" : void 0), l[R] = new RegExp(N, v ? "g" : void 0);
  };
  _("NUMERICIDENTIFIER", "0|[1-9]\\d*"), _("NUMERICIDENTIFIERLOOSE", "\\d+"), _("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${E}*`), _("MAINVERSION", `(${c[u.NUMERICIDENTIFIER]})\\.(${c[u.NUMERICIDENTIFIER]})\\.(${c[u.NUMERICIDENTIFIER]})`), _("MAINVERSIONLOOSE", `(${c[u.NUMERICIDENTIFIERLOOSE]})\\.(${c[u.NUMERICIDENTIFIERLOOSE]})\\.(${c[u.NUMERICIDENTIFIERLOOSE]})`), _("PRERELEASEIDENTIFIER", `(?:${c[u.NONNUMERICIDENTIFIER]}|${c[u.NUMERICIDENTIFIER]})`), _("PRERELEASEIDENTIFIERLOOSE", `(?:${c[u.NONNUMERICIDENTIFIER]}|${c[u.NUMERICIDENTIFIERLOOSE]})`), _("PRERELEASE", `(?:-(${c[u.PRERELEASEIDENTIFIER]}(?:\\.${c[u.PRERELEASEIDENTIFIER]})*))`), _("PRERELEASELOOSE", `(?:-?(${c[u.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[u.PRERELEASEIDENTIFIERLOOSE]})*))`), _("BUILDIDENTIFIER", `${E}+`), _("BUILD", `(?:\\+(${c[u.BUILDIDENTIFIER]}(?:\\.${c[u.BUILDIDENTIFIER]})*))`), _("FULLPLAIN", `v?${c[u.MAINVERSION]}${c[u.PRERELEASE]}?${c[u.BUILD]}?`), _("FULL", `^${c[u.FULLPLAIN]}$`), _("LOOSEPLAIN", `[v=\\s]*${c[u.MAINVERSIONLOOSE]}${c[u.PRERELEASELOOSE]}?${c[u.BUILD]}?`), _("LOOSE", `^${c[u.LOOSEPLAIN]}$`), _("GTLT", "((?:<|>)?=?)"), _("XRANGEIDENTIFIERLOOSE", `${c[u.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), _("XRANGEIDENTIFIER", `${c[u.NUMERICIDENTIFIER]}|x|X|\\*`), _("XRANGEPLAIN", `[v=\\s]*(${c[u.XRANGEIDENTIFIER]})(?:\\.(${c[u.XRANGEIDENTIFIER]})(?:\\.(${c[u.XRANGEIDENTIFIER]})(?:${c[u.PRERELEASE]})?${c[u.BUILD]}?)?)?`), _("XRANGEPLAINLOOSE", `[v=\\s]*(${c[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[u.XRANGEIDENTIFIERLOOSE]})(?:${c[u.PRERELEASELOOSE]})?${c[u.BUILD]}?)?)?`), _("XRANGE", `^${c[u.GTLT]}\\s*${c[u.XRANGEPLAIN]}$`), _("XRANGELOOSE", `^${c[u.GTLT]}\\s*${c[u.XRANGEPLAINLOOSE]}$`), _("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), _("COERCE", `${c[u.COERCEPLAIN]}(?:$|[^\\d])`), _("COERCEFULL", c[u.COERCEPLAIN] + `(?:${c[u.PRERELEASE]})?(?:${c[u.BUILD]})?(?:$|[^\\d])`), _("COERCERTL", c[u.COERCE], !0), _("COERCERTLFULL", c[u.COERCEFULL], !0), _("LONETILDE", "(?:~>?)"), _("TILDETRIM", `(\\s*)${c[u.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", _("TILDE", `^${c[u.LONETILDE]}${c[u.XRANGEPLAIN]}$`), _("TILDELOOSE", `^${c[u.LONETILDE]}${c[u.XRANGEPLAINLOOSE]}$`), _("LONECARET", "(?:\\^)"), _("CARETTRIM", `(\\s*)${c[u.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", _("CARET", `^${c[u.LONECARET]}${c[u.XRANGEPLAIN]}$`), _("CARETLOOSE", `^${c[u.LONECARET]}${c[u.XRANGEPLAINLOOSE]}$`), _("COMPARATORLOOSE", `^${c[u.GTLT]}\\s*(${c[u.LOOSEPLAIN]})$|^$`), _("COMPARATOR", `^${c[u.GTLT]}\\s*(${c[u.FULLPLAIN]})$|^$`), _("COMPARATORTRIM", `(\\s*)${c[u.GTLT]}\\s*(${c[u.LOOSEPLAIN]}|${c[u.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", _("HYPHENRANGE", `^\\s*(${c[u.XRANGEPLAIN]})\\s+-\\s+(${c[u.XRANGEPLAIN]})\\s*$`), _("HYPHENRANGELOOSE", `^\\s*(${c[u.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[u.XRANGEPLAINLOOSE]})\\s*$`), _("STAR", "(<|>)?=?\\s*\\*"), _("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), _("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(Ea, Ea.exports);
var En = Ea.exports;
const uE = Object.freeze({ loose: !0 }), dE = Object.freeze({}), fE = (e) => e ? typeof e != "object" ? uE : e : dE;
var $i = fE;
const jc = /^[0-9]+$/, xu = (e, t) => {
  if (typeof e == "number" && typeof t == "number")
    return e === t ? 0 : e < t ? -1 : 1;
  const r = jc.test(e), n = jc.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, hE = (e, t) => xu(t, e);
var ed = {
  compareIdentifiers: xu,
  rcompareIdentifiers: hE
};
const Mn = Os, { MAX_LENGTH: Ac, MAX_SAFE_INTEGER: Vn } = Rs, { safeRe: Ln, t: Fn } = En, mE = $i, { compareIdentifiers: Ws } = ed;
let pE = class st {
  constructor(t, r) {
    if (r = mE(r), t instanceof st) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > Ac)
      throw new TypeError(
        `version is longer than ${Ac} characters`
      );
    Mn("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? Ln[Fn.LOOSE] : Ln[Fn.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > Vn || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > Vn || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > Vn || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < Vn)
          return a;
      }
      return s;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (Mn("SemVer.compare", this.version, this.options, t), !(t instanceof st)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new st(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof st || (t = new st(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0;
  }
  comparePre(t) {
    if (t instanceof st || (t = new st(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = t.prerelease[r];
      if (Mn("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return Ws(n, s);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof st || (t = new st(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = t.build[r];
      if (Mn("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return Ws(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = `-${r}`.match(this.options.loose ? Ln[Fn.PRERELEASELOOSE] : Ln[Fn.PRERELEASE]);
        if (!s || s[1] !== r)
          throw new Error(`invalid identifier: ${r}`);
      }
    }
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "release":
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`);
        this.prerelease.length = 0;
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const s = Number(n) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [s];
        else {
          let a = this.prerelease.length;
          for (; --a >= 0; )
            typeof this.prerelease[a] == "number" && (this.prerelease[a]++, a = -2);
          if (a === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(s);
          }
        }
        if (r) {
          let a = [r, s];
          n === !1 && (a = [r]), Ws(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var ke = pE;
const kc = ke, yE = (e, t, r = !1) => {
  if (e instanceof kc)
    return e;
  try {
    return new kc(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var Kr = yE;
const $E = Kr, gE = (e, t) => {
  const r = $E(e, t);
  return r ? r.version : null;
};
var _E = gE;
const vE = Kr, wE = (e, t) => {
  const r = vE(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var EE = wE;
const Cc = ke, bE = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new Cc(
      e instanceof Cc ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var SE = bE;
const Dc = Kr, PE = (e, t) => {
  const r = Dc(e, null, !0), n = Dc(t, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const a = s > 0, o = a ? r : n, l = a ? n : r, c = !!o.prerelease.length;
  if (!!l.prerelease.length && !c) {
    if (!l.patch && !l.minor)
      return "major";
    if (l.compareMain(o) === 0)
      return l.minor && !l.patch ? "minor" : "patch";
  }
  const u = c ? "pre" : "";
  return r.major !== n.major ? u + "major" : r.minor !== n.minor ? u + "minor" : r.patch !== n.patch ? u + "patch" : "prerelease";
};
var NE = PE;
const RE = ke, OE = (e, t) => new RE(e, t).major;
var IE = OE;
const TE = ke, jE = (e, t) => new TE(e, t).minor;
var AE = jE;
const kE = ke, CE = (e, t) => new kE(e, t).patch;
var DE = CE;
const ME = Kr, VE = (e, t) => {
  const r = ME(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var LE = VE;
const Mc = ke, FE = (e, t, r) => new Mc(e, r).compare(new Mc(t, r));
var rt = FE;
const zE = rt, UE = (e, t, r) => zE(t, e, r);
var qE = UE;
const KE = rt, GE = (e, t) => KE(e, t, !0);
var HE = GE;
const Vc = ke, XE = (e, t, r) => {
  const n = new Vc(e, r), s = new Vc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var gi = XE;
const JE = gi, WE = (e, t) => e.sort((r, n) => JE(r, n, t));
var BE = WE;
const YE = gi, QE = (e, t) => e.sort((r, n) => YE(n, r, t));
var ZE = QE;
const xE = rt, eb = (e, t, r) => xE(e, t, r) > 0;
var Is = eb;
const tb = rt, rb = (e, t, r) => tb(e, t, r) < 0;
var _i = rb;
const nb = rt, sb = (e, t, r) => nb(e, t, r) === 0;
var td = sb;
const ab = rt, ob = (e, t, r) => ab(e, t, r) !== 0;
var rd = ob;
const ib = rt, cb = (e, t, r) => ib(e, t, r) >= 0;
var vi = cb;
const lb = rt, ub = (e, t, r) => lb(e, t, r) <= 0;
var wi = ub;
const db = td, fb = rd, hb = Is, mb = vi, pb = _i, yb = wi, $b = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return db(e, r, n);
    case "!=":
      return fb(e, r, n);
    case ">":
      return hb(e, r, n);
    case ">=":
      return mb(e, r, n);
    case "<":
      return pb(e, r, n);
    case "<=":
      return yb(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var nd = $b;
const gb = ke, _b = Kr, { safeRe: zn, t: Un } = En, vb = (e, t) => {
  if (e instanceof gb)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? zn[Un.COERCEFULL] : zn[Un.COERCE]);
  else {
    const c = t.includePrerelease ? zn[Un.COERCERTLFULL] : zn[Un.COERCERTL];
    let d;
    for (; (d = c.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), c.lastIndex = d.index + d[1].length + d[2].length;
    c.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", o = t.includePrerelease && r[5] ? `-${r[5]}` : "", l = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return _b(`${n}.${s}.${a}${o}${l}`, t);
};
var wb = vb;
class Eb {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const r = this.map.get(t);
    if (r !== void 0)
      return this.map.delete(t), this.map.set(t, r), r;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, r) {
    if (!this.delete(t) && r !== void 0) {
      if (this.map.size >= this.max) {
        const s = this.map.keys().next().value;
        this.delete(s);
      }
      this.map.set(t, r);
    }
    return this;
  }
}
var bb = Eb, Bs, Lc;
function nt() {
  if (Lc) return Bs;
  Lc = 1;
  const e = /\s+/g;
  class t {
    constructor(A, V) {
      if (V = s(V), A instanceof t)
        return A.loose === !!V.loose && A.includePrerelease === !!V.includePrerelease ? A : new t(A.raw, V);
      if (A instanceof a)
        return this.raw = A.value, this.set = [[A]], this.formatted = void 0, this;
      if (this.options = V, this.loose = !!V.loose, this.includePrerelease = !!V.includePrerelease, this.raw = A.trim().replace(e, " "), this.set = this.raw.split("||").map((D) => this.parseRange(D.trim())).filter((D) => D.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const D = this.set[0];
        if (this.set = this.set.filter((G) => !_(G[0])), this.set.length === 0)
          this.set = [D];
        else if (this.set.length > 1) {
          for (const G of this.set)
            if (G.length === 1 && $(G[0])) {
              this.set = [G];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let A = 0; A < this.set.length; A++) {
          A > 0 && (this.formatted += "||");
          const V = this.set[A];
          for (let D = 0; D < V.length; D++)
            D > 0 && (this.formatted += " "), this.formatted += V[D].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(A) {
      const D = ((this.options.includePrerelease && g) | (this.options.loose && w)) + ":" + A, G = n.get(D);
      if (G)
        return G;
      const M = this.options.loose, P = M ? c[d.HYPHENRANGELOOSE] : c[d.HYPHENRANGE];
      A = A.replace(P, H(this.options.includePrerelease)), o("hyphen replace", A), A = A.replace(c[d.COMPARATORTRIM], u), o("comparator trim", A), A = A.replace(c[d.TILDETRIM], h), o("tilde trim", A), A = A.replace(c[d.CARETTRIM], E), o("caret trim", A);
      let p = A.split(" ").map((f) => v(f, this.options)).join(" ").split(/\s+/).map((f) => z(f, this.options));
      M && (p = p.filter((f) => (o("loose invalid filter", f, this.options), !!f.match(c[d.COMPARATORLOOSE])))), o("range list", p);
      const S = /* @__PURE__ */ new Map(), y = p.map((f) => new a(f, this.options));
      for (const f of y) {
        if (_(f))
          return [f];
        S.set(f.value, f);
      }
      S.size > 1 && S.has("") && S.delete("");
      const i = [...S.values()];
      return n.set(D, i), i;
    }
    intersects(A, V) {
      if (!(A instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((D) => m(D, V) && A.set.some((G) => m(G, V) && D.every((M) => G.every((P) => M.intersects(P, V)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(A) {
      if (!A)
        return !1;
      if (typeof A == "string")
        try {
          A = new l(A, this.options);
        } catch {
          return !1;
        }
      for (let V = 0; V < this.set.length; V++)
        if (oe(this.set[V], A, this.options))
          return !0;
      return !1;
    }
  }
  Bs = t;
  const r = bb, n = new r(), s = $i, a = Ts(), o = Os, l = ke, {
    safeRe: c,
    t: d,
    comparatorTrimReplace: u,
    tildeTrimReplace: h,
    caretTrimReplace: E
  } = En, { FLAG_INCLUDE_PRERELEASE: g, FLAG_LOOSE: w } = Rs, _ = (T) => T.value === "<0.0.0-0", $ = (T) => T.value === "", m = (T, A) => {
    let V = !0;
    const D = T.slice();
    let G = D.pop();
    for (; V && D.length; )
      V = D.every((M) => G.intersects(M, A)), G = D.pop();
    return V;
  }, v = (T, A) => (T = T.replace(c[d.BUILD], ""), o("comp", T, A), T = K(T, A), o("caret", T), T = R(T, A), o("tildes", T), T = de(T, A), o("xrange", T), T = ye(T, A), o("stars", T), T), N = (T) => !T || T.toLowerCase() === "x" || T === "*", R = (T, A) => T.trim().split(/\s+/).map((V) => O(V, A)).join(" "), O = (T, A) => {
    const V = A.loose ? c[d.TILDELOOSE] : c[d.TILDE];
    return T.replace(V, (D, G, M, P, p) => {
      o("tilde", T, D, G, M, P, p);
      let S;
      return N(G) ? S = "" : N(M) ? S = `>=${G}.0.0 <${+G + 1}.0.0-0` : N(P) ? S = `>=${G}.${M}.0 <${G}.${+M + 1}.0-0` : p ? (o("replaceTilde pr", p), S = `>=${G}.${M}.${P}-${p} <${G}.${+M + 1}.0-0`) : S = `>=${G}.${M}.${P} <${G}.${+M + 1}.0-0`, o("tilde return", S), S;
    });
  }, K = (T, A) => T.trim().split(/\s+/).map((V) => B(V, A)).join(" "), B = (T, A) => {
    o("caret", T, A);
    const V = A.loose ? c[d.CARETLOOSE] : c[d.CARET], D = A.includePrerelease ? "-0" : "";
    return T.replace(V, (G, M, P, p, S) => {
      o("caret", T, G, M, P, p, S);
      let y;
      return N(M) ? y = "" : N(P) ? y = `>=${M}.0.0${D} <${+M + 1}.0.0-0` : N(p) ? M === "0" ? y = `>=${M}.${P}.0${D} <${M}.${+P + 1}.0-0` : y = `>=${M}.${P}.0${D} <${+M + 1}.0.0-0` : S ? (o("replaceCaret pr", S), M === "0" ? P === "0" ? y = `>=${M}.${P}.${p}-${S} <${M}.${P}.${+p + 1}-0` : y = `>=${M}.${P}.${p}-${S} <${M}.${+P + 1}.0-0` : y = `>=${M}.${P}.${p}-${S} <${+M + 1}.0.0-0`) : (o("no pr"), M === "0" ? P === "0" ? y = `>=${M}.${P}.${p}${D} <${M}.${P}.${+p + 1}-0` : y = `>=${M}.${P}.${p}${D} <${M}.${+P + 1}.0-0` : y = `>=${M}.${P}.${p} <${+M + 1}.0.0-0`), o("caret return", y), y;
    });
  }, de = (T, A) => (o("replaceXRanges", T, A), T.split(/\s+/).map((V) => he(V, A)).join(" ")), he = (T, A) => {
    T = T.trim();
    const V = A.loose ? c[d.XRANGELOOSE] : c[d.XRANGE];
    return T.replace(V, (D, G, M, P, p, S) => {
      o("xRange", T, D, G, M, P, p, S);
      const y = N(M), i = y || N(P), f = i || N(p), b = f;
      return G === "=" && b && (G = ""), S = A.includePrerelease ? "-0" : "", y ? G === ">" || G === "<" ? D = "<0.0.0-0" : D = "*" : G && b ? (i && (P = 0), p = 0, G === ">" ? (G = ">=", i ? (M = +M + 1, P = 0, p = 0) : (P = +P + 1, p = 0)) : G === "<=" && (G = "<", i ? M = +M + 1 : P = +P + 1), G === "<" && (S = "-0"), D = `${G + M}.${P}.${p}${S}`) : i ? D = `>=${M}.0.0${S} <${+M + 1}.0.0-0` : f && (D = `>=${M}.${P}.0${S} <${M}.${+P + 1}.0-0`), o("xRange return", D), D;
    });
  }, ye = (T, A) => (o("replaceStars", T, A), T.trim().replace(c[d.STAR], "")), z = (T, A) => (o("replaceGTE0", T, A), T.trim().replace(c[A.includePrerelease ? d.GTE0PRE : d.GTE0], "")), H = (T) => (A, V, D, G, M, P, p, S, y, i, f, b) => (N(D) ? V = "" : N(G) ? V = `>=${D}.0.0${T ? "-0" : ""}` : N(M) ? V = `>=${D}.${G}.0${T ? "-0" : ""}` : P ? V = `>=${V}` : V = `>=${V}${T ? "-0" : ""}`, N(y) ? S = "" : N(i) ? S = `<${+y + 1}.0.0-0` : N(f) ? S = `<${y}.${+i + 1}.0-0` : b ? S = `<=${y}.${i}.${f}-${b}` : T ? S = `<${y}.${i}.${+f + 1}-0` : S = `<=${S}`, `${V} ${S}`.trim()), oe = (T, A, V) => {
    for (let D = 0; D < T.length; D++)
      if (!T[D].test(A))
        return !1;
    if (A.prerelease.length && !V.includePrerelease) {
      for (let D = 0; D < T.length; D++)
        if (o(T[D].semver), T[D].semver !== a.ANY && T[D].semver.prerelease.length > 0) {
          const G = T[D].semver;
          if (G.major === A.major && G.minor === A.minor && G.patch === A.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Bs;
}
var Ys, Fc;
function Ts() {
  if (Fc) return Ys;
  Fc = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(u, h) {
      if (h = r(h), u instanceof t) {
        if (u.loose === !!h.loose)
          return u;
        u = u.value;
      }
      u = u.trim().split(/\s+/).join(" "), o("comparator", u, h), this.options = h, this.loose = !!h.loose, this.parse(u), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(u) {
      const h = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], E = u.match(h);
      if (!E)
        throw new TypeError(`Invalid comparator: ${u}`);
      this.operator = E[1] !== void 0 ? E[1] : "", this.operator === "=" && (this.operator = ""), E[2] ? this.semver = new l(E[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(u) {
      if (o("Comparator.test", u, this.options.loose), this.semver === e || u === e)
        return !0;
      if (typeof u == "string")
        try {
          u = new l(u, this.options);
        } catch {
          return !1;
        }
      return a(u, this.operator, this.semver, this.options);
    }
    intersects(u, h) {
      if (!(u instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new c(u.value, h).test(this.value) : u.operator === "" ? u.value === "" ? !0 : new c(this.value, h).test(u.semver) : (h = r(h), h.includePrerelease && (this.value === "<0.0.0-0" || u.value === "<0.0.0-0") || !h.includePrerelease && (this.value.startsWith("<0.0.0") || u.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && u.operator.startsWith(">") || this.operator.startsWith("<") && u.operator.startsWith("<") || this.semver.version === u.semver.version && this.operator.includes("=") && u.operator.includes("=") || a(this.semver, "<", u.semver, h) && this.operator.startsWith(">") && u.operator.startsWith("<") || a(this.semver, ">", u.semver, h) && this.operator.startsWith("<") && u.operator.startsWith(">")));
    }
  }
  Ys = t;
  const r = $i, { safeRe: n, t: s } = En, a = nd, o = Os, l = ke, c = nt();
  return Ys;
}
const Sb = nt(), Pb = (e, t, r) => {
  try {
    t = new Sb(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var js = Pb;
const Nb = nt(), Rb = (e, t) => new Nb(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var Ob = Rb;
const Ib = ke, Tb = nt(), jb = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new Tb(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === -1) && (n = o, s = new Ib(n, r));
  }), n;
};
var Ab = jb;
const kb = ke, Cb = nt(), Db = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new Cb(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === 1) && (n = o, s = new kb(n, r));
  }), n;
};
var Mb = Db;
const Qs = ke, Vb = nt(), zc = Is, Lb = (e, t) => {
  e = new Vb(e, t);
  let r = new Qs("0.0.0");
  if (e.test(r) || (r = new Qs("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const s = e.set[n];
    let a = null;
    s.forEach((o) => {
      const l = new Qs(o.semver.version);
      switch (o.operator) {
        case ">":
          l.prerelease.length === 0 ? l.patch++ : l.prerelease.push(0), l.raw = l.format();
        case "":
        case ">=":
          (!a || zc(l, a)) && (a = l);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || zc(r, a)) && (r = a);
  }
  return r && e.test(r) ? r : null;
};
var Fb = Lb;
const zb = nt(), Ub = (e, t) => {
  try {
    return new zb(e, t).range || "*";
  } catch {
    return null;
  }
};
var qb = Ub;
const Kb = ke, sd = Ts(), { ANY: Gb } = sd, Hb = nt(), Xb = js, Uc = Is, qc = _i, Jb = wi, Wb = vi, Bb = (e, t, r, n) => {
  e = new Kb(e, n), t = new Hb(t, n);
  let s, a, o, l, c;
  switch (r) {
    case ">":
      s = Uc, a = Jb, o = qc, l = ">", c = ">=";
      break;
    case "<":
      s = qc, a = Wb, o = Uc, l = "<", c = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (Xb(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const u = t.set[d];
    let h = null, E = null;
    if (u.forEach((g) => {
      g.semver === Gb && (g = new sd(">=0.0.0")), h = h || g, E = E || g, s(g.semver, h.semver, n) ? h = g : o(g.semver, E.semver, n) && (E = g);
    }), h.operator === l || h.operator === c || (!E.operator || E.operator === l) && a(e, E.semver))
      return !1;
    if (E.operator === c && o(e, E.semver))
      return !1;
  }
  return !0;
};
var Ei = Bb;
const Yb = Ei, Qb = (e, t, r) => Yb(e, t, ">", r);
var Zb = Qb;
const xb = Ei, eS = (e, t, r) => xb(e, t, "<", r);
var tS = eS;
const Kc = nt(), rS = (e, t, r) => (e = new Kc(e, r), t = new Kc(t, r), e.intersects(t, r));
var nS = rS;
const sS = js, aS = rt;
var oS = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const o = e.sort((u, h) => aS(u, h, r));
  for (const u of o)
    sS(u, t, r) ? (a = u, s || (s = u)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const l = [];
  for (const [u, h] of n)
    u === h ? l.push(u) : !h && u === o[0] ? l.push("*") : h ? u === o[0] ? l.push(`<=${h}`) : l.push(`${u} - ${h}`) : l.push(`>=${u}`);
  const c = l.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return c.length < d.length ? c : t;
};
const Gc = nt(), bi = Ts(), { ANY: Zs } = bi, Zr = js, Si = rt, iS = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new Gc(e, r), t = new Gc(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const a of t.set) {
      const o = lS(s, a, r);
      if (n = n || o !== null, o)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, cS = [new bi(">=0.0.0-0")], Hc = [new bi(">=0.0.0")], lS = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Zs) {
    if (t.length === 1 && t[0].semver === Zs)
      return !0;
    r.includePrerelease ? e = cS : e = Hc;
  }
  if (t.length === 1 && t[0].semver === Zs) {
    if (r.includePrerelease)
      return !0;
    t = Hc;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const g of e)
    g.operator === ">" || g.operator === ">=" ? s = Xc(s, g, r) : g.operator === "<" || g.operator === "<=" ? a = Jc(a, g, r) : n.add(g.semver);
  if (n.size > 1)
    return null;
  let o;
  if (s && a) {
    if (o = Si(s.semver, a.semver, r), o > 0)
      return null;
    if (o === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const g of n) {
    if (s && !Zr(g, String(s), r) || a && !Zr(g, String(a), r))
      return null;
    for (const w of t)
      if (!Zr(g, String(w), r))
        return !1;
    return !0;
  }
  let l, c, d, u, h = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, E = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && a.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const g of t) {
    if (u = u || g.operator === ">" || g.operator === ">=", d = d || g.operator === "<" || g.operator === "<=", s) {
      if (E && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === E.major && g.semver.minor === E.minor && g.semver.patch === E.patch && (E = !1), g.operator === ">" || g.operator === ">=") {
        if (l = Xc(s, g, r), l === g && l !== s)
          return !1;
      } else if (s.operator === ">=" && !Zr(s.semver, String(g), r))
        return !1;
    }
    if (a) {
      if (h && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === h.major && g.semver.minor === h.minor && g.semver.patch === h.patch && (h = !1), g.operator === "<" || g.operator === "<=") {
        if (c = Jc(a, g, r), c === g && c !== a)
          return !1;
      } else if (a.operator === "<=" && !Zr(a.semver, String(g), r))
        return !1;
    }
    if (!g.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && u && !s && o !== 0 || E || h);
}, Xc = (e, t, r) => {
  if (!e)
    return t;
  const n = Si(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Jc = (e, t, r) => {
  if (!e)
    return t;
  const n = Si(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var uS = iS;
const xs = En, Wc = Rs, dS = ke, Bc = ed, fS = Kr, hS = _E, mS = EE, pS = SE, yS = NE, $S = IE, gS = AE, _S = DE, vS = LE, wS = rt, ES = qE, bS = HE, SS = gi, PS = BE, NS = ZE, RS = Is, OS = _i, IS = td, TS = rd, jS = vi, AS = wi, kS = nd, CS = wb, DS = Ts(), MS = nt(), VS = js, LS = Ob, FS = Ab, zS = Mb, US = Fb, qS = qb, KS = Ei, GS = Zb, HS = tS, XS = nS, JS = oS, WS = uS;
var BS = {
  parse: fS,
  valid: hS,
  clean: mS,
  inc: pS,
  diff: yS,
  major: $S,
  minor: gS,
  patch: _S,
  prerelease: vS,
  compare: wS,
  rcompare: ES,
  compareLoose: bS,
  compareBuild: SS,
  sort: PS,
  rsort: NS,
  gt: RS,
  lt: OS,
  eq: IS,
  neq: TS,
  gte: jS,
  lte: AS,
  cmp: kS,
  coerce: CS,
  Comparator: DS,
  Range: MS,
  satisfies: VS,
  toComparators: LS,
  maxSatisfying: FS,
  minSatisfying: zS,
  minVersion: US,
  validRange: qS,
  outside: KS,
  gtr: GS,
  ltr: HS,
  intersects: XS,
  simplifyRange: JS,
  subset: WS,
  SemVer: dS,
  re: xs.re,
  src: xs.src,
  tokens: xs.t,
  SEMVER_SPEC_VERSION: Wc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Wc.RELEASE_TYPES,
  compareIdentifiers: Bc.compareIdentifiers,
  rcompareIdentifiers: Bc.rcompareIdentifiers
};
const _r = /* @__PURE__ */ ll(BS), YS = Object.prototype.toString, QS = "[object Uint8Array]", ZS = "[object ArrayBuffer]";
function ad(e, t, r) {
  return e ? e.constructor === t ? !0 : YS.call(e) === r : !1;
}
function od(e) {
  return ad(e, Uint8Array, QS);
}
function xS(e) {
  return ad(e, ArrayBuffer, ZS);
}
function eP(e) {
  return od(e) || xS(e);
}
function tP(e) {
  if (!od(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function rP(e) {
  if (!eP(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function ea(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const s of e)
    tP(s), r.set(s, n), n += s.length;
  return r;
}
const qn = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Kn(e, t = "utf8") {
  return rP(e), qn[t] ?? (qn[t] = new globalThis.TextDecoder(t)), qn[t].decode(e);
}
function nP(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const sP = new globalThis.TextEncoder();
function ta(e) {
  return nP(e), sP.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Yc = "aes-256-cbc", id = /* @__PURE__ */ new Set([
  "aes-256-cbc",
  "aes-256-gcm",
  "aes-256-ctr"
]), aP = (e) => typeof e == "string" && id.has(e), mt = () => /* @__PURE__ */ Object.create(null), Qc = (e) => e !== void 0, ra = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Tt = "__internal__", na = `${Tt}.migrations.version`;
var At, kt, cr, De, qe, lr, ur, Tr, at, _e, cd, ld, ud, dd, fd, hd, md, pd;
class oP {
  constructor(t = {}) {
    Xe(this, _e);
    Xr(this, "path");
    Xr(this, "events");
    Xe(this, At);
    Xe(this, kt);
    Xe(this, cr);
    Xe(this, De);
    Xe(this, qe, {});
    Xe(this, lr, !1);
    Xe(this, ur);
    Xe(this, Tr);
    Xe(this, at);
    Xr(this, "_deserialize", (t) => JSON.parse(t));
    Xr(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
    const r = ft(this, _e, cd).call(this, t);
    Ce(this, De, r), ft(this, _e, ld).call(this, r), ft(this, _e, dd).call(this, r), ft(this, _e, fd).call(this, r), this.events = new EventTarget(), Ce(this, kt, r.encryptionKey), Ce(this, cr, r.encryptionAlgorithm ?? Yc), this.path = ft(this, _e, hd).call(this, r), ft(this, _e, md).call(this, r), r.watch && this._watch();
  }
  get(t, r) {
    if (Y(this, De).accessPropertiesByDotNotation)
      return this._get(t, r);
    const { store: n } = this;
    return t in n ? n[t] : r;
  }
  set(t, r) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${Tt} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, o) => {
      if (ra(a, o), Y(this, De).accessPropertiesByDotNotation)
        bn(n, a, o);
      else {
        if (a === "__proto__" || a === "constructor" || a === "prototype")
          return;
        n[a] = o;
      }
    };
    if (typeof t == "object") {
      const a = t;
      for (const [o, l] of Object.entries(a))
        s(o, l);
    } else
      s(t, r);
    this.store = n;
  }
  has(t) {
    return Y(this, De).accessPropertiesByDotNotation ? Ds(this.store, t) : t in this.store;
  }
  appendToArray(t, r) {
    ra(t, r);
    const n = Y(this, De).accessPropertiesByDotNotation ? this._get(t, []) : t in this.store ? this.store[t] : [];
    if (!Array.isArray(n))
      throw new TypeError(`The key \`${t}\` is already set to a non-array value`);
    this.set(t, [...n, r]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      Qc(Y(this, qe)[r]) && this.set(r, Y(this, qe)[r]);
  }
  delete(t) {
    const { store: r } = this;
    Y(this, De).accessPropertiesByDotNotation ? Od(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const t = mt();
    for (const r of Object.keys(Y(this, qe)))
      Qc(Y(this, qe)[r]) && (ra(r, Y(this, qe)[r]), Y(this, De).accessPropertiesByDotNotation ? bn(t, r, Y(this, qe)[r]) : t[r] = Y(this, qe)[r]);
    this.store = t;
  }
  onDidChange(t, r) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleValueChange(() => this.get(t), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleStoreChange(t);
  }
  get size() {
    return Object.keys(this.store).filter((r) => !this._isReservedKeyPath(r)).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    var t;
    try {
      const r = W.readFileSync(this.path, Y(this, kt) ? null : "utf8"), n = this._decryptData(r);
      return ((a) => {
        const o = this._deserialize(a);
        return Y(this, lr) || this._validate(o), Object.assign(mt(), o);
      })(n);
    } catch (r) {
      if ((r == null ? void 0 : r.code) === "ENOENT")
        return this._ensureDirectory(), mt();
      if (Y(this, De).clearInvalidConfig) {
        const n = r;
        if (n.name === "SyntaxError" || (t = n.message) != null && t.startsWith("Config schema violation:") || n.message === "Failed to decrypt config data.")
          return mt();
      }
      throw r;
    }
  }
  set store(t) {
    if (this._ensureDirectory(), !Ds(t, Tt))
      try {
        const r = W.readFileSync(this.path, Y(this, kt) ? null : "utf8"), n = this._decryptData(r), s = this._deserialize(n);
        Ds(s, Tt) && bn(t, Tt, Ii(s, Tt));
      } catch {
      }
    Y(this, lr) || this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, r] of Object.entries(this.store))
      this._isReservedKeyPath(t) || (yield [t, r]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    Y(this, ur) && (Y(this, ur).close(), Ce(this, ur, void 0)), Y(this, Tr) && (W.unwatchFile(this.path), Ce(this, Tr, !1)), Ce(this, at, void 0);
  }
  _decryptData(t) {
    const r = Y(this, kt);
    if (!r)
      return typeof t == "string" ? t : Kn(t);
    const n = Y(this, cr), s = n === "aes-256-gcm" ? 16 : 0, a = ":".codePointAt(0), o = typeof t == "string" ? t.codePointAt(16) : t[16];
    if (!(a !== void 0 && o === a)) {
      if (n === "aes-256-cbc")
        return typeof t == "string" ? t : Kn(t);
      throw new Error("Failed to decrypt config data.");
    }
    const c = (g) => {
      if (s === 0)
        return { ciphertext: g };
      const w = g.length - s;
      if (w < 0)
        throw new Error("Invalid authentication tag length.");
      return {
        ciphertext: g.slice(0, w),
        authenticationTag: g.slice(w)
      };
    }, d = t.slice(0, 16), u = t.slice(17), h = typeof u == "string" ? ta(u) : u, E = (g) => {
      const { ciphertext: w, authenticationTag: _ } = c(h), $ = Jr.pbkdf2Sync(r, g, 1e4, 32, "sha512"), m = Jr.createDecipheriv(n, $, d);
      return _ && m.setAuthTag(_), Kn(ea([m.update(w), m.final()]));
    };
    try {
      return E(d);
    } catch {
      try {
        return E(d.toString());
      } catch {
      }
    }
    if (n === "aes-256-cbc")
      return typeof t == "string" ? t : Kn(t);
    throw new Error("Failed to decrypt config data.");
  }
  _handleStoreChange(t) {
    let r = this.store;
    const n = () => {
      const s = r, a = this.store;
      Ri(a, s) || (r = a, t.call(this, a, s));
    };
    return this.events.addEventListener("change", n), () => {
      this.events.removeEventListener("change", n);
    };
  }
  _handleValueChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, o = t();
      Ri(o, a) || (n = o, r.call(this, o, a));
    };
    return this.events.addEventListener("change", s), () => {
      this.events.removeEventListener("change", s);
    };
  }
  _validate(t) {
    if (!Y(this, At) || Y(this, At).call(this, t) || !Y(this, At).errors)
      return;
    const n = Y(this, At).errors.map(({ instancePath: s, message: a = "" }) => `\`${s.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    W.mkdirSync(Z.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    const n = Y(this, kt);
    if (n) {
      const s = Jr.randomBytes(16), a = Jr.pbkdf2Sync(n, s, 1e4, 32, "sha512"), o = Jr.createCipheriv(Y(this, cr), a, s), l = ea([o.update(ta(r)), o.final()]), c = [s, ta(":"), l];
      Y(this, cr) === "aes-256-gcm" && c.push(o.getAuthTag()), r = ea(c);
    }
    if (fe.env.SNAP)
      W.writeFileSync(this.path, r, { mode: Y(this, De).configFileMode });
    else
      try {
        cl(this.path, r, { mode: Y(this, De).configFileMode });
      } catch (s) {
        if ((s == null ? void 0 : s.code) === "EXDEV") {
          W.writeFileSync(this.path, r, { mode: Y(this, De).configFileMode });
          return;
        }
        throw s;
      }
  }
  _watch() {
    if (this._ensureDirectory(), W.existsSync(this.path) || this._write(mt()), fe.platform === "win32" || fe.platform === "darwin") {
      Y(this, at) ?? Ce(this, at, Tc(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 }));
      const t = Z.dirname(this.path), r = Z.basename(this.path);
      Ce(this, ur, W.watch(t, { persistent: !1, encoding: "utf8" }, (n, s) => {
        s && s !== r || typeof Y(this, at) == "function" && Y(this, at).call(this);
      }));
    } else
      Y(this, at) ?? Ce(this, at, Tc(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 })), W.watchFile(this.path, { persistent: !1 }, (t, r) => {
        typeof Y(this, at) == "function" && Y(this, at).call(this);
      }), Ce(this, Tr, !0);
  }
  _migrate(t, r, n) {
    let s = this._get(na, "0.0.0");
    const a = Object.keys(t).filter((l) => this._shouldPerformMigration(l, s, r));
    let o = structuredClone(this.store);
    for (const l of a)
      try {
        n && n(this, {
          fromVersion: s,
          toVersion: l,
          finalVersion: r,
          versions: a
        });
        const c = t[l];
        c == null || c(this), this._set(na, l), s = l, o = structuredClone(this.store);
      } catch (c) {
        this.store = o;
        const d = c instanceof Error ? c.message : String(c);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${d}`);
      }
    (this._isVersionInRangeFormat(s) || !_r.eq(s, r)) && this._set(na, r);
  }
  _containsReservedKey(t) {
    return typeof t == "string" ? this._isReservedKeyPath(t) : !t || typeof t != "object" ? !1 : this._objectContainsReservedKey(t);
  }
  _objectContainsReservedKey(t) {
    if (!t || typeof t != "object")
      return !1;
    for (const [r, n] of Object.entries(t))
      if (this._isReservedKeyPath(r) || this._objectContainsReservedKey(n))
        return !0;
    return !1;
  }
  _isReservedKeyPath(t) {
    return t === Tt || t.startsWith(`${Tt}.`);
  }
  _isVersionInRangeFormat(t) {
    return _r.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && _r.satisfies(r, t) ? !1 : _r.satisfies(n, t) : !(_r.lte(t, r) || _r.gt(t, n));
  }
  _get(t, r) {
    return Ii(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    bn(n, t, r), this.store = n;
  }
}
At = new WeakMap(), kt = new WeakMap(), cr = new WeakMap(), De = new WeakMap(), qe = new WeakMap(), lr = new WeakMap(), ur = new WeakMap(), Tr = new WeakMap(), at = new WeakMap(), _e = new WeakSet(), cd = function(t) {
  const r = {
    configName: "config",
    fileExtension: "json",
    projectSuffix: "nodejs",
    clearInvalidConfig: !1,
    accessPropertiesByDotNotation: !0,
    configFileMode: 438,
    ...t
  };
  if (r.encryptionAlgorithm ?? (r.encryptionAlgorithm = Yc), !aP(r.encryptionAlgorithm))
    throw new TypeError(`The \`encryptionAlgorithm\` option must be one of: ${[...id].join(", ")}`);
  if (!r.cwd) {
    if (!r.projectName)
      throw new Error("Please specify the `projectName` option.");
    r.cwd = Ad(r.projectName, { suffix: r.projectSuffix }).config;
  }
  return typeof r.fileExtension == "string" && (r.fileExtension = r.fileExtension.replace(/^\.+/, "")), r;
}, ld = function(t) {
  if (!(t.schema ?? t.ajvOptions ?? t.rootSchema))
    return;
  if (t.schema && typeof t.schema != "object")
    throw new TypeError("The `schema` option must be an object.");
  const r = Bw.default, n = new D0.Ajv2020({
    allErrors: !0,
    useDefaults: !0,
    ...t.ajvOptions
  });
  r(n);
  const s = {
    ...t.rootSchema,
    type: "object",
    properties: t.schema
  };
  Ce(this, At, n.compile(s)), ft(this, _e, ud).call(this, t.schema);
}, ud = function(t) {
  const r = Object.entries(t ?? {});
  for (const [n, s] of r) {
    if (!s || typeof s != "object" || !Object.hasOwn(s, "default"))
      continue;
    const { default: a } = s;
    a !== void 0 && (Y(this, qe)[n] = a);
  }
}, dd = function(t) {
  t.defaults && Object.assign(Y(this, qe), t.defaults);
}, fd = function(t) {
  t.serialize && (this._serialize = t.serialize), t.deserialize && (this._deserialize = t.deserialize);
}, hd = function(t) {
  const r = typeof t.fileExtension == "string" ? t.fileExtension : void 0, n = r ? `.${r}` : "";
  return Z.resolve(t.cwd, `${t.configName ?? "config"}${n}`);
}, md = function(t) {
  if (t.migrations) {
    ft(this, _e, pd).call(this, t), this._validate(this.store);
    return;
  }
  const r = this.store, n = Object.assign(mt(), t.defaults ?? {}, r);
  this._validate(n);
  try {
    Oi.deepEqual(r, n);
  } catch {
    this.store = n;
  }
}, pd = function(t) {
  const { migrations: r, projectVersion: n } = t;
  if (r) {
    if (!n)
      throw new Error("Please specify the `projectVersion` option.");
    Ce(this, lr, !0);
    try {
      const s = this.store, a = Object.assign(mt(), t.defaults ?? {}, s);
      try {
        Oi.deepEqual(s, a);
      } catch {
        this._write(a);
      }
      this._migrate(r, n, t.beforeEachMigration);
    } finally {
      Ce(this, lr, !1);
    }
  }
};
const { app: ts, ipcMain: ba, shell: iP } = tl;
let Zc = !1;
const xc = () => {
  if (!ba || !ts)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: ts.getPath("userData"),
    appVersion: ts.getVersion()
  };
  return Zc || (ba.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Zc = !0), e;
};
class cP extends oP {
  constructor(t) {
    let r, n;
    if (fe.type === "renderer") {
      const s = tl.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else ba && ts && ({ defaultCwd: r, appVersion: n } = xc());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = Z.isAbsolute(t.cwd) ? t.cwd : Z.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    xc();
  }
  async openInEditor() {
    const t = await iP.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const yd = Z.dirname(Pd(import.meta.url)), Mt = new cP();
process.env.APP_ROOT = Z.join(yd, "..");
const ds = process.env.VITE_DEV_SERVER_URL, IP = Z.join(process.env.APP_ROOT, "dist-electron"), Pi = Z.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = ds ? Z.join(process.env.APP_ROOT, "public") : Pi;
let Q, xr = null;
const Gn = 400, Hn = 600;
function fs() {
  const e = Mt.get("windowX"), t = Mt.get("windowY");
  let r, n;
  if (e !== void 0 && t !== void 0)
    r = e, n = t;
  else {
    const s = vd.getPrimaryDisplay(), { width: a, height: o } = s.workAreaSize;
    r = Math.round((a - Gn) / 2), n = Math.round((o - Hn) / 2);
  }
  return Q = new wd({
    width: Gn,
    height: Hn,
    x: r,
    y: n,
    minWidth: Gn,
    maxWidth: Gn,
    minHeight: Hn,
    maxHeight: Hn,
    frame: !1,
    // 无边框窗口
    resizable: !1,
    // 不可调整大小
    fullscreenable: !1,
    maximizable: !1,
    titleBarStyle: "hidden",
    show: !1,
    // 初始不显示窗口，等托盘准备好后再显示
    icon: Z.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: Z.join(yd, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), Q.on("moved", () => {
    if (Q) {
      const [s, a] = Q.getPosition();
      Mt.set("windowX", s), Mt.set("windowY", a);
    }
  }), Q.on("close", (s) => {
    if ($d) {
      Q = null;
      return;
    }
    s.preventDefault(), Q == null || Q.hide();
  }), Q.webContents.on("did-finish-load", () => {
    Q == null || Q.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), ds ? Q.loadURL(ds) : Q.loadFile(Z.join(Pi, "index.html")), Q;
}
function lP() {
  const e = ds ? Z.join(process.env.VITE_PUBLIC, "icon.png") : Z.join(Pi, "book-a.png");
  xr = new Ed(e), xr.setToolTip("Dict - AI 词典工具");
  const t = bd.buildFromTemplate([
    {
      label: "显示/隐藏窗口",
      click: () => {
        sa();
      }
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        $d = !0, pt.quit();
      }
    }
  ]);
  xr.setContextMenu(t), xr.on("click", () => {
    sa();
  }), xr.on("double-click", () => {
    sa();
  });
}
function sa() {
  if (!Q) {
    fs();
    return;
  }
  Q.isVisible() ? Q.hide() : (Q.show(), Q.focus(), setTimeout(Sa, 300));
}
const uP = Z.join(pt.getPath("userData"), "dict-data");
tt.handle("window:minimize", () => {
  Q == null || Q.minimize();
});
tt.handle("window:close", () => {
  Q == null || Q.hide();
});
tt.handle("window:hide", () => {
  Q == null || Q.hide();
});
tt.handle("window:show", () => {
  Q && (Q.show(), Q.focus());
});
tt.handle("settings:get", () => Mt.get("settings", {}));
tt.handle("settings:set", (e, t) => (Mt.set("settings", t), !0));
tt.handle("data:getPath", () => uP);
tt.handle("history:load", () => Mt.get("history", []));
tt.handle("history:save", (e, t) => (Mt.set("history", t), !0));
tt.handle("favorites:export", async (e, t) => {
  try {
    const { filePath: r } = await rl.showSaveDialog({
      title: "导出收藏单词",
      defaultPath: `favorites_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`,
      filters: [
        { name: "JSON Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (!r)
      return { success: !1, cancelled: !0 };
    const n = {
      version: "1.0",
      exportDate: Date.now(),
      favorites: t
    };
    return W.writeFileSync(r, JSON.stringify(n, null, 2), "utf-8"), { success: !0, filePath: r };
  } catch (r) {
    return console.error("Export favorites failed:", r), { success: !1, error: String(r) };
  }
});
tt.handle("favorites:import", async () => {
  try {
    const { filePaths: e } = await rl.showOpenDialog({
      title: "导入收藏单词",
      filters: [
        { name: "JSON Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] }
      ],
      properties: ["openFile"]
    });
    if (!e || e.length === 0)
      return { success: !1, cancelled: !0 };
    const t = W.readFileSync(e[0], "utf-8"), r = JSON.parse(t);
    if (!r.favorites || !Array.isArray(r.favorites))
      return { success: !1, error: "Invalid file format: favorites array not found" };
    const n = r.favorites.filter((s) => s.id && s.word && s.queryData && s.createdAt);
    return {
      success: !0,
      favorites: n,
      totalCount: r.favorites.length,
      validCount: n.length
    };
  } catch (e) {
    return console.error("Import favorites failed:", e), { success: !1, error: String(e) };
  }
});
pt.on("window-all-closed", () => {
});
pt.on("activate", () => {
  Q === null ? fs() : Q.show();
});
let el = "";
function dP(e) {
  const t = e.trim();
  if (!t) return !1;
  const r = /[a-zA-Z]/.test(t), n = /^[\x00-\x7F]+$/.test(t);
  return r && n;
}
function Sa() {
  if (!Q) return;
  const e = Sd.readText().trim();
  e && dP(e) && e !== el && (el = e, Q.webContents.send("clipboard:content", e));
}
let $d = !1;
const fP = pt.requestSingleInstanceLock();
fP ? (pt.on("second-instance", () => {
  console.log("[electron] Second instance started, showing window..."), Q ? (Q.isMinimized() && Q.restore(), Q.show(), Q.focus(), setTimeout(Sa, 300)) : fs();
}), pt.whenReady().then(() => {
  console.log("[electron]", process.versions.electron), fs(), lP(), pt.on("browser-window-focus", () => {
    setTimeout(Sa, 300);
  });
})) : (console.log("[electron] Another instance is running, quitting..."), pt.quit());
export {
  IP as MAIN_DIST,
  Pi as RENDERER_DIST,
  ds as VITE_DEV_SERVER_URL
};
