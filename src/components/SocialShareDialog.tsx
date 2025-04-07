
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Movie } from '@/types/movie';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
}

const SocialShareDialog = ({ isOpen, onClose, movies }: SocialShareDialogProps) => {
  const { toast } = useToast();
  const [shareType, setShareType] = useState<'plain' | 'markdown' | 'rich'>('rich');

  // Get the top ranked movies for sharing (up to 20)
  const topMovies = [...movies]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 20);

  const handleCopyToClipboard = () => {
    let textToCopy = '';

    switch (shareType) {
      case 'plain':
        textToCopy = generatePlainText();
        break;
      case 'markdown':
        textToCopy = generateMarkdownText();
        break;
      case 'rich':
        textToCopy = generateRichText();
        break;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Your movie rankings have been copied to clipboard",
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    });
  };

  const generatePlainText = () => {
    let text = "My Top 20 Movies:\n\n";
    
    topMovies.forEach(movie => {
      const year = movie.year ? ` (${movie.year})` : '';
      const rating = movie.rottenTomatoesScore ? ` - ${movie.rottenTomatoesScore}%` : '';
      const tmdbLink = movie.tmdbId ? ` https://www.themoviedb.org/movie/${movie.tmdbId}` : '';
      
      text += `${movie.rank}. ${movie.title}${year}${rating}${tmdbLink}\n`;
    });
    
    return text;
  };
  
  const generateMarkdownText = () => {
    let text = "# My Top 20 Movies\n\n";
    
    topMovies.forEach(movie => {
      const year = movie.year ? ` (${movie.year})` : '';
      const rating = movie.rottenTomatoesScore ? ` - ${movie.rottenTomatoesScore}%` : '';
      
      if (movie.tmdbId) {
        text += `${movie.rank}. [${movie.title}${year}${rating}](https://www.themoviedb.org/movie/${movie.tmdbId})\n`;
      } else {
        text += `${movie.rank}. ${movie.title}${year}${rating}\n`;
      }
    });
    
    return text;
  };
  
  const generateRichText = () => {
    let text = "<h1>My Top 20 Movies</h1>\n<ol>\n";
    
    topMovies.forEach(movie => {
      const year = movie.year ? ` (${movie.year})` : '';
      const rating = movie.rottenTomatoesScore ? ` - <strong>${movie.rottenTomatoesScore}%</strong>` : '';
      
      if (movie.tmdbId) {
        text += `<li><a href="https://www.themoviedb.org/movie/${movie.tmdbId}" target="_blank">${movie.title}${year}</a>${rating}</li>\n`;
      } else {
        text += `<li>${movie.title}${year}${rating}</li>\n`;
      }
    });
    
    text += "</ol>";
    return text;
  };

  const previewContent = () => {
    return (
      <div className="bg-card border rounded-md p-4 overflow-y-auto max-h-80">
        <h2 className="text-xl font-bold mb-4">My Top 20 Movies</h2>
        <ol className="list-decimal list-inside space-y-2">
          {topMovies.map((movie) => (
            <li key={movie.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{movie.title}</span>
                {movie.year && <span className="text-sm text-muted-foreground">({movie.year})</span>}
              </div>
              {movie.rottenTomatoesScore && (
                <span className="text-sm font-semibold px-1.5 py-0.5 bg-primary/10 rounded text-primary">
                  {movie.rottenTomatoesScore}%
                </span>
              )}
              {movie.tmdbId && (
                <a 
                  href={`https://www.themoviedb.org/movie/${movie.tmdbId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  TMDB Link
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Movie Rankings</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <Tabs 
            defaultValue="rich" 
            value={shareType}
            onValueChange={(value) => setShareType(value as 'plain' | 'markdown' | 'rich')}
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="plain">Plain Text</TabsTrigger>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
              <TabsTrigger value="rich">Rich Text</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {previewContent()}
          
          <p className="text-sm text-muted-foreground">
            Copy your movie rankings to share on social media, forums, or with friends.
          </p>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleCopyToClipboard} 
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy to Clipboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareDialog;
