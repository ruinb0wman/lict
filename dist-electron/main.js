var Ke = Object.defineProperty;
var ke = (e) => {
  throw TypeError(e);
};
var He = (e, r, n) => r in e ? Ke(e, r, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[r] = n;
var Ae = (e, r, n) => He(e, typeof r != "symbol" ? r + "" : r, n), je = (e, r, n) => r.has(e) || ke("Cannot " + n);
var B = (e, r, n) => (je(e, r, "read from private field"), n ? n.call(e) : r.get(e)), le = (e, r, n) => r.has(e) ? ke("Cannot add the same private member more than once") : r instanceof WeakSet ? r.add(e) : r.set(e, n), ne = (e, r, n, s) => (je(e, r, "write to private field"), s ? s.call(e, n) : r.set(e, n), n), me = (e, r, n) => (je(e, r, "access private method"), n);
import electron, { app as app$1, ipcMain as ipcMain$1, dialog, screen, BrowserWindow, Tray, Menu, clipboard } from "electron";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process$1 from "node:process";
import { promisify, isDeepStrictEqual } from "node:util";
import crypto from "node:crypto";
import assert from "node:assert";
import os from "node:os";
import "node:events";
import "node:stream";
import require$$2$1 from "url";
import require$$1$3 from "http";
import require$$2$2 from "https";
import require$$3$2 from "stream";
import require$$4$1 from "assert";
import require$$1$1 from "tty";
import require$$1$2 from "util";
import require$$0$2 from "os";
import require$$8 from "zlib";
import "fs";
import require$$0$3 from "child_process";
const isObject$1 = (e) => {
  const r = typeof e;
  return e !== null && (r === "object" || r === "function");
}, disallowedKeys = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), MAX_ARRAY_INDEX = 1e6, isDigit = (e) => e >= "0" && e <= "9";
function shouldCoerceToNumber(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const r = Number.parseInt(e, 10);
    return r <= Number.MAX_SAFE_INTEGER && r <= MAX_ARRAY_INDEX;
  }
  return !1;
}
function processSegment(e, r) {
  return disallowedKeys.has(e) ? !1 : (e && shouldCoerceToNumber(e) ? r.push(Number.parseInt(e, 10)) : r.push(e), !0);
}
function parsePath(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  const r = [];
  let n = "", s = "start", o = !1, a = 0;
  for (const c of e) {
    if (a++, o) {
      n += c, o = !1;
      continue;
    }
    if (c === "\\") {
      if (s === "index")
        throw new Error(`Invalid character '${c}' in an index at position ${a}`);
      if (s === "indexEnd")
        throw new Error(`Invalid character '${c}' after an index at position ${a}`);
      o = !0, s = s === "start" ? "property" : s;
      continue;
    }
    switch (c) {
      case ".": {
        if (s === "index")
          throw new Error(`Invalid character '${c}' in an index at position ${a}`);
        if (s === "indexEnd") {
          s = "property";
          break;
        }
        if (!processSegment(n, r))
          return [];
        n = "", s = "property";
        break;
      }
      case "[": {
        if (s === "index")
          throw new Error(`Invalid character '${c}' in an index at position ${a}`);
        if (s === "indexEnd") {
          s = "index";
          break;
        }
        if (s === "property" || s === "start") {
          if ((n || s === "property") && !processSegment(n, r))
            return [];
          n = "";
        }
        s = "index";
        break;
      }
      case "]": {
        if (s === "index") {
          if (n === "")
            n = (r.pop() || "") + "[]", s = "property";
          else {
            const d = Number.parseInt(n, 10);
            !Number.isNaN(d) && Number.isFinite(d) && d >= 0 && d <= Number.MAX_SAFE_INTEGER && d <= MAX_ARRAY_INDEX && n === String(d) ? r.push(d) : r.push(n), n = "", s = "indexEnd";
          }
          break;
        }
        if (s === "indexEnd")
          throw new Error(`Invalid character '${c}' after an index at position ${a}`);
        n += c;
        break;
      }
      default: {
        if (s === "index" && !isDigit(c))
          throw new Error(`Invalid character '${c}' in an index at position ${a}`);
        if (s === "indexEnd")
          throw new Error(`Invalid character '${c}' after an index at position ${a}`);
        s === "start" && (s = "property"), n += c;
      }
    }
  }
  switch (o && (n += "\\"), s) {
    case "property": {
      if (!processSegment(n, r))
        return [];
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      r.push("");
      break;
    }
  }
  return r;
}
function normalizePath(e) {
  if (typeof e == "string")
    return parsePath(e);
  if (Array.isArray(e)) {
    const r = [];
    for (const [n, s] of e.entries()) {
      if (typeof s != "string" && typeof s != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${n}, got ${typeof s}`);
      if (typeof s == "number" && !Number.isFinite(s))
        throw new TypeError(`Path segment at index ${n} must be a finite number, got ${s}`);
      if (disallowedKeys.has(s))
        return [];
      typeof s == "string" && shouldCoerceToNumber(s) ? r.push(Number.parseInt(s, 10)) : r.push(s);
    }
    return r;
  }
  return [];
}
function getProperty(e, r, n) {
  if (!isObject$1(e) || typeof r != "string" && !Array.isArray(r))
    return n === void 0 ? e : n;
  const s = normalizePath(r);
  if (s.length === 0)
    return n;
  for (let o = 0; o < s.length; o++) {
    const a = s[o];
    if (e = e[a], e == null) {
      if (o !== s.length - 1)
        return n;
      break;
    }
  }
  return e === void 0 ? n : e;
}
function setProperty(e, r, n) {
  if (!isObject$1(e) || typeof r != "string" && !Array.isArray(r))
    return e;
  const s = e, o = normalizePath(r);
  if (o.length === 0)
    return e;
  for (let a = 0; a < o.length; a++) {
    const c = o[a];
    if (a === o.length - 1)
      e[c] = n;
    else if (!isObject$1(e[c])) {
      const l = typeof o[a + 1] == "number";
      e[c] = l ? [] : {};
    }
    e = e[c];
  }
  return s;
}
function deleteProperty(e, r) {
  if (!isObject$1(e) || typeof r != "string" && !Array.isArray(r))
    return !1;
  const n = normalizePath(r);
  if (n.length === 0)
    return !1;
  for (let s = 0; s < n.length; s++) {
    const o = n[s];
    if (s === n.length - 1)
      return Object.hasOwn(e, o) ? (delete e[o], !0) : !1;
    if (e = e[o], !isObject$1(e))
      return !1;
  }
}
function hasProperty(e, r) {
  if (!isObject$1(e) || typeof r != "string" && !Array.isArray(r))
    return !1;
  const n = normalizePath(r);
  if (n.length === 0)
    return !1;
  for (const s of n) {
    if (!isObject$1(e) || !(s in e))
      return !1;
    e = e[s];
  }
  return !0;
}
const homedir = os.homedir(), tmpdir = os.tmpdir(), { env } = process$1, macos = (e) => {
  const r = path.join(homedir, "Library");
  return {
    data: path.join(r, "Application Support", e),
    config: path.join(r, "Preferences", e),
    cache: path.join(r, "Caches", e),
    log: path.join(r, "Logs", e),
    temp: path.join(tmpdir, e)
  };
}, windows = (e) => {
  const r = env.APPDATA || path.join(homedir, "AppData", "Roaming"), n = env.LOCALAPPDATA || path.join(homedir, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: path.join(n, e, "Data"),
    config: path.join(r, e, "Config"),
    cache: path.join(n, e, "Cache"),
    log: path.join(n, e, "Log"),
    temp: path.join(tmpdir, e)
  };
}, linux = (e) => {
  const r = path.basename(homedir);
  return {
    data: path.join(env.XDG_DATA_HOME || path.join(homedir, ".local", "share"), e),
    config: path.join(env.XDG_CONFIG_HOME || path.join(homedir, ".config"), e),
    cache: path.join(env.XDG_CACHE_HOME || path.join(homedir, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: path.join(env.XDG_STATE_HOME || path.join(homedir, ".local", "state"), e),
    temp: path.join(tmpdir, r, e)
  };
};
function envPaths(e, { suffix: r = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return r && (e += `-${r}`), process$1.platform === "darwin" ? macos(e) : process$1.platform === "win32" ? windows(e) : linux(e);
}
const attemptifyAsync = (e, r) => {
  const { onError: n } = r;
  return function(...o) {
    return e.apply(void 0, o).catch(n);
  };
}, attemptifySync = (e, r) => {
  const { onError: n } = r;
  return function(...o) {
    try {
      return e.apply(void 0, o);
    } catch (a) {
      return n(a);
    }
  };
}, RETRY_INTERVAL = 250, retryifyAsync = (e, r) => {
  const { isRetriable: n } = r;
  return function(o) {
    const { timeout: a } = o, c = o.interval ?? RETRY_INTERVAL, d = Date.now() + a;
    return function l(...u) {
      return e.apply(void 0, u).catch((h) => {
        if (!n(h) || Date.now() >= d)
          throw h;
        const p = Math.round(c * Math.random());
        return p > 0 ? new Promise((y) => setTimeout(y, p)).then(() => l.apply(void 0, u)) : l.apply(void 0, u);
      });
    };
  };
}, retryifySync = (e, r) => {
  const { isRetriable: n } = r;
  return function(o) {
    const { timeout: a } = o, c = Date.now() + a;
    return function(...l) {
      for (; ; )
        try {
          return e.apply(void 0, l);
        } catch (u) {
          if (!n(u) || Date.now() >= c)
            throw u;
          continue;
        }
    };
  };
}, Handlers = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!Handlers.isNodeError(e))
      return !1;
    const { code: r } = e;
    return r === "ENOSYS" || !IS_USER_ROOT && (r === "EINVAL" || r === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!Handlers.isNodeError(e))
      return !1;
    const { code: r } = e;
    return r === "EMFILE" || r === "ENFILE" || r === "EAGAIN" || r === "EBUSY" || r === "EACCESS" || r === "EACCES" || r === "EACCS" || r === "EPERM";
  },
  onChangeError: (e) => {
    if (!Handlers.isNodeError(e))
      throw e;
    if (!Handlers.isChangeErrorOk(e))
      throw e;
  }
}, ATTEMPTIFY_CHANGE_ERROR_OPTIONS = {
  onError: Handlers.onChangeError
}, ATTEMPTIFY_NOOP_OPTIONS = {
  onError: () => {
  }
}, IS_USER_ROOT = process$1.getuid ? !process$1.getuid() : !1, RETRYIFY_OPTIONS = {
  isRetriable: Handlers.isRetriableError
}, FS = {
  attempt: {
    /* ASYNC */
    chmod: attemptifyAsync(promisify(fs.chmod), ATTEMPTIFY_CHANGE_ERROR_OPTIONS),
    chown: attemptifyAsync(promisify(fs.chown), ATTEMPTIFY_CHANGE_ERROR_OPTIONS),
    close: attemptifyAsync(promisify(fs.close), ATTEMPTIFY_NOOP_OPTIONS),
    fsync: attemptifyAsync(promisify(fs.fsync), ATTEMPTIFY_NOOP_OPTIONS),
    mkdir: attemptifyAsync(promisify(fs.mkdir), ATTEMPTIFY_NOOP_OPTIONS),
    realpath: attemptifyAsync(promisify(fs.realpath), ATTEMPTIFY_NOOP_OPTIONS),
    stat: attemptifyAsync(promisify(fs.stat), ATTEMPTIFY_NOOP_OPTIONS),
    unlink: attemptifyAsync(promisify(fs.unlink), ATTEMPTIFY_NOOP_OPTIONS),
    /* SYNC */
    chmodSync: attemptifySync(fs.chmodSync, ATTEMPTIFY_CHANGE_ERROR_OPTIONS),
    chownSync: attemptifySync(fs.chownSync, ATTEMPTIFY_CHANGE_ERROR_OPTIONS),
    closeSync: attemptifySync(fs.closeSync, ATTEMPTIFY_NOOP_OPTIONS),
    existsSync: attemptifySync(fs.existsSync, ATTEMPTIFY_NOOP_OPTIONS),
    fsyncSync: attemptifySync(fs.fsync, ATTEMPTIFY_NOOP_OPTIONS),
    mkdirSync: attemptifySync(fs.mkdirSync, ATTEMPTIFY_NOOP_OPTIONS),
    realpathSync: attemptifySync(fs.realpathSync, ATTEMPTIFY_NOOP_OPTIONS),
    statSync: attemptifySync(fs.statSync, ATTEMPTIFY_NOOP_OPTIONS),
    unlinkSync: attemptifySync(fs.unlinkSync, ATTEMPTIFY_NOOP_OPTIONS)
  },
  retry: {
    /* ASYNC */
    close: retryifyAsync(promisify(fs.close), RETRYIFY_OPTIONS),
    fsync: retryifyAsync(promisify(fs.fsync), RETRYIFY_OPTIONS),
    open: retryifyAsync(promisify(fs.open), RETRYIFY_OPTIONS),
    readFile: retryifyAsync(promisify(fs.readFile), RETRYIFY_OPTIONS),
    rename: retryifyAsync(promisify(fs.rename), RETRYIFY_OPTIONS),
    stat: retryifyAsync(promisify(fs.stat), RETRYIFY_OPTIONS),
    write: retryifyAsync(promisify(fs.write), RETRYIFY_OPTIONS),
    writeFile: retryifyAsync(promisify(fs.writeFile), RETRYIFY_OPTIONS),
    /* SYNC */
    closeSync: retryifySync(fs.closeSync, RETRYIFY_OPTIONS),
    fsyncSync: retryifySync(fs.fsyncSync, RETRYIFY_OPTIONS),
    openSync: retryifySync(fs.openSync, RETRYIFY_OPTIONS),
    readFileSync: retryifySync(fs.readFileSync, RETRYIFY_OPTIONS),
    renameSync: retryifySync(fs.renameSync, RETRYIFY_OPTIONS),
    statSync: retryifySync(fs.statSync, RETRYIFY_OPTIONS),
    writeSync: retryifySync(fs.writeSync, RETRYIFY_OPTIONS),
    writeFileSync: retryifySync(fs.writeFileSync, RETRYIFY_OPTIONS)
  }
}, DEFAULT_ENCODING = "utf8", DEFAULT_FILE_MODE = 438, DEFAULT_FOLDER_MODE = 511, DEFAULT_WRITE_OPTIONS = {}, DEFAULT_USER_UID = process$1.geteuid ? process$1.geteuid() : -1, DEFAULT_USER_GID = process$1.getegid ? process$1.getegid() : -1, DEFAULT_TIMEOUT_SYNC = 1e3, IS_POSIX = !!process$1.getuid;
process$1.getuid && process$1.getuid();
const LIMIT_BASENAME_LENGTH = 128, isException = (e) => e instanceof Error && "code" in e, isString$1 = (e) => typeof e == "string", isUndefined$1 = (e) => e === void 0, IS_LINUX = process$1.platform === "linux", IS_WINDOWS = process$1.platform === "win32", Signals = ["SIGHUP", "SIGINT", "SIGTERM"];
IS_WINDOWS || Signals.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
IS_LINUX && Signals.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class Interceptor {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (r) => {
      if (!this.exited) {
        this.exited = !0;
        for (const n of this.callbacks)
          n();
        r && (IS_WINDOWS && r !== "SIGINT" && r !== "SIGTERM" && r !== "SIGKILL" ? process$1.kill(process$1.pid, "SIGTERM") : process$1.kill(process$1.pid, r));
      }
    }, this.hook = () => {
      process$1.once("exit", () => this.exit());
      for (const r of Signals)
        try {
          process$1.once(r, () => this.exit(r));
        } catch {
        }
    }, this.register = (r) => (this.callbacks.add(r), () => {
      this.callbacks.delete(r);
    }), this.hook();
  }
}
const Interceptor$1 = new Interceptor(), whenExit = Interceptor$1.register, Temp = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const r = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), o = `.tmp-${Date.now().toString().slice(-10)}${r}`;
    return `${e}${o}`;
  },
  get: (e, r, n = !0) => {
    const s = Temp.truncate(r(e));
    return s in Temp.store ? Temp.get(e, r, n) : (Temp.store[s] = n, [s, () => delete Temp.store[s]]);
  },
  purge: (e) => {
    Temp.store[e] && (delete Temp.store[e], FS.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Temp.store[e] && (delete Temp.store[e], FS.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Temp.store)
      Temp.purgeSync(e);
  },
  truncate: (e) => {
    const r = path.basename(e);
    if (r.length <= LIMIT_BASENAME_LENGTH)
      return e;
    const n = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(r);
    if (!n)
      return e;
    const s = r.length - LIMIT_BASENAME_LENGTH;
    return `${e.slice(0, -r.length)}${n[1]}${n[2].slice(0, -s)}${n[3]}`;
  }
};
whenExit(Temp.purgeSyncAll);
function writeFileSync(e, r, n = DEFAULT_WRITE_OPTIONS) {
  if (isString$1(n))
    return writeFileSync(e, r, { encoding: n });
  const o = { timeout: n.timeout ?? DEFAULT_TIMEOUT_SYNC };
  let a = null, c = null, d = null;
  try {
    const l = FS.attempt.realpathSync(e), u = !!l;
    e = l || e, [c, a] = Temp.get(e, n.tmpCreate || Temp.create, n.tmpPurge !== !1);
    const h = IS_POSIX && isUndefined$1(n.chown), p = isUndefined$1(n.mode);
    if (u && (h || p)) {
      const g = FS.attempt.statSync(e);
      g && (n = { ...n }, h && (n.chown = { uid: g.uid, gid: g.gid }), p && (n.mode = g.mode));
    }
    if (!u) {
      const g = path.dirname(e);
      FS.attempt.mkdirSync(g, {
        mode: DEFAULT_FOLDER_MODE,
        recursive: !0
      });
    }
    d = FS.retry.openSync(o)(c, "w", n.mode || DEFAULT_FILE_MODE), n.tmpCreated && n.tmpCreated(c), isString$1(r) ? FS.retry.writeSync(o)(d, r, 0, n.encoding || DEFAULT_ENCODING) : isUndefined$1(r) || FS.retry.writeSync(o)(d, r, 0, r.length, 0), n.fsync !== !1 && (n.fsyncWait !== !1 ? FS.retry.fsyncSync(o)(d) : FS.attempt.fsync(d)), FS.retry.closeSync(o)(d), d = null, n.chown && (n.chown.uid !== DEFAULT_USER_UID || n.chown.gid !== DEFAULT_USER_GID) && FS.attempt.chownSync(c, n.chown.uid, n.chown.gid), n.mode && n.mode !== DEFAULT_FILE_MODE && FS.attempt.chmodSync(c, n.mode);
    try {
      FS.retry.renameSync(o)(c, e);
    } catch (g) {
      if (!isException(g) || g.code !== "ENAMETOOLONG")
        throw g;
      FS.retry.renameSync(o)(c, Temp.truncate(e));
    }
    a(), c = null;
  } finally {
    d && FS.attempt.closeSync(d), c && Temp.purge(c);
  }
}
var commonjsGlobal = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function getDefaultExportFromCjs(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var _2020 = { exports: {} }, core$6 = {}, validate$1 = {}, boolSchema$1 = {}, errors$1 = {}, codegen$1 = {}, code$3 = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class r {
  }
  e._CodeOrName = r, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class n extends r {
    constructor(S) {
      if (super(), !e.IDENTIFIER.test(S))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = S;
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
  e.Name = n;
  class s extends r {
    constructor(S) {
      super(), this._items = typeof S == "string" ? [S] : S;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const S = this._items[0];
      return S === "" || S === '""';
    }
    get str() {
      var S;
      return (S = this._str) !== null && S !== void 0 ? S : this._str = this._items.reduce((O, I) => `${O}${I}`, "");
    }
    get names() {
      var S;
      return (S = this._names) !== null && S !== void 0 ? S : this._names = this._items.reduce((O, I) => (I instanceof n && (O[I.str] = (O[I.str] || 0) + 1), O), {});
    }
  }
  e._Code = s, e.nil = new s("");
  function o(_, ...S) {
    const O = [_[0]];
    let I = 0;
    for (; I < S.length; )
      d(O, S[I]), O.push(_[++I]);
    return new s(O);
  }
  e._ = o;
  const a = new s("+");
  function c(_, ...S) {
    const O = [y(_[0])];
    let I = 0;
    for (; I < S.length; )
      O.push(a), d(O, S[I]), O.push(a, y(_[++I]));
    return l(O), new s(O);
  }
  e.str = c;
  function d(_, S) {
    S instanceof s ? _.push(...S._items) : S instanceof n ? _.push(S) : _.push(p(S));
  }
  e.addCodeArg = d;
  function l(_) {
    let S = 1;
    for (; S < _.length - 1; ) {
      if (_[S] === a) {
        const O = u(_[S - 1], _[S + 1]);
        if (O !== void 0) {
          _.splice(S - 1, 3, O);
          continue;
        }
        _[S++] = "+";
      }
      S++;
    }
  }
  function u(_, S) {
    if (S === '""')
      return _;
    if (_ === '""')
      return S;
    if (typeof _ == "string")
      return S instanceof n || _[_.length - 1] !== '"' ? void 0 : typeof S != "string" ? `${_.slice(0, -1)}${S}"` : S[0] === '"' ? _.slice(0, -1) + S.slice(1) : void 0;
    if (typeof S == "string" && S[0] === '"' && !(_ instanceof n))
      return `"${_}${S.slice(1)}`;
  }
  function h(_, S) {
    return S.emptyStr() ? _ : _.emptyStr() ? S : c`${_}${S}`;
  }
  e.strConcat = h;
  function p(_) {
    return typeof _ == "number" || typeof _ == "boolean" || _ === null ? _ : y(Array.isArray(_) ? _.join(",") : _);
  }
  function g(_) {
    return new s(y(_));
  }
  e.stringify = g;
  function y(_) {
    return JSON.stringify(_).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = y;
  function w(_) {
    return typeof _ == "string" && e.IDENTIFIER.test(_) ? new s(`.${_}`) : o`[${_}]`;
  }
  e.getProperty = w;
  function E(_) {
    if (typeof _ == "string" && e.IDENTIFIER.test(_))
      return new s(`${_}`);
    throw new Error(`CodeGen: invalid export name: ${_}, use explicit $id name mapping`);
  }
  e.getEsmExportName = E;
  function m(_) {
    return new s(_.toString());
  }
  e.regexpCode = m;
})(code$3);
var scope$1 = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const r = code$3;
  class n extends Error {
    constructor(u) {
      super(`CodeGen: "code" for ${u} not defined`), this.value = u.value;
    }
  }
  var s;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
  })(s || (e.UsedValueState = s = {})), e.varKinds = {
    const: new r.Name("const"),
    let: new r.Name("let"),
    var: new r.Name("var")
  };
  class o {
    constructor({ prefixes: u, parent: h } = {}) {
      this._names = {}, this._prefixes = u, this._parent = h;
    }
    toName(u) {
      return u instanceof r.Name ? u : this.name(u);
    }
    name(u) {
      return new r.Name(this._newName(u));
    }
    _newName(u) {
      const h = this._names[u] || this._nameGroup(u);
      return `${u}${h.index++}`;
    }
    _nameGroup(u) {
      var h, p;
      if (!((p = (h = this._parent) === null || h === void 0 ? void 0 : h._prefixes) === null || p === void 0) && p.has(u) || this._prefixes && !this._prefixes.has(u))
        throw new Error(`CodeGen: prefix "${u}" is not allowed in this scope`);
      return this._names[u] = { prefix: u, index: 0 };
    }
  }
  e.Scope = o;
  class a extends r.Name {
    constructor(u, h) {
      super(h), this.prefix = u;
    }
    setValue(u, { property: h, itemIndex: p }) {
      this.value = u, this.scopePath = (0, r._)`.${new r.Name(h)}[${p}]`;
    }
  }
  e.ValueScopeName = a;
  const c = (0, r._)`\n`;
  class d extends o {
    constructor(u) {
      super(u), this._values = {}, this._scope = u.scope, this.opts = { ...u, _n: u.lines ? c : r.nil };
    }
    get() {
      return this._scope;
    }
    name(u) {
      return new a(u, this._newName(u));
    }
    value(u, h) {
      var p;
      if (h.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const g = this.toName(u), { prefix: y } = g, w = (p = h.key) !== null && p !== void 0 ? p : h.ref;
      let E = this._values[y];
      if (E) {
        const S = E.get(w);
        if (S)
          return S;
      } else
        E = this._values[y] = /* @__PURE__ */ new Map();
      E.set(w, g);
      const m = this._scope[y] || (this._scope[y] = []), _ = m.length;
      return m[_] = h.ref, g.setValue(h, { property: y, itemIndex: _ }), g;
    }
    getValue(u, h) {
      const p = this._values[u];
      if (p)
        return p.get(h);
    }
    scopeRefs(u, h = this._values) {
      return this._reduceValues(h, (p) => {
        if (p.scopePath === void 0)
          throw new Error(`CodeGen: name "${p}" has no value`);
        return (0, r._)`${u}${p.scopePath}`;
      });
    }
    scopeCode(u = this._values, h, p) {
      return this._reduceValues(u, (g) => {
        if (g.value === void 0)
          throw new Error(`CodeGen: name "${g}" has no value`);
        return g.value.code;
      }, h, p);
    }
    _reduceValues(u, h, p = {}, g) {
      let y = r.nil;
      for (const w in u) {
        const E = u[w];
        if (!E)
          continue;
        const m = p[w] = p[w] || /* @__PURE__ */ new Map();
        E.forEach((_) => {
          if (m.has(_))
            return;
          m.set(_, s.Started);
          let S = h(_);
          if (S) {
            const O = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            y = (0, r._)`${y}${O} ${_} = ${S};${this.opts._n}`;
          } else if (S = g == null ? void 0 : g(_))
            y = (0, r._)`${y}${S}${this.opts._n}`;
          else
            throw new n(_);
          m.set(_, s.Completed);
        });
      }
      return y;
    }
  }
  e.ValueScope = d;
})(scope$1);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const r = code$3, n = scope$1;
  var s = code$3;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return s._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return s.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return s.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return s.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return s.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return s.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return s.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return s.Name;
  } });
  var o = scope$1;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return o.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return o.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return o.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return o.varKinds;
  } }), e.operators = {
    GT: new r._Code(">"),
    GTE: new r._Code(">="),
    LT: new r._Code("<"),
    LTE: new r._Code("<="),
    EQ: new r._Code("==="),
    NEQ: new r._Code("!=="),
    NOT: new r._Code("!"),
    OR: new r._Code("||"),
    AND: new r._Code("&&"),
    ADD: new r._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(f, $) {
      return this;
    }
  }
  class c extends a {
    constructor(f, $, R) {
      super(), this.varKind = f, this.name = $, this.rhs = R;
    }
    render({ es5: f, _n: $ }) {
      const R = f ? n.varKinds.var : this.varKind, k = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${R} ${this.name}${k};` + $;
    }
    optimizeNames(f, $) {
      if (f[this.name.str])
        return this.rhs && (this.rhs = M(this.rhs, f, $)), this;
    }
    get names() {
      return this.rhs instanceof r._CodeOrName ? this.rhs.names : {};
    }
  }
  class d extends a {
    constructor(f, $, R) {
      super(), this.lhs = f, this.rhs = $, this.sideEffects = R;
    }
    render({ _n: f }) {
      return `${this.lhs} = ${this.rhs};` + f;
    }
    optimizeNames(f, $) {
      if (!(this.lhs instanceof r.Name && !f[this.lhs.str] && !this.sideEffects))
        return this.rhs = M(this.rhs, f, $), this;
    }
    get names() {
      const f = this.lhs instanceof r.Name ? {} : { ...this.lhs.names };
      return G(f, this.rhs);
    }
  }
  class l extends d {
    constructor(f, $, R, k) {
      super(f, R, k), this.op = $;
    }
    render({ _n: f }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + f;
    }
  }
  class u extends a {
    constructor(f) {
      super(), this.label = f, this.names = {};
    }
    render({ _n: f }) {
      return `${this.label}:` + f;
    }
  }
  class h extends a {
    constructor(f) {
      super(), this.label = f, this.names = {};
    }
    render({ _n: f }) {
      return `break${this.label ? ` ${this.label}` : ""};` + f;
    }
  }
  class p extends a {
    constructor(f) {
      super(), this.error = f;
    }
    render({ _n: f }) {
      return `throw ${this.error};` + f;
    }
    get names() {
      return this.error.names;
    }
  }
  class g extends a {
    constructor(f) {
      super(), this.code = f;
    }
    render({ _n: f }) {
      return `${this.code};` + f;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(f, $) {
      return this.code = M(this.code, f, $), this;
    }
    get names() {
      return this.code instanceof r._CodeOrName ? this.code.names : {};
    }
  }
  class y extends a {
    constructor(f = []) {
      super(), this.nodes = f;
    }
    render(f) {
      return this.nodes.reduce(($, R) => $ + R.render(f), "");
    }
    optimizeNodes() {
      const { nodes: f } = this;
      let $ = f.length;
      for (; $--; ) {
        const R = f[$].optimizeNodes();
        Array.isArray(R) ? f.splice($, 1, ...R) : R ? f[$] = R : f.splice($, 1);
      }
      return f.length > 0 ? this : void 0;
    }
    optimizeNames(f, $) {
      const { nodes: R } = this;
      let k = R.length;
      for (; k--; ) {
        const D = R[k];
        D.optimizeNames(f, $) || (L(f, D.names), R.splice(k, 1));
      }
      return R.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((f, $) => V(f, $.names), {});
    }
  }
  class w extends y {
    render(f) {
      return "{" + f._n + super.render(f) + "}" + f._n;
    }
  }
  class E extends y {
  }
  class m extends w {
  }
  m.kind = "else";
  class _ extends w {
    constructor(f, $) {
      super($), this.condition = f;
    }
    render(f) {
      let $ = `if(${this.condition})` + super.render(f);
      return this.else && ($ += "else " + this.else.render(f)), $;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const f = this.condition;
      if (f === !0)
        return this.nodes;
      let $ = this.else;
      if ($) {
        const R = $.optimizeNodes();
        $ = this.else = Array.isArray(R) ? new m(R) : R;
      }
      if ($)
        return f === !1 ? $ instanceof _ ? $ : $.nodes : this.nodes.length ? this : new _(N(f), $ instanceof _ ? [$] : $.nodes);
      if (!(f === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(f, $) {
      var R;
      if (this.else = (R = this.else) === null || R === void 0 ? void 0 : R.optimizeNames(f, $), !!(super.optimizeNames(f, $) || this.else))
        return this.condition = M(this.condition, f, $), this;
    }
    get names() {
      const f = super.names;
      return G(f, this.condition), this.else && V(f, this.else.names), f;
    }
  }
  _.kind = "if";
  class S extends w {
  }
  S.kind = "for";
  class O extends S {
    constructor(f) {
      super(), this.iteration = f;
    }
    render(f) {
      return `for(${this.iteration})` + super.render(f);
    }
    optimizeNames(f, $) {
      if (super.optimizeNames(f, $))
        return this.iteration = M(this.iteration, f, $), this;
    }
    get names() {
      return V(super.names, this.iteration.names);
    }
  }
  class I extends S {
    constructor(f, $, R, k) {
      super(), this.varKind = f, this.name = $, this.from = R, this.to = k;
    }
    render(f) {
      const $ = f.es5 ? n.varKinds.var : this.varKind, { name: R, from: k, to: D } = this;
      return `for(${$} ${R}=${k}; ${R}<${D}; ${R}++)` + super.render(f);
    }
    get names() {
      const f = G(super.names, this.from);
      return G(f, this.to);
    }
  }
  class A extends S {
    constructor(f, $, R, k) {
      super(), this.loop = f, this.varKind = $, this.name = R, this.iterable = k;
    }
    render(f) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(f);
    }
    optimizeNames(f, $) {
      if (super.optimizeNames(f, $))
        return this.iterable = M(this.iterable, f, $), this;
    }
    get names() {
      return V(super.names, this.iterable.names);
    }
  }
  class F extends w {
    constructor(f, $, R) {
      super(), this.name = f, this.args = $, this.async = R;
    }
    render(f) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(f);
    }
  }
  F.kind = "func";
  class z extends y {
    render(f) {
      return "return " + super.render(f);
    }
  }
  z.kind = "return";
  class x extends w {
    render(f) {
      let $ = "try" + super.render(f);
      return this.catch && ($ += this.catch.render(f)), this.finally && ($ += this.finally.render(f)), $;
    }
    optimizeNodes() {
      var f, $;
      return super.optimizeNodes(), (f = this.catch) === null || f === void 0 || f.optimizeNodes(), ($ = this.finally) === null || $ === void 0 || $.optimizeNodes(), this;
    }
    optimizeNames(f, $) {
      var R, k;
      return super.optimizeNames(f, $), (R = this.catch) === null || R === void 0 || R.optimizeNames(f, $), (k = this.finally) === null || k === void 0 || k.optimizeNames(f, $), this;
    }
    get names() {
      const f = super.names;
      return this.catch && V(f, this.catch.names), this.finally && V(f, this.finally.names), f;
    }
  }
  class Y extends w {
    constructor(f) {
      super(), this.error = f;
    }
    render(f) {
      return `catch(${this.error})` + super.render(f);
    }
  }
  Y.kind = "catch";
  class J extends w {
    render(f) {
      return "finally" + super.render(f);
    }
  }
  J.kind = "finally";
  class K {
    constructor(f, $ = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...$, _n: $.lines ? `
` : "" }, this._extScope = f, this._scope = new n.Scope({ parent: f }), this._nodes = [new E()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(f) {
      return this._scope.name(f);
    }
    // reserves unique name in the external scope
    scopeName(f) {
      return this._extScope.name(f);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(f, $) {
      const R = this._extScope.value(f, $);
      return (this._values[R.prefix] || (this._values[R.prefix] = /* @__PURE__ */ new Set())).add(R), R;
    }
    getScopeValue(f, $) {
      return this._extScope.getValue(f, $);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(f) {
      return this._extScope.scopeRefs(f, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(f, $, R, k) {
      const D = this._scope.toName($);
      return R !== void 0 && k && (this._constants[D.str] = R), this._leafNode(new c(f, D, R)), D;
    }
    // `const` declaration (`var` in es5 mode)
    const(f, $, R) {
      return this._def(n.varKinds.const, f, $, R);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(f, $, R) {
      return this._def(n.varKinds.let, f, $, R);
    }
    // `var` declaration with optional assignment
    var(f, $, R) {
      return this._def(n.varKinds.var, f, $, R);
    }
    // assignment code
    assign(f, $, R) {
      return this._leafNode(new d(f, $, R));
    }
    // `+=` code
    add(f, $) {
      return this._leafNode(new l(f, e.operators.ADD, $));
    }
    // appends passed SafeExpr to code or executes Block
    code(f) {
      return typeof f == "function" ? f() : f !== r.nil && this._leafNode(new g(f)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...f) {
      const $ = ["{"];
      for (const [R, k] of f)
        $.length > 1 && $.push(","), $.push(R), (R !== k || this.opts.es5) && ($.push(":"), (0, r.addCodeArg)($, k));
      return $.push("}"), new r._Code($);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(f, $, R) {
      if (this._blockNode(new _(f)), $ && R)
        this.code($).else().code(R).endIf();
      else if ($)
        this.code($).endIf();
      else if (R)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(f) {
      return this._elseNode(new _(f));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new m());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(_, m);
    }
    _for(f, $) {
      return this._blockNode(f), $ && this.code($).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(f, $) {
      return this._for(new O(f), $);
    }
    // `for` statement for a range of values
    forRange(f, $, R, k, D = this.opts.es5 ? n.varKinds.var : n.varKinds.let) {
      const H = this._scope.toName(f);
      return this._for(new I(D, H, $, R), () => k(H));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(f, $, R, k = n.varKinds.const) {
      const D = this._scope.toName(f);
      if (this.opts.es5) {
        const H = $ instanceof r.Name ? $ : this.var("_arr", $);
        return this.forRange("_i", 0, (0, r._)`${H}.length`, (U) => {
          this.var(D, (0, r._)`${H}[${U}]`), R(D);
        });
      }
      return this._for(new A("of", k, D, $), () => R(D));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(f, $, R, k = this.opts.es5 ? n.varKinds.var : n.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(f, (0, r._)`Object.keys(${$})`, R);
      const D = this._scope.toName(f);
      return this._for(new A("in", k, D, $), () => R(D));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(S);
    }
    // `label` statement
    label(f) {
      return this._leafNode(new u(f));
    }
    // `break` statement
    break(f) {
      return this._leafNode(new h(f));
    }
    // `return` statement
    return(f) {
      const $ = new z();
      if (this._blockNode($), this.code(f), $.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(z);
    }
    // `try` statement
    try(f, $, R) {
      if (!$ && !R)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const k = new x();
      if (this._blockNode(k), this.code(f), $) {
        const D = this.name("e");
        this._currNode = k.catch = new Y(D), $(D);
      }
      return R && (this._currNode = k.finally = new J(), this.code(R)), this._endBlockNode(Y, J);
    }
    // `throw` statement
    throw(f) {
      return this._leafNode(new p(f));
    }
    // start self-balancing block
    block(f, $) {
      return this._blockStarts.push(this._nodes.length), f && this.code(f).endBlock($), this;
    }
    // end the current self-balancing block
    endBlock(f) {
      const $ = this._blockStarts.pop();
      if ($ === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const R = this._nodes.length - $;
      if (R < 0 || f !== void 0 && R !== f)
        throw new Error(`CodeGen: wrong number of nodes: ${R} vs ${f} expected`);
      return this._nodes.length = $, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(f, $ = r.nil, R, k) {
      return this._blockNode(new F(f, $, R)), k && this.code(k).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(F);
    }
    optimize(f = 1) {
      for (; f-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(f) {
      return this._currNode.nodes.push(f), this;
    }
    _blockNode(f) {
      this._currNode.nodes.push(f), this._nodes.push(f);
    }
    _endBlockNode(f, $) {
      const R = this._currNode;
      if (R instanceof f || $ && R instanceof $)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${$ ? `${f.kind}/${$.kind}` : f.kind}"`);
    }
    _elseNode(f) {
      const $ = this._currNode;
      if (!($ instanceof _))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = $.else = f, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const f = this._nodes;
      return f[f.length - 1];
    }
    set _currNode(f) {
      const $ = this._nodes;
      $[$.length - 1] = f;
    }
  }
  e.CodeGen = K;
  function V(b, f) {
    for (const $ in f)
      b[$] = (b[$] || 0) + (f[$] || 0);
    return b;
  }
  function G(b, f) {
    return f instanceof r._CodeOrName ? V(b, f.names) : b;
  }
  function M(b, f, $) {
    if (b instanceof r.Name)
      return R(b);
    if (!k(b))
      return b;
    return new r._Code(b._items.reduce((D, H) => (H instanceof r.Name && (H = R(H)), H instanceof r._Code ? D.push(...H._items) : D.push(H), D), []));
    function R(D) {
      const H = $[D.str];
      return H === void 0 || f[D.str] !== 1 ? D : (delete f[D.str], H);
    }
    function k(D) {
      return D instanceof r._Code && D._items.some((H) => H instanceof r.Name && f[H.str] === 1 && $[H.str] !== void 0);
    }
  }
  function L(b, f) {
    for (const $ in f)
      b[$] = (b[$] || 0) - (f[$] || 0);
  }
  function N(b) {
    return typeof b == "boolean" || typeof b == "number" || b === null ? !b : (0, r._)`!${P(b)}`;
  }
  e.not = N;
  const C = v(e.operators.AND);
  function j(...b) {
    return b.reduce(C);
  }
  e.and = j;
  const q = v(e.operators.OR);
  function T(...b) {
    return b.reduce(q);
  }
  e.or = T;
  function v(b) {
    return (f, $) => f === r.nil ? $ : $ === r.nil ? f : (0, r._)`${P(f)} ${b} ${P($)}`;
  }
  function P(b) {
    return b instanceof r.Name ? b : (0, r._)`(${b})`;
  }
})(codegen$1);
var util$1 = {};
Object.defineProperty(util$1, "__esModule", { value: !0 });
util$1.checkStrictMode = util$1.getErrorPath = util$1.Type = util$1.useFunc = util$1.setEvaluated = util$1.evaluatedPropsToName = util$1.mergeEvaluated = util$1.eachItem = util$1.unescapeJsonPointer = util$1.escapeJsonPointer = util$1.escapeFragment = util$1.unescapeFragment = util$1.schemaRefOrVal = util$1.schemaHasRulesButRef = util$1.schemaHasRules = util$1.checkUnknownRules = util$1.alwaysValidSchema = util$1.toHash = void 0;
const codegen_1$13 = codegen$1, code_1$l = code$3;
function toHash$1(e) {
  const r = {};
  for (const n of e)
    r[n] = !0;
  return r;
}
util$1.toHash = toHash$1;
function alwaysValidSchema$1(e, r) {
  return typeof r == "boolean" ? r : Object.keys(r).length === 0 ? !0 : (checkUnknownRules$1(e, r), !schemaHasRules$1(r, e.self.RULES.all));
}
util$1.alwaysValidSchema = alwaysValidSchema$1;
function checkUnknownRules$1(e, r = e.schema) {
  const { opts: n, self: s } = e;
  if (!n.strictSchema || typeof r == "boolean")
    return;
  const o = s.RULES.keywords;
  for (const a in r)
    o[a] || checkStrictMode$1(e, `unknown keyword: "${a}"`);
}
util$1.checkUnknownRules = checkUnknownRules$1;
function schemaHasRules$1(e, r) {
  if (typeof e == "boolean")
    return !e;
  for (const n in e)
    if (r[n])
      return !0;
  return !1;
}
util$1.schemaHasRules = schemaHasRules$1;
function schemaHasRulesButRef$1(e, r) {
  if (typeof e == "boolean")
    return !e;
  for (const n in e)
    if (n !== "$ref" && r.all[n])
      return !0;
  return !1;
}
util$1.schemaHasRulesButRef = schemaHasRulesButRef$1;
function schemaRefOrVal$1({ topSchemaRef: e, schemaPath: r }, n, s, o) {
  if (!o) {
    if (typeof n == "number" || typeof n == "boolean")
      return n;
    if (typeof n == "string")
      return (0, codegen_1$13._)`${n}`;
  }
  return (0, codegen_1$13._)`${e}${r}${(0, codegen_1$13.getProperty)(s)}`;
}
util$1.schemaRefOrVal = schemaRefOrVal$1;
function unescapeFragment$1(e) {
  return unescapeJsonPointer$1(decodeURIComponent(e));
}
util$1.unescapeFragment = unescapeFragment$1;
function escapeFragment$1(e) {
  return encodeURIComponent(escapeJsonPointer$1(e));
}
util$1.escapeFragment = escapeFragment$1;
function escapeJsonPointer$1(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
util$1.escapeJsonPointer = escapeJsonPointer$1;
function unescapeJsonPointer$1(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
util$1.unescapeJsonPointer = unescapeJsonPointer$1;
function eachItem$1(e, r) {
  if (Array.isArray(e))
    for (const n of e)
      r(n);
  else
    r(e);
}
util$1.eachItem = eachItem$1;
function makeMergeEvaluated$1({ mergeNames: e, mergeToName: r, mergeValues: n, resultToName: s }) {
  return (o, a, c, d) => {
    const l = c === void 0 ? a : c instanceof codegen_1$13.Name ? (a instanceof codegen_1$13.Name ? e(o, a, c) : r(o, a, c), c) : a instanceof codegen_1$13.Name ? (r(o, c, a), a) : n(a, c);
    return d === codegen_1$13.Name && !(l instanceof codegen_1$13.Name) ? s(o, l) : l;
  };
}
util$1.mergeEvaluated = {
  props: makeMergeEvaluated$1({
    mergeNames: (e, r, n) => e.if((0, codegen_1$13._)`${n} !== true && ${r} !== undefined`, () => {
      e.if((0, codegen_1$13._)`${r} === true`, () => e.assign(n, !0), () => e.assign(n, (0, codegen_1$13._)`${n} || {}`).code((0, codegen_1$13._)`Object.assign(${n}, ${r})`));
    }),
    mergeToName: (e, r, n) => e.if((0, codegen_1$13._)`${n} !== true`, () => {
      r === !0 ? e.assign(n, !0) : (e.assign(n, (0, codegen_1$13._)`${n} || {}`), setEvaluated$1(e, n, r));
    }),
    mergeValues: (e, r) => e === !0 ? !0 : { ...e, ...r },
    resultToName: evaluatedPropsToName$1
  }),
  items: makeMergeEvaluated$1({
    mergeNames: (e, r, n) => e.if((0, codegen_1$13._)`${n} !== true && ${r} !== undefined`, () => e.assign(n, (0, codegen_1$13._)`${r} === true ? true : ${n} > ${r} ? ${n} : ${r}`)),
    mergeToName: (e, r, n) => e.if((0, codegen_1$13._)`${n} !== true`, () => e.assign(n, r === !0 ? !0 : (0, codegen_1$13._)`${n} > ${r} ? ${n} : ${r}`)),
    mergeValues: (e, r) => e === !0 ? !0 : Math.max(e, r),
    resultToName: (e, r) => e.var("items", r)
  })
};
function evaluatedPropsToName$1(e, r) {
  if (r === !0)
    return e.var("props", !0);
  const n = e.var("props", (0, codegen_1$13._)`{}`);
  return r !== void 0 && setEvaluated$1(e, n, r), n;
}
util$1.evaluatedPropsToName = evaluatedPropsToName$1;
function setEvaluated$1(e, r, n) {
  Object.keys(n).forEach((s) => e.assign((0, codegen_1$13._)`${r}${(0, codegen_1$13.getProperty)(s)}`, !0));
}
util$1.setEvaluated = setEvaluated$1;
const snippets$1 = {};
function useFunc$1(e, r) {
  return e.scopeValue("func", {
    ref: r,
    code: snippets$1[r.code] || (snippets$1[r.code] = new code_1$l._Code(r.code))
  });
}
util$1.useFunc = useFunc$1;
var Type$1;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Type$1 || (util$1.Type = Type$1 = {}));
function getErrorPath$1(e, r, n) {
  if (e instanceof codegen_1$13.Name) {
    const s = r === Type$1.Num;
    return n ? s ? (0, codegen_1$13._)`"[" + ${e} + "]"` : (0, codegen_1$13._)`"['" + ${e} + "']"` : s ? (0, codegen_1$13._)`"/" + ${e}` : (0, codegen_1$13._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return n ? (0, codegen_1$13.getProperty)(e).toString() : "/" + escapeJsonPointer$1(e);
}
util$1.getErrorPath = getErrorPath$1;
function checkStrictMode$1(e, r, n = e.opts.strictSchema) {
  if (n) {
    if (r = `strict mode: ${r}`, n === !0)
      throw new Error(r);
    e.self.logger.warn(r);
  }
}
util$1.checkStrictMode = checkStrictMode$1;
var names$3 = {};
Object.defineProperty(names$3, "__esModule", { value: !0 });
const codegen_1$12 = codegen$1, names$2 = {
  // validation function arguments
  data: new codegen_1$12.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new codegen_1$12.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new codegen_1$12.Name("instancePath"),
  parentData: new codegen_1$12.Name("parentData"),
  parentDataProperty: new codegen_1$12.Name("parentDataProperty"),
  rootData: new codegen_1$12.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new codegen_1$12.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new codegen_1$12.Name("vErrors"),
  // null or array of validation errors
  errors: new codegen_1$12.Name("errors"),
  // counter of validation errors
  this: new codegen_1$12.Name("this"),
  // "globals"
  self: new codegen_1$12.Name("self"),
  scope: new codegen_1$12.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new codegen_1$12.Name("json"),
  jsonPos: new codegen_1$12.Name("jsonPos"),
  jsonLen: new codegen_1$12.Name("jsonLen"),
  jsonPart: new codegen_1$12.Name("jsonPart")
};
names$3.default = names$2;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const r = codegen$1, n = util$1, s = names$3;
  e.keywordError = {
    message: ({ keyword: m }) => (0, r.str)`must pass "${m}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: m, schemaType: _ }) => _ ? (0, r.str)`"${m}" keyword must be ${_} ($data)` : (0, r.str)`"${m}" keyword is invalid ($data)`
  };
  function o(m, _ = e.keywordError, S, O) {
    const { it: I } = m, { gen: A, compositeRule: F, allErrors: z } = I, x = p(m, _, S);
    O ?? (F || z) ? l(A, x) : u(I, (0, r._)`[${x}]`);
  }
  e.reportError = o;
  function a(m, _ = e.keywordError, S) {
    const { it: O } = m, { gen: I, compositeRule: A, allErrors: F } = O, z = p(m, _, S);
    l(I, z), A || F || u(O, s.default.vErrors);
  }
  e.reportExtraError = a;
  function c(m, _) {
    m.assign(s.default.errors, _), m.if((0, r._)`${s.default.vErrors} !== null`, () => m.if(_, () => m.assign((0, r._)`${s.default.vErrors}.length`, _), () => m.assign(s.default.vErrors, null)));
  }
  e.resetErrorsCount = c;
  function d({ gen: m, keyword: _, schemaValue: S, data: O, errsCount: I, it: A }) {
    if (I === void 0)
      throw new Error("ajv implementation error");
    const F = m.name("err");
    m.forRange("i", I, s.default.errors, (z) => {
      m.const(F, (0, r._)`${s.default.vErrors}[${z}]`), m.if((0, r._)`${F}.instancePath === undefined`, () => m.assign((0, r._)`${F}.instancePath`, (0, r.strConcat)(s.default.instancePath, A.errorPath))), m.assign((0, r._)`${F}.schemaPath`, (0, r.str)`${A.errSchemaPath}/${_}`), A.opts.verbose && (m.assign((0, r._)`${F}.schema`, S), m.assign((0, r._)`${F}.data`, O));
    });
  }
  e.extendErrors = d;
  function l(m, _) {
    const S = m.const("err", _);
    m.if((0, r._)`${s.default.vErrors} === null`, () => m.assign(s.default.vErrors, (0, r._)`[${S}]`), (0, r._)`${s.default.vErrors}.push(${S})`), m.code((0, r._)`${s.default.errors}++`);
  }
  function u(m, _) {
    const { gen: S, validateName: O, schemaEnv: I } = m;
    I.$async ? S.throw((0, r._)`new ${m.ValidationError}(${_})`) : (S.assign((0, r._)`${O}.errors`, _), S.return(!1));
  }
  const h = {
    keyword: new r.Name("keyword"),
    schemaPath: new r.Name("schemaPath"),
    // also used in JTD errors
    params: new r.Name("params"),
    propertyName: new r.Name("propertyName"),
    message: new r.Name("message"),
    schema: new r.Name("schema"),
    parentSchema: new r.Name("parentSchema")
  };
  function p(m, _, S) {
    const { createErrors: O } = m.it;
    return O === !1 ? (0, r._)`{}` : g(m, _, S);
  }
  function g(m, _, S = {}) {
    const { gen: O, it: I } = m, A = [
      y(I, S),
      w(m, S)
    ];
    return E(m, _, A), O.object(...A);
  }
  function y({ errorPath: m }, { instancePath: _ }) {
    const S = _ ? (0, r.str)`${m}${(0, n.getErrorPath)(_, n.Type.Str)}` : m;
    return [s.default.instancePath, (0, r.strConcat)(s.default.instancePath, S)];
  }
  function w({ keyword: m, it: { errSchemaPath: _ } }, { schemaPath: S, parentSchema: O }) {
    let I = O ? _ : (0, r.str)`${_}/${m}`;
    return S && (I = (0, r.str)`${I}${(0, n.getErrorPath)(S, n.Type.Str)}`), [h.schemaPath, I];
  }
  function E(m, { params: _, message: S }, O) {
    const { keyword: I, data: A, schemaValue: F, it: z } = m, { opts: x, propertyName: Y, topSchemaRef: J, schemaPath: K } = z;
    O.push([h.keyword, I], [h.params, typeof _ == "function" ? _(m) : _ || (0, r._)`{}`]), x.messages && O.push([h.message, typeof S == "function" ? S(m) : S]), x.verbose && O.push([h.schema, F], [h.parentSchema, (0, r._)`${J}${K}`], [s.default.data, A]), Y && O.push([h.propertyName, Y]);
  }
})(errors$1);
Object.defineProperty(boolSchema$1, "__esModule", { value: !0 });
boolSchema$1.boolOrEmptySchema = boolSchema$1.topBoolOrEmptySchema = void 0;
const errors_1$7 = errors$1, codegen_1$11 = codegen$1, names_1$g = names$3, boolError$1 = {
  message: "boolean schema is false"
};
function topBoolOrEmptySchema$1(e) {
  const { gen: r, schema: n, validateName: s } = e;
  n === !1 ? falseSchemaError$1(e, !1) : typeof n == "object" && n.$async === !0 ? r.return(names_1$g.default.data) : (r.assign((0, codegen_1$11._)`${s}.errors`, null), r.return(!0));
}
boolSchema$1.topBoolOrEmptySchema = topBoolOrEmptySchema$1;
function boolOrEmptySchema$1(e, r) {
  const { gen: n, schema: s } = e;
  s === !1 ? (n.var(r, !1), falseSchemaError$1(e)) : n.var(r, !0);
}
boolSchema$1.boolOrEmptySchema = boolOrEmptySchema$1;
function falseSchemaError$1(e, r) {
  const { gen: n, data: s } = e, o = {
    gen: n,
    keyword: "false schema",
    data: s,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, errors_1$7.reportError)(o, boolError$1, void 0, r);
}
var dataType$1 = {}, rules$1 = {};
Object.defineProperty(rules$1, "__esModule", { value: !0 });
rules$1.getRules = rules$1.isJSONType = void 0;
const _jsonTypes$1 = ["string", "number", "integer", "boolean", "null", "object", "array"], jsonTypes$1 = new Set(_jsonTypes$1);
function isJSONType$1(e) {
  return typeof e == "string" && jsonTypes$1.has(e);
}
rules$1.isJSONType = isJSONType$1;
function getRules$1() {
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
rules$1.getRules = getRules$1;
var applicability$1 = {};
Object.defineProperty(applicability$1, "__esModule", { value: !0 });
applicability$1.shouldUseRule = applicability$1.shouldUseGroup = applicability$1.schemaHasRulesForType = void 0;
function schemaHasRulesForType$1({ schema: e, self: r }, n) {
  const s = r.RULES.types[n];
  return s && s !== !0 && shouldUseGroup$1(e, s);
}
applicability$1.schemaHasRulesForType = schemaHasRulesForType$1;
function shouldUseGroup$1(e, r) {
  return r.rules.some((n) => shouldUseRule$1(e, n));
}
applicability$1.shouldUseGroup = shouldUseGroup$1;
function shouldUseRule$1(e, r) {
  var n;
  return e[r.keyword] !== void 0 || ((n = r.definition.implements) === null || n === void 0 ? void 0 : n.some((s) => e[s] !== void 0));
}
applicability$1.shouldUseRule = shouldUseRule$1;
Object.defineProperty(dataType$1, "__esModule", { value: !0 });
dataType$1.reportTypeError = dataType$1.checkDataTypes = dataType$1.checkDataType = dataType$1.coerceAndCheckDataType = dataType$1.getJSONTypes = dataType$1.getSchemaTypes = dataType$1.DataType = void 0;
const rules_1$1 = rules$1, applicability_1$3 = applicability$1, errors_1$6 = errors$1, codegen_1$10 = codegen$1, util_1$X = util$1;
var DataType$1;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(DataType$1 || (dataType$1.DataType = DataType$1 = {}));
function getSchemaTypes$1(e) {
  const r = getJSONTypes$1(e.type);
  if (r.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!r.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && r.push("null");
  }
  return r;
}
dataType$1.getSchemaTypes = getSchemaTypes$1;
function getJSONTypes$1(e) {
  const r = Array.isArray(e) ? e : e ? [e] : [];
  if (r.every(rules_1$1.isJSONType))
    return r;
  throw new Error("type must be JSONType or JSONType[]: " + r.join(","));
}
dataType$1.getJSONTypes = getJSONTypes$1;
function coerceAndCheckDataType$1(e, r) {
  const { gen: n, data: s, opts: o } = e, a = coerceToTypes$1(r, o.coerceTypes), c = r.length > 0 && !(a.length === 0 && r.length === 1 && (0, applicability_1$3.schemaHasRulesForType)(e, r[0]));
  if (c) {
    const d = checkDataTypes$1(r, s, o.strictNumbers, DataType$1.Wrong);
    n.if(d, () => {
      a.length ? coerceData$1(e, r, a) : reportTypeError$1(e);
    });
  }
  return c;
}
dataType$1.coerceAndCheckDataType = coerceAndCheckDataType$1;
const COERCIBLE$1 = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function coerceToTypes$1(e, r) {
  return r ? e.filter((n) => COERCIBLE$1.has(n) || r === "array" && n === "array") : [];
}
function coerceData$1(e, r, n) {
  const { gen: s, data: o, opts: a } = e, c = s.let("dataType", (0, codegen_1$10._)`typeof ${o}`), d = s.let("coerced", (0, codegen_1$10._)`undefined`);
  a.coerceTypes === "array" && s.if((0, codegen_1$10._)`${c} == 'object' && Array.isArray(${o}) && ${o}.length == 1`, () => s.assign(o, (0, codegen_1$10._)`${o}[0]`).assign(c, (0, codegen_1$10._)`typeof ${o}`).if(checkDataTypes$1(r, o, a.strictNumbers), () => s.assign(d, o))), s.if((0, codegen_1$10._)`${d} !== undefined`);
  for (const u of n)
    (COERCIBLE$1.has(u) || u === "array" && a.coerceTypes === "array") && l(u);
  s.else(), reportTypeError$1(e), s.endIf(), s.if((0, codegen_1$10._)`${d} !== undefined`, () => {
    s.assign(o, d), assignParentData$1(e, d);
  });
  function l(u) {
    switch (u) {
      case "string":
        s.elseIf((0, codegen_1$10._)`${c} == "number" || ${c} == "boolean"`).assign(d, (0, codegen_1$10._)`"" + ${o}`).elseIf((0, codegen_1$10._)`${o} === null`).assign(d, (0, codegen_1$10._)`""`);
        return;
      case "number":
        s.elseIf((0, codegen_1$10._)`${c} == "boolean" || ${o} === null
              || (${c} == "string" && ${o} && ${o} == +${o})`).assign(d, (0, codegen_1$10._)`+${o}`);
        return;
      case "integer":
        s.elseIf((0, codegen_1$10._)`${c} === "boolean" || ${o} === null
              || (${c} === "string" && ${o} && ${o} == +${o} && !(${o} % 1))`).assign(d, (0, codegen_1$10._)`+${o}`);
        return;
      case "boolean":
        s.elseIf((0, codegen_1$10._)`${o} === "false" || ${o} === 0 || ${o} === null`).assign(d, !1).elseIf((0, codegen_1$10._)`${o} === "true" || ${o} === 1`).assign(d, !0);
        return;
      case "null":
        s.elseIf((0, codegen_1$10._)`${o} === "" || ${o} === 0 || ${o} === false`), s.assign(d, null);
        return;
      case "array":
        s.elseIf((0, codegen_1$10._)`${c} === "string" || ${c} === "number"
              || ${c} === "boolean" || ${o} === null`).assign(d, (0, codegen_1$10._)`[${o}]`);
    }
  }
}
function assignParentData$1({ gen: e, parentData: r, parentDataProperty: n }, s) {
  e.if((0, codegen_1$10._)`${r} !== undefined`, () => e.assign((0, codegen_1$10._)`${r}[${n}]`, s));
}
function checkDataType$1(e, r, n, s = DataType$1.Correct) {
  const o = s === DataType$1.Correct ? codegen_1$10.operators.EQ : codegen_1$10.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, codegen_1$10._)`${r} ${o} null`;
    case "array":
      a = (0, codegen_1$10._)`Array.isArray(${r})`;
      break;
    case "object":
      a = (0, codegen_1$10._)`${r} && typeof ${r} == "object" && !Array.isArray(${r})`;
      break;
    case "integer":
      a = c((0, codegen_1$10._)`!(${r} % 1) && !isNaN(${r})`);
      break;
    case "number":
      a = c();
      break;
    default:
      return (0, codegen_1$10._)`typeof ${r} ${o} ${e}`;
  }
  return s === DataType$1.Correct ? a : (0, codegen_1$10.not)(a);
  function c(d = codegen_1$10.nil) {
    return (0, codegen_1$10.and)((0, codegen_1$10._)`typeof ${r} == "number"`, d, n ? (0, codegen_1$10._)`isFinite(${r})` : codegen_1$10.nil);
  }
}
dataType$1.checkDataType = checkDataType$1;
function checkDataTypes$1(e, r, n, s) {
  if (e.length === 1)
    return checkDataType$1(e[0], r, n, s);
  let o;
  const a = (0, util_1$X.toHash)(e);
  if (a.array && a.object) {
    const c = (0, codegen_1$10._)`typeof ${r} != "object"`;
    o = a.null ? c : (0, codegen_1$10._)`!${r} || ${c}`, delete a.null, delete a.array, delete a.object;
  } else
    o = codegen_1$10.nil;
  a.number && delete a.integer;
  for (const c in a)
    o = (0, codegen_1$10.and)(o, checkDataType$1(c, r, n, s));
  return o;
}
dataType$1.checkDataTypes = checkDataTypes$1;
const typeError$1 = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: r }) => typeof e == "string" ? (0, codegen_1$10._)`{type: ${e}}` : (0, codegen_1$10._)`{type: ${r}}`
};
function reportTypeError$1(e) {
  const r = getTypeErrorContext$1(e);
  (0, errors_1$6.reportError)(r, typeError$1);
}
dataType$1.reportTypeError = reportTypeError$1;
function getTypeErrorContext$1(e) {
  const { gen: r, data: n, schema: s } = e, o = (0, util_1$X.schemaRefOrVal)(e, s, "type");
  return {
    gen: r,
    keyword: "type",
    data: n,
    schema: s.type,
    schemaCode: o,
    schemaValue: o,
    parentSchema: s,
    params: {},
    it: e
  };
}
var defaults$5 = {};
Object.defineProperty(defaults$5, "__esModule", { value: !0 });
defaults$5.assignDefaults = void 0;
const codegen_1$$ = codegen$1, util_1$W = util$1;
function assignDefaults$1(e, r) {
  const { properties: n, items: s } = e.schema;
  if (r === "object" && n)
    for (const o in n)
      assignDefault$1(e, o, n[o].default);
  else r === "array" && Array.isArray(s) && s.forEach((o, a) => assignDefault$1(e, a, o.default));
}
defaults$5.assignDefaults = assignDefaults$1;
function assignDefault$1(e, r, n) {
  const { gen: s, compositeRule: o, data: a, opts: c } = e;
  if (n === void 0)
    return;
  const d = (0, codegen_1$$._)`${a}${(0, codegen_1$$.getProperty)(r)}`;
  if (o) {
    (0, util_1$W.checkStrictMode)(e, `default is ignored for: ${d}`);
    return;
  }
  let l = (0, codegen_1$$._)`${d} === undefined`;
  c.useDefaults === "empty" && (l = (0, codegen_1$$._)`${l} || ${d} === null || ${d} === ""`), s.if(l, (0, codegen_1$$._)`${d} = ${(0, codegen_1$$.stringify)(n)}`);
}
var keyword$1 = {}, code$2 = {};
Object.defineProperty(code$2, "__esModule", { value: !0 });
code$2.validateUnion = code$2.validateArray = code$2.usePattern = code$2.callValidateCode = code$2.schemaProperties = code$2.allSchemaProperties = code$2.noPropertyInData = code$2.propertyInData = code$2.isOwnProperty = code$2.hasPropFunc = code$2.reportMissingProp = code$2.checkMissingProp = code$2.checkReportMissingProp = void 0;
const codegen_1$_ = codegen$1, util_1$V = util$1, names_1$f = names$3, util_2$3 = util$1;
function checkReportMissingProp$1(e, r) {
  const { gen: n, data: s, it: o } = e;
  n.if(noPropertyInData$1(n, s, r, o.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, codegen_1$_._)`${r}` }, !0), e.error();
  });
}
code$2.checkReportMissingProp = checkReportMissingProp$1;
function checkMissingProp$1({ gen: e, data: r, it: { opts: n } }, s, o) {
  return (0, codegen_1$_.or)(...s.map((a) => (0, codegen_1$_.and)(noPropertyInData$1(e, r, a, n.ownProperties), (0, codegen_1$_._)`${o} = ${a}`)));
}
code$2.checkMissingProp = checkMissingProp$1;
function reportMissingProp$1(e, r) {
  e.setParams({ missingProperty: r }, !0), e.error();
}
code$2.reportMissingProp = reportMissingProp$1;
function hasPropFunc$1(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, codegen_1$_._)`Object.prototype.hasOwnProperty`
  });
}
code$2.hasPropFunc = hasPropFunc$1;
function isOwnProperty$1(e, r, n) {
  return (0, codegen_1$_._)`${hasPropFunc$1(e)}.call(${r}, ${n})`;
}
code$2.isOwnProperty = isOwnProperty$1;
function propertyInData$1(e, r, n, s) {
  const o = (0, codegen_1$_._)`${r}${(0, codegen_1$_.getProperty)(n)} !== undefined`;
  return s ? (0, codegen_1$_._)`${o} && ${isOwnProperty$1(e, r, n)}` : o;
}
code$2.propertyInData = propertyInData$1;
function noPropertyInData$1(e, r, n, s) {
  const o = (0, codegen_1$_._)`${r}${(0, codegen_1$_.getProperty)(n)} === undefined`;
  return s ? (0, codegen_1$_.or)(o, (0, codegen_1$_.not)(isOwnProperty$1(e, r, n))) : o;
}
code$2.noPropertyInData = noPropertyInData$1;
function allSchemaProperties$1(e) {
  return e ? Object.keys(e).filter((r) => r !== "__proto__") : [];
}
code$2.allSchemaProperties = allSchemaProperties$1;
function schemaProperties$1(e, r) {
  return allSchemaProperties$1(r).filter((n) => !(0, util_1$V.alwaysValidSchema)(e, r[n]));
}
code$2.schemaProperties = schemaProperties$1;
function callValidateCode$1({ schemaCode: e, data: r, it: { gen: n, topSchemaRef: s, schemaPath: o, errorPath: a }, it: c }, d, l, u) {
  const h = u ? (0, codegen_1$_._)`${e}, ${r}, ${s}${o}` : r, p = [
    [names_1$f.default.instancePath, (0, codegen_1$_.strConcat)(names_1$f.default.instancePath, a)],
    [names_1$f.default.parentData, c.parentData],
    [names_1$f.default.parentDataProperty, c.parentDataProperty],
    [names_1$f.default.rootData, names_1$f.default.rootData]
  ];
  c.opts.dynamicRef && p.push([names_1$f.default.dynamicAnchors, names_1$f.default.dynamicAnchors]);
  const g = (0, codegen_1$_._)`${h}, ${n.object(...p)}`;
  return l !== codegen_1$_.nil ? (0, codegen_1$_._)`${d}.call(${l}, ${g})` : (0, codegen_1$_._)`${d}(${g})`;
}
code$2.callValidateCode = callValidateCode$1;
const newRegExp$1 = (0, codegen_1$_._)`new RegExp`;
function usePattern$1({ gen: e, it: { opts: r } }, n) {
  const s = r.unicodeRegExp ? "u" : "", { regExp: o } = r.code, a = o(n, s);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, codegen_1$_._)`${o.code === "new RegExp" ? newRegExp$1 : (0, util_2$3.useFunc)(e, o)}(${n}, ${s})`
  });
}
code$2.usePattern = usePattern$1;
function validateArray$1(e) {
  const { gen: r, data: n, keyword: s, it: o } = e, a = r.name("valid");
  if (o.allErrors) {
    const d = r.let("valid", !0);
    return c(() => r.assign(d, !1)), d;
  }
  return r.var(a, !0), c(() => r.break()), a;
  function c(d) {
    const l = r.const("len", (0, codegen_1$_._)`${n}.length`);
    r.forRange("i", 0, l, (u) => {
      e.subschema({
        keyword: s,
        dataProp: u,
        dataPropType: util_1$V.Type.Num
      }, a), r.if((0, codegen_1$_.not)(a), d);
    });
  }
}
code$2.validateArray = validateArray$1;
function validateUnion$1(e) {
  const { gen: r, schema: n, keyword: s, it: o } = e;
  if (!Array.isArray(n))
    throw new Error("ajv implementation error");
  if (n.some((l) => (0, util_1$V.alwaysValidSchema)(o, l)) && !o.opts.unevaluated)
    return;
  const c = r.let("valid", !1), d = r.name("_valid");
  r.block(() => n.forEach((l, u) => {
    const h = e.subschema({
      keyword: s,
      schemaProp: u,
      compositeRule: !0
    }, d);
    r.assign(c, (0, codegen_1$_._)`${c} || ${d}`), e.mergeValidEvaluated(h, d) || r.if((0, codegen_1$_.not)(c));
  })), e.result(c, () => e.reset(), () => e.error(!0));
}
code$2.validateUnion = validateUnion$1;
Object.defineProperty(keyword$1, "__esModule", { value: !0 });
keyword$1.validateKeywordUsage = keyword$1.validSchemaType = keyword$1.funcKeywordCode = keyword$1.macroKeywordCode = void 0;
const codegen_1$Z = codegen$1, names_1$e = names$3, code_1$k = code$2, errors_1$5 = errors$1;
function macroKeywordCode$1(e, r) {
  const { gen: n, keyword: s, schema: o, parentSchema: a, it: c } = e, d = r.macro.call(c.self, o, a, c), l = useKeyword$1(n, s, d);
  c.opts.validateSchema !== !1 && c.self.validateSchema(d, !0);
  const u = n.name("valid");
  e.subschema({
    schema: d,
    schemaPath: codegen_1$Z.nil,
    errSchemaPath: `${c.errSchemaPath}/${s}`,
    topSchemaRef: l,
    compositeRule: !0
  }, u), e.pass(u, () => e.error(!0));
}
keyword$1.macroKeywordCode = macroKeywordCode$1;
function funcKeywordCode$1(e, r) {
  var n;
  const { gen: s, keyword: o, schema: a, parentSchema: c, $data: d, it: l } = e;
  checkAsyncKeyword$1(l, r);
  const u = !d && r.compile ? r.compile.call(l.self, a, c, l) : r.validate, h = useKeyword$1(s, o, u), p = s.let("valid");
  e.block$data(p, g), e.ok((n = r.valid) !== null && n !== void 0 ? n : p);
  function g() {
    if (r.errors === !1)
      E(), r.modifying && modifyData$1(e), m(() => e.error());
    else {
      const _ = r.async ? y() : w();
      r.modifying && modifyData$1(e), m(() => addErrs$1(e, _));
    }
  }
  function y() {
    const _ = s.let("ruleErrs", null);
    return s.try(() => E((0, codegen_1$Z._)`await `), (S) => s.assign(p, !1).if((0, codegen_1$Z._)`${S} instanceof ${l.ValidationError}`, () => s.assign(_, (0, codegen_1$Z._)`${S}.errors`), () => s.throw(S))), _;
  }
  function w() {
    const _ = (0, codegen_1$Z._)`${h}.errors`;
    return s.assign(_, null), E(codegen_1$Z.nil), _;
  }
  function E(_ = r.async ? (0, codegen_1$Z._)`await ` : codegen_1$Z.nil) {
    const S = l.opts.passContext ? names_1$e.default.this : names_1$e.default.self, O = !("compile" in r && !d || r.schema === !1);
    s.assign(p, (0, codegen_1$Z._)`${_}${(0, code_1$k.callValidateCode)(e, h, S, O)}`, r.modifying);
  }
  function m(_) {
    var S;
    s.if((0, codegen_1$Z.not)((S = r.valid) !== null && S !== void 0 ? S : p), _);
  }
}
keyword$1.funcKeywordCode = funcKeywordCode$1;
function modifyData$1(e) {
  const { gen: r, data: n, it: s } = e;
  r.if(s.parentData, () => r.assign(n, (0, codegen_1$Z._)`${s.parentData}[${s.parentDataProperty}]`));
}
function addErrs$1(e, r) {
  const { gen: n } = e;
  n.if((0, codegen_1$Z._)`Array.isArray(${r})`, () => {
    n.assign(names_1$e.default.vErrors, (0, codegen_1$Z._)`${names_1$e.default.vErrors} === null ? ${r} : ${names_1$e.default.vErrors}.concat(${r})`).assign(names_1$e.default.errors, (0, codegen_1$Z._)`${names_1$e.default.vErrors}.length`), (0, errors_1$5.extendErrors)(e);
  }, () => e.error());
}
function checkAsyncKeyword$1({ schemaEnv: e }, r) {
  if (r.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function useKeyword$1(e, r, n) {
  if (n === void 0)
    throw new Error(`keyword "${r}" failed to compile`);
  return e.scopeValue("keyword", typeof n == "function" ? { ref: n } : { ref: n, code: (0, codegen_1$Z.stringify)(n) });
}
function validSchemaType$1(e, r, n = !1) {
  return !r.length || r.some((s) => s === "array" ? Array.isArray(e) : s === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == s || n && typeof e > "u");
}
keyword$1.validSchemaType = validSchemaType$1;
function validateKeywordUsage$1({ schema: e, opts: r, self: n, errSchemaPath: s }, o, a) {
  if (Array.isArray(o.keyword) ? !o.keyword.includes(a) : o.keyword !== a)
    throw new Error("ajv implementation error");
  const c = o.dependencies;
  if (c != null && c.some((d) => !Object.prototype.hasOwnProperty.call(e, d)))
    throw new Error(`parent schema must have dependencies of ${a}: ${c.join(",")}`);
  if (o.validateSchema && !o.validateSchema(e[a])) {
    const l = `keyword "${a}" value is invalid at path "${s}": ` + n.errorsText(o.validateSchema.errors);
    if (r.validateSchema === "log")
      n.logger.error(l);
    else
      throw new Error(l);
  }
}
keyword$1.validateKeywordUsage = validateKeywordUsage$1;
var subschema$1 = {};
Object.defineProperty(subschema$1, "__esModule", { value: !0 });
subschema$1.extendSubschemaMode = subschema$1.extendSubschemaData = subschema$1.getSubschema = void 0;
const codegen_1$Y = codegen$1, util_1$U = util$1;
function getSubschema$1(e, { keyword: r, schemaProp: n, schema: s, schemaPath: o, errSchemaPath: a, topSchemaRef: c }) {
  if (r !== void 0 && s !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (r !== void 0) {
    const d = e.schema[r];
    return n === void 0 ? {
      schema: d,
      schemaPath: (0, codegen_1$Y._)`${e.schemaPath}${(0, codegen_1$Y.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${r}`
    } : {
      schema: d[n],
      schemaPath: (0, codegen_1$Y._)`${e.schemaPath}${(0, codegen_1$Y.getProperty)(r)}${(0, codegen_1$Y.getProperty)(n)}`,
      errSchemaPath: `${e.errSchemaPath}/${r}/${(0, util_1$U.escapeFragment)(n)}`
    };
  }
  if (s !== void 0) {
    if (o === void 0 || a === void 0 || c === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: s,
      schemaPath: o,
      topSchemaRef: c,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
subschema$1.getSubschema = getSubschema$1;
function extendSubschemaData$1(e, r, { dataProp: n, dataPropType: s, data: o, dataTypes: a, propertyName: c }) {
  if (o !== void 0 && n !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: d } = r;
  if (n !== void 0) {
    const { errorPath: u, dataPathArr: h, opts: p } = r, g = d.let("data", (0, codegen_1$Y._)`${r.data}${(0, codegen_1$Y.getProperty)(n)}`, !0);
    l(g), e.errorPath = (0, codegen_1$Y.str)`${u}${(0, util_1$U.getErrorPath)(n, s, p.jsPropertySyntax)}`, e.parentDataProperty = (0, codegen_1$Y._)`${n}`, e.dataPathArr = [...h, e.parentDataProperty];
  }
  if (o !== void 0) {
    const u = o instanceof codegen_1$Y.Name ? o : d.let("data", o, !0);
    l(u), c !== void 0 && (e.propertyName = c);
  }
  a && (e.dataTypes = a);
  function l(u) {
    e.data = u, e.dataLevel = r.dataLevel + 1, e.dataTypes = [], r.definedProperties = /* @__PURE__ */ new Set(), e.parentData = r.data, e.dataNames = [...r.dataNames, u];
  }
}
subschema$1.extendSubschemaData = extendSubschemaData$1;
function extendSubschemaMode$1(e, { jtdDiscriminator: r, jtdMetadata: n, compositeRule: s, createErrors: o, allErrors: a }) {
  s !== void 0 && (e.compositeRule = s), o !== void 0 && (e.createErrors = o), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = r, e.jtdMetadata = n;
}
subschema$1.extendSubschemaMode = extendSubschemaMode$1;
var resolve$4 = {}, fastDeepEqual = function e(r, n) {
  if (r === n) return !0;
  if (r && n && typeof r == "object" && typeof n == "object") {
    if (r.constructor !== n.constructor) return !1;
    var s, o, a;
    if (Array.isArray(r)) {
      if (s = r.length, s != n.length) return !1;
      for (o = s; o-- !== 0; )
        if (!e(r[o], n[o])) return !1;
      return !0;
    }
    if (r.constructor === RegExp) return r.source === n.source && r.flags === n.flags;
    if (r.valueOf !== Object.prototype.valueOf) return r.valueOf() === n.valueOf();
    if (r.toString !== Object.prototype.toString) return r.toString() === n.toString();
    if (a = Object.keys(r), s = a.length, s !== Object.keys(n).length) return !1;
    for (o = s; o-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(n, a[o])) return !1;
    for (o = s; o-- !== 0; ) {
      var c = a[o];
      if (!e(r[c], n[c])) return !1;
    }
    return !0;
  }
  return r !== r && n !== n;
}, jsonSchemaTraverse$1 = { exports: {} }, traverse$3 = jsonSchemaTraverse$1.exports = function(e, r, n) {
  typeof r == "function" && (n = r, r = {}), n = r.cb || n;
  var s = typeof n == "function" ? n : n.pre || function() {
  }, o = n.post || function() {
  };
  _traverse$1(r, s, o, e, "", e);
};
traverse$3.keywords = {
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
traverse$3.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
traverse$3.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
traverse$3.skipKeywords = {
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
function _traverse$1(e, r, n, s, o, a, c, d, l, u) {
  if (s && typeof s == "object" && !Array.isArray(s)) {
    r(s, o, a, c, d, l, u);
    for (var h in s) {
      var p = s[h];
      if (Array.isArray(p)) {
        if (h in traverse$3.arrayKeywords)
          for (var g = 0; g < p.length; g++)
            _traverse$1(e, r, n, p[g], o + "/" + h + "/" + g, a, o, h, s, g);
      } else if (h in traverse$3.propsKeywords) {
        if (p && typeof p == "object")
          for (var y in p)
            _traverse$1(e, r, n, p[y], o + "/" + h + "/" + escapeJsonPtr$1(y), a, o, h, s, y);
      } else (h in traverse$3.keywords || e.allKeys && !(h in traverse$3.skipKeywords)) && _traverse$1(e, r, n, p, o + "/" + h, a, o, h, s);
    }
    n(s, o, a, c, d, l, u);
  }
}
function escapeJsonPtr$1(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var jsonSchemaTraverseExports$1 = jsonSchemaTraverse$1.exports;
Object.defineProperty(resolve$4, "__esModule", { value: !0 });
resolve$4.getSchemaRefs = resolve$4.resolveUrl = resolve$4.normalizeId = resolve$4._getFullPath = resolve$4.getFullPath = resolve$4.inlineRef = void 0;
const util_1$T = util$1, equal$6 = fastDeepEqual, traverse$2 = jsonSchemaTraverseExports$1, SIMPLE_INLINED$1 = /* @__PURE__ */ new Set([
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
function inlineRef$1(e, r = !0) {
  return typeof e == "boolean" ? !0 : r === !0 ? !hasRef$1(e) : r ? countKeys$1(e) <= r : !1;
}
resolve$4.inlineRef = inlineRef$1;
const REF_KEYWORDS$1 = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function hasRef$1(e) {
  for (const r in e) {
    if (REF_KEYWORDS$1.has(r))
      return !0;
    const n = e[r];
    if (Array.isArray(n) && n.some(hasRef$1) || typeof n == "object" && hasRef$1(n))
      return !0;
  }
  return !1;
}
function countKeys$1(e) {
  let r = 0;
  for (const n in e) {
    if (n === "$ref")
      return 1 / 0;
    if (r++, !SIMPLE_INLINED$1.has(n) && (typeof e[n] == "object" && (0, util_1$T.eachItem)(e[n], (s) => r += countKeys$1(s)), r === 1 / 0))
      return 1 / 0;
  }
  return r;
}
function getFullPath$1(e, r = "", n) {
  n !== !1 && (r = normalizeId$1(r));
  const s = e.parse(r);
  return _getFullPath$1(e, s);
}
resolve$4.getFullPath = getFullPath$1;
function _getFullPath$1(e, r) {
  return e.serialize(r).split("#")[0] + "#";
}
resolve$4._getFullPath = _getFullPath$1;
const TRAILING_SLASH_HASH$1 = /#\/?$/;
function normalizeId$1(e) {
  return e ? e.replace(TRAILING_SLASH_HASH$1, "") : "";
}
resolve$4.normalizeId = normalizeId$1;
function resolveUrl$1(e, r, n) {
  return n = normalizeId$1(n), e.resolve(r, n);
}
resolve$4.resolveUrl = resolveUrl$1;
const ANCHOR$1 = /^[a-z_][-a-z0-9._]*$/i;
function getSchemaRefs$1(e, r) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: n, uriResolver: s } = this.opts, o = normalizeId$1(e[n] || r), a = { "": o }, c = getFullPath$1(s, o, !1), d = {}, l = /* @__PURE__ */ new Set();
  return traverse$2(e, { allKeys: !0 }, (p, g, y, w) => {
    if (w === void 0)
      return;
    const E = c + g;
    let m = a[w];
    typeof p[n] == "string" && (m = _.call(this, p[n])), S.call(this, p.$anchor), S.call(this, p.$dynamicAnchor), a[g] = m;
    function _(O) {
      const I = this.opts.uriResolver.resolve;
      if (O = normalizeId$1(m ? I(m, O) : O), l.has(O))
        throw h(O);
      l.add(O);
      let A = this.refs[O];
      return typeof A == "string" && (A = this.refs[A]), typeof A == "object" ? u(p, A.schema, O) : O !== normalizeId$1(E) && (O[0] === "#" ? (u(p, d[O], O), d[O] = p) : this.refs[O] = E), O;
    }
    function S(O) {
      if (typeof O == "string") {
        if (!ANCHOR$1.test(O))
          throw new Error(`invalid anchor "${O}"`);
        _.call(this, `#${O}`);
      }
    }
  }), d;
  function u(p, g, y) {
    if (g !== void 0 && !equal$6(p, g))
      throw h(y);
  }
  function h(p) {
    return new Error(`reference "${p}" resolves to more than one schema`);
  }
}
resolve$4.getSchemaRefs = getSchemaRefs$1;
Object.defineProperty(validate$1, "__esModule", { value: !0 });
validate$1.getData = validate$1.KeywordCxt = validate$1.validateFunctionCode = void 0;
const boolSchema_1$1 = boolSchema$1, dataType_1$3 = dataType$1, applicability_1$2 = applicability$1, dataType_2$1 = dataType$1, defaults_1$2 = defaults$5, keyword_1$1 = keyword$1, subschema_1$1 = subschema$1, codegen_1$X = codegen$1, names_1$d = names$3, resolve_1$5 = resolve$4, util_1$S = util$1, errors_1$4 = errors$1;
function validateFunctionCode$1(e) {
  if (isSchemaObj$1(e) && (checkKeywords$1(e), schemaCxtHasRules$1(e))) {
    topSchemaObjCode$1(e);
    return;
  }
  validateFunction$1(e, () => (0, boolSchema_1$1.topBoolOrEmptySchema)(e));
}
validate$1.validateFunctionCode = validateFunctionCode$1;
function validateFunction$1({ gen: e, validateName: r, schema: n, schemaEnv: s, opts: o }, a) {
  o.code.es5 ? e.func(r, (0, codegen_1$X._)`${names_1$d.default.data}, ${names_1$d.default.valCxt}`, s.$async, () => {
    e.code((0, codegen_1$X._)`"use strict"; ${funcSourceUrl$1(n, o)}`), destructureValCxtES5$1(e, o), e.code(a);
  }) : e.func(r, (0, codegen_1$X._)`${names_1$d.default.data}, ${destructureValCxt$1(o)}`, s.$async, () => e.code(funcSourceUrl$1(n, o)).code(a));
}
function destructureValCxt$1(e) {
  return (0, codegen_1$X._)`{${names_1$d.default.instancePath}="", ${names_1$d.default.parentData}, ${names_1$d.default.parentDataProperty}, ${names_1$d.default.rootData}=${names_1$d.default.data}${e.dynamicRef ? (0, codegen_1$X._)`, ${names_1$d.default.dynamicAnchors}={}` : codegen_1$X.nil}}={}`;
}
function destructureValCxtES5$1(e, r) {
  e.if(names_1$d.default.valCxt, () => {
    e.var(names_1$d.default.instancePath, (0, codegen_1$X._)`${names_1$d.default.valCxt}.${names_1$d.default.instancePath}`), e.var(names_1$d.default.parentData, (0, codegen_1$X._)`${names_1$d.default.valCxt}.${names_1$d.default.parentData}`), e.var(names_1$d.default.parentDataProperty, (0, codegen_1$X._)`${names_1$d.default.valCxt}.${names_1$d.default.parentDataProperty}`), e.var(names_1$d.default.rootData, (0, codegen_1$X._)`${names_1$d.default.valCxt}.${names_1$d.default.rootData}`), r.dynamicRef && e.var(names_1$d.default.dynamicAnchors, (0, codegen_1$X._)`${names_1$d.default.valCxt}.${names_1$d.default.dynamicAnchors}`);
  }, () => {
    e.var(names_1$d.default.instancePath, (0, codegen_1$X._)`""`), e.var(names_1$d.default.parentData, (0, codegen_1$X._)`undefined`), e.var(names_1$d.default.parentDataProperty, (0, codegen_1$X._)`undefined`), e.var(names_1$d.default.rootData, names_1$d.default.data), r.dynamicRef && e.var(names_1$d.default.dynamicAnchors, (0, codegen_1$X._)`{}`);
  });
}
function topSchemaObjCode$1(e) {
  const { schema: r, opts: n, gen: s } = e;
  validateFunction$1(e, () => {
    n.$comment && r.$comment && commentKeyword$1(e), checkNoDefault$1(e), s.let(names_1$d.default.vErrors, null), s.let(names_1$d.default.errors, 0), n.unevaluated && resetEvaluated$1(e), typeAndKeywords$1(e), returnResults$1(e);
  });
}
function resetEvaluated$1(e) {
  const { gen: r, validateName: n } = e;
  e.evaluated = r.const("evaluated", (0, codegen_1$X._)`${n}.evaluated`), r.if((0, codegen_1$X._)`${e.evaluated}.dynamicProps`, () => r.assign((0, codegen_1$X._)`${e.evaluated}.props`, (0, codegen_1$X._)`undefined`)), r.if((0, codegen_1$X._)`${e.evaluated}.dynamicItems`, () => r.assign((0, codegen_1$X._)`${e.evaluated}.items`, (0, codegen_1$X._)`undefined`));
}
function funcSourceUrl$1(e, r) {
  const n = typeof e == "object" && e[r.schemaId];
  return n && (r.code.source || r.code.process) ? (0, codegen_1$X._)`/*# sourceURL=${n} */` : codegen_1$X.nil;
}
function subschemaCode$1(e, r) {
  if (isSchemaObj$1(e) && (checkKeywords$1(e), schemaCxtHasRules$1(e))) {
    subSchemaObjCode$1(e, r);
    return;
  }
  (0, boolSchema_1$1.boolOrEmptySchema)(e, r);
}
function schemaCxtHasRules$1({ schema: e, self: r }) {
  if (typeof e == "boolean")
    return !e;
  for (const n in e)
    if (r.RULES.all[n])
      return !0;
  return !1;
}
function isSchemaObj$1(e) {
  return typeof e.schema != "boolean";
}
function subSchemaObjCode$1(e, r) {
  const { schema: n, gen: s, opts: o } = e;
  o.$comment && n.$comment && commentKeyword$1(e), updateContext$1(e), checkAsyncSchema$1(e);
  const a = s.const("_errs", names_1$d.default.errors);
  typeAndKeywords$1(e, a), s.var(r, (0, codegen_1$X._)`${a} === ${names_1$d.default.errors}`);
}
function checkKeywords$1(e) {
  (0, util_1$S.checkUnknownRules)(e), checkRefsAndKeywords$1(e);
}
function typeAndKeywords$1(e, r) {
  if (e.opts.jtd)
    return schemaKeywords$1(e, [], !1, r);
  const n = (0, dataType_1$3.getSchemaTypes)(e.schema), s = (0, dataType_1$3.coerceAndCheckDataType)(e, n);
  schemaKeywords$1(e, n, !s, r);
}
function checkRefsAndKeywords$1(e) {
  const { schema: r, errSchemaPath: n, opts: s, self: o } = e;
  r.$ref && s.ignoreKeywordsWithRef && (0, util_1$S.schemaHasRulesButRef)(r, o.RULES) && o.logger.warn(`$ref: keywords ignored in schema at path "${n}"`);
}
function checkNoDefault$1(e) {
  const { schema: r, opts: n } = e;
  r.default !== void 0 && n.useDefaults && n.strictSchema && (0, util_1$S.checkStrictMode)(e, "default is ignored in the schema root");
}
function updateContext$1(e) {
  const r = e.schema[e.opts.schemaId];
  r && (e.baseId = (0, resolve_1$5.resolveUrl)(e.opts.uriResolver, e.baseId, r));
}
function checkAsyncSchema$1(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function commentKeyword$1({ gen: e, schemaEnv: r, schema: n, errSchemaPath: s, opts: o }) {
  const a = n.$comment;
  if (o.$comment === !0)
    e.code((0, codegen_1$X._)`${names_1$d.default.self}.logger.log(${a})`);
  else if (typeof o.$comment == "function") {
    const c = (0, codegen_1$X.str)`${s}/$comment`, d = e.scopeValue("root", { ref: r.root });
    e.code((0, codegen_1$X._)`${names_1$d.default.self}.opts.$comment(${a}, ${c}, ${d}.schema)`);
  }
}
function returnResults$1(e) {
  const { gen: r, schemaEnv: n, validateName: s, ValidationError: o, opts: a } = e;
  n.$async ? r.if((0, codegen_1$X._)`${names_1$d.default.errors} === 0`, () => r.return(names_1$d.default.data), () => r.throw((0, codegen_1$X._)`new ${o}(${names_1$d.default.vErrors})`)) : (r.assign((0, codegen_1$X._)`${s}.errors`, names_1$d.default.vErrors), a.unevaluated && assignEvaluated$1(e), r.return((0, codegen_1$X._)`${names_1$d.default.errors} === 0`));
}
function assignEvaluated$1({ gen: e, evaluated: r, props: n, items: s }) {
  n instanceof codegen_1$X.Name && e.assign((0, codegen_1$X._)`${r}.props`, n), s instanceof codegen_1$X.Name && e.assign((0, codegen_1$X._)`${r}.items`, s);
}
function schemaKeywords$1(e, r, n, s) {
  const { gen: o, schema: a, data: c, allErrors: d, opts: l, self: u } = e, { RULES: h } = u;
  if (a.$ref && (l.ignoreKeywordsWithRef || !(0, util_1$S.schemaHasRulesButRef)(a, h))) {
    o.block(() => keywordCode$1(e, "$ref", h.all.$ref.definition));
    return;
  }
  l.jtd || checkStrictTypes$1(e, r), o.block(() => {
    for (const g of h.rules)
      p(g);
    p(h.post);
  });
  function p(g) {
    (0, applicability_1$2.shouldUseGroup)(a, g) && (g.type ? (o.if((0, dataType_2$1.checkDataType)(g.type, c, l.strictNumbers)), iterateKeywords$1(e, g), r.length === 1 && r[0] === g.type && n && (o.else(), (0, dataType_2$1.reportTypeError)(e)), o.endIf()) : iterateKeywords$1(e, g), d || o.if((0, codegen_1$X._)`${names_1$d.default.errors} === ${s || 0}`));
  }
}
function iterateKeywords$1(e, r) {
  const { gen: n, schema: s, opts: { useDefaults: o } } = e;
  o && (0, defaults_1$2.assignDefaults)(e, r.type), n.block(() => {
    for (const a of r.rules)
      (0, applicability_1$2.shouldUseRule)(s, a) && keywordCode$1(e, a.keyword, a.definition, r.type);
  });
}
function checkStrictTypes$1(e, r) {
  e.schemaEnv.meta || !e.opts.strictTypes || (checkContextTypes$1(e, r), e.opts.allowUnionTypes || checkMultipleTypes$1(e, r), checkKeywordTypes$1(e, e.dataTypes));
}
function checkContextTypes$1(e, r) {
  if (r.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = r;
      return;
    }
    r.forEach((n) => {
      includesType$1(e.dataTypes, n) || strictTypesError$1(e, `type "${n}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), narrowSchemaTypes$1(e, r);
  }
}
function checkMultipleTypes$1(e, r) {
  r.length > 1 && !(r.length === 2 && r.includes("null")) && strictTypesError$1(e, "use allowUnionTypes to allow union type keyword");
}
function checkKeywordTypes$1(e, r) {
  const n = e.self.RULES.all;
  for (const s in n) {
    const o = n[s];
    if (typeof o == "object" && (0, applicability_1$2.shouldUseRule)(e.schema, o)) {
      const { type: a } = o.definition;
      a.length && !a.some((c) => hasApplicableType$1(r, c)) && strictTypesError$1(e, `missing type "${a.join(",")}" for keyword "${s}"`);
    }
  }
}
function hasApplicableType$1(e, r) {
  return e.includes(r) || r === "number" && e.includes("integer");
}
function includesType$1(e, r) {
  return e.includes(r) || r === "integer" && e.includes("number");
}
function narrowSchemaTypes$1(e, r) {
  const n = [];
  for (const s of e.dataTypes)
    includesType$1(r, s) ? n.push(s) : r.includes("integer") && s === "number" && n.push("integer");
  e.dataTypes = n;
}
function strictTypesError$1(e, r) {
  const n = e.schemaEnv.baseId + e.errSchemaPath;
  r += ` at "${n}" (strictTypes)`, (0, util_1$S.checkStrictMode)(e, r, e.opts.strictTypes);
}
let KeywordCxt$1 = class {
  constructor(r, n, s) {
    if ((0, keyword_1$1.validateKeywordUsage)(r, n, s), this.gen = r.gen, this.allErrors = r.allErrors, this.keyword = s, this.data = r.data, this.schema = r.schema[s], this.$data = n.$data && r.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, util_1$S.schemaRefOrVal)(r, this.schema, s, this.$data), this.schemaType = n.schemaType, this.parentSchema = r.schema, this.params = {}, this.it = r, this.def = n, this.$data)
      this.schemaCode = r.gen.const("vSchema", getData$1(this.$data, r));
    else if (this.schemaCode = this.schemaValue, !(0, keyword_1$1.validSchemaType)(this.schema, n.schemaType, n.allowUndefined))
      throw new Error(`${s} value must be ${JSON.stringify(n.schemaType)}`);
    ("code" in n ? n.trackErrors : n.errors !== !1) && (this.errsCount = r.gen.const("_errs", names_1$d.default.errors));
  }
  result(r, n, s) {
    this.failResult((0, codegen_1$X.not)(r), n, s);
  }
  failResult(r, n, s) {
    this.gen.if(r), s ? s() : this.error(), n ? (this.gen.else(), n(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(r, n) {
    this.failResult((0, codegen_1$X.not)(r), void 0, n);
  }
  fail(r) {
    if (r === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(r), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(r) {
    if (!this.$data)
      return this.fail(r);
    const { schemaCode: n } = this;
    this.fail((0, codegen_1$X._)`${n} !== undefined && (${(0, codegen_1$X.or)(this.invalid$data(), r)})`);
  }
  error(r, n, s) {
    if (n) {
      this.setParams(n), this._error(r, s), this.setParams({});
      return;
    }
    this._error(r, s);
  }
  _error(r, n) {
    (r ? errors_1$4.reportExtraError : errors_1$4.reportError)(this, this.def.error, n);
  }
  $dataError() {
    (0, errors_1$4.reportError)(this, this.def.$dataError || errors_1$4.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, errors_1$4.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(r) {
    this.allErrors || this.gen.if(r);
  }
  setParams(r, n) {
    n ? Object.assign(this.params, r) : this.params = r;
  }
  block$data(r, n, s = codegen_1$X.nil) {
    this.gen.block(() => {
      this.check$data(r, s), n();
    });
  }
  check$data(r = codegen_1$X.nil, n = codegen_1$X.nil) {
    if (!this.$data)
      return;
    const { gen: s, schemaCode: o, schemaType: a, def: c } = this;
    s.if((0, codegen_1$X.or)((0, codegen_1$X._)`${o} === undefined`, n)), r !== codegen_1$X.nil && s.assign(r, !0), (a.length || c.validateSchema) && (s.elseIf(this.invalid$data()), this.$dataError(), r !== codegen_1$X.nil && s.assign(r, !1)), s.else();
  }
  invalid$data() {
    const { gen: r, schemaCode: n, schemaType: s, def: o, it: a } = this;
    return (0, codegen_1$X.or)(c(), d());
    function c() {
      if (s.length) {
        if (!(n instanceof codegen_1$X.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(s) ? s : [s];
        return (0, codegen_1$X._)`${(0, dataType_2$1.checkDataTypes)(l, n, a.opts.strictNumbers, dataType_2$1.DataType.Wrong)}`;
      }
      return codegen_1$X.nil;
    }
    function d() {
      if (o.validateSchema) {
        const l = r.scopeValue("validate$data", { ref: o.validateSchema });
        return (0, codegen_1$X._)`!${l}(${n})`;
      }
      return codegen_1$X.nil;
    }
  }
  subschema(r, n) {
    const s = (0, subschema_1$1.getSubschema)(this.it, r);
    (0, subschema_1$1.extendSubschemaData)(s, this.it, r), (0, subschema_1$1.extendSubschemaMode)(s, r);
    const o = { ...this.it, ...s, items: void 0, props: void 0 };
    return subschemaCode$1(o, n), o;
  }
  mergeEvaluated(r, n) {
    const { it: s, gen: o } = this;
    s.opts.unevaluated && (s.props !== !0 && r.props !== void 0 && (s.props = util_1$S.mergeEvaluated.props(o, r.props, s.props, n)), s.items !== !0 && r.items !== void 0 && (s.items = util_1$S.mergeEvaluated.items(o, r.items, s.items, n)));
  }
  mergeValidEvaluated(r, n) {
    const { it: s, gen: o } = this;
    if (s.opts.unevaluated && (s.props !== !0 || s.items !== !0))
      return o.if(n, () => this.mergeEvaluated(r, codegen_1$X.Name)), !0;
  }
};
validate$1.KeywordCxt = KeywordCxt$1;
function keywordCode$1(e, r, n, s) {
  const o = new KeywordCxt$1(e, n, r);
  "code" in n ? n.code(o, s) : o.$data && n.validate ? (0, keyword_1$1.funcKeywordCode)(o, n) : "macro" in n ? (0, keyword_1$1.macroKeywordCode)(o, n) : (n.compile || n.validate) && (0, keyword_1$1.funcKeywordCode)(o, n);
}
const JSON_POINTER$1 = /^\/(?:[^~]|~0|~1)*$/, RELATIVE_JSON_POINTER$1 = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function getData$1(e, { dataLevel: r, dataNames: n, dataPathArr: s }) {
  let o, a;
  if (e === "")
    return names_1$d.default.rootData;
  if (e[0] === "/") {
    if (!JSON_POINTER$1.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    o = e, a = names_1$d.default.rootData;
  } else {
    const u = RELATIVE_JSON_POINTER$1.exec(e);
    if (!u)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const h = +u[1];
    if (o = u[2], o === "#") {
      if (h >= r)
        throw new Error(l("property/index", h));
      return s[r - h];
    }
    if (h > r)
      throw new Error(l("data", h));
    if (a = n[r - h], !o)
      return a;
  }
  let c = a;
  const d = o.split("/");
  for (const u of d)
    u && (a = (0, codegen_1$X._)`${a}${(0, codegen_1$X.getProperty)((0, util_1$S.unescapeJsonPointer)(u))}`, c = (0, codegen_1$X._)`${c} && ${a}`);
  return c;
  function l(u, h) {
    return `Cannot access ${u} ${h} levels up, current level is ${r}`;
  }
}
validate$1.getData = getData$1;
var validation_error$1 = {};
Object.defineProperty(validation_error$1, "__esModule", { value: !0 });
let ValidationError$1 = class extends Error {
  constructor(r) {
    super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
  }
};
validation_error$1.default = ValidationError$1;
var ref_error$1 = {};
Object.defineProperty(ref_error$1, "__esModule", { value: !0 });
const resolve_1$4 = resolve$4;
let MissingRefError$1 = class extends Error {
  constructor(r, n, s, o) {
    super(o || `can't resolve reference ${s} from id ${n}`), this.missingRef = (0, resolve_1$4.resolveUrl)(r, n, s), this.missingSchema = (0, resolve_1$4.normalizeId)((0, resolve_1$4.getFullPath)(r, this.missingRef));
  }
};
ref_error$1.default = MissingRefError$1;
var compile$1 = {};
Object.defineProperty(compile$1, "__esModule", { value: !0 });
compile$1.resolveSchema = compile$1.getCompilingSchema = compile$1.resolveRef = compile$1.compileSchema = compile$1.SchemaEnv = void 0;
const codegen_1$W = codegen$1, validation_error_1$1 = validation_error$1, names_1$c = names$3, resolve_1$3 = resolve$4, util_1$R = util$1, validate_1$3 = validate$1;
let SchemaEnv$1 = class {
  constructor(r) {
    var n;
    this.refs = {}, this.dynamicAnchors = {};
    let s;
    typeof r.schema == "object" && (s = r.schema), this.schema = r.schema, this.schemaId = r.schemaId, this.root = r.root || this, this.baseId = (n = r.baseId) !== null && n !== void 0 ? n : (0, resolve_1$3.normalizeId)(s == null ? void 0 : s[r.schemaId || "$id"]), this.schemaPath = r.schemaPath, this.localRefs = r.localRefs, this.meta = r.meta, this.$async = s == null ? void 0 : s.$async, this.refs = {};
  }
};
compile$1.SchemaEnv = SchemaEnv$1;
function compileSchema$1(e) {
  const r = getCompilingSchema$1.call(this, e);
  if (r)
    return r;
  const n = (0, resolve_1$3.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: s, lines: o } = this.opts.code, { ownProperties: a } = this.opts, c = new codegen_1$W.CodeGen(this.scope, { es5: s, lines: o, ownProperties: a });
  let d;
  e.$async && (d = c.scopeValue("Error", {
    ref: validation_error_1$1.default,
    code: (0, codegen_1$W._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = c.scopeName("validate");
  e.validateName = l;
  const u = {
    gen: c,
    allErrors: this.opts.allErrors,
    data: names_1$c.default.data,
    parentData: names_1$c.default.parentData,
    parentDataProperty: names_1$c.default.parentDataProperty,
    dataNames: [names_1$c.default.data],
    dataPathArr: [codegen_1$W.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: c.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, codegen_1$W.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: d,
    schema: e.schema,
    schemaEnv: e,
    rootId: n,
    baseId: e.baseId || n,
    schemaPath: codegen_1$W.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, codegen_1$W._)`""`,
    opts: this.opts,
    self: this
  };
  let h;
  try {
    this._compilations.add(e), (0, validate_1$3.validateFunctionCode)(u), c.optimize(this.opts.code.optimize);
    const p = c.toString();
    h = `${c.scopeRefs(names_1$c.default.scope)}return ${p}`, this.opts.code.process && (h = this.opts.code.process(h, e));
    const y = new Function(`${names_1$c.default.self}`, `${names_1$c.default.scope}`, h)(this, this.scope.get());
    if (this.scope.value(l, { ref: y }), y.errors = null, y.schema = e.schema, y.schemaEnv = e, e.$async && (y.$async = !0), this.opts.code.source === !0 && (y.source = { validateName: l, validateCode: p, scopeValues: c._values }), this.opts.unevaluated) {
      const { props: w, items: E } = u;
      y.evaluated = {
        props: w instanceof codegen_1$W.Name ? void 0 : w,
        items: E instanceof codegen_1$W.Name ? void 0 : E,
        dynamicProps: w instanceof codegen_1$W.Name,
        dynamicItems: E instanceof codegen_1$W.Name
      }, y.source && (y.source.evaluated = (0, codegen_1$W.stringify)(y.evaluated));
    }
    return e.validate = y, e;
  } catch (p) {
    throw delete e.validate, delete e.validateName, h && this.logger.error("Error compiling schema, function code:", h), p;
  } finally {
    this._compilations.delete(e);
  }
}
compile$1.compileSchema = compileSchema$1;
function resolveRef$1(e, r, n) {
  var s;
  n = (0, resolve_1$3.resolveUrl)(this.opts.uriResolver, r, n);
  const o = e.refs[n];
  if (o)
    return o;
  let a = resolve$3.call(this, e, n);
  if (a === void 0) {
    const c = (s = e.localRefs) === null || s === void 0 ? void 0 : s[n], { schemaId: d } = this.opts;
    c && (a = new SchemaEnv$1({ schema: c, schemaId: d, root: e, baseId: r }));
  }
  if (a !== void 0)
    return e.refs[n] = inlineOrCompile$1.call(this, a);
}
compile$1.resolveRef = resolveRef$1;
function inlineOrCompile$1(e) {
  return (0, resolve_1$3.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : compileSchema$1.call(this, e);
}
function getCompilingSchema$1(e) {
  for (const r of this._compilations)
    if (sameSchemaEnv$1(r, e))
      return r;
}
compile$1.getCompilingSchema = getCompilingSchema$1;
function sameSchemaEnv$1(e, r) {
  return e.schema === r.schema && e.root === r.root && e.baseId === r.baseId;
}
function resolve$3(e, r) {
  let n;
  for (; typeof (n = this.refs[r]) == "string"; )
    r = n;
  return n || this.schemas[r] || resolveSchema$1.call(this, e, r);
}
function resolveSchema$1(e, r) {
  const n = this.opts.uriResolver.parse(r), s = (0, resolve_1$3._getFullPath)(this.opts.uriResolver, n);
  let o = (0, resolve_1$3.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && s === o)
    return getJsonPointer$1.call(this, n, e);
  const a = (0, resolve_1$3.normalizeId)(s), c = this.refs[a] || this.schemas[a];
  if (typeof c == "string") {
    const d = resolveSchema$1.call(this, e, c);
    return typeof (d == null ? void 0 : d.schema) != "object" ? void 0 : getJsonPointer$1.call(this, n, d);
  }
  if (typeof (c == null ? void 0 : c.schema) == "object") {
    if (c.validate || compileSchema$1.call(this, c), a === (0, resolve_1$3.normalizeId)(r)) {
      const { schema: d } = c, { schemaId: l } = this.opts, u = d[l];
      return u && (o = (0, resolve_1$3.resolveUrl)(this.opts.uriResolver, o, u)), new SchemaEnv$1({ schema: d, schemaId: l, root: e, baseId: o });
    }
    return getJsonPointer$1.call(this, n, c);
  }
}
compile$1.resolveSchema = resolveSchema$1;
const PREVENT_SCOPE_CHANGE$1 = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function getJsonPointer$1(e, { baseId: r, schema: n, root: s }) {
  var o;
  if (((o = e.fragment) === null || o === void 0 ? void 0 : o[0]) !== "/")
    return;
  for (const d of e.fragment.slice(1).split("/")) {
    if (typeof n == "boolean")
      return;
    const l = n[(0, util_1$R.unescapeFragment)(d)];
    if (l === void 0)
      return;
    n = l;
    const u = typeof n == "object" && n[this.opts.schemaId];
    !PREVENT_SCOPE_CHANGE$1.has(d) && u && (r = (0, resolve_1$3.resolveUrl)(this.opts.uriResolver, r, u));
  }
  let a;
  if (typeof n != "boolean" && n.$ref && !(0, util_1$R.schemaHasRulesButRef)(n, this.RULES)) {
    const d = (0, resolve_1$3.resolveUrl)(this.opts.uriResolver, r, n.$ref);
    a = resolveSchema$1.call(this, s, d);
  }
  const { schemaId: c } = this.opts;
  if (a = a || new SchemaEnv$1({ schema: n, schemaId: c, root: s, baseId: r }), a.schema !== a.root.schema)
    return a;
}
const $id$a = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", description$1 = "Meta-schema for $data reference (JSON AnySchema extension proposal)", type$a = "object", required$3 = [
  "$data"
], properties$c = {
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
}, additionalProperties$3 = !1, require$$9$1 = {
  $id: $id$a,
  description: description$1,
  type: type$a,
  required: required$3,
  properties: properties$c,
  additionalProperties: additionalProperties$3
};
var uri$3 = {}, fastUri$1 = { exports: {} };
const isUUID$1 = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), isIPv4$1 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function stringArrayToHexStripped(e) {
  let r = "", n = 0, s = 0;
  for (s = 0; s < e.length; s++)
    if (n = e[s].charCodeAt(0), n !== 48) {
      if (!(n >= 48 && n <= 57 || n >= 65 && n <= 70 || n >= 97 && n <= 102))
        return "";
      r += e[s];
      break;
    }
  for (s += 1; s < e.length; s++) {
    if (n = e[s].charCodeAt(0), !(n >= 48 && n <= 57 || n >= 65 && n <= 70 || n >= 97 && n <= 102))
      return "";
    r += e[s];
  }
  return r;
}
const nonSimpleDomain$1 = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function consumeIsZone(e) {
  return e.length = 0, !0;
}
function consumeHextets(e, r, n) {
  if (e.length) {
    const s = stringArrayToHexStripped(e);
    if (s !== "")
      r.push(s);
    else
      return n.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function getIPV6(e) {
  let r = 0;
  const n = { error: !1, address: "", zone: "" }, s = [], o = [];
  let a = !1, c = !1, d = consumeHextets;
  for (let l = 0; l < e.length; l++) {
    const u = e[l];
    if (!(u === "[" || u === "]"))
      if (u === ":") {
        if (a === !0 && (c = !0), !d(o, s, n))
          break;
        if (++r > 7) {
          n.error = !0;
          break;
        }
        l > 0 && e[l - 1] === ":" && (a = !0), s.push(":");
        continue;
      } else if (u === "%") {
        if (!d(o, s, n))
          break;
        d = consumeIsZone;
      } else {
        o.push(u);
        continue;
      }
  }
  return o.length && (d === consumeIsZone ? n.zone = o.join("") : c ? s.push(o.join("")) : s.push(stringArrayToHexStripped(o))), n.address = s.join(""), n;
}
function normalizeIPv6$1(e) {
  if (findToken(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const r = getIPV6(e);
  if (r.error)
    return { host: e, isIPV6: !1 };
  {
    let n = r.address, s = r.address;
    return r.zone && (n += "%" + r.zone, s += "%25" + r.zone), { host: n, isIPV6: !0, escapedHost: s };
  }
}
function findToken(e, r) {
  let n = 0;
  for (let s = 0; s < e.length; s++)
    e[s] === r && n++;
  return n;
}
function removeDotSegments$1(e) {
  let r = e;
  const n = [];
  let s = -1, o = 0;
  for (; o = r.length; ) {
    if (o === 1) {
      if (r === ".")
        break;
      if (r === "/") {
        n.push("/");
        break;
      } else {
        n.push(r);
        break;
      }
    } else if (o === 2) {
      if (r[0] === ".") {
        if (r[1] === ".")
          break;
        if (r[1] === "/") {
          r = r.slice(2);
          continue;
        }
      } else if (r[0] === "/" && (r[1] === "." || r[1] === "/")) {
        n.push("/");
        break;
      }
    } else if (o === 3 && r === "/..") {
      n.length !== 0 && n.pop(), n.push("/");
      break;
    }
    if (r[0] === ".") {
      if (r[1] === ".") {
        if (r[2] === "/") {
          r = r.slice(3);
          continue;
        }
      } else if (r[1] === "/") {
        r = r.slice(2);
        continue;
      }
    } else if (r[0] === "/" && r[1] === ".") {
      if (r[2] === "/") {
        r = r.slice(2);
        continue;
      } else if (r[2] === "." && r[3] === "/") {
        r = r.slice(3), n.length !== 0 && n.pop();
        continue;
      }
    }
    if ((s = r.indexOf("/", 1)) === -1) {
      n.push(r);
      break;
    } else
      n.push(r.slice(0, s)), r = r.slice(s);
  }
  return n.join("");
}
function normalizeComponentEncoding$1(e, r) {
  const n = r !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = n(e.scheme)), e.userinfo !== void 0 && (e.userinfo = n(e.userinfo)), e.host !== void 0 && (e.host = n(e.host)), e.path !== void 0 && (e.path = n(e.path)), e.query !== void 0 && (e.query = n(e.query)), e.fragment !== void 0 && (e.fragment = n(e.fragment)), e;
}
function recomposeAuthority$1(e) {
  const r = [];
  if (e.userinfo !== void 0 && (r.push(e.userinfo), r.push("@")), e.host !== void 0) {
    let n = unescape(e.host);
    if (!isIPv4$1(n)) {
      const s = normalizeIPv6$1(n);
      s.isIPV6 === !0 ? n = `[${s.escapedHost}]` : n = e.host;
    }
    r.push(n);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (r.push(":"), r.push(String(e.port))), r.length ? r.join("") : void 0;
}
var utils$a = {
  nonSimpleDomain: nonSimpleDomain$1,
  recomposeAuthority: recomposeAuthority$1,
  normalizeComponentEncoding: normalizeComponentEncoding$1,
  removeDotSegments: removeDotSegments$1,
  isIPv4: isIPv4$1,
  isUUID: isUUID$1,
  normalizeIPv6: normalizeIPv6$1
};
const { isUUID } = utils$a, URN_REG = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function wsIsSecure(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function httpParse(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function httpSerialize(e) {
  const r = String(e.scheme).toLowerCase() === "https";
  return (e.port === (r ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function wsParse(e) {
  return e.secure = wsIsSecure(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function wsSerialize(e) {
  if ((e.port === (wsIsSecure(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [r, n] = e.resourceName.split("?");
    e.path = r && r !== "/" ? r : void 0, e.query = n, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function urnParse(e, r) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const n = e.path.match(URN_REG);
  if (n) {
    const s = r.scheme || e.scheme || "urn";
    e.nid = n[1].toLowerCase(), e.nss = n[2];
    const o = `${s}:${r.nid || e.nid}`, a = getSchemeHandler$1(o);
    e.path = void 0, a && (e = a.parse(e, r));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function urnSerialize(e, r) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const n = r.scheme || e.scheme || "urn", s = e.nid.toLowerCase(), o = `${n}:${r.nid || s}`, a = getSchemeHandler$1(o);
  a && (e = a.serialize(e, r));
  const c = e, d = e.nss;
  return c.path = `${s || r.nid}:${d}`, r.skipEscape = !0, c;
}
function urnuuidParse(e, r) {
  const n = e;
  return n.uuid = n.nss, n.nss = void 0, !r.tolerant && (!n.uuid || !isUUID(n.uuid)) && (n.error = n.error || "UUID is not valid."), n;
}
function urnuuidSerialize(e) {
  const r = e;
  return r.nss = (e.uuid || "").toLowerCase(), r;
}
const http = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: httpParse,
    serialize: httpSerialize
  }
), https = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: http.domainHost,
    parse: httpParse,
    serialize: httpSerialize
  }
), ws = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: wsParse,
    serialize: wsSerialize
  }
), wss = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: ws.domainHost,
    parse: ws.parse,
    serialize: ws.serialize
  }
), urn = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: urnParse,
    serialize: urnSerialize,
    skipNormalize: !0
  }
), urnuuid = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: urnuuidParse,
    serialize: urnuuidSerialize,
    skipNormalize: !0
  }
), SCHEMES$1 = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http,
    https,
    ws,
    wss,
    urn,
    "urn:uuid": urnuuid
  }
);
Object.setPrototypeOf(SCHEMES$1, null);
function getSchemeHandler$1(e) {
  return e && (SCHEMES$1[
    /** @type {SchemeName} */
    e
  ] || SCHEMES$1[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var schemes = {
  SCHEMES: SCHEMES$1,
  getSchemeHandler: getSchemeHandler$1
};
const { normalizeIPv6, removeDotSegments, recomposeAuthority, normalizeComponentEncoding, isIPv4, nonSimpleDomain } = utils$a, { SCHEMES, getSchemeHandler } = schemes;
function normalize(e, r) {
  return typeof e == "string" ? e = /** @type {T} */
  serialize(parse$8(e, r), r) : typeof e == "object" && (e = /** @type {T} */
  parse$8(serialize(e, r), r)), e;
}
function resolve$2(e, r, n) {
  const s = n ? Object.assign({ scheme: "null" }, n) : { scheme: "null" }, o = resolveComponent(parse$8(e, s), parse$8(r, s), s, !0);
  return s.skipEscape = !0, serialize(o, s);
}
function resolveComponent(e, r, n, s) {
  const o = {};
  return s || (e = parse$8(serialize(e, n), n), r = parse$8(serialize(r, n), n)), n = n || {}, !n.tolerant && r.scheme ? (o.scheme = r.scheme, o.userinfo = r.userinfo, o.host = r.host, o.port = r.port, o.path = removeDotSegments(r.path || ""), o.query = r.query) : (r.userinfo !== void 0 || r.host !== void 0 || r.port !== void 0 ? (o.userinfo = r.userinfo, o.host = r.host, o.port = r.port, o.path = removeDotSegments(r.path || ""), o.query = r.query) : (r.path ? (r.path[0] === "/" ? o.path = removeDotSegments(r.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? o.path = "/" + r.path : e.path ? o.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + r.path : o.path = r.path, o.path = removeDotSegments(o.path)), o.query = r.query) : (o.path = e.path, r.query !== void 0 ? o.query = r.query : o.query = e.query), o.userinfo = e.userinfo, o.host = e.host, o.port = e.port), o.scheme = e.scheme), o.fragment = r.fragment, o;
}
function equal$5(e, r, n) {
  return typeof e == "string" ? (e = unescape(e), e = serialize(normalizeComponentEncoding(parse$8(e, n), !0), { ...n, skipEscape: !0 })) : typeof e == "object" && (e = serialize(normalizeComponentEncoding(e, !0), { ...n, skipEscape: !0 })), typeof r == "string" ? (r = unescape(r), r = serialize(normalizeComponentEncoding(parse$8(r, n), !0), { ...n, skipEscape: !0 })) : typeof r == "object" && (r = serialize(normalizeComponentEncoding(r, !0), { ...n, skipEscape: !0 })), e.toLowerCase() === r.toLowerCase();
}
function serialize(e, r) {
  const n = {
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
  }, s = Object.assign({}, r), o = [], a = getSchemeHandler(s.scheme || n.scheme);
  a && a.serialize && a.serialize(n, s), n.path !== void 0 && (s.skipEscape ? n.path = unescape(n.path) : (n.path = escape(n.path), n.scheme !== void 0 && (n.path = n.path.split("%3A").join(":")))), s.reference !== "suffix" && n.scheme && o.push(n.scheme, ":");
  const c = recomposeAuthority(n);
  if (c !== void 0 && (s.reference !== "suffix" && o.push("//"), o.push(c), n.path && n.path[0] !== "/" && o.push("/")), n.path !== void 0) {
    let d = n.path;
    !s.absolutePath && (!a || !a.absolutePath) && (d = removeDotSegments(d)), c === void 0 && d[0] === "/" && d[1] === "/" && (d = "/%2F" + d.slice(2)), o.push(d);
  }
  return n.query !== void 0 && o.push("?", n.query), n.fragment !== void 0 && o.push("#", n.fragment), o.join("");
}
const URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function parse$8(e, r) {
  const n = Object.assign({}, r), s = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  };
  let o = !1;
  n.reference === "suffix" && (n.scheme ? e = n.scheme + ":" + e : e = "//" + e);
  const a = e.match(URI_PARSE);
  if (a) {
    if (s.scheme = a[1], s.userinfo = a[3], s.host = a[4], s.port = parseInt(a[5], 10), s.path = a[6] || "", s.query = a[7], s.fragment = a[8], isNaN(s.port) && (s.port = a[5]), s.host)
      if (isIPv4(s.host) === !1) {
        const l = normalizeIPv6(s.host);
        s.host = l.host.toLowerCase(), o = l.isIPV6;
      } else
        o = !0;
    s.scheme === void 0 && s.userinfo === void 0 && s.host === void 0 && s.port === void 0 && s.query === void 0 && !s.path ? s.reference = "same-document" : s.scheme === void 0 ? s.reference = "relative" : s.fragment === void 0 ? s.reference = "absolute" : s.reference = "uri", n.reference && n.reference !== "suffix" && n.reference !== s.reference && (s.error = s.error || "URI is not a " + n.reference + " reference.");
    const c = getSchemeHandler(n.scheme || s.scheme);
    if (!n.unicodeSupport && (!c || !c.unicodeSupport) && s.host && (n.domainHost || c && c.domainHost) && o === !1 && nonSimpleDomain(s.host))
      try {
        s.host = URL.domainToASCII(s.host.toLowerCase());
      } catch (d) {
        s.error = s.error || "Host's domain name can not be converted to ASCII: " + d;
      }
    (!c || c && !c.skipNormalize) && (e.indexOf("%") !== -1 && (s.scheme !== void 0 && (s.scheme = unescape(s.scheme)), s.host !== void 0 && (s.host = unescape(s.host))), s.path && (s.path = escape(unescape(s.path))), s.fragment && (s.fragment = encodeURI(decodeURIComponent(s.fragment)))), c && c.parse && c.parse(s, n);
  } else
    s.error = s.error || "URI can not be parsed.";
  return s;
}
const fastUri = {
  SCHEMES,
  normalize,
  resolve: resolve$2,
  resolveComponent,
  equal: equal$5,
  serialize,
  parse: parse$8
};
fastUri$1.exports = fastUri;
fastUri$1.exports.default = fastUri;
fastUri$1.exports.fastUri = fastUri;
var fastUriExports = fastUri$1.exports;
Object.defineProperty(uri$3, "__esModule", { value: !0 });
const uri$2 = fastUriExports;
uri$2.code = 'require("ajv/dist/runtime/uri").default';
uri$3.default = uri$2;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var r = validate$1;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return r.KeywordCxt;
  } });
  var n = codegen$1;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return n.CodeGen;
  } });
  const s = validation_error$1, o = ref_error$1, a = rules$1, c = compile$1, d = codegen$1, l = resolve$4, u = dataType$1, h = util$1, p = require$$9$1, g = uri$3, y = (T, v) => new RegExp(T, v);
  y.code = "new RegExp";
  const w = ["removeAdditional", "useDefaults", "coerceTypes"], E = /* @__PURE__ */ new Set([
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
  ]), m = {
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
  }, _ = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, S = 200;
  function O(T) {
    var v, P, b, f, $, R, k, D, H, U, X, Q, W, te, oe, ae, ue, de, fe, Z, ye, ve, Ee, we, be;
    const ce = T.strict, Se = (v = T.code) === null || v === void 0 ? void 0 : v.optimize, Ne = Se === !0 || Se === void 0 ? 1 : Se || 0, Ie = (b = (P = T.code) === null || P === void 0 ? void 0 : P.regExp) !== null && b !== void 0 ? b : y, Ce = (f = T.uriResolver) !== null && f !== void 0 ? f : g.default;
    return {
      strictSchema: (R = ($ = T.strictSchema) !== null && $ !== void 0 ? $ : ce) !== null && R !== void 0 ? R : !0,
      strictNumbers: (D = (k = T.strictNumbers) !== null && k !== void 0 ? k : ce) !== null && D !== void 0 ? D : !0,
      strictTypes: (U = (H = T.strictTypes) !== null && H !== void 0 ? H : ce) !== null && U !== void 0 ? U : "log",
      strictTuples: (Q = (X = T.strictTuples) !== null && X !== void 0 ? X : ce) !== null && Q !== void 0 ? Q : "log",
      strictRequired: (te = (W = T.strictRequired) !== null && W !== void 0 ? W : ce) !== null && te !== void 0 ? te : !1,
      code: T.code ? { ...T.code, optimize: Ne, regExp: Ie } : { optimize: Ne, regExp: Ie },
      loopRequired: (oe = T.loopRequired) !== null && oe !== void 0 ? oe : S,
      loopEnum: (ae = T.loopEnum) !== null && ae !== void 0 ? ae : S,
      meta: (ue = T.meta) !== null && ue !== void 0 ? ue : !0,
      messages: (de = T.messages) !== null && de !== void 0 ? de : !0,
      inlineRefs: (fe = T.inlineRefs) !== null && fe !== void 0 ? fe : !0,
      schemaId: (Z = T.schemaId) !== null && Z !== void 0 ? Z : "$id",
      addUsedSchema: (ye = T.addUsedSchema) !== null && ye !== void 0 ? ye : !0,
      validateSchema: (ve = T.validateSchema) !== null && ve !== void 0 ? ve : !0,
      validateFormats: (Ee = T.validateFormats) !== null && Ee !== void 0 ? Ee : !0,
      unicodeRegExp: (we = T.unicodeRegExp) !== null && we !== void 0 ? we : !0,
      int32range: (be = T.int32range) !== null && be !== void 0 ? be : !0,
      uriResolver: Ce
    };
  }
  class I {
    constructor(v = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), v = this.opts = { ...v, ...O(v) };
      const { es5: P, lines: b } = this.opts.code;
      this.scope = new d.ValueScope({ scope: {}, prefixes: E, es5: P, lines: b }), this.logger = V(v.logger);
      const f = v.validateFormats;
      v.validateFormats = !1, this.RULES = (0, a.getRules)(), A.call(this, m, v, "NOT SUPPORTED"), A.call(this, _, v, "DEPRECATED", "warn"), this._metaOpts = J.call(this), v.formats && x.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), v.keywords && Y.call(this, v.keywords), typeof v.meta == "object" && this.addMetaSchema(v.meta), z.call(this), v.validateFormats = f;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: v, meta: P, schemaId: b } = this.opts;
      let f = p;
      b === "id" && (f = { ...p }, f.id = f.$id, delete f.$id), P && v && this.addMetaSchema(f, f[b], !1);
    }
    defaultMeta() {
      const { meta: v, schemaId: P } = this.opts;
      return this.opts.defaultMeta = typeof v == "object" ? v[P] || v : void 0;
    }
    validate(v, P) {
      let b;
      if (typeof v == "string") {
        if (b = this.getSchema(v), !b)
          throw new Error(`no schema with key or ref "${v}"`);
      } else
        b = this.compile(v);
      const f = b(P);
      return "$async" in b || (this.errors = b.errors), f;
    }
    compile(v, P) {
      const b = this._addSchema(v, P);
      return b.validate || this._compileSchemaEnv(b);
    }
    compileAsync(v, P) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: b } = this.opts;
      return f.call(this, v, P);
      async function f(U, X) {
        await $.call(this, U.$schema);
        const Q = this._addSchema(U, X);
        return Q.validate || R.call(this, Q);
      }
      async function $(U) {
        U && !this.getSchema(U) && await f.call(this, { $ref: U }, !0);
      }
      async function R(U) {
        try {
          return this._compileSchemaEnv(U);
        } catch (X) {
          if (!(X instanceof o.default))
            throw X;
          return k.call(this, X), await D.call(this, X.missingSchema), R.call(this, U);
        }
      }
      function k({ missingSchema: U, missingRef: X }) {
        if (this.refs[U])
          throw new Error(`AnySchema ${U} is loaded but ${X} cannot be resolved`);
      }
      async function D(U) {
        const X = await H.call(this, U);
        this.refs[U] || await $.call(this, X.$schema), this.refs[U] || this.addSchema(X, U, P);
      }
      async function H(U) {
        const X = this._loading[U];
        if (X)
          return X;
        try {
          return await (this._loading[U] = b(U));
        } finally {
          delete this._loading[U];
        }
      }
    }
    // Adds schema to the instance
    addSchema(v, P, b, f = this.opts.validateSchema) {
      if (Array.isArray(v)) {
        for (const R of v)
          this.addSchema(R, void 0, b, f);
        return this;
      }
      let $;
      if (typeof v == "object") {
        const { schemaId: R } = this.opts;
        if ($ = v[R], $ !== void 0 && typeof $ != "string")
          throw new Error(`schema ${R} must be string`);
      }
      return P = (0, l.normalizeId)(P || $), this._checkUnique(P), this.schemas[P] = this._addSchema(v, b, P, f, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(v, P, b = this.opts.validateSchema) {
      return this.addSchema(v, P, !0, b), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(v, P) {
      if (typeof v == "boolean")
        return !0;
      let b;
      if (b = v.$schema, b !== void 0 && typeof b != "string")
        throw new Error("$schema must be a string");
      if (b = b || this.opts.defaultMeta || this.defaultMeta(), !b)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const f = this.validate(b, v);
      if (!f && P) {
        const $ = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error($);
        else
          throw new Error($);
      }
      return f;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(v) {
      let P;
      for (; typeof (P = F.call(this, v)) == "string"; )
        v = P;
      if (P === void 0) {
        const { schemaId: b } = this.opts, f = new c.SchemaEnv({ schema: {}, schemaId: b });
        if (P = c.resolveSchema.call(this, f, v), !P)
          return;
        this.refs[v] = P;
      }
      return P.validate || this._compileSchemaEnv(P);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(v) {
      if (v instanceof RegExp)
        return this._removeAllSchemas(this.schemas, v), this._removeAllSchemas(this.refs, v), this;
      switch (typeof v) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const P = F.call(this, v);
          return typeof P == "object" && this._cache.delete(P.schema), delete this.schemas[v], delete this.refs[v], this;
        }
        case "object": {
          const P = v;
          this._cache.delete(P);
          let b = v[this.opts.schemaId];
          return b && (b = (0, l.normalizeId)(b), delete this.schemas[b], delete this.refs[b]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(v) {
      for (const P of v)
        this.addKeyword(P);
      return this;
    }
    addKeyword(v, P) {
      let b;
      if (typeof v == "string")
        b = v, typeof P == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), P.keyword = b);
      else if (typeof v == "object" && P === void 0) {
        if (P = v, b = P.keyword, Array.isArray(b) && !b.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (M.call(this, b, P), !P)
        return (0, h.eachItem)(b, ($) => L.call(this, $)), this;
      C.call(this, P);
      const f = {
        ...P,
        type: (0, u.getJSONTypes)(P.type),
        schemaType: (0, u.getJSONTypes)(P.schemaType)
      };
      return (0, h.eachItem)(b, f.type.length === 0 ? ($) => L.call(this, $, f) : ($) => f.type.forEach((R) => L.call(this, $, f, R))), this;
    }
    getKeyword(v) {
      const P = this.RULES.all[v];
      return typeof P == "object" ? P.definition : !!P;
    }
    // Remove keyword
    removeKeyword(v) {
      const { RULES: P } = this;
      delete P.keywords[v], delete P.all[v];
      for (const b of P.rules) {
        const f = b.rules.findIndex(($) => $.keyword === v);
        f >= 0 && b.rules.splice(f, 1);
      }
      return this;
    }
    // Add format
    addFormat(v, P) {
      return typeof P == "string" && (P = new RegExp(P)), this.formats[v] = P, this;
    }
    errorsText(v = this.errors, { separator: P = ", ", dataVar: b = "data" } = {}) {
      return !v || v.length === 0 ? "No errors" : v.map((f) => `${b}${f.instancePath} ${f.message}`).reduce((f, $) => f + P + $);
    }
    $dataMetaSchema(v, P) {
      const b = this.RULES.all;
      v = JSON.parse(JSON.stringify(v));
      for (const f of P) {
        const $ = f.split("/").slice(1);
        let R = v;
        for (const k of $)
          R = R[k];
        for (const k in b) {
          const D = b[k];
          if (typeof D != "object")
            continue;
          const { $data: H } = D.definition, U = R[k];
          H && U && (R[k] = q(U));
        }
      }
      return v;
    }
    _removeAllSchemas(v, P) {
      for (const b in v) {
        const f = v[b];
        (!P || P.test(b)) && (typeof f == "string" ? delete v[b] : f && !f.meta && (this._cache.delete(f.schema), delete v[b]));
      }
    }
    _addSchema(v, P, b, f = this.opts.validateSchema, $ = this.opts.addUsedSchema) {
      let R;
      const { schemaId: k } = this.opts;
      if (typeof v == "object")
        R = v[k];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof v != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let D = this._cache.get(v);
      if (D !== void 0)
        return D;
      b = (0, l.normalizeId)(R || b);
      const H = l.getSchemaRefs.call(this, v, b);
      return D = new c.SchemaEnv({ schema: v, schemaId: k, meta: P, baseId: b, localRefs: H }), this._cache.set(D.schema, D), $ && !b.startsWith("#") && (b && this._checkUnique(b), this.refs[b] = D), f && this.validateSchema(v, !0), D;
    }
    _checkUnique(v) {
      if (this.schemas[v] || this.refs[v])
        throw new Error(`schema with key or id "${v}" already exists`);
    }
    _compileSchemaEnv(v) {
      if (v.meta ? this._compileMetaSchema(v) : c.compileSchema.call(this, v), !v.validate)
        throw new Error("ajv implementation error");
      return v.validate;
    }
    _compileMetaSchema(v) {
      const P = this.opts;
      this.opts = this._metaOpts;
      try {
        c.compileSchema.call(this, v);
      } finally {
        this.opts = P;
      }
    }
  }
  I.ValidationError = s.default, I.MissingRefError = o.default, e.default = I;
  function A(T, v, P, b = "error") {
    for (const f in T) {
      const $ = f;
      $ in v && this.logger[b](`${P}: option ${f}. ${T[$]}`);
    }
  }
  function F(T) {
    return T = (0, l.normalizeId)(T), this.schemas[T] || this.refs[T];
  }
  function z() {
    const T = this.opts.schemas;
    if (T)
      if (Array.isArray(T))
        this.addSchema(T);
      else
        for (const v in T)
          this.addSchema(T[v], v);
  }
  function x() {
    for (const T in this.opts.formats) {
      const v = this.opts.formats[T];
      v && this.addFormat(T, v);
    }
  }
  function Y(T) {
    if (Array.isArray(T)) {
      this.addVocabulary(T);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const v in T) {
      const P = T[v];
      P.keyword || (P.keyword = v), this.addKeyword(P);
    }
  }
  function J() {
    const T = { ...this.opts };
    for (const v of w)
      delete T[v];
    return T;
  }
  const K = { log() {
  }, warn() {
  }, error() {
  } };
  function V(T) {
    if (T === !1)
      return K;
    if (T === void 0)
      return console;
    if (T.log && T.warn && T.error)
      return T;
    throw new Error("logger must implement log, warn and error methods");
  }
  const G = /^[a-z_$][a-z0-9_$:-]*$/i;
  function M(T, v) {
    const { RULES: P } = this;
    if ((0, h.eachItem)(T, (b) => {
      if (P.keywords[b])
        throw new Error(`Keyword ${b} is already defined`);
      if (!G.test(b))
        throw new Error(`Keyword ${b} has invalid name`);
    }), !!v && v.$data && !("code" in v || "validate" in v))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function L(T, v, P) {
    var b;
    const f = v == null ? void 0 : v.post;
    if (P && f)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: $ } = this;
    let R = f ? $.post : $.rules.find(({ type: D }) => D === P);
    if (R || (R = { type: P, rules: [] }, $.rules.push(R)), $.keywords[T] = !0, !v)
      return;
    const k = {
      keyword: T,
      definition: {
        ...v,
        type: (0, u.getJSONTypes)(v.type),
        schemaType: (0, u.getJSONTypes)(v.schemaType)
      }
    };
    v.before ? N.call(this, R, k, v.before) : R.rules.push(k), $.all[T] = k, (b = v.implements) === null || b === void 0 || b.forEach((D) => this.addKeyword(D));
  }
  function N(T, v, P) {
    const b = T.rules.findIndex((f) => f.keyword === P);
    b >= 0 ? T.rules.splice(b, 0, v) : (T.rules.push(v), this.logger.warn(`rule ${P} is not defined`));
  }
  function C(T) {
    let { metaSchema: v } = T;
    v !== void 0 && (T.$data && this.opts.$data && (v = q(v)), T.validateSchema = this.compile(v, !0));
  }
  const j = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function q(T) {
    return { anyOf: [T, j] };
  }
})(core$6);
var draft2020 = {}, core$5 = {}, id$1 = {};
Object.defineProperty(id$1, "__esModule", { value: !0 });
const def$12 = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
id$1.default = def$12;
var ref$1 = {};
Object.defineProperty(ref$1, "__esModule", { value: !0 });
ref$1.callRef = ref$1.getValidate = void 0;
const ref_error_1$3 = ref_error$1, code_1$j = code$2, codegen_1$V = codegen$1, names_1$b = names$3, compile_1$4 = compile$1, util_1$Q = util$1, def$11 = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: r, schema: n, it: s } = e, { baseId: o, schemaEnv: a, validateName: c, opts: d, self: l } = s, { root: u } = a;
    if ((n === "#" || n === "#/") && o === u.baseId)
      return p();
    const h = compile_1$4.resolveRef.call(l, u, o, n);
    if (h === void 0)
      throw new ref_error_1$3.default(s.opts.uriResolver, o, n);
    if (h instanceof compile_1$4.SchemaEnv)
      return g(h);
    return y(h);
    function p() {
      if (a === u)
        return callRef$1(e, c, a, a.$async);
      const w = r.scopeValue("root", { ref: u });
      return callRef$1(e, (0, codegen_1$V._)`${w}.validate`, u, u.$async);
    }
    function g(w) {
      const E = getValidate$1(e, w);
      callRef$1(e, E, w, w.$async);
    }
    function y(w) {
      const E = r.scopeValue("schema", d.code.source === !0 ? { ref: w, code: (0, codegen_1$V.stringify)(w) } : { ref: w }), m = r.name("valid"), _ = e.subschema({
        schema: w,
        dataTypes: [],
        schemaPath: codegen_1$V.nil,
        topSchemaRef: E,
        errSchemaPath: n
      }, m);
      e.mergeEvaluated(_), e.ok(m);
    }
  }
};
function getValidate$1(e, r) {
  const { gen: n } = e;
  return r.validate ? n.scopeValue("validate", { ref: r.validate }) : (0, codegen_1$V._)`${n.scopeValue("wrapper", { ref: r })}.validate`;
}
ref$1.getValidate = getValidate$1;
function callRef$1(e, r, n, s) {
  const { gen: o, it: a } = e, { allErrors: c, schemaEnv: d, opts: l } = a, u = l.passContext ? names_1$b.default.this : codegen_1$V.nil;
  s ? h() : p();
  function h() {
    if (!d.$async)
      throw new Error("async schema referenced by sync schema");
    const w = o.let("valid");
    o.try(() => {
      o.code((0, codegen_1$V._)`await ${(0, code_1$j.callValidateCode)(e, r, u)}`), y(r), c || o.assign(w, !0);
    }, (E) => {
      o.if((0, codegen_1$V._)`!(${E} instanceof ${a.ValidationError})`, () => o.throw(E)), g(E), c || o.assign(w, !1);
    }), e.ok(w);
  }
  function p() {
    e.result((0, code_1$j.callValidateCode)(e, r, u), () => y(r), () => g(r));
  }
  function g(w) {
    const E = (0, codegen_1$V._)`${w}.errors`;
    o.assign(names_1$b.default.vErrors, (0, codegen_1$V._)`${names_1$b.default.vErrors} === null ? ${E} : ${names_1$b.default.vErrors}.concat(${E})`), o.assign(names_1$b.default.errors, (0, codegen_1$V._)`${names_1$b.default.vErrors}.length`);
  }
  function y(w) {
    var E;
    if (!a.opts.unevaluated)
      return;
    const m = (E = n == null ? void 0 : n.validate) === null || E === void 0 ? void 0 : E.evaluated;
    if (a.props !== !0)
      if (m && !m.dynamicProps)
        m.props !== void 0 && (a.props = util_1$Q.mergeEvaluated.props(o, m.props, a.props));
      else {
        const _ = o.var("props", (0, codegen_1$V._)`${w}.evaluated.props`);
        a.props = util_1$Q.mergeEvaluated.props(o, _, a.props, codegen_1$V.Name);
      }
    if (a.items !== !0)
      if (m && !m.dynamicItems)
        m.items !== void 0 && (a.items = util_1$Q.mergeEvaluated.items(o, m.items, a.items));
      else {
        const _ = o.var("items", (0, codegen_1$V._)`${w}.evaluated.items`);
        a.items = util_1$Q.mergeEvaluated.items(o, _, a.items, codegen_1$V.Name);
      }
  }
}
ref$1.callRef = callRef$1;
ref$1.default = def$11;
Object.defineProperty(core$5, "__esModule", { value: !0 });
const id_1$1 = id$1, ref_1$3 = ref$1, core$4 = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  id_1$1.default,
  ref_1$3.default
];
core$5.default = core$4;
var validation$4 = {}, limitNumber$1 = {};
Object.defineProperty(limitNumber$1, "__esModule", { value: !0 });
const codegen_1$U = codegen$1, ops$1 = codegen_1$U.operators, KWDs$1 = {
  maximum: { okStr: "<=", ok: ops$1.LTE, fail: ops$1.GT },
  minimum: { okStr: ">=", ok: ops$1.GTE, fail: ops$1.LT },
  exclusiveMaximum: { okStr: "<", ok: ops$1.LT, fail: ops$1.GTE },
  exclusiveMinimum: { okStr: ">", ok: ops$1.GT, fail: ops$1.LTE }
}, error$D = {
  message: ({ keyword: e, schemaCode: r }) => (0, codegen_1$U.str)`must be ${KWDs$1[e].okStr} ${r}`,
  params: ({ keyword: e, schemaCode: r }) => (0, codegen_1$U._)`{comparison: ${KWDs$1[e].okStr}, limit: ${r}}`
}, def$10 = {
  keyword: Object.keys(KWDs$1),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: error$D,
  code(e) {
    const { keyword: r, data: n, schemaCode: s } = e;
    e.fail$data((0, codegen_1$U._)`${n} ${KWDs$1[r].fail} ${s} || isNaN(${n})`);
  }
};
limitNumber$1.default = def$10;
var multipleOf$1 = {};
Object.defineProperty(multipleOf$1, "__esModule", { value: !0 });
const codegen_1$T = codegen$1, error$C = {
  message: ({ schemaCode: e }) => (0, codegen_1$T.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, codegen_1$T._)`{multipleOf: ${e}}`
}, def$$ = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: error$C,
  code(e) {
    const { gen: r, data: n, schemaCode: s, it: o } = e, a = o.opts.multipleOfPrecision, c = r.let("res"), d = a ? (0, codegen_1$T._)`Math.abs(Math.round(${c}) - ${c}) > 1e-${a}` : (0, codegen_1$T._)`${c} !== parseInt(${c})`;
    e.fail$data((0, codegen_1$T._)`(${s} === 0 || (${c} = ${n}/${s}, ${d}))`);
  }
};
multipleOf$1.default = def$$;
var limitLength$1 = {}, ucs2length$3 = {};
Object.defineProperty(ucs2length$3, "__esModule", { value: !0 });
function ucs2length$2(e) {
  const r = e.length;
  let n = 0, s = 0, o;
  for (; s < r; )
    n++, o = e.charCodeAt(s++), o >= 55296 && o <= 56319 && s < r && (o = e.charCodeAt(s), (o & 64512) === 56320 && s++);
  return n;
}
ucs2length$3.default = ucs2length$2;
ucs2length$2.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(limitLength$1, "__esModule", { value: !0 });
const codegen_1$S = codegen$1, util_1$P = util$1, ucs2length_1$1 = ucs2length$3, error$B = {
  message({ keyword: e, schemaCode: r }) {
    const n = e === "maxLength" ? "more" : "fewer";
    return (0, codegen_1$S.str)`must NOT have ${n} than ${r} characters`;
  },
  params: ({ schemaCode: e }) => (0, codegen_1$S._)`{limit: ${e}}`
}, def$_ = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: error$B,
  code(e) {
    const { keyword: r, data: n, schemaCode: s, it: o } = e, a = r === "maxLength" ? codegen_1$S.operators.GT : codegen_1$S.operators.LT, c = o.opts.unicode === !1 ? (0, codegen_1$S._)`${n}.length` : (0, codegen_1$S._)`${(0, util_1$P.useFunc)(e.gen, ucs2length_1$1.default)}(${n})`;
    e.fail$data((0, codegen_1$S._)`${c} ${a} ${s}`);
  }
};
limitLength$1.default = def$_;
var pattern$1 = {};
Object.defineProperty(pattern$1, "__esModule", { value: !0 });
const code_1$i = code$2, util_1$O = util$1, codegen_1$R = codegen$1, error$A = {
  message: ({ schemaCode: e }) => (0, codegen_1$R.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, codegen_1$R._)`{pattern: ${e}}`
}, def$Z = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: error$A,
  code(e) {
    const { gen: r, data: n, $data: s, schema: o, schemaCode: a, it: c } = e, d = c.opts.unicodeRegExp ? "u" : "";
    if (s) {
      const { regExp: l } = c.opts.code, u = l.code === "new RegExp" ? (0, codegen_1$R._)`new RegExp` : (0, util_1$O.useFunc)(r, l), h = r.let("valid");
      r.try(() => r.assign(h, (0, codegen_1$R._)`${u}(${a}, ${d}).test(${n})`), () => r.assign(h, !1)), e.fail$data((0, codegen_1$R._)`!${h}`);
    } else {
      const l = (0, code_1$i.usePattern)(e, o);
      e.fail$data((0, codegen_1$R._)`!${l}.test(${n})`);
    }
  }
};
pattern$1.default = def$Z;
var limitProperties$1 = {};
Object.defineProperty(limitProperties$1, "__esModule", { value: !0 });
const codegen_1$Q = codegen$1, error$z = {
  message({ keyword: e, schemaCode: r }) {
    const n = e === "maxProperties" ? "more" : "fewer";
    return (0, codegen_1$Q.str)`must NOT have ${n} than ${r} properties`;
  },
  params: ({ schemaCode: e }) => (0, codegen_1$Q._)`{limit: ${e}}`
}, def$Y = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: error$z,
  code(e) {
    const { keyword: r, data: n, schemaCode: s } = e, o = r === "maxProperties" ? codegen_1$Q.operators.GT : codegen_1$Q.operators.LT;
    e.fail$data((0, codegen_1$Q._)`Object.keys(${n}).length ${o} ${s}`);
  }
};
limitProperties$1.default = def$Y;
var required$2 = {};
Object.defineProperty(required$2, "__esModule", { value: !0 });
const code_1$h = code$2, codegen_1$P = codegen$1, util_1$N = util$1, error$y = {
  message: ({ params: { missingProperty: e } }) => (0, codegen_1$P.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, codegen_1$P._)`{missingProperty: ${e}}`
}, def$X = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: error$y,
  code(e) {
    const { gen: r, schema: n, schemaCode: s, data: o, $data: a, it: c } = e, { opts: d } = c;
    if (!a && n.length === 0)
      return;
    const l = n.length >= d.loopRequired;
    if (c.allErrors ? u() : h(), d.strictRequired) {
      const y = e.parentSchema.properties, { definedProperties: w } = e.it;
      for (const E of n)
        if ((y == null ? void 0 : y[E]) === void 0 && !w.has(E)) {
          const m = c.schemaEnv.baseId + c.errSchemaPath, _ = `required property "${E}" is not defined at "${m}" (strictRequired)`;
          (0, util_1$N.checkStrictMode)(c, _, c.opts.strictRequired);
        }
    }
    function u() {
      if (l || a)
        e.block$data(codegen_1$P.nil, p);
      else
        for (const y of n)
          (0, code_1$h.checkReportMissingProp)(e, y);
    }
    function h() {
      const y = r.let("missing");
      if (l || a) {
        const w = r.let("valid", !0);
        e.block$data(w, () => g(y, w)), e.ok(w);
      } else
        r.if((0, code_1$h.checkMissingProp)(e, n, y)), (0, code_1$h.reportMissingProp)(e, y), r.else();
    }
    function p() {
      r.forOf("prop", s, (y) => {
        e.setParams({ missingProperty: y }), r.if((0, code_1$h.noPropertyInData)(r, o, y, d.ownProperties), () => e.error());
      });
    }
    function g(y, w) {
      e.setParams({ missingProperty: y }), r.forOf(y, s, () => {
        r.assign(w, (0, code_1$h.propertyInData)(r, o, y, d.ownProperties)), r.if((0, codegen_1$P.not)(w), () => {
          e.error(), r.break();
        });
      }, codegen_1$P.nil);
    }
  }
};
required$2.default = def$X;
var limitItems$1 = {};
Object.defineProperty(limitItems$1, "__esModule", { value: !0 });
const codegen_1$O = codegen$1, error$x = {
  message({ keyword: e, schemaCode: r }) {
    const n = e === "maxItems" ? "more" : "fewer";
    return (0, codegen_1$O.str)`must NOT have ${n} than ${r} items`;
  },
  params: ({ schemaCode: e }) => (0, codegen_1$O._)`{limit: ${e}}`
}, def$W = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: error$x,
  code(e) {
    const { keyword: r, data: n, schemaCode: s } = e, o = r === "maxItems" ? codegen_1$O.operators.GT : codegen_1$O.operators.LT;
    e.fail$data((0, codegen_1$O._)`${n}.length ${o} ${s}`);
  }
};
limitItems$1.default = def$W;
var uniqueItems$1 = {}, equal$4 = {};
Object.defineProperty(equal$4, "__esModule", { value: !0 });
const equal$3 = fastDeepEqual;
equal$3.code = 'require("ajv/dist/runtime/equal").default';
equal$4.default = equal$3;
Object.defineProperty(uniqueItems$1, "__esModule", { value: !0 });
const dataType_1$2 = dataType$1, codegen_1$N = codegen$1, util_1$M = util$1, equal_1$5 = equal$4, error$w = {
  message: ({ params: { i: e, j: r } }) => (0, codegen_1$N.str)`must NOT have duplicate items (items ## ${r} and ${e} are identical)`,
  params: ({ params: { i: e, j: r } }) => (0, codegen_1$N._)`{i: ${e}, j: ${r}}`
}, def$V = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: error$w,
  code(e) {
    const { gen: r, data: n, $data: s, schema: o, parentSchema: a, schemaCode: c, it: d } = e;
    if (!s && !o)
      return;
    const l = r.let("valid"), u = a.items ? (0, dataType_1$2.getSchemaTypes)(a.items) : [];
    e.block$data(l, h, (0, codegen_1$N._)`${c} === false`), e.ok(l);
    function h() {
      const w = r.let("i", (0, codegen_1$N._)`${n}.length`), E = r.let("j");
      e.setParams({ i: w, j: E }), r.assign(l, !0), r.if((0, codegen_1$N._)`${w} > 1`, () => (p() ? g : y)(w, E));
    }
    function p() {
      return u.length > 0 && !u.some((w) => w === "object" || w === "array");
    }
    function g(w, E) {
      const m = r.name("item"), _ = (0, dataType_1$2.checkDataTypes)(u, m, d.opts.strictNumbers, dataType_1$2.DataType.Wrong), S = r.const("indices", (0, codegen_1$N._)`{}`);
      r.for((0, codegen_1$N._)`;${w}--;`, () => {
        r.let(m, (0, codegen_1$N._)`${n}[${w}]`), r.if(_, (0, codegen_1$N._)`continue`), u.length > 1 && r.if((0, codegen_1$N._)`typeof ${m} == "string"`, (0, codegen_1$N._)`${m} += "_"`), r.if((0, codegen_1$N._)`typeof ${S}[${m}] == "number"`, () => {
          r.assign(E, (0, codegen_1$N._)`${S}[${m}]`), e.error(), r.assign(l, !1).break();
        }).code((0, codegen_1$N._)`${S}[${m}] = ${w}`);
      });
    }
    function y(w, E) {
      const m = (0, util_1$M.useFunc)(r, equal_1$5.default), _ = r.name("outer");
      r.label(_).for((0, codegen_1$N._)`;${w}--;`, () => r.for((0, codegen_1$N._)`${E} = ${w}; ${E}--;`, () => r.if((0, codegen_1$N._)`${m}(${n}[${w}], ${n}[${E}])`, () => {
        e.error(), r.assign(l, !1).break(_);
      })));
    }
  }
};
uniqueItems$1.default = def$V;
var _const$1 = {};
Object.defineProperty(_const$1, "__esModule", { value: !0 });
const codegen_1$M = codegen$1, util_1$L = util$1, equal_1$4 = equal$4, error$v = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, codegen_1$M._)`{allowedValue: ${e}}`
}, def$U = {
  keyword: "const",
  $data: !0,
  error: error$v,
  code(e) {
    const { gen: r, data: n, $data: s, schemaCode: o, schema: a } = e;
    s || a && typeof a == "object" ? e.fail$data((0, codegen_1$M._)`!${(0, util_1$L.useFunc)(r, equal_1$4.default)}(${n}, ${o})`) : e.fail((0, codegen_1$M._)`${a} !== ${n}`);
  }
};
_const$1.default = def$U;
var _enum$1 = {};
Object.defineProperty(_enum$1, "__esModule", { value: !0 });
const codegen_1$L = codegen$1, util_1$K = util$1, equal_1$3 = equal$4, error$u = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, codegen_1$L._)`{allowedValues: ${e}}`
}, def$T = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: error$u,
  code(e) {
    const { gen: r, data: n, $data: s, schema: o, schemaCode: a, it: c } = e;
    if (!s && o.length === 0)
      throw new Error("enum must have non-empty array");
    const d = o.length >= c.opts.loopEnum;
    let l;
    const u = () => l ?? (l = (0, util_1$K.useFunc)(r, equal_1$3.default));
    let h;
    if (d || s)
      h = r.let("valid"), e.block$data(h, p);
    else {
      if (!Array.isArray(o))
        throw new Error("ajv implementation error");
      const y = r.const("vSchema", a);
      h = (0, codegen_1$L.or)(...o.map((w, E) => g(y, E)));
    }
    e.pass(h);
    function p() {
      r.assign(h, !1), r.forOf("v", a, (y) => r.if((0, codegen_1$L._)`${u()}(${n}, ${y})`, () => r.assign(h, !0).break()));
    }
    function g(y, w) {
      const E = o[w];
      return typeof E == "object" && E !== null ? (0, codegen_1$L._)`${u()}(${n}, ${y}[${w}])` : (0, codegen_1$L._)`${n} === ${E}`;
    }
  }
};
_enum$1.default = def$T;
Object.defineProperty(validation$4, "__esModule", { value: !0 });
const limitNumber_1$1 = limitNumber$1, multipleOf_1$1 = multipleOf$1, limitLength_1$1 = limitLength$1, pattern_1$1 = pattern$1, limitProperties_1$1 = limitProperties$1, required_1$1 = required$2, limitItems_1$1 = limitItems$1, uniqueItems_1$1 = uniqueItems$1, const_1$1 = _const$1, enum_1$1 = _enum$1, validation$3 = [
  // number
  limitNumber_1$1.default,
  multipleOf_1$1.default,
  // string
  limitLength_1$1.default,
  pattern_1$1.default,
  // object
  limitProperties_1$1.default,
  required_1$1.default,
  // array
  limitItems_1$1.default,
  uniqueItems_1$1.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  const_1$1.default,
  enum_1$1.default
];
validation$4.default = validation$3;
var applicator$2 = {}, additionalItems$1 = {};
Object.defineProperty(additionalItems$1, "__esModule", { value: !0 });
additionalItems$1.validateAdditionalItems = void 0;
const codegen_1$K = codegen$1, util_1$J = util$1, error$t = {
  message: ({ params: { len: e } }) => (0, codegen_1$K.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, codegen_1$K._)`{limit: ${e}}`
}, def$S = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: error$t,
  code(e) {
    const { parentSchema: r, it: n } = e, { items: s } = r;
    if (!Array.isArray(s)) {
      (0, util_1$J.checkStrictMode)(n, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    validateAdditionalItems$1(e, s);
  }
};
function validateAdditionalItems$1(e, r) {
  const { gen: n, schema: s, data: o, keyword: a, it: c } = e;
  c.items = !0;
  const d = n.const("len", (0, codegen_1$K._)`${o}.length`);
  if (s === !1)
    e.setParams({ len: r.length }), e.pass((0, codegen_1$K._)`${d} <= ${r.length}`);
  else if (typeof s == "object" && !(0, util_1$J.alwaysValidSchema)(c, s)) {
    const u = n.var("valid", (0, codegen_1$K._)`${d} <= ${r.length}`);
    n.if((0, codegen_1$K.not)(u), () => l(u)), e.ok(u);
  }
  function l(u) {
    n.forRange("i", r.length, d, (h) => {
      e.subschema({ keyword: a, dataProp: h, dataPropType: util_1$J.Type.Num }, u), c.allErrors || n.if((0, codegen_1$K.not)(u), () => n.break());
    });
  }
}
additionalItems$1.validateAdditionalItems = validateAdditionalItems$1;
additionalItems$1.default = def$S;
var prefixItems$1 = {}, items$1 = {};
Object.defineProperty(items$1, "__esModule", { value: !0 });
items$1.validateTuple = void 0;
const codegen_1$J = codegen$1, util_1$I = util$1, code_1$g = code$2, def$R = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: r, it: n } = e;
    if (Array.isArray(r))
      return validateTuple$1(e, "additionalItems", r);
    n.items = !0, !(0, util_1$I.alwaysValidSchema)(n, r) && e.ok((0, code_1$g.validateArray)(e));
  }
};
function validateTuple$1(e, r, n = e.schema) {
  const { gen: s, parentSchema: o, data: a, keyword: c, it: d } = e;
  h(o), d.opts.unevaluated && n.length && d.items !== !0 && (d.items = util_1$I.mergeEvaluated.items(s, n.length, d.items));
  const l = s.name("valid"), u = s.const("len", (0, codegen_1$J._)`${a}.length`);
  n.forEach((p, g) => {
    (0, util_1$I.alwaysValidSchema)(d, p) || (s.if((0, codegen_1$J._)`${u} > ${g}`, () => e.subschema({
      keyword: c,
      schemaProp: g,
      dataProp: g
    }, l)), e.ok(l));
  });
  function h(p) {
    const { opts: g, errSchemaPath: y } = d, w = n.length, E = w === p.minItems && (w === p.maxItems || p[r] === !1);
    if (g.strictTuples && !E) {
      const m = `"${c}" is ${w}-tuple, but minItems or maxItems/${r} are not specified or different at path "${y}"`;
      (0, util_1$I.checkStrictMode)(d, m, g.strictTuples);
    }
  }
}
items$1.validateTuple = validateTuple$1;
items$1.default = def$R;
Object.defineProperty(prefixItems$1, "__esModule", { value: !0 });
const items_1$3 = items$1, def$Q = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, items_1$3.validateTuple)(e, "items")
};
prefixItems$1.default = def$Q;
var items2020$1 = {};
Object.defineProperty(items2020$1, "__esModule", { value: !0 });
const codegen_1$I = codegen$1, util_1$H = util$1, code_1$f = code$2, additionalItems_1$3 = additionalItems$1, error$s = {
  message: ({ params: { len: e } }) => (0, codegen_1$I.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, codegen_1$I._)`{limit: ${e}}`
}, def$P = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: error$s,
  code(e) {
    const { schema: r, parentSchema: n, it: s } = e, { prefixItems: o } = n;
    s.items = !0, !(0, util_1$H.alwaysValidSchema)(s, r) && (o ? (0, additionalItems_1$3.validateAdditionalItems)(e, o) : e.ok((0, code_1$f.validateArray)(e)));
  }
};
items2020$1.default = def$P;
var contains$1 = {};
Object.defineProperty(contains$1, "__esModule", { value: !0 });
const codegen_1$H = codegen$1, util_1$G = util$1, error$r = {
  message: ({ params: { min: e, max: r } }) => r === void 0 ? (0, codegen_1$H.str)`must contain at least ${e} valid item(s)` : (0, codegen_1$H.str)`must contain at least ${e} and no more than ${r} valid item(s)`,
  params: ({ params: { min: e, max: r } }) => r === void 0 ? (0, codegen_1$H._)`{minContains: ${e}}` : (0, codegen_1$H._)`{minContains: ${e}, maxContains: ${r}}`
}, def$O = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: error$r,
  code(e) {
    const { gen: r, schema: n, parentSchema: s, data: o, it: a } = e;
    let c, d;
    const { minContains: l, maxContains: u } = s;
    a.opts.next ? (c = l === void 0 ? 1 : l, d = u) : c = 1;
    const h = r.const("len", (0, codegen_1$H._)`${o}.length`);
    if (e.setParams({ min: c, max: d }), d === void 0 && c === 0) {
      (0, util_1$G.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (d !== void 0 && c > d) {
      (0, util_1$G.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, util_1$G.alwaysValidSchema)(a, n)) {
      let E = (0, codegen_1$H._)`${h} >= ${c}`;
      d !== void 0 && (E = (0, codegen_1$H._)`${E} && ${h} <= ${d}`), e.pass(E);
      return;
    }
    a.items = !0;
    const p = r.name("valid");
    d === void 0 && c === 1 ? y(p, () => r.if(p, () => r.break())) : c === 0 ? (r.let(p, !0), d !== void 0 && r.if((0, codegen_1$H._)`${o}.length > 0`, g)) : (r.let(p, !1), g()), e.result(p, () => e.reset());
    function g() {
      const E = r.name("_valid"), m = r.let("count", 0);
      y(E, () => r.if(E, () => w(m)));
    }
    function y(E, m) {
      r.forRange("i", 0, h, (_) => {
        e.subschema({
          keyword: "contains",
          dataProp: _,
          dataPropType: util_1$G.Type.Num,
          compositeRule: !0
        }, E), m();
      });
    }
    function w(E) {
      r.code((0, codegen_1$H._)`${E}++`), d === void 0 ? r.if((0, codegen_1$H._)`${E} >= ${c}`, () => r.assign(p, !0).break()) : (r.if((0, codegen_1$H._)`${E} > ${d}`, () => r.assign(p, !1).break()), c === 1 ? r.assign(p, !0) : r.if((0, codegen_1$H._)`${E} >= ${c}`, () => r.assign(p, !0)));
    }
  }
};
contains$1.default = def$O;
var dependencies$1 = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const r = codegen$1, n = util$1, s = code$2;
  e.error = {
    message: ({ params: { property: l, depsCount: u, deps: h } }) => {
      const p = u === 1 ? "property" : "properties";
      return (0, r.str)`must have ${p} ${h} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: u, deps: h, missingProperty: p } }) => (0, r._)`{property: ${l},
    missingProperty: ${p},
    depsCount: ${u},
    deps: ${h}}`
    // TODO change to reference
  };
  const o = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(l) {
      const [u, h] = a(l);
      c(l, u), d(l, h);
    }
  };
  function a({ schema: l }) {
    const u = {}, h = {};
    for (const p in l) {
      if (p === "__proto__")
        continue;
      const g = Array.isArray(l[p]) ? u : h;
      g[p] = l[p];
    }
    return [u, h];
  }
  function c(l, u = l.schema) {
    const { gen: h, data: p, it: g } = l;
    if (Object.keys(u).length === 0)
      return;
    const y = h.let("missing");
    for (const w in u) {
      const E = u[w];
      if (E.length === 0)
        continue;
      const m = (0, s.propertyInData)(h, p, w, g.opts.ownProperties);
      l.setParams({
        property: w,
        depsCount: E.length,
        deps: E.join(", ")
      }), g.allErrors ? h.if(m, () => {
        for (const _ of E)
          (0, s.checkReportMissingProp)(l, _);
      }) : (h.if((0, r._)`${m} && (${(0, s.checkMissingProp)(l, E, y)})`), (0, s.reportMissingProp)(l, y), h.else());
    }
  }
  e.validatePropertyDeps = c;
  function d(l, u = l.schema) {
    const { gen: h, data: p, keyword: g, it: y } = l, w = h.name("valid");
    for (const E in u)
      (0, n.alwaysValidSchema)(y, u[E]) || (h.if(
        (0, s.propertyInData)(h, p, E, y.opts.ownProperties),
        () => {
          const m = l.subschema({ keyword: g, schemaProp: E }, w);
          l.mergeValidEvaluated(m, w);
        },
        () => h.var(w, !0)
        // TODO var
      ), l.ok(w));
  }
  e.validateSchemaDeps = d, e.default = o;
})(dependencies$1);
var propertyNames$1 = {};
Object.defineProperty(propertyNames$1, "__esModule", { value: !0 });
const codegen_1$G = codegen$1, util_1$F = util$1, error$q = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, codegen_1$G._)`{propertyName: ${e.propertyName}}`
}, def$N = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: error$q,
  code(e) {
    const { gen: r, schema: n, data: s, it: o } = e;
    if ((0, util_1$F.alwaysValidSchema)(o, n))
      return;
    const a = r.name("valid");
    r.forIn("key", s, (c) => {
      e.setParams({ propertyName: c }), e.subschema({
        keyword: "propertyNames",
        data: c,
        dataTypes: ["string"],
        propertyName: c,
        compositeRule: !0
      }, a), r.if((0, codegen_1$G.not)(a), () => {
        e.error(!0), o.allErrors || r.break();
      });
    }), e.ok(a);
  }
};
propertyNames$1.default = def$N;
var additionalProperties$2 = {};
Object.defineProperty(additionalProperties$2, "__esModule", { value: !0 });
const code_1$e = code$2, codegen_1$F = codegen$1, names_1$a = names$3, util_1$E = util$1, error$p = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, codegen_1$F._)`{additionalProperty: ${e.additionalProperty}}`
}, def$M = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: error$p,
  code(e) {
    const { gen: r, schema: n, parentSchema: s, data: o, errsCount: a, it: c } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: d, opts: l } = c;
    if (c.props = !0, l.removeAdditional !== "all" && (0, util_1$E.alwaysValidSchema)(c, n))
      return;
    const u = (0, code_1$e.allSchemaProperties)(s.properties), h = (0, code_1$e.allSchemaProperties)(s.patternProperties);
    p(), e.ok((0, codegen_1$F._)`${a} === ${names_1$a.default.errors}`);
    function p() {
      r.forIn("key", o, (m) => {
        !u.length && !h.length ? w(m) : r.if(g(m), () => w(m));
      });
    }
    function g(m) {
      let _;
      if (u.length > 8) {
        const S = (0, util_1$E.schemaRefOrVal)(c, s.properties, "properties");
        _ = (0, code_1$e.isOwnProperty)(r, S, m);
      } else u.length ? _ = (0, codegen_1$F.or)(...u.map((S) => (0, codegen_1$F._)`${m} === ${S}`)) : _ = codegen_1$F.nil;
      return h.length && (_ = (0, codegen_1$F.or)(_, ...h.map((S) => (0, codegen_1$F._)`${(0, code_1$e.usePattern)(e, S)}.test(${m})`))), (0, codegen_1$F.not)(_);
    }
    function y(m) {
      r.code((0, codegen_1$F._)`delete ${o}[${m}]`);
    }
    function w(m) {
      if (l.removeAdditional === "all" || l.removeAdditional && n === !1) {
        y(m);
        return;
      }
      if (n === !1) {
        e.setParams({ additionalProperty: m }), e.error(), d || r.break();
        return;
      }
      if (typeof n == "object" && !(0, util_1$E.alwaysValidSchema)(c, n)) {
        const _ = r.name("valid");
        l.removeAdditional === "failing" ? (E(m, _, !1), r.if((0, codegen_1$F.not)(_), () => {
          e.reset(), y(m);
        })) : (E(m, _), d || r.if((0, codegen_1$F.not)(_), () => r.break()));
      }
    }
    function E(m, _, S) {
      const O = {
        keyword: "additionalProperties",
        dataProp: m,
        dataPropType: util_1$E.Type.Str
      };
      S === !1 && Object.assign(O, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(O, _);
    }
  }
};
additionalProperties$2.default = def$M;
var properties$b = {};
Object.defineProperty(properties$b, "__esModule", { value: !0 });
const validate_1$2 = validate$1, code_1$d = code$2, util_1$D = util$1, additionalProperties_1$3 = additionalProperties$2, def$L = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: r, schema: n, parentSchema: s, data: o, it: a } = e;
    a.opts.removeAdditional === "all" && s.additionalProperties === void 0 && additionalProperties_1$3.default.code(new validate_1$2.KeywordCxt(a, additionalProperties_1$3.default, "additionalProperties"));
    const c = (0, code_1$d.allSchemaProperties)(n);
    for (const p of c)
      a.definedProperties.add(p);
    a.opts.unevaluated && c.length && a.props !== !0 && (a.props = util_1$D.mergeEvaluated.props(r, (0, util_1$D.toHash)(c), a.props));
    const d = c.filter((p) => !(0, util_1$D.alwaysValidSchema)(a, n[p]));
    if (d.length === 0)
      return;
    const l = r.name("valid");
    for (const p of d)
      u(p) ? h(p) : (r.if((0, code_1$d.propertyInData)(r, o, p, a.opts.ownProperties)), h(p), a.allErrors || r.else().var(l, !0), r.endIf()), e.it.definedProperties.add(p), e.ok(l);
    function u(p) {
      return a.opts.useDefaults && !a.compositeRule && n[p].default !== void 0;
    }
    function h(p) {
      e.subschema({
        keyword: "properties",
        schemaProp: p,
        dataProp: p
      }, l);
    }
  }
};
properties$b.default = def$L;
var patternProperties$1 = {};
Object.defineProperty(patternProperties$1, "__esModule", { value: !0 });
const code_1$c = code$2, codegen_1$E = codegen$1, util_1$C = util$1, util_2$2 = util$1, def$K = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: r, schema: n, data: s, parentSchema: o, it: a } = e, { opts: c } = a, d = (0, code_1$c.allSchemaProperties)(n), l = d.filter((E) => (0, util_1$C.alwaysValidSchema)(a, n[E]));
    if (d.length === 0 || l.length === d.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const u = c.strictSchema && !c.allowMatchingProperties && o.properties, h = r.name("valid");
    a.props !== !0 && !(a.props instanceof codegen_1$E.Name) && (a.props = (0, util_2$2.evaluatedPropsToName)(r, a.props));
    const { props: p } = a;
    g();
    function g() {
      for (const E of d)
        u && y(E), a.allErrors ? w(E) : (r.var(h, !0), w(E), r.if(h));
    }
    function y(E) {
      for (const m in u)
        new RegExp(E).test(m) && (0, util_1$C.checkStrictMode)(a, `property ${m} matches pattern ${E} (use allowMatchingProperties)`);
    }
    function w(E) {
      r.forIn("key", s, (m) => {
        r.if((0, codegen_1$E._)`${(0, code_1$c.usePattern)(e, E)}.test(${m})`, () => {
          const _ = l.includes(E);
          _ || e.subschema({
            keyword: "patternProperties",
            schemaProp: E,
            dataProp: m,
            dataPropType: util_2$2.Type.Str
          }, h), a.opts.unevaluated && p !== !0 ? r.assign((0, codegen_1$E._)`${p}[${m}]`, !0) : !_ && !a.allErrors && r.if((0, codegen_1$E.not)(h), () => r.break());
        });
      });
    }
  }
};
patternProperties$1.default = def$K;
var not$1 = {};
Object.defineProperty(not$1, "__esModule", { value: !0 });
const util_1$B = util$1, def$J = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: r, schema: n, it: s } = e;
    if ((0, util_1$B.alwaysValidSchema)(s, n)) {
      e.fail();
      return;
    }
    const o = r.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, o), e.failResult(o, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
not$1.default = def$J;
var anyOf$1 = {};
Object.defineProperty(anyOf$1, "__esModule", { value: !0 });
const code_1$b = code$2, def$I = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: code_1$b.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
anyOf$1.default = def$I;
var oneOf$1 = {};
Object.defineProperty(oneOf$1, "__esModule", { value: !0 });
const codegen_1$D = codegen$1, util_1$A = util$1, error$o = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, codegen_1$D._)`{passingSchemas: ${e.passing}}`
}, def$H = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: error$o,
  code(e) {
    const { gen: r, schema: n, parentSchema: s, it: o } = e;
    if (!Array.isArray(n))
      throw new Error("ajv implementation error");
    if (o.opts.discriminator && s.discriminator)
      return;
    const a = n, c = r.let("valid", !1), d = r.let("passing", null), l = r.name("_valid");
    e.setParams({ passing: d }), r.block(u), e.result(c, () => e.reset(), () => e.error(!0));
    function u() {
      a.forEach((h, p) => {
        let g;
        (0, util_1$A.alwaysValidSchema)(o, h) ? r.var(l, !0) : g = e.subschema({
          keyword: "oneOf",
          schemaProp: p,
          compositeRule: !0
        }, l), p > 0 && r.if((0, codegen_1$D._)`${l} && ${c}`).assign(c, !1).assign(d, (0, codegen_1$D._)`[${d}, ${p}]`).else(), r.if(l, () => {
          r.assign(c, !0), r.assign(d, p), g && e.mergeEvaluated(g, codegen_1$D.Name);
        });
      });
    }
  }
};
oneOf$1.default = def$H;
var allOf$2 = {};
Object.defineProperty(allOf$2, "__esModule", { value: !0 });
const util_1$z = util$1, def$G = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: r, schema: n, it: s } = e;
    if (!Array.isArray(n))
      throw new Error("ajv implementation error");
    const o = r.name("valid");
    n.forEach((a, c) => {
      if ((0, util_1$z.alwaysValidSchema)(s, a))
        return;
      const d = e.subschema({ keyword: "allOf", schemaProp: c }, o);
      e.ok(o), e.mergeEvaluated(d);
    });
  }
};
allOf$2.default = def$G;
var _if$1 = {};
Object.defineProperty(_if$1, "__esModule", { value: !0 });
const codegen_1$C = codegen$1, util_1$y = util$1, error$n = {
  message: ({ params: e }) => (0, codegen_1$C.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, codegen_1$C._)`{failingKeyword: ${e.ifClause}}`
}, def$F = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: error$n,
  code(e) {
    const { gen: r, parentSchema: n, it: s } = e;
    n.then === void 0 && n.else === void 0 && (0, util_1$y.checkStrictMode)(s, '"if" without "then" and "else" is ignored');
    const o = hasSchema$1(s, "then"), a = hasSchema$1(s, "else");
    if (!o && !a)
      return;
    const c = r.let("valid", !0), d = r.name("_valid");
    if (l(), e.reset(), o && a) {
      const h = r.let("ifClause");
      e.setParams({ ifClause: h }), r.if(d, u("then", h), u("else", h));
    } else o ? r.if(d, u("then")) : r.if((0, codegen_1$C.not)(d), u("else"));
    e.pass(c, () => e.error(!0));
    function l() {
      const h = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, d);
      e.mergeEvaluated(h);
    }
    function u(h, p) {
      return () => {
        const g = e.subschema({ keyword: h }, d);
        r.assign(c, d), e.mergeValidEvaluated(g, c), p ? r.assign(p, (0, codegen_1$C._)`${h}`) : e.setParams({ ifClause: h });
      };
    }
  }
};
function hasSchema$1(e, r) {
  const n = e.schema[r];
  return n !== void 0 && !(0, util_1$y.alwaysValidSchema)(e, n);
}
_if$1.default = def$F;
var thenElse$1 = {};
Object.defineProperty(thenElse$1, "__esModule", { value: !0 });
const util_1$x = util$1, def$E = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: r, it: n }) {
    r.if === void 0 && (0, util_1$x.checkStrictMode)(n, `"${e}" without "if" is ignored`);
  }
};
thenElse$1.default = def$E;
Object.defineProperty(applicator$2, "__esModule", { value: !0 });
const additionalItems_1$2 = additionalItems$1, prefixItems_1$1 = prefixItems$1, items_1$2 = items$1, items2020_1$1 = items2020$1, contains_1$1 = contains$1, dependencies_1$3 = dependencies$1, propertyNames_1$1 = propertyNames$1, additionalProperties_1$2 = additionalProperties$2, properties_1$1 = properties$b, patternProperties_1$1 = patternProperties$1, not_1$1 = not$1, anyOf_1$1 = anyOf$1, oneOf_1$1 = oneOf$1, allOf_1$1 = allOf$2, if_1$1 = _if$1, thenElse_1$1 = thenElse$1;
function getApplicator$1(e = !1) {
  const r = [
    // any
    not_1$1.default,
    anyOf_1$1.default,
    oneOf_1$1.default,
    allOf_1$1.default,
    if_1$1.default,
    thenElse_1$1.default,
    // object
    propertyNames_1$1.default,
    additionalProperties_1$2.default,
    dependencies_1$3.default,
    properties_1$1.default,
    patternProperties_1$1.default
  ];
  return e ? r.push(prefixItems_1$1.default, items2020_1$1.default) : r.push(additionalItems_1$2.default, items_1$2.default), r.push(contains_1$1.default), r;
}
applicator$2.default = getApplicator$1;
var dynamic$1 = {}, dynamicAnchor$1 = {};
Object.defineProperty(dynamicAnchor$1, "__esModule", { value: !0 });
dynamicAnchor$1.dynamicAnchor = void 0;
const codegen_1$B = codegen$1, names_1$9 = names$3, compile_1$3 = compile$1, ref_1$2 = ref$1, def$D = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => dynamicAnchor(e, e.schema)
};
function dynamicAnchor(e, r) {
  const { gen: n, it: s } = e;
  s.schemaEnv.root.dynamicAnchors[r] = !0;
  const o = (0, codegen_1$B._)`${names_1$9.default.dynamicAnchors}${(0, codegen_1$B.getProperty)(r)}`, a = s.errSchemaPath === "#" ? s.validateName : _getValidate(e);
  n.if((0, codegen_1$B._)`!${o}`, () => n.assign(o, a));
}
dynamicAnchor$1.dynamicAnchor = dynamicAnchor;
function _getValidate(e) {
  const { schemaEnv: r, schema: n, self: s } = e.it, { root: o, baseId: a, localRefs: c, meta: d } = r.root, { schemaId: l } = s.opts, u = new compile_1$3.SchemaEnv({ schema: n, schemaId: l, root: o, baseId: a, localRefs: c, meta: d });
  return compile_1$3.compileSchema.call(s, u), (0, ref_1$2.getValidate)(e, u);
}
dynamicAnchor$1.default = def$D;
var dynamicRef$1 = {};
Object.defineProperty(dynamicRef$1, "__esModule", { value: !0 });
dynamicRef$1.dynamicRef = void 0;
const codegen_1$A = codegen$1, names_1$8 = names$3, ref_1$1 = ref$1, def$C = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => dynamicRef(e, e.schema)
};
function dynamicRef(e, r) {
  const { gen: n, keyword: s, it: o } = e;
  if (r[0] !== "#")
    throw new Error(`"${s}" only supports hash fragment reference`);
  const a = r.slice(1);
  if (o.allErrors)
    c();
  else {
    const l = n.let("valid", !1);
    c(l), e.ok(l);
  }
  function c(l) {
    if (o.schemaEnv.root.dynamicAnchors[a]) {
      const u = n.let("_v", (0, codegen_1$A._)`${names_1$8.default.dynamicAnchors}${(0, codegen_1$A.getProperty)(a)}`);
      n.if(u, d(u, l), d(o.validateName, l));
    } else
      d(o.validateName, l)();
  }
  function d(l, u) {
    return u ? () => n.block(() => {
      (0, ref_1$1.callRef)(e, l), n.let(u, !0);
    }) : () => (0, ref_1$1.callRef)(e, l);
  }
}
dynamicRef$1.dynamicRef = dynamicRef;
dynamicRef$1.default = def$C;
var recursiveAnchor = {};
Object.defineProperty(recursiveAnchor, "__esModule", { value: !0 });
const dynamicAnchor_1$1 = dynamicAnchor$1, util_1$w = util$1, def$B = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, dynamicAnchor_1$1.dynamicAnchor)(e, "") : (0, util_1$w.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
recursiveAnchor.default = def$B;
var recursiveRef = {};
Object.defineProperty(recursiveRef, "__esModule", { value: !0 });
const dynamicRef_1$1 = dynamicRef$1, def$A = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, dynamicRef_1$1.dynamicRef)(e, e.schema)
};
recursiveRef.default = def$A;
Object.defineProperty(dynamic$1, "__esModule", { value: !0 });
const dynamicAnchor_1 = dynamicAnchor$1, dynamicRef_1 = dynamicRef$1, recursiveAnchor_1 = recursiveAnchor, recursiveRef_1 = recursiveRef, dynamic = [dynamicAnchor_1.default, dynamicRef_1.default, recursiveAnchor_1.default, recursiveRef_1.default];
dynamic$1.default = dynamic;
var next$1 = {}, dependentRequired = {};
Object.defineProperty(dependentRequired, "__esModule", { value: !0 });
const dependencies_1$2 = dependencies$1, def$z = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: dependencies_1$2.error,
  code: (e) => (0, dependencies_1$2.validatePropertyDeps)(e)
};
dependentRequired.default = def$z;
var dependentSchemas = {};
Object.defineProperty(dependentSchemas, "__esModule", { value: !0 });
const dependencies_1$1 = dependencies$1, def$y = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, dependencies_1$1.validateSchemaDeps)(e)
};
dependentSchemas.default = def$y;
var limitContains = {};
Object.defineProperty(limitContains, "__esModule", { value: !0 });
const util_1$v = util$1, def$x = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: r, it: n }) {
    r.contains === void 0 && (0, util_1$v.checkStrictMode)(n, `"${e}" without "contains" is ignored`);
  }
};
limitContains.default = def$x;
Object.defineProperty(next$1, "__esModule", { value: !0 });
const dependentRequired_1 = dependentRequired, dependentSchemas_1 = dependentSchemas, limitContains_1 = limitContains, next = [dependentRequired_1.default, dependentSchemas_1.default, limitContains_1.default];
next$1.default = next;
var unevaluated$2 = {}, unevaluatedProperties = {};
Object.defineProperty(unevaluatedProperties, "__esModule", { value: !0 });
const codegen_1$z = codegen$1, util_1$u = util$1, names_1$7 = names$3, error$m = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, codegen_1$z._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, def$w = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: error$m,
  code(e) {
    const { gen: r, schema: n, data: s, errsCount: o, it: a } = e;
    if (!o)
      throw new Error("ajv implementation error");
    const { allErrors: c, props: d } = a;
    d instanceof codegen_1$z.Name ? r.if((0, codegen_1$z._)`${d} !== true`, () => r.forIn("key", s, (p) => r.if(u(d, p), () => l(p)))) : d !== !0 && r.forIn("key", s, (p) => d === void 0 ? l(p) : r.if(h(d, p), () => l(p))), a.props = !0, e.ok((0, codegen_1$z._)`${o} === ${names_1$7.default.errors}`);
    function l(p) {
      if (n === !1) {
        e.setParams({ unevaluatedProperty: p }), e.error(), c || r.break();
        return;
      }
      if (!(0, util_1$u.alwaysValidSchema)(a, n)) {
        const g = r.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: p,
          dataPropType: util_1$u.Type.Str
        }, g), c || r.if((0, codegen_1$z.not)(g), () => r.break());
      }
    }
    function u(p, g) {
      return (0, codegen_1$z._)`!${p} || !${p}[${g}]`;
    }
    function h(p, g) {
      const y = [];
      for (const w in p)
        p[w] === !0 && y.push((0, codegen_1$z._)`${g} !== ${w}`);
      return (0, codegen_1$z.and)(...y);
    }
  }
};
unevaluatedProperties.default = def$w;
var unevaluatedItems = {};
Object.defineProperty(unevaluatedItems, "__esModule", { value: !0 });
const codegen_1$y = codegen$1, util_1$t = util$1, error$l = {
  message: ({ params: { len: e } }) => (0, codegen_1$y.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, codegen_1$y._)`{limit: ${e}}`
}, def$v = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: error$l,
  code(e) {
    const { gen: r, schema: n, data: s, it: o } = e, a = o.items || 0;
    if (a === !0)
      return;
    const c = r.const("len", (0, codegen_1$y._)`${s}.length`);
    if (n === !1)
      e.setParams({ len: a }), e.fail((0, codegen_1$y._)`${c} > ${a}`);
    else if (typeof n == "object" && !(0, util_1$t.alwaysValidSchema)(o, n)) {
      const l = r.var("valid", (0, codegen_1$y._)`${c} <= ${a}`);
      r.if((0, codegen_1$y.not)(l), () => d(l, a)), e.ok(l);
    }
    o.items = !0;
    function d(l, u) {
      r.forRange("i", u, c, (h) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: h, dataPropType: util_1$t.Type.Num }, l), o.allErrors || r.if((0, codegen_1$y.not)(l), () => r.break());
      });
    }
  }
};
unevaluatedItems.default = def$v;
Object.defineProperty(unevaluated$2, "__esModule", { value: !0 });
const unevaluatedProperties_1 = unevaluatedProperties, unevaluatedItems_1 = unevaluatedItems, unevaluated$1 = [unevaluatedProperties_1.default, unevaluatedItems_1.default];
unevaluated$2.default = unevaluated$1;
var format$6 = {}, format$5 = {};
Object.defineProperty(format$5, "__esModule", { value: !0 });
const codegen_1$x = codegen$1, error$k = {
  message: ({ schemaCode: e }) => (0, codegen_1$x.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, codegen_1$x._)`{format: ${e}}`
}, def$u = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: error$k,
  code(e, r) {
    const { gen: n, data: s, $data: o, schema: a, schemaCode: c, it: d } = e, { opts: l, errSchemaPath: u, schemaEnv: h, self: p } = d;
    if (!l.validateFormats)
      return;
    o ? g() : y();
    function g() {
      const w = n.scopeValue("formats", {
        ref: p.formats,
        code: l.code.formats
      }), E = n.const("fDef", (0, codegen_1$x._)`${w}[${c}]`), m = n.let("fType"), _ = n.let("format");
      n.if((0, codegen_1$x._)`typeof ${E} == "object" && !(${E} instanceof RegExp)`, () => n.assign(m, (0, codegen_1$x._)`${E}.type || "string"`).assign(_, (0, codegen_1$x._)`${E}.validate`), () => n.assign(m, (0, codegen_1$x._)`"string"`).assign(_, E)), e.fail$data((0, codegen_1$x.or)(S(), O()));
      function S() {
        return l.strictSchema === !1 ? codegen_1$x.nil : (0, codegen_1$x._)`${c} && !${_}`;
      }
      function O() {
        const I = h.$async ? (0, codegen_1$x._)`(${E}.async ? await ${_}(${s}) : ${_}(${s}))` : (0, codegen_1$x._)`${_}(${s})`, A = (0, codegen_1$x._)`(typeof ${_} == "function" ? ${I} : ${_}.test(${s}))`;
        return (0, codegen_1$x._)`${_} && ${_} !== true && ${m} === ${r} && !${A}`;
      }
    }
    function y() {
      const w = p.formats[a];
      if (!w) {
        S();
        return;
      }
      if (w === !0)
        return;
      const [E, m, _] = O(w);
      E === r && e.pass(I());
      function S() {
        if (l.strictSchema === !1) {
          p.logger.warn(A());
          return;
        }
        throw new Error(A());
        function A() {
          return `unknown format "${a}" ignored in schema at path "${u}"`;
        }
      }
      function O(A) {
        const F = A instanceof RegExp ? (0, codegen_1$x.regexpCode)(A) : l.code.formats ? (0, codegen_1$x._)`${l.code.formats}${(0, codegen_1$x.getProperty)(a)}` : void 0, z = n.scopeValue("formats", { key: a, ref: A, code: F });
        return typeof A == "object" && !(A instanceof RegExp) ? [A.type || "string", A.validate, (0, codegen_1$x._)`${z}.validate`] : ["string", A, z];
      }
      function I() {
        if (typeof w == "object" && !(w instanceof RegExp) && w.async) {
          if (!h.$async)
            throw new Error("async format in sync schema");
          return (0, codegen_1$x._)`await ${_}(${s})`;
        }
        return typeof m == "function" ? (0, codegen_1$x._)`${_}(${s})` : (0, codegen_1$x._)`${_}.test(${s})`;
      }
    }
  }
};
format$5.default = def$u;
Object.defineProperty(format$6, "__esModule", { value: !0 });
const format_1$3 = format$5, format$4 = [format_1$3.default];
format$6.default = format$4;
var metadata$2 = {};
Object.defineProperty(metadata$2, "__esModule", { value: !0 });
metadata$2.contentVocabulary = metadata$2.metadataVocabulary = void 0;
metadata$2.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
metadata$2.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(draft2020, "__esModule", { value: !0 });
const core_1$1 = core$5, validation_1$1 = validation$4, applicator_1$1 = applicator$2, dynamic_1 = dynamic$1, next_1 = next$1, unevaluated_1 = unevaluated$2, format_1$2 = format$6, metadata_1$1 = metadata$2, draft2020Vocabularies = [
  dynamic_1.default,
  core_1$1.default,
  validation_1$1.default,
  (0, applicator_1$1.default)(!0),
  format_1$2.default,
  metadata_1$1.metadataVocabulary,
  metadata_1$1.contentVocabulary,
  next_1.default,
  unevaluated_1.default
];
draft2020.default = draft2020Vocabularies;
var discriminator$1 = {}, types$1 = {};
Object.defineProperty(types$1, "__esModule", { value: !0 });
types$1.DiscrError = void 0;
var DiscrError$1;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(DiscrError$1 || (types$1.DiscrError = DiscrError$1 = {}));
Object.defineProperty(discriminator$1, "__esModule", { value: !0 });
const codegen_1$w = codegen$1, types_1$1 = types$1, compile_1$2 = compile$1, ref_error_1$2 = ref_error$1, util_1$s = util$1, error$j = {
  message: ({ params: { discrError: e, tagName: r } }) => e === types_1$1.DiscrError.Tag ? `tag "${r}" must be string` : `value of tag "${r}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: r, tagName: n } }) => (0, codegen_1$w._)`{error: ${e}, tag: ${n}, tagValue: ${r}}`
}, def$t = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: error$j,
  code(e) {
    const { gen: r, data: n, schema: s, parentSchema: o, it: a } = e, { oneOf: c } = o;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const d = s.propertyName;
    if (typeof d != "string")
      throw new Error("discriminator: requires propertyName");
    if (s.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!c)
      throw new Error("discriminator: requires oneOf keyword");
    const l = r.let("valid", !1), u = r.const("tag", (0, codegen_1$w._)`${n}${(0, codegen_1$w.getProperty)(d)}`);
    r.if((0, codegen_1$w._)`typeof ${u} == "string"`, () => h(), () => e.error(!1, { discrError: types_1$1.DiscrError.Tag, tag: u, tagName: d })), e.ok(l);
    function h() {
      const y = g();
      r.if(!1);
      for (const w in y)
        r.elseIf((0, codegen_1$w._)`${u} === ${w}`), r.assign(l, p(y[w]));
      r.else(), e.error(!1, { discrError: types_1$1.DiscrError.Mapping, tag: u, tagName: d }), r.endIf();
    }
    function p(y) {
      const w = r.name("valid"), E = e.subschema({ keyword: "oneOf", schemaProp: y }, w);
      return e.mergeEvaluated(E, codegen_1$w.Name), w;
    }
    function g() {
      var y;
      const w = {}, E = _(o);
      let m = !0;
      for (let I = 0; I < c.length; I++) {
        let A = c[I];
        if (A != null && A.$ref && !(0, util_1$s.schemaHasRulesButRef)(A, a.self.RULES)) {
          const z = A.$ref;
          if (A = compile_1$2.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, z), A instanceof compile_1$2.SchemaEnv && (A = A.schema), A === void 0)
            throw new ref_error_1$2.default(a.opts.uriResolver, a.baseId, z);
        }
        const F = (y = A == null ? void 0 : A.properties) === null || y === void 0 ? void 0 : y[d];
        if (typeof F != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${d}"`);
        m = m && (E || _(A)), S(F, I);
      }
      if (!m)
        throw new Error(`discriminator: "${d}" must be required`);
      return w;
      function _({ required: I }) {
        return Array.isArray(I) && I.includes(d);
      }
      function S(I, A) {
        if (I.const)
          O(I.const, A);
        else if (I.enum)
          for (const F of I.enum)
            O(F, A);
        else
          throw new Error(`discriminator: "properties/${d}" must have "const" or "enum"`);
      }
      function O(I, A) {
        if (typeof I != "string" || I in w)
          throw new Error(`discriminator: "${d}" values must be unique strings`);
        w[I] = A;
      }
    }
  }
};
discriminator$1.default = def$t;
var jsonSchema202012 = {};
const $schema$8 = "https://json-schema.org/draft/2020-12/schema", $id$9 = "https://json-schema.org/draft/2020-12/schema", $vocabulary$7 = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, $dynamicAnchor$7 = "meta", title$8 = "Core and Validation specifications meta-schema", allOf$1 = [
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
], type$9 = [
  "object",
  "boolean"
], $comment = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", properties$a = {
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
}, require$$0$1 = {
  $schema: $schema$8,
  $id: $id$9,
  $vocabulary: $vocabulary$7,
  $dynamicAnchor: $dynamicAnchor$7,
  title: title$8,
  allOf: allOf$1,
  type: type$9,
  $comment,
  properties: properties$a
}, $schema$7 = "https://json-schema.org/draft/2020-12/schema", $id$8 = "https://json-schema.org/draft/2020-12/meta/applicator", $vocabulary$6 = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, $dynamicAnchor$6 = "meta", title$7 = "Applicator vocabulary meta-schema", type$8 = [
  "object",
  "boolean"
], properties$9 = {
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
}, $defs$2 = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, require$$1 = {
  $schema: $schema$7,
  $id: $id$8,
  $vocabulary: $vocabulary$6,
  $dynamicAnchor: $dynamicAnchor$6,
  title: title$7,
  type: type$8,
  properties: properties$9,
  $defs: $defs$2
}, $schema$6 = "https://json-schema.org/draft/2020-12/schema", $id$7 = "https://json-schema.org/draft/2020-12/meta/unevaluated", $vocabulary$5 = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, $dynamicAnchor$5 = "meta", title$6 = "Unevaluated applicator vocabulary meta-schema", type$7 = [
  "object",
  "boolean"
], properties$8 = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, require$$2 = {
  $schema: $schema$6,
  $id: $id$7,
  $vocabulary: $vocabulary$5,
  $dynamicAnchor: $dynamicAnchor$5,
  title: title$6,
  type: type$7,
  properties: properties$8
}, $schema$5 = "https://json-schema.org/draft/2020-12/schema", $id$6 = "https://json-schema.org/draft/2020-12/meta/content", $vocabulary$4 = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, $dynamicAnchor$4 = "meta", title$5 = "Content vocabulary meta-schema", type$6 = [
  "object",
  "boolean"
], properties$7 = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, require$$3$1 = {
  $schema: $schema$5,
  $id: $id$6,
  $vocabulary: $vocabulary$4,
  $dynamicAnchor: $dynamicAnchor$4,
  title: title$5,
  type: type$6,
  properties: properties$7
}, $schema$4 = "https://json-schema.org/draft/2020-12/schema", $id$5 = "https://json-schema.org/draft/2020-12/meta/core", $vocabulary$3 = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, $dynamicAnchor$3 = "meta", title$4 = "Core vocabulary meta-schema", type$5 = [
  "object",
  "boolean"
], properties$6 = {
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
}, $defs$1 = {
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
}, require$$4 = {
  $schema: $schema$4,
  $id: $id$5,
  $vocabulary: $vocabulary$3,
  $dynamicAnchor: $dynamicAnchor$3,
  title: title$4,
  type: type$5,
  properties: properties$6,
  $defs: $defs$1
}, $schema$3 = "https://json-schema.org/draft/2020-12/schema", $id$4 = "https://json-schema.org/draft/2020-12/meta/format-annotation", $vocabulary$2 = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, $dynamicAnchor$2 = "meta", title$3 = "Format vocabulary meta-schema for annotation results", type$4 = [
  "object",
  "boolean"
], properties$5 = {
  format: {
    type: "string"
  }
}, require$$5 = {
  $schema: $schema$3,
  $id: $id$4,
  $vocabulary: $vocabulary$2,
  $dynamicAnchor: $dynamicAnchor$2,
  title: title$3,
  type: type$4,
  properties: properties$5
}, $schema$2 = "https://json-schema.org/draft/2020-12/schema", $id$3 = "https://json-schema.org/draft/2020-12/meta/meta-data", $vocabulary$1 = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, $dynamicAnchor$1 = "meta", title$2 = "Meta-data vocabulary meta-schema", type$3 = [
  "object",
  "boolean"
], properties$4 = {
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
}, require$$6 = {
  $schema: $schema$2,
  $id: $id$3,
  $vocabulary: $vocabulary$1,
  $dynamicAnchor: $dynamicAnchor$1,
  title: title$2,
  type: type$3,
  properties: properties$4
}, $schema$1 = "https://json-schema.org/draft/2020-12/schema", $id$2 = "https://json-schema.org/draft/2020-12/meta/validation", $vocabulary = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, $dynamicAnchor = "meta", title$1 = "Validation vocabulary meta-schema", type$2 = [
  "object",
  "boolean"
], properties$3 = {
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
}, $defs = {
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
}, require$$7 = {
  $schema: $schema$1,
  $id: $id$2,
  $vocabulary,
  $dynamicAnchor,
  title: title$1,
  type: type$2,
  properties: properties$3,
  $defs
};
Object.defineProperty(jsonSchema202012, "__esModule", { value: !0 });
const metaSchema = require$$0$1, applicator$1 = require$$1, unevaluated = require$$2, content = require$$3$1, core$3 = require$$4, format$3 = require$$5, metadata$1 = require$$6, validation$2 = require$$7, META_SUPPORT_DATA = ["/properties"];
function addMetaSchema2020(e) {
  return [
    metaSchema,
    applicator$1,
    unevaluated,
    content,
    core$3,
    r(this, format$3),
    metadata$1,
    r(this, validation$2)
  ].forEach((n) => this.addMetaSchema(n, void 0, !1)), this;
  function r(n, s) {
    return e ? n.$dataMetaSchema(s, META_SUPPORT_DATA) : s;
  }
}
jsonSchema202012.default = addMetaSchema2020;
(function(e, r) {
  Object.defineProperty(r, "__esModule", { value: !0 }), r.MissingRefError = r.ValidationError = r.CodeGen = r.Name = r.nil = r.stringify = r.str = r._ = r.KeywordCxt = r.Ajv2020 = void 0;
  const n = core$6, s = draft2020, o = discriminator$1, a = jsonSchema202012, c = "https://json-schema.org/draft/2020-12/schema";
  class d extends n.default {
    constructor(y = {}) {
      super({
        ...y,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), s.default.forEach((y) => this.addVocabulary(y)), this.opts.discriminator && this.addKeyword(o.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: y, meta: w } = this.opts;
      w && (a.default.call(this, y), this.refs["http://json-schema.org/schema"] = c);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0);
    }
  }
  r.Ajv2020 = d, e.exports = r = d, e.exports.Ajv2020 = d, Object.defineProperty(r, "__esModule", { value: !0 }), r.default = d;
  var l = validate$1;
  Object.defineProperty(r, "KeywordCxt", { enumerable: !0, get: function() {
    return l.KeywordCxt;
  } });
  var u = codegen$1;
  Object.defineProperty(r, "_", { enumerable: !0, get: function() {
    return u._;
  } }), Object.defineProperty(r, "str", { enumerable: !0, get: function() {
    return u.str;
  } }), Object.defineProperty(r, "stringify", { enumerable: !0, get: function() {
    return u.stringify;
  } }), Object.defineProperty(r, "nil", { enumerable: !0, get: function() {
    return u.nil;
  } }), Object.defineProperty(r, "Name", { enumerable: !0, get: function() {
    return u.Name;
  } }), Object.defineProperty(r, "CodeGen", { enumerable: !0, get: function() {
    return u.CodeGen;
  } });
  var h = validation_error$1;
  Object.defineProperty(r, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var p = ref_error$1;
  Object.defineProperty(r, "MissingRefError", { enumerable: !0, get: function() {
    return p.default;
  } });
})(_2020, _2020.exports);
var _2020Exports = _2020.exports, dist$1 = { exports: {} }, formats = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function r(K, V) {
    return { validate: K, compare: V };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: r(a, c),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: r(l(!0), u),
    "date-time": r(g(!0), y),
    "iso-time": r(l(), h),
    "iso-date-time": r(g(), w),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: _,
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
    regex: J,
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
    byte: O,
    // signed 32 bit integer
    int32: { type: "number", validate: F },
    // signed 64 bit integer
    int64: { type: "number", validate: z },
    // C-type float
    float: { type: "number", validate: x },
    // C-type double
    double: { type: "number", validate: x },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: r(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, c),
    time: r(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, u),
    "date-time": r(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, y),
    "iso-time": r(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, h),
    "iso-date-time": r(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, w),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, e.formatNames = Object.keys(e.fullFormats);
  function n(K) {
    return K % 4 === 0 && (K % 100 !== 0 || K % 400 === 0);
  }
  const s = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, o = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function a(K) {
    const V = s.exec(K);
    if (!V)
      return !1;
    const G = +V[1], M = +V[2], L = +V[3];
    return M >= 1 && M <= 12 && L >= 1 && L <= (M === 2 && n(G) ? 29 : o[M]);
  }
  function c(K, V) {
    if (K && V)
      return K > V ? 1 : K < V ? -1 : 0;
  }
  const d = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function l(K) {
    return function(G) {
      const M = d.exec(G);
      if (!M)
        return !1;
      const L = +M[1], N = +M[2], C = +M[3], j = M[4], q = M[5] === "-" ? -1 : 1, T = +(M[6] || 0), v = +(M[7] || 0);
      if (T > 23 || v > 59 || K && !j)
        return !1;
      if (L <= 23 && N <= 59 && C < 60)
        return !0;
      const P = N - v * q, b = L - T * q - (P < 0 ? 1 : 0);
      return (b === 23 || b === -1) && (P === 59 || P === -1) && C < 61;
    };
  }
  function u(K, V) {
    if (!(K && V))
      return;
    const G = (/* @__PURE__ */ new Date("2020-01-01T" + K)).valueOf(), M = (/* @__PURE__ */ new Date("2020-01-01T" + V)).valueOf();
    if (G && M)
      return G - M;
  }
  function h(K, V) {
    if (!(K && V))
      return;
    const G = d.exec(K), M = d.exec(V);
    if (G && M)
      return K = G[1] + G[2] + G[3], V = M[1] + M[2] + M[3], K > V ? 1 : K < V ? -1 : 0;
  }
  const p = /t|\s/i;
  function g(K) {
    const V = l(K);
    return function(M) {
      const L = M.split(p);
      return L.length === 2 && a(L[0]) && V(L[1]);
    };
  }
  function y(K, V) {
    if (!(K && V))
      return;
    const G = new Date(K).valueOf(), M = new Date(V).valueOf();
    if (G && M)
      return G - M;
  }
  function w(K, V) {
    if (!(K && V))
      return;
    const [G, M] = K.split(p), [L, N] = V.split(p), C = c(G, L);
    if (C !== void 0)
      return C || u(M, N);
  }
  const E = /\/|:/, m = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function _(K) {
    return E.test(K) && m.test(K);
  }
  const S = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function O(K) {
    return S.lastIndex = 0, S.test(K);
  }
  const I = -2147483648, A = 2 ** 31 - 1;
  function F(K) {
    return Number.isInteger(K) && K <= A && K >= I;
  }
  function z(K) {
    return Number.isInteger(K);
  }
  function x() {
    return !0;
  }
  const Y = /[^\\]\\Z/;
  function J(K) {
    if (Y.test(K))
      return !1;
    try {
      return new RegExp(K), !0;
    } catch {
      return !1;
    }
  }
})(formats);
var limit = {}, ajv = { exports: {} }, core$2 = {}, validate = {}, boolSchema = {}, errors = {}, codegen = {}, code$1 = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class r {
  }
  e._CodeOrName = r, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class n extends r {
    constructor(S) {
      if (super(), !e.IDENTIFIER.test(S))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = S;
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
  e.Name = n;
  class s extends r {
    constructor(S) {
      super(), this._items = typeof S == "string" ? [S] : S;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const S = this._items[0];
      return S === "" || S === '""';
    }
    get str() {
      var S;
      return (S = this._str) !== null && S !== void 0 ? S : this._str = this._items.reduce((O, I) => `${O}${I}`, "");
    }
    get names() {
      var S;
      return (S = this._names) !== null && S !== void 0 ? S : this._names = this._items.reduce((O, I) => (I instanceof n && (O[I.str] = (O[I.str] || 0) + 1), O), {});
    }
  }
  e._Code = s, e.nil = new s("");
  function o(_, ...S) {
    const O = [_[0]];
    let I = 0;
    for (; I < S.length; )
      d(O, S[I]), O.push(_[++I]);
    return new s(O);
  }
  e._ = o;
  const a = new s("+");
  function c(_, ...S) {
    const O = [y(_[0])];
    let I = 0;
    for (; I < S.length; )
      O.push(a), d(O, S[I]), O.push(a, y(_[++I]));
    return l(O), new s(O);
  }
  e.str = c;
  function d(_, S) {
    S instanceof s ? _.push(...S._items) : S instanceof n ? _.push(S) : _.push(p(S));
  }
  e.addCodeArg = d;
  function l(_) {
    let S = 1;
    for (; S < _.length - 1; ) {
      if (_[S] === a) {
        const O = u(_[S - 1], _[S + 1]);
        if (O !== void 0) {
          _.splice(S - 1, 3, O);
          continue;
        }
        _[S++] = "+";
      }
      S++;
    }
  }
  function u(_, S) {
    if (S === '""')
      return _;
    if (_ === '""')
      return S;
    if (typeof _ == "string")
      return S instanceof n || _[_.length - 1] !== '"' ? void 0 : typeof S != "string" ? `${_.slice(0, -1)}${S}"` : S[0] === '"' ? _.slice(0, -1) + S.slice(1) : void 0;
    if (typeof S == "string" && S[0] === '"' && !(_ instanceof n))
      return `"${_}${S.slice(1)}`;
  }
  function h(_, S) {
    return S.emptyStr() ? _ : _.emptyStr() ? S : c`${_}${S}`;
  }
  e.strConcat = h;
  function p(_) {
    return typeof _ == "number" || typeof _ == "boolean" || _ === null ? _ : y(Array.isArray(_) ? _.join(",") : _);
  }
  function g(_) {
    return new s(y(_));
  }
  e.stringify = g;
  function y(_) {
    return JSON.stringify(_).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = y;
  function w(_) {
    return typeof _ == "string" && e.IDENTIFIER.test(_) ? new s(`.${_}`) : o`[${_}]`;
  }
  e.getProperty = w;
  function E(_) {
    if (typeof _ == "string" && e.IDENTIFIER.test(_))
      return new s(`${_}`);
    throw new Error(`CodeGen: invalid export name: ${_}, use explicit $id name mapping`);
  }
  e.getEsmExportName = E;
  function m(_) {
    return new s(_.toString());
  }
  e.regexpCode = m;
})(code$1);
var scope = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const r = code$1;
  class n extends Error {
    constructor(u) {
      super(`CodeGen: "code" for ${u} not defined`), this.value = u.value;
    }
  }
  var s;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
  })(s || (e.UsedValueState = s = {})), e.varKinds = {
    const: new r.Name("const"),
    let: new r.Name("let"),
    var: new r.Name("var")
  };
  class o {
    constructor({ prefixes: u, parent: h } = {}) {
      this._names = {}, this._prefixes = u, this._parent = h;
    }
    toName(u) {
      return u instanceof r.Name ? u : this.name(u);
    }
    name(u) {
      return new r.Name(this._newName(u));
    }
    _newName(u) {
      const h = this._names[u] || this._nameGroup(u);
      return `${u}${h.index++}`;
    }
    _nameGroup(u) {
      var h, p;
      if (!((p = (h = this._parent) === null || h === void 0 ? void 0 : h._prefixes) === null || p === void 0) && p.has(u) || this._prefixes && !this._prefixes.has(u))
        throw new Error(`CodeGen: prefix "${u}" is not allowed in this scope`);
      return this._names[u] = { prefix: u, index: 0 };
    }
  }
  e.Scope = o;
  class a extends r.Name {
    constructor(u, h) {
      super(h), this.prefix = u;
    }
    setValue(u, { property: h, itemIndex: p }) {
      this.value = u, this.scopePath = (0, r._)`.${new r.Name(h)}[${p}]`;
    }
  }
  e.ValueScopeName = a;
  const c = (0, r._)`\n`;
  class d extends o {
    constructor(u) {
      super(u), this._values = {}, this._scope = u.scope, this.opts = { ...u, _n: u.lines ? c : r.nil };
    }
    get() {
      return this._scope;
    }
    name(u) {
      return new a(u, this._newName(u));
    }
    value(u, h) {
      var p;
      if (h.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const g = this.toName(u), { prefix: y } = g, w = (p = h.key) !== null && p !== void 0 ? p : h.ref;
      let E = this._values[y];
      if (E) {
        const S = E.get(w);
        if (S)
          return S;
      } else
        E = this._values[y] = /* @__PURE__ */ new Map();
      E.set(w, g);
      const m = this._scope[y] || (this._scope[y] = []), _ = m.length;
      return m[_] = h.ref, g.setValue(h, { property: y, itemIndex: _ }), g;
    }
    getValue(u, h) {
      const p = this._values[u];
      if (p)
        return p.get(h);
    }
    scopeRefs(u, h = this._values) {
      return this._reduceValues(h, (p) => {
        if (p.scopePath === void 0)
          throw new Error(`CodeGen: name "${p}" has no value`);
        return (0, r._)`${u}${p.scopePath}`;
      });
    }
    scopeCode(u = this._values, h, p) {
      return this._reduceValues(u, (g) => {
        if (g.value === void 0)
          throw new Error(`CodeGen: name "${g}" has no value`);
        return g.value.code;
      }, h, p);
    }
    _reduceValues(u, h, p = {}, g) {
      let y = r.nil;
      for (const w in u) {
        const E = u[w];
        if (!E)
          continue;
        const m = p[w] = p[w] || /* @__PURE__ */ new Map();
        E.forEach((_) => {
          if (m.has(_))
            return;
          m.set(_, s.Started);
          let S = h(_);
          if (S) {
            const O = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            y = (0, r._)`${y}${O} ${_} = ${S};${this.opts._n}`;
          } else if (S = g == null ? void 0 : g(_))
            y = (0, r._)`${y}${S}${this.opts._n}`;
          else
            throw new n(_);
          m.set(_, s.Completed);
        });
      }
      return y;
    }
  }
  e.ValueScope = d;
})(scope);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const r = code$1, n = scope;
  var s = code$1;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return s._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return s.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return s.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return s.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return s.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return s.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return s.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return s.Name;
  } });
  var o = scope;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return o.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return o.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return o.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return o.varKinds;
  } }), e.operators = {
    GT: new r._Code(">"),
    GTE: new r._Code(">="),
    LT: new r._Code("<"),
    LTE: new r._Code("<="),
    EQ: new r._Code("==="),
    NEQ: new r._Code("!=="),
    NOT: new r._Code("!"),
    OR: new r._Code("||"),
    AND: new r._Code("&&"),
    ADD: new r._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(f, $) {
      return this;
    }
  }
  class c extends a {
    constructor(f, $, R) {
      super(), this.varKind = f, this.name = $, this.rhs = R;
    }
    render({ es5: f, _n: $ }) {
      const R = f ? n.varKinds.var : this.varKind, k = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${R} ${this.name}${k};` + $;
    }
    optimizeNames(f, $) {
      if (f[this.name.str])
        return this.rhs && (this.rhs = M(this.rhs, f, $)), this;
    }
    get names() {
      return this.rhs instanceof r._CodeOrName ? this.rhs.names : {};
    }
  }
  class d extends a {
    constructor(f, $, R) {
      super(), this.lhs = f, this.rhs = $, this.sideEffects = R;
    }
    render({ _n: f }) {
      return `${this.lhs} = ${this.rhs};` + f;
    }
    optimizeNames(f, $) {
      if (!(this.lhs instanceof r.Name && !f[this.lhs.str] && !this.sideEffects))
        return this.rhs = M(this.rhs, f, $), this;
    }
    get names() {
      const f = this.lhs instanceof r.Name ? {} : { ...this.lhs.names };
      return G(f, this.rhs);
    }
  }
  class l extends d {
    constructor(f, $, R, k) {
      super(f, R, k), this.op = $;
    }
    render({ _n: f }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + f;
    }
  }
  class u extends a {
    constructor(f) {
      super(), this.label = f, this.names = {};
    }
    render({ _n: f }) {
      return `${this.label}:` + f;
    }
  }
  class h extends a {
    constructor(f) {
      super(), this.label = f, this.names = {};
    }
    render({ _n: f }) {
      return `break${this.label ? ` ${this.label}` : ""};` + f;
    }
  }
  class p extends a {
    constructor(f) {
      super(), this.error = f;
    }
    render({ _n: f }) {
      return `throw ${this.error};` + f;
    }
    get names() {
      return this.error.names;
    }
  }
  class g extends a {
    constructor(f) {
      super(), this.code = f;
    }
    render({ _n: f }) {
      return `${this.code};` + f;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(f, $) {
      return this.code = M(this.code, f, $), this;
    }
    get names() {
      return this.code instanceof r._CodeOrName ? this.code.names : {};
    }
  }
  class y extends a {
    constructor(f = []) {
      super(), this.nodes = f;
    }
    render(f) {
      return this.nodes.reduce(($, R) => $ + R.render(f), "");
    }
    optimizeNodes() {
      const { nodes: f } = this;
      let $ = f.length;
      for (; $--; ) {
        const R = f[$].optimizeNodes();
        Array.isArray(R) ? f.splice($, 1, ...R) : R ? f[$] = R : f.splice($, 1);
      }
      return f.length > 0 ? this : void 0;
    }
    optimizeNames(f, $) {
      const { nodes: R } = this;
      let k = R.length;
      for (; k--; ) {
        const D = R[k];
        D.optimizeNames(f, $) || (L(f, D.names), R.splice(k, 1));
      }
      return R.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((f, $) => V(f, $.names), {});
    }
  }
  class w extends y {
    render(f) {
      return "{" + f._n + super.render(f) + "}" + f._n;
    }
  }
  class E extends y {
  }
  class m extends w {
  }
  m.kind = "else";
  class _ extends w {
    constructor(f, $) {
      super($), this.condition = f;
    }
    render(f) {
      let $ = `if(${this.condition})` + super.render(f);
      return this.else && ($ += "else " + this.else.render(f)), $;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const f = this.condition;
      if (f === !0)
        return this.nodes;
      let $ = this.else;
      if ($) {
        const R = $.optimizeNodes();
        $ = this.else = Array.isArray(R) ? new m(R) : R;
      }
      if ($)
        return f === !1 ? $ instanceof _ ? $ : $.nodes : this.nodes.length ? this : new _(N(f), $ instanceof _ ? [$] : $.nodes);
      if (!(f === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(f, $) {
      var R;
      if (this.else = (R = this.else) === null || R === void 0 ? void 0 : R.optimizeNames(f, $), !!(super.optimizeNames(f, $) || this.else))
        return this.condition = M(this.condition, f, $), this;
    }
    get names() {
      const f = super.names;
      return G(f, this.condition), this.else && V(f, this.else.names), f;
    }
  }
  _.kind = "if";
  class S extends w {
  }
  S.kind = "for";
  class O extends S {
    constructor(f) {
      super(), this.iteration = f;
    }
    render(f) {
      return `for(${this.iteration})` + super.render(f);
    }
    optimizeNames(f, $) {
      if (super.optimizeNames(f, $))
        return this.iteration = M(this.iteration, f, $), this;
    }
    get names() {
      return V(super.names, this.iteration.names);
    }
  }
  class I extends S {
    constructor(f, $, R, k) {
      super(), this.varKind = f, this.name = $, this.from = R, this.to = k;
    }
    render(f) {
      const $ = f.es5 ? n.varKinds.var : this.varKind, { name: R, from: k, to: D } = this;
      return `for(${$} ${R}=${k}; ${R}<${D}; ${R}++)` + super.render(f);
    }
    get names() {
      const f = G(super.names, this.from);
      return G(f, this.to);
    }
  }
  class A extends S {
    constructor(f, $, R, k) {
      super(), this.loop = f, this.varKind = $, this.name = R, this.iterable = k;
    }
    render(f) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(f);
    }
    optimizeNames(f, $) {
      if (super.optimizeNames(f, $))
        return this.iterable = M(this.iterable, f, $), this;
    }
    get names() {
      return V(super.names, this.iterable.names);
    }
  }
  class F extends w {
    constructor(f, $, R) {
      super(), this.name = f, this.args = $, this.async = R;
    }
    render(f) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(f);
    }
  }
  F.kind = "func";
  class z extends y {
    render(f) {
      return "return " + super.render(f);
    }
  }
  z.kind = "return";
  class x extends w {
    render(f) {
      let $ = "try" + super.render(f);
      return this.catch && ($ += this.catch.render(f)), this.finally && ($ += this.finally.render(f)), $;
    }
    optimizeNodes() {
      var f, $;
      return super.optimizeNodes(), (f = this.catch) === null || f === void 0 || f.optimizeNodes(), ($ = this.finally) === null || $ === void 0 || $.optimizeNodes(), this;
    }
    optimizeNames(f, $) {
      var R, k;
      return super.optimizeNames(f, $), (R = this.catch) === null || R === void 0 || R.optimizeNames(f, $), (k = this.finally) === null || k === void 0 || k.optimizeNames(f, $), this;
    }
    get names() {
      const f = super.names;
      return this.catch && V(f, this.catch.names), this.finally && V(f, this.finally.names), f;
    }
  }
  class Y extends w {
    constructor(f) {
      super(), this.error = f;
    }
    render(f) {
      return `catch(${this.error})` + super.render(f);
    }
  }
  Y.kind = "catch";
  class J extends w {
    render(f) {
      return "finally" + super.render(f);
    }
  }
  J.kind = "finally";
  class K {
    constructor(f, $ = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...$, _n: $.lines ? `
` : "" }, this._extScope = f, this._scope = new n.Scope({ parent: f }), this._nodes = [new E()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(f) {
      return this._scope.name(f);
    }
    // reserves unique name in the external scope
    scopeName(f) {
      return this._extScope.name(f);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(f, $) {
      const R = this._extScope.value(f, $);
      return (this._values[R.prefix] || (this._values[R.prefix] = /* @__PURE__ */ new Set())).add(R), R;
    }
    getScopeValue(f, $) {
      return this._extScope.getValue(f, $);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(f) {
      return this._extScope.scopeRefs(f, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(f, $, R, k) {
      const D = this._scope.toName($);
      return R !== void 0 && k && (this._constants[D.str] = R), this._leafNode(new c(f, D, R)), D;
    }
    // `const` declaration (`var` in es5 mode)
    const(f, $, R) {
      return this._def(n.varKinds.const, f, $, R);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(f, $, R) {
      return this._def(n.varKinds.let, f, $, R);
    }
    // `var` declaration with optional assignment
    var(f, $, R) {
      return this._def(n.varKinds.var, f, $, R);
    }
    // assignment code
    assign(f, $, R) {
      return this._leafNode(new d(f, $, R));
    }
    // `+=` code
    add(f, $) {
      return this._leafNode(new l(f, e.operators.ADD, $));
    }
    // appends passed SafeExpr to code or executes Block
    code(f) {
      return typeof f == "function" ? f() : f !== r.nil && this._leafNode(new g(f)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...f) {
      const $ = ["{"];
      for (const [R, k] of f)
        $.length > 1 && $.push(","), $.push(R), (R !== k || this.opts.es5) && ($.push(":"), (0, r.addCodeArg)($, k));
      return $.push("}"), new r._Code($);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(f, $, R) {
      if (this._blockNode(new _(f)), $ && R)
        this.code($).else().code(R).endIf();
      else if ($)
        this.code($).endIf();
      else if (R)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(f) {
      return this._elseNode(new _(f));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new m());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(_, m);
    }
    _for(f, $) {
      return this._blockNode(f), $ && this.code($).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(f, $) {
      return this._for(new O(f), $);
    }
    // `for` statement for a range of values
    forRange(f, $, R, k, D = this.opts.es5 ? n.varKinds.var : n.varKinds.let) {
      const H = this._scope.toName(f);
      return this._for(new I(D, H, $, R), () => k(H));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(f, $, R, k = n.varKinds.const) {
      const D = this._scope.toName(f);
      if (this.opts.es5) {
        const H = $ instanceof r.Name ? $ : this.var("_arr", $);
        return this.forRange("_i", 0, (0, r._)`${H}.length`, (U) => {
          this.var(D, (0, r._)`${H}[${U}]`), R(D);
        });
      }
      return this._for(new A("of", k, D, $), () => R(D));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(f, $, R, k = this.opts.es5 ? n.varKinds.var : n.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(f, (0, r._)`Object.keys(${$})`, R);
      const D = this._scope.toName(f);
      return this._for(new A("in", k, D, $), () => R(D));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(S);
    }
    // `label` statement
    label(f) {
      return this._leafNode(new u(f));
    }
    // `break` statement
    break(f) {
      return this._leafNode(new h(f));
    }
    // `return` statement
    return(f) {
      const $ = new z();
      if (this._blockNode($), this.code(f), $.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(z);
    }
    // `try` statement
    try(f, $, R) {
      if (!$ && !R)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const k = new x();
      if (this._blockNode(k), this.code(f), $) {
        const D = this.name("e");
        this._currNode = k.catch = new Y(D), $(D);
      }
      return R && (this._currNode = k.finally = new J(), this.code(R)), this._endBlockNode(Y, J);
    }
    // `throw` statement
    throw(f) {
      return this._leafNode(new p(f));
    }
    // start self-balancing block
    block(f, $) {
      return this._blockStarts.push(this._nodes.length), f && this.code(f).endBlock($), this;
    }
    // end the current self-balancing block
    endBlock(f) {
      const $ = this._blockStarts.pop();
      if ($ === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const R = this._nodes.length - $;
      if (R < 0 || f !== void 0 && R !== f)
        throw new Error(`CodeGen: wrong number of nodes: ${R} vs ${f} expected`);
      return this._nodes.length = $, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(f, $ = r.nil, R, k) {
      return this._blockNode(new F(f, $, R)), k && this.code(k).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(F);
    }
    optimize(f = 1) {
      for (; f-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(f) {
      return this._currNode.nodes.push(f), this;
    }
    _blockNode(f) {
      this._currNode.nodes.push(f), this._nodes.push(f);
    }
    _endBlockNode(f, $) {
      const R = this._currNode;
      if (R instanceof f || $ && R instanceof $)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${$ ? `${f.kind}/${$.kind}` : f.kind}"`);
    }
    _elseNode(f) {
      const $ = this._currNode;
      if (!($ instanceof _))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = $.else = f, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const f = this._nodes;
      return f[f.length - 1];
    }
    set _currNode(f) {
      const $ = this._nodes;
      $[$.length - 1] = f;
    }
  }
  e.CodeGen = K;
  function V(b, f) {
    for (const $ in f)
      b[$] = (b[$] || 0) + (f[$] || 0);
    return b;
  }
  function G(b, f) {
    return f instanceof r._CodeOrName ? V(b, f.names) : b;
  }
  function M(b, f, $) {
    if (b instanceof r.Name)
      return R(b);
    if (!k(b))
      return b;
    return new r._Code(b._items.reduce((D, H) => (H instanceof r.Name && (H = R(H)), H instanceof r._Code ? D.push(...H._items) : D.push(H), D), []));
    function R(D) {
      const H = $[D.str];
      return H === void 0 || f[D.str] !== 1 ? D : (delete f[D.str], H);
    }
    function k(D) {
      return D instanceof r._Code && D._items.some((H) => H instanceof r.Name && f[H.str] === 1 && $[H.str] !== void 0);
    }
  }
  function L(b, f) {
    for (const $ in f)
      b[$] = (b[$] || 0) - (f[$] || 0);
  }
  function N(b) {
    return typeof b == "boolean" || typeof b == "number" || b === null ? !b : (0, r._)`!${P(b)}`;
  }
  e.not = N;
  const C = v(e.operators.AND);
  function j(...b) {
    return b.reduce(C);
  }
  e.and = j;
  const q = v(e.operators.OR);
  function T(...b) {
    return b.reduce(q);
  }
  e.or = T;
  function v(b) {
    return (f, $) => f === r.nil ? $ : $ === r.nil ? f : (0, r._)`${P(f)} ${b} ${P($)}`;
  }
  function P(b) {
    return b instanceof r.Name ? b : (0, r._)`(${b})`;
  }
})(codegen);
var util = {};
Object.defineProperty(util, "__esModule", { value: !0 });
util.checkStrictMode = util.getErrorPath = util.Type = util.useFunc = util.setEvaluated = util.evaluatedPropsToName = util.mergeEvaluated = util.eachItem = util.unescapeJsonPointer = util.escapeJsonPointer = util.escapeFragment = util.unescapeFragment = util.schemaRefOrVal = util.schemaHasRulesButRef = util.schemaHasRules = util.checkUnknownRules = util.alwaysValidSchema = util.toHash = void 0;
const codegen_1$v = codegen, code_1$a = code$1;
function toHash(e) {
  const r = {};
  for (const n of e)
    r[n] = !0;
  return r;
}
util.toHash = toHash;
function alwaysValidSchema(e, r) {
  return typeof r == "boolean" ? r : Object.keys(r).length === 0 ? !0 : (checkUnknownRules(e, r), !schemaHasRules(r, e.self.RULES.all));
}
util.alwaysValidSchema = alwaysValidSchema;
function checkUnknownRules(e, r = e.schema) {
  const { opts: n, self: s } = e;
  if (!n.strictSchema || typeof r == "boolean")
    return;
  const o = s.RULES.keywords;
  for (const a in r)
    o[a] || checkStrictMode(e, `unknown keyword: "${a}"`);
}
util.checkUnknownRules = checkUnknownRules;
function schemaHasRules(e, r) {
  if (typeof e == "boolean")
    return !e;
  for (const n in e)
    if (r[n])
      return !0;
  return !1;
}
util.schemaHasRules = schemaHasRules;
function schemaHasRulesButRef(e, r) {
  if (typeof e == "boolean")
    return !e;
  for (const n in e)
    if (n !== "$ref" && r.all[n])
      return !0;
  return !1;
}
util.schemaHasRulesButRef = schemaHasRulesButRef;
function schemaRefOrVal({ topSchemaRef: e, schemaPath: r }, n, s, o) {
  if (!o) {
    if (typeof n == "number" || typeof n == "boolean")
      return n;
    if (typeof n == "string")
      return (0, codegen_1$v._)`${n}`;
  }
  return (0, codegen_1$v._)`${e}${r}${(0, codegen_1$v.getProperty)(s)}`;
}
util.schemaRefOrVal = schemaRefOrVal;
function unescapeFragment(e) {
  return unescapeJsonPointer(decodeURIComponent(e));
}
util.unescapeFragment = unescapeFragment;
function escapeFragment(e) {
  return encodeURIComponent(escapeJsonPointer(e));
}
util.escapeFragment = escapeFragment;
function escapeJsonPointer(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
util.escapeJsonPointer = escapeJsonPointer;
function unescapeJsonPointer(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
util.unescapeJsonPointer = unescapeJsonPointer;
function eachItem(e, r) {
  if (Array.isArray(e))
    for (const n of e)
      r(n);
  else
    r(e);
}
util.eachItem = eachItem;
function makeMergeEvaluated({ mergeNames: e, mergeToName: r, mergeValues: n, resultToName: s }) {
  return (o, a, c, d) => {
    const l = c === void 0 ? a : c instanceof codegen_1$v.Name ? (a instanceof codegen_1$v.Name ? e(o, a, c) : r(o, a, c), c) : a instanceof codegen_1$v.Name ? (r(o, c, a), a) : n(a, c);
    return d === codegen_1$v.Name && !(l instanceof codegen_1$v.Name) ? s(o, l) : l;
  };
}
util.mergeEvaluated = {
  props: makeMergeEvaluated({
    mergeNames: (e, r, n) => e.if((0, codegen_1$v._)`${n} !== true && ${r} !== undefined`, () => {
      e.if((0, codegen_1$v._)`${r} === true`, () => e.assign(n, !0), () => e.assign(n, (0, codegen_1$v._)`${n} || {}`).code((0, codegen_1$v._)`Object.assign(${n}, ${r})`));
    }),
    mergeToName: (e, r, n) => e.if((0, codegen_1$v._)`${n} !== true`, () => {
      r === !0 ? e.assign(n, !0) : (e.assign(n, (0, codegen_1$v._)`${n} || {}`), setEvaluated(e, n, r));
    }),
    mergeValues: (e, r) => e === !0 ? !0 : { ...e, ...r },
    resultToName: evaluatedPropsToName
  }),
  items: makeMergeEvaluated({
    mergeNames: (e, r, n) => e.if((0, codegen_1$v._)`${n} !== true && ${r} !== undefined`, () => e.assign(n, (0, codegen_1$v._)`${r} === true ? true : ${n} > ${r} ? ${n} : ${r}`)),
    mergeToName: (e, r, n) => e.if((0, codegen_1$v._)`${n} !== true`, () => e.assign(n, r === !0 ? !0 : (0, codegen_1$v._)`${n} > ${r} ? ${n} : ${r}`)),
    mergeValues: (e, r) => e === !0 ? !0 : Math.max(e, r),
    resultToName: (e, r) => e.var("items", r)
  })
};
function evaluatedPropsToName(e, r) {
  if (r === !0)
    return e.var("props", !0);
  const n = e.var("props", (0, codegen_1$v._)`{}`);
  return r !== void 0 && setEvaluated(e, n, r), n;
}
util.evaluatedPropsToName = evaluatedPropsToName;
function setEvaluated(e, r, n) {
  Object.keys(n).forEach((s) => e.assign((0, codegen_1$v._)`${r}${(0, codegen_1$v.getProperty)(s)}`, !0));
}
util.setEvaluated = setEvaluated;
const snippets = {};
function useFunc(e, r) {
  return e.scopeValue("func", {
    ref: r,
    code: snippets[r.code] || (snippets[r.code] = new code_1$a._Code(r.code))
  });
}
util.useFunc = useFunc;
var Type;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Type || (util.Type = Type = {}));
function getErrorPath(e, r, n) {
  if (e instanceof codegen_1$v.Name) {
    const s = r === Type.Num;
    return n ? s ? (0, codegen_1$v._)`"[" + ${e} + "]"` : (0, codegen_1$v._)`"['" + ${e} + "']"` : s ? (0, codegen_1$v._)`"/" + ${e}` : (0, codegen_1$v._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return n ? (0, codegen_1$v.getProperty)(e).toString() : "/" + escapeJsonPointer(e);
}
util.getErrorPath = getErrorPath;
function checkStrictMode(e, r, n = e.opts.strictSchema) {
  if (n) {
    if (r = `strict mode: ${r}`, n === !0)
      throw new Error(r);
    e.self.logger.warn(r);
  }
}
util.checkStrictMode = checkStrictMode;
var names$1 = {};
Object.defineProperty(names$1, "__esModule", { value: !0 });
const codegen_1$u = codegen, names = {
  // validation function arguments
  data: new codegen_1$u.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new codegen_1$u.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new codegen_1$u.Name("instancePath"),
  parentData: new codegen_1$u.Name("parentData"),
  parentDataProperty: new codegen_1$u.Name("parentDataProperty"),
  rootData: new codegen_1$u.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new codegen_1$u.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new codegen_1$u.Name("vErrors"),
  // null or array of validation errors
  errors: new codegen_1$u.Name("errors"),
  // counter of validation errors
  this: new codegen_1$u.Name("this"),
  // "globals"
  self: new codegen_1$u.Name("self"),
  scope: new codegen_1$u.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new codegen_1$u.Name("json"),
  jsonPos: new codegen_1$u.Name("jsonPos"),
  jsonLen: new codegen_1$u.Name("jsonLen"),
  jsonPart: new codegen_1$u.Name("jsonPart")
};
names$1.default = names;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const r = codegen, n = util, s = names$1;
  e.keywordError = {
    message: ({ keyword: m }) => (0, r.str)`must pass "${m}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: m, schemaType: _ }) => _ ? (0, r.str)`"${m}" keyword must be ${_} ($data)` : (0, r.str)`"${m}" keyword is invalid ($data)`
  };
  function o(m, _ = e.keywordError, S, O) {
    const { it: I } = m, { gen: A, compositeRule: F, allErrors: z } = I, x = p(m, _, S);
    O ?? (F || z) ? l(A, x) : u(I, (0, r._)`[${x}]`);
  }
  e.reportError = o;
  function a(m, _ = e.keywordError, S) {
    const { it: O } = m, { gen: I, compositeRule: A, allErrors: F } = O, z = p(m, _, S);
    l(I, z), A || F || u(O, s.default.vErrors);
  }
  e.reportExtraError = a;
  function c(m, _) {
    m.assign(s.default.errors, _), m.if((0, r._)`${s.default.vErrors} !== null`, () => m.if(_, () => m.assign((0, r._)`${s.default.vErrors}.length`, _), () => m.assign(s.default.vErrors, null)));
  }
  e.resetErrorsCount = c;
  function d({ gen: m, keyword: _, schemaValue: S, data: O, errsCount: I, it: A }) {
    if (I === void 0)
      throw new Error("ajv implementation error");
    const F = m.name("err");
    m.forRange("i", I, s.default.errors, (z) => {
      m.const(F, (0, r._)`${s.default.vErrors}[${z}]`), m.if((0, r._)`${F}.instancePath === undefined`, () => m.assign((0, r._)`${F}.instancePath`, (0, r.strConcat)(s.default.instancePath, A.errorPath))), m.assign((0, r._)`${F}.schemaPath`, (0, r.str)`${A.errSchemaPath}/${_}`), A.opts.verbose && (m.assign((0, r._)`${F}.schema`, S), m.assign((0, r._)`${F}.data`, O));
    });
  }
  e.extendErrors = d;
  function l(m, _) {
    const S = m.const("err", _);
    m.if((0, r._)`${s.default.vErrors} === null`, () => m.assign(s.default.vErrors, (0, r._)`[${S}]`), (0, r._)`${s.default.vErrors}.push(${S})`), m.code((0, r._)`${s.default.errors}++`);
  }
  function u(m, _) {
    const { gen: S, validateName: O, schemaEnv: I } = m;
    I.$async ? S.throw((0, r._)`new ${m.ValidationError}(${_})`) : (S.assign((0, r._)`${O}.errors`, _), S.return(!1));
  }
  const h = {
    keyword: new r.Name("keyword"),
    schemaPath: new r.Name("schemaPath"),
    // also used in JTD errors
    params: new r.Name("params"),
    propertyName: new r.Name("propertyName"),
    message: new r.Name("message"),
    schema: new r.Name("schema"),
    parentSchema: new r.Name("parentSchema")
  };
  function p(m, _, S) {
    const { createErrors: O } = m.it;
    return O === !1 ? (0, r._)`{}` : g(m, _, S);
  }
  function g(m, _, S = {}) {
    const { gen: O, it: I } = m, A = [
      y(I, S),
      w(m, S)
    ];
    return E(m, _, A), O.object(...A);
  }
  function y({ errorPath: m }, { instancePath: _ }) {
    const S = _ ? (0, r.str)`${m}${(0, n.getErrorPath)(_, n.Type.Str)}` : m;
    return [s.default.instancePath, (0, r.strConcat)(s.default.instancePath, S)];
  }
  function w({ keyword: m, it: { errSchemaPath: _ } }, { schemaPath: S, parentSchema: O }) {
    let I = O ? _ : (0, r.str)`${_}/${m}`;
    return S && (I = (0, r.str)`${I}${(0, n.getErrorPath)(S, n.Type.Str)}`), [h.schemaPath, I];
  }
  function E(m, { params: _, message: S }, O) {
    const { keyword: I, data: A, schemaValue: F, it: z } = m, { opts: x, propertyName: Y, topSchemaRef: J, schemaPath: K } = z;
    O.push([h.keyword, I], [h.params, typeof _ == "function" ? _(m) : _ || (0, r._)`{}`]), x.messages && O.push([h.message, typeof S == "function" ? S(m) : S]), x.verbose && O.push([h.schema, F], [h.parentSchema, (0, r._)`${J}${K}`], [s.default.data, A]), Y && O.push([h.propertyName, Y]);
  }
})(errors);
Object.defineProperty(boolSchema, "__esModule", { value: !0 });
boolSchema.boolOrEmptySchema = boolSchema.topBoolOrEmptySchema = void 0;
const errors_1$3 = errors, codegen_1$t = codegen, names_1$6 = names$1, boolError = {
  message: "boolean schema is false"
};
function topBoolOrEmptySchema(e) {
  const { gen: r, schema: n, validateName: s } = e;
  n === !1 ? falseSchemaError(e, !1) : typeof n == "object" && n.$async === !0 ? r.return(names_1$6.default.data) : (r.assign((0, codegen_1$t._)`${s}.errors`, null), r.return(!0));
}
boolSchema.topBoolOrEmptySchema = topBoolOrEmptySchema;
function boolOrEmptySchema(e, r) {
  const { gen: n, schema: s } = e;
  s === !1 ? (n.var(r, !1), falseSchemaError(e)) : n.var(r, !0);
}
boolSchema.boolOrEmptySchema = boolOrEmptySchema;
function falseSchemaError(e, r) {
  const { gen: n, data: s } = e, o = {
    gen: n,
    keyword: "false schema",
    data: s,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, errors_1$3.reportError)(o, boolError, void 0, r);
}
var dataType = {}, rules = {};
Object.defineProperty(rules, "__esModule", { value: !0 });
rules.getRules = rules.isJSONType = void 0;
const _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"], jsonTypes = new Set(_jsonTypes);
function isJSONType(e) {
  return typeof e == "string" && jsonTypes.has(e);
}
rules.isJSONType = isJSONType;
function getRules() {
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
rules.getRules = getRules;
var applicability = {};
Object.defineProperty(applicability, "__esModule", { value: !0 });
applicability.shouldUseRule = applicability.shouldUseGroup = applicability.schemaHasRulesForType = void 0;
function schemaHasRulesForType({ schema: e, self: r }, n) {
  const s = r.RULES.types[n];
  return s && s !== !0 && shouldUseGroup(e, s);
}
applicability.schemaHasRulesForType = schemaHasRulesForType;
function shouldUseGroup(e, r) {
  return r.rules.some((n) => shouldUseRule(e, n));
}
applicability.shouldUseGroup = shouldUseGroup;
function shouldUseRule(e, r) {
  var n;
  return e[r.keyword] !== void 0 || ((n = r.definition.implements) === null || n === void 0 ? void 0 : n.some((s) => e[s] !== void 0));
}
applicability.shouldUseRule = shouldUseRule;
Object.defineProperty(dataType, "__esModule", { value: !0 });
dataType.reportTypeError = dataType.checkDataTypes = dataType.checkDataType = dataType.coerceAndCheckDataType = dataType.getJSONTypes = dataType.getSchemaTypes = dataType.DataType = void 0;
const rules_1 = rules, applicability_1$1 = applicability, errors_1$2 = errors, codegen_1$s = codegen, util_1$r = util;
var DataType;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(DataType || (dataType.DataType = DataType = {}));
function getSchemaTypes(e) {
  const r = getJSONTypes(e.type);
  if (r.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!r.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && r.push("null");
  }
  return r;
}
dataType.getSchemaTypes = getSchemaTypes;
function getJSONTypes(e) {
  const r = Array.isArray(e) ? e : e ? [e] : [];
  if (r.every(rules_1.isJSONType))
    return r;
  throw new Error("type must be JSONType or JSONType[]: " + r.join(","));
}
dataType.getJSONTypes = getJSONTypes;
function coerceAndCheckDataType(e, r) {
  const { gen: n, data: s, opts: o } = e, a = coerceToTypes(r, o.coerceTypes), c = r.length > 0 && !(a.length === 0 && r.length === 1 && (0, applicability_1$1.schemaHasRulesForType)(e, r[0]));
  if (c) {
    const d = checkDataTypes(r, s, o.strictNumbers, DataType.Wrong);
    n.if(d, () => {
      a.length ? coerceData(e, r, a) : reportTypeError(e);
    });
  }
  return c;
}
dataType.coerceAndCheckDataType = coerceAndCheckDataType;
const COERCIBLE = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function coerceToTypes(e, r) {
  return r ? e.filter((n) => COERCIBLE.has(n) || r === "array" && n === "array") : [];
}
function coerceData(e, r, n) {
  const { gen: s, data: o, opts: a } = e, c = s.let("dataType", (0, codegen_1$s._)`typeof ${o}`), d = s.let("coerced", (0, codegen_1$s._)`undefined`);
  a.coerceTypes === "array" && s.if((0, codegen_1$s._)`${c} == 'object' && Array.isArray(${o}) && ${o}.length == 1`, () => s.assign(o, (0, codegen_1$s._)`${o}[0]`).assign(c, (0, codegen_1$s._)`typeof ${o}`).if(checkDataTypes(r, o, a.strictNumbers), () => s.assign(d, o))), s.if((0, codegen_1$s._)`${d} !== undefined`);
  for (const u of n)
    (COERCIBLE.has(u) || u === "array" && a.coerceTypes === "array") && l(u);
  s.else(), reportTypeError(e), s.endIf(), s.if((0, codegen_1$s._)`${d} !== undefined`, () => {
    s.assign(o, d), assignParentData(e, d);
  });
  function l(u) {
    switch (u) {
      case "string":
        s.elseIf((0, codegen_1$s._)`${c} == "number" || ${c} == "boolean"`).assign(d, (0, codegen_1$s._)`"" + ${o}`).elseIf((0, codegen_1$s._)`${o} === null`).assign(d, (0, codegen_1$s._)`""`);
        return;
      case "number":
        s.elseIf((0, codegen_1$s._)`${c} == "boolean" || ${o} === null
              || (${c} == "string" && ${o} && ${o} == +${o})`).assign(d, (0, codegen_1$s._)`+${o}`);
        return;
      case "integer":
        s.elseIf((0, codegen_1$s._)`${c} === "boolean" || ${o} === null
              || (${c} === "string" && ${o} && ${o} == +${o} && !(${o} % 1))`).assign(d, (0, codegen_1$s._)`+${o}`);
        return;
      case "boolean":
        s.elseIf((0, codegen_1$s._)`${o} === "false" || ${o} === 0 || ${o} === null`).assign(d, !1).elseIf((0, codegen_1$s._)`${o} === "true" || ${o} === 1`).assign(d, !0);
        return;
      case "null":
        s.elseIf((0, codegen_1$s._)`${o} === "" || ${o} === 0 || ${o} === false`), s.assign(d, null);
        return;
      case "array":
        s.elseIf((0, codegen_1$s._)`${c} === "string" || ${c} === "number"
              || ${c} === "boolean" || ${o} === null`).assign(d, (0, codegen_1$s._)`[${o}]`);
    }
  }
}
function assignParentData({ gen: e, parentData: r, parentDataProperty: n }, s) {
  e.if((0, codegen_1$s._)`${r} !== undefined`, () => e.assign((0, codegen_1$s._)`${r}[${n}]`, s));
}
function checkDataType(e, r, n, s = DataType.Correct) {
  const o = s === DataType.Correct ? codegen_1$s.operators.EQ : codegen_1$s.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, codegen_1$s._)`${r} ${o} null`;
    case "array":
      a = (0, codegen_1$s._)`Array.isArray(${r})`;
      break;
    case "object":
      a = (0, codegen_1$s._)`${r} && typeof ${r} == "object" && !Array.isArray(${r})`;
      break;
    case "integer":
      a = c((0, codegen_1$s._)`!(${r} % 1) && !isNaN(${r})`);
      break;
    case "number":
      a = c();
      break;
    default:
      return (0, codegen_1$s._)`typeof ${r} ${o} ${e}`;
  }
  return s === DataType.Correct ? a : (0, codegen_1$s.not)(a);
  function c(d = codegen_1$s.nil) {
    return (0, codegen_1$s.and)((0, codegen_1$s._)`typeof ${r} == "number"`, d, n ? (0, codegen_1$s._)`isFinite(${r})` : codegen_1$s.nil);
  }
}
dataType.checkDataType = checkDataType;
function checkDataTypes(e, r, n, s) {
  if (e.length === 1)
    return checkDataType(e[0], r, n, s);
  let o;
  const a = (0, util_1$r.toHash)(e);
  if (a.array && a.object) {
    const c = (0, codegen_1$s._)`typeof ${r} != "object"`;
    o = a.null ? c : (0, codegen_1$s._)`!${r} || ${c}`, delete a.null, delete a.array, delete a.object;
  } else
    o = codegen_1$s.nil;
  a.number && delete a.integer;
  for (const c in a)
    o = (0, codegen_1$s.and)(o, checkDataType(c, r, n, s));
  return o;
}
dataType.checkDataTypes = checkDataTypes;
const typeError = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: r }) => typeof e == "string" ? (0, codegen_1$s._)`{type: ${e}}` : (0, codegen_1$s._)`{type: ${r}}`
};
function reportTypeError(e) {
  const r = getTypeErrorContext(e);
  (0, errors_1$2.reportError)(r, typeError);
}
dataType.reportTypeError = reportTypeError;
function getTypeErrorContext(e) {
  const { gen: r, data: n, schema: s } = e, o = (0, util_1$r.schemaRefOrVal)(e, s, "type");
  return {
    gen: r,
    keyword: "type",
    data: n,
    schema: s.type,
    schemaCode: o,
    schemaValue: o,
    parentSchema: s,
    params: {},
    it: e
  };
}
var defaults$4 = {};
Object.defineProperty(defaults$4, "__esModule", { value: !0 });
defaults$4.assignDefaults = void 0;
const codegen_1$r = codegen, util_1$q = util;
function assignDefaults(e, r) {
  const { properties: n, items: s } = e.schema;
  if (r === "object" && n)
    for (const o in n)
      assignDefault(e, o, n[o].default);
  else r === "array" && Array.isArray(s) && s.forEach((o, a) => assignDefault(e, a, o.default));
}
defaults$4.assignDefaults = assignDefaults;
function assignDefault(e, r, n) {
  const { gen: s, compositeRule: o, data: a, opts: c } = e;
  if (n === void 0)
    return;
  const d = (0, codegen_1$r._)`${a}${(0, codegen_1$r.getProperty)(r)}`;
  if (o) {
    (0, util_1$q.checkStrictMode)(e, `default is ignored for: ${d}`);
    return;
  }
  let l = (0, codegen_1$r._)`${d} === undefined`;
  c.useDefaults === "empty" && (l = (0, codegen_1$r._)`${l} || ${d} === null || ${d} === ""`), s.if(l, (0, codegen_1$r._)`${d} = ${(0, codegen_1$r.stringify)(n)}`);
}
var keyword = {}, code = {};
Object.defineProperty(code, "__esModule", { value: !0 });
code.validateUnion = code.validateArray = code.usePattern = code.callValidateCode = code.schemaProperties = code.allSchemaProperties = code.noPropertyInData = code.propertyInData = code.isOwnProperty = code.hasPropFunc = code.reportMissingProp = code.checkMissingProp = code.checkReportMissingProp = void 0;
const codegen_1$q = codegen, util_1$p = util, names_1$5 = names$1, util_2$1 = util;
function checkReportMissingProp(e, r) {
  const { gen: n, data: s, it: o } = e;
  n.if(noPropertyInData(n, s, r, o.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, codegen_1$q._)`${r}` }, !0), e.error();
  });
}
code.checkReportMissingProp = checkReportMissingProp;
function checkMissingProp({ gen: e, data: r, it: { opts: n } }, s, o) {
  return (0, codegen_1$q.or)(...s.map((a) => (0, codegen_1$q.and)(noPropertyInData(e, r, a, n.ownProperties), (0, codegen_1$q._)`${o} = ${a}`)));
}
code.checkMissingProp = checkMissingProp;
function reportMissingProp(e, r) {
  e.setParams({ missingProperty: r }, !0), e.error();
}
code.reportMissingProp = reportMissingProp;
function hasPropFunc(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, codegen_1$q._)`Object.prototype.hasOwnProperty`
  });
}
code.hasPropFunc = hasPropFunc;
function isOwnProperty(e, r, n) {
  return (0, codegen_1$q._)`${hasPropFunc(e)}.call(${r}, ${n})`;
}
code.isOwnProperty = isOwnProperty;
function propertyInData(e, r, n, s) {
  const o = (0, codegen_1$q._)`${r}${(0, codegen_1$q.getProperty)(n)} !== undefined`;
  return s ? (0, codegen_1$q._)`${o} && ${isOwnProperty(e, r, n)}` : o;
}
code.propertyInData = propertyInData;
function noPropertyInData(e, r, n, s) {
  const o = (0, codegen_1$q._)`${r}${(0, codegen_1$q.getProperty)(n)} === undefined`;
  return s ? (0, codegen_1$q.or)(o, (0, codegen_1$q.not)(isOwnProperty(e, r, n))) : o;
}
code.noPropertyInData = noPropertyInData;
function allSchemaProperties(e) {
  return e ? Object.keys(e).filter((r) => r !== "__proto__") : [];
}
code.allSchemaProperties = allSchemaProperties;
function schemaProperties(e, r) {
  return allSchemaProperties(r).filter((n) => !(0, util_1$p.alwaysValidSchema)(e, r[n]));
}
code.schemaProperties = schemaProperties;
function callValidateCode({ schemaCode: e, data: r, it: { gen: n, topSchemaRef: s, schemaPath: o, errorPath: a }, it: c }, d, l, u) {
  const h = u ? (0, codegen_1$q._)`${e}, ${r}, ${s}${o}` : r, p = [
    [names_1$5.default.instancePath, (0, codegen_1$q.strConcat)(names_1$5.default.instancePath, a)],
    [names_1$5.default.parentData, c.parentData],
    [names_1$5.default.parentDataProperty, c.parentDataProperty],
    [names_1$5.default.rootData, names_1$5.default.rootData]
  ];
  c.opts.dynamicRef && p.push([names_1$5.default.dynamicAnchors, names_1$5.default.dynamicAnchors]);
  const g = (0, codegen_1$q._)`${h}, ${n.object(...p)}`;
  return l !== codegen_1$q.nil ? (0, codegen_1$q._)`${d}.call(${l}, ${g})` : (0, codegen_1$q._)`${d}(${g})`;
}
code.callValidateCode = callValidateCode;
const newRegExp = (0, codegen_1$q._)`new RegExp`;
function usePattern({ gen: e, it: { opts: r } }, n) {
  const s = r.unicodeRegExp ? "u" : "", { regExp: o } = r.code, a = o(n, s);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, codegen_1$q._)`${o.code === "new RegExp" ? newRegExp : (0, util_2$1.useFunc)(e, o)}(${n}, ${s})`
  });
}
code.usePattern = usePattern;
function validateArray(e) {
  const { gen: r, data: n, keyword: s, it: o } = e, a = r.name("valid");
  if (o.allErrors) {
    const d = r.let("valid", !0);
    return c(() => r.assign(d, !1)), d;
  }
  return r.var(a, !0), c(() => r.break()), a;
  function c(d) {
    const l = r.const("len", (0, codegen_1$q._)`${n}.length`);
    r.forRange("i", 0, l, (u) => {
      e.subschema({
        keyword: s,
        dataProp: u,
        dataPropType: util_1$p.Type.Num
      }, a), r.if((0, codegen_1$q.not)(a), d);
    });
  }
}
code.validateArray = validateArray;
function validateUnion(e) {
  const { gen: r, schema: n, keyword: s, it: o } = e;
  if (!Array.isArray(n))
    throw new Error("ajv implementation error");
  if (n.some((l) => (0, util_1$p.alwaysValidSchema)(o, l)) && !o.opts.unevaluated)
    return;
  const c = r.let("valid", !1), d = r.name("_valid");
  r.block(() => n.forEach((l, u) => {
    const h = e.subschema({
      keyword: s,
      schemaProp: u,
      compositeRule: !0
    }, d);
    r.assign(c, (0, codegen_1$q._)`${c} || ${d}`), e.mergeValidEvaluated(h, d) || r.if((0, codegen_1$q.not)(c));
  })), e.result(c, () => e.reset(), () => e.error(!0));
}
code.validateUnion = validateUnion;
Object.defineProperty(keyword, "__esModule", { value: !0 });
keyword.validateKeywordUsage = keyword.validSchemaType = keyword.funcKeywordCode = keyword.macroKeywordCode = void 0;
const codegen_1$p = codegen, names_1$4 = names$1, code_1$9 = code, errors_1$1 = errors;
function macroKeywordCode(e, r) {
  const { gen: n, keyword: s, schema: o, parentSchema: a, it: c } = e, d = r.macro.call(c.self, o, a, c), l = useKeyword(n, s, d);
  c.opts.validateSchema !== !1 && c.self.validateSchema(d, !0);
  const u = n.name("valid");
  e.subschema({
    schema: d,
    schemaPath: codegen_1$p.nil,
    errSchemaPath: `${c.errSchemaPath}/${s}`,
    topSchemaRef: l,
    compositeRule: !0
  }, u), e.pass(u, () => e.error(!0));
}
keyword.macroKeywordCode = macroKeywordCode;
function funcKeywordCode(e, r) {
  var n;
  const { gen: s, keyword: o, schema: a, parentSchema: c, $data: d, it: l } = e;
  checkAsyncKeyword(l, r);
  const u = !d && r.compile ? r.compile.call(l.self, a, c, l) : r.validate, h = useKeyword(s, o, u), p = s.let("valid");
  e.block$data(p, g), e.ok((n = r.valid) !== null && n !== void 0 ? n : p);
  function g() {
    if (r.errors === !1)
      E(), r.modifying && modifyData(e), m(() => e.error());
    else {
      const _ = r.async ? y() : w();
      r.modifying && modifyData(e), m(() => addErrs(e, _));
    }
  }
  function y() {
    const _ = s.let("ruleErrs", null);
    return s.try(() => E((0, codegen_1$p._)`await `), (S) => s.assign(p, !1).if((0, codegen_1$p._)`${S} instanceof ${l.ValidationError}`, () => s.assign(_, (0, codegen_1$p._)`${S}.errors`), () => s.throw(S))), _;
  }
  function w() {
    const _ = (0, codegen_1$p._)`${h}.errors`;
    return s.assign(_, null), E(codegen_1$p.nil), _;
  }
  function E(_ = r.async ? (0, codegen_1$p._)`await ` : codegen_1$p.nil) {
    const S = l.opts.passContext ? names_1$4.default.this : names_1$4.default.self, O = !("compile" in r && !d || r.schema === !1);
    s.assign(p, (0, codegen_1$p._)`${_}${(0, code_1$9.callValidateCode)(e, h, S, O)}`, r.modifying);
  }
  function m(_) {
    var S;
    s.if((0, codegen_1$p.not)((S = r.valid) !== null && S !== void 0 ? S : p), _);
  }
}
keyword.funcKeywordCode = funcKeywordCode;
function modifyData(e) {
  const { gen: r, data: n, it: s } = e;
  r.if(s.parentData, () => r.assign(n, (0, codegen_1$p._)`${s.parentData}[${s.parentDataProperty}]`));
}
function addErrs(e, r) {
  const { gen: n } = e;
  n.if((0, codegen_1$p._)`Array.isArray(${r})`, () => {
    n.assign(names_1$4.default.vErrors, (0, codegen_1$p._)`${names_1$4.default.vErrors} === null ? ${r} : ${names_1$4.default.vErrors}.concat(${r})`).assign(names_1$4.default.errors, (0, codegen_1$p._)`${names_1$4.default.vErrors}.length`), (0, errors_1$1.extendErrors)(e);
  }, () => e.error());
}
function checkAsyncKeyword({ schemaEnv: e }, r) {
  if (r.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function useKeyword(e, r, n) {
  if (n === void 0)
    throw new Error(`keyword "${r}" failed to compile`);
  return e.scopeValue("keyword", typeof n == "function" ? { ref: n } : { ref: n, code: (0, codegen_1$p.stringify)(n) });
}
function validSchemaType(e, r, n = !1) {
  return !r.length || r.some((s) => s === "array" ? Array.isArray(e) : s === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == s || n && typeof e > "u");
}
keyword.validSchemaType = validSchemaType;
function validateKeywordUsage({ schema: e, opts: r, self: n, errSchemaPath: s }, o, a) {
  if (Array.isArray(o.keyword) ? !o.keyword.includes(a) : o.keyword !== a)
    throw new Error("ajv implementation error");
  const c = o.dependencies;
  if (c != null && c.some((d) => !Object.prototype.hasOwnProperty.call(e, d)))
    throw new Error(`parent schema must have dependencies of ${a}: ${c.join(",")}`);
  if (o.validateSchema && !o.validateSchema(e[a])) {
    const l = `keyword "${a}" value is invalid at path "${s}": ` + n.errorsText(o.validateSchema.errors);
    if (r.validateSchema === "log")
      n.logger.error(l);
    else
      throw new Error(l);
  }
}
keyword.validateKeywordUsage = validateKeywordUsage;
var subschema = {};
Object.defineProperty(subschema, "__esModule", { value: !0 });
subschema.extendSubschemaMode = subschema.extendSubschemaData = subschema.getSubschema = void 0;
const codegen_1$o = codegen, util_1$o = util;
function getSubschema(e, { keyword: r, schemaProp: n, schema: s, schemaPath: o, errSchemaPath: a, topSchemaRef: c }) {
  if (r !== void 0 && s !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (r !== void 0) {
    const d = e.schema[r];
    return n === void 0 ? {
      schema: d,
      schemaPath: (0, codegen_1$o._)`${e.schemaPath}${(0, codegen_1$o.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${r}`
    } : {
      schema: d[n],
      schemaPath: (0, codegen_1$o._)`${e.schemaPath}${(0, codegen_1$o.getProperty)(r)}${(0, codegen_1$o.getProperty)(n)}`,
      errSchemaPath: `${e.errSchemaPath}/${r}/${(0, util_1$o.escapeFragment)(n)}`
    };
  }
  if (s !== void 0) {
    if (o === void 0 || a === void 0 || c === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: s,
      schemaPath: o,
      topSchemaRef: c,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
subschema.getSubschema = getSubschema;
function extendSubschemaData(e, r, { dataProp: n, dataPropType: s, data: o, dataTypes: a, propertyName: c }) {
  if (o !== void 0 && n !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: d } = r;
  if (n !== void 0) {
    const { errorPath: u, dataPathArr: h, opts: p } = r, g = d.let("data", (0, codegen_1$o._)`${r.data}${(0, codegen_1$o.getProperty)(n)}`, !0);
    l(g), e.errorPath = (0, codegen_1$o.str)`${u}${(0, util_1$o.getErrorPath)(n, s, p.jsPropertySyntax)}`, e.parentDataProperty = (0, codegen_1$o._)`${n}`, e.dataPathArr = [...h, e.parentDataProperty];
  }
  if (o !== void 0) {
    const u = o instanceof codegen_1$o.Name ? o : d.let("data", o, !0);
    l(u), c !== void 0 && (e.propertyName = c);
  }
  a && (e.dataTypes = a);
  function l(u) {
    e.data = u, e.dataLevel = r.dataLevel + 1, e.dataTypes = [], r.definedProperties = /* @__PURE__ */ new Set(), e.parentData = r.data, e.dataNames = [...r.dataNames, u];
  }
}
subschema.extendSubschemaData = extendSubschemaData;
function extendSubschemaMode(e, { jtdDiscriminator: r, jtdMetadata: n, compositeRule: s, createErrors: o, allErrors: a }) {
  s !== void 0 && (e.compositeRule = s), o !== void 0 && (e.createErrors = o), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = r, e.jtdMetadata = n;
}
subschema.extendSubschemaMode = extendSubschemaMode;
var resolve$1 = {}, jsonSchemaTraverse = { exports: {} }, traverse$1 = jsonSchemaTraverse.exports = function(e, r, n) {
  typeof r == "function" && (n = r, r = {}), n = r.cb || n;
  var s = typeof n == "function" ? n : n.pre || function() {
  }, o = n.post || function() {
  };
  _traverse(r, s, o, e, "", e);
};
traverse$1.keywords = {
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
traverse$1.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
traverse$1.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
traverse$1.skipKeywords = {
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
function _traverse(e, r, n, s, o, a, c, d, l, u) {
  if (s && typeof s == "object" && !Array.isArray(s)) {
    r(s, o, a, c, d, l, u);
    for (var h in s) {
      var p = s[h];
      if (Array.isArray(p)) {
        if (h in traverse$1.arrayKeywords)
          for (var g = 0; g < p.length; g++)
            _traverse(e, r, n, p[g], o + "/" + h + "/" + g, a, o, h, s, g);
      } else if (h in traverse$1.propsKeywords) {
        if (p && typeof p == "object")
          for (var y in p)
            _traverse(e, r, n, p[y], o + "/" + h + "/" + escapeJsonPtr(y), a, o, h, s, y);
      } else (h in traverse$1.keywords || e.allKeys && !(h in traverse$1.skipKeywords)) && _traverse(e, r, n, p, o + "/" + h, a, o, h, s);
    }
    n(s, o, a, c, d, l, u);
  }
}
function escapeJsonPtr(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var jsonSchemaTraverseExports = jsonSchemaTraverse.exports;
Object.defineProperty(resolve$1, "__esModule", { value: !0 });
resolve$1.getSchemaRefs = resolve$1.resolveUrl = resolve$1.normalizeId = resolve$1._getFullPath = resolve$1.getFullPath = resolve$1.inlineRef = void 0;
const util_1$n = util, equal$2 = fastDeepEqual, traverse = jsonSchemaTraverseExports, SIMPLE_INLINED = /* @__PURE__ */ new Set([
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
function inlineRef(e, r = !0) {
  return typeof e == "boolean" ? !0 : r === !0 ? !hasRef(e) : r ? countKeys(e) <= r : !1;
}
resolve$1.inlineRef = inlineRef;
const REF_KEYWORDS = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function hasRef(e) {
  for (const r in e) {
    if (REF_KEYWORDS.has(r))
      return !0;
    const n = e[r];
    if (Array.isArray(n) && n.some(hasRef) || typeof n == "object" && hasRef(n))
      return !0;
  }
  return !1;
}
function countKeys(e) {
  let r = 0;
  for (const n in e) {
    if (n === "$ref")
      return 1 / 0;
    if (r++, !SIMPLE_INLINED.has(n) && (typeof e[n] == "object" && (0, util_1$n.eachItem)(e[n], (s) => r += countKeys(s)), r === 1 / 0))
      return 1 / 0;
  }
  return r;
}
function getFullPath(e, r = "", n) {
  n !== !1 && (r = normalizeId(r));
  const s = e.parse(r);
  return _getFullPath(e, s);
}
resolve$1.getFullPath = getFullPath;
function _getFullPath(e, r) {
  return e.serialize(r).split("#")[0] + "#";
}
resolve$1._getFullPath = _getFullPath;
const TRAILING_SLASH_HASH = /#\/?$/;
function normalizeId(e) {
  return e ? e.replace(TRAILING_SLASH_HASH, "") : "";
}
resolve$1.normalizeId = normalizeId;
function resolveUrl(e, r, n) {
  return n = normalizeId(n), e.resolve(r, n);
}
resolve$1.resolveUrl = resolveUrl;
const ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
function getSchemaRefs(e, r) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: n, uriResolver: s } = this.opts, o = normalizeId(e[n] || r), a = { "": o }, c = getFullPath(s, o, !1), d = {}, l = /* @__PURE__ */ new Set();
  return traverse(e, { allKeys: !0 }, (p, g, y, w) => {
    if (w === void 0)
      return;
    const E = c + g;
    let m = a[w];
    typeof p[n] == "string" && (m = _.call(this, p[n])), S.call(this, p.$anchor), S.call(this, p.$dynamicAnchor), a[g] = m;
    function _(O) {
      const I = this.opts.uriResolver.resolve;
      if (O = normalizeId(m ? I(m, O) : O), l.has(O))
        throw h(O);
      l.add(O);
      let A = this.refs[O];
      return typeof A == "string" && (A = this.refs[A]), typeof A == "object" ? u(p, A.schema, O) : O !== normalizeId(E) && (O[0] === "#" ? (u(p, d[O], O), d[O] = p) : this.refs[O] = E), O;
    }
    function S(O) {
      if (typeof O == "string") {
        if (!ANCHOR.test(O))
          throw new Error(`invalid anchor "${O}"`);
        _.call(this, `#${O}`);
      }
    }
  }), d;
  function u(p, g, y) {
    if (g !== void 0 && !equal$2(p, g))
      throw h(y);
  }
  function h(p) {
    return new Error(`reference "${p}" resolves to more than one schema`);
  }
}
resolve$1.getSchemaRefs = getSchemaRefs;
Object.defineProperty(validate, "__esModule", { value: !0 });
validate.getData = validate.KeywordCxt = validate.validateFunctionCode = void 0;
const boolSchema_1 = boolSchema, dataType_1$1 = dataType, applicability_1 = applicability, dataType_2 = dataType, defaults_1$1 = defaults$4, keyword_1 = keyword, subschema_1 = subschema, codegen_1$n = codegen, names_1$3 = names$1, resolve_1$2 = resolve$1, util_1$m = util, errors_1 = errors;
function validateFunctionCode(e) {
  if (isSchemaObj(e) && (checkKeywords(e), schemaCxtHasRules(e))) {
    topSchemaObjCode(e);
    return;
  }
  validateFunction(e, () => (0, boolSchema_1.topBoolOrEmptySchema)(e));
}
validate.validateFunctionCode = validateFunctionCode;
function validateFunction({ gen: e, validateName: r, schema: n, schemaEnv: s, opts: o }, a) {
  o.code.es5 ? e.func(r, (0, codegen_1$n._)`${names_1$3.default.data}, ${names_1$3.default.valCxt}`, s.$async, () => {
    e.code((0, codegen_1$n._)`"use strict"; ${funcSourceUrl(n, o)}`), destructureValCxtES5(e, o), e.code(a);
  }) : e.func(r, (0, codegen_1$n._)`${names_1$3.default.data}, ${destructureValCxt(o)}`, s.$async, () => e.code(funcSourceUrl(n, o)).code(a));
}
function destructureValCxt(e) {
  return (0, codegen_1$n._)`{${names_1$3.default.instancePath}="", ${names_1$3.default.parentData}, ${names_1$3.default.parentDataProperty}, ${names_1$3.default.rootData}=${names_1$3.default.data}${e.dynamicRef ? (0, codegen_1$n._)`, ${names_1$3.default.dynamicAnchors}={}` : codegen_1$n.nil}}={}`;
}
function destructureValCxtES5(e, r) {
  e.if(names_1$3.default.valCxt, () => {
    e.var(names_1$3.default.instancePath, (0, codegen_1$n._)`${names_1$3.default.valCxt}.${names_1$3.default.instancePath}`), e.var(names_1$3.default.parentData, (0, codegen_1$n._)`${names_1$3.default.valCxt}.${names_1$3.default.parentData}`), e.var(names_1$3.default.parentDataProperty, (0, codegen_1$n._)`${names_1$3.default.valCxt}.${names_1$3.default.parentDataProperty}`), e.var(names_1$3.default.rootData, (0, codegen_1$n._)`${names_1$3.default.valCxt}.${names_1$3.default.rootData}`), r.dynamicRef && e.var(names_1$3.default.dynamicAnchors, (0, codegen_1$n._)`${names_1$3.default.valCxt}.${names_1$3.default.dynamicAnchors}`);
  }, () => {
    e.var(names_1$3.default.instancePath, (0, codegen_1$n._)`""`), e.var(names_1$3.default.parentData, (0, codegen_1$n._)`undefined`), e.var(names_1$3.default.parentDataProperty, (0, codegen_1$n._)`undefined`), e.var(names_1$3.default.rootData, names_1$3.default.data), r.dynamicRef && e.var(names_1$3.default.dynamicAnchors, (0, codegen_1$n._)`{}`);
  });
}
function topSchemaObjCode(e) {
  const { schema: r, opts: n, gen: s } = e;
  validateFunction(e, () => {
    n.$comment && r.$comment && commentKeyword(e), checkNoDefault(e), s.let(names_1$3.default.vErrors, null), s.let(names_1$3.default.errors, 0), n.unevaluated && resetEvaluated(e), typeAndKeywords(e), returnResults(e);
  });
}
function resetEvaluated(e) {
  const { gen: r, validateName: n } = e;
  e.evaluated = r.const("evaluated", (0, codegen_1$n._)`${n}.evaluated`), r.if((0, codegen_1$n._)`${e.evaluated}.dynamicProps`, () => r.assign((0, codegen_1$n._)`${e.evaluated}.props`, (0, codegen_1$n._)`undefined`)), r.if((0, codegen_1$n._)`${e.evaluated}.dynamicItems`, () => r.assign((0, codegen_1$n._)`${e.evaluated}.items`, (0, codegen_1$n._)`undefined`));
}
function funcSourceUrl(e, r) {
  const n = typeof e == "object" && e[r.schemaId];
  return n && (r.code.source || r.code.process) ? (0, codegen_1$n._)`/*# sourceURL=${n} */` : codegen_1$n.nil;
}
function subschemaCode(e, r) {
  if (isSchemaObj(e) && (checkKeywords(e), schemaCxtHasRules(e))) {
    subSchemaObjCode(e, r);
    return;
  }
  (0, boolSchema_1.boolOrEmptySchema)(e, r);
}
function schemaCxtHasRules({ schema: e, self: r }) {
  if (typeof e == "boolean")
    return !e;
  for (const n in e)
    if (r.RULES.all[n])
      return !0;
  return !1;
}
function isSchemaObj(e) {
  return typeof e.schema != "boolean";
}
function subSchemaObjCode(e, r) {
  const { schema: n, gen: s, opts: o } = e;
  o.$comment && n.$comment && commentKeyword(e), updateContext(e), checkAsyncSchema(e);
  const a = s.const("_errs", names_1$3.default.errors);
  typeAndKeywords(e, a), s.var(r, (0, codegen_1$n._)`${a} === ${names_1$3.default.errors}`);
}
function checkKeywords(e) {
  (0, util_1$m.checkUnknownRules)(e), checkRefsAndKeywords(e);
}
function typeAndKeywords(e, r) {
  if (e.opts.jtd)
    return schemaKeywords(e, [], !1, r);
  const n = (0, dataType_1$1.getSchemaTypes)(e.schema), s = (0, dataType_1$1.coerceAndCheckDataType)(e, n);
  schemaKeywords(e, n, !s, r);
}
function checkRefsAndKeywords(e) {
  const { schema: r, errSchemaPath: n, opts: s, self: o } = e;
  r.$ref && s.ignoreKeywordsWithRef && (0, util_1$m.schemaHasRulesButRef)(r, o.RULES) && o.logger.warn(`$ref: keywords ignored in schema at path "${n}"`);
}
function checkNoDefault(e) {
  const { schema: r, opts: n } = e;
  r.default !== void 0 && n.useDefaults && n.strictSchema && (0, util_1$m.checkStrictMode)(e, "default is ignored in the schema root");
}
function updateContext(e) {
  const r = e.schema[e.opts.schemaId];
  r && (e.baseId = (0, resolve_1$2.resolveUrl)(e.opts.uriResolver, e.baseId, r));
}
function checkAsyncSchema(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function commentKeyword({ gen: e, schemaEnv: r, schema: n, errSchemaPath: s, opts: o }) {
  const a = n.$comment;
  if (o.$comment === !0)
    e.code((0, codegen_1$n._)`${names_1$3.default.self}.logger.log(${a})`);
  else if (typeof o.$comment == "function") {
    const c = (0, codegen_1$n.str)`${s}/$comment`, d = e.scopeValue("root", { ref: r.root });
    e.code((0, codegen_1$n._)`${names_1$3.default.self}.opts.$comment(${a}, ${c}, ${d}.schema)`);
  }
}
function returnResults(e) {
  const { gen: r, schemaEnv: n, validateName: s, ValidationError: o, opts: a } = e;
  n.$async ? r.if((0, codegen_1$n._)`${names_1$3.default.errors} === 0`, () => r.return(names_1$3.default.data), () => r.throw((0, codegen_1$n._)`new ${o}(${names_1$3.default.vErrors})`)) : (r.assign((0, codegen_1$n._)`${s}.errors`, names_1$3.default.vErrors), a.unevaluated && assignEvaluated(e), r.return((0, codegen_1$n._)`${names_1$3.default.errors} === 0`));
}
function assignEvaluated({ gen: e, evaluated: r, props: n, items: s }) {
  n instanceof codegen_1$n.Name && e.assign((0, codegen_1$n._)`${r}.props`, n), s instanceof codegen_1$n.Name && e.assign((0, codegen_1$n._)`${r}.items`, s);
}
function schemaKeywords(e, r, n, s) {
  const { gen: o, schema: a, data: c, allErrors: d, opts: l, self: u } = e, { RULES: h } = u;
  if (a.$ref && (l.ignoreKeywordsWithRef || !(0, util_1$m.schemaHasRulesButRef)(a, h))) {
    o.block(() => keywordCode(e, "$ref", h.all.$ref.definition));
    return;
  }
  l.jtd || checkStrictTypes(e, r), o.block(() => {
    for (const g of h.rules)
      p(g);
    p(h.post);
  });
  function p(g) {
    (0, applicability_1.shouldUseGroup)(a, g) && (g.type ? (o.if((0, dataType_2.checkDataType)(g.type, c, l.strictNumbers)), iterateKeywords(e, g), r.length === 1 && r[0] === g.type && n && (o.else(), (0, dataType_2.reportTypeError)(e)), o.endIf()) : iterateKeywords(e, g), d || o.if((0, codegen_1$n._)`${names_1$3.default.errors} === ${s || 0}`));
  }
}
function iterateKeywords(e, r) {
  const { gen: n, schema: s, opts: { useDefaults: o } } = e;
  o && (0, defaults_1$1.assignDefaults)(e, r.type), n.block(() => {
    for (const a of r.rules)
      (0, applicability_1.shouldUseRule)(s, a) && keywordCode(e, a.keyword, a.definition, r.type);
  });
}
function checkStrictTypes(e, r) {
  e.schemaEnv.meta || !e.opts.strictTypes || (checkContextTypes(e, r), e.opts.allowUnionTypes || checkMultipleTypes(e, r), checkKeywordTypes(e, e.dataTypes));
}
function checkContextTypes(e, r) {
  if (r.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = r;
      return;
    }
    r.forEach((n) => {
      includesType(e.dataTypes, n) || strictTypesError(e, `type "${n}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), narrowSchemaTypes(e, r);
  }
}
function checkMultipleTypes(e, r) {
  r.length > 1 && !(r.length === 2 && r.includes("null")) && strictTypesError(e, "use allowUnionTypes to allow union type keyword");
}
function checkKeywordTypes(e, r) {
  const n = e.self.RULES.all;
  for (const s in n) {
    const o = n[s];
    if (typeof o == "object" && (0, applicability_1.shouldUseRule)(e.schema, o)) {
      const { type: a } = o.definition;
      a.length && !a.some((c) => hasApplicableType(r, c)) && strictTypesError(e, `missing type "${a.join(",")}" for keyword "${s}"`);
    }
  }
}
function hasApplicableType(e, r) {
  return e.includes(r) || r === "number" && e.includes("integer");
}
function includesType(e, r) {
  return e.includes(r) || r === "integer" && e.includes("number");
}
function narrowSchemaTypes(e, r) {
  const n = [];
  for (const s of e.dataTypes)
    includesType(r, s) ? n.push(s) : r.includes("integer") && s === "number" && n.push("integer");
  e.dataTypes = n;
}
function strictTypesError(e, r) {
  const n = e.schemaEnv.baseId + e.errSchemaPath;
  r += ` at "${n}" (strictTypes)`, (0, util_1$m.checkStrictMode)(e, r, e.opts.strictTypes);
}
class KeywordCxt {
  constructor(r, n, s) {
    if ((0, keyword_1.validateKeywordUsage)(r, n, s), this.gen = r.gen, this.allErrors = r.allErrors, this.keyword = s, this.data = r.data, this.schema = r.schema[s], this.$data = n.$data && r.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, util_1$m.schemaRefOrVal)(r, this.schema, s, this.$data), this.schemaType = n.schemaType, this.parentSchema = r.schema, this.params = {}, this.it = r, this.def = n, this.$data)
      this.schemaCode = r.gen.const("vSchema", getData(this.$data, r));
    else if (this.schemaCode = this.schemaValue, !(0, keyword_1.validSchemaType)(this.schema, n.schemaType, n.allowUndefined))
      throw new Error(`${s} value must be ${JSON.stringify(n.schemaType)}`);
    ("code" in n ? n.trackErrors : n.errors !== !1) && (this.errsCount = r.gen.const("_errs", names_1$3.default.errors));
  }
  result(r, n, s) {
    this.failResult((0, codegen_1$n.not)(r), n, s);
  }
  failResult(r, n, s) {
    this.gen.if(r), s ? s() : this.error(), n ? (this.gen.else(), n(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(r, n) {
    this.failResult((0, codegen_1$n.not)(r), void 0, n);
  }
  fail(r) {
    if (r === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(r), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(r) {
    if (!this.$data)
      return this.fail(r);
    const { schemaCode: n } = this;
    this.fail((0, codegen_1$n._)`${n} !== undefined && (${(0, codegen_1$n.or)(this.invalid$data(), r)})`);
  }
  error(r, n, s) {
    if (n) {
      this.setParams(n), this._error(r, s), this.setParams({});
      return;
    }
    this._error(r, s);
  }
  _error(r, n) {
    (r ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, n);
  }
  $dataError() {
    (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(r) {
    this.allErrors || this.gen.if(r);
  }
  setParams(r, n) {
    n ? Object.assign(this.params, r) : this.params = r;
  }
  block$data(r, n, s = codegen_1$n.nil) {
    this.gen.block(() => {
      this.check$data(r, s), n();
    });
  }
  check$data(r = codegen_1$n.nil, n = codegen_1$n.nil) {
    if (!this.$data)
      return;
    const { gen: s, schemaCode: o, schemaType: a, def: c } = this;
    s.if((0, codegen_1$n.or)((0, codegen_1$n._)`${o} === undefined`, n)), r !== codegen_1$n.nil && s.assign(r, !0), (a.length || c.validateSchema) && (s.elseIf(this.invalid$data()), this.$dataError(), r !== codegen_1$n.nil && s.assign(r, !1)), s.else();
  }
  invalid$data() {
    const { gen: r, schemaCode: n, schemaType: s, def: o, it: a } = this;
    return (0, codegen_1$n.or)(c(), d());
    function c() {
      if (s.length) {
        if (!(n instanceof codegen_1$n.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(s) ? s : [s];
        return (0, codegen_1$n._)`${(0, dataType_2.checkDataTypes)(l, n, a.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
      }
      return codegen_1$n.nil;
    }
    function d() {
      if (o.validateSchema) {
        const l = r.scopeValue("validate$data", { ref: o.validateSchema });
        return (0, codegen_1$n._)`!${l}(${n})`;
      }
      return codegen_1$n.nil;
    }
  }
  subschema(r, n) {
    const s = (0, subschema_1.getSubschema)(this.it, r);
    (0, subschema_1.extendSubschemaData)(s, this.it, r), (0, subschema_1.extendSubschemaMode)(s, r);
    const o = { ...this.it, ...s, items: void 0, props: void 0 };
    return subschemaCode(o, n), o;
  }
  mergeEvaluated(r, n) {
    const { it: s, gen: o } = this;
    s.opts.unevaluated && (s.props !== !0 && r.props !== void 0 && (s.props = util_1$m.mergeEvaluated.props(o, r.props, s.props, n)), s.items !== !0 && r.items !== void 0 && (s.items = util_1$m.mergeEvaluated.items(o, r.items, s.items, n)));
  }
  mergeValidEvaluated(r, n) {
    const { it: s, gen: o } = this;
    if (s.opts.unevaluated && (s.props !== !0 || s.items !== !0))
      return o.if(n, () => this.mergeEvaluated(r, codegen_1$n.Name)), !0;
  }
}
validate.KeywordCxt = KeywordCxt;
function keywordCode(e, r, n, s) {
  const o = new KeywordCxt(e, n, r);
  "code" in n ? n.code(o, s) : o.$data && n.validate ? (0, keyword_1.funcKeywordCode)(o, n) : "macro" in n ? (0, keyword_1.macroKeywordCode)(o, n) : (n.compile || n.validate) && (0, keyword_1.funcKeywordCode)(o, n);
}
const JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/, RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function getData(e, { dataLevel: r, dataNames: n, dataPathArr: s }) {
  let o, a;
  if (e === "")
    return names_1$3.default.rootData;
  if (e[0] === "/") {
    if (!JSON_POINTER.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    o = e, a = names_1$3.default.rootData;
  } else {
    const u = RELATIVE_JSON_POINTER.exec(e);
    if (!u)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const h = +u[1];
    if (o = u[2], o === "#") {
      if (h >= r)
        throw new Error(l("property/index", h));
      return s[r - h];
    }
    if (h > r)
      throw new Error(l("data", h));
    if (a = n[r - h], !o)
      return a;
  }
  let c = a;
  const d = o.split("/");
  for (const u of d)
    u && (a = (0, codegen_1$n._)`${a}${(0, codegen_1$n.getProperty)((0, util_1$m.unescapeJsonPointer)(u))}`, c = (0, codegen_1$n._)`${c} && ${a}`);
  return c;
  function l(u, h) {
    return `Cannot access ${u} ${h} levels up, current level is ${r}`;
  }
}
validate.getData = getData;
var validation_error = {};
Object.defineProperty(validation_error, "__esModule", { value: !0 });
class ValidationError extends Error {
  constructor(r) {
    super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
  }
}
validation_error.default = ValidationError;
var ref_error = {};
Object.defineProperty(ref_error, "__esModule", { value: !0 });
const resolve_1$1 = resolve$1;
class MissingRefError extends Error {
  constructor(r, n, s, o) {
    super(o || `can't resolve reference ${s} from id ${n}`), this.missingRef = (0, resolve_1$1.resolveUrl)(r, n, s), this.missingSchema = (0, resolve_1$1.normalizeId)((0, resolve_1$1.getFullPath)(r, this.missingRef));
  }
}
ref_error.default = MissingRefError;
var compile = {};
Object.defineProperty(compile, "__esModule", { value: !0 });
compile.resolveSchema = compile.getCompilingSchema = compile.resolveRef = compile.compileSchema = compile.SchemaEnv = void 0;
const codegen_1$m = codegen, validation_error_1 = validation_error, names_1$2 = names$1, resolve_1 = resolve$1, util_1$l = util, validate_1$1 = validate;
class SchemaEnv {
  constructor(r) {
    var n;
    this.refs = {}, this.dynamicAnchors = {};
    let s;
    typeof r.schema == "object" && (s = r.schema), this.schema = r.schema, this.schemaId = r.schemaId, this.root = r.root || this, this.baseId = (n = r.baseId) !== null && n !== void 0 ? n : (0, resolve_1.normalizeId)(s == null ? void 0 : s[r.schemaId || "$id"]), this.schemaPath = r.schemaPath, this.localRefs = r.localRefs, this.meta = r.meta, this.$async = s == null ? void 0 : s.$async, this.refs = {};
  }
}
compile.SchemaEnv = SchemaEnv;
function compileSchema(e) {
  const r = getCompilingSchema.call(this, e);
  if (r)
    return r;
  const n = (0, resolve_1.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: s, lines: o } = this.opts.code, { ownProperties: a } = this.opts, c = new codegen_1$m.CodeGen(this.scope, { es5: s, lines: o, ownProperties: a });
  let d;
  e.$async && (d = c.scopeValue("Error", {
    ref: validation_error_1.default,
    code: (0, codegen_1$m._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = c.scopeName("validate");
  e.validateName = l;
  const u = {
    gen: c,
    allErrors: this.opts.allErrors,
    data: names_1$2.default.data,
    parentData: names_1$2.default.parentData,
    parentDataProperty: names_1$2.default.parentDataProperty,
    dataNames: [names_1$2.default.data],
    dataPathArr: [codegen_1$m.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: c.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, codegen_1$m.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: d,
    schema: e.schema,
    schemaEnv: e,
    rootId: n,
    baseId: e.baseId || n,
    schemaPath: codegen_1$m.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, codegen_1$m._)`""`,
    opts: this.opts,
    self: this
  };
  let h;
  try {
    this._compilations.add(e), (0, validate_1$1.validateFunctionCode)(u), c.optimize(this.opts.code.optimize);
    const p = c.toString();
    h = `${c.scopeRefs(names_1$2.default.scope)}return ${p}`, this.opts.code.process && (h = this.opts.code.process(h, e));
    const y = new Function(`${names_1$2.default.self}`, `${names_1$2.default.scope}`, h)(this, this.scope.get());
    if (this.scope.value(l, { ref: y }), y.errors = null, y.schema = e.schema, y.schemaEnv = e, e.$async && (y.$async = !0), this.opts.code.source === !0 && (y.source = { validateName: l, validateCode: p, scopeValues: c._values }), this.opts.unevaluated) {
      const { props: w, items: E } = u;
      y.evaluated = {
        props: w instanceof codegen_1$m.Name ? void 0 : w,
        items: E instanceof codegen_1$m.Name ? void 0 : E,
        dynamicProps: w instanceof codegen_1$m.Name,
        dynamicItems: E instanceof codegen_1$m.Name
      }, y.source && (y.source.evaluated = (0, codegen_1$m.stringify)(y.evaluated));
    }
    return e.validate = y, e;
  } catch (p) {
    throw delete e.validate, delete e.validateName, h && this.logger.error("Error compiling schema, function code:", h), p;
  } finally {
    this._compilations.delete(e);
  }
}
compile.compileSchema = compileSchema;
function resolveRef(e, r, n) {
  var s;
  n = (0, resolve_1.resolveUrl)(this.opts.uriResolver, r, n);
  const o = e.refs[n];
  if (o)
    return o;
  let a = resolve.call(this, e, n);
  if (a === void 0) {
    const c = (s = e.localRefs) === null || s === void 0 ? void 0 : s[n], { schemaId: d } = this.opts;
    c && (a = new SchemaEnv({ schema: c, schemaId: d, root: e, baseId: r }));
  }
  if (a !== void 0)
    return e.refs[n] = inlineOrCompile.call(this, a);
}
compile.resolveRef = resolveRef;
function inlineOrCompile(e) {
  return (0, resolve_1.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : compileSchema.call(this, e);
}
function getCompilingSchema(e) {
  for (const r of this._compilations)
    if (sameSchemaEnv(r, e))
      return r;
}
compile.getCompilingSchema = getCompilingSchema;
function sameSchemaEnv(e, r) {
  return e.schema === r.schema && e.root === r.root && e.baseId === r.baseId;
}
function resolve(e, r) {
  let n;
  for (; typeof (n = this.refs[r]) == "string"; )
    r = n;
  return n || this.schemas[r] || resolveSchema.call(this, e, r);
}
function resolveSchema(e, r) {
  const n = this.opts.uriResolver.parse(r), s = (0, resolve_1._getFullPath)(this.opts.uriResolver, n);
  let o = (0, resolve_1.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && s === o)
    return getJsonPointer.call(this, n, e);
  const a = (0, resolve_1.normalizeId)(s), c = this.refs[a] || this.schemas[a];
  if (typeof c == "string") {
    const d = resolveSchema.call(this, e, c);
    return typeof (d == null ? void 0 : d.schema) != "object" ? void 0 : getJsonPointer.call(this, n, d);
  }
  if (typeof (c == null ? void 0 : c.schema) == "object") {
    if (c.validate || compileSchema.call(this, c), a === (0, resolve_1.normalizeId)(r)) {
      const { schema: d } = c, { schemaId: l } = this.opts, u = d[l];
      return u && (o = (0, resolve_1.resolveUrl)(this.opts.uriResolver, o, u)), new SchemaEnv({ schema: d, schemaId: l, root: e, baseId: o });
    }
    return getJsonPointer.call(this, n, c);
  }
}
compile.resolveSchema = resolveSchema;
const PREVENT_SCOPE_CHANGE = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function getJsonPointer(e, { baseId: r, schema: n, root: s }) {
  var o;
  if (((o = e.fragment) === null || o === void 0 ? void 0 : o[0]) !== "/")
    return;
  for (const d of e.fragment.slice(1).split("/")) {
    if (typeof n == "boolean")
      return;
    const l = n[(0, util_1$l.unescapeFragment)(d)];
    if (l === void 0)
      return;
    n = l;
    const u = typeof n == "object" && n[this.opts.schemaId];
    !PREVENT_SCOPE_CHANGE.has(d) && u && (r = (0, resolve_1.resolveUrl)(this.opts.uriResolver, r, u));
  }
  let a;
  if (typeof n != "boolean" && n.$ref && !(0, util_1$l.schemaHasRulesButRef)(n, this.RULES)) {
    const d = (0, resolve_1.resolveUrl)(this.opts.uriResolver, r, n.$ref);
    a = resolveSchema.call(this, s, d);
  }
  const { schemaId: c } = this.opts;
  if (a = a || new SchemaEnv({ schema: n, schemaId: c, root: s, baseId: r }), a.schema !== a.root.schema)
    return a;
}
const $id$1 = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", description = "Meta-schema for $data reference (JSON AnySchema extension proposal)", type$1 = "object", required$1 = [
  "$data"
], properties$2 = {
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
}, additionalProperties$1 = !1, require$$9 = {
  $id: $id$1,
  description,
  type: type$1,
  required: required$1,
  properties: properties$2,
  additionalProperties: additionalProperties$1
};
var uri$1 = {};
Object.defineProperty(uri$1, "__esModule", { value: !0 });
const uri = fastUriExports;
uri.code = 'require("ajv/dist/runtime/uri").default';
uri$1.default = uri;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var r = validate;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return r.KeywordCxt;
  } });
  var n = codegen;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return n.CodeGen;
  } });
  const s = validation_error, o = ref_error, a = rules, c = compile, d = codegen, l = resolve$1, u = dataType, h = util, p = require$$9, g = uri$1, y = (T, v) => new RegExp(T, v);
  y.code = "new RegExp";
  const w = ["removeAdditional", "useDefaults", "coerceTypes"], E = /* @__PURE__ */ new Set([
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
  ]), m = {
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
  }, _ = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, S = 200;
  function O(T) {
    var v, P, b, f, $, R, k, D, H, U, X, Q, W, te, oe, ae, ue, de, fe, Z, ye, ve, Ee, we, be;
    const ce = T.strict, Se = (v = T.code) === null || v === void 0 ? void 0 : v.optimize, Ne = Se === !0 || Se === void 0 ? 1 : Se || 0, Ie = (b = (P = T.code) === null || P === void 0 ? void 0 : P.regExp) !== null && b !== void 0 ? b : y, Ce = (f = T.uriResolver) !== null && f !== void 0 ? f : g.default;
    return {
      strictSchema: (R = ($ = T.strictSchema) !== null && $ !== void 0 ? $ : ce) !== null && R !== void 0 ? R : !0,
      strictNumbers: (D = (k = T.strictNumbers) !== null && k !== void 0 ? k : ce) !== null && D !== void 0 ? D : !0,
      strictTypes: (U = (H = T.strictTypes) !== null && H !== void 0 ? H : ce) !== null && U !== void 0 ? U : "log",
      strictTuples: (Q = (X = T.strictTuples) !== null && X !== void 0 ? X : ce) !== null && Q !== void 0 ? Q : "log",
      strictRequired: (te = (W = T.strictRequired) !== null && W !== void 0 ? W : ce) !== null && te !== void 0 ? te : !1,
      code: T.code ? { ...T.code, optimize: Ne, regExp: Ie } : { optimize: Ne, regExp: Ie },
      loopRequired: (oe = T.loopRequired) !== null && oe !== void 0 ? oe : S,
      loopEnum: (ae = T.loopEnum) !== null && ae !== void 0 ? ae : S,
      meta: (ue = T.meta) !== null && ue !== void 0 ? ue : !0,
      messages: (de = T.messages) !== null && de !== void 0 ? de : !0,
      inlineRefs: (fe = T.inlineRefs) !== null && fe !== void 0 ? fe : !0,
      schemaId: (Z = T.schemaId) !== null && Z !== void 0 ? Z : "$id",
      addUsedSchema: (ye = T.addUsedSchema) !== null && ye !== void 0 ? ye : !0,
      validateSchema: (ve = T.validateSchema) !== null && ve !== void 0 ? ve : !0,
      validateFormats: (Ee = T.validateFormats) !== null && Ee !== void 0 ? Ee : !0,
      unicodeRegExp: (we = T.unicodeRegExp) !== null && we !== void 0 ? we : !0,
      int32range: (be = T.int32range) !== null && be !== void 0 ? be : !0,
      uriResolver: Ce
    };
  }
  class I {
    constructor(v = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), v = this.opts = { ...v, ...O(v) };
      const { es5: P, lines: b } = this.opts.code;
      this.scope = new d.ValueScope({ scope: {}, prefixes: E, es5: P, lines: b }), this.logger = V(v.logger);
      const f = v.validateFormats;
      v.validateFormats = !1, this.RULES = (0, a.getRules)(), A.call(this, m, v, "NOT SUPPORTED"), A.call(this, _, v, "DEPRECATED", "warn"), this._metaOpts = J.call(this), v.formats && x.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), v.keywords && Y.call(this, v.keywords), typeof v.meta == "object" && this.addMetaSchema(v.meta), z.call(this), v.validateFormats = f;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: v, meta: P, schemaId: b } = this.opts;
      let f = p;
      b === "id" && (f = { ...p }, f.id = f.$id, delete f.$id), P && v && this.addMetaSchema(f, f[b], !1);
    }
    defaultMeta() {
      const { meta: v, schemaId: P } = this.opts;
      return this.opts.defaultMeta = typeof v == "object" ? v[P] || v : void 0;
    }
    validate(v, P) {
      let b;
      if (typeof v == "string") {
        if (b = this.getSchema(v), !b)
          throw new Error(`no schema with key or ref "${v}"`);
      } else
        b = this.compile(v);
      const f = b(P);
      return "$async" in b || (this.errors = b.errors), f;
    }
    compile(v, P) {
      const b = this._addSchema(v, P);
      return b.validate || this._compileSchemaEnv(b);
    }
    compileAsync(v, P) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: b } = this.opts;
      return f.call(this, v, P);
      async function f(U, X) {
        await $.call(this, U.$schema);
        const Q = this._addSchema(U, X);
        return Q.validate || R.call(this, Q);
      }
      async function $(U) {
        U && !this.getSchema(U) && await f.call(this, { $ref: U }, !0);
      }
      async function R(U) {
        try {
          return this._compileSchemaEnv(U);
        } catch (X) {
          if (!(X instanceof o.default))
            throw X;
          return k.call(this, X), await D.call(this, X.missingSchema), R.call(this, U);
        }
      }
      function k({ missingSchema: U, missingRef: X }) {
        if (this.refs[U])
          throw new Error(`AnySchema ${U} is loaded but ${X} cannot be resolved`);
      }
      async function D(U) {
        const X = await H.call(this, U);
        this.refs[U] || await $.call(this, X.$schema), this.refs[U] || this.addSchema(X, U, P);
      }
      async function H(U) {
        const X = this._loading[U];
        if (X)
          return X;
        try {
          return await (this._loading[U] = b(U));
        } finally {
          delete this._loading[U];
        }
      }
    }
    // Adds schema to the instance
    addSchema(v, P, b, f = this.opts.validateSchema) {
      if (Array.isArray(v)) {
        for (const R of v)
          this.addSchema(R, void 0, b, f);
        return this;
      }
      let $;
      if (typeof v == "object") {
        const { schemaId: R } = this.opts;
        if ($ = v[R], $ !== void 0 && typeof $ != "string")
          throw new Error(`schema ${R} must be string`);
      }
      return P = (0, l.normalizeId)(P || $), this._checkUnique(P), this.schemas[P] = this._addSchema(v, b, P, f, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(v, P, b = this.opts.validateSchema) {
      return this.addSchema(v, P, !0, b), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(v, P) {
      if (typeof v == "boolean")
        return !0;
      let b;
      if (b = v.$schema, b !== void 0 && typeof b != "string")
        throw new Error("$schema must be a string");
      if (b = b || this.opts.defaultMeta || this.defaultMeta(), !b)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const f = this.validate(b, v);
      if (!f && P) {
        const $ = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error($);
        else
          throw new Error($);
      }
      return f;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(v) {
      let P;
      for (; typeof (P = F.call(this, v)) == "string"; )
        v = P;
      if (P === void 0) {
        const { schemaId: b } = this.opts, f = new c.SchemaEnv({ schema: {}, schemaId: b });
        if (P = c.resolveSchema.call(this, f, v), !P)
          return;
        this.refs[v] = P;
      }
      return P.validate || this._compileSchemaEnv(P);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(v) {
      if (v instanceof RegExp)
        return this._removeAllSchemas(this.schemas, v), this._removeAllSchemas(this.refs, v), this;
      switch (typeof v) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const P = F.call(this, v);
          return typeof P == "object" && this._cache.delete(P.schema), delete this.schemas[v], delete this.refs[v], this;
        }
        case "object": {
          const P = v;
          this._cache.delete(P);
          let b = v[this.opts.schemaId];
          return b && (b = (0, l.normalizeId)(b), delete this.schemas[b], delete this.refs[b]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(v) {
      for (const P of v)
        this.addKeyword(P);
      return this;
    }
    addKeyword(v, P) {
      let b;
      if (typeof v == "string")
        b = v, typeof P == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), P.keyword = b);
      else if (typeof v == "object" && P === void 0) {
        if (P = v, b = P.keyword, Array.isArray(b) && !b.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (M.call(this, b, P), !P)
        return (0, h.eachItem)(b, ($) => L.call(this, $)), this;
      C.call(this, P);
      const f = {
        ...P,
        type: (0, u.getJSONTypes)(P.type),
        schemaType: (0, u.getJSONTypes)(P.schemaType)
      };
      return (0, h.eachItem)(b, f.type.length === 0 ? ($) => L.call(this, $, f) : ($) => f.type.forEach((R) => L.call(this, $, f, R))), this;
    }
    getKeyword(v) {
      const P = this.RULES.all[v];
      return typeof P == "object" ? P.definition : !!P;
    }
    // Remove keyword
    removeKeyword(v) {
      const { RULES: P } = this;
      delete P.keywords[v], delete P.all[v];
      for (const b of P.rules) {
        const f = b.rules.findIndex(($) => $.keyword === v);
        f >= 0 && b.rules.splice(f, 1);
      }
      return this;
    }
    // Add format
    addFormat(v, P) {
      return typeof P == "string" && (P = new RegExp(P)), this.formats[v] = P, this;
    }
    errorsText(v = this.errors, { separator: P = ", ", dataVar: b = "data" } = {}) {
      return !v || v.length === 0 ? "No errors" : v.map((f) => `${b}${f.instancePath} ${f.message}`).reduce((f, $) => f + P + $);
    }
    $dataMetaSchema(v, P) {
      const b = this.RULES.all;
      v = JSON.parse(JSON.stringify(v));
      for (const f of P) {
        const $ = f.split("/").slice(1);
        let R = v;
        for (const k of $)
          R = R[k];
        for (const k in b) {
          const D = b[k];
          if (typeof D != "object")
            continue;
          const { $data: H } = D.definition, U = R[k];
          H && U && (R[k] = q(U));
        }
      }
      return v;
    }
    _removeAllSchemas(v, P) {
      for (const b in v) {
        const f = v[b];
        (!P || P.test(b)) && (typeof f == "string" ? delete v[b] : f && !f.meta && (this._cache.delete(f.schema), delete v[b]));
      }
    }
    _addSchema(v, P, b, f = this.opts.validateSchema, $ = this.opts.addUsedSchema) {
      let R;
      const { schemaId: k } = this.opts;
      if (typeof v == "object")
        R = v[k];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof v != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let D = this._cache.get(v);
      if (D !== void 0)
        return D;
      b = (0, l.normalizeId)(R || b);
      const H = l.getSchemaRefs.call(this, v, b);
      return D = new c.SchemaEnv({ schema: v, schemaId: k, meta: P, baseId: b, localRefs: H }), this._cache.set(D.schema, D), $ && !b.startsWith("#") && (b && this._checkUnique(b), this.refs[b] = D), f && this.validateSchema(v, !0), D;
    }
    _checkUnique(v) {
      if (this.schemas[v] || this.refs[v])
        throw new Error(`schema with key or id "${v}" already exists`);
    }
    _compileSchemaEnv(v) {
      if (v.meta ? this._compileMetaSchema(v) : c.compileSchema.call(this, v), !v.validate)
        throw new Error("ajv implementation error");
      return v.validate;
    }
    _compileMetaSchema(v) {
      const P = this.opts;
      this.opts = this._metaOpts;
      try {
        c.compileSchema.call(this, v);
      } finally {
        this.opts = P;
      }
    }
  }
  I.ValidationError = s.default, I.MissingRefError = o.default, e.default = I;
  function A(T, v, P, b = "error") {
    for (const f in T) {
      const $ = f;
      $ in v && this.logger[b](`${P}: option ${f}. ${T[$]}`);
    }
  }
  function F(T) {
    return T = (0, l.normalizeId)(T), this.schemas[T] || this.refs[T];
  }
  function z() {
    const T = this.opts.schemas;
    if (T)
      if (Array.isArray(T))
        this.addSchema(T);
      else
        for (const v in T)
          this.addSchema(T[v], v);
  }
  function x() {
    for (const T in this.opts.formats) {
      const v = this.opts.formats[T];
      v && this.addFormat(T, v);
    }
  }
  function Y(T) {
    if (Array.isArray(T)) {
      this.addVocabulary(T);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const v in T) {
      const P = T[v];
      P.keyword || (P.keyword = v), this.addKeyword(P);
    }
  }
  function J() {
    const T = { ...this.opts };
    for (const v of w)
      delete T[v];
    return T;
  }
  const K = { log() {
  }, warn() {
  }, error() {
  } };
  function V(T) {
    if (T === !1)
      return K;
    if (T === void 0)
      return console;
    if (T.log && T.warn && T.error)
      return T;
    throw new Error("logger must implement log, warn and error methods");
  }
  const G = /^[a-z_$][a-z0-9_$:-]*$/i;
  function M(T, v) {
    const { RULES: P } = this;
    if ((0, h.eachItem)(T, (b) => {
      if (P.keywords[b])
        throw new Error(`Keyword ${b} is already defined`);
      if (!G.test(b))
        throw new Error(`Keyword ${b} has invalid name`);
    }), !!v && v.$data && !("code" in v || "validate" in v))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function L(T, v, P) {
    var b;
    const f = v == null ? void 0 : v.post;
    if (P && f)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: $ } = this;
    let R = f ? $.post : $.rules.find(({ type: D }) => D === P);
    if (R || (R = { type: P, rules: [] }, $.rules.push(R)), $.keywords[T] = !0, !v)
      return;
    const k = {
      keyword: T,
      definition: {
        ...v,
        type: (0, u.getJSONTypes)(v.type),
        schemaType: (0, u.getJSONTypes)(v.schemaType)
      }
    };
    v.before ? N.call(this, R, k, v.before) : R.rules.push(k), $.all[T] = k, (b = v.implements) === null || b === void 0 || b.forEach((D) => this.addKeyword(D));
  }
  function N(T, v, P) {
    const b = T.rules.findIndex((f) => f.keyword === P);
    b >= 0 ? T.rules.splice(b, 0, v) : (T.rules.push(v), this.logger.warn(`rule ${P} is not defined`));
  }
  function C(T) {
    let { metaSchema: v } = T;
    v !== void 0 && (T.$data && this.opts.$data && (v = q(v)), T.validateSchema = this.compile(v, !0));
  }
  const j = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function q(T) {
    return { anyOf: [T, j] };
  }
})(core$2);
var draft7 = {}, core$1 = {}, id = {};
Object.defineProperty(id, "__esModule", { value: !0 });
const def$s = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
id.default = def$s;
var ref = {};
Object.defineProperty(ref, "__esModule", { value: !0 });
ref.callRef = ref.getValidate = void 0;
const ref_error_1$1 = ref_error, code_1$8 = code, codegen_1$l = codegen, names_1$1 = names$1, compile_1$1 = compile, util_1$k = util, def$r = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: r, schema: n, it: s } = e, { baseId: o, schemaEnv: a, validateName: c, opts: d, self: l } = s, { root: u } = a;
    if ((n === "#" || n === "#/") && o === u.baseId)
      return p();
    const h = compile_1$1.resolveRef.call(l, u, o, n);
    if (h === void 0)
      throw new ref_error_1$1.default(s.opts.uriResolver, o, n);
    if (h instanceof compile_1$1.SchemaEnv)
      return g(h);
    return y(h);
    function p() {
      if (a === u)
        return callRef(e, c, a, a.$async);
      const w = r.scopeValue("root", { ref: u });
      return callRef(e, (0, codegen_1$l._)`${w}.validate`, u, u.$async);
    }
    function g(w) {
      const E = getValidate(e, w);
      callRef(e, E, w, w.$async);
    }
    function y(w) {
      const E = r.scopeValue("schema", d.code.source === !0 ? { ref: w, code: (0, codegen_1$l.stringify)(w) } : { ref: w }), m = r.name("valid"), _ = e.subschema({
        schema: w,
        dataTypes: [],
        schemaPath: codegen_1$l.nil,
        topSchemaRef: E,
        errSchemaPath: n
      }, m);
      e.mergeEvaluated(_), e.ok(m);
    }
  }
};
function getValidate(e, r) {
  const { gen: n } = e;
  return r.validate ? n.scopeValue("validate", { ref: r.validate }) : (0, codegen_1$l._)`${n.scopeValue("wrapper", { ref: r })}.validate`;
}
ref.getValidate = getValidate;
function callRef(e, r, n, s) {
  const { gen: o, it: a } = e, { allErrors: c, schemaEnv: d, opts: l } = a, u = l.passContext ? names_1$1.default.this : codegen_1$l.nil;
  s ? h() : p();
  function h() {
    if (!d.$async)
      throw new Error("async schema referenced by sync schema");
    const w = o.let("valid");
    o.try(() => {
      o.code((0, codegen_1$l._)`await ${(0, code_1$8.callValidateCode)(e, r, u)}`), y(r), c || o.assign(w, !0);
    }, (E) => {
      o.if((0, codegen_1$l._)`!(${E} instanceof ${a.ValidationError})`, () => o.throw(E)), g(E), c || o.assign(w, !1);
    }), e.ok(w);
  }
  function p() {
    e.result((0, code_1$8.callValidateCode)(e, r, u), () => y(r), () => g(r));
  }
  function g(w) {
    const E = (0, codegen_1$l._)`${w}.errors`;
    o.assign(names_1$1.default.vErrors, (0, codegen_1$l._)`${names_1$1.default.vErrors} === null ? ${E} : ${names_1$1.default.vErrors}.concat(${E})`), o.assign(names_1$1.default.errors, (0, codegen_1$l._)`${names_1$1.default.vErrors}.length`);
  }
  function y(w) {
    var E;
    if (!a.opts.unevaluated)
      return;
    const m = (E = n == null ? void 0 : n.validate) === null || E === void 0 ? void 0 : E.evaluated;
    if (a.props !== !0)
      if (m && !m.dynamicProps)
        m.props !== void 0 && (a.props = util_1$k.mergeEvaluated.props(o, m.props, a.props));
      else {
        const _ = o.var("props", (0, codegen_1$l._)`${w}.evaluated.props`);
        a.props = util_1$k.mergeEvaluated.props(o, _, a.props, codegen_1$l.Name);
      }
    if (a.items !== !0)
      if (m && !m.dynamicItems)
        m.items !== void 0 && (a.items = util_1$k.mergeEvaluated.items(o, m.items, a.items));
      else {
        const _ = o.var("items", (0, codegen_1$l._)`${w}.evaluated.items`);
        a.items = util_1$k.mergeEvaluated.items(o, _, a.items, codegen_1$l.Name);
      }
  }
}
ref.callRef = callRef;
ref.default = def$r;
Object.defineProperty(core$1, "__esModule", { value: !0 });
const id_1 = id, ref_1 = ref, core = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  id_1.default,
  ref_1.default
];
core$1.default = core;
var validation$1 = {}, limitNumber = {};
Object.defineProperty(limitNumber, "__esModule", { value: !0 });
const codegen_1$k = codegen, ops = codegen_1$k.operators, KWDs = {
  maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
  minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
  exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
  exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
}, error$i = {
  message: ({ keyword: e, schemaCode: r }) => (0, codegen_1$k.str)`must be ${KWDs[e].okStr} ${r}`,
  params: ({ keyword: e, schemaCode: r }) => (0, codegen_1$k._)`{comparison: ${KWDs[e].okStr}, limit: ${r}}`
}, def$q = {
  keyword: Object.keys(KWDs),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: error$i,
  code(e) {
    const { keyword: r, data: n, schemaCode: s } = e;
    e.fail$data((0, codegen_1$k._)`${n} ${KWDs[r].fail} ${s} || isNaN(${n})`);
  }
};
limitNumber.default = def$q;
var multipleOf = {};
Object.defineProperty(multipleOf, "__esModule", { value: !0 });
const codegen_1$j = codegen, error$h = {
  message: ({ schemaCode: e }) => (0, codegen_1$j.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, codegen_1$j._)`{multipleOf: ${e}}`
}, def$p = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: error$h,
  code(e) {
    const { gen: r, data: n, schemaCode: s, it: o } = e, a = o.opts.multipleOfPrecision, c = r.let("res"), d = a ? (0, codegen_1$j._)`Math.abs(Math.round(${c}) - ${c}) > 1e-${a}` : (0, codegen_1$j._)`${c} !== parseInt(${c})`;
    e.fail$data((0, codegen_1$j._)`(${s} === 0 || (${c} = ${n}/${s}, ${d}))`);
  }
};
multipleOf.default = def$p;
var limitLength = {}, ucs2length$1 = {};
Object.defineProperty(ucs2length$1, "__esModule", { value: !0 });
function ucs2length(e) {
  const r = e.length;
  let n = 0, s = 0, o;
  for (; s < r; )
    n++, o = e.charCodeAt(s++), o >= 55296 && o <= 56319 && s < r && (o = e.charCodeAt(s), (o & 64512) === 56320 && s++);
  return n;
}
ucs2length$1.default = ucs2length;
ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(limitLength, "__esModule", { value: !0 });
const codegen_1$i = codegen, util_1$j = util, ucs2length_1 = ucs2length$1, error$g = {
  message({ keyword: e, schemaCode: r }) {
    const n = e === "maxLength" ? "more" : "fewer";
    return (0, codegen_1$i.str)`must NOT have ${n} than ${r} characters`;
  },
  params: ({ schemaCode: e }) => (0, codegen_1$i._)`{limit: ${e}}`
}, def$o = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: error$g,
  code(e) {
    const { keyword: r, data: n, schemaCode: s, it: o } = e, a = r === "maxLength" ? codegen_1$i.operators.GT : codegen_1$i.operators.LT, c = o.opts.unicode === !1 ? (0, codegen_1$i._)`${n}.length` : (0, codegen_1$i._)`${(0, util_1$j.useFunc)(e.gen, ucs2length_1.default)}(${n})`;
    e.fail$data((0, codegen_1$i._)`${c} ${a} ${s}`);
  }
};
limitLength.default = def$o;
var pattern = {};
Object.defineProperty(pattern, "__esModule", { value: !0 });
const code_1$7 = code, util_1$i = util, codegen_1$h = codegen, error$f = {
  message: ({ schemaCode: e }) => (0, codegen_1$h.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, codegen_1$h._)`{pattern: ${e}}`
}, def$n = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: error$f,
  code(e) {
    const { gen: r, data: n, $data: s, schema: o, schemaCode: a, it: c } = e, d = c.opts.unicodeRegExp ? "u" : "";
    if (s) {
      const { regExp: l } = c.opts.code, u = l.code === "new RegExp" ? (0, codegen_1$h._)`new RegExp` : (0, util_1$i.useFunc)(r, l), h = r.let("valid");
      r.try(() => r.assign(h, (0, codegen_1$h._)`${u}(${a}, ${d}).test(${n})`), () => r.assign(h, !1)), e.fail$data((0, codegen_1$h._)`!${h}`);
    } else {
      const l = (0, code_1$7.usePattern)(e, o);
      e.fail$data((0, codegen_1$h._)`!${l}.test(${n})`);
    }
  }
};
pattern.default = def$n;
var limitProperties = {};
Object.defineProperty(limitProperties, "__esModule", { value: !0 });
const codegen_1$g = codegen, error$e = {
  message({ keyword: e, schemaCode: r }) {
    const n = e === "maxProperties" ? "more" : "fewer";
    return (0, codegen_1$g.str)`must NOT have ${n} than ${r} properties`;
  },
  params: ({ schemaCode: e }) => (0, codegen_1$g._)`{limit: ${e}}`
}, def$m = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: error$e,
  code(e) {
    const { keyword: r, data: n, schemaCode: s } = e, o = r === "maxProperties" ? codegen_1$g.operators.GT : codegen_1$g.operators.LT;
    e.fail$data((0, codegen_1$g._)`Object.keys(${n}).length ${o} ${s}`);
  }
};
limitProperties.default = def$m;
var required = {};
Object.defineProperty(required, "__esModule", { value: !0 });
const code_1$6 = code, codegen_1$f = codegen, util_1$h = util, error$d = {
  message: ({ params: { missingProperty: e } }) => (0, codegen_1$f.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, codegen_1$f._)`{missingProperty: ${e}}`
}, def$l = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: error$d,
  code(e) {
    const { gen: r, schema: n, schemaCode: s, data: o, $data: a, it: c } = e, { opts: d } = c;
    if (!a && n.length === 0)
      return;
    const l = n.length >= d.loopRequired;
    if (c.allErrors ? u() : h(), d.strictRequired) {
      const y = e.parentSchema.properties, { definedProperties: w } = e.it;
      for (const E of n)
        if ((y == null ? void 0 : y[E]) === void 0 && !w.has(E)) {
          const m = c.schemaEnv.baseId + c.errSchemaPath, _ = `required property "${E}" is not defined at "${m}" (strictRequired)`;
          (0, util_1$h.checkStrictMode)(c, _, c.opts.strictRequired);
        }
    }
    function u() {
      if (l || a)
        e.block$data(codegen_1$f.nil, p);
      else
        for (const y of n)
          (0, code_1$6.checkReportMissingProp)(e, y);
    }
    function h() {
      const y = r.let("missing");
      if (l || a) {
        const w = r.let("valid", !0);
        e.block$data(w, () => g(y, w)), e.ok(w);
      } else
        r.if((0, code_1$6.checkMissingProp)(e, n, y)), (0, code_1$6.reportMissingProp)(e, y), r.else();
    }
    function p() {
      r.forOf("prop", s, (y) => {
        e.setParams({ missingProperty: y }), r.if((0, code_1$6.noPropertyInData)(r, o, y, d.ownProperties), () => e.error());
      });
    }
    function g(y, w) {
      e.setParams({ missingProperty: y }), r.forOf(y, s, () => {
        r.assign(w, (0, code_1$6.propertyInData)(r, o, y, d.ownProperties)), r.if((0, codegen_1$f.not)(w), () => {
          e.error(), r.break();
        });
      }, codegen_1$f.nil);
    }
  }
};
required.default = def$l;
var limitItems = {};
Object.defineProperty(limitItems, "__esModule", { value: !0 });
const codegen_1$e = codegen, error$c = {
  message({ keyword: e, schemaCode: r }) {
    const n = e === "maxItems" ? "more" : "fewer";
    return (0, codegen_1$e.str)`must NOT have ${n} than ${r} items`;
  },
  params: ({ schemaCode: e }) => (0, codegen_1$e._)`{limit: ${e}}`
}, def$k = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: error$c,
  code(e) {
    const { keyword: r, data: n, schemaCode: s } = e, o = r === "maxItems" ? codegen_1$e.operators.GT : codegen_1$e.operators.LT;
    e.fail$data((0, codegen_1$e._)`${n}.length ${o} ${s}`);
  }
};
limitItems.default = def$k;
var uniqueItems = {}, equal$1 = {};
Object.defineProperty(equal$1, "__esModule", { value: !0 });
const equal = fastDeepEqual;
equal.code = 'require("ajv/dist/runtime/equal").default';
equal$1.default = equal;
Object.defineProperty(uniqueItems, "__esModule", { value: !0 });
const dataType_1 = dataType, codegen_1$d = codegen, util_1$g = util, equal_1$2 = equal$1, error$b = {
  message: ({ params: { i: e, j: r } }) => (0, codegen_1$d.str)`must NOT have duplicate items (items ## ${r} and ${e} are identical)`,
  params: ({ params: { i: e, j: r } }) => (0, codegen_1$d._)`{i: ${e}, j: ${r}}`
}, def$j = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: error$b,
  code(e) {
    const { gen: r, data: n, $data: s, schema: o, parentSchema: a, schemaCode: c, it: d } = e;
    if (!s && !o)
      return;
    const l = r.let("valid"), u = a.items ? (0, dataType_1.getSchemaTypes)(a.items) : [];
    e.block$data(l, h, (0, codegen_1$d._)`${c} === false`), e.ok(l);
    function h() {
      const w = r.let("i", (0, codegen_1$d._)`${n}.length`), E = r.let("j");
      e.setParams({ i: w, j: E }), r.assign(l, !0), r.if((0, codegen_1$d._)`${w} > 1`, () => (p() ? g : y)(w, E));
    }
    function p() {
      return u.length > 0 && !u.some((w) => w === "object" || w === "array");
    }
    function g(w, E) {
      const m = r.name("item"), _ = (0, dataType_1.checkDataTypes)(u, m, d.opts.strictNumbers, dataType_1.DataType.Wrong), S = r.const("indices", (0, codegen_1$d._)`{}`);
      r.for((0, codegen_1$d._)`;${w}--;`, () => {
        r.let(m, (0, codegen_1$d._)`${n}[${w}]`), r.if(_, (0, codegen_1$d._)`continue`), u.length > 1 && r.if((0, codegen_1$d._)`typeof ${m} == "string"`, (0, codegen_1$d._)`${m} += "_"`), r.if((0, codegen_1$d._)`typeof ${S}[${m}] == "number"`, () => {
          r.assign(E, (0, codegen_1$d._)`${S}[${m}]`), e.error(), r.assign(l, !1).break();
        }).code((0, codegen_1$d._)`${S}[${m}] = ${w}`);
      });
    }
    function y(w, E) {
      const m = (0, util_1$g.useFunc)(r, equal_1$2.default), _ = r.name("outer");
      r.label(_).for((0, codegen_1$d._)`;${w}--;`, () => r.for((0, codegen_1$d._)`${E} = ${w}; ${E}--;`, () => r.if((0, codegen_1$d._)`${m}(${n}[${w}], ${n}[${E}])`, () => {
        e.error(), r.assign(l, !1).break(_);
      })));
    }
  }
};
uniqueItems.default = def$j;
var _const = {};
Object.defineProperty(_const, "__esModule", { value: !0 });
const codegen_1$c = codegen, util_1$f = util, equal_1$1 = equal$1, error$a = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, codegen_1$c._)`{allowedValue: ${e}}`
}, def$i = {
  keyword: "const",
  $data: !0,
  error: error$a,
  code(e) {
    const { gen: r, data: n, $data: s, schemaCode: o, schema: a } = e;
    s || a && typeof a == "object" ? e.fail$data((0, codegen_1$c._)`!${(0, util_1$f.useFunc)(r, equal_1$1.default)}(${n}, ${o})`) : e.fail((0, codegen_1$c._)`${a} !== ${n}`);
  }
};
_const.default = def$i;
var _enum = {};
Object.defineProperty(_enum, "__esModule", { value: !0 });
const codegen_1$b = codegen, util_1$e = util, equal_1 = equal$1, error$9 = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, codegen_1$b._)`{allowedValues: ${e}}`
}, def$h = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: error$9,
  code(e) {
    const { gen: r, data: n, $data: s, schema: o, schemaCode: a, it: c } = e;
    if (!s && o.length === 0)
      throw new Error("enum must have non-empty array");
    const d = o.length >= c.opts.loopEnum;
    let l;
    const u = () => l ?? (l = (0, util_1$e.useFunc)(r, equal_1.default));
    let h;
    if (d || s)
      h = r.let("valid"), e.block$data(h, p);
    else {
      if (!Array.isArray(o))
        throw new Error("ajv implementation error");
      const y = r.const("vSchema", a);
      h = (0, codegen_1$b.or)(...o.map((w, E) => g(y, E)));
    }
    e.pass(h);
    function p() {
      r.assign(h, !1), r.forOf("v", a, (y) => r.if((0, codegen_1$b._)`${u()}(${n}, ${y})`, () => r.assign(h, !0).break()));
    }
    function g(y, w) {
      const E = o[w];
      return typeof E == "object" && E !== null ? (0, codegen_1$b._)`${u()}(${n}, ${y}[${w}])` : (0, codegen_1$b._)`${n} === ${E}`;
    }
  }
};
_enum.default = def$h;
Object.defineProperty(validation$1, "__esModule", { value: !0 });
const limitNumber_1 = limitNumber, multipleOf_1 = multipleOf, limitLength_1 = limitLength, pattern_1 = pattern, limitProperties_1 = limitProperties, required_1 = required, limitItems_1 = limitItems, uniqueItems_1 = uniqueItems, const_1 = _const, enum_1 = _enum, validation = [
  // number
  limitNumber_1.default,
  multipleOf_1.default,
  // string
  limitLength_1.default,
  pattern_1.default,
  // object
  limitProperties_1.default,
  required_1.default,
  // array
  limitItems_1.default,
  uniqueItems_1.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  const_1.default,
  enum_1.default
];
validation$1.default = validation;
var applicator = {}, additionalItems = {};
Object.defineProperty(additionalItems, "__esModule", { value: !0 });
additionalItems.validateAdditionalItems = void 0;
const codegen_1$a = codegen, util_1$d = util, error$8 = {
  message: ({ params: { len: e } }) => (0, codegen_1$a.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, codegen_1$a._)`{limit: ${e}}`
}, def$g = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: error$8,
  code(e) {
    const { parentSchema: r, it: n } = e, { items: s } = r;
    if (!Array.isArray(s)) {
      (0, util_1$d.checkStrictMode)(n, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    validateAdditionalItems(e, s);
  }
};
function validateAdditionalItems(e, r) {
  const { gen: n, schema: s, data: o, keyword: a, it: c } = e;
  c.items = !0;
  const d = n.const("len", (0, codegen_1$a._)`${o}.length`);
  if (s === !1)
    e.setParams({ len: r.length }), e.pass((0, codegen_1$a._)`${d} <= ${r.length}`);
  else if (typeof s == "object" && !(0, util_1$d.alwaysValidSchema)(c, s)) {
    const u = n.var("valid", (0, codegen_1$a._)`${d} <= ${r.length}`);
    n.if((0, codegen_1$a.not)(u), () => l(u)), e.ok(u);
  }
  function l(u) {
    n.forRange("i", r.length, d, (h) => {
      e.subschema({ keyword: a, dataProp: h, dataPropType: util_1$d.Type.Num }, u), c.allErrors || n.if((0, codegen_1$a.not)(u), () => n.break());
    });
  }
}
additionalItems.validateAdditionalItems = validateAdditionalItems;
additionalItems.default = def$g;
var prefixItems = {}, items = {};
Object.defineProperty(items, "__esModule", { value: !0 });
items.validateTuple = void 0;
const codegen_1$9 = codegen, util_1$c = util, code_1$5 = code, def$f = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: r, it: n } = e;
    if (Array.isArray(r))
      return validateTuple(e, "additionalItems", r);
    n.items = !0, !(0, util_1$c.alwaysValidSchema)(n, r) && e.ok((0, code_1$5.validateArray)(e));
  }
};
function validateTuple(e, r, n = e.schema) {
  const { gen: s, parentSchema: o, data: a, keyword: c, it: d } = e;
  h(o), d.opts.unevaluated && n.length && d.items !== !0 && (d.items = util_1$c.mergeEvaluated.items(s, n.length, d.items));
  const l = s.name("valid"), u = s.const("len", (0, codegen_1$9._)`${a}.length`);
  n.forEach((p, g) => {
    (0, util_1$c.alwaysValidSchema)(d, p) || (s.if((0, codegen_1$9._)`${u} > ${g}`, () => e.subschema({
      keyword: c,
      schemaProp: g,
      dataProp: g
    }, l)), e.ok(l));
  });
  function h(p) {
    const { opts: g, errSchemaPath: y } = d, w = n.length, E = w === p.minItems && (w === p.maxItems || p[r] === !1);
    if (g.strictTuples && !E) {
      const m = `"${c}" is ${w}-tuple, but minItems or maxItems/${r} are not specified or different at path "${y}"`;
      (0, util_1$c.checkStrictMode)(d, m, g.strictTuples);
    }
  }
}
items.validateTuple = validateTuple;
items.default = def$f;
Object.defineProperty(prefixItems, "__esModule", { value: !0 });
const items_1$1 = items, def$e = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, items_1$1.validateTuple)(e, "items")
};
prefixItems.default = def$e;
var items2020 = {};
Object.defineProperty(items2020, "__esModule", { value: !0 });
const codegen_1$8 = codegen, util_1$b = util, code_1$4 = code, additionalItems_1$1 = additionalItems, error$7 = {
  message: ({ params: { len: e } }) => (0, codegen_1$8.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, codegen_1$8._)`{limit: ${e}}`
}, def$d = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: error$7,
  code(e) {
    const { schema: r, parentSchema: n, it: s } = e, { prefixItems: o } = n;
    s.items = !0, !(0, util_1$b.alwaysValidSchema)(s, r) && (o ? (0, additionalItems_1$1.validateAdditionalItems)(e, o) : e.ok((0, code_1$4.validateArray)(e)));
  }
};
items2020.default = def$d;
var contains = {};
Object.defineProperty(contains, "__esModule", { value: !0 });
const codegen_1$7 = codegen, util_1$a = util, error$6 = {
  message: ({ params: { min: e, max: r } }) => r === void 0 ? (0, codegen_1$7.str)`must contain at least ${e} valid item(s)` : (0, codegen_1$7.str)`must contain at least ${e} and no more than ${r} valid item(s)`,
  params: ({ params: { min: e, max: r } }) => r === void 0 ? (0, codegen_1$7._)`{minContains: ${e}}` : (0, codegen_1$7._)`{minContains: ${e}, maxContains: ${r}}`
}, def$c = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: error$6,
  code(e) {
    const { gen: r, schema: n, parentSchema: s, data: o, it: a } = e;
    let c, d;
    const { minContains: l, maxContains: u } = s;
    a.opts.next ? (c = l === void 0 ? 1 : l, d = u) : c = 1;
    const h = r.const("len", (0, codegen_1$7._)`${o}.length`);
    if (e.setParams({ min: c, max: d }), d === void 0 && c === 0) {
      (0, util_1$a.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (d !== void 0 && c > d) {
      (0, util_1$a.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, util_1$a.alwaysValidSchema)(a, n)) {
      let E = (0, codegen_1$7._)`${h} >= ${c}`;
      d !== void 0 && (E = (0, codegen_1$7._)`${E} && ${h} <= ${d}`), e.pass(E);
      return;
    }
    a.items = !0;
    const p = r.name("valid");
    d === void 0 && c === 1 ? y(p, () => r.if(p, () => r.break())) : c === 0 ? (r.let(p, !0), d !== void 0 && r.if((0, codegen_1$7._)`${o}.length > 0`, g)) : (r.let(p, !1), g()), e.result(p, () => e.reset());
    function g() {
      const E = r.name("_valid"), m = r.let("count", 0);
      y(E, () => r.if(E, () => w(m)));
    }
    function y(E, m) {
      r.forRange("i", 0, h, (_) => {
        e.subschema({
          keyword: "contains",
          dataProp: _,
          dataPropType: util_1$a.Type.Num,
          compositeRule: !0
        }, E), m();
      });
    }
    function w(E) {
      r.code((0, codegen_1$7._)`${E}++`), d === void 0 ? r.if((0, codegen_1$7._)`${E} >= ${c}`, () => r.assign(p, !0).break()) : (r.if((0, codegen_1$7._)`${E} > ${d}`, () => r.assign(p, !1).break()), c === 1 ? r.assign(p, !0) : r.if((0, codegen_1$7._)`${E} >= ${c}`, () => r.assign(p, !0)));
    }
  }
};
contains.default = def$c;
var dependencies = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const r = codegen, n = util, s = code;
  e.error = {
    message: ({ params: { property: l, depsCount: u, deps: h } }) => {
      const p = u === 1 ? "property" : "properties";
      return (0, r.str)`must have ${p} ${h} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: u, deps: h, missingProperty: p } }) => (0, r._)`{property: ${l},
    missingProperty: ${p},
    depsCount: ${u},
    deps: ${h}}`
    // TODO change to reference
  };
  const o = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(l) {
      const [u, h] = a(l);
      c(l, u), d(l, h);
    }
  };
  function a({ schema: l }) {
    const u = {}, h = {};
    for (const p in l) {
      if (p === "__proto__")
        continue;
      const g = Array.isArray(l[p]) ? u : h;
      g[p] = l[p];
    }
    return [u, h];
  }
  function c(l, u = l.schema) {
    const { gen: h, data: p, it: g } = l;
    if (Object.keys(u).length === 0)
      return;
    const y = h.let("missing");
    for (const w in u) {
      const E = u[w];
      if (E.length === 0)
        continue;
      const m = (0, s.propertyInData)(h, p, w, g.opts.ownProperties);
      l.setParams({
        property: w,
        depsCount: E.length,
        deps: E.join(", ")
      }), g.allErrors ? h.if(m, () => {
        for (const _ of E)
          (0, s.checkReportMissingProp)(l, _);
      }) : (h.if((0, r._)`${m} && (${(0, s.checkMissingProp)(l, E, y)})`), (0, s.reportMissingProp)(l, y), h.else());
    }
  }
  e.validatePropertyDeps = c;
  function d(l, u = l.schema) {
    const { gen: h, data: p, keyword: g, it: y } = l, w = h.name("valid");
    for (const E in u)
      (0, n.alwaysValidSchema)(y, u[E]) || (h.if(
        (0, s.propertyInData)(h, p, E, y.opts.ownProperties),
        () => {
          const m = l.subschema({ keyword: g, schemaProp: E }, w);
          l.mergeValidEvaluated(m, w);
        },
        () => h.var(w, !0)
        // TODO var
      ), l.ok(w));
  }
  e.validateSchemaDeps = d, e.default = o;
})(dependencies);
var propertyNames = {};
Object.defineProperty(propertyNames, "__esModule", { value: !0 });
const codegen_1$6 = codegen, util_1$9 = util, error$5 = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, codegen_1$6._)`{propertyName: ${e.propertyName}}`
}, def$b = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: error$5,
  code(e) {
    const { gen: r, schema: n, data: s, it: o } = e;
    if ((0, util_1$9.alwaysValidSchema)(o, n))
      return;
    const a = r.name("valid");
    r.forIn("key", s, (c) => {
      e.setParams({ propertyName: c }), e.subschema({
        keyword: "propertyNames",
        data: c,
        dataTypes: ["string"],
        propertyName: c,
        compositeRule: !0
      }, a), r.if((0, codegen_1$6.not)(a), () => {
        e.error(!0), o.allErrors || r.break();
      });
    }), e.ok(a);
  }
};
propertyNames.default = def$b;
var additionalProperties = {};
Object.defineProperty(additionalProperties, "__esModule", { value: !0 });
const code_1$3 = code, codegen_1$5 = codegen, names_1 = names$1, util_1$8 = util, error$4 = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, codegen_1$5._)`{additionalProperty: ${e.additionalProperty}}`
}, def$a = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: error$4,
  code(e) {
    const { gen: r, schema: n, parentSchema: s, data: o, errsCount: a, it: c } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: d, opts: l } = c;
    if (c.props = !0, l.removeAdditional !== "all" && (0, util_1$8.alwaysValidSchema)(c, n))
      return;
    const u = (0, code_1$3.allSchemaProperties)(s.properties), h = (0, code_1$3.allSchemaProperties)(s.patternProperties);
    p(), e.ok((0, codegen_1$5._)`${a} === ${names_1.default.errors}`);
    function p() {
      r.forIn("key", o, (m) => {
        !u.length && !h.length ? w(m) : r.if(g(m), () => w(m));
      });
    }
    function g(m) {
      let _;
      if (u.length > 8) {
        const S = (0, util_1$8.schemaRefOrVal)(c, s.properties, "properties");
        _ = (0, code_1$3.isOwnProperty)(r, S, m);
      } else u.length ? _ = (0, codegen_1$5.or)(...u.map((S) => (0, codegen_1$5._)`${m} === ${S}`)) : _ = codegen_1$5.nil;
      return h.length && (_ = (0, codegen_1$5.or)(_, ...h.map((S) => (0, codegen_1$5._)`${(0, code_1$3.usePattern)(e, S)}.test(${m})`))), (0, codegen_1$5.not)(_);
    }
    function y(m) {
      r.code((0, codegen_1$5._)`delete ${o}[${m}]`);
    }
    function w(m) {
      if (l.removeAdditional === "all" || l.removeAdditional && n === !1) {
        y(m);
        return;
      }
      if (n === !1) {
        e.setParams({ additionalProperty: m }), e.error(), d || r.break();
        return;
      }
      if (typeof n == "object" && !(0, util_1$8.alwaysValidSchema)(c, n)) {
        const _ = r.name("valid");
        l.removeAdditional === "failing" ? (E(m, _, !1), r.if((0, codegen_1$5.not)(_), () => {
          e.reset(), y(m);
        })) : (E(m, _), d || r.if((0, codegen_1$5.not)(_), () => r.break()));
      }
    }
    function E(m, _, S) {
      const O = {
        keyword: "additionalProperties",
        dataProp: m,
        dataPropType: util_1$8.Type.Str
      };
      S === !1 && Object.assign(O, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(O, _);
    }
  }
};
additionalProperties.default = def$a;
var properties$1 = {};
Object.defineProperty(properties$1, "__esModule", { value: !0 });
const validate_1 = validate, code_1$2 = code, util_1$7 = util, additionalProperties_1$1 = additionalProperties, def$9 = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: r, schema: n, parentSchema: s, data: o, it: a } = e;
    a.opts.removeAdditional === "all" && s.additionalProperties === void 0 && additionalProperties_1$1.default.code(new validate_1.KeywordCxt(a, additionalProperties_1$1.default, "additionalProperties"));
    const c = (0, code_1$2.allSchemaProperties)(n);
    for (const p of c)
      a.definedProperties.add(p);
    a.opts.unevaluated && c.length && a.props !== !0 && (a.props = util_1$7.mergeEvaluated.props(r, (0, util_1$7.toHash)(c), a.props));
    const d = c.filter((p) => !(0, util_1$7.alwaysValidSchema)(a, n[p]));
    if (d.length === 0)
      return;
    const l = r.name("valid");
    for (const p of d)
      u(p) ? h(p) : (r.if((0, code_1$2.propertyInData)(r, o, p, a.opts.ownProperties)), h(p), a.allErrors || r.else().var(l, !0), r.endIf()), e.it.definedProperties.add(p), e.ok(l);
    function u(p) {
      return a.opts.useDefaults && !a.compositeRule && n[p].default !== void 0;
    }
    function h(p) {
      e.subschema({
        keyword: "properties",
        schemaProp: p,
        dataProp: p
      }, l);
    }
  }
};
properties$1.default = def$9;
var patternProperties = {};
Object.defineProperty(patternProperties, "__esModule", { value: !0 });
const code_1$1 = code, codegen_1$4 = codegen, util_1$6 = util, util_2 = util, def$8 = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: r, schema: n, data: s, parentSchema: o, it: a } = e, { opts: c } = a, d = (0, code_1$1.allSchemaProperties)(n), l = d.filter((E) => (0, util_1$6.alwaysValidSchema)(a, n[E]));
    if (d.length === 0 || l.length === d.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const u = c.strictSchema && !c.allowMatchingProperties && o.properties, h = r.name("valid");
    a.props !== !0 && !(a.props instanceof codegen_1$4.Name) && (a.props = (0, util_2.evaluatedPropsToName)(r, a.props));
    const { props: p } = a;
    g();
    function g() {
      for (const E of d)
        u && y(E), a.allErrors ? w(E) : (r.var(h, !0), w(E), r.if(h));
    }
    function y(E) {
      for (const m in u)
        new RegExp(E).test(m) && (0, util_1$6.checkStrictMode)(a, `property ${m} matches pattern ${E} (use allowMatchingProperties)`);
    }
    function w(E) {
      r.forIn("key", s, (m) => {
        r.if((0, codegen_1$4._)`${(0, code_1$1.usePattern)(e, E)}.test(${m})`, () => {
          const _ = l.includes(E);
          _ || e.subschema({
            keyword: "patternProperties",
            schemaProp: E,
            dataProp: m,
            dataPropType: util_2.Type.Str
          }, h), a.opts.unevaluated && p !== !0 ? r.assign((0, codegen_1$4._)`${p}[${m}]`, !0) : !_ && !a.allErrors && r.if((0, codegen_1$4.not)(h), () => r.break());
        });
      });
    }
  }
};
patternProperties.default = def$8;
var not = {};
Object.defineProperty(not, "__esModule", { value: !0 });
const util_1$5 = util, def$7 = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: r, schema: n, it: s } = e;
    if ((0, util_1$5.alwaysValidSchema)(s, n)) {
      e.fail();
      return;
    }
    const o = r.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, o), e.failResult(o, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
not.default = def$7;
var anyOf = {};
Object.defineProperty(anyOf, "__esModule", { value: !0 });
const code_1 = code, def$6 = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: code_1.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
anyOf.default = def$6;
var oneOf = {};
Object.defineProperty(oneOf, "__esModule", { value: !0 });
const codegen_1$3 = codegen, util_1$4 = util, error$3 = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, codegen_1$3._)`{passingSchemas: ${e.passing}}`
}, def$5 = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: error$3,
  code(e) {
    const { gen: r, schema: n, parentSchema: s, it: o } = e;
    if (!Array.isArray(n))
      throw new Error("ajv implementation error");
    if (o.opts.discriminator && s.discriminator)
      return;
    const a = n, c = r.let("valid", !1), d = r.let("passing", null), l = r.name("_valid");
    e.setParams({ passing: d }), r.block(u), e.result(c, () => e.reset(), () => e.error(!0));
    function u() {
      a.forEach((h, p) => {
        let g;
        (0, util_1$4.alwaysValidSchema)(o, h) ? r.var(l, !0) : g = e.subschema({
          keyword: "oneOf",
          schemaProp: p,
          compositeRule: !0
        }, l), p > 0 && r.if((0, codegen_1$3._)`${l} && ${c}`).assign(c, !1).assign(d, (0, codegen_1$3._)`[${d}, ${p}]`).else(), r.if(l, () => {
          r.assign(c, !0), r.assign(d, p), g && e.mergeEvaluated(g, codegen_1$3.Name);
        });
      });
    }
  }
};
oneOf.default = def$5;
var allOf = {};
Object.defineProperty(allOf, "__esModule", { value: !0 });
const util_1$3 = util, def$4 = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: r, schema: n, it: s } = e;
    if (!Array.isArray(n))
      throw new Error("ajv implementation error");
    const o = r.name("valid");
    n.forEach((a, c) => {
      if ((0, util_1$3.alwaysValidSchema)(s, a))
        return;
      const d = e.subschema({ keyword: "allOf", schemaProp: c }, o);
      e.ok(o), e.mergeEvaluated(d);
    });
  }
};
allOf.default = def$4;
var _if = {};
Object.defineProperty(_if, "__esModule", { value: !0 });
const codegen_1$2 = codegen, util_1$2 = util, error$2 = {
  message: ({ params: e }) => (0, codegen_1$2.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, codegen_1$2._)`{failingKeyword: ${e.ifClause}}`
}, def$3 = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: error$2,
  code(e) {
    const { gen: r, parentSchema: n, it: s } = e;
    n.then === void 0 && n.else === void 0 && (0, util_1$2.checkStrictMode)(s, '"if" without "then" and "else" is ignored');
    const o = hasSchema(s, "then"), a = hasSchema(s, "else");
    if (!o && !a)
      return;
    const c = r.let("valid", !0), d = r.name("_valid");
    if (l(), e.reset(), o && a) {
      const h = r.let("ifClause");
      e.setParams({ ifClause: h }), r.if(d, u("then", h), u("else", h));
    } else o ? r.if(d, u("then")) : r.if((0, codegen_1$2.not)(d), u("else"));
    e.pass(c, () => e.error(!0));
    function l() {
      const h = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, d);
      e.mergeEvaluated(h);
    }
    function u(h, p) {
      return () => {
        const g = e.subschema({ keyword: h }, d);
        r.assign(c, d), e.mergeValidEvaluated(g, c), p ? r.assign(p, (0, codegen_1$2._)`${h}`) : e.setParams({ ifClause: h });
      };
    }
  }
};
function hasSchema(e, r) {
  const n = e.schema[r];
  return n !== void 0 && !(0, util_1$2.alwaysValidSchema)(e, n);
}
_if.default = def$3;
var thenElse = {};
Object.defineProperty(thenElse, "__esModule", { value: !0 });
const util_1$1 = util, def$2 = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: r, it: n }) {
    r.if === void 0 && (0, util_1$1.checkStrictMode)(n, `"${e}" without "if" is ignored`);
  }
};
thenElse.default = def$2;
Object.defineProperty(applicator, "__esModule", { value: !0 });
const additionalItems_1 = additionalItems, prefixItems_1 = prefixItems, items_1 = items, items2020_1 = items2020, contains_1 = contains, dependencies_1 = dependencies, propertyNames_1 = propertyNames, additionalProperties_1 = additionalProperties, properties_1 = properties$1, patternProperties_1 = patternProperties, not_1 = not, anyOf_1 = anyOf, oneOf_1 = oneOf, allOf_1 = allOf, if_1 = _if, thenElse_1 = thenElse;
function getApplicator(e = !1) {
  const r = [
    // any
    not_1.default,
    anyOf_1.default,
    oneOf_1.default,
    allOf_1.default,
    if_1.default,
    thenElse_1.default,
    // object
    propertyNames_1.default,
    additionalProperties_1.default,
    dependencies_1.default,
    properties_1.default,
    patternProperties_1.default
  ];
  return e ? r.push(prefixItems_1.default, items2020_1.default) : r.push(additionalItems_1.default, items_1.default), r.push(contains_1.default), r;
}
applicator.default = getApplicator;
var format$2 = {}, format$1 = {};
Object.defineProperty(format$1, "__esModule", { value: !0 });
const codegen_1$1 = codegen, error$1 = {
  message: ({ schemaCode: e }) => (0, codegen_1$1.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, codegen_1$1._)`{format: ${e}}`
}, def$1 = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: error$1,
  code(e, r) {
    const { gen: n, data: s, $data: o, schema: a, schemaCode: c, it: d } = e, { opts: l, errSchemaPath: u, schemaEnv: h, self: p } = d;
    if (!l.validateFormats)
      return;
    o ? g() : y();
    function g() {
      const w = n.scopeValue("formats", {
        ref: p.formats,
        code: l.code.formats
      }), E = n.const("fDef", (0, codegen_1$1._)`${w}[${c}]`), m = n.let("fType"), _ = n.let("format");
      n.if((0, codegen_1$1._)`typeof ${E} == "object" && !(${E} instanceof RegExp)`, () => n.assign(m, (0, codegen_1$1._)`${E}.type || "string"`).assign(_, (0, codegen_1$1._)`${E}.validate`), () => n.assign(m, (0, codegen_1$1._)`"string"`).assign(_, E)), e.fail$data((0, codegen_1$1.or)(S(), O()));
      function S() {
        return l.strictSchema === !1 ? codegen_1$1.nil : (0, codegen_1$1._)`${c} && !${_}`;
      }
      function O() {
        const I = h.$async ? (0, codegen_1$1._)`(${E}.async ? await ${_}(${s}) : ${_}(${s}))` : (0, codegen_1$1._)`${_}(${s})`, A = (0, codegen_1$1._)`(typeof ${_} == "function" ? ${I} : ${_}.test(${s}))`;
        return (0, codegen_1$1._)`${_} && ${_} !== true && ${m} === ${r} && !${A}`;
      }
    }
    function y() {
      const w = p.formats[a];
      if (!w) {
        S();
        return;
      }
      if (w === !0)
        return;
      const [E, m, _] = O(w);
      E === r && e.pass(I());
      function S() {
        if (l.strictSchema === !1) {
          p.logger.warn(A());
          return;
        }
        throw new Error(A());
        function A() {
          return `unknown format "${a}" ignored in schema at path "${u}"`;
        }
      }
      function O(A) {
        const F = A instanceof RegExp ? (0, codegen_1$1.regexpCode)(A) : l.code.formats ? (0, codegen_1$1._)`${l.code.formats}${(0, codegen_1$1.getProperty)(a)}` : void 0, z = n.scopeValue("formats", { key: a, ref: A, code: F });
        return typeof A == "object" && !(A instanceof RegExp) ? [A.type || "string", A.validate, (0, codegen_1$1._)`${z}.validate`] : ["string", A, z];
      }
      function I() {
        if (typeof w == "object" && !(w instanceof RegExp) && w.async) {
          if (!h.$async)
            throw new Error("async format in sync schema");
          return (0, codegen_1$1._)`await ${_}(${s})`;
        }
        return typeof m == "function" ? (0, codegen_1$1._)`${_}(${s})` : (0, codegen_1$1._)`${_}.test(${s})`;
      }
    }
  }
};
format$1.default = def$1;
Object.defineProperty(format$2, "__esModule", { value: !0 });
const format_1$1 = format$1, format = [format_1$1.default];
format$2.default = format;
var metadata = {};
Object.defineProperty(metadata, "__esModule", { value: !0 });
metadata.contentVocabulary = metadata.metadataVocabulary = void 0;
metadata.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
metadata.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(draft7, "__esModule", { value: !0 });
const core_1 = core$1, validation_1 = validation$1, applicator_1 = applicator, format_1 = format$2, metadata_1 = metadata, draft7Vocabularies = [
  core_1.default,
  validation_1.default,
  (0, applicator_1.default)(),
  format_1.default,
  metadata_1.metadataVocabulary,
  metadata_1.contentVocabulary
];
draft7.default = draft7Vocabularies;
var discriminator = {}, types = {};
Object.defineProperty(types, "__esModule", { value: !0 });
types.DiscrError = void 0;
var DiscrError;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(DiscrError || (types.DiscrError = DiscrError = {}));
Object.defineProperty(discriminator, "__esModule", { value: !0 });
const codegen_1 = codegen, types_1 = types, compile_1 = compile, ref_error_1 = ref_error, util_1 = util, error = {
  message: ({ params: { discrError: e, tagName: r } }) => e === types_1.DiscrError.Tag ? `tag "${r}" must be string` : `value of tag "${r}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: r, tagName: n } }) => (0, codegen_1._)`{error: ${e}, tag: ${n}, tagValue: ${r}}`
}, def = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error,
  code(e) {
    const { gen: r, data: n, schema: s, parentSchema: o, it: a } = e, { oneOf: c } = o;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const d = s.propertyName;
    if (typeof d != "string")
      throw new Error("discriminator: requires propertyName");
    if (s.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!c)
      throw new Error("discriminator: requires oneOf keyword");
    const l = r.let("valid", !1), u = r.const("tag", (0, codegen_1._)`${n}${(0, codegen_1.getProperty)(d)}`);
    r.if((0, codegen_1._)`typeof ${u} == "string"`, () => h(), () => e.error(!1, { discrError: types_1.DiscrError.Tag, tag: u, tagName: d })), e.ok(l);
    function h() {
      const y = g();
      r.if(!1);
      for (const w in y)
        r.elseIf((0, codegen_1._)`${u} === ${w}`), r.assign(l, p(y[w]));
      r.else(), e.error(!1, { discrError: types_1.DiscrError.Mapping, tag: u, tagName: d }), r.endIf();
    }
    function p(y) {
      const w = r.name("valid"), E = e.subschema({ keyword: "oneOf", schemaProp: y }, w);
      return e.mergeEvaluated(E, codegen_1.Name), w;
    }
    function g() {
      var y;
      const w = {}, E = _(o);
      let m = !0;
      for (let I = 0; I < c.length; I++) {
        let A = c[I];
        if (A != null && A.$ref && !(0, util_1.schemaHasRulesButRef)(A, a.self.RULES)) {
          const z = A.$ref;
          if (A = compile_1.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, z), A instanceof compile_1.SchemaEnv && (A = A.schema), A === void 0)
            throw new ref_error_1.default(a.opts.uriResolver, a.baseId, z);
        }
        const F = (y = A == null ? void 0 : A.properties) === null || y === void 0 ? void 0 : y[d];
        if (typeof F != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${d}"`);
        m = m && (E || _(A)), S(F, I);
      }
      if (!m)
        throw new Error(`discriminator: "${d}" must be required`);
      return w;
      function _({ required: I }) {
        return Array.isArray(I) && I.includes(d);
      }
      function S(I, A) {
        if (I.const)
          O(I.const, A);
        else if (I.enum)
          for (const F of I.enum)
            O(F, A);
        else
          throw new Error(`discriminator: "properties/${d}" must have "const" or "enum"`);
      }
      function O(I, A) {
        if (typeof I != "string" || I in w)
          throw new Error(`discriminator: "${d}" values must be unique strings`);
        w[I] = A;
      }
    }
  }
};
discriminator.default = def;
const $schema = "http://json-schema.org/draft-07/schema#", $id = "http://json-schema.org/draft-07/schema#", title = "Core schema meta-schema", definitions = {
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
}, type = [
  "object",
  "boolean"
], properties = {
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
}, require$$3 = {
  $schema,
  $id,
  title,
  definitions,
  type,
  properties,
  default: !0
};
(function(e, r) {
  Object.defineProperty(r, "__esModule", { value: !0 }), r.MissingRefError = r.ValidationError = r.CodeGen = r.Name = r.nil = r.stringify = r.str = r._ = r.KeywordCxt = r.Ajv = void 0;
  const n = core$2, s = draft7, o = discriminator, a = require$$3, c = ["/properties"], d = "http://json-schema.org/draft-07/schema";
  class l extends n.default {
    _addVocabularies() {
      super._addVocabularies(), s.default.forEach((w) => this.addVocabulary(w)), this.opts.discriminator && this.addKeyword(o.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const w = this.opts.$data ? this.$dataMetaSchema(a, c) : a;
      this.addMetaSchema(w, d, !1), this.refs["http://json-schema.org/schema"] = d;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(d) ? d : void 0);
    }
  }
  r.Ajv = l, e.exports = r = l, e.exports.Ajv = l, Object.defineProperty(r, "__esModule", { value: !0 }), r.default = l;
  var u = validate;
  Object.defineProperty(r, "KeywordCxt", { enumerable: !0, get: function() {
    return u.KeywordCxt;
  } });
  var h = codegen;
  Object.defineProperty(r, "_", { enumerable: !0, get: function() {
    return h._;
  } }), Object.defineProperty(r, "str", { enumerable: !0, get: function() {
    return h.str;
  } }), Object.defineProperty(r, "stringify", { enumerable: !0, get: function() {
    return h.stringify;
  } }), Object.defineProperty(r, "nil", { enumerable: !0, get: function() {
    return h.nil;
  } }), Object.defineProperty(r, "Name", { enumerable: !0, get: function() {
    return h.Name;
  } }), Object.defineProperty(r, "CodeGen", { enumerable: !0, get: function() {
    return h.CodeGen;
  } });
  var p = validation_error;
  Object.defineProperty(r, "ValidationError", { enumerable: !0, get: function() {
    return p.default;
  } });
  var g = ref_error;
  Object.defineProperty(r, "MissingRefError", { enumerable: !0, get: function() {
    return g.default;
  } });
})(ajv, ajv.exports);
var ajvExports = ajv.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const r = ajvExports, n = codegen, s = n.operators, o = {
    formatMaximum: { okStr: "<=", ok: s.LTE, fail: s.GT },
    formatMinimum: { okStr: ">=", ok: s.GTE, fail: s.LT },
    formatExclusiveMaximum: { okStr: "<", ok: s.LT, fail: s.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: s.GT, fail: s.LTE }
  }, a = {
    message: ({ keyword: d, schemaCode: l }) => (0, n.str)`should be ${o[d].okStr} ${l}`,
    params: ({ keyword: d, schemaCode: l }) => (0, n._)`{comparison: ${o[d].okStr}, limit: ${l}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(o),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(d) {
      const { gen: l, data: u, schemaCode: h, keyword: p, it: g } = d, { opts: y, self: w } = g;
      if (!y.validateFormats)
        return;
      const E = new r.KeywordCxt(g, w.RULES.all.format.definition, "format");
      E.$data ? m() : _();
      function m() {
        const O = l.scopeValue("formats", {
          ref: w.formats,
          code: y.code.formats
        }), I = l.const("fmt", (0, n._)`${O}[${E.schemaCode}]`);
        d.fail$data((0, n.or)((0, n._)`typeof ${I} != "object"`, (0, n._)`${I} instanceof RegExp`, (0, n._)`typeof ${I}.compare != "function"`, S(I)));
      }
      function _() {
        const O = E.schema, I = w.formats[O];
        if (!I || I === !0)
          return;
        if (typeof I != "object" || I instanceof RegExp || typeof I.compare != "function")
          throw new Error(`"${p}": format "${O}" does not define "compare" function`);
        const A = l.scopeValue("formats", {
          key: O,
          ref: I,
          code: y.code.formats ? (0, n._)`${y.code.formats}${(0, n.getProperty)(O)}` : void 0
        });
        d.fail$data(S(A));
      }
      function S(O) {
        return (0, n._)`${O}.compare(${u}, ${h}) ${o[p].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const c = (d) => (d.addKeyword(e.formatLimitDefinition), d);
  e.default = c;
})(limit);
(function(e, r) {
  Object.defineProperty(r, "__esModule", { value: !0 });
  const n = formats, s = limit, o = codegen, a = new o.Name("fullFormats"), c = new o.Name("fastFormats"), d = (u, h = { keywords: !0 }) => {
    if (Array.isArray(h))
      return l(u, h, n.fullFormats, a), u;
    const [p, g] = h.mode === "fast" ? [n.fastFormats, c] : [n.fullFormats, a], y = h.formats || n.formatNames;
    return l(u, y, p, g), h.keywords && (0, s.default)(u), u;
  };
  d.get = (u, h = "full") => {
    const g = (h === "fast" ? n.fastFormats : n.fullFormats)[u];
    if (!g)
      throw new Error(`Unknown format "${u}"`);
    return g;
  };
  function l(u, h, p, g) {
    var y, w;
    (y = (w = u.opts.code).formats) !== null && y !== void 0 || (w.formats = (0, o._)`require("ajv-formats/dist/formats").${g}`);
    for (const E of h)
      u.addFormat(E, p[E]);
  }
  e.exports = r = d, Object.defineProperty(r, "__esModule", { value: !0 }), r.default = d;
})(dist$1, dist$1.exports);
var distExports = dist$1.exports;
const ajvFormatsModule = /* @__PURE__ */ getDefaultExportFromCjs(distExports), copyProperty = (e, r, n, s) => {
  if (n === "length" || n === "prototype" || n === "arguments" || n === "caller")
    return;
  const o = Object.getOwnPropertyDescriptor(e, n), a = Object.getOwnPropertyDescriptor(r, n);
  !canCopyProperty(o, a) && s || Object.defineProperty(e, n, a);
}, canCopyProperty = function(e, r) {
  return e === void 0 || e.configurable || e.writable === r.writable && e.enumerable === r.enumerable && e.configurable === r.configurable && (e.writable || e.value === r.value);
}, changePrototype = (e, r) => {
  const n = Object.getPrototypeOf(r);
  n !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, n);
}, wrappedToString = (e, r) => `/* Wrapped ${e}*/
${r}`, toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), changeToString = (e, r, n) => {
  const s = n === "" ? "" : `with ${n.trim()}() `, o = wrappedToString.bind(null, s, r.toString());
  Object.defineProperty(o, "name", toStringName);
  const { writable: a, enumerable: c, configurable: d } = toStringDescriptor;
  Object.defineProperty(e, "toString", { value: o, writable: a, enumerable: c, configurable: d });
};
function mimicFunction(e, r, { ignoreNonConfigurable: n = !1 } = {}) {
  const { name: s } = e;
  for (const o of Reflect.ownKeys(r))
    copyProperty(e, r, o, n);
  return changePrototype(e, r), changeToString(e, r, s), e;
}
const debounceFunction = (e, r = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: n = 0,
    maxWait: s = Number.POSITIVE_INFINITY,
    before: o = !1,
    after: a = !0
  } = r;
  if (n < 0 || s < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!o && !a)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let c, d, l;
  const u = function(...h) {
    const p = this, g = () => {
      c = void 0, d && (clearTimeout(d), d = void 0), a && (l = e.apply(p, h));
    }, y = () => {
      d = void 0, c && (clearTimeout(c), c = void 0), a && (l = e.apply(p, h));
    }, w = o && !c;
    return clearTimeout(c), c = setTimeout(g, n), s > 0 && s !== Number.POSITIVE_INFINITY && !d && (d = setTimeout(y, s)), w && (l = e.apply(p, h)), l;
  };
  return mimicFunction(u, e), u.cancel = () => {
    c && (clearTimeout(c), c = void 0), d && (clearTimeout(d), d = void 0);
  }, u;
};
var re$2 = { exports: {} };
const SEMVER_SPEC_VERSION = "2.0.0", MAX_LENGTH$1 = 256, MAX_SAFE_INTEGER$1 = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, MAX_SAFE_COMPONENT_LENGTH = 16, MAX_SAFE_BUILD_LENGTH = MAX_LENGTH$1 - 6, RELEASE_TYPES = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var constants$1 = {
  MAX_LENGTH: MAX_LENGTH$1,
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1,
  RELEASE_TYPES,
  SEMVER_SPEC_VERSION,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const debug$1 = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var debug_1$1 = debug$1;
(function(e, r) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: s,
    MAX_LENGTH: o
  } = constants$1, a = debug_1$1;
  r = e.exports = {};
  const c = r.re = [], d = r.safeRe = [], l = r.src = [], u = r.safeSrc = [], h = r.t = {};
  let p = 0;
  const g = "[a-zA-Z0-9-]", y = [
    ["\\s", 1],
    ["\\d", o],
    [g, s]
  ], w = (m) => {
    for (const [_, S] of y)
      m = m.split(`${_}*`).join(`${_}{0,${S}}`).split(`${_}+`).join(`${_}{1,${S}}`);
    return m;
  }, E = (m, _, S) => {
    const O = w(_), I = p++;
    a(m, I, _), h[m] = I, l[I] = _, u[I] = O, c[I] = new RegExp(_, S ? "g" : void 0), d[I] = new RegExp(O, S ? "g" : void 0);
  };
  E("NUMERICIDENTIFIER", "0|[1-9]\\d*"), E("NUMERICIDENTIFIERLOOSE", "\\d+"), E("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${g}*`), E("MAINVERSION", `(${l[h.NUMERICIDENTIFIER]})\\.(${l[h.NUMERICIDENTIFIER]})\\.(${l[h.NUMERICIDENTIFIER]})`), E("MAINVERSIONLOOSE", `(${l[h.NUMERICIDENTIFIERLOOSE]})\\.(${l[h.NUMERICIDENTIFIERLOOSE]})\\.(${l[h.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASEIDENTIFIER", `(?:${l[h.NONNUMERICIDENTIFIER]}|${l[h.NUMERICIDENTIFIER]})`), E("PRERELEASEIDENTIFIERLOOSE", `(?:${l[h.NONNUMERICIDENTIFIER]}|${l[h.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASE", `(?:-(${l[h.PRERELEASEIDENTIFIER]}(?:\\.${l[h.PRERELEASEIDENTIFIER]})*))`), E("PRERELEASELOOSE", `(?:-?(${l[h.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[h.PRERELEASEIDENTIFIERLOOSE]})*))`), E("BUILDIDENTIFIER", `${g}+`), E("BUILD", `(?:\\+(${l[h.BUILDIDENTIFIER]}(?:\\.${l[h.BUILDIDENTIFIER]})*))`), E("FULLPLAIN", `v?${l[h.MAINVERSION]}${l[h.PRERELEASE]}?${l[h.BUILD]}?`), E("FULL", `^${l[h.FULLPLAIN]}$`), E("LOOSEPLAIN", `[v=\\s]*${l[h.MAINVERSIONLOOSE]}${l[h.PRERELEASELOOSE]}?${l[h.BUILD]}?`), E("LOOSE", `^${l[h.LOOSEPLAIN]}$`), E("GTLT", "((?:<|>)?=?)"), E("XRANGEIDENTIFIERLOOSE", `${l[h.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), E("XRANGEIDENTIFIER", `${l[h.NUMERICIDENTIFIER]}|x|X|\\*`), E("XRANGEPLAIN", `[v=\\s]*(${l[h.XRANGEIDENTIFIER]})(?:\\.(${l[h.XRANGEIDENTIFIER]})(?:\\.(${l[h.XRANGEIDENTIFIER]})(?:${l[h.PRERELEASE]})?${l[h.BUILD]}?)?)?`), E("XRANGEPLAINLOOSE", `[v=\\s]*(${l[h.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[h.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[h.XRANGEIDENTIFIERLOOSE]})(?:${l[h.PRERELEASELOOSE]})?${l[h.BUILD]}?)?)?`), E("XRANGE", `^${l[h.GTLT]}\\s*${l[h.XRANGEPLAIN]}$`), E("XRANGELOOSE", `^${l[h.GTLT]}\\s*${l[h.XRANGEPLAINLOOSE]}$`), E("COERCEPLAIN", `(^|[^\\d])(\\d{1,${n}})(?:\\.(\\d{1,${n}}))?(?:\\.(\\d{1,${n}}))?`), E("COERCE", `${l[h.COERCEPLAIN]}(?:$|[^\\d])`), E("COERCEFULL", l[h.COERCEPLAIN] + `(?:${l[h.PRERELEASE]})?(?:${l[h.BUILD]})?(?:$|[^\\d])`), E("COERCERTL", l[h.COERCE], !0), E("COERCERTLFULL", l[h.COERCEFULL], !0), E("LONETILDE", "(?:~>?)"), E("TILDETRIM", `(\\s*)${l[h.LONETILDE]}\\s+`, !0), r.tildeTrimReplace = "$1~", E("TILDE", `^${l[h.LONETILDE]}${l[h.XRANGEPLAIN]}$`), E("TILDELOOSE", `^${l[h.LONETILDE]}${l[h.XRANGEPLAINLOOSE]}$`), E("LONECARET", "(?:\\^)"), E("CARETTRIM", `(\\s*)${l[h.LONECARET]}\\s+`, !0), r.caretTrimReplace = "$1^", E("CARET", `^${l[h.LONECARET]}${l[h.XRANGEPLAIN]}$`), E("CARETLOOSE", `^${l[h.LONECARET]}${l[h.XRANGEPLAINLOOSE]}$`), E("COMPARATORLOOSE", `^${l[h.GTLT]}\\s*(${l[h.LOOSEPLAIN]})$|^$`), E("COMPARATOR", `^${l[h.GTLT]}\\s*(${l[h.FULLPLAIN]})$|^$`), E("COMPARATORTRIM", `(\\s*)${l[h.GTLT]}\\s*(${l[h.LOOSEPLAIN]}|${l[h.XRANGEPLAIN]})`, !0), r.comparatorTrimReplace = "$1$2$3", E("HYPHENRANGE", `^\\s*(${l[h.XRANGEPLAIN]})\\s+-\\s+(${l[h.XRANGEPLAIN]})\\s*$`), E("HYPHENRANGELOOSE", `^\\s*(${l[h.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[h.XRANGEPLAINLOOSE]})\\s*$`), E("STAR", "(<|>)?=?\\s*\\*"), E("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), E("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(re$2, re$2.exports);
var reExports = re$2.exports;
const looseOption = Object.freeze({ loose: !0 }), emptyOpts = Object.freeze({}), parseOptions$1 = (e) => e ? typeof e != "object" ? looseOption : e : emptyOpts;
var parseOptions_1 = parseOptions$1;
const numeric = /^[0-9]+$/, compareIdentifiers$1 = (e, r) => {
  if (typeof e == "number" && typeof r == "number")
    return e === r ? 0 : e < r ? -1 : 1;
  const n = numeric.test(e), s = numeric.test(r);
  return n && s && (e = +e, r = +r), e === r ? 0 : n && !s ? -1 : s && !n ? 1 : e < r ? -1 : 1;
}, rcompareIdentifiers = (e, r) => compareIdentifiers$1(r, e);
var identifiers$1 = {
  compareIdentifiers: compareIdentifiers$1,
  rcompareIdentifiers
};
const debug = debug_1$1, { MAX_LENGTH, MAX_SAFE_INTEGER } = constants$1, { safeRe: re$1, t: t$1 } = reExports, parseOptions = parseOptions_1, { compareIdentifiers } = identifiers$1;
let SemVer$d = class he {
  constructor(r, n) {
    if (n = parseOptions(n), r instanceof he) {
      if (r.loose === !!n.loose && r.includePrerelease === !!n.includePrerelease)
        return r;
      r = r.version;
    } else if (typeof r != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof r}".`);
    if (r.length > MAX_LENGTH)
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      );
    debug("SemVer", r, n), this.options = n, this.loose = !!n.loose, this.includePrerelease = !!n.includePrerelease;
    const s = r.trim().match(n.loose ? re$1[t$1.LOOSE] : re$1[t$1.FULL]);
    if (!s)
      throw new TypeError(`Invalid Version: ${r}`);
    if (this.raw = r, this.major = +s[1], this.minor = +s[2], this.patch = +s[3], this.major > MAX_SAFE_INTEGER || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0)
      throw new TypeError("Invalid patch version");
    s[4] ? this.prerelease = s[4].split(".").map((o) => {
      if (/^[0-9]+$/.test(o)) {
        const a = +o;
        if (a >= 0 && a < MAX_SAFE_INTEGER)
          return a;
      }
      return o;
    }) : this.prerelease = [], this.build = s[5] ? s[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(r) {
    if (debug("SemVer.compare", this.version, this.options, r), !(r instanceof he)) {
      if (typeof r == "string" && r === this.version)
        return 0;
      r = new he(r, this.options);
    }
    return r.version === this.version ? 0 : this.compareMain(r) || this.comparePre(r);
  }
  compareMain(r) {
    return r instanceof he || (r = new he(r, this.options)), this.major < r.major ? -1 : this.major > r.major ? 1 : this.minor < r.minor ? -1 : this.minor > r.minor ? 1 : this.patch < r.patch ? -1 : this.patch > r.patch ? 1 : 0;
  }
  comparePre(r) {
    if (r instanceof he || (r = new he(r, this.options)), this.prerelease.length && !r.prerelease.length)
      return -1;
    if (!this.prerelease.length && r.prerelease.length)
      return 1;
    if (!this.prerelease.length && !r.prerelease.length)
      return 0;
    let n = 0;
    do {
      const s = this.prerelease[n], o = r.prerelease[n];
      if (debug("prerelease compare", n, s, o), s === void 0 && o === void 0)
        return 0;
      if (o === void 0)
        return 1;
      if (s === void 0)
        return -1;
      if (s === o)
        continue;
      return compareIdentifiers(s, o);
    } while (++n);
  }
  compareBuild(r) {
    r instanceof he || (r = new he(r, this.options));
    let n = 0;
    do {
      const s = this.build[n], o = r.build[n];
      if (debug("build compare", n, s, o), s === void 0 && o === void 0)
        return 0;
      if (o === void 0)
        return 1;
      if (s === void 0)
        return -1;
      if (s === o)
        continue;
      return compareIdentifiers(s, o);
    } while (++n);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(r, n, s) {
    if (r.startsWith("pre")) {
      if (!n && s === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (n) {
        const o = `-${n}`.match(this.options.loose ? re$1[t$1.PRERELEASELOOSE] : re$1[t$1.PRERELEASE]);
        if (!o || o[1] !== n)
          throw new Error(`invalid identifier: ${n}`);
      }
    }
    switch (r) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", n, s);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", n, s);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", n, s), this.inc("pre", n, s);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", n, s), this.inc("pre", n, s);
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
        const o = Number(s) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [o];
        else {
          let a = this.prerelease.length;
          for (; --a >= 0; )
            typeof this.prerelease[a] == "number" && (this.prerelease[a]++, a = -2);
          if (a === -1) {
            if (n === this.prerelease.join(".") && s === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(o);
          }
        }
        if (n) {
          let a = [n, o];
          s === !1 && (a = [n]), compareIdentifiers(this.prerelease[0], n) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${r}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var semver$2 = SemVer$d;
const SemVer$c = semver$2, parse$7 = (e, r, n = !1) => {
  if (e instanceof SemVer$c)
    return e;
  try {
    return new SemVer$c(e, r);
  } catch (s) {
    if (!n)
      return null;
    throw s;
  }
};
var parse_1 = parse$7;
const parse$6 = parse_1, valid$2 = (e, r) => {
  const n = parse$6(e, r);
  return n ? n.version : null;
};
var valid_1 = valid$2;
const parse$5 = parse_1, clean$1 = (e, r) => {
  const n = parse$5(e.trim().replace(/^[=v]+/, ""), r);
  return n ? n.version : null;
};
var clean_1 = clean$1;
const SemVer$b = semver$2, inc$1 = (e, r, n, s, o) => {
  typeof n == "string" && (o = s, s = n, n = void 0);
  try {
    return new SemVer$b(
      e instanceof SemVer$b ? e.version : e,
      n
    ).inc(r, s, o).version;
  } catch {
    return null;
  }
};
var inc_1 = inc$1;
const parse$4 = parse_1, diff$1 = (e, r) => {
  const n = parse$4(e, null, !0), s = parse$4(r, null, !0), o = n.compare(s);
  if (o === 0)
    return null;
  const a = o > 0, c = a ? n : s, d = a ? s : n, l = !!c.prerelease.length;
  if (!!d.prerelease.length && !l) {
    if (!d.patch && !d.minor)
      return "major";
    if (d.compareMain(c) === 0)
      return d.minor && !d.patch ? "minor" : "patch";
  }
  const h = l ? "pre" : "";
  return n.major !== s.major ? h + "major" : n.minor !== s.minor ? h + "minor" : n.patch !== s.patch ? h + "patch" : "prerelease";
};
var diff_1 = diff$1;
const SemVer$a = semver$2, major$1 = (e, r) => new SemVer$a(e, r).major;
var major_1 = major$1;
const SemVer$9 = semver$2, minor$1 = (e, r) => new SemVer$9(e, r).minor;
var minor_1 = minor$1;
const SemVer$8 = semver$2, patch$1 = (e, r) => new SemVer$8(e, r).patch;
var patch_1 = patch$1;
const parse$3 = parse_1, prerelease$1 = (e, r) => {
  const n = parse$3(e, r);
  return n && n.prerelease.length ? n.prerelease : null;
};
var prerelease_1 = prerelease$1;
const SemVer$7 = semver$2, compare$b = (e, r, n) => new SemVer$7(e, n).compare(new SemVer$7(r, n));
var compare_1 = compare$b;
const compare$a = compare_1, rcompare$1 = (e, r, n) => compare$a(r, e, n);
var rcompare_1 = rcompare$1;
const compare$9 = compare_1, compareLoose$1 = (e, r) => compare$9(e, r, !0);
var compareLoose_1 = compareLoose$1;
const SemVer$6 = semver$2, compareBuild$3 = (e, r, n) => {
  const s = new SemVer$6(e, n), o = new SemVer$6(r, n);
  return s.compare(o) || s.compareBuild(o);
};
var compareBuild_1 = compareBuild$3;
const compareBuild$2 = compareBuild_1, sort$1 = (e, r) => e.sort((n, s) => compareBuild$2(n, s, r));
var sort_1 = sort$1;
const compareBuild$1 = compareBuild_1, rsort$1 = (e, r) => e.sort((n, s) => compareBuild$1(s, n, r));
var rsort_1 = rsort$1;
const compare$8 = compare_1, gt$4 = (e, r, n) => compare$8(e, r, n) > 0;
var gt_1 = gt$4;
const compare$7 = compare_1, lt$3 = (e, r, n) => compare$7(e, r, n) < 0;
var lt_1 = lt$3;
const compare$6 = compare_1, eq$2 = (e, r, n) => compare$6(e, r, n) === 0;
var eq_1 = eq$2;
const compare$5 = compare_1, neq$2 = (e, r, n) => compare$5(e, r, n) !== 0;
var neq_1 = neq$2;
const compare$4 = compare_1, gte$3 = (e, r, n) => compare$4(e, r, n) >= 0;
var gte_1 = gte$3;
const compare$3 = compare_1, lte$3 = (e, r, n) => compare$3(e, r, n) <= 0;
var lte_1 = lte$3;
const eq$1 = eq_1, neq$1 = neq_1, gt$3 = gt_1, gte$2 = gte_1, lt$2 = lt_1, lte$2 = lte_1, cmp$1 = (e, r, n, s) => {
  switch (r) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof n == "object" && (n = n.version), e === n;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof n == "object" && (n = n.version), e !== n;
    case "":
    case "=":
    case "==":
      return eq$1(e, n, s);
    case "!=":
      return neq$1(e, n, s);
    case ">":
      return gt$3(e, n, s);
    case ">=":
      return gte$2(e, n, s);
    case "<":
      return lt$2(e, n, s);
    case "<=":
      return lte$2(e, n, s);
    default:
      throw new TypeError(`Invalid operator: ${r}`);
  }
};
var cmp_1 = cmp$1;
const SemVer$5 = semver$2, parse$2 = parse_1, { safeRe: re, t } = reExports, coerce$1 = (e, r) => {
  if (e instanceof SemVer$5)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  r = r || {};
  let n = null;
  if (!r.rtl)
    n = e.match(r.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
  else {
    const l = r.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
    let u;
    for (; (u = l.exec(e)) && (!n || n.index + n[0].length !== e.length); )
      (!n || u.index + u[0].length !== n.index + n[0].length) && (n = u), l.lastIndex = u.index + u[1].length + u[2].length;
    l.lastIndex = -1;
  }
  if (n === null)
    return null;
  const s = n[2], o = n[3] || "0", a = n[4] || "0", c = r.includePrerelease && n[5] ? `-${n[5]}` : "", d = r.includePrerelease && n[6] ? `+${n[6]}` : "";
  return parse$2(`${s}.${o}.${a}${c}${d}`, r);
};
var coerce_1 = coerce$1;
class LRUCache {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(r) {
    const n = this.map.get(r);
    if (n !== void 0)
      return this.map.delete(r), this.map.set(r, n), n;
  }
  delete(r) {
    return this.map.delete(r);
  }
  set(r, n) {
    if (!this.delete(r) && n !== void 0) {
      if (this.map.size >= this.max) {
        const o = this.map.keys().next().value;
        this.delete(o);
      }
      this.map.set(r, n);
    }
    return this;
  }
}
var lrucache = LRUCache, range, hasRequiredRange;
function requireRange() {
  if (hasRequiredRange) return range;
  hasRequiredRange = 1;
  const e = /\s+/g;
  class r {
    constructor(L, N) {
      if (N = o(N), L instanceof r)
        return L.loose === !!N.loose && L.includePrerelease === !!N.includePrerelease ? L : new r(L.raw, N);
      if (L instanceof a)
        return this.raw = L.value, this.set = [[L]], this.formatted = void 0, this;
      if (this.options = N, this.loose = !!N.loose, this.includePrerelease = !!N.includePrerelease, this.raw = L.trim().replace(e, " "), this.set = this.raw.split("||").map((C) => this.parseRange(C.trim())).filter((C) => C.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const C = this.set[0];
        if (this.set = this.set.filter((j) => !E(j[0])), this.set.length === 0)
          this.set = [C];
        else if (this.set.length > 1) {
          for (const j of this.set)
            if (j.length === 1 && m(j[0])) {
              this.set = [j];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let L = 0; L < this.set.length; L++) {
          L > 0 && (this.formatted += "||");
          const N = this.set[L];
          for (let C = 0; C < N.length; C++)
            C > 0 && (this.formatted += " "), this.formatted += N[C].toString().trim();
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
    parseRange(L) {
      const C = ((this.options.includePrerelease && y) | (this.options.loose && w)) + ":" + L, j = s.get(C);
      if (j)
        return j;
      const q = this.options.loose, T = q ? l[u.HYPHENRANGELOOSE] : l[u.HYPHENRANGE];
      L = L.replace(T, V(this.options.includePrerelease)), c("hyphen replace", L), L = L.replace(l[u.COMPARATORTRIM], h), c("comparator trim", L), L = L.replace(l[u.TILDETRIM], p), c("tilde trim", L), L = L.replace(l[u.CARETTRIM], g), c("caret trim", L);
      let v = L.split(" ").map(($) => S($, this.options)).join(" ").split(/\s+/).map(($) => K($, this.options));
      q && (v = v.filter(($) => (c("loose invalid filter", $, this.options), !!$.match(l[u.COMPARATORLOOSE])))), c("range list", v);
      const P = /* @__PURE__ */ new Map(), b = v.map(($) => new a($, this.options));
      for (const $ of b) {
        if (E($))
          return [$];
        P.set($.value, $);
      }
      P.size > 1 && P.has("") && P.delete("");
      const f = [...P.values()];
      return s.set(C, f), f;
    }
    intersects(L, N) {
      if (!(L instanceof r))
        throw new TypeError("a Range is required");
      return this.set.some((C) => _(C, N) && L.set.some((j) => _(j, N) && C.every((q) => j.every((T) => q.intersects(T, N)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(L) {
      if (!L)
        return !1;
      if (typeof L == "string")
        try {
          L = new d(L, this.options);
        } catch {
          return !1;
        }
      for (let N = 0; N < this.set.length; N++)
        if (G(this.set[N], L, this.options))
          return !0;
      return !1;
    }
  }
  range = r;
  const n = lrucache, s = new n(), o = parseOptions_1, a = requireComparator(), c = debug_1$1, d = semver$2, {
    safeRe: l,
    t: u,
    comparatorTrimReplace: h,
    tildeTrimReplace: p,
    caretTrimReplace: g
  } = reExports, { FLAG_INCLUDE_PRERELEASE: y, FLAG_LOOSE: w } = constants$1, E = (M) => M.value === "<0.0.0-0", m = (M) => M.value === "", _ = (M, L) => {
    let N = !0;
    const C = M.slice();
    let j = C.pop();
    for (; N && C.length; )
      N = C.every((q) => j.intersects(q, L)), j = C.pop();
    return N;
  }, S = (M, L) => (M = M.replace(l[u.BUILD], ""), c("comp", M, L), M = F(M, L), c("caret", M), M = I(M, L), c("tildes", M), M = x(M, L), c("xrange", M), M = J(M, L), c("stars", M), M), O = (M) => !M || M.toLowerCase() === "x" || M === "*", I = (M, L) => M.trim().split(/\s+/).map((N) => A(N, L)).join(" "), A = (M, L) => {
    const N = L.loose ? l[u.TILDELOOSE] : l[u.TILDE];
    return M.replace(N, (C, j, q, T, v) => {
      c("tilde", M, C, j, q, T, v);
      let P;
      return O(j) ? P = "" : O(q) ? P = `>=${j}.0.0 <${+j + 1}.0.0-0` : O(T) ? P = `>=${j}.${q}.0 <${j}.${+q + 1}.0-0` : v ? (c("replaceTilde pr", v), P = `>=${j}.${q}.${T}-${v} <${j}.${+q + 1}.0-0`) : P = `>=${j}.${q}.${T} <${j}.${+q + 1}.0-0`, c("tilde return", P), P;
    });
  }, F = (M, L) => M.trim().split(/\s+/).map((N) => z(N, L)).join(" "), z = (M, L) => {
    c("caret", M, L);
    const N = L.loose ? l[u.CARETLOOSE] : l[u.CARET], C = L.includePrerelease ? "-0" : "";
    return M.replace(N, (j, q, T, v, P) => {
      c("caret", M, j, q, T, v, P);
      let b;
      return O(q) ? b = "" : O(T) ? b = `>=${q}.0.0${C} <${+q + 1}.0.0-0` : O(v) ? q === "0" ? b = `>=${q}.${T}.0${C} <${q}.${+T + 1}.0-0` : b = `>=${q}.${T}.0${C} <${+q + 1}.0.0-0` : P ? (c("replaceCaret pr", P), q === "0" ? T === "0" ? b = `>=${q}.${T}.${v}-${P} <${q}.${T}.${+v + 1}-0` : b = `>=${q}.${T}.${v}-${P} <${q}.${+T + 1}.0-0` : b = `>=${q}.${T}.${v}-${P} <${+q + 1}.0.0-0`) : (c("no pr"), q === "0" ? T === "0" ? b = `>=${q}.${T}.${v}${C} <${q}.${T}.${+v + 1}-0` : b = `>=${q}.${T}.${v}${C} <${q}.${+T + 1}.0-0` : b = `>=${q}.${T}.${v} <${+q + 1}.0.0-0`), c("caret return", b), b;
    });
  }, x = (M, L) => (c("replaceXRanges", M, L), M.split(/\s+/).map((N) => Y(N, L)).join(" ")), Y = (M, L) => {
    M = M.trim();
    const N = L.loose ? l[u.XRANGELOOSE] : l[u.XRANGE];
    return M.replace(N, (C, j, q, T, v, P) => {
      c("xRange", M, C, j, q, T, v, P);
      const b = O(q), f = b || O(T), $ = f || O(v), R = $;
      return j === "=" && R && (j = ""), P = L.includePrerelease ? "-0" : "", b ? j === ">" || j === "<" ? C = "<0.0.0-0" : C = "*" : j && R ? (f && (T = 0), v = 0, j === ">" ? (j = ">=", f ? (q = +q + 1, T = 0, v = 0) : (T = +T + 1, v = 0)) : j === "<=" && (j = "<", f ? q = +q + 1 : T = +T + 1), j === "<" && (P = "-0"), C = `${j + q}.${T}.${v}${P}`) : f ? C = `>=${q}.0.0${P} <${+q + 1}.0.0-0` : $ && (C = `>=${q}.${T}.0${P} <${q}.${+T + 1}.0-0`), c("xRange return", C), C;
    });
  }, J = (M, L) => (c("replaceStars", M, L), M.trim().replace(l[u.STAR], "")), K = (M, L) => (c("replaceGTE0", M, L), M.trim().replace(l[L.includePrerelease ? u.GTE0PRE : u.GTE0], "")), V = (M) => (L, N, C, j, q, T, v, P, b, f, $, R) => (O(C) ? N = "" : O(j) ? N = `>=${C}.0.0${M ? "-0" : ""}` : O(q) ? N = `>=${C}.${j}.0${M ? "-0" : ""}` : T ? N = `>=${N}` : N = `>=${N}${M ? "-0" : ""}`, O(b) ? P = "" : O(f) ? P = `<${+b + 1}.0.0-0` : O($) ? P = `<${b}.${+f + 1}.0-0` : R ? P = `<=${b}.${f}.${$}-${R}` : M ? P = `<${b}.${f}.${+$ + 1}-0` : P = `<=${P}`, `${N} ${P}`.trim()), G = (M, L, N) => {
    for (let C = 0; C < M.length; C++)
      if (!M[C].test(L))
        return !1;
    if (L.prerelease.length && !N.includePrerelease) {
      for (let C = 0; C < M.length; C++)
        if (c(M[C].semver), M[C].semver !== a.ANY && M[C].semver.prerelease.length > 0) {
          const j = M[C].semver;
          if (j.major === L.major && j.minor === L.minor && j.patch === L.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return range;
}
var comparator, hasRequiredComparator;
function requireComparator() {
  if (hasRequiredComparator) return comparator;
  hasRequiredComparator = 1;
  const e = Symbol("SemVer ANY");
  class r {
    static get ANY() {
      return e;
    }
    constructor(h, p) {
      if (p = n(p), h instanceof r) {
        if (h.loose === !!p.loose)
          return h;
        h = h.value;
      }
      h = h.trim().split(/\s+/).join(" "), c("comparator", h, p), this.options = p, this.loose = !!p.loose, this.parse(h), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, c("comp", this);
    }
    parse(h) {
      const p = this.options.loose ? s[o.COMPARATORLOOSE] : s[o.COMPARATOR], g = h.match(p);
      if (!g)
        throw new TypeError(`Invalid comparator: ${h}`);
      this.operator = g[1] !== void 0 ? g[1] : "", this.operator === "=" && (this.operator = ""), g[2] ? this.semver = new d(g[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(h) {
      if (c("Comparator.test", h, this.options.loose), this.semver === e || h === e)
        return !0;
      if (typeof h == "string")
        try {
          h = new d(h, this.options);
        } catch {
          return !1;
        }
      return a(h, this.operator, this.semver, this.options);
    }
    intersects(h, p) {
      if (!(h instanceof r))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(h.value, p).test(this.value) : h.operator === "" ? h.value === "" ? !0 : new l(this.value, p).test(h.semver) : (p = n(p), p.includePrerelease && (this.value === "<0.0.0-0" || h.value === "<0.0.0-0") || !p.includePrerelease && (this.value.startsWith("<0.0.0") || h.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && h.operator.startsWith(">") || this.operator.startsWith("<") && h.operator.startsWith("<") || this.semver.version === h.semver.version && this.operator.includes("=") && h.operator.includes("=") || a(this.semver, "<", h.semver, p) && this.operator.startsWith(">") && h.operator.startsWith("<") || a(this.semver, ">", h.semver, p) && this.operator.startsWith("<") && h.operator.startsWith(">")));
    }
  }
  comparator = r;
  const n = parseOptions_1, { safeRe: s, t: o } = reExports, a = cmp_1, c = debug_1$1, d = semver$2, l = requireRange();
  return comparator;
}
const Range$9 = requireRange(), satisfies$4 = (e, r, n) => {
  try {
    r = new Range$9(r, n);
  } catch {
    return !1;
  }
  return r.test(e);
};
var satisfies_1 = satisfies$4;
const Range$8 = requireRange(), toComparators$1 = (e, r) => new Range$8(e, r).set.map((n) => n.map((s) => s.value).join(" ").trim().split(" "));
var toComparators_1 = toComparators$1;
const SemVer$4 = semver$2, Range$7 = requireRange(), maxSatisfying$1 = (e, r, n) => {
  let s = null, o = null, a = null;
  try {
    a = new Range$7(r, n);
  } catch {
    return null;
  }
  return e.forEach((c) => {
    a.test(c) && (!s || o.compare(c) === -1) && (s = c, o = new SemVer$4(s, n));
  }), s;
};
var maxSatisfying_1 = maxSatisfying$1;
const SemVer$3 = semver$2, Range$6 = requireRange(), minSatisfying$1 = (e, r, n) => {
  let s = null, o = null, a = null;
  try {
    a = new Range$6(r, n);
  } catch {
    return null;
  }
  return e.forEach((c) => {
    a.test(c) && (!s || o.compare(c) === 1) && (s = c, o = new SemVer$3(s, n));
  }), s;
};
var minSatisfying_1 = minSatisfying$1;
const SemVer$2 = semver$2, Range$5 = requireRange(), gt$2 = gt_1, minVersion$1 = (e, r) => {
  e = new Range$5(e, r);
  let n = new SemVer$2("0.0.0");
  if (e.test(n) || (n = new SemVer$2("0.0.0-0"), e.test(n)))
    return n;
  n = null;
  for (let s = 0; s < e.set.length; ++s) {
    const o = e.set[s];
    let a = null;
    o.forEach((c) => {
      const d = new SemVer$2(c.semver.version);
      switch (c.operator) {
        case ">":
          d.prerelease.length === 0 ? d.patch++ : d.prerelease.push(0), d.raw = d.format();
        case "":
        case ">=":
          (!a || gt$2(d, a)) && (a = d);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${c.operator}`);
      }
    }), a && (!n || gt$2(n, a)) && (n = a);
  }
  return n && e.test(n) ? n : null;
};
var minVersion_1 = minVersion$1;
const Range$4 = requireRange(), validRange$1 = (e, r) => {
  try {
    return new Range$4(e, r).range || "*";
  } catch {
    return null;
  }
};
var valid$1 = validRange$1;
const SemVer$1 = semver$2, Comparator$2 = requireComparator(), { ANY: ANY$1 } = Comparator$2, Range$3 = requireRange(), satisfies$3 = satisfies_1, gt$1 = gt_1, lt$1 = lt_1, lte$1 = lte_1, gte$1 = gte_1, outside$3 = (e, r, n, s) => {
  e = new SemVer$1(e, s), r = new Range$3(r, s);
  let o, a, c, d, l;
  switch (n) {
    case ">":
      o = gt$1, a = lte$1, c = lt$1, d = ">", l = ">=";
      break;
    case "<":
      o = lt$1, a = gte$1, c = gt$1, d = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (satisfies$3(e, r, s))
    return !1;
  for (let u = 0; u < r.set.length; ++u) {
    const h = r.set[u];
    let p = null, g = null;
    if (h.forEach((y) => {
      y.semver === ANY$1 && (y = new Comparator$2(">=0.0.0")), p = p || y, g = g || y, o(y.semver, p.semver, s) ? p = y : c(y.semver, g.semver, s) && (g = y);
    }), p.operator === d || p.operator === l || (!g.operator || g.operator === d) && a(e, g.semver))
      return !1;
    if (g.operator === l && c(e, g.semver))
      return !1;
  }
  return !0;
};
var outside_1 = outside$3;
const outside$2 = outside_1, gtr$1 = (e, r, n) => outside$2(e, r, ">", n);
var gtr_1 = gtr$1;
const outside$1 = outside_1, ltr$1 = (e, r, n) => outside$1(e, r, "<", n);
var ltr_1 = ltr$1;
const Range$2 = requireRange(), intersects$1 = (e, r, n) => (e = new Range$2(e, n), r = new Range$2(r, n), e.intersects(r, n));
var intersects_1 = intersects$1;
const satisfies$2 = satisfies_1, compare$2 = compare_1;
var simplify = (e, r, n) => {
  const s = [];
  let o = null, a = null;
  const c = e.sort((h, p) => compare$2(h, p, n));
  for (const h of c)
    satisfies$2(h, r, n) ? (a = h, o || (o = h)) : (a && s.push([o, a]), a = null, o = null);
  o && s.push([o, null]);
  const d = [];
  for (const [h, p] of s)
    h === p ? d.push(h) : !p && h === c[0] ? d.push("*") : p ? h === c[0] ? d.push(`<=${p}`) : d.push(`${h} - ${p}`) : d.push(`>=${h}`);
  const l = d.join(" || "), u = typeof r.raw == "string" ? r.raw : String(r);
  return l.length < u.length ? l : r;
};
const Range$1 = requireRange(), Comparator$1 = requireComparator(), { ANY } = Comparator$1, satisfies$1 = satisfies_1, compare$1 = compare_1, subset$1 = (e, r, n = {}) => {
  if (e === r)
    return !0;
  e = new Range$1(e, n), r = new Range$1(r, n);
  let s = !1;
  e: for (const o of e.set) {
    for (const a of r.set) {
      const c = simpleSubset(o, a, n);
      if (s = s || c !== null, c)
        continue e;
    }
    if (s)
      return !1;
  }
  return !0;
}, minimumVersionWithPreRelease = [new Comparator$1(">=0.0.0-0")], minimumVersion = [new Comparator$1(">=0.0.0")], simpleSubset = (e, r, n) => {
  if (e === r)
    return !0;
  if (e.length === 1 && e[0].semver === ANY) {
    if (r.length === 1 && r[0].semver === ANY)
      return !0;
    n.includePrerelease ? e = minimumVersionWithPreRelease : e = minimumVersion;
  }
  if (r.length === 1 && r[0].semver === ANY) {
    if (n.includePrerelease)
      return !0;
    r = minimumVersion;
  }
  const s = /* @__PURE__ */ new Set();
  let o, a;
  for (const y of e)
    y.operator === ">" || y.operator === ">=" ? o = higherGT(o, y, n) : y.operator === "<" || y.operator === "<=" ? a = lowerLT(a, y, n) : s.add(y.semver);
  if (s.size > 1)
    return null;
  let c;
  if (o && a) {
    if (c = compare$1(o.semver, a.semver, n), c > 0)
      return null;
    if (c === 0 && (o.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const y of s) {
    if (o && !satisfies$1(y, String(o), n) || a && !satisfies$1(y, String(a), n))
      return null;
    for (const w of r)
      if (!satisfies$1(y, String(w), n))
        return !1;
    return !0;
  }
  let d, l, u, h, p = a && !n.includePrerelease && a.semver.prerelease.length ? a.semver : !1, g = o && !n.includePrerelease && o.semver.prerelease.length ? o.semver : !1;
  p && p.prerelease.length === 1 && a.operator === "<" && p.prerelease[0] === 0 && (p = !1);
  for (const y of r) {
    if (h = h || y.operator === ">" || y.operator === ">=", u = u || y.operator === "<" || y.operator === "<=", o) {
      if (g && y.semver.prerelease && y.semver.prerelease.length && y.semver.major === g.major && y.semver.minor === g.minor && y.semver.patch === g.patch && (g = !1), y.operator === ">" || y.operator === ">=") {
        if (d = higherGT(o, y, n), d === y && d !== o)
          return !1;
      } else if (o.operator === ">=" && !satisfies$1(o.semver, String(y), n))
        return !1;
    }
    if (a) {
      if (p && y.semver.prerelease && y.semver.prerelease.length && y.semver.major === p.major && y.semver.minor === p.minor && y.semver.patch === p.patch && (p = !1), y.operator === "<" || y.operator === "<=") {
        if (l = lowerLT(a, y, n), l === y && l !== a)
          return !1;
      } else if (a.operator === "<=" && !satisfies$1(a.semver, String(y), n))
        return !1;
    }
    if (!y.operator && (a || o) && c !== 0)
      return !1;
  }
  return !(o && u && !a && c !== 0 || a && h && !o && c !== 0 || g || p);
}, higherGT = (e, r, n) => {
  if (!e)
    return r;
  const s = compare$1(e.semver, r.semver, n);
  return s > 0 ? e : s < 0 || r.operator === ">" && e.operator === ">=" ? r : e;
}, lowerLT = (e, r, n) => {
  if (!e)
    return r;
  const s = compare$1(e.semver, r.semver, n);
  return s < 0 ? e : s > 0 || r.operator === "<" && e.operator === "<=" ? r : e;
};
var subset_1 = subset$1;
const internalRe = reExports, constants = constants$1, SemVer = semver$2, identifiers = identifiers$1, parse$1 = parse_1, valid = valid_1, clean = clean_1, inc = inc_1, diff = diff_1, major = major_1, minor = minor_1, patch = patch_1, prerelease = prerelease_1, compare = compare_1, rcompare = rcompare_1, compareLoose = compareLoose_1, compareBuild = compareBuild_1, sort = sort_1, rsort = rsort_1, gt = gt_1, lt = lt_1, eq = eq_1, neq = neq_1, gte = gte_1, lte = lte_1, cmp = cmp_1, coerce = coerce_1, Comparator = requireComparator(), Range = requireRange(), satisfies = satisfies_1, toComparators = toComparators_1, maxSatisfying = maxSatisfying_1, minSatisfying = minSatisfying_1, minVersion = minVersion_1, validRange = valid$1, outside = outside_1, gtr = gtr_1, ltr = ltr_1, intersects = intersects_1, simplifyRange = simplify, subset = subset_1;
var semver = {
  parse: parse$1,
  valid,
  clean,
  inc,
  diff,
  major,
  minor,
  patch,
  prerelease,
  compare,
  rcompare,
  compareLoose,
  compareBuild,
  sort,
  rsort,
  gt,
  lt,
  eq,
  neq,
  gte,
  lte,
  cmp,
  coerce,
  Comparator,
  Range,
  satisfies,
  toComparators,
  maxSatisfying,
  minSatisfying,
  minVersion,
  validRange,
  outside,
  gtr,
  ltr,
  intersects,
  simplifyRange,
  subset,
  SemVer,
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: constants.RELEASE_TYPES,
  compareIdentifiers: identifiers.compareIdentifiers,
  rcompareIdentifiers: identifiers.rcompareIdentifiers
};
const semver$1 = /* @__PURE__ */ getDefaultExportFromCjs(semver), objectToString = Object.prototype.toString, uint8ArrayStringified = "[object Uint8Array]", arrayBufferStringified = "[object ArrayBuffer]";
function isType(e, r, n) {
  return e ? e.constructor === r ? !0 : objectToString.call(e) === n : !1;
}
function isUint8Array(e) {
  return isType(e, Uint8Array, uint8ArrayStringified);
}
function isArrayBuffer$1(e) {
  return isType(e, ArrayBuffer, arrayBufferStringified);
}
function isUint8ArrayOrArrayBuffer(e) {
  return isUint8Array(e) || isArrayBuffer$1(e);
}
function assertUint8Array(e) {
  if (!isUint8Array(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function assertUint8ArrayOrArrayBuffer(e) {
  if (!isUint8ArrayOrArrayBuffer(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function concatUint8Arrays(e, r) {
  if (e.length === 0)
    return new Uint8Array(0);
  r ?? (r = e.reduce((o, a) => o + a.length, 0));
  const n = new Uint8Array(r);
  let s = 0;
  for (const o of e)
    assertUint8Array(o), n.set(o, s), s += o.length;
  return n;
}
const cachedDecoders = {
  utf8: new globalThis.TextDecoder("utf8")
};
function uint8ArrayToString(e, r = "utf8") {
  return assertUint8ArrayOrArrayBuffer(e), cachedDecoders[r] ?? (cachedDecoders[r] = new globalThis.TextDecoder(r)), cachedDecoders[r].decode(e);
}
function assertString(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const cachedEncoder = new globalThis.TextEncoder();
function stringToUint8Array(e) {
  return assertString(e), cachedEncoder.encode(e);
}
Array.from({ length: 256 }, (e, r) => r.toString(16).padStart(2, "0"));
const defaultEncryptionAlgorithm = "aes-256-cbc", supportedEncryptionAlgorithms = /* @__PURE__ */ new Set([
  "aes-256-cbc",
  "aes-256-gcm",
  "aes-256-ctr"
]), isSupportedEncryptionAlgorithm = (e) => typeof e == "string" && supportedEncryptionAlgorithms.has(e), createPlainObject = () => /* @__PURE__ */ Object.create(null), isExist = (e) => e !== void 0, checkValueType = (e, r) => {
  const n = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), s = typeof r;
  if (n.has(s))
    throw new TypeError(`Setting a value of type \`${s}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, INTERNAL_KEY = "__internal__", MIGRATION_KEY = `${INTERNAL_KEY}.migrations.version`;
var $e, ge, Re, se, ie, Pe, Te, Oe, pe, ee, De, Me, qe, Le, Fe, Ue, Ve, ze;
class Conf {
  constructor(r = {}) {
    le(this, ee);
    Ae(this, "path");
    Ae(this, "events");
    le(this, $e);
    le(this, ge);
    le(this, Re);
    le(this, se);
    le(this, ie, {});
    le(this, Pe, !1);
    le(this, Te);
    le(this, Oe);
    le(this, pe);
    Ae(this, "_deserialize", (r) => JSON.parse(r));
    Ae(this, "_serialize", (r) => JSON.stringify(r, void 0, "	"));
    const n = me(this, ee, De).call(this, r);
    ne(this, se, n), me(this, ee, Me).call(this, n), me(this, ee, Le).call(this, n), me(this, ee, Fe).call(this, n), this.events = new EventTarget(), ne(this, ge, n.encryptionKey), ne(this, Re, n.encryptionAlgorithm ?? defaultEncryptionAlgorithm), this.path = me(this, ee, Ue).call(this, n), me(this, ee, Ve).call(this, n), n.watch && this._watch();
  }
  get(r, n) {
    if (B(this, se).accessPropertiesByDotNotation)
      return this._get(r, n);
    const { store: s } = this;
    return r in s ? s[r] : n;
  }
  set(r, n) {
    if (typeof r != "string" && typeof r != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof r}`);
    if (typeof r != "object" && n === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(r))
      throw new TypeError(`Please don't use the ${INTERNAL_KEY} key, as it's used to manage this module internal operations.`);
    const { store: s } = this, o = (a, c) => {
      if (checkValueType(a, c), B(this, se).accessPropertiesByDotNotation)
        setProperty(s, a, c);
      else {
        if (a === "__proto__" || a === "constructor" || a === "prototype")
          return;
        s[a] = c;
      }
    };
    if (typeof r == "object") {
      const a = r;
      for (const [c, d] of Object.entries(a))
        o(c, d);
    } else
      o(r, n);
    this.store = s;
  }
  has(r) {
    return B(this, se).accessPropertiesByDotNotation ? hasProperty(this.store, r) : r in this.store;
  }
  appendToArray(r, n) {
    checkValueType(r, n);
    const s = B(this, se).accessPropertiesByDotNotation ? this._get(r, []) : r in this.store ? this.store[r] : [];
    if (!Array.isArray(s))
      throw new TypeError(`The key \`${r}\` is already set to a non-array value`);
    this.set(r, [...s, n]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...r) {
    for (const n of r)
      isExist(B(this, ie)[n]) && this.set(n, B(this, ie)[n]);
  }
  delete(r) {
    const { store: n } = this;
    B(this, se).accessPropertiesByDotNotation ? deleteProperty(n, r) : delete n[r], this.store = n;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const r = createPlainObject();
    for (const n of Object.keys(B(this, ie)))
      isExist(B(this, ie)[n]) && (checkValueType(n, B(this, ie)[n]), B(this, se).accessPropertiesByDotNotation ? setProperty(r, n, B(this, ie)[n]) : r[n] = B(this, ie)[n]);
    this.store = r;
  }
  onDidChange(r, n) {
    if (typeof r != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof r}`);
    if (typeof n != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof n}`);
    return this._handleValueChange(() => this.get(r), n);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(r) {
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleStoreChange(r);
  }
  get size() {
    return Object.keys(this.store).filter((n) => !this._isReservedKeyPath(n)).length;
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
    var r;
    try {
      const n = fs.readFileSync(this.path, B(this, ge) ? null : "utf8"), s = this._decryptData(n);
      return ((a) => {
        const c = this._deserialize(a);
        return B(this, Pe) || this._validate(c), Object.assign(createPlainObject(), c);
      })(s);
    } catch (n) {
      if ((n == null ? void 0 : n.code) === "ENOENT")
        return this._ensureDirectory(), createPlainObject();
      if (B(this, se).clearInvalidConfig) {
        const s = n;
        if (s.name === "SyntaxError" || (r = s.message) != null && r.startsWith("Config schema violation:") || s.message === "Failed to decrypt config data.")
          return createPlainObject();
      }
      throw n;
    }
  }
  set store(r) {
    if (this._ensureDirectory(), !hasProperty(r, INTERNAL_KEY))
      try {
        const n = fs.readFileSync(this.path, B(this, ge) ? null : "utf8"), s = this._decryptData(n), o = this._deserialize(s);
        hasProperty(o, INTERNAL_KEY) && setProperty(r, INTERNAL_KEY, getProperty(o, INTERNAL_KEY));
      } catch {
      }
    B(this, Pe) || this._validate(r), this._write(r), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [r, n] of Object.entries(this.store))
      this._isReservedKeyPath(r) || (yield [r, n]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    B(this, Te) && (B(this, Te).close(), ne(this, Te, void 0)), B(this, Oe) && (fs.unwatchFile(this.path), ne(this, Oe, !1)), ne(this, pe, void 0);
  }
  _decryptData(r) {
    const n = B(this, ge);
    if (!n)
      return typeof r == "string" ? r : uint8ArrayToString(r);
    const s = B(this, Re), o = s === "aes-256-gcm" ? 16 : 0, a = ":".codePointAt(0), c = typeof r == "string" ? r.codePointAt(16) : r[16];
    if (!(a !== void 0 && c === a)) {
      if (s === "aes-256-cbc")
        return typeof r == "string" ? r : uint8ArrayToString(r);
      throw new Error("Failed to decrypt config data.");
    }
    const l = (y) => {
      if (o === 0)
        return { ciphertext: y };
      const w = y.length - o;
      if (w < 0)
        throw new Error("Invalid authentication tag length.");
      return {
        ciphertext: y.slice(0, w),
        authenticationTag: y.slice(w)
      };
    }, u = r.slice(0, 16), h = r.slice(17), p = typeof h == "string" ? stringToUint8Array(h) : h, g = (y) => {
      const { ciphertext: w, authenticationTag: E } = l(p), m = crypto.pbkdf2Sync(n, y, 1e4, 32, "sha512"), _ = crypto.createDecipheriv(s, m, u);
      return E && _.setAuthTag(E), uint8ArrayToString(concatUint8Arrays([_.update(w), _.final()]));
    };
    try {
      return g(u);
    } catch {
      try {
        return g(u.toString());
      } catch {
      }
    }
    if (s === "aes-256-cbc")
      return typeof r == "string" ? r : uint8ArrayToString(r);
    throw new Error("Failed to decrypt config data.");
  }
  _handleStoreChange(r) {
    let n = this.store;
    const s = () => {
      const o = n, a = this.store;
      isDeepStrictEqual(a, o) || (n = a, r.call(this, a, o));
    };
    return this.events.addEventListener("change", s), () => {
      this.events.removeEventListener("change", s);
    };
  }
  _handleValueChange(r, n) {
    let s = r();
    const o = () => {
      const a = s, c = r();
      isDeepStrictEqual(c, a) || (s = c, n.call(this, c, a));
    };
    return this.events.addEventListener("change", o), () => {
      this.events.removeEventListener("change", o);
    };
  }
  _validate(r) {
    if (!B(this, $e) || B(this, $e).call(this, r) || !B(this, $e).errors)
      return;
    const s = B(this, $e).errors.map(({ instancePath: o, message: a = "" }) => `\`${o.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + s.join("; "));
  }
  _ensureDirectory() {
    fs.mkdirSync(path.dirname(this.path), { recursive: !0 });
  }
  _write(r) {
    let n = this._serialize(r);
    const s = B(this, ge);
    if (s) {
      const o = crypto.randomBytes(16), a = crypto.pbkdf2Sync(s, o, 1e4, 32, "sha512"), c = crypto.createCipheriv(B(this, Re), a, o), d = concatUint8Arrays([c.update(stringToUint8Array(n)), c.final()]), l = [o, stringToUint8Array(":"), d];
      B(this, Re) === "aes-256-gcm" && l.push(c.getAuthTag()), n = concatUint8Arrays(l);
    }
    if (process$1.env.SNAP)
      fs.writeFileSync(this.path, n, { mode: B(this, se).configFileMode });
    else
      try {
        writeFileSync(this.path, n, { mode: B(this, se).configFileMode });
      } catch (o) {
        if ((o == null ? void 0 : o.code) === "EXDEV") {
          fs.writeFileSync(this.path, n, { mode: B(this, se).configFileMode });
          return;
        }
        throw o;
      }
  }
  _watch() {
    if (this._ensureDirectory(), fs.existsSync(this.path) || this._write(createPlainObject()), process$1.platform === "win32" || process$1.platform === "darwin") {
      B(this, pe) ?? ne(this, pe, debounceFunction(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 }));
      const r = path.dirname(this.path), n = path.basename(this.path);
      ne(this, Te, fs.watch(r, { persistent: !1, encoding: "utf8" }, (s, o) => {
        o && o !== n || typeof B(this, pe) == "function" && B(this, pe).call(this);
      }));
    } else
      B(this, pe) ?? ne(this, pe, debounceFunction(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 })), fs.watchFile(this.path, { persistent: !1 }, (r, n) => {
        typeof B(this, pe) == "function" && B(this, pe).call(this);
      }), ne(this, Oe, !0);
  }
  _migrate(r, n, s) {
    let o = this._get(MIGRATION_KEY, "0.0.0");
    const a = Object.keys(r).filter((d) => this._shouldPerformMigration(d, o, n));
    let c = structuredClone(this.store);
    for (const d of a)
      try {
        s && s(this, {
          fromVersion: o,
          toVersion: d,
          finalVersion: n,
          versions: a
        });
        const l = r[d];
        l == null || l(this), this._set(MIGRATION_KEY, d), o = d, c = structuredClone(this.store);
      } catch (l) {
        this.store = c;
        const u = l instanceof Error ? l.message : String(l);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${u}`);
      }
    (this._isVersionInRangeFormat(o) || !semver$1.eq(o, n)) && this._set(MIGRATION_KEY, n);
  }
  _containsReservedKey(r) {
    return typeof r == "string" ? this._isReservedKeyPath(r) : !r || typeof r != "object" ? !1 : this._objectContainsReservedKey(r);
  }
  _objectContainsReservedKey(r) {
    if (!r || typeof r != "object")
      return !1;
    for (const [n, s] of Object.entries(r))
      if (this._isReservedKeyPath(n) || this._objectContainsReservedKey(s))
        return !0;
    return !1;
  }
  _isReservedKeyPath(r) {
    return r === INTERNAL_KEY || r.startsWith(`${INTERNAL_KEY}.`);
  }
  _isVersionInRangeFormat(r) {
    return semver$1.clean(r) === null;
  }
  _shouldPerformMigration(r, n, s) {
    return this._isVersionInRangeFormat(r) ? n !== "0.0.0" && semver$1.satisfies(n, r) ? !1 : semver$1.satisfies(s, r) : !(semver$1.lte(r, n) || semver$1.gt(r, s));
  }
  _get(r, n) {
    return getProperty(this.store, r, n);
  }
  _set(r, n) {
    const { store: s } = this;
    setProperty(s, r, n), this.store = s;
  }
}
$e = new WeakMap(), ge = new WeakMap(), Re = new WeakMap(), se = new WeakMap(), ie = new WeakMap(), Pe = new WeakMap(), Te = new WeakMap(), Oe = new WeakMap(), pe = new WeakMap(), ee = new WeakSet(), De = function(r) {
  const n = {
    configName: "config",
    fileExtension: "json",
    projectSuffix: "nodejs",
    clearInvalidConfig: !1,
    accessPropertiesByDotNotation: !0,
    configFileMode: 438,
    ...r
  };
  if (n.encryptionAlgorithm ?? (n.encryptionAlgorithm = defaultEncryptionAlgorithm), !isSupportedEncryptionAlgorithm(n.encryptionAlgorithm))
    throw new TypeError(`The \`encryptionAlgorithm\` option must be one of: ${[...supportedEncryptionAlgorithms].join(", ")}`);
  if (!n.cwd) {
    if (!n.projectName)
      throw new Error("Please specify the `projectName` option.");
    n.cwd = envPaths(n.projectName, { suffix: n.projectSuffix }).config;
  }
  return typeof n.fileExtension == "string" && (n.fileExtension = n.fileExtension.replace(/^\.+/, "")), n;
}, Me = function(r) {
  if (!(r.schema ?? r.ajvOptions ?? r.rootSchema))
    return;
  if (r.schema && typeof r.schema != "object")
    throw new TypeError("The `schema` option must be an object.");
  const n = ajvFormatsModule.default, s = new _2020Exports.Ajv2020({
    allErrors: !0,
    useDefaults: !0,
    ...r.ajvOptions
  });
  n(s);
  const o = {
    ...r.rootSchema,
    type: "object",
    properties: r.schema
  };
  ne(this, $e, s.compile(o)), me(this, ee, qe).call(this, r.schema);
}, qe = function(r) {
  const n = Object.entries(r ?? {});
  for (const [s, o] of n) {
    if (!o || typeof o != "object" || !Object.hasOwn(o, "default"))
      continue;
    const { default: a } = o;
    a !== void 0 && (B(this, ie)[s] = a);
  }
}, Le = function(r) {
  r.defaults && Object.assign(B(this, ie), r.defaults);
}, Fe = function(r) {
  r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize);
}, Ue = function(r) {
  const n = typeof r.fileExtension == "string" ? r.fileExtension : void 0, s = n ? `.${n}` : "";
  return path.resolve(r.cwd, `${r.configName ?? "config"}${s}`);
}, Ve = function(r) {
  if (r.migrations) {
    me(this, ee, ze).call(this, r), this._validate(this.store);
    return;
  }
  const n = this.store, s = Object.assign(createPlainObject(), r.defaults ?? {}, n);
  this._validate(s);
  try {
    assert.deepEqual(n, s);
  } catch {
    this.store = s;
  }
}, ze = function(r) {
  const { migrations: n, projectVersion: s } = r;
  if (n) {
    if (!s)
      throw new Error("Please specify the `projectVersion` option.");
    ne(this, Pe, !0);
    try {
      const o = this.store, a = Object.assign(createPlainObject(), r.defaults ?? {}, o);
      try {
        assert.deepEqual(o, a);
      } catch {
        this._write(a);
      }
      this._migrate(n, s, r.beforeEachMigration);
    } finally {
      ne(this, Pe, !1);
    }
  }
};
const { app, ipcMain, shell } = electron;
let isInitialized = !1;
const initDataListener = () => {
  if (!ipcMain || !app)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: app.getPath("userData"),
    appVersion: app.getVersion()
  };
  return isInitialized || (ipcMain.on("electron-store-get-data", (r) => {
    r.returnValue = e;
  }), isInitialized = !0), e;
};
class ElectronStore extends Conf {
  constructor(r) {
    let n, s;
    if (process$1.type === "renderer") {
      const o = electron.ipcRenderer.sendSync("electron-store-get-data");
      if (!o)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: n, appVersion: s } = o);
    } else ipcMain && app && ({ defaultCwd: n, appVersion: s } = initDataListener());
    r = {
      name: "config",
      ...r
    }, r.projectVersion || (r.projectVersion = s), r.cwd ? r.cwd = path.isAbsolute(r.cwd) ? r.cwd : path.join(n, r.cwd) : r.cwd = n, r.configName = r.name, delete r.name, super(r);
  }
  static initRenderer() {
    initDataListener();
  }
  async openInEditor() {
    const r = await shell.openPath(this.path);
    if (r)
      throw new Error(r);
  }
}
var dist = {}, getAudioUrl = {}, assertInputTypes$1 = {};
Object.defineProperty(assertInputTypes$1, "__esModule", { value: !0 });
var assertInputTypes = function(e, r, n, s) {
  if (typeof e != "string" || e.length === 0)
    throw new TypeError("text should be a string");
  if (typeof r != "string" || r.length === 0)
    throw new TypeError("lang should be a string");
  if (typeof n != "boolean")
    throw new TypeError("slow should be a boolean");
  if (typeof s != "string" || s.length === 0)
    throw new TypeError("host should be a string");
};
assertInputTypes$1.default = assertInputTypes;
var splitLongText$1 = {};
Object.defineProperty(splitLongText$1, "__esModule", { value: !0 });
var SPACE_REGEX = "\\s\\uFEFF\\xA0", DEFAULT_PUNCTUATION_REGEX = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~", splitLongText = function(e, r) {
  for (var n = r === void 0 ? {} : r, s = n.maxLength, o = s === void 0 ? 200 : s, a = n.splitPunct, c = a === void 0 ? "" : a, d = function(w, E) {
    var m = new RegExp("[" + SPACE_REGEX + DEFAULT_PUNCTUATION_REGEX + c + "]");
    return m.test(w.charAt(E));
  }, l = function(w, E, m) {
    for (var _ = m; _ >= E; _--)
      if (d(w, _))
        return _;
    return -1;
  }, u = [], h = function(w, E, m) {
    u.push(w.slice(E, m + 1));
  }, p = 0; ; ) {
    if (e.length - p <= o) {
      h(e, p, e.length - 1);
      break;
    }
    var g = p + o - 1;
    if (d(e, g) || d(e, g + 1)) {
      h(e, p, g), p = g + 1;
      continue;
    }
    if (g = l(e, p, g), g === -1) {
      var y = e.slice(p, p + o);
      throw new Error("The word is too long to split into a short text:" + (`
` + y + " ...") + `

Try the option "splitPunct" to split the text by punctuation.`);
    }
    h(e, p, g), p = g + 1;
  }
  return u;
};
splitLongText$1.default = splitLongText;
(function(e) {
  var r = commonjsGlobal && commonjsGlobal.__importDefault || function(d) {
    return d && d.__esModule ? d : { default: d };
  };
  Object.defineProperty(e, "__esModule", { value: !0 }), e.getAllAudioUrls = e.getAudioUrl = void 0;
  var n = r(assertInputTypes$1), s = r(splitLongText$1), o = r(require$$2$1), a = function(d, l) {
    var u = l === void 0 ? {} : l, h = u.lang, p = h === void 0 ? "en" : h, g = u.slow, y = g === void 0 ? !1 : g, w = u.host, E = w === void 0 ? "https://translate.google.com" : w;
    if (n.default(d, p, y, E), d.length > 200)
      throw new RangeError("text length (" + d.length + ') should be less than 200 characters. Try "getAllAudioUrls(text, [option])" for long text.');
    return E + "/translate_tts" + o.default.format({
      query: {
        ie: "UTF-8",
        q: d,
        tl: p,
        total: 1,
        idx: 0,
        textlen: d.length,
        client: "tw-ob",
        prev: "input",
        ttsspeed: y ? 0.24 : 1
      }
    });
  };
  e.getAudioUrl = a;
  var c = function(d, l) {
    var u = l === void 0 ? {} : l, h = u.lang, p = h === void 0 ? "en" : h, g = u.slow, y = g === void 0 ? !1 : g, w = u.host, E = w === void 0 ? "https://translate.google.com" : w, m = u.splitPunct, _ = m === void 0 ? "" : m;
    if (n.default(d, p, y, E), typeof _ != "string")
      throw new TypeError("splitPunct should be a string");
    return s.default(d, { splitPunct: _ }).map(function(S) {
      return {
        shortText: S,
        url: e.getAudioUrl(S, { lang: p, slow: y, host: E })
      };
    });
  };
  e.getAllAudioUrls = c;
})(getAudioUrl);
var getAudioBase64 = {}, axios$2 = { exports: {} }, bind$2 = function(r, n) {
  return function() {
    for (var o = new Array(arguments.length), a = 0; a < o.length; a++)
      o[a] = arguments[a];
    return r.apply(n, o);
  };
}, bind$1 = bind$2, toString = Object.prototype.toString;
function isArray(e) {
  return toString.call(e) === "[object Array]";
}
function isUndefined(e) {
  return typeof e > "u";
}
function isBuffer(e) {
  return e !== null && !isUndefined(e) && e.constructor !== null && !isUndefined(e.constructor) && typeof e.constructor.isBuffer == "function" && e.constructor.isBuffer(e);
}
function isArrayBuffer(e) {
  return toString.call(e) === "[object ArrayBuffer]";
}
function isFormData(e) {
  return typeof FormData < "u" && e instanceof FormData;
}
function isArrayBufferView(e) {
  var r;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? r = ArrayBuffer.isView(e) : r = e && e.buffer && e.buffer instanceof ArrayBuffer, r;
}
function isString(e) {
  return typeof e == "string";
}
function isNumber(e) {
  return typeof e == "number";
}
function isObject(e) {
  return e !== null && typeof e == "object";
}
function isPlainObject(e) {
  if (toString.call(e) !== "[object Object]")
    return !1;
  var r = Object.getPrototypeOf(e);
  return r === null || r === Object.prototype;
}
function isDate(e) {
  return toString.call(e) === "[object Date]";
}
function isFile(e) {
  return toString.call(e) === "[object File]";
}
function isBlob(e) {
  return toString.call(e) === "[object Blob]";
}
function isFunction(e) {
  return toString.call(e) === "[object Function]";
}
function isStream(e) {
  return isObject(e) && isFunction(e.pipe);
}
function isURLSearchParams(e) {
  return typeof URLSearchParams < "u" && e instanceof URLSearchParams;
}
function trim(e) {
  return e.trim ? e.trim() : e.replace(/^\s+|\s+$/g, "");
}
function isStandardBrowserEnv() {
  return typeof navigator < "u" && (navigator.product === "ReactNative" || navigator.product === "NativeScript" || navigator.product === "NS") ? !1 : typeof window < "u" && typeof document < "u";
}
function forEach(e, r) {
  if (!(e === null || typeof e > "u"))
    if (typeof e != "object" && (e = [e]), isArray(e))
      for (var n = 0, s = e.length; n < s; n++)
        r.call(null, e[n], n, e);
    else
      for (var o in e)
        Object.prototype.hasOwnProperty.call(e, o) && r.call(null, e[o], o, e);
}
function merge() {
  var e = {};
  function r(o, a) {
    isPlainObject(e[a]) && isPlainObject(o) ? e[a] = merge(e[a], o) : isPlainObject(o) ? e[a] = merge({}, o) : isArray(o) ? e[a] = o.slice() : e[a] = o;
  }
  for (var n = 0, s = arguments.length; n < s; n++)
    forEach(arguments[n], r);
  return e;
}
function extend(e, r, n) {
  return forEach(r, function(o, a) {
    n && typeof o == "function" ? e[a] = bind$1(o, n) : e[a] = o;
  }), e;
}
function stripBOM(e) {
  return e.charCodeAt(0) === 65279 && (e = e.slice(1)), e;
}
var utils$9 = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isObject,
  isPlainObject,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isFunction,
  isStream,
  isURLSearchParams,
  isStandardBrowserEnv,
  forEach,
  merge,
  extend,
  trim,
  stripBOM
}, utils$8 = utils$9;
function encode(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
var buildURL$1 = function(r, n, s) {
  if (!n)
    return r;
  var o;
  if (s)
    o = s(n);
  else if (utils$8.isURLSearchParams(n))
    o = n.toString();
  else {
    var a = [];
    utils$8.forEach(n, function(l, u) {
      l === null || typeof l > "u" || (utils$8.isArray(l) ? u = u + "[]" : l = [l], utils$8.forEach(l, function(p) {
        utils$8.isDate(p) ? p = p.toISOString() : utils$8.isObject(p) && (p = JSON.stringify(p)), a.push(encode(u) + "=" + encode(p));
      }));
    }), o = a.join("&");
  }
  if (o) {
    var c = r.indexOf("#");
    c !== -1 && (r = r.slice(0, c)), r += (r.indexOf("?") === -1 ? "?" : "&") + o;
  }
  return r;
}, utils$7 = utils$9;
function InterceptorManager$1() {
  this.handlers = [];
}
InterceptorManager$1.prototype.use = function(r, n, s) {
  return this.handlers.push({
    fulfilled: r,
    rejected: n,
    synchronous: s ? s.synchronous : !1,
    runWhen: s ? s.runWhen : null
  }), this.handlers.length - 1;
};
InterceptorManager$1.prototype.eject = function(r) {
  this.handlers[r] && (this.handlers[r] = null);
};
InterceptorManager$1.prototype.forEach = function(r) {
  utils$7.forEach(this.handlers, function(s) {
    s !== null && r(s);
  });
};
var InterceptorManager_1 = InterceptorManager$1, utils$6 = utils$9, normalizeHeaderName$1 = function(r, n) {
  utils$6.forEach(r, function(o, a) {
    a !== n && a.toUpperCase() === n.toUpperCase() && (r[n] = o, delete r[a]);
  });
}, enhanceError$1 = function(r, n, s, o, a) {
  return r.config = n, s && (r.code = s), r.request = o, r.response = a, r.isAxiosError = !0, r.toJSON = function() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  }, r;
}, createError, hasRequiredCreateError;
function requireCreateError() {
  if (hasRequiredCreateError) return createError;
  hasRequiredCreateError = 1;
  var e = enhanceError$1;
  return createError = function(n, s, o, a, c) {
    var d = new Error(n);
    return e(d, s, o, a, c);
  }, createError;
}
var settle, hasRequiredSettle;
function requireSettle() {
  if (hasRequiredSettle) return settle;
  hasRequiredSettle = 1;
  var e = requireCreateError();
  return settle = function(n, s, o) {
    var a = o.config.validateStatus;
    !o.status || !a || a(o.status) ? n(o) : s(e(
      "Request failed with status code " + o.status,
      o.config,
      null,
      o.request,
      o
    ));
  }, settle;
}
var cookies, hasRequiredCookies;
function requireCookies() {
  if (hasRequiredCookies) return cookies;
  hasRequiredCookies = 1;
  var e = utils$9;
  return cookies = e.isStandardBrowserEnv() ? (
    // Standard browser envs support document.cookie
    /* @__PURE__ */ function() {
      return {
        write: function(s, o, a, c, d, l) {
          var u = [];
          u.push(s + "=" + encodeURIComponent(o)), e.isNumber(a) && u.push("expires=" + new Date(a).toGMTString()), e.isString(c) && u.push("path=" + c), e.isString(d) && u.push("domain=" + d), l === !0 && u.push("secure"), document.cookie = u.join("; ");
        },
        read: function(s) {
          var o = document.cookie.match(new RegExp("(^|;\\s*)(" + s + ")=([^;]*)"));
          return o ? decodeURIComponent(o[3]) : null;
        },
        remove: function(s) {
          this.write(s, "", Date.now() - 864e5);
        }
      };
    }()
  ) : (
    // Non standard browser env (web workers, react-native) lack needed support.
    /* @__PURE__ */ function() {
      return {
        write: function() {
        },
        read: function() {
          return null;
        },
        remove: function() {
        }
      };
    }()
  ), cookies;
}
var isAbsoluteURL, hasRequiredIsAbsoluteURL;
function requireIsAbsoluteURL() {
  return hasRequiredIsAbsoluteURL || (hasRequiredIsAbsoluteURL = 1, isAbsoluteURL = function(r) {
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(r);
  }), isAbsoluteURL;
}
var combineURLs, hasRequiredCombineURLs;
function requireCombineURLs() {
  return hasRequiredCombineURLs || (hasRequiredCombineURLs = 1, combineURLs = function(r, n) {
    return n ? r.replace(/\/+$/, "") + "/" + n.replace(/^\/+/, "") : r;
  }), combineURLs;
}
var buildFullPath, hasRequiredBuildFullPath;
function requireBuildFullPath() {
  if (hasRequiredBuildFullPath) return buildFullPath;
  hasRequiredBuildFullPath = 1;
  var e = requireIsAbsoluteURL(), r = requireCombineURLs();
  return buildFullPath = function(s, o) {
    return s && !e(o) ? r(s, o) : o;
  }, buildFullPath;
}
var parseHeaders, hasRequiredParseHeaders;
function requireParseHeaders() {
  if (hasRequiredParseHeaders) return parseHeaders;
  hasRequiredParseHeaders = 1;
  var e = utils$9, r = [
    "age",
    "authorization",
    "content-length",
    "content-type",
    "etag",
    "expires",
    "from",
    "host",
    "if-modified-since",
    "if-unmodified-since",
    "last-modified",
    "location",
    "max-forwards",
    "proxy-authorization",
    "referer",
    "retry-after",
    "user-agent"
  ];
  return parseHeaders = function(s) {
    var o = {}, a, c, d;
    return s && e.forEach(s.split(`
`), function(u) {
      if (d = u.indexOf(":"), a = e.trim(u.substr(0, d)).toLowerCase(), c = e.trim(u.substr(d + 1)), a) {
        if (o[a] && r.indexOf(a) >= 0)
          return;
        a === "set-cookie" ? o[a] = (o[a] ? o[a] : []).concat([c]) : o[a] = o[a] ? o[a] + ", " + c : c;
      }
    }), o;
  }, parseHeaders;
}
var isURLSameOrigin, hasRequiredIsURLSameOrigin;
function requireIsURLSameOrigin() {
  if (hasRequiredIsURLSameOrigin) return isURLSameOrigin;
  hasRequiredIsURLSameOrigin = 1;
  var e = utils$9;
  return isURLSameOrigin = e.isStandardBrowserEnv() ? (
    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
    function() {
      var n = /(msie|trident)/i.test(navigator.userAgent), s = document.createElement("a"), o;
      function a(c) {
        var d = c;
        return n && (s.setAttribute("href", d), d = s.href), s.setAttribute("href", d), {
          href: s.href,
          protocol: s.protocol ? s.protocol.replace(/:$/, "") : "",
          host: s.host,
          search: s.search ? s.search.replace(/^\?/, "") : "",
          hash: s.hash ? s.hash.replace(/^#/, "") : "",
          hostname: s.hostname,
          port: s.port,
          pathname: s.pathname.charAt(0) === "/" ? s.pathname : "/" + s.pathname
        };
      }
      return o = a(window.location.href), function(d) {
        var l = e.isString(d) ? a(d) : d;
        return l.protocol === o.protocol && l.host === o.host;
      };
    }()
  ) : (
    // Non standard browser envs (web workers, react-native) lack needed support.
    /* @__PURE__ */ function() {
      return function() {
        return !0;
      };
    }()
  ), isURLSameOrigin;
}
var xhr, hasRequiredXhr;
function requireXhr() {
  if (hasRequiredXhr) return xhr;
  hasRequiredXhr = 1;
  var e = utils$9, r = requireSettle(), n = requireCookies(), s = buildURL$1, o = requireBuildFullPath(), a = requireParseHeaders(), c = requireIsURLSameOrigin(), d = requireCreateError();
  return xhr = function(u) {
    return new Promise(function(p, g) {
      var y = u.data, w = u.headers, E = u.responseType;
      e.isFormData(y) && delete w["Content-Type"];
      var m = new XMLHttpRequest();
      if (u.auth) {
        var _ = u.auth.username || "", S = u.auth.password ? unescape(encodeURIComponent(u.auth.password)) : "";
        w.Authorization = "Basic " + btoa(_ + ":" + S);
      }
      var O = o(u.baseURL, u.url);
      m.open(u.method.toUpperCase(), s(O, u.params, u.paramsSerializer), !0), m.timeout = u.timeout;
      function I() {
        if (m) {
          var F = "getAllResponseHeaders" in m ? a(m.getAllResponseHeaders()) : null, z = !E || E === "text" || E === "json" ? m.responseText : m.response, x = {
            data: z,
            status: m.status,
            statusText: m.statusText,
            headers: F,
            config: u,
            request: m
          };
          r(p, g, x), m = null;
        }
      }
      if ("onloadend" in m ? m.onloadend = I : m.onreadystatechange = function() {
        !m || m.readyState !== 4 || m.status === 0 && !(m.responseURL && m.responseURL.indexOf("file:") === 0) || setTimeout(I);
      }, m.onabort = function() {
        m && (g(d("Request aborted", u, "ECONNABORTED", m)), m = null);
      }, m.onerror = function() {
        g(d("Network Error", u, null, m)), m = null;
      }, m.ontimeout = function() {
        var z = "timeout of " + u.timeout + "ms exceeded";
        u.timeoutErrorMessage && (z = u.timeoutErrorMessage), g(d(
          z,
          u,
          u.transitional && u.transitional.clarifyTimeoutError ? "ETIMEDOUT" : "ECONNABORTED",
          m
        )), m = null;
      }, e.isStandardBrowserEnv()) {
        var A = (u.withCredentials || c(O)) && u.xsrfCookieName ? n.read(u.xsrfCookieName) : void 0;
        A && (w[u.xsrfHeaderName] = A);
      }
      "setRequestHeader" in m && e.forEach(w, function(z, x) {
        typeof y > "u" && x.toLowerCase() === "content-type" ? delete w[x] : m.setRequestHeader(x, z);
      }), e.isUndefined(u.withCredentials) || (m.withCredentials = !!u.withCredentials), E && E !== "json" && (m.responseType = u.responseType), typeof u.onDownloadProgress == "function" && m.addEventListener("progress", u.onDownloadProgress), typeof u.onUploadProgress == "function" && m.upload && m.upload.addEventListener("progress", u.onUploadProgress), u.cancelToken && u.cancelToken.promise.then(function(z) {
        m && (m.abort(), g(z), m = null);
      }), y || (y = null), m.send(y);
    });
  }, xhr;
}
var followRedirects = { exports: {} }, src = { exports: {} }, browser = { exports: {} }, ms, hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var e = 1e3, r = e * 60, n = r * 60, s = n * 24, o = s * 7, a = s * 365.25;
  ms = function(h, p) {
    p = p || {};
    var g = typeof h;
    if (g === "string" && h.length > 0)
      return c(h);
    if (g === "number" && isFinite(h))
      return p.long ? l(h) : d(h);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(h)
    );
  };
  function c(h) {
    if (h = String(h), !(h.length > 100)) {
      var p = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        h
      );
      if (p) {
        var g = parseFloat(p[1]), y = (p[2] || "ms").toLowerCase();
        switch (y) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return g * a;
          case "weeks":
          case "week":
          case "w":
            return g * o;
          case "days":
          case "day":
          case "d":
            return g * s;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return g * n;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return g * r;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return g * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return g;
          default:
            return;
        }
      }
    }
  }
  function d(h) {
    var p = Math.abs(h);
    return p >= s ? Math.round(h / s) + "d" : p >= n ? Math.round(h / n) + "h" : p >= r ? Math.round(h / r) + "m" : p >= e ? Math.round(h / e) + "s" : h + "ms";
  }
  function l(h) {
    var p = Math.abs(h);
    return p >= s ? u(h, p, s, "day") : p >= n ? u(h, p, n, "hour") : p >= r ? u(h, p, r, "minute") : p >= e ? u(h, p, e, "second") : h + " ms";
  }
  function u(h, p, g, y) {
    var w = p >= g * 1.5;
    return Math.round(h / g) + " " + y + (w ? "s" : "");
  }
  return ms;
}
var common, hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  function e(r) {
    s.debug = s, s.default = s, s.coerce = u, s.disable = d, s.enable = a, s.enabled = l, s.humanize = requireMs(), s.destroy = h, Object.keys(r).forEach((p) => {
      s[p] = r[p];
    }), s.names = [], s.skips = [], s.formatters = {};
    function n(p) {
      let g = 0;
      for (let y = 0; y < p.length; y++)
        g = (g << 5) - g + p.charCodeAt(y), g |= 0;
      return s.colors[Math.abs(g) % s.colors.length];
    }
    s.selectColor = n;
    function s(p) {
      let g, y = null, w, E;
      function m(..._) {
        if (!m.enabled)
          return;
        const S = m, O = Number(/* @__PURE__ */ new Date()), I = O - (g || O);
        S.diff = I, S.prev = g, S.curr = O, g = O, _[0] = s.coerce(_[0]), typeof _[0] != "string" && _.unshift("%O");
        let A = 0;
        _[0] = _[0].replace(/%([a-zA-Z%])/g, (z, x) => {
          if (z === "%%")
            return "%";
          A++;
          const Y = s.formatters[x];
          if (typeof Y == "function") {
            const J = _[A];
            z = Y.call(S, J), _.splice(A, 1), A--;
          }
          return z;
        }), s.formatArgs.call(S, _), (S.log || s.log).apply(S, _);
      }
      return m.namespace = p, m.useColors = s.useColors(), m.color = s.selectColor(p), m.extend = o, m.destroy = s.destroy, Object.defineProperty(m, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => y !== null ? y : (w !== s.namespaces && (w = s.namespaces, E = s.enabled(p)), E),
        set: (_) => {
          y = _;
        }
      }), typeof s.init == "function" && s.init(m), m;
    }
    function o(p, g) {
      const y = s(this.namespace + (typeof g > "u" ? ":" : g) + p);
      return y.log = this.log, y;
    }
    function a(p) {
      s.save(p), s.namespaces = p, s.names = [], s.skips = [];
      const g = (typeof p == "string" ? p : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const y of g)
        y[0] === "-" ? s.skips.push(y.slice(1)) : s.names.push(y);
    }
    function c(p, g) {
      let y = 0, w = 0, E = -1, m = 0;
      for (; y < p.length; )
        if (w < g.length && (g[w] === p[y] || g[w] === "*"))
          g[w] === "*" ? (E = w, m = y, w++) : (y++, w++);
        else if (E !== -1)
          w = E + 1, m++, y = m;
        else
          return !1;
      for (; w < g.length && g[w] === "*"; )
        w++;
      return w === g.length;
    }
    function d() {
      const p = [
        ...s.names,
        ...s.skips.map((g) => "-" + g)
      ].join(",");
      return s.enable(""), p;
    }
    function l(p) {
      for (const g of s.skips)
        if (c(p, g))
          return !1;
      for (const g of s.names)
        if (c(p, g))
          return !0;
      return !1;
    }
    function u(p) {
      return p instanceof Error ? p.stack || p.message : p;
    }
    function h() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return s.enable(s.load()), s;
  }
  return common = e, common;
}
var hasRequiredBrowser;
function requireBrowser() {
  return hasRequiredBrowser || (hasRequiredBrowser = 1, function(e, r) {
    r.formatArgs = s, r.save = o, r.load = a, r.useColors = n, r.storage = c(), r.destroy = /* @__PURE__ */ (() => {
      let l = !1;
      return () => {
        l || (l = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), r.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function n() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let l;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (l = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(l[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function s(l) {
      if (l[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + l[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const u = "color: " + this.color;
      l.splice(1, 0, u, "color: inherit");
      let h = 0, p = 0;
      l[0].replace(/%[a-zA-Z%]/g, (g) => {
        g !== "%%" && (h++, g === "%c" && (p = h));
      }), l.splice(p, 0, u);
    }
    r.log = console.debug || console.log || (() => {
    });
    function o(l) {
      try {
        l ? r.storage.setItem("debug", l) : r.storage.removeItem("debug");
      } catch {
      }
    }
    function a() {
      let l;
      try {
        l = r.storage.getItem("debug") || r.storage.getItem("DEBUG");
      } catch {
      }
      return !l && typeof process < "u" && "env" in process && (l = process.env.DEBUG), l;
    }
    function c() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = requireCommon()(r);
    const { formatters: d } = e.exports;
    d.j = function(l) {
      try {
        return JSON.stringify(l);
      } catch (u) {
        return "[UnexpectedJSONParseError]: " + u.message;
      }
    };
  }(browser, browser.exports)), browser.exports;
}
var node = { exports: {} }, hasFlag, hasRequiredHasFlag;
function requireHasFlag() {
  return hasRequiredHasFlag || (hasRequiredHasFlag = 1, hasFlag = (e, r = process.argv) => {
    const n = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", s = r.indexOf(n + e), o = r.indexOf("--");
    return s !== -1 && (o === -1 || s < o);
  }), hasFlag;
}
var supportsColor_1, hasRequiredSupportsColor;
function requireSupportsColor() {
  if (hasRequiredSupportsColor) return supportsColor_1;
  hasRequiredSupportsColor = 1;
  const e = require$$0$2, r = require$$1$1, n = requireHasFlag(), { env: s } = process;
  let o;
  n("no-color") || n("no-colors") || n("color=false") || n("color=never") ? o = 0 : (n("color") || n("colors") || n("color=true") || n("color=always")) && (o = 1), "FORCE_COLOR" in s && (s.FORCE_COLOR === "true" ? o = 1 : s.FORCE_COLOR === "false" ? o = 0 : o = s.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(s.FORCE_COLOR, 10), 3));
  function a(l) {
    return l === 0 ? !1 : {
      level: l,
      hasBasic: !0,
      has256: l >= 2,
      has16m: l >= 3
    };
  }
  function c(l, u) {
    if (o === 0)
      return 0;
    if (n("color=16m") || n("color=full") || n("color=truecolor"))
      return 3;
    if (n("color=256"))
      return 2;
    if (l && !u && o === void 0)
      return 0;
    const h = o || 0;
    if (s.TERM === "dumb")
      return h;
    if (process.platform === "win32") {
      const p = e.release().split(".");
      return Number(p[0]) >= 10 && Number(p[2]) >= 10586 ? Number(p[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in s)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((p) => p in s) || s.CI_NAME === "codeship" ? 1 : h;
    if ("TEAMCITY_VERSION" in s)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(s.TEAMCITY_VERSION) ? 1 : 0;
    if (s.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in s) {
      const p = parseInt((s.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (s.TERM_PROGRAM) {
        case "iTerm.app":
          return p >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(s.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(s.TERM) || "COLORTERM" in s ? 1 : h;
  }
  function d(l) {
    const u = c(l, l && l.isTTY);
    return a(u);
  }
  return supportsColor_1 = {
    supportsColor: d,
    stdout: a(c(!0, r.isatty(1))),
    stderr: a(c(!0, r.isatty(2)))
  }, supportsColor_1;
}
var hasRequiredNode;
function requireNode() {
  return hasRequiredNode || (hasRequiredNode = 1, function(e, r) {
    const n = require$$1$1, s = require$$1$2;
    r.init = h, r.log = d, r.formatArgs = a, r.save = l, r.load = u, r.useColors = o, r.destroy = s.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), r.colors = [6, 2, 3, 4, 5, 1];
    try {
      const g = requireSupportsColor();
      g && (g.stderr || g).level >= 2 && (r.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    r.inspectOpts = Object.keys(process.env).filter((g) => /^debug_/i.test(g)).reduce((g, y) => {
      const w = y.substring(6).toLowerCase().replace(/_([a-z])/g, (m, _) => _.toUpperCase());
      let E = process.env[y];
      return /^(yes|on|true|enabled)$/i.test(E) ? E = !0 : /^(no|off|false|disabled)$/i.test(E) ? E = !1 : E === "null" ? E = null : E = Number(E), g[w] = E, g;
    }, {});
    function o() {
      return "colors" in r.inspectOpts ? !!r.inspectOpts.colors : n.isatty(process.stderr.fd);
    }
    function a(g) {
      const { namespace: y, useColors: w } = this;
      if (w) {
        const E = this.color, m = "\x1B[3" + (E < 8 ? E : "8;5;" + E), _ = `  ${m};1m${y} \x1B[0m`;
        g[0] = _ + g[0].split(`
`).join(`
` + _), g.push(m + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        g[0] = c() + y + " " + g[0];
    }
    function c() {
      return r.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function d(...g) {
      return process.stderr.write(s.formatWithOptions(r.inspectOpts, ...g) + `
`);
    }
    function l(g) {
      g ? process.env.DEBUG = g : delete process.env.DEBUG;
    }
    function u() {
      return process.env.DEBUG;
    }
    function h(g) {
      g.inspectOpts = {};
      const y = Object.keys(r.inspectOpts);
      for (let w = 0; w < y.length; w++)
        g.inspectOpts[y[w]] = r.inspectOpts[y[w]];
    }
    e.exports = requireCommon()(r);
    const { formatters: p } = e.exports;
    p.o = function(g) {
      return this.inspectOpts.colors = this.useColors, s.inspect(g, this.inspectOpts).split(`
`).map((y) => y.trim()).join(" ");
    }, p.O = function(g) {
      return this.inspectOpts.colors = this.useColors, s.inspect(g, this.inspectOpts);
    };
  }(node, node.exports)), node.exports;
}
var hasRequiredSrc;
function requireSrc() {
  return hasRequiredSrc || (hasRequiredSrc = 1, typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? src.exports = requireBrowser() : src.exports = requireNode()), src.exports;
}
var debug_1, hasRequiredDebug;
function requireDebug() {
  if (hasRequiredDebug) return debug_1;
  hasRequiredDebug = 1;
  var e;
  return debug_1 = function() {
    if (!e) {
      try {
        e = requireSrc()("follow-redirects");
      } catch {
      }
      typeof e != "function" && (e = function() {
      });
    }
    e.apply(null, arguments);
  }, debug_1;
}
var hasRequiredFollowRedirects;
function requireFollowRedirects() {
  if (hasRequiredFollowRedirects) return followRedirects.exports;
  hasRequiredFollowRedirects = 1;
  var e = require$$2$1, r = e.URL, n = require$$1$3, s = require$$2$2, o = require$$3$2.Writable, a = require$$4$1, c = requireDebug();
  (function() {
    var C = typeof process < "u", j = typeof window < "u" && typeof document < "u", q = G(Error.captureStackTrace);
    !C && (j || !q) && console.warn("The follow-redirects package should be excluded from browser builds.");
  })();
  var d = !1;
  try {
    a(new r(""));
  } catch (N) {
    d = N.code === "ERR_INVALID_URL";
  }
  var l = [
    "auth",
    "host",
    "hostname",
    "href",
    "path",
    "pathname",
    "port",
    "protocol",
    "query",
    "search",
    "hash"
  ], u = ["abort", "aborted", "connect", "error", "socket", "timeout"], h = /* @__PURE__ */ Object.create(null);
  u.forEach(function(N) {
    h[N] = function(C, j, q) {
      this._redirectable.emit(N, C, j, q);
    };
  });
  var p = Y(
    "ERR_INVALID_URL",
    "Invalid URL",
    TypeError
  ), g = Y(
    "ERR_FR_REDIRECTION_FAILURE",
    "Redirected request failed"
  ), y = Y(
    "ERR_FR_TOO_MANY_REDIRECTS",
    "Maximum number of redirects exceeded",
    g
  ), w = Y(
    "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
    "Request body larger than maxBodyLength limit"
  ), E = Y(
    "ERR_STREAM_WRITE_AFTER_END",
    "write after end"
  ), m = o.prototype.destroy || O;
  function _(N, C) {
    o.call(this), this._sanitizeOptions(N), this._options = N, this._ended = !1, this._ending = !1, this._redirectCount = 0, this._redirects = [], this._requestBodyLength = 0, this._requestBodyBuffers = [], C && this.on("response", C);
    var j = this;
    this._onNativeResponse = function(q) {
      try {
        j._processResponse(q);
      } catch (T) {
        j.emit("error", T instanceof g ? T : new g({ cause: T }));
      }
    }, this._performRequest();
  }
  _.prototype = Object.create(o.prototype), _.prototype.abort = function() {
    J(this._currentRequest), this._currentRequest.abort(), this.emit("abort");
  }, _.prototype.destroy = function(N) {
    return J(this._currentRequest, N), m.call(this, N), this;
  }, _.prototype.write = function(N, C, j) {
    if (this._ending)
      throw new E();
    if (!V(N) && !M(N))
      throw new TypeError("data should be a string, Buffer or Uint8Array");
    if (G(C) && (j = C, C = null), N.length === 0) {
      j && j();
      return;
    }
    this._requestBodyLength + N.length <= this._options.maxBodyLength ? (this._requestBodyLength += N.length, this._requestBodyBuffers.push({ data: N, encoding: C }), this._currentRequest.write(N, C, j)) : (this.emit("error", new w()), this.abort());
  }, _.prototype.end = function(N, C, j) {
    if (G(N) ? (j = N, N = C = null) : G(C) && (j = C, C = null), !N)
      this._ended = this._ending = !0, this._currentRequest.end(null, null, j);
    else {
      var q = this, T = this._currentRequest;
      this.write(N, C, function() {
        q._ended = !0, T.end(null, null, j);
      }), this._ending = !0;
    }
  }, _.prototype.setHeader = function(N, C) {
    this._options.headers[N] = C, this._currentRequest.setHeader(N, C);
  }, _.prototype.removeHeader = function(N) {
    delete this._options.headers[N], this._currentRequest.removeHeader(N);
  }, _.prototype.setTimeout = function(N, C) {
    var j = this;
    function q(P) {
      P.setTimeout(N), P.removeListener("timeout", P.destroy), P.addListener("timeout", P.destroy);
    }
    function T(P) {
      j._timeout && clearTimeout(j._timeout), j._timeout = setTimeout(function() {
        j.emit("timeout"), v();
      }, N), q(P);
    }
    function v() {
      j._timeout && (clearTimeout(j._timeout), j._timeout = null), j.removeListener("abort", v), j.removeListener("error", v), j.removeListener("response", v), j.removeListener("close", v), C && j.removeListener("timeout", C), j.socket || j._currentRequest.removeListener("socket", T);
    }
    return C && this.on("timeout", C), this.socket ? T(this.socket) : this._currentRequest.once("socket", T), this.on("socket", q), this.on("abort", v), this.on("error", v), this.on("response", v), this.on("close", v), this;
  }, [
    "flushHeaders",
    "getHeader",
    "setNoDelay",
    "setSocketKeepAlive"
  ].forEach(function(N) {
    _.prototype[N] = function(C, j) {
      return this._currentRequest[N](C, j);
    };
  }), ["aborted", "connection", "socket"].forEach(function(N) {
    Object.defineProperty(_.prototype, N, {
      get: function() {
        return this._currentRequest[N];
      }
    });
  }), _.prototype._sanitizeOptions = function(N) {
    if (N.headers || (N.headers = {}), N.host && (N.hostname || (N.hostname = N.host), delete N.host), !N.pathname && N.path) {
      var C = N.path.indexOf("?");
      C < 0 ? N.pathname = N.path : (N.pathname = N.path.substring(0, C), N.search = N.path.substring(C));
    }
  }, _.prototype._performRequest = function() {
    var N = this._options.protocol, C = this._options.nativeProtocols[N];
    if (!C)
      throw new TypeError("Unsupported protocol " + N);
    if (this._options.agents) {
      var j = N.slice(0, -1);
      this._options.agent = this._options.agents[j];
    }
    var q = this._currentRequest = C.request(this._options, this._onNativeResponse);
    q._redirectable = this;
    for (var T of u)
      q.on(T, h[T]);
    if (this._currentUrl = /^\//.test(this._options.path) ? e.format(this._options) : (
      // When making a request to a proxy, […]
      // a client MUST send the target URI in absolute-form […].
      this._options.path
    ), this._isRedirect) {
      var v = 0, P = this, b = this._requestBodyBuffers;
      (function f($) {
        if (q === P._currentRequest)
          if ($)
            P.emit("error", $);
          else if (v < b.length) {
            var R = b[v++];
            q.finished || q.write(R.data, R.encoding, f);
          } else P._ended && q.end();
      })();
    }
  }, _.prototype._processResponse = function(N) {
    var C = N.statusCode;
    this._options.trackRedirects && this._redirects.push({
      url: this._currentUrl,
      headers: N.headers,
      statusCode: C
    });
    var j = N.headers.location;
    if (!j || this._options.followRedirects === !1 || C < 300 || C >= 400) {
      N.responseUrl = this._currentUrl, N.redirects = this._redirects, this.emit("response", N), this._requestBodyBuffers = [];
      return;
    }
    if (J(this._currentRequest), N.destroy(), ++this._redirectCount > this._options.maxRedirects)
      throw new y();
    var q, T = this._options.beforeRedirect;
    T && (q = Object.assign({
      // The Host header was set by nativeProtocol.request
      Host: N.req.getHeader("host")
    }, this._options.headers));
    var v = this._options.method;
    ((C === 301 || C === 302) && this._options.method === "POST" || // RFC7231§6.4.4: The 303 (See Other) status code indicates that
    // the server is redirecting the user agent to a different resource […]
    // A user agent can perform a retrieval request targeting that URI
    // (a GET or HEAD request if using HTTP) […]
    C === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) && (this._options.method = "GET", this._requestBodyBuffers = [], x(/^content-/i, this._options.headers));
    var P = x(/^host$/i, this._options.headers), b = I(this._currentUrl), f = P || b.host, $ = /^\w+:/.test(j) ? this._currentUrl : e.format(Object.assign(b, { host: f })), R = A(j, $);
    if (c("redirecting to", R.href), this._isRedirect = !0, z(R, this._options), (R.protocol !== b.protocol && R.protocol !== "https:" || R.host !== f && !K(R.host, f)) && x(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers), G(T)) {
      var k = {
        headers: N.headers,
        statusCode: C
      }, D = {
        url: $,
        method: v,
        headers: q
      };
      T(this._options, k, D), this._sanitizeOptions(this._options);
    }
    this._performRequest();
  };
  function S(N) {
    var C = {
      maxRedirects: 21,
      maxBodyLength: 10485760
    }, j = {};
    return Object.keys(N).forEach(function(q) {
      var T = q + ":", v = j[T] = N[q], P = C[q] = Object.create(v);
      function b($, R, k) {
        return L($) ? $ = z($) : V($) ? $ = z(I($)) : (k = R, R = F($), $ = { protocol: T }), G(R) && (k = R, R = null), R = Object.assign({
          maxRedirects: C.maxRedirects,
          maxBodyLength: C.maxBodyLength
        }, $, R), R.nativeProtocols = j, !V(R.host) && !V(R.hostname) && (R.hostname = "::1"), a.equal(R.protocol, T, "protocol mismatch"), c("options", R), new _(R, k);
      }
      function f($, R, k) {
        var D = P.request($, R, k);
        return D.end(), D;
      }
      Object.defineProperties(P, {
        request: { value: b, configurable: !0, enumerable: !0, writable: !0 },
        get: { value: f, configurable: !0, enumerable: !0, writable: !0 }
      });
    }), C;
  }
  function O() {
  }
  function I(N) {
    var C;
    if (d)
      C = new r(N);
    else if (C = F(e.parse(N)), !V(C.protocol))
      throw new p({ input: N });
    return C;
  }
  function A(N, C) {
    return d ? new r(N, C) : I(e.resolve(C, N));
  }
  function F(N) {
    if (/^\[/.test(N.hostname) && !/^\[[:0-9a-f]+\]$/i.test(N.hostname))
      throw new p({ input: N.href || N });
    if (/^\[/.test(N.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(N.host))
      throw new p({ input: N.href || N });
    return N;
  }
  function z(N, C) {
    var j = C || {};
    for (var q of l)
      j[q] = N[q];
    return j.hostname.startsWith("[") && (j.hostname = j.hostname.slice(1, -1)), j.port !== "" && (j.port = Number(j.port)), j.path = j.search ? j.pathname + j.search : j.pathname, j;
  }
  function x(N, C) {
    var j;
    for (var q in C)
      N.test(q) && (j = C[q], delete C[q]);
    return j === null || typeof j > "u" ? void 0 : String(j).trim();
  }
  function Y(N, C, j) {
    function q(T) {
      G(Error.captureStackTrace) && Error.captureStackTrace(this, this.constructor), Object.assign(this, T || {}), this.code = N, this.message = this.cause ? C + ": " + this.cause.message : C;
    }
    return q.prototype = new (j || Error)(), Object.defineProperties(q.prototype, {
      constructor: {
        value: q,
        enumerable: !1
      },
      name: {
        value: "Error [" + N + "]",
        enumerable: !1
      }
    }), q;
  }
  function J(N, C) {
    for (var j of u)
      N.removeListener(j, h[j]);
    N.on("error", O), N.destroy(C);
  }
  function K(N, C) {
    a(V(N) && V(C));
    var j = N.length - C.length - 1;
    return j > 0 && N[j] === "." && N.endsWith(C);
  }
  function V(N) {
    return typeof N == "string" || N instanceof String;
  }
  function G(N) {
    return typeof N == "function";
  }
  function M(N) {
    return typeof N == "object" && "length" in N;
  }
  function L(N) {
    return r && N instanceof r;
  }
  return followRedirects.exports = S({ http: n, https: s }), followRedirects.exports.wrap = S, followRedirects.exports;
}
const version = "0.21.4", require$$0 = {
  version
};
var http_1, hasRequiredHttp;
function requireHttp() {
  if (hasRequiredHttp) return http_1;
  hasRequiredHttp = 1;
  var e = utils$9, r = requireSettle(), n = requireBuildFullPath(), s = buildURL$1, o = require$$1$3, a = require$$2$2, c = requireFollowRedirects().http, d = requireFollowRedirects().https, l = require$$2$1, u = require$$8, h = require$$0, p = requireCreateError(), g = enhanceError$1, y = /https:?/;
  function w(E, m, _) {
    if (E.hostname = m.host, E.host = m.host, E.port = m.port, E.path = _, m.auth) {
      var S = Buffer.from(m.auth.username + ":" + m.auth.password, "utf8").toString("base64");
      E.headers["Proxy-Authorization"] = "Basic " + S;
    }
    E.beforeRedirect = function(I) {
      I.headers.host = I.host, w(I, m, I.href);
    };
  }
  return http_1 = function(m) {
    return new Promise(function(S, O) {
      var I = function(W) {
        S(W);
      }, A = function(W) {
        O(W);
      }, F = m.data, z = m.headers;
      if ("User-Agent" in z || "user-agent" in z ? !z["User-Agent"] && !z["user-agent"] && (delete z["User-Agent"], delete z["user-agent"]) : z["User-Agent"] = "axios/" + h.version, F && !e.isStream(F)) {
        if (!Buffer.isBuffer(F)) if (e.isArrayBuffer(F))
          F = Buffer.from(new Uint8Array(F));
        else if (e.isString(F))
          F = Buffer.from(F, "utf-8");
        else
          return A(p(
            "Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream",
            m
          ));
        z["Content-Length"] = F.length;
      }
      var x = void 0;
      if (m.auth) {
        var Y = m.auth.username || "", J = m.auth.password || "";
        x = Y + ":" + J;
      }
      var K = n(m.baseURL, m.url), V = l.parse(K), G = V.protocol || "http:";
      if (!x && V.auth) {
        var M = V.auth.split(":"), L = M[0] || "", N = M[1] || "";
        x = L + ":" + N;
      }
      x && delete z.Authorization;
      var C = y.test(G), j = C ? m.httpsAgent : m.httpAgent, q = {
        path: s(V.path, m.params, m.paramsSerializer).replace(/^\?/, ""),
        method: m.method.toUpperCase(),
        headers: z,
        agent: j,
        agents: { http: m.httpAgent, https: m.httpsAgent },
        auth: x
      };
      m.socketPath ? q.socketPath = m.socketPath : (q.hostname = V.hostname, q.port = V.port);
      var T = m.proxy;
      if (!T && T !== !1) {
        var v = G.slice(0, -1) + "_proxy", P = process.env[v] || process.env[v.toUpperCase()];
        if (P) {
          var b = l.parse(P), f = process.env.no_proxy || process.env.NO_PROXY, $ = !0;
          if (f) {
            var R = f.split(",").map(function(W) {
              return W.trim();
            });
            $ = !R.some(function(W) {
              return W ? W === "*" || W[0] === "." && V.hostname.substr(V.hostname.length - W.length) === W ? !0 : V.hostname === W : !1;
            });
          }
          if ($ && (T = {
            host: b.hostname,
            port: b.port,
            protocol: b.protocol
          }, b.auth)) {
            var k = b.auth.split(":");
            T.auth = {
              username: k[0],
              password: k[1]
            };
          }
        }
      }
      T && (q.headers.host = V.hostname + (V.port ? ":" + V.port : ""), w(q, T, G + "//" + V.hostname + (V.port ? ":" + V.port : "") + q.path));
      var D, H = C && (T ? y.test(T.protocol) : !0);
      m.transport ? D = m.transport : m.maxRedirects === 0 ? D = H ? a : o : (m.maxRedirects && (q.maxRedirects = m.maxRedirects), D = H ? d : c), m.maxBodyLength > -1 && (q.maxBodyLength = m.maxBodyLength);
      var U = D.request(q, function(W) {
        if (!U.aborted) {
          var te = W, oe = W.req || U;
          if (W.statusCode !== 204 && oe.method !== "HEAD" && m.decompress !== !1)
            switch (W.headers["content-encoding"]) {
              case "gzip":
              case "compress":
              case "deflate":
                te = te.pipe(u.createUnzip()), delete W.headers["content-encoding"];
                break;
            }
          var ae = {
            status: W.statusCode,
            statusText: W.statusMessage,
            headers: W.headers,
            config: m,
            request: oe
          };
          if (m.responseType === "stream")
            ae.data = te, r(I, A, ae);
          else {
            var ue = [], de = 0;
            te.on("data", function(Z) {
              ue.push(Z), de += Z.length, m.maxContentLength > -1 && de > m.maxContentLength && (te.destroy(), A(p(
                "maxContentLength size of " + m.maxContentLength + " exceeded",
                m,
                null,
                oe
              )));
            }), te.on("error", function(Z) {
              U.aborted || A(g(Z, m, null, oe));
            }), te.on("end", function() {
              var Z = Buffer.concat(ue);
              m.responseType !== "arraybuffer" && (Z = Z.toString(m.responseEncoding), (!m.responseEncoding || m.responseEncoding === "utf8") && (Z = e.stripBOM(Z))), ae.data = Z, r(I, A, ae);
            });
          }
        }
      });
      if (U.on("error", function(W) {
        U.aborted && W.code !== "ERR_FR_TOO_MANY_REDIRECTS" || A(g(W, m, null, U));
      }), m.timeout) {
        var X = parseInt(m.timeout, 10);
        if (isNaN(X)) {
          A(p(
            "error trying to parse `config.timeout` to int",
            m,
            "ERR_PARSE_TIMEOUT",
            U
          ));
          return;
        }
        U.setTimeout(X, function() {
          U.abort(), A(p(
            "timeout of " + X + "ms exceeded",
            m,
            m.transitional && m.transitional.clarifyTimeoutError ? "ETIMEDOUT" : "ECONNABORTED",
            U
          ));
        });
      }
      m.cancelToken && m.cancelToken.promise.then(function(W) {
        U.aborted || (U.abort(), A(W));
      }), e.isStream(F) ? F.on("error", function(W) {
        A(g(W, m, null, U));
      }).pipe(U) : U.end(F);
    });
  }, http_1;
}
var utils$5 = utils$9, normalizeHeaderName = normalizeHeaderName$1, enhanceError = enhanceError$1, DEFAULT_CONTENT_TYPE = {
  "Content-Type": "application/x-www-form-urlencoded"
};
function setContentTypeIfUnset(e, r) {
  !utils$5.isUndefined(e) && utils$5.isUndefined(e["Content-Type"]) && (e["Content-Type"] = r);
}
function getDefaultAdapter() {
  var e;
  return typeof XMLHttpRequest < "u" ? e = requireXhr() : typeof process < "u" && Object.prototype.toString.call(process) === "[object process]" && (e = requireHttp()), e;
}
function stringifySafely(e, r, n) {
  if (utils$5.isString(e))
    try {
      return (r || JSON.parse)(e), utils$5.trim(e);
    } catch (s) {
      if (s.name !== "SyntaxError")
        throw s;
    }
  return (n || JSON.stringify)(e);
}
var defaults$3 = {
  transitional: {
    silentJSONParsing: !0,
    forcedJSONParsing: !0,
    clarifyTimeoutError: !1
  },
  adapter: getDefaultAdapter(),
  transformRequest: [function(r, n) {
    return normalizeHeaderName(n, "Accept"), normalizeHeaderName(n, "Content-Type"), utils$5.isFormData(r) || utils$5.isArrayBuffer(r) || utils$5.isBuffer(r) || utils$5.isStream(r) || utils$5.isFile(r) || utils$5.isBlob(r) ? r : utils$5.isArrayBufferView(r) ? r.buffer : utils$5.isURLSearchParams(r) ? (setContentTypeIfUnset(n, "application/x-www-form-urlencoded;charset=utf-8"), r.toString()) : utils$5.isObject(r) || n && n["Content-Type"] === "application/json" ? (setContentTypeIfUnset(n, "application/json"), stringifySafely(r)) : r;
  }],
  transformResponse: [function(r) {
    var n = this.transitional, s = n && n.silentJSONParsing, o = n && n.forcedJSONParsing, a = !s && this.responseType === "json";
    if (a || o && utils$5.isString(r) && r.length)
      try {
        return JSON.parse(r);
      } catch (c) {
        if (a)
          throw c.name === "SyntaxError" ? enhanceError(c, this, "E_JSON_PARSE") : c;
      }
    return r;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  validateStatus: function(r) {
    return r >= 200 && r < 300;
  }
};
defaults$3.headers = {
  common: {
    Accept: "application/json, text/plain, */*"
  }
};
utils$5.forEach(["delete", "get", "head"], function(r) {
  defaults$3.headers[r] = {};
});
utils$5.forEach(["post", "put", "patch"], function(r) {
  defaults$3.headers[r] = utils$5.merge(DEFAULT_CONTENT_TYPE);
});
var defaults_1 = defaults$3, utils$4 = utils$9, defaults$2 = defaults_1, transformData$1 = function(r, n, s) {
  var o = this || defaults$2;
  return utils$4.forEach(s, function(c) {
    r = c.call(o, r, n);
  }), r;
}, isCancel$1, hasRequiredIsCancel;
function requireIsCancel() {
  return hasRequiredIsCancel || (hasRequiredIsCancel = 1, isCancel$1 = function(r) {
    return !!(r && r.__CANCEL__);
  }), isCancel$1;
}
var utils$3 = utils$9, transformData = transformData$1, isCancel = requireIsCancel(), defaults$1 = defaults_1;
function throwIfCancellationRequested(e) {
  e.cancelToken && e.cancelToken.throwIfRequested();
}
var dispatchRequest$1 = function(r) {
  throwIfCancellationRequested(r), r.headers = r.headers || {}, r.data = transformData.call(
    r,
    r.data,
    r.headers,
    r.transformRequest
  ), r.headers = utils$3.merge(
    r.headers.common || {},
    r.headers[r.method] || {},
    r.headers
  ), utils$3.forEach(
    ["delete", "get", "head", "post", "put", "patch", "common"],
    function(o) {
      delete r.headers[o];
    }
  );
  var n = r.adapter || defaults$1.adapter;
  return n(r).then(function(o) {
    return throwIfCancellationRequested(r), o.data = transformData.call(
      r,
      o.data,
      o.headers,
      r.transformResponse
    ), o;
  }, function(o) {
    return isCancel(o) || (throwIfCancellationRequested(r), o && o.response && (o.response.data = transformData.call(
      r,
      o.response.data,
      o.response.headers,
      r.transformResponse
    ))), Promise.reject(o);
  });
}, utils$2 = utils$9, mergeConfig$2 = function(r, n) {
  n = n || {};
  var s = {}, o = ["url", "method", "data"], a = ["headers", "auth", "proxy", "params"], c = [
    "baseURL",
    "transformRequest",
    "transformResponse",
    "paramsSerializer",
    "timeout",
    "timeoutMessage",
    "withCredentials",
    "adapter",
    "responseType",
    "xsrfCookieName",
    "xsrfHeaderName",
    "onUploadProgress",
    "onDownloadProgress",
    "decompress",
    "maxContentLength",
    "maxBodyLength",
    "maxRedirects",
    "transport",
    "httpAgent",
    "httpsAgent",
    "cancelToken",
    "socketPath",
    "responseEncoding"
  ], d = ["validateStatus"];
  function l(g, y) {
    return utils$2.isPlainObject(g) && utils$2.isPlainObject(y) ? utils$2.merge(g, y) : utils$2.isPlainObject(y) ? utils$2.merge({}, y) : utils$2.isArray(y) ? y.slice() : y;
  }
  function u(g) {
    utils$2.isUndefined(n[g]) ? utils$2.isUndefined(r[g]) || (s[g] = l(void 0, r[g])) : s[g] = l(r[g], n[g]);
  }
  utils$2.forEach(o, function(y) {
    utils$2.isUndefined(n[y]) || (s[y] = l(void 0, n[y]));
  }), utils$2.forEach(a, u), utils$2.forEach(c, function(y) {
    utils$2.isUndefined(n[y]) ? utils$2.isUndefined(r[y]) || (s[y] = l(void 0, r[y])) : s[y] = l(void 0, n[y]);
  }), utils$2.forEach(d, function(y) {
    y in n ? s[y] = l(r[y], n[y]) : y in r && (s[y] = l(void 0, r[y]));
  });
  var h = o.concat(a).concat(c).concat(d), p = Object.keys(r).concat(Object.keys(n)).filter(function(y) {
    return h.indexOf(y) === -1;
  });
  return utils$2.forEach(p, u), s;
}, pkg = require$$0, validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach(function(e, r) {
  validators$1[e] = function(s) {
    return typeof s === e || "a" + (r < 1 ? "n " : " ") + e;
  };
});
var deprecatedWarnings = {}, currentVerArr = pkg.version.split(".");
function isOlderVersion(e, r) {
  for (var n = r ? r.split(".") : currentVerArr, s = e.split("."), o = 0; o < 3; o++) {
    if (n[o] > s[o])
      return !0;
    if (n[o] < s[o])
      return !1;
  }
  return !1;
}
validators$1.transitional = function(r, n, s) {
  var o = n && isOlderVersion(n);
  function a(c, d) {
    return "[Axios v" + pkg.version + "] Transitional option '" + c + "'" + d + (s ? ". " + s : "");
  }
  return function(c, d, l) {
    if (r === !1)
      throw new Error(a(d, " has been removed in " + n));
    return o && !deprecatedWarnings[d] && (deprecatedWarnings[d] = !0, console.warn(
      a(
        d,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), r ? r(c, d, l) : !0;
  };
};
function assertOptions(e, r, n) {
  if (typeof e != "object")
    throw new TypeError("options must be an object");
  for (var s = Object.keys(e), o = s.length; o-- > 0; ) {
    var a = s[o], c = r[a];
    if (c) {
      var d = e[a], l = d === void 0 || c(d, a, e);
      if (l !== !0)
        throw new TypeError("option " + a + " must be " + l);
      continue;
    }
    if (n !== !0)
      throw Error("Unknown option " + a);
  }
}
var validator$1 = {
  isOlderVersion,
  assertOptions,
  validators: validators$1
}, utils$1 = utils$9, buildURL = buildURL$1, InterceptorManager = InterceptorManager_1, dispatchRequest = dispatchRequest$1, mergeConfig$1 = mergeConfig$2, validator = validator$1, validators = validator.validators;
function Axios$1(e) {
  this.defaults = e, this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}
Axios$1.prototype.request = function(r) {
  typeof r == "string" ? (r = arguments[1] || {}, r.url = arguments[0]) : r = r || {}, r = mergeConfig$1(this.defaults, r), r.method ? r.method = r.method.toLowerCase() : this.defaults.method ? r.method = this.defaults.method.toLowerCase() : r.method = "get";
  var n = r.transitional;
  n !== void 0 && validator.assertOptions(n, {
    silentJSONParsing: validators.transitional(validators.boolean, "1.0.0"),
    forcedJSONParsing: validators.transitional(validators.boolean, "1.0.0"),
    clarifyTimeoutError: validators.transitional(validators.boolean, "1.0.0")
  }, !1);
  var s = [], o = !0;
  this.interceptors.request.forEach(function(g) {
    typeof g.runWhen == "function" && g.runWhen(r) === !1 || (o = o && g.synchronous, s.unshift(g.fulfilled, g.rejected));
  });
  var a = [];
  this.interceptors.response.forEach(function(g) {
    a.push(g.fulfilled, g.rejected);
  });
  var c;
  if (!o) {
    var d = [dispatchRequest, void 0];
    for (Array.prototype.unshift.apply(d, s), d = d.concat(a), c = Promise.resolve(r); d.length; )
      c = c.then(d.shift(), d.shift());
    return c;
  }
  for (var l = r; s.length; ) {
    var u = s.shift(), h = s.shift();
    try {
      l = u(l);
    } catch (p) {
      h(p);
      break;
    }
  }
  try {
    c = dispatchRequest(l);
  } catch (p) {
    return Promise.reject(p);
  }
  for (; a.length; )
    c = c.then(a.shift(), a.shift());
  return c;
};
Axios$1.prototype.getUri = function(r) {
  return r = mergeConfig$1(this.defaults, r), buildURL(r.url, r.params, r.paramsSerializer).replace(/^\?/, "");
};
utils$1.forEach(["delete", "get", "head", "options"], function(r) {
  Axios$1.prototype[r] = function(n, s) {
    return this.request(mergeConfig$1(s || {}, {
      method: r,
      url: n,
      data: (s || {}).data
    }));
  };
});
utils$1.forEach(["post", "put", "patch"], function(r) {
  Axios$1.prototype[r] = function(n, s, o) {
    return this.request(mergeConfig$1(o || {}, {
      method: r,
      url: n,
      data: s
    }));
  };
});
var Axios_1 = Axios$1, Cancel_1, hasRequiredCancel;
function requireCancel() {
  if (hasRequiredCancel) return Cancel_1;
  hasRequiredCancel = 1;
  function e(r) {
    this.message = r;
  }
  return e.prototype.toString = function() {
    return "Cancel" + (this.message ? ": " + this.message : "");
  }, e.prototype.__CANCEL__ = !0, Cancel_1 = e, Cancel_1;
}
var CancelToken_1, hasRequiredCancelToken;
function requireCancelToken() {
  if (hasRequiredCancelToken) return CancelToken_1;
  hasRequiredCancelToken = 1;
  var e = requireCancel();
  function r(n) {
    if (typeof n != "function")
      throw new TypeError("executor must be a function.");
    var s;
    this.promise = new Promise(function(c) {
      s = c;
    });
    var o = this;
    n(function(c) {
      o.reason || (o.reason = new e(c), s(o.reason));
    });
  }
  return r.prototype.throwIfRequested = function() {
    if (this.reason)
      throw this.reason;
  }, r.source = function() {
    var s, o = new r(function(c) {
      s = c;
    });
    return {
      token: o,
      cancel: s
    };
  }, CancelToken_1 = r, CancelToken_1;
}
var spread, hasRequiredSpread;
function requireSpread() {
  return hasRequiredSpread || (hasRequiredSpread = 1, spread = function(r) {
    return function(s) {
      return r.apply(null, s);
    };
  }), spread;
}
var isAxiosError, hasRequiredIsAxiosError;
function requireIsAxiosError() {
  return hasRequiredIsAxiosError || (hasRequiredIsAxiosError = 1, isAxiosError = function(r) {
    return typeof r == "object" && r.isAxiosError === !0;
  }), isAxiosError;
}
var utils = utils$9, bind = bind$2, Axios = Axios_1, mergeConfig = mergeConfig$2, defaults = defaults_1;
function createInstance(e) {
  var r = new Axios(e), n = bind(Axios.prototype.request, r);
  return utils.extend(n, Axios.prototype, r), utils.extend(n, r), n;
}
var axios$1 = createInstance(defaults);
axios$1.Axios = Axios;
axios$1.create = function(r) {
  return createInstance(mergeConfig(axios$1.defaults, r));
};
axios$1.Cancel = requireCancel();
axios$1.CancelToken = requireCancelToken();
axios$1.isCancel = requireIsCancel();
axios$1.all = function(r) {
  return Promise.all(r);
};
axios$1.spread = requireSpread();
axios$1.isAxiosError = requireIsAxiosError();
axios$2.exports = axios$1;
axios$2.exports.default = axios$1;
var axiosExports = axios$2.exports, axios = axiosExports;
(function(exports$1) {
  var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function(e, r, n, s) {
    function o(a) {
      return a instanceof n ? a : new n(function(c) {
        c(a);
      });
    }
    return new (n || (n = Promise))(function(a, c) {
      function d(h) {
        try {
          u(s.next(h));
        } catch (p) {
          c(p);
        }
      }
      function l(h) {
        try {
          u(s.throw(h));
        } catch (p) {
          c(p);
        }
      }
      function u(h) {
        h.done ? a(h.value) : o(h.value).then(d, l);
      }
      u((s = s.apply(e, r || [])).next());
    });
  }, __generator = commonjsGlobal && commonjsGlobal.__generator || function(e, r) {
    var n = { label: 0, sent: function() {
      if (a[0] & 1) throw a[1];
      return a[1];
    }, trys: [], ops: [] }, s, o, a, c;
    return c = { next: d(0), throw: d(1), return: d(2) }, typeof Symbol == "function" && (c[Symbol.iterator] = function() {
      return this;
    }), c;
    function d(u) {
      return function(h) {
        return l([u, h]);
      };
    }
    function l(u) {
      if (s) throw new TypeError("Generator is already executing.");
      for (; n; ) try {
        if (s = 1, o && (a = u[0] & 2 ? o.return : u[0] ? o.throw || ((a = o.return) && a.call(o), 0) : o.next) && !(a = a.call(o, u[1])).done) return a;
        switch (o = 0, a && (u = [u[0] & 2, a.value]), u[0]) {
          case 0:
          case 1:
            a = u;
            break;
          case 4:
            return n.label++, { value: u[1], done: !1 };
          case 5:
            n.label++, o = u[1], u = [0];
            continue;
          case 7:
            u = n.ops.pop(), n.trys.pop();
            continue;
          default:
            if (a = n.trys, !(a = a.length > 0 && a[a.length - 1]) && (u[0] === 6 || u[0] === 2)) {
              n = 0;
              continue;
            }
            if (u[0] === 3 && (!a || u[1] > a[0] && u[1] < a[3])) {
              n.label = u[1];
              break;
            }
            if (u[0] === 6 && n.label < a[1]) {
              n.label = a[1], a = u;
              break;
            }
            if (a && n.label < a[2]) {
              n.label = a[2], n.ops.push(u);
              break;
            }
            a[2] && n.ops.pop(), n.trys.pop();
            continue;
        }
        u = r.call(e, n);
      } catch (h) {
        u = [6, h], o = 0;
      } finally {
        s = a = 0;
      }
      if (u[0] & 5) throw u[1];
      return { value: u[0] ? u[1] : void 0, done: !0 };
    }
  }, __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  Object.defineProperty(exports$1, "__esModule", { value: !0 }), exports$1.getAllAudioBase64 = exports$1.getAudioBase64 = void 0;
  var assertInputTypes_1 = __importDefault(assertInputTypes$1), axios_1 = __importDefault(axios), splitLongText_1 = __importDefault(splitLongText$1), getAudioBase64 = function(text, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.lang, lang = _c === void 0 ? "en" : _c, _d = _b.slow, slow = _d === void 0 ? !1 : _d, _e = _b.host, host = _e === void 0 ? "https://translate.google.com" : _e, _f = _b.timeout, timeout = _f === void 0 ? 1e4 : _f;
    return __awaiter(void 0, void 0, void 0, function() {
      var res, result;
      return __generator(this, function(_g) {
        switch (_g.label) {
          case 0:
            if (assertInputTypes_1.default(text, lang, slow, host), typeof timeout != "number" || timeout <= 0)
              throw new TypeError("timeout should be a positive number");
            if (text.length > 200)
              throw new RangeError("text length (" + text.length + ') should be less than 200 characters. Try "getAllAudioBase64(text, [option])" for long text.');
            return [4, axios_1.default({
              method: "post",
              baseURL: host,
              url: "/_/TranslateWebserverUi/data/batchexecute",
              timeout,
              data: "f.req=" + encodeURIComponent(JSON.stringify([
                [["jQ1olc", JSON.stringify([text, lang, slow ? !0 : null, "null"]), null, "generic"]]
              ]))
            })];
          case 1:
            res = _g.sent();
            try {
              result = eval(res.data.slice(5))[0][2];
            } catch (e) {
              throw new Error(`parse response failed:
` + res.data);
            }
            if (!result)
              throw new Error('lang "' + lang + '" might not exist');
            try {
              result = eval(result)[0];
            } catch (e) {
              throw new Error(`parse response failed:
` + res.data);
            }
            return [2, result];
        }
      });
    });
  };
  exports$1.getAudioBase64 = getAudioBase64;
  var getAllAudioBase64 = function(e, r) {
    var n = r === void 0 ? {} : r, s = n.lang, o = s === void 0 ? "en" : s, a = n.slow, c = a === void 0 ? !1 : a, d = n.host, l = d === void 0 ? "https://translate.google.com" : d, u = n.splitPunct, h = u === void 0 ? "" : u, p = n.timeout, g = p === void 0 ? 1e4 : p;
    return __awaiter(void 0, void 0, void 0, function() {
      var y, w, E, m, _, S;
      return __generator(this, function(O) {
        switch (O.label) {
          case 0:
            if (assertInputTypes_1.default(e, o, c, l), typeof h != "string")
              throw new TypeError("splitPunct should be a string");
            if (typeof g != "number" || g <= 0)
              throw new TypeError("timeout should be a positive number");
            return y = splitLongText_1.default(e, { splitPunct: h }), [4, Promise.all(y.map(function(I) {
              return exports$1.getAudioBase64(I, { lang: o, slow: c, host: l, timeout: g });
            }))];
          case 1:
            for (w = O.sent(), E = [], m = 0; m < y.length; m++)
              _ = y[m], S = w[m], E.push({ shortText: _, base64: S });
            return [2, E];
        }
      });
    });
  };
  exports$1.getAllAudioBase64 = getAllAudioBase64;
})(getAudioBase64);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.getAllAudioBase64 = e.getAudioBase64 = e.getAllAudioUrls = e.getAudioUrl = void 0;
  var r = getAudioUrl;
  Object.defineProperty(e, "getAudioUrl", { enumerable: !0, get: function() {
    return r.getAudioUrl;
  } }), Object.defineProperty(e, "getAllAudioUrls", { enumerable: !0, get: function() {
    return r.getAllAudioUrls;
  } });
  var n = getAudioBase64;
  Object.defineProperty(e, "getAudioBase64", { enumerable: !0, get: function() {
    return n.getAudioBase64;
  } }), Object.defineProperty(e, "getAllAudioBase64", { enumerable: !0, get: function() {
    return n.getAllAudioBase64;
  } });
})(dist);
var shellQuote = {}, quote$1 = function e(r) {
  return r.map(function(n) {
    return n === "" ? "''" : n && typeof n == "object" ? n.op.replace(/(.)/g, "\\$1") : /["\s\\]/.test(n) && !/'/.test(n) ? "'" + n.replace(/(['])/g, "\\$1") + "'" : /["'\s]/.test(n) ? '"' + n.replace(/(["\\$`!])/g, "\\$1") + '"' : String(n).replace(/([A-Za-z]:)?([#!"$&'()*,:;<=>?@[\\\]^`{|}])/g, "$1\\$2");
  }).join(" ");
}, CONTROL = "(?:" + [
  "\\|\\|",
  "\\&\\&",
  ";;",
  "\\|\\&",
  "\\<\\(",
  "\\<\\<\\<",
  ">>",
  ">\\&",
  "<\\&",
  "[&;()|<>]"
].join("|") + ")", controlRE = new RegExp("^" + CONTROL + "$"), META = "|&;()<> \\t", SINGLE_QUOTE = '"((\\\\"|[^"])*?)"', DOUBLE_QUOTE = "'((\\\\'|[^'])*?)'", hash = /^#$/, SQ = "'", DQ = '"', DS = "$", TOKEN = "", mult = 4294967296;
for (var i = 0; i < 4; i++)
  TOKEN += (mult * Math.random()).toString(16);
var startsWithToken = new RegExp("^" + TOKEN);
function matchAll(e, r) {
  for (var n = r.lastIndex, s = [], o; o = r.exec(e); )
    s.push(o), r.lastIndex === o.index && (r.lastIndex += 1);
  return r.lastIndex = n, s;
}
function getVar(e, r, n) {
  var s = typeof e == "function" ? e(n) : e[n];
  return typeof s > "u" && n != "" ? s = "" : typeof s > "u" && (s = "$"), typeof s == "object" ? r + TOKEN + JSON.stringify(s) + TOKEN : r + s;
}
function parseInternal(e, r, n) {
  n || (n = {});
  var s = n.escape || "\\", o = "(\\" + s + `['"` + META + `]|[^\\s'"` + META + "])+", a = new RegExp([
    "(" + CONTROL + ")",
    // control chars
    "(" + o + "|" + SINGLE_QUOTE + "|" + DOUBLE_QUOTE + ")+"
  ].join("|"), "g"), c = matchAll(e, a);
  if (c.length === 0)
    return [];
  r || (r = {});
  var d = !1;
  return c.map(function(l) {
    var u = l[0];
    if (!u || d)
      return;
    if (controlRE.test(u))
      return { op: u };
    var h = !1, p = !1, g = "", y = !1, w;
    function E() {
      w += 1;
      var S, O, I = u.charAt(w);
      if (I === "{") {
        if (w += 1, u.charAt(w) === "}")
          throw new Error("Bad substitution: " + u.slice(w - 2, w + 1));
        if (S = u.indexOf("}", w), S < 0)
          throw new Error("Bad substitution: " + u.slice(w));
        O = u.slice(w, S), w = S;
      } else if (/[*@#?$!_-]/.test(I))
        O = I, w += 1;
      else {
        var A = u.slice(w);
        S = A.match(/[^\w\d_]/), S ? (O = A.slice(0, S.index), w += S.index - 1) : (O = A, w = u.length);
      }
      return getVar(r, "", O);
    }
    for (w = 0; w < u.length; w++) {
      var m = u.charAt(w);
      if (y = y || !h && (m === "*" || m === "?"), p)
        g += m, p = !1;
      else if (h)
        m === h ? h = !1 : h == SQ ? g += m : m === s ? (w += 1, m = u.charAt(w), m === DQ || m === s || m === DS ? g += m : g += s + m) : m === DS ? g += E() : g += m;
      else if (m === DQ || m === SQ)
        h = m;
      else {
        if (controlRE.test(m))
          return { op: u };
        if (hash.test(m)) {
          d = !0;
          var _ = { comment: e.slice(l.index + w + 1) };
          return g.length ? [g, _] : [_];
        } else m === s ? p = !0 : m === DS ? g += E() : g += m;
      }
    }
    return y ? { op: "glob", pattern: g } : g;
  }).reduce(function(l, u) {
    return typeof u > "u" ? l : l.concat(u);
  }, []);
}
var parse = function e(r, n, s) {
  var o = parseInternal(r, n, s);
  return typeof n != "function" ? o : o.reduce(function(a, c) {
    if (typeof c == "object")
      return a.concat(c);
    var d = c.split(RegExp("(" + TOKEN + ".*?" + TOKEN + ")", "g"));
    return d.length === 1 ? a.concat(d[0]) : a.concat(d.filter(Boolean).map(function(l) {
      return startsWithToken.test(l) ? JSON.parse(l.split(TOKEN)[1]) : l;
    }));
  }, []);
};
shellQuote.quote = quote$1;
shellQuote.parse = parse;
var exec = require$$0$3.execSync, platform = require$$0$2.platform(), quote = shellQuote.quote, findExec$1 = function() {
  var e = Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.apply(arguments), r = null;
  return e.some(function(n) {
    if (isExec(findCommand(n)))
      return r = n, !0;
  }), r;
};
function isExec(e) {
  try {
    return exec(quote(e.split(" ")), { stdio: "ignore" }), !0;
  } catch {
    return !1;
  }
}
function findCommand(e) {
  return /^win/.test(platform) ? "where " + e : "command -v " + e;
}
var findExec = findExec$1, spawn = require$$0$3.spawn, players = [
  "mplayer",
  "afplay",
  "mpg123",
  "mpg321",
  "play",
  "omxplayer",
  "aplay",
  "cmdmp3",
  "cvlc",
  "powershell"
];
function Play(e) {
  e = e || {}, this.players = e.players || players, this.player = e.player || findExec(this.players), this.urlRegex = /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i, this.play = function(r, n, s) {
    if (s = s || function() {
    }, s = typeof n == "function" ? n : s, n = typeof n == "object" ? n : {}, n.stdio = "ignore", this.player == "mplayer" && this.urlRegex.test(r), !r) return s(new Error("No audio file specified"));
    if (!this.player)
      return s(new Error("Couldn't find a suitable audio player"));
    var o = Array.isArray(n[this.player]) ? n[this.player].concat(r) : [r], a = spawn(this.player, o, n);
    return a ? (a.on("close", function(c) {
      s(c && !c.killed ? c : null);
    }), a) : (s(new Error("Unable to spawn process with " + this.player)), null);
  }, this.test = function(r) {
    this.play("./assets/test.mp3", r);
  };
}
var playSound = function(e) {
  return new Play(e);
};
const playSound$1 = /* @__PURE__ */ getDefaultExportFromCjs(playSound), player = playSound$1({}), __dirname$1 = path.dirname(fileURLToPath(import.meta.url)), store = new ElectronStore();
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL, MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron"), RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win, tray = null;
const WINDOW_WIDTH = 400, WINDOW_HEIGHT = 600;
function createWindow() {
  const e = store.get("windowX"), r = store.get("windowY");
  let n, s;
  if (e !== void 0 && r !== void 0)
    n = e, s = r;
  else {
    const o = screen.getPrimaryDisplay(), { width: a, height: c } = o.workAreaSize;
    n = Math.round((a - WINDOW_WIDTH) / 2), s = Math.round((c - WINDOW_HEIGHT) / 2);
  }
  return win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: n,
    y: s,
    minWidth: WINDOW_WIDTH,
    maxWidth: WINDOW_WIDTH,
    minHeight: WINDOW_HEIGHT,
    maxHeight: WINDOW_HEIGHT,
    frame: !1,
    // 无边框窗口
    resizable: !1,
    // 不可调整大小
    fullscreenable: !1,
    maximizable: !1,
    titleBarStyle: "hidden",
    show: !1,
    // 初始不显示窗口，等托盘准备好后再显示
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), win.on("moved", () => {
    if (win) {
      const [o, a] = win.getPosition();
      store.set("windowX", o), store.set("windowY", a);
    }
  }), win.on("close", (o) => {
    if (isQuitting) {
      win = null;
      return;
    }
    o.preventDefault(), win == null || win.hide();
  }), win.webContents.on("did-finish-load", () => {
    win == null || win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), VITE_DEV_SERVER_URL ? win.loadURL(VITE_DEV_SERVER_URL) : win.loadFile(path.join(RENDERER_DIST, "index.html")), win;
}
function createTray() {
  const e = VITE_DEV_SERVER_URL ? path.join(process.env.VITE_PUBLIC, "icon.png") : path.join(RENDERER_DIST, "book-a.png");
  tray = new Tray(e), tray.setToolTip("Dict - AI 词典工具");
  const r = Menu.buildFromTemplate([
    {
      label: "显示/隐藏窗口",
      click: () => {
        toggleWindow();
      }
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        isQuitting = !0, app$1.quit();
      }
    }
  ]);
  tray.setContextMenu(r), tray.on("click", () => {
    toggleWindow();
  }), tray.on("double-click", () => {
    toggleWindow();
  });
}
function toggleWindow() {
  if (!win) {
    createWindow();
    return;
  }
  win.isVisible() ? win.hide() : (win.show(), win.focus(), setTimeout(sendClipboardContent, 300));
}
const DATA_DIR = path.join(app$1.getPath("userData"), "dict-data");
ipcMain$1.handle("window:minimize", () => {
  win == null || win.minimize();
});
ipcMain$1.handle("window:close", () => {
  win == null || win.hide();
});
ipcMain$1.handle("window:hide", () => {
  win == null || win.hide();
});
ipcMain$1.handle("window:show", () => {
  win && (win.show(), win.focus());
});
ipcMain$1.handle("settings:get", () => store.get("settings", {}));
ipcMain$1.handle("settings:set", (e, r) => (store.set("settings", r), !0));
ipcMain$1.handle("data:getPath", () => DATA_DIR);
ipcMain$1.handle("history:load", () => store.get("history", []));
ipcMain$1.handle("history:save", (e, r) => (store.set("history", r), !0));
ipcMain$1.handle("speech:speak", async (e, r) => {
  try {
    console.log("[Main] 播放单词:", r);
    const n = dist.getAudioUrl(r, {
      lang: "en",
      slow: !1,
      host: "https://translate.google.com"
    });
    return console.log("[Main] TTS URL:", n.substring(0, 100) + "..."), new Promise((s, o) => {
      player.play(n, (a) => {
        a ? (console.error("[Main] 语音播放失败:", a), o(a)) : (console.log("[Main] 语音播放完成"), s(!0));
      });
    });
  } catch (n) {
    throw console.error("[Main] 语音播放异常:", n), n;
  }
});
ipcMain$1.handle("favorites:export", async (e, r) => {
  try {
    const { filePath: n } = await dialog.showSaveDialog({
      title: "导出收藏单词",
      defaultPath: `favorites_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`,
      filters: [
        { name: "JSON Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (!n)
      return { success: !1, cancelled: !0 };
    const s = {
      version: "1.0",
      exportDate: Date.now(),
      favorites: r
    };
    return fs.writeFileSync(n, JSON.stringify(s, null, 2), "utf-8"), { success: !0, filePath: n };
  } catch (n) {
    return console.error("Export favorites failed:", n), { success: !1, error: String(n) };
  }
});
ipcMain$1.handle("favorites:import", async () => {
  try {
    const { filePaths: e } = await dialog.showOpenDialog({
      title: "导入收藏单词",
      filters: [
        { name: "JSON Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] }
      ],
      properties: ["openFile"]
    });
    if (!e || e.length === 0)
      return { success: !1, cancelled: !0 };
    const r = fs.readFileSync(e[0], "utf-8"), n = JSON.parse(r);
    if (!n.favorites || !Array.isArray(n.favorites))
      return { success: !1, error: "Invalid file format: favorites array not found" };
    const s = n.favorites.filter((o) => o.id && o.word && o.queryData && o.createdAt);
    return {
      success: !0,
      favorites: s,
      totalCount: n.favorites.length,
      validCount: s.length
    };
  } catch (e) {
    return console.error("Import favorites failed:", e), { success: !1, error: String(e) };
  }
});
app$1.on("window-all-closed", () => {
});
app$1.on("activate", () => {
  win === null ? createWindow() : win.show();
});
let lastClipboardText = "";
function isEnglishText(e) {
  const r = e.trim();
  if (!r) return !1;
  const n = /[a-zA-Z]/.test(r), s = /^[\x00-\x7F]+$/.test(r);
  return n && s;
}
function isWord(e) {
  const r = e.trim();
  if (!r || /\s/.test(r) || /[.!?,:;"'()\[\]{}]/.test(r) || !/[a-zA-Z]/.test(r) || !/^[a-zA-Z-]+$/.test(r)) return !1;
  const c = r.length;
  return !(c < 1 || c > 50);
}
function sendClipboardContent() {
  if (!win) return;
  const e = clipboard.readText().trim();
  e && isEnglishText(e) && isWord(e) && e !== lastClipboardText && (lastClipboardText = e, win.webContents.send("clipboard:content", e));
}
let isQuitting = !1;
const gotTheLock = app$1.requestSingleInstanceLock();
gotTheLock ? (app$1.on("second-instance", () => {
  console.log("[electron] Second instance started, showing window..."), win ? (win.isMinimized() && win.restore(), win.show(), win.focus(), setTimeout(sendClipboardContent, 300)) : createWindow();
}), app$1.whenReady().then(() => {
  console.log("[electron]", process.versions.electron), createWindow(), createTray(), app$1.on("browser-window-focus", () => {
    setTimeout(sendClipboardContent, 300);
  });
})) : (console.log("[electron] Another instance is running, quitting..."), app$1.quit());
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
