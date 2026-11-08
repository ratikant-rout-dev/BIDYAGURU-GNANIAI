/**
 * Production-grade Web Audio API 16kHz Linear PCM WAV Recorder
 * Produces genuine RIFF WAVE PCM 16kHz mono audio blobs with accurate headers.
 * Also provides real-time RMS audio volume levels for responsive visualizers.
 */

export class PcmAudioRecorder {
  constructor(options = {}) {
    this.targetSampleRate = options.sampleRate || 16000;
    this.onVolumeChange = options.onVolumeChange || (() => {});
    this.audioContext = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.processorNode = null;
    this.analyserNode = null;
    this.pcmChunks = [];
    this.isRecording = false;
  }

  async start() {
    this.pcmChunks = [];

    // Request high-quality speech microphone input
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass();

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

    // Analyser node for live volume metering
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.sourceNode.connect(this.analyserNode);

    // ScriptProcessor to capture raw PCM audio buffer samples
    const bufferSize = 4096;
    this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

    this.processorNode.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const inputData = e.inputBuffer.getChannelData(0);
      this.pcmChunks.push(new Float32Array(inputData));

      // Calculate audio RMS level (0 - 100)
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      const volume = Math.min(100, Math.round(rms * 250));
      this.onVolumeChange(volume);
    };

    this.sourceNode.connect(this.processorNode);
    // Connect to destination to ensure audio process event fires
    this.processorNode.connect(this.audioContext.destination);

    this.isRecording = true;
  }

  async stop() {
    this.isRecording = false;
    this.onVolumeChange(0);

    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    const currentSampleRate = this.audioContext ? this.audioContext.sampleRate : 44100;
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
      this.audioContext = null;
    }

    // Merge all recorded float chunks
    let totalLength = 0;
    for (const chunk of this.pcmChunks) {
      totalLength += chunk.length;
    }

    const mergedBuffer = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.pcmChunks) {
      mergedBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Downsample to 16,000 Hz if recorded at 44.1k/48k
    const downsampledBuffer = this.downsampleBuffer(
      mergedBuffer,
      currentSampleRate,
      this.targetSampleRate
    );

    // Encode to 16-bit Mono WAV with standard 44-byte RIFF header
    const wavBlob = this.encodeWAV(downsampledBuffer, this.targetSampleRate);
    return wavBlob;
  }

  downsampleBuffer(buffer, sourceRate, targetRate) {
    if (sourceRate === targetRate) {
      return buffer;
    }
    const ratio = sourceRate / targetRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    /* RIFF identifier */
    this.writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    this.writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    this.writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw PCM = 1) */
    view.setUint16(20, 1, true);
    /* channel count (1 = mono) */
    view.setUint16(22, 1, true);
    /* sample rate (16000) */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sampleRate * blockAlign) */
    view.setUint32(28, sampleRate * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 2, true);
    /* bits per sample (16 bit) */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    this.writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    // Float32 to 16-bit Signed PCM
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

