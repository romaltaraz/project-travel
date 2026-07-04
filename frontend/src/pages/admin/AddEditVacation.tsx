import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { addToast } from '../../store/uiSlice';
import { vacationService } from '../../services/vacationService';
import { Vacation } from '../../types';
import VacationForm from '../../components/Vacations/VacationForm';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AddEditVacation: React.FC = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const dispatch  = useDispatch<AppDispatch>();
  const isEdit    = Boolean(id);

  const [vacation,     setVacation]     = useState<Vacation | undefined>();
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    if (isEdit) {
      vacationService.getById(Number(id))
        .then(r => setVacation(r.data))
        .catch(() => { dispatch(addToast({ message: 'Vacation not found', type: 'error' })); navigate('/admin/vacations'); })
        .finally(() => setFetchLoading(false));
    }
  }, [id, isEdit, navigate, dispatch]);

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    try {
      if (isEdit) {
        await vacationService.update(Number(id), formData);
        dispatch(addToast({ message: 'Vacation updated!', type: 'success' }));
      } else {
        await vacationService.create(formData);
        dispatch(addToast({ message: 'Vacation created!', type: 'success' }));
      }
      navigate('/admin/vacations');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      dispatch(addToast({ message: e.response?.data?.error || 'Save failed', type: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  if (fetchLoading) return <div className="py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-6 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEdit ? 'Edit Vacation' : 'Add New Vacation'}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <VacationForm initial={vacation} onSubmit={handleSubmit} loading={saving} />
      </div>
    </div>
  );
};

export default AddEditVacation;
