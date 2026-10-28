const FILE_SYSTEM_ID = 'mastermine-drive-local';
const DISPLAY_NAME = 'MasterMine Drive';
const DB_NAME = 'mastermine-drive-files-v1';
const DB_VERSION = 1;
const ENTRIES_STORE = 'entries';
const HANDLES_STORE = 'openHandles';
const MAX_FILE_BYTES = 128 * 1024 * 1024;

let databasePromise;

function openDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        db.createObjectStore(ENTRIES_STORE, { keyPath: 'path' });
      }
      if (!db.objectStoreNames.contains(HANDLES_STORE)) {
        db.createObjectStore(HANDLES_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open local drive storage.'));
  }).catch(error => {
    databasePromise = null;
    throw error;
  });
  return databasePromise;
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Storage operation failed.'));
  });
}

async function readEntry(path) {
  const db = await openDatabase();
  const tx = db.transaction(ENTRIES_STORE, 'readonly');
  return requestResult(tx.objectStore(ENTRIES_STORE).get(path));
}

async function readAllEntries() {
  const db = await openDatabase();
  const tx = db.transaction(ENTRIES_STORE, 'readonly');
  return requestResult(tx.objectStore(ENTRIES_STORE).getAll());
}

async function writeEntry(entry) {
  const db = await openDatabase();
  const tx = db.transaction(ENTRIES_STORE, 'readwrite');
  return requestResult(tx.objectStore(ENTRIES_STORE).put(entry));
}

async function removeEntry(path) {
  const db = await openDatabase();
  const tx = db.transaction(ENTRIES_STORE, 'readwrite');
  return requestResult(tx.objectStore(ENTRIES_STORE).delete(path));
}

async function readHandle(id) {
  const db = await openDatabase();
  const tx = db.transaction(HANDLES_STORE, 'readonly');
  return requestResult(tx.objectStore(HANDLES_STORE).get(id));
}

async function writeHandle(handle) {
  const db = await openDatabase();
  const tx = db.transaction(HANDLES_STORE, 'readwrite');
  return requestResult(tx.objectStore(HANDLES_STORE).put(handle));
}

async function removeHandle(id) {
  const db = await openDatabase();
  const tx = db.transaction(HANDLES_STORE, 'readwrite');
  return requestResult(tx.objectStore(HANDLES_STORE).delete(id));
}

function providerError(code, message) {
  const error = new Error(message || code);
  error.providerCode = code;
  return error;
}

function fail(errorCallback, error) {
  const code = error && error.providerCode ? error.providerCode : 'FAILED';
  try { errorCallback(code); } catch (_) {}
}

function handleRequest(successCallback, errorCallback, operation) {
  Promise.resolve()
    .then(operation)
    .then(result => successCallback(result))
    .catch(error => {
      console.error('MasterMine Drive request failed:', error);
      fail(errorCallback, error);
    });
}

function normalisePath(path) {
  const rawParts = String(path || '/').split('/').filter(Boolean);
  if (rawParts.some(part => part === '.' || part === '..' || part.includes('\u0000'))) {
    throw providerError('SECURITY', 'Invalid path.');
  }
  return rawParts.length ? '/' + rawParts.join('/') : '/';
}

function parentPath(path) {
  if (path === '/') return null;
  const index = path.lastIndexOf('/');
  return index <= 0 ? '/' : path.slice(0, index);
}

function entryName(path) {
  if (path === '/') return '';
  return path.slice(path.lastIndexOf('/') + 1);
}

function isChildPath(candidate, parent) {
  return candidate !== parent && candidate.startsWith(parent === '/' ? '/' : parent + '/');
}

function mimeTypeFor(name, isDirectory) {
  if (isDirectory) return 'inode/directory';
  const extension = (name.split('.').pop() || '').toLowerCase();
  const types = {
    txt: 'text/plain', html: 'text/html', htm: 'text/html', css: 'text/css',
    js: 'text/javascript', json: 'application/json', csv: 'text/csv',
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
    webp: 'image/webp', pdf: 'application/pdf', svg: 'image/svg+xml',
    masterdocx: 'application/vnd.mastermine.masterdocx+json',
    masterslides: 'application/vnd.mastermine.masterslides+json',
    masternote: 'application/vnd.mastermine.masternote+json',
    mastersheet: 'application/vnd.mastermine.mastersheet+json',
    mastercanvas: 'application/vnd.mastermine.mastercanvas+json'
  };
  return types[extension] || 'application/octet-stream';
}

function makeEntry(path, isDirectory, content) {
  const now = Date.now();
  return {
    path,
    name: entryName(path),
    isDirectory,
    size: isDirectory ? 0 : (content ? content.byteLength : 0),
    content: isDirectory ? new ArrayBuffer(0) : (content || new ArrayBuffer(0)),
    mimeType: mimeTypeFor(entryName(path), isDirectory),
    modifiedAt: now
  };
}

async function ensureRoot() {
  if (!(await readEntry('/'))) {
    await writeEntry(makeEntry('/', true, new ArrayBuffer(0)));
  }
}

