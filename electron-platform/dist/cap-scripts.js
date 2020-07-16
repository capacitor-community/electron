parcelRequire = (function (e, r, t, n) {
  var i,
    o = "function" == typeof parcelRequire && parcelRequire,
    u = "function" == typeof require && require;
  function f(t, n) {
    if (!r[t]) {
      if (!e[t]) {
        var i = "function" == typeof parcelRequire && parcelRequire;
        if (!n && i) return i(t, !0);
        if (o) return o(t, !0);
        if (u && "string" == typeof t) return u(t);
        var c = new Error("Cannot find module '" + t + "'");
        throw ((c.code = "MODULE_NOT_FOUND"), c);
      }
      (p.resolve = function (r) {
        return e[t][1][r] || r;
      }),
        (p.cache = {});
      var l = (r[t] = new f.Module(t));
      e[t][0].call(l.exports, p, l, l.exports, this);
    }
    return r[t].exports;
    function p(e) {
      return f(p.resolve(e));
    }
  }
  (f.isParcelRequire = !0),
    (f.Module = function (e) {
      (this.id = e), (this.bundle = f), (this.exports = {});
    }),
    (f.modules = e),
    (f.cache = r),
    (f.parent = o),
    (f.register = function (r, t) {
      e[r] = [
        function (e, r) {
          r.exports = t;
        },
        {},
      ];
    });
  for (var c = 0; c < t.length; c++)
    try {
      f(t[c]);
    } catch (e) {
      i || (i = e);
    }
  if (t.length) {
    var l = f(t[t.length - 1]);
    "object" == typeof exports && "undefined" != typeof module
      ? (module.exports = l)
      : "function" == typeof define && define.amd
      ? define(function () {
          return l;
        })
      : n && (this[n] = l);
  }
  if (((parcelRequire = f), i)) throw i;
  return f;
})(
  {
    FoEN: [
      function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: !0 }),
          (exports.runTask = exports.resolveElectronPlugin = exports.resolvePlugin = exports.resolveNodeFrom = exports.writePrettyJSON = exports.resolveNode = exports.hashJsFileName = exports.fixName = exports.runExec = exports.readJSON = exports.getCwd = exports.errorLog = void 0);
        const e = require("path"),
          r = require("fs"),
          t = require("child_process"),
          o = require("crypto"),
          n = require("chalk");
        function s(e) {
          console.log(n.red(`Error: ${e}`));
        }
        function i() {
          const r = process.env.PWD;
          return e.join(r, "../", "../", "../");
        }
        function c(e) {
          const t = r.readFileSync(e, "utf8");
          return JSON.parse(t);
        }
        function l(e) {
          return new Promise((r, o) => {
            t.exec(e, (e, t, n) => {
              e ? o(t + n) : r(t);
            });
          });
        }
        function u(e) {
          return (
            (e = e
              .replace(/\//g, "_")
              .replace(/-/g, "_")
              .replace(/@/g, "")
              .replace(/_\w/g, (e) => e[1].toUpperCase()))
              .charAt(0)
              .toUpperCase() + e.slice(1)
          );
        }
        function a(e, r) {
          return `${e}-${o
            .createHash("md5")
            .update(`${Date.now()}-${r}-${e}`)
            .digest("hex")}.js`;
        }
        function p(...r) {
          const t = r[0],
            o = r.slice(1);
          let n;
          const s = [i()];
          for (let e of s) if ((n = x(e, t))) break;
          return n ? e.join(n, ...o) : null;
        }
        function f(e, t) {
          return r.writeFileSync(e, JSON.stringify(t, null, "  ") + "\n");
        }
        function x(t, o) {
          const n = e.parse(t).root;
          let s,
            i = e.resolve(t);
          for (;;) {
            if (((s = e.join(i, "node_modules", o)), r.existsSync(s))) return s;
            if (i === n) return null;
            i = e.dirname(i);
          }
        }
        async function d(r) {
          try {
            const o = p(r);
            if (!o)
              return (
                console.error(
                  `Unable to find node_modules/${r}. Are you sure ${r} is installed?`
                ),
                null
              );
            const n = e.join(o, "package.json"),
              s = await c(n);
            if (!s) return null;
            if (s.capacitor)
              return {
                id: r,
                name: u(r),
                version: s.version,
                rootPath: o,
                repository: s.repository,
                manifest: s.capacitor,
              };
          } catch (t) {}
          return null;
        }
        function m(r) {
          return r.manifest && r.manifest.electron && r.manifest.electron.src
            ? e.join(r.rootPath, r.manifest.electron.src)
            : null;
        }
        async function g(e, r) {
          const t = require("ora"),
            o = require("chalk"),
            n = t(e).start();
          try {
            const t = process.hrtime();
            let i;
            const c = await r((e) => (i = e)),
              l = process.hrtime(t);
            return (
              i
                ? n.info(`${e} ${o.dim("– " + i)}`)
                : n.succeed(`${e} ${o.dim("in " + y(l))}`),
              c
            );
          } catch (s) {
            throw (n.fail(`${e}: ${s.message ? s.message : ""}`), n.stop(), s);
          }
        }
        (exports.errorLog = s),
          (exports.getCwd = i),
          (exports.readJSON = c),
          (exports.runExec = l),
          (exports.fixName = u),
          (exports.hashJsFileName = a),
          (exports.resolveNode = p),
          (exports.writePrettyJSON = f),
          (exports.resolveNodeFrom = x),
          (exports.resolvePlugin = d),
          (exports.resolveElectronPlugin = m),
          (exports.runTask = g);
        const h = ["s", "ms", "μp"];
        function y(e) {
          let r = e[0] + e[1] / 1e9,
            t = 0;
          for (; t < h.length - 1 && !(r >= 1); t++, r *= 1e3);
          return r.toFixed(2) + h[t];
        }
      },
      {},
    ],
    lx7y: [
      function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: !0 }),
          (exports.doUpdate = void 0);
        const e = require("path"),
          n = require("fs"),
          r = require("fs-extra"),
          t = require("./common");
        async function o() {
          const o = t.getCwd();
          if (null === o) throw new Error("CWD ERROR");
          const s = await t.readJSON(e.join(o, "package.json")),
            c = s.dependencies ? s.dependencies : {},
            i = s.devDependencies ? s.devDependencies : {},
            l = Object.keys(c).concat(Object.keys(i));
          let a = await Promise.all(l.map(async (e) => t.resolvePlugin(e))),
            d = (a = a.filter((e) => !!e)).map((e) =>
              t.resolveElectronPlugin(e)
            );
          d = d.filter((e) => !!e);
          const p = e.join(o, "electron", "plugins");
          r.removeSync(p), n.mkdirSync(p);
          const u = [];
          for (let r = 0; r < d.length; r++) {
            const o = `${d[r]}`;
            let s = o.substr(o.lastIndexOf(e.sep) + 1);
            (s = t.hashJsFileName(s, r)),
              n.copyFileSync(n.realpathSync(o), e.join(p, s)),
              u.push(s);
          }
          let f =
            "require('./node_modules/@capacitor-community/electron-core/dist/electron-bridge.js');";
          for (const e of u) f += `require('./plugins/${e}');`;
          return (
            n.writeFileSync(e.join(o, "electron", "preloader.js"), f, {
              encoding: "utf8",
            }),
            u
          );
        }
        exports.doUpdate = o;
      },
      { "./common": "FoEN" },
    ],
    cMRE: [
      function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: !0 }),
          (exports.doAdd = void 0);
        const e = require("fs"),
          t = require("fs-extra"),
          r = require("path"),
          o = require("./common");
        function a() {
          const t = o.getCwd(),
            a = {
              errorText: null,
              usersProjectCapConfigPath: null,
              srcTemplatePath: null,
              destTemplatePath: null,
              webAppPath: null,
            },
            n = r.join(t, "capacitor.config.json"),
            i = r.join(__dirname, "../", "template"),
            s = r.join(t, "electron");
          if (e.existsSync(n)) {
            const c = o.readJSON(n);
            if (c.webDir) {
              const o = r.join(t, c.webDir);
              e.existsSync(o)
                ? e.existsSync(s)
                  ? (a.errorText = "Electron platform already exists.")
                  : ((a.destTemplatePath = s),
                    (a.srcTemplatePath = i),
                    (a.usersProjectCapConfigPath = n),
                    (a.webAppPath = o))
                : (a.errorText =
                    "WebDir defined in capacitor.config.json does not exist, did you build your webapp?");
            } else a.errorText = "No webDir defined in capacitor.config.json.";
          } else
            a.errorText =
              "capacitor.config.json does not exist, did you setup capacitor in your project root?";
          return a;
        }
        async function n() {
          const n = a();
          if (null !== n.errorText)
            throw (o.errorLog(n.errorText), new Error(n.errorText));
          try {
            e.mkdirSync(n.destTemplatePath, { recursive: !0 }),
              t.copySync(n.srcTemplatePath, n.destTemplatePath),
              e.renameSync(
                r.join(n.destTemplatePath, "gitignore"),
                r.join(n.destTemplatePath, ".gitignore")
              ),
              t.copySync(
                n.usersProjectCapConfigPath,
                r.join(n.destTemplatePath, "capacitor.config.json")
              );
            const a = o.readJSON(
                r.join(n.destTemplatePath, "capacitor.config.json")
              ).appName,
              s = o.readJSON(r.join(n.destTemplatePath, "package.json"));
            (s.name = a),
              o.writePrettyJSON(r.join(n.destTemplatePath, "package.json"), s),
              t.copySync(n.webAppPath, r.join(n.destTemplatePath, "app")),
              await o.runExec(`cd ${n.destTemplatePath} && npm i`);
          } catch (i) {
            throw (o.errorLog(i.message), i);
          }
        }
        exports.doAdd = n;
      },
      { "./common": "FoEN" },
    ],
    iozI: [
      function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: !0 }),
          (exports.doCopy = void 0);
        const e = require("fs"),
          r = require("fs-extra"),
          o = require("./common"),
          t = require("path");
        function n() {
          const r = {
              errorText: null,
              usersProjectCapConfigPath: null,
              destTemplatePath: null,
              webAppPath: null,
            },
            n = t.join(o.getCwd(), "capacitor.config.json"),
            i = t.join(o.getCwd(), "electron");
          if (n) {
            const s = o.readJSON(n);
            if (s.webDir) {
              const c = t.join(o.getCwd(), s.webDir);
              e.existsSync(c)
                ? e.existsSync(i)
                  ? ((r.destTemplatePath = i),
                    (r.usersProjectCapConfigPath = n),
                    (r.webAppPath = c))
                  : (r.errorText = "Electron platform not installed.")
                : (r.errorText =
                    "WebDir defined in capacitor.config.json does not exist, did you build your webapp?");
            } else r.errorText = "No webDir defined in capacitor.config.json.";
          } else
            r.errorText =
              "capacitor.config.json does not exist, did you setup capacitor in your project root?";
          return r;
        }
        async function i() {
          const i = n();
          if (null !== i.errorText)
            throw (o.errorLog(i.errorText), new Error(i.errorText));
          try {
            const n = t.join(i.destTemplatePath, "app");
            e.existsSync(n) && r.removeSync(n), r.copySync(i.webAppPath, n);
          } catch (s) {
            throw (o.errorLog(s.message), s);
          }
        }
        exports.doCopy = i;
      },
      { "./common": "FoEN" },
    ],
    Focm: [
      function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: !0 });
        const a = require("./common"),
          r = require("./update"),
          e = require("./add"),
          t = require("./copy");
        async function n() {
          return await a.runTask(
            "Updating Electron plugins",
            async () => await r.doUpdate()
          );
        }
        async function c() {
          return await a.runTask(
            "Adding Electron platform",
            async () => await e.doAdd()
          );
        }
        async function i() {
          return await a.runTask(
            "Copying Web App to Electron platform",
            async () => await t.doCopy()
          );
        }
        (async () => {
          const a = process.argv[2] ? process.argv[2] : null;
          if (null === a) throw new Error(`Invalid script chosen: ${a}`);
          switch (a) {
            case "add":
              await c(), await n();
              break;
            case "copy":
              await i();
              break;
            case "update":
              await n();
              break;
            case "sync":
              await i(), await n();
              break;
            default:
              throw new Error(`Invalid script chosen: ${a}`);
          }
        })();
      },
      {
        "./common": "FoEN",
        "./update": "lx7y",
        "./add": "cMRE",
        "./copy": "iozI",
      },
    ],
  },
  {},
  ["Focm"],
  null
);
