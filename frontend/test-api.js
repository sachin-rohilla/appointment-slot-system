// Simple test to verify API endpoints
const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api/v1";

async function testAPI() {
  console.log("Testing API endpoints...");

  try {
    // Test health check
    console.log("1. Testing health check...");
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log("✓ Health check passed:", healthResponse.data);

    // Test auth endpoints (without authentication)
    console.log("2. Testing auth endpoints...");
    try {
      const signUpResponse = await axios.post(`${API_BASE_URL}/auth/sign-up`, {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });
      console.log("✓ Sign up endpoint works:", signUpResponse.data.success);
    } catch (error) {
      console.log(
        "⚠ Sign up endpoint responded:",
        error.response?.status,
        error.response?.data?.message || "Unknown error",
      );
    }

    try {
      const signInResponse = await axios.post(`${API_BASE_URL}/auth/sign-in`, {
        email: "test@example.com",
        password: "password123",
      });
      console.log("✓ Sign in endpoint works:", signInResponse.data.success);

      // Test slots endpoint with token
      if (signInResponse.data.data?.token) {
        console.log("3. Testing slots endpoint with authentication...");
        const slotsResponse = await axios.get(
          `${API_BASE_URL}/slots/all-slot-list`,
          {
            headers: {
              Authorization: `Bearer ${signInResponse.data.data.token}`,
            },
          },
        );
        console.log("✓ Slots endpoint works:", slotsResponse.data.success);
        console.log("  - Total slots:", slotsResponse.data.data?.length || 0);
      }
    } catch (error) {
      console.log(
        "⚠ Sign in endpoint responded:",
        error.response?.status,
        error.response?.data?.message || "Unknown error",
      );
    }
  } catch (error) {
    console.error("❌ API test failed:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.log("💡 Make sure your backend server is running on port 5000");
    }
  }
}

testAPI();
