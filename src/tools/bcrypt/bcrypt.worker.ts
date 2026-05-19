import { hashSync } from 'bcryptjs';

self.onmessage = (e: MessageEvent<{ text: string; salt: number }>) => {
  const { text, salt } = e.data;
  try {
    const result = hashSync(text, salt);
    self.postMessage({ result, error: null });
  }
  catch (err: unknown) {
    self.postMessage({ result: null, error: String(err) });
  }
};
