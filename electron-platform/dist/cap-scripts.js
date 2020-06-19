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
        Object.defineProperty(exports, "__esModule", { value: !0 });
        const e = require("path"),
          r = require("fs"),
          t = require("child_process"),
          n = require("crypto");
        function o() {
          return process.env.INIT_CWD;
        }
        function s(e) {
          const t = r.readFileSync(e, "utf8");
          return JSON.parse(t);
        }
        function i(e) {
          return new Promise((r, n) => {
            t.exec(e, (e, t, o) => {
              e ? n(t + o) : r(t);
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
          return `${e}-${n
            .createHash("md5")
            .update(`${Date.now()}-${r}-${e}`)
            .digest("hex")}.js`;
        }
        function u(...r) {
          const t = r[0],
            n = r.slice(1);
          let s;
          const i = [o()];
          for (let e of i) if ((s = l(e, t))) break;
          return s ? e.join(s, ...n) : null;
        }
        function l(t, n) {
          const o = e.parse(t).root;
          let s,
            i = e.resolve(t);
          for (;;) {
            if (((s = e.join(i, "node_modules", n)), r.existsSync(s))) return s;
            if (i === o) return null;
            i = e.dirname(i);
          }
        }
        async function p(r) {
          try {
            const n = u(r);
            if (!n)
              return (
                console.error(
                  `Unable to find node_modules/${r}. Are you sure ${r} is installed?`
                ),
                null
              );
            const o = e.join(n, "package.json"),
              i = await s(o);
            if (!i) return null;
            if (i.capacitor)
              return {
                id: r,
                name: c(r),
                version: i.version,
                rootPath: n,
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
        async function d(e, r) {
          const t = require("ora")(e).start();
          try {
            const o = process.hrtime();
            let s;
            const i = await r((e) => (s = e)),
              c = process.hrtime(o),
              a = require("chalk");
            return (
              s
                ? t.info(`${e} ${a.dim("– " + s)}`)
                : t.succeed(`${e} ${a.dim("in " + x(c))}`),
              i
            );
          } catch (n) {
            throw (t.fail(`${e}: ${n.message ? n.message : ""}`), t.stop(), n);
          }
        }
        (exports.getCwd = o),
          (exports.readJSON = s),
          (exports.runExec = i),
          (exports.fixName = c),
          (exports.hashJsFileName = a),
          (exports.resolveNode = u),
          (exports.resolveNodeFrom = l),
          (exports.resolvePlugin = p),
          (exports.resolveElectronPlugin = f),
          (exports.runTask = d);
        const m = ["s", "ms", "μp"];
        function x(e) {
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
        Object.defineProperty(exports, "__esModule", { value: !0 });
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
          const u = e.join(o, "electron", "plugins");
          r.removeSync(u), n.mkdirSync(u);
          const p = [];
          for (let r = 0; r < d.length; r++) {
            const o = `${d[r]}`;
            let s = o.substr(o.lastIndexOf(e.sep) + 1);
            (s = t.hashJsFileName(s, r)),
              n.copyFileSync(n.realpathSync(o), e.join(u, s)),
              p.push(s);
          }
          let f =
            "require('./node_modules/@capacitor-community/electron-core/dist/electron-bridge.js');";
          for (const e of p) f += `require('./plugins/${e}');`;
          return (
            n.writeFileSync(e.join(o, "electron", "preloader.js"), f, {
              encoding: "utf8",
            }),
            p
          );
        }
        exports.doUpdate = o;
      },
      { "./common": "FoEN" },
    ],
    cMRE: [
      function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: !0 });
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
            n = r.join(o.getCwd(), "capacitor.config.json"),
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
        Object.defineProperty(exports, "__esModule", { value: !0 });
        const e = require("fs"),
          t = require("fs-extra"),
          o = require("./common"),
          r = require("path");
        function n() {
          const t = {
              errorText: null,
              usersProjectCapConfigPath: null,
              destTemplatePath: null,
              webAppPath: null,
            },
            n = r.join(o.getCwd(), "capacitor.config.json"),
            i = r.join(o.getCwd(), "electron");
          if (n) {
            const c = o.readJSON(n);
            if (c.webDir) {
              const s = r.join(o.getCwd(), c.webDir);
              e.existsSync(s)
                ? e.existsSync(i)
                  ? ((t.destTemplatePath = i),
                    (t.usersProjectCapConfigPath = n),
                    (t.webAppPath = s))
                  : (t.errorText = "Electron platform not installed.")
                : (t.errorText =
                    "WebDir defined in capacitor.config.json does not exist, did you build your webapp?");
            } else t.errorText = "No webDir defined in capacitor.config.json.";
          } else
            t.errorText =
              "capacitor.config.json does not exist, did you setup capacitor in your project root?";
          return t;
        }
        async function i() {
          const o = n();
          if (null !== o.errorText) throw new Error(o.errorText);
          try {
            const n = r.join(o.destTemplatePath, "app");
            e.existsSync(n) && t.removeSync(n), t.copySync(o.webAppPath, n);
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
