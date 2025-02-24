import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { VoiceCommands } from "@/components/voice-commands";
import { Logo } from "@/components/logo";
import { LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                История
              </Button>
            </Link>
            <VoiceCommands />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#003366] sm:text-6xl">
            Умна оценка на имоти
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Получете незабавна и точна оценка на вашия имот използвайки нашата
            модерна AI платформа само в няколко прости стъпки.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/evaluation/step1">
              <Button size="lg" className="bg-[#003366] hover:bg-[#002244]">
                Оцени моя имот
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}