import React, { useState } from 'react';
import { Role } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface LoginPageProps {
  onLogin: (email: string, password: string, role: Role) => Promise<void>;
  setView: (view: 'home') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onLogin(email, password, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-center text-neutral-900 mb-2">Login to your Portal</h2>
            <p className="text-center text-neutral-700 mb-8">Select your role and enter your demo credentials.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">I am a...</label>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setRole(Role.STUDENT)} className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${role === Role.STUDENT ? 'bg-primary text-white shadow-sm' : 'bg-neutral-200 text-neutral-800'}`}>
                            Student
                        </button>
                        <button type="button" onClick={() => setRole(Role.MENTOR)} className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${role === Role.MENTOR ? 'bg-primary text-white shadow-sm' : 'bg-neutral-200 text-neutral-800'}`}>
                            Mentor
                        </button>
                    </div>
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition duration-150"
                        placeholder={role === Role.MENTOR ? "ankit.rao@example.com" : "priya.mehta@example.com"}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition duration-150"
                        placeholder={role === Role.MENTOR ? "Enter 'university'" : "Enter 'vignan'"}
                        required
                    />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                <div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors duration-200">
                        {isLoading ? <LoadingSpinner /> : 'Log In'}
                    </button>
                </div>
            </form>
            <p className="text-center text-sm text-neutral-700 mt-6">
                Don't have an account? <button onClick={() => setView('home')} className="font-medium text-primary hover:underline">Go back</button>
            </p>
        </div>
    </div>
  );
};