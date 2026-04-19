function getStatusColor(status) {
  if (status === "RECRUITING") {
    return "#16a34a";
  }
  if (status === "COMPLETED") {
    return "#6b7280";
  }
  return "#4b5563";
}

function getFirstLocation(locations) {
  if (!Array.isArray(locations) || locations.length === 0) {
    return "Location not available";
  }

  const firstLocation = locations[0];
  if (typeof firstLocation === "string") {
    return firstLocation;
  }

  const city = firstLocation?.city || "";
  const country = firstLocation?.country || "";
  const combined = [city, country].filter(Boolean).join(", ");
  return combined || "Location not available";
}

export default function TrialCard({ trial }) {
  const title = trial?.title || "Untitled trial";
  const status = trial?.status || "UNKNOWN";
  const locationText = getFirstLocation(trial?.locations);
  const eligibility = (trial?.eligibility || "Eligibility details not available.").slice(0, 120);
  const contactName = trial?.contact?.name;
  const contactEmail = trial?.contact?.email;

  return (
    <div
      style={{
        backgroundColor: "#1f2937",
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "8px",
        border: "1px solid #374151",
        borderLeft: "3px solid #10b981",
      }}
    >
      <a
        href={trial?.url || "#"}
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

      <div style={{ marginBottom: "8px" }}>
        <span
          style={{
            backgroundColor: getStatusColor(status),
            color: "#ffffff",
            borderRadius: "999px",
            padding: "2px 8px",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {status}
        </span>
      </div>

      <p style={{ margin: "0 0 8px 0", color: "#d1d5db", fontSize: "13px" }}>{locationText}</p>

      <p style={{ margin: "0 0 8px 0", color: "#cbd5e1", fontSize: "13px", lineHeight: 1.4 }}>
        {eligibility}
        {trial?.eligibility && trial.eligibility.length > 120 ? "..." : ""}
      </p>

      {(contactName || contactEmail) && (
        <p style={{ margin: 0, color: "#9ca3af", fontSize: "12px" }}>
          {contactName || "Contact"} {contactEmail ? `(${contactEmail})` : ""}
        </p>
      )}
    </div>
  );
}
