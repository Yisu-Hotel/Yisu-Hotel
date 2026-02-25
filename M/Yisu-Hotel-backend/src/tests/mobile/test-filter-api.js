const axios = require('axios');

async function testHotelListWithFiltersAPI() {
  try {
    const response = await axios.get('http://localhost:3001/mobile/hotel/list', {
      params: {
        city: '北京',
        page: 1,
        pageSize: 10,
        selectedTags: ['商务', '会议'],
        selectedFacilities: ['免费WiFi', '停车场'],
        selectedFilterValue: '4',
        currentFilterType: 'star'
      }
    });
    
    console.log('API Response with filters:', JSON.stringify(response.data, null, 2));
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testHotelListWithFiltersAPI();
