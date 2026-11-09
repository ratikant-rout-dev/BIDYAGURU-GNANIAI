import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { SpeechEngine } from '../utils/speechEngine';
import { Waveform } from '../components/Waveform';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Compass,
  ArrowRight,
  Radio,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const TalkScreen = ({ onNavigate }) => {
  const { user, language, setLanguage } = useAuth();

  // Conversation state
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        language === 'hi-IN'
          ? 'नमस्ते! मैं बिद्या गुरु हूँ, आपका AI करियर व एजुकेशन मेंटर। आप 10वीं, 12वीं या कॉलेज में हैं—साइंस, कॉमर्स, आर्ट्स या टेक—किसी भी स्ट्रीम के बारे में मुझसे बात कर सकते हैं!'
          : language === 'or-IN'
            ? 'ନମସ୍କାର! ମୁଁ ବିଦ୍ୟା ଗୁରୁ, ଆପଣଙ୍କର AI କ୍ୟାରିଅର୍ ଓ ଏଜୁକେସନ୍ ମେଣ୍ଟର। ଆପଣ ୧୦ମ, ୧୨ଶ କିମ୍ବା କଲେଜରେ ଅଛନ୍ତି—ସାଇନ୍ସ, କମର୍ସ, ଆର୍ଟସ କିମ୍ବା ଟେକ୍—ଯେକୌଣସି ବିଷୟରେ ମୋତେ ପଚାରିପାରିବେ!'
            : 'Hello! I am Bidya Guru, your AI Career & Education Mentor. Whether you finished 10th, 12th, or college—in Commerce, Arts, Science, or Tech—I am here to guide your dream path!',
      audioUrl: null,
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micVolume, setMicVolume] = useState(0);

  // States: 'idle' | 'listening' | 'processing' | 'speaking'
  const [aiState, setAiState] = useState('idle');
  const [audioError, setAudioError] = useState('');

  // Voice recording & playback refs
  const speechEngineRef = useRef(null);
  const audioPlayerRef = useRef(new Audio());
  const chatScrollRef = useRef(null);

  // Quick prompt suggestions according to language (covering 10th/12th stream selection, Commerce, Arts, and Tech)
  const promptSuggestions = {
    'en-IN': [
      'I just completed 10th. What streams (Science, Commerce, Arts) are best for me?',
      'I want to study Commerce. What are the best career options and roadmap?',
      'I am interested in Arts & Civil Services (UPSC). How should I prepare?',
      'I want to become a Software Developer. What roadmap should I follow?',
    ],
    'hi-IN': [
      'मैंने अभी 10th पास किया है। मुझे साइंस, कॉमर्स या आर्ट्स में से क्या चुनना चाहिए?',
      'मुझे कॉमर्स पढ़ना है। इसमें कौन-कौन से करियर और रोडमैप हैं?',
      'मुझे आर्ट्स और सिविल सर्विसेज (UPSC/लॉ) की तैयारी करनी है।',
      'मुझे सॉफ्टवेयर डेवलपर बनना है। मुझे क्या सीखना होगा?',
    ],
    'or-IN': [
      'ମୁଁ ଏବେ ୧୦ମ ପାସ୍ କଲି। ମୋ ପାଇଁ ସାଇନ୍ସ, କମର୍ସ କିମ୍ବା ଆର୍ଟସ କେଉଁଟା ଭଲ?',
      'ମୋତେ କମର୍ସ ପଢ଼ିବାକୁ ଭଲଲାଗେ। ଏଥିରେ କଣ କ୍ୟାରିଅର୍ ଓ ରୋଡ୍‌ମ୍ୟାପ୍ ଅଛି?',
      'ମୁଁ ଆର୍ଟସ୍ ଏବଂ ସିଭିଲ୍ ସର୍ଭିସେସ୍ (UPSC) ପାଇଁ ପ୍ରସ୍ତୁତ ହେବାକୁ ଚାହୁଁଛି।',
      'ମୁଁ ସଫ୍ଟୱେର୍ ଡେଭଲପର ହେବାକୁ ଚାହୁଁଛି। ମୋତେ କଣ ଶିଖିବାକୁ ପଡିବ?',
    ],
  };

  // Scroll to bottom on new message or live transcript
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, aiState, liveTranscript]);

  // Audio player listener
  useEffect(() => {
    const audio = audioPlayerRef.current;
    audio.onended = () => {
      setAiState('idle');
    };
    audio.onerror = () => {
      setAiState('idle');
    };
    return () => {
      audio.pause();
      if (speechEngineRef.current) {
        speechEngineRef.current.stopListening().catch(() => { });
      }
    };
  }, []);

  const playVoiceAudio = (audioSrc) => {
    if (!audioSrc) return;
    try {
      const audio = audioPlayerRef.current;
      audio.src = audioSrc;
      setAiState('speaking');
      audio.play().catch((err) => {
        console.warn('Audio play request interrupted:', err);
        setAiState('idle');
      });
    } catch (e) {
      setAiState('idle');
    }
  };

  const stopVoiceAudio = () => {
    const audio = audioPlayerRef.current;
    audio.pause();
    setAiState('idle');
  };

  // Send message to voice mentorship pipeline
  const handleSendMessage = async (textToSend) => {
    const userText = (textToSend || inputMessage).trim();
    if (!userText || aiState === 'processing') return;

    setInputMessage('');
    setLiveTranscript('');
    setAudioError('');

    // Append student message
    const studentMsg = {
      id: `student_${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, studentMsg]);
    setAiState('processing');

    try {
      const history = messages.slice(-5).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'student',
        text: m.text,
      }));

      // Call backend conversational voice endpoint (Gemini Brain + Gnani Voice)
      const data = await api.voice.chat(userText, language, history);

      if (data.success && data.replyText) {
        const assistantMsg = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          text: data.replyText,
          audioUrl: data.audioBase64,
          followUpQuestions: data.followUpQuestions || [],
          roadmapGenerated: data.roadmapGenerated,
          roadmap: data.roadmap,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (data.roadmapGenerated) {
          try {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch (e) { }
        }

        // Play Gnani synthesized voice
        if (data.audioBase64) {
          playVoiceAudio(data.audioBase64);
        } else {
          setAiState('idle');
        }
      } else {
        throw new Error(data.message || 'No response generated');
      }
    } catch (err) {
      console.error('Voice conversation error:', err);
      setAudioError('Unable to process voice right now. Please try again.');
      setAiState('idle');
    }
  };

  // Start Voice Capture with Dual-Engine
  const startRecording = async () => {
    setAudioError('');
    setLiveTranscript('');

    const engine = new SpeechEngine({
      language,
      onInterimTranscript: (text) => {
        setLiveTranscript(text);
      },
      onVolumeChange: (vol) => {
        setMicVolume(vol);
      },
      onError: (err) => {
        setAudioError(err);
        setAiState('idle');
      },
    });

    speechEngineRef.current = engine;

    try {
      await engine.startListening();
      setAiState('listening');
    } catch (e) {
      setAiState('idle');
    }
  };

  // Stop Voice Capture and evaluate recognized speech
  const stopRecording = async () => {
    if (!speechEngineRef.current) return;
    setAiState('processing');

    try {
      const transcript = await speechEngineRef.current.stopListening();
      speechEngineRef.current = null;
      setMicVolume(0);

      const captured = transcript || liveTranscript;

      if (captured && captured.trim()) {
        await handleSendMessage(captured.trim());
      } else {
        setAudioError(
          language === 'hi-IN'
            ? 'कोई आवाज सुनाई नहीं दी। कृपया माइक्रोफ़ोन के करीब बोलें या टेक्स्ट टाइप करें।'
            : language === 'or-IN'
              ? 'ସ୍ୱର ଶୁଣାଗଲା ନାହିଁ। ଦୟାକରି ମାଇକ୍ ନିକଟରେ କୁହନ୍ତୁ କିମ୍ବା ଟାଇପ୍ କରନ୍ତୁ।'
              : 'No speech detected. Please speak clearly into your microphone or type your question below.'
        );
        setAiState('idle');
      }
    } catch (err) {
      console.error('Stop listening error:', err);
      setAudioError('Voice capture error. You can also type your message below.');
      setAiState('idle');
    }
  };

  const toggleRecording = () => {
    if (aiState === 'listening') {
      stopRecording();
    } else if (aiState === 'speaking') {
      stopVoiceAudio();
    } else {
      startRecording();
    }
  };

  const currentSuggestions =
    promptSuggestions[language] || promptSuggestions['en-IN'];

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col bg-slate-50">
      {/* Top Experience Subheader */}
      <div className="px-4 sm:px-6 md:px-8 py-3 bg-white border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Voice-to-Voice AI Career Mentor
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Dual-Engine Speech Recognition (Real-Time Web Speech + Gnani Vachana STT)
            </p>
          </div>
        </div>

        {/* AI State Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Waveform Visualizer */}
          <Waveform
            isListening={aiState === 'listening'}
            isSpeaking={aiState === 'speaking'}
            isProcessing={aiState === 'processing'}
            volume={micVolume}
          />

          <div className="flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold">
            {aiState === 'listening' && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[11px]">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Hearing you...</span>
              </div>
            )}
            {aiState === 'processing' && (
              <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full text-[11px]">
                <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Thinking...</span>
              </div>
            )}
            {aiState === 'speaking' && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span>Speaking...</span>
              </div>
            )}
            {aiState === 'idle' && (
              <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Microphone Ready</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6" ref={chatScrollRef}>
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${msg.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-100'
                  }`}
              >
                {msg.role === 'user' ? (user?.name ? user.name[0] : 'S') : '🎓'}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl p-3.5 sm:p-4.5 text-xs sm:text-sm leading-relaxed shadow-xs ${msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
              >
                <div className="flex items-center justify-between mb-1 text-[11px] font-semibold opacity-70">
                  <span>{msg.role === 'user' ? 'You' : 'Bidya Guru AI'}</span>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Interactive Generated Roadmap Card */}
                {msg.role === 'assistant' && msg.roadmapGenerated && msg.roadmap && (
                  <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-violet-50 to-emerald-50 border border-indigo-200 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-indigo-600" />
                        Personalized Career Roadmap Ready!
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {msg.roadmap.roadmapItems?.length || 6} Milestones
                      </span>
                    </div>
                    <p className="text-xs text-indigo-900">
                      Goal: <span className="font-extrabold">{msg.roadmap.targetGoal || 'Web Developer'}</span>
                    </p>
                    <button
                      onClick={() => onNavigate('roadmap')}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Explore Your Interactive Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Follow-up Questions from AI Mentor */}
                {msg.role === 'assistant' && msg.followUpQuestions?.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-indigo-500" />
                      Follow-up Questions:
                    </span>
                    <ul className="space-y-1">
                      {msg.followUpQuestions.map((q, qidx) => (
                        <li key={qidx} className="text-xs text-slate-700 font-medium flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold">?</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Quick Reply Chips */}
                    <div className="pt-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
                        Tap to answer or speak into mic:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(language === 'hi-IN'
                          ? [
                            'मुझे बेसिक HTML और CSS आता है',
                            'मैं बिल्कुल शुरुआत से सीख रहा हूँ',
                            'मैं रोजाना 2 घंटे दे सकता हूँ',
                            'मेरा लक्ष्य 90 दिनों में पूरा करना है',
                          ]
                          : language === 'or-IN'
                            ? [
                              'ମୋତେ HTML ଏବଂ CSS ଆସେ',
                              'ମୁଁ ସମ୍ପୂର୍ଣ୍ଣ ବିଗିନର୍',
                              'ମୁଁ ପ୍ରତିଦିନ ୨ ଘଣ୍ଟା ଦେବି',
                              'ମୋର ଟାର୍ଗେଟ୍ ୩ ମାସ',
                            ]
                            : [
                              'I know basic HTML & CSS',
                              'I am a complete beginner',
                              'I can dedicate 2 hours daily',
                              'My target is 90 days (3 months)',
                            ]
                        ).map((replyText, ridx) => (
                          <button
                            key={ridx}
                            onClick={() => handleSendMessage(replyText)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                          >
                            {replyText}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Voice Replay button for assistant messages */}
                {msg.role === 'assistant' && msg.audioUrl && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => playVoiceAudio(msg.audioUrl)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Replay Voice (Gnani TTS)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Live Interim Transcript Bubble while User is Speaking */}
          {aiState === 'listening' && (
            <div className="flex items-start gap-3.5 flex-row-reverse">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                🎙️
              </div>
              <div className="max-w-xl rounded-2xl rounded-tr-none p-4 bg-rose-50/80 border border-rose-200 text-rose-900 text-sm shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-600">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>Hearing You Speak...</span>
                </div>
                <p className="font-medium italic">
                  {liveTranscript || 'Listening to your voice... Speak now.'}
                </p>
              </div>
            </div>
          )}

          {aiState === 'processing' && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                🎓
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-xs text-slate-500 shadow-xs">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
                <span className="ml-1 font-medium">Understanding career context & synthesizing voice...</span>
              </div>
            </div>
          )}

          {audioError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{audioError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Starter Chips */}
      <div className="px-3.5 sm:px-6 md:px-8 py-2 bg-white/70 border-t border-slate-100 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Quick Prompts:
          </span>
          {currentSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={aiState === 'processing' || aiState === 'listening'}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] sm:text-xs text-slate-600 border border-slate-200/60 whitespace-nowrap transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Interaction & Input Dock */}
      <div className="p-3 sm:p-4 md:p-6 bg-white border-t border-slate-200 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-2.5 sm:gap-4">
          {/* Main Large Glowing Microphone Button */}
          <button
            onClick={toggleRecording}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shrink-0 shadow-md cursor-pointer ${aiState === 'listening'
                ? 'bg-rose-500 text-white animate-voice-pulse shadow-rose-200 ring-4 ring-rose-300'
                : aiState === 'speaking'
                  ? 'bg-emerald-500 text-white shadow-emerald-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            title={
              aiState === 'listening'
                ? 'Click to stop speaking and send'
                : aiState === 'speaking'
                  ? 'Click to pause voice playback'
                  : 'Click to speak with Bidya Guru'
            }
          >
            {aiState === 'listening' ? (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            ) : aiState === 'speaking' ? (
              <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>

          {/* Text Input for Hybrid Convenience */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                aiState === 'listening'
                  ? 'Listening... Speak now, then click mic to send'
                  : 'Speak through microphone or type your question...'
              }
              disabled={aiState === 'listening'}
              className="w-full pl-3.5 sm:pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-xs sm:text-sm transition-all"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || aiState === 'processing'}
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-2 sm:mt-3 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
            16kHz speech calibrated
          </span>
          <span>Click mic to speak</span>
        </div>
      </div>
    </div>
  );
};
