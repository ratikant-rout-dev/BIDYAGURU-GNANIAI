import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { SpeechEngine } from '../utils/speechEngine';
import { Waveform } from '../components/Waveform';
import {
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  History,
  TrendingUp,
  Radio,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export const CommunicationScreen = () => {
  const { user, language } = useAuth();

  const getWelcomeText = () => {
    switch (language) {
      case 'hi-IN':
        return 'नमस्ते! मैं आपका AI कम्युनिकेशन और इंटरव्यू कोच हूँ। शुरुआत करने के लिए "नमस्ते" या "हेलो" बोलें, या बताएं कि आप किस विषय का अभ्यास करना चाहते हैं (जैसे सेल्फ इंट्रोडक्शन, इंटरव्यू, या प्रोजेक्ट)।';
      case 'or-IN':
        return 'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର AI କମ୍ୟୁନିକେସନ୍ କୋଚ୍। କଥା ଆରମ୍ଭ କରିବା ପାଇଁ "ନମସ୍କାର" କୁହନ୍ତୁ, କିମ୍ବା ଆପଣ କେଉଁ ବିଷୟ ଅଭ୍ୟାସ କରିବେ ଜଣାନ୍ତୁ (ଯେପରି ସେଲ୍ଫ୍ ଇଣ୍ଟ୍ରୋଡକ୍ସନ୍ ବା ଇଣ୍ଟରଭ୍ୟୁ)।';
      default:
        return 'Hello! I am your AI Communication & Interview Coach. To begin our conversation, just say "Hello" or tell me what you want to practice today: Self-Introduction, Mock Tech Interview, Project Walkthrough, or Career Motivation.';
    }
  };

  const [messages, setMessages] = useState([
    {
      id: 'welcome_coach',
      role: 'assistant',
      text: getWelcomeText(),
      audioUrl: null,
      feedback: null,
      suggestedChips:
        language === 'hi-IN'
          ? ['👋 हेलो', 'सेल्फ इंट्रोडक्शन', 'मॉक इंटरव्यू', 'प्रोजेक्ट वॉकथ्रू']
          : language === 'or-IN'
            ? ['👋 ନମସ୍କାର', 'ସେଲ୍ଫ୍ ଇଣ୍ଟ୍ରୋଡକ୍ସନ୍', 'ମକ୍ ଇଣ୍ଟରଭ୍ୟୁ', 'ପ୍ରୋଜେକ୍ଟ ୱାକ୍‌ଥ୍ରୁ']
            : ['👋 Say Hello', 'Self Introduction', 'next study', 'carrier road map', 'Mock Tech Interview', 'Project Walkthrough'],
      timestamp: new Date(),
    },
  ]);

  const [activeTopic, setActiveTopic] = useState(null);
  const [inputText, setInputText] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micVolume, setMicVolume] = useState(0);

  // States: 'idle' | 'listening' | 'processing' | 'speaking'
  const [coachState, setCoachState] = useState('idle');
  const [audioError, setAudioError] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const speechEngineRef = useRef(null);
  const audioPlayerRef = useRef(new Audio());
  const chatScrollRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, coachState, liveTranscript]);

  // Audio player listeners
  useEffect(() => {
    const audio = audioPlayerRef.current;
    audio.onended = () => {
      setCoachState('idle');
    };
    audio.onerror = () => {
      setCoachState('idle');
    };
    return () => {
      audio.pause();
      if (speechEngineRef.current) {
        speechEngineRef.current.stopListening().catch(() => { });
      }
    };
  }, []);

  // Load history list
  const loadHistory = async () => {
    try {
      const res = await api.communication.getHistory();
      if (res.success) {
        setHistoryList(res.history || []);
      }
    } catch (e) {
      console.warn('Load history failed:', e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const playVoiceAudio = (audioSrc) => {
    if (!audioSrc) return;
    try {
      const audio = audioPlayerRef.current;
      audio.src = audioSrc;
      setCoachState('speaking');
      audio.play().catch((err) => {
        console.warn('Audio play interrupted:', err);
        setCoachState('idle');
      });
    } catch (e) {
      setCoachState('idle');
    }
  };

  const stopVoiceAudio = () => {
    const audio = audioPlayerRef.current;
    audio.pause();
    setCoachState('idle');
  };

  // Conversational back-and-forth speech & message handler
  const handleSendConversationMessage = async (rawText) => {
    const messageToSend = (rawText || inputText).trim();
    if (!messageToSend || coachState === 'processing') return;

    setInputText('');
    setLiveTranscript('');
    setAudioError('');

    // Append student bubble
    const userBubble = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userBubble]);
    setCoachState('processing');

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'student',
        text: m.text,
      }));

      // Call conversational communication coach endpoint
      const res = await api.communication.chat(
        messageToSend,
        language,
        history,
        activeTopic
      );

      if (res.success && res.replyText) {
        if (res.activeTopic) {
          setActiveTopic(res.activeTopic);
        }

        const assistantBubble = {
          id: `coach_${Date.now()}`,
          role: 'assistant',
          text: res.replyText,
          audioUrl: res.audioBase64,
          feedback: res.feedback || null,
          grammarCorrection: res.grammarCorrection || null,
          activeTopic: res.activeTopic || activeTopic,
          suggestedChips: res.suggestedChips || [],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantBubble]);

        // Auto-play Gnani synthesized voice
        if (res.audioBase64) {
          playVoiceAudio(res.audioBase64);
        } else {
          setCoachState('idle');
        }

        // If feedback was awarded, refresh history list in background
        if (res.feedback) {
          loadHistory();
        }
      } else {
        throw new Error(res.message || 'No response from communication coach');
      }
    } catch (err) {
      console.error('Communication coaching error:', err);
      setAudioError('Coach service temporary hiccup. Please try speaking again.');
      setCoachState('idle');
    }
  };

  // Start Voice Capture
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
        setCoachState('idle');
      },
    });

    speechEngineRef.current = engine;

    try {
      await engine.startListening();
      setCoachState('listening');
    } catch (e) {
      setCoachState('idle');
    }
  };

  // Stop Voice Capture and automatically send spoken utterance to AI Coach
  const stopRecording = async () => {
    if (!speechEngineRef.current) return;
    setCoachState('processing');

    try {
      const transcript = await speechEngineRef.current.stopListening();
      speechEngineRef.current = null;
      setMicVolume(0);

      const captured = transcript || liveTranscript;

      if (captured && captured.trim()) {
        await handleSendConversationMessage(captured.trim());
      } else {
        setAudioError(
          language === 'hi-IN'
            ? 'कोई आवाज सुनाई नहीं दी। कृपया माइक्रोफ़ोन के करीब बोलें या टेक्स्ट टाइप करें।'
            : language === 'or-IN'
              ? 'ସ୍ୱର ଶୁଣାଗଲା ନାହିଁ। ଦୟାକରି ମାଇକ୍ ନିକଟରେ କୁହନ୍ତୁ କିମ୍ବା ଟାଇପ୍ କରନ୍ତୁ।'
              : 'No speech detected. Please speak into your microphone or tap a suggestion chip below.'
        );
        setCoachState('idle');
      }
    } catch (err) {
      console.error('Stop recording error:', err);
      setAudioError('Voice capture error. You can also type your message.');
      setCoachState('idle');
    }
  };

  const toggleRecording = () => {
    if (coachState === 'listening') {
      stopRecording();
    } else if (coachState === 'speaking') {
      stopVoiceAudio();
    } else {
      startRecording();
    }
  };

  const resetSession = () => {
    setActiveTopic(null);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        text: getWelcomeText(),
        audioUrl: null,
        feedback: null,
        suggestedChips:
          language === 'hi-IN'
            ? ['👋 हेलो', 'सेल्फ इंट्रोडक्शन', 'मॉक इंटरव्यू', 'प्रोजेक्ट वॉकथ्रू']
            : language === 'or-IN'
              ? ['👋 ନମସ୍କାର', 'ସେଲ୍ଫ୍ ଇଣ୍ଟ୍ରୋଡକ୍ସନ୍', 'ମକ୍ ଇଣ୍ଟରଭ୍ୟୁ', 'ପ୍ରୋଜେକ୍ଟ ୱାକ୍‌ଥ୍ରୁ']
              : ['👋 Say Hello', 'Self Introduction', 'Mock Tech Interview', 'Project Walkthrough'],
        timestamp: new Date(),
      },
    ]);
    setCoachState('idle');
    setAudioError('');
  };

  // Get latest suggested chips from the most recent assistant message
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
  const currentChips = lastAssistantMsg?.suggestedChips || [];

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col bg-slate-50">
      {/* Subheader Bar */}
      <div className="px-3.5 sm:px-6 md:px-8 py-3 bg-white border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900">
                1-on-1 Voice Communication & Interview Coach
              </h2>
              {activeTopic && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Topic: {activeTopic}
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Interactive end-to-end voice conversation with real-time feedback & follow-up questions
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Waveform
            isListening={coachState === 'listening'}
            isSpeaking={coachState === 'speaking'}
            isProcessing={coachState === 'processing'}
            volume={micVolume}
          />

          <button
            onClick={() => setShowHistoryModal(!showHistoryModal)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Scores ({historyList.length})</span>
          </button>

          <button
            onClick={resetSession}
            title="Start fresh conversation"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
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
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-100'
                  }`}
              >
                {msg.role === 'user' ? (user?.name ? user.name[0] : 'S') : '🎙️'}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl p-3.5 sm:p-4.5 text-xs sm:text-sm leading-relaxed shadow-xs ${msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-[11px] font-semibold opacity-70">
                  <span>{msg.role === 'user' ? 'You' : 'AI Communication Coach'}</span>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Spoken Grammar & Phrasing Error Correction Card */}
                {msg.role === 'assistant' && msg.grammarCorrection && msg.grammarCorrection.hasError && (
                  <div className="mt-3.5 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Spoken Phrasing & Grammar Correction
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                        AI Spoke This Correction
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-red-50/80 border border-red-200 text-red-900">
                        <div className="text-[10px] uppercase font-bold text-red-600 mb-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          You Spoke (Error):
                        </div>
                        <p className="font-semibold line-through decoration-red-500 decoration-2">
                          "{msg.grammarCorrection.originalPhrase}"
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900">
                        <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Right Way to Speak:
                        </div>
                        <p className="font-bold text-emerald-800">
                          "{msg.grammarCorrection.correctedPhrase}"
                        </p>
                      </div>
                    </div>

                    {msg.grammarCorrection.explanation && (
                      <div className="text-xs text-amber-900 bg-white/80 p-2.5 rounded-xl border border-amber-200/70 flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-amber-950">Grammar Tip: </strong>
                          {msg.grammarCorrection.explanation}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-amber-800 font-medium italic flex items-center gap-1.5 pt-1">
                      <Volume2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Bidya Guru spoke this correction aloud and asked the next question so your conversation continues naturally!
                      </span>
                    </div>
                  </div>
                )}

                {/* Structured In-Chat Feedback Card when student answered */}
                {msg.role === 'assistant' && msg.feedback && (
                  <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-600" />
                        Live Feedback & Scoring
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                        {msg.feedback.score || 85}%
                      </span>
                    </div>

                    {msg.feedback.strength && (
                      <div className="text-xs text-emerald-900 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-semibold">Strength:</strong> {msg.feedback.strength}
                        </span>
                      </div>
                    )}

                    {msg.feedback.improvement && (
                      <div className="text-xs text-amber-900 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-semibold">Coaching Tip:</strong> {msg.feedback.improvement}
                        </span>
                      </div>
                    )}

                    {msg.feedback.suggestion && (
                      <div className="text-xs text-indigo-900 flex items-start gap-1.5 pt-1 border-t border-emerald-100">
                        <Lightbulb className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-semibold">Better Phrasing:</strong> {msg.feedback.suggestion}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Voice Replay button for assistant coaching speech */}
                {msg.role === 'assistant' && msg.audioUrl && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => playVoiceAudio(msg.audioUrl)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Replay Coach Voice (Gnani TTS)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Live Interim Transcript Bubble while User is Speaking */}
          {coachState === 'listening' && (
            <div className="flex items-start gap-3.5 flex-row-reverse">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                🎙️
              </div>
              <div className="max-w-xl rounded-2xl rounded-tr-none p-4 bg-rose-50/80 border border-rose-200 text-rose-900 text-sm shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-600">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>Hearing your speech...</span>
                </div>
                <p className="font-medium italic">
                  {liveTranscript || 'Speak naturally into your microphone...'}
                </p>
              </div>
            </div>
          )}

          {coachState === 'processing' && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                🎙️
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-xs text-slate-500 shadow-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
                <span className="ml-1 font-medium">Coach is analyzing your speech & preparing feedback...</span>
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

      {/* Suggested Quick Response Chips (Topic Selection or Follow-up Responses) */}
      {currentChips.length > 0 && (
        <div className="px-3.5 sm:px-6 md:px-8 py-2 bg-white/70 border-t border-slate-100 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Quick Answers:
            </span>
            {currentChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendConversationMessage(chip)}
                disabled={coachState === 'processing' || coachState === 'listening'}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] sm:text-xs text-slate-700 border border-slate-200/60 whitespace-nowrap transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Interaction & Input Bar */}
      <div className="p-3 sm:p-4 md:p-6 bg-white border-t border-slate-200 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-2.5 sm:gap-4">
          {/* Main Large Glowing Microphone Button */}
          <button
            onClick={toggleRecording}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shrink-0 shadow-md cursor-pointer ${coachState === 'listening'
                ? 'bg-rose-500 text-white animate-voice-pulse shadow-rose-200 ring-4 ring-rose-300'
                : coachState === 'speaking'
                  ? 'bg-emerald-500 text-white shadow-emerald-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
              }`}
            title={
              coachState === 'listening'
                ? 'Click to stop speaking and send to Coach'
                : coachState === 'speaking'
                  ? 'Click to pause voice playback'
                  : 'Click to speak to your Coach'
            }
          >
            {coachState === 'listening' ? (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            ) : coachState === 'speaking' ? (
              <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>

          {/* Natural Text Input for Hybrid Convenience */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendConversationMessage()}
              placeholder={
                coachState === 'listening'
                  ? 'Listening... Click mic again when you finish speaking'
                  : 'Say "Hello" or answer your coach (Click mic to speak)...'
              }
              disabled={coachState === 'listening'}
              className="w-full pl-3.5 sm:pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs sm:text-sm transition-all"
            />

            <button
              onClick={() => handleSendConversationMessage()}
              disabled={!inputText.trim() || coachState === 'processing'}
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-2 sm:mt-3 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
            Real-time Conversational Voice Coach
          </span>
          <span>Click mic or type to respond</span>
        </div>
      </div>

      {/* Practice History Slide-over Drawer / Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-base text-slate-900">
                    Practice History & Scores
                  </h3>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {historyList.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {item.prompt}
                      </span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {item.feedback?.score || 80}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      "{item.transcript?.slice(0, 90)}..."
                    </p>

                    {item.feedback?.clarity && (
                      <p className="text-[11px] text-emerald-700">
                        ✓ {item.feedback.clarity}
                      </p>
                    )}

                    <div className="text-[10px] text-slate-400 pt-1">
                      {new Date(item.createdAt).toLocaleDateString()} at{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}

                {historyList.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No evaluated sessions yet. Start speaking with your coach!
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
