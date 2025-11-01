import { Role, type Mentor, type Student, type MentorshipRequest, type Session, type Attendance, type Feedback, type MotivationQuote, type AnyUser, type VideoSession } from '../types';

// --- MOCK DATABASE ---

const mentors: Mentor[] = [
  { id: 'mentor-1', name: 'Ankit Rao', email: 'ankit.rao@example.com', location: 'Bengaluru, India', skills: ['Web Design', 'Python', 'React'], bio: 'Helping students build digital skills through practical learning.', role: Role.MENTOR, photoUrl: `https://i.pravatar.cc/150?u=mentor-1` },
  { id: 'mentor-2', name: 'Sunita Sharma', email: 'sunita.sharma@example.com', location: 'Mumbai, India', skills: ['Data Science', 'Machine Learning'], bio: 'Passionate about data and mentoring the next generation of analysts.', role: Role.MENTOR, photoUrl: `https://i.pravatar.cc/150?u=mentor-2` },
];

const students: Student[] = [
  { id: 'student-1', name: 'Priya Mehta', email: 'priya.mehta@example.com', location: 'Bengaluru, India', interests: ['UI Design', 'Frontend Development'], bio: 'Eager to learn from experienced professionals and build a strong portfolio.', role: Role.STUDENT, photoUrl: `https://i.pravatar.cc/150?u=student-1` },
  { id: 'student-2', name: 'Rohan Verma', email: 'rohan.verma@example.com', location: 'Mumbai, India', interests: ['Data Science', 'Python'], bio: 'Aspiring data scientist looking for guidance on real-world projects.', role: Role.STUDENT, photoUrl: `https://i.pravatar.cc/150?u=student-2` },
];

let requests: MentorshipRequest[] = [
  { studentId: 'student-1', mentorId: 'mentor-2', status: 'pending' },
  { studentId: 'student-2', mentorId: 'mentor-1', status: 'accepted' },
];

let sessions: Session[] = [
  { id: 'session-1', mentorId: 'mentor-1', topic: 'Intro to React Hooks', date: '2024-08-15' },
  { id: 'session-2', mentorId: 'mentor-2', topic: 'Data Cleaning with Pandas', date: '2024-08-18' },
];

