import React from 'react';
import { StarIcon } from './Icons';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-md border border-neutral-200 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-neutral-700">{label}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  </div>
);

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-primary-light text-primary-dark shadow-sm' : 'text-neutral-700 hover:bg-neutral-200'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);


interface QuoteCardProps {
    quote: string;
    author: string;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, author }) => (
    <div className="bg-gradient-to-br from-primary to-blue-700 text-white p-6 rounded-xl shadow-lg">
        <blockquote className="text-lg italic">"{quote}"</blockquote>
        <cite className="block text-right mt-2 text-sm opacity-80">- {author}</cite>
    </div>
);


interface FeedbackCardProps {
    rating: number;
    comment: string;
    studentName: string;
    date: string;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ rating, comment, studentName, date }) => {
    const stars = Array.from({ length: 5 }, (_, i) => i < rating);
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
            <div className="flex justify-between items-center mb-2">
                <div className="flex">
                    {stars.map((isFilled, i) => (
                        <StarIcon key={i} className={`w-5 h-5 ${isFilled ? 'text-yellow-400' : 'text-neutral-300'}`} />
                    ))}
                </div>
                <span className="text-xs text-neutral-500">{new Date(date).toLocaleDateString()}</span>
            </div>
            <p className="text-neutral-800 text-sm mb-2">"{comment}"</p>
            <p className="text-right text-xs font-medium text-neutral-700">- {studentName}</p>
        </div>
    );
};
