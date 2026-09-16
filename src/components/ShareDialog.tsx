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

interface RankingPayload {
  version: number;
  rankings: Array<{ id: number; rank: number; title?: string }>;
  timestamp: number;
}

const normalizeTitle = (title: string) => title.trim().toLowerCase();

const ShareDialog: React.FC<ShareDialogProps> = ({ movies, onImportRankings }) => {
  const [token, setToken] = useState('');
  const [importToken, setImportToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const generateToken = () => {
    const rankingData: RankingPayload = {
      version: 2,
      rankings: movies.map((m) => ({ id: m.id, rank: m.rank, title: m.title })),
      timestamp: Date.now(),
    };
    setToken(btoa(unescape(encodeURIComponent(JSON.stringify(rankingData)))));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Ranking token copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy Failed', description: 'Failed to copy to clipboard.', variant: 'destructive' });
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
    toast({ title: 'Downloaded!', description: 'Ranking token saved to file.' });
  };

  const importRankings = () => {
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(importToken.trim())))) as RankingPayload;

      if (!decoded.rankings || !Array.isArray(decoded.rankings)) {
        throw new Error('Invalid token format');
      }

      const byId = new Map(decoded.rankings.map((r) => [r.id, r]));
      const byTitle = new Map(
        decoded.rankings
          .filter((r) => r.title)
          .map((r) => [normalizeTitle(r.title!), r])
      );

      const updatedMovies = movies.map((movie) => {
        const imported = byId.get(movie.id) || byTitle.get(normalizeTitle(movie.title));
        return imported ? { ...movie, rank: imported.rank } : movie;
      });

      updatedMovies.sort((a, b) => a.rank - b.rank);
      onImportRankings(updatedMovies);
      setIsOpen(false);
      setImportToken('');
      toast({ title: 'Rankings Imported!', description: 'Movie rankings have been updated.' });
    } catch {
      toast({
        title: 'Import Failed',
        description: 'Invalid token. Please check and try again.',
        variant: 'destructive',
      });
    }
  };

  React.useEffect(() => {
    if (isOpen) generateToken();
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
              <Button onClick={copyToClipboard} className="flex-1 gap-2" disabled={!token}>
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
              <Button onClick={downloadToken} variant="outline" className="flex-1 gap-2" disabled={!token}>
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tokens include title and rank so another list can match movies even if IDs differ.
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
            <Button onClick={importRankings} className="w-full gap-2" disabled={!importToken.trim()}>
              <Upload className="h-4 w-4" />
              Import Rankings
            </Button>
            <p className="text-xs text-muted-foreground">
              Movies are matched by ID first, then by title. Unmatched titles keep their current rank.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
