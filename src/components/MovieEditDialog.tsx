
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Movie, TMDBMovie } from '@/types/movie';
import TMDBSearch from './TMDBSearch';

interface MovieEditDialogProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, newTitle: string) => void;
  onSelectTMDBMovie?: (id: number, tmdbMovie: TMDBMovie) => void;
}

const MovieEditDialog = ({
  movie,
  isOpen,
  onClose,
  onSave,
  onSelectTMDBMovie
}: MovieEditDialogProps) => {
  const [title, setTitle] = useState('');
  const [activeTab, setActiveTab] = useState<string>('search'); // Default to search tab

  // Reset the title when the dialog opens with a new movie
  React.useEffect(() => {
    if (movie) {
      setTitle(movie.title);
    }
  }, [movie]);

  const handleSave = () => {
    if (movie && title.trim()) {
      onSave(movie.id, title.trim());
      onClose();
    }
  };

  const handleSelectTMDBMovie = (tmdbMovie: TMDBMovie) => {
    if (movie && onSelectTMDBMovie) {
      onSelectTMDBMovie(movie.id, tmdbMovie);
      onClose();
    }
  };

  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find Movie</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="search">TMDB Search</TabsTrigger>
            <TabsTrigger value="edit">Edit Title</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="mt-4">
            <TMDBSearch 
              initialQuery={movie.title} 
              onSelectMovie={handleSelectTMDBMovie} 
            />
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-4 mt-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Movie Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter movie title"
              />
            </div>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!title.trim()}>
                Save Changes
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MovieEditDialog;
