import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EmployeeOrderForm from './EmployeeOrderForm';

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/orders/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders(res.data.results);
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to fetch PO data.');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSelect = (id) => {
    const order = orders.find((o) => o.id === id);
    setSelectedOrder(order);
  };

  return (
    <div className="container my-4">
      <h3 className="text-primary mb-4">
        📦 Select a PO to Fill Remaining Fields
      </h3>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <div className="mb-4">
        <label className="form-label">PO Number</label>
        <select
          className="form-select"
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="">-- Select PO Number --</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.po_number}
            </option>
          ))}
        </select>
      </div>

      {selectedOrder && (
        <EmployeeOrderForm
          orderId={selectedOrder.id}
          poNumber={selectedOrder.po_number}
          onFormSubmit={fetchOrders} 
        />
      )}
    </div>
  );
};

export default ViewOrders;
