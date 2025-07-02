import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Job, Worker, Status, Vehicle, Site } from '../types';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// MOCK DATA
const initialWorkers: Worker[] = [
  { id: 1, name: 'CARMINE' },
  { id: 2, name: 'MARIO' },
  { id: 3, name: 'FIORINO' },
  { id: 4, name: 'PALMIERI' },
  { id: 5, name: 'GIACCIO' },
  { id: 6, name: 'LUIGINO' },
  { id: 7, name: 'MICHELE' },
  { id: 8, name: 'EUGENIO' },
  { id: 9, name: 'KARIM' },
  { id: 10, name: 'IVAN' },
];

const initialVehicles: Vehicle[] = [
    { id: 1, name: 'Furgone Fiat' },
    { id: 2, name: 'Escavatore' },
    { id: 3, name: 'Furgone Renault' },
];

const initialSites: Site[] = [
    { id: 1, name: 'ITG BRIN PERDITA IMPIANTO IRRIGAZIONE' },
    { id: 2, name: 'VIA FILANGIERI 48' },
    { id: 3, name: 'BRANDI - SERVIZI VARI' },
    { id: 4, name: 'LAVORO VIA PETRARCA' },
];

const initialJobs: Job[] = [
  {
    id: 1,
    site: 'ITG BRIN PERDITA IMPIANTO IRRIGAZIONE',
    description: 'PORTARE TRANSENNE DEMOLITORE SECCHI NERI ECC... + FASCAI PER RIPARAZIONE',
    status: Status.Attivo,
    assignedTeam: [1, 2, 3],
    assignedVehicles: [1],
    date: getTodayDateString(),
  },
  {
    id: 2,
    site: 'VIA FILANGIERI 48',
    description: 'SMONTAGGIO PONTEGGIO',
    status: Status.Attivo,
    assignedTeam: [4, 5, 6],
    assignedVehicles: [2],
    date: getTodayDateString(),
  },
  {
    id: 3,
    site: 'BRANDI - SERVIZI VARI',
    description: 'VERIFICA IMPIANTO',
    status: Status.Attivo,
    assignedTeam: [7, 8],
    assignedVehicles: [],
    date: getTodayDateString(),
  },
  {
    id: 4,
    site: 'LAVORO VIA PETRARCA',
    description: 'PREPARAZIONE AREA',
    status: Status.Pianificato,
    assignedTeam: [9, 10],
    assignedVehicles: [],
    date: getTodayDateString(),
  },
];


// CONTEXT TYPE
interface AppContextType {
  workers: Worker[];
  vehicles: Vehicle[];
  sites: Site[];
  jobs: Job[];
  addWorker: (name: string) => void;
  deleteWorker: (id: number) => void;
  addVehicle: (name: string) => void;
  deleteVehicle: (id: number) => void;
  addSite: (name: string) => void;
  deleteSite: (id: number) => void;
  addJob: (job: Omit<Job, 'id' | 'status' | 'assignedTeam' | 'assignedVehicles'>) => void;
  deleteJob: (id: number) => void;
  updateJobAssignedTeam: (jobId: number, teamIds: number[]) => void;
  updateJobAssignedVehicles: (jobId: number, vehicleIds: number[]) => void;
  updateJobDescription: (jobId: number, description: string) => void;
  importWorkers: (newWorkers: Worker[]) => void;
  importVehicles: (newVehicles: Vehicle[]) => void;
  importSites: (newSites: Site[]) => void;
  importJobs: (newJobs: Job[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// PROVIDER COMPONENT
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const addWorker = (name: string) => {
    const trimmedName = name.trim().toUpperCase();
    if (!trimmedName) return;

    if (workers.some(w => w.name.toLowerCase() === trimmedName.toLowerCase())) {
        return; // Silently do nothing if it exists
    }
    const newWorker: Worker = { id: Date.now(), name: trimmedName };
    setWorkers(prev => [...prev, newWorker]);
  };

  const deleteWorker = (id: number) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    setJobs(prevJobs => prevJobs.map(job => ({
        ...job,
        assignedTeam: job.assignedTeam.filter(workerId => workerId !== id)
    })));
  };

  const addVehicle = (name: string) => {
    const newVehicle: Vehicle = { id: Date.now(), name };
    setVehicles(prev => [...prev, newVehicle]);
  }

  const deleteVehicle = (id: number) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    setJobs(prevJobs => prevJobs.map(job => ({
        ...job,
        assignedVehicles: job.assignedVehicles.filter(vehicleId => vehicleId !== id)
    })));
  }

  const addSite = (name: string) => {
      const trimmedName = name.trim().toUpperCase();
      if (!trimmedName) return;

      if (sites.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
          return; // Silently do nothing if it exists
      }
      const newSite: Site = { id: Date.now(), name: trimmedName };
      setSites(prev => [...prev, newSite]);
  }

  const deleteSite = (id: number) => {
      const siteToDelete = sites.find(s => s.id === id);
      if (jobs.some(j => j.site === siteToDelete?.name)) {
          alert("Impossibile eliminare il cantiere perchè è utilizzato nel giornale dei lavori. Rimuovere prima i lavori associati.");
          return;
      }
      setSites(prev => prev.filter(s => s.id !== id));
  }
  
  const addJob = (jobData: Omit<Job, 'id' | 'status' | 'assignedTeam' | 'assignedVehicles'>) => {
    const newJob: Job = {
        ...jobData,
        id: Date.now(),
        status: Status.Pianificato,
        assignedTeam: [],
        assignedVehicles: [],
    };
    setJobs(prev => [...prev, newJob]);
  };

  const deleteJob = (id: number) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const updateJobAssignedTeam = (jobId: number, teamIds: number[]) => {
    setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, assignedTeam: teamIds, status: (teamIds.length > 0 || job.assignedVehicles.length > 0) ? Status.Attivo : Status.Pianificato } : job
    ));
  };

  const updateJobAssignedVehicles = (jobId: number, vehicleIds: number[]) => {
    setJobs(prev => prev.map(job =>
        job.id === jobId ? { ...job, assignedVehicles: vehicleIds, status: (job.assignedTeam.length > 0 || vehicleIds.length > 0) ? Status.Attivo : Status.Pianificato } : job
    ));
  };

  const updateJobDescription = (jobId: number, description: string) => {
      setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, description } : job
      ));
  };

  const importWorkers = (newWorkers: Worker[]) => setWorkers(newWorkers);
  const importVehicles = (newVehicles: Vehicle[]) => setVehicles(newVehicles);
  const importSites = (newSites: Site[]) => setSites(newSites);
  const importJobs = (newJobs: Job[]) => setJobs(newJobs);

  const value = { 
    workers, vehicles, sites, jobs, 
    addWorker, deleteWorker, 
    addVehicle, deleteVehicle, 
    addSite, deleteSite,
    addJob, deleteJob, 
    updateJobAssignedTeam, updateJobAssignedVehicles,
    updateJobDescription,
    importWorkers, importVehicles, importSites, importJobs
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// CUSTOM HOOK
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};