// Photos are kept ONLY on this device, in IndexedDB. Nothing is uploaded.
const DB_NAME = 'science-kids-photos';
const STORE = 'photos';

export interface PhotoRecord {
  id: string;
  blob: Blob;
  at: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    let result: T;
    req.onsuccess = () => {
      result = req.result;
    };
    t.oncomplete = () => {
      db.close();
      resolve(result);
    };
    t.onerror = () => {
      db.close();
      reject(t.error);
    };
  });
}

export async function savePhoto(id: string, blob: Blob): Promise<void> {
  await tx('readwrite', (s) => s.put({ id, blob, at: Date.now() } satisfies PhotoRecord));
}

export async function getPhoto(id: string): Promise<Blob | undefined> {
  const rec = (await tx('readonly', (s) => s.get(id))) as PhotoRecord | undefined;
  return rec?.blob;
}

export async function deletePhoto(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id));
}

export async function clearPhotos(): Promise<void> {
  await tx('readwrite', (s) => s.clear());
}

export async function countPhotos(): Promise<number> {
  return tx('readonly', (s) => s.count());
}

/** Shrinks a camera photo so the device doesn't fill up. Falls back to the original. */
export async function shrinkImage(file: Blob, maxSide = 1024): Promise<Blob> {
  try {
    if (typeof createImageBitmap !== 'function') return file;
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);
    const out = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.82));
    return out ?? file;
  } catch {
    return file;
  }
}
