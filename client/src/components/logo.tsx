import { HomeIcon } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <HomeIcon className="h-8 w-8 text-[#003366] transform transition-transform group-hover:scale-110" />
        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[#4CAF50] border-2 border-white shadow-sm" />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-[#003366] leading-tight">Homiq</span>
        <span className="text-xs text-[#4CAF50] font-medium -mt-1">Smart Property Evaluation</span>
      </div>
    </div>
  );
}