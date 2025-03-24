import { validateRequestBody } from "../ajv/validation.js";
import { documentController } from "../controller/document.controller.js";
import { sfCredentialController } from "../controller/sfcredential.controller.js";
import { sfOrgIdClientIdValidation } from "../schema/validateSalesforceData.js";
import { sfValidateTemplateData } from "../schema/sfuserdatavalidation.js";
import { documentControllerTask } from "../controller/documenttask.controller.js";
import path from "path";
import fs from 'fs';
import { filesUpload } from "../multer/Multer.js";
import { sfAuthService } from "../service/sf/auth.service.js";
import { dirname, resolve, join } from "path";
import { fileURLToPath } from "url";



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const parentDir = resolve(__dirname, "..");

const FIXED_TOKEN = "test-token-123";


export const docGenRouter = (fastify, options, done) => {


  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let DOCX_FILE = path.join(__dirname, "Template.docx");


  let fileMap = {
    "doc-123": DOCX_FILE,
  };

  if (!fs.existsSync(fileMap["doc-123"])) {
    fs.writeFileSync(fileMap["doc-123"], "Initial content", "utf8");
  }


  // Root route
  fastify.get("/", (request, reply) => {
    console.log("Root route accessed");
    reply.send("Successfully Worked DocGen with wopi updated !!");
  });


  // Salesforce ID validation route
  fastify.post(
    "/api/v1/salesforce/store-credentials",
    {
      // schema: [sfOrgClientIdSwagger],
      preHandler: [validateRequestBody(sfOrgIdClientIdValidation)],
    },
    sfCredentialController.validateAndStoreSalesforceCredentials
  );

  fastify.post(
    "/api/v1/salesforce/process-document",
    {
      // schema: [processDocumentSwagger],
      preHandler: [validateRequestBody(sfValidateTemplateData)],
    },
    //create task entry
    documentController.processDocument
  );

  fastify.post(
    "/api/v1/task/salesforce/process-document",
    {
      // schema: [processDocumentSwagger],
      preHandler: [validateRequestBody(sfValidateTemplateData)],
    },
    //create task entry
    documentControllerTask.processDocumentTask
  );




  // wopi route
  fastify.get('/wopi', (req, res) => {
    res.send('Welcome to WPOI Server!');
  });

  fastify.get('/wopi/test', (req, res) => {
    res.send('Welcome to WPOI Server Test !');
  });

  fastify.get("/wopi/files/:fileId", (req, reply) => {

    console.log('inside get method wopi');
    console.log(req.query, 'Query inside wopi get mthod');
    console.log(req.query.sf_org_id , 'inside wopi  ==> ORg id inside wopi');
    console.log(req.query.sf_user_name , 'inside wopi  ==>  User name inside wopi');
    const template = sfAuthService.getAccessToken(req.query.sf_org_id, req.query.sf_user_name).then((sfResult) => {
      console.log(sfResult, "Result is inside route");
      const { instanceUrl, accessToken } = sfResult;
      sfAuthService.getTemplateFromSalesforce(instanceUrl, accessToken).then((templateres) => {
        console.log(templateres, "Result is inside route after creation");
        DOCX_FILE = path.join(__dirname, "../Template.docx");
        console.log(DOCX_FILE, 'DOCX_FILE');
        fileMap = {
          "doc-123": DOCX_FILE,
        };

        const fileId = req.params.fileId;
        const accessToken = req.query.access_token;

        if (accessToken !== FIXED_TOKEN) {
          return reply.send({ error: "Unauthorized" });
        }

        if (!fileMap[fileId]) {
          return reply.send({ error: "File not found" });
        }

        const stats = fs.statSync(fileMap[fileId]);
        reply.send({
          BaseFileName: "Template.docx",
          Size: stats.size,
          OwnerId: "admin",
          UserId: "admin",
          UserFriendlyName: "Admin User",
          SupportsUpdate: true,
          ReadOnly: false,
          UserCanWrite: true,
        });
        return templateres.fileName
      });
    })
      .catch((error) => {
        console.log(error, "Error is ");
      })
    // console.log(path.join(__dirname, "../Template.docx"), 'DOCX_FILE');

  });

  fastify.get("/wopi/files/:fileId/contents", (req, reply) => {
    const fileId = req.params.fileId;
    const accessToken = req.query.access_token;

    if (accessToken !== FIXED_TOKEN) {
      return reply.status(401).json({ error: "Unauthorized" });
    }

    if (!fileMap[fileId]) {
      return reply.status(404).send("File not found");
    }

    reply.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    // fs.createReadStream(fileMap[fileId]).pipe(reply);
    const stream = fs.createReadStream(fileMap[fileId]);
    return reply.send(stream);
  });


  // app.use('/wopi/files/:fileId/contents', express.raw({ type: '*/*', limit: '50mb' }));

  fastify.addContentTypeParser('*/*', { parseAs: 'buffer', bodyLimit: 50 * 1024 * 1024 }, (req, payload, done) => {
    console.log('inside add content type parser');
    done(null, payload);
  });

  fastify.put("/wopi/files/:fileId/contents", (req, res) => {
    const fileId = req.params.fileId;
    const accessToken = req.query.access_token;

    if (accessToken !== FIXED_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!fileMap[fileId]) {
      return res.status(404).send("File not found");
    }

    try {
      console.log('Received PUT request body length:', req.body.length);
      fs.writeFileSync(fileMap[fileId], req.body);
      console.log('File saved to storage via PUT:', fileMap[fileId]);
      res.status(200).send();
    } catch (error) {
      console.error("Error saving file via PUT:", error);
      res.status(500).send("Error saving file");
    }
  });

  fastify.post("/wopi/files/:fileId/contents", (req, res) => {

    console.log('inside post method updated');
    const fileId = req.params.fileId;
    const accessToken = req.query.access_token;

    console.log(accessToken, 'accessToken');

    if (accessToken !== FIXED_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!fileMap[fileId]) {
      return res.status(404).send("File not found");
    }

    try {
      console.log('Received POST request body length:', req.body.length);
      fs.writeFileSync(fileMap[fileId], req.body);
      console.log('File saved to storage via POST:', fileMap[fileId]);
      res.status(200).send();
    } catch (error) {
      console.error("Error saving file via POST:", error);
      res.status(500).send("Error saving file");
    }
  });


  fastify.post("/save-document", { preHandler: [filesUpload] }, async (req, reply) => {
    if (!req.file) {
      return reply.status(400).send({ message: "No file uploaded" });
    }
    console.log("Uploaded File Details: latest", req.files);

    // console.log("Uploaded File Details: latest", req.file());

    console.log(req.query, 'inside wopi  ==>  Query inside wopi save mthod');
    console.log(req.query.sf_org_id , 'inside wopi  ==> ORg id inside wopi save Method');
    console.log(req.query.sf_user_name , 'inside wopi  ==>  User name inside wopi save Method');
    try {
      const sfAuthTokenResult = await sfAuthService.getAccessToken(req.query.sf_org_id,req.query.sf_user_name);
      console.log(sfAuthTokenResult, "Salesforce connection result is");
      console.log(sfAuthTokenResult.accessToken, 'accessToken');
      const { instanceUrl, accessToken } = sfAuthTokenResult;
      const { fileName, contentDomcumentId } = await sfAuthService.getTemplateFromSalesforce(instanceUrl, accessToken)
      // const contentDocumentId = '069WU00000A5AvSYAV';
      console.log(contentDomcumentId, ' Dyanmic contentDocumentId');
      // console.log(req.files[0].path + 'req.file.path inside save document');
      if (req.files && req.files.length > 0 && req.files[0].path && contentDomcumentId
        && (req.files[0].mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          || req.files[0].mimetype == 'application/msword')
        && req.files[0].originalname.toLowerCase().endsWith(".docx")
      ) {
        const result = await sfAuthService.uploadDocumentToSalesforce(instanceUrl, accessToken, req.files[0].path, contentDomcumentId);
        console.log('Salesforce upload completed, Version ID inside docgen:', result);
        if (result.success) {
          reply.send({
            message: "File uploaded successfully",
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            salesforceVersionId: result.message,
          });
        }
        else {
          reply.send({
            message: "Failed to upload to Salesforce",
            error: result.message,
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
          });
        }

      }
      else if (req.files && req.files.length > 0 && req.files[0].path && !contentDomcumentId) {
        reply.send({
          message: "Failed to upload to Salesforce",
          error: 'Content Document Id For Template not found.Please Contact support team',
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        });

      }

      else if (req.files && req.files.length > 0 && req.files[0].path && contentDomcumentId &&
        !(
          (req.files[0].mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            req.files[0].mimetype === "application/msword") &&
          req.files[0].originalname.toLowerCase().endsWith(".docx")
        )
      ) {
        reply.send({
          message: "Failed to upload to Salesforce",
          error: 'File is not docx format',
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        });

      }
      else {
        reply.send({
          message: "Failed to upload to Salesforce",
          error: 'File path not found',
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        });
      }


    } catch (error) {
      console.error('Error uploading to Salesforce:', error);
      reply.send({
        message: "Failed to upload to Salesforce",
        error: error.message,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    }
  });

  done();
};
