import { Bot, Volume2 } from 'lucide-react';
import { speakText } from '../utils/textToSpeech.js';

export default function ChatBubble({ message, locale = 'ta-IN' }) {
  const isUser = message.role === 'user';
  return (
    <div className={`message-row ${isUser ? 'message-row-user' : ''}`}>
      {!isUser && <span className="assistant-avatar"><Bot size={16} /></span>}
      <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
        <p>{message.text}</p>
        {!isUser && <button className="speak-message" type="button" aria-label="Read message aloud" title="Read aloud" onClick={() => speakText(message.text, locale)}><Volume2 size={14} /></button>}
      </div>
    </div>
  );
}