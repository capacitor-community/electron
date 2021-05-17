import { dialog } from 'electron'

import type {
  DialogPlugin,
  AlertOptions,
  PromptOptions,
  PromptResult,
  ConfirmOptions,
  ConfirmResult,
} from '../../src/definitions';

export class Dialog implements DialogPlugin {
  async alert(options: AlertOptions): Promise<void> {
    await dialog.showMessageBox({message: options.message + ' --- electron'});
  }

  async prompt(options: PromptOptions): Promise<PromptResult> {
    const val = window.prompt(options.message, options.inputText || '');
    return {
      value: val !== null ? val : '',
      cancelled: val === null,
    };
  }

  async confirm(options: ConfirmOptions): Promise<ConfirmResult> {
    const val = window.confirm(options.message);
    return {
      value: val,
    };
  }
}