let videoSessions: VideoSession[] = [
    { id: 'video-1', mentorId: 'mentor-1', title: 'React State Management Masterclass', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', date: '2024-08-20' }
]

let attendance: Attendance[] = [
    { sessionId: 'session-1', studentId: 'student-2', status: 'present' },
];

let feedback: Feedback[] = [
    { mentorId: 'mentor-1', studentId: 'student-2', rating: 5, comment: 'Ankit is a fantastic mentor! His explanations are clear and he is very patient.', date: '2024-07-20'},
];

let quotes: MotivationQuote[] = [
  { id: 'quote-1', authorId: 'system', text: 'A mentor is someone who allows you to see the hope inside yourself.' },
  { id: 'quote-2', authorId: 'system', text: 'Every skill you acquire doubles your odds of success.' },
  { id: 'quote-3', authorId: 'system', text: 'The beautiful thing about learning is that no one can take it away from you.' },
  { id: 'quote-4', authorId: 'mentor-1', text: 'Keep coding, keep building. Every line you write makes you a better developer.' },
];

// --- API FUNCTIONS ---

export const db = {
  login: (email: string, password: string, role: Role): Promise<AnyUser> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const isMentor = role === Role.MENTOR;
        const correctPassword = isMentor ? 'university' : 'vignan';

        if (password !== correctPassword) {
          return reject(new Error('Invalid password for the selected role.'));
        }

        const userPool: AnyUser[] = isMentor ? mentors : students;
        let user = userPool.find(u => u.email === email);

        if (user) {
          return resolve(user);
        }

        // If user does not exist, create a new one for the demo
        if (isMentor) {
          const newMentor: Mentor = {
            id: `mentor-${Date.now()}`,
            name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            email,
            location: 'Online',
            skills: ['Newly Added Skill'],
            bio: 'A new mentor ready to inspire!',
            role: Role.MENTOR,
            photoUrl: `https://i.pravatar.cc/150?u=${email}`
          };
          mentors.push(newMentor);
          user = newMentor;
        } else { // It's a student
          const newStudent: Student = {
            id: `student-${Date.now()}`,
            name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            email,
            location: 'Online',
            interests: ['Eager to Learn'],
            bio: 'A new student on a learning journey!',
            role: Role.STUDENT,
            photoUrl: `https://i.pravatar.cc/150?u=${email}`
          };
          students.push(newStudent);
          user = newStudent;
        }

        return resolve(user);
      }, 500);
    });
  },

  getMentors: (): Mentor[] => mentors,
  getStudents: (): Student[] => students,
  getUserById: (id: string): AnyUser | undefined => [...mentors, ...students].find(u => u.id === id),

  getRequestsForMentor: (mentorId: string) => requests.filter(r => r.mentorId === mentorId),
  getRequestsForStudent: (studentId: string) => requests.filter(r => r.studentId === studentId),

  sendMentorshipRequest: (studentId: string, mentorId: string) => {
    const existing = requests.find(r => r.studentId === studentId && r.mentorId === mentorId);
    if (!existing) {
        requests.push({ studentId, mentorId, status: 'pending' });
        return requests[requests.length -1];
    }
    return existing;
  },
  
  updateRequestStatus: (studentId: string, mentorId: string, status: 'accepted' | 'rejected') => {
    const request = requests.find(r => r.studentId === studentId && r.mentorId === mentorId);
    if (request) {
      request.status = status;
    } else if (status === 'accepted') {
        // If request doesn't exist, create it (for demo purposes)
        requests.push({studentId, mentorId, status});
    }
    return request;
  },

  getAdmittedStudentsForMentor: (mentorId: string) => {
    const studentIds = requests.filter(r => r.mentorId === mentorId && r.status === 'accepted').map(r => r.studentId);
    return students.filter(s => studentIds.includes(s.id));
  },
  
  getSessionsForMentor: (mentorId: string) => sessions.filter(s => s.mentorId === mentorId),
  addSession: (mentorId: string, topic: string, date: string) => {
    const newSession: Session = { id: `session-${Date.now()}`, mentorId, topic, date };
    sessions.push(newSession);
    return newSession;
  },

  getVideosForMentor: (mentorId: string) => videoSessions.filter(v => v.mentorId === mentorId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  addVideoSession: (mentorId: string, title: string, videoUrl: string) => {
    const newVideo: VideoSession = { 
        id: `video-${Date.now()}`, 
        mentorId, 
        title, 
        videoUrl,
        date: new Date().toISOString().split('T')[0]
    };
    videoSessions.push(newVideo);
    return newVideo;
  },
  getVideosForStudent: (studentId: string) => {
    const myMentorIds = requests.filter(r => r.studentId === studentId && r.status === 'accepted').map(r => r.mentorId);
    return videoSessions.filter(v => myMentorIds.includes(v.mentorId)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  
  getAttendanceForSession: (sessionId: string) => attendance.filter(a => a.sessionId === sessionId),
  markAttendance: (sessionId: string, studentId: string, status: 'present' | 'absent') => {
    let record = attendance.find(a => a.sessionId === sessionId && a.studentId === studentId);
    if (record) {
      record.status = status;
    } else {
      attendance.push({ sessionId, studentId, status });
    }
  },
  
  getFeedbackForMentor: (mentorId: string) => feedback.filter(f => f.mentorId === mentorId),
  addFeedback: (studentId: string, mentorId: string, rating: number, comment: string) => {
    const newFeedback: Feedback = {
        studentId,
        mentorId,
        rating,
        comment,
        date: new Date().toISOString().split('T')[0]
    };
    feedback.push(newFeedback);
    return newFeedback;
  },
  
  getMotivationQuotes: () => quotes,
  addMotivationQuote: (authorId: string, text: string) => {
      const newQuote: MotivationQuote = { id: `quote-${Date.now()}`, authorId, text };
      quotes.push(newQuote);
      return newQuote;
  },
  calculateAverageRating: (mentorId: string): number => {
    const mentorFeedback = feedback.filter(f => f.mentorId === mentorId);
    if (mentorFeedback.length === 0) return 0;
    const total = mentorFeedback.reduce((acc, f) => acc + f.rating, 0);
    return parseFloat((total / mentorFeedback.length).toFixed(1));
  }
};