
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Movie } from '@/types/movie';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Share2, Image, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

interface SocialShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
}

const SocialShareDialog = ({ isOpen, onClose, movies }: SocialShareDialogProps) => {
  const { toast } = useToast();
  const [shareType, setShareType] = useState<'plain' | 'markdown' | 'rich' | 'image'>('rich');
  const imageRef = useRef<HTMLDivElement>(null);

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
      case 'image':
        // For image, we'll use a different approach
        handleDownloadImage();
        return;
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

  const handleDownloadImage = () => {
    if (!imageRef.current) return;

    // Use html2canvas to convert the div to an image
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(imageRef.current!, {
        backgroundColor: document.body.classList.contains('dark') ? '#121212' : '#ffffff',
        scale: 2, // Higher resolution
        logging: false,
        onclone: (clonedDoc) => {
          // Make sure any elements that should be visible in the screenshot are visible
          const element = clonedDoc.getElementById('movie-image-container');
          if (element) {
            element.style.display = 'block';
            element.style.width = '800px';
            element.style.visibility = 'visible';
            element.style.position = 'relative';
          }
        }
      }).then(canvas => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'my-top-movies.png';
        link.href = image;
        link.click();
        
        toast({
          title: "Image downloaded",
          description: "Your movie rankings image has been downloaded",
        });
      }).catch(err => {
        console.error('Error generating image:', err);
        toast({
          title: "Failed to generate image",
          description: "Could not create the image. Please try again.",
          variant: "destructive",
        });
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

  const imagePreviewContent = () => {
    return (
      <div className="py-4 flex flex-col gap-4">
        <div 
          ref={imageRef} 
          id="movie-image-container"
          className="bg-card border rounded-md p-6 overflow-hidden mb-2 mx-auto"
          style={{ 
            width: '100%', 
            maxWidth: '800px',
          }}
        >
          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-bold text-center">My Top 20 Movies</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topMovies.map((movie) => (
                <Card key={movie.id} className="overflow-hidden shadow-md flex h-24">
                  <div className="bg-primary w-12 h-24 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-foreground">{movie.rank}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center p-3">
                    <h3 className="font-medium text-sm md:text-base line-clamp-1">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {movie.year && <span>{movie.year}</span>}
                      {movie.rottenTomatoesScore && (
                        <span className="bg-primary/10 px-1.5 py-0.5 rounded text-primary font-medium">
                          {movie.rottenTomatoesScore}%
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Preview of the image that will be generated</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Movie Rankings</DialogTitle>
          <DialogDescription>
            Copy or download your top movie rankings to share with others.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <Tabs 
            defaultValue="rich" 
            value={shareType}
            onValueChange={(value) => setShareType(value as 'plain' | 'markdown' | 'rich' | 'image')}
          >
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="plain">Text</TabsTrigger>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
              <TabsTrigger value="rich">HTML</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plain">
              {previewContent()}
            </TabsContent>
            
            <TabsContent value="markdown">
              {previewContent()}
            </TabsContent>
            
            <TabsContent value="rich">
              {previewContent()}
            </TabsContent>
            
            <TabsContent value="image">
              {imagePreviewContent()}
            </TabsContent>
          </Tabs>
          
          <p className="text-sm text-muted-foreground">
            Copy your movie rankings to share on social media, forums, or with friends.
          </p>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleCopyToClipboard} 
            className="w-full sm:w-auto flex items-center gap-2"
          >
            {shareType === 'image' ? (
              <>
                <Download className="h-4 w-4" />
                Download Image
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareDialog;
