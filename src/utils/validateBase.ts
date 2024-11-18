
async function validateAndParseCredentials(encodedCredentials: string | undefined) {
    if (!encodedCredentials) {
        throw new Error('SERVICE_ACCOUNT environment variable is not set');
    }

    try {
        // First, try to decode the base64
        const decodedString = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
        
        // Check if the decoded string is empty
        if (!decodedString.trim()) {
            throw new Error('Decoded SERVICE_ACCOUNT is empty');
        }

        // Try to parse the JSON
        const credentials = JSON.parse(decodedString);
        
        // Validate the credentials object
        if (!credentials || typeof credentials !== 'object') {
            throw new Error('Invalid credentials format: not a JSON object');
        }

        return credentials;
    } catch (error) {
        if (error instanceof SyntaxError) {
            // Log the problematic string for debugging (be careful not to log in production)
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to parse credentials. Encoded length:', encodedCredentials.length);
            }
            throw new Error('Invalid JSON in SERVICE_ACCOUNT. Please check the encoding.');
        }
        throw error;
    }
}

export { validateAndParseCredentials };