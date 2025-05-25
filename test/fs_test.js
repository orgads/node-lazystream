const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const stream = require('../lib/lazystream');
const fs = require('fs');
const fsp = fs.promises;
const tmpDir = 'test/tmp/';
const readFile = 'test/data.md';
const writeFile = tmpDir + 'data.md';

describe('fs', () => {
  test('readwrite', async () => {
    let readfd, writefd;

    // Clean up and prepare directories
    await fsp.mkdir(tmpDir, { recursive: true });
    try {
      await fsp.unlink(writeFile);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    const readable = new stream.Readable(function() {
       return fs.createReadStream(readFile)
        .on('open', function(fd) {
          readfd = fd;
        });
    });

    const writable = new stream.Writable(function() {
      return fs.createWriteStream(writeFile)
        .on('open', function(fd) {
          writefd = fd;
        });
    });

    assert.equal(readfd, undefined, 'Input file should not be opened until read');
    assert.equal(writefd, undefined, 'Output file should not be opened until write');

    // Pipe files and wait for completion
    await new Promise((resolve, reject) => {
      readable.pipe(writable);
      writable.on('finish', async () => {
        try {
          const input = await fsp.readFile(readFile);
          const output = await fsp.readFile(writeFile);

          assert.ok(Buffer.isBuffer(input) && Buffer.isBuffer(output), 'Both should be buffers');
          assert.deepEqual(input, output, 'Files should be equal');
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  });
});


