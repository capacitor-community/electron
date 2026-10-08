const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { delimiter, join, resolve } = require('node:path');
const { test } = require('node:test');

const repositoryDir = resolve(__dirname, '..');
const cliPath = join(repositoryDir, 'dist', 'cli-scripts', 'cap-scripts.js');
const templatePath = join(repositoryDir, 'template.tar.gz');

function writeJSON(filePath, value) {
  writeFileSync(filePath, JSON.stringify(value));
}

function createFixture(context, directoryName) {
  const workspaceDir = mkdtempSync(join(tmpdir(), 'capacitor-electron-cli-'));
  context.after(() => rmSync(workspaceDir, { recursive: true, force: true }));
  const projectDir = join(workspaceDir, directoryName);
  const electronDir = join(projectDir, 'electron');
  const webDir = join(projectDir, 'www');
  const binDir = join(workspaceDir, 'bin');
  const npmScript = join(workspaceDir, 'npm-fixture.js');
  const npmLog = join(workspaceDir, 'npm-log.jsonl');
  const config = { appId: 'test.fixture', appName: 'fixture-electron', webDir: 'www' };

  mkdirSync(webDir, { recursive: true });
  mkdirSync(binDir);
  writeFileSync(join(webDir, 'index.html'), '<html>fixture web app</html>');
  writeJSON(join(projectDir, 'capacitor.config.json'), config);
  writeJSON(join(projectDir, 'package.json'), {
    name: 'fixture-project',
    version: '1.0.0',
    dependencies: { 'fixture-plugin': '1.2.3' },
  });

  const platformDir = join(projectDir, 'node_modules', '@capacitor-community', 'electron');
  mkdirSync(platformDir, { recursive: true });
  copyFileSync(templatePath, join(platformDir, 'template.tar.gz'));

  const pluginDir = join(projectDir, 'node_modules', 'fixture-plugin');
  mkdirSync(join(pluginDir, 'electron', 'dist'), { recursive: true });
  writeJSON(join(pluginDir, 'package.json'), {
    name: 'fixture-plugin',
    version: '1.2.3',
    capacitor: { electron: { src: 'electron' } },
  });
  writeFileSync(join(pluginDir, 'electron', 'dist', 'plugin.js'), 'module.exports = {};');

  writeFileSync(
    npmScript,
    [
      "const { appendFileSync } = require('node:fs');",
      'const record = { cwd: process.cwd(), args: process.argv.slice(2) };',
      "appendFileSync(process.env.CLI_FIXTURE_NPM_LOG, JSON.stringify(record) + '\\n');",
      'if (process.env.CLI_FIXTURE_NPM_EXIT) {',
      "  process.stderr.write('fixture npm failure\\n');",
      '  process.exit(Number(process.env.CLI_FIXTURE_NPM_EXIT));',
      '}',
      '',
    ].join('\n')
  );
  writeFileSync(join(binDir, 'npm'), '#!/bin/sh\nexec "$CLI_FIXTURE_NODE" "$CLI_FIXTURE_NPM_SCRIPT" "$@"\n', {
    mode: 0o755,
  });
  writeFileSync(join(binDir, 'npm.cmd'), '@echo off\r\n"%CLI_FIXTURE_NODE%" "%CLI_FIXTURE_NPM_SCRIPT%" %*\r\n');

  return {
    workspaceDir,
    projectDir,
    electronDir,
    config,
    npmLog,
    env: {
      ...process.env,
      PATH: `${binDir}${delimiter}${process.env.PATH || ''}`,
      CAPACITOR_ROOT_DIR: projectDir,
      CAPACITOR_WEB_DIR: webDir,
      CAPACITOR_CONFIG: JSON.stringify(config),
      CLI_FIXTURE_NODE: process.execPath,
      CLI_FIXTURE_NPM_SCRIPT: npmScript,
      CLI_FIXTURE_NPM_LOG: npmLog,
      CLI_FIXTURE_NPM_EXIT: '',
    },
  };
}

function prepareElectronProject(fixture) {
  mkdirSync(join(fixture.electronDir, 'src', 'rt'), { recursive: true });
  writeJSON(join(fixture.electronDir, 'package.json'), {
    name: 'fixture-electron',
    scripts: { 'electron:start-live': 'node ./live-runner.js' },
  });
}

function runCLI(fixture, command, exitCode = '') {
  return spawnSync(process.execPath, [cliPath, command], {
    cwd: fixture.workspaceDir,
    env: { ...fixture.env, CLI_FIXTURE_NPM_EXIT: String(exitCode) },
    encoding: 'utf8',
    timeout: 15000,
  });
}

function npmCalls(fixture) {
  return readFileSync(fixture.npmLog, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
}

function assertNoInjectedCommand(fixture) {
  assert.equal(existsSync(join(fixture.workspaceDir, 'injected')), false);
  assert.equal(existsSync(join(fixture.electronDir, 'injected')), false);
}

function assertPluginFiles(fixture) {
  assert.deepEqual(
    JSON.parse(readFileSync(join(fixture.electronDir, 'capacitor.config.json'), 'utf8')),
    fixture.config
  );
  const plugins = readFileSync(join(fixture.electronDir, 'src', 'rt', 'electron-plugins.js'), 'utf8');
  assert.match(plugins, /const FixturePlugin = require\('/);
  assert.match(plugins, /fixture-plugin/);
  assert.match(plugins, /module\.exports = \{\n  FixturePlugin,/);
}

const directoryNames = [
  'project',
  'project with spaces',
  "project's folder",
  'project&folder',
  'project$(touch injected)',
];

for (const directoryName of directoryNames) {
  for (const command of ['add', 'update', 'open']) {
    test(`${command} runs npm in the Electron directory for ${directoryName}`, (context) => {
      const fixture = createFixture(context, directoryName);
      if (command !== 'add') prepareElectronProject(fixture);

      const result = runCLI(fixture, command);
      assert.equal(result.error, undefined);
      assert.equal(result.status, 0, result.stdout + result.stderr);
      const expectedArguments =
        command === 'add'
          ? [['i'], ['i', 'fixture-plugin@1.2.3']]
          : command === 'update'
          ? [['i', 'fixture-plugin@1.2.3']]
          : [['run', 'electron:start-live']];
      assert.deepEqual(
        npmCalls(fixture),
        expectedArguments.map((args) => ({ cwd: realpathSync(fixture.electronDir), args }))
      );
      assertNoInjectedCommand(fixture);

      if (command !== 'open') assertPluginFiles(fixture);
      if (command === 'add') {
        assert.equal(
          readFileSync(join(fixture.electronDir, 'app', 'index.html'), 'utf8'),
          '<html>fixture web app</html>'
        );
        assert.equal(
          JSON.parse(readFileSync(join(fixture.electronDir, 'package.json'), 'utf8')).name,
          'fixture-electron'
        );
      }
    });
  }
}

for (const command of ['add', 'update', 'open']) {
  test(`${command} reports npm failures from a project directory with spaces`, (context) => {
    const fixture = createFixture(context, 'project with spaces');
    if (command !== 'add') prepareElectronProject(fixture);

    const result = runCLI(fixture, command, 23);
    assert.equal(result.error, undefined);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /fixture npm failure/);
    const args =
      command === 'add' ? ['i'] : command === 'update' ? ['i', 'fixture-plugin@1.2.3'] : ['run', 'electron:start-live'];
    assert.deepEqual(npmCalls(fixture), [{ cwd: realpathSync(fixture.electronDir), args }]);
    assertNoInjectedCommand(fixture);
  });
}
