'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function PackageSearchBar({ value, onChange }: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o destino..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}
