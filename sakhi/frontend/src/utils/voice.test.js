import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { startListening, stopListening } from './speechRecognition.js';
import { speakText } from './textToSpeech.js';

const originalWindow = globalThis.window;
const originalUtterance = globalThis.SpeechSynthesisUtterance;

afterEach(() => {
  stopListening();
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  if (originalUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
  else globalThis.SpeechSynthesisUtterance = originalUtterance;
});

test('speech recognition uses the selected locale and returns its transcript', () => {
  let recognition;
  class MockRecognition {
    constructor() { recognition = this; }
    start() { this.started = true; }
    stop() { this.stopped = true; }
  }
  globalThis.window = { SpeechRecognition: MockRecognition };

  let transcript = '';
  let ended = false;
  const started = startListening(
    (text) => { transcript = text; },
    'ta-IN',
    () => { ended = true; },
  );

  assert.equal(started, true);
  assert.equal(recognition.lang, 'ta-IN');
  assert.equal(recognition.started, true);
  recognition.onresult({ results: [[{ transcript: 'எனக்கு உதவி வேண்டும்' }]] });
  assert.equal(transcript, 'எனக்கு உதவி வேண்டும்');
  recognition.onend();
  assert.equal(ended, true);
});

test('speech recognition reports unsupported browsers without starting', () => {
  globalThis.window = {};
  assert.equal(startListening(() => {}), false);
});

test('speech playback cancels queued audio and speaks using the selected locale', () => {
  const spoken = [];
  let cancelled = false;
  globalThis.window = {
    speechSynthesis: {
      cancel() { cancelled = true; },
      speak(utterance) { spoken.push(utterance); },
    },
  };
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };

  speakText('வணக்கம்', 'ta-IN');

  assert.equal(cancelled, true);
  assert.equal(spoken.length, 1);
  assert.equal(spoken[0].text, 'வணக்கம்');
  assert.equal(spoken[0].lang, 'ta-IN');
});