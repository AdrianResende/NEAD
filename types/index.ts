export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student" | "instructor";
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail?: string;
  duration: number;
  level: "beginner" | "intermediate" | "advanced";
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
