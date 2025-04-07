
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Movie } from '@/types/movie';
import { Copy, Check, Facebook, Linkedin, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface SocialShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
}

const SocialShareDialog = ({ isOpen, onClose, movies }: SocialShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  
  const topMovies = movies.slice(0, 25);
  const shareUrl = window.location.href;
  
  const generateShareText = () => {
    let text = "Here are my top 25 movies:\n\n";
    
    topMovies.forEach((movie, index) => {
      text += `${index + 1}. ${movie.title}${movie.year ? ` (${movie.year})` : ''}\n`;
    });
    
    text += `\nCheck out and create your own ranking at ${shareUrl}`;
    
    return text;
  };
  
  const shareText = generateShareText();
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Your movie list has been copied to clipboard",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleShareX = () => {
    const xShareText = `My top 25 movies ranking:\n\n${topMovies.slice(0, 5).map((m, i) => `${i + 1}. ${m.title}`).join('\n')}\n\n...and more!`;
    
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(xShareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };
  
  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };
  
  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShowPreview = () => {
    setShowPreview(true);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Share Your Cinematic Journey</DialogTitle>
            <DialogDescription>
              Share your curated collection of 25 extraordinary films with the world
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="social" className="mt-2">
            <TabsList className="grid grid-cols-2 mb-6 w-full">
              <TabsTrigger value="social" className="text-sm">Social Media</TabsTrigger>
              <TabsTrigger value="text" className="text-sm">As Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4">
              <Textarea 
                value={shareText} 
                readOnly 
                className="h-[200px] font-mono text-sm"
              />
              <div className="flex justify-end">
                <Button onClick={handleCopyToClipboard} className="flex items-center gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="social" className="space-y-5">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Share your cinematic taste with friends and followers
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  <Button 
                    onClick={handleShareX} 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 py-6 hover:bg-primary/10 hover:border-primary transition-all"
                  >
                    <X className="h-5 w-5" />
                    <div>
                      <p className="font-medium">X</p>
                      <p className="text-xs text-muted-foreground">Share to X.com</p>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={handleShareFacebook} 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 py-6 hover:bg-blue-50 hover:border-blue-400 dark:hover:bg-blue-950/30 dark:hover:border-blue-500 transition-all"
                  >
                    <Facebook className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium">Facebook</p>
                      <p className="text-xs text-muted-foreground">Share to Facebook</p>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={handleShareLinkedIn} 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 py-6 hover:bg-blue-50 hover:border-blue-600 dark:hover:bg-blue-950/30 dark:hover:border-blue-600 transition-all"
                  >
                    <Linkedin className="h-5 w-5 text-blue-700 dark:text-blue-500" />
                    <div>
                      <p className="font-medium">LinkedIn</p>
                      <p className="text-xs text-muted-foreground">Share to LinkedIn</p>
                    </div>
                  </Button>
                </div>
                
                <div className="p-4 rounded-lg border border-primary/10 bg-primary/5 mt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Preview</p>
                    <Button variant="ghost" size="sm" onClick={handleShowPreview}>
                      See full preview
                    </Button>
                  </div>
                  
                  <div className="mt-3 rounded-md overflow-hidden border">
                    <div className="bg-card p-3">
                      <h3 className="font-medium text-sm">My Top 25 Movies Ranking</h3>
                      <p className="text-xs text-muted-foreground mt-1">Personal collection of the most impactful films</p>
                    </div>
                    
                    <div className="p-3">
                      <ul className="space-y-1 text-sm">
                        {topMovies.slice(0, 3).map((movie, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium">
                              {idx + 1}
                            </span>
                            <span>{movie.title}{movie.year ? ` (${movie.year})` : ''}</span>
                          </li>
                        ))}
                        <li className="text-muted-foreground text-xs flex items-center gap-2 pl-7">
                          and {topMovies.length - 3} more...
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Social Share Preview</AlertDialogTitle>
            <AlertDialogDescription>
              This is how your share will look on social media
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="border rounded-lg overflow-hidden my-4">
            <div className="bg-card p-4">
              <h3 className="font-bold text-lg">My Top 25 Movies Ranking</h3>
              <p className="text-sm text-muted-foreground mt-1">Personal collection of the most impactful films</p>
            </div>
            
            <div className="p-4">
              <ul className="space-y-2">
                {topMovies.slice(0, 10).map((movie, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <span>{movie.title}{movie.year ? ` (${movie.year})` : ''}</span>
                  </li>
                ))}
                <li className="text-muted-foreground flex items-center gap-3 ml-9">
                  and {topMovies.length - 10} more...
                </li>
              </ul>
              
              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Shared via The 25 Best Movies of my Life</p>
                <p className="text-sm text-primary">{window.location.origin}</p>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction>Close Preview</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SocialShareDialog;
