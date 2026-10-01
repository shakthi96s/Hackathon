import { Mic, MicOff } from 'lucide-react';

export default function VoiceButton({ listening, supported, onClick }) {
  return (
    <button
      className={`voice-button ${listening ? 'voice-button-listening' : ''}`}
      type="button"
      onClick={onClick}
      disabled={!supported}
      aria-label={supported ? (listening ? 'Stop voice input' : 'Start voice input') : 'Voice input is not supported in this browser'}
      title={supported ? (listening ? 'Stop listening' : 'Speak your answer') : 'Voice input is not supported in this browser'}
    >
      {listening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
}