export interface User {
  id: string;
  userName: string;
  email: string;
  password: string;
  avatar: string;
  followers: string[];
  following: string[];
  posts: string[];
  last_login?: Date;
}
