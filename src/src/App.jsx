import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [componentFilter, setComponentFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

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
      (componentFilter === "" || row["Konkrete Komponente"] === componentFilter) &&
      (supplierFilter === "" || row["Zulieferer"] === supplierFilter) &&
      (search === "" ||
        row["Konkrete Komponente"]?.toLowerCase().includes(search.toLowerCase()) ||
        row["Zulieferer"]?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const unique = (key) => Array.from(new Set(data.map((d) => d[key]).filter(Boolean)));

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

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <select onChange={(e) => setComponentFilter(e.target.value)} value={componentFilter}>
          <option value="">Komponente filtern</option>
          {unique("Konkrete Komponente").map((item, i) => (
            <option key={i} value={item}>{item}</option>
          ))}
        </select>

        <select onChange={(e) => setSupplierFilter(e.target.value)} value={supplierFilter}>
          <option value="">Zulieferer filtern</option>
          {unique("Zulieferer").map((item, i) => (
            <option key={i} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {filtered.map((row, i) => (
          <div key={i} style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
            <p><strong>Komponente:</strong> {row["Konkrete Komponente"]}</p>
            <p><strong>Zulieferer:</strong> {row["Zulieferer"]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
