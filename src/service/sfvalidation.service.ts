import axios from 'axios'
export const sfvalidationService = {
    async sfvalidationService(Payload) {
        // let SALESFORCE_LOGIN_URL = 'https://login.salesforce.com';
        // let CLIENT_ID = Payload.clientid
        // let CLIENT_SECRET = 'FF475B4D775DDD62BABB722D4A6C61E4856F860846B6133C5A7064B01AC8537E'
        // let SALESFORCE_REDIRECT_URI = 'http://localhost:4350';
        try {
            // let tokenUrl = `${SALESFORCE_LOGIN_URL}/services/oauth2/token`;
            // let params = new URLSearchParams();
            // params.append('grant_type', 'client_credentials');
            // params.append('client_id', CLIENT_ID);
            // params.append('client_secret', CLIENT_SECRET);
            // params.append('redirect_uri', SALESFORCE_REDIRECT_URI);
            // let response = await axios.post(tokenUrl, params, {
            //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // });
            // return { access_token: response.data.access_token };
            return Payload.clientid
        } catch (error) {
            console.log(error);
            return { error: 'Failed to get access token' };
        }
    }

}