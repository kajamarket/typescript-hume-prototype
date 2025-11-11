import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HumeClient } from 'hume';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = new HumeClient({
      apiKey: process.env.HUME_API_KEY, // stored in Vercel environment
    });

    // Generate a temporary token (recommended for browser usage)
    const tokenInfo = await client.getEviToken({ configId: 'default' });
    res.status(200).json(tokenInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get token' });
  }
}
