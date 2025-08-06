'use client';

import { useEffect, useState } from 'react';
import BankSelector from './BankSelector'; 
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient'
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import ParcelSelector from './ParcelSelector';

interface RawProduct {
  id: string;
  brand: string | null;
  description: string | null;
  price: number | string;
  delivery: string | string[] | null;
  images: unknown;
  user_id: string | null;
}




interface Product {
  id: string;
  brand: string;
  description: string;
  price: number;
  delivery: string;
  images: string[];
  user_id: string; // ← see on müüja ID
}

function normalizeProduct(data: RawProduct): Product {
  if (!data.id) {
    throw new Error('Tootel puudub id');
  }

  let deliveryStr = '';

  if (typeof data.delivery === 'string') {
    deliveryStr = data.delivery;
  } else if (Array.isArray(data.delivery)) {
    deliveryStr = data.delivery.join(',');
  }

  return {
    id: data.id,
    brand: data.brand || '',
    description: data.description || '',
    price: Number(data.price) || 0,
    delivery: deliveryStr,
    images: Array.isArray(data.images) ? data.images : [],
    user_id: data.user_id || '',
  };
}


interface CheckOutProps {
  productId: string;
}



export default function CheckOut({ productId }: CheckOutProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  


  const [selectedTransport, setSelectedTransport] = useState('');
const [parcelLocation, setParcelLocation] = useState('');

const finalTransportOptions = [
  { label: 'Omniva', price: 2.5 },
  { label: 'DPD', price: 3.0 },
  { label: 'Smartpost', price: 2.0 },
  { label: 'Kuller', price: 5.0 },
  
];

  const user = useUser();
const router = useRouter();


const [cardNumber, setCardNumber] = useState('');
const [cardType, setCardType] = useState('');
const [expiryDate, setExpiryDate] = useState('');
const [cvv, setCvv] = useState('');
const [cardName, setCardName] = useState('');

function detectCardType(number: string) {
  const sanitized = number.replace(/\s+/g, '');
  if (/^4[0-9]{0,}$/.test(sanitized)) return 'Visa';
  if (/^5[1-5][0-9]{0,}$/.test(sanitized)) return 'MasterCard';
  return 'Unknown';
}
  const [selectedPayment, setSelectedPayment] = useState('pangalingi');
  const [agree, setAgree] = useState(false);
  const [giftCard, setGiftCard] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('public_products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error('Toodet ei leitud');
        }
if (!data.id) {
  setError('Toode on vigane, puudub id');
  return;
}
const normalized = normalizeProduct(data as RawProduct);
        setProduct(normalized);

        if (normalized.delivery) {
          const deliveryOptions = normalized.delivery.split(',').map(d => d.trim());
          setSelectedTransport(deliveryOptions[0] || '');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Midagi läks valesti');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) return <div>Laadimine...</div>;
  if (error) return <div className="text-red-600">Viga: {error}</div>;
  if (!product) return null;

  // --- Järgmine kood jääb samaks, võid siit alustada ---
 const deliveryString = typeof product.delivery === 'string' ? product.delivery : '';

const transportOptions = deliveryString
  ? deliveryString.split(',').map(label => {
      const trimmed = label.trim();
      return {
        label: trimmed,
        price: trimmed.toLowerCase() === 'ostja tuleb ise järgi' ? 0 : 3.1,
      };
    })
  : [];




const handleCheckout = async () => {
  if (!agree || !user || !product || !product.user_id) return;

  const isParcelAutomaat = ['omniva', 'smartpost', 'dpd'].some(t =>
    selectedTransport.toLowerCase().includes(t)
  );

  // Kontrolli, kas pakiautomaadi puhul on valitud asukoht
  if (isParcelAutomaat && !parcelLocation) {
    alert('Palun vali pakiautomaat');
    return;
  }

  // Kontrolli telefoni numbri olemasolu ainult pakiautomaadi puhul
  if (!phone || phone.trim() === '') {
    alert('Palun sisesta telefoninumber');
    return;
  }

  setLoading(true);

  try {
    const { error: insertError } = await supabase.from('orders').insert({
      user_id: user.id,                // ostja
      seller_id: product.user_id,     // müüja
      product_id: product.id,
      status: 'pending',
      delivery_method: selectedTransport,
      parcel_location: parcelLocation || null,
      payment_method: selectedPayment,
      price: product.price,
      phone: phone,
    });

    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from('public_products')
      .update({ status: 'sold' })
      .eq('id', product.id);

    if (updateError) throw updateError;

    const totalPrice = (product.price + serviceFee +transportPrice).toFixed(2);

    router.push(
  `/aitah?product_id=${product.id}&price=${product.price}&transport=${transportPrice}&service=${serviceFee}&total=${totalPrice}`
);

  } catch (error) {
    console.error('Viga maksmisel:', error);
    alert('Midagi läks valesti...');
  } finally {
    setLoading(false);
  }
};








const selectedOption = finalTransportOptions.find(
  opt => opt.label.toLowerCase() === selectedTransport.toLowerCase()
);
const transportPrice = selectedOption ? selectedOption.price : 0;


  const productPrice = product.price;
  const serviceFee = 1;
  const totalPrice = (productPrice + serviceFee + transportPrice).toFixed(2);

  


  return (
    <div className="mb-20 mt-5 max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8 font-montserrat">
      {/* Left side */}
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-2xl font-semibold">Kinnita tellimus</h1>

        {/* Product Info */}
        <div className="flex items-start gap-4 border-b pb-4">


<Image
  src={product.images?.[0] || '/bag.jpg'}
  alt={product.description || 'Toode'}
  width={120}  
  height={152}  
  className="border object-cover"
/>

          <div className="flex-grow">
            <p className="font-semibold text-lg">{product.description}</p>
          </div>
          <div className="font-semibold text-lg">{productPrice.toFixed(2)} €</div>
        </div>

<ParcelSelector
  allTransportOptions={transportOptions}
  selectedTransport={selectedTransport}
  setSelectedTransport={setSelectedTransport}
  parcelLocation={parcelLocation}
  setParcelLocation={setParcelLocation}
  productDelivery={product.delivery}
  phone={phone}
  setPhone={setPhone}
/>

    




        {/* Payment */}
        <div>
          <h2 className="font-semibold mb-2">Makselviis</h2>
          <div className="border divide-y">
            <label className="flex items-center px-4 py-3 cursor-pointer">
  <input
    type="radio"
    name="payment"
    checked={selectedPayment === 'kaart'}
    onChange={() => setSelectedPayment('kaart')}
    className="mr-3"
  />
  Maksa kaardiga
</label>

{selectedPayment === 'kaart' && (
    <div>
  <div className="mt-4  mr-70 px-4 py-4 bg-[#f0efee] space-y-2">
    {/* Kaardinumber + ikoonid */}
    <label className="relative block">
      <input
        type="text"
        placeholder="0000 0000 0000 0000"
        value={cardNumber}
        onChange={(e) => {
          const value = e.target.value.replace(/[^\d\s]/g, '');
          setCardNumber(value);
          setCardType(detectCardType(value));
        }}
        className="w-full mb-0 pr-20 border border-gray-300 bg-white px-4 py-2 text-gray-500 placeholder:text-gray-400 text-base"
      />

      {/* SVG-ikoonid paremal */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex gap-2 items-center pointer-events-none">
        

      </div>
    </label>

    {/* Tuvastatud kaarditüüp */}
    {cardType !== 'Unknown' && (
      <p className="my-2 text-xs text-gray-500">Tuvastatud kaart: {cardType}</p>
    )}

    {/* Aegumiskuupäev ja CVC */}
    <div className="flex gap-3">
      <input
        type="text"
        placeholder="KK / AA"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
        className="w-1/2 border border-gray-300 bg-white px-4 py-2 text-gray-500 placeholder:text-gray-400 text-base"
      />
      <input
        type="text"
        placeholder="CVC"
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
        className="w-1/2 border border-gray-300 bg-white px-4 py-2 text-gray-500 placeholder:text-gray-400 text-base"
      />
    </div>

    {/* Kaardiomaniku nimi */}
    <input
      type="text"
      placeholder="Kaardiomaniku täisnimi"
      value={cardName}
      onChange={(e) => setCardName(e.target.value)}
      className="w-full border border-gray-300 bg-white px-4 py-2 text-gray-500 placeholder:text-gray-400 text-base"
    />
  </div>
  </div>
)}


            <label className="px-4 py-3 cursor-pointer block">
              <input
                type="radio"
                name="payment"
                checked={selectedPayment === 'pangalingi'}
                onChange={() => setSelectedPayment('pangalingi')}
                className="mr-3"
              />
              Maksa pangalingi kaudu
             {selectedPayment === 'pangalingi' && (
  <>
    s
    <BankSelector selectedBank={selectedBank} setSelectedBank={setSelectedBank} />
  </>
)}
            </label>
          </div>
        </div>
      </div>

      {/* Right side summary */}
      <div className="md:col-span-1 w-full md:w-[320px] border p-6 space-y-6 self-start">
        <h2 className="text-lg font-semibold">Kokkuvõte</h2>
        <div className="flex justify-between text-sm">
  <span>Toote hind</span>
  <span className="font-semibold">{productPrice.toFixed(2)}€</span>
</div>
<div className="flex justify-between text-sm">
  <span>Teenustasu</span>
  <span className="font-semibold">{serviceFee}€</span>
</div>
<div className="flex justify-between text-sm">
  
  <span>Transport</span>
  <span className="font-semibold">
    {transportPrice === 0 ? 'Tasuta' : `${transportPrice.toFixed(2)}€`}
  </span>
</div>

        <hr />
        <div className="flex justify-between font-semibold">
          <span>Kokku</span>
          <span>{totalPrice}€</span>
        </div>
        <hr />

        <div className="relative mt-4 w-full">
  <input
    type="text"
    placeholder="Kinkekaardi number"
    value={giftCard}
    onChange={(e) => setGiftCard(e.target.value)}
    className="w-full border border-gray-400 rounded-none pl-3 pr-10 py-2 text-sm"
  />
  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-gray-700"
      stroke="#222222"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.586 2.586C12.211 2.2109 11.7024 2.00011 11.172 2H4C3.46957 2 2.96086 2.21071 2.58579 2.58579C2.21071 2.96086 2 3.46957 2 4V11.172C2.00011 11.7024 2.2109 12.211 2.586 12.586L11.29 21.29C11.7445 21.7416 12.3592 21.9951 13 21.9951C13.6408 21.9951 14.2555 21.7416 14.71 21.29L21.29 14.71C21.7416 14.2555 21.9951 13.6408 21.9951 13C21.9951 12.3592 21.7416 11.7445 21.29 11.29L12.586 2.586Z"/>
      <path d="M7.5 8C7.77614 8 8 7.77614 8 7.5C8 7.22386 7.77614 7 7.5 7C7.22386 7 7 7.22386 7 7.5C7 7.77614 7.22386 8 7.5 8Z" fill="#222222"/>
    </svg>
  </div>
</div>


       <label className="flex flex-wrap items-start text-sm mt-8 cursor-pointer">
  <input
    type="checkbox"
    checked={agree}
    onChange={() => setAgree(!agree)}
    className="w-5 h-5 mr-2 border border-gray-800 appearance-none checked:bg-[#F8C6DF] checked:transition-all duration-200 cursor-pointer relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-black after:text-sm after:opacity-0 checked:after:opacity-100"
  />
  <span>
  Nõustun&nbsp;
  <a href="#" className="underline font-semibold sm:inline">
    kasutustingimustega
  </a>
</span>

</label>



        {/* Pay button */}
        <button
  onClick={handleCheckout}
  className={`w-full mt-4 py-2 rounded-full text-white font-semibold ${
    agree && !loading ? 'bg-black hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'
  }`}
  disabled={!agree || loading}
>
  {loading ? 'Ootan...' : 'Maksma'}
</button>

      </div>
    </div>
  );
}
