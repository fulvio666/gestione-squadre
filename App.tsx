import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WorkProgramView } from './components/WorkProgramView';
import { PersonnelView } from './components/PersonnelView';
import { SitesView } from './components/SitesView';
import { FleetView } from './components/FleetView';
import { JournalView } from './components/JournalView';
import { SplashScreen } from './components/SplashScreen';

type Tab = 'lavori' | 'giornale' | 'personale' | 'cantieri' | 'mezzi';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('lavori');
  
  // State for splash screen
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start the fade out after a certain time
    const fadeOutTimer = setTimeout(() => {
        setIsFadingOut(true);
    }, 3500); // Splash screen visible for 3.5s

    // Remove the splash screen from DOM after fade out animation completes
    const removeTimer = setTimeout(() => {
        setIsAppLoading(false);
    }, 4500); // 3500ms visibility + 1000ms fade-out duration

    return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeTimer);
    };
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'lavori', label: 'Programma Lavori' },
    { id: 'giornale', label: 'Giornale dei Lavori' },
    { id: 'personale', label: 'Personale' },
    { id: 'cantieri', label: 'Cantieri' },
    { id: 'mezzi', label: 'Parco Mezzi' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'lavori':
        return <WorkProgramView />;
      case 'giornale':
        return <JournalView />;
      case 'personale':
        return <PersonnelView />;
      case 'cantieri':
        return <SitesView />;
      case 'mezzi':
        return <FleetView />;
      default:
        return null;
    }
  };

  if (isAppLoading) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile navigation: Dropdown */}
          <div className="sm:hidden">
            <label htmlFor="tabs" className="sr-only">Seleziona una scheda</label>
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as Tab)}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop navigation: Tabs */}
          <div className="hidden sm:block">
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>


          <div className="mt-6">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;