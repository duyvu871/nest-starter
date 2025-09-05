import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables based on NODE_ENV
const NODE_ENV = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${NODE_ENV}`);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn(`Warning: ${envPath} not found, using default environment variables`);
  dotenv.config();
}

// API configuration
const API_URL = `http://localhost:${process.env.PORT || 3000}/api/v1`;
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test data
const testUser = {
  email: `test-user-${Date.now()}@example.com`,
  name: 'Test User',
};

const invalidUser = {
  // Missing email which is required
  name: 'Invalid User',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions
const logSuccess = (message: string, ...args: any[]) => console.log(`${colors.green}✓ ${message}${colors.reset}`, ...args);
const logError = (message: string, ...args: any[]) => console.error(`${colors.red}✗ ${message}${colors.reset}`, ...args);
const logInfo = (message: string, ...args: any[]) => console.log(`${colors.blue}ℹ ${message}${colors.reset}`, ...args);
const logWarning = (message: string, ...args: any[]) => console.log(`${colors.yellow}⚠ ${message}${colors.reset}`, ...args);
const logExpectedError = (message: string, ...args: any[]) => console.log(`${colors.magenta}! ${message} (Expected)${colors.reset}`, ...args);

// Format JSON for display
const formatJSON = (data: any): string => {
  return JSON.stringify(data, null, 2);
};

// Test cases
async function testCreateUser() {
  try {
    logInfo('Testing POST /api/v1/users - Create user');
    const response = await api.post('/users', testUser);
    
    if (response.status === 201) {
      logSuccess('User created successfully');
      console.log('Response:', formatJSON(response.data));
      return response.data.data;
    } else {
      logError(`Failed to create user. Status: ${response.status}`);
      return null;
    }
  } catch (error: any) {
    logError(`Error creating user: ${error.message}`);
    if (error.response) {
      console.error('Response data:', formatJSON(error.response.data));
      console.error('Response status:', error.response.status);
    }
    return null;
  }
}

async function testCreateInvalidUser() {
  try {
    logInfo('Testing POST /api/v1/users - Create invalid user (missing email)');
    await api.post('/users', invalidUser);
    
    logError('Invalid user was created when it should have failed');
    return false;
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      logExpectedError('Failed to create invalid user as expected');
      console.log('Error Response:', formatJSON(error.response.data));
      return true;
    } else {
      logError(`Unexpected error: ${error.message}`);
      if (error.response) {
        console.error('Response data:', formatJSON(error.response.data));
        console.error('Response status:', error.response.status);
      }
      return false;
    }
  }
}

async function testGetAllUsers() {
  try {
    logInfo('Testing GET /api/v1/users - Get all users');
    const response = await api.get('/users');
    
    if (response.status === 200) {
      logSuccess(`Retrieved ${response.data.data.length} users`);
      console.log('Response:', formatJSON(response.data));
      return response.data;
    } else {
      logError(`Failed to get users. Status: ${response.status}`);
      return null;
    }
  } catch (error: any) {
    logError(`Error getting users: ${error.message}`);
    if (error.response) {
      console.error('Response data:', formatJSON(error.response.data));
    }
    return null;
  }
}

async function testGetUserById(userId: string) {
  try {
    logInfo(`Testing GET /api/v1/users/${userId} - Get user by ID`);
    const response = await api.get(`/users/${userId}`);
    
    if (response.status === 200) {
      logSuccess(`Retrieved user: ${response.data.data.email}`);
      console.log('Response:', formatJSON(response.data));
      return response.data;
    } else {
      logError(`Failed to get user. Status: ${response.status}`);
      return null;
    }
  } catch (error: any) {
    logError(`Error getting user by ID: ${error.message}`);
    if (error.response) {
      console.error('Response data:', formatJSON(error.response.data));
    }
    return null;
  }
}

async function testGetNonExistentUser() {
  const nonExistentId = '00000000-0000-0000-0000-000000000000';
  try {
    logInfo(`Testing GET /api/v1/users/${nonExistentId} - Get non-existent user`);
    await api.get(`/users/${nonExistentId}`);
    
    logError('Non-existent user was found when it should not exist');
    return false;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      logExpectedError('Non-existent user not found as expected');
      console.log('Error Response:', formatJSON(error.response.data));
      return true;
    } else {
      logError(`Unexpected error: ${error.message}`);
      if (error.response) {
        console.error('Response data:', formatJSON(error.response.data));
        console.error('Response status:', error.response.status);
      }
      return false;
    }
  }
}

