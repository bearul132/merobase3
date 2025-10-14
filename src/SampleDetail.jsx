// SampleDetail.jsx
import { useLocation } from "react-router-dom";

export default function SampleDetail() {
  const location = useLocation();
  const sample = location.state?.sample;

  if (!sample) return <p>No sample data provided.</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Sample Details: {sample.sampleName}</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["image", "semPhoto", "isolatedPhoto"].map(
          (t) =>
            sample[t] && (
              <a key={t} href={sample[t]} target="_blank" rel="noreferrer">
                <img
                  src={sample[t]}
                  alt={t}
                  style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "8px" }}
                />
              </a>
            )
        )}
      </div>

      {Object.entries(sample).map(([key, value]) =>
        ["image", "semPhoto", "isolatedPhoto"].includes(key) ? null : (
          <p key={key}>
            <b>{key}:</b>{" "}
            {typeof value === "object" ? `X: ${value.x}, Y: ${value.y}` : String(value)}
          </p>
        )
      )}
    </div>
  );
}
