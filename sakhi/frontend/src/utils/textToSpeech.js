export function speakText(text, locale = 'ta-IN') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  window.speechSynthesis.speak(utterance);
}

export function speakTamil(text) {
  speakText(text, 'ta-IN');
}