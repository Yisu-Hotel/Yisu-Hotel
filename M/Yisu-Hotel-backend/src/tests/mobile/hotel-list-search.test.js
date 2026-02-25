const axios = require('axios');

// Default to 3001 as per app.js, but allow override
const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}/mobile/hotel`;

console.log(`Targeting API at: ${BASE_URL}`);

const testGetHotelList = async () => {
  console.log('\n=== Testing Get Hotel List (/list) ===');
  
  // Test 1: Basic city filter
  try {
    console.log('--- Test 1: List All Hotels (No Filter) ---');
    const response = await axios.get(`${BASE_URL}/list`, {
      params: {
        page: 1,
        pageSize: 100 // Request a large page size to get all hotels
      }
    });
    console.log('Status:', response.status);
    if (response.data.code === 0) {
        console.log(`✅ Found ${response.data.data.list.length} hotels.`);
        console.log(JSON.stringify(response.data, null, 2));
    } else {
        console.log('❌ Failed to get hotel list.');
    }
  } catch (error) {
    console.error('❌ Request Failed:', error.message);
  }

  // Test 2: Star Rating filter
  try {
    console.log('--- Test 2: Star Rating Filter (4 stars) ---');
    const response = await axios.get(`${BASE_URL}/list`, {
      params: {
        city: '北京市',
        star_rating: 4
      }
    });
    if (response.data.code === 0) {
        console.log(`✅ Star rating filter passed. Found ${response.data.data.list.length} hotels.`);
        console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) { console.error('Error:', error.message); }

  // Test 3: Price Range filter
  try {
    console.log('--- Test 3: Price Range Filter (0-500) ---');
    const response = await axios.get(`${BASE_URL}/list`, {
      params: {
        city: '北京市',
        min_price: 0,
        max_price: 500
      }
    });
    if (response.data.code === 0) {
        console.log(`✅ Price filter passed. Found ${response.data.data.list.length} hotels.`);
        console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) { console.error('Error:', error.message); }

  // Test 4: Keyword Search
  try {
    console.log('--- Test 4: Keyword Search ("易宿") ---');
    const response = await axios.get(`${BASE_URL}/list`, {
      params: {
        city: '北京市',
        keyword: '易宿'
      }
    });
    if (response.data.code === 0) {
        console.log(`✅ Keyword search passed. Found ${response.data.data.list.length} hotels.`);
        console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) { console.error('Error:', error.message); }
  // Test 5: Max Min Price Filter
  try {
    console.log('--- Test 5: Max Min Price Filter (max_min_price=300) ---');
    const response = await axios.get(`${BASE_URL}/list`, {
      params: {
        max_min_price: 300
      }
    });
    if (response.data.code === 0) {
        console.log(`✅ Max min price filter passed. Found ${response.data.data.list.length} hotels.`);
        console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) { console.error('Error:', error.message); }
  // Test 6: Tags Filter (simulating facilities/services as tags for now)
  try {
    console.log('--- Test 6: Tags Filter (tags=["亲子友好"]) ---');
    const response = await axios.get(`${BASE_URL}/list`, {
      params: {
        tags: '亲子友好'
      }
    });
    if (response.data.code === 0) {
        console.log(`✅ Tags filter passed. Found ${response.data.data.list.length} hotels.`);
        console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) { console.error('Error:', error.message); }
  // Test 7: Date Range Filter
  try {
    console.log('--- Test 7: Date Range Filter (check_in_date="2026-02-14", check_out_date="2026-02-15") ---');
    const response = await axios.get(`${BASE_URL}/list`, {
      params: {
        check_in_date: '2026-02-22',
        check_out_date: '2026-02-28'
      }
    });
    if (response.data.code === 0) {
        console.log(`✅ Date range filter passed. Found ${response.data.data.list.length} hotels.`);
        console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) { console.error('Error:', error.message); }

  // Test 8: Facilities Filter
  try {
    console.log('--- Test 8: Facilities Filter (facilities="免费WiFi") ---');
    const response = await axios.get(`${BASE_URL}/list`, {
      params: {
        facilities: '免费WiFi'
      }
    });
    if (response.data.code === 0) {
        console.log(`✅ Facilities filter passed. Found ${response.data.data.list.length} hotels.`);
        console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) { console.error('Error:', error.message); }

  // Test 9: Services Filter
  try {
    console.log('--- Test 9: Services Filter (services="洗衣服务") ---');
    const response = await axios.get(`${BASE_URL}/list`, {
      params: {
        services: '洗衣服务'
      }
    });
    if (response.data.code === 0) {
        console.log(`✅ Services filter passed. Found ${response.data.data.list.length} hotels.`);
        console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) { console.error('Error:', error.message); }
};



const runTests = async () => {
    console.log('Starting tests...');
    await testGetHotelList();
    console.log('\nTests completed.');
};

runTests();
