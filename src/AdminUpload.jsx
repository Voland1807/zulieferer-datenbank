import React, { useState } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const AdminUpload = () => {
  const [authorized, setAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [baseData, setBaseData] = useState([]);
  const [newData, setNewData] = useState([]);
  const [mergedData, setMergedData] = useState([]);

  const correctPassword = "admin123"; // 🔑 Hier ändern

  const handleAuth = () => {
    if (passwordInput === correctPassword) {
      setAuthorized(true);
    } else {
      alert("Falsches Passwort");
    }
  };

  const parseFile = (file, callback) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        callback(results.data);
      },
    });
  };

  const mergeData = () => {
    if (!baseData.length || !newData.length) {
      alert("Bitte beide Dateien hochladen");
      return;
    }

    const combined = [...baseData, ...newData];

    // Duplikate entfernen nach Modell + Komponente + Zulieferer
    const unique = Array.from(
      new Map(
        combined.map((item) => [
          `${item.Modell}|${item.Komponente}|${item.Zulieferer}`,
          item,
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
      <h2>🛠 Admin Upload & Merge</h2>

      <div style={{ marginBottom: "1rem" }}>
        <h4>1️⃣ Bestehende Datei hochladen (aktuelle Master-Datei)</h4>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => parseFile(e.target.files[0], setBaseData)}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4>2️⃣ Neue Modell-Datei hochladen</h4>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => parseFile(e.target.files[0], setNewData)}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={mergeData}>🔄 Zusammenführen</button>
      </div>

      {mergedData.length > 0 && (
        <div>
          <h4>✅ Zusammengeführt: {mergedData.length} Einträge</h4>
          <button onClick={downloadMerged}>⬇️ Merged CSV herunterladen</button>
        </div>
      )}
    </div>
  );
};

export default AdminUpload;

