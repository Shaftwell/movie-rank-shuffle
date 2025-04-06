
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface MovieFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  uniqueGenres: string[];
}

const MovieFilters = ({
  searchTerm,
  setSearchTerm,
  selectedGenre,
  setSelectedGenre,
  uniqueGenres
}: MovieFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="relative w-full md:w-1/2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <Select value={selectedGenre} onValueChange={setSelectedGenre}>
        <SelectTrigger className="w-full md:w-1/4">
          <SelectValue placeholder="Filter by genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All Genres</SelectItem>
            {uniqueGenres.map((genre) => (
              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default MovieFilters;
