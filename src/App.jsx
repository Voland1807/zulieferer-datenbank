import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/data/mercedes_cla_komponenten_zulieferer.csv")
      .then((res) => res.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, { header: true });
        setData(parsed.data);
      });
  }, []);

  const filtered = data.filter((row) => {
    return (
      (search === "" ||
        row["Konkrete Komponente"]?.toLowerCase().includes(search.toLowerCase()) ||
        row["Zulieferer"]?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const downloadCSV = () => {
    const csvRows = [
      ["Konkrete Komponente", "Zulieferer"],
      ...filtered.map(row => [row["Konkrete Komponente"], row["Zulieferer"]])
    ];
    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cla_zulieferer_export.csv';
    a.click();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Mercedes CLA – Zuliefererdatenbank</h1>

      <input
        type="text"
        placeholder="Suche nach Komponente oder Zulieferer"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "0.5rem", margin: "1rem 0", width: "100%", maxWidth: "400px" }}
      />

      <button onClick={downloadCSV} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>
        ⬇️ Als CSV exportieren
      </button>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Komponente</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Zulieferer</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, i) => (
            <tr key={i}>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row["Konkrete Komponente"]}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row["Zulieferer"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
