import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { AppDispatch, RootState } from '../../store';
import { fetchVacations, setPage } from '../../store/vacationsSlice';
import { addToast } from '../../store/uiSlice';
import { vacationService } from '../../services/vacationService';
import VacationCard from '../../components/Vacations/VacationCard';
import Pagination from '../../components/Common/Pagination';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
  </svg>
);

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.28, ease: 'easeOut' } },
};
const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const AdminVacations: React.FC = () => {
  const dispatch   = useDispatch<AppDispatch>();
  const navigate   = useNavigate();
  const { vacations, page, totalPages, loading } = useSelector((s: RootState) => s.vacations);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchVacations({ page, filters: { likedOnly: false, activeOnly: false, notStartedOnly: false } }));
  }, [dispatch, page]);

  const handleDelete = async (id: number, dest: string) => {
    if (!window.confirm(`Delete "${dest}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await vacationService.delete(id);
      dispatch(addToast({ message: `"${dest}" deleted`, type: 'success' }));
      dispatch(fetchVacations({ page, filters: { likedOnly: false, activeOnly: false, notStartedOnly: false } }));
    } catch {
      dispatch(addToast({ message: 'Failed to delete vacation', type: 'error' }));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white">Manage Vacations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{vacations.length} destinations loaded</p>
        </div>
        <Link
          to="/admin/vacations/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
        >
          <PlusIcon />
          Add Vacation
        </Link>
      </div>

      {loading && <div className="py-20"><LoadingSpinner size="lg" /></div>}

      {!loading && vacations.length > 0 && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={page}
        >
          {vacations.map(v => (
            <motion.div key={v.id} variants={cardVariants} className="h-full">
              <VacationCard
                vacation={v}
                adminActions={{
                  onEdit:   () => navigate(`/admin/vacations/${v.id}/edit`),
                  onDelete: () => handleDelete(v.id, v.destination),
                  deleting: deleting === v.id,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={p => dispatch(setPage(p))} />
    </div>
  );
};

export default AdminVacations;
