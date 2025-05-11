// import ort from "onnxruntime-node";
// import path from "path";
// import { app } from "electron";
// import sharp from "sharp";

// export class InferenceService {
//   constructor() {
//     this.classNames = [
//       "Healthy Wheat",
//       "Wheat Loose Smut",
//       "Leaf Rust",
//       "Crown and Root Rot",
//     ];
//     this.mean = [0.485, 0.456, 0.406];
//     this.std = [0.229, 0.224, 0.225];
//     this.imSize = 128;
//     this.session = null;
//   }
//   getModelPath() {
//     if (app.isPackaged) {
//       return path.join(process.resourcesPath, "resources", "wheat_model.onnx");
//     } else {
//       return path.join(__dirname, "..", "resources", "wheat_model.onnx");
//     }
//   }
//   async initialize() {
//     const modelPath = this.getModelPath();
//     this.session = await ort.InferenceSession.create(modelPath, {
//       executionProviders: ["cpu"], // Force CPU execution to match Python
//       graphOptimizationLevel: "all", // Match PyTorch's default
//     });
//   }

//   async preprocessImage(imageData) {
//     try {
//       // Remove base64 header
//       const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
//       const buffer = Buffer.from(base64Data, "base64");

//       // First decode to get original dimensions
//       const metadata = await sharp(buffer).metadata();

//       // Process image in two stages to ensure proper buffer sizes
//       const rgbBuffer = await sharp(buffer)
//         .ensureAlpha() // Handle potential alpha channel
//         .raw()
//         .toBuffer();

//       // Now resize with explicit channel management
//       const resized = await sharp(rgbBuffer, {
//         raw: {
//           width: metadata.width,
//           height: metadata.height,
//           channels: 4, // RGBA
//         },
//       })
//         .resize(this.imSize, this.imSize, {
//           kernel: sharp.kernel.lanczos3,
//           fit: "fill",
//         })
//         .removeAlpha() // Convert to RGB
//         .raw()
//         .toBuffer();

//       // Verify buffer size
//       const expectedSize = this.imSize * this.imSize * 3;
//       if (resized.length !== expectedSize) {
//         throw new Error(
//           `Buffer size mismatch: Expected ${expectedSize}, got ${resized.length}`
//         );
//       }

//       // Normalize to tensor
//       const tensor = new Float32Array(3 * this.imSize * this.imSize);
//       for (let i = 0; i < resized.length; i++) {
//         const channel = i % 3;
//         tensor[i] =
//           (resized[i] / 255.0 - this.mean[channel]) / this.std[channel];
//       }

//       return new ort.Tensor("float32", tensor, [
//         1,
//         3,
//         this.imSize,
//         this.imSize,
//       ]);
//     } catch (error) {
//       console.error("Preprocessing error:", error);
//       throw new Error(`Image processing failed: ${error.message}`);
//     }
//   }
//   // ... (keep rest of the class implementation)

//   async predict(imageData) {
//     if (!this.session) await this.initialize();

//     const inputTensor = await this.preprocessImage(imageData);
//     const feeds = { [this.session.inputNames[0]]: inputTensor };
//     const results = await this.session.run(feeds);
//     const data = results[this.session.outputNames[0]];
//     const output = Array.from(data.data);

//     // Debug outputs to compare with Python
//     console.log(
//       "Raw logits:",
//       output.map((v) => v.toFixed(4))
//     );

//     const probs = this.softmax(output);
//     console.log(
//       "Probabilities:",
//       probs.map((v) => v.toFixed(7))
//     );

//     const predIdx = probs.indexOf(Math.max(...probs));

//     return {
//       prediction: this.classNames[predIdx],
//       confidence: Math.round(probs[predIdx] * 10000) / 100,
//       all_confidences: this.classNames.reduce((acc, name, i) => {
//         acc[name] = Math.round(probs[i] * 10000) / 100;
//         return acc;
//       }, {}),
//     };
//   }

//   // Numerically stable softmax (identical to PyTorch's implementation)
//   softmax(arr) {
//     const max = Math.max(...arr);
//     const exp = arr.map((x) => Math.exp(x - max));
//     const sum = exp.reduce((a, b) => a + b, 0);
//     return exp.map((x) => x / sum);
//   }
// }
