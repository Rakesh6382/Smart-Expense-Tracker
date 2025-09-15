import React, { useState, useEffect, useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import "./App.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const LOCAL_KEY = "smart_expenses_v1";
const DEFAULT_CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Entertainment", "Others"];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function formatDateInput(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    category: "Food",
    date: formatDateInput(new Date()),
    note: ""
  });

  const [filters, setFilters] = useState({
    category: "All",
    search: ""
  });

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) setExpenses(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(expenses));
  }, [expenses]);

  function handleAddExpense(e) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return alert("Enter a valid amount");
    const newExpense = { id: uid(), ...form, amount: amt };
    setExpenses([newExpense, ...expenses]);
    setForm({ amount: "", category: "Food", date: formatDateInput(new Date()), note: "" });
  }

  function handleDelete(id) {
    if (window.confirm("Delete this expense?")) {
      setExpenses(expenses.filter((x) => x.id !== id));
    }
  }

  const filtered = useMemo(() => {
    return expenses.filter((ex) => {
      if (filters.category !== "All" && ex.category !== filters.category) return false;
      if (filters.search && !ex.note.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [expenses, filters]);

  const totalsByCategory = useMemo(() => {
    const map = {};
    DEFAULT_CATEGORIES.forEach((c) => (map[c] = 0));
    expenses.forEach((ex) => (map[ex.category] += ex.amount));
    return map;
  }, [expenses]);

  const chartData = {
    labels: Object.keys(totalsByCategory),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(totalsByCategory),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#28a745", "#6f42c1", "#fd7e14"]
      }
    ]
  };

  return (
    <div className="container">
      <h1>Smart Expense Tracker</h1>

      {/* Expense Form */}
      <div className="card">
        <h2>Add Expense</h2>
        <form onSubmit={handleAddExpense}>
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            type="text"
            placeholder="Note"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          <button type="submit" className="primary">Add</button>
        </form>
      </div>

      {/* Filters */}
      <div className="card filters">
        <h2>Filters</h2>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="All">All</option>
          {DEFAULT_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search notes"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Expense List */}
      <div className="card">
        <h2>Expenses ({filtered.length})</h2>
        {filtered.map((ex) => (
          <div key={ex.id} className="expense-item">
            <div>
              <strong>₹{ex.amount}</strong> - {ex.category}
              <div>{ex.date} • {ex.note || "-"}</div>
            </div>
            <button className="danger" onClick={() => handleDelete(ex.id)}>Delete</button>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card chart-container">
        <h2>Category-wise Expenses</h2>
        <Pie data={chartData} />
      </div>
    </div>
  );
}
