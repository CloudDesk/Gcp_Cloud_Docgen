import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const PROJECT_ID = "projects/docgen-440809";
const ERROR_CODE_SECRET_NOT_FOUND = 5;
import { SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL, SERVICE_ACCOUNT_AUTH_URI, SERVICE_ACCOUNT_CLIENT_EMAIL, SERVICE_ACCOUNT_CLIENT_ID, SERVICE_ACCOUNT_CLIENT_X509_CERT_URL, SERVICE_ACCOUNT_PRIVATE_KEY, SERVICE_ACCOUNT_PRIVATE_KEY_ID, SERVICE_ACCOUNT_PROJECT_ID, SERVICE_ACCOUNT_TOKEN_URI, SERVICE_ACCOUNT_TYPE, SERVICE_ACCOUNT_UNIVERSE_DOMAIN } from "../../config/config.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// let credentialsData;
// console.log(SERVICE_ACCOUNT, "Service Account");
// try {
//    credentialsData = await validateAndParseCredentials(SERVICE_ACCOUNT);
//    console.log(credentialsData, "Credentials Data");
// } catch (parseError) {
//     throw new Error(`Invalid JSON in SERVICE_ACCOUNT: ${parseError.message}`);
// }
// const credentialsPath = join(__dirname, 'gcp-credentials.json');
// await writeFile(credentialsPath, JSON.stringify(credentialsData, null, 2));
// const secretClient = new SecretManagerServiceClient({
//   keyFilename: credentialsPath,
// });
//Define the credentials JSON object
const credentials = {
    type: SERVICE_ACCOUNT_TYPE,
    project_id: SERVICE_ACCOUNT_PROJECT_ID,
    private_key_id: SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    private_key: SERVICE_ACCOUNT_PRIVATE_KEY,
    client_email: SERVICE_ACCOUNT_CLIENT_EMAIL,
    client_id: SERVICE_ACCOUNT_CLIENT_ID,
    auth_uri: SERVICE_ACCOUNT_AUTH_URI,
    token_uri: SERVICE_ACCOUNT_TOKEN_URI,
    auth_provider_x509_cert_url: SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
    universe_domain: SERVICE_ACCOUNT_UNIVERSE_DOMAIN
};
console.log(credentials, 'credentials ');
// Initialize Secret Manager client
const secretClient = new SecretManagerServiceClient({
    credentials: credentials,
});
console.log(secretClient, "Secret Client");
//  const secretClient = new SecretManagerServiceClient();
/**
 * Retrieves a secret from Google Secret Manager.
 *
 * @param fullSecretPath - The full path of the secret.
 * @returns The secret object.
 * @throws Will throw an error if the secret is not found or any other error occurs.
 */
async function getSecret(fullSecretPath) {
    console.log(fullSecretPath, "Full secret path");
    try {
        const [secret] = await secretClient.getSecret({ name: fullSecretPath });
        console.log(secret, "Secret");
        return secret;
    }
    catch (err) {
        console.log(err.code, "Error whne getting secret");
        return err.code;
    }
}
/**
 * Creates a new secret in Google Secret Manager.
 *
 * @param parent - The parent resource name.
 * @param secretId - The ID of the secret to create.
 * @throws Will throw an error if the secret creation fails.
 */
async function createSecret(parent, secretId) {
    try {
        console.log('insdie create secret');
        await secretClient.createSecret({
            parent,
            secretId,
            secret: {
                replication: {
                    automatic: {},
                },
            },
        });
    }
    catch (error) {
        return error;
    }
}
/**
 * Adds a new version to an existing secret in Google Secret Manager.
 *
 * @param fullSecretPath - The full path of the secret.
 * @param secretValue - The value of the secret to add.
 * @returns The name of the new secret version.
 * @throws Will throw an error if adding the secret version fails.
 */
async function addSecretVersion(fullSecretPath, secretValue) {
    try {
        const [version] = await secretClient.addSecretVersion({
            parent: fullSecretPath,
            payload: {
                data: Buffer.from(secretValue),
            },
        });
        console.log(version, "Version");
        return version.name;
    }
    catch (versionError) {
        console.log(versionError, "Version Error data");
        return { error: versionError.message };
    }
}
/**
 * Stores a secret in Google Secret Manager.
 *
 * This function attempts to store a secret for a given organization. If the secret already exists,
 * it logs a message indicating so. If the secret does not exist, it creates a new secret and then
 * stores the secret value.
 *
 * @param secretValue - The value of the secret to store.
 * @param orgId - The ID of the organization for which the secret is being stored.
 * @returns The version name of the stored secret, or an error object if an error occurred.
 */
export async function storeSecret(secretValue, orgId) {
    const parent = PROJECT_ID;
    const fullSecretPath = `${parent}/secrets/${orgId}`;
    try {
        const existingSecret = await getSecret(fullSecretPath);
        if (existingSecret === ERROR_CODE_SECRET_NOT_FOUND) {
            console.log(`Creating new secret for organization ${orgId}...`);
            try {
                await createSecret(parent, orgId);
                console.log(`Secret created for organization ${orgId}`);
            }
            catch (error) {
                console.error("Error creating secret:", error);
                return { error };
            }
        }
        else {
            console.log(`Secret for organization ${orgId} already exists.`);
        }
    }
    catch (err) {
        console.error("Error checking secret existence:", err);
        return { error: err };
    }
    try {
        const versionName = await addSecretVersion(fullSecretPath, secretValue);
        console.log(`Stored secret version for organization ${orgId}`);
        console.log(versionName, "Version Name");
        if (versionName.error) {
            return { error: versionName.error };
        }
        return { success: true, versionName };
    }
    catch (versionError) {
        console.error("Error storing secret version:", versionError);
        return { error: versionError };
    }
}
/**
 * Retrieves and returns the value of a secret from Google Secret Manager.
 *
 * @param orgId - The ID of the organization for which the secret is being retrieved.
 * @returns The value of the secret, or an error object if an error occurred.
 */
export async function getSecretValue(orgId) {
    const fullSecretPath = `${PROJECT_ID}/secrets/${orgId}/versions/latest`;
    console.log(fullSecretPath, 'full secret path updated');
    try {
        // Access the secret version
        const [accessResponse] = await secretClient.accessSecretVersion({
            name: fullSecretPath,
        });
        console.log('Access Response:', accessResponse);
        // Extract the secret payload (raw data) and convert it to a string
        const secretPayload = accessResponse.payload?.data?.toString(); // No 'utf8' argument
        console.log('Raw secret value:', secretPayload); // Log the raw secret value to inspect
        console.log('Returning plain text secret:', secretPayload);
        return secretPayload;
    }
    catch (err) {
        console.error("Error accessing secret value:", err);
        return { error: err };
    }
}
//# sourceMappingURL=secretManager.service.js.map