import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Upload } from "lucide-react";

export default function Step2() {
  const [, navigate] = useLocation();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const propertyId = new URLSearchParams(window.location.search).get('propertyId');

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
    }
  }, [propertyId, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileNames = Array.from(files).map(file => file.name);
    setUploadedImages(prev => [...prev, ...fileNames]);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileNames = Array.from(files).map(file => file.name);
    setUploadedDocuments(prev => [...prev, ...fileNames]);
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
            <CardTitle>Качване на файлове</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label>Снимки на имота</Label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-300" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="photos"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-primary"
                      >
                        <span>Качете снимки</span>
                        <Input
                          id="photos"
                          name="photos"
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG до 10MB
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Документи за имота</Label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-300" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="documents"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-primary"
                      >
                        <span>Качете документи</span>
                        <Input
                          id="documents"
                          name="documents"
                          type="file"
                          multiple
                          accept=".pdf"
                          className="sr-only"
                          onChange={handleDocumentChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF до 10MB
                    </p>
                  </div>
                </div>
              </div>

              {(uploadedImages.length > 0 || uploadedDocuments.length > 0) && (
                <div className="space-y-4">
                  {uploadedImages.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Качени снимки:</h3>
                      <ul className="list-disc pl-5">
                        {uploadedImages.map((file, i) => (
                          <li key={`img-${i}`} className="text-sm text-gray-600">{file}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {uploadedDocuments.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Качени документи:</h3>
                      <ul className="list-disc pl-5">
                        {uploadedDocuments.map((file, i) => (
                          <li key={`doc-${i}`} className="text-sm text-gray-600">{file}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/evaluation/step1")}>
              Назад
            </Button>
            <Button 
              onClick={() => navigate(`/evaluation/step3?propertyId=${propertyId}`)} 
              className="bg-[#003366] hover:bg-[#002244]"
            >
              Продължи към оценка
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}