import React, { useState } from 'react';
import { generate } from '../services/api';

export default function Chat({ onResult }: { onResult: (res: any) => void }) {
  const [prompt, setPrompt] = useState('a low‑poly dolphin with tiny wings');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await generate({ prompt });
      console.log('Got result:', res);
      
      onResult(res);
    } catch (err: any) {
      console.log("It is here");
      
      setError(err?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label style={{ display: 'block', marginBottom: 8 }}>Prompt</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        style={{ width: '100%', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <button type="submit" disabled={busy}>
          {busy ? 'Generating… (this can take a bit)' : 'Generate'}
        </button>
        {error && <span style={{ color: 'crimson' }}>{error}</span>}
      </div>
      <p style={{ color: '#666', marginTop: 6, fontSize: 12 }}>Tip: be descriptive (style, material, color, shape)</p>
    </form>
  );
}