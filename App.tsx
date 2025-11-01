import React, { useState, useEffect } from 'react';
import { HomePage } from './components/ChatWindow';
import { LoginPage } from './components/ChatInputForm';
import { Role, type AnyUser, type Mentor, type Student, type MentorshipRequest, type Feedback, type Session, type VideoSession } from './types';
import { db } from './services/geminiService';
import { LogoIcon, LogoutIcon, UserIcon, StudentsIcon, RequestsIcon, TeachIcon, MotivateIcon, FeedbackIcon, StarIcon, SettingsIcon, VideoIcon } from './components/Icons';
import { StatCard, TabButton, QuoteCard, FeedbackCard } from './components/ChatMessage';


// --- FEEDBACK MODAL ---
const FeedbackModal: React.FC<{
    student: Student;
    mentors: Mentor[];
    onClose: () => void;
    onSubmit: (mentorId: string, rating: number, comment: string) => void;
}> = ({ student, mentors, onClose, onSubmit }) => {
    const [mentorId, setMentorId] = useState<string>(mentors[0]?.id || '');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!mentorId || rating === 0) {
            alert("Please select a mentor and provide a rating.");
            return;
        }
        onSubmit(mentorId, rating, comment);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-neutral-900 mb-4">Leave Feedback</h2>
                        
                        <div className="mb-4">
                            <label htmlFor="mentor" className="block text-sm font-medium text-neutral-700 mb-1">Select Mentor</label>
                            <select id="mentor" value={mentorId} onChange={e => setMentorId(e.target.value)} className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required>
                                {mentors.map(mentor => <option key={mentor.id} value={mentor.id}>{mentor.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Your Rating</label>
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        <StarIcon className={`w-8 h-8 cursor-pointer transition-colors ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-neutral-300'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-neutral-700 mb-1">Comment (optional)</label>
                            <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} rows={4} className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="What did you like or what could be improved?" />
                        </div>
                    </div>

                    <div className="bg-neutral-100 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-sm font-medium text-white border border-transparent rounded-md hover:bg-primary-dark">Submit Feedback</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- MENTOR PORTAL ---
const MentorPortal: React.FC<{ user: Mentor, onLogout: () => void }> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [students, setStudents] = useState<Student[]>([]);
    const [requests, setRequests] = useState<MentorshipRequest[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [videoSessions, setVideoSessions] = useState<VideoSession[]>([]);
    
    useEffect(() => {
        setStudents(db.getAdmittedStudentsForMentor(user.id));
        setRequests(db.getRequestsForMentor(user.id));
        setFeedback(db.getFeedbackForMentor(user.id));
        setSessions(db.getSessionsForMentor(user.id));
        setVideoSessions(db.getVideosForMentor(user.id));
    }, [user.id, activeTab]); // Re-fetch on tab change to get fresh data
    
    const handleRequest = (studentId: string, status: 'accepted' | 'rejected') => {
        db.updateRequestStatus(studentId, user.id, status);
        setRequests(db.getRequestsForMentor(user.id));
        if(status === 'accepted') {
            setStudents(db.getAdmittedStudentsForMentor(user.id));
        }
    };

    const tabs = {
        overview: <MentorOverview user={user} students={students} feedback={feedback} sessions={sessions} />,
        myStudents: <MyStudents students={students} />,
        requests: <MentorshipRequests requests={requests} onRequestAction={handleRequest} />,
        teach: <TeachAndAttendance sessions={sessions} students={students} mentorId={user.id} setSessions={setSessions} />,
        videoSessions: <VideoSessions mentorId={user.id} videoSessions={videoSessions} setVideoSessions={setVideoSessions} />,
        motivate: <MotivateStudents mentorId={user.id} />,
        feedback: <FeedbackAndRatings feedback={feedback} />,
        settings: <ProfileSettings user={user} />,
    };

    const tabItems = [
        { id: 'overview', label: 'Overview', icon: <UserIcon className="w-5 h-5" /> },
        { id: 'myStudents', label: 'My Students', icon: <StudentsIcon className="w-5 h-5" /> },
        { id: 'requests', label: 'Mentorship Requests', icon: <RequestsIcon className="w-5 h-5" /> },
        { id: 'teach', label: 'Teach & Attendance', icon: <TeachIcon className="w-5 h-5" /> },
        { id: 'videoSessions', label: 'Video Sessions', icon: <VideoIcon className="w-5 h-5" /> },
        { id: 'motivate', label: 'Motivate Students', icon: <MotivateIcon className="w-5 h-5" /> },
        { id: 'feedback', label: 'Feedback & Ratings', icon: <FeedbackIcon className="w-5 h-5" /> },
        { id: 'settings', label: 'Profile Settings', icon: <SettingsIcon className="w-5 h-5" /> },
    ];
    
    return (
        <div className="flex h-screen bg-neutral-100 font-sans">
            <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col p-4">
                <div className="flex items-center mb-8 px-2">
                    <LogoIcon className="h-8 w-8 text-primary" />
                    <h1 className="text-xl font-bold ml-2 text-neutral-900">Mentor Portal</h1>
                </div>
                <nav className="flex-1 space-y-2">
                    {tabItems.map(tab => (
                        <TabButton key={tab.id} icon={tab.icon} label={tab.label} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
                    ))}
                </nav>
                <div className="mt-auto">
                    <TabButton icon={<LogoutIcon className="w-5 h-5" />} label="Logout" isActive={false} onClick={onLogout} />
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {tabs[activeTab]}
                </div>
            </main>
        </div>
    );
};

const MentorOverview: React.FC<{user: Mentor, students: Student[], feedback: Feedback[], sessions: Session[]}> = ({ user, students, feedback, sessions }) => {
    const avgRating = db.calculateAverageRating(user.id);
    const quote = db.getMotivationQuotes()[0];
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Welcome back, {user.name.split(' ')[0]}!</h2>
            <p className="text-neutral-700 mb-8">Continue inspiring and guiding your students.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<StudentsIcon className="w-6 h-6 text-green-800" />} label="Total Students" value={students.length} color="bg-green-100" />
                <StatCard icon={<TeachIcon className="w-6 h-6 text-blue-800" />} label="Total Sessions" value={sessions.length} color="bg-blue-100" />
                <StatCard icon={<StarIcon className="w-6 h-6 text-yellow-800" />} label="Average Rating" value={avgRating} color="bg-yellow-100" />
                <StatCard icon={<RequestsIcon className="w-6 h-6 text-purple-800" />} label="Pending Requests" value={db.getRequestsForMentor(user.id).filter(r => r.status === 'pending').length} color="bg-purple-100" />
            </div>
            <QuoteCard quote={quote.text} author="NearBySkillz System" />
        </div>
    );
};

const MyStudents: React.FC<{students: Student[]}> = ({ students }) => (
    <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">My Admitted Students</h2>
        <div className="bg-white rounded-lg shadow-md border border-neutral-200">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-neutral-700">
                    <thead className="text-xs text-neutral-800 uppercase bg-neutral-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                            <th scope="col" className="px-6 py-3">Skill Focus</th>
                            <th scope="col" className="px-6 py-3">Location</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-neutral-900 whitespace-nowrap flex items-center">
                                    <img src={student.photoUrl} alt={student.name} className="w-8 h-8 rounded-full mr-3" />
                                    {student.name}
                                </td>
                                <td className="px-6 py-4">{student.interests.join(', ')}</td>
                                <td className="px-6 py-4">{student.location}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button className="font-medium text-primary hover:underline">Chat</button>
                                    <button className="font-medium text-red-600 hover:underline">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {students.length === 0 && <p className="p-6 text-center text-neutral-500">You have no admitted students yet.</p>}
        </div>
    </div>
);

const MentorshipRequests: React.FC<{requests: MentorshipRequest[], onRequestAction: (studentId: string, status: 'accepted' | 'rejected') => void}> = ({ requests, onRequestAction }) => {
    const pendingRequests = requests.filter(r => r.status === 'pending');
    return (
    <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Mentorship Requests</h2>
        <div className="space-y-4">
        {pendingRequests.map(req => {
            const student = db.getUserById(req.studentId) as Student;
            if(!student) return null;
            return (
            <div key={student.id} className="bg-white p-4 rounded-lg shadow-md border flex items-center justify-between">
                <div className="flex items-center">
                    <img src={student.photoUrl} alt={student.name} className="w-12 h-12 rounded-full mr-4" />
                    <div>
                        <p className="font-bold">{student.name}</p>
                        <p className="text-sm text-neutral-600">Wants to learn: {student.interests.join(', ')}</p>
                    </div>
                </div>
                <div className="space-x-3">
                    <button onClick={() => onRequestAction(student.id, 'accepted')} className="bg-green-500 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-green-600">Admit</button>
                    <button onClick={() => onRequestAction(student.id, 'rejected')} className="bg-red-500 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-red-600">Reject</button>
                </div>
            </div>
            )
        })}
        {pendingRequests.length === 0 && <p className="p-6 text-center text-neutral-500 bg-white rounded-lg shadow-md border">You have no pending mentorship requests.</p>}
        </div>
    </div>
)};

const TeachAndAttendance: React.FC<{sessions: Session[], students: Student[], mentorId: string, setSessions: (sessions: Session[]) => void}> = ({ sessions, students, mentorId, setSessions }) => {
    const [topic, setTopic] = useState('');
    const [date, setDate] = useState('');
    const [attendanceVersion, setAttendanceVersion] = useState(0);

    const handleAddSession = (e: React.FormEvent) => {
        e.preventDefault();
        if(!topic || !date) return;
        db.addSession(mentorId, topic, date);
        setSessions(db.getSessionsForMentor(mentorId));
        setTopic('');
        setDate('');
    }

    const handleMarkAttendance = (sessionId: string, studentId: string, status: 'present' | 'absent') => {
        db.markAttendance(sessionId, studentId, status);
        setAttendanceVersion(v => v + 1);
    };
    
    return (
        <div>
             <h2 className="text-2xl font-bold text-neutral-900 mb-6">Teach & Attendance</h2>
             <form onSubmit={handleAddSession} className="bg-white p-6 rounded-lg shadow-md border mb-8 flex items-end gap-4">
                 <div className="flex-1">
                     <label htmlFor="topic" className="block text-sm font-medium text-neutral-700">Session Topic</label>
                     <input type="text" id="topic" value={topic} onChange={e => setTopic(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                 </div>
                 <div className="flex-1">
                     <label htmlFor="date" className="block text-sm font-medium text-neutral-700">Date</label>
                     <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                 </div>
                 <button type="submit" className="bg-primary text-white px-6 py-2 rounded-md font-semibold hover:bg-primary-dark">Add Session</button>
             </form>
             <div className="space-y-6">
                {sessions.map(session => (
                    <div key={session.id} className="bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="font-bold text-lg text-neutral-800">{session.topic} - <span className="font-medium text-neutral-600">{new Date(session.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</span></h3>
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Student Attendance</h4>
                            {students.length > 0 ? (
                                <ul className="space-y-2">
                                    {students.map(student => {
                                        const attendanceRecord = db.getAttendanceForSession(session.id).find(a => a.studentId === student.id);
                                        const status = attendanceRecord ? attendanceRecord.status : 'unmarked';
                                        return (
                                            <li key={student.id} className="flex justify-between items-center p-2 bg-neutral-100 rounded-md">
                                                <div className="flex items-center gap-2">
                                                    <img src={student.photoUrl} alt={student.name} className="w-6 h-6 rounded-full" />
                                                    <span className="text-sm font-medium text-neutral-800">{student.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                                                        status === 'present' ? 'bg-green-100 text-green-800' : 
                                                        status === 'absent' ? 'bg-red-100 text-red-800' :
                                                        'bg-neutral-200 text-neutral-600'
                                                    }`}>{status}</span>
                                                    <button onClick={() => handleMarkAttendance(session.id, student.id, 'present')} className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded hover:bg-green-200 disabled:opacity-50" disabled={status === 'present'}>Present</button>
                                                    <button onClick={() => handleMarkAttendance(session.id, student.id, 'absent')} className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50" disabled={status === 'absent'}>Absent</button>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : <p className="text-sm text-neutral-500 text-center p-4">You have no admitted students to mark attendance for.</p>}
                        </div>
                    </div>
                ))}
                {sessions.length === 0 && <p className="p-6 text-center text-neutral-500 bg-white rounded-lg shadow-md border">You have not created any sessions yet.</p>}
             </div>
        </div>
    )
};

