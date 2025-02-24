import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { VoiceCommands } from "@/components/voice-commands";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <VoiceCommands />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#003366] sm:text-6xl">
            Smart Property Evaluation
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Get an instant, accurate evaluation of your property using our
            advanced AI-powered platform with just a few simple steps.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/evaluation/step1">
              <Button size="lg" className="bg-[#003366] hover:bg-[#002244]">
                Evaluate My Property
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
