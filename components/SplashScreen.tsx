import React from 'react';
import { UsersIcon } from './icons';

interface SplashScreenProps {
  isFadingOut: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isFadingOut }) => {
  return (
    <div 
      className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800
        transition-opacity duration-1000 ease-in-out
        ${isFadingOut ? 'opacity-0' : 'opacity-100'}
      `}
      aria-hidden={isFadingOut}
    >
      <div className="text-center animate-fade-in-up">
        <div className="animate-pulse-subtle">
            <UsersIcon className="h-16 w-16 mx-auto text-blue-400 mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-white uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Gestione Squadre
            </h1>
            <p className="mt-4 text-md md:text-lg text-slate-300 tracking-wider">
            by Fulvio Narciso
            </p>
        </div>
      </div>
    </div>
  );
};
