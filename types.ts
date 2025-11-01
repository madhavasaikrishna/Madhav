export enum Role {
  MENTOR = 'mentor',
  STUDENT = 'student',
}

export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  bio: string;
  role: Role;
  photoUrl: string;
}

export interface Mentor extends User {
  role: Role.MENTOR;
  skills: string[];
}

export interface Student extends User {
  role: Role.STUDENT;
  interests: string[];
}

export type AnyUser = Mentor | Student;

export interface MentorshipRequest {
  studentId: string;
  mentorId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Session {
  id: string;
  mentorId: string;
  topic: string;
  date: string; // YYYY-MM-DD
}

export interface VideoSession {
  id: string;
  mentorId: string;
  title: string;
  videoUrl: string;
  date: string; // YYYY-MM-DD
}

export interface Attendance {
  sessionId: string;
  studentId: string;
  status: 'present' | 'absent' | 'unmarked';
}

export interface Feedback {
  mentorId: string;
  studentId: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface MotivationQuote {
  id: string;
  authorId: string; // 'system' or mentorId
  text: string;
}
