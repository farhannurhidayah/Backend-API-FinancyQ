const tf = require("@tensorflow/tfjs-node");
require("dotenv").config();

async function loadModel() {
  return await tf.loadGraphModel(process.env.MODEL_URL);
}

module.exports = loadModel;
