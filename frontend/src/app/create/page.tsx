"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Check,
  Sparkles,
  Loader2,
  MessageSquare,
  Rocket,
} from "lucide-react";
import { chatbotApi, documentApi, systemPromptApi } from "@/lib/api";
import type { Chatbot } from "@/lib/types";

type WizardStep = 1 | 2 | 3 | 4;

export default function CreateChatbotPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Step 1: Basic Settings
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [generatingPrompt, setGeneratingPrompt] = useState(false);

  // Step 2: Documents
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Step 3: Test
  const [testQuestion, setTestQuestion] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testing, setTesting] = useState(false);

  // Chatbot data
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const progress = (currentStep / 4) * 100;

  const stepTitles = {
    1: "Basic Settings",
    2: "Upload Documents",
    3: "Test Your Chatbot",
    4: "Ready to Deploy",
  };

  // Step 1: Generate AI system prompt
  const handleGeneratePrompt = async () => {
    try {
      setGeneratingPrompt(true);
      const response = await systemPromptApi.generate({
        special_instructions: name ? `Focus on ${name}` : undefined,
      });
      setSystemPrompt(response.system_prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate prompt");
    } finally {
      setGeneratingPrompt(false);
    }
  };

  // Step 1: Create chatbot
  const handleCreateChatbot = async () => {
    if (!name.trim() || !systemPrompt.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setError(null);
      const newChatbot = await chatbotApi.create({
        name: name.trim(),
        system_prompt: systemPrompt.trim(),
      });
      setChatbot(newChatbot);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chatbot");
    }
  };

  // Step 2: Upload documents
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!chatbot || selectedFiles.length === 0) {
      setError("Please select at least one file");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await documentApi.upload(chatbot.id, selectedFiles);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  // Step 3: Test chatbot
  const handleTest = async () => {
    if (!chatbot || !testQuestion.trim()) {
      setError("Please enter a question");
      return;
    }

    try {
      setTesting(true);
      setError(null);
      const response = await chatbotApi.query(chatbot.id, {
        question: testQuestion.trim(),
      });
      setTestResponse(response.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to test chatbot");
    } finally {
      setTesting(false);
    }
  };

  // Step 4: Complete and navigate to chat
  const handleComplete = () => {
    if (chatbot) {
      router.push(`/chat/${chatbot.id}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Create New Chatbot
          </h1>
          <p className="text-muted-foreground">
            {stepTitles[currentStep]} - Step {currentStep} of 4
          </p>
          <Progress value={progress} className="mt-4" />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="max-w-3xl mx-auto mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Wizard Content */}
        <div className="max-w-3xl mx-auto">
          {/* Step 1: Basic Settings */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Basic Settings
                </CardTitle>
                <CardDescription>
                  Give your chatbot a name and define its behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Chatbot Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Customer Support Bot"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prompt">System Prompt *</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGeneratePrompt}
                      disabled={generatingPrompt}
                    >
                      {generatingPrompt ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="prompt"
                    placeholder="Define how your chatbot should behave..."
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    This prompt defines your chatbot&apos;s personality and behavior
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    size="lg"
                    onClick={handleCreateChatbot}
                    disabled={!name.trim() || !systemPrompt.trim()}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Upload Documents */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Documents
                </CardTitle>
                <CardDescription>
                  Upload documents to train your chatbot (PDF, DOCX, TXT)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer text-primary hover:underline"
                  >
                    Click to upload files
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Supports PDF, DOCX, and TXT files
                  </p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({selectedFiles.length})</Label>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{file.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-4 pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Test */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Test Your Chatbot
                </CardTitle>
                <CardDescription>
                  Try asking a question to see how your chatbot responds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="test-question">Ask a Question</Label>
                  <Textarea
                    id="test-question"
                    placeholder="What would you like to ask?"
                    value={testQuestion}
                    onChange={(e) => setTestQuestion(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleTest}
                    disabled={!testQuestion.trim() || testing}
                  >
                    {testing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Question"
                    )}
                  </Button>
                </div>

                {testResponse && (
                  <div className="space-y-2">
                    <Label>Response</Label>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">{testResponse}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-4 pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button size="lg" onClick={() => setCurrentStep(4)}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Deploy */}
          {currentStep === 4 && (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">
                  Chatbot Ready to Deploy!
                </CardTitle>
                <CardDescription>
                  Your chatbot has been created and is ready to use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {chatbot && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Name:</span>
                          <p className="text-sm text-muted-foreground">{chatbot.name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Documents:</span>
                          <p className="text-sm text-muted-foreground">
                            {selectedFiles.length} file(s) uploaded
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Status:</span>
                          <p className="text-sm text-muted-foreground capitalize">
                            {chatbot.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4 pt-4">
                  <Button size="lg" onClick={handleComplete} className="w-full">
                    <Rocket className="mr-2 h-4 w-4" />
                    Start Chatting
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
