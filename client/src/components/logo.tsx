import { Link } from "wouter";
import { Building2 } from "lucide-react";

export function Logo() {
  return (
    <Link href="/">
      <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
        <div className="relative group">
          <div className="bg-primary rounded-lg p-2 transform transition-transform group-hover:scale-110">
            <Building2 className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#4CAF50] border-2 border-white" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#4CAF50] leading-tight">
            Homiq
          </span>
          <span className="text-xs text-muted-foreground font-medium -mt-1">
            Smart Property Evaluation
          </span>
        </div>
      </div>
    </Link>
  );
}