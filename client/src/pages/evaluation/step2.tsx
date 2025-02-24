import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Upload, X, Image as ImageIcon, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FileWithPreview extends File {
  preview?: string;
}

export default function Step2() {
  const [, navigate] = useLocation();
  const [images, setImages] = useState<FileWithPreview[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const propertyId = new URLSearchParams(window.location.search).get('propertyId');

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
    }
    // Cleanup function to revoke object URLs
    return () => images.forEach(image => image.preview && URL.revokeObjectURL(image.preview));
  }, [propertyId, navigate, images]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map(file => {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.preview = URL.createObjectURL(file);
      return fileWithPreview;
    });

    setImages(prev => [...prev, ...newImages]);
    toast({
      title: "Снимки качени успешно",
      description: `${files.length} ${files.length === 1 ? 'снимка беше качена' : 'снимки бяха качени'} успешно.`
    });
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setDocuments(prev => [...prev, ...Array.from(files)]);
    toast({
      title: "Документи качени успешно",
      description: `${files.length} ${files.length === 1 ? 'документ беше качен' : 'документа бяха качени'} успешно.`
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview!);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => {
      const newDocs = [...prev];
      newDocs.splice(index, 1);
      return newDocs;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Качване на файлове</CardTitle>
            <CardDescription>
              Качете снимки и документи за вашия имот за по-точна оценка
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label>Снимки на имота</Label>
                <div className="mt-2">
                  <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="photos"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-primary hover:text-primary/80"
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
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG до 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Качени снимки:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((file, i) => (
                        <div key={`img-${i}`} className="relative group">
                          <img
                            src={file.preview}
                            alt={`Preview ${i + 1}`}
                            className="h-40 w-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t">
                <Label>Документи за имота</Label>
                <div className="mt-2">
                  <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="documents"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-primary hover:text-primary/80"
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
                      <p className="text-xs text-gray-500 mt-2">
                        PDF до 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {documents.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Качени документи:</h3>
                    <div className="space-y-2">
                      {documents.map((file, i) => (
                        <div
                          key={`doc-${i}`}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeDocument(i)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/evaluation/step1")}>
              Назад
            </Button>
            <Button 
              onClick={() => navigate(`/evaluation/step3?propertyId=${propertyId}`)}
              className="bg-[#003366] hover:bg-[#002244]"
              disabled={images.length === 0}
            >
              Продължи към оценка
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}