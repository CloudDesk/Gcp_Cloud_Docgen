
// async function validateAndParseCredentials(encodedCredentials: string | undefined) {
//     try {
//         // First, try to decode the base64
//         console.log(encodedCredentials, "Encoded Credentials");
//         const decodedString = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
//         const credentials = JSON.parse(decodedString);
//         return credentials;
//     } catch (error) {
//         return error.message;
//     }
// }

// export { validateAndParseCredentials };