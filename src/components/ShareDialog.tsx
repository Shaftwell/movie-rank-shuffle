import React, { useState } from 'react';
import { Share2, Copy, Download, Upload, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Movie } from '@/types/movie';

interface ShareDialogProps {
  movies: Movie[];
  onImportRankings: (movies: Movie[]) => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ movies, onImportRankings }) => {
  const [token, setToken] = useState('');
  const [importToken, setImportToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const generateToken = () => {
    // Create a compact token with just the ranking order (movie IDs in order)
    const rankingData = {
      version: 1,
      rankings: movies.map(m => ({ id: m.id, rank: m.rank })),
      timestamp: Date.now()
    };
    const encodedToken = btoa(JSON.stringify(rankingData));
    setToken(encodedToken);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Ranking token copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadToken = () => {
    const blob = new Blob([token], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movie-rankings-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Ranking token saved to file.",
    });
  };

  const importRankings = () => {
    try {
      const decoded = JSON.parse(atob(importToken.trim()));

      if (!decoded.rankings || !Array.isArray(decoded.rankings)) {
        throw new Error('Invalid token format');
      }

      // Apply the imported rankings
      const updatedMovies = movies.map(movie => {
        const imported = decoded.rankings.find((r: any) => r.id === movie.id);
        return imported ? { ...movie, rank: imported.rank } : movie;
      });

      // Sort by rank
      updatedMovies.sort((a, b) => a.rank - b.rank);

      onImportRankings(updatedMovies);
      setIsOpen(false);
      setImportToken('');

      toast({
        title: "Rankings Imported!",
        description: "Movie rankings have been updated.",
      });
    } catch (err) {
      toast({
        title: "Import Failed",
        description: "Invalid token. Please check and try again.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      generateToken();
    }
  }, [isOpen, movies]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Rankings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Your Movie Rankings</DialogTitle>
          <DialogDescription>
            Generate a token to share your rankings with others, or import someone else's rankings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export Rankings</TabsTrigger>
            <TabsTrigger value="import">Import Rankings</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Ranking Token</label>
              <Textarea
                value={token}
                readOnly
                className="font-mono text-xs h-32 resize-none"
                placeholder="Token will appear here..."
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                className="flex-1 gap-2"
                disabled={!token}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Token
                  </>
                )}
              </Button>
              <Button
                onClick={downloadToken}
                variant="outline"
                className="flex-1 gap-2"
                disabled={!token}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Share this token with others to let them see your movie rankings. They can import it to match your order.
            </p>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paste Ranking Token</label>
              <Textarea
                value={importToken}
                onChange={(e) => setImportToken(e.target.value)}
                className="font-mono text-xs h-32"
                placeholder="Paste the ranking token here..."
              />
            </div>

            <Button
              onClick={importRankings}
              className="w-full gap-2"
              disabled={!importToken.trim()}
            >
              <Upload className="h-4 w-4" />
              Import Rankings
            </Button>

            <p className="text-xs text-muted-foreground">
              Paste a token from someone else to reorder your movies according to their rankings.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
