import { PcmAudioRecorder } from './audioRecorder';
import { api } from '../api';

/**
 * Dual-Engine Hybrid Speech Pipeline
 * 1. Web Speech API for real-time live interim transcription & instant zero-latency speech capture.
 * 2. 16kHz PCM WAV Audio Recording + Gnani Vachana Cloud STT for high-fidelity fallback & Odia/Indic speech recognition.
 */
export class SpeechEngine {
  constructor(options = {}) {
    this.language = options.language || 'en-IN';
    this.onInterimTranscript = options.onInterimTranscript || (() => {});
    this.onFinalTranscript = options.onFinalTranscript || (() => {});
    this.onVolumeChange = options.onVolumeChange || (() => {});
    this.onError = options.onError || (() => {});

    this.pcmRecorder = null;
    this.speechRecognition = null;
    this.recognizedText = '';
    this.isListening = false;
  }

  isSpeechRecognitionSupported() {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  async startListening() {
    this.recognizedText = '';
    this.isListening = true;

    // 1. Start Web Speech Recognition if available for live real-time transcription
    if (this.isSpeechRecognitionSupported()) {
      try {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.speechRecognition = new SpeechRec();
        this.speechRecognition.continuous = true;
        this.speechRecognition.interimResults = true;
        this.speechRecognition.lang = this.language;

        this.speechRecognition.onresult = (event) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              this.recognizedText += ' ' + transcript;
            } else {
              interim += transcript;
            }
          }
          const fullCurrent = (this.recognizedText + ' ' + interim).trim();
          if (fullCurrent) {
            this.onInterimTranscript(fullCurrent);
          }
        };

        this.speechRecognition.onerror = (err) => {
          console.warn('[WebSpeech Error/Ignored]', err.error);
        };

        this.speechRecognition.start();
      } catch (recErr) {
        console.warn('[WebSpeech Init Warning]', recErr.message);
      }
    }

    // 2. Start Raw 16kHz Linear PCM Audio Recording (for Gnani Vachana STT)
    try {
      this.pcmRecorder = new PcmAudioRecorder({
        sampleRate: 16000,
        onVolumeChange: (vol) => {
          this.onVolumeChange(vol);
        },
      });
      await this.pcmRecorder.start();
    } catch (micErr) {
      this.isListening = false;
      this.onError(
        micErr.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser address bar.'
          : 'Could not access microphone: ' + micErr.message
      );
      throw micErr;
    }
  }

  async stopListening() {
    if (!this.isListening) return '';
    this.isListening = false;

    // Stop Web Speech Recognition
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch (e) {}
      this.speechRecognition = null;
    }

    // Stop PCM audio recording and obtain true 16kHz WAV Blob
    let wavBlob = null;
    if (this.pcmRecorder) {
      try {
        wavBlob = await this.pcmRecorder.stop();
      } catch (recStopErr) {
        console.warn('[PCM Stop Warning]', recStopErr);
      }
      this.pcmRecorder = null;
    }

    let finalTranscript = this.recognizedText.trim();

    // If Web Speech already captured high-confidence text, use it
    if (finalTranscript) {
      this.onFinalTranscript(finalTranscript);
      return finalTranscript;
    }

    // Otherwise, or for Odia/Indic languages, send the 16kHz WAV Blob to Gnani Vachana Cloud STT
    if (wavBlob && wavBlob.size > 1000) {
      try {
        const result = await api.voice.transcribe(wavBlob, this.language);
        if (result.success && result.transcript) {
          finalTranscript = result.transcript.trim();
        }
      } catch (cloudSttErr) {
        console.warn('[Gnani STT Cloud Error]', cloudSttErr);
      }
    }

    if (finalTranscript) {
      this.onFinalTranscript(finalTranscript);
      return finalTranscript;
    }

    return '';
  }
}

