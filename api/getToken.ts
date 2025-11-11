// api/getToken.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HumeClient } from 'hume';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = new HumeClient({ apiKey: process.env.HUME_API_KEY });
    const tokenInfo = await client.getEviToken({ configId: 'default' });
    res.status(200).json(tokenInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get token' });
  }
}
