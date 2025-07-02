
import React from 'react';
import { CalendarIcon } from './icons';

export const Header: React.FC = () => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: '2-digit', month: '2-digit', day: '2-digit' };
  const formattedDate = new Intl.DateTimeFormat('it-IT', options).format(today);
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-7 w-7 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">Gestione Squadre</h1>
              <p className="text-xs text-slate-500">Developed by Fulvio Narciso</p>
            </div>
          </div>
          <span className="text-sm text-slate-500">{capitalizedDate}</span>
        </div>
      </div>
    </header>
  );
};