function metadataFor(entry) {
  return {
    name: entry.path === '/' ? '' : entry.name,
    isDirectory: entry.isDirectory,
    size: entry.isDirectory ? 0 : (entry.content ? entry.content.byteLength : entry.size || 0),
    modificationTime: new Date(entry.modifiedAt || Date.now()),
    mimeType: entry.mimeType || mimeTypeFor(entry.name || '', entry.isDirectory)
  };
}

async function requireEntry(path) {
  const entry = await readEntry(path);
  if (!entry) throw providerError('NOT_FOUND', 'Entry not found.');
  return entry;
}

async function requireParentDirectory(path) {
  const parent = await requireEntry(parentPath(path));
  if (!parent.isDirectory) throw providerError('NOT_A_DIRECTORY', 'Parent is not a directory.');
  return parent;
}

async function makeDirectory(path, recursive) {
  if (path === '/') throw providerError('EXISTS', 'Root already exists.');
  const segments = path.split('/').filter(Boolean);
  let current = '';
  for (let i = 0; i < segments.length; i += 1) {
    current += '/' + segments[i];
    const existing = await readEntry(current);
    const isTarget = i === segments.length - 1;
    if (existing) {
      if (isTarget) throw providerError('EXISTS', 'Directory already exists.');
      if (!existing.isDirectory) throw providerError('NOT_A_DIRECTORY', 'A parent path is a file.');
      continue;
    }
    if (i > 0 && !recursive) throw providerError('NOT_FOUND', 'Parent directory does not exist.');
    const parent = await readEntry(parentPath(current));
    if (!parent || !parent.isDirectory) throw providerError('NOT_FOUND', 'Parent directory does not exist.');
    await writeEntry(makeEntry(current, true, new ArrayBuffer(0)));
  }
}

async function createFile(path) {
  if (path === '/') throw providerError('EXISTS', 'Root already exists.');
  if (await readEntry(path)) throw providerError('EXISTS', 'File already exists.');
  await requireParentDirectory(path);
  await writeEntry(makeEntry(path, false, new ArrayBuffer(0)));
}

async function deletePath(path, recursive) {
  if (path === '/') throw providerError('ACCESS_DENIED', 'Cannot delete the drive root.');
  const entry = await requireEntry(path);
  const all = await readAllEntries();
  const descendants = all.filter(item => isChildPath(item.path, path));
  if (entry.isDirectory && descendants.length && !recursive) {
    throw providerError('NOT_EMPTY', 'Directory is not empty.');
  }
  for (const child of descendants) await removeEntry(child.path);
  await removeEntry(path);
}

async function transferPath(sourcePath, targetPath, move) {
  if (sourcePath === '/' || targetPath === '/') throw providerError('ACCESS_DENIED', 'Cannot replace the drive root.');
  const source = await requireEntry(sourcePath);
  await requireParentDirectory(targetPath);
  if (source.isDirectory && isChildPath(targetPath, sourcePath)) {
    throw providerError('INVALID_OPERATION', 'Cannot move or copy a directory into itself.');
  }
  if (await readEntry(targetPath)) throw providerError('EXISTS', 'Destination already exists.');
  const all = await readAllEntries();
  const sourceEntries = all.filter(item => item.path === sourcePath || isChildPath(item.path, sourcePath));
  const copied = sourceEntries.map(item => {
    const suffix = item.path.slice(sourcePath.length);
    const nextPath = targetPath + suffix;
    return { ...item, path: nextPath, name: entryName(nextPath), modifiedAt: Date.now() };
  });
  if (move) {
    for (const item of sourceEntries) await removeEntry(item.path);
  }
  for (const item of copied) await writeEntry(item);
}

chrome.runtime.onInstalled.addListener(() => {
  ensureRoot().catch(error => console.error('MasterMine Drive initialisation failed:', error));
});

chrome.fileSystemProvider.onMountRequested.addListener((successCallback, errorCallback) => {
  handleRequest(
    () => successCallback(),
    errorCallback,
    async () => {
      const mounts = await chrome.fileSystemProvider.getAll();
      if (!mounts.some(mount => mount.fileSystemId === FILE_SYSTEM_ID)) {
        await chrome.fileSystemProvider.mount({
          fileSystemId: FILE_SYSTEM_ID,
          displayName: DISPLAY_NAME,
          writable: true,
          persistent: true,
          openedFilesLimit: 20
        });
      }
      await ensureRoot();
    }
  );
});

chrome.fileSystemProvider.onGetMetadataRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(successCallback, errorCallback, async () => {
    await ensureRoot();
    const path = normalisePath(options.entryPath);
    const entry = await requireEntry(path);
    return metadataFor(entry);
  });
});

chrome.fileSystemProvider.onReadDirectoryRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(result => successCallback(result.entries, result.hasMore), errorCallback, async () => {
    await ensureRoot();
    const directoryPath = normalisePath(options.directoryPath);
    const directory = await requireEntry(directoryPath);
    if (!directory.isDirectory) throw providerError('NOT_A_DIRECTORY', 'Not a directory.');
    const all = await readAllEntries();
    const entries = all
      .filter(entry => entry.path !== '/' && parentPath(entry.path) === directoryPath)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(metadataFor);
    return { entries, hasMore: false };
  });
});

