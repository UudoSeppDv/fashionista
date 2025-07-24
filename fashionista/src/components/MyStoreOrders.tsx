'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Image from 'next/image'
import ConfirmOrderModal from './ConfirmOrderModal';


interface Product {
  id: string;
  brand: string;
  description: string;
  images: string[];
}

interface PublicUser {
  first_name: string;
  surname: string;
  avatar_url: string | null;
}

interface Order {
  id: string;
  status: string;
  price: number;
  delivery_method: string;
  payment_method: string;
  created_at: string;
  phone: string | null; 
  parcel_location: string;
  confirmed_at?: string;
  user_id: string; // ostja ID
  seller_id: string; // müüja ID
  product: Product | null;
  buyer?: PublicUser;  // ostja info, fetched via user_id
  seller?: PublicUser; // müüja info, fetched via seller_id, kui vaja
}



const PAGE_SIZE = 3;

export default function MyStoreOrders() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const user = useUser();
  const userId = user?.id;
  const safeUserId = userId ?? '';
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'unconfirmed'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);



const handleConfirmSend = () => {
  handleSendPackage();
  setModalOpen(false);
};




 function handleConfirmClick(order: Order) {
    setSelectedOrder(order);
    setModalOpen(true);
  }





  

  // Ekraani suuruse jälgimine
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 768);
    }
    handleResize(); // algne kontroll
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

