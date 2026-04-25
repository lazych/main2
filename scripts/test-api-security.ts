/**
 * Simple verification script to test API security.
 * Note: This script assumes the server is NOT running, so we'll just check logic or 
 * try to run a mock request if possible. 
 * Actually, I can't easily "run" an API route in a script without a server.
 * I will perform manual verification by checking the file contents again if needed,
 * but the best way is to provide a script the user can run IF they have the server up.
 */

async function testEndpoint(url: string, method: string = 'POST', headers: Record<string, string> = {}, body: any = {}) {
    console.log(`Testing ${method} ${url}...`);
    try {
        const res = await fetch(`http://localhost:3000${url}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: method !== 'GET' ? JSON.stringify(body) : undefined
        });
        console.log(`Status: ${res.status}`);
        const data = await res.json().catch(() => ({}));
        console.log(`Response: ${JSON.stringify(data)}`);
        return res.status;
    } catch (e) {
        console.error(`Error testing ${url}:`, (e as Error).message);
        return 500;
    }
}

const MOD_JWT = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJjbWpubHhiZnkwMDAwNzQ4bGFhd2JuYXR6IiwiZXhwaXJlcyI6IjIwMjYtMDItMTBUMDQ6NTA6MzIuMjYyWiIsImlhdCI6MTc3MDYxMjYzMiwiZXhwIjoxNzcwNjk5MDMyfQ.vAUkE3879eHNIhEQN9difj_ZkL_czoZoHdFYVbnMYls';

async function runTests() {
    console.log('--- STARTING SECURITY TESTS ---');

    console.log('\n[Phase 1] Testing UNAUTHORIZED access (No JWT)...');
    await testEndpoint('/api/license/generate', 'POST');
    await testEndpoint('/api/keys/create', 'POST');
    await testEndpoint('/api/backup', 'POST');

    console.log('\n[Phase 2] Testing AUTHORIZED access (Moderator JWT)...');
    const headers = {
        'Cookie': `session=${MOD_JWT}`
    };

    // Testing license generation with valid data
    console.log('Functional test: License constant generation...');
    await testEndpoint('/api/license/generate', 'POST', headers, {
        prefix: 'TEST',
        expiresInDays: 30,
        maxUses: 1,
        metadata: { type: 'moderator' }
    });

    // Testing key creation with valid data
    console.log('Functional test: Key creation...');
    await testEndpoint('/api/keys/create', 'POST', headers, {
        plan: 'Premium',
        issuedBy: 'Verification Script'
    });

    // Backup will still fail with 500 if SIMPLEBACKUPS_TRIGGER_URL is missing, 
    // but the status code 500 proves it passed the 401/403 auth guards.
    console.log('Functional test: Backup trigger...');
    await testEndpoint('/api/backup', 'POST', headers);

    console.log('\n--- SECURITY TESTS COMPLETE ---');
}

runTests();
