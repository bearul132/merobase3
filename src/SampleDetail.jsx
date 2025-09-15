import { useParams, Link } from "react-router-dom";

function SampleDetail() {
  const { id } = useParams();

  // In real app, fetch from backend or context
  // For now, mock data
  const sample = {
    sampleId: id,
    sampleName: "Example Sample",
    projectSample: "A",
    projectNumber: 12,
    sampleNumber: 1,
    kingdom: "Animalia",
    family: "Acroporidae",
    genus: "Acropora",
    species: "Acropora millepora",
    dateAcquired: "2025-08-31",
    coordinates: { x: -8.672, y: 115.452 },
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Sample Detail</h1>
      <p><b>ID:</b> {sample.sampleId}</p>
      <p><b>Name:</b> {sample.sampleName}</p>
      <p><b>Kingdom:</b> {sample.kingdom}</p>
      <p><b>Family:</b> {sample.family}</p>
      <p><b>Genus:</b> {sample.genus}</p>
      <p><b>Species:</b> {sample.species}</p>
      <p><b>Date Acquired:</b> {sample.dateAcquired}</p>
      <p><b>Coordinates:</b> X={sample.coordinates.x}, Y={sample.coordinates.y}</p>

      <Link to="/">⬅ Back to Dashboard</Link>
    </div>
  );
}

export default SampleDetail;
