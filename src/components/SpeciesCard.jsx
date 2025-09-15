function SpeciesCard({ sample }) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <img
        src={`http://localhost:5000/${sample.image || "uploads/default.png"}`}
        alt={sample.sampleName}
        className="w-full h-40 object-cover rounded"
      />
      <h2 className="text-lg font-semibold mt-2">{sample.sampleName}</h2>
      <p className="text-gray-500">{sample.genus} {sample.species}</p>
    </div>
  );
}

export default SpeciesCard;
