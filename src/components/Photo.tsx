import { useEffect, useRef, useState } from 'react';
import { getPhoto, savePhoto, shrinkImage } from '../lib/photos';
import { newId } from '../lib/progress';
import { BigButton } from './ui';

/** Shows a photo saved on the device */
export function PhotoView({ id, className = '' }: { id: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let u: string | null = null;
    let alive = true;
    getPhoto(id)
      .then((blob) => {
        if (blob && alive) {
          u = URL.createObjectURL(blob);
          setUrl(u);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
      if (u) URL.revokeObjectURL(u);
    };
  }, [id]);
  if (!url) return <div className={`flex items-center justify-center bg-stone-100 text-4xl ${className}`}>📷</div>;
  return <img src={url} alt="תמונה שצילמת" className={`object-cover ${className}`} />;
}

/**
 * Take a photo with the device camera (or pick one). The photo is saved
 * only on this device. Calls onSaved(photoId).
 */
export function PhotoCapture({ photoId, onSaved }: { photoId?: string; onSaved: (id: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(false);
    try {
      const small = await shrinkImage(file);
      const id = `photo-${newId()}`;
      await savePhoto(id, small);
      onSaved(id);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="space-y-3 text-center">
      {photoId && <PhotoView id={photoId} className="mx-auto h-56 w-full max-w-sm rounded-2xl" />}
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        data-testid="photo-input"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <BigButton variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? 'שומרת…' : photoId ? '📷 לצלם שוב' : '📷 לצלם'}
      </BigButton>
      {error && <p className="text-amber-700">לא הצלחנו לשמור את התמונה. אפשר לנסות שוב.</p>}
    </div>
  );
}
