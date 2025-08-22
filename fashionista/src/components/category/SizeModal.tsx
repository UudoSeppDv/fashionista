'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type SizeModalProps = {
  sizes: string[];
  initialSizes: string[];
  onSave: (sizes: string[]) => void;
  onClose: () => void;
};

export default function SizeModal({ sizes, initialSizes, onSave, onClose }: SizeModalProps) {
  const [chosenSizes, setChosenSizes] = useState<string[]>([]); // tühjalt alguses
  const [activeTab, setActiveTab] = useState<'clothing' | 'shoes'>('clothing');

  // Kui modal avaneb, seadistame valitud suurused vastavalt vanemale state'ile
  useEffect(() => {
    if (initialSizes) {
      setChosenSizes(initialSizes);
    }
  }, [initialSizes]); // see käivitub ainult kui initialSizes muutub / modal avaneb

  const toggleSize = (size: string) => {
    setChosenSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearAll = () => setChosenSizes([]);

  const clothingSizes = sizes.filter(s => /[a-zA-Z]/.test(s));
  const shoeSizes = sizes.filter(s => /^\d/.test(s));

  const sizesToShow = activeTab === 'clothing' ? clothingSizes : shoeSizes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-[#FFF9F2] w-[600px] max-w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-black">
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-6">Lisa enda suurused</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 cursor-pointer">
          <div
            onClick={() => setActiveTab('clothing')}
            className={`flex-1 border p-3 text-center ${activeTab === 'clothing' ? 'bg-pink-200 border-gray-800' : 'bg-gray-100 border-gray-300'}`}
          >
            <div className="text-2xl">🧥</div>
            <div className="mt-1">{chosenSizes.filter(s => /[a-zA-Z]/.test(s)).join(', ') || '—'}</div>
          </div>
          <div
            onClick={() => setActiveTab('shoes')}
            className={`flex-1 border p-3 text-center ${activeTab === 'shoes' ? 'bg-pink-200 border-gray-800' : 'bg-gray-100 border-gray-300'}`}
          >
            <div className="text-2xl">👟</div>
            <div className="mt-1">{chosenSizes.filter(s => /^\d/.test(s)).join(', ') || '—'}</div>
          </div>
        </div>

        {/* Size grid */}
        <div className="grid grid-cols-6 gap-2 mb-6">
          {sizesToShow.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`py-2 border text-sm ${chosenSizes.includes(size) ? 'border-gray-800' : 'border-gray-300'}`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button onClick={clearAll} className="px-4 py-2 border border-black rounded-full text-sm hover:bg-gray-100">
            TÜHJENDA KÕIK VALIKUD
          </button>
          <button onClick={() => onSave(chosenSizes)} className="px-6 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800">
            SALVESTA
          </button>
        </div>
      </div>
    </div>
  );
}
