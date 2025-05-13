import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [model, setModel] = useState("");
  const [component, setComponent] = useState("");
  const [supplier, setSupplier] = useState("");

  useEffect(() => {
    fetch("/data/zulieferer_automodelle.csv")
      .then((res) => res.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, { header: true });
        setData(parsed.data);
      });
  }, []);

  const filtered = data.filter((row) => {
    return (
      (model === "" || row["Modell"] === model) &&
      (component === "" || row["Komponente"] === component) &&
      (supplier === "" || row["Zulieferer"] === supplier) &&
      (search === "" ||
        row["Komponente"]?.toLowerCase().includes(search.toLowerCase()) ||
        row["Zulieferer"]?.toLowerCase().includes(search.toLowerCase()) ||
        row["Modell"]?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const getUniqueValues = (key, withinModel = false) => {
    const scopedData = withinModel && model ? data.filter(row => row["Modell"] === model) : data;
    return Array.from(new Set(scopedData.map(d => d[key]).filter(Boolean))).sort();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Zuliefererdatenbank für Automodelle</h1>

      <input
        type="text"
        placeholder="Suche nach Modell, Komponente oder Zulieferer"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "0.5rem", margin: "1rem 0", width: "100%", maxWidth: "400px" }}
      />

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="">Modell wählen</option>
          {getUniqueValues("Modell").map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select value={component} onChange={(e) => setComponent(e.target.value)}>
          <option value="">Komponente wählen</option>
          {getUniqueValues("Komponente", true).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
          <option value="">Zulieferer wählen</option>
          {getUniqueValues("Zulieferer", true).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Modell</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Variante</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Baujahr</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Komponente</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Zulieferer</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, i) => (
            <tr key={i}>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row["Modell"]}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row["Variante"]}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row["Baujahr"]}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row["Komponente"]}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row["Zulieferer"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
