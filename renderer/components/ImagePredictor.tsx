"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import {
  Upload,
  ImagePlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";

export default function ImagePredictor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [predictionResult, setPredictionResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setPredictionResult(null);
      // Create preview URL for the selected file
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      setError("Please select an image file first");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);

      reader.onload = async () => {
        const base64Data = reader.result as string;

        // Send to main process
        const predictedClass = await window.ipc.invoke("predict-image", {
          imageData: base64Data,
          fileName: selectedFile.name,
        });

        setPredictionResult(predictedClass);
        setIsProcessing(false);
      };

      reader.onerror = () => {
        setError("Error reading file");
        setIsProcessing(false);
      };
    } catch (err) {
      setError("Error processing image");
      setIsProcessing(false);
    }
  };

  // Disease treatment suggestions
  const getTreatmentSuggestions = (disease: string) => {
    // Standardize the disease name to lowercase to handle case insensitivity
    const formattedDisease = disease.toLowerCase();

    // Check the disease and return suggestions based on the included disease name
    if (formattedDisease.includes("crown")) {
      return [
        "Implement crop rotation with non-host crops for 2-3 years",
        "Use fungicide-treated seeds before planting",
        "Improve field drainage to reduce soil moisture",
        "Consider applying appropriate fungicides as recommended by agricultural experts",
      ];
    } else if (formattedDisease.includes("leaf")) {
      return [
        "Apply foliar fungicides at the first sign of infection",
        "Plant resistant wheat varieties in future seasons",
        "Monitor fields regularly during humid conditions",
        "Maintain proper spacing between plants for better air circulation",
      ];
    } else if (formattedDisease.includes("smut")) {
      return [
        "Use certified disease-free seeds for planting",
        "Treat seeds with recommended fungicides before sowing",
        "Remove and destroy infected plants to prevent spore spread",
        "Implement longer crop rotations with non-host crops",
      ];
    } else {
      return [];
    }
  };

  console.log(predictionResult);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="overflow-hidden">
        <div className="bg-green-700 p-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload Image for Wheat Leaf Disease Detection
          </h2>
        </div>
        <CardContent className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a clear image of wheat leaf
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImagePlus className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {selectedFile && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Selected file:{" "}
                <span className="font-medium">{selectedFile.name}</span>
              </p>
              {previewUrl && (
                <div className="border rounded-lg p-2 bg-white">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Selected wheat leaf"
                    className="h-48 object-contain mx-auto"
                  />
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handlePredict}
            disabled={!selectedFile || isProcessing}
            className="w-full"
            variant={!selectedFile ? "outline" : "default"}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Image...
              </>
            ) : (
              "Detect Disease"
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card
        className={`${
          predictionResult ? "border-green-500" : "border-gray-200"
        }`}
      >
        <div className="bg-gray-100 p-4">
          <h2 className="text-xl font-bold text-gray-800">Detection Results</h2>
        </div>
        <CardContent className="p-6">
          {!predictionResult && !isProcessing ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
              <ImagePlus className="h-12 w-12 mb-4 text-gray-300" />
              <p>Upload and analyze an image to see detection results</p>
            </div>
          ) : isProcessing ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Loader2 className="h-12 w-12 mb-4 animate-spin text-green-600" />
              <p className="text-gray-600">
                Analyzing your wheat leaf image...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a few moments
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    predictionResult.includes("Healthy Wheat")
                      ? "bg-green-100"
                      : "bg-amber-100"
                  }`}
                >
                  <CheckCircle2
                    className={`h-6 w-6 ${
                      predictionResult.includes("Healthy Wheat")
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Detection Result:</h3>
                  <p
                    className={`text-xl font-bold ${
                      predictionResult.includes("Healthy Wheat")
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {predictionResult}
                  </p>
                </div>
              </div>

              {predictionResult &&
                !predictionResult?.includes("Healthy Wheat") && (
                  <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-2">
                      Recommended Actions:
                    </h3>
                    <ul className="space-y-2">
                      {getTreatmentSuggestions(predictionResult).map(
                        (suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-amber-600 mr-2">•</span>
                            <span className="text-gray-700">{suggestion}</span>
                          </li>
                        )
                      )}
                    </ul>
                    <p className="text-sm text-amber-700 mt-3">
                      Consult with an agricultural expert for confirmation and
                      detailed treatment plans.
                    </p>
                  </div>
                )}

              {predictionResult.includes("Healthy Wheat") && (
                <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Good News!
                  </h3>
                  <p className="text-gray-700">
                    Your wheat appears to be healthy. Continue with your current
                    management practices and monitor regularly for any changes.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
