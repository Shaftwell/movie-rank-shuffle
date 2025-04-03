
import React from 'react';
import MovieList from '@/components/MovieList';
import { Movie } from '@/types/movie';

const movieTitles = [
  "Out of Sight",
  "Back to the Future",
  "The Social Network",
  "V for Vendetta",
  "The Devils Advocate",
  "Rounders",
  "Limitless",
  "The Matrix",
  "Arrival",
  "There Will Be Blood",
  "RRR",
  "Mr. Brooks",
  "Indiana Jones and the Last Crusade",
  "Ocean's 11",
  "Ferris Bueller's Day Off",
  "You Don't Mess With the Zohan",
  "Ghostbusters",
  "Office Space",
  "The Thomas Crown Affair",
  "Whiplash",
  "Shawshank Redemption",
  "Unbreakable",
  "Jackie Brown",
  "Interstellar",
  "The Count of Monte Cristo",
  "Parasite",
  "Spirited Away",
  "The Big Short",
  "National Treasure",
  "Entrapment",
  "Jurassic Park",
  "The Illusionist",
  "Beverly Hills Cop",
  "Free Guy",
  "Unforgiven",
  "Catch Me If You Can",
  "Ex Machina",
  "The Usual Suspects",
  "Inception",
  "No Country For Old Men",
  "She's All That",
  "Scott Pilgrim vs The World",
  "The Green Mile",
  "MacGruber",
  "The Departed",
  "The Game",
  "Good Will Hunting",
  "Up",
  "Avengers: Endgame",
  "Gladiator",
  "Lucy",
  "The Wolf of Wall Street",
  "Magnolia",
  "The Karate Kid",
  "The Royal Tenenbaums",
  "The Shining",
  "The Lion King",
  "Vertigo",
  "Superbad",
  "Happy Gilmore",
  "The Prestige",
  "Minority Report",
  "Bloodsport",
  "Fight Club",
  "Anchorman",
  "The Sixth Sense",
  "Sin City",
  "Gone Girl",
  "The Notebook",
  "Match Point",
  "Inside Man",
  "The Grand Budapest Hotel",
  "Talladega Nights",
  "The Devil Wears Prada",
  "Notting Hill",
  "Rocky IV",
  "The Conjuring",
  "A Perfect Murder",
  "The Rainmaker",
  "Inside Out",
  "Deadpool 2",
  "Austin Powers: Int'l Man of Mystery",
  "Sherlock Holmes",
  "Drag Me to Hell",
  "The Dark Knight",
  "Eyes Wide Shut",
  "Elf",
  "The Town",
  "The Saint",
  "There's Something About Mary",
  "Twister",
  "Up In the Air",
  "Troy",
  "The Great Gatsby",
  "Drive",
  "Super Troopers",
  "Shutter Island",
  "Top Gun",
  "Castaway",
  "The Goonies"
];

const Index = () => {
  // Create movie data from the provided titles
  const initialMovies: Movie[] = movieTitles.map((title, index) => ({
    id: index + 1,
    title,
    rank: index + 1
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card py-6 border-b">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-primary">
            Movie Rank Shuffle
          </h1>
        </div>
      </header>
      
      <main>
        <MovieList initialMovies={initialMovies} />
      </main>
      
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>My Top 100 Movies Ranking Application</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
