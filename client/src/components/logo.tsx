import { HomeIcon } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <HomeIcon className="h-8 w-8 text-[#003366]" />
        <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#4CAF50]" />
      </div>
      <span className="text-2xl font-bold text-[#003366]">Homiq</span>
    </div>
  );
}
