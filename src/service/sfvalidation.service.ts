import axios from 'axios'
import { storeSecret } from '../googlesecretmanager.ts/secretmanager.google.js';
export const sfvalidationService = {
    async sfvalidationService(Payload) {
        try {
          if(Payload.clientId && Payload.orgId){
            let storeclientidresult = await storeSecret(Payload.clientId, Payload.orgId);  
            console.log(storeclientidresult ,'Store client id result');
            return { message: 'Success' };
          }else{
            return { error: 'Failed' };
          }
        } catch (error) {
            console.log(error);
            return { error: 'Failed to get access token' };
        }
    }

}