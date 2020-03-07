import * as glob from 'glob';
import * as fs from 'fs';
import * as watch from 'glob-watcher';

export function globFileContents(
  files: string,
  ignoreSchema: string,
  shouldWatch: boolean,
  callback: (contents: string[]) => void
): void {
  if (shouldWatch) {
    processFiles();
    const watcher = watch([files, ignoreSchema]);
    watcher.on('change', async path => {
      processFiles();
    });
  } else {
    processFiles();
  }

  function processFiles() {
    glob(files, async (err, matches) => {
      if (err) {
        console.error(err);
        return;
      }
      callback(
        await Promise.all(
          matches
            .filter(match => match !== ignoreSchema)
            .map(match => {
              return new Promise<string>((resolve1, reject1) => {
                fs.readFile(match, {encoding: 'utf8'}, (err1, data) => {
                  if (err1) {
                    reject1(err1);
                    return;
                  }
                  resolve1(data);
                });
              });
            })
        )
      );
    });
  }
}
