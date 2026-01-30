const http = require('http');

console.log('🧪 Testing Password Generator API...\n');

// Test data
const testCases = [
    {
        name: 'Default password (12 chars, all types except symbols)',
        data: {
            length: 12,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: false
        }
    },
    {
        name: 'Long password with symbols (32 chars)',
        data: {
            length: 32,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true
        }
    },
    {
        name: 'Short password (6 chars, letters only)',
        data: {
            length: 6,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: false,
            includeSymbols: false
        }
    },
    {
        name: 'PIN (6 digits)',
        data: {
            length: 6,
            includeUppercase: false,
            includeLowercase: false,
            includeNumbers: true,
            includeSymbols: false
        }
    }
];

let currentTest = 0;

function runTest(testCase) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(testCase.data);

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/generate-password',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({ testCase, response, statusCode: res.statusCode });
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function runAllTests() {
    console.log('Testing endpoint: http://localhost:3000/api/generate-password\n');
    console.log('═'.repeat(80) + '\n');

    for (const testCase of testCases) {
        try {
            const result = await runTest(testCase);

            console.log(`✅ Test ${++currentTest}: ${testCase.name}`);
            console.log(`   Status: ${result.statusCode}`);
            console.log(`   Password: ${result.response.password}`);
            console.log(`   Length: ${result.response.password.length} chars`);
            console.log('');
        } catch (error) {
            console.log(`❌ Test ${++currentTest}: ${testCase.name}`);
            console.log(`   Error: ${error.message}`);
            console.log('');
        }
    }

    console.log('═'.repeat(80));
    console.log(`\n✨ Completed ${currentTest}/${testCases.length} tests\n`);
}

// Check if server is running first
const healthCheck = http.get('http://localhost:3000/health', (res) => {
    if (res.statusCode === 200) {
        console.log('✅ Server is running\n');
        runAllTests();
    }
});

healthCheck.on('error', () => {
    console.log('❌ Error: Server is not running!');
    console.log('\nPlease start the server first:');
    console.log('  cd backend');
    console.log('  npm start\n');
    process.exit(1);
});
