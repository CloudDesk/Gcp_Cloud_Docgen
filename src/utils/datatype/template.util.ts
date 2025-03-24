import { fileURLToPath } from "url";
import { dirname, resolve, join } from "path";
import { sfAuthService } from "../../service/sf/auth.service.js";

export const salesforceTemplate = () => {
    try {
        console.log('inside salesforceTemplate');
        let DOCX_FILE: any;
        let fileMap: any;
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const parentDir = resolve(__dirname, "..");

        const template = sfAuthService.getAccessToken("00DWU00000BoiXu2AJ", "cddev@org.com").then((sfResult: any) => {
            console.log(sfResult, "Result is inside route");
            if (sfResult.success === false) {
                return 'Please register your Salesforce credentials first';
            }
            const { instanceUrl, accessToken } = sfResult;
            sfAuthService.getTemplateFromSalesforce(instanceUrl, accessToken).then((templateres) => {
                console.log(templateres, "Result is inside route");
                return templateres
            });
        })
            .catch((error) => {
                console.log(error, "Error is ");
            })

        // DOCX_FILE = path.join(__dirname, "Template.docx");
        // fileMap = {
        //     "doc-123": DOCX_FILE,
        // };

        // const uploadDir = path.join(__dirname, "uploads");
        // if (!fs.existsSync(uploadDir)) {
        //     fs.mkdirSync(uploadDir);
        // }



        // if (!fs.existsSync(fileMap["doc-123"])) {
        //     fs.writeFileSync(fileMap["doc-123"], "Initial content", "utf8");
        // }
    } catch (error) {
        console.log('error in get Template ', error);
    }
}