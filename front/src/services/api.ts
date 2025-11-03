const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export async function generate({ prompt, guidanceScale = 15.0, steps = 64, frameSize = 256 }:
  { prompt: string; guidanceScale?: number; steps?: number; frameSize?: number; }) {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, guidanceScale, steps, frameSize }),
  });

  const contentType = res.headers.get('Content-Type');
  const body = contentType && contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = body === 'string'
      ? `HTTP ${res.status}: ${body}`
      : `HTTP ${res.status}: ${body?.error || 'Request failed'}`;
    throw new Error(message);
  }
  
  return body;
}