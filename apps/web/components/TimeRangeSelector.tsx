// Time range selector
"use client";

import { useRouter, useSearchParams } from "next/navigation";

const ranges = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "year", label: "Year" },
];

export function TimeRangeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || "today";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("range", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-1 border border-[#222] rounded-lg p-1 bg-[#111]">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => handleChange(range.value)}
          className={`px-3 py-1 text-xs font-medium rounded transition-all ${currentRange === range.value
            ? "bg-white text-black"
            : "text-[#666] hover:text-white"
            }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
