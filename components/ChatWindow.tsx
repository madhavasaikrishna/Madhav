import React from 'react';
import { LogoIcon } from './Icons';
import { db } from '../services/geminiService';

interface HomePageProps {
  setView: (view: 'login') => void;
}

const Navbar: React.FC<{ setView: (view: 'login') => void; }> = ({ setView }) => (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex-shrink-0 flex items-center">
                    <LogoIcon className="h-8 w-8 text-primary" />
                    <span className="ml-2 text-2xl font-bold text-neutral-900">NearBySkillz</span>
                </div>
                <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                        {['Home', 'Mentors', 'Feedback', 'Contact'].map((item) => (
                             <a href="#" key={item} className="text-neutral-700 hover:bg-primary-light hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium transition-colors">{item}</a>
                        ))}
                    </div>
                </div>
                 <div className="flex items-center">
                    <button onClick={() => setView('login')} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-transform hover:scale-105">
                        Login / Sign Up
                    </button>
                </div>
            </div>
        </div>
    </nav>
);

const MentorCard: React.FC<{ mentor: { name: string, skills: string[], bio: string, photoUrl: string } }> = ({ mentor }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
        <div className="flex items-center mb-4">
            <img src={mentor.photoUrl} alt={mentor.name} className="w-16 h-16 rounded-full mr-4 border-2 border-primary-light" />
            <div>
                <h3 className="text-lg font-bold text-neutral-900">{mentor.name}</h3>
                <p className="text-sm text-secondary font-semibold">{mentor.skills.join(', ')}</p>
            </div>
        </div>
        <p className="text-neutral-700 text-sm">"{mentor.bio}"</p>
    </div>
);

export const HomePage: React.FC<HomePageProps> = ({ setView }) => {
  const mentors = db.getMentors();

  return (
    <div className="bg-neutral-100 font-sans">
      <Navbar setView={setView} />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 text-center bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-extrabold text-neutral-900 leading-tight">
              Learn Skills That Matter — From <span className="text-primary">Real People Near You.</span>
            </h1>
            <p className="mt-6 text-lg text-neutral-700 max-w-2xl mx-auto">
              NearBySkillz connects mentors and learners for real-world skill growth. Monetize your knowledge or gain hands-on, job-ready experience today.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <button onClick={() => setView('login')} className="bg-primary text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Find a Mentor
              </button>
              <button onClick={() => setView('login')} className="bg-secondary text-neutral-900 px-8 py-3 rounded-full text-lg font-semibold hover:bg-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Join as Mentor
              </button>
            </div>
          </div>
        </section>

        {/* Mentors Section */}
        <section className="py-20 bg-primary-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">Meet Some of Our Top Mentors</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {mentors.map(mentor => <MentorCard key={mentor.id} mentor={mentor} />)}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-neutral-700">
             <p>&copy; {new Date().getFullYear()} NearBySkillz. Find your skill, find your future.</p>
          </div>
      </footer>
    </div>
  );
};
