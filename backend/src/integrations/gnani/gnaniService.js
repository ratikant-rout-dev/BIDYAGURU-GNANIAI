const config = require('../../config/env');

const GNANI_API_KEY = config.gnani.apiKey;
const GNANI_BASE_URL = config.gnani.baseUrl || 'https://api.vachana.ai';

const VOICE_MAP = {
  'en-IN': { voice: 'Deepak', model: 'timbre-v2.5' },
  'hi-IN': { voice: 'Deepak', model: 'timbre-v2.5' },
  'or-IN': { voice: 'Nalini', model: 'timbre-v2.5' },
};

// Gnani Vachana STT supported language mappings: as-IN, bn-IN, en-IN, gu-IN, hi-IN, indic-auto, kn-IN, ml-IN, mr-IN, pa-IN, ta-IN, te-IN
const STT_LANG_MAP = {
  'en-IN': 'en-IN',
  'hi-IN': 'hi-IN',
  'or-IN': 'indic-auto',
  'od-IN': 'indic-auto',
};

/**
 * Transcribe audio using Gnani Vachana STT
 * @param {Buffer} audioBuffer - Audio file buffer (wav/mp3/webm)
 * @param {string} originalName - Original filename
 * @param {string} languageCode - 'en-IN' | 'hi-IN' | 'or-IN'
 */
const transcribeAudio = async (audioBuffer, originalName = 'audio.wav', languageCode = 'en-IN') => {
  if (!GNANI_API_KEY) {
    throw new Error('GNANI_API_KEY is not configured');
  }

  const mappedLanguage = STT_LANG_MAP[languageCode] || 'en-IN';

  try {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    formData.append('audio_file', blob, originalName || 'audio.wav');
    formData.append('language_code', mappedLanguage);

    const response = await fetch(`${GNANI_BASE_URL}/stt/v3`, {
      method: 'POST',
      headers: {
        'X-API-Key-ID': GNANI_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Gnani STT Warning] ${response.status}: ${errText}`);
      return {
        success: false,
        error: `Gnani STT error: ${response.statusText}`,
        transcript: '',
      };
    }

    const data = await response.json();
    const transcript =
      data.transcript ||
      data.output?.literal ||
      data.text ||
      (data.results && data.results[0]?.transcript) ||
      '';

    return {
      success: true,
      transcript: transcript.trim(),
      raw: data,
    };
  } catch (error) {
    console.error('[Gnani STT Exception]', error.message);
    return {
      success: false,
      error: error.message,
      transcript: '',
    };
  }
};

/**
 * Synthesize speech using Gnani Vachana TTS
 * @param {string} text - Text to speak
 * @param {string} languageCode - 'en-IN' | 'hi-IN' | 'or-IN'
 * @param {string} preferredVoice - Voice name
 */
const synthesizeSpeech = async (text, languageCode = 'en-IN', preferredVoice = null) => {
  if (!GNANI_API_KEY) {
    throw new Error('GNANI_API_KEY is not configured');
  }

  const voiceConfig = VOICE_MAP[languageCode] || VOICE_MAP['en-IN'];
  const voice = preferredVoice || voiceConfig.voice;
  const model = voiceConfig.model;

  // Clean text of markdown asterisks or special characters for cleaner speech
  const cleanText = text
    .replace(/[*#_`~[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1000); // Gnani character batch safety

  const response = await fetch(`${GNANI_BASE_URL}/api/v1/tts/inference`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key-ID': GNANI_API_KEY,
    },
    body: JSON.stringify({
      text: cleanText,
      voice: voice,
      language: languageCode,
      model: model,
      speed: 1.0,
      audio_config: {
        encoding: 'linear_pcm',
        container: 'wav',
        sample_rate: 24000,
        num_channels: 1,
        sample_width: 2,
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gnani TTS failed (${response.status}): ${errBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

module.exports = {
  transcribeAudio,
  synthesizeSpeech,
  VOICE_MAP,
};

