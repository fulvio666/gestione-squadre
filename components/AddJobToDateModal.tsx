import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface AddJobToDateModalProps {
  selectedDate: string;
  onClose: () => void;
}

export const AddJobToDateModal: React.FC<AddJobToDateModalProps> = ({ selectedDate, onClose }) => {
  const { sites, addSite, addJob } = useAppContext();
  const [newJob, setNewJob] = useState({
    site: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewJob(prev => ({ ...prev, [name]: value }));
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    const siteName = newJob.site.trim();
    const description = newJob.description.trim();

    if (siteName && description) {
      // Ensure the site exists in the master list (will be added if new)
      addSite(siteName);
      
      // Use the correctly cased name for the job
      const finalSiteName = siteName.toUpperCase();

      addJob({ 
        site: finalSiteName, 
        description,
        date: selectedDate 
      });
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-add-job"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 z-50"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleAddJob}>
          <div className="p-6">
            <h2 id="modal-title-add-job" className="text-xl font-bold text-slate-800">Aggiungi Lavoro</h2>
            <p className="text-sm text-slate-600 mt-1">
              Data: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="p-6 border-t border-b border-slate-200 space-y-4">
            <div>
              <label htmlFor="site-modal" className="block text-sm font-medium text-slate-600">Cantiere</label>
              <input 
                id="site-modal" 
                name="site" 
                type="text" 
                value={newJob.site} 
                onChange={handleInputChange} 
                required 
                className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm"
                list="sites-datalist"
                placeholder="Digita o seleziona un cantiere"
              />
              <datalist id="sites-datalist">
                {sites.map(site => <option key={site.id} value={site.name} />)}
              </datalist>
            </div>
            <div>
              <label htmlFor="description-modal" className="block text-sm font-medium text-slate-600">Descrizione (Lavorazione del giorno)</label>
              <input id="description-modal" name="description" type="text" value={newJob.description} onChange={handleInputChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
            </div>
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
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none"
            >
              Aggiungi Lavoro al Programma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};