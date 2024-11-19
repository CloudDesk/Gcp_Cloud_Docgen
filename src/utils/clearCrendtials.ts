
// cleanupCredentials.js
import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';

async function cleanupCredentials(credentialsPath) {
    console.log('inside cleanup credentials');
    console.log('Current working directory:', process.cwd());
    console.log('Provided credentialsPath:', credentialsPath);
    const absolutePath = resolve(process.cwd(), credentialsPath.replace(/^\//, ''));
    console.log('Resolved absolutePath:', absolutePath);
    
    if (existsSync(absolutePath)) {
        console.log('File exists:', absolutePath);
        await writeFile(absolutePath, JSON.stringify({}, null, 2));
        console.log('Credentials file emptied successfully:', absolutePath);
    } else {
        console.log('File does not exist:', absolutePath);
    }
    
   
}

export { cleanupCredentials };