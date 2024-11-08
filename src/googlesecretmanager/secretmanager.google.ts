import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const PROJECT_ID = "projects/docgen-440809";
const ERROR_CODE_SECRET_NOT_FOUND = 5;

const secretClient = new SecretManagerServiceClient({
  keyFilename: "docgen-440809-afae407a4dd7.json",
});

async function getSecret(fullSecretPath: string) {
  console.log(fullSecretPath, "Full secret path");
  try {
    const [secret] = await secretClient.getSecret({
      name: fullSecretPath,
    });
    console.log(secret, "Secret");
    return secret;
  } catch (err) {
    throw err;
  }
}

async function createSecret(parent: string, orgId: string) {
  try {
    await secretClient.createSecret({
      parent,
      secretId: orgId,
      secret: {
        replication: {
          automatic: {},
        },
      },
    });
  } catch (error) {
    throw error;
  }
}

async function addSecretVersion(fullSecretPath: string, secretName: string) {
  try {
    const [version] = await secretClient.addSecretVersion({
      parent: fullSecretPath,
      payload: {
        data: Buffer.from(secretName),
      },
    });
    return version.name;
  } catch (versionError) {
    throw versionError;
  }
}

/**
 * Stores a secret in Google Secret Manager.
 *
 * This function attempts to store a secret for a given organization. If the secret already exists,
 * it logs a message indicating so. If the secret does not exist, it creates a new secret and then
 * stores the secret value.
 *
 * @param secretName - The name of the secret to store.
 * @param orgId - The ID of the organization for which the secret is being stored.
 * @returns The version name of the stored secret, or an error object if an error occurred.
 */
export async function storeSecret(secretName: string, orgId: string) {
  const parent = PROJECT_ID;
  const fullSecretPath = `${parent}/secrets/${orgId}`;

  try {
    let secret = await getSecret(fullSecretPath);
    console.log(secret, "Secret");
    console.log(`Secret for organization ${orgId} already exists.`);
  } catch (err) {
    console.log(err, "Error");
    console.log(err.code, "Error code");
    if (err.code === ERROR_CODE_SECRET_NOT_FOUND) {
      console.log(`Creating new secret for organization ${orgId}...`);
      try {
        await createSecret(parent, orgId);
      } catch (error) {
        console.error("Error creating secret:", error);
        return { error: error };
      }
    } else {
      console.error("Unexpected error:", err);
      return { error: err };
    }
  }

  try {
    const versionName = await addSecretVersion(fullSecretPath, secretName);
    console.log(`Stored secret for organization ${orgId}`);
    return versionName;
  } catch (versionError) {
    console.error("Error storing secret value:", versionError);
    return { error: versionError };
  }
}
/**
 * Retrieves and returns the value of a secret from Google Secret Manager.
 *
 * @param orgId - The ID of the organization for which the secret is being retrieved.
 * @returns The value of the secret, or an error object if an error occurred.
 */
export async function getSecretValue(orgId: string) {
  console.log(orgId, "orgId from getSecretValue");
  console.log("inside getsecretvalue");
  const parent = PROJECT_ID;
  const fullSecretPath = `${parent}/secrets/${orgId}/versions/latest`;

  try {
    const [accessResponse] = await secretClient.accessSecretVersion({
      name: fullSecretPath,
    });
    console.log(accessResponse, "Access response");
    const secretPayload = accessResponse.payload?.data?.toString();
    console.log(secretPayload, "secretPayload");
    return secretPayload;
  } catch (err) {
    console.error("Error accessing secret value:", err);
    return { error: err };
  }
}
// import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

// const secretClient = new SecretManagerServiceClient({
//   keyFilename: "docgen-440809-afae407a4dd7.json",
// });

// export async function storeSecret(secretName: string, orgId: string) {
//   const parent = "projects/docgen-440809";
//   const fullSecretPath = `${parent}/secrets/${orgId}`;

//   try {
//     const [secret] = await secretClient.getSecret({
//       name: fullSecretPath,
//     });
//     console.log(`Secret for organization ${orgId} already exists.`);
//   } catch (err) {
//     console.log(err);
//     if (err.code === 5) {
//       console.log(`Creating new secret for organization ${orgId}...`);
//       try {
//         await secretClient.createSecret({
//           parent,
//           secretId: orgId,
//           secret: {
//             replication: {
//               automatic: {},
//             },
//           },
//         });
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
//     const [version] = await secretClient.addSecretVersion({
//       parent: fullSecretPath,
//       payload: {
//         data: Buffer.from(secretName),
//       },
//     });
//     console.log(`Stored secret for organization ${orgId}`);
//     return version.name;
//   } catch (versionError) {
//     console.error("Error storing secret value:", versionError);
//     return { error: versionError };
//   }
// }
