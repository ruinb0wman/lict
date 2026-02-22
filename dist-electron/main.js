var Hu = Object.defineProperty;
var mi = (e) => {
  throw TypeError(e);
};
var Xu = (e, t, r) => t in e ? Hu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Fr = (e, t, r) => Xu(e, typeof t != "symbol" ? t + "" : t, r), Ss = (e, t, r) => t.has(e) || mi("Cannot " + r);
var te = (e, t, r) => (Ss(e, t, "read from private field"), r ? r.call(e) : t.get(e)), xe = (e, t, r) => t.has(e) ? mi("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), qe = (e, t, r, n) => (Ss(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), gt = (e, t, r) => (Ss(e, t, "access private method"), r);
import qc, { app as bt, ipcMain as ct, dialog as Kc, screen as Ju, BrowserWindow as Bu, Tray as Wu, Menu as Yu, clipboard as Qu } from "electron";
import x from "node:fs";
import { fileURLToPath as Zu } from "node:url";
import ne from "node:path";
import ye from "node:process";
import { promisify as Ae, isDeepStrictEqual as pi } from "node:util";
import zr from "node:crypto";
import yi from "node:assert";
import Gc from "node:os";
import "node:events";
import "node:stream";
const or = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, Hc = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), Xc = 1e6, xu = (e) => e >= "0" && e <= "9";
function Jc(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const t = Number.parseInt(e, 10);
    return t <= Number.MAX_SAFE_INTEGER && t <= Xc;
  }
  return !1;
}
function Ps(e, t) {
  return Hc.has(e) ? !1 : (e && Jc(e) ? t.push(Number.parseInt(e, 10)) : t.push(e), !0);
}
function ed(e) {
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
        if (!Ps(r, t))
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
          if ((r || n === "property") && !Ps(r, t))
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
            const c = Number.parseInt(r, 10);
            !Number.isNaN(c) && Number.isFinite(c) && c >= 0 && c <= Number.MAX_SAFE_INTEGER && c <= Xc && r === String(c) ? t.push(c) : t.push(r), r = "", n = "indexEnd";
          }
          break;
        }
        if (n === "indexEnd")
          throw new Error(`Invalid character '${o}' after an index at position ${a}`);
        r += o;
        break;
      }
      default: {
        if (n === "index" && !xu(o))
          throw new Error(`Invalid character '${o}' in an index at position ${a}`);
        if (n === "indexEnd")
          throw new Error(`Invalid character '${o}' after an index at position ${a}`);
        n === "start" && (n = "property"), r += o;
      }
    }
  }
  switch (s && (r += "\\"), n) {
    case "property": {
      if (!Ps(r, t))
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
function ss(e) {
  if (typeof e == "string")
    return ed(e);
  if (Array.isArray(e)) {
    const t = [];
    for (const [r, n] of e.entries()) {
      if (typeof n != "string" && typeof n != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${r}, got ${typeof n}`);
      if (typeof n == "number" && !Number.isFinite(n))
        throw new TypeError(`Path segment at index ${r} must be a finite number, got ${n}`);
      if (Hc.has(n))
        return [];
      typeof n == "string" && Jc(n) ? t.push(Number.parseInt(n, 10)) : t.push(n);
    }
    return t;
  }
  return [];
}
function $i(e, t, r) {
  if (!or(e) || typeof t != "string" && !Array.isArray(t))
    return r === void 0 ? e : r;
  const n = ss(t);
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
function pn(e, t, r) {
  if (!or(e) || typeof t != "string" && !Array.isArray(t))
    return e;
  const n = e, s = ss(t);
  if (s.length === 0)
    return e;
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    if (a === s.length - 1)
      e[o] = r;
    else if (!or(e[o])) {
      const l = typeof s[a + 1] == "number";
      e[o] = l ? [] : {};
    }
    e = e[o];
  }
  return n;
}
function td(e, t) {
  if (!or(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const r = ss(t);
  if (r.length === 0)
    return !1;
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (n === r.length - 1)
      return Object.hasOwn(e, s) ? (delete e[s], !0) : !1;
    if (e = e[s], !or(e))
      return !1;
  }
}
function Ns(e, t) {
  if (!or(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const r = ss(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!or(e) || !(n in e))
      return !1;
    e = e[n];
  }
  return !0;
}
const Lt = Gc.homedir(), pa = Gc.tmpdir(), { env: yr } = ye, rd = (e) => {
  const t = ne.join(Lt, "Library");
  return {
    data: ne.join(t, "Application Support", e),
    config: ne.join(t, "Preferences", e),
    cache: ne.join(t, "Caches", e),
    log: ne.join(t, "Logs", e),
    temp: ne.join(pa, e)
  };
}, nd = (e) => {
  const t = yr.APPDATA || ne.join(Lt, "AppData", "Roaming"), r = yr.LOCALAPPDATA || ne.join(Lt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: ne.join(r, e, "Data"),
    config: ne.join(t, e, "Config"),
    cache: ne.join(r, e, "Cache"),
    log: ne.join(r, e, "Log"),
    temp: ne.join(pa, e)
  };
}, sd = (e) => {
  const t = ne.basename(Lt);
  return {
    data: ne.join(yr.XDG_DATA_HOME || ne.join(Lt, ".local", "share"), e),
    config: ne.join(yr.XDG_CONFIG_HOME || ne.join(Lt, ".config"), e),
    cache: ne.join(yr.XDG_CACHE_HOME || ne.join(Lt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: ne.join(yr.XDG_STATE_HOME || ne.join(Lt, ".local", "state"), e),
    temp: ne.join(pa, t, e)
  };
};
function ad(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ye.platform === "darwin" ? rd(e) : ye.platform === "win32" ? nd(e) : sd(e);
}
const It = (e, t) => {
  const { onError: r } = t;
  return function(...s) {
    return e.apply(void 0, s).catch(r);
  };
}, _t = (e, t) => {
  const { onError: r } = t;
  return function(...s) {
    try {
      return e.apply(void 0, s);
    } catch (a) {
      return r(a);
    }
  };
}, od = 250, Tt = (e, t) => {
  const { isRetriable: r } = t;
  return function(s) {
    const { timeout: a } = s, o = s.interval ?? od, c = Date.now() + a;
    return function l(...d) {
      return e.apply(void 0, d).catch((u) => {
        if (!r(u) || Date.now() >= c)
          throw u;
        const h = Math.round(o * Math.random());
        return h > 0 ? new Promise((y) => setTimeout(y, h)).then(() => l.apply(void 0, d)) : l.apply(void 0, d);
      });
    };
  };
}, jt = (e, t) => {
  const { isRetriable: r } = t;
  return function(s) {
    const { timeout: a } = s, o = Date.now() + a;
    return function(...l) {
      for (; ; )
        try {
          return e.apply(void 0, l);
        } catch (d) {
          if (!r(d) || Date.now() >= o)
            throw d;
          continue;
        }
    };
  };
}, $r = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!$r.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !id && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!$r.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!$r.isNodeError(e))
      throw e;
    if (!$r.isChangeErrorOk(e))
      throw e;
  }
}, yn = {
  onError: $r.onChangeError
}, Je = {
  onError: () => {
  }
}, id = ye.getuid ? !ye.getuid() : !1, ke = {
  isRetriable: $r.isRetriableError
}, Me = {
  attempt: {
    /* ASYNC */
    chmod: It(Ae(x.chmod), yn),
    chown: It(Ae(x.chown), yn),
    close: It(Ae(x.close), Je),
    fsync: It(Ae(x.fsync), Je),
    mkdir: It(Ae(x.mkdir), Je),
    realpath: It(Ae(x.realpath), Je),
    stat: It(Ae(x.stat), Je),
    unlink: It(Ae(x.unlink), Je),
    /* SYNC */
    chmodSync: _t(x.chmodSync, yn),
    chownSync: _t(x.chownSync, yn),
    closeSync: _t(x.closeSync, Je),
    existsSync: _t(x.existsSync, Je),
    fsyncSync: _t(x.fsync, Je),
    mkdirSync: _t(x.mkdirSync, Je),
    realpathSync: _t(x.realpathSync, Je),
    statSync: _t(x.statSync, Je),
    unlinkSync: _t(x.unlinkSync, Je)
  },
  retry: {
    /* ASYNC */
    close: Tt(Ae(x.close), ke),
    fsync: Tt(Ae(x.fsync), ke),
    open: Tt(Ae(x.open), ke),
    readFile: Tt(Ae(x.readFile), ke),
    rename: Tt(Ae(x.rename), ke),
    stat: Tt(Ae(x.stat), ke),
    write: Tt(Ae(x.write), ke),
    writeFile: Tt(Ae(x.writeFile), ke),
    /* SYNC */
    closeSync: jt(x.closeSync, ke),
    fsyncSync: jt(x.fsyncSync, ke),
    openSync: jt(x.openSync, ke),
    readFileSync: jt(x.readFileSync, ke),
    renameSync: jt(x.renameSync, ke),
    statSync: jt(x.statSync, ke),
    writeSync: jt(x.writeSync, ke),
    writeFileSync: jt(x.writeFileSync, ke)
  }
}, cd = "utf8", gi = 438, ld = 511, ud = {}, dd = ye.geteuid ? ye.geteuid() : -1, fd = ye.getegid ? ye.getegid() : -1, hd = 1e3, md = !!ye.getuid;
ye.getuid && ye.getuid();
const _i = 128, pd = (e) => e instanceof Error && "code" in e, vi = (e) => typeof e == "string", Rs = (e) => e === void 0, yd = ye.platform === "linux", Bc = ye.platform === "win32", ya = ["SIGHUP", "SIGINT", "SIGTERM"];
Bc || ya.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
yd && ya.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class $d {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Bc && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? ye.kill(ye.pid, "SIGTERM") : ye.kill(ye.pid, t));
      }
    }, this.hook = () => {
      ye.once("exit", () => this.exit());
      for (const t of ya)
        try {
          ye.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const gd = new $d(), _d = gd.register, Ve = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${s}`;
  },
  get: (e, t, r = !0) => {
    const n = Ve.truncate(t(e));
    return n in Ve.store ? Ve.get(e, t, r) : (Ve.store[n] = r, [n, () => delete Ve.store[n]]);
  },
  purge: (e) => {
    Ve.store[e] && (delete Ve.store[e], Me.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Ve.store[e] && (delete Ve.store[e], Me.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Ve.store)
      Ve.purgeSync(e);
  },
  truncate: (e) => {
    const t = ne.basename(e);
    if (t.length <= _i)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - _i;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
_d(Ve.purgeSyncAll);
function Wc(e, t, r = ud) {
  if (vi(r))
    return Wc(e, t, { encoding: r });
  const s = { timeout: r.timeout ?? hd };
  let a = null, o = null, c = null;
  try {
    const l = Me.attempt.realpathSync(e), d = !!l;
    e = l || e, [o, a] = Ve.get(e, r.tmpCreate || Ve.create, r.tmpPurge !== !1);
    const u = md && Rs(r.chown), h = Rs(r.mode);
    if (d && (u || h)) {
      const w = Me.attempt.statSync(e);
      w && (r = { ...r }, u && (r.chown = { uid: w.uid, gid: w.gid }), h && (r.mode = w.mode));
    }
    if (!d) {
      const w = ne.dirname(e);
      Me.attempt.mkdirSync(w, {
        mode: ld,
        recursive: !0
      });
    }
    c = Me.retry.openSync(s)(o, "w", r.mode || gi), r.tmpCreated && r.tmpCreated(o), vi(t) ? Me.retry.writeSync(s)(c, t, 0, r.encoding || cd) : Rs(t) || Me.retry.writeSync(s)(c, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Me.retry.fsyncSync(s)(c) : Me.attempt.fsync(c)), Me.retry.closeSync(s)(c), c = null, r.chown && (r.chown.uid !== dd || r.chown.gid !== fd) && Me.attempt.chownSync(o, r.chown.uid, r.chown.gid), r.mode && r.mode !== gi && Me.attempt.chmodSync(o, r.mode);
    try {
      Me.retry.renameSync(s)(o, e);
    } catch (w) {
      if (!pd(w) || w.code !== "ENAMETOOLONG")
        throw w;
      Me.retry.renameSync(s)(o, Ve.truncate(e));
    }
    a(), o = null;
  } finally {
    c && Me.attempt.closeSync(c), o && Ve.purge(o);
  }
}
function Yc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ws = { exports: {} }, Qc = {}, it = {}, Pr = {}, cn = {}, se = {}, an = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(E) {
      if (super(), !e.IDENTIFIER.test(E))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = E;
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
    constructor(E) {
      super(), this._items = typeof E == "string" ? [E] : E;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const E = this._items[0];
      return E === "" || E === '""';
    }
    get str() {
      var E;
      return (E = this._str) !== null && E !== void 0 ? E : this._str = this._items.reduce((P, O) => `${P}${O}`, "");
    }
    get names() {
      var E;
      return (E = this._names) !== null && E !== void 0 ? E : this._names = this._items.reduce((P, O) => (O instanceof r && (P[O.str] = (P[O.str] || 0) + 1), P), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...E) {
    const P = [m[0]];
    let O = 0;
    for (; O < E.length; )
      c(P, E[O]), P.push(m[++O]);
    return new n(P);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...E) {
    const P = [y(m[0])];
    let O = 0;
    for (; O < E.length; )
      P.push(a), c(P, E[O]), P.push(a, y(m[++O]));
    return l(P), new n(P);
  }
  e.str = o;
  function c(m, E) {
    E instanceof n ? m.push(...E._items) : E instanceof r ? m.push(E) : m.push(h(E));
  }
  e.addCodeArg = c;
  function l(m) {
    let E = 1;
    for (; E < m.length - 1; ) {
      if (m[E] === a) {
        const P = d(m[E - 1], m[E + 1]);
        if (P !== void 0) {
          m.splice(E - 1, 3, P);
          continue;
        }
        m[E++] = "+";
      }
      E++;
    }
  }
  function d(m, E) {
    if (E === '""')
      return m;
    if (m === '""')
      return E;
    if (typeof m == "string")
      return E instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof E != "string" ? `${m.slice(0, -1)}${E}"` : E[0] === '"' ? m.slice(0, -1) + E.slice(1) : void 0;
    if (typeof E == "string" && E[0] === '"' && !(m instanceof r))
      return `"${m}${E.slice(1)}`;
  }
  function u(m, E) {
    return E.emptyStr() ? m : m.emptyStr() ? E : o`${m}${E}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : y(Array.isArray(m) ? m.join(",") : m);
  }
  function w(m) {
    return new n(y(m));
  }
  e.stringify = w;
  function y(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = y;
  function v(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = v;
  function g(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = g;
  function $(m) {
    return new n(m.toString());
  }
  e.regexpCode = $;
})(an);
var Ys = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = an;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
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
  class c extends s {
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
      const w = this.toName(d), { prefix: y } = w, v = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let g = this._values[y];
      if (g) {
        const E = g.get(v);
        if (E)
          return E;
      } else
        g = this._values[y] = /* @__PURE__ */ new Map();
      g.set(v, w);
      const $ = this._scope[y] || (this._scope[y] = []), m = $.length;
      return $[m] = u.ref, w.setValue(u, { property: y, itemIndex: m }), w;
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
      return this._reduceValues(d, (w) => {
        if (w.value === void 0)
          throw new Error(`CodeGen: name "${w}" has no value`);
        return w.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, w) {
      let y = t.nil;
      for (const v in d) {
        const g = d[v];
        if (!g)
          continue;
        const $ = h[v] = h[v] || /* @__PURE__ */ new Map();
        g.forEach((m) => {
          if ($.has(m))
            return;
          $.set(m, n.Started);
          let E = u(m);
          if (E) {
            const P = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            y = (0, t._)`${y}${P} ${m} = ${E};${this.opts._n}`;
          } else if (E = w == null ? void 0 : w(m))
            y = (0, t._)`${y}${E}${this.opts._n}`;
          else
            throw new r(m);
          $.set(m, n.Completed);
        });
      }
      return y;
    }
  }
  e.ValueScope = c;
})(Ys);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = an, r = Ys;
  var n = an;
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
  var s = Ys;
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
      const b = i ? r.varKinds.var : this.varKind, A = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${b} ${this.name}${A};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = j(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class c extends a {
    constructor(i, f, b) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = b;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = j(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return Q(i, this.rhs);
    }
  }
  class l extends c {
    constructor(i, f, b, A) {
      super(i, b, A), this.op = f;
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
  class w extends a {
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
      return this.code = j(this.code, i, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class y extends a {
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
      let A = b.length;
      for (; A--; ) {
        const k = b[A];
        k.optimizeNames(i, f) || (D(i, k.names), b.splice(A, 1));
      }
      return b.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => W(i, f.names), {});
    }
  }
  class v extends y {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class g extends y {
  }
  class $ extends v {
  }
  $.kind = "else";
  class m extends v {
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
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(U(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var b;
      if (this.else = (b = this.else) === null || b === void 0 ? void 0 : b.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = j(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return Q(i, this.condition), this.else && W(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class E extends v {
  }
  E.kind = "for";
  class P extends E {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = j(this.iteration, i, f), this;
    }
    get names() {
      return W(super.names, this.iteration.names);
    }
  }
  class O extends E {
    constructor(i, f, b, A) {
      super(), this.varKind = i, this.name = f, this.from = b, this.to = A;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: b, from: A, to: k } = this;
      return `for(${f} ${b}=${A}; ${b}<${k}; ${b}++)` + super.render(i);
    }
    get names() {
      const i = Q(super.names, this.from);
      return Q(i, this.to);
    }
  }
  class T extends E {
    constructor(i, f, b, A) {
      super(), this.loop = i, this.varKind = f, this.name = b, this.iterable = A;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = j(this.iterable, i, f), this;
    }
    get names() {
      return W(super.names, this.iterable.names);
    }
  }
  class G extends v {
    constructor(i, f, b) {
      super(), this.name = i, this.args = f, this.async = b;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  G.kind = "func";
  class Y extends y {
    render(i) {
      return "return " + super.render(i);
    }
  }
  Y.kind = "return";
  class ue extends v {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var b, A;
      return super.optimizeNames(i, f), (b = this.catch) === null || b === void 0 || b.optimizeNames(i, f), (A = this.finally) === null || A === void 0 || A.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && W(i, this.catch.names), this.finally && W(i, this.finally.names), i;
    }
  }
  class he extends v {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  he.kind = "catch";
  class $e extends v {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  $e.kind = "finally";
  class K {
    constructor(i, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = i, this._scope = new r.Scope({ parent: i }), this._nodes = [new g()];
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
    _def(i, f, b, A) {
      const k = this._scope.toName(f);
      return b !== void 0 && A && (this._constants[k.str] = b), this._leafNode(new o(i, k, b)), k;
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
      return this._leafNode(new c(i, f, b));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new l(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new w(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [b, A] of i)
        f.length > 1 && f.push(","), f.push(b), (b !== A || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, A));
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
      return this._for(new P(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, b, A, k = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const H = this._scope.toName(i);
      return this._for(new O(k, H, f, b), () => A(H));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, b, A = r.varKinds.const) {
      const k = this._scope.toName(i);
      if (this.opts.es5) {
        const H = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${H}.length`, (q) => {
          this.var(k, (0, t._)`${H}[${q}]`), b(k);
        });
      }
      return this._for(new T("of", A, k, f), () => b(k));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, b, A = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, b);
      const k = this._scope.toName(i);
      return this._for(new T("in", A, k, f), () => b(k));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(E);
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
      const f = new Y();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(Y);
    }
    // `try` statement
    try(i, f, b) {
      if (!f && !b)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const A = new ue();
      if (this._blockNode(A), this.code(i), f) {
        const k = this.name("e");
        this._currNode = A.catch = new he(k), f(k);
      }
      return b && (this._currNode = A.finally = new $e(), this.code(b)), this._endBlockNode(he, $e);
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
    func(i, f = t.nil, b, A) {
      return this._blockNode(new G(i, f, b)), A && this.code(A).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(G);
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
  e.CodeGen = K;
  function W(_, i) {
    for (const f in i)
      _[f] = (_[f] || 0) + (i[f] || 0);
    return _;
  }
  function Q(_, i) {
    return i instanceof t._CodeOrName ? W(_, i.names) : _;
  }
  function j(_, i, f) {
    if (_ instanceof t.Name)
      return b(_);
    if (!A(_))
      return _;
    return new t._Code(_._items.reduce((k, H) => (H instanceof t.Name && (H = b(H)), H instanceof t._Code ? k.push(...H._items) : k.push(H), k), []));
    function b(k) {
      const H = f[k.str];
      return H === void 0 || i[k.str] !== 1 ? k : (delete i[k.str], H);
    }
    function A(k) {
      return k instanceof t._Code && k._items.some((H) => H instanceof t.Name && i[H.str] === 1 && f[H.str] !== void 0);
    }
  }
  function D(_, i) {
    for (const f in i)
      _[f] = (_[f] || 0) - (i[f] || 0);
  }
  function U(_) {
    return typeof _ == "boolean" || typeof _ == "number" || _ === null ? !_ : (0, t._)`!${S(_)}`;
  }
  e.not = U;
  const L = p(e.operators.AND);
  function J(..._) {
    return _.reduce(L);
  }
  e.and = J;
  const z = p(e.operators.OR);
  function N(..._) {
    return _.reduce(z);
  }
  e.or = N;
  function p(_) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${_} ${S(f)}`;
  }
  function S(_) {
    return _ instanceof t.Name ? _ : (0, t._)`(${_})`;
  }
})(se);
var V = {};
Object.defineProperty(V, "__esModule", { value: !0 });
V.checkStrictMode = V.getErrorPath = V.Type = V.useFunc = V.setEvaluated = V.evaluatedPropsToName = V.mergeEvaluated = V.eachItem = V.unescapeJsonPointer = V.escapeJsonPointer = V.escapeFragment = V.unescapeFragment = V.schemaRefOrVal = V.schemaHasRulesButRef = V.schemaHasRules = V.checkUnknownRules = V.alwaysValidSchema = V.toHash = void 0;
const de = se, vd = an;
function wd(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
V.toHash = wd;
function Ed(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Zc(e, t), !xc(t, e.self.RULES.all));
}
V.alwaysValidSchema = Ed;
function Zc(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || rl(e, `unknown keyword: "${a}"`);
}
V.checkUnknownRules = Zc;
function xc(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
V.schemaHasRules = xc;
function bd(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
V.schemaHasRulesButRef = bd;
function Sd({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, de._)`${r}`;
  }
  return (0, de._)`${e}${t}${(0, de.getProperty)(n)}`;
}
V.schemaRefOrVal = Sd;
function Pd(e) {
  return el(decodeURIComponent(e));
}
V.unescapeFragment = Pd;
function Nd(e) {
  return encodeURIComponent($a(e));
}
V.escapeFragment = Nd;
function $a(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
V.escapeJsonPointer = $a;
function el(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
V.unescapeJsonPointer = el;
function Rd(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
V.eachItem = Rd;
function wi({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, c) => {
    const l = o === void 0 ? a : o instanceof de.Name ? (a instanceof de.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof de.Name ? (t(s, o, a), a) : r(a, o);
    return c === de.Name && !(l instanceof de.Name) ? n(s, l) : l;
  };
}
V.mergeEvaluated = {
  props: wi({
    mergeNames: (e, t, r) => e.if((0, de._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, de._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, de._)`${r} || {}`).code((0, de._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, de._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, de._)`${r} || {}`), ga(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: tl
  }),
  items: wi({
    mergeNames: (e, t, r) => e.if((0, de._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, de._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, de._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, de._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function tl(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, de._)`{}`);
  return t !== void 0 && ga(e, r, t), r;
}
V.evaluatedPropsToName = tl;
function ga(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, de._)`${t}${(0, de.getProperty)(n)}`, !0));
}
V.setEvaluated = ga;
const Ei = {};
function Od(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Ei[t.code] || (Ei[t.code] = new vd._Code(t.code))
  });
}
V.useFunc = Od;
var Qs;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Qs || (V.Type = Qs = {}));
function Id(e, t, r) {
  if (e instanceof de.Name) {
    const n = t === Qs.Num;
    return r ? n ? (0, de._)`"[" + ${e} + "]"` : (0, de._)`"['" + ${e} + "']"` : n ? (0, de._)`"/" + ${e}` : (0, de._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, de.getProperty)(e).toString() : "/" + $a(e);
}
V.getErrorPath = Id;
function rl(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
V.checkStrictMode = rl;
var Be = {};
Object.defineProperty(Be, "__esModule", { value: !0 });
const Ce = se, Td = {
  // validation function arguments
  data: new Ce.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Ce.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Ce.Name("instancePath"),
  parentData: new Ce.Name("parentData"),
  parentDataProperty: new Ce.Name("parentDataProperty"),
  rootData: new Ce.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Ce.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Ce.Name("vErrors"),
  // null or array of validation errors
  errors: new Ce.Name("errors"),
  // counter of validation errors
  this: new Ce.Name("this"),
  // "globals"
  self: new Ce.Name("self"),
  scope: new Ce.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Ce.Name("json"),
  jsonPos: new Ce.Name("jsonPos"),
  jsonLen: new Ce.Name("jsonLen"),
  jsonPart: new Ce.Name("jsonPart")
};
Be.default = Td;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = se, r = V, n = Be;
  e.keywordError = {
    message: ({ keyword: $ }) => (0, t.str)`must pass "${$}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: $, schemaType: m }) => m ? (0, t.str)`"${$}" keyword must be ${m} ($data)` : (0, t.str)`"${$}" keyword is invalid ($data)`
  };
  function s($, m = e.keywordError, E, P) {
    const { it: O } = $, { gen: T, compositeRule: G, allErrors: Y } = O, ue = h($, m, E);
    P ?? (G || Y) ? l(T, ue) : d(O, (0, t._)`[${ue}]`);
  }
  e.reportError = s;
  function a($, m = e.keywordError, E) {
    const { it: P } = $, { gen: O, compositeRule: T, allErrors: G } = P, Y = h($, m, E);
    l(O, Y), T || G || d(P, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o($, m) {
    $.assign(n.default.errors, m), $.if((0, t._)`${n.default.vErrors} !== null`, () => $.if(m, () => $.assign((0, t._)`${n.default.vErrors}.length`, m), () => $.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function c({ gen: $, keyword: m, schemaValue: E, data: P, errsCount: O, it: T }) {
    if (O === void 0)
      throw new Error("ajv implementation error");
    const G = $.name("err");
    $.forRange("i", O, n.default.errors, (Y) => {
      $.const(G, (0, t._)`${n.default.vErrors}[${Y}]`), $.if((0, t._)`${G}.instancePath === undefined`, () => $.assign((0, t._)`${G}.instancePath`, (0, t.strConcat)(n.default.instancePath, T.errorPath))), $.assign((0, t._)`${G}.schemaPath`, (0, t.str)`${T.errSchemaPath}/${m}`), T.opts.verbose && ($.assign((0, t._)`${G}.schema`, E), $.assign((0, t._)`${G}.data`, P));
    });
  }
  e.extendErrors = c;
  function l($, m) {
    const E = $.const("err", m);
    $.if((0, t._)`${n.default.vErrors} === null`, () => $.assign(n.default.vErrors, (0, t._)`[${E}]`), (0, t._)`${n.default.vErrors}.push(${E})`), $.code((0, t._)`${n.default.errors}++`);
  }
  function d($, m) {
    const { gen: E, validateName: P, schemaEnv: O } = $;
    O.$async ? E.throw((0, t._)`new ${$.ValidationError}(${m})`) : (E.assign((0, t._)`${P}.errors`, m), E.return(!1));
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
  function h($, m, E) {
    const { createErrors: P } = $.it;
    return P === !1 ? (0, t._)`{}` : w($, m, E);
  }
  function w($, m, E = {}) {
    const { gen: P, it: O } = $, T = [
      y(O, E),
      v($, E)
    ];
    return g($, m, T), P.object(...T);
  }
  function y({ errorPath: $ }, { instancePath: m }) {
    const E = m ? (0, t.str)`${$}${(0, r.getErrorPath)(m, r.Type.Str)}` : $;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, E)];
  }
  function v({ keyword: $, it: { errSchemaPath: m } }, { schemaPath: E, parentSchema: P }) {
    let O = P ? m : (0, t.str)`${m}/${$}`;
    return E && (O = (0, t.str)`${O}${(0, r.getErrorPath)(E, r.Type.Str)}`), [u.schemaPath, O];
  }
  function g($, { params: m, message: E }, P) {
    const { keyword: O, data: T, schemaValue: G, it: Y } = $, { opts: ue, propertyName: he, topSchemaRef: $e, schemaPath: K } = Y;
    P.push([u.keyword, O], [u.params, typeof m == "function" ? m($) : m || (0, t._)`{}`]), ue.messages && P.push([u.message, typeof E == "function" ? E($) : E]), ue.verbose && P.push([u.schema, G], [u.parentSchema, (0, t._)`${$e}${K}`], [n.default.data, T]), he && P.push([u.propertyName, he]);
  }
})(cn);
Object.defineProperty(Pr, "__esModule", { value: !0 });
Pr.boolOrEmptySchema = Pr.topBoolOrEmptySchema = void 0;
const jd = cn, Ad = se, kd = Be, Cd = {
  message: "boolean schema is false"
};
function Dd(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? nl(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(kd.default.data) : (t.assign((0, Ad._)`${n}.errors`, null), t.return(!0));
}
Pr.topBoolOrEmptySchema = Dd;
function Md(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), nl(e)) : r.var(t, !0);
}
Pr.boolOrEmptySchema = Md;
function nl(e, t) {
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
  (0, jd.reportError)(s, Cd, void 0, t);
}
var Ee = {}, ir = {};
Object.defineProperty(ir, "__esModule", { value: !0 });
ir.getRules = ir.isJSONType = void 0;
const Vd = ["string", "number", "integer", "boolean", "null", "object", "array"], Ld = new Set(Vd);
function Fd(e) {
  return typeof e == "string" && Ld.has(e);
}
ir.isJSONType = Fd;
function zd() {
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
ir.getRules = zd;
var St = {};
Object.defineProperty(St, "__esModule", { value: !0 });
St.shouldUseRule = St.shouldUseGroup = St.schemaHasRulesForType = void 0;
function Ud({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && sl(e, n);
}
St.schemaHasRulesForType = Ud;
function sl(e, t) {
  return t.rules.some((r) => al(e, r));
}
St.shouldUseGroup = sl;
function al(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
St.shouldUseRule = al;
Object.defineProperty(Ee, "__esModule", { value: !0 });
Ee.reportTypeError = Ee.checkDataTypes = Ee.checkDataType = Ee.coerceAndCheckDataType = Ee.getJSONTypes = Ee.getSchemaTypes = Ee.DataType = void 0;
const qd = ir, Kd = St, Gd = cn, ae = se, ol = V;
var vr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(vr || (Ee.DataType = vr = {}));
function Hd(e) {
  const t = il(e.type);
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
Ee.getSchemaTypes = Hd;
function il(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(qd.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
Ee.getJSONTypes = il;
function Xd(e, t) {
  const { gen: r, data: n, opts: s } = e, a = Jd(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Kd.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const c = _a(t, n, s.strictNumbers, vr.Wrong);
    r.if(c, () => {
      a.length ? Bd(e, t, a) : va(e);
    });
  }
  return o;
}
Ee.coerceAndCheckDataType = Xd;
const cl = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Jd(e, t) {
  return t ? e.filter((r) => cl.has(r) || t === "array" && r === "array") : [];
}
function Bd(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, ae._)`typeof ${s}`), c = n.let("coerced", (0, ae._)`undefined`);
  a.coerceTypes === "array" && n.if((0, ae._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, ae._)`${s}[0]`).assign(o, (0, ae._)`typeof ${s}`).if(_a(t, s, a.strictNumbers), () => n.assign(c, s))), n.if((0, ae._)`${c} !== undefined`);
  for (const d of r)
    (cl.has(d) || d === "array" && a.coerceTypes === "array") && l(d);
  n.else(), va(e), n.endIf(), n.if((0, ae._)`${c} !== undefined`, () => {
    n.assign(s, c), Wd(e, c);
  });
  function l(d) {
    switch (d) {
      case "string":
        n.elseIf((0, ae._)`${o} == "number" || ${o} == "boolean"`).assign(c, (0, ae._)`"" + ${s}`).elseIf((0, ae._)`${s} === null`).assign(c, (0, ae._)`""`);
        return;
      case "number":
        n.elseIf((0, ae._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(c, (0, ae._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, ae._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(c, (0, ae._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, ae._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(c, !1).elseIf((0, ae._)`${s} === "true" || ${s} === 1`).assign(c, !0);
        return;
      case "null":
        n.elseIf((0, ae._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(c, null);
        return;
      case "array":
        n.elseIf((0, ae._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(c, (0, ae._)`[${s}]`);
    }
  }
}
function Wd({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, ae._)`${t} !== undefined`, () => e.assign((0, ae._)`${t}[${r}]`, n));
}
function Zs(e, t, r, n = vr.Correct) {
  const s = n === vr.Correct ? ae.operators.EQ : ae.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, ae._)`${t} ${s} null`;
    case "array":
      a = (0, ae._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, ae._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, ae._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, ae._)`typeof ${t} ${s} ${e}`;
  }
  return n === vr.Correct ? a : (0, ae.not)(a);
  function o(c = ae.nil) {
    return (0, ae.and)((0, ae._)`typeof ${t} == "number"`, c, r ? (0, ae._)`isFinite(${t})` : ae.nil);
  }
}
Ee.checkDataType = Zs;
function _a(e, t, r, n) {
  if (e.length === 1)
    return Zs(e[0], t, r, n);
  let s;
  const a = (0, ol.toHash)(e);
  if (a.array && a.object) {
    const o = (0, ae._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, ae._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = ae.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, ae.and)(s, Zs(o, t, r, n));
  return s;
}
Ee.checkDataTypes = _a;
const Yd = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, ae._)`{type: ${e}}` : (0, ae._)`{type: ${t}}`
};
function va(e) {
  const t = Qd(e);
  (0, Gd.reportError)(t, Yd);
}
Ee.reportTypeError = va;
function Qd(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, ol.schemaRefOrVal)(e, n, "type");
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
var as = {};
Object.defineProperty(as, "__esModule", { value: !0 });
as.assignDefaults = void 0;
const ur = se, Zd = V;
function xd(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      bi(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => bi(e, a, s.default));
}
as.assignDefaults = xd;
function bi(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const c = (0, ur._)`${a}${(0, ur.getProperty)(t)}`;
  if (s) {
    (0, Zd.checkStrictMode)(e, `default is ignored for: ${c}`);
    return;
  }
  let l = (0, ur._)`${c} === undefined`;
  o.useDefaults === "empty" && (l = (0, ur._)`${l} || ${c} === null || ${c} === ""`), n.if(l, (0, ur._)`${c} = ${(0, ur.stringify)(r)}`);
}
var pt = {}, ce = {};
Object.defineProperty(ce, "__esModule", { value: !0 });
ce.validateUnion = ce.validateArray = ce.usePattern = ce.callValidateCode = ce.schemaProperties = ce.allSchemaProperties = ce.noPropertyInData = ce.propertyInData = ce.isOwnProperty = ce.hasPropFunc = ce.reportMissingProp = ce.checkMissingProp = ce.checkReportMissingProp = void 0;
const me = se, wa = V, At = Be, ef = V;
function tf(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(ba(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, me._)`${t}` }, !0), e.error();
  });
}
ce.checkReportMissingProp = tf;
function rf({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, me.or)(...n.map((a) => (0, me.and)(ba(e, t, a, r.ownProperties), (0, me._)`${s} = ${a}`)));
}
ce.checkMissingProp = rf;
function nf(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
ce.reportMissingProp = nf;
function ll(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, me._)`Object.prototype.hasOwnProperty`
  });
}
ce.hasPropFunc = ll;
function Ea(e, t, r) {
  return (0, me._)`${ll(e)}.call(${t}, ${r})`;
}
ce.isOwnProperty = Ea;
function sf(e, t, r, n) {
  const s = (0, me._)`${t}${(0, me.getProperty)(r)} !== undefined`;
  return n ? (0, me._)`${s} && ${Ea(e, t, r)}` : s;
}
ce.propertyInData = sf;
function ba(e, t, r, n) {
  const s = (0, me._)`${t}${(0, me.getProperty)(r)} === undefined`;
  return n ? (0, me.or)(s, (0, me.not)(Ea(e, t, r))) : s;
}
ce.noPropertyInData = ba;
function ul(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
ce.allSchemaProperties = ul;
function af(e, t) {
  return ul(t).filter((r) => !(0, wa.alwaysValidSchema)(e, t[r]));
}
ce.schemaProperties = af;
function of({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, c, l, d) {
  const u = d ? (0, me._)`${e}, ${t}, ${n}${s}` : t, h = [
    [At.default.instancePath, (0, me.strConcat)(At.default.instancePath, a)],
    [At.default.parentData, o.parentData],
    [At.default.parentDataProperty, o.parentDataProperty],
    [At.default.rootData, At.default.rootData]
  ];
  o.opts.dynamicRef && h.push([At.default.dynamicAnchors, At.default.dynamicAnchors]);
  const w = (0, me._)`${u}, ${r.object(...h)}`;
  return l !== me.nil ? (0, me._)`${c}.call(${l}, ${w})` : (0, me._)`${c}(${w})`;
}
ce.callValidateCode = of;
const cf = (0, me._)`new RegExp`;
function lf({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, me._)`${s.code === "new RegExp" ? cf : (0, ef.useFunc)(e, s)}(${r}, ${n})`
  });
}
ce.usePattern = lf;
function uf(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const c = t.let("valid", !0);
    return o(() => t.assign(c, !1)), c;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(c) {
    const l = t.const("len", (0, me._)`${r}.length`);
    t.forRange("i", 0, l, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: wa.Type.Num
      }, a), t.if((0, me.not)(a), c);
    });
  }
}
ce.validateArray = uf;
function df(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, wa.alwaysValidSchema)(s, l)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), c = t.name("_valid");
  t.block(() => r.forEach((l, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, c);
    t.assign(o, (0, me._)`${o} || ${c}`), e.mergeValidEvaluated(u, c) || t.if((0, me.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
ce.validateUnion = df;
Object.defineProperty(pt, "__esModule", { value: !0 });
pt.validateKeywordUsage = pt.validSchemaType = pt.funcKeywordCode = pt.macroKeywordCode = void 0;
const Fe = se, Qt = Be, ff = ce, hf = cn;
function mf(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, c = t.macro.call(o.self, s, a, o), l = dl(r, n, c);
  o.opts.validateSchema !== !1 && o.self.validateSchema(c, !0);
  const d = r.name("valid");
  e.subschema({
    schema: c,
    schemaPath: Fe.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: l,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
pt.macroKeywordCode = mf;
function pf(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: c, it: l } = e;
  $f(l, t);
  const d = !c && t.compile ? t.compile.call(l.self, a, o, l) : t.validate, u = dl(n, s, d), h = n.let("valid");
  e.block$data(h, w), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function w() {
    if (t.errors === !1)
      g(), t.modifying && Si(e), $(() => e.error());
    else {
      const m = t.async ? y() : v();
      t.modifying && Si(e), $(() => yf(e, m));
    }
  }
  function y() {
    const m = n.let("ruleErrs", null);
    return n.try(() => g((0, Fe._)`await `), (E) => n.assign(h, !1).if((0, Fe._)`${E} instanceof ${l.ValidationError}`, () => n.assign(m, (0, Fe._)`${E}.errors`), () => n.throw(E))), m;
  }
  function v() {
    const m = (0, Fe._)`${u}.errors`;
    return n.assign(m, null), g(Fe.nil), m;
  }
  function g(m = t.async ? (0, Fe._)`await ` : Fe.nil) {
    const E = l.opts.passContext ? Qt.default.this : Qt.default.self, P = !("compile" in t && !c || t.schema === !1);
    n.assign(h, (0, Fe._)`${m}${(0, ff.callValidateCode)(e, u, E, P)}`, t.modifying);
  }
  function $(m) {
    var E;
    n.if((0, Fe.not)((E = t.valid) !== null && E !== void 0 ? E : h), m);
  }
}
pt.funcKeywordCode = pf;
function Si(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Fe._)`${n.parentData}[${n.parentDataProperty}]`));
}
function yf(e, t) {
  const { gen: r } = e;
  r.if((0, Fe._)`Array.isArray(${t})`, () => {
    r.assign(Qt.default.vErrors, (0, Fe._)`${Qt.default.vErrors} === null ? ${t} : ${Qt.default.vErrors}.concat(${t})`).assign(Qt.default.errors, (0, Fe._)`${Qt.default.vErrors}.length`), (0, hf.extendErrors)(e);
  }, () => e.error());
}
function $f({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function dl(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Fe.stringify)(r) });
}
function gf(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
pt.validSchemaType = gf;
function _f({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((c) => !Object.prototype.hasOwnProperty.call(e, c)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const l = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(l);
    else
      throw new Error(l);
  }
}
pt.validateKeywordUsage = _f;
var Gt = {};
Object.defineProperty(Gt, "__esModule", { value: !0 });
Gt.extendSubschemaMode = Gt.extendSubschemaData = Gt.getSubschema = void 0;
const mt = se, fl = V;
function vf(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const c = e.schema[t];
    return r === void 0 ? {
      schema: c,
      schemaPath: (0, mt._)`${e.schemaPath}${(0, mt.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: c[r],
      schemaPath: (0, mt._)`${e.schemaPath}${(0, mt.getProperty)(t)}${(0, mt.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, fl.escapeFragment)(r)}`
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
Gt.getSubschema = vf;
function wf(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: c } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, w = c.let("data", (0, mt._)`${t.data}${(0, mt.getProperty)(r)}`, !0);
    l(w), e.errorPath = (0, mt.str)`${d}${(0, fl.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, mt._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof mt.Name ? s : c.let("data", s, !0);
    l(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function l(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
Gt.extendSubschemaData = wf;
function Ef(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Gt.extendSubschemaMode = Ef;
var Ie = {}, os = function e(t, r) {
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
}, hl = { exports: {} }, Ut = hl.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Ln(t, n, s, e, "", e);
};
Ut.keywords = {
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
Ut.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Ut.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Ut.skipKeywords = {
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
function Ln(e, t, r, n, s, a, o, c, l, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, c, l, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in Ut.arrayKeywords)
          for (var w = 0; w < h.length; w++)
            Ln(e, t, r, h[w], s + "/" + u + "/" + w, a, s, u, n, w);
      } else if (u in Ut.propsKeywords) {
        if (h && typeof h == "object")
          for (var y in h)
            Ln(e, t, r, h[y], s + "/" + u + "/" + bf(y), a, s, u, n, y);
      } else (u in Ut.keywords || e.allKeys && !(u in Ut.skipKeywords)) && Ln(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, c, l, d);
  }
}
function bf(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Sf = hl.exports;
Object.defineProperty(Ie, "__esModule", { value: !0 });
Ie.getSchemaRefs = Ie.resolveUrl = Ie.normalizeId = Ie._getFullPath = Ie.getFullPath = Ie.inlineRef = void 0;
const Pf = V, Nf = os, Rf = Sf, Of = /* @__PURE__ */ new Set([
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
function If(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !xs(e) : t ? ml(e) <= t : !1;
}
Ie.inlineRef = If;
const Tf = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function xs(e) {
  for (const t in e) {
    if (Tf.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(xs) || typeof r == "object" && xs(r))
      return !0;
  }
  return !1;
}
function ml(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !Of.has(r) && (typeof e[r] == "object" && (0, Pf.eachItem)(e[r], (n) => t += ml(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function pl(e, t = "", r) {
  r !== !1 && (t = wr(t));
  const n = e.parse(t);
  return yl(e, n);
}
Ie.getFullPath = pl;
function yl(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Ie._getFullPath = yl;
const jf = /#\/?$/;
function wr(e) {
  return e ? e.replace(jf, "") : "";
}
Ie.normalizeId = wr;
function Af(e, t, r) {
  return r = wr(r), e.resolve(t, r);
}
Ie.resolveUrl = Af;
const kf = /^[a-z_][-a-z0-9._]*$/i;
function Cf(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = wr(e[r] || t), a = { "": s }, o = pl(n, s, !1), c = {}, l = /* @__PURE__ */ new Set();
  return Rf(e, { allKeys: !0 }, (h, w, y, v) => {
    if (v === void 0)
      return;
    const g = o + w;
    let $ = a[v];
    typeof h[r] == "string" && ($ = m.call(this, h[r])), E.call(this, h.$anchor), E.call(this, h.$dynamicAnchor), a[w] = $;
    function m(P) {
      const O = this.opts.uriResolver.resolve;
      if (P = wr($ ? O($, P) : P), l.has(P))
        throw u(P);
      l.add(P);
      let T = this.refs[P];
      return typeof T == "string" && (T = this.refs[T]), typeof T == "object" ? d(h, T.schema, P) : P !== wr(g) && (P[0] === "#" ? (d(h, c[P], P), c[P] = h) : this.refs[P] = g), P;
    }
    function E(P) {
      if (typeof P == "string") {
        if (!kf.test(P))
          throw new Error(`invalid anchor "${P}"`);
        m.call(this, `#${P}`);
      }
    }
  }), c;
  function d(h, w, y) {
    if (w !== void 0 && !Nf(h, w))
      throw u(y);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Ie.getSchemaRefs = Cf;
Object.defineProperty(it, "__esModule", { value: !0 });
it.getData = it.KeywordCxt = it.validateFunctionCode = void 0;
const $l = Pr, Pi = Ee, Sa = St, Bn = Ee, Df = as, Yr = pt, Os = Gt, B = se, Z = Be, Mf = Ie, Pt = V, Ur = cn;
function Vf(e) {
  if (vl(e) && (wl(e), _l(e))) {
    zf(e);
    return;
  }
  gl(e, () => (0, $l.topBoolOrEmptySchema)(e));
}
it.validateFunctionCode = Vf;
function gl({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, B._)`${Z.default.data}, ${Z.default.valCxt}`, n.$async, () => {
    e.code((0, B._)`"use strict"; ${Ni(r, s)}`), Ff(e, s), e.code(a);
  }) : e.func(t, (0, B._)`${Z.default.data}, ${Lf(s)}`, n.$async, () => e.code(Ni(r, s)).code(a));
}
function Lf(e) {
  return (0, B._)`{${Z.default.instancePath}="", ${Z.default.parentData}, ${Z.default.parentDataProperty}, ${Z.default.rootData}=${Z.default.data}${e.dynamicRef ? (0, B._)`, ${Z.default.dynamicAnchors}={}` : B.nil}}={}`;
}
function Ff(e, t) {
  e.if(Z.default.valCxt, () => {
    e.var(Z.default.instancePath, (0, B._)`${Z.default.valCxt}.${Z.default.instancePath}`), e.var(Z.default.parentData, (0, B._)`${Z.default.valCxt}.${Z.default.parentData}`), e.var(Z.default.parentDataProperty, (0, B._)`${Z.default.valCxt}.${Z.default.parentDataProperty}`), e.var(Z.default.rootData, (0, B._)`${Z.default.valCxt}.${Z.default.rootData}`), t.dynamicRef && e.var(Z.default.dynamicAnchors, (0, B._)`${Z.default.valCxt}.${Z.default.dynamicAnchors}`);
  }, () => {
    e.var(Z.default.instancePath, (0, B._)`""`), e.var(Z.default.parentData, (0, B._)`undefined`), e.var(Z.default.parentDataProperty, (0, B._)`undefined`), e.var(Z.default.rootData, Z.default.data), t.dynamicRef && e.var(Z.default.dynamicAnchors, (0, B._)`{}`);
  });
}
function zf(e) {
  const { schema: t, opts: r, gen: n } = e;
  gl(e, () => {
    r.$comment && t.$comment && bl(e), Hf(e), n.let(Z.default.vErrors, null), n.let(Z.default.errors, 0), r.unevaluated && Uf(e), El(e), Bf(e);
  });
}
function Uf(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, B._)`${r}.evaluated`), t.if((0, B._)`${e.evaluated}.dynamicProps`, () => t.assign((0, B._)`${e.evaluated}.props`, (0, B._)`undefined`)), t.if((0, B._)`${e.evaluated}.dynamicItems`, () => t.assign((0, B._)`${e.evaluated}.items`, (0, B._)`undefined`));
}
function Ni(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, B._)`/*# sourceURL=${r} */` : B.nil;
}
function qf(e, t) {
  if (vl(e) && (wl(e), _l(e))) {
    Kf(e, t);
    return;
  }
  (0, $l.boolOrEmptySchema)(e, t);
}
function _l({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function vl(e) {
  return typeof e.schema != "boolean";
}
function Kf(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && bl(e), Xf(e), Jf(e);
  const a = n.const("_errs", Z.default.errors);
  El(e, a), n.var(t, (0, B._)`${a} === ${Z.default.errors}`);
}
function wl(e) {
  (0, Pt.checkUnknownRules)(e), Gf(e);
}
function El(e, t) {
  if (e.opts.jtd)
    return Ri(e, [], !1, t);
  const r = (0, Pi.getSchemaTypes)(e.schema), n = (0, Pi.coerceAndCheckDataType)(e, r);
  Ri(e, r, !n, t);
}
function Gf(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, Pt.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function Hf(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, Pt.checkStrictMode)(e, "default is ignored in the schema root");
}
function Xf(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, Mf.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function Jf(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function bl({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, B._)`${Z.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, B.str)`${n}/$comment`, c = e.scopeValue("root", { ref: t.root });
    e.code((0, B._)`${Z.default.self}.opts.$comment(${a}, ${o}, ${c}.schema)`);
  }
}
function Bf(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, B._)`${Z.default.errors} === 0`, () => t.return(Z.default.data), () => t.throw((0, B._)`new ${s}(${Z.default.vErrors})`)) : (t.assign((0, B._)`${n}.errors`, Z.default.vErrors), a.unevaluated && Wf(e), t.return((0, B._)`${Z.default.errors} === 0`));
}
function Wf({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof B.Name && e.assign((0, B._)`${t}.props`, r), n instanceof B.Name && e.assign((0, B._)`${t}.items`, n);
}
function Ri(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: c, opts: l, self: d } = e, { RULES: u } = d;
  if (a.$ref && (l.ignoreKeywordsWithRef || !(0, Pt.schemaHasRulesButRef)(a, u))) {
    s.block(() => Nl(e, "$ref", u.all.$ref.definition));
    return;
  }
  l.jtd || Yf(e, t), s.block(() => {
    for (const w of u.rules)
      h(w);
    h(u.post);
  });
  function h(w) {
    (0, Sa.shouldUseGroup)(a, w) && (w.type ? (s.if((0, Bn.checkDataType)(w.type, o, l.strictNumbers)), Oi(e, w), t.length === 1 && t[0] === w.type && r && (s.else(), (0, Bn.reportTypeError)(e)), s.endIf()) : Oi(e, w), c || s.if((0, B._)`${Z.default.errors} === ${n || 0}`));
  }
}
function Oi(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, Df.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, Sa.shouldUseRule)(n, a) && Nl(e, a.keyword, a.definition, t.type);
  });
}
function Yf(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (Qf(e, t), e.opts.allowUnionTypes || Zf(e, t), xf(e, e.dataTypes));
}
function Qf(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      Sl(e.dataTypes, r) || Pa(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), th(e, t);
  }
}
function Zf(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Pa(e, "use allowUnionTypes to allow union type keyword");
}
function xf(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, Sa.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => eh(t, o)) && Pa(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function eh(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function Sl(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function th(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    Sl(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Pa(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, Pt.checkStrictMode)(e, t, e.opts.strictTypes);
}
class Pl {
  constructor(t, r, n) {
    if ((0, Yr.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, Pt.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Rl(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Yr.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", Z.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, B.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, B.not)(t), void 0, r);
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
    this.fail((0, B._)`${r} !== undefined && (${(0, B.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? Ur.reportExtraError : Ur.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, Ur.reportError)(this, this.def.$dataError || Ur.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, Ur.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = B.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = B.nil, r = B.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, B.or)((0, B._)`${s} === undefined`, r)), t !== B.nil && n.assign(t, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== B.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, B.or)(o(), c());
    function o() {
      if (n.length) {
        if (!(r instanceof B.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(n) ? n : [n];
        return (0, B._)`${(0, Bn.checkDataTypes)(l, r, a.opts.strictNumbers, Bn.DataType.Wrong)}`;
      }
      return B.nil;
    }
    function c() {
      if (s.validateSchema) {
        const l = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, B._)`!${l}(${r})`;
      }
      return B.nil;
    }
  }
  subschema(t, r) {
    const n = (0, Os.getSubschema)(this.it, t);
    (0, Os.extendSubschemaData)(n, this.it, t), (0, Os.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return qf(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = Pt.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = Pt.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, B.Name)), !0;
  }
}
it.KeywordCxt = Pl;
function Nl(e, t, r, n) {
  const s = new Pl(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Yr.funcKeywordCode)(s, r) : "macro" in r ? (0, Yr.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Yr.funcKeywordCode)(s, r);
}
const rh = /^\/(?:[^~]|~0|~1)*$/, nh = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Rl(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return Z.default.rootData;
  if (e[0] === "/") {
    if (!rh.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = Z.default.rootData;
  } else {
    const d = nh.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const u = +d[1];
    if (s = d[2], s === "#") {
      if (u >= t)
        throw new Error(l("property/index", u));
      return n[t - u];
    }
    if (u > t)
      throw new Error(l("data", u));
    if (a = r[t - u], !s)
      return a;
  }
  let o = a;
  const c = s.split("/");
  for (const d of c)
    d && (a = (0, B._)`${a}${(0, B.getProperty)((0, Pt.unescapeJsonPointer)(d))}`, o = (0, B._)`${o} && ${a}`);
  return o;
  function l(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
it.getData = Rl;
var ln = {};
Object.defineProperty(ln, "__esModule", { value: !0 });
let sh = class extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
};
ln.default = sh;
var Or = {};
Object.defineProperty(Or, "__esModule", { value: !0 });
const Is = Ie;
let ah = class extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Is.resolveUrl)(t, r, n), this.missingSchema = (0, Is.normalizeId)((0, Is.getFullPath)(t, this.missingRef));
  }
};
Or.default = ah;
var ze = {};
Object.defineProperty(ze, "__esModule", { value: !0 });
ze.resolveSchema = ze.getCompilingSchema = ze.resolveRef = ze.compileSchema = ze.SchemaEnv = void 0;
const et = se, oh = ln, Bt = Be, at = Ie, Ii = V, ih = it;
let is = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, at.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
ze.SchemaEnv = is;
function Na(e) {
  const t = Ol.call(this, e);
  if (t)
    return t;
  const r = (0, at.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new et.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let c;
  e.$async && (c = o.scopeValue("Error", {
    ref: oh.default,
    code: (0, et._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = o.scopeName("validate");
  e.validateName = l;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: Bt.default.data,
    parentData: Bt.default.parentData,
    parentDataProperty: Bt.default.parentDataProperty,
    dataNames: [Bt.default.data],
    dataPathArr: [et.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, et.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: c,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: et.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, et._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, ih.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(Bt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const y = new Function(`${Bt.default.self}`, `${Bt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(l, { ref: y }), y.errors = null, y.schema = e.schema, y.schemaEnv = e, e.$async && (y.$async = !0), this.opts.code.source === !0 && (y.source = { validateName: l, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: v, items: g } = d;
      y.evaluated = {
        props: v instanceof et.Name ? void 0 : v,
        items: g instanceof et.Name ? void 0 : g,
        dynamicProps: v instanceof et.Name,
        dynamicItems: g instanceof et.Name
      }, y.source && (y.source.evaluated = (0, et.stringify)(y.evaluated));
    }
    return e.validate = y, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
ze.compileSchema = Na;
function ch(e, t, r) {
  var n;
  r = (0, at.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = dh.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: c } = this.opts;
    o && (a = new is({ schema: o, schemaId: c, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = lh.call(this, a);
}
ze.resolveRef = ch;
function lh(e) {
  return (0, at.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Na.call(this, e);
}
function Ol(e) {
  for (const t of this._compilations)
    if (uh(t, e))
      return t;
}
ze.getCompilingSchema = Ol;
function uh(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function dh(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || cs.call(this, e, t);
}
function cs(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, at._getFullPath)(this.opts.uriResolver, r);
  let s = (0, at.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Ts.call(this, r, e);
  const a = (0, at.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const c = cs.call(this, e, o);
    return typeof (c == null ? void 0 : c.schema) != "object" ? void 0 : Ts.call(this, r, c);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || Na.call(this, o), a === (0, at.normalizeId)(t)) {
      const { schema: c } = o, { schemaId: l } = this.opts, d = c[l];
      return d && (s = (0, at.resolveUrl)(this.opts.uriResolver, s, d)), new is({ schema: c, schemaId: l, root: e, baseId: s });
    }
    return Ts.call(this, r, o);
  }
}
ze.resolveSchema = cs;
const fh = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Ts(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const c of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const l = r[(0, Ii.unescapeFragment)(c)];
    if (l === void 0)
      return;
    r = l;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !fh.has(c) && d && (t = (0, at.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Ii.schemaHasRulesButRef)(r, this.RULES)) {
    const c = (0, at.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = cs.call(this, n, c);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new is({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const hh = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", mh = "Meta-schema for $data reference (JSON AnySchema extension proposal)", ph = "object", yh = [
  "$data"
], $h = {
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
}, gh = !1, _h = {
  $id: hh,
  description: mh,
  type: ph,
  required: yh,
  properties: $h,
  additionalProperties: gh
};
var Ra = {}, ls = { exports: {} };
const vh = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), Il = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function Tl(e) {
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
const wh = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function Ti(e) {
  return e.length = 0, !0;
}
function Eh(e, t, r) {
  if (e.length) {
    const n = Tl(e);
    if (n !== "")
      t.push(n);
    else
      return r.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function bh(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, o = !1, c = Eh;
  for (let l = 0; l < e.length; l++) {
    const d = e[l];
    if (!(d === "[" || d === "]"))
      if (d === ":") {
        if (a === !0 && (o = !0), !c(s, n, r))
          break;
        if (++t > 7) {
          r.error = !0;
          break;
        }
        l > 0 && e[l - 1] === ":" && (a = !0), n.push(":");
        continue;
      } else if (d === "%") {
        if (!c(s, n, r))
          break;
        c = Ti;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (c === Ti ? r.zone = s.join("") : o ? n.push(s.join("")) : n.push(Tl(s))), r.address = n.join(""), r;
}
function jl(e) {
  if (Sh(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = bh(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let r = t.address, n = t.address;
    return t.zone && (r += "%" + t.zone, n += "%25" + t.zone), { host: r, isIPV6: !0, escapedHost: n };
  }
}
function Sh(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
function Ph(e) {
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
function Nh(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function Rh(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    if (!Il(r)) {
      const n = jl(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var Al = {
  nonSimpleDomain: wh,
  recomposeAuthority: Rh,
  normalizeComponentEncoding: Nh,
  removeDotSegments: Ph,
  isIPv4: Il,
  isUUID: vh,
  normalizeIPv6: jl
};
const { isUUID: Oh } = Al, Ih = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function kl(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function Cl(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Dl(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function Th(e) {
  return e.secure = kl(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function jh(e) {
  if ((e.port === (kl(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function Ah(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(Ih);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, a = Oa(s);
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function kh(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = Oa(s);
  a && (e = a.serialize(e, t));
  const o = e, c = e.nss;
  return o.path = `${n || t.nid}:${c}`, t.skipEscape = !0, o;
}
function Ch(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !Oh(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function Dh(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Ml = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: Cl,
    serialize: Dl
  }
), Mh = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Ml.domainHost,
    parse: Cl,
    serialize: Dl
  }
), Fn = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: Th,
    serialize: jh
  }
), Vh = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: Fn.domainHost,
    parse: Fn.parse,
    serialize: Fn.serialize
  }
), Lh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: Ah,
    serialize: kh,
    skipNormalize: !0
  }
), Fh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: Ch,
    serialize: Dh,
    skipNormalize: !0
  }
), Wn = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Ml,
    https: Mh,
    ws: Fn,
    wss: Vh,
    urn: Lh,
    "urn:uuid": Fh
  }
);
Object.setPrototypeOf(Wn, null);
function Oa(e) {
  return e && (Wn[
    /** @type {SchemeName} */
    e
  ] || Wn[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var zh = {
  SCHEMES: Wn,
  getSchemeHandler: Oa
};
const { normalizeIPv6: Uh, removeDotSegments: Jr, recomposeAuthority: qh, normalizeComponentEncoding: $n, isIPv4: Kh, nonSimpleDomain: Gh } = Al, { SCHEMES: Hh, getSchemeHandler: Vl } = zh;
function Xh(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  yt(Rt(e, t), t) : typeof e == "object" && (e = /** @type {T} */
  Rt(yt(e, t), t)), e;
}
function Jh(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = Ll(Rt(e, n), Rt(t, n), n, !0);
  return n.skipEscape = !0, yt(s, n);
}
function Ll(e, t, r, n) {
  const s = {};
  return n || (e = Rt(yt(e, r), r), t = Rt(yt(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Jr(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Jr(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = Jr(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = Jr(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function Bh(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = yt($n(Rt(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = yt($n(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = yt($n(Rt(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = yt($n(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
}
function yt(e, t) {
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
  }, n = Object.assign({}, t), s = [], a = Vl(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = qh(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let c = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (c = Jr(c)), o === void 0 && c[0] === "/" && c[1] === "/" && (c = "/%2F" + c.slice(2)), s.push(c);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const Wh = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function Rt(e, t) {
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
  const a = e.match(Wh);
  if (a) {
    if (n.scheme = a[1], n.userinfo = a[3], n.host = a[4], n.port = parseInt(a[5], 10), n.path = a[6] || "", n.query = a[7], n.fragment = a[8], isNaN(n.port) && (n.port = a[5]), n.host)
      if (Kh(n.host) === !1) {
        const l = Uh(n.host);
        n.host = l.host.toLowerCase(), s = l.isIPV6;
      } else
        s = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const o = Vl(r.scheme || n.scheme);
    if (!r.unicodeSupport && (!o || !o.unicodeSupport) && n.host && (r.domainHost || o && o.domainHost) && s === !1 && Gh(n.host))
      try {
        n.host = URL.domainToASCII(n.host.toLowerCase());
      } catch (c) {
        n.error = n.error || "Host's domain name can not be converted to ASCII: " + c;
      }
    (!o || o && !o.skipNormalize) && (e.indexOf("%") !== -1 && (n.scheme !== void 0 && (n.scheme = unescape(n.scheme)), n.host !== void 0 && (n.host = unescape(n.host))), n.path && (n.path = escape(unescape(n.path))), n.fragment && (n.fragment = encodeURI(decodeURIComponent(n.fragment)))), o && o.parse && o.parse(n, r);
  } else
    n.error = n.error || "URI can not be parsed.";
  return n;
}
const Ia = {
  SCHEMES: Hh,
  normalize: Xh,
  resolve: Jh,
  resolveComponent: Ll,
  equal: Bh,
  serialize: yt,
  parse: Rt
};
ls.exports = Ia;
ls.exports.default = Ia;
ls.exports.fastUri = Ia;
var Fl = ls.exports;
Object.defineProperty(Ra, "__esModule", { value: !0 });
const zl = Fl;
zl.code = 'require("ajv/dist/runtime/uri").default';
Ra.default = zl;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = it;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = se;
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
  const n = ln, s = Or, a = ir, o = ze, c = se, l = Ie, d = Ee, u = V, h = _h, w = Ra, y = (N, p) => new RegExp(N, p);
  y.code = "new RegExp";
  const v = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
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
  }, E = 200;
  function P(N) {
    var p, S, _, i, f, b, A, k, H, q, R, I, C, M, X, ee, ge, Le, Se, Pe, _e, dt, je, Ht, Xt;
    const Ze = N.strict, Jt = (p = N.code) === null || p === void 0 ? void 0 : p.optimize, Vr = Jt === !0 || Jt === void 0 ? 1 : Jt || 0, Lr = (_ = (S = N.code) === null || S === void 0 ? void 0 : S.regExp) !== null && _ !== void 0 ? _ : y, bs = (i = N.uriResolver) !== null && i !== void 0 ? i : w.default;
    return {
      strictSchema: (b = (f = N.strictSchema) !== null && f !== void 0 ? f : Ze) !== null && b !== void 0 ? b : !0,
      strictNumbers: (k = (A = N.strictNumbers) !== null && A !== void 0 ? A : Ze) !== null && k !== void 0 ? k : !0,
      strictTypes: (q = (H = N.strictTypes) !== null && H !== void 0 ? H : Ze) !== null && q !== void 0 ? q : "log",
      strictTuples: (I = (R = N.strictTuples) !== null && R !== void 0 ? R : Ze) !== null && I !== void 0 ? I : "log",
      strictRequired: (M = (C = N.strictRequired) !== null && C !== void 0 ? C : Ze) !== null && M !== void 0 ? M : !1,
      code: N.code ? { ...N.code, optimize: Vr, regExp: Lr } : { optimize: Vr, regExp: Lr },
      loopRequired: (X = N.loopRequired) !== null && X !== void 0 ? X : E,
      loopEnum: (ee = N.loopEnum) !== null && ee !== void 0 ? ee : E,
      meta: (ge = N.meta) !== null && ge !== void 0 ? ge : !0,
      messages: (Le = N.messages) !== null && Le !== void 0 ? Le : !0,
      inlineRefs: (Se = N.inlineRefs) !== null && Se !== void 0 ? Se : !0,
      schemaId: (Pe = N.schemaId) !== null && Pe !== void 0 ? Pe : "$id",
      addUsedSchema: (_e = N.addUsedSchema) !== null && _e !== void 0 ? _e : !0,
      validateSchema: (dt = N.validateSchema) !== null && dt !== void 0 ? dt : !0,
      validateFormats: (je = N.validateFormats) !== null && je !== void 0 ? je : !0,
      unicodeRegExp: (Ht = N.unicodeRegExp) !== null && Ht !== void 0 ? Ht : !0,
      int32range: (Xt = N.int32range) !== null && Xt !== void 0 ? Xt : !0,
      uriResolver: bs
    };
  }
  class O {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...P(p) };
      const { es5: S, lines: _ } = this.opts.code;
      this.scope = new c.ValueScope({ scope: {}, prefixes: g, es5: S, lines: _ }), this.logger = W(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), T.call(this, $, p, "NOT SUPPORTED"), T.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = $e.call(this), p.formats && ue.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && he.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), Y.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: _ } = this.opts;
      let i = h;
      _ === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[_], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let _;
      if (typeof p == "string") {
        if (_ = this.getSchema(p), !_)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        _ = this.compile(p);
      const i = _(S);
      return "$async" in _ || (this.errors = _.errors), i;
    }
    compile(p, S) {
      const _ = this._addSchema(p, S);
      return _.validate || this._compileSchemaEnv(_);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: _ } = this.opts;
      return i.call(this, p, S);
      async function i(q, R) {
        await f.call(this, q.$schema);
        const I = this._addSchema(q, R);
        return I.validate || b.call(this, I);
      }
      async function f(q) {
        q && !this.getSchema(q) && await i.call(this, { $ref: q }, !0);
      }
      async function b(q) {
        try {
          return this._compileSchemaEnv(q);
        } catch (R) {
          if (!(R instanceof s.default))
            throw R;
          return A.call(this, R), await k.call(this, R.missingSchema), b.call(this, q);
        }
      }
      function A({ missingSchema: q, missingRef: R }) {
        if (this.refs[q])
          throw new Error(`AnySchema ${q} is loaded but ${R} cannot be resolved`);
      }
      async function k(q) {
        const R = await H.call(this, q);
        this.refs[q] || await f.call(this, R.$schema), this.refs[q] || this.addSchema(R, q, S);
      }
      async function H(q) {
        const R = this._loading[q];
        if (R)
          return R;
        try {
          return await (this._loading[q] = _(q));
        } finally {
          delete this._loading[q];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, _, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, _, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (f = p[b], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, l.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, _, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, _ = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, _), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let _;
      if (_ = p.$schema, _ !== void 0 && typeof _ != "string")
        throw new Error("$schema must be a string");
      if (_ = _ || this.opts.defaultMeta || this.defaultMeta(), !_)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate(_, p);
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
      for (; typeof (S = G.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: _ } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: _ });
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
          const S = G.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let _ = p[this.opts.schemaId];
          return _ && (_ = (0, l.normalizeId)(_), delete this.schemas[_], delete this.refs[_]), this;
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
      let _;
      if (typeof p == "string")
        _ = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = _);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, _ = S.keyword, Array.isArray(_) && !_.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (j.call(this, _, S), !S)
        return (0, u.eachItem)(_, (f) => D.call(this, f)), this;
      L.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)(_, i.type.length === 0 ? (f) => D.call(this, f, i) : (f) => i.type.forEach((b) => D.call(this, f, i, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const _ of S.rules) {
        const i = _.rules.findIndex((f) => f.keyword === p);
        i >= 0 && _.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: _ = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${_}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const _ = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let b = p;
        for (const A of f)
          b = b[A];
        for (const A in _) {
          const k = _[A];
          if (typeof k != "object")
            continue;
          const { $data: H } = k.definition, q = b[A];
          H && q && (b[A] = z(q));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const _ in p) {
        const i = p[_];
        (!S || S.test(_)) && (typeof i == "string" ? delete p[_] : i && !i.meta && (this._cache.delete(i.schema), delete p[_]));
      }
    }
    _addSchema(p, S, _, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let b;
      const { schemaId: A } = this.opts;
      if (typeof p == "object")
        b = p[A];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let k = this._cache.get(p);
      if (k !== void 0)
        return k;
      _ = (0, l.normalizeId)(b || _);
      const H = l.getSchemaRefs.call(this, p, _);
      return k = new o.SchemaEnv({ schema: p, schemaId: A, meta: S, baseId: _, localRefs: H }), this._cache.set(k.schema, k), f && !_.startsWith("#") && (_ && this._checkUnique(_), this.refs[_] = k), i && this.validateSchema(p, !0), k;
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
  O.ValidationError = n.default, O.MissingRefError = s.default, e.default = O;
  function T(N, p, S, _ = "error") {
    for (const i in N) {
      const f = i;
      f in p && this.logger[_](`${S}: option ${i}. ${N[f]}`);
    }
  }
  function G(N) {
    return N = (0, l.normalizeId)(N), this.schemas[N] || this.refs[N];
  }
  function Y() {
    const N = this.opts.schemas;
    if (N)
      if (Array.isArray(N))
        this.addSchema(N);
      else
        for (const p in N)
          this.addSchema(N[p], p);
  }
  function ue() {
    for (const N in this.opts.formats) {
      const p = this.opts.formats[N];
      p && this.addFormat(N, p);
    }
  }
  function he(N) {
    if (Array.isArray(N)) {
      this.addVocabulary(N);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in N) {
      const S = N[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function $e() {
    const N = { ...this.opts };
    for (const p of v)
      delete N[p];
    return N;
  }
  const K = { log() {
  }, warn() {
  }, error() {
  } };
  function W(N) {
    if (N === !1)
      return K;
    if (N === void 0)
      return console;
    if (N.log && N.warn && N.error)
      return N;
    throw new Error("logger must implement log, warn and error methods");
  }
  const Q = /^[a-z_$][a-z0-9_$:-]*$/i;
  function j(N, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(N, (_) => {
      if (S.keywords[_])
        throw new Error(`Keyword ${_} is already defined`);
      if (!Q.test(_))
        throw new Error(`Keyword ${_} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function D(N, p, S) {
    var _;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let b = i ? f.post : f.rules.find(({ type: k }) => k === S);
    if (b || (b = { type: S, rules: [] }, f.rules.push(b)), f.keywords[N] = !0, !p)
      return;
    const A = {
      keyword: N,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? U.call(this, b, A, p.before) : b.rules.push(A), f.all[N] = A, (_ = p.implements) === null || _ === void 0 || _.forEach((k) => this.addKeyword(k));
  }
  function U(N, p, S) {
    const _ = N.rules.findIndex((i) => i.keyword === S);
    _ >= 0 ? N.rules.splice(_, 0, p) : (N.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function L(N) {
    let { metaSchema: p } = N;
    p !== void 0 && (N.$data && this.opts.$data && (p = z(p)), N.validateSchema = this.compile(p, !0));
  }
  const J = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function z(N) {
    return { anyOf: [N, J] };
  }
})(Qc);
var Ta = {}, ja = {}, Aa = {};
Object.defineProperty(Aa, "__esModule", { value: !0 });
const Yh = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
Aa.default = Yh;
var Ot = {};
Object.defineProperty(Ot, "__esModule", { value: !0 });
Ot.callRef = Ot.getValidate = void 0;
const Qh = Or, ji = ce, Ge = se, dr = Be, Ai = ze, gn = V, Zh = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: c, self: l } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = Ai.resolveRef.call(l, d, s, r);
    if (u === void 0)
      throw new Qh.default(n.opts.uriResolver, s, r);
    if (u instanceof Ai.SchemaEnv)
      return w(u);
    return y(u);
    function h() {
      if (a === d)
        return zn(e, o, a, a.$async);
      const v = t.scopeValue("root", { ref: d });
      return zn(e, (0, Ge._)`${v}.validate`, d, d.$async);
    }
    function w(v) {
      const g = Ul(e, v);
      zn(e, g, v, v.$async);
    }
    function y(v) {
      const g = t.scopeValue("schema", c.code.source === !0 ? { ref: v, code: (0, Ge.stringify)(v) } : { ref: v }), $ = t.name("valid"), m = e.subschema({
        schema: v,
        dataTypes: [],
        schemaPath: Ge.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, $);
      e.mergeEvaluated(m), e.ok($);
    }
  }
};
function Ul(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Ge._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
Ot.getValidate = Ul;
function zn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: c, opts: l } = a, d = l.passContext ? dr.default.this : Ge.nil;
  n ? u() : h();
  function u() {
    if (!c.$async)
      throw new Error("async schema referenced by sync schema");
    const v = s.let("valid");
    s.try(() => {
      s.code((0, Ge._)`await ${(0, ji.callValidateCode)(e, t, d)}`), y(t), o || s.assign(v, !0);
    }, (g) => {
      s.if((0, Ge._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), w(g), o || s.assign(v, !1);
    }), e.ok(v);
  }
  function h() {
    e.result((0, ji.callValidateCode)(e, t, d), () => y(t), () => w(t));
  }
  function w(v) {
    const g = (0, Ge._)`${v}.errors`;
    s.assign(dr.default.vErrors, (0, Ge._)`${dr.default.vErrors} === null ? ${g} : ${dr.default.vErrors}.concat(${g})`), s.assign(dr.default.errors, (0, Ge._)`${dr.default.vErrors}.length`);
  }
  function y(v) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const $ = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if ($ && !$.dynamicProps)
        $.props !== void 0 && (a.props = gn.mergeEvaluated.props(s, $.props, a.props));
      else {
        const m = s.var("props", (0, Ge._)`${v}.evaluated.props`);
        a.props = gn.mergeEvaluated.props(s, m, a.props, Ge.Name);
      }
    if (a.items !== !0)
      if ($ && !$.dynamicItems)
        $.items !== void 0 && (a.items = gn.mergeEvaluated.items(s, $.items, a.items));
      else {
        const m = s.var("items", (0, Ge._)`${v}.evaluated.items`);
        a.items = gn.mergeEvaluated.items(s, m, a.items, Ge.Name);
      }
  }
}
Ot.callRef = zn;
Ot.default = Zh;
Object.defineProperty(ja, "__esModule", { value: !0 });
const xh = Aa, em = Ot, tm = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  xh.default,
  em.default
];
ja.default = tm;
var ka = {}, Ca = {};
Object.defineProperty(Ca, "__esModule", { value: !0 });
const Yn = se, kt = Yn.operators, Qn = {
  maximum: { okStr: "<=", ok: kt.LTE, fail: kt.GT },
  minimum: { okStr: ">=", ok: kt.GTE, fail: kt.LT },
  exclusiveMaximum: { okStr: "<", ok: kt.LT, fail: kt.GTE },
  exclusiveMinimum: { okStr: ">", ok: kt.GT, fail: kt.LTE }
}, rm = {
  message: ({ keyword: e, schemaCode: t }) => (0, Yn.str)`must be ${Qn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Yn._)`{comparison: ${Qn[e].okStr}, limit: ${t}}`
}, nm = {
  keyword: Object.keys(Qn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: rm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Yn._)`${r} ${Qn[t].fail} ${n} || isNaN(${r})`);
  }
};
Ca.default = nm;
var Da = {};
Object.defineProperty(Da, "__esModule", { value: !0 });
const Qr = se, sm = {
  message: ({ schemaCode: e }) => (0, Qr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Qr._)`{multipleOf: ${e}}`
}, am = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: sm,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), c = a ? (0, Qr._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, Qr._)`${o} !== parseInt(${o})`;
    e.fail$data((0, Qr._)`(${n} === 0 || (${o} = ${r}/${n}, ${c}))`);
  }
};
Da.default = am;
var Ma = {}, Va = {};
Object.defineProperty(Va, "__esModule", { value: !0 });
function ql(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Va.default = ql;
ql.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Ma, "__esModule", { value: !0 });
const Zt = se, om = V, im = Va, cm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Zt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Zt._)`{limit: ${e}}`
}, lm = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: cm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Zt.operators.GT : Zt.operators.LT, o = s.opts.unicode === !1 ? (0, Zt._)`${r}.length` : (0, Zt._)`${(0, om.useFunc)(e.gen, im.default)}(${r})`;
    e.fail$data((0, Zt._)`${o} ${a} ${n}`);
  }
};
Ma.default = lm;
var La = {};
Object.defineProperty(La, "__esModule", { value: !0 });
const um = ce, dm = V, gr = se, fm = {
  message: ({ schemaCode: e }) => (0, gr.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, gr._)`{pattern: ${e}}`
}, hm = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: fm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e, c = o.opts.unicodeRegExp ? "u" : "";
    if (n) {
      const { regExp: l } = o.opts.code, d = l.code === "new RegExp" ? (0, gr._)`new RegExp` : (0, dm.useFunc)(t, l), u = t.let("valid");
      t.try(() => t.assign(u, (0, gr._)`${d}(${a}, ${c}).test(${r})`), () => t.assign(u, !1)), e.fail$data((0, gr._)`!${u}`);
    } else {
      const l = (0, um.usePattern)(e, s);
      e.fail$data((0, gr._)`!${l}.test(${r})`);
    }
  }
};
La.default = hm;
var Fa = {};
Object.defineProperty(Fa, "__esModule", { value: !0 });
const Zr = se, mm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Zr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Zr._)`{limit: ${e}}`
}, pm = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: mm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Zr.operators.GT : Zr.operators.LT;
    e.fail$data((0, Zr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Fa.default = pm;
var za = {};
Object.defineProperty(za, "__esModule", { value: !0 });
const qr = ce, xr = se, ym = V, $m = {
  message: ({ params: { missingProperty: e } }) => (0, xr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, xr._)`{missingProperty: ${e}}`
}, gm = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: $m,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: c } = o;
    if (!a && r.length === 0)
      return;
    const l = r.length >= c.loopRequired;
    if (o.allErrors ? d() : u(), c.strictRequired) {
      const y = e.parentSchema.properties, { definedProperties: v } = e.it;
      for (const g of r)
        if ((y == null ? void 0 : y[g]) === void 0 && !v.has(g)) {
          const $ = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${g}" is not defined at "${$}" (strictRequired)`;
          (0, ym.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (l || a)
        e.block$data(xr.nil, h);
      else
        for (const y of r)
          (0, qr.checkReportMissingProp)(e, y);
    }
    function u() {
      const y = t.let("missing");
      if (l || a) {
        const v = t.let("valid", !0);
        e.block$data(v, () => w(y, v)), e.ok(v);
      } else
        t.if((0, qr.checkMissingProp)(e, r, y)), (0, qr.reportMissingProp)(e, y), t.else();
    }
    function h() {
      t.forOf("prop", n, (y) => {
        e.setParams({ missingProperty: y }), t.if((0, qr.noPropertyInData)(t, s, y, c.ownProperties), () => e.error());
      });
    }
    function w(y, v) {
      e.setParams({ missingProperty: y }), t.forOf(y, n, () => {
        t.assign(v, (0, qr.propertyInData)(t, s, y, c.ownProperties)), t.if((0, xr.not)(v), () => {
          e.error(), t.break();
        });
      }, xr.nil);
    }
  }
};
za.default = gm;
var Ua = {};
Object.defineProperty(Ua, "__esModule", { value: !0 });
const en = se, _m = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, en.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, en._)`{limit: ${e}}`
}, vm = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: _m,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? en.operators.GT : en.operators.LT;
    e.fail$data((0, en._)`${r}.length ${s} ${n}`);
  }
};
Ua.default = vm;
var qa = {}, un = {};
Object.defineProperty(un, "__esModule", { value: !0 });
const Kl = os;
Kl.code = 'require("ajv/dist/runtime/equal").default';
un.default = Kl;
Object.defineProperty(qa, "__esModule", { value: !0 });
const js = Ee, Re = se, wm = V, Em = un, bm = {
  message: ({ params: { i: e, j: t } }) => (0, Re.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Re._)`{i: ${e}, j: ${t}}`
}, Sm = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: bm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: c } = e;
    if (!n && !s)
      return;
    const l = t.let("valid"), d = a.items ? (0, js.getSchemaTypes)(a.items) : [];
    e.block$data(l, u, (0, Re._)`${o} === false`), e.ok(l);
    function u() {
      const v = t.let("i", (0, Re._)`${r}.length`), g = t.let("j");
      e.setParams({ i: v, j: g }), t.assign(l, !0), t.if((0, Re._)`${v} > 1`, () => (h() ? w : y)(v, g));
    }
    function h() {
      return d.length > 0 && !d.some((v) => v === "object" || v === "array");
    }
    function w(v, g) {
      const $ = t.name("item"), m = (0, js.checkDataTypes)(d, $, c.opts.strictNumbers, js.DataType.Wrong), E = t.const("indices", (0, Re._)`{}`);
      t.for((0, Re._)`;${v}--;`, () => {
        t.let($, (0, Re._)`${r}[${v}]`), t.if(m, (0, Re._)`continue`), d.length > 1 && t.if((0, Re._)`typeof ${$} == "string"`, (0, Re._)`${$} += "_"`), t.if((0, Re._)`typeof ${E}[${$}] == "number"`, () => {
          t.assign(g, (0, Re._)`${E}[${$}]`), e.error(), t.assign(l, !1).break();
        }).code((0, Re._)`${E}[${$}] = ${v}`);
      });
    }
    function y(v, g) {
      const $ = (0, wm.useFunc)(t, Em.default), m = t.name("outer");
      t.label(m).for((0, Re._)`;${v}--;`, () => t.for((0, Re._)`${g} = ${v}; ${g}--;`, () => t.if((0, Re._)`${$}(${r}[${v}], ${r}[${g}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
qa.default = Sm;
var Ka = {};
Object.defineProperty(Ka, "__esModule", { value: !0 });
const ea = se, Pm = V, Nm = un, Rm = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, ea._)`{allowedValue: ${e}}`
}, Om = {
  keyword: "const",
  $data: !0,
  error: Rm,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, ea._)`!${(0, Pm.useFunc)(t, Nm.default)}(${r}, ${s})`) : e.fail((0, ea._)`${a} !== ${r}`);
  }
};
Ka.default = Om;
var Ga = {};
Object.defineProperty(Ga, "__esModule", { value: !0 });
const Br = se, Im = V, Tm = un, jm = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Br._)`{allowedValues: ${e}}`
}, Am = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: jm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const c = s.length >= o.opts.loopEnum;
    let l;
    const d = () => l ?? (l = (0, Im.useFunc)(t, Tm.default));
    let u;
    if (c || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const y = t.const("vSchema", a);
      u = (0, Br.or)(...s.map((v, g) => w(y, g)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (y) => t.if((0, Br._)`${d()}(${r}, ${y})`, () => t.assign(u, !0).break()));
    }
    function w(y, v) {
      const g = s[v];
      return typeof g == "object" && g !== null ? (0, Br._)`${d()}(${r}, ${y}[${v}])` : (0, Br._)`${r} === ${g}`;
    }
  }
};
Ga.default = Am;
Object.defineProperty(ka, "__esModule", { value: !0 });
const km = Ca, Cm = Da, Dm = Ma, Mm = La, Vm = Fa, Lm = za, Fm = Ua, zm = qa, Um = Ka, qm = Ga, Km = [
  // number
  km.default,
  Cm.default,
  // string
  Dm.default,
  Mm.default,
  // object
  Vm.default,
  Lm.default,
  // array
  Fm.default,
  zm.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Um.default,
  qm.default
];
ka.default = Km;
var Ha = {}, Ir = {};
Object.defineProperty(Ir, "__esModule", { value: !0 });
Ir.validateAdditionalItems = void 0;
const xt = se, ta = V, Gm = {
  message: ({ params: { len: e } }) => (0, xt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, xt._)`{limit: ${e}}`
}, Hm = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Gm,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, ta.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Gl(e, n);
  }
};
function Gl(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const c = r.const("len", (0, xt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, xt._)`${c} <= ${t.length}`);
  else if (typeof n == "object" && !(0, ta.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, xt._)`${c} <= ${t.length}`);
    r.if((0, xt.not)(d), () => l(d)), e.ok(d);
  }
  function l(d) {
    r.forRange("i", t.length, c, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: ta.Type.Num }, d), o.allErrors || r.if((0, xt.not)(d), () => r.break());
    });
  }
}
Ir.validateAdditionalItems = Gl;
Ir.default = Hm;
var Xa = {}, Tr = {};
Object.defineProperty(Tr, "__esModule", { value: !0 });
Tr.validateTuple = void 0;
const ki = se, Un = V, Xm = ce, Jm = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Hl(e, "additionalItems", t);
    r.items = !0, !(0, Un.alwaysValidSchema)(r, t) && e.ok((0, Xm.validateArray)(e));
  }
};
function Hl(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: c } = e;
  u(s), c.opts.unevaluated && r.length && c.items !== !0 && (c.items = Un.mergeEvaluated.items(n, r.length, c.items));
  const l = n.name("valid"), d = n.const("len", (0, ki._)`${a}.length`);
  r.forEach((h, w) => {
    (0, Un.alwaysValidSchema)(c, h) || (n.if((0, ki._)`${d} > ${w}`, () => e.subschema({
      keyword: o,
      schemaProp: w,
      dataProp: w
    }, l)), e.ok(l));
  });
  function u(h) {
    const { opts: w, errSchemaPath: y } = c, v = r.length, g = v === h.minItems && (v === h.maxItems || h[t] === !1);
    if (w.strictTuples && !g) {
      const $ = `"${o}" is ${v}-tuple, but minItems or maxItems/${t} are not specified or different at path "${y}"`;
      (0, Un.checkStrictMode)(c, $, w.strictTuples);
    }
  }
}
Tr.validateTuple = Hl;
Tr.default = Jm;
Object.defineProperty(Xa, "__esModule", { value: !0 });
const Bm = Tr, Wm = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Bm.validateTuple)(e, "items")
};
Xa.default = Wm;
var Ja = {};
Object.defineProperty(Ja, "__esModule", { value: !0 });
const Ci = se, Ym = V, Qm = ce, Zm = Ir, xm = {
  message: ({ params: { len: e } }) => (0, Ci.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Ci._)`{limit: ${e}}`
}, ep = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: xm,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, Ym.alwaysValidSchema)(n, t) && (s ? (0, Zm.validateAdditionalItems)(e, s) : e.ok((0, Qm.validateArray)(e)));
  }
};
Ja.default = ep;
var Ba = {};
Object.defineProperty(Ba, "__esModule", { value: !0 });
const Ye = se, _n = V, tp = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ye.str)`must contain at least ${e} valid item(s)` : (0, Ye.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ye._)`{minContains: ${e}}` : (0, Ye._)`{minContains: ${e}, maxContains: ${t}}`
}, rp = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: tp,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, c;
    const { minContains: l, maxContains: d } = n;
    a.opts.next ? (o = l === void 0 ? 1 : l, c = d) : o = 1;
    const u = t.const("len", (0, Ye._)`${s}.length`);
    if (e.setParams({ min: o, max: c }), c === void 0 && o === 0) {
      (0, _n.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (c !== void 0 && o > c) {
      (0, _n.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, _n.alwaysValidSchema)(a, r)) {
      let g = (0, Ye._)`${u} >= ${o}`;
      c !== void 0 && (g = (0, Ye._)`${g} && ${u} <= ${c}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    c === void 0 && o === 1 ? y(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), c !== void 0 && t.if((0, Ye._)`${s}.length > 0`, w)) : (t.let(h, !1), w()), e.result(h, () => e.reset());
    function w() {
      const g = t.name("_valid"), $ = t.let("count", 0);
      y(g, () => t.if(g, () => v($)));
    }
    function y(g, $) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: _n.Type.Num,
          compositeRule: !0
        }, g), $();
      });
    }
    function v(g) {
      t.code((0, Ye._)`${g}++`), c === void 0 ? t.if((0, Ye._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Ye._)`${g} > ${c}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Ye._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Ba.default = rp;
var us = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = se, r = V, n = ce;
  e.error = {
    message: ({ params: { property: l, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${l},
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
    code(l) {
      const [d, u] = a(l);
      o(l, d), c(l, u);
    }
  };
  function a({ schema: l }) {
    const d = {}, u = {};
    for (const h in l) {
      if (h === "__proto__")
        continue;
      const w = Array.isArray(l[h]) ? d : u;
      w[h] = l[h];
    }
    return [d, u];
  }
  function o(l, d = l.schema) {
    const { gen: u, data: h, it: w } = l;
    if (Object.keys(d).length === 0)
      return;
    const y = u.let("missing");
    for (const v in d) {
      const g = d[v];
      if (g.length === 0)
        continue;
      const $ = (0, n.propertyInData)(u, h, v, w.opts.ownProperties);
      l.setParams({
        property: v,
        depsCount: g.length,
        deps: g.join(", ")
      }), w.allErrors ? u.if($, () => {
        for (const m of g)
          (0, n.checkReportMissingProp)(l, m);
      }) : (u.if((0, t._)`${$} && (${(0, n.checkMissingProp)(l, g, y)})`), (0, n.reportMissingProp)(l, y), u.else());
    }
  }
  e.validatePropertyDeps = o;
  function c(l, d = l.schema) {
    const { gen: u, data: h, keyword: w, it: y } = l, v = u.name("valid");
    for (const g in d)
      (0, r.alwaysValidSchema)(y, d[g]) || (u.if(
        (0, n.propertyInData)(u, h, g, y.opts.ownProperties),
        () => {
          const $ = l.subschema({ keyword: w, schemaProp: g }, v);
          l.mergeValidEvaluated($, v);
        },
        () => u.var(v, !0)
        // TODO var
      ), l.ok(v));
  }
  e.validateSchemaDeps = c, e.default = s;
})(us);
var Wa = {};
Object.defineProperty(Wa, "__esModule", { value: !0 });
const Xl = se, np = V, sp = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Xl._)`{propertyName: ${e.propertyName}}`
}, ap = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: sp,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, np.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Xl.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Wa.default = ap;
var ds = {};
Object.defineProperty(ds, "__esModule", { value: !0 });
const vn = ce, nt = se, op = Be, wn = V, ip = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, nt._)`{additionalProperty: ${e.additionalProperty}}`
}, cp = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: ip,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: c, opts: l } = o;
    if (o.props = !0, l.removeAdditional !== "all" && (0, wn.alwaysValidSchema)(o, r))
      return;
    const d = (0, vn.allSchemaProperties)(n.properties), u = (0, vn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, nt._)`${a} === ${op.default.errors}`);
    function h() {
      t.forIn("key", s, ($) => {
        !d.length && !u.length ? v($) : t.if(w($), () => v($));
      });
    }
    function w($) {
      let m;
      if (d.length > 8) {
        const E = (0, wn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, vn.isOwnProperty)(t, E, $);
      } else d.length ? m = (0, nt.or)(...d.map((E) => (0, nt._)`${$} === ${E}`)) : m = nt.nil;
      return u.length && (m = (0, nt.or)(m, ...u.map((E) => (0, nt._)`${(0, vn.usePattern)(e, E)}.test(${$})`))), (0, nt.not)(m);
    }
    function y($) {
      t.code((0, nt._)`delete ${s}[${$}]`);
    }
    function v($) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        y($);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: $ }), e.error(), c || t.break();
        return;
      }
      if (typeof r == "object" && !(0, wn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (g($, m, !1), t.if((0, nt.not)(m), () => {
          e.reset(), y($);
        })) : (g($, m), c || t.if((0, nt.not)(m), () => t.break()));
      }
    }
    function g($, m, E) {
      const P = {
        keyword: "additionalProperties",
        dataProp: $,
        dataPropType: wn.Type.Str
      };
      E === !1 && Object.assign(P, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(P, m);
    }
  }
};
ds.default = cp;
var Ya = {};
Object.defineProperty(Ya, "__esModule", { value: !0 });
const lp = it, Di = ce, As = V, Mi = ds, up = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Mi.default.code(new lp.KeywordCxt(a, Mi.default, "additionalProperties"));
    const o = (0, Di.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = As.mergeEvaluated.props(t, (0, As.toHash)(o), a.props));
    const c = o.filter((h) => !(0, As.alwaysValidSchema)(a, r[h]));
    if (c.length === 0)
      return;
    const l = t.name("valid");
    for (const h of c)
      d(h) ? u(h) : (t.if((0, Di.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(l);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, l);
    }
  }
};
Ya.default = up;
var Qa = {};
Object.defineProperty(Qa, "__esModule", { value: !0 });
const Vi = ce, En = se, Li = V, Fi = V, dp = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, c = (0, Vi.allSchemaProperties)(r), l = c.filter((g) => (0, Li.alwaysValidSchema)(a, r[g]));
    if (c.length === 0 || l.length === c.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof En.Name) && (a.props = (0, Fi.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    w();
    function w() {
      for (const g of c)
        d && y(g), a.allErrors ? v(g) : (t.var(u, !0), v(g), t.if(u));
    }
    function y(g) {
      for (const $ in d)
        new RegExp(g).test($) && (0, Li.checkStrictMode)(a, `property ${$} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function v(g) {
      t.forIn("key", n, ($) => {
        t.if((0, En._)`${(0, Vi.usePattern)(e, g)}.test(${$})`, () => {
          const m = l.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: $,
            dataPropType: Fi.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, En._)`${h}[${$}]`, !0) : !m && !a.allErrors && t.if((0, En.not)(u), () => t.break());
        });
      });
    }
  }
};
Qa.default = dp;
var Za = {};
Object.defineProperty(Za, "__esModule", { value: !0 });
const fp = V, hp = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, fp.alwaysValidSchema)(n, r)) {
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
Za.default = hp;
var xa = {};
Object.defineProperty(xa, "__esModule", { value: !0 });
const mp = ce, pp = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: mp.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
xa.default = pp;
var eo = {};
Object.defineProperty(eo, "__esModule", { value: !0 });
const qn = se, yp = V, $p = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, qn._)`{passingSchemas: ${e.passing}}`
}, gp = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: $p,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), c = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: c }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let w;
        (0, yp.alwaysValidSchema)(s, u) ? t.var(l, !0) : w = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, l), h > 0 && t.if((0, qn._)`${l} && ${o}`).assign(o, !1).assign(c, (0, qn._)`[${c}, ${h}]`).else(), t.if(l, () => {
          t.assign(o, !0), t.assign(c, h), w && e.mergeEvaluated(w, qn.Name);
        });
      });
    }
  }
};
eo.default = gp;
var to = {};
Object.defineProperty(to, "__esModule", { value: !0 });
const _p = V, vp = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, _p.alwaysValidSchema)(n, a))
        return;
      const c = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(c);
    });
  }
};
to.default = vp;
var ro = {};
Object.defineProperty(ro, "__esModule", { value: !0 });
const Zn = se, Jl = V, wp = {
  message: ({ params: e }) => (0, Zn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Zn._)`{failingKeyword: ${e.ifClause}}`
}, Ep = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: wp,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Jl.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = zi(n, "then"), a = zi(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), c = t.name("_valid");
    if (l(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(c, d("then", u), d("else", u));
    } else s ? t.if(c, d("then")) : t.if((0, Zn.not)(c), d("else"));
    e.pass(o, () => e.error(!0));
    function l() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, c);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const w = e.subschema({ keyword: u }, c);
        t.assign(o, c), e.mergeValidEvaluated(w, o), h ? t.assign(h, (0, Zn._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function zi(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Jl.alwaysValidSchema)(e, r);
}
ro.default = Ep;
var no = {};
Object.defineProperty(no, "__esModule", { value: !0 });
const bp = V, Sp = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, bp.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
no.default = Sp;
Object.defineProperty(Ha, "__esModule", { value: !0 });
const Pp = Ir, Np = Xa, Rp = Tr, Op = Ja, Ip = Ba, Tp = us, jp = Wa, Ap = ds, kp = Ya, Cp = Qa, Dp = Za, Mp = xa, Vp = eo, Lp = to, Fp = ro, zp = no;
function Up(e = !1) {
  const t = [
    // any
    Dp.default,
    Mp.default,
    Vp.default,
    Lp.default,
    Fp.default,
    zp.default,
    // object
    jp.default,
    Ap.default,
    Tp.default,
    kp.default,
    Cp.default
  ];
  return e ? t.push(Np.default, Op.default) : t.push(Pp.default, Rp.default), t.push(Ip.default), t;
}
Ha.default = Up;
var so = {}, jr = {};
Object.defineProperty(jr, "__esModule", { value: !0 });
jr.dynamicAnchor = void 0;
const ks = se, qp = Be, Ui = ze, Kp = Ot, Gp = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => Bl(e, e.schema)
};
function Bl(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, ks._)`${qp.default.dynamicAnchors}${(0, ks.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : Hp(e);
  r.if((0, ks._)`!${s}`, () => r.assign(s, a));
}
jr.dynamicAnchor = Bl;
function Hp(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: o, meta: c } = t.root, { schemaId: l } = n.opts, d = new Ui.SchemaEnv({ schema: r, schemaId: l, root: s, baseId: a, localRefs: o, meta: c });
  return Ui.compileSchema.call(n, d), (0, Kp.getValidate)(e, d);
}
jr.default = Gp;
var Ar = {};
Object.defineProperty(Ar, "__esModule", { value: !0 });
Ar.dynamicRef = void 0;
const qi = se, Xp = Be, Ki = Ot, Jp = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => Wl(e, e.schema)
};
function Wl(e, t) {
  const { gen: r, keyword: n, it: s } = e;
  if (t[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const a = t.slice(1);
  if (s.allErrors)
    o();
  else {
    const l = r.let("valid", !1);
    o(l), e.ok(l);
  }
  function o(l) {
    if (s.schemaEnv.root.dynamicAnchors[a]) {
      const d = r.let("_v", (0, qi._)`${Xp.default.dynamicAnchors}${(0, qi.getProperty)(a)}`);
      r.if(d, c(d, l), c(s.validateName, l));
    } else
      c(s.validateName, l)();
  }
  function c(l, d) {
    return d ? () => r.block(() => {
      (0, Ki.callRef)(e, l), r.let(d, !0);
    }) : () => (0, Ki.callRef)(e, l);
  }
}
Ar.dynamicRef = Wl;
Ar.default = Jp;
var ao = {};
Object.defineProperty(ao, "__esModule", { value: !0 });
const Bp = jr, Wp = V, Yp = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, Bp.dynamicAnchor)(e, "") : (0, Wp.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
ao.default = Yp;
var oo = {};
Object.defineProperty(oo, "__esModule", { value: !0 });
const Qp = Ar, Zp = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, Qp.dynamicRef)(e, e.schema)
};
oo.default = Zp;
Object.defineProperty(so, "__esModule", { value: !0 });
const xp = jr, ey = Ar, ty = ao, ry = oo, ny = [xp.default, ey.default, ty.default, ry.default];
so.default = ny;
var io = {}, co = {};
Object.defineProperty(co, "__esModule", { value: !0 });
const Gi = us, sy = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: Gi.error,
  code: (e) => (0, Gi.validatePropertyDeps)(e)
};
co.default = sy;
var lo = {};
Object.defineProperty(lo, "__esModule", { value: !0 });
const ay = us, oy = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, ay.validateSchemaDeps)(e)
};
lo.default = oy;
var uo = {};
Object.defineProperty(uo, "__esModule", { value: !0 });
const iy = V, cy = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, iy.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
uo.default = cy;
Object.defineProperty(io, "__esModule", { value: !0 });
const ly = co, uy = lo, dy = uo, fy = [ly.default, uy.default, dy.default];
io.default = fy;
var fo = {}, ho = {};
Object.defineProperty(ho, "__esModule", { value: !0 });
const Mt = se, Hi = V, hy = Be, my = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, Mt._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, py = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: my,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: a } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: c } = a;
    c instanceof Mt.Name ? t.if((0, Mt._)`${c} !== true`, () => t.forIn("key", n, (h) => t.if(d(c, h), () => l(h)))) : c !== !0 && t.forIn("key", n, (h) => c === void 0 ? l(h) : t.if(u(c, h), () => l(h))), a.props = !0, e.ok((0, Mt._)`${s} === ${hy.default.errors}`);
    function l(h) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: h }), e.error(), o || t.break();
        return;
      }
      if (!(0, Hi.alwaysValidSchema)(a, r)) {
        const w = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: h,
          dataPropType: Hi.Type.Str
        }, w), o || t.if((0, Mt.not)(w), () => t.break());
      }
    }
    function d(h, w) {
      return (0, Mt._)`!${h} || !${h}[${w}]`;
    }
    function u(h, w) {
      const y = [];
      for (const v in h)
        h[v] === !0 && y.push((0, Mt._)`${w} !== ${v}`);
      return (0, Mt.and)(...y);
    }
  }
};
ho.default = py;
var mo = {};
Object.defineProperty(mo, "__esModule", { value: !0 });
const er = se, Xi = V, yy = {
  message: ({ params: { len: e } }) => (0, er.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, er._)`{limit: ${e}}`
}, $y = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: yy,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const o = t.const("len", (0, er._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, er._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, Xi.alwaysValidSchema)(s, r)) {
      const l = t.var("valid", (0, er._)`${o} <= ${a}`);
      t.if((0, er.not)(l), () => c(l, a)), e.ok(l);
    }
    s.items = !0;
    function c(l, d) {
      t.forRange("i", d, o, (u) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: u, dataPropType: Xi.Type.Num }, l), s.allErrors || t.if((0, er.not)(l), () => t.break());
      });
    }
  }
};
mo.default = $y;
Object.defineProperty(fo, "__esModule", { value: !0 });
const gy = ho, _y = mo, vy = [gy.default, _y.default];
fo.default = vy;
var po = {}, yo = {};
Object.defineProperty(yo, "__esModule", { value: !0 });
const ve = se, wy = {
  message: ({ schemaCode: e }) => (0, ve.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, ve._)`{format: ${e}}`
}, Ey = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: wy,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: c } = e, { opts: l, errSchemaPath: d, schemaEnv: u, self: h } = c;
    if (!l.validateFormats)
      return;
    s ? w() : y();
    function w() {
      const v = r.scopeValue("formats", {
        ref: h.formats,
        code: l.code.formats
      }), g = r.const("fDef", (0, ve._)`${v}[${o}]`), $ = r.let("fType"), m = r.let("format");
      r.if((0, ve._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => r.assign($, (0, ve._)`${g}.type || "string"`).assign(m, (0, ve._)`${g}.validate`), () => r.assign($, (0, ve._)`"string"`).assign(m, g)), e.fail$data((0, ve.or)(E(), P()));
      function E() {
        return l.strictSchema === !1 ? ve.nil : (0, ve._)`${o} && !${m}`;
      }
      function P() {
        const O = u.$async ? (0, ve._)`(${g}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, ve._)`${m}(${n})`, T = (0, ve._)`(typeof ${m} == "function" ? ${O} : ${m}.test(${n}))`;
        return (0, ve._)`${m} && ${m} !== true && ${$} === ${t} && !${T}`;
      }
    }
    function y() {
      const v = h.formats[a];
      if (!v) {
        E();
        return;
      }
      if (v === !0)
        return;
      const [g, $, m] = P(v);
      g === t && e.pass(O());
      function E() {
        if (l.strictSchema === !1) {
          h.logger.warn(T());
          return;
        }
        throw new Error(T());
        function T() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function P(T) {
        const G = T instanceof RegExp ? (0, ve.regexpCode)(T) : l.code.formats ? (0, ve._)`${l.code.formats}${(0, ve.getProperty)(a)}` : void 0, Y = r.scopeValue("formats", { key: a, ref: T, code: G });
        return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, ve._)`${Y}.validate`] : ["string", T, Y];
      }
      function O() {
        if (typeof v == "object" && !(v instanceof RegExp) && v.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, ve._)`await ${m}(${n})`;
        }
        return typeof $ == "function" ? (0, ve._)`${m}(${n})` : (0, ve._)`${m}.test(${n})`;
      }
    }
  }
};
yo.default = Ey;
Object.defineProperty(po, "__esModule", { value: !0 });
const by = yo, Sy = [by.default];
po.default = Sy;
var Nr = {};
Object.defineProperty(Nr, "__esModule", { value: !0 });
Nr.contentVocabulary = Nr.metadataVocabulary = void 0;
Nr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Nr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Ta, "__esModule", { value: !0 });
const Py = ja, Ny = ka, Ry = Ha, Oy = so, Iy = io, Ty = fo, jy = po, Ji = Nr, Ay = [
  Oy.default,
  Py.default,
  Ny.default,
  (0, Ry.default)(!0),
  jy.default,
  Ji.metadataVocabulary,
  Ji.contentVocabulary,
  Iy.default,
  Ty.default
];
Ta.default = Ay;
var $o = {}, fs = {};
Object.defineProperty(fs, "__esModule", { value: !0 });
fs.DiscrError = void 0;
var Bi;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Bi || (fs.DiscrError = Bi = {}));
Object.defineProperty($o, "__esModule", { value: !0 });
const mr = se, ra = fs, Wi = ze, ky = Or, Cy = V, Dy = {
  message: ({ params: { discrError: e, tagName: t } }) => e === ra.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, mr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, My = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: Dy,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const c = n.propertyName;
    if (typeof c != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), d = t.const("tag", (0, mr._)`${r}${(0, mr.getProperty)(c)}`);
    t.if((0, mr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: ra.DiscrError.Tag, tag: d, tagName: c })), e.ok(l);
    function u() {
      const y = w();
      t.if(!1);
      for (const v in y)
        t.elseIf((0, mr._)`${d} === ${v}`), t.assign(l, h(y[v]));
      t.else(), e.error(!1, { discrError: ra.DiscrError.Mapping, tag: d, tagName: c }), t.endIf();
    }
    function h(y) {
      const v = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: y }, v);
      return e.mergeEvaluated(g, mr.Name), v;
    }
    function w() {
      var y;
      const v = {}, g = m(s);
      let $ = !0;
      for (let O = 0; O < o.length; O++) {
        let T = o[O];
        if (T != null && T.$ref && !(0, Cy.schemaHasRulesButRef)(T, a.self.RULES)) {
          const Y = T.$ref;
          if (T = Wi.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, Y), T instanceof Wi.SchemaEnv && (T = T.schema), T === void 0)
            throw new ky.default(a.opts.uriResolver, a.baseId, Y);
        }
        const G = (y = T == null ? void 0 : T.properties) === null || y === void 0 ? void 0 : y[c];
        if (typeof G != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${c}"`);
        $ = $ && (g || m(T)), E(G, O);
      }
      if (!$)
        throw new Error(`discriminator: "${c}" must be required`);
      return v;
      function m({ required: O }) {
        return Array.isArray(O) && O.includes(c);
      }
      function E(O, T) {
        if (O.const)
          P(O.const, T);
        else if (O.enum)
          for (const G of O.enum)
            P(G, T);
        else
          throw new Error(`discriminator: "properties/${c}" must have "const" or "enum"`);
      }
      function P(O, T) {
        if (typeof O != "string" || O in v)
          throw new Error(`discriminator: "${c}" values must be unique strings`);
        v[O] = T;
      }
    }
  }
};
$o.default = My;
var go = {};
const Vy = "https://json-schema.org/draft/2020-12/schema", Ly = "https://json-schema.org/draft/2020-12/schema", Fy = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, zy = "meta", Uy = "Core and Validation specifications meta-schema", qy = [
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
], Ky = [
  "object",
  "boolean"
], Gy = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Hy = {
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
}, Xy = {
  $schema: Vy,
  $id: Ly,
  $vocabulary: Fy,
  $dynamicAnchor: zy,
  title: Uy,
  allOf: qy,
  type: Ky,
  $comment: Gy,
  properties: Hy
}, Jy = "https://json-schema.org/draft/2020-12/schema", By = "https://json-schema.org/draft/2020-12/meta/applicator", Wy = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, Yy = "meta", Qy = "Applicator vocabulary meta-schema", Zy = [
  "object",
  "boolean"
], xy = {
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
}, e$ = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, t$ = {
  $schema: Jy,
  $id: By,
  $vocabulary: Wy,
  $dynamicAnchor: Yy,
  title: Qy,
  type: Zy,
  properties: xy,
  $defs: e$
}, r$ = "https://json-schema.org/draft/2020-12/schema", n$ = "https://json-schema.org/draft/2020-12/meta/unevaluated", s$ = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, a$ = "meta", o$ = "Unevaluated applicator vocabulary meta-schema", i$ = [
  "object",
  "boolean"
], c$ = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, l$ = {
  $schema: r$,
  $id: n$,
  $vocabulary: s$,
  $dynamicAnchor: a$,
  title: o$,
  type: i$,
  properties: c$
}, u$ = "https://json-schema.org/draft/2020-12/schema", d$ = "https://json-schema.org/draft/2020-12/meta/content", f$ = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, h$ = "meta", m$ = "Content vocabulary meta-schema", p$ = [
  "object",
  "boolean"
], y$ = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, $$ = {
  $schema: u$,
  $id: d$,
  $vocabulary: f$,
  $dynamicAnchor: h$,
  title: m$,
  type: p$,
  properties: y$
}, g$ = "https://json-schema.org/draft/2020-12/schema", _$ = "https://json-schema.org/draft/2020-12/meta/core", v$ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, w$ = "meta", E$ = "Core vocabulary meta-schema", b$ = [
  "object",
  "boolean"
], S$ = {
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
}, P$ = {
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
}, N$ = {
  $schema: g$,
  $id: _$,
  $vocabulary: v$,
  $dynamicAnchor: w$,
  title: E$,
  type: b$,
  properties: S$,
  $defs: P$
}, R$ = "https://json-schema.org/draft/2020-12/schema", O$ = "https://json-schema.org/draft/2020-12/meta/format-annotation", I$ = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, T$ = "meta", j$ = "Format vocabulary meta-schema for annotation results", A$ = [
  "object",
  "boolean"
], k$ = {
  format: {
    type: "string"
  }
}, C$ = {
  $schema: R$,
  $id: O$,
  $vocabulary: I$,
  $dynamicAnchor: T$,
  title: j$,
  type: A$,
  properties: k$
}, D$ = "https://json-schema.org/draft/2020-12/schema", M$ = "https://json-schema.org/draft/2020-12/meta/meta-data", V$ = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, L$ = "meta", F$ = "Meta-data vocabulary meta-schema", z$ = [
  "object",
  "boolean"
], U$ = {
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
}, q$ = {
  $schema: D$,
  $id: M$,
  $vocabulary: V$,
  $dynamicAnchor: L$,
  title: F$,
  type: z$,
  properties: U$
}, K$ = "https://json-schema.org/draft/2020-12/schema", G$ = "https://json-schema.org/draft/2020-12/meta/validation", H$ = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, X$ = "meta", J$ = "Validation vocabulary meta-schema", B$ = [
  "object",
  "boolean"
], W$ = {
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
}, Y$ = {
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
}, Q$ = {
  $schema: K$,
  $id: G$,
  $vocabulary: H$,
  $dynamicAnchor: X$,
  title: J$,
  type: B$,
  properties: W$,
  $defs: Y$
};
Object.defineProperty(go, "__esModule", { value: !0 });
const Z$ = Xy, x$ = t$, e0 = l$, t0 = $$, r0 = N$, n0 = C$, s0 = q$, a0 = Q$, o0 = ["/properties"];
function i0(e) {
  return [
    Z$,
    x$,
    e0,
    t0,
    r0,
    t(this, n0),
    s0,
    t(this, a0)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, o0) : n;
  }
}
go.default = i0;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = Qc, n = Ta, s = $o, a = go, o = "https://json-schema.org/draft/2020-12/schema";
  class c extends r.default {
    constructor(y = {}) {
      super({
        ...y,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((y) => this.addVocabulary(y)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: y, meta: v } = this.opts;
      v && (a.default.call(this, y), this.refs["http://json-schema.org/schema"] = o);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv2020 = c, e.exports = t = c, e.exports.Ajv2020 = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
  var l = it;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return l.KeywordCxt;
  } });
  var d = se;
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
  var u = ln;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return u.default;
  } });
  var h = Or;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(Ws, Ws.exports);
