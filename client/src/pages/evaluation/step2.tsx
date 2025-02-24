import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Upload } from "lucide-react";

export default function Step2() {
  const [, navigate] = useLocation();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  
  const onSubmit = () => {
    // In a real app, we would upload files here
    navigate("/evaluation/step3");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Mock file upload by just storing names
    const fileNames = Array.from(files).map(file => file.name);
    setUploadedFiles(prev => [...prev, ...fileNames]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Step 2: Upload Documents & Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label>Property Photos</Label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-300" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="photos"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-primary"
                      >
                        <span>Upload photos</span>
                        <Input
                          id="photos"
                          name="photos"
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Property Documents</Label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-300" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="documents"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-primary"
                      >
                        <span>Upload documents</span>
                        <Input
                          id="documents"
                          name="documents"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Uploaded Files:</h3>
                  <ul className="list-disc pl-5">
                    {uploadedFiles.map((file, i) => (
                      <li key={i} className="text-sm text-gray-600">{file}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/evaluation/step1")}>
              Back
            </Button>
            <Button onClick={onSubmit}>
              Continue to Results
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
