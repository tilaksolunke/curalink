import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function sendMessage({ message, disease, location, sessionId }) {
  const response = await apiClient.post("/chat", {
    message,
    disease,
    location,
    sessionId,
  });

  return response.data;
}

export async function getHistory(sessionId) {
  const response = await apiClient.get(`/chat/${sessionId}`);
  return response.data;
}
