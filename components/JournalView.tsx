import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Job, Worker, Vehicle } from '../types';
import { Badge } from './Badge';
import { UsersIcon, TruckIcon, FileDownIcon } from './icons';

declare var jspdf: any;
declare var XLSX: any;

const SiteJournal: React.FC<{ siteName: string, jobs: Job[] }> = ({ siteName, jobs }) => {
    const { workers, vehicles } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);

    const sortedJobs = useMemo(() => {
        return [...jobs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [jobs]);

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <button
                className="w-full text-left p-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-bold text-slate-800">{siteName}</h3>
                <svg className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="divide-y divide-slate-200">
                    {sortedJobs.map(job => {
                        const team = job.assignedTeam
                            .map(workerId => workers.find(w => w.id === workerId))
                            .filter((w): w is Worker => w !== undefined);
                        const assignedVehicles = job.assignedVehicles
                            .map(vehicleId => vehicles.find(v => v.id === vehicleId))
                            .filter((v): v is Vehicle => v !== undefined);
                        
                        return (
                            <div key={job.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-slate-600">
                                            {new Date(job.date + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="text-sm text-slate-800">{job.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                        <Badge status={job.status}>{job.status}</Badge>
                                    </div>
                                </div>
                                {(team.length > 0 || assignedVehicles.length > 0) && (
                                    <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-slate-100">
                                        {team.length > 0 && <UsersIcon className="h-5 w-5 text-slate-400" />}
                                        {team.map((worker) => <Badge key={`w-${worker.id}`} type="worker">{worker.name}</Badge>)}
                                        {assignedVehicles.length > 0 && <TruckIcon className="h-5 w-5 text-slate-400 ml-2" />}
                                        {assignedVehicles.map((vehicle) => <Badge key={`v-${vehicle.id}`} type="vehicle">{vehicle.name}</Badge>)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const JournalView: React.FC = () => {
    const { jobs, workers, vehicles } = useAppContext();

    const jobsBySite = useMemo(() => {
        return jobs.reduce((acc, job) => {
            if (!acc[job.site]) {
                acc[job.site] = [];
            }
            acc[job.site].push(job);
            return acc;
        }, {} as Record<string, Job[]>);
    }, [jobs]);

    const handleExportPDF = () => {
        const doc = new jspdf.jsPDF();
        doc.text("Giornale dei Lavori Completo", 14, 15);
        let y = 25;

        for(const siteName in jobsBySite) {
            if (y > 270) {
                doc.addPage();
                y = 15;
            }
            doc.setFont(undefined, 'bold');
            doc.text(siteName, 14, y);
            y += 7;
            doc.setFont(undefined, 'normal');

            const tableData = jobsBySite[siteName]
                .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(job => {
                const teamNames = job.assignedTeam.map(id => workers.find(w => w.id === id)?.name).filter(Boolean).join(', ');
                const vehicleNames = job.assignedVehicles.map(id => vehicles.find(v => v.id === id)?.name).filter(Boolean).join(', ');
                return [
                    new Date(job.date + 'T00:00:00').toLocaleDateString('it-IT'),
                    job.description,
                    teamNames,
                    vehicleNames
                ];
            });

            doc.autoTable({
                head: [['Data', 'Lavorazione', 'Personale', 'Mezzi']],
                body: tableData,
                startY: y,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [41, 128, 185] },
            });
            
            y = doc.autoTable.previous.finalY + 10;
        }

        doc.save(`giornale_lavori_completo.pdf`);
    };
  
    const handleExportExcel = () => {
        const dataToExport = jobs.map(job => ({
            'Cantiere': job.site,
            'Data': job.date,
            'Descrizione': job.description,
            'Stato': job.status,
            'Personale Assegnato': job.assignedTeam.map(id => workers.find(w => w.id === id)?.name).filter(Boolean).join(', '),
            'Mezzi Assegnati': job.assignedVehicles.map(id => vehicles.find(v => v.id === id)?.name).filter(Boolean).join(', '),
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Giornale Lavori");
        XLSX.writeFile(workbook, `giornale_lavori_completo.xlsx`);
    };

    return (
        <div>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-700">Giornale dei Lavori</h2>
                 <div className="flex flex-wrap items-center gap-4">
                     <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
                        <FileDownIcon className="w-5 h-5"/> Esporta PDF
                    </button>
                    <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                        <FileDownIcon className="w-5 h-5"/> Esporta Excel
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {Object.keys(jobsBySite).length > 0 ? (
                    Object.entries(jobsBySite).map(([siteName, siteJobs]) => (
                        <SiteJournal key={siteName} siteName={siteName} jobs={siteJobs} />
                    ))
                ) : (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
                        <p>Il giornale dei lavori è vuoto.</p>
                        <p className="text-sm mt-2">Aggiungi un lavoro dal "Programma Lavori" per iniziare.</p>
                    </div>
                )}
            </div>
        </div>
    );
};