import apiClient from "../../services/apiClient";

const login = async (email, password) => {
  return apiClient("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

const register = async (name, email, password) => {
  return apiClient("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
};

export { login, register };