var c0 = Ws.exports, na = { exports: {} }, Yl = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(K, W) {
    return { validate: K, compare: W };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(a, o),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(l(!0), d),
    "date-time": t(w(!0), y),
    "iso-time": t(l(), u),
    "iso-date-time": t(w(), v),
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
    regex: $e,
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
    byte: P,
    // signed 32 bit integer
    int32: { type: "number", validate: G },
    // signed 64 bit integer
    int64: { type: "number", validate: Y },
    // C-type float
    float: { type: "number", validate: ue },
    // C-type double
    double: { type: "number", validate: ue },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
    time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
    "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, y),
    "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, u),
    "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, v),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, e.formatNames = Object.keys(e.fullFormats);
  function r(K) {
    return K % 4 === 0 && (K % 100 !== 0 || K % 400 === 0);
  }
  const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, s = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function a(K) {
    const W = n.exec(K);
    if (!W)
      return !1;
    const Q = +W[1], j = +W[2], D = +W[3];
    return j >= 1 && j <= 12 && D >= 1 && D <= (j === 2 && r(Q) ? 29 : s[j]);
  }
  function o(K, W) {
    if (K && W)
      return K > W ? 1 : K < W ? -1 : 0;
  }
  const c = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function l(K) {
    return function(Q) {
      const j = c.exec(Q);
      if (!j)
        return !1;
      const D = +j[1], U = +j[2], L = +j[3], J = j[4], z = j[5] === "-" ? -1 : 1, N = +(j[6] || 0), p = +(j[7] || 0);
      if (N > 23 || p > 59 || K && !J)
        return !1;
      if (D <= 23 && U <= 59 && L < 60)
        return !0;
      const S = U - p * z, _ = D - N * z - (S < 0 ? 1 : 0);
      return (_ === 23 || _ === -1) && (S === 59 || S === -1) && L < 61;
    };
  }
  function d(K, W) {
    if (!(K && W))
      return;
    const Q = (/* @__PURE__ */ new Date("2020-01-01T" + K)).valueOf(), j = (/* @__PURE__ */ new Date("2020-01-01T" + W)).valueOf();
    if (Q && j)
      return Q - j;
  }
  function u(K, W) {
    if (!(K && W))
      return;
    const Q = c.exec(K), j = c.exec(W);
    if (Q && j)
      return K = Q[1] + Q[2] + Q[3], W = j[1] + j[2] + j[3], K > W ? 1 : K < W ? -1 : 0;
  }
  const h = /t|\s/i;
  function w(K) {
    const W = l(K);
    return function(j) {
      const D = j.split(h);
      return D.length === 2 && a(D[0]) && W(D[1]);
    };
  }
  function y(K, W) {
    if (!(K && W))
      return;
    const Q = new Date(K).valueOf(), j = new Date(W).valueOf();
    if (Q && j)
      return Q - j;
  }
  function v(K, W) {
    if (!(K && W))
      return;
    const [Q, j] = K.split(h), [D, U] = W.split(h), L = o(Q, D);
    if (L !== void 0)
      return L || d(j, U);
  }
  const g = /\/|:/, $ = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(K) {
    return g.test(K) && $.test(K);
  }
  const E = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function P(K) {
    return E.lastIndex = 0, E.test(K);
  }
  const O = -2147483648, T = 2 ** 31 - 1;
  function G(K) {
    return Number.isInteger(K) && K <= T && K >= O;
  }
  function Y(K) {
    return Number.isInteger(K);
  }
  function ue() {
    return !0;
  }
  const he = /[^\\]\\Z/;
  function $e(K) {
    if (he.test(K))
      return !1;
    try {
      return new RegExp(K), !0;
    } catch {
      return !1;
    }
  }
})(Yl);
var Ql = {}, sa = { exports: {} }, Zl = {}, vt = {}, Wt = {}, dn = {}, ie = {}, on = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(E) {
      if (super(), !e.IDENTIFIER.test(E))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = E;
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
    constructor(E) {
      super(), this._items = typeof E == "string" ? [E] : E;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const E = this._items[0];
      return E === "" || E === '""';
    }
    get str() {
      var E;
      return (E = this._str) !== null && E !== void 0 ? E : this._str = this._items.reduce((P, O) => `${P}${O}`, "");
    }
    get names() {
      var E;
      return (E = this._names) !== null && E !== void 0 ? E : this._names = this._items.reduce((P, O) => (O instanceof r && (P[O.str] = (P[O.str] || 0) + 1), P), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...E) {
    const P = [m[0]];
    let O = 0;
    for (; O < E.length; )
      c(P, E[O]), P.push(m[++O]);
    return new n(P);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...E) {
    const P = [y(m[0])];
    let O = 0;
    for (; O < E.length; )
      P.push(a), c(P, E[O]), P.push(a, y(m[++O]));
    return l(P), new n(P);
  }
  e.str = o;
  function c(m, E) {
    E instanceof n ? m.push(...E._items) : E instanceof r ? m.push(E) : m.push(h(E));
  }
  e.addCodeArg = c;
  function l(m) {
    let E = 1;
    for (; E < m.length - 1; ) {
      if (m[E] === a) {
        const P = d(m[E - 1], m[E + 1]);
        if (P !== void 0) {
          m.splice(E - 1, 3, P);
          continue;
        }
        m[E++] = "+";
      }
      E++;
    }
  }
  function d(m, E) {
    if (E === '""')
      return m;
    if (m === '""')
      return E;
    if (typeof m == "string")
      return E instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof E != "string" ? `${m.slice(0, -1)}${E}"` : E[0] === '"' ? m.slice(0, -1) + E.slice(1) : void 0;
    if (typeof E == "string" && E[0] === '"' && !(m instanceof r))
      return `"${m}${E.slice(1)}`;
  }
  function u(m, E) {
    return E.emptyStr() ? m : m.emptyStr() ? E : o`${m}${E}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : y(Array.isArray(m) ? m.join(",") : m);
  }
  function w(m) {
    return new n(y(m));
  }
  e.stringify = w;
  function y(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = y;
  function v(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = v;
  function g(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = g;
  function $(m) {
    return new n(m.toString());
  }
  e.regexpCode = $;
})(on);
var aa = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = on;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
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
  class c extends s {
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
      const w = this.toName(d), { prefix: y } = w, v = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let g = this._values[y];
      if (g) {
        const E = g.get(v);
        if (E)
          return E;
      } else
        g = this._values[y] = /* @__PURE__ */ new Map();
      g.set(v, w);
      const $ = this._scope[y] || (this._scope[y] = []), m = $.length;
      return $[m] = u.ref, w.setValue(u, { property: y, itemIndex: m }), w;
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
      return this._reduceValues(d, (w) => {
        if (w.value === void 0)
          throw new Error(`CodeGen: name "${w}" has no value`);
        return w.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, w) {
      let y = t.nil;
      for (const v in d) {
        const g = d[v];
        if (!g)
          continue;
        const $ = h[v] = h[v] || /* @__PURE__ */ new Map();
        g.forEach((m) => {
          if ($.has(m))
            return;
          $.set(m, n.Started);
          let E = u(m);
          if (E) {
            const P = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            y = (0, t._)`${y}${P} ${m} = ${E};${this.opts._n}`;
          } else if (E = w == null ? void 0 : w(m))
            y = (0, t._)`${y}${E}${this.opts._n}`;
          else
            throw new r(m);
          $.set(m, n.Completed);
        });
      }
      return y;
    }
  }
  e.ValueScope = c;
})(aa);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = on, r = aa;
  var n = on;
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
  var s = aa;
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
      const b = i ? r.varKinds.var : this.varKind, A = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${b} ${this.name}${A};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = j(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class c extends a {
    constructor(i, f, b) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = b;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = j(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return Q(i, this.rhs);
    }
  }
  class l extends c {
    constructor(i, f, b, A) {
      super(i, b, A), this.op = f;
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
  class w extends a {
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
      return this.code = j(this.code, i, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class y extends a {
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
      let A = b.length;
      for (; A--; ) {
        const k = b[A];
        k.optimizeNames(i, f) || (D(i, k.names), b.splice(A, 1));
      }
      return b.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => W(i, f.names), {});
    }
  }
  class v extends y {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class g extends y {
  }
  class $ extends v {
  }
  $.kind = "else";
  class m extends v {
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
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(U(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var b;
      if (this.else = (b = this.else) === null || b === void 0 ? void 0 : b.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = j(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return Q(i, this.condition), this.else && W(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class E extends v {
  }
  E.kind = "for";
  class P extends E {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = j(this.iteration, i, f), this;
    }
    get names() {
      return W(super.names, this.iteration.names);
    }
  }
  class O extends E {
    constructor(i, f, b, A) {
      super(), this.varKind = i, this.name = f, this.from = b, this.to = A;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: b, from: A, to: k } = this;
      return `for(${f} ${b}=${A}; ${b}<${k}; ${b}++)` + super.render(i);
    }
    get names() {
      const i = Q(super.names, this.from);
      return Q(i, this.to);
    }
  }
  class T extends E {
    constructor(i, f, b, A) {
      super(), this.loop = i, this.varKind = f, this.name = b, this.iterable = A;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = j(this.iterable, i, f), this;
    }
    get names() {
      return W(super.names, this.iterable.names);
    }
  }
  class G extends v {
    constructor(i, f, b) {
      super(), this.name = i, this.args = f, this.async = b;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  G.kind = "func";
  class Y extends y {
    render(i) {
      return "return " + super.render(i);
    }
  }
  Y.kind = "return";
  class ue extends v {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var b, A;
      return super.optimizeNames(i, f), (b = this.catch) === null || b === void 0 || b.optimizeNames(i, f), (A = this.finally) === null || A === void 0 || A.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && W(i, this.catch.names), this.finally && W(i, this.finally.names), i;
    }
  }
  class he extends v {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  he.kind = "catch";
  class $e extends v {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  $e.kind = "finally";
  class K {
    constructor(i, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = i, this._scope = new r.Scope({ parent: i }), this._nodes = [new g()];
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
    _def(i, f, b, A) {
      const k = this._scope.toName(f);
      return b !== void 0 && A && (this._constants[k.str] = b), this._leafNode(new o(i, k, b)), k;
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
      return this._leafNode(new c(i, f, b));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new l(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new w(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [b, A] of i)
        f.length > 1 && f.push(","), f.push(b), (b !== A || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, A));
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
      return this._for(new P(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, b, A, k = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const H = this._scope.toName(i);
      return this._for(new O(k, H, f, b), () => A(H));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, b, A = r.varKinds.const) {
      const k = this._scope.toName(i);
      if (this.opts.es5) {
        const H = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${H}.length`, (q) => {
          this.var(k, (0, t._)`${H}[${q}]`), b(k);
        });
      }
      return this._for(new T("of", A, k, f), () => b(k));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, b, A = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, b);
      const k = this._scope.toName(i);
      return this._for(new T("in", A, k, f), () => b(k));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(E);
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
      const f = new Y();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(Y);
    }
    // `try` statement
    try(i, f, b) {
      if (!f && !b)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const A = new ue();
      if (this._blockNode(A), this.code(i), f) {
        const k = this.name("e");
        this._currNode = A.catch = new he(k), f(k);
      }
      return b && (this._currNode = A.finally = new $e(), this.code(b)), this._endBlockNode(he, $e);
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
    func(i, f = t.nil, b, A) {
      return this._blockNode(new G(i, f, b)), A && this.code(A).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(G);
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
  e.CodeGen = K;
  function W(_, i) {
    for (const f in i)
      _[f] = (_[f] || 0) + (i[f] || 0);
    return _;
  }
  function Q(_, i) {
    return i instanceof t._CodeOrName ? W(_, i.names) : _;
  }
  function j(_, i, f) {
    if (_ instanceof t.Name)
      return b(_);
    if (!A(_))
      return _;
    return new t._Code(_._items.reduce((k, H) => (H instanceof t.Name && (H = b(H)), H instanceof t._Code ? k.push(...H._items) : k.push(H), k), []));
    function b(k) {
      const H = f[k.str];
      return H === void 0 || i[k.str] !== 1 ? k : (delete i[k.str], H);
    }
    function A(k) {
      return k instanceof t._Code && k._items.some((H) => H instanceof t.Name && i[H.str] === 1 && f[H.str] !== void 0);
    }
  }
  function D(_, i) {
    for (const f in i)
      _[f] = (_[f] || 0) - (i[f] || 0);
  }
  function U(_) {
    return typeof _ == "boolean" || typeof _ == "number" || _ === null ? !_ : (0, t._)`!${S(_)}`;
  }
  e.not = U;
  const L = p(e.operators.AND);
  function J(..._) {
    return _.reduce(L);
  }
  e.and = J;
  const z = p(e.operators.OR);
  function N(..._) {
    return _.reduce(z);
  }
  e.or = N;
  function p(_) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${_} ${S(f)}`;
  }
  function S(_) {
    return _ instanceof t.Name ? _ : (0, t._)`(${_})`;
  }
})(ie);
var F = {};
Object.defineProperty(F, "__esModule", { value: !0 });
F.checkStrictMode = F.getErrorPath = F.Type = F.useFunc = F.setEvaluated = F.evaluatedPropsToName = F.mergeEvaluated = F.eachItem = F.unescapeJsonPointer = F.escapeJsonPointer = F.escapeFragment = F.unescapeFragment = F.schemaRefOrVal = F.schemaHasRulesButRef = F.schemaHasRules = F.checkUnknownRules = F.alwaysValidSchema = F.toHash = void 0;
const fe = ie, l0 = on;
function u0(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
F.toHash = u0;
function d0(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (xl(e, t), !eu(t, e.self.RULES.all));
}
F.alwaysValidSchema = d0;
function xl(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || nu(e, `unknown keyword: "${a}"`);
}
F.checkUnknownRules = xl;
function eu(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
F.schemaHasRules = eu;
function f0(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
F.schemaHasRulesButRef = f0;
function h0({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, fe._)`${r}`;
  }
  return (0, fe._)`${e}${t}${(0, fe.getProperty)(n)}`;
}
F.schemaRefOrVal = h0;
function m0(e) {
  return tu(decodeURIComponent(e));
}
F.unescapeFragment = m0;
function p0(e) {
  return encodeURIComponent(_o(e));
}
F.escapeFragment = p0;
function _o(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
F.escapeJsonPointer = _o;
function tu(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
F.unescapeJsonPointer = tu;
function y0(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
F.eachItem = y0;
function Yi({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, c) => {
    const l = o === void 0 ? a : o instanceof fe.Name ? (a instanceof fe.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof fe.Name ? (t(s, o, a), a) : r(a, o);
    return c === fe.Name && !(l instanceof fe.Name) ? n(s, l) : l;
  };
}
F.mergeEvaluated = {
  props: Yi({
    mergeNames: (e, t, r) => e.if((0, fe._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, fe._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, fe._)`${r} || {}`).code((0, fe._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, fe._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, fe._)`${r} || {}`), vo(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: ru
  }),
  items: Yi({
    mergeNames: (e, t, r) => e.if((0, fe._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, fe._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, fe._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, fe._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function ru(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, fe._)`{}`);
  return t !== void 0 && vo(e, r, t), r;
}
F.evaluatedPropsToName = ru;
function vo(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, fe._)`${t}${(0, fe.getProperty)(n)}`, !0));
}
F.setEvaluated = vo;
const Qi = {};
function $0(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Qi[t.code] || (Qi[t.code] = new l0._Code(t.code))
  });
}
F.useFunc = $0;
var oa;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(oa || (F.Type = oa = {}));
function g0(e, t, r) {
  if (e instanceof fe.Name) {
    const n = t === oa.Num;
    return r ? n ? (0, fe._)`"[" + ${e} + "]"` : (0, fe._)`"['" + ${e} + "']"` : n ? (0, fe._)`"/" + ${e}` : (0, fe._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, fe.getProperty)(e).toString() : "/" + _o(e);
}
F.getErrorPath = g0;
function nu(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
F.checkStrictMode = nu;
var $t = {};
Object.defineProperty($t, "__esModule", { value: !0 });
const De = ie, _0 = {
  // validation function arguments
  data: new De.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new De.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new De.Name("instancePath"),
  parentData: new De.Name("parentData"),
  parentDataProperty: new De.Name("parentDataProperty"),
  rootData: new De.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new De.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new De.Name("vErrors"),
  // null or array of validation errors
  errors: new De.Name("errors"),
  // counter of validation errors
  this: new De.Name("this"),
  // "globals"
  self: new De.Name("self"),
  scope: new De.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new De.Name("json"),
  jsonPos: new De.Name("jsonPos"),
  jsonLen: new De.Name("jsonLen"),
  jsonPart: new De.Name("jsonPart")
};
$t.default = _0;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = ie, r = F, n = $t;
  e.keywordError = {
    message: ({ keyword: $ }) => (0, t.str)`must pass "${$}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: $, schemaType: m }) => m ? (0, t.str)`"${$}" keyword must be ${m} ($data)` : (0, t.str)`"${$}" keyword is invalid ($data)`
  };
  function s($, m = e.keywordError, E, P) {
    const { it: O } = $, { gen: T, compositeRule: G, allErrors: Y } = O, ue = h($, m, E);
    P ?? (G || Y) ? l(T, ue) : d(O, (0, t._)`[${ue}]`);
  }
  e.reportError = s;
  function a($, m = e.keywordError, E) {
    const { it: P } = $, { gen: O, compositeRule: T, allErrors: G } = P, Y = h($, m, E);
    l(O, Y), T || G || d(P, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o($, m) {
    $.assign(n.default.errors, m), $.if((0, t._)`${n.default.vErrors} !== null`, () => $.if(m, () => $.assign((0, t._)`${n.default.vErrors}.length`, m), () => $.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function c({ gen: $, keyword: m, schemaValue: E, data: P, errsCount: O, it: T }) {
    if (O === void 0)
      throw new Error("ajv implementation error");
    const G = $.name("err");
    $.forRange("i", O, n.default.errors, (Y) => {
      $.const(G, (0, t._)`${n.default.vErrors}[${Y}]`), $.if((0, t._)`${G}.instancePath === undefined`, () => $.assign((0, t._)`${G}.instancePath`, (0, t.strConcat)(n.default.instancePath, T.errorPath))), $.assign((0, t._)`${G}.schemaPath`, (0, t.str)`${T.errSchemaPath}/${m}`), T.opts.verbose && ($.assign((0, t._)`${G}.schema`, E), $.assign((0, t._)`${G}.data`, P));
    });
  }
  e.extendErrors = c;
  function l($, m) {
    const E = $.const("err", m);
    $.if((0, t._)`${n.default.vErrors} === null`, () => $.assign(n.default.vErrors, (0, t._)`[${E}]`), (0, t._)`${n.default.vErrors}.push(${E})`), $.code((0, t._)`${n.default.errors}++`);
  }
  function d($, m) {
    const { gen: E, validateName: P, schemaEnv: O } = $;
    O.$async ? E.throw((0, t._)`new ${$.ValidationError}(${m})`) : (E.assign((0, t._)`${P}.errors`, m), E.return(!1));
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
  function h($, m, E) {
    const { createErrors: P } = $.it;
    return P === !1 ? (0, t._)`{}` : w($, m, E);
  }
  function w($, m, E = {}) {
    const { gen: P, it: O } = $, T = [
      y(O, E),
      v($, E)
    ];
    return g($, m, T), P.object(...T);
  }
  function y({ errorPath: $ }, { instancePath: m }) {
    const E = m ? (0, t.str)`${$}${(0, r.getErrorPath)(m, r.Type.Str)}` : $;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, E)];
  }
  function v({ keyword: $, it: { errSchemaPath: m } }, { schemaPath: E, parentSchema: P }) {
    let O = P ? m : (0, t.str)`${m}/${$}`;
    return E && (O = (0, t.str)`${O}${(0, r.getErrorPath)(E, r.Type.Str)}`), [u.schemaPath, O];
  }
  function g($, { params: m, message: E }, P) {
    const { keyword: O, data: T, schemaValue: G, it: Y } = $, { opts: ue, propertyName: he, topSchemaRef: $e, schemaPath: K } = Y;
    P.push([u.keyword, O], [u.params, typeof m == "function" ? m($) : m || (0, t._)`{}`]), ue.messages && P.push([u.message, typeof E == "function" ? E($) : E]), ue.verbose && P.push([u.schema, G], [u.parentSchema, (0, t._)`${$e}${K}`], [n.default.data, T]), he && P.push([u.propertyName, he]);
  }
})(dn);
var Zi;
function v0() {
  if (Zi) return Wt;
  Zi = 1, Object.defineProperty(Wt, "__esModule", { value: !0 }), Wt.boolOrEmptySchema = Wt.topBoolOrEmptySchema = void 0;
  const e = dn, t = ie, r = $t, n = {
    message: "boolean schema is false"
  };
  function s(c) {
    const { gen: l, schema: d, validateName: u } = c;
    d === !1 ? o(c, !1) : typeof d == "object" && d.$async === !0 ? l.return(r.default.data) : (l.assign((0, t._)`${u}.errors`, null), l.return(!0));
  }
  Wt.topBoolOrEmptySchema = s;
  function a(c, l) {
    const { gen: d, schema: u } = c;
    u === !1 ? (d.var(l, !1), o(c)) : d.var(l, !0);
  }
  Wt.boolOrEmptySchema = a;
  function o(c, l) {
    const { gen: d, data: u } = c, h = {
      gen: d,
      keyword: "false schema",
      data: u,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: c
    };
    (0, e.reportError)(h, n, void 0, l);
  }
  return Wt;
}
var be = {}, cr = {};
Object.defineProperty(cr, "__esModule", { value: !0 });
cr.getRules = cr.isJSONType = void 0;
const w0 = ["string", "number", "integer", "boolean", "null", "object", "array"], E0 = new Set(w0);
function b0(e) {
  return typeof e == "string" && E0.has(e);
}
cr.isJSONType = b0;
function S0() {
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
cr.getRules = S0;
var Nt = {};
Object.defineProperty(Nt, "__esModule", { value: !0 });
Nt.shouldUseRule = Nt.shouldUseGroup = Nt.schemaHasRulesForType = void 0;
function P0({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && su(e, n);
}
Nt.schemaHasRulesForType = P0;
function su(e, t) {
  return t.rules.some((r) => au(e, r));
}
Nt.shouldUseGroup = su;
function au(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
Nt.shouldUseRule = au;
Object.defineProperty(be, "__esModule", { value: !0 });
be.reportTypeError = be.checkDataTypes = be.checkDataType = be.coerceAndCheckDataType = be.getJSONTypes = be.getSchemaTypes = be.DataType = void 0;
const N0 = cr, R0 = Nt, O0 = dn, oe = ie, ou = F;
var Er;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(Er || (be.DataType = Er = {}));
function I0(e) {
  const t = iu(e.type);
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
be.getSchemaTypes = I0;
function iu(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(N0.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
be.getJSONTypes = iu;
function T0(e, t) {
  const { gen: r, data: n, opts: s } = e, a = j0(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, R0.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const c = wo(t, n, s.strictNumbers, Er.Wrong);
    r.if(c, () => {
      a.length ? A0(e, t, a) : Eo(e);
    });
  }
  return o;
}
be.coerceAndCheckDataType = T0;
const cu = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function j0(e, t) {
  return t ? e.filter((r) => cu.has(r) || t === "array" && r === "array") : [];
}
function A0(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, oe._)`typeof ${s}`), c = n.let("coerced", (0, oe._)`undefined`);
  a.coerceTypes === "array" && n.if((0, oe._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, oe._)`${s}[0]`).assign(o, (0, oe._)`typeof ${s}`).if(wo(t, s, a.strictNumbers), () => n.assign(c, s))), n.if((0, oe._)`${c} !== undefined`);
  for (const d of r)
    (cu.has(d) || d === "array" && a.coerceTypes === "array") && l(d);
  n.else(), Eo(e), n.endIf(), n.if((0, oe._)`${c} !== undefined`, () => {
    n.assign(s, c), k0(e, c);
  });
  function l(d) {
    switch (d) {
      case "string":
        n.elseIf((0, oe._)`${o} == "number" || ${o} == "boolean"`).assign(c, (0, oe._)`"" + ${s}`).elseIf((0, oe._)`${s} === null`).assign(c, (0, oe._)`""`);
        return;
      case "number":
        n.elseIf((0, oe._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(c, (0, oe._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, oe._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(c, (0, oe._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, oe._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(c, !1).elseIf((0, oe._)`${s} === "true" || ${s} === 1`).assign(c, !0);
        return;
      case "null":
        n.elseIf((0, oe._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(c, null);
        return;
      case "array":
        n.elseIf((0, oe._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(c, (0, oe._)`[${s}]`);
    }
  }
}
function k0({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, oe._)`${t} !== undefined`, () => e.assign((0, oe._)`${t}[${r}]`, n));
}
function ia(e, t, r, n = Er.Correct) {
  const s = n === Er.Correct ? oe.operators.EQ : oe.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, oe._)`${t} ${s} null`;
    case "array":
      a = (0, oe._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, oe._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, oe._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, oe._)`typeof ${t} ${s} ${e}`;
  }
  return n === Er.Correct ? a : (0, oe.not)(a);
  function o(c = oe.nil) {
    return (0, oe.and)((0, oe._)`typeof ${t} == "number"`, c, r ? (0, oe._)`isFinite(${t})` : oe.nil);
  }
}
be.checkDataType = ia;
function wo(e, t, r, n) {
  if (e.length === 1)
    return ia(e[0], t, r, n);
  let s;
  const a = (0, ou.toHash)(e);
  if (a.array && a.object) {
    const o = (0, oe._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, oe._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = oe.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, oe.and)(s, ia(o, t, r, n));
  return s;
}
be.checkDataTypes = wo;
const C0 = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, oe._)`{type: ${e}}` : (0, oe._)`{type: ${t}}`
};
function Eo(e) {
  const t = D0(e);
  (0, O0.reportError)(t, C0);
}
be.reportTypeError = Eo;
function D0(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, ou.schemaRefOrVal)(e, n, "type");
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
var Kr = {}, xi;
function M0() {
  if (xi) return Kr;
  xi = 1, Object.defineProperty(Kr, "__esModule", { value: !0 }), Kr.assignDefaults = void 0;
  const e = ie, t = F;
  function r(s, a) {
    const { properties: o, items: c } = s.schema;
    if (a === "object" && o)
      for (const l in o)
        n(s, l, o[l].default);
    else a === "array" && Array.isArray(c) && c.forEach((l, d) => n(s, d, l.default));
  }
  Kr.assignDefaults = r;
  function n(s, a, o) {
    const { gen: c, compositeRule: l, data: d, opts: u } = s;
    if (o === void 0)
      return;
    const h = (0, e._)`${d}${(0, e.getProperty)(a)}`;
    if (l) {
      (0, t.checkStrictMode)(s, `default is ignored for: ${h}`);
      return;
    }
    let w = (0, e._)`${h} === undefined`;
    u.useDefaults === "empty" && (w = (0, e._)`${w} || ${h} === null || ${h} === ""`), c.if(w, (0, e._)`${h} = ${(0, e.stringify)(o)}`);
  }
  return Kr;
}
var tt = {}, le = {};
Object.defineProperty(le, "__esModule", { value: !0 });
le.validateUnion = le.validateArray = le.usePattern = le.callValidateCode = le.schemaProperties = le.allSchemaProperties = le.noPropertyInData = le.propertyInData = le.isOwnProperty = le.hasPropFunc = le.reportMissingProp = le.checkMissingProp = le.checkReportMissingProp = void 0;
const pe = ie, bo = F, Ct = $t, V0 = F;
function L0(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(Po(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, pe._)`${t}` }, !0), e.error();
  });
}
le.checkReportMissingProp = L0;
function F0({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, pe.or)(...n.map((a) => (0, pe.and)(Po(e, t, a, r.ownProperties), (0, pe._)`${s} = ${a}`)));
}
le.checkMissingProp = F0;
function z0(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
le.reportMissingProp = z0;
function lu(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, pe._)`Object.prototype.hasOwnProperty`
  });
}
le.hasPropFunc = lu;
function So(e, t, r) {
  return (0, pe._)`${lu(e)}.call(${t}, ${r})`;
}
le.isOwnProperty = So;
function U0(e, t, r, n) {
  const s = (0, pe._)`${t}${(0, pe.getProperty)(r)} !== undefined`;
  return n ? (0, pe._)`${s} && ${So(e, t, r)}` : s;
}
le.propertyInData = U0;
function Po(e, t, r, n) {
  const s = (0, pe._)`${t}${(0, pe.getProperty)(r)} === undefined`;
  return n ? (0, pe.or)(s, (0, pe.not)(So(e, t, r))) : s;
}
le.noPropertyInData = Po;
function uu(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
le.allSchemaProperties = uu;
function q0(e, t) {
  return uu(t).filter((r) => !(0, bo.alwaysValidSchema)(e, t[r]));
}
le.schemaProperties = q0;
function K0({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, c, l, d) {
  const u = d ? (0, pe._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Ct.default.instancePath, (0, pe.strConcat)(Ct.default.instancePath, a)],
    [Ct.default.parentData, o.parentData],
    [Ct.default.parentDataProperty, o.parentDataProperty],
    [Ct.default.rootData, Ct.default.rootData]
  ];
  o.opts.dynamicRef && h.push([Ct.default.dynamicAnchors, Ct.default.dynamicAnchors]);
  const w = (0, pe._)`${u}, ${r.object(...h)}`;
  return l !== pe.nil ? (0, pe._)`${c}.call(${l}, ${w})` : (0, pe._)`${c}(${w})`;
}
le.callValidateCode = K0;
const G0 = (0, pe._)`new RegExp`;
function H0({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, pe._)`${s.code === "new RegExp" ? G0 : (0, V0.useFunc)(e, s)}(${r}, ${n})`
  });
}
le.usePattern = H0;
function X0(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const c = t.let("valid", !0);
    return o(() => t.assign(c, !1)), c;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(c) {
    const l = t.const("len", (0, pe._)`${r}.length`);
    t.forRange("i", 0, l, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: bo.Type.Num
      }, a), t.if((0, pe.not)(a), c);
    });
  }
}
le.validateArray = X0;
function J0(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, bo.alwaysValidSchema)(s, l)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), c = t.name("_valid");
  t.block(() => r.forEach((l, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, c);
    t.assign(o, (0, pe._)`${o} || ${c}`), e.mergeValidEvaluated(u, c) || t.if((0, pe.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
le.validateUnion = J0;
var ec;
function B0() {
  if (ec) return tt;
  ec = 1, Object.defineProperty(tt, "__esModule", { value: !0 }), tt.validateKeywordUsage = tt.validSchemaType = tt.funcKeywordCode = tt.macroKeywordCode = void 0;
  const e = ie, t = $t, r = le, n = dn;
  function s(w, y) {
    const { gen: v, keyword: g, schema: $, parentSchema: m, it: E } = w, P = y.macro.call(E.self, $, m, E), O = d(v, g, P);
    E.opts.validateSchema !== !1 && E.self.validateSchema(P, !0);
    const T = v.name("valid");
    w.subschema({
      schema: P,
      schemaPath: e.nil,
      errSchemaPath: `${E.errSchemaPath}/${g}`,
      topSchemaRef: O,
      compositeRule: !0
    }, T), w.pass(T, () => w.error(!0));
  }
  tt.macroKeywordCode = s;
  function a(w, y) {
    var v;
    const { gen: g, keyword: $, schema: m, parentSchema: E, $data: P, it: O } = w;
    l(O, y);
    const T = !P && y.compile ? y.compile.call(O.self, m, E, O) : y.validate, G = d(g, $, T), Y = g.let("valid");
    w.block$data(Y, ue), w.ok((v = y.valid) !== null && v !== void 0 ? v : Y);
    function ue() {
      if (y.errors === !1)
        K(), y.modifying && o(w), W(() => w.error());
      else {
        const Q = y.async ? he() : $e();
        y.modifying && o(w), W(() => c(w, Q));
      }
    }
    function he() {
      const Q = g.let("ruleErrs", null);
      return g.try(() => K((0, e._)`await `), (j) => g.assign(Y, !1).if((0, e._)`${j} instanceof ${O.ValidationError}`, () => g.assign(Q, (0, e._)`${j}.errors`), () => g.throw(j))), Q;
    }
    function $e() {
      const Q = (0, e._)`${G}.errors`;
      return g.assign(Q, null), K(e.nil), Q;
    }
    function K(Q = y.async ? (0, e._)`await ` : e.nil) {
      const j = O.opts.passContext ? t.default.this : t.default.self, D = !("compile" in y && !P || y.schema === !1);
      g.assign(Y, (0, e._)`${Q}${(0, r.callValidateCode)(w, G, j, D)}`, y.modifying);
    }
    function W(Q) {
      var j;
      g.if((0, e.not)((j = y.valid) !== null && j !== void 0 ? j : Y), Q);
    }
  }
  tt.funcKeywordCode = a;
  function o(w) {
    const { gen: y, data: v, it: g } = w;
    y.if(g.parentData, () => y.assign(v, (0, e._)`${g.parentData}[${g.parentDataProperty}]`));
  }
  function c(w, y) {
    const { gen: v } = w;
    v.if((0, e._)`Array.isArray(${y})`, () => {
      v.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${y} : ${t.default.vErrors}.concat(${y})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(w);
    }, () => w.error());
  }
  function l({ schemaEnv: w }, y) {
    if (y.async && !w.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(w, y, v) {
    if (v === void 0)
      throw new Error(`keyword "${y}" failed to compile`);
    return w.scopeValue("keyword", typeof v == "function" ? { ref: v } : { ref: v, code: (0, e.stringify)(v) });
  }
  function u(w, y, v = !1) {
    return !y.length || y.some((g) => g === "array" ? Array.isArray(w) : g === "object" ? w && typeof w == "object" && !Array.isArray(w) : typeof w == g || v && typeof w > "u");
  }
  tt.validSchemaType = u;
  function h({ schema: w, opts: y, self: v, errSchemaPath: g }, $, m) {
    if (Array.isArray($.keyword) ? !$.keyword.includes(m) : $.keyword !== m)
      throw new Error("ajv implementation error");
    const E = $.dependencies;
    if (E != null && E.some((P) => !Object.prototype.hasOwnProperty.call(w, P)))
      throw new Error(`parent schema must have dependencies of ${m}: ${E.join(",")}`);
    if ($.validateSchema && !$.validateSchema(w[m])) {
      const O = `keyword "${m}" value is invalid at path "${g}": ` + v.errorsText($.validateSchema.errors);
      if (y.validateSchema === "log")
        v.logger.error(O);
      else
        throw new Error(O);
    }
  }
  return tt.validateKeywordUsage = h, tt;
}
var wt = {}, tc;
function W0() {
  if (tc) return wt;
  tc = 1, Object.defineProperty(wt, "__esModule", { value: !0 }), wt.extendSubschemaMode = wt.extendSubschemaData = wt.getSubschema = void 0;
  const e = ie, t = F;
  function r(a, { keyword: o, schemaProp: c, schema: l, schemaPath: d, errSchemaPath: u, topSchemaRef: h }) {
    if (o !== void 0 && l !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (o !== void 0) {
      const w = a.schema[o];
      return c === void 0 ? {
        schema: w,
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${a.errSchemaPath}/${o}`
      } : {
        schema: w[c],
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(o)}${(0, e.getProperty)(c)}`,
        errSchemaPath: `${a.errSchemaPath}/${o}/${(0, t.escapeFragment)(c)}`
      };
    }
    if (l !== void 0) {
      if (d === void 0 || u === void 0 || h === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: l,
        schemaPath: d,
        topSchemaRef: h,
        errSchemaPath: u
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  wt.getSubschema = r;
  function n(a, o, { dataProp: c, dataPropType: l, data: d, dataTypes: u, propertyName: h }) {
    if (d !== void 0 && c !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: w } = o;
    if (c !== void 0) {
      const { errorPath: v, dataPathArr: g, opts: $ } = o, m = w.let("data", (0, e._)`${o.data}${(0, e.getProperty)(c)}`, !0);
      y(m), a.errorPath = (0, e.str)`${v}${(0, t.getErrorPath)(c, l, $.jsPropertySyntax)}`, a.parentDataProperty = (0, e._)`${c}`, a.dataPathArr = [...g, a.parentDataProperty];
    }
    if (d !== void 0) {
      const v = d instanceof e.Name ? d : w.let("data", d, !0);
      y(v), h !== void 0 && (a.propertyName = h);
    }
    u && (a.dataTypes = u);
    function y(v) {
      a.data = v, a.dataLevel = o.dataLevel + 1, a.dataTypes = [], o.definedProperties = /* @__PURE__ */ new Set(), a.parentData = o.data, a.dataNames = [...o.dataNames, v];
    }
  }
  wt.extendSubschemaData = n;
  function s(a, { jtdDiscriminator: o, jtdMetadata: c, compositeRule: l, createErrors: d, allErrors: u }) {
    l !== void 0 && (a.compositeRule = l), d !== void 0 && (a.createErrors = d), u !== void 0 && (a.allErrors = u), a.jtdDiscriminator = o, a.jtdMetadata = c;
  }
  return wt.extendSubschemaMode = s, wt;
}
var Te = {}, du = { exports: {} }, qt = du.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Kn(t, n, s, e, "", e);
};
qt.keywords = {
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
qt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
qt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
qt.skipKeywords = {
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
function Kn(e, t, r, n, s, a, o, c, l, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, c, l, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in qt.arrayKeywords)
          for (var w = 0; w < h.length; w++)
            Kn(e, t, r, h[w], s + "/" + u + "/" + w, a, s, u, n, w);
      } else if (u in qt.propsKeywords) {
        if (h && typeof h == "object")
          for (var y in h)
            Kn(e, t, r, h[y], s + "/" + u + "/" + Y0(y), a, s, u, n, y);
      } else (u in qt.keywords || e.allKeys && !(u in qt.skipKeywords)) && Kn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, c, l, d);
  }
}
function Y0(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Q0 = du.exports;
Object.defineProperty(Te, "__esModule", { value: !0 });
Te.getSchemaRefs = Te.resolveUrl = Te.normalizeId = Te._getFullPath = Te.getFullPath = Te.inlineRef = void 0;
const Z0 = F, x0 = os, eg = Q0, tg = /* @__PURE__ */ new Set([
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
function rg(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !ca(e) : t ? fu(e) <= t : !1;
}
Te.inlineRef = rg;
const ng = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function ca(e) {
  for (const t in e) {
    if (ng.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(ca) || typeof r == "object" && ca(r))
      return !0;
  }
  return !1;
}
function fu(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !tg.has(r) && (typeof e[r] == "object" && (0, Z0.eachItem)(e[r], (n) => t += fu(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function hu(e, t = "", r) {
  r !== !1 && (t = br(t));
  const n = e.parse(t);
  return mu(e, n);
}
Te.getFullPath = hu;
function mu(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Te._getFullPath = mu;
const sg = /#\/?$/;
function br(e) {
  return e ? e.replace(sg, "") : "";
}
Te.normalizeId = br;
function ag(e, t, r) {
  return r = br(r), e.resolve(t, r);
}
Te.resolveUrl = ag;
const og = /^[a-z_][-a-z0-9._]*$/i;
function ig(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = br(e[r] || t), a = { "": s }, o = hu(n, s, !1), c = {}, l = /* @__PURE__ */ new Set();
  return eg(e, { allKeys: !0 }, (h, w, y, v) => {
    if (v === void 0)
      return;
    const g = o + w;
    let $ = a[v];
    typeof h[r] == "string" && ($ = m.call(this, h[r])), E.call(this, h.$anchor), E.call(this, h.$dynamicAnchor), a[w] = $;
    function m(P) {
      const O = this.opts.uriResolver.resolve;
      if (P = br($ ? O($, P) : P), l.has(P))
        throw u(P);
      l.add(P);
      let T = this.refs[P];
      return typeof T == "string" && (T = this.refs[T]), typeof T == "object" ? d(h, T.schema, P) : P !== br(g) && (P[0] === "#" ? (d(h, c[P], P), c[P] = h) : this.refs[P] = g), P;
    }
    function E(P) {
      if (typeof P == "string") {
        if (!og.test(P))
          throw new Error(`invalid anchor "${P}"`);
        m.call(this, `#${P}`);
      }
    }
  }), c;
  function d(h, w, y) {
    if (w !== void 0 && !x0(h, w))
      throw u(y);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Te.getSchemaRefs = ig;
var rc;
function hs() {
  if (rc) return vt;
  rc = 1, Object.defineProperty(vt, "__esModule", { value: !0 }), vt.getData = vt.KeywordCxt = vt.validateFunctionCode = void 0;
  const e = v0(), t = be, r = Nt, n = be, s = M0(), a = B0(), o = W0(), c = ie, l = $t, d = Te, u = F, h = dn;
  function w(R) {
    if (T(R) && (Y(R), O(R))) {
      $(R);
      return;
    }
    y(R, () => (0, e.topBoolOrEmptySchema)(R));
  }
  vt.validateFunctionCode = w;
  function y({ gen: R, validateName: I, schema: C, schemaEnv: M, opts: X }, ee) {
    X.code.es5 ? R.func(I, (0, c._)`${l.default.data}, ${l.default.valCxt}`, M.$async, () => {
      R.code((0, c._)`"use strict"; ${E(C, X)}`), g(R, X), R.code(ee);
    }) : R.func(I, (0, c._)`${l.default.data}, ${v(X)}`, M.$async, () => R.code(E(C, X)).code(ee));
  }
  function v(R) {
    return (0, c._)`{${l.default.instancePath}="", ${l.default.parentData}, ${l.default.parentDataProperty}, ${l.default.rootData}=${l.default.data}${R.dynamicRef ? (0, c._)`, ${l.default.dynamicAnchors}={}` : c.nil}}={}`;
  }
  function g(R, I) {
    R.if(l.default.valCxt, () => {
      R.var(l.default.instancePath, (0, c._)`${l.default.valCxt}.${l.default.instancePath}`), R.var(l.default.parentData, (0, c._)`${l.default.valCxt}.${l.default.parentData}`), R.var(l.default.parentDataProperty, (0, c._)`${l.default.valCxt}.${l.default.parentDataProperty}`), R.var(l.default.rootData, (0, c._)`${l.default.valCxt}.${l.default.rootData}`), I.dynamicRef && R.var(l.default.dynamicAnchors, (0, c._)`${l.default.valCxt}.${l.default.dynamicAnchors}`);
    }, () => {
      R.var(l.default.instancePath, (0, c._)`""`), R.var(l.default.parentData, (0, c._)`undefined`), R.var(l.default.parentDataProperty, (0, c._)`undefined`), R.var(l.default.rootData, l.default.data), I.dynamicRef && R.var(l.default.dynamicAnchors, (0, c._)`{}`);
    });
  }
  function $(R) {
    const { schema: I, opts: C, gen: M } = R;
    y(R, () => {
      C.$comment && I.$comment && Q(R), $e(R), M.let(l.default.vErrors, null), M.let(l.default.errors, 0), C.unevaluated && m(R), ue(R), j(R);
    });
  }
  function m(R) {
    const { gen: I, validateName: C } = R;
    R.evaluated = I.const("evaluated", (0, c._)`${C}.evaluated`), I.if((0, c._)`${R.evaluated}.dynamicProps`, () => I.assign((0, c._)`${R.evaluated}.props`, (0, c._)`undefined`)), I.if((0, c._)`${R.evaluated}.dynamicItems`, () => I.assign((0, c._)`${R.evaluated}.items`, (0, c._)`undefined`));
  }
  function E(R, I) {
    const C = typeof R == "object" && R[I.schemaId];
    return C && (I.code.source || I.code.process) ? (0, c._)`/*# sourceURL=${C} */` : c.nil;
  }
  function P(R, I) {
    if (T(R) && (Y(R), O(R))) {
      G(R, I);
      return;
    }
    (0, e.boolOrEmptySchema)(R, I);
  }
  function O({ schema: R, self: I }) {
    if (typeof R == "boolean")
      return !R;
    for (const C in R)
      if (I.RULES.all[C])
        return !0;
    return !1;
  }
  function T(R) {
    return typeof R.schema != "boolean";
  }
  function G(R, I) {
    const { schema: C, gen: M, opts: X } = R;
    X.$comment && C.$comment && Q(R), K(R), W(R);
    const ee = M.const("_errs", l.default.errors);
    ue(R, ee), M.var(I, (0, c._)`${ee} === ${l.default.errors}`);
  }
  function Y(R) {
    (0, u.checkUnknownRules)(R), he(R);
  }
  function ue(R, I) {
    if (R.opts.jtd)
      return U(R, [], !1, I);
    const C = (0, t.getSchemaTypes)(R.schema), M = (0, t.coerceAndCheckDataType)(R, C);
    U(R, C, !M, I);
  }
  function he(R) {
    const { schema: I, errSchemaPath: C, opts: M, self: X } = R;
    I.$ref && M.ignoreKeywordsWithRef && (0, u.schemaHasRulesButRef)(I, X.RULES) && X.logger.warn(`$ref: keywords ignored in schema at path "${C}"`);
  }
  function $e(R) {
    const { schema: I, opts: C } = R;
    I.default !== void 0 && C.useDefaults && C.strictSchema && (0, u.checkStrictMode)(R, "default is ignored in the schema root");
  }
  function K(R) {
    const I = R.schema[R.opts.schemaId];
    I && (R.baseId = (0, d.resolveUrl)(R.opts.uriResolver, R.baseId, I));
  }
  function W(R) {
    if (R.schema.$async && !R.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function Q({ gen: R, schemaEnv: I, schema: C, errSchemaPath: M, opts: X }) {
    const ee = C.$comment;
    if (X.$comment === !0)
      R.code((0, c._)`${l.default.self}.logger.log(${ee})`);
    else if (typeof X.$comment == "function") {
      const ge = (0, c.str)`${M}/$comment`, Le = R.scopeValue("root", { ref: I.root });
      R.code((0, c._)`${l.default.self}.opts.$comment(${ee}, ${ge}, ${Le}.schema)`);
    }
  }
  function j(R) {
    const { gen: I, schemaEnv: C, validateName: M, ValidationError: X, opts: ee } = R;
    C.$async ? I.if((0, c._)`${l.default.errors} === 0`, () => I.return(l.default.data), () => I.throw((0, c._)`new ${X}(${l.default.vErrors})`)) : (I.assign((0, c._)`${M}.errors`, l.default.vErrors), ee.unevaluated && D(R), I.return((0, c._)`${l.default.errors} === 0`));
  }
  function D({ gen: R, evaluated: I, props: C, items: M }) {
    C instanceof c.Name && R.assign((0, c._)`${I}.props`, C), M instanceof c.Name && R.assign((0, c._)`${I}.items`, M);
  }
  function U(R, I, C, M) {
    const { gen: X, schema: ee, data: ge, allErrors: Le, opts: Se, self: Pe } = R, { RULES: _e } = Pe;
    if (ee.$ref && (Se.ignoreKeywordsWithRef || !(0, u.schemaHasRulesButRef)(ee, _e))) {
      X.block(() => A(R, "$ref", _e.all.$ref.definition));
      return;
    }
    Se.jtd || J(R, I), X.block(() => {
      for (const je of _e.rules)
        dt(je);
      dt(_e.post);
    });
    function dt(je) {
      (0, r.shouldUseGroup)(ee, je) && (je.type ? (X.if((0, n.checkDataType)(je.type, ge, Se.strictNumbers)), L(R, je), I.length === 1 && I[0] === je.type && C && (X.else(), (0, n.reportTypeError)(R)), X.endIf()) : L(R, je), Le || X.if((0, c._)`${l.default.errors} === ${M || 0}`));
    }
  }
  function L(R, I) {
    const { gen: C, schema: M, opts: { useDefaults: X } } = R;
    X && (0, s.assignDefaults)(R, I.type), C.block(() => {
      for (const ee of I.rules)
        (0, r.shouldUseRule)(M, ee) && A(R, ee.keyword, ee.definition, I.type);
    });
  }
  function J(R, I) {
    R.schemaEnv.meta || !R.opts.strictTypes || (z(R, I), R.opts.allowUnionTypes || N(R, I), p(R, R.dataTypes));
  }
  function z(R, I) {
    if (I.length) {
      if (!R.dataTypes.length) {
        R.dataTypes = I;
        return;
      }
      I.forEach((C) => {
        _(R.dataTypes, C) || f(R, `type "${C}" not allowed by context "${R.dataTypes.join(",")}"`);
      }), i(R, I);
    }
  }
  function N(R, I) {
    I.length > 1 && !(I.length === 2 && I.includes("null")) && f(R, "use allowUnionTypes to allow union type keyword");
  }
  function p(R, I) {
    const C = R.self.RULES.all;
    for (const M in C) {
      const X = C[M];
      if (typeof X == "object" && (0, r.shouldUseRule)(R.schema, X)) {
        const { type: ee } = X.definition;
        ee.length && !ee.some((ge) => S(I, ge)) && f(R, `missing type "${ee.join(",")}" for keyword "${M}"`);
      }
    }
  }
  function S(R, I) {
    return R.includes(I) || I === "number" && R.includes("integer");
  }
  function _(R, I) {
    return R.includes(I) || I === "integer" && R.includes("number");
  }
  function i(R, I) {
    const C = [];
    for (const M of R.dataTypes)
      _(I, M) ? C.push(M) : I.includes("integer") && M === "number" && C.push("integer");
    R.dataTypes = C;
  }
  function f(R, I) {
    const C = R.schemaEnv.baseId + R.errSchemaPath;
    I += ` at "${C}" (strictTypes)`, (0, u.checkStrictMode)(R, I, R.opts.strictTypes);
  }
  class b {
    constructor(I, C, M) {
      if ((0, a.validateKeywordUsage)(I, C, M), this.gen = I.gen, this.allErrors = I.allErrors, this.keyword = M, this.data = I.data, this.schema = I.schema[M], this.$data = C.$data && I.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, u.schemaRefOrVal)(I, this.schema, M, this.$data), this.schemaType = C.schemaType, this.parentSchema = I.schema, this.params = {}, this.it = I, this.def = C, this.$data)
        this.schemaCode = I.gen.const("vSchema", q(this.$data, I));
      else if (this.schemaCode = this.schemaValue, !(0, a.validSchemaType)(this.schema, C.schemaType, C.allowUndefined))
        throw new Error(`${M} value must be ${JSON.stringify(C.schemaType)}`);
      ("code" in C ? C.trackErrors : C.errors !== !1) && (this.errsCount = I.gen.const("_errs", l.default.errors));
    }
    result(I, C, M) {
      this.failResult((0, c.not)(I), C, M);
    }
    failResult(I, C, M) {
      this.gen.if(I), M ? M() : this.error(), C ? (this.gen.else(), C(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(I, C) {
      this.failResult((0, c.not)(I), void 0, C);
    }
    fail(I) {
      if (I === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(I), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(I) {
      if (!this.$data)
        return this.fail(I);
      const { schemaCode: C } = this;
      this.fail((0, c._)`${C} !== undefined && (${(0, c.or)(this.invalid$data(), I)})`);
    }
    error(I, C, M) {
      if (C) {
        this.setParams(C), this._error(I, M), this.setParams({});
        return;
      }
      this._error(I, M);
    }
    _error(I, C) {
      (I ? h.reportExtraError : h.reportError)(this, this.def.error, C);
    }
    $dataError() {
      (0, h.reportError)(this, this.def.$dataError || h.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, h.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(I) {
      this.allErrors || this.gen.if(I);
    }
    setParams(I, C) {
      C ? Object.assign(this.params, I) : this.params = I;
    }
    block$data(I, C, M = c.nil) {
      this.gen.block(() => {
        this.check$data(I, M), C();
      });
    }
    check$data(I = c.nil, C = c.nil) {
      if (!this.$data)
        return;
      const { gen: M, schemaCode: X, schemaType: ee, def: ge } = this;
      M.if((0, c.or)((0, c._)`${X} === undefined`, C)), I !== c.nil && M.assign(I, !0), (ee.length || ge.validateSchema) && (M.elseIf(this.invalid$data()), this.$dataError(), I !== c.nil && M.assign(I, !1)), M.else();
    }
    invalid$data() {
      const { gen: I, schemaCode: C, schemaType: M, def: X, it: ee } = this;
      return (0, c.or)(ge(), Le());
      function ge() {
        if (M.length) {
          if (!(C instanceof c.Name))
            throw new Error("ajv implementation error");
          const Se = Array.isArray(M) ? M : [M];
          return (0, c._)`${(0, n.checkDataTypes)(Se, C, ee.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return c.nil;
      }
      function Le() {
        if (X.validateSchema) {
          const Se = I.scopeValue("validate$data", { ref: X.validateSchema });
          return (0, c._)`!${Se}(${C})`;
        }
        return c.nil;
      }
    }
    subschema(I, C) {
      const M = (0, o.getSubschema)(this.it, I);
      (0, o.extendSubschemaData)(M, this.it, I), (0, o.extendSubschemaMode)(M, I);
      const X = { ...this.it, ...M, items: void 0, props: void 0 };
      return P(X, C), X;
    }
    mergeEvaluated(I, C) {
      const { it: M, gen: X } = this;
      M.opts.unevaluated && (M.props !== !0 && I.props !== void 0 && (M.props = u.mergeEvaluated.props(X, I.props, M.props, C)), M.items !== !0 && I.items !== void 0 && (M.items = u.mergeEvaluated.items(X, I.items, M.items, C)));
    }
    mergeValidEvaluated(I, C) {
      const { it: M, gen: X } = this;
      if (M.opts.unevaluated && (M.props !== !0 || M.items !== !0))
        return X.if(C, () => this.mergeEvaluated(I, c.Name)), !0;
    }
  }
  vt.KeywordCxt = b;
  function A(R, I, C, M) {
    const X = new b(R, C, I);
    "code" in C ? C.code(X, M) : X.$data && C.validate ? (0, a.funcKeywordCode)(X, C) : "macro" in C ? (0, a.macroKeywordCode)(X, C) : (C.compile || C.validate) && (0, a.funcKeywordCode)(X, C);
  }
  const k = /^\/(?:[^~]|~0|~1)*$/, H = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function q(R, { dataLevel: I, dataNames: C, dataPathArr: M }) {
    let X, ee;
    if (R === "")
      return l.default.rootData;
    if (R[0] === "/") {
      if (!k.test(R))
        throw new Error(`Invalid JSON-pointer: ${R}`);
      X = R, ee = l.default.rootData;
    } else {
      const Pe = H.exec(R);
      if (!Pe)
        throw new Error(`Invalid JSON-pointer: ${R}`);
      const _e = +Pe[1];
      if (X = Pe[2], X === "#") {
        if (_e >= I)
          throw new Error(Se("property/index", _e));
        return M[I - _e];
      }
      if (_e > I)
        throw new Error(Se("data", _e));
      if (ee = C[I - _e], !X)
        return ee;
    }
    let ge = ee;
    const Le = X.split("/");
    for (const Pe of Le)
      Pe && (ee = (0, c._)`${ee}${(0, c.getProperty)((0, u.unescapeJsonPointer)(Pe))}`, ge = (0, c._)`${ge} && ${ee}`);
    return ge;
    function Se(Pe, _e) {
      return `Cannot access ${Pe} ${_e} levels up, current level is ${I}`;
    }
  }
  return vt.getData = q, vt;
}
var fn = {};
Object.defineProperty(fn, "__esModule", { value: !0 });
class cg extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
fn.default = cg;
var kr = {};
Object.defineProperty(kr, "__esModule", { value: !0 });
const Cs = Te;
class lg extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Cs.resolveUrl)(t, r, n), this.missingSchema = (0, Cs.normalizeId)((0, Cs.getFullPath)(t, this.missingRef));
  }
}
kr.default = lg;
var Xe = {};
Object.defineProperty(Xe, "__esModule", { value: !0 });
Xe.resolveSchema = Xe.getCompilingSchema = Xe.resolveRef = Xe.compileSchema = Xe.SchemaEnv = void 0;
const rt = ie, ug = fn, Yt = $t, ot = Te, nc = F, dg = hs();
class ms {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, ot.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Xe.SchemaEnv = ms;
function No(e) {
  const t = pu.call(this, e);
  if (t)
    return t;
  const r = (0, ot.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new rt.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let c;
  e.$async && (c = o.scopeValue("Error", {
    ref: ug.default,
    code: (0, rt._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = o.scopeName("validate");
  e.validateName = l;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: Yt.default.data,
    parentData: Yt.default.parentData,
    parentDataProperty: Yt.default.parentDataProperty,
    dataNames: [Yt.default.data],
    dataPathArr: [rt.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, rt.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: c,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: rt.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, rt._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, dg.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(Yt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const y = new Function(`${Yt.default.self}`, `${Yt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(l, { ref: y }), y.errors = null, y.schema = e.schema, y.schemaEnv = e, e.$async && (y.$async = !0), this.opts.code.source === !0 && (y.source = { validateName: l, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: v, items: g } = d;
      y.evaluated = {
        props: v instanceof rt.Name ? void 0 : v,
        items: g instanceof rt.Name ? void 0 : g,
        dynamicProps: v instanceof rt.Name,
        dynamicItems: g instanceof rt.Name
      }, y.source && (y.source.evaluated = (0, rt.stringify)(y.evaluated));
    }
    return e.validate = y, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
Xe.compileSchema = No;
function fg(e, t, r) {
  var n;
  r = (0, ot.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = pg.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: c } = this.opts;
    o && (a = new ms({ schema: o, schemaId: c, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = hg.call(this, a);
}
Xe.resolveRef = fg;
function hg(e) {
  return (0, ot.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : No.call(this, e);
}
function pu(e) {
  for (const t of this._compilations)
    if (mg(t, e))
      return t;
}
Xe.getCompilingSchema = pu;
function mg(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function pg(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || ps.call(this, e, t);
}
function ps(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, ot._getFullPath)(this.opts.uriResolver, r);
  let s = (0, ot.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Ds.call(this, r, e);
  const a = (0, ot.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const c = ps.call(this, e, o);
    return typeof (c == null ? void 0 : c.schema) != "object" ? void 0 : Ds.call(this, r, c);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || No.call(this, o), a === (0, ot.normalizeId)(t)) {
      const { schema: c } = o, { schemaId: l } = this.opts, d = c[l];
      return d && (s = (0, ot.resolveUrl)(this.opts.uriResolver, s, d)), new ms({ schema: c, schemaId: l, root: e, baseId: s });
    }
    return Ds.call(this, r, o);
  }
}
Xe.resolveSchema = ps;
const yg = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Ds(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const c of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const l = r[(0, nc.unescapeFragment)(c)];
    if (l === void 0)
      return;
    r = l;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !yg.has(c) && d && (t = (0, ot.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, nc.schemaHasRulesButRef)(r, this.RULES)) {
    const c = (0, ot.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = ps.call(this, n, c);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new ms({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const $g = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", gg = "Meta-schema for $data reference (JSON AnySchema extension proposal)", _g = "object", vg = [
  "$data"
], wg = {
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
}, Eg = !1, bg = {
  $id: $g,
  description: gg,
  type: _g,
  required: vg,
  properties: wg,
  additionalProperties: Eg
};
var Ro = {};
Object.defineProperty(Ro, "__esModule", { value: !0 });
const yu = Fl;
yu.code = 'require("ajv/dist/runtime/uri").default';
Ro.default = yu;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = hs();
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = ie;
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
  const n = fn, s = kr, a = cr, o = Xe, c = ie, l = Te, d = be, u = F, h = bg, w = Ro, y = (N, p) => new RegExp(N, p);
  y.code = "new RegExp";
  const v = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
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
  }, E = 200;
  function P(N) {
    var p, S, _, i, f, b, A, k, H, q, R, I, C, M, X, ee, ge, Le, Se, Pe, _e, dt, je, Ht, Xt;
    const Ze = N.strict, Jt = (p = N.code) === null || p === void 0 ? void 0 : p.optimize, Vr = Jt === !0 || Jt === void 0 ? 1 : Jt || 0, Lr = (_ = (S = N.code) === null || S === void 0 ? void 0 : S.regExp) !== null && _ !== void 0 ? _ : y, bs = (i = N.uriResolver) !== null && i !== void 0 ? i : w.default;
    return {
      strictSchema: (b = (f = N.strictSchema) !== null && f !== void 0 ? f : Ze) !== null && b !== void 0 ? b : !0,
      strictNumbers: (k = (A = N.strictNumbers) !== null && A !== void 0 ? A : Ze) !== null && k !== void 0 ? k : !0,
      strictTypes: (q = (H = N.strictTypes) !== null && H !== void 0 ? H : Ze) !== null && q !== void 0 ? q : "log",
      strictTuples: (I = (R = N.strictTuples) !== null && R !== void 0 ? R : Ze) !== null && I !== void 0 ? I : "log",
      strictRequired: (M = (C = N.strictRequired) !== null && C !== void 0 ? C : Ze) !== null && M !== void 0 ? M : !1,
      code: N.code ? { ...N.code, optimize: Vr, regExp: Lr } : { optimize: Vr, regExp: Lr },
      loopRequired: (X = N.loopRequired) !== null && X !== void 0 ? X : E,
      loopEnum: (ee = N.loopEnum) !== null && ee !== void 0 ? ee : E,
      meta: (ge = N.meta) !== null && ge !== void 0 ? ge : !0,
      messages: (Le = N.messages) !== null && Le !== void 0 ? Le : !0,
      inlineRefs: (Se = N.inlineRefs) !== null && Se !== void 0 ? Se : !0,
      schemaId: (Pe = N.schemaId) !== null && Pe !== void 0 ? Pe : "$id",
      addUsedSchema: (_e = N.addUsedSchema) !== null && _e !== void 0 ? _e : !0,
      validateSchema: (dt = N.validateSchema) !== null && dt !== void 0 ? dt : !0,
      validateFormats: (je = N.validateFormats) !== null && je !== void 0 ? je : !0,
      unicodeRegExp: (Ht = N.unicodeRegExp) !== null && Ht !== void 0 ? Ht : !0,
      int32range: (Xt = N.int32range) !== null && Xt !== void 0 ? Xt : !0,
      uriResolver: bs
    };
  }
  class O {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...P(p) };
      const { es5: S, lines: _ } = this.opts.code;
      this.scope = new c.ValueScope({ scope: {}, prefixes: g, es5: S, lines: _ }), this.logger = W(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), T.call(this, $, p, "NOT SUPPORTED"), T.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = $e.call(this), p.formats && ue.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && he.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), Y.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: _ } = this.opts;
      let i = h;
      _ === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[_], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let _;
      if (typeof p == "string") {
        if (_ = this.getSchema(p), !_)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        _ = this.compile(p);
      const i = _(S);
      return "$async" in _ || (this.errors = _.errors), i;
    }
    compile(p, S) {
      const _ = this._addSchema(p, S);
      return _.validate || this._compileSchemaEnv(_);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: _ } = this.opts;
      return i.call(this, p, S);
      async function i(q, R) {
        await f.call(this, q.$schema);
        const I = this._addSchema(q, R);
        return I.validate || b.call(this, I);
      }
      async function f(q) {
        q && !this.getSchema(q) && await i.call(this, { $ref: q }, !0);
      }
      async function b(q) {
        try {
          return this._compileSchemaEnv(q);
        } catch (R) {
          if (!(R instanceof s.default))
            throw R;
          return A.call(this, R), await k.call(this, R.missingSchema), b.call(this, q);
        }
      }
      function A({ missingSchema: q, missingRef: R }) {
        if (this.refs[q])
          throw new Error(`AnySchema ${q} is loaded but ${R} cannot be resolved`);
      }
      async function k(q) {
        const R = await H.call(this, q);
        this.refs[q] || await f.call(this, R.$schema), this.refs[q] || this.addSchema(R, q, S);
      }
      async function H(q) {
        const R = this._loading[q];
        if (R)
          return R;
        try {
          return await (this._loading[q] = _(q));
        } finally {
          delete this._loading[q];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, _, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, _, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (f = p[b], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, l.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, _, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, _ = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, _), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let _;
      if (_ = p.$schema, _ !== void 0 && typeof _ != "string")
        throw new Error("$schema must be a string");
      if (_ = _ || this.opts.defaultMeta || this.defaultMeta(), !_)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate(_, p);
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
      for (; typeof (S = G.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: _ } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: _ });
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
          const S = G.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let _ = p[this.opts.schemaId];
          return _ && (_ = (0, l.normalizeId)(_), delete this.schemas[_], delete this.refs[_]), this;
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
      let _;
      if (typeof p == "string")
        _ = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = _);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, _ = S.keyword, Array.isArray(_) && !_.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (j.call(this, _, S), !S)
        return (0, u.eachItem)(_, (f) => D.call(this, f)), this;
      L.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)(_, i.type.length === 0 ? (f) => D.call(this, f, i) : (f) => i.type.forEach((b) => D.call(this, f, i, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const _ of S.rules) {
        const i = _.rules.findIndex((f) => f.keyword === p);
        i >= 0 && _.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: _ = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${_}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const _ = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let b = p;
        for (const A of f)
          b = b[A];
        for (const A in _) {
          const k = _[A];
          if (typeof k != "object")
            continue;
          const { $data: H } = k.definition, q = b[A];
          H && q && (b[A] = z(q));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const _ in p) {
        const i = p[_];
        (!S || S.test(_)) && (typeof i == "string" ? delete p[_] : i && !i.meta && (this._cache.delete(i.schema), delete p[_]));
      }
    }
    _addSchema(p, S, _, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let b;
      const { schemaId: A } = this.opts;
      if (typeof p == "object")
        b = p[A];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let k = this._cache.get(p);
      if (k !== void 0)
        return k;
      _ = (0, l.normalizeId)(b || _);
      const H = l.getSchemaRefs.call(this, p, _);
      return k = new o.SchemaEnv({ schema: p, schemaId: A, meta: S, baseId: _, localRefs: H }), this._cache.set(k.schema, k), f && !_.startsWith("#") && (_ && this._checkUnique(_), this.refs[_] = k), i && this.validateSchema(p, !0), k;
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
  O.ValidationError = n.default, O.MissingRefError = s.default, e.default = O;
  function T(N, p, S, _ = "error") {
    for (const i in N) {
      const f = i;
      f in p && this.logger[_](`${S}: option ${i}. ${N[f]}`);
    }
  }
  function G(N) {
    return N = (0, l.normalizeId)(N), this.schemas[N] || this.refs[N];
  }
  function Y() {
    const N = this.opts.schemas;
    if (N)
      if (Array.isArray(N))
        this.addSchema(N);
      else
        for (const p in N)
          this.addSchema(N[p], p);
  }
  function ue() {
    for (const N in this.opts.formats) {
      const p = this.opts.formats[N];
      p && this.addFormat(N, p);
    }
  }
  function he(N) {
    if (Array.isArray(N)) {
      this.addVocabulary(N);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in N) {
      const S = N[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function $e() {
    const N = { ...this.opts };
    for (const p of v)
      delete N[p];
    return N;
  }
  const K = { log() {
  }, warn() {
  }, error() {
  } };
  function W(N) {
    if (N === !1)
      return K;
    if (N === void 0)
      return console;
    if (N.log && N.warn && N.error)
      return N;
    throw new Error("logger must implement log, warn and error methods");
  }
  const Q = /^[a-z_$][a-z0-9_$:-]*$/i;
  function j(N, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(N, (_) => {
      if (S.keywords[_])
        throw new Error(`Keyword ${_} is already defined`);
      if (!Q.test(_))
        throw new Error(`Keyword ${_} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function D(N, p, S) {
    var _;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let b = i ? f.post : f.rules.find(({ type: k }) => k === S);
    if (b || (b = { type: S, rules: [] }, f.rules.push(b)), f.keywords[N] = !0, !p)
      return;
    const A = {
      keyword: N,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? U.call(this, b, A, p.before) : b.rules.push(A), f.all[N] = A, (_ = p.implements) === null || _ === void 0 || _.forEach((k) => this.addKeyword(k));
  }
  function U(N, p, S) {
    const _ = N.rules.findIndex((i) => i.keyword === S);
    _ >= 0 ? N.rules.splice(_, 0, p) : (N.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function L(N) {
    let { metaSchema: p } = N;
    p !== void 0 && (N.$data && this.opts.$data && (p = z(p)), N.validateSchema = this.compile(p, !0));
  }
  const J = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function z(N) {
    return { anyOf: [N, J] };
  }
})(Zl);
var Oo = {}, Io = {}, To = {};
Object.defineProperty(To, "__esModule", { value: !0 });
const Sg = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
To.default = Sg;
var lr = {};
Object.defineProperty(lr, "__esModule", { value: !0 });
lr.callRef = lr.getValidate = void 0;
const Pg = kr, sc = le, He = ie, fr = $t, ac = Xe, bn = F, Ng = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: c, self: l } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = ac.resolveRef.call(l, d, s, r);
    if (u === void 0)
      throw new Pg.default(n.opts.uriResolver, s, r);
    if (u instanceof ac.SchemaEnv)
      return w(u);
    return y(u);
    function h() {
      if (a === d)
        return Gn(e, o, a, a.$async);
      const v = t.scopeValue("root", { ref: d });
      return Gn(e, (0, He._)`${v}.validate`, d, d.$async);
    }
    function w(v) {
      const g = $u(e, v);
      Gn(e, g, v, v.$async);
    }
    function y(v) {
      const g = t.scopeValue("schema", c.code.source === !0 ? { ref: v, code: (0, He.stringify)(v) } : { ref: v }), $ = t.name("valid"), m = e.subschema({
        schema: v,
        dataTypes: [],
        schemaPath: He.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, $);
      e.mergeEvaluated(m), e.ok($);
    }
  }
};
function $u(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, He._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
lr.getValidate = $u;
function Gn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: c, opts: l } = a, d = l.passContext ? fr.default.this : He.nil;
  n ? u() : h();
  function u() {
    if (!c.$async)
      throw new Error("async schema referenced by sync schema");
    const v = s.let("valid");
    s.try(() => {
      s.code((0, He._)`await ${(0, sc.callValidateCode)(e, t, d)}`), y(t), o || s.assign(v, !0);
    }, (g) => {
      s.if((0, He._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), w(g), o || s.assign(v, !1);
    }), e.ok(v);
  }
  function h() {
    e.result((0, sc.callValidateCode)(e, t, d), () => y(t), () => w(t));
  }
  function w(v) {
    const g = (0, He._)`${v}.errors`;
    s.assign(fr.default.vErrors, (0, He._)`${fr.default.vErrors} === null ? ${g} : ${fr.default.vErrors}.concat(${g})`), s.assign(fr.default.errors, (0, He._)`${fr.default.vErrors}.length`);
  }
  function y(v) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const $ = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if ($ && !$.dynamicProps)
        $.props !== void 0 && (a.props = bn.mergeEvaluated.props(s, $.props, a.props));
      else {
        const m = s.var("props", (0, He._)`${v}.evaluated.props`);
        a.props = bn.mergeEvaluated.props(s, m, a.props, He.Name);
      }
    if (a.items !== !0)
      if ($ && !$.dynamicItems)
        $.items !== void 0 && (a.items = bn.mergeEvaluated.items(s, $.items, a.items));
      else {
        const m = s.var("items", (0, He._)`${v}.evaluated.items`);
        a.items = bn.mergeEvaluated.items(s, m, a.items, He.Name);
      }
  }
}
lr.callRef = Gn;
lr.default = Ng;
Object.defineProperty(Io, "__esModule", { value: !0 });
const Rg = To, Og = lr, Ig = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  Rg.default,
  Og.default
];
Io.default = Ig;
var jo = {}, Ao = {};
Object.defineProperty(Ao, "__esModule", { value: !0 });
const xn = ie, Dt = xn.operators, es = {
  maximum: { okStr: "<=", ok: Dt.LTE, fail: Dt.GT },
  minimum: { okStr: ">=", ok: Dt.GTE, fail: Dt.LT },
  exclusiveMaximum: { okStr: "<", ok: Dt.LT, fail: Dt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Dt.GT, fail: Dt.LTE }
}, Tg = {
  message: ({ keyword: e, schemaCode: t }) => (0, xn.str)`must be ${es[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, xn._)`{comparison: ${es[e].okStr}, limit: ${t}}`
}, jg = {
  keyword: Object.keys(es),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Tg,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, xn._)`${r} ${es[t].fail} ${n} || isNaN(${r})`);
  }
};
Ao.default = jg;
var ko = {};
Object.defineProperty(ko, "__esModule", { value: !0 });
const tn = ie, Ag = {
  message: ({ schemaCode: e }) => (0, tn.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, tn._)`{multipleOf: ${e}}`
}, kg = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Ag,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), c = a ? (0, tn._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, tn._)`${o} !== parseInt(${o})`;
    e.fail$data((0, tn._)`(${n} === 0 || (${o} = ${r}/${n}, ${c}))`);
  }
};
ko.default = kg;
var Co = {}, Do = {};
Object.defineProperty(Do, "__esModule", { value: !0 });
function gu(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Do.default = gu;
gu.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Co, "__esModule", { value: !0 });
const tr = ie, Cg = F, Dg = Do, Mg = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, tr.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, tr._)`{limit: ${e}}`
}, Vg = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: Mg,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? tr.operators.GT : tr.operators.LT, o = s.opts.unicode === !1 ? (0, tr._)`${r}.length` : (0, tr._)`${(0, Cg.useFunc)(e.gen, Dg.default)}(${r})`;
    e.fail$data((0, tr._)`${o} ${a} ${n}`);
  }
};
Co.default = Vg;
var Mo = {};
Object.defineProperty(Mo, "__esModule", { value: !0 });
const Lg = le, Fg = F, _r = ie, zg = {
  message: ({ schemaCode: e }) => (0, _r.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, _r._)`{pattern: ${e}}`
}, Ug = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: zg,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e, c = o.opts.unicodeRegExp ? "u" : "";
    if (n) {
      const { regExp: l } = o.opts.code, d = l.code === "new RegExp" ? (0, _r._)`new RegExp` : (0, Fg.useFunc)(t, l), u = t.let("valid");
      t.try(() => t.assign(u, (0, _r._)`${d}(${a}, ${c}).test(${r})`), () => t.assign(u, !1)), e.fail$data((0, _r._)`!${u}`);
    } else {
      const l = (0, Lg.usePattern)(e, s);
      e.fail$data((0, _r._)`!${l}.test(${r})`);
    }
  }
};
Mo.default = Ug;
var Vo = {};
Object.defineProperty(Vo, "__esModule", { value: !0 });
const rn = ie, qg = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, rn.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, rn._)`{limit: ${e}}`
}, Kg = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: qg,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? rn.operators.GT : rn.operators.LT;
    e.fail$data((0, rn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Vo.default = Kg;
var Lo = {};
Object.defineProperty(Lo, "__esModule", { value: !0 });
const Gr = le, nn = ie, Gg = F, Hg = {
  message: ({ params: { missingProperty: e } }) => (0, nn.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, nn._)`{missingProperty: ${e}}`
}, Xg = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Hg,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: c } = o;
    if (!a && r.length === 0)
      return;
    const l = r.length >= c.loopRequired;
    if (o.allErrors ? d() : u(), c.strictRequired) {
      const y = e.parentSchema.properties, { definedProperties: v } = e.it;
      for (const g of r)
        if ((y == null ? void 0 : y[g]) === void 0 && !v.has(g)) {
          const $ = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${g}" is not defined at "${$}" (strictRequired)`;
          (0, Gg.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (l || a)
        e.block$data(nn.nil, h);
      else
        for (const y of r)
          (0, Gr.checkReportMissingProp)(e, y);
    }
    function u() {
      const y = t.let("missing");
      if (l || a) {
        const v = t.let("valid", !0);
        e.block$data(v, () => w(y, v)), e.ok(v);
      } else
        t.if((0, Gr.checkMissingProp)(e, r, y)), (0, Gr.reportMissingProp)(e, y), t.else();
    }
    function h() {
      t.forOf("prop", n, (y) => {
        e.setParams({ missingProperty: y }), t.if((0, Gr.noPropertyInData)(t, s, y, c.ownProperties), () => e.error());
      });
    }
    function w(y, v) {
      e.setParams({ missingProperty: y }), t.forOf(y, n, () => {
        t.assign(v, (0, Gr.propertyInData)(t, s, y, c.ownProperties)), t.if((0, nn.not)(v), () => {
          e.error(), t.break();
        });
      }, nn.nil);
    }
  }
};
Lo.default = Xg;
var Fo = {};
Object.defineProperty(Fo, "__esModule", { value: !0 });
const sn = ie, Jg = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, sn.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, sn._)`{limit: ${e}}`
}, Bg = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Jg,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? sn.operators.GT : sn.operators.LT;
    e.fail$data((0, sn._)`${r}.length ${s} ${n}`);
  }
};
Fo.default = Bg;
var zo = {}, hn = {};
Object.defineProperty(hn, "__esModule", { value: !0 });
const _u = os;
_u.code = 'require("ajv/dist/runtime/equal").default';
hn.default = _u;
Object.defineProperty(zo, "__esModule", { value: !0 });
const Ms = be, Oe = ie, Wg = F, Yg = hn, Qg = {
  message: ({ params: { i: e, j: t } }) => (0, Oe.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Oe._)`{i: ${e}, j: ${t}}`
}, Zg = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: Qg,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: c } = e;
    if (!n && !s)
      return;
    const l = t.let("valid"), d = a.items ? (0, Ms.getSchemaTypes)(a.items) : [];
    e.block$data(l, u, (0, Oe._)`${o} === false`), e.ok(l);
    function u() {
      const v = t.let("i", (0, Oe._)`${r}.length`), g = t.let("j");
      e.setParams({ i: v, j: g }), t.assign(l, !0), t.if((0, Oe._)`${v} > 1`, () => (h() ? w : y)(v, g));
    }
    function h() {
      return d.length > 0 && !d.some((v) => v === "object" || v === "array");
    }
    function w(v, g) {
      const $ = t.name("item"), m = (0, Ms.checkDataTypes)(d, $, c.opts.strictNumbers, Ms.DataType.Wrong), E = t.const("indices", (0, Oe._)`{}`);
      t.for((0, Oe._)`;${v}--;`, () => {
        t.let($, (0, Oe._)`${r}[${v}]`), t.if(m, (0, Oe._)`continue`), d.length > 1 && t.if((0, Oe._)`typeof ${$} == "string"`, (0, Oe._)`${$} += "_"`), t.if((0, Oe._)`typeof ${E}[${$}] == "number"`, () => {
          t.assign(g, (0, Oe._)`${E}[${$}]`), e.error(), t.assign(l, !1).break();
        }).code((0, Oe._)`${E}[${$}] = ${v}`);
      });
    }
    function y(v, g) {
      const $ = (0, Wg.useFunc)(t, Yg.default), m = t.name("outer");
      t.label(m).for((0, Oe._)`;${v}--;`, () => t.for((0, Oe._)`${g} = ${v}; ${g}--;`, () => t.if((0, Oe._)`${$}(${r}[${v}], ${r}[${g}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
zo.default = Zg;
var Uo = {};
Object.defineProperty(Uo, "__esModule", { value: !0 });
const la = ie, xg = F, e_ = hn, t_ = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, la._)`{allowedValue: ${e}}`
}, r_ = {
  keyword: "const",
  $data: !0,
  error: t_,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, la._)`!${(0, xg.useFunc)(t, e_.default)}(${r}, ${s})`) : e.fail((0, la._)`${a} !== ${r}`);
  }
};
Uo.default = r_;
var qo = {};
Object.defineProperty(qo, "__esModule", { value: !0 });
const Wr = ie, n_ = F, s_ = hn, a_ = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Wr._)`{allowedValues: ${e}}`
}, o_ = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: a_,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const c = s.length >= o.opts.loopEnum;
    let l;
    const d = () => l ?? (l = (0, n_.useFunc)(t, s_.default));
    let u;
    if (c || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const y = t.const("vSchema", a);
      u = (0, Wr.or)(...s.map((v, g) => w(y, g)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (y) => t.if((0, Wr._)`${d()}(${r}, ${y})`, () => t.assign(u, !0).break()));
    }
    function w(y, v) {
      const g = s[v];
      return typeof g == "object" && g !== null ? (0, Wr._)`${d()}(${r}, ${y}[${v}])` : (0, Wr._)`${r} === ${g}`;
    }
  }
};
qo.default = o_;
Object.defineProperty(jo, "__esModule", { value: !0 });
const i_ = Ao, c_ = ko, l_ = Co, u_ = Mo, d_ = Vo, f_ = Lo, h_ = Fo, m_ = zo, p_ = Uo, y_ = qo, $_ = [
  // number
  i_.default,
  c_.default,
  // string
  l_.default,
  u_.default,
  // object
  d_.default,
  f_.default,
  // array
  h_.default,
  m_.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  p_.default,
  y_.default
];
jo.default = $_;
var Ko = {}, Cr = {};
Object.defineProperty(Cr, "__esModule", { value: !0 });
Cr.validateAdditionalItems = void 0;
const rr = ie, ua = F, g_ = {
  message: ({ params: { len: e } }) => (0, rr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, rr._)`{limit: ${e}}`
}, __ = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: g_,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, ua.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    vu(e, n);
  }
};
function vu(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const c = r.const("len", (0, rr._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, rr._)`${c} <= ${t.length}`);
  else if (typeof n == "object" && !(0, ua.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, rr._)`${c} <= ${t.length}`);
    r.if((0, rr.not)(d), () => l(d)), e.ok(d);
  }
  function l(d) {
    r.forRange("i", t.length, c, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: ua.Type.Num }, d), o.allErrors || r.if((0, rr.not)(d), () => r.break());
    });
  }
}
Cr.validateAdditionalItems = vu;
Cr.default = __;
var Go = {}, Dr = {};
Object.defineProperty(Dr, "__esModule", { value: !0 });
Dr.validateTuple = void 0;
const oc = ie, Hn = F, v_ = le, w_ = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return wu(e, "additionalItems", t);
    r.items = !0, !(0, Hn.alwaysValidSchema)(r, t) && e.ok((0, v_.validateArray)(e));
  }
};
function wu(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: c } = e;
  u(s), c.opts.unevaluated && r.length && c.items !== !0 && (c.items = Hn.mergeEvaluated.items(n, r.length, c.items));
  const l = n.name("valid"), d = n.const("len", (0, oc._)`${a}.length`);
  r.forEach((h, w) => {
    (0, Hn.alwaysValidSchema)(c, h) || (n.if((0, oc._)`${d} > ${w}`, () => e.subschema({
      keyword: o,
      schemaProp: w,
      dataProp: w
    }, l)), e.ok(l));
  });
  function u(h) {
    const { opts: w, errSchemaPath: y } = c, v = r.length, g = v === h.minItems && (v === h.maxItems || h[t] === !1);
    if (w.strictTuples && !g) {
      const $ = `"${o}" is ${v}-tuple, but minItems or maxItems/${t} are not specified or different at path "${y}"`;
      (0, Hn.checkStrictMode)(c, $, w.strictTuples);
    }
  }
}
Dr.validateTuple = wu;
Dr.default = w_;
Object.defineProperty(Go, "__esModule", { value: !0 });
const E_ = Dr, b_ = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, E_.validateTuple)(e, "items")
};
Go.default = b_;
var Ho = {};
Object.defineProperty(Ho, "__esModule", { value: !0 });
const ic = ie, S_ = F, P_ = le, N_ = Cr, R_ = {
  message: ({ params: { len: e } }) => (0, ic.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, ic._)`{limit: ${e}}`
}, O_ = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: R_,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, S_.alwaysValidSchema)(n, t) && (s ? (0, N_.validateAdditionalItems)(e, s) : e.ok((0, P_.validateArray)(e)));
  }
};
Ho.default = O_;
var Xo = {};
Object.defineProperty(Xo, "__esModule", { value: !0 });
const Qe = ie, Sn = F, I_ = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Qe.str)`must contain at least ${e} valid item(s)` : (0, Qe.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Qe._)`{minContains: ${e}}` : (0, Qe._)`{minContains: ${e}, maxContains: ${t}}`
}, T_ = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: I_,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, c;
    const { minContains: l, maxContains: d } = n;
    a.opts.next ? (o = l === void 0 ? 1 : l, c = d) : o = 1;
    const u = t.const("len", (0, Qe._)`${s}.length`);
    if (e.setParams({ min: o, max: c }), c === void 0 && o === 0) {
      (0, Sn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (c !== void 0 && o > c) {
      (0, Sn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, Sn.alwaysValidSchema)(a, r)) {
      let g = (0, Qe._)`${u} >= ${o}`;
      c !== void 0 && (g = (0, Qe._)`${g} && ${u} <= ${c}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    c === void 0 && o === 1 ? y(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), c !== void 0 && t.if((0, Qe._)`${s}.length > 0`, w)) : (t.let(h, !1), w()), e.result(h, () => e.reset());
    function w() {
      const g = t.name("_valid"), $ = t.let("count", 0);
      y(g, () => t.if(g, () => v($)));
    }
    function y(g, $) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: Sn.Type.Num,
          compositeRule: !0
        }, g), $();
      });
    }
    function v(g) {
      t.code((0, Qe._)`${g}++`), c === void 0 ? t.if((0, Qe._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Qe._)`${g} > ${c}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Qe._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Xo.default = T_;
var Eu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = ie, r = F, n = le;
  e.error = {
    message: ({ params: { property: l, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${l},
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
    code(l) {
      const [d, u] = a(l);
      o(l, d), c(l, u);
    }
  };
  function a({ schema: l }) {
    const d = {}, u = {};
    for (const h in l) {
      if (h === "__proto__")
        continue;
      const w = Array.isArray(l[h]) ? d : u;
      w[h] = l[h];
    }
    return [d, u];
  }
  function o(l, d = l.schema) {
    const { gen: u, data: h, it: w } = l;
    if (Object.keys(d).length === 0)
      return;
    const y = u.let("missing");
    for (const v in d) {
      const g = d[v];
      if (g.length === 0)
        continue;
      const $ = (0, n.propertyInData)(u, h, v, w.opts.ownProperties);
      l.setParams({
        property: v,
        depsCount: g.length,
        deps: g.join(", ")
      }), w.allErrors ? u.if($, () => {
        for (const m of g)
          (0, n.checkReportMissingProp)(l, m);
      }) : (u.if((0, t._)`${$} && (${(0, n.checkMissingProp)(l, g, y)})`), (0, n.reportMissingProp)(l, y), u.else());
    }
  }
  e.validatePropertyDeps = o;
  function c(l, d = l.schema) {
    const { gen: u, data: h, keyword: w, it: y } = l, v = u.name("valid");
    for (const g in d)
      (0, r.alwaysValidSchema)(y, d[g]) || (u.if(
        (0, n.propertyInData)(u, h, g, y.opts.ownProperties),
        () => {
          const $ = l.subschema({ keyword: w, schemaProp: g }, v);
          l.mergeValidEvaluated($, v);
        },
        () => u.var(v, !0)
        // TODO var
      ), l.ok(v));
  }
  e.validateSchemaDeps = c, e.default = s;
})(Eu);
var Jo = {};
Object.defineProperty(Jo, "__esModule", { value: !0 });
const bu = ie, j_ = F, A_ = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, bu._)`{propertyName: ${e.propertyName}}`
}, k_ = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: A_,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, j_.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, bu.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Jo.default = k_;
var ys = {};
Object.defineProperty(ys, "__esModule", { value: !0 });
const Pn = le, st = ie, C_ = $t, Nn = F, D_ = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, st._)`{additionalProperty: ${e.additionalProperty}}`
}, M_ = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: D_,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: c, opts: l } = o;
    if (o.props = !0, l.removeAdditional !== "all" && (0, Nn.alwaysValidSchema)(o, r))
      return;
    const d = (0, Pn.allSchemaProperties)(n.properties), u = (0, Pn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, st._)`${a} === ${C_.default.errors}`);
    function h() {
      t.forIn("key", s, ($) => {
        !d.length && !u.length ? v($) : t.if(w($), () => v($));
      });
    }
    function w($) {
      let m;
      if (d.length > 8) {
        const E = (0, Nn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, Pn.isOwnProperty)(t, E, $);
      } else d.length ? m = (0, st.or)(...d.map((E) => (0, st._)`${$} === ${E}`)) : m = st.nil;
      return u.length && (m = (0, st.or)(m, ...u.map((E) => (0, st._)`${(0, Pn.usePattern)(e, E)}.test(${$})`))), (0, st.not)(m);
    }
    function y($) {
      t.code((0, st._)`delete ${s}[${$}]`);
    }
    function v($) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        y($);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: $ }), e.error(), c || t.break();
        return;
      }
      if (typeof r == "object" && !(0, Nn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (g($, m, !1), t.if((0, st.not)(m), () => {
          e.reset(), y($);
        })) : (g($, m), c || t.if((0, st.not)(m), () => t.break()));
      }
    }
    function g($, m, E) {
      const P = {
        keyword: "additionalProperties",
        dataProp: $,
        dataPropType: Nn.Type.Str
      };
      E === !1 && Object.assign(P, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(P, m);
    }
  }
};
ys.default = M_;
var Bo = {};
Object.defineProperty(Bo, "__esModule", { value: !0 });
const V_ = hs(), cc = le, Vs = F, lc = ys, L_ = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && lc.default.code(new V_.KeywordCxt(a, lc.default, "additionalProperties"));
    const o = (0, cc.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Vs.mergeEvaluated.props(t, (0, Vs.toHash)(o), a.props));
    const c = o.filter((h) => !(0, Vs.alwaysValidSchema)(a, r[h]));
    if (c.length === 0)
      return;
    const l = t.name("valid");
    for (const h of c)
      d(h) ? u(h) : (t.if((0, cc.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(l);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, l);
    }
  }
};
Bo.default = L_;
var Wo = {};
Object.defineProperty(Wo, "__esModule", { value: !0 });
const uc = le, Rn = ie, dc = F, fc = F, F_ = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, c = (0, uc.allSchemaProperties)(r), l = c.filter((g) => (0, dc.alwaysValidSchema)(a, r[g]));
    if (c.length === 0 || l.length === c.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof Rn.Name) && (a.props = (0, fc.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    w();
    function w() {
      for (const g of c)
        d && y(g), a.allErrors ? v(g) : (t.var(u, !0), v(g), t.if(u));
    }
    function y(g) {
      for (const $ in d)
        new RegExp(g).test($) && (0, dc.checkStrictMode)(a, `property ${$} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function v(g) {
      t.forIn("key", n, ($) => {
        t.if((0, Rn._)`${(0, uc.usePattern)(e, g)}.test(${$})`, () => {
          const m = l.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: $,
            dataPropType: fc.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, Rn._)`${h}[${$}]`, !0) : !m && !a.allErrors && t.if((0, Rn.not)(u), () => t.break());
        });
      });
    }
  }
};
Wo.default = F_;
var Yo = {};
Object.defineProperty(Yo, "__esModule", { value: !0 });
const z_ = F, U_ = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, z_.alwaysValidSchema)(n, r)) {
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
Yo.default = U_;
var Qo = {};
Object.defineProperty(Qo, "__esModule", { value: !0 });
const q_ = le, K_ = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: q_.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Qo.default = K_;
var Zo = {};
Object.defineProperty(Zo, "__esModule", { value: !0 });
const Xn = ie, G_ = F, H_ = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Xn._)`{passingSchemas: ${e.passing}}`
}, X_ = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: H_,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), c = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: c }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let w;
        (0, G_.alwaysValidSchema)(s, u) ? t.var(l, !0) : w = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, l), h > 0 && t.if((0, Xn._)`${l} && ${o}`).assign(o, !1).assign(c, (0, Xn._)`[${c}, ${h}]`).else(), t.if(l, () => {
          t.assign(o, !0), t.assign(c, h), w && e.mergeEvaluated(w, Xn.Name);
        });
      });
    }
  }
};
Zo.default = X_;
var xo = {};
Object.defineProperty(xo, "__esModule", { value: !0 });
const J_ = F, B_ = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, J_.alwaysValidSchema)(n, a))
        return;
      const c = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(c);
    });
  }
};
xo.default = B_;
var ei = {};
Object.defineProperty(ei, "__esModule", { value: !0 });
const ts = ie, Su = F, W_ = {
  message: ({ params: e }) => (0, ts.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, ts._)`{failingKeyword: ${e.ifClause}}`
}, Y_ = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: W_,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Su.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = hc(n, "then"), a = hc(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), c = t.name("_valid");
    if (l(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(c, d("then", u), d("else", u));
    } else s ? t.if(c, d("then")) : t.if((0, ts.not)(c), d("else"));
    e.pass(o, () => e.error(!0));
    function l() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, c);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const w = e.subschema({ keyword: u }, c);
        t.assign(o, c), e.mergeValidEvaluated(w, o), h ? t.assign(h, (0, ts._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function hc(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Su.alwaysValidSchema)(e, r);
}
ei.default = Y_;
var ti = {};
Object.defineProperty(ti, "__esModule", { value: !0 });
const Q_ = F, Z_ = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Q_.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
ti.default = Z_;
Object.defineProperty(Ko, "__esModule", { value: !0 });
const x_ = Cr, ev = Go, tv = Dr, rv = Ho, nv = Xo, sv = Eu, av = Jo, ov = ys, iv = Bo, cv = Wo, lv = Yo, uv = Qo, dv = Zo, fv = xo, hv = ei, mv = ti;
function pv(e = !1) {
  const t = [
    // any
    lv.default,
    uv.default,
    dv.default,
    fv.default,
    hv.default,
    mv.default,
    // object
    av.default,
    ov.default,
    sv.default,
    iv.default,
    cv.default
  ];
  return e ? t.push(ev.default, rv.default) : t.push(x_.default, tv.default), t.push(nv.default), t;
}
Ko.default = pv;
var ri = {}, ni = {};
Object.defineProperty(ni, "__esModule", { value: !0 });
const we = ie, yv = {
  message: ({ schemaCode: e }) => (0, we.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, we._)`{format: ${e}}`
}, $v = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: yv,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: c } = e, { opts: l, errSchemaPath: d, schemaEnv: u, self: h } = c;
    if (!l.validateFormats)
      return;
    s ? w() : y();
    function w() {
      const v = r.scopeValue("formats", {
        ref: h.formats,
        code: l.code.formats
      }), g = r.const("fDef", (0, we._)`${v}[${o}]`), $ = r.let("fType"), m = r.let("format");
      r.if((0, we._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => r.assign($, (0, we._)`${g}.type || "string"`).assign(m, (0, we._)`${g}.validate`), () => r.assign($, (0, we._)`"string"`).assign(m, g)), e.fail$data((0, we.or)(E(), P()));
      function E() {
        return l.strictSchema === !1 ? we.nil : (0, we._)`${o} && !${m}`;
      }
      function P() {
        const O = u.$async ? (0, we._)`(${g}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, we._)`${m}(${n})`, T = (0, we._)`(typeof ${m} == "function" ? ${O} : ${m}.test(${n}))`;
        return (0, we._)`${m} && ${m} !== true && ${$} === ${t} && !${T}`;
      }
    }
    function y() {
      const v = h.formats[a];
      if (!v) {
        E();
        return;
      }
      if (v === !0)
        return;
      const [g, $, m] = P(v);
      g === t && e.pass(O());
      function E() {
        if (l.strictSchema === !1) {
          h.logger.warn(T());
          return;
        }
        throw new Error(T());
        function T() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function P(T) {
        const G = T instanceof RegExp ? (0, we.regexpCode)(T) : l.code.formats ? (0, we._)`${l.code.formats}${(0, we.getProperty)(a)}` : void 0, Y = r.scopeValue("formats", { key: a, ref: T, code: G });
        return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, we._)`${Y}.validate`] : ["string", T, Y];
      }
      function O() {
        if (typeof v == "object" && !(v instanceof RegExp) && v.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, we._)`await ${m}(${n})`;
        }
        return typeof $ == "function" ? (0, we._)`${m}(${n})` : (0, we._)`${m}.test(${n})`;
      }
    }
  }
};
ni.default = $v;
Object.defineProperty(ri, "__esModule", { value: !0 });
const gv = ni, _v = [gv.default];
ri.default = _v;
var Rr = {};
Object.defineProperty(Rr, "__esModule", { value: !0 });
Rr.contentVocabulary = Rr.metadataVocabulary = void 0;
Rr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Rr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Oo, "__esModule", { value: !0 });
const vv = Io, wv = jo, Ev = Ko, bv = ri, mc = Rr, Sv = [
  vv.default,
  wv.default,
  (0, Ev.default)(),
  bv.default,
  mc.metadataVocabulary,
  mc.contentVocabulary
];
Oo.default = Sv;
var si = {}, $s = {};
Object.defineProperty($s, "__esModule", { value: !0 });
$s.DiscrError = void 0;
var pc;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(pc || ($s.DiscrError = pc = {}));
Object.defineProperty(si, "__esModule", { value: !0 });
const pr = ie, da = $s, yc = Xe, Pv = kr, Nv = F, Rv = {
  message: ({ params: { discrError: e, tagName: t } }) => e === da.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, pr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, Ov = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: Rv,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const c = n.propertyName;
    if (typeof c != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), d = t.const("tag", (0, pr._)`${r}${(0, pr.getProperty)(c)}`);
    t.if((0, pr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: da.DiscrError.Tag, tag: d, tagName: c })), e.ok(l);
    function u() {
      const y = w();
      t.if(!1);
      for (const v in y)
        t.elseIf((0, pr._)`${d} === ${v}`), t.assign(l, h(y[v]));
      t.else(), e.error(!1, { discrError: da.DiscrError.Mapping, tag: d, tagName: c }), t.endIf();
    }
    function h(y) {
      const v = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: y }, v);
      return e.mergeEvaluated(g, pr.Name), v;
    }
    function w() {
      var y;
      const v = {}, g = m(s);
      let $ = !0;
      for (let O = 0; O < o.length; O++) {
        let T = o[O];
        if (T != null && T.$ref && !(0, Nv.schemaHasRulesButRef)(T, a.self.RULES)) {
          const Y = T.$ref;
          if (T = yc.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, Y), T instanceof yc.SchemaEnv && (T = T.schema), T === void 0)
            throw new Pv.default(a.opts.uriResolver, a.baseId, Y);
        }
        const G = (y = T == null ? void 0 : T.properties) === null || y === void 0 ? void 0 : y[c];
        if (typeof G != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${c}"`);
        $ = $ && (g || m(T)), E(G, O);
      }
      if (!$)
        throw new Error(`discriminator: "${c}" must be required`);
      return v;
      function m({ required: O }) {
        return Array.isArray(O) && O.includes(c);
      }
      function E(O, T) {
        if (O.const)
          P(O.const, T);
        else if (O.enum)
          for (const G of O.enum)
            P(G, T);
        else
          throw new Error(`discriminator: "properties/${c}" must have "const" or "enum"`);
      }
      function P(O, T) {
        if (typeof O != "string" || O in v)
          throw new Error(`discriminator: "${c}" values must be unique strings`);
        v[O] = T;
      }
    }
  }
};
si.default = Ov;
const Iv = "http://json-schema.org/draft-07/schema#", Tv = "http://json-schema.org/draft-07/schema#", jv = "Core schema meta-schema", Av = {
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
}, kv = [
  "object",
  "boolean"
], Cv = {
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
}, Dv = {
  $schema: Iv,
  $id: Tv,
  title: jv,
  definitions: Av,
  type: kv,
  properties: Cv,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = Zl, n = Oo, s = si, a = Dv, o = ["/properties"], c = "http://json-schema.org/draft-07/schema";
  class l extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((v) => this.addVocabulary(v)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const v = this.opts.$data ? this.$dataMetaSchema(a, o) : a;
      this.addMetaSchema(v, c, !1), this.refs["http://json-schema.org/schema"] = c;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0);
    }
  }
  t.Ajv = l, e.exports = t = l, e.exports.Ajv = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var d = hs();
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var u = ie;
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
  var h = fn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var w = kr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return w.default;
  } });
})(sa, sa.exports);
var Mv = sa.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = Mv, r = ie, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: c, schemaCode: l }) => (0, r.str)`should be ${s[c].okStr} ${l}`,
    params: ({ keyword: c, schemaCode: l }) => (0, r._)`{comparison: ${s[c].okStr}, limit: ${l}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(c) {
      const { gen: l, data: d, schemaCode: u, keyword: h, it: w } = c, { opts: y, self: v } = w;
      if (!y.validateFormats)
        return;
      const g = new t.KeywordCxt(w, v.RULES.all.format.definition, "format");
      g.$data ? $() : m();
      function $() {
        const P = l.scopeValue("formats", {
          ref: v.formats,
          code: y.code.formats
        }), O = l.const("fmt", (0, r._)`${P}[${g.schemaCode}]`);
        c.fail$data((0, r.or)((0, r._)`typeof ${O} != "object"`, (0, r._)`${O} instanceof RegExp`, (0, r._)`typeof ${O}.compare != "function"`, E(O)));
      }
      function m() {
        const P = g.schema, O = v.formats[P];
        if (!O || O === !0)
          return;
        if (typeof O != "object" || O instanceof RegExp || typeof O.compare != "function")
          throw new Error(`"${h}": format "${P}" does not define "compare" function`);
        const T = l.scopeValue("formats", {
          key: P,
          ref: O,
          code: y.code.formats ? (0, r._)`${y.code.formats}${(0, r.getProperty)(P)}` : void 0
        });
        c.fail$data(E(T));
      }
      function E(P) {
        return (0, r._)`${P}.compare(${d}, ${u}) ${s[h].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const o = (c) => (c.addKeyword(e.formatLimitDefinition), c);
  e.default = o;
})(Ql);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = Yl, n = Ql, s = ie, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), c = (d, u = { keywords: !0 }) => {
    if (Array.isArray(u))
      return l(d, u, r.fullFormats, a), d;
    const [h, w] = u.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, a], y = u.formats || r.formatNames;
    return l(d, y, h, w), u.keywords && (0, n.default)(d), d;
  };
  c.get = (d, u = "full") => {
    const w = (u === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!w)
      throw new Error(`Unknown format "${d}"`);
    return w;
  };
  function l(d, u, h, w) {
    var y, v;
    (y = (v = d.opts.code).formats) !== null && y !== void 0 || (v.formats = (0, s._)`require("ajv-formats/dist/formats").${w}`);
    for (const g of u)
      d.addFormat(g, h[g]);
  }
  e.exports = t = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
})(na, na.exports);
var Vv = na.exports;
const Lv = /* @__PURE__ */ Yc(Vv), Fv = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), a = Object.getOwnPropertyDescriptor(t, r);
  !zv(s, a) && n || Object.defineProperty(e, r, a);
}, zv = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Uv = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, qv = (e, t) => `/* Wrapped ${e}*/
${t}`, Kv = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), Gv = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), Hv = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = qv.bind(null, n, t.toString());
  Object.defineProperty(s, "name", Gv);
  const { writable: a, enumerable: o, configurable: c } = Kv;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: o, configurable: c });
};
function Xv(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    Fv(e, t, s, r);
  return Uv(e, t), Hv(e, t, n), e;
}
const $c = (e, t = {}) => {
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
  let o, c, l;
  const d = function(...u) {
    const h = this, w = () => {
      o = void 0, c && (clearTimeout(c), c = void 0), a && (l = e.apply(h, u));
    }, y = () => {
      c = void 0, o && (clearTimeout(o), o = void 0), a && (l = e.apply(h, u));
    }, v = s && !o;
    return clearTimeout(o), o = setTimeout(w, r), n > 0 && n !== Number.POSITIVE_INFINITY && !c && (c = setTimeout(y, n)), v && (l = e.apply(h, u)), l;
  };
  return Xv(d, e), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), c && (clearTimeout(c), c = void 0);
  }, d;
};
var fa = { exports: {} };
const Jv = "2.0.0", Pu = 256, Bv = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Wv = 16, Yv = Pu - 6, Qv = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var gs = {
  MAX_LENGTH: Pu,
  MAX_SAFE_COMPONENT_LENGTH: Wv,
  MAX_SAFE_BUILD_LENGTH: Yv,
  MAX_SAFE_INTEGER: Bv,
  RELEASE_TYPES: Qv,
  SEMVER_SPEC_VERSION: Jv,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const Zv = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var _s = Zv;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = gs, a = _s;
  t = e.exports = {};
  const o = t.re = [], c = t.safeRe = [], l = t.src = [], d = t.safeSrc = [], u = t.t = {};
  let h = 0;
  const w = "[a-zA-Z0-9-]", y = [
    ["\\s", 1],
    ["\\d", s],
    [w, n]
  ], v = ($) => {
    for (const [m, E] of y)
      $ = $.split(`${m}*`).join(`${m}{0,${E}}`).split(`${m}+`).join(`${m}{1,${E}}`);
    return $;
  }, g = ($, m, E) => {
    const P = v(m), O = h++;
    a($, O, m), u[$] = O, l[O] = m, d[O] = P, o[O] = new RegExp(m, E ? "g" : void 0), c[O] = new RegExp(P, E ? "g" : void 0);
  };
  g("NUMERICIDENTIFIER", "0|[1-9]\\d*"), g("NUMERICIDENTIFIERLOOSE", "\\d+"), g("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${w}*`), g("MAINVERSION", `(${l[u.NUMERICIDENTIFIER]})\\.(${l[u.NUMERICIDENTIFIER]})\\.(${l[u.NUMERICIDENTIFIER]})`), g("MAINVERSIONLOOSE", `(${l[u.NUMERICIDENTIFIERLOOSE]})\\.(${l[u.NUMERICIDENTIFIERLOOSE]})\\.(${l[u.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASEIDENTIFIER", `(?:${l[u.NONNUMERICIDENTIFIER]}|${l[u.NUMERICIDENTIFIER]})`), g("PRERELEASEIDENTIFIERLOOSE", `(?:${l[u.NONNUMERICIDENTIFIER]}|${l[u.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASE", `(?:-(${l[u.PRERELEASEIDENTIFIER]}(?:\\.${l[u.PRERELEASEIDENTIFIER]})*))`), g("PRERELEASELOOSE", `(?:-?(${l[u.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[u.PRERELEASEIDENTIFIERLOOSE]})*))`), g("BUILDIDENTIFIER", `${w}+`), g("BUILD", `(?:\\+(${l[u.BUILDIDENTIFIER]}(?:\\.${l[u.BUILDIDENTIFIER]})*))`), g("FULLPLAIN", `v?${l[u.MAINVERSION]}${l[u.PRERELEASE]}?${l[u.BUILD]}?`), g("FULL", `^${l[u.FULLPLAIN]}$`), g("LOOSEPLAIN", `[v=\\s]*${l[u.MAINVERSIONLOOSE]}${l[u.PRERELEASELOOSE]}?${l[u.BUILD]}?`), g("LOOSE", `^${l[u.LOOSEPLAIN]}$`), g("GTLT", "((?:<|>)?=?)"), g("XRANGEIDENTIFIERLOOSE", `${l[u.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), g("XRANGEIDENTIFIER", `${l[u.NUMERICIDENTIFIER]}|x|X|\\*`), g("XRANGEPLAIN", `[v=\\s]*(${l[u.XRANGEIDENTIFIER]})(?:\\.(${l[u.XRANGEIDENTIFIER]})(?:\\.(${l[u.XRANGEIDENTIFIER]})(?:${l[u.PRERELEASE]})?${l[u.BUILD]}?)?)?`), g("XRANGEPLAINLOOSE", `[v=\\s]*(${l[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[u.XRANGEIDENTIFIERLOOSE]})(?:${l[u.PRERELEASELOOSE]})?${l[u.BUILD]}?)?)?`), g("XRANGE", `^${l[u.GTLT]}\\s*${l[u.XRANGEPLAIN]}$`), g("XRANGELOOSE", `^${l[u.GTLT]}\\s*${l[u.XRANGEPLAINLOOSE]}$`), g("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), g("COERCE", `${l[u.COERCEPLAIN]}(?:$|[^\\d])`), g("COERCEFULL", l[u.COERCEPLAIN] + `(?:${l[u.PRERELEASE]})?(?:${l[u.BUILD]})?(?:$|[^\\d])`), g("COERCERTL", l[u.COERCE], !0), g("COERCERTLFULL", l[u.COERCEFULL], !0), g("LONETILDE", "(?:~>?)"), g("TILDETRIM", `(\\s*)${l[u.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", g("TILDE", `^${l[u.LONETILDE]}${l[u.XRANGEPLAIN]}$`), g("TILDELOOSE", `^${l[u.LONETILDE]}${l[u.XRANGEPLAINLOOSE]}$`), g("LONECARET", "(?:\\^)"), g("CARETTRIM", `(\\s*)${l[u.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", g("CARET", `^${l[u.LONECARET]}${l[u.XRANGEPLAIN]}$`), g("CARETLOOSE", `^${l[u.LONECARET]}${l[u.XRANGEPLAINLOOSE]}$`), g("COMPARATORLOOSE", `^${l[u.GTLT]}\\s*(${l[u.LOOSEPLAIN]})$|^$`), g("COMPARATOR", `^${l[u.GTLT]}\\s*(${l[u.FULLPLAIN]})$|^$`), g("COMPARATORTRIM", `(\\s*)${l[u.GTLT]}\\s*(${l[u.LOOSEPLAIN]}|${l[u.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", g("HYPHENRANGE", `^\\s*(${l[u.XRANGEPLAIN]})\\s+-\\s+(${l[u.XRANGEPLAIN]})\\s*$`), g("HYPHENRANGELOOSE", `^\\s*(${l[u.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[u.XRANGEPLAINLOOSE]})\\s*$`), g("STAR", "(<|>)?=?\\s*\\*"), g("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), g("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(fa, fa.exports);
var mn = fa.exports;
const xv = Object.freeze({ loose: !0 }), ew = Object.freeze({}), tw = (e) => e ? typeof e != "object" ? xv : e : ew;
var ai = tw;
const gc = /^[0-9]+$/, Nu = (e, t) => {
  if (typeof e == "number" && typeof t == "number")
    return e === t ? 0 : e < t ? -1 : 1;
  const r = gc.test(e), n = gc.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, rw = (e, t) => Nu(t, e);
var Ru = {
  compareIdentifiers: Nu,
  rcompareIdentifiers: rw
};
const On = _s, { MAX_LENGTH: _c, MAX_SAFE_INTEGER: In } = gs, { safeRe: Tn, t: jn } = mn, nw = ai, { compareIdentifiers: Ls } = Ru;
let sw = class ft {
  constructor(t, r) {
    if (r = nw(r), t instanceof ft) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > _c)
      throw new TypeError(
        `version is longer than ${_c} characters`
      );
    On("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? Tn[jn.LOOSE] : Tn[jn.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > In || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > In || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > In || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < In)
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
    if (On("SemVer.compare", this.version, this.options, t), !(t instanceof ft)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new ft(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof ft || (t = new ft(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0;
  }
  comparePre(t) {
    if (t instanceof ft || (t = new ft(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = t.prerelease[r];
      if (On("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return Ls(n, s);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof ft || (t = new ft(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = t.build[r];
      if (On("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return Ls(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = `-${r}`.match(this.options.loose ? Tn[jn.PRERELEASELOOSE] : Tn[jn.PRERELEASE]);
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
          n === !1 && (a = [r]), Ls(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Ue = sw;
const vc = Ue, aw = (e, t, r = !1) => {
  if (e instanceof vc)
    return e;
  try {
    return new vc(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var Mr = aw;
const ow = Mr, iw = (e, t) => {
  const r = ow(e, t);
  return r ? r.version : null;
};
var cw = iw;
const lw = Mr, uw = (e, t) => {
  const r = lw(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var dw = uw;
const wc = Ue, fw = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new wc(
      e instanceof wc ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var hw = fw;
const Ec = Mr, mw = (e, t) => {
  const r = Ec(e, null, !0), n = Ec(t, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const a = s > 0, o = a ? r : n, c = a ? n : r, l = !!o.prerelease.length;
  if (!!c.prerelease.length && !l) {
    if (!c.patch && !c.minor)
      return "major";
    if (c.compareMain(o) === 0)
      return c.minor && !c.patch ? "minor" : "patch";
  }
  const u = l ? "pre" : "";
  return r.major !== n.major ? u + "major" : r.minor !== n.minor ? u + "minor" : r.patch !== n.patch ? u + "patch" : "prerelease";
};
var pw = mw;
const yw = Ue, $w = (e, t) => new yw(e, t).major;
var gw = $w;
const _w = Ue, vw = (e, t) => new _w(e, t).minor;
var ww = vw;
const Ew = Ue, bw = (e, t) => new Ew(e, t).patch;
var Sw = bw;
const Pw = Mr, Nw = (e, t) => {
  const r = Pw(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var Rw = Nw;
const bc = Ue, Ow = (e, t, r) => new bc(e, r).compare(new bc(t, r));
var lt = Ow;
const Iw = lt, Tw = (e, t, r) => Iw(t, e, r);
var jw = Tw;
const Aw = lt, kw = (e, t) => Aw(e, t, !0);
var Cw = kw;
const Sc = Ue, Dw = (e, t, r) => {
  const n = new Sc(e, r), s = new Sc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var oi = Dw;
const Mw = oi, Vw = (e, t) => e.sort((r, n) => Mw(r, n, t));
var Lw = Vw;
const Fw = oi, zw = (e, t) => e.sort((r, n) => Fw(n, r, t));
var Uw = zw;
const qw = lt, Kw = (e, t, r) => qw(e, t, r) > 0;
var vs = Kw;
const Gw = lt, Hw = (e, t, r) => Gw(e, t, r) < 0;
var ii = Hw;
const Xw = lt, Jw = (e, t, r) => Xw(e, t, r) === 0;
var Ou = Jw;
const Bw = lt, Ww = (e, t, r) => Bw(e, t, r) !== 0;
var Iu = Ww;
const Yw = lt, Qw = (e, t, r) => Yw(e, t, r) >= 0;
var ci = Qw;
const Zw = lt, xw = (e, t, r) => Zw(e, t, r) <= 0;
var li = xw;
const eE = Ou, tE = Iu, rE = vs, nE = ci, sE = ii, aE = li, oE = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return eE(e, r, n);
    case "!=":
      return tE(e, r, n);
    case ">":
      return rE(e, r, n);
    case ">=":
      return nE(e, r, n);
    case "<":
      return sE(e, r, n);
    case "<=":
      return aE(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Tu = oE;
const iE = Ue, cE = Mr, { safeRe: An, t: kn } = mn, lE = (e, t) => {
  if (e instanceof iE)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? An[kn.COERCEFULL] : An[kn.COERCE]);
  else {
    const l = t.includePrerelease ? An[kn.COERCERTLFULL] : An[kn.COERCERTL];
    let d;
    for (; (d = l.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), l.lastIndex = d.index + d[1].length + d[2].length;
    l.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", o = t.includePrerelease && r[5] ? `-${r[5]}` : "", c = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return cE(`${n}.${s}.${a}${o}${c}`, t);
};
var uE = lE;
class dE {
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
var fE = dE, Fs, Pc;
function ut() {
  if (Pc) return Fs;
  Pc = 1;
  const e = /\s+/g;
  class t {
    constructor(D, U) {
      if (U = s(U), D instanceof t)
        return D.loose === !!U.loose && D.includePrerelease === !!U.includePrerelease ? D : new t(D.raw, U);
      if (D instanceof a)
        return this.raw = D.value, this.set = [[D]], this.formatted = void 0, this;
      if (this.options = U, this.loose = !!U.loose, this.includePrerelease = !!U.includePrerelease, this.raw = D.trim().replace(e, " "), this.set = this.raw.split("||").map((L) => this.parseRange(L.trim())).filter((L) => L.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const L = this.set[0];
        if (this.set = this.set.filter((J) => !g(J[0])), this.set.length === 0)
          this.set = [L];
        else if (this.set.length > 1) {
          for (const J of this.set)
            if (J.length === 1 && $(J[0])) {
              this.set = [J];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let D = 0; D < this.set.length; D++) {
          D > 0 && (this.formatted += "||");
          const U = this.set[D];
          for (let L = 0; L < U.length; L++)
            L > 0 && (this.formatted += " "), this.formatted += U[L].toString().trim();
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
    parseRange(D) {
      const L = ((this.options.includePrerelease && y) | (this.options.loose && v)) + ":" + D, J = n.get(L);
      if (J)
        return J;
      const z = this.options.loose, N = z ? l[d.HYPHENRANGELOOSE] : l[d.HYPHENRANGE];
      D = D.replace(N, W(this.options.includePrerelease)), o("hyphen replace", D), D = D.replace(l[d.COMPARATORTRIM], u), o("comparator trim", D), D = D.replace(l[d.TILDETRIM], h), o("tilde trim", D), D = D.replace(l[d.CARETTRIM], w), o("caret trim", D);
      let p = D.split(" ").map((f) => E(f, this.options)).join(" ").split(/\s+/).map((f) => K(f, this.options));
      z && (p = p.filter((f) => (o("loose invalid filter", f, this.options), !!f.match(l[d.COMPARATORLOOSE])))), o("range list", p);
      const S = /* @__PURE__ */ new Map(), _ = p.map((f) => new a(f, this.options));
      for (const f of _) {
        if (g(f))
          return [f];
        S.set(f.value, f);
      }
      S.size > 1 && S.has("") && S.delete("");
      const i = [...S.values()];
      return n.set(L, i), i;
    }
    intersects(D, U) {
      if (!(D instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((L) => m(L, U) && D.set.some((J) => m(J, U) && L.every((z) => J.every((N) => z.intersects(N, U)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(D) {
      if (!D)
        return !1;
      if (typeof D == "string")
        try {
          D = new c(D, this.options);
        } catch {
          return !1;
        }
      for (let U = 0; U < this.set.length; U++)
        if (Q(this.set[U], D, this.options))
          return !0;
      return !1;
    }
  }
  Fs = t;
  const r = fE, n = new r(), s = ai, a = ws(), o = _s, c = Ue, {
    safeRe: l,
    t: d,
    comparatorTrimReplace: u,
    tildeTrimReplace: h,
    caretTrimReplace: w
  } = mn, { FLAG_INCLUDE_PRERELEASE: y, FLAG_LOOSE: v } = gs, g = (j) => j.value === "<0.0.0-0", $ = (j) => j.value === "", m = (j, D) => {
    let U = !0;
    const L = j.slice();
    let J = L.pop();
    for (; U && L.length; )
      U = L.every((z) => J.intersects(z, D)), J = L.pop();
    return U;
  }, E = (j, D) => (j = j.replace(l[d.BUILD], ""), o("comp", j, D), j = G(j, D), o("caret", j), j = O(j, D), o("tildes", j), j = ue(j, D), o("xrange", j), j = $e(j, D), o("stars", j), j), P = (j) => !j || j.toLowerCase() === "x" || j === "*", O = (j, D) => j.trim().split(/\s+/).map((U) => T(U, D)).join(" "), T = (j, D) => {
    const U = D.loose ? l[d.TILDELOOSE] : l[d.TILDE];
    return j.replace(U, (L, J, z, N, p) => {
      o("tilde", j, L, J, z, N, p);
      let S;
      return P(J) ? S = "" : P(z) ? S = `>=${J}.0.0 <${+J + 1}.0.0-0` : P(N) ? S = `>=${J}.${z}.0 <${J}.${+z + 1}.0-0` : p ? (o("replaceTilde pr", p), S = `>=${J}.${z}.${N}-${p} <${J}.${+z + 1}.0-0`) : S = `>=${J}.${z}.${N} <${J}.${+z + 1}.0-0`, o("tilde return", S), S;
    });
  }, G = (j, D) => j.trim().split(/\s+/).map((U) => Y(U, D)).join(" "), Y = (j, D) => {
    o("caret", j, D);
    const U = D.loose ? l[d.CARETLOOSE] : l[d.CARET], L = D.includePrerelease ? "-0" : "";
    return j.replace(U, (J, z, N, p, S) => {
      o("caret", j, J, z, N, p, S);
      let _;
      return P(z) ? _ = "" : P(N) ? _ = `>=${z}.0.0${L} <${+z + 1}.0.0-0` : P(p) ? z === "0" ? _ = `>=${z}.${N}.0${L} <${z}.${+N + 1}.0-0` : _ = `>=${z}.${N}.0${L} <${+z + 1}.0.0-0` : S ? (o("replaceCaret pr", S), z === "0" ? N === "0" ? _ = `>=${z}.${N}.${p}-${S} <${z}.${N}.${+p + 1}-0` : _ = `>=${z}.${N}.${p}-${S} <${z}.${+N + 1}.0-0` : _ = `>=${z}.${N}.${p}-${S} <${+z + 1}.0.0-0`) : (o("no pr"), z === "0" ? N === "0" ? _ = `>=${z}.${N}.${p}${L} <${z}.${N}.${+p + 1}-0` : _ = `>=${z}.${N}.${p}${L} <${z}.${+N + 1}.0-0` : _ = `>=${z}.${N}.${p} <${+z + 1}.0.0-0`), o("caret return", _), _;
    });
  }, ue = (j, D) => (o("replaceXRanges", j, D), j.split(/\s+/).map((U) => he(U, D)).join(" ")), he = (j, D) => {
    j = j.trim();
    const U = D.loose ? l[d.XRANGELOOSE] : l[d.XRANGE];
    return j.replace(U, (L, J, z, N, p, S) => {
      o("xRange", j, L, J, z, N, p, S);
      const _ = P(z), i = _ || P(N), f = i || P(p), b = f;
      return J === "=" && b && (J = ""), S = D.includePrerelease ? "-0" : "", _ ? J === ">" || J === "<" ? L = "<0.0.0-0" : L = "*" : J && b ? (i && (N = 0), p = 0, J === ">" ? (J = ">=", i ? (z = +z + 1, N = 0, p = 0) : (N = +N + 1, p = 0)) : J === "<=" && (J = "<", i ? z = +z + 1 : N = +N + 1), J === "<" && (S = "-0"), L = `${J + z}.${N}.${p}${S}`) : i ? L = `>=${z}.0.0${S} <${+z + 1}.0.0-0` : f && (L = `>=${z}.${N}.0${S} <${z}.${+N + 1}.0-0`), o("xRange return", L), L;
    });
  }, $e = (j, D) => (o("replaceStars", j, D), j.trim().replace(l[d.STAR], "")), K = (j, D) => (o("replaceGTE0", j, D), j.trim().replace(l[D.includePrerelease ? d.GTE0PRE : d.GTE0], "")), W = (j) => (D, U, L, J, z, N, p, S, _, i, f, b) => (P(L) ? U = "" : P(J) ? U = `>=${L}.0.0${j ? "-0" : ""}` : P(z) ? U = `>=${L}.${J}.0${j ? "-0" : ""}` : N ? U = `>=${U}` : U = `>=${U}${j ? "-0" : ""}`, P(_) ? S = "" : P(i) ? S = `<${+_ + 1}.0.0-0` : P(f) ? S = `<${_}.${+i + 1}.0-0` : b ? S = `<=${_}.${i}.${f}-${b}` : j ? S = `<${_}.${i}.${+f + 1}-0` : S = `<=${S}`, `${U} ${S}`.trim()), Q = (j, D, U) => {
    for (let L = 0; L < j.length; L++)
      if (!j[L].test(D))
        return !1;
    if (D.prerelease.length && !U.includePrerelease) {
      for (let L = 0; L < j.length; L++)
        if (o(j[L].semver), j[L].semver !== a.ANY && j[L].semver.prerelease.length > 0) {
          const J = j[L].semver;
          if (J.major === D.major && J.minor === D.minor && J.patch === D.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Fs;
}
var zs, Nc;
function ws() {
  if (Nc) return zs;
  Nc = 1;
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
      const h = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], w = u.match(h);
      if (!w)
        throw new TypeError(`Invalid comparator: ${u}`);
      this.operator = w[1] !== void 0 ? w[1] : "", this.operator === "=" && (this.operator = ""), w[2] ? this.semver = new c(w[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(u) {
      if (o("Comparator.test", u, this.options.loose), this.semver === e || u === e)
        return !0;
      if (typeof u == "string")
        try {
          u = new c(u, this.options);
        } catch {
          return !1;
        }
      return a(u, this.operator, this.semver, this.options);
    }
    intersects(u, h) {
      if (!(u instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(u.value, h).test(this.value) : u.operator === "" ? u.value === "" ? !0 : new l(this.value, h).test(u.semver) : (h = r(h), h.includePrerelease && (this.value === "<0.0.0-0" || u.value === "<0.0.0-0") || !h.includePrerelease && (this.value.startsWith("<0.0.0") || u.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && u.operator.startsWith(">") || this.operator.startsWith("<") && u.operator.startsWith("<") || this.semver.version === u.semver.version && this.operator.includes("=") && u.operator.includes("=") || a(this.semver, "<", u.semver, h) && this.operator.startsWith(">") && u.operator.startsWith("<") || a(this.semver, ">", u.semver, h) && this.operator.startsWith("<") && u.operator.startsWith(">")));
    }
  }
  zs = t;
  const r = ai, { safeRe: n, t: s } = mn, a = Tu, o = _s, c = Ue, l = ut();
  return zs;
}
const hE = ut(), mE = (e, t, r) => {
  try {
    t = new hE(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var Es = mE;
const pE = ut(), yE = (e, t) => new pE(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var $E = yE;
const gE = Ue, _E = ut(), vE = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new _E(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === -1) && (n = o, s = new gE(n, r));
  }), n;
};
var wE = vE;
const EE = Ue, bE = ut(), SE = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new bE(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === 1) && (n = o, s = new EE(n, r));
  }), n;
};
var PE = SE;
const Us = Ue, NE = ut(), Rc = vs, RE = (e, t) => {
  e = new NE(e, t);
  let r = new Us("0.0.0");
  if (e.test(r) || (r = new Us("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const s = e.set[n];
    let a = null;
    s.forEach((o) => {
      const c = new Us(o.semver.version);
      switch (o.operator) {
        case ">":
          c.prerelease.length === 0 ? c.patch++ : c.prerelease.push(0), c.raw = c.format();
        case "":
        case ">=":
          (!a || Rc(c, a)) && (a = c);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || Rc(r, a)) && (r = a);
  }
  return r && e.test(r) ? r : null;
};
var OE = RE;
const IE = ut(), TE = (e, t) => {
  try {
    return new IE(e, t).range || "*";
  } catch {
    return null;
  }
};
var jE = TE;
const AE = Ue, ju = ws(), { ANY: kE } = ju, CE = ut(), DE = Es, Oc = vs, Ic = ii, ME = li, VE = ci, LE = (e, t, r, n) => {
  e = new AE(e, n), t = new CE(t, n);
  let s, a, o, c, l;
  switch (r) {
    case ">":
      s = Oc, a = ME, o = Ic, c = ">", l = ">=";
      break;
    case "<":
      s = Ic, a = VE, o = Oc, c = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (DE(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const u = t.set[d];
    let h = null, w = null;
    if (u.forEach((y) => {
      y.semver === kE && (y = new ju(">=0.0.0")), h = h || y, w = w || y, s(y.semver, h.semver, n) ? h = y : o(y.semver, w.semver, n) && (w = y);
    }), h.operator === c || h.operator === l || (!w.operator || w.operator === c) && a(e, w.semver))
      return !1;
    if (w.operator === l && o(e, w.semver))
      return !1;
  }
  return !0;
};
var ui = LE;
const FE = ui, zE = (e, t, r) => FE(e, t, ">", r);
var UE = zE;
const qE = ui, KE = (e, t, r) => qE(e, t, "<", r);
var GE = KE;
const Tc = ut(), HE = (e, t, r) => (e = new Tc(e, r), t = new Tc(t, r), e.intersects(t, r));
var XE = HE;
const JE = Es, BE = lt;
var WE = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const o = e.sort((u, h) => BE(u, h, r));
  for (const u of o)
    JE(u, t, r) ? (a = u, s || (s = u)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const c = [];
  for (const [u, h] of n)
    u === h ? c.push(u) : !h && u === o[0] ? c.push("*") : h ? u === o[0] ? c.push(`<=${h}`) : c.push(`${u} - ${h}`) : c.push(`>=${u}`);
  const l = c.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return l.length < d.length ? l : t;
};
const jc = ut(), di = ws(), { ANY: qs } = di, Hr = Es, fi = lt, YE = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new jc(e, r), t = new jc(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const a of t.set) {
      const o = ZE(s, a, r);
      if (n = n || o !== null, o)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, QE = [new di(">=0.0.0-0")], Ac = [new di(">=0.0.0")], ZE = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === qs) {
    if (t.length === 1 && t[0].semver === qs)
      return !0;
    r.includePrerelease ? e = QE : e = Ac;
  }
  if (t.length === 1 && t[0].semver === qs) {
    if (r.includePrerelease)
      return !0;
    t = Ac;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const y of e)
    y.operator === ">" || y.operator === ">=" ? s = kc(s, y, r) : y.operator === "<" || y.operator === "<=" ? a = Cc(a, y, r) : n.add(y.semver);
  if (n.size > 1)
    return null;
  let o;
  if (s && a) {
    if (o = fi(s.semver, a.semver, r), o > 0)
      return null;
    if (o === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const y of n) {
    if (s && !Hr(y, String(s), r) || a && !Hr(y, String(a), r))
      return null;
    for (const v of t)
      if (!Hr(y, String(v), r))
        return !1;
    return !0;
  }
  let c, l, d, u, h = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, w = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && a.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const y of t) {
    if (u = u || y.operator === ">" || y.operator === ">=", d = d || y.operator === "<" || y.operator === "<=", s) {
      if (w && y.semver.prerelease && y.semver.prerelease.length && y.semver.major === w.major && y.semver.minor === w.minor && y.semver.patch === w.patch && (w = !1), y.operator === ">" || y.operator === ">=") {
        if (c = kc(s, y, r), c === y && c !== s)
          return !1;
      } else if (s.operator === ">=" && !Hr(s.semver, String(y), r))
        return !1;
    }
    if (a) {
      if (h && y.semver.prerelease && y.semver.prerelease.length && y.semver.major === h.major && y.semver.minor === h.minor && y.semver.patch === h.patch && (h = !1), y.operator === "<" || y.operator === "<=") {
        if (l = Cc(a, y, r), l === y && l !== a)
          return !1;
      } else if (a.operator === "<=" && !Hr(a.semver, String(y), r))
        return !1;
    }
    if (!y.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && u && !s && o !== 0 || w || h);
}, kc = (e, t, r) => {
  if (!e)
    return t;
  const n = fi(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Cc = (e, t, r) => {
  if (!e)
    return t;
  const n = fi(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var xE = YE;
const Ks = mn, Dc = gs, eb = Ue, Mc = Ru, tb = Mr, rb = cw, nb = dw, sb = hw, ab = pw, ob = gw, ib = ww, cb = Sw, lb = Rw, ub = lt, db = jw, fb = Cw, hb = oi, mb = Lw, pb = Uw, yb = vs, $b = ii, gb = Ou, _b = Iu, vb = ci, wb = li, Eb = Tu, bb = uE, Sb = ws(), Pb = ut(), Nb = Es, Rb = $E, Ob = wE, Ib = PE, Tb = OE, jb = jE, Ab = ui, kb = UE, Cb = GE, Db = XE, Mb = WE, Vb = xE;
var Lb = {
  parse: tb,
  valid: rb,
  clean: nb,
  inc: sb,
  diff: ab,
  major: ob,
  minor: ib,
  patch: cb,
  prerelease: lb,
  compare: ub,
  rcompare: db,
  compareLoose: fb,
  compareBuild: hb,
  sort: mb,
  rsort: pb,
  gt: yb,
  lt: $b,
  eq: gb,
  neq: _b,
  gte: vb,
  lte: wb,
  cmp: Eb,
  coerce: bb,
  Comparator: Sb,
  Range: Pb,
  satisfies: Nb,
  toComparators: Rb,
  maxSatisfying: Ob,
  minSatisfying: Ib,
  minVersion: Tb,
  validRange: jb,
  outside: Ab,
  gtr: kb,
  ltr: Cb,
  intersects: Db,
  simplifyRange: Mb,
  subset: Vb,
  SemVer: eb,
  re: Ks.re,
  src: Ks.src,
  tokens: Ks.t,
  SEMVER_SPEC_VERSION: Dc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Dc.RELEASE_TYPES,
  compareIdentifiers: Mc.compareIdentifiers,
  rcompareIdentifiers: Mc.rcompareIdentifiers
};
const hr = /* @__PURE__ */ Yc(Lb), Fb = Object.prototype.toString, zb = "[object Uint8Array]", Ub = "[object ArrayBuffer]";
function Au(e, t, r) {
  return e ? e.constructor === t ? !0 : Fb.call(e) === r : !1;
}
function ku(e) {
  return Au(e, Uint8Array, zb);
}
function qb(e) {
  return Au(e, ArrayBuffer, Ub);
}
function Kb(e) {
  return ku(e) || qb(e);
}
function Gb(e) {
  if (!ku(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function Hb(e) {
  if (!Kb(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Gs(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const s of e)
    Gb(s), r.set(s, n), n += s.length;
  return r;
}
const Cn = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Dn(e, t = "utf8") {
  return Hb(e), Cn[t] ?? (Cn[t] = new globalThis.TextDecoder(t)), Cn[t].decode(e);
}
function Xb(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const Jb = new globalThis.TextEncoder();
function Hs(e) {
  return Xb(e), Jb.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Vc = "aes-256-cbc", Cu = /* @__PURE__ */ new Set([
  "aes-256-cbc",
  "aes-256-gcm",
  "aes-256-ctr"
]), Bb = (e) => typeof e == "string" && Cu.has(e), Et = () => /* @__PURE__ */ Object.create(null), Lc = (e) => e !== void 0, Xs = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Vt = "__internal__", Js = `${Vt}.migrations.version`;
var Ft, zt, nr, Ke, We, sr, ar, Sr, ht, Ne, Du, Mu, Vu, Lu, Fu, zu, Uu, qu;
class Wb {
  constructor(t = {}) {
    xe(this, Ne);
    Fr(this, "path");
    Fr(this, "events");
    xe(this, Ft);
    xe(this, zt);
    xe(this, nr);
    xe(this, Ke);
    xe(this, We, {});
    xe(this, sr, !1);
    xe(this, ar);
    xe(this, Sr);
    xe(this, ht);
    Fr(this, "_deserialize", (t) => JSON.parse(t));
    Fr(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
    const r = gt(this, Ne, Du).call(this, t);
    qe(this, Ke, r), gt(this, Ne, Mu).call(this, r), gt(this, Ne, Lu).call(this, r), gt(this, Ne, Fu).call(this, r), this.events = new EventTarget(), qe(this, zt, r.encryptionKey), qe(this, nr, r.encryptionAlgorithm ?? Vc), this.path = gt(this, Ne, zu).call(this, r), gt(this, Ne, Uu).call(this, r), r.watch && this._watch();
  }
  get(t, r) {
    if (te(this, Ke).accessPropertiesByDotNotation)
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
      throw new TypeError(`Please don't use the ${Vt} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, o) => {
      if (Xs(a, o), te(this, Ke).accessPropertiesByDotNotation)
        pn(n, a, o);
      else {
        if (a === "__proto__" || a === "constructor" || a === "prototype")
          return;
        n[a] = o;
      }
    };
    if (typeof t == "object") {
      const a = t;
      for (const [o, c] of Object.entries(a))
        s(o, c);
    } else
      s(t, r);
    this.store = n;
  }
  has(t) {
    return te(this, Ke).accessPropertiesByDotNotation ? Ns(this.store, t) : t in this.store;
  }
  appendToArray(t, r) {
    Xs(t, r);
    const n = te(this, Ke).accessPropertiesByDotNotation ? this._get(t, []) : t in this.store ? this.store[t] : [];
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
      Lc(te(this, We)[r]) && this.set(r, te(this, We)[r]);
  }
  delete(t) {
    const { store: r } = this;
    te(this, Ke).accessPropertiesByDotNotation ? td(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const t = Et();
    for (const r of Object.keys(te(this, We)))
      Lc(te(this, We)[r]) && (Xs(r, te(this, We)[r]), te(this, Ke).accessPropertiesByDotNotation ? pn(t, r, te(this, We)[r]) : t[r] = te(this, We)[r]);
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
      const r = x.readFileSync(this.path, te(this, zt) ? null : "utf8"), n = this._decryptData(r);
      return ((a) => {
        const o = this._deserialize(a);
        return te(this, sr) || this._validate(o), Object.assign(Et(), o);
      })(n);
    } catch (r) {
      if ((r == null ? void 0 : r.code) === "ENOENT")
        return this._ensureDirectory(), Et();
      if (te(this, Ke).clearInvalidConfig) {
        const n = r;
        if (n.name === "SyntaxError" || (t = n.message) != null && t.startsWith("Config schema violation:") || n.message === "Failed to decrypt config data.")
          return Et();
      }
      throw r;
    }
  }
  set store(t) {
    if (this._ensureDirectory(), !Ns(t, Vt))
      try {
        const r = x.readFileSync(this.path, te(this, zt) ? null : "utf8"), n = this._decryptData(r), s = this._deserialize(n);
        Ns(s, Vt) && pn(t, Vt, $i(s, Vt));
      } catch {
      }
    te(this, sr) || this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, r] of Object.entries(this.store))
      this._isReservedKeyPath(t) || (yield [t, r]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    te(this, ar) && (te(this, ar).close(), qe(this, ar, void 0)), te(this, Sr) && (x.unwatchFile(this.path), qe(this, Sr, !1)), qe(this, ht, void 0);
  }
  _decryptData(t) {
    const r = te(this, zt);
    if (!r)
      return typeof t == "string" ? t : Dn(t);
    const n = te(this, nr), s = n === "aes-256-gcm" ? 16 : 0, a = ":".codePointAt(0), o = typeof t == "string" ? t.codePointAt(16) : t[16];
    if (!(a !== void 0 && o === a)) {
      if (n === "aes-256-cbc")
        return typeof t == "string" ? t : Dn(t);
      throw new Error("Failed to decrypt config data.");
    }
    const l = (y) => {
      if (s === 0)
        return { ciphertext: y };
      const v = y.length - s;
      if (v < 0)
        throw new Error("Invalid authentication tag length.");
      return {
        ciphertext: y.slice(0, v),
        authenticationTag: y.slice(v)
      };
    }, d = t.slice(0, 16), u = t.slice(17), h = typeof u == "string" ? Hs(u) : u, w = (y) => {
      const { ciphertext: v, authenticationTag: g } = l(h), $ = zr.pbkdf2Sync(r, y, 1e4, 32, "sha512"), m = zr.createDecipheriv(n, $, d);
      return g && m.setAuthTag(g), Dn(Gs([m.update(v), m.final()]));
    };
    try {
      return w(d);
    } catch {
      try {
        return w(d.toString());
      } catch {
      }
    }
    if (n === "aes-256-cbc")
      return typeof t == "string" ? t : Dn(t);
    throw new Error("Failed to decrypt config data.");
  }
  _handleStoreChange(t) {
    let r = this.store;
    const n = () => {
      const s = r, a = this.store;
      pi(a, s) || (r = a, t.call(this, a, s));
    };
    return this.events.addEventListener("change", n), () => {
      this.events.removeEventListener("change", n);
    };
  }
  _handleValueChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, o = t();
      pi(o, a) || (n = o, r.call(this, o, a));
    };
    return this.events.addEventListener("change", s), () => {
      this.events.removeEventListener("change", s);
    };
  }
  _validate(t) {
    if (!te(this, Ft) || te(this, Ft).call(this, t) || !te(this, Ft).errors)
      return;
    const n = te(this, Ft).errors.map(({ instancePath: s, message: a = "" }) => `\`${s.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    x.mkdirSync(ne.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    const n = te(this, zt);
    if (n) {
      const s = zr.randomBytes(16), a = zr.pbkdf2Sync(n, s, 1e4, 32, "sha512"), o = zr.createCipheriv(te(this, nr), a, s), c = Gs([o.update(Hs(r)), o.final()]), l = [s, Hs(":"), c];
      te(this, nr) === "aes-256-gcm" && l.push(o.getAuthTag()), r = Gs(l);
    }
    if (ye.env.SNAP)
      x.writeFileSync(this.path, r, { mode: te(this, Ke).configFileMode });
    else
      try {
        Wc(this.path, r, { mode: te(this, Ke).configFileMode });
      } catch (s) {
        if ((s == null ? void 0 : s.code) === "EXDEV") {
          x.writeFileSync(this.path, r, { mode: te(this, Ke).configFileMode });
          return;
        }
        throw s;
      }
  }
  _watch() {
    if (this._ensureDirectory(), x.existsSync(this.path) || this._write(Et()), ye.platform === "win32" || ye.platform === "darwin") {
      te(this, ht) ?? qe(this, ht, $c(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 }));
      const t = ne.dirname(this.path), r = ne.basename(this.path);
      qe(this, ar, x.watch(t, { persistent: !1, encoding: "utf8" }, (n, s) => {
        s && s !== r || typeof te(this, ht) == "function" && te(this, ht).call(this);
      }));
    } else
      te(this, ht) ?? qe(this, ht, $c(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 })), x.watchFile(this.path, { persistent: !1 }, (t, r) => {
        typeof te(this, ht) == "function" && te(this, ht).call(this);
      }), qe(this, Sr, !0);
  }
  _migrate(t, r, n) {
    let s = this._get(Js, "0.0.0");
    const a = Object.keys(t).filter((c) => this._shouldPerformMigration(c, s, r));
    let o = structuredClone(this.store);
    for (const c of a)
      try {
        n && n(this, {
          fromVersion: s,
          toVersion: c,
          finalVersion: r,
          versions: a
        });
        const l = t[c];
        l == null || l(this), this._set(Js, c), s = c, o = structuredClone(this.store);
      } catch (l) {
        this.store = o;
        const d = l instanceof Error ? l.message : String(l);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${d}`);
      }
    (this._isVersionInRangeFormat(s) || !hr.eq(s, r)) && this._set(Js, r);
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
    return t === Vt || t.startsWith(`${Vt}.`);
  }
  _isVersionInRangeFormat(t) {
    return hr.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && hr.satisfies(r, t) ? !1 : hr.satisfies(n, t) : !(hr.lte(t, r) || hr.gt(t, n));
  }
  _get(t, r) {
    return $i(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    pn(n, t, r), this.store = n;
  }
}
Ft = new WeakMap(), zt = new WeakMap(), nr = new WeakMap(), Ke = new WeakMap(), We = new WeakMap(), sr = new WeakMap(), ar = new WeakMap(), Sr = new WeakMap(), ht = new WeakMap(), Ne = new WeakSet(), Du = function(t) {
  const r = {
    configName: "config",
    fileExtension: "json",
    projectSuffix: "nodejs",
    clearInvalidConfig: !1,
    accessPropertiesByDotNotation: !0,
    configFileMode: 438,
    ...t
  };
  if (r.encryptionAlgorithm ?? (r.encryptionAlgorithm = Vc), !Bb(r.encryptionAlgorithm))
    throw new TypeError(`The \`encryptionAlgorithm\` option must be one of: ${[...Cu].join(", ")}`);
  if (!r.cwd) {
    if (!r.projectName)
      throw new Error("Please specify the `projectName` option.");
    r.cwd = ad(r.projectName, { suffix: r.projectSuffix }).config;
  }
  return typeof r.fileExtension == "string" && (r.fileExtension = r.fileExtension.replace(/^\.+/, "")), r;
}, Mu = function(t) {
  if (!(t.schema ?? t.ajvOptions ?? t.rootSchema))
    return;
  if (t.schema && typeof t.schema != "object")
    throw new TypeError("The `schema` option must be an object.");
  const r = Lv.default, n = new c0.Ajv2020({
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
  qe(this, Ft, n.compile(s)), gt(this, Ne, Vu).call(this, t.schema);
}, Vu = function(t) {
  const r = Object.entries(t ?? {});
  for (const [n, s] of r) {
    if (!s || typeof s != "object" || !Object.hasOwn(s, "default"))
      continue;
    const { default: a } = s;
    a !== void 0 && (te(this, We)[n] = a);
  }
}, Lu = function(t) {
  t.defaults && Object.assign(te(this, We), t.defaults);
}, Fu = function(t) {
  t.serialize && (this._serialize = t.serialize), t.deserialize && (this._deserialize = t.deserialize);
}, zu = function(t) {
  const r = typeof t.fileExtension == "string" ? t.fileExtension : void 0, n = r ? `.${r}` : "";
  return ne.resolve(t.cwd, `${t.configName ?? "config"}${n}`);
}, Uu = function(t) {
  if (t.migrations) {
    gt(this, Ne, qu).call(this, t), this._validate(this.store);
    return;
  }
  const r = this.store, n = Object.assign(Et(), t.defaults ?? {}, r);
  this._validate(n);
  try {
    yi.deepEqual(r, n);
  } catch {
    this.store = n;
  }
}, qu = function(t) {
  const { migrations: r, projectVersion: n } = t;
  if (r) {
    if (!n)
      throw new Error("Please specify the `projectVersion` option.");
    qe(this, sr, !0);
    try {
      const s = this.store, a = Object.assign(Et(), t.defaults ?? {}, s);
      try {
        yi.deepEqual(s, a);
      } catch {
        this._write(a);
      }
      this._migrate(r, n, t.beforeEachMigration);
    } finally {
      qe(this, sr, !1);
    }
  }
};
const { app: Jn, ipcMain: ha, shell: Yb } = qc;
let Fc = !1;
const zc = () => {
  if (!ha || !Jn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Jn.getPath("userData"),
    appVersion: Jn.getVersion()
  };
  return Fc || (ha.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Fc = !0), e;
};
class Qb extends Wb {
  constructor(t) {
    let r, n;
    if (ye.type === "renderer") {
      const s = qc.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else ha && Jn && ({ defaultCwd: r, appVersion: n } = zc());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = ne.isAbsolute(t.cwd) ? t.cwd : ne.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    zc();
  }
  async openInEditor() {
    const t = await Yb.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const Ku = ne.dirname(Zu(import.meta.url)), Kt = new Qb();
process.env.APP_ROOT = ne.join(Ku, "..");
const rs = process.env.VITE_DEV_SERVER_URL, $S = ne.join(process.env.APP_ROOT, "dist-electron"), hi = ne.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = rs ? ne.join(process.env.APP_ROOT, "public") : hi;
let re, Xr = null;
const Mn = 400, Vn = 600;
function ns() {
  const e = Kt.get("windowX"), t = Kt.get("windowY");
  let r, n;
  if (e !== void 0 && t !== void 0)
    r = e, n = t;
  else {
    const s = Ju.getPrimaryDisplay(), { width: a, height: o } = s.workAreaSize;
    r = Math.round((a - Mn) / 2), n = Math.round((o - Vn) / 2);
  }
  return re = new Bu({
    width: Mn,
    height: Vn,
    x: r,
    y: n,
    minWidth: Mn,
    maxWidth: Mn,
    minHeight: Vn,
    maxHeight: Vn,
    frame: !1,
    // 无边框窗口
    resizable: !1,
    // 不可调整大小
    fullscreenable: !1,
    maximizable: !1,
    titleBarStyle: "hidden",
    show: !1,
    // 初始不显示窗口，等托盘准备好后再显示
    icon: ne.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: ne.join(Ku, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), re.on("moved", () => {
    if (re) {
      const [s, a] = re.getPosition();
      Kt.set("windowX", s), Kt.set("windowY", a);
    }
  }), re.on("close", (s) => {
    if (Gu) {
      re = null;
      return;
    }
    s.preventDefault(), re == null || re.hide();
  }), re.webContents.on("did-finish-load", () => {
    re == null || re.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), rs ? re.loadURL(rs) : re.loadFile(ne.join(hi, "index.html")), re;
}
function Zb() {
  const e = rs ? ne.join(process.env.VITE_PUBLIC, "icon.png") : ne.join(hi, "book-a.png");
  Xr = new Wu(e), Xr.setToolTip("Dict - AI 词典工具");
  const t = Yu.buildFromTemplate([
    {
      label: "显示/隐藏窗口",
      click: () => {
        Bs();
      }
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        Gu = !0, bt.quit();
      }
    }
  ]);
  Xr.setContextMenu(t), Xr.on("click", () => {
    Bs();
  }), Xr.on("double-click", () => {
    Bs();
  });
}
function Bs() {
  if (!re) {
    ns();
    return;
  }
  re.isVisible() ? re.hide() : (re.show(), re.focus(), setTimeout(ma, 300));
}
const xb = ne.join(bt.getPath("userData"), "dict-data");
ct.handle("window:minimize", () => {
  re == null || re.minimize();
});
ct.handle("window:close", () => {
  re == null || re.hide();
});
ct.handle("window:hide", () => {
  re == null || re.hide();
});
ct.handle("window:show", () => {
  re && (re.show(), re.focus());
});
ct.handle("settings:get", () => Kt.get("settings", {}));
ct.handle("settings:set", (e, t) => (Kt.set("settings", t), !0));
ct.handle("data:getPath", () => xb);
ct.handle("history:load", () => Kt.get("history", []));
ct.handle("history:save", (e, t) => (Kt.set("history", t), !0));
ct.handle("favorites:export", async (e, t) => {
  try {
    const { filePath: r } = await Kc.showSaveDialog({
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
    return x.writeFileSync(r, JSON.stringify(n, null, 2), "utf-8"), { success: !0, filePath: r };
  } catch (r) {
    return console.error("Export favorites failed:", r), { success: !1, error: String(r) };
  }
});
ct.handle("favorites:import", async () => {
  try {
    const { filePaths: e } = await Kc.showOpenDialog({
      title: "导入收藏单词",
      filters: [
        { name: "JSON Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] }
      ],
      properties: ["openFile"]
    });
    if (!e || e.length === 0)
      return { success: !1, cancelled: !0 };
    const t = x.readFileSync(e[0], "utf-8"), r = JSON.parse(t);
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
bt.on("window-all-closed", () => {
});
bt.on("activate", () => {
  re === null ? ns() : re.show();
});
let Uc = "";
function eS(e) {
  const t = e.trim();
  if (!t) return !1;
  const r = /[a-zA-Z]/.test(t), n = /^[\x00-\x7F]+$/.test(t);
  return r && n;
}
function ma() {
  if (!re) return;
  const e = Qu.readText().trim();
  e && eS(e) && e !== Uc && (Uc = e, re.webContents.send("clipboard:content", e));
}
let Gu = !1;
const tS = bt.requestSingleInstanceLock();
tS ? (bt.on("second-instance", () => {
  console.log("[electron] Second instance started, showing window..."), re ? (re.isMinimized() && re.restore(), re.show(), re.focus(), setTimeout(ma, 300)) : ns();
}), bt.whenReady().then(() => {
  console.log("[electron]", process.versions.electron), ns(), Zb(), bt.on("browser-window-focus", () => {
    setTimeout(ma, 300);
  });
})) : (console.log("[electron] Another instance is running, quitting..."), bt.quit());
export {
  $S as MAIN_DIST,
  hi as RENDERER_DIST,
  rs as VITE_DEV_SERVER_URL
};