chrome.fileSystemProvider.onCreateDirectoryRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(() => successCallback(), errorCallback, () =>
    makeDirectory(normalisePath(options.directoryPath), options.recursive === true));
});

chrome.fileSystemProvider.onCreateFileRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(() => successCallback(), errorCallback, () => createFile(normalisePath(options.filePath)));
});

chrome.fileSystemProvider.onDeleteEntryRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(() => successCallback(), errorCallback, () =>
    deletePath(normalisePath(options.entryPath), options.recursive === true));
});

chrome.fileSystemProvider.onMoveEntryRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(() => successCallback(), errorCallback, () =>
    transferPath(normalisePath(options.sourcePath), normalisePath(options.targetPath), true));
});

chrome.fileSystemProvider.onCopyEntryRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(() => successCallback(), errorCallback, () =>
    transferPath(normalisePath(options.sourcePath), normalisePath(options.targetPath), false));
});

chrome.fileSystemProvider.onOpenFileRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(() => successCallback(), errorCallback, async () => {
    const path = normalisePath(options.filePath);
    const entry = await requireEntry(path);
    if (entry.isDirectory) throw providerError('NOT_A_FILE', 'Cannot open a directory as a file.');
    if (options.mode !== 'READ' && options.mode !== 'WRITE') throw providerError('INVALID_OPERATION', 'Unknown open mode.');
    await writeHandle({ id: options.requestId, path, mode: options.mode });
  });
});

chrome.fileSystemProvider.onReadFileRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(result => successCallback(result.data, result.hasMore), errorCallback, async () => {
    const handle = await readHandle(options.openRequestId);
    if (!handle) throw providerError('NOT_FOUND', 'File handle not found.');
    if (handle.mode !== 'READ') throw providerError('ACCESS_DENIED', 'File was not opened for reading.');
    const entry = await requireEntry(handle.path);
    const bytes = new Uint8Array(entry.content || new ArrayBuffer(0));
    const offset = Math.min(Math.max(0, options.offset || 0), bytes.length);
    const length = Math.max(0, options.length || 0);
    const end = Math.min(bytes.length, offset + length);
    const chunk = bytes.slice(offset, end);
    return { data: chunk.buffer, hasMore: end < bytes.length };
  });
});

chrome.fileSystemProvider.onWriteFileRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(() => successCallback(), errorCallback, async () => {
    const handle = await readHandle(options.openRequestId);
    if (!handle) throw providerError('NOT_FOUND', 'File handle not found.');
    if (handle.mode !== 'WRITE') throw providerError('ACCESS_DENIED', 'File was not opened for writing.');
    const entry = await requireEntry(handle.path);
    if (entry.isDirectory) throw providerError('NOT_A_FILE', 'Cannot write to a directory.');
    const oldBytes = new Uint8Array(entry.content || new ArrayBuffer(0));
    const incoming = new Uint8Array(options.data || new ArrayBuffer(0));
    const offset = Math.max(0, options.offset || 0);
    const newLength = Math.max(oldBytes.length, offset + incoming.length);
    if (newLength > MAX_FILE_BYTES) throw providerError('NO_SPACE', 'File is larger than the local prototype limit.');
    const bytes = new Uint8Array(newLength);
    bytes.set(oldBytes);
    bytes.set(incoming, offset);
    entry.content = bytes.buffer;
    entry.size = bytes.byteLength;
    entry.modifiedAt = Date.now();
    await writeEntry(entry);
  });
});

chrome.fileSystemProvider.onTruncateRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(() => successCallback(), errorCallback, async () => {
    const path = normalisePath(options.filePath);
    const entry = await requireEntry(path);
    if (entry.isDirectory) throw providerError('NOT_A_FILE', 'Cannot truncate a directory.');
    const length = Number(options.length);
    if (!Number.isInteger(length) || length < 0 || length > MAX_FILE_BYTES) {
      throw providerError('NO_SPACE', 'Invalid or excessive file size.');
    }
    const bytes = new Uint8Array(length);
    bytes.set(new Uint8Array(entry.content || new ArrayBuffer(0)).slice(0, length));
    entry.content = bytes.buffer;
    entry.size = bytes.byteLength;
    entry.modifiedAt = Date.now();
    await writeEntry(entry);
  });
});

chrome.fileSystemProvider.onCloseFileRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(() => successCallback(), errorCallback, () => removeHandle(options.openRequestId));
});

chrome.fileSystemProvider.onUnmountRequested.addListener((options, successCallback, errorCallback) => {
  handleRequest(
    () => successCallback(),
    errorCallback,
    () => chrome.fileSystemProvider.unmount({ fileSystemId: options.fileSystemId })
  );
});

// Keep the root ready if ChromeOS restores the mounted provider after a restart.
ensureRoot().catch(error => console.error('MasterMine Drive storage is not ready:', error));