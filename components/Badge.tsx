import React from 'react';
import { Status } from '../types';

interface BadgeProps {
  children: React.ReactNode;
  status?: Status;
  type?: 'worker' | 'vehicle';
}

export const Badge: React.FC<BadgeProps> = ({ children, status, type }) => {
  const baseClasses = 'inline-block px-3 py-1 text-xs font-semibold rounded-full';

  const colorClasses = {
    status: {
      [Status.Attivo]: 'bg-blue-100 text-blue-800',
      [Status.Pianificato]: 'bg-purple-100 text-purple-800',
    },
    worker: 'bg-slate-200 text-slate-800',
    vehicle: 'bg-cyan-100 text-cyan-800',
  };

  let specificClasses = '';
  if (status) {
    specificClasses = colorClasses.status[status];
  } else if (type === 'worker') {
    specificClasses = colorClasses.worker;
  } else if (type === 'vehicle') {
    specificClasses = colorClasses.vehicle;
  }

  return (
    <span className={`${baseClasses} ${specificClasses}`}>
      {children}
    </span>
  );
};