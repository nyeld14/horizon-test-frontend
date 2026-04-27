import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const API_BASE = (import.meta.env.VITE_BASE_URL || "https://www.horizonoffgridenergy.com").replace(/\/$/, "");

const STATUS_COLOUR = {
  ok: "#22c55e",
  alarm: "#ef4444",
  offline: "#6b7280",
  unknown: "#6b7280",
};

const STATUS_LABEL = {
  ok: "OK",
  alarm: "ALARM",
  offline: "OFFLINE",
  unknown: "UNKNOWN",
};

const SiteDot = ({ site, isSelected, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const colour = STATUS_COLOUR[site.status] || STATUS_COLOUR.unknown;
  const alarms = site.active_alarms || [];
  const soc = site.soc_percent != null ? `${Math.round(site.soc_percent)}%` : "—";
  const age = site.last_seen_minutes_ago;
  const ageText = age == null ? "—" : age < 120 ? `${age}m ago` : `${Math.floor(age / 60)}h ago`;

  return (
    <div
      style={{ position: "relative", display: "inline-block", margin: 6, verticalAlign: "top" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        onClick={onClick}
        style={{
          width: 52, height: 52, borderRadius: "50%", background: colour,
          border: `3px solid ${isSelected ? "#fff" : colour}`,
          boxShadow: isSelected ? `0 0 0 3px ${colour}` : "0 2px 6px rgba(0,0,0,0.25)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "#fff", userSelect: "none",
          transition: "transform 0.15s", transform: hovered ? "scale(1.15)" : "scale(1)",
        }}
      >
        {site.name.slice(0, 2).toUpperCase()}
      </div>
      <div style={{
        textAlign: "center", fontSize: 10, marginTop: 3, maxWidth: 64,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#6b7280",
      }}>
        {soc} · {ageText}
      </div>
      {hovered && (
        <div style={{
          position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)",
          background: "#1f2937", color: "#f9fafb", borderRadius: 8, padding: "8px 12px",
          fontSize: 12, whiteSpace: "nowrap", zIndex: 1000,
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)", pointerEvents: "none", minWidth: 160,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4, borderBottom: "1px solid #374151", paddingBottom: 4 }}>
            {site.name}
          </div>
          <div style={{ color: colour, fontWeight: 600, marginBottom: 4 }}>
            ● {STATUS_LABEL[site.status]}
          </div>
          {site.soc_percent != null && <div>🔋 SoC: {Math.round(site.soc_percent)}%</div>}
          {site.system_state && <div>⚡ State: {site.system_state}</div>}
          {alarms.length > 0 ? (
            <div style={{ marginTop: 4, color: "#fca5a5" }}>
              ⚠ {alarms.length} alarm{alarms.length > 1 ? "s" : ""}:
              {alarms.map((a, i) => (
                <div key={i} style={{ fontSize: 11, paddingLeft: 8 }}>• {a.description}</div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 4, color: "#86efac" }}>✓ No alarms</div>
          )}
          <div style={{ marginTop: 6, fontSize: 10, color: "#9ca3af" }}>
            Click to open detail · Double-click for VRM
          </div>
        </div>
      )}
    </div>
  );
};

const SiteDetail = ({ site, token, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(24);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/api/vrm/fleet-status/${site.installation_id}/?hours=${hours}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetail(res.data);
    } catch (e) {
      console.error("Failed to fetch site detail", e);
    } finally {
      setLoading(false);
    }
  }, [site.installation_id, hours, token]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const colour = STATUS_COLOUR[site.status];
  const alarms = site.active_alarms || [];
  const pw = (v) => v != null ? `${Math.round(v)}W` : "—";
  const vv = (v) => v != null ? `${v.toFixed(2)}V` : "—";

  const readings = detail?.readings || [];
  const chartData = readings.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    "SoC %": r.soc_percent,
    "Out L1": r.output_power_l1_w,
    "Out L2": r.output_power_l2_w,
    "Out L3": r.output_power_l3_w,
    "In L1": r.input_power_l1_w,
    "In L2": r.input_power_l2_w,
    "In L3": r.input_power_l3_w,
  }));

  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
      padding: 24, marginTop: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    }}>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-1 fw-bold">{site.name}</h5>
          <span style={{ background: colour, color: "#fff", padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
            {STATUS_LABEL[site.status]}
          </span>
        </div>
        <div className="d-flex gap-2">
          
            <a
            href={site.vrm_url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-outline-primary"
          >
            Open in VRM ↗
          </a>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            ✕ Close
          </button>
        </div>
      </div>

      {alarms.length > 0 && (
        <div className="alert alert-danger py-2 mb-3">
          <strong>⚠ {alarms.length} active alarm{alarms.length > 1 ? "s" : ""}:</strong>
          <ul className="mb-0 mt-1">
            {alarms.map((a, i) => (
              <li key={i}>{a.description} {a.formatted ? `— ${a.formatted}` : ""}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="row g-2 mb-3">
        {[
          ["🔋 SoC", site.soc_percent != null ? `${Math.round(site.soc_percent)}%` : "—"],
          ["⚡ Battery V", vv(site.battery_voltage_v)],
          ["🔌 Battery W", pw(site.battery_power_w)],
          ["📊 State", site.system_state || "—"],
          ["🔧 Generator", site.generator_state || "—"],
        ].map(([label, value]) => (
          <div key={label} className="col-6 col-md-4 col-lg-2">
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 12px", border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: 11, color: "#166534", fontWeight: 600, marginBottom: 4 }}>OUTPUT (L1 / L2 / L3)</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {pw(site.output_power_l1_w)} / {pw(site.output_power_l2_w)} / {pw(site.output_power_l3_w)}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 12px", border: "1px solid #bfdbfe" }}>
            <div style={{ fontSize: 11, color: "#1e40af", fontWeight: 600, marginBottom: 4 }}>INPUT (L1 / L2 / L3)</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {pw(site.input_power_l1_w)} / {pw(site.input_power_l2_w)} / {pw(site.input_power_l3_w)}
            </div>
          </div>
        </div>
      </div>

      {site.vrm_last_timestamp && (
        <div className="text-muted small mb-3">
          Last VRM reading: {new Date(site.vrm_last_timestamp).toLocaleString("en-GB")}
          {site.last_seen_minutes_ago > 30 && (
            <span className="text-warning ms-2">
              ⚠ {site.last_seen_minutes_ago < 120
                ? `${site.last_seen_minutes_ago} minutes ago`
                : `${Math.floor(site.last_seen_minutes_ago / 60)} hours ago`}
            </span>
          )}
        </div>
      )}

      <div className="d-flex align-items-center gap-2 mb-3">
        <strong style={{ fontSize: 14 }}>Trend</strong>
        {[1, 6, 24, 72, 168].map(h => (
          <button
            key={h}
            className={`btn btn-sm ${hours === h ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setHours(h)}
            style={{ fontSize: 12, padding: "2px 10px" }}
          >
            {h < 24 ? `${h}h` : `${h / 24}d`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-4 text-muted">Loading...</div>
      ) : chartData.length === 0 ? (
        <div className="text-center py-4 text-muted">No readings in this time window yet.</div>
      ) : (
        <>
          {chartData.some(d => d["SoC %"] != null) && (
            <div className="mb-4">
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#374151" }}>Battery State of Charge</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v) => v != null ? `${v.toFixed(1)}%` : "—"} />
                  <Line type="monotone" dataKey="SoC %" stroke="#3b82f6" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {chartData.some(d => d["Out L1"] != null || d["In L1"] != null) && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#374151" }}>Input / Output Power by Phase</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} unit="W" />
                  <Tooltip formatter={(v) => v != null ? `${Math.round(v)}W` : "—"} />
                  <Legend />
                  <Line type="monotone" dataKey="Out L1" stroke="#22c55e" dot={false} strokeWidth={1.5} />
                  <Line type="monotone" dataKey="Out L2" stroke="#16a34a" dot={false} strokeWidth={1.5} />
                  <Line type="monotone" dataKey="Out L3" stroke="#14532d" dot={false} strokeWidth={1.5} />
                  <Line type="monotone" dataKey="In L1" stroke="#3b82f6" dot={false} strokeWidth={1.5} />
                  <Line type="monotone" dataKey="In L2" stroke="#2563eb" dot={false} strokeWidth={1.5} />
                  <Line type="monotone" dataKey="In L3" stroke="#1d4ed8" dot={false} strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const VRMFleetDashboard = ({ token }) => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchFleet = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/vrm/fleet-status/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFleet(res.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError("Failed to load fleet status.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFleet();
    const interval = setInterval(fetchFleet, 60_000);
    return () => clearInterval(interval);
  }, [fetchFleet]);

  const counts = fleet.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
      <div className="text-muted">Loading fleet status...</div>
    </div>
  );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0 fw-bold">⚡ VRM Fleet Status</h4>
        <div className="d-flex align-items-center gap-3">
          {lastUpdated && (
            <span className="text-muted small">Updated {lastUpdated.toLocaleTimeString("en-GB")}</span>
          )}
          <button className="btn btn-sm btn-outline-primary" onClick={fetchFleet}>🔄 Refresh</button>
        </div>
      </div>

      <div className="row g-2 mb-4">
        {[
          ["Total Sites", fleet.length, "#3b82f6"],
          ["✅ OK", counts.ok || 0, "#22c55e"],
          ["🔴 Alarm", counts.alarm || 0, "#ef4444"],
          ["⚫ Offline", counts.offline || 0, "#6b7280"],
        ].map(([label, value, colour]) => (
          <div key={label} className="col-6 col-md-3">
            <div style={{
              background: "#fff", border: `2px solid ${colour}20`,
              borderLeft: `4px solid ${colour}`, borderRadius: 8,
              padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: colour }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
        padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            {fleet.length} sites — click a dot to view detail, double-click to open VRM
          </span>
          <div className="ms-auto d-flex gap-3">
            {Object.entries(STATUS_COLOUR).map(([status, colour]) => (
              <span key={status} style={{ fontSize: 12, color: "#6b7280" }}>
                <span style={{
                  display: "inline-block", width: 10, height: 10,
                  borderRadius: "50%", background: colour, marginRight: 4,
                }} />
                {STATUS_LABEL[status]}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {fleet.map(site => (
            <SiteDot
              key={site.installation_id}
              site={site}
              isSelected={selectedSite?.installation_id === site.installation_id}
              onClick={() => setSelectedSite(
                selectedSite?.installation_id === site.installation_id ? null : site
              )}
              onDoubleClick={() => window.open(site.vrm_url, "_blank")}
            />
          ))}
        </div>
      </div>

      {selectedSite && (
        <SiteDetail
          site={selectedSite}
          token={token}
          onClose={() => setSelectedSite(null)}
        />
      )}
    </div>
  );
};

export default VRMFleetDashboard;
