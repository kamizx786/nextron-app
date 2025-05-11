"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import {
  Upload,
  ImagePlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TreesIcon as Plant,
  Wheat,
  Leaf,
  Bug,
  BarChartIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import ConfidenceChart from "./chart";

interface PredictionResult {
  prediction: string;
  confidence: number;
  all_confidences: {
    [key: string]: number;
  };
}

export default function EnhancedImagePredictor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("bars");

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

  const class_names = [
    "🌱 Healthy Wheat",
    "🌾 Wheat Loose Smut",
    "🍂 Leaf Rust",
    "🦠 Crown and Root Rot",
  ];

  // Map class names to icons
  const getIconForClass = (className: string) => {
    if (className.includes("Healthy"))
      return <Plant className="h-5 w-5 text-green-600" />;
    if (className.includes("Smut"))
      return <Wheat className="h-5 w-5 text-amber-600" />;
    if (className.includes("Leaf Rust"))
      return <Leaf className="h-5 w-5 text-orange-600" />;
    if (className.includes("Crown and Root"))
      return <Bug className="h-5 w-5 text-red-600" />;
    return <Plant className="h-5 w-5 text-gray-600" />;
  };

  // Get color for confidence bar
  const getColorForConfidence = (confidence: number) => {
    if (confidence > 80) return "bg-green-500";
    if (confidence > 50) return "bg-amber-500";
    if (confidence > 30) return "bg-orange-500";
    return "bg-red-500";
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

        try {
          // Send to main process
          const result = await window.ipc.invoke("predict-image", {
            imageData: base64Data,
            fileName: selectedFile.name,
          });

          // For demo purposes, using a mock result
          // In production, use the actual result from the API
          const mockResult = {
            prediction: "Healthy Wheat",
            confidence: 93.51,
            all_confidences: {
              "Healthy Wheat": 93.51,
              "Wheat Loose Smut": 5.19,
              "Leaf Rust": 0,
              "Crown and Root Rot": 1.31,
            },
          };

          // Parse the prediction result
          const predictionData =
            typeof result === "string"
              ? JSON.parse(result)
              : result || mockResult;

          setPredictionResult(predictionData);
        } catch (err) {
          console.error("Error processing prediction:", err);
          setError("Failed to process prediction result");
        } finally {
          setIsProcessing(false);
        }
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
                    predictionResult?.prediction?.includes("Healthy")
                      ? "bg-green-100"
                      : "bg-amber-100"
                  }`}
                >
                  <CheckCircle2
                    className={`h-6 w-6 ${
                      predictionResult?.prediction?.includes("Healthy")
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Detection Result:</h3>
                  <p
                    className={`text-xl font-bold ${
                      predictionResult?.prediction?.includes("Healthy")
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {predictionResult?.prediction}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Confidence:{" "}
                    <span className="font-semibold">
                      {predictionResult?.confidence?.toFixed(2)}%
                    </span>
                  </p>
                </div>
              </div>

              <Tabs
                defaultValue="bars"
                className="mt-6"
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bars" className="flex items-center">
                    <BarChartIcon className="h-4 w-4 mr-2" />
                    Bar Chart
                  </TabsTrigger>
                  <TabsTrigger value="list">Detailed List</TabsTrigger>
                </TabsList>
                <TabsContent value="bars" className="mt-4">
                  <ConfidenceChart
                    confidences={predictionResult?.all_confidences}
                  />
                </TabsContent>
                <TabsContent value="list" className="mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Confidence Analysis:
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(predictionResult.all_confidences)
                        .sort(([, a], [, b]) => b - a)
                        .map(([className, confidence]) => (
                          <div key={className} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getIconForClass(className)}
                                <span className="text-sm font-medium">
                                  {className}
                                </span>
                              </div>
                              <span className="text-sm font-semibold">
                                {confidence.toFixed(2)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${getColorForConfidence(
                                  confidence
                                )}`}
                                style={{ width: `${confidence}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {predictionResult &&
                !predictionResult?.prediction?.includes("Healthy") && (
                  <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-2">
                      Recommended Actions:
                    </h3>
                    <ul className="space-y-2">
                      {getTreatmentSuggestions(predictionResult?.prediction).map(
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

              {predictionResult?.prediction?.includes("Healthy") && (
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
