import { sfAuthService } from "../service/sf/auth.service.js";

/**
 * Controller for Salesforce authentication.
 */

interface SfConn {
  accessToken: string;
  instanceUrl: string;
}
export const sfAuthController = {
  /**
   * Authenticates a user with Salesforce.
   * @param {string} orgId - The organization ID.
   * @param {string} userName - The username.
   * @returns {Promise<Object>} The authentication result.
   */
  async authenticate(
    orgId: string,
    userName: string
  ): Promise<{ data?: SfConn; error?: string }> {
    try {
      const salesforceToken = await sfAuthService.getAccessToken(
        orgId,
        userName
      );
      console.log(salesforceToken, "Valid Salesforce token");
      return { data: salesforceToken };
    } catch (error) {
      console.error("Error during Salesforce authentication:", error);
      return { error: "Internal Server Error" };
    }
  },
};