const VideoSessions: React.FC<{mentorId: string, videoSessions: VideoSession[], setVideoSessions: (videos: VideoSession[]) => void}> = ({ mentorId, videoSessions, setVideoSessions }) => {
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [message, setMessage] = useState('');

    const handleAddVideo = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !videoUrl) return;
        db.addVideoSession(mentorId, title, videoUrl);
        setVideoSessions(db.getVideosForMentor(mentorId));
        setTitle('');
        setVideoUrl('');
        setMessage('Video session added!');
        setTimeout(() => setMessage(''), 3000);
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Video Sessions</h2>
            <form onSubmit={handleAddVideo} className="bg-white p-6 rounded-lg shadow-md border mb-8 space-y-4">
                 <div>
                     <label htmlFor="video-title" className="block text-sm font-medium text-neutral-700">Video Title</label>
                     <input type="text" id="video-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Advanced React Patterns" className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                 </div>
                 <div>
                     <label htmlFor="video-url" className="block text-sm font-medium text-neutral-700">Video URL</label>
                     <input type="url" id="video-url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://example.com/video.mp4" className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                 </div>
                 <div className="flex items-center gap-4">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-md font-semibold hover:bg-primary-dark">Add Video</button>
                    {message && <p className="text-sm text-green-600">{message}</p>}
                 </div>
            </form>
            <div className="bg-white rounded-lg shadow-md border border-neutral-200">
                <table className="w-full text-sm text-left text-neutral-700">
                    <thead className="text-xs text-neutral-800 uppercase bg-neutral-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Video Title</th>
                            <th scope="col" className="px-6 py-3">Date Added</th>
                            <th scope="col" className="px-6 py-3">URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videoSessions.map(video => (
                            <tr key={video.id} className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-neutral-900">{video.title}</td>
                                <td className="px-6 py-4">{new Date(video.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                                <td className="px-6 py-4"><a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Link</a></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {videoSessions.length === 0 && <p className="p-6 text-center text-neutral-500">You have not added any video sessions yet.</p>}
            </div>
        </div>
    )
}

const MotivateStudents: React.FC<{mentorId: string}> = ({ mentorId }) => {
    const [quote, setQuote] = useState('');
    const [message, setMessage] = useState('');
    const handleAddQuote = (e: React.FormEvent) => {
        e.preventDefault();
        db.addMotivationQuote(mentorId, quote);
        setQuote('');
        setMessage('Quote posted successfully!');
        setTimeout(() => setMessage(''), 3000);
    }
    return (
        <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Motivate Your Students</h2>
            <form onSubmit={handleAddQuote} className="bg-white p-6 rounded-lg shadow-md border">
                <label htmlFor="quote" className="block text-sm font-medium text-neutral-700">Post a motivational quote or message</label>
                <textarea id="quote" value={quote} onChange={e => setQuote(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="The best way to predict the future is to create it." required />
                <button type="submit" className="mt-4 bg-primary text-white px-6 py-2 rounded-md font-semibold hover:bg-primary-dark">Post Message</button>
                {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
            </form>
        </div>
    );
};

const FeedbackAndRatings: React.FC<{feedback: Feedback[]}> = ({ feedback }) => (
    <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Feedback & Ratings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedback.map((f, i) => {
                const student = db.getUserById(f.studentId) as Student;
                if (!student) return null;
                return <FeedbackCard key={i} rating={f.rating} comment={f.comment} studentName={student.name} date={f.date} />
            })}
             {feedback.length === 0 && <p className="p-6 text-center text-neutral-500 col-span-full">You have not received any feedback yet.</p>}
        </div>
    </div>
);

const ProfileSettings: React.FC<{ user: Mentor }> = ({ user }) => {
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio);
    const [skills, setSkills] = useState(user.skills.join(', '));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Profile updated successfully! (Demo)');
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Profile Settings</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Full Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                </div>
                 <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-neutral-700">Skills (comma-separated)</label>
                    <input type="text" id="skills" value={skills} onChange={e => setSkills(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-neutral-700">Bio</label>
                    <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                </div>
                <div className="pt-2">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-md font-semibold hover:bg-primary-dark">Save Changes</button>
                </div>
            </form>
        </div>
    );
};


// --- STUDENT PORTAL ---
const VideoPlayerModal: React.FC<{ video: VideoSession, onClose: () => void }> = ({ video, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h3 className="text-lg font-bold text-neutral-900">{video.title}</h3>
                </div>
                <div className="p-4">
                    <video src={video.videoUrl} controls autoPlay className="w-full rounded-md" />
                </div>
                 <div className="bg-neutral-100 px-4 py-3 flex justify-end rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-primary text-sm font-medium text-white border border-transparent rounded-md hover:bg-primary-dark">Close</button>
                </div>
            </div>
        </div>
    )
}

const MyAttendance: React.FC<{user: Student, myMentors: Mentor[]}> = ({user, myMentors}) => {
    const mentorIds = myMentors.map(m => m.id);
    const sessions = mentorIds.flatMap(id => db.getSessionsForMentor(id)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (sessions.length === 0) {
        return <p className="text-sm text-neutral-600 text-center py-4">Your mentors haven't scheduled any sessions yet.</p>
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-neutral-700">
                <thead className="text-xs text-neutral-800 uppercase bg-neutral-100">
                    <tr>
                        <th scope="col" className="px-6 py-3">Session Topic</th>
                        <th scope="col" className="px-6 py-3">Mentor</th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {sessions.map(session => {
                        const attendanceRecord = db.getAttendanceForSession(session.id).find(a => a.studentId === user.id);
                        const status = attendanceRecord ? attendanceRecord.status : 'unmarked';
                        const mentor = db.getUserById(session.mentorId);

                        return (
                            <tr key={session.id} className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-neutral-900">{session.topic}</td>
                                <td className="px-6 py-4">{mentor?.name}</td>
                                <td className="px-6 py-4">{new Date(session.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                                        status === 'present' ? 'bg-green-100 text-green-800' : 
                                        status === 'absent' ? 'bg-red-100 text-red-800' :
                                        'bg-neutral-200 text-neutral-600'
                                    }`}>{status}</span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

const MyMentorshipRequests: React.FC<{user: Student}> = ({user}) => {
    const myRequests = db.getRequestsForStudent(user.id);
    if(myRequests.length === 0) {
        return <p className="text-sm text-neutral-600 text-center py-4">You haven't sent any mentorship requests yet.</p>
    }
    return (
        <ul className="space-y-3">
            {myRequests.map(req => {
                const mentor = db.getUserById(req.mentorId) as Mentor;
                const status = req.status;
                return (
                    <li key={mentor.id} className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg">
                        <div className="flex items-center">
                            <img src={mentor.photoUrl} alt={mentor.name} className="w-10 h-10 rounded-full mr-3" />
                            <div>
                                <p className="font-bold text-neutral-800">{mentor.name}</p>
                                <p className="text-sm text-neutral-600">{mentor.skills.join(', ')}</p>
                            </div>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
                            status === 'accepted' ? 'bg-green-100 text-green-800' : 
                            status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>{status}</span>
                    </li>
                )
            })}
        </ul>
    )
}

const BrowseMentors: React.FC<{user: Student, myMentors: Mentor[]}> = ({ user, myMentors }) => {
    const [requestSent, setRequestSent] = useState<string[]>([]);
    const allMentors = db.getMentors();
    const myMentorIds = myMentors.map(m => m.id);
    const myRequestMentorIds = db.getRequestsForStudent(user.id).map(r => r.mentorId);

    const availableMentors = allMentors.filter(m => !myMentorIds.includes(m.id));

    const handleSendRequest = (mentorId: string) => {
        db.sendMentorshipRequest(user.id, mentorId);
        setRequestSent(prev => [...prev, mentorId]);
    }
    
    if (availableMentors.length === 0) {
        return <p className="text-sm text-neutral-600 text-center py-4">No new mentors available to request at this time.</p>
    }

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {availableMentors.map(mentor => {
                const hasSentRequest = myRequestMentorIds.includes(mentor.id) || requestSent.includes(mentor.id);
                return (
                     <div key={mentor.id} className="bg-neutral-100 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <img src={mentor.photoUrl} alt={mentor.name} className="w-10 h-10 rounded-full mr-3" />
                            <div>
                                <p className="font-bold text-neutral-800">{mentor.name}</p>
                                <p className="text-sm text-neutral-600">{mentor.skills.join(', ')}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleSendRequest(mentor.id)}
                            disabled={hasSentRequest}
                            className="bg-primary text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-primary-dark disabled:bg-neutral-300 disabled:cursor-not-allowed">
                            {hasSentRequest ? 'Request Sent' : 'Send Request'}
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

const MyVideoLessons: React.FC<{user: Student, onWatchVideo: (video: VideoSession) => void}> = ({ user, onWatchVideo }) => {
    const videos = db.getVideosForStudent(user.id);

    if (videos.length === 0) {
        return <p className="text-sm text-neutral-600 text-center py-4">Your mentors haven't posted any video lessons yet.</p>;
    }

    return (
        <div className="space-y-3">
            {videos.map(video => {
                const mentor = db.getUserById(video.mentorId) as Mentor;
                return (
                    <div key={video.id} className="bg-neutral-100 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <VideoIcon className="w-10 h-10 text-primary mr-3" />
                            <div>
                                <p className="font-bold text-neutral-800">{video.title}</p>
                                <p className="text-sm text-neutral-600">by {mentor.name}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => onWatchVideo(video)}
                            className="bg-primary text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-primary-dark">
                            Watch Now
                        </button>
                    </div>
                )
            })}
        </div>
    )
}


const StudentPortal: React.FC<{ user: Student, onLogout: () => void }> = ({ user, onLogout }) => {
    const quotes = db.getMotivationQuotes().filter(q => q.authorId === 'system').slice(1,3);
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [watchingVideo, setWatchingVideo] = useState<VideoSession | null>(null);

    const myMentors = db.getMentors().filter(m => db.getAdmittedStudentsForMentor(m.id).some(s => s.id === user.id));

    const handleFeedbackSubmit = (mentorId: string, rating: number, comment: string) => {
        db.addFeedback(user.id, mentorId, rating, comment);
        setFeedbackModalOpen(false);
        setFeedbackMessage('Thank you for your feedback!');
        setTimeout(() => setFeedbackMessage(''), 3000);
    }
    
    return (
        <div className="min-h-screen bg-neutral-100 font-sans p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                     <div>
                        <h1 className="text-3xl font-bold text-neutral-900">Welcome, {user.name.split(' ')[0]}!</h1>
                        <p className="text-neutral-700">Continue your learning journey.</p>
                     </div>
                     <button onClick={onLogout} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border text-sm font-medium text-neutral-700 hover:bg-neutral-200">
                         <LogoutIcon className="w-5 h-5"/>
                         <span>Logout</span>
                    </button>
                </header>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        {/* MY MENTORS */}
                        <div className="bg-white p-6 rounded-xl shadow-md border">
                            <h2 className="text-xl font-bold text-neutral-900 mb-4">My Mentors</h2>
                            {myMentors.length > 0 ? (
                                <ul className="space-y-4">
                                    {myMentors.map(mentor => (
                                        <li key={mentor.id} className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg">
                                            <div className="flex items-center">
                                                <img src={mentor.photoUrl} alt={mentor.name} className="w-10 h-10 rounded-full mr-3" />
                                                <div>
                                                    <p className="font-bold text-neutral-800">{mentor.name}</p>
                                                    <p className="text-sm text-neutral-600">{mentor.skills.join(', ')}</p>
                                                </div>
                                            </div>
                                            <button className="font-medium text-sm text-primary hover:underline">Chat</button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-neutral-600 text-center py-4">You are not currently learning from any mentors. Find one below!</p>
                            )}
                        </div>
                        {/* MY VIDEO LESSONS */}
                         <div className="bg-white p-6 rounded-xl shadow-md border">
                            <h2 className="text-xl font-bold text-neutral-900 mb-4">My Video Lessons</h2>
                             <MyVideoLessons user={user} onWatchVideo={setWatchingVideo} />
                        </div>
                        {/* BROWSE MENTORS */}
                        <div className="bg-white p-6 rounded-xl shadow-md border">
                            <h2 className="text-xl font-bold text-neutral-900 mb-4">Browse & Request Mentors</h2>
                             <BrowseMentors user={user} myMentors={myMentors} />
                        </div>
                         {/* MY ATTENDANCE */}
                         <div className="bg-white p-6 rounded-xl shadow-md border">
                            <h2 className="text-xl font-bold text-neutral-900 mb-4">My Attendance</h2>
                             <MyAttendance user={user} myMentors={myMentors} />
                        </div>
                         {/* MY REQUESTS */}
                         <div className="bg-white p-6 rounded-xl shadow-md border">
                            <h2 className="text-xl font-bold text-neutral-900 mb-4">My Mentorship Requests</h2>
                             <MyMentorshipRequests user={user} />
                        </div>
                    </div>
                    <div className="space-y-8">
                       <div className="bg-white p-6 rounded-xl shadow-md border">
                             <h2 className="text-xl font-bold text-neutral-900 mb-4">Motivation Zone</h2>
                             <div className="space-y-4">
                                {quotes.map(q => <QuoteCard key={q.id} quote={q.text} author="NearBySkillz System" />)}
                             </div>
                       </div>
                       <div className="bg-white p-6 rounded-xl shadow-md border">
                            <h2 className="text-xl font-bold text-neutral-900 mb-4">Finished a session?</h2>
                            <button 
                                onClick={() => setFeedbackModalOpen(true)} 
                                disabled={myMentors.length === 0}
                                className="w-full bg-secondary text-neutral-900 px-4 py-2 rounded-md font-semibold hover:bg-yellow-400 disabled:bg-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-500">
                                Leave Feedback
                            </button>
                            {myMentors.length === 0 && <p className="text-xs text-neutral-500 mt-2 text-center">You need to be admitted by a mentor to leave feedback.</p>}
                            {feedbackMessage && <p className="text-sm text-green-600 mt-2 text-center">{feedbackMessage}</p>}
                       </div>
                    </div>
                </div>
            </div>
            {isFeedbackModalOpen && (
                <FeedbackModal 
                    student={user} 
                    mentors={myMentors}
                    onClose={() => setFeedbackModalOpen(false)} 
                    onSubmit={handleFeedbackSubmit}
                />
            )}
            {watchingVideo && (
                <VideoPlayerModal
                    video={watchingVideo}
                    onClose={() => setWatchingVideo(null)}
                />
            )}
        </div>
    );
};


// --- APP ---
export default function App() {
  const [view, setView] = useState<'home' | 'login' | 'mentor_portal' | 'student_portal'>('home');
  const [currentUser, setCurrentUser] = useState<AnyUser | null>(null);

  const handleLogin = async (email: string, password: string, role: Role) => {
    const user = await db.login(email, password, role);
    setCurrentUser(user);
    setView(user.role === Role.MENTOR ? 'mentor_portal' : 'student_portal');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
  };

  const renderView = () => {
    switch (view) {
      case 'login':
        return <LoginPage onLogin={handleLogin} setView={setView} />;
      case 'mentor_portal':
        return <MentorPortal user={currentUser as Mentor} onLogout={handleLogout} />;
       case 'student_portal':
        return <StudentPortal user={currentUser as Student} onLogout={handleLogout} />;
      case 'home':
      default:
        return <HomePage setView={setView} />;
    }
  };

  return <div className="antialiased">{renderView()}</div>;
}
