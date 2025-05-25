const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const stream = require('../lib/lazystream');
const helper = require('./helper');

describe('pipe', () => {
  test('readwrite', async () => {
    const expected = [ 'line1\n', 'line2\n' ];
    const actual = [];
    let readableInstantiated = false;
    let writableInstantiated = false;

    const readable = new stream.Readable(function() {
      readableInstantiated = true;
      return new helper.DummyReadable([].concat(expected));
    });

    const writable = new stream.Writable(function() {
      writableInstantiated = true;
      return new helper.DummyWritable(actual);
    });

    assert.equal(readableInstantiated, false, 'DummyReadable should only be instantiated when it is needed');
    assert.equal(writableInstantiated, false, 'DummyWritable should only be instantiated when it is needed');

    return new Promise((resolve) => {
      writable.on('end', function() {
        assert.equal(actual.join(''), expected.join(''), 'Piping on demand streams should keep data intact');
        resolve();
      });

      readable.pipe(writable);
    });
  });
});


