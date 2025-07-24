'use client';

import React, { useState, useEffect } from 'react';

interface ParcelDetails {
  name: string;
  address: string;
}

interface ConfirmOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  buyerName: string;
  buyerPhone: string;
  parcelLocation: string; // nt "DPD|EE90004"
  onConfirmSend: () => void;
}

export default function ConfirmOrderModal({
  isOpen,
  onClose,
  buyerName,
  buyerPhone,
  parcelLocation,
  onConfirmSend,
}: ConfirmOrderModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPackageSent, setIsPackageSent] = useState(false);
  const [parcelDetails, setParcelDetails] = useState<ParcelDetails | null>(null);



 useEffect(() => {
  if (!parcelLocation) {
    setParcelDetails(null);
    return;
  }

  const [serviceRaw, id] = parcelLocation.split('|');
  const service = serviceRaw.toUpperCase();

  async function fetchParcelDetails() {
    if (!id) {
      setParcelDetails(null);
      return;
    }

    try {
      if (service === 'DPD') {
        const res = await fetch(`/api/dpd-parcelshops/?id=${id}`);
        const data = await res.json();

        const locker = Array.isArray(data) ? data[0] : data;
        if (locker && locker.address) {
          setParcelDetails({
            name: locker.name,
            address: `${locker.address.street}, ${locker.address.city}, ${locker.address.postalCode}`,
          });
        } else {
          setParcelDetails(null);
        }

      } else if (service === 'OMNIVA') {
        const res = await fetch(`/api/omniva-parcelshops?id=${id}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const locker = data[0];
          setParcelDetails({
            name: locker.name,
            address: `${locker.address}, ${locker.city}`,
          });
        } else {
          setParcelDetails(null);
        }

      } else if (service === 'SMARTPOST') {
  const res = await fetch(`/api/smartpost-parcelshops?id=${id}`);
  const data = await res.json();

  const locker = Array.isArray(data) ? data[0] : data; // <-- lisa see
  if (locker && locker.address) {
    setParcelDetails({
      name: locker.name,
      address: `${locker.address}, ${locker.city}`,
    });
  } else {
    setParcelDetails(null);
  }
}

    } catch (error) {
      console.error('Pakiautomaadi info laadimine ebaõnnestus:', error);
      setParcelDetails(null);
    }
  }

  fetchParcelDetails();
}, [parcelLocation]);


  if (!isOpen) return null;

  function handleInitialSendClick() {
    setIsConfirming(true);
  }

  function handleSendConfirmed() {
    setIsPackageSent(true);
    onConfirmSend();
  }

  function handleCancelConfirm() {
    setIsConfirming(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        {isPackageSent ? (
          <>
            <h2 className="text-xl font-semibold mb-4 text-green-600">Pakk on teel!</h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Sule
            </button>
          </>
        ) : isConfirming ? (
          <>
            <h2 className="text-lg font-semibold mb-4">Oled sa kindel, et panid paki teele?</h2>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelConfirm}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Ei
              </button>
              <button
                onClick={handleSendConfirmed}
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
              >
                Jah, kinnita
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Paki saatmine</h2>
            <p><strong>Ostja:</strong> {buyerName}</p>
            <p><strong>Telefon:</strong> {buyerPhone}</p>
            <p><strong>Pakiautomaat:</strong> {parcelLocation.split('|')[0]}</p>
{parcelDetails ? (
  <div className="mt-1">
    <p>{parcelDetails.name}</p>
    <p>{parcelDetails.address}</p>
  </div>
) : (
  <p className="text-sm text-gray-500">{parcelLocation}</p>
)}

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Tühista
              </button>
              <button
                onClick={handleInitialSendClick}
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
              >
                Pane pakk teele
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
