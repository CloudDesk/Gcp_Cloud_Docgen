import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const secretClient = new SecretManagerServiceClient();

async function createSecret(orgId: string, parent: string) {
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
        console.log(`Created new secret for organization ${orgId}`);
    } catch (error) {
        console.error('Error creating secret:', error);
        throw error;
    }
}

async function addSecretVersion(secretName: string, fullSecretPath: string) {
    try {
        const [version] = await secretClient.addSecretVersion({
            parent: fullSecretPath,
            payload: {
                data: Buffer.from(secretName),
            },
        });
        console.log(`Stored secret for organization ${fullSecretPath}`);
        return version.name;
    } catch (versionError) {
        console.error('Error storing secret value:', versionError);
        throw versionError;
    }
}

export async function storeSecret(secretName: string, orgId: string) {
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
            await createSecret(orgId, parent);
        } else {
            console.error('Unexpected error:', err);
            return { error: err };
        }
    }

    try {
        const versionName = await addSecretVersion(secretName, fullSecretPath);
        return versionName;
    } catch (versionError) {
        return { error: versionError };
    }
}