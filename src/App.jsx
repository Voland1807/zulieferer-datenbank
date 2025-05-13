import { useEffect, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const translations = {
  de: {
    title: "Zuliefererdatenbank für Automodelle",
    searchPlaceholder: "Suche nach Modell, Komponente oder Zulieferer",
    model: "Modell",
    variant: "Variante",
    year: "Baujahr",
    category: "Kategorie",
    component: "Komponente",
    supplier: "Zulieferer",
    exportExcel: "Excel exportieren",
    exportPDF: "PDF exportieren",
    select: "wählen"
  },
  en: {
    title: "Supplier Database for Car Models",
    searchPlaceholder: "Search by model, component or supplier",
    model: "Model",
    variant: "Variant",
    year: "Year",
    category: "Category",
    component: "Component",
    supplier: "Supplier",
    exportExcel: "Export as Excel",
    exportPDF: "Export as PDF",
    select: "select"
  }
};

export default function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [model, setModel] = useState("");
  const [component, setComponent] = useState("");
  const [supplier, setSupplier] = useState("");
  const [lang, setLang] = useState("de");

  const t = translations[lang];

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
    const headers = [t.model, t.variant, t.year, t.component, t.supplier];
    const rows = filtered.map(row => [
      row["Modell"],
      row["Variante"],
      row["Baujahr"],
      row["Komponente"],
      row["Zulieferer"]
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Zulieferer");
    XLSX.writeFile(workbook, "zulieferer_export.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[t.model, t.variant, t.year, t.component, t.supplier]],
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
      <div style={{ marginBottom: "1rem" }}>
        <label>🌐 Sprache: </label>
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
      </div>

      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{t.title}</h1>

      <input
        type="text"
        placeholder={t.searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "0.5rem", margin: "1rem 0", width: "100%", maxWidth: "400px" }}
      />

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="">{t.model} {t.select}</option>
          {getUniqueValues("Modell").map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select value={component} onChange={(e) => setComponent(e.target.value)}>
          <option value="">{t.component} {t.select}</option>
          {getUniqueValues("Komponente", true).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
          <option value="">{t.supplier} {t.select}</option>
          {getUniqueValues("Zulieferer", true).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button onClick={exportToExcel}>{t.exportExcel}</button>
        <button onClick={exportToPDF}>{t.exportPDF}</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>{t.model}</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>{t.variant}</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>{t.year}</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>{t.component}</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>{t.supplier}</th>
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
