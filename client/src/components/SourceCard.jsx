function getAuthorsText(authors) {
  if (!Array.isArray(authors) || authors.length === 0) {
    return "Unknown authors";
  }

  const firstTwo = authors.slice(0, 2).join(", ");
  return authors.length > 2 ? `${firstTwo} et al` : firstTwo;
}

function getSourceBadgeColor(sourceName) {
  if (sourceName === "PubMed") {
    return "#16a34a";
  }
  if (sourceName === "OpenAlex") {
    return "#2563eb";
  }
  return "#4b5563";
}

export default function SourceCard({ source }) {
  const title = source?.title || "Untitled";
  const authorsText = getAuthorsText(source?.authors);
  const year = source?.year || "N/A";
  const sourceName = source?.source || "Unknown";
  const abstractPreview = (source?.abstract || "No abstract available.").slice(0, 120);

  return (
    <div
      style={{
        backgroundColor: "#1f2937",
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "8px",
        border: "1px solid #374151",
        borderLeft: "3px solid #2563eb",
      }}
    >
      <a
        href={source?.url || "#"}
        target="_blank"
        rel="noreferrer"
        style={{
          color: "#f9fafb",
          fontWeight: 700,
          textDecoration: "none",
          display: "inline-block",
          marginBottom: "8px",
        }}
      >
        {title}
      </a>

      <p style={{ margin: "0 0 8px 0", color: "#d1d5db", fontSize: "13px" }}>{authorsText}</p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
          fontSize: "12px",
        }}
      >
        <span style={{ color: "#9ca3af" }}>{year}</span>
        <span
          style={{
            backgroundColor: getSourceBadgeColor(sourceName),
            color: "#ffffff",
            borderRadius: "999px",
            padding: "2px 8px",
            fontWeight: 600,
          }}
        >
          {sourceName}
        </span>
      </div>

      <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13px", lineHeight: 1.4 }}>
        {abstractPreview}
        {source?.abstract && source.abstract.length > 120 ? "..." : ""}
      </p>
    </div>
  );
}
