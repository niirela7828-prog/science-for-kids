import { clearPhotos, countPhotos, deletePhoto, getPhoto, savePhoto } from '../lib/photos';

describe('photos are stored on the device (IndexedDB)', () => {
  beforeEach(async () => {
    await clearPhotos();
  });

  it('saves, reads, counts and deletes', async () => {
    await savePhoto('a', new Blob(['hello'], { type: 'text/plain' }));
    await savePhoto('b', new Blob(['world'], { type: 'text/plain' }));
    expect(await countPhotos()).toBe(2);
    const blob = await getPhoto('a');
    expect(blob).toBeTruthy();
    await deletePhoto('a');
    expect(await getPhoto('a')).toBeUndefined();
    expect(await countPhotos()).toBe(1);
    await clearPhotos();
    expect(await countPhotos()).toBe(0);
  });
});
