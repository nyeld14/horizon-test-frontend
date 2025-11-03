// src/components/reports/UsageReport.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  MDBContainer,
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from "mdb-react-ui-kit";

import logo from "../../assets/images/logo.png";

const itemsPerPage = 100;

const UsageReport = ({ token }) => {
  const [usages, setUsages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inverters, setInverters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    fetchData();
    convertImageToBase64(logo, setLogoBase64);
  }, [currentPage, search, fromDate, toDate]);

  const convertImageToBase64 = (imagePath, setter) => {
    fetch(imagePath)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setter(reader.result);
        reader.readAsDataURL(blob);
      });
  };

  const fetchData = async () => {
    try {
      let url = `/usages/?page=${currentPage}`;
      if (search) url += `&po_number=${search}`;
      if (fromDate) url += `&from_date=${fromDate}`;
      if (toDate) url += `&to_date=${toDate}`;

      const [usageRes, orderRes, inverterRes, locationRes] = await Promise.all([
        axiosInstance.get(url, { headers: { Authorization: `Bearer ${token}` } }),
        axiosInstance.get("/orders/", { headers: { Authorization: `Bearer ${token}` } }),
        axiosInstance.get("/inverters/", { headers: { Authorization: `Bearer ${token}` } }),
        axiosInstance.get("/locations/", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setUsages(usageRes.data.results || []);
      setTotalPages(Math.ceil(usageRes.data.count / itemsPerPage));
      setOrders(orderRes.data.results || orderRes.data || []);
      setInverters(inverterRes.data.results || inverterRes.data || []);
      setLocations(locationRes.data.results || locationRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axiosInstance.post("/usages-upload/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Excel file uploaded successfully!");
      setCurrentPage(1);
      fetchData();
    } catch (err) {
      console.error("Excel upload failed:", err);
      alert("❌ Failed to upload Excel file. Please try again.");
    }
  };

  const formatInverter = (raw) => {
    if (!raw) return "-";
    const match = raw.match(/HZE-[0-9/()-]+/i);
    return match ? match[0] : raw;
  };

  const formatPO = (raw) => {
    if (!raw) return "-";
    const match = raw.match(/\d+\/\d+/);
    return match ? match[0] : raw;
  };

  // ✅ Updated downloadPDF with corrected new logic
  const downloadPDF = () => {
    if (!usages.length) return;

    const doc = new jsPDF("p", "mm", "a4");
    const FUEL_PRICE = 1.25;

    // Group usages by PO number
    const groupedByPO = usages.reduce((acc, u) => {
      const po = u.po_number || "Unknown PO";
      if (!acc[po]) acc[po] = [];
      acc[po].push(u);
      return acc;
    }, {});

    Object.entries(groupedByPO).forEach(([poNumber, usagesGroup], idx) => {
      if (idx > 0) doc.addPage();

      const first = usagesGroup[0];
      const location = first.location_name || "Unknown Location";
      const generatorNo = first.generator_no || "-";
      const inverterNo = first.inverter_given_start_name || "-";
      const givenName = first.inverter_given_name || "-";
      const FUEL_CONS_PER_HR = first.fuel_consumption || 6.8;

      // HEADER
      if (logoBase64) doc.addImage(logoBase64, 14, 8, 25, 12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`Battery Usage Report - ${inverterNo}`, doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });
      doc.setFontSize(10);

      // LEFT HEADER
      doc.text(`PO Number: ${poNumber}`, 14, 28);
      doc.text(`Location: ${location}`, 14, 34);
      doc.text(`Generator No: ${generatorNo}`, 14, 40);

      // RIGHT HEADER
      doc.text(`Inverter No: ${inverterNo}`, 120, 28);
      const inverterDetails = `${first.inverter_given_start_name || ""} ${first.inverter_model || ""} ${first.client_name || ""} ${first.location_name || ""}`;
      doc.text(`Inverter: ${inverterDetails.trim() || "-"}`, 120, 34);
      doc.text(`Client: ${first.client_name || "-"}`, 120, 40);

      // ✅ Totals (new formula)
      const numberOfDays = usagesGroup.length;
      const totalKW = usagesGroup.reduce((s, u) => s + (u.kw_consumed || 0), 0);
      const totalSiteHours = usagesGroup.reduce((s, u) => s + (u.site_run_hour || 0), 0);
      const totalGenHr = usagesGroup.reduce((s, u) => s + (u.generator_run_hour || 0), 0);
      const totalGenHrSaved = totalSiteHours - totalGenHr;

      // New definitions
      const conventionalRunTime = totalSiteHours * FUEL_CONS_PER_HR;
      const reductionInRunHours = totalGenHrSaved;
      const conventionalCost = totalSiteHours * FUEL_CONS_PER_HR * FUEL_PRICE;
      const hybridFuelSavedRuntime = totalGenHrSaved * FUEL_CONS_PER_HR;
      const hybridFuelSavedCost = totalGenHrSaved * FUEL_CONS_PER_HR * FUEL_PRICE;

      // Other derived totals for overall summary
      const fuelSaved = hybridFuelSavedRuntime;
      const savingsEuro = hybridFuelSavedCost;
      const co2Reduction = usagesGroup.reduce((s, u) => s + (u.co2_saved || 0), 0);
      const batteryUsage = totalSiteHours > 0 ? ((totalGenHrSaved / totalSiteHours) * 100).toFixed(2) : 0;

      // LEFT TABLE
      autoTable(doc, {
        startY: 50,
        margin: { left: 14, right: 110 },
        tableWidth: 80,
        head: [["Metric", "Value"]],
        body: [
          ["Number of Days", numberOfDays],
          ["Fuel consumption per hour", `${FUEL_CONS_PER_HR} `],
          ["Cost of Fuel per Litre", `€${FUEL_PRICE}`],
          ["Normal run-hours for this period", `${totalSiteHours.toFixed(1)} `],
          ["Actual run-hours for this period",`${totalGenHr.toFixed(1)} `],
          ["Reduction in Run-Hours", `${reductionInRunHours.toFixed(2)} `],
        ],
        styles: { fontSize: 8 },
        theme: "grid",
      });

      // RIGHT TABLE
      autoTable(doc, {
        startY: 50,
        margin: { left: 110, right: 14 },
        tableWidth: 85,
        head: [["Metric", "Run-time (hrs)", "Cost (€)"]],
        body: [
          
          ["Conventional Generator", `${conventionalRunTime.toFixed(2)} `, `€${conventionalCost.toFixed(2)}`],
          ["Hybrid Generator Fuel Saved ", `${hybridFuelSavedRuntime.toFixed(2)} `, `€${hybridFuelSavedCost.toFixed(2)}`],
        ],
        styles: { fontSize: 8 },
        theme: "grid",
      });

      const tableData = usagesGroup.map((u) => {
        const siteHr = Number(u.site_run_hour) || 0;
        const genHr = Number(u.generator_run_hour) || 0;
        const savedHr = siteHr - genHr;

        // ✅ Robust Battery Usage calculation:
        // 100% if genHr = 0 and siteHr > 0
        // Otherwise, ((siteHr - genHr) / siteHr) * 100
        let batteryUsagePercent = 0;

        if (siteHr > 0) {
          if (genHr === 0) {
            batteryUsagePercent = 100;
          } else {
            batteryUsagePercent = ((siteHr - genHr) / siteHr) * 100;
          }
        }

        // If inverter_usage_calculated exists and is > 0, trust it but normalize to %
        if (typeof u.inverter_usage_calculated === "number" && u.inverter_usage_calculated > 0) {
          batteryUsagePercent = u.inverter_usage_calculated * 100;
        }

        return [
          new Date(u.date).toLocaleDateString("en-GB"),
          u.kw_consumed || 0,
          genHr,
          siteHr,
          savedHr.toFixed(2),
          `${batteryUsagePercent.toFixed(2)} %`,
          (savedHr * (u.fuel_consumption || 12)).toFixed(2),
          `€${((savedHr * (u.fuel_consumption || 12)) * (u.fuel_price || 1.25)).toFixed(2)}`,
          (savedHr * (u.fuel_consumption || 12) * (u.co2_per_litre || 2.678)).toFixed(2),
        ];
      });



      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 30,
        head: [["Date", "kW Consumed", "Gen Run Hours", "Site Hours", "Gen Run Hours Saved", "Battery Usage", "Fuel Saved", "Savings on fuel", "Reduced CO2 Emissions"]],
        body: tableData,
        styles: { fontSize: 9 },
        theme: "grid",
        margin: { left: 14, right: 14 }
      });

    // OVERALL PERFORMANCE SUMMARY
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 128, 0);
    doc.text("Overall Performance", 14, doc.lastAutoTable.finalY + 15);

    // 🔹 Recalculate totals using the same saved-hour logic as the daily table
    const totalFuelSaved = usagesGroup.reduce((sum, u) => {
      const siteHr = Number(u.site_run_hour) || 0;
      const genHr = Number(u.generator_run_hour) || 0;
      const savedHr = siteHr - genHr;
      const fuelCons = Number(u.fuel_consumption) || FUEL_CONS_PER_HR;
      return sum + savedHr * fuelCons;
    }, 0);

    const totalFuelCostSaved = totalFuelSaved * FUEL_PRICE;

    // 🔸 Renamed and corrected CO₂ calculation
    const totalCo2Reduction = usagesGroup.reduce((sum, u) => {
      const siteHr = Number(u.site_run_hour) || 0;
      const genHr = Number(u.generator_run_hour) || 0;
      const savedHr = siteHr - genHr;
      const fuelCons = Number(u.fuel_consumption) || FUEL_CONS_PER_HR;
      const co2PerLitre = Number(u.co2_per_litre) || 2.678;
      return sum + savedHr * fuelCons * co2PerLitre;
    }, 0);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Metric", "Value"]],
      body: [
        ["Power Consumed", `${totalKW.toFixed(1)}`],
        ["Generator Running Hours Saved", `${totalGenHrSaved.toFixed(1)}`],
        ["Fuel Saved", `${totalFuelSaved.toFixed(1)} `],
        ["Savings on Fuel", `€${totalFuelCostSaved.toFixed(2)}`],
        ["Reduced CO2 Emissions", `${totalCo2Reduction.toFixed(1)} `],
        ["Battery Usage %", `${batteryUsage}%`],
      ],
      styles: { fontSize: 9 },
      theme: "grid",
    });


    // FOOTER
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(new Date().toLocaleDateString("en-GB"), 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 200 - 14, 290, { align: "right" });
    }

    // SAVE FILE
    const firstUsage = usages[0];
    const filename = `${firstUsage.inverter_given_start_name || "Inverter"}_${(firstUsage.location_name || "Location").replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);
  });
};

  return (
    <MDBContainer className="py-4">
      <MDBCard className="mb-4">
        <MDBCardBody>
          <label className="form-label">📎 Upload Usage Excel</label>
          <input type="file" className="form-control" accept=".xlsx,.xls,.xlsm" onChange={handleExcelUpload} />
        </MDBCardBody>
      </MDBCard>

      <div className="d-flex flex-wrap gap-3 mb-3 align-items-end">
        <div>
          <label className="form-label">Search PO</label>
          <input type="text" className="form-control" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
        <div>
          <label className="form-label">From Date</label>
          <input type="date" className="form-control" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }} />
        </div>
        <div>
          <label className="form-label">To Date</label>
          <input type="date" className="form-control" value={toDate} onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }} />
        </div>
        <MDBBtn color="secondary" onClick={clearFilters}>Clear</MDBBtn>
        <MDBBtn color="danger" onClick={downloadPDF}>Download PDF</MDBBtn>
      </div>

      <MDBTable responsive striped small bordered>
        <MDBTableHead>
          <tr>
            <th>No</th>
            <th>Date</th>
            <th>Inverter</th>
            <th>PO Number</th>
            <th>KW Consumed</th>
            <th>Gen Run Hours</th>
            <th>Site Hr</th>
            <th>Battery Usage</th>
            <th>Gen Run Hrs Saved</th>
            <th>Fuel Saved </th>
            <th>Savings on Fuel</th>
            <th>Reduced CO2 Emissions</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {usages.map((u, i) => (
            <tr key={u.id}>
              <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
              <td>{new Date(u.date).toLocaleDateString("en-GB")}</td>
              <td>{formatInverter(u.inverter_display)}</td>
              <td>{u.po_number || "-"}</td>
              <td>{u.kw_consumed}</td>
              <td>{u.generator_run_hour}</td>
              <td>{u.site_run_hour}</td>
              <td>{u.inverter_usage_calculated}</td>
              <td>{u.generator_run_hour_save}</td>
              <td>{u.fuel_saved}</td>
              <td>€{u.fuel_cost_saved}</td>
              <td>{u.co2_saved}</td>
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <p className="mb-0">Page {currentPage} of {totalPages}</p>
        <div>
          <MDBBtn size="sm" color="primary" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>⬅ Previous</MDBBtn>{" "}
          <MDBBtn size="sm" color="primary" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next ➡</MDBBtn>
        </div>
      </div>
    </MDBContainer>
  );
};

export default UsageReport;
