import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, X } from 'lucide-react';
import { Vacation } from '../../types';
import { aiService } from '../../services/aiService';
import { getImageUrl } from '../../services/api';

interface Props {
  initial?: Vacation;
  onSubmit: (formData: FormData) => Promise<void>;
  loading?: boolean;
}

const VacationForm: React.FC<Props> = ({ initial, onSubmit, loading }) => {
  const [destination, setDestination] = useState(initial?.destination ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [startDate,   setStartDate]   = useState(initial?.startDate   ?? '');
  const [endDate,     setEndDate]     = useState(initial?.endDate     ?? '');
  const [price,       setPrice]       = useState(initial?.price?.toString() ?? '');
  const [image,       setImage]       = useState<File | null>(null);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const [aiImageFileName, setAiImageFileName] = useState<string | null>(null);
  const [aiSource,        setAiSource]        = useState<'magnific' | 'wikimedia' | 'openverse' | null>(null);
  const [aiPage,          setAiPage]          = useState(1);
  const [aiLoading,       setAiLoading]       = useState(false);
  const [aiError,         setAiError]         = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setDestination(initial.destination);
      setDescription(initial.description);
      setStartDate(initial.startDate);
      setEndDate(initial.endDate);
      setPrice(initial.price.toString());
    }
  }, [initial]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!destination.trim()) e.destination = 'Destination is required';
    if (!description.trim()) e.description = 'Description is required';
    if (!startDate)          e.startDate   = 'Start date is required';
    if (!endDate)            e.endDate     = 'End date is required';
    if (endDate && startDate && endDate < startDate) e.endDate = 'End date must be after start date';
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0 || p > 10000) e.price = 'Price must be between 0 and 10,000';
    if (!initial && !image && !aiImageFileName) e.image = 'Image is required for new vacations';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const fd = new FormData();
    fd.append('destination', destination);
    fd.append('description', description);
    fd.append('startDate',   startDate);
    fd.append('endDate',     endDate);
    fd.append('price',       price);
    if (image) fd.append('image', image);
    else if (aiImageFileName) fd.append('aiImageFileName', aiImageFileName);
    await onSubmit(fd);
  };

  const findPhoto = async (nextPage: number) => {
    if (!destination.trim()) {
      setErrors(prev => ({ ...prev, image: 'Enter a destination first so we know what to search for' }));
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await aiService.generateVacationPhoto(destination.trim(), nextPage);
      setAiImageFileName(res.data.imageFileName);
      setAiSource(res.data.source);
      setAiPage(nextPage);
      setImage(null);
      setErrors(prev => ({ ...prev, image: '' }));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setAiError(e.response?.data?.error || 'Could not find a photo — please try again');
    } finally {
      setAiLoading(false);
    }
  };

  const findFirstPhoto = () => findPhoto(1);
  const findAnotherPhoto = () => findPhoto(aiPage + 1);

  const inputCls = (field: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition ${
      errors[field] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination</label>
        <input id="destination" value={destination} onChange={e => setDestination(e.target.value)} className={inputCls('destination')} placeholder="e.g. Paris, France" />
        {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputCls('description')} placeholder="Describe the vacation…" />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
          <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls('startDate')} />
          {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
          <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls('endDate')} min={startDate} />
          {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
        <input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} min={1} max={10000} step={0.01} className={inputCls('price')} placeholder="0.00" />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Image {initial && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
        </label>
        <div className="flex items-center gap-2">
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={e => {
              setImage(e.target.files?.[0] ?? null);
              setAiImageFileName(null);
              setAiSource(null);
            }}
            className="flex-1 text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:px-4 file:py-2 file:border-0 file:rounded-lg file:bg-primary-50 file:text-primary-700 file:font-medium hover:file:bg-primary-100 cursor-pointer"
          />
          <button
            type="button"
            onClick={findFirstPhoto}
            disabled={aiLoading}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/35 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {aiLoading ? 'Searching…' : <><Search className="w-4 h-4" /> Find a photo</>}
          </button>
        </div>
        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
        {aiError && <p className="text-red-500 text-xs mt-1">{aiError}</p>}

        {aiImageFileName && (
          <div className="mt-3 relative inline-block">
            <img
              src={getImageUrl(aiImageFileName)}
              alt="Found photo preview"
              className="w-full max-w-xs rounded-lg border border-gray-200 dark:border-gray-700"
            />
            {aiSource && (
              <p className="text-xs text-gray-400 mt-1">
                Photo via {aiSource === 'magnific' ? 'Magnific' : aiSource === 'wikimedia' ? 'Wikimedia Commons' : 'Openverse'}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={findAnotherPhoto}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-60"
              >
                {aiLoading ? 'Searching…' : <><RefreshCw className="w-3.5 h-3.5" /> Search again</>}
              </button>
              <button
                type="button"
                onClick={() => { setAiImageFileName(null); setAiSource(null); setAiPage(1); }}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Saving…' : initial ? 'Save Changes' : 'Create Vacation'}
      </button>
    </form>
  );
};

export default VacationForm;
