'use strict';

const test = require('tape');
const Storj = require('../../lib/index.js');
const stream = require('stream');
const blobToBuffer = require('blob-to-buffer');

let storj;

const bucketName = `test-${Date.now()}-${(Math.random()+'').split('.')[1]}`;
let bucketId;
let fileId;
let key;
let encryptionKey;
let file;
const fileName = 'foobar.svg';
const fileContent = new Buffer(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="12">' +
    '<text x="0" y="10" font-size="10">' +
      'IM A LUMBERJACK AND IM OK, I SLEEP ALL NIGHT AND I WORK ALL DAY' +
    '</text>' +
  '</svg>'
);

/* Testing of functions used in setup/teardown happen in test/all/*.js */
test('Browser: BEGIN SETUP', function(t) {
  t.end()
})

test('Browser: Storj with basic auth', function(t) {
  storj = new Storj({
    bridge: process.env.STORJ_BRIDGE,
    basicAuth: {
      email: process.env.STORJ_USERNAME,
      password: process.env.STORJ_PASSWORD,
    }
  });
  storj.on('error', t.fail);
  storj.on('ready', function() {
    storj.removeAllListeners();
    t.end();
  });
});

test('Browser: registerKey', function(t) {
  key = storj.generateKeyPair()
  encryptionKey = storj.generateEncryptionKey();
  storj.registerKey(key.getPublicKey(), function(e) {
    if(e) {
      throw e;
    }
    t.end();
  });
});

test('Browser: Storj with key', function(t) {
  storj = new Storj({
    bridge: process.env.STORJ_BRIDGE,
    key: key.getPrivateKey(),
    encryptionKey: encryptionKey
  });

  storj.on('error', t.fail);
  storj.on('ready', function() {
    storj.removeAllListeners();
    t.end();
  });
});

test('Browser: createBucket', function(t) {
  storj.createBucket(bucketName, function(e, meta) {
    if(e) {
      throw e;
    }
    bucketId = meta.id;
    t.end();
  });
});

test('Browser: createFile', function(t) {
  const rs = new stream.Readable();
  rs._read = function() {};
  rs.push(fileContent);
  rs.push(null);
  file = storj.createFile(bucketId, fileName, rs);
  file.on('error', t.fail)
  file.on('done', function() {
    fileId = file.id
    t.end();
  });
});

test('Browser: getFile', function(t) {
  file = storj.getFile(bucketId, fileId);
  file.on('done', function() {
    t.end()
  })
});

test('Browser: END SETUP', function(t) {
  t.end();
})

test('Browser: appendTo', function(t) {
  var div = document.createElement('div')
  div.id = 'foobar'
  document.body.appendChild(div)
  file.appendTo('#foobar', function(e, elem) {
    t.equal(div.children.length, 1, 'Created child element');
    t.equal(div.children[0], elem, 'Inserted at correct location in DOM');
    t.equal(elem.tagName, 'IMG', 'File inserted as img');
    div.remove();
    t.end();
  })
});

test('Browser: renderTo', function(t) {
  var img = document.createElement('img')
  img.id = 'foobar'
  document.body.appendChild(img)
  file.renderTo('#foobar', function(e, elem) {
    t.equal(img, elem, 'file placed into img');
    t.ok(img.src, 'src set on img');
    if(img.src) {
      t.equal(img.src.indexOf('blob:'), 0, 'src set to blob url');
    }
    img.remove();
    t.end();
  })
});

test('Browser: getBlob', function(t) {
  file.getBlob(function(e, blob) {
    t.error(e, 'retrieved blob');
    if(e) {
      return t.end();
    }
    blobToBuffer(blob, function(e, buffer) {
      t.error(e, 'converted to buffer');
      if(e) {
        return t.end();
      }
      t.deepEqual(buffer, fileContent, 'buffer should match fileContent');
      t.end();
    });
  })
});

test('Browser: getBlobUrl', function(t) {
  file.getBlobUrl(function(e, url) {
    t.error(e, 'retrieved blob url');
    if(e) {
      return t.end();
    }

    var req = new XMLHttpRequest();
    req.responseType = 'text';
    req.open('GET', url);
    req.addEventListener('load', function() {
      t.equal(this.responseText.toString(), fileContent.toString('utf8'),
        'downloading blob url yields original file content');
      t.end();
    });
    req.send();
  })
});

test('Browser: BEGIN TEARDOWN', function(t) {
  t.end();
})

test('Browser: deleteFile', function(t) {
  storj.deleteFile(bucketId, fileId, t.end);
});

test('Browser: deleteBucket', function(t) {
  storj.deleteBucket(bucketId, function (e) {
    t.end(e);
  });
});

test('Browser: END TEARDOWN', function(t) {
  t.end()
})
