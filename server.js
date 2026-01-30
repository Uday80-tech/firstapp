const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Character sets for password generation
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * Generate a cryptographically secure random password
 * @param {number} length - Password length (6-32)
 * @param {boolean} includeUppercase - Include uppercase letters
 * @param {boolean} includeLowercase - Include lowercase letters
 * @param {boolean} includeNumbers - Include numbers
 * @param {boolean} includeSymbols - Include symbols
 * @returns {string} Generated password
 */
function generateSecurePassword(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols) {
  // Build character pool based on options
  let charPool = '';
  if (includeUppercase) charPool += UPPERCASE;
  if (includeLowercase) charPool += LOWERCASE;
  if (includeNumbers) charPool += NUMBERS;
  if (includeSymbols) charPool += SYMBOLS;

  // Validate that at least one option is selected
  if (charPool.length === 0) {
    throw new Error('At least one character type must be selected');
  }

  // Generate password using cryptographically secure random bytes
  let password = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charPool.length;
    password += charPool[randomIndex];
  }

  return password;
}

// API endpoint for password generation
app.post('/api/generate-password', (req, res) => {
  try {
    const {
      length = 12,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = false
    } = req.body;

    // Validate length
    if (length < 6 || length > 32) {
      return res.status(400).json({
        error: 'Password length must be between 6 and 32 characters'
      });
    }

    // Generate password
    const password = generateSecurePassword(
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols
    );

    // Return password (do not log it for security)
    res.json({ password });
  } catch (error) {
    console.error('Error generating password:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Password Generator API is running' });
});

// Start server - listen on all network interfaces (0.0.0.0) to allow access from physical devices
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔐 Password Generator API running on:`);
  console.log(`   - Local:   http://localhost:${PORT}`);
  console.log(`   - Network: http://10.108.252.184:${PORT}`);
  console.log(`📡 Endpoint: POST /api/generate-password`);
});
