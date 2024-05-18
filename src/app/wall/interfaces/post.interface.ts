import { User } from "../../auth/interfaces/user.interface";

export interface Post {
  id: string;
  userId: string;
  date: Date;
  likes: string[];
  comments: Comment[];
  message?: string;
  imageUrl?: string;

}


export interface Comment {
  id: string;
  userId: string;
  message: string;
  likes: string[];
  date: Date;
}





