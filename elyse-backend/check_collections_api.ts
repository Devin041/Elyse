
async function checkApi() {
    try {
        console.log('Testing GET http://localhost:3001/api/v1/collections?includeInactive=true ...');
        const response = await fetch('http://localhost:3001/api/v1/collections?includeInactive=true');
        console.log('Status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Data:', JSON.stringify(data, null, 2));
        } else {
            console.error('Error Status:', response.status);
            const text = await response.text();
            console.error('Error Body:', text);
        }
    } catch (error: any) {
        console.error('Fetch error:', error.message);
    }
}

checkApi();
