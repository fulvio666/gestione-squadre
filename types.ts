export enum Status {
  Attivo = 'Attivo',
  Pianificato = 'Pianificato',
}

export interface Worker {
  id: number;
  name: string;
}

export interface Vehicle {
  id: number;
  name: string;
}

export interface Site {
  id: number;
  name: string;
}

export interface Job {
  id: number;
  site: string; // The name of the site, linking to the Site interface
  description: string;
  status: Status;
  assignedTeam: number[]; 
  assignedVehicles: number[];
  date: string; // YYYY-MM-DD format
}