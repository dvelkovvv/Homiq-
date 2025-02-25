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
          <div className="bg-gradient-to-br from-primary to-[#4CAF50] rounded-lg p-2 transform transition-transform group-hover:scale-110 shadow-lg">
            <Building className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#4CAF50] border-2 border-white shadow-sm" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#2E7D32] to-[#4CAF50] leading-tight tracking-tight">
            HOMIQ
          </span>
          <span className="text-[10px] text-muted-foreground font-medium -mt-1">
            Smart Property Evaluation
          </span>
        </div>
      </div>
    </Link>
  );
}