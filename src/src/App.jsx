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
