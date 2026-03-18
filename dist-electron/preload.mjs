"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("electronClipboard", {
  // 监听剪切板内容变化
  onClipboardContent: (callback) => {
    const handler = (_, text) => callback(text);
    electron.ipcRenderer.on("clipboard:content", handler);
    return () => electron.ipcRenderer.off("clipboard:content", handler);
  }
});
electron.contextBridge.exposeInMainWorld("electronWindow", {
  minimize: () => electron.ipcRenderer.invoke("window:minimize"),
  close: () => electron.ipcRenderer.invoke("window:close"),
  hide: () => electron.ipcRenderer.invoke("window:hide"),
  show: () => electron.ipcRenderer.invoke("window:show")
});
electron.contextBridge.exposeInMainWorld("electronStore", {
  getSettings: () => electron.ipcRenderer.invoke("settings:get"),
  setSettings: (settings) => electron.ipcRenderer.invoke("settings:set", settings)
});
electron.contextBridge.exposeInMainWorld("electronData", {
  getPath: () => electron.ipcRenderer.invoke("data:getPath"),
  // 收藏功能现在使用 IndexedDB，不再需要 IPC
  history: {
    load: () => electron.ipcRenderer.invoke("history:load"),
    save: (history) => electron.ipcRenderer.invoke("history:save", history)
  }
});
electron.contextBridge.exposeInMainWorld("electronFavorites", {
  export: (favorites) => electron.ipcRenderer.invoke("favorites:export", favorites),
  import: () => electron.ipcRenderer.invoke("favorites:import")
});
electron.contextBridge.exposeInMainWorld("electronSpeech", {
  speak: (word) => electron.ipcRenderer.invoke("speech:speak", word)
});
