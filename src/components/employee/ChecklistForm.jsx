import React, { useState, useEffect,useRef  } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const ChecklistForm = () => {
  const initialFormData = {};
  const [formData, setFormData] = useState(initialFormData);
  const [inverters, setInverters] = useState([]);
  const [selectedInverter, setSelectedInverter] = useState(null);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const sections = {
    "Physical Checks": [
      "Check The History & Service records",
      "Inspect external enclosure for damage (dents, cracks, or corrosion).",
      "Ensure all input/output sockets are intact",
      "Confirm no loose or exposed wiring.",
      "Verify lifting points and transport fittings are secure",
    ],
    "Battery System": [
      "Check battery charge level",
      "Inspect battery terminals for corrosion or loose connections",
      "Confirm battery management system (BMS) is operational",
      "Ensure no signs of leakage",
    ],
    "Electrical and Control Systems": [
      "Test inverter functionality for AC power conversion",
      "Check GSM remote monitoring system connectivity.",
      "Test automatic generator start signal and bypass functionality.",
      "Test short circuit, overload, overtemperature, and low battery protections.",
      "Finder Timer Is disconnected - FL 8",
    ],
  };

  const batteryCount = 25;

  useEffect(() => {
    axiosInstance
      .get("/inverters/?status=Testing")
      .then((res) => setInverters(res.data.results || res.data))
      .catch((err) => console.error("Error fetching inverters:", err));
  }, []);

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (updated.test_time_start && updated.test_time_end) {
        const start = new Date(updated.test_time_start);
        const end = new Date(updated.test_time_end);

        if (!isNaN(start) && !isNaN(end) && end > start) {
          const diffMinutes = Math.floor((end - start) / 60000);
          updated.test_time = `${diffMinutes} min`;
        } else {
          updated.test_time = "";
        }
      }

      return updated;
    });
  };

  const handleInverterSelect = (e) => {
    const inverterId = e.target.value;
    const inverter = inverters.find((inv) => inv.id.toString() === inverterId);
    setSelectedInverter(inverter);
    setFormData((prev) => ({
      ...prev,
      inverter: inverter?.id || "",
      unit_model: inverter?.model_name || inverter?.model || "",
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData();

 
  data.append("unit_status", formData.unit_status || ""); 
  data.append("tested_by", formData.tested_by || ""); 
  data.append("inverter", formData.inverter || "");
  data.append("date", formData.date || "");
  data.append("load", formData.load || "");
  data.append("test_time_start", formData.test_time_start || "");
  data.append("test_time_end", formData.test_time_end || "");
  data.append("test_time", formData.test_time || "");
  data.append("battery_voltage_start", formData.battery_voltage_start || "");
  data.append("battery_voltage_end", formData.battery_voltage_end || "");
  data.append("voltage_dip", formData.lowest_battery_voltage_dip || "");

 
  const items = [];
  Object.entries(sections).forEach(([section, questions]) => {
    questions.forEach((q) => {
      items.push({
        section,
        description: q,
        status: formData[q + "_status"] || "NA",
        remarks: formData[q + "_remarks"] || "",
      });
    });
  });

  data.append("items", JSON.stringify(items));

 
  const batteries = [];
  for (let i = 1; i <= batteryCount; i++) {
    if (formData[`battery_${i}`]) {
      batteries.push({
        battery_number: i,
        voltage: formData[`battery_${i}`],
      });
    }
  }

  data.append("batteries", JSON.stringify(batteries));

 
  images.forEach((image) => {
    data.append("images", image);
  });

  try {
    await axiosInstance.post("/checklists/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("Checklist submitted successfully!");
    setFormData({});
    setImages([]);
    setSelectedInverter(null);
    if (fileInputRef.current) {
  fileInputRef.current.value = "";
}
    navigate("/employee-dashboard/submitted-checklists");
  } catch (error) {
    console.error("Error submitting checklist:", error.response?.data);
  }
};




  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-full mx-auto p-6 bg-white border border-black"
    >
      <h2 className="text-2xl font-bold mb-6 text-center uppercase"
       style={{ marginTop: '40px' }}
      >
        Pre Hire Checklist
      </h2>

      
      <table className="w-full border border-black text-sm mb-6">
        <tbody>
          <tr>
            <td className="border border-black p-2 w-1/4 font-bold">Unit No</td>
            <td className="border border-black p-2 w-1/4">
              <select
                value={formData.inverter || ""}
                onChange={handleInverterSelect}
                className="border border-black p-1 w-full"
                required
              >
                <option value="">Select Unit No</option>
                {inverters.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.unit_id}
                  </option>
                ))}
              </select>
            </td>
            <td className="border border-black p-2 w-1/4 font-bold">
              Unit Model
            </td>
            <td className="border border-black p-2 w-1/4">
              <input
                type="text"
                value={formData.unit_model || ""}
                disabled
                className="border border-black p-1 w-full bg-gray-100"
              />
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-bold">Tested By</td>
            <td className="border border-black p-2">
              <input
                type="text"
                value={formData.tested_by || ""}
                onChange={(e) => handleChange("tested_by", e.target.value)}
                className="border border-black p-1 w-full"
              />
            </td>
            <td className="border border-black p-2 font-bold">Date</td>
            <td className="border border-black p-2">
              <input
                type="date"
                value={formData.date || ""}
                onChange={(e) => handleChange("date", e.target.value)}
                className="border border-black p-1 w-full"
              />
            </td>
          </tr>
        </tbody>
      </table>

     
      {Object.entries(sections).map(([title, questions]) => (
        <div key={title} className="mb-6">
          <h3 className="text-base font-bold uppercase text-center border border-black bg-gray-200 p-2">
            {title}
          </h3>
          <table className="w-full border border-black text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black p-2 text-center w-2/4">
                  Check
                </th>
                <th className="border border-black p-2 text-center w-1/4">
                  Status
                </th>
                <th className="border border-black p-2 text-center w-1/4">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2 text-left">{q}</td>
                  <td className="border border-black p-2 text-center">
                    <select
                      value={formData[q + "_status"] || ""}
                      onChange={(e) =>
                        handleChange(q + "_status", e.target.value)
                      }
                      className="border border-black p-1 w-full text-center"
                    >
                      <option value="">-</option>
                      <option value="OK">OK</option>
                      <option value="NOT_OK">Not OK</option>
                      <option value="NA">N/A</option>
                    </select>
                  </td>
                  <td className="border border-black p-2">
                    <input
                      type="text"
                      value={formData[q + "_remarks"] || ""}
                      onChange={(e) =>
                        handleChange(q + "_remarks", e.target.value)
                      }
                      className="border border-black p-1 w-full"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

    
      <div className="mb-6">
        <h3 className="text-base font-bold uppercase text-center border border-black bg-gray-200 p-2">
          Load Test
        </h3>
        <table className="w-full border border-black text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-2 w-1/2">Test Time Start</td>
              <td className="border border-black p-2">
                <input
                  type="datetime-local"
                  value={formData.test_time_start || ""}
                  onChange={(e) =>
                    handleChange("test_time_start", e.target.value)
                  }
                  className="border border-black p-1 w-full"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">Test Time End</td>
              <td className="border border-black p-2">
                <input
                  type="datetime-local"
                  value={formData.test_time_end || ""}
                  onChange={(e) =>
                    handleChange("test_time_end", e.target.value)
                  }
                  className="border border-black p-1 w-full"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">Load</td>
              <td className="border border-black p-2">
                <input
                  type="number"
                  value={formData.load || ""}
                  onChange={(e) => handleChange("load", e.target.value)}
                  className="border border-black p-1 w-full"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">Test Time</td>
              <td className="border border-black p-2">
                <input
                  type="text"
                  value={formData.test_time || ""}
                  disabled
                  className="border border-black p-1 w-full bg-gray-100"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">
                Battery Voltage at Start
              </td>
              <td className="border border-black p-2">
                <input
                  type="number"
                  value={formData.battery_voltage_start || ""}
                  onChange={(e) =>
                    handleChange("battery_voltage_start", e.target.value)
                  }
                  className="border border-black p-1 w-full"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">
                Battery Voltage at End
              </td>
              <td className="border border-black p-2">
                <input
                  type="number"
                  value={formData.battery_voltage_end || ""}
                  onChange={(e) =>
                    handleChange("battery_voltage_end", e.target.value)
                  }
                  className="border border-black p-1 w-full"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">
                Lowest Battery Voltage Dip
              </td>
              <td className="border border-black p-2">
                <input
                  type="number"
                  value={formData.lowest_battery_voltage_dip || ""}
                  onChange={(e) =>
                    handleChange("lowest_battery_voltage_dip", e.target.value)
                  }
                  className="border border-black p-1 w-full"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">Unit Status</td>
              <td className="border border-black p-2">
                <select
                  value={formData.unit_status || ""}
                  onChange={(e) => handleChange("unit_status", e.target.value)}
                  className="border border-black p-1 w-full"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Operational(Ready to Hire)">
                    Operational(Ready to Hire)
                  </option>
                  <option value="Under Maintenance">
                    Under Maintenance
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

   <div className="mb-6">
  <h3 className="text-base font-bold uppercase text-center border border-black bg-gray-200 p-2">
    Battery Voltages
  </h3>
  <table className="w-full border border-black text-sm table-fixed">
    <thead className="bg-gray-100">
      <tr>
        {Array.from({ length: 5 }, (_, colIdx) => (
          <React.Fragment key={colIdx}>
            <th className="border border-black p-2 text-center w-[10%]">Battery</th>
            <th className="border border-black p-2 text-center w-[10%]">Voltage</th>
          </React.Fragment>
        ))}
      </tr>
    </thead>
    <tbody>
      {Array.from({ length: 5 }, (_, rowIdx) => (
        <tr key={rowIdx}>
          {Array.from({ length: 5 }, (_, colIdx) => {
            const i = rowIdx + colIdx * 5 + 1; 
            return (
              <React.Fragment key={i}>
                <td className="border border-black p-2 text-center">
                  Battery {i}
                </td>
                <td className="border border-black p-2 text-center">
                  <input
                    type="number"
                    step="0.1"
                    value={formData[`battery_${i}`] || ""}
                    onChange={(e) =>
                      handleChange(`battery_${i}`, e.target.value)
                    }
                    className="border border-black p-1 w-full text-center"
                  />
                </td>
              </React.Fragment>
            );
          })}
        </tr>
      ))}
    </tbody>
  </table>
</div>


{/* Image upload section */}
<div>
  <label>Upload Images:</label>
  <input
    type="file"
    multiple
    accept="image/*"
    ref={fileInputRef}
    onChange={(e) => setImages(Array.from(e.target.files))}
  />
</div>




      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded shadow hover:bg-blue-700"
        >
          Submit Checklist
        </button>
      </div>
    </form>
  );
};

export default ChecklistForm;
