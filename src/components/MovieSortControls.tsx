
import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SortOption } from '@/types/movie';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface MovieSortControlsProps {
  sortOption: SortOption;
  sortDirection: 'asc' | 'desc';
  onSortOptionChange: (value: string) => void;
  toggleSortDirection: () => void;
  resetRankings: () => void;
  resetLocalStorage: () => void;
}

const MovieSortControls = ({
  sortOption,
  sortDirection,
  onSortOptionChange,
  toggleSortDirection,
  resetRankings,
  resetLocalStorage
}: MovieSortControlsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Select value={sortOption} onValueChange={onSortOptionChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="rank">Ranking</SelectItem>
            <SelectItem value="title-asc">Title A-Z</SelectItem>
            <SelectItem value="title-desc">Title Z-A</SelectItem>
            <SelectItem value="year">Year</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      
      {(sortOption === 'rank' || sortOption === 'year' || sortOption === 'rating') && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleSortDirection}
          className="flex gap-1 items-center"
        >
          {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </Button>
      )}
      
      <Button variant="outline" size="sm" onClick={resetRankings}>
        Reset Rankings
      </Button>
      <Button variant="destructive" size="sm" onClick={resetLocalStorage}>
        Reset All Data
      </Button>
    </div>
  );
};

export default MovieSortControls;
