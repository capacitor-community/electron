(window.webpackJsonp = window.webpackJsonp || []).push([
  [8],
  {
    "0yTM": function (t, e, n) {
      var r = n("M6MO");
      t.exports = { MDXRenderer: r };
    },
    "695J": function (t, e) {
      function n(e, r) {
        return (
          (t.exports = n =
            Object.setPrototypeOf ||
            function (t, e) {
              return (t.__proto__ = e), t;
            }),
          n(e, r)
        );
      }
      t.exports = n;
    },
    M6MO: function (t, e, n) {
      var r = n("rDK1"),
        o = n("RhWx"),
        i = n("KEM+"),
        c = n("LdEA");
      function a(t, e) {
        var n = Object.keys(t);
        if (Object.getOwnPropertySymbols) {
          var r = Object.getOwnPropertySymbols(t);
          e &&
            (r = r.filter(function (e) {
              return Object.getOwnPropertyDescriptor(t, e).enumerable;
            })),
            n.push.apply(n, r);
        }
        return n;
      }
      function u(t) {
        for (var e = 1; e < arguments.length; e++) {
          var n = null != arguments[e] ? arguments[e] : {};
          e % 2
            ? a(Object(n), !0).forEach(function (e) {
                i(t, e, n[e]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n))
            : a(Object(n)).forEach(function (e) {
                Object.defineProperty(
                  t,
                  e,
                  Object.getOwnPropertyDescriptor(n, e)
                );
              });
        }
        return t;
      }
      var l = n("ERkP"),
        p = n("ZVZ0"),
        f = p.useMDXComponents,
        s = p.mdx,
        d = n("Amv9").useMDXScope;
      t.exports = function (t) {
        var e = t.scope,
          n = t.components,
          i = t.children,
          a = c(t, ["scope", "components", "children"]),
          p = f(n),
          b = d(e),
          m = l.useMemo(
            function () {
              if (!i) return null;
              var t = u({ React: l, mdx: s }, b),
                e = Object.keys(t),
                n = e.map(function (e) {
                  return t[e];
                });
              return r(Function, ["_fn"].concat(o(e), ["" + i])).apply(
                void 0,
                [{}].concat(o(n))
              );
            },
            [i, e]
          );
        return l.createElement(m, u({ components: p }, a));
      };
    },
    RhWx: function (t, e, n) {
      var r = n("tGbD"),
        o = n("twbh"),
        i = n("peMk"),
        c = n("d8WC");
      t.exports = function (t) {
        return r(t) || o(t) || i(t) || c();
      };
    },
    TcdR: function (t, e) {
      t.exports = function () {
        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
        if (Reflect.construct.sham) return !1;
        if ("function" == typeof Proxy) return !0;
        try {
          return (
            Date.prototype.toString.call(
              Reflect.construct(Date, [], function () {})
            ),
            !0
          );
        } catch (t) {
          return !1;
        }
      };
    },
    d8WC: function (t, e) {
      t.exports = function () {
        throw new TypeError(
          "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
        );
      };
    },
    iQ7j: function (t, e) {
      t.exports = function (t, e) {
        (null == e || e > t.length) && (e = t.length);
        for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
        return r;
      };
    },
    oHs6: function (t, e, n) {
      "use strict";
      n.r(e),
        n.d(e, "query", function () {
          return g;
        });
      var r = n("ERkP"),
        o = n.n(r),
        i = n("0yTM"),
        c = n("CvIF"),
        a = n("4uxQ"),
        u = n("Wbzz"),
        l = n("ilhn"),
        p = n("Iy7w"),
        f = Object(p.a)("section", { target: "e1jikabl0" })({
          name: "1rfih1g",
          styles:
            "display:flex;justify-content:space-between;align-items:center;padding:48px 0;width:100%;@media (max-width:780px){flex-direction:column;}",
        }),
        s = Object(p.a)("div", { target: "e1jikabl1" })(
          "transition:all 200ms;",
          function (t) {
            return !t.isLeft && "margin-left: auto;";
          },
          " a{display:flex;text-decoration:none;justify-content:center;align-items:center;width:100%;height:100%;svg{width:25px;height:25px;color:#737380;",
          function (t) {
            return t.isLeft ? "margin-right: 16px" : "margin-left: 16px";
          },
          ";}p{letter-spacing:0.142em;text-transform:uppercase;font-size:12px;margin:0;color:#999;}h3{color:#737380;border:none;margin:0;padding:0;font-weight:normal;font-size:16px;}}&:hover{opacity:0.8;a svg{opacity:0.8;}}@media (max-width:780px){width:100%;",
          function (t) {
            return t.isLeft && "margin-bottom: 16px";
          },
          ";a{justify-content:",
          function (t) {
            return t.isLeft ? "flex-start" : "flex-end";
          },
          ";}}"
        ),
        d = n("l1C2");
      function b(t) {
        var e = t.prev,
          n = t.next;
        return Object(d.d)(
          f,
          null,
          e &&
            Object(d.d)(
              s,
              { isLeft: !0 },
              Object(d.d)(
                u.Link,
                { to: e.link },
                Object(d.d)(l.b, null),
                Object(d.d)(
                  "div",
                  null,
                  Object(d.d)("p", null, "Prev"),
                  Object(d.d)("h3", null, e.label)
                )
              )
            ),
          n &&
            Object(d.d)(
              s,
              null,
              Object(d.d)(
                u.Link,
                { to: n.link },
                Object(d.d)(
                  "div",
                  null,
                  Object(d.d)("p", null, "Next"),
                  Object(d.d)("h3", null, n.label)
                ),
                Object(d.d)(l.c, null)
              )
            )
        );
      }
      function m(t) {
        var e = t.githubEditUrl;
        return e
          ? Object(d.d)(
              "a",
              {
                href: e,
                target: "_blank",
                rel: "noopener noreferrer",
                style: {
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                  marginTop: "48px",
                  color: "#78757a",
                  opacity: "0.8",
                  fontSize: "14px",
                  fontWeight: "normal",
                },
              },
              Object(d.d)(l.a, { style: { marginRight: "5px" } }),
              "Edit this page on GitHub"
            )
          : null;
      }
      function x(t) {
        var e = t.mdx,
          n = t.pageContext,
          r = n.prev,
          u = n.next,
          l = n.githubEditUrl,
          p = e.frontmatter,
          f = p.title,
          s = p.description,
          x = p.image,
          g = p.disableTableOfContents,
          y = e.headings,
          O = e.body,
          j = e.fields.slug;
        return Object(d.d)(
          o.a.Fragment,
          null,
          Object(d.d)(a.a, { title: f, description: s, slug: j, image: x }),
          Object(d.d)(
            c.a,
            { disableTableOfContents: g, title: f, headings: y },
            Object(d.d)(i.MDXRenderer, null, O),
            Object(d.d)(m, { githubEditUrl: l }),
            Object(d.d)(b, { prev: r, next: u })
          )
        );
      }
      (b.defaultProps = { prev: null, next: null }),
        (m.defaultProps = { githubEditUrl: null });
      e.default = function (t) {
        var e = t.data.mdx,
          n = t.pageContext;
        return Object(d.d)(x, { mdx: e, pageContext: n });
      };
      var g = "1993335579";
    },
    peMk: function (t, e, n) {
      var r = n("iQ7j");
      t.exports = function (t, e) {
        if (t) {
          if ("string" == typeof t) return r(t, e);
          var n = Object.prototype.toString.call(t).slice(8, -1);
          return (
            "Object" === n && t.constructor && (n = t.constructor.name),
            "Map" === n || "Set" === n
              ? Array.from(t)
              : "Arguments" === n ||
                /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
              ? r(t, e)
              : void 0
          );
        }
      };
    },
    rDK1: function (t, e, n) {
      var r = n("695J"),
        o = n("TcdR");
      function i(e, n, c) {
        return (
          o()
            ? (t.exports = i = Reflect.construct)
            : (t.exports = i = function (t, e, n) {
                var o = [null];
                o.push.apply(o, e);
                var i = new (Function.bind.apply(t, o))();
                return n && r(i, n.prototype), i;
              }),
          i.apply(null, arguments)
        );
      }
      t.exports = i;
    },
    tGbD: function (t, e, n) {
      var r = n("iQ7j");
      t.exports = function (t) {
        if (Array.isArray(t)) return r(t);
      };
    },
    twbh: function (t, e) {
      t.exports = function (t) {
        if ("undefined" != typeof Symbol && Symbol.iterator in Object(t))
          return Array.from(t);
      };
    },
  },
]);
//# sourceMappingURL=component---node-modules-rocketseat-gatsby-theme-docs-core-src-templates-docs-query-js-3ee6f1746fc040e70234.js.map
