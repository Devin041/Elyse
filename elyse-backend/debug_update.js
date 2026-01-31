
async function debugUpdate() {
    const id = '8ac9c9cf-7969-492c-9421-edf6a00200d8'; // New Arrivals
    const url = `http://localhost:3001/api/v1/collections/${id}`;
    const payload = {
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
    };

    try {
        console.log(`Sending PATCH to ${url}`);
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
                // Note: Auth might be required if I didn't disable it for testing, 
                // but let's see if we get 401 or 400 first.
            },
            body: JSON.stringify(payload)
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugUpdate();
