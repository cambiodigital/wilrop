"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Agregar...",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
            if (e.key === "Backspace" && !inputValue && tags.length > 0) {
              onChange(tags.slice(0, -1));
            }
          }}
          placeholder={placeholder}
          className="flex-1 text-sm h-8"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={!inputValue.trim()}
          className="h-8"
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, idx) => (
            <Badge
              key={`${tag}-${idx}`}
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-1 text-xs border border-border bg-accent text-accent-foreground hover:bg-accent"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((_, i) => i !== idx))}
                className="rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
