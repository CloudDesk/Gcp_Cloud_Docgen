
// cleanupCredentials.js
import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';

async function cleanupCredentials(credentialsPath) {
        // Convert the path to absolute and normalize it
        const absolutePath = resolve(process.cwd(), credentialsPath.replace(/^\//, ''));
        
        // Check if file exists before attempting to empty it
        if (existsSync(absolutePath)) {
            // Write an empty string or empty object to the file
            await writeFile(absolutePath, JSON.stringify({}, null, 2));
            console.log('Credentials file emptied successfully:', absolutePath);
        } 
   
}

export { cleanupCredentials };