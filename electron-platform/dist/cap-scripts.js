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
          (exports.runTask = exports.resolveElectronPlugin = exports.resolvePlugin = exports.resolveNodeFrom = exports.resolveNode = exports.hashJsFileName = exports.fixName = exports.runExec = exports.readJSON = exports.getCwd = void 0);
        const e = require("path"),
          r = require("fs"),
          t = require("child_process"),
          o = require("crypto");
        function s() {
          return process.env.INIT_CWD;
        }
        function n(e) {
          const t = r.readFileSync(e, "utf8");
          return JSON.parse(t);
        }
        function i(e) {
          return new Promise((r, o) => {
            t.exec(e, (e, t, s) => {
              e ? o(t + s) : r(t);
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
        function a(e, r) {
          return `${e}-${o
            .createHash("md5")
            .update(`${Date.now()}-${r}-${e}`)
            .digest("hex")}.js`;
        }
        function l(...r) {
          const t = r[0],
            o = r.slice(1);
          let n;
          const i = [s()];
          for (let e of i) if ((n = u(e, t))) break;
          return n ? e.join(n, ...o) : null;
        }
        function u(t, o) {
          const s = e.parse(t).root;
          let n,
            i = e.resolve(t);
          for (;;) {
            if (((n = e.join(i, "node_modules", o)), r.existsSync(n))) return n;
            if (i === s) return null;
            i = e.dirname(i);
          }
        }
        async function p(r) {
          try {
            const o = l(r);
            if (!o)
              return (
                console.error(
                  `Unable to find node_modules/${r}. Are you sure ${r} is installed?`
                ),
                null
              );
            const s = e.join(o, "package.json"),
              i = await n(s);
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
        function f(r) {
          return r.manifest && r.manifest.electron && r.manifest.electron.src
            ? e.join(r.rootPath, r.manifest.electron.src)
            : null;
        }
        async function x(e, r) {
          const t = require("ora")(e).start();
          try {
            const s = process.hrtime();
            let n;
            const i = await r((e) => (n = e)),
              c = process.hrtime(s),
              a = require("chalk");
            return (
              n
                ? t.info(`${e} ${a.dim("– " + n)}`)
                : t.succeed(`${e} ${a.dim("in " + m(c))}`),
              i
            );
          } catch (o) {
            throw (t.fail(`${e}: ${o.message ? o.message : ""}`), t.stop(), o);
          }
        }
        (exports.getCwd = s),
          (exports.readJSON = n),
          (exports.runExec = i),
          (exports.fixName = c),
          (exports.hashJsFileName = a),
          (exports.resolveNode = l),
          (exports.resolveNodeFrom = u),
          (exports.resolvePlugin = p),
          (exports.resolveElectronPlugin = f),
          (exports.runTask = x);
        const d = ["s", "ms", "μp"];
        function m(e) {
          let r = e[0] + e[1] / 1e9,
            t = 0;
          for (; t < d.length - 1 && !(r >= 1); t++, r *= 1e3);
          return r.toFixed(2) + d[t];
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
        function n() {
          const t = {
              errorText: null,
              usersProjectCapConfigPath: null,
              srcTemplatePath: null,
              destTemplatePath: null,
              webAppPath: null,
            },
            n = r.join(
              o.getCwd(),
              "../",
              "../",
              "../",
              "capacitor.config.json"
            ),
            a = r.join(__dirname, "../", "template"),
            i = r.join(o.getCwd(), "electron");
          if (n) {
            const c = o.readJSON(n);
            if (c.webDir) {
              const s = r.join(o.getCwd(), c.webDir);
              e.existsSync(s)
                ? e.existsSync(i)
                  ? (t.errorText = "Electron platform already exists.")
                  : ((t.destTemplatePath = i),
                    (t.srcTemplatePath = a),
                    (t.usersProjectCapConfigPath = n),
                    (t.webAppPath = s))
                : (t.errorText =
                    "WebDir defined in capacitor.config.json does not exist, did you build your webapp?");
            } else t.errorText = "No webDir defined in capacitor.config.json.";
          } else
            t.errorText =
              "capacitor.config.json does not exist, did you setup capacitor in your project root?";
          return t;
        }
        async function a() {
          const a = n();
          if (null !== a.errorText) throw new Error(a.errorText);
          try {
            e.mkdirSync(a.destTemplatePath, { recursive: !0 }),
              t.copySync(a.srcTemplatePath, a.destTemplatePath),
              e.renameSync(
                r.join(a.destTemplatePath, "gitignore"),
                r.join(a.destTemplatePath, ".gitignore")
              ),
              t.copySync(
                a.usersProjectCapConfigPath,
                r.join(a.destTemplatePath, "capacitor.config.json")
              ),
              t.copySync(a.webAppPath, r.join(a.destTemplatePath, "app")),
              await o.runExec(`cd ${a.destTemplatePath} && npm i`);
          } catch (i) {
            throw i;
          }
        }
        exports.doAdd = a;
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
        const a = require("fs"),
          e = require("path"),
          r = require("./common"),
          t = require("./update"),
          n = require("./add"),
          i = require("./copy");
        async function s() {
          return await r.runTask(
            "Updating Electron plugins",
            async () => await t.doUpdate()
          );
        }
        async function o() {
          return await r.runTask(
            "Adding Electron platform",
            async () => await n.doAdd()
          );
        }
        async function c() {
          return await r.runTask(
            "Copying Web App to Electron platform",
            async () => await i.doCopy()
          );
        }
        (async () => {
          const r = process.argv[2] ? process.argv[2] : null;
          if (null === r) throw new Error(`Invalid script chosen: ${r}`);
          switch (r) {
            case "add":
              a.existsSync(e.join(__dirname, "../", ".no-dev-postinstall")) ||
                (await o(), await s());
              break;
            case "copy":
              await c();
              break;
            case "update":
              await s();
              break;
            case "sync":
              await c(), await s();
              break;
            default:
              throw new Error(`Invalid script chosen: ${r}`);
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
