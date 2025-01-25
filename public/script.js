const socket = io();

// Host captures audio
document.getElementById('startCapture').addEventListener('click', async () => {
  const status = document.getElementById('status');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    status.textContent = 'Broadcasting audio...';

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(1024, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      const audioData = e.inputBuffer.getChannelData(0);
      socket.emit('audio-stream', audioData); // Send audio data to server
    };
  } catch (err) {
    status.textContent = 'Error accessing audio: ' + err.message;
  }
});

// Client receives and plays audio
socket.on('play-audio', (audioData) => {
  const audioBuffer = new Float32Array(audioData);
  const audioContext = new AudioContext();

  const buffer = audioContext.createBuffer(1, audioBuffer.length, audioContext.sampleRate);
  buffer.copyToChannel(audioBuffer, 0);

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
});
