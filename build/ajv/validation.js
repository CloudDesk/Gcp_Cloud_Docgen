import Ajv from "ajv";
import ajvErrors from "ajv-errors"; // Ensure you're using a compatible version
const ajv = new Ajv({ allErrors: true });
ajvErrors(ajv); // Initialize ajv-errors with the ajv instance
// Function to validate the uploaded fil
export const validateRequestBody = (schema) => {
    return async (request, reply) => {
        try {
            console.log('validation', JSON.stringify(request.body));
            const valid = ajv.validate(schema, request.body);
            console.log(valid);
            if (!valid) {
                console.log(ajv.errors, 'AJV Errors');
                reply.status(400).send({ error: ajv.errors });
            }
        }
        catch (error) {
            reply.status(500).send(error);
        }
    };
};
//# sourceMappingURL=validation.js.map