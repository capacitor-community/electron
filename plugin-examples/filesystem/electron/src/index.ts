/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'path';

import type { 
  AppendFileOptions, 
  CopyOptions, 
  DeleteFileOptions, 
  FilesystemPlugin, 
  GetUriOptions, 
  GetUriResult, 
  MkdirOptions, 
  PermissionStatus, 
  ReaddirOptions, 
  ReaddirResult, 
  ReadFileOptions, 
  ReadFileResult, 
  RmdirOptions, 
  StatOptions, 
  StatResult, 
  WriteFileOptions, 
  WriteFileResult 
} from '../../src/definitions';

import { convertDirectory, convertEncoding, getCleanPath, readFileAsync } from './utils';


export class Filesystem implements FilesystemPlugin {
  async readFile(options: ReadFileOptions): Promise<ReadFileResult> {
    const cleanPath = getCleanPath(options.path);
    const directory = convertDirectory(options.directory);
    const encoding = convertEncoding(options.encoding ?? null);
    try {
      const data: any = await readFileAsync(path.join(directory, cleanPath), {encoding});
      return {data}
    } catch(e) {
      throw new Error(e.message);
    }
  }
  async writeFile(_options: WriteFileOptions): Promise<WriteFileResult> {
    throw new Error('Method not implemented.');
  }
  async appendFile(_options: AppendFileOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async deleteFile(_options: DeleteFileOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async mkdir(_options: MkdirOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async rmdir(_options: RmdirOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async readdir(_options: ReaddirOptions): Promise<ReaddirResult> {
    throw new Error('Method not implemented.');
  }
  async getUri(_options: GetUriOptions): Promise<GetUriResult> {
    throw new Error('Method not implemented.');
  }
  async stat(_options: StatOptions): Promise<StatResult> {
    throw new Error('Method not implemented.');
  }
  async rename(_options: CopyOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async copy(_options: CopyOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async checkPermissions(): Promise<PermissionStatus> {
    throw new Error('Method not implemented.');
  }
  async requestPermissions(): Promise<PermissionStatus> {
    throw new Error('Method not implemented.');
  }
}
