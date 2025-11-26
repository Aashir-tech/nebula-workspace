import React from 'react';

interface TimeBasedGreetingProps {
    userName: string;
}

const TimeBasedGreeting: React.FC<TimeBasedGreetingProps> = ({ userName }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) {
            return 'Good morning';
        } else if (hour >= 12 && hour < 17) {
            return 'Good afternoon';
        } else if (hour >= 17 && hour < 21) {
            return 'Good evening';
        } else {
            return 'Good night';
        }
    };

    const getGreetingEmoji = () => {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) {
            return '🌅';
        } else if (hour >= 12 && hour < 17) {
            return '☀️';
        } else if (hour >= 17 && hour < 21) {
            return '🌆';
        } else {
            return '🌙';
        }
    };

    return (
        <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {getGreeting()}, {userName} {getGreetingEmoji()}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
                Here's what you need to focus on today
            </p>
        </div>
    );
};

export default TimeBasedGreeting;
