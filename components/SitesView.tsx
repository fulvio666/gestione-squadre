import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { TrashIcon, FileUpIcon, FileDownIcon } from './icons';
import { Site } from '../types';

declare var XLSX: any;

export const SitesView: React.FC = () => {
  const { sites, addSite, deleteSite, importSites } = useAppContext();
  const [newSiteName, setNewSiteName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSiteName.trim()) {
      addSite(newSiteName.trim());
      setNewSiteName('');
    }
  };
  
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(sites);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cantieri");
    XLSX.writeFile(workbook, "database_cantieri.xlsx");
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false }) as any[][];

        if (rows.length < 2) {
            throw new Error("Il file è vuoto o contiene solo l'intestazione.");
        }

        const headers = rows[0].map(h => String(h || '').toLowerCase().trim());
        const idIndex = headers.indexOf('id');
        const nameIndex = headers.indexOf('name');

        if (idIndex === -1 || nameIndex === -1) {
            throw new Error("L'intestazione del file Excel deve contenere le colonne 'id' e 'name'.");
        }

        const newSites: Site[] = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 1;

            if (!row || row.length === 0) continue;

            const id = parseInt(row[idIndex], 10);
            const name = row[nameIndex];

            if (isNaN(id)) {
                throw new Error(`Riga ${rowNum}: La colonna 'id' (${row[idIndex]}) non è un numero valido.`);
            }
            if (!name || String(name).trim() === '') {
                 throw new Error(`Riga ${rowNum}: La colonna 'name' non può essere vuota.`);
            }

            newSites.push({
                id: id,
                name: String(name),
            });
        }
        
        if (newSites.length > 0 && window.confirm(`Sei sicuro di voler sovrascrivere i cantieri esistenti con i ${newSites.length} record dal file? Questa azione è irreversibile.`)) {
          importSites(newSites);
          alert(`Dati importati con successo! Aggiunti/aggiornati ${newSites.length} cantieri.`);
        } else if (newSites.length === 0) {
            alert("Nessun dato valido da importare trovato nel file.");
        }
      } catch (error: any) {
        console.error("Errore durante l'importazione del file:", error);
        alert(`Errore di importazione: ${error.message}`);
      } finally {
        if(event.target) {
            event.target.value = '';
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
          <h3 className="text-lg font-bold text-slate-700 mb-4">Aggiungi Cantiere</h3>
          <form onSubmit={handleAddSite} className="mb-6">
            <label htmlFor="site-name" className="block text-sm font-medium text-slate-600">Nome Cantiere</label>
            <input
              id="site-name"
              type="text"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              placeholder="Es. CANTIERE VIA ROMA"
              className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Aggiungi Cantiere
            </button>
          </form>
          <div className="border-t border-slate-200 pt-6">
             <h4 className="text-md font-bold text-slate-700 mb-3">Database Cantieri</h4>
             <div className="flex flex-col space-y-3">
                <button onClick={handleImportClick} className="flex items-center justify-center gap-2 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700">
                    <FileUpIcon className="w-5 h-5"/> Importa Database
                </button>
                <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                    <FileDownIcon className="w-5 h-5"/> Esporta Database
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls" />
             </div>
          </div>
        </div>
      </div>
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold text-slate-700 mb-4">Elenco Cantieri</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {sites.length > 0 ? sites.map(site => (
              <li key={site.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <span className="font-medium text-slate-800">{site.name}</span>
                <button
                  onClick={() => deleteSite(site.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors duration-150"
                  aria-label={`Elimina ${site.name}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            )) : <p className="p-4 text-center text-slate-500">Nessun cantiere presente.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};