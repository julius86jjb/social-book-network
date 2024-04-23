export interface User {
  id: string;
  userName: string;
  email: string;
  password: string;
  avatar: string;
  last_login?: Date;
}
