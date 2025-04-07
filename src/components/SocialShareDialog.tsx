
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard, Facebook, Linkedin, X, Check, Share2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
}

const SocialShareDialog = ({ isOpen, onClose, movies }: SocialShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const { toast } = useToast();
  
  const generateMovieList = () => {
    let list = '🎬 My Top 25 Movies of All Time 🎬\n\n';
    
    // Make sure we only share a maximum of 25 movies
    const moviesToShare = movies.slice(0, 25);
    
    moviesToShare.forEach((movie) => {
      list += `${movie.rank}. ${movie.title}${movie.year ? ` (${movie.year})` : ''}\n`;
    });
    
    list += '\nRanked with passion and personal preference! What would be on your list? 🍿';
    return list;
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generateMovieList());
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Your movie list has been copied to clipboard!",
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleShareToX = () => {
    const text = encodeURIComponent(generateMovieList().substring(0, 280));
    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
  };
  
  const handleShareToFacebook = () => {
    const text = encodeURIComponent('Check out my top 25 movies of all time!');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${text}`, '_blank');
  };
  
  const handleShareToLinkedIn = () => {
    const text = encodeURIComponent('My Top 25 Movies of All Time');
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${text}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share Your Top Movies</DialogTitle>
          <DialogDescription>
            Share your personalized movie rankings across social media or copy the list to share anywhere.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="focus:outline-none">
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center">
                    <Share2 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">My Top 25 Movies</h3>
                    <p className="text-xs text-muted-foreground">Ranked with passion and personal preference</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={handleCopyToClipboard}
                >
                  <Download className="h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
              
              <ScrollArea className="h-[300px] rounded border bg-background p-4">
                <ol className="list-decimal pl-5 space-y-1.5">
                  {movies.slice(0, 25).map((movie) => (
                    <li key={movie.id} className="text-sm">
                      <span className="font-medium">{movie.title}</span>
                      {movie.year && <span className="text-muted-foreground"> ({movie.year})</span>}
                      {movie.rottenTomatoesScore && (
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                          movie.rottenTomatoesScore >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          movie.rottenTomatoesScore >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {movie.rottenTomatoesScore}%
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </ScrollArea>
              
              <div className="mt-4 text-xs text-center text-muted-foreground italic">
                Share this list with friends and compare favorite movies!
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="share" className="focus:outline-none">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 h-16 justify-start px-4 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 transition-colors border-blue-100 dark:border-blue-900"
                  onClick={handleShareToX}
                >
                  <X className="h-5 w-5" />
                  <div>
                    <p className="font-medium">X</p>
                    <p className="text-xs text-muted-foreground">Share to X.com</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 h-16 justify-start px-4 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-950 transition-colors border-blue-100 dark:border-blue-900"
                  onClick={handleShareToFacebook}
                >
                  <Facebook className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Facebook</p>
                    <p className="text-xs text-muted-foreground">Share to Facebook</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 h-16 justify-start px-4 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-950 transition-colors border-blue-100 dark:border-blue-900"
                  onClick={handleShareToLinkedIn}
                >
                  <Linkedin className="h-5 w-5" />
                  <div>
                    <p className="font-medium">LinkedIn</p>
                    <p className="text-xs text-muted-foreground">Share to LinkedIn</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 h-16 justify-start px-4 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-950 transition-colors border-green-100 dark:border-green-900"
                  onClick={handleCopyToClipboard}
                >
                  {copied ? <Check className="h-5 w-5" /> : <Clipboard className="h-5 w-5" />}
                  <div>
                    <p className="font-medium">{copied ? 'Copied!' : 'Copy Text'}</p>
                    <p className="text-xs text-muted-foreground">Copy to clipboard</p>
                  </div>
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <ScrollArea className="h-[150px]">
                  <p className="text-xs whitespace-pre-wrap text-muted-foreground">{generateMovieList()}</p>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareDialog;
