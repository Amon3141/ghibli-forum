'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

import MovieCard from "@/components/features/MovieCard";
import InputField from '@/components/ui/InputField';
import GeneralButton from '@/components/ui/GeneralButton';

import { Movie } from '@/types/movie';
type MovieFormData = Omit<Movie, 'id' | 'threads'>;

export default function Movies() {
  const { user } = useAuth();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [fetchMoviesError, setFetchMoviesError] = useState<string | null>(null);

  const [newMovie, setNewMovie] = useState<MovieFormData>({
    title: '',
    director: '',
    releaseDate: ''
  });
  const [createMovieError, setCreateMovieError] = useState<string | null>(null);

  const fetchMovies = async () => {
    try {
      const response = await api.get<Movie[]>('/movies');
      setMovies(response.data);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error('Failed to fetch movies:', (err as any).response?.data?.error || err);
        setFetchMoviesError((err as any).response?.data?.error || '映画取得時にエラーが発生しました');
      } else {
        console.error('Failed to fetch movies:', err);
        setFetchMoviesError('映画取得時にエラーが発生しました');
      }
    }
  };

  const handleCreateMovie = async () => {
    try {
      const response = await api.post('/movies', newMovie);
      setMovies([...movies, response.data.movie]);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error('Failed to create movie:', (err as any).response?.data?.error || err);
        setCreateMovieError((err as any).response?.data?.error || '映画登録時にエラーが発生しました');
      } else {
        console.error('Failed to create movie:', err);
        setCreateMovieError('映画登録時にエラーが発生しました');
      }
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const initialMovies = [
  {
    title: "ナウシカ",
    director: "宮崎駿",
    releaseDate: "1984-03-11"
  },
  {
    title: "ラピュタ",
    director: "宮崎駿",
    releaseDate: "1986-08-02"
  },
  {
    title: "千と千尋の神隠し",
    director: "宮崎駿",
    releaseDate: "2001-07-20"
  },
  {
    title: "崖の上のポニョ",
    director: "宮崎駿",
    releaseDate: "2008-07-19"
  },
  {
    title: "風立ちぬ",
    director: "宮崎駿",
    releaseDate: "2013-07-20"
  },
  {
    title: "となりのトトロ",
    director: "宮崎駿",
    releaseDate: "1988-04-16"
  },
  {
    title: "もののけ姫",
    director: "宮崎駿",
    releaseDate: "1997-07-12"
  },
  {
    title: "ハウルの動く城",
    director: "宮崎駿",
    releaseDate: "2004-11-20"
  }
];

const initializeMovies = async () => {
  try {
    const newMovies = [];
    
    for (const movie of initialMovies) {
      const response = await api.post('/movies', movie);
      newMovies.push(response.data.movie);
    }
    
    setMovies([...movies, ...newMovies]);
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      console.error('Failed to initialize movies:', (err as any).response?.data?.error || err);
    } else {
      console.error('Failed to initialize movies:', err);
    }
  }
};

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold py-2">作品一覧</h2>
        {fetchMoviesError && (
          <div className="rounded-sm bg-red-100 p-4">
            <p className="text-textcolor/80">{fetchMoviesError}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {movies.map(movie => (
            <MovieCard key={movie.id} title={movie.title} movieId={movie.id} />
          ))}
        </div>
      </div>

      {user && user.isAdmin && (
        <>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold py-2">新規作成</h2>
            {createMovieError && (
              <div className="rounded-sm bg-red-100 p-4">
                <p className="text-textcolor/80">{createMovieError}</p>
              </div>
            )}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateMovie();
            }}>
              <div className="flex flex-col items-start w-1/2 space-y-3 mb-4">
                <InputField
                  value={newMovie.title}
                  onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                  placeholder="タイトル"
                />
                <InputField
                  value={newMovie.director}
                  onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
                  placeholder="監督"
                />
                <InputField
                  value={newMovie.releaseDate}
                  onChange={(e) => setNewMovie({ ...newMovie, releaseDate: e.target.value })}
                  placeholder="公開日 (yyyy-mm-dd)"
                />
                <input type="file" accept="image/*" className="[&::-webkit-file-upload-button]:border [&::-webkit-file-upload-button]:border-gray-300 [&::-webkit-file-upload-button]:rounded-sm [&::-webkit-file-upload-button]:p-2" />
              </div>
              <GeneralButton type="submit">作成</GeneralButton>
            </form>
          </div>
          <button onClick={initializeMovies}>初期化</button>
        </>
      )}
    </div>
  );
}