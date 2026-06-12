import { hashSync } from 'bcryptjs';

globalThis.onmessage = (e: MessageEvent<{ text: string; salt: number }>) => {
  const { text, salt } = e.data;
  try {
    const result = hashSync(text, salt);
    globalThis.postMessage({ result, error: null });
  }
  catch (err: unknown) {
    globalThis.postMessage({ result: null, error: String(err) });
  }
};
