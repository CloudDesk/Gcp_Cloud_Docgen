import { GCP_LOCATION, GCP_PROJECT_ID, GCP_TASK_QUEUE, GCP_TRIGGER_URL } from '../../config/config.js';
import { CloudTasksClient } from '@google-cloud/tasks';
let client;
try {
    client = new CloudTasksClient();
    console.log('CloudTasksClient initialized successfully');
}
catch (error) {
    console.error('Error initializing CloudTasksClient:', error);
    process.exit(1);
}
let project = GCP_PROJECT_ID;
let queue = GCP_TASK_QUEUE;
let location = GCP_LOCATION;
let url = GCP_TRIGGER_URL;
let inSeconds = 5;
export async function createHttpTask(processDocumentPayload) {
    try {
        console.log(processDocumentPayload, 'INSIDE TASK');
        console.log('Task parameters:', { project, queue, location, url });
        // const payloadString = JSON.stringify({ message: "Hello, world" });
        const payloadString = JSON.stringify(processDocumentPayload);
        const parent = client.queuePath(project, location, queue);
        console.log('Queue path created:', parent);
        const task = {
            httpRequest: {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payloadString),
                    'x-api-key': 'AIzaSyArxb3xZ5lTVpGrF6YbMsCrS9e8iPGLldY'
                },
                httpMethod: 'POST',
                url,
                body: Buffer.from(payloadString).toString('base64'),
            },
        };
        if (inSeconds) {
            task.scheduleTime = {
                seconds: parseInt(inSeconds) + Date.now() / 1000,
            };
        }
        console.log('Sending task:', JSON.stringify(task, null, 2));
        const request = { parent: parent, task: task };
        const [response] = await client.createTask(request);
        console.log(`Created task ${response.name}`);
        console.log(`Created task ${JSON.stringify(response)}`);
        return response;
    }
    catch (error) {
        console.error('Error in createHttpTask:', error);
        throw error;
    }
}
//# sourceMappingURL=googletask.service.js.map