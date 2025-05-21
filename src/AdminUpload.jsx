import React, { useState } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const AdminUpload = () => {
  const [authorized, setAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [modelFiles, setModelFiles] = useState([]);
  const [mergedData, setMergedData] = useState([]);

  const correctPassword = "admin123"; // 🔑 Anpassen nach Bedarf

  const handleAuth = () => {
    if (passwordInput === correctPassword) {
      setAuthorized(true);
    } else {
      alert("Falsches Passwort");
    }
  };

  const parseAndAddFile = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setModelFiles((prev) => [...prev, { name: file.name, data: results.data }]);
      },
    });
  };

  const removeModelFile = (name) => {
    setModelFiles((prev) => prev.filter((entry) => entry.name !== name));
  };

  const mergeAllModels = () => {
    if (modelFiles.length === 0) {
      alert("Bitte mindestens eine Modell-Datei hochladen");
      return;
    }

    const allData = modelFiles.flatMap((entry) => entry.data);

    // Duplikate entfernen (Modell + Komponente + Zulieferer)
    const unique = Array.from(
      new Map(
        allData.map((row) => [
          `${row.Modell}|${row.Komponente}|${row.Zulieferer}`,
          row,
        ])
      ).values()
    );

    setMergedData(unique);
  };

  const downloadMerged = () => {
    const csv = Papa.unparse(mergedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "zulieferer_automodelle_merged.csv");
  };

  if (!authorized) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>🔐 Admin-Zugang</h2>
        <input
          type="password"
          placeholder="Passwort eingeben"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
        <button onClick={handleAuth}>Einloggen</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🧩 Admin Upload: Modellweise</h2>

      {/* Modell-Datei hochladen */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4>📂 Modell-CSV hochladen</h4>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => parseAndAddFile(e.target.files[0])}
        />
      </div>

      {/* Liste geladener Modelle */}
      {modelFiles.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h4>✅ Geladene Dateien:</h4>
          <ul>
            {modelFiles.map((file, i) => (
              <li key={i}>
                {file.name} ({file.data.length} Zeilen)
                <button
                  onClick={() => removeModelFile(file.name)}
                  style={{ marginLeft: "1rem" }}
                >
                  ❌ Entfernen
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Merge + Download */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button onClick={mergeAllModels}>🔄 Alle zusammenführen</button>
      </div>

      {mergedData.length > 0 && (
        <div>
          <h4>📊 Ergebnis: {mergedData.length} Einträge</h4>
          <button onClick={downloadMerged}>⬇️ Download: Master-Datei</button>
        </div>
      )}
    </div>
  );
};

export default AdminUpload;
