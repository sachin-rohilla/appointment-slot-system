const axios = require('axios');

async function testSlotsAPI() {
  try {
    const response = await axios.get('http://localhost:5000/api/v1/slots/all-slot-list');
    console.log('Slots API Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testSlotsAPI();