async function testUpdateUser(userId: string) {
  try {
    const updateData = { name: `Updated Name ${Date.now()}` };
    logInfo(`Testing PATCH /api/v1/users/${userId} - Update user`);
    const response = await api.patch(`/users/${userId}`, updateData);
    
    if (response.status === 200) {
      logSuccess(`User updated successfully: ${response.data.data.name}`);
      console.log('Response:', formatJSON(response.data));
      return response.data;
    } else {
      logError(`Failed to update user. Status: ${response.status}`);
      return null;
    }
  } catch (error: any) {
    logError(`Error updating user: ${error.message}`);
    if (error.response) {
      console.error('Response data:', formatJSON(error.response.data));
    }
    return null;
  }
}

async function testUpdateNonExistentUser() {
  const nonExistentId = '00000000-0000-0000-0000-000000000000';
  const updateData = { name: 'Updated Non-existent User' };
  
  try {
    logInfo(`Testing PATCH /api/v1/users/${nonExistentId} - Update non-existent user`);
    await api.patch(`/users/${nonExistentId}`, updateData);
    
    logError('Non-existent user was updated when it should not exist');
    return false;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      logExpectedError('Failed to update non-existent user as expected');
      console.log('Error Response:', formatJSON(error.response.data));
      return true;
    } else {
      logError(`Unexpected error: ${error.message}`);
      if (error.response) {
        console.error('Response data:', formatJSON(error.response.data));
        console.error('Response status:', error.response.status);
      }
      return false;
    }
  }
}

async function testDeleteUser(userId: string) {
  try {
    logInfo(`Testing DELETE /api/v1/users/${userId} - Delete user`);
    const response = await api.delete(`/users/${userId}`);
    
    if (response.status === 200 || response.status === 204) {
      logSuccess('User deleted successfully');
      console.log('Response:', formatJSON(response.data));
      return true;
    } else {
      logError(`Failed to delete user. Status: ${response.status}`);
      return false;
    }
  } catch (error: any) {
    logError(`Error deleting user: ${error.message}`);
    if (error.response) {
      console.error('Response data:', formatJSON(error.response.data));
    }
    return false;
  }
}

async function testDeleteNonExistentUser() {
  const nonExistentId = '00000000-0000-0000-0000-000000000000';
  
  try {
    logInfo(`Testing DELETE /api/v1/users/${nonExistentId} - Delete non-existent user`);
    await api.delete(`/users/${nonExistentId}`);
    
    logError('Non-existent user was deleted when it should not exist');
    return false;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      logExpectedError('Failed to delete non-existent user as expected');
      console.log('Error Response:', formatJSON(error.response.data));
      return true;
    } else {
      logError(`Unexpected error: ${error.message}`);
      if (error.response) {
        console.error('Response data:', formatJSON(error.response.data));
        console.error('Response status:', error.response.status);
      }
      return false;
    }
  }
}

async function testInvalidRoute() {
  try {
    logInfo('Testing GET /api/v1/invalid-route - Access invalid route');
    await api.get('/invalid-route');
    
    logError('Invalid route accessed when it should not exist');
    return false;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      logExpectedError('Invalid route not found as expected');
      console.log('Error Response:', formatJSON(error.response.data));
      return true;
    } else {
      logError(`Unexpected error: ${error.message}`);
      if (error.response) {
        console.error('Response data:', formatJSON(error.response.data));
        console.error('Response status:', error.response.status);
      }
      return false;
    }
  }
}

// Main test function
async function runTests() {
  console.log(`${colors.cyan}=== Testing Users Module ====${colors.reset}`);
  console.log(`${colors.magenta}API URL: ${API_URL}${colors.reset}`);
  
  try {
    // Test invalid route (should return 404)
    await testInvalidRoute();
    
    // Test creating an invalid user (should fail validation)
    await testCreateInvalidUser();
    
    // Test getting a non-existent user (should return 404)
    await testGetNonExistentUser();
    
    // Test updating a non-existent user (should return 404)
    await testUpdateNonExistentUser();
    
    // Test deleting a non-existent user (should return 404)
    await testDeleteNonExistentUser();
    
    // Test creating a valid user
    const createdUser = await testCreateUser();
    if (!createdUser) {
      logWarning('Skipping remaining success tests due to user creation failure');
      return;
    }
    
    // Test getting all users
    await testGetAllUsers();
    
    // Test getting user by ID
    await testGetUserById(createdUser.id);
    
    // Test updating user
    await testUpdateUser(createdUser.id);
    
    // Test deleting user
    await testDeleteUser(createdUser.id);
    
    // Try to get the deleted user (should fail)
    await testGetUserById(createdUser.id);
    
    console.log(`${colors.green}=== All tests completed ====${colors.reset}`);
  } catch (error: any) {
    console.error(`${colors.red}Test suite failed: ${error.message}${colors.reset}`);
  }
}

// Run the tests
runTests().catch(console.error);