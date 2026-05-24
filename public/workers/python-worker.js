(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // node_modules/comlink/dist/esm/comlink.mjs
  function isAllowedOrigin(allowedOrigins, origin) {
    for (const allowedOrigin of allowedOrigins) {
      if (origin === allowedOrigin || allowedOrigin === "*") {
        return true;
      }
      if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
        return true;
      }
    }
    return false;
  }
  function expose(obj, ep = globalThis, allowedOrigins = ["*"]) {
    ep.addEventListener("message", function callback(ev) {
      if (!ev || !ev.data) {
        return;
      }
      if (!isAllowedOrigin(allowedOrigins, ev.origin)) {
        console.warn(`Invalid origin '${ev.origin}' for comlink proxy`);
        return;
      }
      const { id, type, path } = Object.assign({ path: [] }, ev.data);
      const argumentList = (ev.data.argumentList || []).map(fromWireValue);
      let returnValue;
      try {
        const parent = path.slice(0, -1).reduce((obj2, prop) => obj2[prop], obj);
        const rawValue = path.reduce((obj2, prop) => obj2[prop], obj);
        switch (type) {
          case "GET":
            {
              returnValue = rawValue;
            }
            break;
          case "SET":
            {
              parent[path.slice(-1)[0]] = fromWireValue(ev.data.value);
              returnValue = true;
            }
            break;
          case "APPLY":
            {
              returnValue = rawValue.apply(parent, argumentList);
            }
            break;
          case "CONSTRUCT":
            {
              const value = new rawValue(...argumentList);
              returnValue = proxy(value);
            }
            break;
          case "ENDPOINT":
            {
              const { port1, port2 } = new MessageChannel();
              expose(obj, port2);
              returnValue = transfer(port1, [port1]);
            }
            break;
          case "RELEASE":
            {
              returnValue = void 0;
            }
            break;
          default:
            return;
        }
      } catch (value) {
        returnValue = { value, [throwMarker]: 0 };
      }
      Promise.resolve(returnValue).catch((value) => {
        return { value, [throwMarker]: 0 };
      }).then((returnValue2) => {
        const [wireValue, transferables] = toWireValue(returnValue2);
        ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
        if (type === "RELEASE") {
          ep.removeEventListener("message", callback);
          closeEndPoint(ep);
          if (finalizer in obj && typeof obj[finalizer] === "function") {
            obj[finalizer]();
          }
        }
      }).catch((error) => {
        const [wireValue, transferables] = toWireValue({
          value: new TypeError("Unserializable return value"),
          [throwMarker]: 0
        });
        ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
      });
    });
    if (ep.start) {
      ep.start();
    }
  }
  function isMessagePort(endpoint) {
    return endpoint.constructor.name === "MessagePort";
  }
  function closeEndPoint(endpoint) {
    if (isMessagePort(endpoint))
      endpoint.close();
  }
  function wrap(ep, target) {
    const pendingListeners = /* @__PURE__ */ new Map();
    ep.addEventListener("message", function handleMessage(ev) {
      const { data } = ev;
      if (!data || !data.id) {
        return;
      }
      const resolver = pendingListeners.get(data.id);
      if (!resolver) {
        return;
      }
      try {
        resolver(data);
      } finally {
        pendingListeners.delete(data.id);
      }
    });
    return createProxy(ep, pendingListeners, [], target);
  }
  function throwIfProxyReleased(isReleased) {
    if (isReleased) {
      throw new Error("Proxy has been released and is not useable");
    }
  }
  function releaseEndpoint(ep) {
    return requestResponseMessage(ep, /* @__PURE__ */ new Map(), {
      type: "RELEASE"
    }).then(() => {
      closeEndPoint(ep);
    });
  }
  function registerProxy(proxy2, ep) {
    const newCount = (proxyCounter.get(ep) || 0) + 1;
    proxyCounter.set(ep, newCount);
    if (proxyFinalizers) {
      proxyFinalizers.register(proxy2, ep, proxy2);
    }
  }
  function unregisterProxy(proxy2) {
    if (proxyFinalizers) {
      proxyFinalizers.unregister(proxy2);
    }
  }
  function createProxy(ep, pendingListeners, path = [], target = function() {
  }) {
    let isProxyReleased = false;
    const proxy2 = new Proxy(target, {
      get(_target, prop) {
        throwIfProxyReleased(isProxyReleased);
        if (prop === releaseProxy) {
          return () => {
            unregisterProxy(proxy2);
            releaseEndpoint(ep);
            pendingListeners.clear();
            isProxyReleased = true;
          };
        }
        if (prop === "then") {
          if (path.length === 0) {
            return { then: () => proxy2 };
          }
          const r = requestResponseMessage(ep, pendingListeners, {
            type: "GET",
            path: path.map((p) => p.toString())
          }).then(fromWireValue);
          return r.then.bind(r);
        }
        return createProxy(ep, pendingListeners, [...path, prop]);
      },
      set(_target, prop, rawValue) {
        throwIfProxyReleased(isProxyReleased);
        const [value, transferables] = toWireValue(rawValue);
        return requestResponseMessage(ep, pendingListeners, {
          type: "SET",
          path: [...path, prop].map((p) => p.toString()),
          value
        }, transferables).then(fromWireValue);
      },
      apply(_target, _thisArg, rawArgumentList) {
        throwIfProxyReleased(isProxyReleased);
        const last = path[path.length - 1];
        if (last === createEndpoint) {
          return requestResponseMessage(ep, pendingListeners, {
            type: "ENDPOINT"
          }).then(fromWireValue);
        }
        if (last === "bind") {
          return createProxy(ep, pendingListeners, path.slice(0, -1));
        }
        const [argumentList, transferables] = processArguments(rawArgumentList);
        return requestResponseMessage(ep, pendingListeners, {
          type: "APPLY",
          path: path.map((p) => p.toString()),
          argumentList
        }, transferables).then(fromWireValue);
      },
      construct(_target, rawArgumentList) {
        throwIfProxyReleased(isProxyReleased);
        const [argumentList, transferables] = processArguments(rawArgumentList);
        return requestResponseMessage(ep, pendingListeners, {
          type: "CONSTRUCT",
          path: path.map((p) => p.toString()),
          argumentList
        }, transferables).then(fromWireValue);
      }
    });
    registerProxy(proxy2, ep);
    return proxy2;
  }
  function myFlat(arr) {
    return Array.prototype.concat.apply([], arr);
  }
  function processArguments(argumentList) {
    const processed = argumentList.map(toWireValue);
    return [processed.map((v) => v[0]), myFlat(processed.map((v) => v[1]))];
  }
  function transfer(obj, transfers) {
    transferCache.set(obj, transfers);
    return obj;
  }
  function proxy(obj) {
    return Object.assign(obj, { [proxyMarker]: true });
  }
  function toWireValue(value) {
    for (const [name, handler] of transferHandlers) {
      if (handler.canHandle(value)) {
        const [serializedValue, transferables] = handler.serialize(value);
        return [
          {
            type: "HANDLER",
            name,
            value: serializedValue
          },
          transferables
        ];
      }
    }
    return [
      {
        type: "RAW",
        value
      },
      transferCache.get(value) || []
    ];
  }
  function fromWireValue(value) {
    switch (value.type) {
      case "HANDLER":
        return transferHandlers.get(value.name).deserialize(value.value);
      case "RAW":
        return value.value;
    }
  }
  function requestResponseMessage(ep, pendingListeners, msg, transfers) {
    return new Promise((resolve) => {
      const id = generateUUID();
      pendingListeners.set(id, resolve);
      if (ep.start) {
        ep.start();
      }
      ep.postMessage(Object.assign({ id }, msg), transfers);
    });
  }
  function generateUUID() {
    return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
  }
  var proxyMarker, createEndpoint, releaseProxy, finalizer, throwMarker, isObject, proxyTransferHandler, throwTransferHandler, transferHandlers, proxyCounter, proxyFinalizers, transferCache;
  var init_comlink = __esm({
    "node_modules/comlink/dist/esm/comlink.mjs"() {
      proxyMarker = /* @__PURE__ */ Symbol("Comlink.proxy");
      createEndpoint = /* @__PURE__ */ Symbol("Comlink.endpoint");
      releaseProxy = /* @__PURE__ */ Symbol("Comlink.releaseProxy");
      finalizer = /* @__PURE__ */ Symbol("Comlink.finalizer");
      throwMarker = /* @__PURE__ */ Symbol("Comlink.thrown");
      isObject = (val) => typeof val === "object" && val !== null || typeof val === "function";
      proxyTransferHandler = {
        canHandle: (val) => isObject(val) && val[proxyMarker],
        serialize(obj) {
          const { port1, port2 } = new MessageChannel();
          expose(obj, port1);
          return [port2, [port2]];
        },
        deserialize(port) {
          port.start();
          return wrap(port);
        }
      };
      throwTransferHandler = {
        canHandle: (value) => isObject(value) && throwMarker in value,
        serialize({ value }) {
          let serialized;
          if (value instanceof Error) {
            serialized = {
              isError: true,
              value: {
                message: value.message,
                name: value.name,
                stack: value.stack
              }
            };
          } else {
            serialized = { isError: false, value };
          }
          return [serialized, []];
        },
        deserialize(serialized) {
          if (serialized.isError) {
            throw Object.assign(new Error(serialized.value.message), serialized.value);
          }
          throw serialized.value;
        }
      };
      transferHandlers = /* @__PURE__ */ new Map([
        ["proxy", proxyTransferHandler],
        ["throw", throwTransferHandler]
      ]);
      proxyCounter = /* @__PURE__ */ new WeakMap();
      proxyFinalizers = "FinalizationRegistry" in globalThis && new FinalizationRegistry((ep) => {
        const newCount = (proxyCounter.get(ep) || 0) - 1;
        proxyCounter.set(ep, newCount);
        if (newCount === 0) {
          releaseEndpoint(ep);
        }
      });
      transferCache = /* @__PURE__ */ new WeakMap();
    }
  });

  // node_modules/react-py/dist/workers/python-worker.js
  var require_python_worker = __commonJS({
    "node_modules/react-py/dist/workers/python-worker.js"(exports) {
      init_comlink();
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      var __generator = exports && exports.__generator || function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1) throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
        return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n) {
          return function(v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                _.label++;
                return { value: op[1], done: false };
              case 5:
                _.label++;
                y = op[1];
                op = [0];
                continue;
              case 7:
                op = _.ops.pop();
                _.trys.pop();
                continue;
              default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1];
                  t = op;
                  break;
                }
                if (t && _.label < t[2]) {
                  _.label = t[2];
                  _.ops.push(op);
                  break;
                }
                if (t[2]) _.ops.pop();
                _.trys.pop();
                continue;
            }
            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e];
            y = 0;
          } finally {
            f = t = 0;
          }
          if (op[0] & 5) throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
      };
      var __values = exports && exports.__values || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
          next: function() {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
          }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      };
      var __read = exports && exports.__read || function(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        } catch (error) {
          e = { error };
        } finally {
          try {
            if (r && !r.done && (m = i["return"])) m.call(i);
          } finally {
            if (e) throw e.error;
          }
        }
        return ar;
      };
      importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");
      if (self.location.hostname !== "localhost") {
        console.log = function() {
        };
        console.error = function() {
        };
      }
      var pythonConsole;
      var reactPyModule = {
        getInput: function(id, prompt) {
          var request = new XMLHttpRequest();
          request.open("GET", "/react-py-get-input/?id=".concat(id, "&prompt=").concat(encodeURIComponent(prompt)), false);
          request.send(null);
          return request.responseText;
        }
      };
      var patchInputCode = function(id) {
        return '\nimport sys, builtins\nimport react_py\n__prompt_str__ = ""\ndef get_input(prompt=""):\n    global __prompt_str__\n    __prompt_str__ = prompt\n    print(prompt, end="")\n    s = react_py.getInput("'.concat(id, '", prompt)\n    print()\n    return s\nbuiltins.input = get_input\nsys.stdin.readline = lambda: react_py.getInput("').concat(id, '", __prompt_str__)\n');
      };
      var python = {
        init: function(stdout, onLoad, mode, packages) {
          return __awaiter(this, void 0, void 0, function() {
            var _a, micropip, id, version, initCode, namespace, initConsoleCode, reprShorten, banner, awaitFut, pyconsole, clearConsole;
            return __generator(this, function(_b) {
              switch (_b.label) {
                case 0:
                  _a = self;
                  return [
                    4,
                    self.loadPyodide({ stdout })
                    // Enable debug mode
                    // self.pyodide.setDebug(true)
                    // Always load pyodide-http package
                  ];
                case 1:
                  _a.pyodide = _b.sent();
                  return [
                    4,
                    self.pyodide.loadPackage(["pyodide-http"])
                    // Load packages if provided
                  ];
                case 2:
                  _b.sent();
                  if (!(packages && packages[0].length > 0)) return [3, 4];
                  return [4, self.pyodide.loadPackage(packages[0])];
                case 3:
                  _b.sent();
                  _b.label = 4;
                case 4:
                  if (!(packages && packages[1].length > 0)) return [3, 7];
                  return [4, self.pyodide.loadPackage(["micropip"])];
                case 5:
                  _b.sent();
                  micropip = self.pyodide.pyimport("micropip");
                  return [4, micropip.install(packages[1])];
                case 6:
                  _b.sent();
                  _b.label = 7;
                case 7:
                  id = self.crypto.randomUUID();
                  version = self.pyodide.version;
                  self.pyodide.registerJsModule("react_py", reactPyModule);
                  initCode = "\nimport sys\nimport pyodide_http\n\nsys.tracebacklimit = 0\n\npyodide_http.patch_all()\n";
                  return [4, self.pyodide.runPythonAsync(initCode)];
                case 8:
                  _b.sent();
                  if (!(mode === "console")) return [3, 11];
                  namespace = self.pyodide.globals.get("dict")();
                  initConsoleCode = '\nimport sys\nfrom pyodide.ffi import to_js\nfrom pyodide.console import PyodideConsole, repr_shorten, BANNER\nimport __main__\nBANNER = "Welcome to the Pyodide terminal emulator \u{1F40D}\\n" + BANNER\npyconsole = PyodideConsole(__main__.__dict__)\nimport builtins\nasync def await_fut(fut):\n  res = await fut\n  if res is not None:\n    builtins._ = res\n  return to_js([res], depth=1)\ndef clear_console():\n  pyconsole.buffer = []\n';
                  return [4, self.pyodide.runPythonAsync(initConsoleCode, { globals: namespace })];
                case 9:
                  _b.sent();
                  reprShorten = namespace.get("repr_shorten");
                  banner = namespace.get("BANNER");
                  awaitFut = namespace.get("await_fut");
                  pyconsole = namespace.get("pyconsole");
                  clearConsole = namespace.get("clear_console");
                  pyconsole.stdout_callback = stdout;
                  pythonConsole = {
                    reprShorten,
                    awaitFut,
                    pyconsole,
                    clearConsole
                  };
                  return [4, self.pyodide.runPythonAsync(patchInputCode(id), {
                    globals: namespace
                  })];
                case 10:
                  _b.sent();
                  onLoad({ id, version, banner });
                  return [3, 13];
                case 11:
                  return [4, self.pyodide.runPythonAsync(patchInputCode(id))];
                case 12:
                  _b.sent();
                  onLoad({ id, version });
                  _b.label = 13;
                case 13:
                  return [
                    2
                    /*return*/
                  ];
              }
            });
          });
        },
        run: function(code, autoImportPackages) {
          return __awaiter(this, void 0, void 0, function() {
            var state, _a, _b, line, fut, wrapped, _c, value, error_1, message, e_1_1;
            var e_1, _d;
            return __generator(this, function(_e) {
              switch (_e.label) {
                case 0:
                  if (!autoImportPackages) return [3, 2];
                  return [4, self.pyodide.loadPackagesFromImports(code)];
                case 1:
                  _e.sent();
                  _e.label = 2;
                case 2:
                  if (!pythonConsole) return [3, 14];
                  if (!pythonConsole) {
                    throw new Error("Console has not been initialised");
                  }
                  if (code === void 0) {
                    throw new Error("No code to push");
                  }
                  state = void 0;
                  _e.label = 3;
                case 3:
                  _e.trys.push([3, 11, 12, 13]);
                  _a = __values(code.split("\n")), _b = _a.next();
                  _e.label = 4;
                case 4:
                  if (!!_b.done) return [3, 10];
                  line = _b.value;
                  fut = pythonConsole.pyconsole.push(line);
                  state = fut.syntax_check;
                  wrapped = pythonConsole.awaitFut(fut);
                  _e.label = 5;
                case 5:
                  _e.trys.push([5, 7, 8, 9]);
                  return [4, wrapped];
                case 6:
                  _c = __read.apply(void 0, [_e.sent(), 1]), value = _c[0];
                  if (value instanceof self.pyodide.ffi.PyProxy) {
                    value.destroy();
                  }
                  return [3, 9];
                case 7:
                  error_1 = _e.sent();
                  if (error_1.constructor.name === "PythonError") {
                    message = fut.formatted_error || error_1.message;
                    return [2, { state, error: message.trimEnd() }];
                  } else {
                    throw error_1;
                  }
                  return [3, 9];
                case 8:
                  fut.destroy();
                  wrapped.destroy();
                  return [
                    7
                    /*endfinally*/
                  ];
                case 9:
                  _b = _a.next();
                  return [3, 4];
                case 10:
                  return [3, 13];
                case 11:
                  e_1_1 = _e.sent();
                  e_1 = { error: e_1_1 };
                  return [3, 13];
                case 12:
                  try {
                    if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                  } finally {
                    if (e_1) throw e_1.error;
                  }
                  return [
                    7
                    /*endfinally*/
                  ];
                case 13:
                  return [2, { state }];
                case 14:
                  return [4, self.pyodide.runPythonAsync(code)];
                case 15:
                  _e.sent();
                  _e.label = 16;
                case 16:
                  return [
                    2
                    /*return*/
                  ];
              }
            });
          });
        },
        readFile: function(name) {
          return self.pyodide.FS.readFile(name, { encoding: "utf8" });
        },
        writeFile: function(name, data) {
          return self.pyodide.FS.writeFile(name, data, { encoding: "utf8" });
        },
        mkdir: function(name) {
          self.pyodide.FS.mkdir(name);
        },
        rmdir: function(name) {
          self.pyodide.FS.rmdir(name);
        }
      };
      expose(python);
    }
  });
  require_python_worker();
})();
/*! Bundled license information:

comlink/dist/esm/comlink.mjs:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
