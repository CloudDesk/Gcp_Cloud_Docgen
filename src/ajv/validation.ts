import Ajv from "ajv";
import ajvErrors from "ajv-errors"; // Ensure you're using a compatible version

const ajv = new Ajv({ allErrors: true });
ajvErrors(ajv); // Initialize ajv-errors with the ajv instance

// Function to validate the uploaded fil

export const validateRequestBody = (schema: any) => {
  return async (request, reply) => {
    try {
      console.log(JSON.stringify(request.body), 'validation request body')

      if (typeof request?.body?.fieldData === 'string') {
        request.body.fieldData = request.body.fieldData.replace(/^"(.+)"$/, '$1'); // Remove the surrounding double quotes
        request.body.fieldData = JSON.parse(request.body.fieldData);
      }
      console.log(request.body, 'validation request body after parsing')

      const valid = ajv.validate(schema, request.body);
      if (!valid) {
        console.log(ajv.errors, "AJV Errors");
        let errormessages = [];
        ajv.errors.map((error) => {
          errormessages.push(error.message);
        });
        console.log(errormessages ,'errormessages')
        reply.status(403).send({ error: errormessages});
      }
    } catch (error) {
      reply.status(500).send(error);
    }
  };
};
