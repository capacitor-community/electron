import fs from 'fs';
import os from 'os';
import path from 'path';

import { Directory, Encoding } from '../../src/definitions';

export function getCleanPath(dirtyPath: string | undefined): string {
  const cleanedUriPath = dirtyPath !== undefined ? dirtyPath.replace(/^[/]+|[/]+$/g, '').replace(/^[\\]+|[\\]+$/g, '') : '';
  return path.sep !== '/' ? cleanedUriPath.replace(/\//g, path.sep) : cleanedUriPath;
}

export function convertDirectory(directory: string | undefined): string {
  switch(directory) {
    case Directory.Documents:
      return path.join(os.homedir(), 'Documents');
    default:
      throw new Error(`Directory: ${directory} is not supported by the Electron Platform`);
  }
}

export function convertEncoding(encoding: null | string): BufferEncoding {
  if (encoding === Encoding.UTF8 || encoding === Encoding.ASCII || encoding === null) {
    return encoding as BufferEncoding;
  } else {
    throw new Error(`Encoding of: ${encoding} is not supported by the Electron platform.`);
  }
}

export function readFileAsync(path: fs.PathLike, options: {encoding?: BufferEncoding | null; flag?: string}): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, options, (err: any, data: any) => {
      if (err) reject(err);
      resolve(data)
    })
  })
}
