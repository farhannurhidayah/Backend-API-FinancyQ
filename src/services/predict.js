const tf = require("@tensorflow/tfjs-node");
const loadModel = require("./loadModel");
const fs = require("fs");
const jpeg = require("jpeg-js");

async function classifyImage(imagePath) {
  // Load the model
  const model = await loadModel();

  // Read and preprocess the image
  const imageBuffer = fs.readFileSync(imagePath);
  const imageTensor = preprocessImage(imageBuffer);

  // Make a prediction
  const prediction = model.predict(imageTensor);
  const predictionData = prediction.dataSync();

  // Convert prediction to string output
  const result = predictionToString(predictionData);

  return result;
}

function preprocessImage(imageBuffer) {
  const pixels = jpeg.decode(imageBuffer, { useTArray: true });
  let tensor = tf.browser
    .fromPixels(pixels, 3)
    .resizeNearestNeighbor([224, 224]) // Resize the image
    .toFloat()
    .expandDims();

  // Normalize the image
  tensor = tensor.div(tf.scalar(127.5)).sub(tf.scalar(1));

  return tensor;
}

function predictionToString(predictionData) {
  // Convert the prediction data to a string representation.
  // This function should be adapted based on your model's output format and intended interpretation.

  // Example: If your model output is probabilities, you might convert them to class labels.
  // Here, let's assume your model output is directly the desired string (for simplicity).
  return String.fromCharCode(...predictionData);
}

module.exports = classifyImage;
