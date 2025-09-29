#!/usr/bin/env node

// Simple test script to verify the API endpoints
const http = require('http');

const baseUrl = 'http://localhost:3000/api';

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: jsonResponse
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testApi() {
  console.log('🧪 Testing EstokIA API endpoints...\n');

  try {
    // Test basic health check
    console.log('1. Testing health check...');
    const health = await makeRequest('/');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data)}\n`);

    // Test sales endpoints (these will require authentication)
    console.log('2. Testing sales endpoints...');
    try {
      const sales = await makeRequest('/sales');
      console.log(`   GET /sales - Status: ${sales.status}`);
    } catch (err) {
      console.log(`   GET /sales - Error: ${err.message}`);
    }

    try {
      const inventory = await makeRequest('/reports/inventory');
      console.log(`   GET /reports/inventory - Status: ${inventory.status}`);
    } catch (err) {
      console.log(`   GET /reports/inventory - Error: ${err.message}`);
    }

    try {
      const stockMovements = await makeRequest('/stock/movements');
      console.log(`   GET /stock/movements - Status: ${stockMovements.status}`);
    } catch (err) {
      console.log(`   GET /stock/movements - Error: ${err.message}`);
    }

    try {
      const lowStock = await makeRequest('/stock/low-stock');
      console.log(`   GET /stock/low-stock - Status: ${lowStock.status}`);
    } catch (err) {
      console.log(`   GET /stock/low-stock - Error: ${err.message}`);
    }

    console.log('\n✅ API test completed!');
    console.log('\nNote: Some endpoints require authentication and will return 401 status.');
    console.log('This is expected behavior for protected routes.');

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Check if server is running first
async function checkServerHealth() {
  try {
    const response = await makeRequest('/');
    if (response.status === 200) {
      console.log('✅ Server is running and healthy!\n');
      return true;
    } else {
      console.log('⚠️ Server responded but with unexpected status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not running or not accessible.');
    console.log('Please start the server with: npm run dev');
    console.log('Error:', error.message);
    return false;
  }
}

async function main() {
  const isHealthy = await checkServerHealth();
  if (isHealthy) {
    await testApi();
  }
}

main().catch(console.error);