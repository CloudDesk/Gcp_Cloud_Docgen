import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const secretClient = new SecretManagerServiceClient();


export async function storeSecret(secretName : string , orgId : string) {
  const parent = 'projects/docgen-440809';
  const fullSecretPath = `${parent}/secrets/${orgId}`;

  try {
    const [secret] = await secretClient.getSecret({
      name: fullSecretPath,
    });
    console.log(`Secret for organization ${orgId} already exists.`);
  } catch (err) {
    if (err.code === 5) {
      console.log(`Creating new secret for organization ${orgId}...`);
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
        console.error('Error creating secret:', error);
       return { error: error };
      }
    } else {
      console.error('Unexpected error:', err);
      return { error: err };
    }
  }

  try {
    const [version] = await secretClient.addSecretVersion({
      parent: fullSecretPath,
      payload: {
        data: Buffer.from(secretName),
      },
    });
    console.log(`Stored secret for organization ${orgId}`);
    return version.name;
  } catch (versionError) {
    console.error('Error storing secret value:', versionError);
    return { error: versionError };
  }
}