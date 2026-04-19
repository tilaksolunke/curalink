import { useEffect, useRef, useState } from "react";
import MessageBubble from "./components/MessageBubble";
import SourceCard from "./components/SourceCard";
import TrialCard from "./components/TrialCard";
import { sendMessage as sendMessageApi } from "./services/api";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [disease, setDisease] = useState("");
  const [location, setLocation] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [publications, setPublications] = useState([]);
  const [trials, setTrials] = useState([]);
  const [meta, setMeta] = useState(null);
  const [showRightPanel, setShowRightPanel] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage() {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: trimmedInput }]);
    setInput("");
    try {
      const response = await sendMessageApi({
        message: trimmedInput,
        disease,
        location,
        sessionId,
      });
      if (!sessionId && response?.sessionId) setSessionId(response.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response?.response || "No response received." },
      ]);
      setPublications(response?.publications || []);
      setTrials(response?.trials || []);
      setMeta(response?.meta || null);
    } catch (error) {
      const errorMessage = error?.response?.status === 500
        ? "The server encountered an error. Please try again."
        : error?.response?.status === 400
        ? "Invalid request. Please check your input and try again."
        : !navigator.onLine
        ? "You appear to be offline. Please check your connection."
        : "Something went wrong. Please try again.";
        
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${errorMessage}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function resetChat() {
    setMessages([]);
    setInput("");
    setSessionId(null);
    setPublications([]);
    setTrials([]);
    setMeta(null);
    setDisease("");
    setLocation("");
  }

  return (
    <div style={{ height: "100vh", backgroundColor: "#0f1117", color: "#f3f4f6", display: "flex", fontFamily: "Inter, Segoe UI, Arial, sans-serif" }}>
      <div style={{ display: "flex", flex: 1, minWidth: 0 }}>
        <aside
          style={{
            width: "300px",
            borderRight: "1px solid #1f2937",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#111827",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", color: "#60a5fa" }}>Curalink</h1>
            <p style={{ marginTop: "6px", color: "#9ca3af", fontSize: "14px" }}>
              Enter disease and location for personalized results
            </p>
          </div>

          <input
            type="text"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            placeholder="Disease"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #374151",
              backgroundColor: "#0b1220",
              color: "#f9fafb",
              outline: "none",
            }}
          />

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #374151",
              backgroundColor: "#0b1220",
              color: "#f9fafb",
              outline: "none",
            }}
          />

          <button
            onClick={resetChat}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #374151",
              backgroundColor: "#1f2937",
              color: "#f9fafb",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            + New Chat
          </button>

          <div style={{ marginTop: "auto" }}>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "12px", lineHeight: 1.5 }}>
              Powered by LLaMA 3.1 + PubMed + OpenAlex + ClinicalTrials
            </p>
          </div>
        </aside>

        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 20px" }}>
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              style={{
                display: window.innerWidth < 768 ? "block" : "none",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #374151",
                backgroundColor: "#1f2937",
                color: "#f9fafb",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {showRightPanel ? "Hide Sources" : "Show Sources"}
            </button>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.length === 0 && !isLoading && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    color: "#9ca3af",
                    padding: "20px",
                    marginTop: "120px",
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: "40px", color: "#d1d5db", fontWeight: 700 }}>
                    Welcome to Curalink
                  </h2>
                  <p style={{ marginTop: "14px", marginBottom: "6px", fontSize: "18px", color: "#9ca3af" }}>
                    Your AI-powered medical research companion
                  </p>
                  <p style={{ margin: 0, fontSize: "15px", color: "#6b7280" }}>
                    Enter your disease and location on the left, then ask your question
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: message.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{ maxWidth: "80%" }}>
                    <MessageBubble message={message} />
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px", display: "block" }}>
                    Curalink
                  </span>
                  <div
                    style={{
                      backgroundColor: "#1f2937",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: "#60a5fa", fontSize: "13px" }}>Searching research papers</span>
                    <span style={{ animation: "dotPulse 1.2s ease-in-out infinite", color: "#60a5fa" }}>•</span>
                    <span style={{ animation: "dotPulse 1.2s ease-in-out 0.2s infinite", color: "#60a5fa" }}>•</span>
                    <span style={{ animation: "dotPulse 1.2s ease-in-out 0.4s infinite", color: "#60a5fa" }}>•</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: "16px",
              borderTop: "1px solid #1f2937",
              display: "flex",
              gap: "10px",
              backgroundColor: "#111827",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={2}
              style={{
                flex: 1,
                resize: "none",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #374151",
                backgroundColor: "#0b1220",
                color: "#f9fafb",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "0 16px",
                backgroundColor: isLoading ? "#4b5563" : "#2563eb",
                color: "#ffffff",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              Send
            </button>
          </div>
        </main>

        <aside
          style={{
            width: window.innerWidth < 768 ? (showRightPanel ? "100%" : "0") : "350px",
            borderLeft: "1px solid #1f2937",
            padding: "20px",
            overflowY: "auto",
            backgroundColor: "#111827",
            display: publications.length === 0 && trials.length === 0 ? "none" : "block",
            position: window.innerWidth < 768 ? "absolute" : "relative",
            right: 0,
            top: 0,
            height: "100%",
            zIndex: 10
          }}
        >
          {meta && (
            <div
              style={{
                backgroundColor: "#0f172a",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "#60a5fa",
                border: "1px solid #1e3a5f",
              }}
            >
              {meta.isFollowUp
                ? `🔄 Using previous context — ${meta.publicationsShown} publications and ${meta.trialsShown} trials`
                : `🔍 Analyzed ${meta.totalPublicationsFetched} publications and ${meta.totalTrialsFetched} trials to find these insights`}
            </div>
          )}

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "18px" }}>
              Publications ({publications.length})
            </h2>
            {publications.length === 0 ? (
              <p style={{ margin: 0, color: "#9ca3af" }}>No publications yet.</p>
            ) : (
              publications.map((source, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                  <SourceCard source={source} />
                </div>
              ))
            )}
          </section>

          <section>
            <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "18px" }}>
              Trials ({trials.length})
            </h2>
            {trials.length === 0 ? (
              <p style={{ margin: 0, color: "#9ca3af" }}>No trials yet.</p>
            ) : (
              trials.map((trial, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                  <TrialCard trial={trial} />
                </div>
              ))
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default App;