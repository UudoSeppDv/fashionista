'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../../../lib/supabaseClient';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UserInfo {
  first_name: string;
  surname: string;
  avatar_url: string | null;
}


interface Order {
  id: string;
  status: string;
  delivery_status?: string; 
  price: number;
  delivery_method: string;
  payment_method: string;
  created_at: string;
  confirmed_at?: string;
  seller_id:string;
  seller?: UserInfo;
  product: {
    id: string;
    brand: string;
    description: string;
    images: string[];
  } | null;
}


const PAGE_SIZE = 3;

export default function MyPurchases() {

  const user = useUser();
  const userId = user?.id;
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'unconfirmed'>('all');

  // Lehe suuruse jälgimiseks, et kuvada filtrid erinevalt väiksematel ekraanidel
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Kuva mitu tellimust (pagination)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
const safeUserId = userId ?? '';
  // Jälgi akna laiust
  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lae tellimused
  useEffect(() => {
    if (!userId) return;

    async function fetchOrders() {
      const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    product:product_id(id, brand, description, images),
    seller:public_users!orders_seller_id_fkey(first_name, surname, avatar_url),
    confirmed_at
  `)

  .eq('user_id', safeUserId)
  .order('created_at', { ascending: false });


      if (error) {
        setError(error.message);
      } else if (data) {
        setOrders(data as Order[]);
        setError(null);
        setVisibleCount(PAGE_SIZE); // reset visible count uue andme laadimisel
      }
    }

    fetchOrders();
  }, [userId, safeUserId]);

  // Lisa update funktsioon
async function updateDeliveryStatus(orderId: string, status: string) {
  const { error } = await supabase
    .from('orders')
    .update({ delivery_status: status })
    .eq('id', orderId);

  if (error) {
    alert('Viga kohaletoimetamise staatuse uuendamisel: ' + error.message);
    return;
  }

  // Uuenda kohaliku state'i, et UI muutuks kohe
  setOrders((prevOrders) =>
    prevOrders.map((order) =>
      order.id === orderId ? { ...order, delivery_status: status } : order
    )
  );
}


  function handleSendMessageClick(order: Order) {
    router.push(`/messages/${order.seller_id}`);
  }

  if (!userId) {
    return (
      <main className="min-h-screen flex items-center justify-center font-montserrat">
        <p>Palun logi sisse</p>
      </main>
    );
  }

  // Filtreeri tellimused
  const filteredOrders = orders.filter(order => {
    if (filter === 'confirmed') return order.status === 'confirmed';
    if (filter === 'unconfirmed') return order.status !== 'confirmed';
    return true;
  });

  // Võta näidata ainult visibleCount arv tellimusi
  const visibleOrders = filteredOrders.slice(0, visibleCount);

  // Kuupäeva vormindamine
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${date.getFullYear()}`;
  };

  const serviceFee = 1;

  return (
  <main className="min-h-screen bg-[#f8f3ef] font-montserrat">

    <div className="max-w-6xl mx-auto p-6 gap-6 flex flex-col md:flex-row">
      {/* Filtrid väikestel ekraanidel */}
      {isSmallScreen ? (
        <div className="flex gap-2 mb-4 justify-center">
          {(['all', 'confirmed', 'unconfirmed'] as const).map(value => {
            const label =
              value === 'all'
                ? 'Kõik'
                : value === 'confirmed'
                ? 'Kinnitatud'
                : 'Kinnitamata';

            const active = filter === value;

            return (
              <button
                key={value}
                onClick={() => {
                  setFilter(value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`px-4 py-2 rounded font-semibold transition-colors
                  ${active ? 'bg-pink-200 text-gray-800 border rounded-full hover:bg-pink-200 transition' : 'border rounded-full font-semibold hover:bg-pink-200 transition'}
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : (
        // Filtrid külgribal suurematel ekraanidel
        <aside className="w-1/4 space-y-4">
          <div className="border p-4">
            <h2 className="text-lg mb-2 font-semibold">FILTRID</h2>
            <div>
              {(['all', 'confirmed', 'unconfirmed'] as const).map(value => {
                const label =
                  value === 'all'
                    ? 'Näita kõiki'
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
                        setFilter(value as 'all' | 'confirmed' | 'unconfirmed');
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

      {/* Tellimuste sektsioon */}
      <section className={isSmallScreen ? 'w-full' : 'w-3/4 space-y-6'}>
        

        {error && <p className="text-red-600 mb-4">Viga tellimuste laadimisel: {error}</p>}

        {visibleOrders.length === 0 ? (
          <p>Ühtegi tellimust ei leitud.</p>
        ) : (
          visibleOrders.map(order => {
            const netAmount = order.price + serviceFee;

            const deliveryStatus = order.delivery_status ?? 'pending';
            const confirmed = order.status === 'confirmed';

            const statusDate =
              confirmed && order.confirmed_at ? order.confirmed_at : order.created_at;
            const formattedStatusDate = formatDate(statusDate);

            return (
              <div key={order.id} className="border mb-4 p-4 flex flex-col justify-between space-y-4">
            
           <h2 className="text-2xl font-semibold mb-8 text-center md:text-left">
                    Tellimus {confirmed ? 'kinnitatud' : 'tellitud'} {formattedStatusDate}
                  </h2>

                  {/* Pilt väikestel ekraanidel keskel */}
                  
<div className="relative w-32 aspect-[3/4] self-center mb-4 md:hidden">
  <Image
    src={order.product?.images?.[0] || '/bag.jpg'}
    alt={order.product?.description || 'Toode'}
    fill
    priority
    sizes="(max-width: 768px) 128px"
    className="object-cover border"
  />
</div>



          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            
            {/* Vasak veerg: info */}
            <div className="flex flex-col justify-between w-full md:mb-4 md:mr-8">
               
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
                     {order.status === 'confirmed' && (
  <button
    disabled
    className={`px-4 py-1 rounded-full font-small transition-colors ${
      deliveryStatus === 'delivered'
        ? 'bg-green-200 text-green-800'
        : 'bg-yellow-200 text-yellow-800'
    }`}
  >
    {deliveryStatus === 'delivered'
      ? 'Kohaletoimetatud'
      : 'Kohaletoimetamisel'}
  </button>
)}



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
                

                {/* Pilt paremal suurematel ekraanidel, proportsioonid paigas */}
<div className="relative w-40 aspect-[3/4] hidden md:block">
  <Image
    src={order.product?.images?.[0] || '/bag.jpg'}
    alt={order.product?.description || 'Toode'}
    fill
    priority
    sizes="(min-width: 768px) 160px"
    className="object-cover border"
  />
</div>

                </div>
                         {/* Alumine rida: avatar + nimi + saada sõnum + Kinnita väiksel ekraanil */}
<div className="w-full flex flex-col sm:flex-row justify-between items-center pt-4 border-t pt-5">
                
                  {/* Avatar ja nimi */}
                  <div className="flex items-center gap-3">
                    {order.seller?.avatar_url ? (
  <div className="relative w-14 h-14 rounded-full overflow-hidden">
  <Image
    src={order.seller.avatar_url}
    alt="Profiilipilt"
    fill
    sizes="56px"
    className="object-cover"
  />
</div>

) : (
  <div className="w-14 h-14 rounded-full bg-pink-300 text-white flex items-center justify-center text-xl font-bold">
    {order.seller?.first_name?.charAt(0)}
    {order.seller?.surname?.charAt(0)}
  </div>
)}

<span className="text-m font-bold">
  {order.seller?.first_name} {order.seller?.surname}
</span>

                  </div>
                
                  
                
                  <div className="w-full mt-5 sm:mt-0 flex flex-col sm:flex-row sm:items-center sm:ml-auto sm:w-auto">
  {/* Märgi kohaletoimetatuks */}
  {order.delivery_status !== 'delivered' && order.status === 'confirmed' && (
  <button
    onClick={() => updateDeliveryStatus(order.id, 'delivered')}
    className="w-full sm:w-auto px-4 py-2 mb-2 sm:mb-0 sm:mr-2 bg-green-200 text-green-800 rounded-full hover:bg-green-300 transition"
  >
    Märgi kohaletoimetatuks
  </button>
)}


  {/* Saada sõnum */}
  <button
    onClick={() => handleSendMessageClick(order)}
    className="w-full sm:w-auto px-4 py-2 bg-none border text-black rounded-full hover:bg-white transition"
  >
    Saada sõnum
  </button>
</div>

                
                </div>
              </div>
              
            );
          })
        )}

        {visibleCount < filteredOrders.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
              className="px-6 py-2 text-gray-800 rounded-full border font-semibold hover:bg-pink-200 transition"
            >
              Lae veel
            </button>
          </div>
        )}
      </section>
    </div>
  </main>
);



}
