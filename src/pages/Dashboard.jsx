import { useState } from "react";

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
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
      coordinates: { x: -8.672, y: 115.452 },
      registered: "2025-08-31 10:00:00",
      edited: "2025-09-05 14:30:00",
    },
  ]);

  const [latestEdited, setLatestEdited] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null); // 👈 for detail popup
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
  });

  // Latest registered sample
  const latestRegistered = samples[samples.length - 1];

  const filtered = samples.filter((s) =>
    s.sampleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate ID
  const generateSampleId = (sample) => {
    const projectNum = String(sample.projectNumber).padStart(4, "0");
    const sampleNum = String(sample.sampleNumber).padStart(4, "0");
    return `${sample.projectSample}-${projectNum}-${sampleNum}`;
  };

  // Open Add Form
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
    });
    setShowForm(true);
  };

  // Open Edit Form
  const openEditForm = (index) => {
    setEditIndex(index);
    setFormSample(samples[index]);
    setShowForm(true);
  };

  // Save sample (add or edit)
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

        {/* Search */}
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <input
            type="text"
            placeholder="Search samples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "8px",
              width: "60%",
              maxWidth: "400px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              color: "black",
            }}
          />
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
              cursor: "pointer",
            }}
            onClick={() => setShowDetail(latestRegistered)} // 👈 click shows detail
          >
            <h3>📌 Latest Registered Sample</h3>
            {latestRegistered && (
              <p>
                <b>{latestRegistered.sampleName}</b> ({latestRegistered.sampleId})
              </p>
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
              cursor: "pointer",
            }}
            onClick={() => setShowDetail(latestEdited)} // 👈 click shows detail
          >
            <h3>🛠️ Latest Edited Sample</h3>
            {latestEdited ? (
              <p>
                <b>{latestEdited.sampleName}</b> ({latestEdited.sampleId})
              </p>
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
                  <button
                    onClick={() => setShowDetail(s)} // 👈 view detail from list
                    style={{
                      padding: "5px 10px",
                      border: "none",
                      backgroundColor: "#17a2b8",
                      color: "white",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Popup */}
      {showDetail && (
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
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "500px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              color: "black",
            }}
          >
            <h2>🔍 Sample Detail</h2>
            {Object.entries(showDetail).map(([key, value]) => (
              <p key={key}>
                <b>{key}:</b>{" "}
                {typeof value === "object"
                  ? `X: ${value.x}, Y: ${value.y}`
                  : value}
              </p>
            ))}
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setShowDetail(null)}
                style={{
                  marginTop: "10px",
                  padding: "8px 12px",
                  border: "none",
                  backgroundColor: "#dc3545",
                  color: "white",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Popup (Add/Edit) */}
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
          }}
        >
          <form
            onSubmit={handleSaveSample}
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "500px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              color: "black",
            }}
          >
            <h2>{editIndex !== null ? "Edit Sample" : "Add New Sample"}</h2>

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

            <input
              type="number"
              step="any"
              placeholder="Coordinate X"
              value={formSample.coordinates.x}
              onChange={(e) =>
                setFormSample({
                  ...formSample,
                  coordinates: { ...formSample.coordinates, x: e.target.value },
                })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <input
              type="number"
              step="any"
              placeholder="Coordinate Y"
              value={formSample.coordinates.y}
              onChange={(e) =>
                setFormSample({
                  ...formSample,
                  coordinates: { ...formSample.coordinates, y: e.target.value },
                })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

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
