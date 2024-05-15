import { User } from "../../auth/interfaces/user.interface";

export interface Post {
  id: string;
  user: User;
  date: Date;
  likes: User[];
  comments: Comment[];
  message?: string;
  imageUrl?: string;

}


export interface Comment {
  id: string;
  user: User;
  message: string;
  likes: User[];
  date: Date;
}





