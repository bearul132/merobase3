import { useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationPicker({ formSample, setFormSample }) {
  useMapEvents({
    click(e) {
      setFormSample({
        ...formSample,
        coordinates: {
          x: e.latlng.lng.toFixed(6), // longitude
          y: e.latlng.lat.toFixed(6), // latitude
        },
      });
    },
  });

  return formSample.coordinates.x && formSample.coordinates.y ? (
    <Marker
      position={[formSample.coordinates.y, formSample.coordinates.x]}
    ></Marker>
  ) : null;
}

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [samples, setSamples] = useState([
    {
      sampleId: "A-0012-0001",
      sampleName: "Coral Fragment 01",
      projectSample: "A",
      projectNumber: 12,
      sampleNumber: 1,
      kingdom: "Animalia",
      family: "Acroporidae",
      genus: "Acropora",
      species: "Acropora millepora",
      dateAcquired: "2025-08-31",
      coordinates: { x: 115.452, y: -8.672 },
      registered: "2025-08-31 10:00:00",
      edited: "2025-09-05 14:30:00",
      image: null,
      semPhoto: null,
      isolatedPhoto: null,
    },
  ]);

  const [latestEdited, setLatestEdited] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formSample, setFormSample] = useState({
    sampleName: "",
    projectSample: "A",
    projectNumber: "",
    sampleNumber: "",
    kingdom: "",
    family: "",
    genus: "",
    species: "",
    dateAcquired: "",
    coordinates: { x: "", y: "" },
    image: null,
    semPhoto: null,
    isolatedPhoto: null,
  });

  const latestRegistered = samples[samples.length - 1];

  // 🔍 Search + Filter logic
  const filtered = samples.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.sampleName.toLowerCase().includes(q) ||
      s.species.toLowerCase().includes(q) ||
      s.genus.toLowerCase().includes(q) ||
      s.family.toLowerCase().includes(q) ||
      s.sampleId.toLowerCase().includes(q);

    const matchesFilter =
      filter === "all" ||
      (filter === "animalia" && s.kingdom.toLowerCase() === "animalia") ||
      (filter === "plantae" && s.kingdom.toLowerCase() === "plantae") ||
      (filter === "projectA" && s.projectSample === "A") ||
      (filter === "projectB" && s.projectSample === "B");

    return matchesSearch && matchesFilter;
  });

  const generateSampleId = (sample) => {
    const projectNum = String(sample.projectNumber).padStart(4, "0");
    const sampleNum = String(sample.sampleNumber).padStart(4, "0");
    return `${sample.projectSample}-${projectNum}-${sampleNum}`;
  };

  const openAddForm = () => {
    setEditIndex(null);
    setFormSample({
      sampleName: "",
      projectSample: "A",
      projectNumber: "",
      sampleNumber: "",
      kingdom: "",
      family: "",
      genus: "",
      species: "",
      dateAcquired: "",
      coordinates: { x: "", y: "" },
      image: null,
      semPhoto: null,
      isolatedPhoto: null,
    });
    setShowForm(true);
  };

  const openEditForm = (index) => {
    setEditIndex(index);
    setFormSample(samples[index]);
    setShowForm(true);
  };

  const handleSaveSample = (e) => {
    e.preventDefault();
    const id = generateSampleId(formSample);
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];
    const formattedTime = now.toLocaleTimeString();

    const sampleToSave = {
      ...formSample,
      sampleId: id,
      registered:
        editIndex === null
          ? `${formattedDate} ${formattedTime}`
          : formSample.registered || `${formattedDate} ${formattedTime}`,
      edited: `${formattedDate} ${formattedTime}`,
    };

    if (editIndex !== null) {
      const updated = [...samples];
      updated[editIndex] = sampleToSave;
      setSamples(updated);
      setLatestEdited(sampleToSave);
    } else {
      const newSamples = [...samples, sampleToSave];
      setSamples(newSamples);
      setLatestEdited(sampleToSave);
    }

    setShowForm(false);
    setEditIndex(null);
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setFormSample({ ...formSample, [type]: previewURL });
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "1100px",
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          🌊 MEROBase Dashboard
        </h1>

        {/* 🔍 Search + Filter UI */}
        <div
          style={{
            marginBottom: "20px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Search by name, ID, species, genus, family..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "8px",
              width: "300px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              color: "black",
            }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            <option value="all">All</option>
            <option value="animalia">Kingdom: Animalia</option>
            <option value="plantae">Kingdom: Plantae</option>
            <option value="projectA">Project: A</option>
            <option value="projectB">Project: B</option>
          </select>
        </div>

        {/* Actions */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <button
            onClick={openAddForm}
            style={{
              marginRight: "10px",
              padding: "10px 15px",
              border: "none",
              backgroundColor: "#28a745",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            ➕ Add New Sample
          </button>
        </div>

        {/* Info Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* Latest Registered */}
          <div
            style={{
              flex: 1,
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "8px",
              backgroundColor: "#fdfdfd",
            }}
          >
            <h3>📌 Latest Registered Sample</h3>
            {latestRegistered && (
              <div>
                {latestRegistered.image && (
                  <img
                    src={latestRegistered.image}
                    alt="sample"
                    style={{ maxWidth: "100%", marginBottom: "10px" }}
                  />
                )}
                {latestRegistered.semPhoto && (
                  <img
                    src={latestRegistered.semPhoto}
                    alt="sem"
                    style={{ maxWidth: "100%", marginBottom: "10px" }}
                  />
                )}
                {latestRegistered.isolatedPhoto && (
                  <img
                    src={latestRegistered.isolatedPhoto}
                    alt="isolated"
                    style={{ maxWidth: "100%", marginBottom: "10px" }}
                  />
                )}
                {Object.entries(latestRegistered).map(([key, value]) =>
                  ["image", "semPhoto", "isolatedPhoto"].includes(key) ? null : (
                    <p key={key}>
                      <b>{key}:</b>{" "}
                      {typeof value === "object"
                        ? `X: ${value.x}, Y: ${value.y}`
                        : value}
                    </p>
                  )
                )}
              </div>
            )}
          </div>

          {/* Latest Edited */}
          <div
            style={{
              flex: 1,
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "8px",
              backgroundColor: "#fdfdfd",
            }}
          >
            <h3>🛠️ Latest Edited Sample</h3>
            {latestEdited ? (
              <div>
                {latestEdited.image && (
                  <img
                    src={latestEdited.image}
                    alt="sample"
                    style={{ maxWidth: "100%", marginBottom: "10px" }}
                  />
                )}
                {latestEdited.semPhoto && (
                  <img
                    src={latestEdited.semPhoto}
                    alt="sem"
                    style={{ maxWidth: "100%", marginBottom: "10px" }}
                  />
                )}
                {latestEdited.isolatedPhoto && (
                  <img
                    src={latestEdited.isolatedPhoto}
                    alt="isolated"
                    style={{ maxWidth: "100%", marginBottom: "10px" }}
                  />
                )}
                {Object.entries(latestEdited).map(([key, value]) =>
                  ["image", "semPhoto", "isolatedPhoto"].includes(key) ? null : (
                    <p key={key}>
                      <b>{key}:</b>{" "}
                      {typeof value === "object"
                        ? `X: ${value.x}, Y: ${value.y}`
                        : value}
                    </p>
                  )
                )}
              </div>
            ) : (
              <p>No edits yet.</p>
            )}
          </div>
        </div>

        {/* Sample List */}
        <h2 style={{ marginBottom: "15px", textAlign: "center" }}>
          📂 All Samples
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Image</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Species
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Last Edited
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, index) => (
              <tr key={s.sampleId}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {s.image ? (
                    <img
                      src={s.image}
                      alt="sample"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {s.sampleId}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {s.sampleName}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {s.species}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {s.edited}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <button
                    onClick={() => openEditForm(index)}
                    style={{
                      padding: "5px 10px",
                      border: "none",
                      backgroundColor: "#007bff",
                      color: "white",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginRight: "5px",
                    }}
                  >
                    Edit
                  </button>
                  <Link
                    to={`/sample/${s.sampleId}`}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#17a2b8",
                      color: "white",
                      borderRadius: "5px",
                      textDecoration: "none",
                    }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup Form with Scroll */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "auto",
            padding: "20px",
          }}
        >
          <form
            onSubmit={handleSaveSample}
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              color: "black",
            }}
          >
            <h2>{editIndex !== null ? "Edit Sample" : "Add New Sample"}</h2>

            {/* General Image */}
            <label>General Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "image")}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            {formSample.image && (
              <img
                src={formSample.image}
                alt="preview"
                style={{ maxWidth: "100%", marginBottom: "10px" }}
              />
            )}

            {/* SEM Photo */}
            <label>SEM Photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "semPhoto")}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            {formSample.semPhoto && (
              <img
                src={formSample.semPhoto}
                alt="sem"
                style={{ maxWidth: "100%", marginBottom: "10px" }}
              />
            )}

            {/* Isolated Photo */}
            <label>Isolated Photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "isolatedPhoto")}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            {formSample.isolatedPhoto && (
              <img
                src={formSample.isolatedPhoto}
                alt="isolated"
                style={{ maxWidth: "100%", marginBottom: "10px" }}
              />
            )}

            {/* Other inputs */}
            <input
              type="text"
              placeholder="Sample Name"
              value={formSample.sampleName}
              onChange={(e) =>
                setFormSample({ ...formSample, sampleName: e.target.value })
              }
              required
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <select
              value={formSample.projectSample}
              onChange={(e) =>
                setFormSample({ ...formSample, projectSample: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            >
              <option value="A">Project A</option>
              <option value="B">Project B</option>
            </select>

            <input
              type="number"
              placeholder="Project Number"
              value={formSample.projectNumber}
              onChange={(e) =>
                setFormSample({ ...formSample, projectNumber: e.target.value })
              }
              required
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <input
              type="number"
              placeholder="Sample Number"
              value={formSample.sampleNumber}
              onChange={(e) =>
                setFormSample({ ...formSample, sampleNumber: e.target.value })
              }
              required
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <input
              type="text"
              placeholder="Kingdom"
              value={formSample.kingdom}
              onChange={(e) =>
                setFormSample({ ...formSample, kingdom: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <input
              type="text"
              placeholder="Family"
              value={formSample.family}
              onChange={(e) =>
                setFormSample({ ...formSample, family: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <input
              type="text"
              placeholder="Genus"
              value={formSample.genus}
              onChange={(e) =>
                setFormSample({ ...formSample, genus: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <input
              type="text"
              placeholder="Species"
              value={formSample.species}
              onChange={(e) =>
                setFormSample({ ...formSample, species: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <input
              type="date"
              placeholder="Date Acquired"
              value={formSample.dateAcquired}
              onChange={(e) =>
                setFormSample({ ...formSample, dateAcquired: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            {/* Map Picker */}
            <div style={{ marginBottom: "10px" }}>
              <label>
                Coordinates (click on map): X={formSample.coordinates.x}, Y=
                {formSample.coordinates.y}
              </label>
              <MapContainer
                center={[-8.672, 115.452]}
                zoom={5}
                style={{ height: "300px", width: "100%", marginTop: "10px" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <LocationPicker
                  formSample={formSample}
                  setFormSample={setFormSample}
                />
              </MapContainer>
            </div>

            <div style={{ textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  marginRight: "10px",
                  padding: "8px 12px",
                  border: "none",
                  backgroundColor: "#dc3545",
                  color: "white",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "8px 12px",
                  border: "none",
                  backgroundColor: "#28a745",
                  color: "white",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
