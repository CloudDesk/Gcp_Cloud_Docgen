import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const PROJECT_ID = "projects/docgen-440809";
const ERROR_CODE_SECRET_NOT_FOUND = 5;

// const secretClient = new SecretManagerServiceClient({
//   keyFilename: "docgen-440809-afae407a4dd7.json",
// });

 const secretClient = new SecretManagerServiceClient();

/**
 * Retrieves a secret from Google Secret Manager.
 *
 * @param fullSecretPath - The full path of the secret.
 * @returns The secret object.
 * @throws Will throw an error if the secret is not found or any other error occurs.
 */
async function getSecret(fullSecretPath: string) {
  console.log(fullSecretPath, "Full secret path");
  try {
    const [secret] = await secretClient.getSecret({ name: fullSecretPath });
    console.log(secret, "Secret");
    return secret;
  } catch (err) {
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
async function createSecret(parent: string, secretId: string) {
  try {
    await secretClient.createSecret({
      parent,
      secretId,
      secret: {
        replication: {
          automatic: {},
        },
      },
    });
  } catch (error) {
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
async function addSecretVersion(fullSecretPath: string, secretValue: string) {
  try {
    const [version] = await secretClient.addSecretVersion({
      parent: fullSecretPath,
      payload: {
        data: Buffer.from(secretValue),
      },
    });
    return version.name;
  } catch (versionError) {
    return versionError;
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
// export async function storeSecret(secretValue: string, orgId: string) {
//   const parent = PROJECT_ID;
//   const fullSecretPath = `${parent}/secrets/${orgId}`;

//   try {
//    let secretValue =  await getSecret(fullSecretPath);
//    if (secretValue === ERROR_CODE_SECRET_NOT_FOUND) {
//     try {
//       await createSecret(parent, orgId);
//       return { success: true };
//     } catch (error) {
//       console.error("Error creating secret:", error);
//       return { error: error };
//     }
//   }
//     console.log(`Secret for organization ${orgId} already exists.`);
//   } catch (err) {
//     console.log(err.code ,'ERROR CODE IS ');
//     if (err.code === ERROR_CODE_SECRET_NOT_FOUND) {
//       console.log(`Creating new secret for organization ${orgId}...`);
//       try {
//         await createSecret(parent, orgId);
//         return { success: true };
//       } catch (error) {
//         console.error("Error creating secret:", error);
//         return { error: error };
//       }
//     } else {
//       console.error("Unexpected error:", err);
//       return { error: err };
//     }
//   }

//   try {
//     const versionName = await addSecretVersion(fullSecretPath, secretValue);
//     console.log(`Stored secret for organization ${orgId}`);
//     return versionName;
//   } catch (versionError) {
//     console.error("Error storing secret value:", versionError);
//     return { error: versionError };
//   }
// }

export async function storeSecret(secretValue: string, orgId: string) {
  const parent = PROJECT_ID;
  const fullSecretPath = `${parent}/secrets/${orgId}`;

  try {
    const existingSecret = await getSecret(fullSecretPath);
    if (existingSecret === ERROR_CODE_SECRET_NOT_FOUND) {
      console.log(`Creating new secret for organization ${orgId}...`);
      try {
        await createSecret(parent, orgId);
        console.log(`Secret created for organization ${orgId}`);
      } catch (error) {
        console.error("Error creating secret:", error);
        return { error };
      }
    } else {
      console.log(`Secret for organization ${orgId} already exists.`);
    }
  } catch (err) {
    console.error("Error checking secret existence:", err);
    return { error: err };
  }

  try {
    const versionName = await addSecretVersion(fullSecretPath, secretValue);
    console.log(`Stored secret version for organization ${orgId}`);
    return { success: true, versionName };
  } catch (versionError) {
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
// export async function getSecretValue(orgId: string) {
// const fullSecretPath = `${PROJECT_ID}/secrets/${orgId}/versions/latest`;
// console.log(fullSecretPath ,'full secret path updated')
//   try {
//     const [accessResponse] = await secretClient.accessSecretVersion({
//       name: fullSecretPath,
//     });
//      console.log(accessResponse ,'access response')
//     const secretPayload = accessResponse.payload?.data?.toString();
//     return secretPayload;
//   } catch (err) {
//     console.error("Error accessing secret value:", err);
//     return { error: err };
//   }
// }


export async function getSecretValue(orgId: string) {
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

    // Check if the secret payload looks like JSON
    if (secretPayload && secretPayload.startsWith('{') && secretPayload.endsWith('}')) {
      try {
        // Attempt to parse as JSON if it looks like a JSON object
        return JSON.parse(secretPayload);
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        return { error: 'Failed to parse JSON', details: jsonError };
      }
    } else {
      // If not JSON, return the secret as plain text
      console.log('Returning plain text secret:', secretPayload);
      return secretPayload;
    }
  } catch (err) {
    console.error("Error accessing secret value:", err);
    return { error: err };
  }
}
// Cache for storing secrets to reduce the number of API calls
const secretCache: { [key: string]: string } = {};

/**
 * Retrieves and returns the value of a secret from the cache or Google Secret Manager.
 *
 * @param orgId - The ID of the organization for which the secret is being retrieved.
 * @returns The value of the secret, or an error object if an error occurred.
 */
export async function getSecretValueWithCache(orgId: string) {
  if (secretCache[orgId]) {
    return secretCache[orgId];
  }

  const fullSecretPath = `${PROJECT_ID}/secrets/${orgId}/versions/latest`;

  try {
    const [accessResponse] = await secretClient.accessSecretVersion({
      name: fullSecretPath,
    });
    const secretPayload = accessResponse.payload?.data?.toString();
    if (secretPayload) {
      secretCache[orgId] = secretPayload;
    }
    return secretPayload;
  } catch (err) {
    console.error("Error accessing secret value:", err);
    return { error: err };
  }
}
