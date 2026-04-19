import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message, isFollowUp }) {
  const isUser = message?.role === "user";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      width: "100%",
      animation: "fadeIn 0.3s ease forwards"
    }}>
      {!isUser && (
        <div style={{ 
          fontSize: "11px", 
          color: "#7d8590", 
          marginBottom: "5px",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          Curalink
          {isFollowUp && (
            <span style={{ color: "#1d6fa4", fontSize: "11px" }}>
              · using previous context
            </span>
          )}
        </div>
      )}
      <div style={{
        backgroundColor: isUser ? "#1d6fa4" : "#161b22",
        color: isUser ? "#ffffff" : "#c9d1d9",
        borderRadius: isUser ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
        padding: "10px 16px",
        maxWidth: isUser ? "75%" : "85%",
        fontSize: "13px",
        lineHeight: "1.7",
        border: isUser ? "none" : "0.5px solid #30363d",
        wordBreak: "break-word"
      }}>
        <ReactMarkdown>{message?.content || ""}</ReactMarkdown>
      </div>
    </div>
  );
}
