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
  orderId,
}: ConfirmOrderModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPackageSent, setIsPackageSent] = useState(false);
  const [parcelDetails, setParcelDetails] = useState<ParcelDetails | null>(null);
   const isSelfPickup = parcelLocation === 'Ostja tuleb ise järgi';
  const [shownPickup, setShownPickup] = useState(false);
// Kõik HOOKID tulevad alati enne tingimuslikku returni


useEffect(() => {
  if (!isOpen) {
    setParcelDetails(null);
    setShownPickup(false);
    return;
  }

  if (isSelfPickup && !shownPickup) {
    setShownPickup(true);
    setParcelDetails(null);
    return;
  }

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
        const locker = Array.isArray(data) ? data[0] : data;
        if (locker && locker.address) {
          setParcelDetails({
            name: locker.name,
            address: `${locker.address}, ${locker.city}`,
          });
        } else {
          setParcelDetails(null);
        }
      } else {
        setParcelDetails(null);
      }
    } catch (error) {
      console.error('Pakiautomaadi info laadimine ebaõnnestus:', error);
      setParcelDetails(null);
    }
  }

  fetchParcelDetails();
}, [parcelLocation, isOpen, isSelfPickup, shownPickup]);

useEffect(() => {
  if (!isOpen) {
    setIsPackageSent(false);
    return;
  }

  async function checkIfPackageSent() {
    if (!orderId) return;
    const res = await fetch(`/api/check-order-status?id=${orderId}`);
    if (!res.ok) {
      console.error('Paki staatuse kontroll ebaõnnestus');
      return;
    }
    const data = await res.json();
    setIsPackageSent(data.sent);
  }

  checkIfPackageSent();
}, [orderId, isOpen]);

function handleInitialSendClick() {
  setIsConfirming(true);
}

function handleSendConfirmed() {
  onConfirmSend(); // Supabase uuendus peaks siin toimuma
}

function handleCancelConfirm() {
  setIsConfirming(false);
}
useEffect(() => {
  if (!isOpen) {
    setIsConfirming(false);
    setIsPackageSent(false);
    setParcelDetails(null);
    setShownPickup(false);
  } else {
    // Modal avamisel veendu, et kinnituse olek oleks nullitud
    setIsConfirming(false);
  }
}, [isOpen]);

if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      <div className="bg-[#F1ECE6] p-6 max-w-md w-full shadow-lg">
        {isPackageSent ? (
          <>
            <h2 className="text-xl font-semibold mb-4 text-green-600">Pakk on teel!</h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              Sule
            </button>
          </>
        ) : isConfirming ? (
          <>
          <div>
            <h2 className="text-lg font-semibold text-center mb-4">
              Oled sa kindel, et panid paki teele?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelConfirm}
                className="px-4 py-2 border rounded-full hover:bg-gray-100"
              >
                Tühista
              </button>
              <button
                onClick={handleSendConfirmed}
                className="px-4 py-2 bg-pink-300 text-black font-medium border rounded-full hover:bg-white"
              >
                Jah, kinnita
              </button>
            </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl text-center font-semibold mb-4">Paki saatmine</h2>

            <div className="pb-4">
              <div className="flex justify-between border-b pb-1 text-m">
                <span>Ostja:</span>
                <span>
                  <strong>{buyerName}</strong>
                </span>
              </div>
              <div className="flex justify-between border-b pt-1 pb-1 text-m">
                <span>Telefon:</span>
                <span>
                  <strong>{buyerPhone}</strong>
                </span>
              </div>

              <div className="flex justify-between border-b pt-1 pb-1 text-m">
                <span>Pakiautomaat:</span>

                <div className="text-right">
  {isSelfPickup ? (
    <div className="shadow-lg">
      <strong>{parcelLocation}</strong>
    </div>
  ) : (
    <>
      <div>
        <strong>{parcelLocation.split('|')[0]}</strong>
      </div>
      {parcelDetails && (
        <div className="pt-1 text-sm text-gray-700">
          <p>{parcelDetails.name}</p>
          <p>{parcelDetails.address}</p>
        </div>
      )}
    </>
  )}
</div>



              </div>
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-full hover:bg-gray-100"
              >
                Tühista
              </button>
              <button
                onClick={handleInitialSendClick}
                className="px-4 py-2 bg-pink-300 text-black border font-medium rounded-full hover:bg-white"
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
