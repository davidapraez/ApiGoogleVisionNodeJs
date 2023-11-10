const express = require("express");
const { ImageAnnotatorClient } = require("@google-cloud/vision");
const cors = require("cors");
const fs = require("fs");
const formidable = require("express-formidable");
const dotenv = require("dotenv");
const visionFeatures = require("./visionFeatures");
const morgan = require("morgan");

dotenv.config();

// Set up port from environment variables or use default
const port = process.env.PORT || 3000;

// Initialize Google Vision client with credentials
const credentials = JSON.parse(
  fs.readFileSync(process.env.GOOGLE_CREDENTIALS_PATH, "utf8")
);
const visionClient = new ImageAnnotatorClient({ credentials: credentials });

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Middleware for handling form data and file uploads
app.use(formidable());

// HTTP request logger middleware for node.js
app.use(morgan("combined"));

// POST endpoint for image analysis
app.post("/analizeImage", async (req, res) => {
  try {
    let imageContent;

    // Check if URL is provided in the request
    if (req.fields && req.fields.url) {
      imageContent = { source: { imageUri: req.fields.url } };
    }
    // Check if image file is provided in the request
    else if (req.files && req.files.image) {
      const image = req.files.image;
      imageContent = { content: fs.readFileSync(image.path) };
      fs.unlinkSync(image.path);
    } else {
      return res.status(400).json({ error: "Image or URL not provided" });
    }
    const [result] = await visionClient.annotateImage({
      image: imageContent,
      features: visionFeatures,
    });
    const labels = result.labelAnnotations.map((label) => ({
      description: label.description,
      score: label.score,
    }));

    const safeSearch = result.safeSearchAnnotation
      ? {
          adult: result.safeSearchAnnotation.adult,
          spoof: result.safeSearchAnnotation.spoof,
          medical: result.safeSearchAnnotation.medical,
          violence: result.safeSearchAnnotation.violence,
          racy: result.safeSearchAnnotation.racy,
        }
      : {};

    const faces = result.faceAnnotations.map((face) => ({
      joy: face.joyLikelihood,
      sorrow: face.sorrowLikelihood,
      anger: face.angerLikelihood,
      surprise: face.surpriseLikelihood,
      underExposed: face.underExposedLikelihood,
      blurred: face.blurredLikelihood,
      headwear: face.headwearLikelihood,
    }));

    const logos = result.logoAnnotations.map((logo) => logo.description);
    const text = result.textAnnotations.map((text) => text.description);

    let dominantColorsArray = [];

    if (
      result.imagePropertiesAnnotation &&
      result.imagePropertiesAnnotation.dominantColors.colors
    ) {
      dominantColorsArray =
        result.imagePropertiesAnnotation.dominantColors.colors.map(
          (colorInfo) => {
            return {
              red: colorInfo.color.red,
              green: colorInfo.color.green,
              blue: colorInfo.color.blue,
              score: colorInfo.score,
              pixelFraction: colorInfo.pixelFraction,
            };
          }
        );
    }

    const imageProperties = dominantColorsArray;

    const objects = result.localizedObjectAnnotations.map((object) => ({
      name: object.name,
      score: object.score,
    }));

    const web =
      result.webDetection && result.webDetection.webEntities
        ? result.webDetection.webEntities.map((webEntity) => ({
            entityId: webEntity.entityId,
            score: webEntity.score,
            description: webEntity.description,
          }))
        : [];

    const responseData = {
      labels,
      safeSearch,
      faces,
      logos,
      text,
      imageProperties,
      objects,
      web,
    };

    res.json({ data: responseData });
  } catch (error) {
    console.error("Server Error: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});
// Start the server on the configured port
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
