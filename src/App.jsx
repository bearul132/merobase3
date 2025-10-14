import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import L from "leaflet";
import logo from "./assets/mero.jpg";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/* --- Small helper components for the searchable map inside the form --- */

// A component inside MapContainer that centers/flys the map when `center` prop changes.
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], Math.max(map.getZoom(), 10));
    }
  }, [center, map]);
  return null;
}

// Handles clicks on map to update coordinates in the parent formSample.
function ClickSetter({ formSample, setFormSample }) {
  useMapEvents({
    click(e) {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      setFormSample({
        ...formSample,
        coordinates: { x: lng, y: lat },
      });
    },
  });
  return null;
}

function SearchableMap({ formSample, setFormSample }) {
  const providerRef = useRef(new OpenStreetMapProvider());
  const [query, setQuery] = useState("");
  const [center, setCenter] = useState(
    formSample.coordinates.x && formSample.coordinates.y
      ? { lat: Number(formSample.coordinates.y), lng: Number(formSample.coordinates.x) }
      : { lat: -8.672, lng: 115.452 }
  );

  // keep center in sync if coordinates changed externally
  useEffect(() => {
    if (formSample.coordinates.x && formSample.coordinates.y) {
      setCenter({
        lat: Number(formSample.coordinates.y),
        lng: Number(formSample.coordinates.x),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formSample.coordinates.x, formSample.coordinates.y]);

  const handleSearch = async () => {
    if (!query) return;
    try {
      const results = await providerRef.current.search({ query });
      if (results && results.length > 0) {
        const r = results[0];
        // provider returns x = lon, y = lat
        const lat = Number(r.y);
        const lng = Number(r.x);
        // update both the form values and local center for map
        setFormSample({
          ...formSample,
          coordinates: { x: Number(lng.toFixed(6)), y: Number(lat.toFixed(6)) },
        });
        setCenter({ lat, lng });
      } else {
        // no results — you might want to show an alert in future
      }
    } catch (err) {
      console.error("Geosearch error", err);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Search location (e.g. Bali)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          style={{
            padding: "8px 12px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={10}
        style={{ height: "250px", width: "100%", borderRadius: 8 }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController center={center} />
        <ClickSetter formSample={formSample} setFormSample={setFormSample} />
        {formSample.coordinates.x && formSample.coordinates.y && (
          <Marker position={[Number(formSample.coordinates.y), Number(formSample.coordinates.x)]} />
        )}
      </MapContainer>
    </div>
  );
}

/* -------------------- Dashboard (merged) -------------------- */

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;


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
  const [showView, setShowView] = useState(false);
  const [viewSample, setViewSample] = useState(null);
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

  // Filter + search + date + sort logic
  const filtered = samples
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.sampleName.toLowerCase().includes(q) ||
        (s.species || "").toLowerCase().includes(q) ||
        (s.genus || "").toLowerCase().includes(q) ||
        (s.family || "").toLowerCase().includes(q) ||
        (s.sampleId || "").toLowerCase().includes(q);

      const matchesFilter =
        filter === "all" ||
        (filter === "acropora" && (s.genus || "").toLowerCase() === "acropora") ||
        (filter === "pocilopora" && (s.genus || "").toLowerCase() === "pocilopora") ||
        (filter === "chromodoris" && (s.genus || "").toLowerCase() === "chromodoris") ||
        (filter === "hypselodoris" && (s.genus || "").toLowerCase() === "hypselodoris") ||
        (filter === "glossodoris" && (s.genus || "").toLowerCase() === "glossodoris") ||
        (filter === "animalia" && (s.kingdom || "").toLowerCase() === "animalia") ||
        (filter === "plantae" && (s.kingdom || "").toLowerCase() === "plantae") ||
        (filter === "fungi" && (s.kingdom || "").toLowerCase() === "fungi") ||
        (filter === "bacteria" && (s.kingdom || "").toLowerCase() === "bacteria") ||
        (filter === "archaebacteria" && (s.kingdom || "").toLowerCase() === "archaebacteria") ||
        (filter === "eubacteria" && (s.kingdom || "").toLowerCase() === "eubacteria") ||
        (filter === "projectA" && s.projectSample === "A") ||
        (filter === "projectB" && s.projectSample === "B");

      const matchesDate =
        (!startDate || new Date(s.dateAcquired) >= startDate) &&
        (!endDate || new Date(s.dateAcquired) <= endDate);


      return matchesSearch && matchesFilter && matchesDate;
    })
    .sort((a, b) =>
      sortBy === "latest"
        ? new Date(b.edited) - new Date(a.edited)
        : new Date(a.edited) - new Date(b.edited)
    );

const generateSampleId = (sample) => {
  const projectNum = String(sample.projectNumber).padStart(4, "0");
  const sampleNum = String(sample.sampleNumber).padStart(4, "0");
  let baseId = `${sample.projectSample}-${projectNum}-${sampleNum}`;

  const hasSEM = !!sample.semPhoto;
  const hasISO = !!sample.isolatedPhoto;

  if (hasSEM && hasISO) baseId += "-SEM-ISO";
  else if (hasSEM) baseId += "-SEM";
  else if (hasISO) baseId += "-ISO";

  return baseId;
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
    // ensure we copy to avoid mutating source object directly
    const src = samples[index];
    setFormSample({
      ...src,
      // coordinates ensure number formatting
      coordinates: {
        x: src.coordinates?.x ?? "",
        y: src.coordinates?.y ?? "",
      },
    });
    setShowForm(true);
  };

  const openViewModal = (sample) => {
    setViewSample(sample);
    setShowView(true);
  };

  const handleSaveSample = (e) => {
    e.preventDefault();
    const id = generateSampleId(formSample);
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];
    const formattedTime = now.toLocaleTimeString();

    // Ensure coordinates are numbers (decimal degrees)
    const coords =
      formSample.coordinates && formSample.coordinates.x !== ""
        ? {
            x: Number(formSample.coordinates.x),
            y: Number(formSample.coordinates.y),
          }
        : { x: "", y: "" };

    const sampleToSave = {
      ...formSample,
      coordinates: coords,
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
    if (!file) return;
    const previewURL = URL.createObjectURL(file);
    setFormSample((prev) => ({ ...prev, [type]: previewURL }));
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
<h1
  style={{
    textAlign: "center",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
    <img
      src={logo}
      alt="MEROBase Logo"
      style={{
        width: "70px",
        height: "70px",
        objectFit: "contain",
        borderRadius: "12px",
      }}
    />
    <span style={{ fontSize: "2rem", fontWeight: "bold" }}>MEROBase Dashboard</span>
  </div>

  <button
    style={{
      padding: "4px 10px",  // smaller padding
      fontSize: "0.9rem",   // smaller text
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    }}
    onClick={() => alert("Still on maintenance")}
  >
    Login
  </button>
</h1>

        {/* Search + Filter + Sort + Date */}
        <div
          style={{
            marginBottom: "20px",
            textAlign: "center",
            display: "flex",
            flexWrap: "wrap",
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
              width: "250px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              color: "black",
            }}
          />
{/* Separated filter dropdowns */}
<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
  {/* Genus Filter */}
  <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    style={{ padding: "8px", borderRadius: "5px", minWidth: "160px" }}
  >
    <option value="all">All Genus</option>
    <option value="acropora">Genus: Acropora</option>
    <option value="pocilopora">Genus: Pocilopora</option>
    <option value="chromodoris">Genus: Chromodoris</option>
    <option value="hypselodoris">Genus: Hypselodoris</option>
    <option value="glossodoris">Genus: Glossodoris</option>
  </select>

  {/* Kingdom Filter */}
  <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    style={{ padding: "8px", borderRadius: "5px", minWidth: "160px" }}
  >
    <option value="all">All Kingdom</option>
    <option value="animalia">Kingdom: Animalia</option>
    <option value="plantae">Kingdom: Plantae</option>
    <option value="fungi">Kingdom: Fungi</option>
    <option value="protista">Kingdom: Protista</option>
    <option value="bacteria">Kingdom: Bacteria</option>
    <option value="eubacteria">Kingdom: Eubacteria</option>
  </select>

  {/* Project Filter */}
  <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    style={{ padding: "8px", borderRadius: "5px", minWidth: "160px" }}
  >
    <option value="all">All Projects</option>
    <option value="projectA">Project: A</option>
    <option value="projectB">Project: B</option>
  </select>
</div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "8px", borderRadius: "5px" }}
          >
            <option value="latest">Sort: Latest Edited</option>
            <option value="oldest">Sort: Oldest Edited</option>
          </select>
      <ReactDatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={(update) => setDateRange(update)}
        isClearable={true}
        placeholderText="Select date range"
        dateFormat="yyyy-MM-dd"
        style={{ padding: "8px", borderRadius: "5px", minWidth: "220px" }}
/>

        </div>

        {/* Add Button */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <button
            onClick={openAddForm}
            style={{
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

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th>Image</th>
              <th>ID</th>
              <th>Name</th>
              <th>Species</th>
              <th>Last Edited</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, index) => (
              <tr key={s.sampleId}>
                <td style={{ textAlign: "center" }}>
                  {s.image ? (
                    <img
                      src={s.image}
                      alt="thumb"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{s.sampleId}</td>
                <td>{s.sampleName}</td>
                <td>{s.species}</td>
                <td>{s.edited}</td>
                <td>
                  <button
                    onClick={() => openEditForm(index)}
                    style={{
                      padding: "5px 10px",
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
                    onClick={() => openViewModal(s)}
                    style={{
                      padding: "5px 10px",
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

      {/* View Modal */}
      {showView && viewSample && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255,255,255,0.95)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "auto",
            padding: "30px",
            zIndex: 999,
          }}
          onClick={() => setShowView(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              maxWidth: "600px",
              width: "100%",
              overflowY: "auto",
              color: "black",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ textAlign: "center" }}>Sample Details</h2>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              {["image", "semPhoto", "isolatedPhoto"].map((t) =>
                viewSample[t] ? (
                  <a key={t} href={viewSample[t]} target="_blank" rel="noreferrer">
                    <img
                      src={viewSample[t]}
                      alt={t}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </a>
                ) : null
              )}
            </div>

            {Object.entries(viewSample).map(([key, value]) =>
              ["image", "semPhoto", "isolatedPhoto"].includes(key) ? null : (
                <p key={key}>
                  <b>{key}:</b>{" "}
                  {typeof value === "object"
                    ? `X: ${value.x}, Y: ${value.y}`
                    : String(value)}
                </p>
              )
            )}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255,255,255,0.97)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "auto",
            padding: "20px",
            zIndex: 1000,
          }}
          onClick={() => setShowForm(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveSample}
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ textAlign: "center" }}>
              {editIndex !== null ? "Edit Sample" : "Add New Sample"}
            </h2>

            <div style={{ display: "grid", gap: 10 }}>
              {/* >>> MOVED: Sample Photo on top under header */}
              <div style={{ marginBottom: 6 }}>
                <label style={{ fontWeight: 600 }}>Sample Photo:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "image")}
                  style={{ display: "block", marginTop: 6 }}
                />
                {formSample.image && (
                  <img
                    src={formSample.image}
                    alt={"Sample Photo"}
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginTop: 8,
                    }}
                  />
                )}
              </div>

              {/* main fields */}
              {[
                { name: "sampleName", label: "Sample Name", type: "text" },
                { name: "projectSample", label: "Project Sample (A/B)", type: "text" },
                { name: "projectNumber", label: "Project Number", type: "number" },
                { name: "sampleNumber", label: "Sample Number", type: "number" },
                { name: "kingdom", label: "Kingdom", type: "text" },
                { name: "family", label: "Family", type: "text" },
                { name: "genus", label: "Genus", type: "text" },
                { name: "species", label: "Species", type: "text" },
                { name: "dateAcquired", label: "Date Acquired", type: "date" },
              ].map((field) => (
                <div key={field.name} style={{ marginBottom: 6 }}>
                  <label style={{ fontWeight: 600 }}>{field.label}:</label>
                  <input
                    type={field.type}
                    value={formSample[field.name] ?? ""}
                    onChange={(e) =>
                      setFormSample({ ...formSample, [field.name]: e.target.value })
                    }
                    required={field.name === "sampleName" || field.name === "projectNumber" || field.name === "sampleNumber"}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      marginTop: 4,
                    }}
                  />
                </div>
              ))}

              {/* SEM & Isolated uploads remain at the bottom */}
              {[
                { type: "semPhoto", label: "SEM Photo" },
                { type: "isolatedPhoto", label: "Isolated Photo" },
              ].map(({ type, label }) => (
                <div key={type} style={{ marginBottom: 6 }}>
                  <label style={{ fontWeight: 600 }}>{label}:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, type)}
                    style={{ display: "block", marginTop: 6 }}
                  />
                  {formSample[type] && (
                    <img
                      src={formSample[type]}
                      alt={label}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "5px",
                        marginTop: 6,
                      }}
                    />
                  )}
                </div>
              ))}

              {/* Map with search */}
              <div style={{ marginTop: 8 }}>
                <b>Pick Location</b>
                <SearchableMap formSample={formSample} setFormSample={setFormSample} />
                <div style={{ marginTop: 6 }}>
                  Coordinates (decimal degrees):{" "}
                  <span style={{ fontWeight: 700 }}>
                    X: {formSample.coordinates.x ?? ""}, Y: {formSample.coordinates.y ?? ""}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    borderRadius: "6px",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  Save Sample
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: "10px 14px",
                    marginLeft: 8,
                    backgroundColor: "#dc3545",
                    color: "white",
                    borderRadius: "6px",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
