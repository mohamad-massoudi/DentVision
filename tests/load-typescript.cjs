/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

module.exports = function loadTypescript(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(code, {
    module: mod, exports: mod.exports,
    require: name => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    Buffer, console, URL, Request, Response, AbortController, Intl, Date, TextEncoder, TextDecoder,
    crypto: require("node:crypto").webcrypto,
    process: { env: { AUTH_SECRET: "test-only-secret-that-is-at-least-32-characters" } },
  }, { filename: file });
  return mod.exports;
};
