export interface ValidatedUser {
  id: number;
  username: string;
  email: string;
  age: number;
  bio: string;
  created_at: Date;
  updated_at: Date;
  isDeleted: boolean;
}
