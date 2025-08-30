export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  password?: string;
  age: number;
  bio: string;
  created_at: Date;
  updated_at: Date;
  isDeleted: boolean;
}
