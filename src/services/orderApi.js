

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

export const getOrders = async (token) => {
  const response = await fetch(`${BASE_URL}/orders/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return await response.json();
};

export const updateOrder = async (poNumber, data, token) => {
  const response = await fetch(`${BASE_URL}/orders/${poNumber}/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update order');
  return await response.json();
};
