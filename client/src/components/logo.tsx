import { Link } from "wouter";
import { Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/">
      <div className={cn("flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity", className)}>
        <div className="relative group">
          <div className="bg-primary rounded-lg p-1.5 transform transition-transform group-hover:scale-110">
            <Building className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#4CAF50] border-2 border-white" />
          </div>
        </div>
        <div className="flex flex-col -mt-1">
          <span className="text-2xl font-bold leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#4CAF50]">
              HOMIQ
            </span>
            <span className="text-[#FF6B6B]">-IQ</span>
          </span>
          <span className="text-[10px] text-muted-foreground font-medium -mt-1">
            Smart Property Evaluation
          </span>
        </div>
      </div>
    </Link>
  );
}