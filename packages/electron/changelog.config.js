/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';
const config = require('conventional-changelog-conventionalcommits');

module.exports = config({
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'chore', section: 'Chores' },
    { type: 'docs', section: 'Documentation' },
    { type: 'style', hidden: true },
    { type: 'refactor', hidden: true },
    { type: 'perf', hidden: true },
    { type: 'test', hidden: true },
    { type: 'changelog', hidden: true },
  ],
});
