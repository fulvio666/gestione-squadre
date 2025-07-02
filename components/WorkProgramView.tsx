import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Job, Worker, Status, Vehicle } from '../types';
import { Badge } from './Badge';
import { UsersIcon, TruckIcon, PlusIcon, FileDownIcon, TrashIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { AssignmentModal } from './AssignTeamModal';
import { AddJobToDateModal } from './AddJobToDateModal';

declare var jspdf: any;
declare var XLSX: any;

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const EditableDescription: React.FC<{ job: Job }> = ({ job }) => {
    const { updateJobDescription } = useAppContext();
    const [description, setDescription] = useState(job.description);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const autoResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };
    
    useEffect(() => {
        autoResize();
    }, [description]);
    
    useEffect(() => {
        setDescription(job.description);
    }, [job.description])

    const handleBlur = () => {
        if (description.trim() !== job.description) {
            updateJobDescription(job.id, description.trim());
        }
    };

    return (
        <textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleBlur}
            rows={1}
            className="text-sm text-slate-500 w-full resize-none border-0 p-0 focus:ring-1 focus:ring-blue-300 bg-transparent rounded-md -mx-1 px-1"
            aria-label={`Descrizione per ${job.site}`}
        />
    );
};


const JobRow: React.FC<{ job: Job; team: Worker[]; vehicles: Vehicle[]; onAssignClick: (jobId: number) => void; onDeleteClick: (jobId: number) => void; }> = ({ job, team, vehicles, onAssignClick, onDeleteClick }) => {
  return (
    <div className="grid grid-cols-12 gap-4 items-start py-4 px-5 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors duration-150">
      {/* Cantiere & Descrizione */}
      <div className="col-span-12 md:col-span-4">
        <p className="font-semibold text-slate-800">{job.site}</p>
        <EditableDescription job={job} />
      </div>

      {/* Stato */}
      <div className="col-span-12 sm:col-span-4 md:col-span-1">
         <Badge status={job.status}>{job.status}</Badge>
      </div>

      {/* Risorse Assegnate */}
      <div className="col-span-12 sm:col-span-8 md:col-span-6 flex flex-wrap gap-2 items-center">
        {team.length > 0 && <UsersIcon className="h-5 w-5 text-slate-400" />}
        {team.map((worker) => (
          <Badge key={`w-${worker.id}`} type="worker">{worker.name}</Badge>
        ))}
         {vehicles.length > 0 && <TruckIcon className="h-5 w-5 text-slate-400 mt-1" />}
        {vehicles.map((vehicle) => (
            <Badge key={`v-${vehicle.id}`} type="vehicle">{vehicle.name}</Badge>
        ))}
      </div>

      {/* Azioni */}
      <div className="col-span-12 md:col-span-1 flex justify-end items-center gap-1">
        <button
          onClick={() => onAssignClick(job.id)}
          className="text-slate-500 hover:text-blue-600 transition-colors duration-150 p-2 rounded-full"
          aria-label={`Assegna risorse per ${job.site}`}
        >
          <UsersIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => onDeleteClick(job.id)}
          className="text-slate-400 hover:text-red-600 transition-colors duration-150 p-2 rounded-full"
          aria-label={`Elimina lavoro ${job.site}`}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export const WorkProgramView: React.FC = () => {
  const { jobs, workers, vehicles, deleteJob } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState<boolean>(false);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState<boolean>(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);

  const jobsForSelectedDate = useMemo(() => {
    return jobs.filter(job => job.date === selectedDate);
  }, [jobs, selectedDate]);
  
  const formattedSelectedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handleExportPDF = () => {
    const doc = new jspdf.jsPDF();
    doc.text(`Programma Lavori - ${formattedSelectedDate}`, 14, 15);

    const tableData = jobsForSelectedDate.map(job => {
      const teamNames = job.assignedTeam.map(id => workers.find(w => w.id === id)?.name).filter(Boolean).join(', ');
      const vehicleNames = job.assignedVehicles.map(id => vehicles.find(v => v.id === id)?.name).filter(Boolean).join(', ');
      return [
        job.site,
        job.description,
        job.status,
        teamNames,
        vehicleNames
      ];
    });

    doc.autoTable({
        head: [['Cantiere', 'Descrizione', 'Stato', 'Personale', 'Mezzi']],
        body: tableData,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
        columnStyles: { 1: { cellWidth: 'auto' } },
    });
    
    doc.save(`programma_lavori_${selectedDate}.pdf`);
  };
  
  const handleExportExcel = () => {
    const dataToExport = jobsForSelectedDate.map(job => ({
        'Cantiere': job.site,
        'Descrizione': job.description,
        'Stato': job.status,
        'Personale Assegnato': job.assignedTeam.map(id => workers.find(w => w.id === id)?.name).filter(Boolean).join(', '),
        'Mezzi Assegnati': job.assignedVehicles.map(id => vehicles.find(v => v.id === id)?.name).filter(Boolean).join(', '),
        'Data': job.date
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Programma Lavori");
    XLSX.writeFile(workbook, `programma_lavori_${selectedDate}.xlsx`);
  };

  const handleAssignClick = (jobId: number) => {
    setEditingJobId(jobId);
    setIsAssignmentModalOpen(true);
  };
  
  const handleDeleteJobClick = (jobId: number) => {
      if (window.confirm("Sei sicuro di voler eliminare questo lavoro dal programma? L'azione è irreversibile.")) {
          deleteJob(jobId);
      }
  }

  const handleCloseAssignmentModal = () => {
    setIsAssignmentModalOpen(false);
    setEditingJobId(null);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-700">Programma Lavori</h2>
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <label htmlFor="date-picker" className="text-sm font-medium text-slate-600">Seleziona Data:</label>
                <input
                    id="date-picker"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <button 
              onClick={() => setIsAddJobModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-5 h-5"/>
              <span>Aggiungi Lavoro</span>
            </button>
             <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
                <FileDownIcon className="w-5 h-5"/> PDF
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                <FileDownIcon className="w-5 h-5"/> Excel
            </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 py-3 px-5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider items-center">
          <div className="col-span-4">Cantiere / Descrizione</div>
          <div className="col-span-1">Stato</div>
          <div className="col-span-6">Risorse Assegnate</div>
          <div className="col-span-1 text-right">Azioni</div>
        </div>
        {/* Rows */}
        <div>
          {jobsForSelectedDate.length > 0 ? (
            jobsForSelectedDate.map((job) => {
              const team = job.assignedTeam
                .map(workerId => workers.find(w => w.id === workerId))
                .filter((w): w is Worker => w !== undefined);
              const assignedVehicles = job.assignedVehicles
                .map(vehicleId => vehicles.find(v => v.id === vehicleId))
                .filter((v): v is Vehicle => v !== undefined);
              return <JobRow key={job.id} job={job} team={team} vehicles={assignedVehicles} onAssignClick={handleAssignClick} onDeleteClick={handleDeleteJobClick} />;
            })
          ) : (
            <p className="p-8 text-center text-slate-500">Nessun lavoro programmato per questa data.</p>
          )}
        </div>
      </div>
      {isAssignmentModalOpen && editingJobId && (
        <AssignmentModal
          jobId={editingJobId}
          onClose={handleCloseAssignmentModal}
        />
      )}
      {isAddJobModalOpen && (
        <AddJobToDateModal
          selectedDate={selectedDate}
          onClose={() => setIsAddJobModalOpen(false)}
        />
      )}
    </div>
  );
};