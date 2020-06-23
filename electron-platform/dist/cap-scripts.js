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
          (exports.runTask = exports.resolveElectronPlugin = exports.resolvePlugin = exports.resolveNodeFrom = exports.writePrettyJSON = exports.resolveNode = exports.hashJsFileName = exports.fixName = exports.runExec = exports.readJSON = exports.getCwd = void 0);
        const e = require("path"),
          r = require("fs"),
          t = require("child_process"),
          o = require("crypto");
        function n() {
          return process.env.INIT_CWD;
        }
        function s(e) {
          const t = r.readFileSync(e, "utf8");
          return JSON.parse(t);
        }
        function i(e) {
          return new Promise((r, o) => {
            t.exec(e, (e, t, n) => {
              e ? o(t + n) : r(t);
            });
          });
        }
        function c(e) {
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
        function l(e, r) {
          return `${e}-${o
            .createHash("md5")
            .update(`${Date.now()}-${r}-${e}`)
            .digest("hex")}.js`;
        }
        function u(...r) {
          const t = r[0],
            o = r.slice(1);
          let s;
          const i = [n()];
          for (let e of i) if ((s = p(e, t))) break;
          return s ? e.join(s, ...o) : null;
        }
        function a(e, t) {
          return r.writeFileSync(e, JSON.stringify(t, null, "  ") + "\n");
        }
        function p(t, o) {
          const n = e.parse(t).root;
          let s,
            i = e.resolve(t);
          for (;;) {
            if (((s = e.join(i, "node_modules", o)), r.existsSync(s))) return s;
            if (i === n) return null;
            i = e.dirname(i);
          }
        }
        async function f(r) {
          try {
            const o = u(r);
            if (!o)
              return (
                console.error(
                  `Unable to find node_modules/${r}. Are you sure ${r} is installed?`
                ),
                null
              );
            const n = e.join(o, "package.json"),
              i = await s(n);
            if (!i) return null;
            if (i.capacitor)
              return {
                id: r,
                name: c(r),
                version: i.version,
                rootPath: o,
                repository: i.repository,
                manifest: i.capacitor,
              };
          } catch (t) {}
          return null;
        }
        function x(r) {
          return r.manifest && r.manifest.electron && r.manifest.electron.src
            ? e.join(r.rootPath, r.manifest.electron.src)
            : null;
        }
        async function d(e, r) {
          const t = require("ora")(e).start();
          try {
            const n = process.hrtime();
            let s;
            const i = await r((e) => (s = e)),
              c = process.hrtime(n),
              l = require("chalk");
            return (
              s
                ? t.info(`${e} ${l.dim("– " + s)}`)
                : t.succeed(`${e} ${l.dim("in " + h(c))}`),
              i
            );
          } catch (o) {
            throw (t.fail(`${e}: ${o.message ? o.message : ""}`), t.stop(), o);
          }
        }
        (exports.getCwd = n),
          (exports.readJSON = s),
          (exports.runExec = i),
          (exports.fixName = c),
          (exports.hashJsFileName = l),
          (exports.resolveNode = u),
          (exports.writePrettyJSON = a),
          (exports.resolveNodeFrom = p),
          (exports.resolvePlugin = f),
          (exports.resolveElectronPlugin = x),
          (exports.runTask = d);
        const m = ["s", "ms", "μp"];
        function h(e) {
          let r = e[0] + e[1] / 1e9,
            t = 0;
          for (; t < m.length - 1 && !(r >= 1); t++, r *= 1e3);
          return r.toFixed(2) + m[t];
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
          o = require("./common");
        async function t() {
          const t = e.join(o.getCwd(), "../", "../", "../");
          if (null === t) throw new Error("CWD ERROR");
          const s = await o.readJSON(e.join(t, "package.json")),
            i = s.dependencies ? s.dependencies : {},
            c = s.devDependencies ? s.devDependencies : {},
            l = Object.keys(i).concat(Object.keys(c));
          let a = await Promise.all(l.map(async (e) => o.resolvePlugin(e))),
            d = (a = a.filter((e) => !!e)).map((e) =>
              o.resolveElectronPlugin(e)
            );
          d = d.filter((e) => !!e);
          const p = e.join(t, "electron", "plugins");
          r.removeSync(p), n.mkdirSync(p);
          const u = [];
          for (let r = 0; r < d.length; r++) {
            const t = `${d[r]}`;
            let s = t.substr(t.lastIndexOf(e.sep) + 1);
            (s = o.hashJsFileName(s, r)),
              n.copyFileSync(n.realpathSync(t), e.join(p, s)),
              u.push(s);
          }
          let f =
            "require('./node_modules/@capacitor-community/electron-core/dist/electron-bridge.js');";
          for (const e of u) f += `require('./plugins/${e}');`;
          return (
            n.writeFileSync(e.join(t, "electron", "preloader.js"), f, {
              encoding: "utf8",
            }),
            u
          );
        }
        exports.doUpdate = t;
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
          o = require("path"),
          r = require("./common");
        function a() {
          const t = o.join(r.getCwd(), "../", "../", "../"),
            a = {
              errorText: null,
              usersProjectCapConfigPath: null,
              srcTemplatePath: null,
              destTemplatePath: null,
              webAppPath: null,
            },
            n = o.join(t, "capacitor.config.json"),
            i = o.join(__dirname, "../", "template"),
            s = o.join(t, "electron");
          if (e.existsSync(n)) {
            const c = r.readJSON(n);
            if (c.webDir) {
              const r = o.join(t, c.webDir);
              e.existsSync(r)
                ? e.existsSync(s)
                  ? (a.errorText = "Electron platform already exists.")
                  : ((a.destTemplatePath = s),
                    (a.srcTemplatePath = i),
                    (a.usersProjectCapConfigPath = n),
                    (a.webAppPath = r))
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
          if (null !== n.errorText) throw new Error(n.errorText);
          try {
            e.mkdirSync(n.destTemplatePath, { recursive: !0 }),
              t.copySync(n.srcTemplatePath, n.destTemplatePath),
              e.renameSync(
                o.join(n.destTemplatePath, "gitignore"),
                o.join(n.destTemplatePath, ".gitignore")
              ),
              t.copySync(
                n.usersProjectCapConfigPath,
                o.join(n.destTemplatePath, "capacitor.config.json")
              );
            const a = r.readJSON(
                o.join(n.destTemplatePath, "capacitor.config.json")
              ).appName,
              s = r.readJSON(o.join(n.destTemplatePath, "package.json"));
            (s.name = a),
              r.writePrettyJSON(o.join(n.destTemplatePath, "package.json"), s),
              t.copySync(n.webAppPath, o.join(n.destTemplatePath, "app")),
              await r.runExec(`cd ${n.destTemplatePath} && npm i`);
          } catch (i) {
            throw i;
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
          o = require("fs-extra"),
          t = require("./common"),
          r = require("path");
        function n() {
          const o = {
              errorText: null,
              usersProjectCapConfigPath: null,
              destTemplatePath: null,
              webAppPath: null,
            },
            n = r.join(t.getCwd(), "capacitor.config.json"),
            i = r.join(t.getCwd(), "electron");
          if (n) {
            const s = t.readJSON(n);
            if (s.webDir) {
              const c = r.join(t.getCwd(), s.webDir);
              e.existsSync(c)
                ? e.existsSync(i)
                  ? ((o.destTemplatePath = i),
                    (o.usersProjectCapConfigPath = n),
                    (o.webAppPath = c))
                  : (o.errorText = "Electron platform not installed.")
                : (o.errorText =
                    "WebDir defined in capacitor.config.json does not exist, did you build your webapp?");
            } else o.errorText = "No webDir defined in capacitor.config.json.";
          } else
            o.errorText =
              "capacitor.config.json does not exist, did you setup capacitor in your project root?";
          return o;
        }
        async function i() {
          const t = n();
          if (null !== t.errorText) throw new Error(t.errorText);
          try {
            const n = r.join(t.destTemplatePath, "app");
            e.existsSync(n) && o.removeSync(n), o.copySync(t.webAppPath, n);
          } catch (i) {
            throw i;
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
