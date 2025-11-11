// src/app.ts
import { HumeClient, EVIWebAudioPlayer, startAudioCapture } from 'hume';
import type { SubscribeEvent } from 'hume/api/resources/empathicVoice/resources/chat';
import type { AppState, ConnectionState } from './types';

let socket: any;
let recorder: MediaRecorder | null = null;
let player: EVIWebAudioPlayer | null = null;

const connectionStatusEl = document.getElementById('connection-status')!;
const micStatusEl = document.getElementById('mic-status')!;
const transcriptEl = document.getElementById('transcript')!;

let appState: AppState = 'idle';
let connectionState: ConnectionState = 'disconnected';

function setMicStatus(state: AppState) {
  appState = state;
  micStatusEl.textContent = state;
  micStatusEl.className = state;
}

function setConnectionStatus(state: ConnectionState) {
  connectionState = state;
  connectionStatusEl.textContent = state;
  connectionStatusEl.className = state;
}

function appendTranscript(text: string) {
  const p = document.createElement('p');
  p.textContent = text;
  transcriptEl.appendChild(p);
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

async function init() {
  setConnectionStatus('connecting');

  // 1. Get temporary token from serverless endpoint
  const res = await fetch('/api/getToken');
  const tokenData = await res.json();
  const { token } = tokenData;

  // 2. Initialize Hume client with token
  const client = new HumeClient({ token });

  // 3. Connect to EVI
  socket = await client.empathicVoice.chat.connect({ configId: 'default' });

  // 4. Initialize audio player
  player = new EVIWebAudioPlayer();

  // 5. WebSocket event handlers
  socket.on('open', async () => {
    console.log('WebSocket opened');
    setConnectionStatus('connected');

    // Start capturing audio
    recorder = await startAudioCapture(socket);
    setMicStatus('listening');

    // Initialize audio player
    await player?.init();
  });

  socket.on('message', async (msg: SubscribeEvent) => {
    switch (msg.type) {
      case 'audio_output':
        await player?.enqueue(msg);
        if ((msg as any).text) appendTranscript((msg as any).text);
        break;
      case 'user_interruption':
        player?.stop();
        setMicStatus('listening');
        break;
    }
  });

  socket.on('error', (err) => console.error('Socket error', err));

  socket.on('close', () => {
    console.log('Socket closed');
    setConnectionStatus('disconnected');
    setMicStatus('idle');
    recorder?.stream.getTracks().forEach((t) => t.stop());
    recorder = null;
    player?.dispose();
  });
}

// Start and Stop buttons
document.getElementById('start')?.addEventListener('click', () => init());
document.getElementById('stop')?.addEventListener('click', () => {
  socket?.close();
});
