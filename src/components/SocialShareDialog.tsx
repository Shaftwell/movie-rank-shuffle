
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Movie } from '@/types/movie';
import { Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface SocialShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
}

const SocialShareDialog = ({ isOpen, onClose, movies }: SocialShareDialogProps) => {
  const [copied, setCopied] = useState(false);
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
  
  const handleShareTwitter = () => {
    const twitterShareText = `My top 25 movies ranking:\n\n${topMovies.slice(0, 5).map((m, i) => `${i + 1}. ${m.title}`).join('\n')}\n\n...and more!`;
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterShareText)}&url=${encodeURIComponent(shareUrl)}`;
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your movie rankings</DialogTitle>
          <DialogDescription>
            Share your personalized top 25 movie rankings with friends on social media
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="text">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="text">As Text</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
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
          
          <TabsContent value="social">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Share your top 25 movies directly to your favorite social networks
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                <Button onClick={handleShareTwitter} variant="outline" className="flex items-center justify-center gap-2">
                  <Twitter className="h-5 w-5" />
                  Twitter
                </Button>
                <Button onClick={handleShareFacebook} variant="outline" className="flex items-center justify-center gap-2">
                  <Facebook className="h-5 w-5" />
                  Facebook
                </Button>
                <Button onClick={handleShareLinkedIn} variant="outline" className="flex items-center justify-center gap-2">
                  <Linkedin className="h-5 w-5" />
                  LinkedIn
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Preview</p>
                <p className="mt-2 text-sm">My top 25 movies ranking:</p>
                <ul className="mt-1 text-sm">
                  {topMovies.slice(0, 3).map((movie, idx) => (
                    <li key={movie.id}>{idx + 1}. {movie.title}{movie.year ? ` (${movie.year})` : ''}</li>
                  ))}
                  <li className="text-muted-foreground">...</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareDialog;
