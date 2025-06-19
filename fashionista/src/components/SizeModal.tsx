'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

type SizeModalProps = {
  sizes: string[];
  initialSizes: string[];
  onSave: (sizes: string[]) => void;
  onClose: () => void;
};

const CLOTHING_SIZES = ['4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];

export default function SizeModal({ sizes = CLOTHING_SIZES, initialSizes, onSave, onClose }: SizeModalProps) {
  const [chosenSizes, setChosenSizes] = useState<string[]>(initialSizes);

  const toggleSize = (size: string) => {
    setChosenSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearAll = () => setChosenSizes([]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      <div className="bg-[#FFF9F2] w-[600px] max-w-full p-6 relative">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-black">
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-6">Lisa enda suurused</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 border border-gray-300 bg-pink-200 p-3 text-center">
            <div className="text-2xl">🧥</div>
            <div className="mt-1">{chosenSizes.join(', ') || '—'}</div>
          </div>
          <div className="flex-1 border border-gray-300  p-3 text-center text-gray-500">
            <div className="text-2xl">👟</div>
            <div className="mt-1">36, 37</div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-green-100 text-sm  p-4 mb-4 flex items-start gap-2 text-green-900">
          <span>🧥</span>
          <p>
            Vali mitu suurust, mis võiksid sobida, et sa ei jätaks täiuslikku eset vahele. Suurused erinevad kaubamärkide vahel.
          </p>
        </div>

        {/* Size grid */}
        <div className="grid grid-cols-6 gap-2 mb-6">
          {sizes.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`py-2 border  text-sm ${
                chosenSizes.includes(size)
                  ? 'border-gray-800'
                  : 'border-gray-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
          <button
            onClick={clearAll}
            className="px-4 py-2 border border-black rounded-full text-sm hover:bg-gray-100"
          >
            TÜHJENDA KÕIK VALIKUD
          </button>
          <button
            onClick={() => onSave(chosenSizes)}
            className="px-6 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800"
          >
            SALVESTA
          </button>
        </div>
      </div>
    </div>
  );
}
