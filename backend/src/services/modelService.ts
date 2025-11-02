import axios from 'axios';

const MODEL_SERVER_URL = process.env.MODEL_SERVER_URL || 'http://model-server:5000';

export async function callModelServer({ prompt, guidanceScale, steps, frameSize }:
  { prompt: string, guidanceScale: number, steps: number, frameSize: number }) {
  const url = `${MODEL_SERVER_URL}/generate`;
  const { data } = await axios.post(url, { prompt, guidanceScale, steps, frameSize }, { timeout: 1000 * 60 * 30 });
  return data as { id: string };
}