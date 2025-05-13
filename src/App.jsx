import { useEffect, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Zulieferer");
    XLSX.writeFile(workbook, "zulieferer_export.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Modell", "Variante", "Baujahr", "Komponente", "Zulieferer"]],
      body: filtered.map((row) => [
        row["Modell"],
        row["Variante"],
        row["Baujahr"],
        row["Komponente"],
        row["Zulieferer"]
      ]),
    });
    doc.save("zulieferer_export.pdf");
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

        <button onClick={exportToExcel}>Excel exportieren</button>
        <button onClick={exportToPDF}>PDF exportieren</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "co
