export default function Toast({ message, type = "success", onClose }) {
  return (
    <div
      className="position-fixed"
      style={{
        bottom: "70px",
        right: "24px",
        zIndex: 2000,
        backgroundColor: type === "success" ? "var(--dinery-forest)" : "var(--dinery-red)",
        color: "white",
        padding: "14px 20px",
        borderRadius: "var(--radius-md)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: "260px",
        animation: "slideUp 0.25s ease",
      }}
    >
      <span style={{ fontWeight: 600 }}>{message}</span>
      <button
        onClick={onClose}
        style={{ background: "none", border: "none", color: "white", marginLeft: "auto", fontSize: "1.1rem", cursor: "pointer" }}
      >
        ✕
      </button>
    </div>
  );
}