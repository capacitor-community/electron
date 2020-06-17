"use strict";
const config = require("conventional-changelog-conventionalcommits");

module.exports = config({
  types: [
    { type: "feat", section: "Features" },
    { type: "fix", section: "Bug Fixes" },
    { type: "chore", section: "Chores" },
    { type: "docs", section: "Documentation" },
    { type: "style", hidden: true },
    { type: "refactor", section: "Refactors" },
    { type: "perf", hidden: true },
    { type: "test", hidden: true },
  ],
});
