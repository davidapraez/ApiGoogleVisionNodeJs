const { ImageAnnotatorClient } = require("@google-cloud/vision");
const AWS = require("aws-sdk");
const visionFeatures = require("./visionFeatures");

const ssm = new AWS.SSM();
async function getGoogleCredentials() {
  try {
    const data = await ssm
      .getParameter({
        Name: "/google-vision/credentials",
        WithDecryption: true,
      })
      .promise();
    return JSON.parse(data.Parameter.Value);
  } catch (error) {
    console.error("Error al obtener las credenciales de Google: ", error);
    throw error;
  }
}

exports.handler = async (event) => {
  try {
    const credentials = await getGoogleCredentials();
    const visionClient = new ImageAnnotatorClient({ credentials });
    const body = JSON.parse(event.body);

    if (!body.url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "URL not provided" }),
      };
    }

    const imageContent = { source: { imageUri: body.url } };
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

    return {
      statusCode: 200,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error("Server Error: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "An error occurred while processing your request.",
      }),
    };
  }
};
