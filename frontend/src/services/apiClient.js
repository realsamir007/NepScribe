const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

const getToken = () => {
  return localStorage.getItem("nepscribe_token");
};

const apiClient = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || "Something went wrong with the request.",
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export default apiClient;