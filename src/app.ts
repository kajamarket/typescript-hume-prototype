import { HumeClient, EVIWebAudioPlayer, startAudioCapture } from 'hume';
import type { SubscribeEvent } from 'hume/api/resources/empathicVoice/resources/chat';

let socket: any;
let recorder: MediaRecorder | null = null;
let player: EVIWebAudioPlayer | null = null;

async function init() {
  // 1. Fetch temporary token from Vercel serverless
  const res = await fetch('/api/getToken');
  const tokenData = await res.json();
  const { token } = tokenData;

  // 2. Initialize Hume client with token
  const client = new HumeClient({ token });

  // 3. Connect to EVI
  socket = await client.empathicVoice.chat.connect({ configId: 'default' });

  // 4. Setup audio player
  player = new EVIWebAudioPlayer();
  await player.init();

  // 5. Event handlers
  socket.on('open', async () => {
    console.log('WebSocket opened');
    recorder = await startAudioCapture(socket);
  });

  socket.on('message', async (msg: SubscribeEvent) => {
    switch (msg.type) {
      case 'audio_output':
        await player?.enqueue(msg);
        break;
      case 'user_interruption':
        player?.stop();
        break;
    }
  });

  socket.on('error', (err) => console.error('Socket error', err));
  socket.on('close', () => {
    console.log('Socket closed');
    recorder?.stream.getTracks().forEach((t) => t.stop());
    recorder = null;
    player?.dispose();
  });
}

// Start button
document.getElementById('start')?.addEventListener('click', () => init());

// Stop button
document.getElementById('stop')?.addEventListener('click', () => {
  socket?.close();
});
