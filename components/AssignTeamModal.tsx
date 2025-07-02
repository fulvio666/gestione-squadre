import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { PlusIcon } from './icons';

interface AssignmentModalProps {
  jobId: number;
  onClose: () => void;
}

type ModalTab = 'personale' | 'mezzi';

export const AssignmentModal: React.FC<AssignmentModalProps> = ({ jobId, onClose }) => {
  const { jobs, workers, vehicles, updateJobAssignedTeam, updateJobAssignedVehicles, addWorker } = useAppContext();
  const job = jobs.find(j => j.id === jobId);

  const [activeTab, setActiveTab] = useState<ModalTab>('personale');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<number[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  
  const [newWorkerName, setNewWorkerName] = useState('');
  const [lastAddedWorkerName, setLastAddedWorkerName] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setSelectedWorkerIds(job.assignedTeam);
      setSelectedVehicleIds(job.assignedVehicles);
    }
  }, [job]);

  useEffect(() => {
    if (lastAddedWorkerName) {
        const addedWorker = workers.find(w => w.name === lastAddedWorkerName);
        if (addedWorker && !selectedWorkerIds.includes(addedWorker.id)) {
            setSelectedWorkerIds(prev => [...prev, addedWorker.id]);
        }
        setLastAddedWorkerName(null);
    }
  }, [workers, lastAddedWorkerName, selectedWorkerIds]);

  if (!job) return null;

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newWorkerName.trim().toUpperCase();
    if (!trimmedName) return;
    
    const existingWorker = workers.find(w => w.name === trimmedName);
    if (existingWorker) {
      if (!selectedWorkerIds.includes(existingWorker.id)) {
        setSelectedWorkerIds(prev => [...prev, existingWorker.id]);
      }
    } else {
      addWorker(trimmedName);
      setLastAddedWorkerName(trimmedName);
    }
    
    setNewWorkerName('');
  };

  const getWorkerAssignmentInfo = (workerId: number): string | null => {
    if (!job.date) return null;
    const otherJob = jobs.find(j => 
      j.id !== jobId && 
      j.date === job.date && 
      j.assignedTeam.includes(workerId)
    );
    return otherJob ? `(già assegnato a: ${otherJob.site})` : null;
  };

  const handleWorkerToggle = (workerId: number) => {
    setSelectedWorkerIds(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleVehicleToggle = (vehicleId: number) => {
    setSelectedVehicleIds(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleSave = () => {
    updateJobAssignedTeam(jobId, selectedWorkerIds);
    updateJobAssignedVehicles(jobId, selectedVehicleIds);
    onClose();
  };

  const renderContent = () => {
    if (activeTab === 'personale') {
      return (
        <div>
          <fieldset>
            <legend className="sr-only">Operai disponibili</legend>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {workers.map(worker => {
                const assignmentInfo = getWorkerAssignmentInfo(worker.id);
                return (
                <div key={worker.id} className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={`worker-${worker.id}`}
                      name="workers"
                      type="checkbox"
                      checked={selectedWorkerIds.includes(worker.id)}
                      onChange={() => handleWorkerToggle(worker.id)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor={`worker-${worker.id}`} className="font-medium text-slate-700 cursor-pointer">
                      {worker.name}
                    </label>
                    {assignmentInfo && <span className="ml-2 text-xs text-orange-600 font-medium">{assignmentInfo}</span>}
                  </div>
                </div>
              )})}
            </div>
          </fieldset>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <form onSubmit={handleAddWorker} className="flex gap-2 items-center">
                <input
                    type="text"
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    placeholder="Aggiungi nuovo operaio..."
                    className="flex-grow p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button 
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex-shrink-0"
                    aria-label="Aggiungi Operaio"
                >
                    <PlusIcon className="w-5 h-5"/>
                </button>
            </form>
          </div>
        </div>
      );
    }
    if (activeTab === 'mezzi') {
      return (
        <fieldset>
          <legend className="sr-only">Mezzi disponibili</legend>
          <div className="space-y-3">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={`vehicle-${vehicle.id}`}
                    name="vehicles"
                    type="checkbox"
                    checked={selectedVehicleIds.includes(vehicle.id)}
                    onChange={() => handleVehicleToggle(vehicle.id)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={`vehicle-${vehicle.id}`} className="font-medium text-slate-700 cursor-pointer">
                    {vehicle.name}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      );
    }
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 z-50 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="modal-title" className="text-xl font-bold text-slate-800">Assegna Risorse</h2>
          <p className="text-sm text-slate-600 mt-1">Cantiere: {job.site}</p>
        </div>
        
        <div className="border-b border-slate-200 px-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button onClick={() => setActiveTab('personale')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'personale' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Personale</button>
                <button onClick={() => setActiveTab('mezzi')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'mezzi' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Mezzi</button>
            </nav>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>

        <div className="p-6 flex justify-end gap-3 bg-slate-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Salva Assegnazione
          </button>
        </div>
      </div>
    </div>
  );
};