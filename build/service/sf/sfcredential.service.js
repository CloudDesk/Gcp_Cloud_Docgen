import { DEPLOYMENT_PROJECT, DEPLOYMENT_PROJECTID } from "../../config/config.js";
import { storeSecret } from "../gcp/secretManager.service.js";
import { exec } from 'child_process';
import { spawn } from "child_process";
// Service for handling Salesforce credentials
export const sfCredentialService = {
    /**
     * Validates and stores Salesforce credentials.
     * @param payload - The payload containing clientId and orgId.
     * @returns A promise resolving to an object indicating success or error.
     */
    // async validateAndStoreCredentials(
    //   payload: Payload
    // ): Promise<{ success?: any; error?: string; urlData?: string }> {
    //   console.log("Payload received:", payload);
    //   try {
    //     // Store the client ID and org ID using the secret manager service
    //     const storeResult = await storeSecret(payload.clientId, payload.orgId);
    //     console.log("Store client id result:", storeResult);
    //     if (storeResult.error) {
    //       return { error: storeResult.error }
    //     }
    //     else{
    //       try {
    //         console.log('Inside Execution of Logics');
    //         // Execute build, tag, push, and deploy commands sequentially
    //        let dockerResult =  await execCommand('docker build -t docgen .');
    //        console.log(dockerResult ,' DOCKER RESULT');
    //        let dockerTag =  await execCommand('docker tag docgen gcr.io/docgen-440809/docgen');
    //        console.log(dockerTag ,' DOCKER TAG');
    //        let dockerPush =  await execCommand('docker push gcr.io/docgen-440809/docgen');
    //        console.log(dockerPush ,' DOCKER PUSH');
    //       const deployProcess = spawn("gcloud", [
    //         "run",
    //         "deploy",
    //         "docgen-dev",
    //         "--image=gcr.io/docgen-440809/docgen:latest",
    //         "--region=us-central1",
    //         "--format=value(status.url)",
    //       ]);
    //       console.log(deployProcess ,' ==> > Deploy Process ');
    //       deployProcess.stdout.on("data", (data) => {
    //         console.log(data ,'Data is ');
    //         const cloudRunURL = data.toString().trim();
    //         console.log(`Extracted Cloud Run URL: ${cloudRunURL}`);
    //         return cloudRunURL;
    //       });
    //       deployProcess.on("close", (code) => {
    //         if (code !== 0) {
    //           console.error(`Process exited with code ${code}`);
    //         }
    //       });
    //         return { success: true, urlData:'data'};
    //     } catch (error) {
    //         console.error('Deployment failed:', error);
    //         return {success: false, error: error.message }
    //     }
    //     }
    //     // return { success: storeResult };
    //   } catch (error) {
    //     console.error("Error storing client ID:", error);
    //     return { error: "Failed to store client ID" };
    //   }
    // },
    async validateAndStoreCredentials(payload) {
        console.log("Payload received:", payload);
        try {
            // Store the client ID and org ID using the secret manager service
            const storeResult = await storeSecret(payload.clientId, payload.orgId);
            console.log("Store client id result:", storeResult);
            if (storeResult.error) {
                return { error: storeResult.error };
            }
            else {
                try {
                    console.log('Inside Execution of Logics');
                    // Execute build, tag, push, and deploy commands sequentially
                    // let dockerResult = await execCommand('docker build -t docgen .');
                    // console.log(dockerResult, 'DOCKER RESULT');
                    // let dockerTag = await execCommand('docker tag docgen gcr.io/docgen-440809/docgen');
                    // console.log(dockerTag, 'DOCKER TAG');
                    // let dockerPush = await execCommand('docker push gcr.io/docgen-440809/docgen');
                    // console.log(dockerPush, 'DOCKER PUSH');
                    // Deploy the application to Cloud Run
                    const SERVICE_NAME = `docgen-${payload.orgId}`.toLowerCase();
                    const REGION = 'us-central1';
                    const deployProcess = spawn("gcloud", [
                        "run",
                        "deploy",
                        SERVICE_NAME,
                        `--image=gcr.io/${DEPLOYMENT_PROJECT}/docgen:latest`,
                        `--region=${REGION}`,
                        "--allow-unauthenticated",
                        "--format=value(status.url)"
                    ]);
                    return new Promise((resolve, reject) => {
                        deployProcess.stdout.on("data", (data) => {
                            let receivedUrl = data.toString().trim();
                            console.log(receivedUrl, 'Received URL ');
                            const cloudRunURL = `https://${SERVICE_NAME}-${DEPLOYMENT_PROJECTID}.${REGION}.run.app`;
                            console.log(`Extracted Cloud Run URL: ${cloudRunURL}`);
                            resolve({ success: true, urlData: cloudRunURL }); // Return the extracted URL here
                        });
                        deployProcess.stderr.on("data", (data) => {
                            console.error(`Deploy stderr: ${data}`);
                            // resolve({ success: false, error: data }); 
                        });
                        deployProcess.on("close", (code) => {
                            if (code !== 0) {
                                console.error(`Deploy process exited with code ${code}`);
                                reject({ success: false, error: "Deployment failed" });
                            }
                        });
                    });
                }
                catch (error) {
                    console.error('Deployment failed:', error);
                    return { success: false, error: error.message };
                }
            }
        }
        catch (error) {
            console.error("Error storing client ID:", error);
            return { error: "Failed to store client ID" };
        }
    }
};
function execCommand(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                return reject(stderr || error.message);
            }
            resolve(stdout);
        });
    });
}
//# sourceMappingURL=sfcredential.service.js.map