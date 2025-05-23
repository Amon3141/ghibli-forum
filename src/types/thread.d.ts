import { Movie } from "./movie";
import { User } from "./user";
import { Comment } from "./comment";

export interface Thread {
  id: number;
  title: string;
  createdAt: string;
  updatedAt?: string;
  description: string;
  likes: number;
  movieId: number;
  movie?: Movie;
  creatorId: number;
  creator?: User;
  comments?: Comment[];
};