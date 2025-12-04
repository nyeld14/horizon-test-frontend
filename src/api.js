
const BASE_URL = `${import.meta.env.VITE_BASE_URL}/auth`;

export const registerUser = async (data) => {
  const response = await fetch(`${BASE_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const loginUser = async (data) => {
  const response = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const logoutUser = async (refreshToken) => {
  const response = await fetch(`${BASE_URL}/logout/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  return await response.json();
};
