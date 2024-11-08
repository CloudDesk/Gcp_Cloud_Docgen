import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { promisify } from "util";
const execAsync = promisify(exec);
const __dirname = path.resolve();
/**
 * Generates a DOCX file from a template with provided data.
 * @param templatePath - Path to the DOCX template file.
 * @param fieldData - Data to populate the template.
 * @returns Buffer containing the generated DOCX file.
 */
const generateDocxFromTemplate = async (templatePath, fieldData) => {
    try {
        const templateContent = await fs.readFile(templatePath, "binary");
        const zip = new PizZip(templateContent);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });
        doc.setData(fieldData);
        doc.render();
        return doc.getZip().generate({ type: "nodebuffer" });
    }
    catch (error) {
        console.error("Error generating DOCX:", error);
        throw error;
    }
};
/**
 * Converts a DOCX buffer to a PDF file using LibreOffice command line.
 * @param docxBuffer - Buffer containing the DOCX file.
 * @param outputDir - Directory to save the generated PDF file.
 * @param fileName - Name of the output PDF file.
 * @returns Promise resolving to the relative path of the generated PDF file.
 */
const convertDocxBufferToPdf = async (docxBuffer, outputDir, fileName) => {
    const tempDocxPath = path.join(outputDir, `${fileName}.docx`);
    const tempPdfPath = path.join(outputDir, `${fileName}.pdf`);
    try {
        await fs.writeFile(tempDocxPath, docxBuffer);
        await execAsync(`soffice --headless --convert-to pdf ${tempDocxPath} --outdir ${outputDir}`);
        if (!(await fs.stat(tempPdfPath))) {
            throw new Error("PDF file was not created.");
        }
        const pdfRelativePath = path.join("templates", `${fileName}.pdf`);
        await fs.unlink(tempDocxPath);
        return pdfRelativePath;
    }
    catch (error) {
        console.error(`LibreOffice conversion error: ${error.message}`);
        await fs.unlink(tempDocxPath);
        throw new Error(`Error converting DOCX to PDF: ${error.message}`);
    }
};
/**
 * Generates PDFs from a DOCX template and an array of field data objects.
 * @param templatePath - Path to the DOCX template file.
 * @param fieldsDataArray - Array of data objects to populate the template.
 * @param baseFileName - Base name for the output PDF files.
 * @returns Object containing an array of relative paths to the generated PDF files.
 */
export const generatePdfsFromTemplate = async (templatePath, fieldsDataArray, baseFileName) => {
    try {
        const outputDir = path.join(__dirname, "templates");
        try {
            await fs.mkdir(outputDir);
        }
        catch (err) {
            if (err.code !== "EEXIST")
                throw err;
        }
        const pdfFilePaths = [];
        const utcSeconds = Math.floor(new Date().getTime() / 1000);
        for (let i = 0; i < fieldsDataArray.length; i++) {
            const fieldData = fieldsDataArray[i];
            const docxBuffer = await generateDocxFromTemplate(templatePath, fieldData);
            const pdfRelativePath = await convertDocxBufferToPdf(docxBuffer, outputDir, `${baseFileName}_${utcSeconds}_${i + 1}`);
            pdfFilePaths.push(pdfRelativePath);
        }
        return { pdfFilePaths };
    }
    catch (error) {
        console.error("Error generating PDFs from template:", error);
        throw error;
    }
};
//# sourceMappingURL=generateDocument.js.map