let activeRecognition;

export function startListening(onResult, locale = 'ta-IN', onEnd = () => {}, onError = () => {}) {
  const SpeechRecognition = typeof window === 'undefined'
    ? null
    : window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) return false;

  const recognition = new SpeechRecognition();
  recognition.lang = locale;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => onResult(event.results[0][0].transcript);
  recognition.onend = () => {
    activeRecognition = null;
    onEnd();
  };
  recognition.onerror = (event) => {
    activeRecognition = null;
    onError(event);
  };

  try {
    activeRecognition = recognition;
    recognition.start();
    return true;
  } catch {
    activeRecognition = null;
    return false;
  }
}

export function stopListening() {
  activeRecognition?.stop();
  activeRecognition = null;
}

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}