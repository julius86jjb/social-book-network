import { User } from "../../auth/interfaces/user.interface";

export interface Post {
  id: string;
  userId: UserId;
  date: Date;
  likes: UserId[];
  comments: Comment[];
  message?: string;
  imageUrl?: string;

}


export interface Comment {
  id: string;
  user: UserId;
  message: string;
}


export type UserId = string;



