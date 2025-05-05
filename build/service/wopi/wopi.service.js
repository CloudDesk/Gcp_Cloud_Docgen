import { sfAuthService } from "../sf/auth.service.js";
import path from "path";
import fs from 'fs';
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
const FIXED_TOKEN = "test-token-123";
let fileMap = {};
let DOCX_FILE = '';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const parentDir = resolve(__dirname, "..");
export const wopiService = {
    async fetchTemplateData(req, reply) {
        try {
            console.log(req.query, 'Query inside wopi get method');
            const sfResult = await sfAuthService.getAccessToken(req.query.sf_org_id, req.query.sf_user_name);
            console.log(sfResult, "updated Result is inside route");
            const { instanceUrl, accessToken: sfAccessToken } = sfResult;
            const templateres = await sfAuthService.getTemplateFromSalesforce(instanceUrl, sfAccessToken, req.query.templateId);
            console.log(templateres, "updated Template Response");
            console.log(__dirname, 'dirname');
            DOCX_FILE = path.join(__dirname, "../../Template.docx");
            console.log(DOCX_FILE, 'DOCX_FILE');
            fileMap = {
                [req.params.fileId]: DOCX_FILE,
            };
            console.log(fileMap, 'fileMap');
            const fileId = req.params.fileId;
            const accessToken = req.query.access_token;
            if (accessToken !== FIXED_TOKEN) {
                return { error: "Unauthorized" };
            }
            if (!fileMap[fileId]) {
                return { error: "File not found" };
            }
            const stats = fs.statSync(fileMap[fileId]);
            return {
                BaseFileName: "Template.docx",
                Size: stats.size,
                OwnerId: "admin",
                UserId: "admin",
                UserFriendlyName: "Admin User",
                SupportsUpdate: true,
                ReadOnly: false,
                UserCanWrite: true,
            };
        }
        catch (error) {
            console.error(error, "Error occurred in fetchTemplateData");
            return { error: "Internal Server Error" };
        }
    },
    async fetchWopiContent(req, reply) {
        try {
            const fileId = req.params.fileId;
            const accessToken = req.query.access_token;
            if (accessToken !== FIXED_TOKEN) {
                return ({ error: "Unauthorized" });
                return;
            }
            if (!fileMap[fileId]) {
                return ({ error: "File not found" });
            }
            reply.header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            const stream = fs.createReadStream(fileMap[fileId]);
            console.log('inside fetch wopi content endpoint' + stream);
            return stream;
        }
        catch (error) {
            console.error(error, "Error occurred in fetchWopiContent");
            return { error: error.message };
        }
    }
};
//# sourceMappingURL=wopi.service.js.map