import React from 'react';
import { VacationFilters } from '../../types';

const HeartIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const ActiveIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10"/>
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);
const XIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

interface Props {
  filters: VacationFilters;
  onChange: (f: VacationFilters) => void;
}

const VacationFiltersBar: React.FC<Props> = ({ filters, onChange }) => {
  const setFilter = (key: keyof VacationFilters, val: boolean) =>
    onChange({ likedOnly: false, activeOnly: false, notStartedOnly: false, [key]: val });

  const btn = (key: keyof VacationFilters, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setFilter(key, !filters[key])}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
        filters[key]
          ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
      }`}
      aria-pressed={filters[key]}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Vacation filters">
      {btn('likedOnly',      <HeartIcon />,    'Liked')}
      {btn('activeOnly',     <ActiveIcon />,   'Active now')}
      {btn('notStartedOnly', <CalendarIcon />, 'Upcoming')}
      {(filters.likedOnly || filters.activeOnly || filters.notStartedOnly) && (
        <button
          onClick={() => onChange({ likedOnly: false, activeOnly: false, notStartedOnly: false })}
          className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
        >
          <XIcon />
          Clear
        </button>
      )}
    </div>
  );
};

export default VacationFiltersBar;
