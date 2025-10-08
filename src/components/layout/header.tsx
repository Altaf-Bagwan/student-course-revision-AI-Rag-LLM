"use client";

import { SourceSelector } from "@/components/pdf/source-selector";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex items-center gap-x-4 lg:gap-x-6 flex-1">
            <SourceSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
