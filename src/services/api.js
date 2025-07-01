// Use relative URL to leverage Vite proxy in development
const API_BASE_URL = import.meta.env.DEV
  ? ""
  : "https://mokametrics-api-fafshjgtf4degege.italynorth-01.azurewebsites.net";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    console.log("Making API request to:", url);

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("API Response:", data);
        return data;
      }

      return response;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // Orders endpoints
  async getOrders() {
    return this.request("/api/orders/");
    console.log
  }

  async getOrderById(id) {
    return this.request(`/api/orders/${id}`);
  }

   async createOrder(orderData) {
    return this.request('/api/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id, orderData) {
    return this.request(`/api/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id) {
    return this.request(`/api/orders/${id}`, {
      method: "DELETE",
    });
  }

  // Customers endpoints
  async getCustomers() {
    return this.request("/api/customers/");
  }

  async getCustomerById(id) {
    return this.request(`/api/customers/${id}`);
  }

  async createCustomer(customerData) {
    return this.request("/api/customers/", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id, customerData) {
    return this.request(`/api/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id) {
    return this.request(`/api/customers/${id}`, {
      method: "DELETE",
    });
  }

  // WebSocket connection for status updates
  connectToStatusWebSocket(onMessage, onError) {
    const wsUrl = `${this.baseURL.replace("https", "wss")}/ws/status/`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (onError) onError(error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return ws;
  }
}

export default new ApiService();
