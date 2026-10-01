import axios from 'axios';

const API = '/api';

export const chat = (body) => axios.post(`${API}/chat`, body);

export const reset = () => axios.post(`${API}/reset`);

export async function sendMessage(sessionId, text, language = 'ta') {
  const response = await chat({ sessionId, message: text, language });
  return response.data;
}

export async function resetSession(sessionId) {
  await axios.post(`${API}/session/reset`, { sessionId });
  const response = await reset();
  return response.data;
}