import { join } from 'path';

import type { TaskInfoProvider } from './common';
import { runExec, errorLog } from './common';

export async function doOpen(taskInfoMessageProvider: TaskInfoProvider): Promise<void> {
  const usersProjectDir = process.env.CAPACITOR_ROOT_DIR;
  const destDir = join(usersProjectDir, 'electron');
  try {
    taskInfoMessageProvider('building electron app');
    taskInfoMessageProvider('running electron app');
    await runExec(`cd ${destDir} && npm run electron:start-live`);
  } catch (e) {
    errorLog(e.message);
    throw e;
  }
}
