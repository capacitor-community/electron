(window.webpackJsonp = window.webpackJsonp || []).push([
  [9],
  {
    "4tVJ": function (e, t, a) {
      "use strict";
      a.r(t);
      a("ERkP");
      var n = a("cxan");
      var r = a("ZVZ0"),
        c = a("l1C2"),
        l = { _frontmatter: {} };
      function i(e) {
        var t = e.components,
          a = (function (e, t) {
            if (null == e) return {};
            var a,
              n,
              r = {},
              c = Object.keys(e);
            for (n = 0; n < c.length; n++)
              (a = c[n]), t.indexOf(a) >= 0 || (r[a] = e[a]);
            return r;
          })(e, ["components"]);
        return Object(r.mdx)(
          "wrapper",
          Object(n.a)({}, l, a, { components: t, mdxType: "MDXLayout" }),
          Object(r.mdx)(
            "h1",
            { id: "introduction", style: { position: "relative" } },
            Object(r.mdx)(
              "a",
              Object(n.a)(
                { parentName: "h1" },
                {
                  href: "#introduction",
                  "aria-label": "introduction permalink",
                  className: "anchor before",
                }
              ),
              Object(r.mdx)(
                "svg",
                Object(n.a)(
                  { parentName: "a" },
                  {
                    "aria-hidden": "true",
                    focusable: "false",
                    height: "16",
                    version: "1.1",
                    viewBox: "0 0 16 16",
                    width: "16",
                  }
                ),
                Object(r.mdx)(
                  "path",
                  Object(n.a)(
                    { parentName: "svg" },
                    {
                      fillRule: "evenodd",
                      d:
                        "M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z",
                    }
                  )
                )
              )
            ),
            "Introduction"
          ),
          Object(r.mdx)(
            "p",
            null,
            "Deploy your Capacitor apps to Linux, Mac, and Windows desktops, with the Electron platform! 🖥️"
          ),
          Object(r.mdx)(
            "h2",
            { id: "features", style: { position: "relative" } },
            Object(r.mdx)(
              "a",
              Object(n.a)(
                { parentName: "h2" },
                {
                  href: "#features",
                  "aria-label": "features permalink",
                  className: "anchor before",
                }
              ),
              Object(r.mdx)(
                "svg",
                Object(n.a)(
                  { parentName: "a" },
                  {
                    "aria-hidden": "true",
                    focusable: "false",
                    height: "16",
                    version: "1.1",
                    viewBox: "0 0 16 16",
                    width: "16",
                  }
                ),
                Object(r.mdx)(
                  "path",
                  Object(n.a)(
                    { parentName: "svg" },
                    {
                      fillRule: "evenodd",
                      d:
                        "M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z",
                    }
                  )
                )
              )
            ),
            "Features"
          ),
          Object(r.mdx)(
            "ul",
            null,
            Object(r.mdx)(
              "li",
              { parentName: "ul" },
              "⚡ ",
              Object(r.mdx)(
                "strong",
                { parentName: "li" },
                "Capacitor Plugins:"
              ),
              " use Capacitor plugins with the desktop;"
            ),
            Object(r.mdx)(
              "li",
              { parentName: "ul" },
              "⚙ ",
              Object(r.mdx)(
                "strong",
                { parentName: "li" },
                "Easy Configuration:"
              ),
              " simple object configuration, where the platform takes care of the heavy lifting.",
              Object(r.mdx)(
                "ul",
                { parentName: "li" },
                Object(r.mdx)(
                  "li",
                  { parentName: "ul" },
                  "🔗 ",
                  Object(r.mdx)("strong", { parentName: "li" }, "Deeplinking:"),
                  " allow web urls to open your application and receive data;"
                ),
                Object(r.mdx)(
                  "li",
                  { parentName: "ul" },
                  "💦 ",
                  Object(r.mdx)(
                    "strong",
                    { parentName: "li" },
                    "Splashscreen:"
                  ),
                  " easy to use Splashscreen for loading feedback on launch and through out your app;"
                ),
                Object(r.mdx)(
                  "li",
                  { parentName: "ul" },
                  "🌠 ",
                  Object(r.mdx)("strong", { parentName: "li" }, "Tray Icon:"),
                  " simple tray icon support, with or without showing a main window;"
                ),
                Object(r.mdx)(
                  "li",
                  { parentName: "ul" },
                  "🛠 ",
                  Object(r.mdx)("strong", { parentName: "li" }, "App Menu:"),
                  " create Electron menus for your app with templates;"
                )
              )
            ),
            Object(r.mdx)(
              "li",
              { parentName: "ul" },
              "🎉 ",
              Object(r.mdx)("strong", { parentName: "li" }, "Typescript:"),
              " use Typescript in the electron project;"
            ),
            Object(r.mdx)(
              "li",
              { parentName: "ul" },
              "⚛ ",
              Object(r.mdx)("strong", { parentName: "li" }, "Electron:"),
              " at the end of it, the app is still Electron and the platform wont get in the way of the development flow Electron apps have."
            ),
            Object(r.mdx)(
              "li",
              { parentName: "ul" },
              "📦 ",
              Object(r.mdx)("strong", { parentName: "li" }, "Build Defaults:"),
              " enjoy preset build defaults and runner scripts via ",
              Object(r.mdx)(
                "inlineCode",
                { parentName: "li" },
                "Electron-Builder"
              )
            ),
            Object(r.mdx)(
              "li",
              { parentName: "ul" },
              "🔥 ",
              Object(r.mdx)("em", { parentName: "li" }, "And More!")
            )
          ),
          Object(r.mdx)("br", null),
          Object(r.mdx)(
            "p",
            null,
            Object(r.mdx)(
              "a",
              Object(n.a)({ parentName: "p" }, { href: "/getting-started" }),
              "Get started now!"
            )
          )
        );
      }
      i.isMDXComponent = !0;
      var o = a("CvIF"),
        p = a("4uxQ");
      function m() {
        return Object(c.d)(
          o.a,
          null,
          Object(c.d)(p.a, null),
          Object(c.d)(i, null)
        );
      }
      t.default = function () {
        return Object(c.d)(m, null);
      };
    },
  },
]);
//# sourceMappingURL=component---node-modules-rocketseat-gatsby-theme-docs-core-src-templates-homepage-query-js-6f05a2ceb373bebc42e4.js.map