useEffect(() => {
  setVisibleCount(PAGE_SIZE);
}, [filter]);

 useEffect(() => {
  if (!userId) return;

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        phone,
        parcel_location,
        product:products(*),
        buyer:public_users!user_id(first_name, surname, avatar_url)
      `)
      .eq('seller_id', safeUserId)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else if (data) {
      setOrders(data as Order[]);
      setError(null);
      setVisibleCount(PAGE_SIZE);
    }
    setLoading(false);
  }

  fetchOrders();
}, [userId, safeUserId]);




const buyerPhone = selectedOrder?.phone ?? '';
const parcelLocation = selectedOrder?.parcel_location ?? '';




// ...

async function handleSendPackage() {
  if (!selectedOrder) return;

  // 1. Supabase UPDATE
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'confirmed',
      confirmed_at: 'now()'

    })
    .eq('id', selectedOrder.id);

  if (error) {
    console.error('Tellimuse kinnitamisel tekkis viga:', error.message);
    return;
  }

  // 2. Lokaalne state uuendus
  setOrders(prev =>
    prev.map(order =>
      order.id === selectedOrder.id
        ? {
            ...order,
            status: 'confirmed',
            confirmed_at: new Date().toISOString(), // kui sul confirmed_at on UI-s vajalik
          }
        : order
    )
  );

  // 3. Sulge modal ja muud vajalikud asjad
  setModalOpen(false);
}


   useEffect(() => {
    // Kui filter muutub, siis reseti visibleCount tagasi algusesse
    setVisibleCount(PAGE_SIZE);
  }, [filter]);
  if (!userId) {
    return (
      <main className="min-h-screen flex items-center justify-center font-montserrat">
        <p>Palun logi sisse</p>
      </main>
    );
  }

  async function confirmOrder(orderId: string) {
    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      setError(error.message);
    } else {
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, status: 'confirmed', confirmed_at: new Date().toISOString() }
            : order
        )
      );
      setError(null);
    }
    setLoading(false);
  }

  function handleSendMessageClick(order: Order) {
    router.push(`/messages/${order.user_id}`);
  }

  // Filtreeri tellimused vastavalt filterile
  const filteredOrders = orders.filter(order => {
    if (filter === 'confirmed') return order.status === 'confirmed';
    if (filter === 'unconfirmed') return order.status !== 'confirmed';
    return true;
  });

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${date.getFullYear()}`;
  };

const canLoadMore = visibleCount < filteredOrders.length;



return (
  <main className="min-h-screen bg-[#f8f3ef] font-montserrat">
   
    

    <div className="max-w-6xl mx-auto p-6 gap-6 flex flex-col md:flex-row">
      {/* Filtrid väiksematel ekraanidel */}
      {isSmallScreen ? (
        <div className="flex gap-2 mb-4 justify-center w-full">
          {(['all', 'confirmed', 'unconfirmed'] as const).map(value => {
            const label =
              value === 'all'
                ? 'Näita kõiki'
                : value === 'confirmed'
                ? 'Kinnitatud'
                : 'Kinnitamata';
            const active = filter === value;

            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-full border font-m transition-colors ${active ? 'bg-pink-200 text-gray-800 border rounded-full hover:bg-pink-200 transition' : 'border rounded-full font-semibold hover:bg-pink-200 transition'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : (
        // Filtrid külgribal
        <aside className="w-1/4 space-y-4">
          <div className="border p-4">
            <h2 className="text-lg mb-2 font-semibold">FILTRID</h2>
            <div>
              {(['all', 'confirmed', 'unconfirmed'] as const).map(value => {
                const label =
                  value === 'all'
                    ? 'Kõik'
                    : value === 'confirmed'
                    ? 'Kinnitatud'
                    : 'Kinnitamata';
                return (
                  <label key={value} className="mb-2 flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="filter"
                      checked={filter === value}
                      onChange={() => {
                        setFilter(value);
                        setVisibleCount(PAGE_SIZE);
                      }}
                      className="w-5 h-5 mr-2 border border-gray-800 appearance-none 
                        checked:bg-[#F8C6DF] checked:transition-all duration-200 cursor-pointer relative 
                        after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center 
                        after:text-black after:text-sm after:opacity-0 checked:after:opacity-100
                        after:translate-y-[1px]"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          </div>
        </aside>
      )}

     <section className={isSmallScreen ? 'w-full' : 'w-3/4 space-y-6'}>


  {error && <p className="text-red-600">Viga: {error}</p>}
  {loading && <p>Laadin...</p>}

  {filteredOrders.length === 0 ? (
    <p>Ühtegi tellimust ei leitud.</p>
  ) : (
    filteredOrders.slice(0, visibleCount).map(order => {
      const serviceFee = 1; // Või arvutuslik
      const netAmount = order.price - serviceFee;
      const confirmed = order.status === 'confirmed';
      const delivered = order.status === 'delivered';

      const statusDate =
              confirmed && order.confirmed_at ? order.confirmed_at : order.created_at;
            const formattedStatusDate = formatDate(statusDate);
            
      return (
        <div key={order.id} className="border mb-4 p-4 flex flex-col justify-between space-y-4">
            
          

             
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            
            {/* Vasak veerg: info */}
            <div className="flex flex-col justify-between w-full md:mb-4 md:mr-8">
                <h2 className="text-2xl font-semibold mb-10 text-center md:text-left">
                    Tellimus {confirmed ? 'kinnitatud' : 'tellitud'} {formattedStatusDate}
                  </h2>
                    {/* Pilt väikestel ekraanidel keskel */}
                                    {/* Pilt väikestel ekraanidel keskel, proportsioonid paigas */}
                  <div className="relative w-32 aspect-[3/4] self-center mb-4 md:hidden">
                    <Image
                      src={order.product?.images?.[0] || '/bag.jpg'}
                      alt={order.product?.description || 'Toode'}
                      fill
                      className="object-cover border"
                    />
                  </div>
              <div className="grid grid-cols-2 mb-5 gap-y-3">
                <p className="text-m text-gray-700">Hind:</p>
                <p className="text-m text-right font-semibold">{order.price} €</p>

                <p className="text-m text-gray-700">Teenustasu:</p>
                <p className="text-m text-right font-semibold">{serviceFee} €</p>
                </div>
                <div className="grid grid-cols-2 mb-5 pt-5  border-t gap-y-2">

                <p className="text-m font-bold text-gray-700">Kokku:</p>
                <p className="text-m text-right font-semibold">{netAmount} €</p>
              </div>

              <div className="flex gap-4">
                <button
                  disabled
                  className={`px-4 py-1 rounded-full font-small transition-colors
                    ${delivered ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}
                  `}
                >
                  {delivered ? 'Kohaletoimetatud' : 'Kohale toimetamisel'}
                </button>

                <button
                  disabled
                  className={`px-4 py-1 rounded-full font-small transition-colors ${
                    confirmed ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
                  }`}
                >
                  {confirmed ? 'Kinnitatud' : 'Kinnituse ootusel'}
                </button>
              </div>
            </div>

            {/* Parem veerg: pilt + nupp */}
            <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
               {order.status !== 'confirmed' && (
              <button
                onClick={() => handleConfirmClick(order)}
                disabled={loading}
                className="hidden md:block px-9 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-600 transition"
              >
                Kinnita
              </button>
            )}

               {/* Pilt paremal suurematel ekraanidel */}
                               
                <div
  className={`relative w-30 aspect-[3/4] hidden md:block ${
    confirmed ? 'mt-19' : 'mt-7'
  }`}
>
  <Image
    src={order.product?.images?.[0] || '/bag.jpg'}
    alt={order.product?.description || 'Toode'}
    fill
    className="object-cover border"
  />
</div>
<ConfirmOrderModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  orderId={selectedOrder?.id || ''}
 buyerName={`${selectedOrder?.buyer?.first_name ?? ''} ${selectedOrder?.buyer?.surname ?? ''}`.trim()}

  buyerPhone={buyerPhone}
  parcelLocation={parcelLocation}
  onConfirmSend={handleConfirmSend}
/>



            </div>
          </div>

          {/* Väikse ekraani "Kinnita" nupp keskel */}
  {order.status !== 'confirmed' && (
    <div className="md:hidden w-full flex justify-center">
      <button
        onClick={() => confirmOrder(order.id)}
        disabled={loading}
        className="w-full py-2 bg-gray-800 text-white rounded-full hover:bg-gray-600 transition"
      >
        Kinnita
      </button>
    </div>
  )}

         {/* Alumine rida: avatar + nimi + saada sõnum + Kinnita väiksel ekraanil */}
<div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
  
  {/* Avatar ja nimi */}
<div className="flex items-center gap-3">
  {order.buyer?.avatar_url ? (
    <div className="relative w-14 h-14 rounded-full overflow-hidden">
      <Image
        src={order.buyer.avatar_url}
        alt="Profiilipilt"
        fill
        className="object-cover"
      />
    </div>
  ) : (
    <div className="w-14 h-14 rounded-full bg-pink-300 text-white flex items-center justify-center text-xl font-bold">
      {order.buyer?.first_name?.charAt(0)}
      {order.buyer?.surname?.charAt(0)}
    </div>
  )}
  <span className="text-m font-bold">
    {order.buyer?.first_name} {order.buyer?.surname}
  </span>
</div>

<div className="w-full sm:w-auto sm:ml-auto">
  <button
    onClick={() => handleSendMessageClick(order)}
    className="w-full sm:w-auto px-4 py-2 bg-none border text-black font-semibold rounded-full hover:bg-white transition"
  >
    Saada sõnum
  </button>
</div>


</div>

        </div>
      );
    })
  )}

  {canLoadMore && (
    <button
      onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
      className="px-6 py-2 text-gray-800 rounded-full border font-semibold hover:bg-pink-200 transition"
    >
      Lae veel
    </button>
  )}
</section>

    </div>

  
  </main>
);

}
