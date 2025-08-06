'use client';

import { useEffect, useState } from 'react';

interface ParcelOption {
  id: string;
  label: string;
  service: 'DPD' | 'Omniva' | 'SmartPOST';
  city: string;
}

interface TransportOption {
  label: string;
  price: number;
}

interface ParcelSelectorProps {
  allTransportOptions: TransportOption[];
  selectedTransport: string;
  setSelectedTransport: (value: string) => void;
  parcelLocation: string;
  setParcelLocation: (value: string) => void;
  productDelivery: string | string[] | null;
  phone: string;
  setPhone: (value: string) => void;
}

interface DPDParcelShop {
  id: string;
  name: string;
  lockerType: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    latLong: [string, string];
  };
}

interface OmnivaParcelShop {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface SmartpostParcelShop {
  id: string;
  name: string;
  address: string;
  city: string;
}

export default function ParcelSelector({
  allTransportOptions,
  selectedTransport,
  setSelectedTransport,
  parcelLocation,
  setParcelLocation,
  productDelivery,
  phone,
  setPhone,
}: ParcelSelectorProps) {
  const [options, setOptions] = useState<ParcelOption[]>([]);
  const [loading, setLoading] = useState(true);
   const [phoneError, setPhoneError] = useState('');
   // Kontrolli, kas on järeletulemine transport
const isPickup = selectedTransport.toLowerCase().includes('ostja tuleb ise järgi') || selectedTransport.toLowerCase().includes('pickup');


  // Normaliseeri productDelivery väärtus (string või array)
  const deliveryArray =
    Array.isArray(productDelivery)
      ? productDelivery.map((d) => d.toLowerCase())
      : typeof productDelivery === 'string'
        ? productDelivery.split(',').map((d) => d.trim().toLowerCase())
        : [];

  // Filtreeri lubatud transpordiviisid
  const finalTransportOptions = allTransportOptions.filter((opt) =>
    deliveryArray.some((d) => opt.label.toLowerCase().includes(d))
  );



useEffect(() => {
  const load = async () => {
    setLoading(true);

    try {
      let res;
      if (selectedTransport.toLowerCase().includes('dpd')) {
        res = await fetch('/api/dpd-parcelshops');
        const data: DPDParcelShop[] = await res.json();
        setOptions(
          data.map((shop) => ({
            id: shop.id,
            label: shop.name,
            service: 'DPD',
            city: shop.address.city,
          }))
        );
      } else if (selectedTransport.toLowerCase().includes('omniva')) {
        res = await fetch('/api/omniva-parcelshops');
        const data: OmnivaParcelShop[] = await res.json();
        setOptions(
          data.map((shop) => ({
            id: shop.id,
            label: shop.name,
            service: 'Omniva',
            city: shop.city,
          }))
        );
      } else if (selectedTransport.toLowerCase().includes('smartpost')) {
        res = await fetch('/api/smartpost-parcelshops');
        const data: SmartpostParcelShop[] = await res.json();
        setOptions(
          data.map((shop) => ({
            id: shop.id,
            label: shop.name,
            service: 'SmartPOST',
            city: shop.city,
          }))
        );
      } else {
        setOptions([]);
      }
    } catch (err) {
      console.error('Pakiautomaatide laadimine ebaõnnestus:', err);
      setOptions([]);
    }

    setLoading(false);
  };

  if (['dpd', 'omniva', 'smartpost'].some((s) => selectedTransport.toLowerCase().includes(s))) {
    load();
  } else {
    setOptions([]);
    setLoading(false);
  }
}, [selectedTransport]);

useEffect(() => {
  if (isPickup) {
    setParcelLocation('Ostja tuleb ise järele');
  }
}, [selectedTransport, isPickup, setParcelLocation]);


  const groupedByCity = options.reduce<Record<string, ParcelOption[]>>((groups, option) => {
    const city = option.city || 'Muu';
    if (!groups[city]) groups[city] = [];
    groups[city].push(option);
    return groups;
  }, {});

  return (
    <div>
  <h2 className="font-semibold mb-2">Transpordiviis</h2>
  <div className="border divide-y">
    {finalTransportOptions.map((option) => {
      const isSelected = selectedTransport === option.label;
      const isParcel = ['dpd', 'omniva', 'smartpost'].some((s) =>
        option.label.toLowerCase().includes(s)
      );

      return (
        <div key={option.label} className="px-4 py-3">
  {/* Raadio + nimi + hind kõik ühel real, ka väiksel ekraanil */}
 <div className="flex mb-2 items-center gap-2">
  {/* ← see on custom radio */}
  <label className="relative cursor-pointer">
    <input
      type="radio"
      name="transport"
      checked={isSelected}
      onChange={() => {
        setSelectedTransport(option.label);
        setParcelLocation('');
      }}
      className="sr-only"
    />
    <div
      className={`w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center transition-colors duration-150
        ${isSelected ? 'border-black' : ''}
      `}
    >
      {isSelected && (
        <div className="w-2 h-2 bg-black rounded-full" />
      )}
    </div>
  </label>

  {/* Transporti nimi ja hind */}
  <span>{option.label}</span>
  <span className="text-sm text-gray-600">
    {option.price === 0 ? 'Tasuta' : `+ ${option.price.toFixed(2)}€`}
  </span>
</div>

{isPickup && isSelected && (
   <div className="mt-4 mb-4 ml-6">
  <div className="sm:flex-1 w-full">
          <label htmlFor="phone" className="text-sm font-medium block mb-1">
      Telefoni number
    </label>
    <input
      type="tel"
      id="phone"
      name="phone"
      placeholder="+372 5xxxxxxx"
      value={phone}
      onChange={(e) => {
        const value = e.target.value;
        setPhone(value);
        if (value.trim() === '') {
          setPhoneError('Telefon on kohustuslik');
        } else {
          setPhoneError('');
        }
      }}
      onBlur={() => {
        if (phone.trim() === '') {
          setPhoneError('Telefon on kohustuslik');
        }
      }}
      className={`w-full border px-3 py-2 text-sm rounded ${phoneError ? 'border-red-500' : ''}`}
    />
    <p className={`text-sm mt-1 ${phoneError ? 'text-red-600' : 'invisible'}`}>
  {phoneError || 'Placeholder'}
</p>
  </div>
  </div>
)}

  {/* Pakiautomaat ja telefon allpool, kui valitud ja sobiv */}
  {isParcel && isSelected && (
  <div className="mt-4 mb-4 ml-6">
    {loading ? (
      <p className="text-sm text-gray-500">Laen pakiautomaate...</p>
    ) : (
      // Flex wrapper kogu valikule
      <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 gap-3">
        {/* Pakiautomaadi valik */}
        <div className="sm:flex-1 w-full">
          <label htmlFor="parcel-location-select" className="text-sm font-medium block mb-1">
            Pakiautomaat
          </label>
          <select
  id="parcel-location-select"
  value={parcelLocation}
  onChange={(e) => setParcelLocation(e.target.value)}
  className="w-full border px-3 py-2 text-sm rounded text-black bg-white focus:ring-0 focus:outline-none appearance-none"

>

            <option value="">-- Vali pakiautomaat --</option>
            {Object.entries(groupedByCity).map(([city, shops]) => (
              <optgroup key={city} label={city}>
                {shops.map((shop) => (
                  <option
                    key={`${shop.service}-${shop.id}`}
                    value={`${shop.service}|${shop.id}`}
                  >
                    {shop.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Telefoni number */}
        <div className="sm:flex-1 w-full">
          <label htmlFor="phone" className="text-sm font-medium block mb-1">
            Telefoni number
          </label>
          <input
  type="tel"
  id="phone"
  name="phone"
  placeholder="+372 5xxxxxxx"
  value={phone}
  onChange={(e) => {
    const value = e.target.value;
    setPhone(value);
    if (value.trim() === '') {
      setPhoneError('Telefon on kohustuslik');
    } else {
      setPhoneError('');
    }
  }}
 
  className={`w-full border px-3 py-2 text-sm rounded ${phoneError ? 'border-red-500' : ''}`}
/>



        </div>
      </div>
    )}
  </div>
)}

</div>

      );
    })}
  </div>
</div>


  );
}
