import React from 'react';
import MovieList from '@/components/MovieList';
import { Movie } from '@/types/movie';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

const movieTitles = [
  'Whiplash',
  'Out of Sight',
  'Back to the Future',
  'Interstellar',
  'The Social Network',
  'V for Vendetta',
  'RRR',
  'The Devils Advocate',
  'Rounders',
  'Limitless',
  'The Matrix',
  'Arrival',
  'There Will Be Blood',
  'Mr. Brooks',
  'Indiana Jones and the Last Crusade',
  "Ocean's Eleven",
  "Ferris Bueller's Day Off",
  "You Don't Mess With the Zohan",
  'Ghostbusters',
  'Office Space',
  'The Thomas Crown Affair (1999)',
  'Shawshank Redemption',
  'Unbreakable',
  'Jackie Brown',
  'The Count of Monte Cristo',
  'Parasite (기생충)',
  'Spirited Away',
  'The Big Short',
  'National Treasure',
  'Entrapment',
  'Jurassic Park',
  'The Illusionist',
  'Beverly Hills Cop',
  'Free Guy',
  'Unforgiven',
  'Catch Me If You Can',
  'Ex Machina',
  'The Usual Suspects',
  'Inception',
  'No Country For Old Men',
  "She's All That",
  'Scott Pilgrim vs The World',
  'The Green Mile',
  'MacGruber',
  'The Departed',
  'The Game',
  'Good Will Hunting',
  'Up (2009)',
  'Avengers: Endgame',
  'Gladiator',
  'Lucy',
  'The Wolf of Wall Street',
  'Magnolia',
  'The Karate Kid',
  'The Royal Tenenbaums',
  'The Shining',
  'The Lion King',
  'Vertigo',
  'Superbad',
  'Happy Gilmore',
  'The Prestige',
  'Minority Report',
  'Bloodsport (1988)',
  'Fight Club',
  'Anchorman',
  'The Sixth Sense',
  'Sin City',
  'Gone Girl',
  'The Notebook',
  'Match Point',
  'Inside Man',
  'The Grand Budapest Hotel',
  'Talladega Nights',
  'The Devil Wears Prada',
  'Notting Hill',
  'Rocky IV',
  'The Conjuring',
  'A Perfect Murder',
  'The Rainmaker',
  'Inside Out',
  'Deadpool 2',
  'Austin Powers: International Man of Mystery',
  'Sherlock Holmes (2009)',
  'Drag Me to Hell',
  'The Dark Knight',
  'Eyes Wide Shut',
  'Elf',
  'The Town',
  'The Saint',
  "There's Something About Mary",
  'Twister',
  'Up In the Air',
  'Troy',
  'The Great Gatsby',
  'Drive',
  'Super Troopers',
  'Shutter Island',
  'Top Gun',
  'Cast Away',
  'The Goonies',
];

const Index = () => {
  const initialMovies: Movie[] = movieTitles.map((title, index) => ({
    id: index + 1,
    title,
    rank: index + 1,
  }));

  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card py-8 border-b">
        <div className="container mx-auto px-4 max-w-7xl flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              The 100 Best Movies of my Life
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Curated rankings of cinematic masterpieces
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="rounded-full shadow-sm"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </header>

      <main>
        <MovieList initialMovies={initialMovies} />
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>Personal Movie Rankings Collection</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
